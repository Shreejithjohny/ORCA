import json
import os
from typing import Any

from openai import OpenAI
from langchain_core.prompts import PromptTemplate

from .prompts import SYSTEM_PROMPT, USER_PROMPT

MODEL_NAME = os.getenv("OPENROUTER_MODEL", "gpt-4o-mini")
API_KEY = os.getenv("OPENROUTER_API_KEY") or os.getenv("OPENAI_API_KEY")
BASE_URL = os.getenv("OPENROUTER_BASE_URL", os.getenv("OPENAI_API_BASE", "https://openrouter.ai/api/v1"))
client = None
if API_KEY:
    client = OpenAI(
        api_key=API_KEY,
        base_url=BASE_URL,
        timeout=10.0,
    )

prompt = PromptTemplate(
    template=SYSTEM_PROMPT + USER_PROMPT,
    input_variables=["incident"]
)

def _strip_code_fences(content: str) -> str:
    text = content.strip()
    if text.startswith("```"):
        text = text.split("\n", 1)[1] if "\n" in text else text
        if text.endswith("```"):
            text = text[:-3]
    return text.strip()


def _normalize_response(data: Any, incident: dict, source: str) -> dict:
    if isinstance(data, str):
        data = {"explanation": data}

    explanation = data.get("explanation") or data.get("summary") or "Insufficient evidence"
    summary = data.get("summary") or incident.get("summary") or "Incident summary unavailable"
    cause = data.get("cause") or "Insufficient evidence"
    recs = data.get("recs") or data.get("recommendations") or []
    if not isinstance(recs, list):
        recs = [str(recs)]

    try:
        confidence = float(data.get("confidence", incident.get("confidence", 0.5)))
    except (TypeError, ValueError):
        confidence = float(incident.get("confidence", 0.5))

    return {
        "summary": summary,
        "explanation": explanation,
        "cause": cause,
        "recs": recs,
        "confidence": confidence,
        "source": source,
        "model": MODEL_NAME,
    }


def _parse_response_content(content: str, incident: dict, source: str) -> dict:
    text = _strip_code_fences(content)
    try:
        parsed = json.loads(text)
    except json.JSONDecodeError:
        parsed = {"explanation": text}
    return _normalize_response(parsed, incident, source)


def explain_incident(incident):
    if client is None:
        raise RuntimeError("OpenRouter credentials are not configured")

    formatted = prompt.format(incident=incident)
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": formatted},
    ]
    response = client.chat.completions.create(
        model=MODEL_NAME,
        messages=messages,
        temperature=0.2,
    )
    content = response.choices[0].message.content or ""
    return _parse_response_content(content, incident, "llm")


def fallback_response(incident):
    return {
        "summary": incident.get("summary", "Incident summary unavailable"),
        "explanation": "High CPU anomaly detected. Possible overload.",
        "cause": "Insufficient evidence",
        "recs": ["Inspect the affected workload", "Check recent deployment changes"],
        "confidence": incident.get("confidence", 0.5),
        "source": "fallback",
        "model": MODEL_NAME,
    }


def explain_incident_safe(incident):
    """
    Call LLM with error handling and fallback logic.
    Returns structured response matching incident schema.
    """
    try:
        return explain_incident(incident)
    except Exception as e:
        # Fallback when model is unavailable
        return fallback_response(incident)

def ask_ai_chat(query: str, context: list):
    """
    Answer free-text queries using the Ollama LLM.
    """
    try:
        if client is None:
            # Local demo fallback: return a context-aware response even without an API key.
            incidents = context[:5]
            if incidents:
                top = incidents[0]
                answer = (
                    f"I can't reach the external model, but the most relevant incident is {top.get('id', 'unknown')} "
                    f"on {top.get('service', 'an unknown service')} with severity {top.get('severity', 'unknown')}. "
                    f"Suggested next step: inspect recent logs and mark it resolved once confirmed."
                )
                related = [i['id'] for i in incidents if i.get('id')]
            else:
                answer = (
                    "I can't reach the external model, but there are no active incidents right now. "
                    "If you see an issue, ingest a log or create an incident to start triage."
                )
                related = []
            return {
                "answer": answer,
                "confidence": 0.5,
                "relatedIncidents": related,
            }

        chat_prompt = PromptTemplate(
            template="You are an AI observability assistant. Answer the user's query.\n\nContext (Active Incidents):\n{context}\n\nUser Query: {query}\n\nAnswer concisely:",
            input_variables=["context", "query"]
        )

        # Format context for the prompt
        context_str = "\n".join([f"- {i['id']} ({i.get('severity','unknown')}): {i.get('message','')}" for i in context])
        if not context_str:
            context_str = "No active incidents."

        formatted = chat_prompt.format(context=context_str, query=query)
        response = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[
                {"role": "system", "content": "You are an AI observability assistant."},
                {"role": "user", "content": formatted},
            ],
            temperature=0.2,
        )
        result = response.choices[0].message.content or ""

        # Try to find related incidents by looking for IDs in the answer
        related = [i['id'] for i in context if i['id'] in result]

        return {
            "answer": result,
            "confidence": 0.85,
            "relatedIncidents": related
        }
    except Exception as e:
        return {
            "answer": f"I'm sorry, I couldn't reach the model. Error: {str(e)}",
            "confidence": 0.0,
            "relatedIncidents": []
        }

if __name__ == "__main__":
    test_incident = {
        "severity": "critical",
        "summary": "CPU spike",
        "confidence": 0.9
    }
    print(explain_incident_safe(test_incident))
