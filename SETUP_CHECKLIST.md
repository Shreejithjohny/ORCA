# ORCA MicroK8s Setup - Quick Reference Checklist

## Prerequisites
- [ ] Windows 10/11 with Administrator access
- [ ] At least 4 CPU cores and 8GB RAM available
- [ ] Internet connection for package downloads

## WSL2 + Ubuntu Setup

### Windows PowerShell (as Administrator)
```powershell
# Check current WSL status
wsl --list --verbose

# Enable WSL2 features (if not already done)
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart

# Restart computer after above commands
# Then set WSL2 as default
wsl --set-default-version 2

# Install Ubuntu 22.04
wsl --install -d Ubuntu-22.04
```

### Inside Ubuntu (WSL2)
```bash
# [ ] Update system
sudo apt update && sudo apt upgrade -y

# [ ] Install required tools
sudo apt install -y curl git
```

## MicroK8s Installation (In Ubuntu)

```bash
# [ ] Install snapd and core
sudo snap install core

# [ ] Install MicroK8s
sudo snap install microk8s --classic --channel=1.28/stable

# [ ] Configure user permissions
sudo usermod -a -G microk8s "$USER"
sudo chown -f -R "$USER" ~/.kube
newgrp microk8s

# [ ] Verify installation
microk8s status --wait-ready

# [ ] Enable addons
microk8s enable dns storage prometheus

# [ ] Add kubectl alias (permanent in ~/.bashrc)
echo "alias kubectl='microk8s kubectl'" >> ~/.bashrc
source ~/.bashrc
```

## ORCA Deployment

### Navigate to Repo
```bash
# [ ] Set repo path (adjust path as needed)
cd /mnt/d/HACKATHONS/orca/ORCA
# or if in c:\Users\shree\Documents\ORCA
cd /mnt/c/Users/shree/Documents/ORCA
```

### Deploy Infrastructure
```bash
# [ ] Create namespace
kubectl apply -f k8s/namespace.yaml

# [ ] Create RBAC
kubectl apply -f rbac/clusterroles.yaml

# [ ] Create Neo4j secret
kubectl -n orca create secret generic neo4j-auth --from-literal=auth='neo4j/OrcaSecure123'

# [ ] Deploy Redis
kubectl apply -f k8s/redis.yaml

# [ ] Deploy Neo4j
kubectl apply -f k8s/neo4j.yaml

# [ ] Deploy Prometheus
kubectl apply -f k8s/prometheus-stack.yaml

# [ ] Deploy Fluent-bit
kubectl apply -f k8s/fluent-bit.yaml

# [ ] Deploy eBPF
kubectl apply -f k8s/ebpf-daemonset.yaml

# [ ] Deploy Backend
kubectl apply -f k8s/backend.yaml

# [ ] (Optional) Deploy test services
kubectl apply -f k8s/graph-populator.yaml
kubectl apply -f k8s/incident-generator.yaml
kubectl apply -f k8s/metrics-generator.yaml
kubectl apply -f k8s/cpu-agent.yaml
```

### Backend Image (Optional but Recommended)
```bash
# [ ] Build backend Docker image
docker build -t orca-backend:latest -f backend/Dockerfile .

# [ ] If using Docker Desktop/local registry:
docker tag orca-backend:latest localhost:32000/orca-backend:latest
docker push localhost:32000/orca-backend:latest
```

## Verification

```bash
# [ ] Check all pods running
kubectl -n orca get pods

# [ ] Check all services
kubectl -n orca get svc

# [ ] Test Neo4j
kubectl -n orca run neo4j-check --rm -it --image=neo4j:5.19-community --restart=Never -- \
  cypher-shell -a bolt://orca-neo4j:7687 -u neo4j -p OrcaSecure123 "RETURN 1"

# [ ] Test Redis
kubectl -n orca exec -it statefulset/orca-redis -- redis-cli ping

# [ ] Check backend logs
kubectl -n orca logs -l app=orca-backend --tail=50
```

## Port Forwarding (Keep These Running)

```bash
# [ ] Forward backend (8000)
kubectl -n orca port-forward svc/orca-backend 8000:8000 &

# [ ] Forward Redis (6379)
kubectl -n orca port-forward svc/orca-redis 6379:6379 &

# [ ] Forward Neo4j (7687)
kubectl -n orca port-forward svc/orca-neo4j 7687:7687 &

# [ ] Forward Prometheus (9090)
kubectl -n orca port-forward svc/prometheus 9090:9090 &

# [ ] Forward Frontend (if deployed) (3000)
kubectl -n orca port-forward svc/orca-frontend 3000:3000 &
```

## Frontend Deployment

### Option A: Development Mode (on Windows or WSL)
```bash
cd frontend
npm install
npm run dev
# Then access at http://localhost:3000
```

### Option B: Kubernetes Deployment
```bash
# [ ] Build frontend image
docker build -t orca-frontend:latest -f frontend/Dockerfile .

# [ ] Deploy frontend to K8s
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

## Access Points

```
Backend:    http://localhost:8000
Frontend:   http://localhost:3000
Neo4j:      bolt://localhost:7687 (user: neo4j, password: OrcaSecure123)
Redis:      localhost:6379
Prometheus: http://localhost:9090
```

## Useful Commands Reference

```bash
# Watch pods in real-time
kubectl -n orca get pods -w

# Follow logs
kubectl -n orca logs -f deployment/orca-backend

# Describe pod (for debugging)
kubectl -n orca describe pod POD_NAME

# Execute command in pod
kubectl -n orca exec -it POD_NAME -- bash

# Get pod IP
kubectl -n orca get pods -o wide

# Delete all and restart
kubectl delete ns orca

# Check MicroK8s status
microk8s status

# Restart MicroK8s
microk8s stop && microk8s start
```

## Troubleshooting Quick Links

See **COMPLETE_SETUP_GUIDE.md** for detailed troubleshooting:
- Backend pod not starting
- Frontend connectivity issues
- Redis/Neo4j connection problems
- Image pull errors
- Port forwarding issues

## Important Notes

⚠️ **Do Not Commit:**
- Kubeconfig files
- Cluster secrets/passwords
- Docker images
- MicroK8s snapshots

✓ **After Successful Setup:**
- Create cluster snapshot for backup (Part 8 of guide)
- Document any custom configurations
- Test all services from Windows clients

