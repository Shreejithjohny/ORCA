# ORCA Quick Manual Setup (Windows)

Follow these exact steps to get ORCA running:

## STEP 1: Enable WSL2 (Run as Administrator in PowerShell)

```powershell
# Copy and paste these commands ONE BY ONE in PowerShell (Administrator)

# Enable WSL
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart

# Enable Virtual Machine Platform
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart

# Set WSL2 as default
wsl --set-default-version 2

# Restart your computer when prompted
```

**STOP HERE**: Restart your computer

---

## STEP 2: Install Ubuntu 22.04

After restart, run in PowerShell:

```powershell
# Install Ubuntu
wsl --install -d Ubuntu

# This will download and launch Ubuntu
# Create a username and password when prompted
```

---

## STEP 3: Inside Ubuntu Terminal, Install MicroK8s

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install snapd and MicroK8s
sudo snap install core
sudo snap install microk8s --classic --channel=1.28/stable

# Configure user
sudo usermod -a -G microk8s $USER
sudo chown -f -R $USER ~/.kube

# Switch to new group (important!)
newgrp microk8s

# Wait for MicroK8s to be ready
microk8s status --wait-ready

# Enable required addons
microk8s enable dns storage prometheus

# Create alias for convenience
echo "alias kubectl='microk8s kubectl'" >> ~/.bashrc
source ~/.bashrc
```

---

## STEP 4: Deploy ORCA Services

Inside Ubuntu terminal:

```bash
# Navigate to repo
cd /mnt/c/Users/shree/Documents/ORCA

# Create namespace and RBAC
kubectl apply -f k8s/namespace.yaml
kubectl apply -f rbac/clusterroles.yaml

# Create Neo4j secret
kubectl -n orca create secret generic neo4j-auth --from-literal=auth='neo4j/OrcaSecure123'

# Deploy infrastructure (in order)
kubectl apply -f k8s/redis.yaml
kubectl apply -f k8s/neo4j.yaml
kubectl apply -f k8s/prometheus-stack.yaml
kubectl apply -f k8s/fluent-bit.yaml
kubectl apply -f k8s/ebpf-daemonset.yaml
kubectl apply -f k8s/backend.yaml

# (Optional) Deploy test services
kubectl apply -f k8s/graph-populator.yaml
kubectl apply -f k8s/incident-generator.yaml
kubectl apply -f k8s/metrics-generator.yaml
kubectl apply -f k8s/cpu-agent.yaml

# Wait for services to start (2-3 minutes)
echo "Waiting for services to start..."
kubectl -n orca wait --for=condition=ready pod -l app=orca-redis --timeout=300s || echo "Redis initializing..."
kubectl -n orca wait --for=condition=ready pod -l app=orca-neo4j --timeout=300s || echo "Neo4j initializing..."

# Check status
kubectl -n orca get pods
```

---

## STEP 5: Setup Port Forwarding

Keep these running in Ubuntu terminal:

```bash
# Open a new Ubuntu terminal window and keep these running:

# Forward backend (8000)
kubectl -n orca port-forward svc/orca-backend 8000:8000

# In another terminal:
kubectl -n orca port-forward svc/orca-redis 6379:6379

# In another terminal:
kubectl -n orca port-forward svc/orca-neo4j 7687:7687

# In another terminal:
kubectl -n orca port-forward svc/prometheus 9090:9090
```

---

## STEP 6: Verify Everything is Running

In a new Ubuntu terminal:

```bash
# Check all pods
kubectl -n orca get pods

# Should see all in "Running" state:
# orca-backend-xxxxx
# orca-redis-0
# orca-neo4j-0
# prometheus-xxx
# fluent-bit-xxx
# ebpf-tcp-connect-xxx

# Check services
kubectl -n orca get svc
```

---

## STEP 7: Test Connectivity

From Windows (PowerShell):

```powershell
# Test backend
Invoke-WebRequest http://localhost:8000/health/llm -UseBasicParsing

# Test Neo4j connection
# Use any Neo4j client and connect to: bolt://localhost:7687
# Username: neo4j
# Password: OrcaSecure123
```

---

## STEP 8: Build Backend Image (Optional but Recommended)

```bash
# On Windows (in project directory):
docker build -t orca-backend:latest -f backend/Dockerfile .

# Or in Ubuntu:
cd /mnt/c/Users/shree/Documents/ORCA
docker build -t orca-backend:latest -f backend/Dockerfile .
```

---

## All Services Should Now Be Accessible

| Service | Address | Notes |
|---------|---------|-------|
| Backend | `http://localhost:8000` | FastAPI |
| Frontend | `http://localhost:3000` | Next.js (if deployed) |
| Neo4j | `bolt://localhost:7687` | Graph DB (user: neo4j, pass: OrcaSecure123) |
| Redis | `localhost:6379` | Data bus |
| Prometheus | `http://localhost:9090` | Metrics |

---

## Troubleshooting

### If a pod won't start:
```bash
kubectl -n orca describe pod <pod-name>
kubectl -n orca logs <pod-name>
```

### If Redis/Neo4j still pending:
```bash
microk8s enable storage
```

### If can't connect from Windows:
```bash
# Make sure port-forward is running in Ubuntu
ps aux | grep port-forward
```

### Reset everything:
```bash
kubectl delete namespace orca
kubectl apply -f k8s/namespace.yaml
# Then reapply manifests
```

---

## Next: Run the Demo!

Once all services are running, see **ORCA_DEMO.md** for how to test the platform end-to-end.
