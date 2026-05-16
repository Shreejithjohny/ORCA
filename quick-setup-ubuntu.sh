#!/bin/bash

# ORCA Quick Setup - Ubuntu/MicroK8s Deployment
# Run this after WSL2 restart

set -e

ORCA_PASSWORD="OrcaSecure123"
REPO_PATH="/mnt/c/Users/shree/Documents/ORCA"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}=== ORCA Quick Setup ===${NC}\n"

# Step 1: Install MicroK8s
echo -e "${YELLOW}Step 1: Installing MicroK8s...${NC}"
sudo snap install core
sudo snap install microk8s --classic --channel=1.28/stable

# Step 2: Configure user
echo -e "${YELLOW}Step 2: Configuring user...${NC}"
sudo usermod -a -G microk8s $USER
mkdir -p ~/.kube
sudo chown -f -R $USER ~/.kube || true

# Step 3: Wait for MicroK8s to be ready
echo -e "${YELLOW}Step 3: Waiting for MicroK8s to be ready...${NC}"
sudo /snap/bin/microk8s status --wait-ready
sudo /snap/bin/microk8s enable dns
sudo /snap/bin/microk8s enable hostpath-storage
sudo /snap/bin/microk8s enable registry
sudo /snap/bin/microk8s enable gpu
echo -e "${GREEN}✓ MicroK8s ready${NC}"

# Step 5: Add kubectl alias for future use
echo "alias kubectl='sudo /snap/bin/microk8s kubectl'" >> ~/.bashrc

# Step 6: Deploy ORCA services
echo -e "${YELLOW}Step 6: Deploying ORCA services...${NC}"

cd "$REPO_PATH"

# Create namespace and RBAC
sudo /snap/bin/microk8s kubectl apply -f k8s/namespace.yaml
sudo /snap/bin/microk8s kubectl apply -f rbac/clusterroles.yaml

# Create Neo4j secret
sudo /snap/bin/microk8s kubectl -n orca create secret generic neo4j-auth \
  --from-literal=auth="neo4j/$ORCA_PASSWORD" \
  --dry-run=client -o yaml | sudo /snap/bin/microk8s kubectl apply -f -

# Deploy infrastructure
sudo /snap/bin/microk8s kubectl apply -f k8s/redis.yaml
sudo /snap/bin/microk8s kubectl apply -f k8s/neo4j.yaml
sudo /snap/bin/microk8s kubectl apply -f k8s/prometheus-stack.yaml
sudo /snap/bin/microk8s kubectl apply -f k8s/fluent-bit.yaml
sudo /snap/bin/microk8s kubectl apply -f k8s/ebpf-daemonset.yaml
sudo /snap/bin/microk8s kubectl apply -f k8s/backend.yaml
sudo /snap/bin/microk8s kubectl apply -f k8s/ollama.yaml
# Deploy agents
sudo /snap/bin/microk8s kubectl apply -f k8s/incident-generator.yaml
sudo /snap/bin/microk8s kubectl apply -f k8s/metrics-generator.yaml
sudo /snap/bin/microk8s kubectl apply -f k8s/cpu-agent.yaml

echo -e "${YELLOW}Waiting for services to start (2-3 minutes)...${NC}"
sudo /snap/bin/microk8s kubectl -n orca wait --for=condition=ready pod -l app=orca-redis --timeout=300s 2>/dev/null || echo "Redis initializing..."
sudo /snap/bin/microk8s kubectl -n orca wait --for=condition=ready pod -l app=orca-neo4j --timeout=300s 2>/dev/null || echo "Neo4j initializing..."
sudo /snap/bin/microk8s kubectl -n orca wait --for=condition=ready pod -l app=orca-ollama --timeout=300s 2>/dev/null || echo "Ollama initializing..."

echo -e "${YELLOW}Pulling Mistral model into K8s Ollama (this may take a few minutes)...${NC}"
OLLAMA_POD=$(sudo /snap/bin/microk8s kubectl -n orca get pods -l app=orca-ollama -o jsonpath='{.items[0].metadata.name}')
sudo /snap/bin/microk8s kubectl -n orca exec $OLLAMA_POD -- ollama pull mistral || echo "Failed to pull mistral. You may need to do it manually."
# Step 7: Display status
echo ""
echo -e "${GREEN}=== Deployment Complete! ===${NC}\n"
echo -e "${YELLOW}Pod Status:${NC}"
sudo /snap/bin/microk8s kubectl -n orca get pods

echo ""
echo -e "${YELLOW}Services:${NC}"
sudo /snap/bin/microk8s kubectl -n orca get svc

echo ""
echo -e "${GREEN}✓ ORCA is deployed!${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Keep these port-forwards running in separate terminal windows:"
echo "   sudo /snap/bin/microk8s kubectl -n orca port-forward svc/orca-backend 8000:8000"
echo "   sudo /snap/bin/microk8s kubectl -n orca port-forward svc/orca-redis 6379:6379"
echo "   sudo /snap/bin/microk8s kubectl -n orca port-forward svc/orca-neo4j 7687:7687"
echo "   sudo /snap/bin/microk8s kubectl -n orca port-forward svc/prometheus 9090:9090"
echo ""
echo "2. Access from Windows:"
echo "   Backend:    http://localhost:8000"
echo "   Redis:      localhost:6379"
echo "   Neo4j:      bolt://localhost:7687 (user: neo4j, pass: $ORCA_PASSWORD)"
echo "   Prometheus: http://localhost:9090"
echo ""
echo "3. See ORCA_DEMO.md for testing and demo scenarios"
echo ""

