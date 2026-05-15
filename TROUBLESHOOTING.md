# ORCA MicroK8s - Troubleshooting Guide

## Common Issues & Solutions

### Issue 1: WSL2 Not Working / Not Installed

**Symptoms:** `bash: command not found`, or `wsl` command doesn't work

**Solutions:**

1. **Check if WSL2 is installed:**
```powershell
wsl --list --verbose
```

2. **If not installed, enable features (Admin PowerShell):**
```powershell
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart
wsl --set-default-version 2
```

3. **Install Ubuntu:**
```powershell
wsl --install -d Ubuntu-22.04
```

4. **Restart computer and try again**

---

### Issue 2: MicroK8s Installation Hangs or Fails

**Symptoms:** `snap install microk8s` hangs or fails with permission errors

**Solutions:**

1. **Check snapd is running:**
```bash
sudo systemctl status snapd
sudo systemctl start snapd
```

2. **Try with a different channel:**
```bash
# Instead of stable, try edge
sudo snap install microk8s --classic --channel=1.27/edge
```

3. **Update snap:**
```bash
sudo snap refresh
```

4. **Check disk space:**
```bash
df -h
# MicroK8s needs ~5GB free
```

5. **If still failing, uninstall and reinstall:**
```bash
sudo snap remove microk8s
sudo snap install microk8s --classic --channel=1.28/stable
```

---

### Issue 3: `kubectl` Command Not Found

**Symptoms:** `command not found: kubectl`

**Solutions:**

1. **Use MicroK8s kubectl:**
```bash
microk8s kubectl get pods -A
```

2. **Create an alias (make it permanent):**
```bash
echo "alias kubectl='microk8s kubectl'" >> ~/.bashrc
source ~/.bashrc
```

3. **Or use in direct commands:**
```bash
microk8s kubectl apply -f k8s/namespace.yaml
```

---

### Issue 4: Neo4j Pod Not Starting

**Symptoms:** `kubectl -n orca get pods` shows `neo4j` in Pending or CrashLoopBackOff state

**Solutions:**

1. **Check pod status:**
```bash
kubectl -n orca describe pod orca-neo4j-0
```

2. **Check logs:**
```bash
kubectl -n orca logs orca-neo4j-0 --tail=100
```

3. **Common cause: Secret not created**
```bash
# Verify secret exists
kubectl -n orca get secret neo4j-auth

# If not, create it
kubectl -n orca create secret generic neo4j-auth --from-literal=auth='neo4j/OrcaSecure123'
```

4. **Check storage/PVC:**
```bash
kubectl -n orca get pvc
# If PVC is Pending, MicroK8s storage addon may not be enabled
microk8s enable storage
```

5. **Wait for Neo4j to initialize (can take 2-3 minutes):**
```bash
kubectl -n orca wait --for=condition=ready pod -l app=orca-neo4j --timeout=300s
```

6. **Force restart if hung:**
```bash
kubectl -n orca delete pod orca-neo4j-0
```

---

### Issue 5: Redis Pod Stuck in Pending

**Symptoms:** `redis` pod shows as Pending and never starts

**Solutions:**

1. **Check PVC status:**
```bash
kubectl -n orca get pvc
kubectl -n orca describe pvc orca-redis-data
```

2. **If PVC is Pending, enable storage:**
```bash
microk8s enable storage
# Wait a moment
kubectl -n orca get pvc  # Should show Bound now
```

3. **Check available storage:**
```bash
kubectl describe node
# Look for Allocatable memory and disk
```

4. **If storage quota exceeded:**
```bash
# Delete and recreate
kubectl -n orca delete statefulset orca-redis
kubectl -n orca delete pvc orca-redis-data
kubectl apply -f k8s/redis.yaml
```

---

### Issue 6: Backend Container Image Not Found

**Symptoms:** `ImagePullBackOff` or `Failed to pull image` errors

**Solutions:**

1. **Check if image was built:**
```bash
docker images | grep orca-backend
```

2. **Build the backend image:**
```bash
# Navigate to repo root
docker build -t orca-backend:latest -f backend/Dockerfile .
```

3. **Verify build succeeded:**
```bash
docker images | grep orca-backend
```

4. **If building inside Ubuntu:**
```bash
# Switch backend.yaml imagePullPolicy to IfNotPresent
kubectl -n orca edit deployment orca-backend
# Change: imagePullPolicy: Always → imagePullPolicy: IfNotPresent
```

5. **For Docker Desktop / local registry:**
```bash
# Tag and push to local registry
docker tag orca-backend:latest localhost:32000/orca-backend:latest
docker push localhost:32000/orca-backend:latest

# Update backend.yaml to use localhost:32000/orca-backend:latest
```

