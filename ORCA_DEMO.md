# ORCA Platform Demo & Testing Guide

Once all services are running, use this guide to demonstrate the full platform.

---

## Part 1: Backend API Demo

### Test Health Endpoints

```bash
# Test backend health
curl http://localhost:8000/health/llm

# Expected response:
# {"status":"ok","model":"mistral","available":false}
```

### Test Log Ingestion

```bash
# Send test logs to the backend
curl -X POST http://localhost:8000/ingest/logs \
  -H "Content-Type: application/json" \
  -d '{
    "kubernetes": {
      "namespace_name": "default",
      "pod_name": "test-pod"
    },
    "message": "Test log entry",
    "level": "INFO",
    "timestamp": "2024-01-01T00:00:00Z"
  }'

# Expected response:
# {"status":"ok","stream":"logs:default:test-pod"}
```

### Test Incident Explanation

```bash
# Send an incident for analysis
curl -X POST http://localhost:8000/incident/explain \
  -H "Content-Type: application/json" \
  -d '{
    "severity": "critical",
    "service": "redis",
    "message": "Memory usage at 94%",
    "timestamp": "2024-01-01T00:00:00Z",
    "confidence": 0.94
  }'

# Expected response:
# {"explanation": "...", "confidence": 0.5, "source": "dummy"}
```

### Test NLP Endpoint

```bash
# Get NLP analysis of an incident
curl -X POST http://localhost:8000/nlp/explain \
  -H "Content-Type: application/json" \
  -d '{
    "incident_id": "INC-001",
    "summary": "Critical memory spike in Redis",
    "severity": "critical",
    "confidence": 0.94,
    "timestamp": "2024-01-01T00:00:00Z"
  }'

# Expected response with incident analysis
```

---

## Part 2: Redis Demo

### Connect to Redis and View Streams

```bash
# Connect to Redis
redis-cli -p 6379

# Inside redis-cli, check available streams:
KEYS *

# Read logs stream (if you sent logs in Part 1)
XREAD COUNT 5 STREAMS logs:default:test-pod 0

# View netflows from eBPF
XREAD COUNT 5 STREAMS netflows:default:unknown 0

# Check if data is being produced
DBSIZE
INFO keyspace
```

### Test Redis Connection Health

```bash
# From Windows PowerShell
$null = (Invoke-WebRequest http://localhost:8000 -ErrorAction SilentlyContinue)
Write-Host "Backend connected to Redis successfully"

# Or direct test
redis-cli -p 6379 PING
# Should return: PONG
```

---

## Part 3: Neo4j Demo

### Access Neo4j Browser

1. Open **Neo4j Browser**: Open browser and go to `bolt://localhost:7687`
2. Login with:
   - Username: `neo4j`
   - Password: `OrcaSecure123`

### Query the Graph Database

In Neo4j Browser, run these Cypher queries:

```cypher
# Check if graph is initialized
MATCH (n) RETURN count(n) AS total_nodes;

# Find all services
MATCH (n:Service) RETURN n;

# Find all communication paths
MATCH (a:Service)-[r:CALLS]->(b:Service) RETURN a, r, b;

# Find critical dependencies
MATCH (a:Service)-[r:CALLS]->(b:Service) 
WHERE a.criticality > 0.8 
RETURN a, b;

# Count CALLS edges
MATCH ()-[r:CALLS]->() RETURN count(r) AS calls_edges;

# View all relationships
MATCH (a)-[r]->(b) RETURN type(r), count(*) AS count GROUP BY type(r);
```

### Create Test Data (if needed)

```cypher
# Create services
CREATE (redis:Service {name: "redis", service_id: "svc-redis"})
CREATE (postgres:Service {name: "postgres", service_id: "svc-postgres"})
CREATE (api:Service {name: "api", service_id: "svc-api"})

# Create CALLS relationships
MATCH (redis:Service {name: "redis"}), (api:Service {name: "api"})
CREATE (api)-[:CALLS {latency_ms: 5}]->(redis)

MATCH (postgres:Service {name: "postgres"}), (api:Service {name: "api"})
CREATE (api)-[:CALLS {latency_ms: 25}]->(postgres)
```

