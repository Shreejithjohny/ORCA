# ORCA Dependency & Execution Guide

This guide details the core dependencies required to run the ORCA project and provides step-by-step instructions on how to set them up manually. Our platform relies on a lightweight Kubernetes environment and a specific set of infrastructure services.

## Core Dependencies

ORCA's architecture is built on the following key dependencies:

1.  **MicroK8s** (or K3s/Minikube): The lightweight Kubernetes distribution that hosts all our microservices. MicroK8s is preferred for its native Linux kernel support, which is necessary for eBPF tracing.
2.  **Redis**: Acts as the high-speed data bus for netflows, logs, and telemetry data.
3.  **Neo4j**: A graph database used to store and query the dependency graph of your microservices and infrastructure.
4.  **Prometheus Stack**: Collects and stores metrics from the system.
5.  **Fluent-bit & eBPF**: The observability stack for capturing logs and network tracing at the kernel level.
6.  **Ollama**: Used for running local NLP models (like Mistral) to explain incidents.

---

## Step-by-Step Setup Using Dependencies

If you want to manually set up these dependencies and run the project, follow these steps.

### Step 1: Install the Kubernetes Environment (MicroK8s)

ORCA needs a Kubernetes cluster. If you are on Windows, ensure you are running these commands inside an **Ubuntu WSL2** terminal.

```bash
# Update and install dependencies
sudo apt update && sudo apt install -y curl

# Install MicroK8s
sudo snap install microk8s --classic --channel=1.28/stable

# Add your user to the microk8s group (you may need to restart your terminal after this)
sudo usermod -a -G microk8s $USER
newgrp microk8s

# Enable required MicroK8s add-ons
microk8s enable dns hostpath-storage registry
```

### Step 2: Deploy the Core Dependencies (Redis, Neo4j, etc.)

With MicroK8s running, you will deploy each dependency using the provided Kubernetes manifests. Navigate to the ORCA root directory and run:

```bash
# 1. Create the dedicated namespace
microk8s kubectl apply -f k8s/namespace.yaml

# 2. Setup permissions (RBAC)
microk8s kubectl apply -f rbac/clusterroles.yaml

# 3. Create the secret for Neo4j Authentication
# NOTE: The password must match the one expected by the backend
microk8s kubectl -n orca create secret generic neo4j-auth \
  --from-literal=auth="neo4j/OrcaSecure123"

# 4. Deploy the Infrastructure Dependencies
microk8s kubectl apply -f k8s/redis.yaml
microk8s kubectl apply -f k8s/neo4j.yaml
microk8s kubectl apply -f k8s/prometheus-stack.yaml
microk8s kubectl apply -f k8s/fluent-bit.yaml
microk8s kubectl apply -f k8s/ebpf-daemonset.yaml
microk8s kubectl apply -f k8s/ollama.yaml
```

### Step 3: Deploy the Application Components

Once the dependencies (Redis, Neo4j, etc.) are initializing, you can deploy the actual ORCA services:

```bash
# Deploy Backend
microk8s kubectl apply -f k8s/backend.yaml

# Deploy Data Generators (Agents)
microk8s kubectl apply -f k8s/incident-generator.yaml
microk8s kubectl apply -f k8s/metrics-generator.yaml
microk8s kubectl apply -f k8s/cpu-agent.yaml
```

### Step 4: Verify Dependencies Are Running

To check that MicroK8s has successfully started Redis, Neo4j, and the other services:

```bash
microk8s kubectl -n orca get pods
```
*Wait until all pods show a status of `Running`.*

### Step 5: Expose Dependencies for Local Access

To interact with these dependencies or the backend from your host machine (e.g., your Windows browser), you need to port-forward them:

Open separate terminal windows and run:

```bash
# Expose the Backend API
microk8s kubectl -n orca port-forward svc/orca-backend 8000:8000

# Expose Redis
microk8s kubectl -n orca port-forward svc/orca-redis 6379:6379

# Expose Neo4j
microk8s kubectl -n orca port-forward svc/orca-neo4j 7687:7687

# Expose Prometheus
microk8s kubectl -n orca port-forward svc/prometheus 9090:9090
```

### Step 6: Start the Frontend UI

With the backend and all dependencies running in MicroK8s, start the React/Next.js frontend locally:

```bash
cd frontend
npm install
npm run dev
```

You can now access the ORCA dashboard at `http://localhost:3000`.