---

### Issue 7: Backend Pod CrashLoopBackOff

**Symptoms:** Backend keeps restarting

**Solutions:**

1. **Check logs:**
```bash
kubectl -n orca logs orca-backend-<pod-id> --tail=100
```

2. **Common issues:**
   - Missing environment variables (REDIS_URL, etc.)
   - Import errors (missing packages)
   - Port already in use

3. **Check pod events:**
```bash
kubectl -n orca describe pod orca-backend-<pod-id>
```

4. **Test image locally first:**
```bash
docker run -it --rm -p 8000:8000 orca-backend:latest
# Should start without errors
```

5. **If import errors, check requirements.txt:**
```bash
# Verify requirements.txt has all dependencies
cat services/backend/requirements.txt

# Rebuild image if you updated requirements
docker build -t orca-backend:latest -f backend/Dockerfile .
```

---

### Issue 8: Cannot Connect to Services from Windows

**Symptoms:** Can't reach `localhost:8000`, `localhost:6379`, etc.

**Solutions:**

1. **Check port forwarding is running:**
```bash
# In Ubuntu terminal
ps aux | grep port-forward
```

2. **If not running, start it:**
```bash
kubectl -n orca port-forward svc/orca-backend 8000:8000 &
kubectl -n orca port-forward svc/orca-redis 6379:6379 &
```

3. **Check if port is already in use on Windows:**
```powershell
netstat -ano | findstr :8000
# Kill the process if needed
taskkill /PID <PID> /F
```

4. **Check Ubuntu firewall:**
```bash
sudo ufw status
sudo ufw allow 8000/tcp
sudo ufw allow 6379/tcp
```

5. **WSL2 network issue - restart WSL:**
```powershell
wsl --shutdown
# Then restart Ubuntu
wsl -d Ubuntu-22.04
```

---

### Issue 9: Neo4j Cypher Shell Connection Failed

**Symptoms:** Can't connect to Neo4j at `bolt://localhost:7687`

**Solutions:**

1. **First, verify Neo4j pod is running:**
```bash
kubectl -n orca get pods -l app=orca-neo4j
```

2. **Check Neo4j logs:**
```bash
kubectl -n orca logs orca-neo4j-0 --tail=50
```

3. **Verify port-forward is working:**
```bash
# In Ubuntu terminal
kubectl -n orca port-forward svc/orca-neo4j 7687:7687
# Should show: Forwarding from 127.0.0.1:7687 -> 7687
```

4. **Try connecting from Ubuntu first (before Windows):**
```bash
# Inside Ubuntu
kubectl -n orca run cypher-test --rm -it --image=neo4j:5.19-community --restart=Never -- \
  cypher-shell -a bolt://orca-neo4j:7687 -u neo4j -p OrcaSecure123 "RETURN 1"
```

5. **If that works, try port-forward to Windows**

6. **Check password is correct:**
```bash
# Should match what you set in the secret
kubectl -n orca get secret neo4j-auth -o yaml
```

---

### Issue 10: All Pods Running but Services Can't Communicate

**Symptoms:** Pods are running but can't reach each other

**Solutions:**

1. **Check DNS is working:**
```bash
# Inside a pod
kubectl -n orca run dns-test --rm -it --image=busybox --restart=Never -- nslookup orca-redis
```

2. **Verify DNS addon is enabled:**
```bash
microk8s status
# Should show "dns: enabled"

# If not:
microk8s enable dns
```

3. **Check network policies:**
```bash
kubectl -n orca get networkpolicies
# If any exist, they might be blocking traffic
```

4. **Check service endpoints:**
```bash
kubectl -n orca get endpoints
# Each service should have endpoints listed
```

5. **Test connectivity from a pod:**
```bash
kubectl -n orca run test-pod --rm -it --image=curlimages/curl --restart=Never -- \
  curl -v http://orca-backend:8000/health/llm
```

---

### Issue 11: Prometheus Not Scraping Metrics

**Symptoms:** Prometheus running but no targets or metrics

**Solutions:**

1. **Check if Prometheus pod is running:**
```bash
kubectl -n orca get pods -l app=prometheus
```

2. **Check Prometheus config:**
```bash
kubectl -n orca get configmap prometheus-server-conf -o yaml
```

3. **Access Prometheus UI:**
```bash
# Port-forward if not already running
kubectl -n orca port-forward svc/prometheus 9090:9090
# Then visit http://localhost:9090 in browser
```

4. **Check targets in Prometheus UI:**
   - Go to Status → Targets
   - Look for endpoints and their state (Up/Down)

5. **If targets are down, check node-exporter:**
```bash
kubectl -n orca get pods -l app=node-exporter
kubectl -n orca logs -l app=node-exporter --tail=20
```