---

## Part 4: Prometheus Demo

### Access Prometheus UI

1. Open browser: http://localhost:9090
2. Go to "Status" → "Targets" to see all monitoring targets

### View Metrics

In Prometheus, search for these metrics:

```
# Node metrics
node_cpu_seconds_total
node_memory_MemAvailable_bytes
node_filesystem_avail_bytes

# Kubernetes metrics
kube_pod_info
kube_pod_status_phase
kube_pod_container_resource_requests

# Custom ORCA metrics (if available)
orca_incident_count
orca_severity_distribution
```

### Create Test Graph

1. Graph tab → Select metric → Run
2. Try graphing `node_memory_MemAvailable_bytes` to see memory trends

---

## Part 5: End-to-End Workflow Demo

### Complete Flow: Incident Detection → Analysis → Visualization

#### Step 1: Simulate an Incident

```bash
# Send multiple log entries simulating a service degradation
for i in {1..10}; do
  curl -X POST http://localhost:8000/ingest/logs \
    -H "Content-Type: application/json" \
    -d "{
      \"kubernetes\": {
        \"namespace_name\": \"production\",
        \"pod_name\": \"api-server-$i\"
      },
      \"message\": \"High latency detected: response_time=2500ms\",
      \"level\": \"WARNING\",
      \"timestamp\": \"2024-01-01T00:00:$i Z\"
    }"
done

echo "10 log entries sent!"
```

#### Step 2: Check Logs in Redis

```bash
# Connect to Redis and verify logs were ingested
redis-cli -p 6379

# Inside redis-cli:
KEYS logs:*
XREAD COUNT 10 STREAMS logs:production:api-server-1 0
```

#### Step 3: Analyze Incident

```bash
# Get analysis via backend
curl -X POST http://localhost:8000/nlp/explain \
  -H "Content-Type: application/json" \
  -d '{
    "incident_id": "INC-DEMO-001",
    "summary": "Multiple API servers showing high latency (2.5s response time)",
    "severity": "warning",
    "confidence": 0.87,
    "affected_pods": ["api-server-1", "api-server-2", "api-server-3"],
    "timestamp": "2024-01-01T00:00:00Z"
  }'
```

#### Step 4: Check Metrics in Prometheus

```
# Go to http://localhost:9090
# Query: node_cpu_seconds_total
# Observe trends during the simulated incident
```

---

## Part 6: Frontend Demo (if deployed)

### Access Dashboard

Open: http://localhost:3000

### Expected Views:

1. **Incidents Tab**
   - Shows list of detected incidents
   - Severity indicators
   - Confidence scores
   - Affected services

2. **Dashboard Tab**
   - Real-time metrics
   - Alert status
   - System health overview

3. **Graph Tab**
   - Service dependency visualization
   - Relationship explorer
   - Call graph visualization

4. **Metrics Tab**
   - CPU/Memory charts
   - Network I/O graphs
   - Custom metrics

### Test Frontend Features:

```javascript
// Open browser console (F12) and test WebSocket connection
console.log('WebSocket connection status: ' + (document.readyState === 'complete' ? 'OK' : 'Connecting'));
```

---

## Part 7: Fluent-Bit Log Pipeline Demo

### Verify Logs are Being Collected

```bash
# Check Fluent-bit pod logs
kubectl -n orca logs -l app=fluent-bit --tail=50

# Should show entries being forwarded to /ingest/logs endpoint

# Check backend logs for incoming data
kubectl -n orca logs -l app=orca-backend --tail=50 | grep "/ingest/logs"
```

### Send Structured Logs

```bash
# Send application logs in various formats
curl -X POST http://localhost:8000/ingest/logs \
  -H "Content-Type: application/json" \
  -d '[{
    "time": "2024-01-01T00:00:00Z",
    "record": {
      "kubernetes": {
        "namespace_name": "default",
        "pod_name": "app-pod",
        "container_name": "app"
      },
      "log": "Application error: connection timeout",
      "level": "ERROR"
    }
  }]'
```

---

## Part 8: eBPF Network Tracing Demo

### View eBPF Pod Status

