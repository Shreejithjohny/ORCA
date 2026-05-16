# Complete ORCA MicroK8s Setup Guide - Full Project

This guide will set up the entire ORCA project with backend, frontend, and all services.

## Prerequisites Check

### Windows PowerShell (Run as Administrator)
```powershell
# Check if WSL2 is installed
wsl --list --verbose

# If not installed, enable WSL2
wsl --install -d Ubuntu

# Check if Docker Desktop is installed (optional, but recommended)
docker --version
```

## Part 1: Setup WSL2 + Ubuntu (if needed)

### Step 1: Enable WSL2 Feature
```powershell
# Run as Administrator
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart

# Restart your computer after this
# Then set WSL2 as default
wsl --set-default-version 2
```

### Step 2: Install Ubuntu 22.04
```powershell
# In PowerShell (Administrator)
wsl --install -d Ubuntu-22.04
# This will download and install Ubuntu - follow prompts to create a user
```

### Step 3: Launch Ubuntu and Update
```bash
# Inside Ubuntu shell (launch from Start menu or: wsl -d Ubuntu-22.04)
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git
```

## Part 2: Install MicroK8s (In Ubuntu)

```bash
# Inside Ubuntu shell
sudo snap install core
sudo snap install microk8s --classic --channel=1.28/stable

# Configure user
sudo usermod -a -G microk8s "$USER"
sudo chown -f -R "$USER" ~/.kube
newgrp microk8s

# Verify installation
microk8s status --wait-ready
```

### Enable Required Addons
```bash
microk8s enable dns storage prometheus
```

### Create kubectl alias (for convenience)
```bash
# Add to ~/.bashrc or ~/.zshrc
alias kubectl='microk8s kubectl'

# Source it now
source ~/.bashrc
```

## Part 3: Setup Backend Docker Image

The backend needs to be containerized for Kubernetes.

### Step 1: Create Dockerfile for Backend
Create `backend/Dockerfile`:
```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Copy requirements
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ .
COPY services/ ../services/

ENV REDIS_URL=redis://orca-redis:6379/0
ENV PYTHONUNBUFFERED=1

EXPOSE 8000

CMD ["python", "app.py"]
```

### Step 2: Build Backend Image

**Option A: Using MicroK8s Docker registry**
```bash
# Inside Ubuntu
cd /mnt/d/HACKATHONS/orca/ORCA  # Adjust to your path

# Build and save to tar (simpler for MicroK8s)
docker build -t orca-backend:latest -f backend/Dockerfile .
# Or use MicroK8s containerd directly:
microk8s ctr image build -t orca-backend:latest -f backend/Dockerfile .
```

**Option B: Using local Docker Desktop (from Windows)**
```powershell
# On Windows PowerShell, navigate to repo
cd c:\Users\shree\Documents\ORCA

# Build the image
docker build -t orca-backend:latest -f backend/Dockerfile .

# Make it available to MicroK8s (tag for MicroK8s registry)
docker tag orca-backend:latest localhost:32000/orca-backend:latest
docker push localhost:32000/orca-backend:latest
```

## Part 4: Apply Kubernetes Manifests

```bash
# Inside Ubuntu, navigate to repo
cd /mnt/d/HACKATHONS/orca/ORCA  # Adjust path

# Step 1: Create namespace and RBAC
kubectl apply -f k8s/namespace.yaml
kubectl apply -f rbac/clusterroles.yaml

# Step 2: Create Neo4j secret (CRITICAL)
kubectl -n orca create secret generic neo4j-auth --from-literal=auth='neo4j/OrcaSecure123'

# Step 3: Apply infrastructure services (order matters!)
kubectl apply -f k8s/redis.yaml
kubectl apply -f k8s/neo4j.yaml
kubectl apply -f k8s/prometheus-stack.yaml
kubectl apply -f k8s/fluent-bit.yaml
kubectl apply -f k8s/ebpf-daemonset.yaml

# Step 4: Apply backend
kubectl apply -f k8s/backend.yaml

# Optional test services
kubectl apply -f k8s/graph-populator.yaml
kubectl apply -f k8s/incident-generator.yaml
kubectl apply -f k8s/metrics-generator.yaml
kubectl apply -f k8s/cpu-agent.yaml
```

## Part 5: Setup Frontend

### Option A: Run Frontend in Container (Recommended for K8s consistency)

Create `frontend/Dockerfile`:
```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
EXPOSE 3000
CMD ["npm", "start"]
```