---

### Issue 12: High Memory/CPU Usage

**Symptoms:** MicroK8s or pods consuming excessive resources

**Solutions:**

1. **Check resource usage:**
```bash
kubectl top nodes
kubectl top pods -n orca
```

2. **Check pod limits:**
```bash
kubectl -n orca describe pod orca-neo4j-0 | grep -A 10 "Limits"
```

3. **If Neo4j is using too much memory:**
```bash
# Neo4j config in manifest
# Reduce NEO4J_HEAP_SIZE if needed
```

4. **Restart services:**
```bash
# Delete and recreate resource
kubectl -n orca delete deployment orca-backend
kubectl apply -f k8s/backend.yaml
```

5. **Check MicroK8s system pods:**
```bash
kubectl top pods -A
# Large resource usage in kube-system might indicate misconfiguration
```

---

### Issue 13: Fluent-bit Not Sending Logs

**Symptoms:** Backend `/ingest/logs` endpoint not receiving data

**Solutions:**

1. **Check Fluent-bit pod:**
```bash
kubectl -n orca get pods -l app=fluent-bit
kubectl -n orca logs -l app=fluent-bit --tail=50
```

2. **Check backend for received logs:**
```bash
kubectl -n orca logs -l app=orca-backend --tail=100 | grep "/ingest/logs"
```

3. **Verify Redis stream:**
```bash
kubectl -n orca exec -it statefulset/orca-redis -- redis-cli
# Inside redis-cli
XREAD COUNT 5 STREAMS logs:orca:backend 0
```

4. **Check Fluent-bit config:**
```bash
kubectl -n orca describe configmap fluent-bit-config
```

---

### Issue 14: eBPF DaemonSet Pods Not Starting

**Symptoms:** eBPF pods stuck in Pending or showing errors

**Solutions:**

1. **Check pod status:**
```bash
kubectl -n orca get pods -l app=ebpf-tcp-connect
kubectl -n orca describe daemonset ebpf-tcp-connect
```

2. **eBPF requires privileged mode:**
```bash
# Verify pod is running with privileges
kubectl -n orca describe pod <ebpf-pod-name> | grep Privileged
```

3. **Check node kernel version:**
```bash
# eBPF needs Linux kernel >= 5.0
uname -r
```

4. **If nodes don't support eBPF:**
   - eBPF will error but other services continue
   - It's not critical for the main ORCA functionality

5. **Increase log verbosity:**
```bash
kubectl -n orca logs -l app=ebpf-tcp-connect -f
```

---

### Issue 15: Cluster Keeps Getting OOMKilled

**Symptoms:** Random pods getting killed, especially Neo4j or Prometheus

**Solutions:**

1. **Check available memory:**
```bash
free -h
kubectl describe nodes
```

2. **Increase WSL2 memory allocation** (on Windows host):
```powershell
# Create or edit %USERPROFILE%\.wslconfig
[wsl2]
memory=16GB
processors=4
swap=8GB
```

3. **Then restart WSL:**
```powershell
wsl --shutdown
wsl -d Ubuntu-22.04
```

4. **Reduce pod memory requests if needed:**
```bash
# Edit deployment
kubectl -n orca edit deployment orca-backend
# Reduce memory: 512Mi → 256Mi
```

---

## Quick Diagnostics Command

Run this to collect diagnostics:

```bash
#!/bin/bash

echo "=== MicroK8s Status ==="
microk8s status

echo ""
echo "=== ORCA Namespace Pods ==="
kubectl -n orca get pods -o wide

echo ""
echo "=== ORCA Services ==="
kubectl -n orca get svc

echo ""
echo "=== Pod Resource Usage ==="
kubectl top pods -n orca 2>/dev/null || echo "Metrics not available yet"

echo ""
echo "=== Recent Pod Events ==="
kubectl -n orca get events --sort-by='.lastTimestamp' | tail -20

echo ""
echo "=== Backend Logs (Last 20 lines) ==="
kubectl -n orca logs -l app=orca-backend --tail=20 2>/dev/null || echo "No backend logs"

echo ""
echo "=== Redis Connectivity ==="
kubectl -n orca exec -it statefulset/orca-redis -- redis-cli ping 2>/dev/null || echo "Redis not accessible"
```

---

## Getting Help

If you're still stuck:

1. **Collect diagnostics** using the command above
2. **Check logs** with: `kubectl -n orca logs <pod-name>`
3. **Check events** with: `kubectl -n orca get events`
4. **Try restart** with: `kubectl delete ns orca && kubectl apply -f k8s/namespace.yaml`

See **COMPLETE_SETUP_GUIDE.md** for more details on each component.
