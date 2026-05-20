#!/usr/bin/env bash
# Seed realistic incidents into ORCA ingestion endpoint (bash)
set -euo pipefail
BASE_URL=${BASE_URL:-http://localhost:8000}

echo "Seeding incidents to ${BASE_URL}"

curl -sS -X POST ${BASE_URL}/ingest/logs -H "Content-Type: application/json" -d '{"log":"Disk space critical on node-03","level":"ERROR","kubernetes":{"namespace_name":"production","pod_name":"node-03"}}'
sleep 1
curl -sS -X POST ${BASE_URL}/ingest/logs -H "Content-Type: application/json" -d '{"log":"Database connection lost","level":"CRITICAL","kubernetes":{"namespace_name":"production","pod_name":"db-master-0"}}'
sleep 1
curl -sS -X POST ${BASE_URL}/ingest/logs -H "Content-Type: application/json" -d '{"log":"High CPU usage detected (95%)","level":"WARNING","kubernetes":{"namespace_name":"payments","pod_name":"payment-gateway-1"}}'
sleep 1
curl -sS -X POST ${BASE_URL}/ingest/logs -H "Content-Type: application/json" -d '{"log":"Elevated 5xx rate from upstream","level":"ERROR","kubernetes":{"namespace_name":"api","pod_name":"api-server-2"}}'

echo "Seed complete. Check http://localhost:3000/ to see incidents in the UI or GET http://localhost:8000/api/incidents"