Build and deploy:
```bash
# Build frontend image
docker build -t orca-frontend:latest -f frontend/Dockerfile .

# Create frontend K8s manifest (frontend-deployment.yaml)
kubectl apply -f - <<EOF
apiVersion: apps/v1
kind: Deployment
metadata:
  name: orca-frontend
  namespace: orca
spec:
  replicas: 1
  selector:
    matchLabels:
      app: orca-frontend
  template:
    metadata:
      labels:
        app: orca-frontend
    spec:
      containers:
      - name: frontend
        image: orca-frontend:latest
        imagePullPolicy: IfNotPresent
        ports:
        - containerPort: 3000
        env:
        - name: NEXT_PUBLIC_API_URL
          value: "http://localhost:8000"
---
apiVersion: v1
kind: Service
metadata:
  name: orca-frontend
  namespace: orca
spec:
  type: ClusterIP
  ports:
  - port: 3000
    targetPort: 3000
  selector:
    app: orca-frontend
EOF
```

### Option B: Run Frontend on Windows Host (Dev mode)

```bash
# Inside Ubuntu or Windows
cd frontend
npm install
npm run dev
```

## Part 6: Verify All Services

```bash
# Check all pods are running
kubectl -n orca get pods

# Check services
kubectl -n orca get svc

# Check backend logs
kubectl -n orca logs -l app=orca-backend

# Check Neo4j connectivity
kubectl -n orca run neo4j-check --rm -it --image=neo4j:5.19-community --restart=Never -- \
  cypher-shell -a bolt://orca-neo4j:7687 -u neo4j -p OrcaSecure123 "RETURN 1"

# Check Redis
kubectl -n orca exec -it statefulset/orca-redis -- redis-cli ping
```

## Part 7: Port Forwarding to Windows

```bash
# From Ubuntu WSL2, forward services to Windows localhost

# Backend (8000)
kubectl -n orca port-forward svc/orca-backend 8000:8000 &

# Frontend (3000) - if deployed in K8s
kubectl -n orca port-forward svc/orca-frontend 3000:3000 &

# Neo4j (7687)
kubectl -n orca port-forward svc/orca-neo4j 7687:7687 &

# Redis (6379)
kubectl -n orca port-forward svc/orca-redis 6379:6379 &

# Prometheus (9090)
kubectl -n orca port-forward svc/prometheus 9090:9090 &
```

Then access from Windows:
- Backend: `http://localhost:8000`
- Frontend: `http://localhost:3000`
- Neo4j: `bolt://localhost:7687` (user: neo4j, password: OrcaSecure123)
- Redis: `localhost:6379`
- Prometheus: `http://localhost:9090`

## Part 8: Troubleshooting

### Backend pod not starting?
```bash
# Check logs
kubectl -n orca logs orca-backend-<pod-id>

# Check image pull status
kubectl -n orca describe pod orca-backend-<pod-id>

# If image not found, rebuild and ensure it's available to MicroK8s
```

### Frontend pod not starting?
```bash
# Check logs
kubectl -n orca logs orca-frontend-<pod-id>

# Ensure image was built successfully
docker images | grep orca-frontend
```

### Redis not connecting?
```bash
# Check if Redis pod is running
kubectl -n orca get pods -l app=orca-redis

# Check Redis logs
kubectl -n orca logs -l app=orca-redis

# Test connectivity
kubectl -n orca run redis-test --rm -it --image=redis:7-alpine --restart=Never -- redis-cli -h orca-redis ping
```

### Neo4j not connecting?
```bash
# Verify Neo4j pod
kubectl -n orca get pods -l app=orca-neo4j

# Check Neo4j logs
kubectl -n orca logs -l app=orca-neo4j --tail=50

# Test connection from pod
kubectl -n orca run neo4j-test --rm -it --image=neo4j:5.19-community --restart=Never -- \
  cypher-shell -a bolt://orca-neo4j:7687 -u neo4j -p OrcaSecure123 "RETURN 1"
```

## Useful Commands

```bash
# View all resources in orca namespace
kubectl -n orca get all

# Watch pods
kubectl -n orca get pods -w

# Stream logs from multiple pods
kubectl -n orca logs -l app=orca-backend -f

# Delete everything and start fresh
kubectl delete ns orca
```

## Next Steps (Sprint 4)

After validating, create a cluster snapshot:
```bash
microk8s status --wait-ready
sudo tar -czf /var/backups/orca-microk8s-$(date +%F).tgz /var/snap/microk8s/current
```

Do not commit snapshots, kubeconfigs, or secrets to git.
