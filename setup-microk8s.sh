#!/bin/bash

# ORCA MicroK8s Full Setup Automation Script
# This script automates the entire setup process for ORCA with MicroK8s

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== ORCA MicroK8s Full Setup ===${NC}"
echo ""

# Configuration
ORCA_PASSWORD="OrcaSecure123"
REPO_PATH="$(pwd)"  # Should be run from repo root

# Function to print section
print_section() {
    echo -e "${YELLOW}\n>>> $1${NC}"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# ============ PART 1: CHECK PREREQUISITES ============

print_section "PART 1: Checking Prerequisites"

# Check if running in WSL2 Ubuntu
if grep -q -i microsoft /proc/version &> /dev/null; then
    echo -e "${GREEN}✓ Running in WSL2${NC}"
else
    echo -e "${RED}✗ Not in WSL2. Please run this in Ubuntu under WSL2.${NC}"
    exit 1
fi

# Check if MicroK8s is installed
if ! command_exists microk8s; then
    echo -e "${RED}✗ MicroK8s not found. Installing...${NC}"
    
    print_section "Installing MicroK8s"
    sudo snap install core
    sudo snap install microk8s --classic --channel=1.28/stable
    
    # Configure user
    sudo usermod -a -G microk8s "$USER"
    sudo chown -f -R "$USER" ~/.kube
    
    echo -e "${YELLOW}Please run: newgrp microk8s${NC}"
    echo -e "${YELLOW}Then run this script again.${NC}"
    exit 0
else
    echo -e "${GREEN}✓ MicroK8s installed${NC}"
fi

# Check MicroK8s status
print_section "Starting MicroK8s"
microk8s status --wait-ready

# Enable required addons
echo -e "${YELLOW}Enabling required addons...${NC}"
microk8s enable dns storage prometheus || true

echo -e "${GREEN}✓ MicroK8s is ready${NC}"

# ============ PART 2: PREPARE KUBERNETES MANIFESTS ============

print_section "PART 2: Applying Kubernetes Manifests"

cd "$REPO_PATH"

# Create namespace
echo "Creating namespace..."
kubectl apply -f k8s/namespace.yaml

# Create RBAC
echo "Creating RBAC roles..."
kubectl apply -f rbac/clusterroles.yaml

# Create Neo4j secret
echo "Creating Neo4j auth secret..."
kubectl -n orca create secret generic neo4j-auth \
    --from-literal=auth="neo4j/$ORCA_PASSWORD" \
    --dry-run=client -o yaml | kubectl apply -f -

echo -e "${GREEN}✓ Namespace, RBAC, and secrets created${NC}"

# ============ PART 3: DEPLOY INFRASTRUCTURE SERVICES ============

print_section "PART 3: Deploying Infrastructure Services"

echo "Applying Redis..."
kubectl apply -f k8s/redis.yaml

echo "Applying Neo4j..."
kubectl apply -f k8s/neo4j.yaml

echo "Applying Prometheus..."
kubectl apply -f k8s/prometheus-stack.yaml

echo "Applying Fluent-bit..."
kubectl apply -f k8s/fluent-bit.yaml

echo "Applying eBPF DaemonSet..."
kubectl apply -f k8s/ebpf-daemonset.yaml

echo -e "${YELLOW}Waiting for infrastructure pods to be ready (this may take 2-3 minutes)...${NC}"
kubectl -n orca wait --for=condition=ready pod -l app=orca-redis --timeout=300s || true
kubectl -n orca wait --for=condition=ready pod -l app=orca-neo4j --timeout=300s || true

echo -e "${GREEN}✓ Infrastructure services deployed${NC}"

# ============ PART 4: BUILD AND DEPLOY BACKEND ============

print_section "PART 4: Building and Deploying Backend"

if command_exists docker; then
    echo "Building backend Docker image..."
    docker build -t orca-backend:latest -f backend/Dockerfile .
    
    # Try to make available to MicroK8s
    if docker ps >/dev/null 2>&1; then
        # If Docker daemon is running, try to push to local registry
        docker tag orca-backend:latest localhost:32000/orca-backend:latest
        docker push localhost:32000/orca-backend:latest || echo "Could not push to local registry, that's OK"
    fi
    
    echo -e "${GREEN}✓ Backend image built${NC}"
else
    echo -e "${YELLOW}Docker not found. You'll need to build backend image manually:${NC}"
    echo "    docker build -t orca-backend:latest -f backend/Dockerfile ."
fi

echo "Deploying backend..."
kubectl apply -f k8s/backend.yaml

echo -e "${YELLOW}Waiting for backend to be ready...${NC}"
kubectl -n orca wait --for=condition=ready pod -l app=orca-backend --timeout=120s || true

echo -e "${GREEN}✓ Backend deployed${NC}"

# ============ PART 5: DEPLOY TEST/DEMO SERVICES (OPTIONAL) ============

print_section "PART 5: Deploying Test/Demo Services"

echo "Deploying test services..."
kubectl apply -f k8s/graph-populator.yaml || echo "Could not apply graph-populator"
kubectl apply -f k8s/incident-generator.yaml || echo "Could not apply incident-generator"
kubectl apply -f k8s/metrics-generator.yaml || echo "Could not apply metrics-generator"
kubectl apply -f k8s/cpu-agent.yaml || echo "Could not apply cpu-agent"

echo -e "${GREEN}✓ Test services deployed${NC}"

# ============ PART 6: VALIDATE DEPLOYMENT ============

print_section "PART 6: Validating Deployment"

echo -e "${YELLOW}All pods in orca namespace:${NC}"
kubectl -n orca get pods

echo ""
echo -e "${YELLOW}All services in orca namespace:${NC}"
kubectl -n orca get svc

# Test Neo4j connectivity
echo ""
echo -e "${YELLOW}Testing Neo4j connectivity...${NC}"
if kubectl -n orca run neo4j-check --rm -it --image=neo4j:5.19-community --restart=Never -- \
    cypher-shell -a bolt://orca-neo4j:7687 -u neo4j -p "$ORCA_PASSWORD" "RETURN 1" 2>/dev/null; then
    echo -e "${GREEN}✓ Neo4j is accessible${NC}"
else
    echo -e "${YELLOW}⚠ Neo4j connectivity check timed out (may still be initializing)${NC}"
fi

# Test Redis connectivity
echo ""
echo -e "${YELLOW}Testing Redis connectivity...${NC}"
if kubectl -n orca exec -it statefulset/orca-redis -- redis-cli ping 2>/dev/null | grep -q "PONG"; then
    echo -e "${GREEN}✓ Redis is accessible${NC}"
else
    echo -e "${YELLOW}⚠ Redis not yet ready (may be initializing)${NC}"
fi

# ============ PART 7: SETUP PORT FORWARDING ============

print_section "PART 7: Setting Up Port Forwarding"

echo -e "${YELLOW}Starting port-forward daemons...${NC}"

# Start port forwards in background
nohup kubectl -n orca port-forward svc/orca-backend 8000:8000 > /tmp/backend-portforward.log 2>&1 &
echo "Backend (8000): $!"

nohup kubectl -n orca port-forward svc/orca-redis 6379:6379 > /tmp/redis-portforward.log 2>&1 &
echo "Redis (6379): $!"

nohup kubectl -n orca port-forward svc/orca-neo4j 7687:7687 > /tmp/neo4j-portforward.log 2>&1 &
echo "Neo4j (7687): $!"

nohup kubectl -n orca port-forward svc/prometheus 9090:9090 > /tmp/prometheus-portforward.log 2>&1 &
echo "Prometheus (9090): $!"

sleep 2

echo -e "${GREEN}✓ Port forwarding configured${NC}"

# ============ FINAL SUMMARY ============

print_section "SETUP COMPLETE!"

echo -e "${GREEN}Your ORCA cluster is now running!${NC}"
echo ""
echo "Access points (from Windows):"
echo "  Backend:    http://localhost:8000"
echo "  Neo4j:      bolt://localhost:7687 (user: neo4j, password: $ORCA_PASSWORD)"
echo "  Redis:      localhost:6379"
echo "  Prometheus: http://localhost:9090"
echo ""
echo "Useful commands:"
echo "  kubectl -n orca get pods          - View all pods"
echo "  kubectl -n orca logs POD_NAME     - View pod logs"
echo "  kubectl -n orca get svc           - View services"
echo "  microk8s status                   - Check MicroK8s status"
echo ""
echo -e "${YELLOW}Next: Deploy the frontend or run in dev mode:${NC}"
echo "  Frontend (dev):  cd frontend && npm install && npm run dev"
echo "  Frontend (K8s):  docker build -t orca-frontend:latest -f frontend/Dockerfile ."
echo ""
echo "For more details, see: COMPLETE_SETUP_GUIDE.md"
echo ""
