from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from services.nlp.chain import explain_incident_safe, ask_ai_chat
from typing import List, Dict, Optional
from datetime import datetime, timedelta
from pydantic import BaseModel
import json
import asyncio
import uuid
import random

app = FastAPI()

async def simulate_incidents():
    """Background task to simulate real-time incidents when Redis is not available"""
    apps = ["api-server", "redis-cache", "payment-gateway", "auth-service", "database-primary"]
    messages = [
        "High CPU utilization detected (>90%)",
        "Memory leak suspected - heap size growing",
        "Connection timeout to upstream service",
        "Elevated 5xx error rate",
        "Disk space critical (<5% remaining)",
        "Too many open files",
        "Slow query detected (>5000ms)"
    ]
    while True:
        await asyncio.sleep(random.randint(10, 20))
        severity = random.choice(["warning", "critical"])
        app_name = random.choice(apps)
        new_incident = {
            "id": f"INC-{str(uuid.uuid4())[:8].upper()}",
            "severity": severity,
            "service": app_name,
            "message": random.choice(messages),
            "timestamp": datetime.now().isoformat(),
            "status": "open",
            "affectedPods": [f"{app_name}-1", f"{app_name}-2"],
            "confidence": round(random.uniform(0.7, 0.99), 2)
        }
        incidents_db.insert(0, new_incident)
        await broadcast_incident(new_incident)

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(simulate_incidents())


# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory incident storage (Starts empty, populated by real MicroK8s data)
incidents_db: List[Dict] = []
connected_clients: List[WebSocket] = []

class ChatRequest(BaseModel):
    query: str

@app.get("/")
def root():
    return {"status": "ok", "service": "ORCA Backend"}

@app.get("/api/incidents")
def get_incidents(severity: Optional[str] = None, status: Optional[str] = None):
    """Fetch incidents with optional filtering"""
    filtered = incidents_db
    
    if severity:
        filtered = [i for i in filtered if i["severity"] == severity]
    if status:
        filtered = [i for i in filtered if i["status"] == status]
    
    return {
        "incidents": sorted(filtered, key=lambda x: x["timestamp"], reverse=True),
        "total": len(filtered)
    }

@app.get("/api/incidents/{incident_id}")
def get_incident(incident_id: str):
    """Fetch a specific incident"""
    incident = next((i for i in incidents_db if i["id"] == incident_id), None)
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    return incident

@app.post("/api/incidents")
async def create_incident(incident: Dict):
    """Create a new incident manually"""
    new_incident = {
        "id": f"INC-{len(incidents_db) + 1:03d}",
        "timestamp": datetime.now().isoformat(),
        "status": incident.get("status", "open"),
        **incident
    }
    incidents_db.append(new_incident)
    
    # Broadcast to WebSocket clients
    asyncio.create_task(broadcast_incident(new_incident))
    
    return new_incident

@app.put("/api/incidents/{incident_id}")
async def update_incident(incident_id: str, updates: Dict):
    """Update incident status"""
    incident = next((i for i in incidents_db if i["id"] == incident_id), None)
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    incident.update(updates)
    asyncio.create_task(broadcast_incident(incident))
    
    return incident

@app.post("/incident/explain")
def explain(incident: dict):
    """Explain an incident using NLP chain"""
    return explain_incident_safe(incident)

@app.post("/api/chat")
def chat(req: ChatRequest):
    """Ask AI chat endpoint"""
    response = ask_ai_chat(req.query, incidents_db)
    return response

@app.post("/ingest/logs")
async def ingest_logs(request: Request):
    """Ingest logs from Fluent-Bit or external sources and dynamically create incidents"""
    payload = await request.json()
    
    # Simple logic: If we receive an array of logs, process each
    logs = payload if isinstance(payload, list) else [payload]
    
    for log in logs:
        # Some log formats put the log message in 'log' or 'message'
        message = log.get("log", log.get("message", "Unknown log event"))
        level = str(log.get("level", "INFO")).upper()
        
        # We simulate creating incidents for real ERROR/CRITICAL logs
        if level in ["ERROR", "CRITICAL", "WARNING"]:
            severity = "critical" if level == "CRITICAL" else "warning"
            ns = log.get("kubernetes", {}).get("namespace_name", "default")
            pod = log.get("kubernetes", {}).get("pod_name", "unknown")
            
            new_incident = {
                "id": f"INC-{str(uuid.uuid4())[:8].upper()}",
                "severity": severity,
                "service": pod,
                "message": message,
                "timestamp": datetime.now().isoformat(),
                "status": "open",
                "affectedPods": [pod],
                "confidence": 0.85
            }
            incidents_db.append(new_incident)
            asyncio.create_task(broadcast_incident(new_incident))
            
    return {"status": "ok"}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time incident updates"""
    await websocket.accept()
    connected_clients.append(websocket)
    
    try:
        # Send initial incidents
        await websocket.send_json({
            "type": "initial",
            "data": incidents_db
        })
        
        # Keep connection alive
        while True:
            data = await websocket.receive_text()
            # Echo or process incoming messages
            await websocket.send_json({
                "type": "ack",
                "message": "Message received"
            })
    except WebSocketDisconnect:
        connected_clients.remove(websocket)
    except Exception as e:
        print(f"WebSocket error: {e}")
        if websocket in connected_clients:
            connected_clients.remove(websocket)

async def broadcast_incident(incident: Dict):
    """Broadcast incident updates to all connected clients"""
    message = {
        "type": "incident_update",
        "data": incident
    }
    for client in connected_clients[:]:  # Copy list to avoid modification during iteration
        try:
            await client.send_json(message)
        except Exception as e:
            print(f"Failed to send to client: {e}")
            if client in connected_clients:
                connected_clients.remove(client)