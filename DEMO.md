ORCA Demo Script

Goal: Show judges a concise 5–7 step live demo of the ORCA system (backend, frontend, real-time incidents, AI features).

Prerequisites
- Docker and Docker Compose installed on your laptop.
- Copy `.env.demo` -> `.env` and fill any real keys if you want external LLM access. For local demo placeholders are fine.
- Ports 3000 and 8000 available.

Demo steps (5–7 actions)

1) Intro (30s)
- One-liner: "ORCA ingests logs, detects incidents in real time, and uses NLP to explain and assist operators."

2) Start the stack (1–2 min)
- Command:

```bash
docker-compose up --build -d
```

- Talking points: show `docker-compose.yml` briefly, mention `backend`, `frontend`, `redis`, `neo4j` services.

3) Show system health (15s)
- Open backend health: `http://localhost:8000/` (should return JSON status).
- Open frontend: `http://localhost:3000/` (show dashboard).

4) Seed real-world incidents (45s)
- Run the included seed script (bash) which posts realistic logs (disk full, high CPU, DB connection lost) to the ingestion endpoint.

```bash
# Linux / macOS
bash scripts/seed_incidents.sh

# PowerShell (Windows)
powershell -File scripts/seed_incidents.ps1
```

- Expected: new incidents appear in the UI instantly (WebSocket push). Point out service, severity, timestamp, and affected pods.

5) Demonstrate AI features (45s)
- Explain an incident via API:

```bash
curl -sS -X POST http://localhost:8000/incident/explain -H "Content-Type: application/json" \
  -d '{"id":"INC-DEMO","service":"db-master-0","message":"Database connection lost"}' | jq
```

- Chat with the system:

```bash
curl -sS -X POST http://localhost:8000/api/chat -H "Content-Type: application/json" \
  -d '{"query":"What caused the spike in errors?"}' | jq
```

- Talking points: explain how NLP chain helps operators triage faster and provide suggested remediation.

6) Reproduce & explore logs (optional, 30s)
- Show `docker-compose logs -f backend` to explain parsing and incident creation. Show frontend filters (severity, status).

7) Cleanup and next steps (15s)
- Stop stack: `docker-compose down`.
- Optional: describe k8s deployment and how to move to production (build image, push to registry, update `k8s/backend.yaml`).

Notes & troubleshooting
- If Neo4j fails on first start, check `.env` and `NEO4J_AUTH` (demo uses placeholder `neo4j/password123`).
- If frontend shows build errors, ensure Node version in `frontend/Dockerfile` is `node:20-alpine`.

Files added for the demo
- `.env.demo` — demo-safe placeholders
- `scripts/seed_incidents.sh` — bash seeder
- `scripts/seed_incidents.ps1` — PowerShell seeder

Timing: aim for a 4–6 minute live run; reserve 2–3 minutes for Q&A and showing internals.
