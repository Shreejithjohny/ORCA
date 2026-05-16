from fastapi import FastAPI, Request, HTTPException
# from services.nlp.chain import explain_incident_safe
from pydantic import BaseModel
import os
import asyncio
import json

def explain_incident_safe(incident):
    return {"explanation": "Dummy response", "confidence": 0.5, "source": "dummy"}

app = FastAPI(title="ORCA Backend (Member B - scaffold)")

REDIS_URL = os.getenv("REDIS_URL", "redis://orca-redis:6379/0")


class LogPayload(BaseModel):
    _timestamp: str = None


@app.post("/ingest/logs")
async def ingest_logs(request: Request):
    payload = await request.json()
    # write to Redis stream logs:{ns}:{pod}
    ns = payload.get("kubernetes", {}).get("namespace_name", "default")
    pod = payload.get("kubernetes", {}).get("pod_name", "unknown")
    stream_key = f"logs:{ns}:{pod}"

    try:
        import redis.asyncio as redis_async

        r = redis_async.from_url(REDIS_URL, decode_responses=True)
        # store raw JSON under 'event'
        await r.xadd(stream_key, {"event": json.dumps(payload)}, maxlen=1000, approximate=True)
        return {"status": "ok", "stream": stream_key}
    except Exception as e:
        # never return 500 for ingest; return structured error
        raise HTTPException(status_code=502, detail=str(e))


@app.get("/health/llm")
async def health_llm():
    # stub: Integration Lead will wire actual Ollama health
    return {"status": "ok", "model": "mistral", "available": False}


@app.post("/incident/explain")
async def explain(incident: dict):
    explanation = explain_incident_safe(incident)
    return explanation


@app.post("/nlp/explain")
async def nlp_explain(body: dict):
    incident_id = body.get("incident_id")
    if not incident_id:
        raise HTTPException(status_code=400, detail="missing incident_id")

    # Extract incident data
    incident = {
        "summary": body.get("summary", "Unknown"),
        "severity": body.get("severity", "warning"),
        "confidence": body.get("confidence", 0.5),
        "timestamp": body.get("timestamp"),
        "meta": body.get("meta", {})
    }

    # Call NLP chain with fallback
    explanation = explain_incident_safe(incident)
    
    return {
        "incident_id": incident_id,
        "summary": explanation.get("summary"),
        "cause": explanation.get("cause"),
        "recs": explanation.get("recs", []),
        "confidence": explanation.get("confidence", 0.5)
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
print("Backend loaded")