```bash
# Check if eBPF pod is running
kubectl -n orca get pods -l app=ebpf-tcp-connect

# Check eBPF logs
kubectl -n orca logs -l app=ebpf-tcp-connect --tail=30
```

### View Network Flows

```bash
# Connect to Redis and check netflow data
redis-cli -p 6379

# Inside redis-cli:
XREAD COUNT 10 STREAMS netflows:default:unknown 0

# This should show TCP connections traced by eBPF
```

### Generate Network Traffic

```bash
# Trigger some network connections for eBPF to trace
for i in {1..5}; do
  curl http://localhost:8000/health/llm
  sleep 1
done

# Then check netflows again in Redis
redis-cli -p 6379 XREAD COUNT 20 STREAMS netflows:default:unknown 0
```

---

## Part 9: Performance & Resource Monitoring

### Check Resource Usage

```bash
# View pod resource consumption
kubectl top pods -n orca

# View node resource consumption
kubectl top nodes

# Check limits
kubectl -n orca describe pod <pod-name> | grep -A 10 "Limits"
```

### Monitor in Real-Time

```bash
# Watch pods continuously
kubectl -n orca get pods -w

# Watch resource usage
watch kubectl top pods -n orca

# Stream logs
kubectl -n orca logs -f deployment/orca-backend
```

---

## Part 10: Complete System Health Check

Run this comprehensive check:

```bash
#!/bin/bash

echo "=== ORCA System Health Check ==="
echo ""

echo "1. Kubernetes Cluster"
kubectl -n orca get nodes
echo ""

echo "2. Namespace Resources"
kubectl -n orca get all
echo ""

echo "3. Pod Status Details"
kubectl -n orca get pods -o wide
echo ""

echo "4. Service Endpoints"
kubectl -n orca get endpoints
echo ""

echo "5. ConfigMaps and Secrets"
kubectl -n orca get configmaps
kubectl -n orca get secrets --no-headers
echo ""

echo "6. Persistent Volumes"
kubectl -n orca get pvc
echo ""

echo "7. Resource Usage"
kubectl top pods -n orca
echo ""

echo "8. Recent Events"
kubectl -n orca get events --sort-by='.lastTimestamp' | tail -20
echo ""

echo "=== Health Check Complete ==="
```

---

## Demo Checklist

- [ ] Backend health check passes
- [ ] Log ingestion working (data in Redis)
- [ ] Neo4j browser accessible with login
- [ ] Can query graph data
- [ ] Prometheus showing metrics
- [ ] Fluent-bit collecting logs
- [ ] eBPF tracing network connections
- [ ] Frontend dashboard loading (if deployed)
- [ ] All pods in Running state
- [ ] No pods in CrashLoopBackOff or Pending

---

## Sharing the Demo

When presenting to others:

1. **Show the Architecture Diagram** (see ORCA README)
2. **Test Backend API** (Part 1) - Show real-time data ingestion
3. **Show Dashboard** (Part 6) - Visual representation
4. **Query Neo4j** (Part 3) - Show service relationships
5. **Demo Incident Flow** (Part 5) - End-to-end workflow
6. **Show Metrics** (Part 4) - Prometheus monitoring

---

## Troubleshooting Demo Issues

### Backend not responding
```bash
kubectl -n orca logs orca-backend-<pod-id>
```

### Logs not appearing in Redis
```bash
kubectl -n orca logs -l app=fluent-bit
kubectl -n orca describe pod orca-backend-<pod-id>
```

### Neo4j not accessible
```bash
kubectl -n orca port-forward svc/orca-neo4j 7687:7687
kubectl -n orca logs -l app=orca-neo4j --tail=20
```

### Metrics not showing
```bash
kubectl -n orca logs -l app=prometheus-server
```

---

## Success Criteria

Your ORCA demo is successful when:

✅ You can send logs via API  
✅ Logs appear in Redis streams  
✅ Neo4j graph is queryable  
✅ Prometheus collects metrics  
✅ Dashboard shows incidents  
✅ All services respond to requests  
✅ Network traffic is being traced  

Congratulations! You have a fully functional ORCA observability platform! 🎉
