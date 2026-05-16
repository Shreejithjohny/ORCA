# ORCA

This repository contains the ORCA observability platform.

- `k8s/` contains the Kubernetes manifests for Member A infrastructure.
- `rbac/` contains RBAC manifests and documentation.
- `services/` contains backend and NLP services.
- `frontend/` contains the React dashboard.

## Setup Guides

The project has multiple setup guides available for different levels of detail:
- **`SETUP_READY.md`**: Start here for a high-level overview and quick start.
- **`SETUP_CHECKLIST.md`**: Step-by-step checklist.
- **`COMPLETE_SETUP_GUIDE.md`**: Detailed explanations of all phases.
- **`MICROK8S_SETUP.md`**: Original lightweight MicroK8s setup instructions.

---

## 🚀 Running ORCA on Another System

To run the ORCA project on a completely different system, follow these steps:

### 1. System Prerequisites
Ensure the target system meets these minimum requirements:
*   **Operating System**: Windows 10/11 (with WSL2) OR native Ubuntu 22.04+
*   **Resources**: 4+ CPU cores and 8GB+ RAM
*   **Software**: Docker and Git (optional, for cloning)

### 2. Prepare the Codebase
Copy or clone the entire `ORCA` folder to the new system.
*   **Important Check:** If you are running `quick-setup-ubuntu.sh`, open it and verify the `REPO_PATH` variable (currently set to `/mnt/c/Users/shree/Documents/ORCA`). Make sure to change this to the actual directory path where you place the ORCA folder on the new system.

### 3. Run the Automated Setup
You have two automated options depending on the operating system of the new machine:

**Option A: If the new system is Ubuntu or running WSL2 (Recommended)**
1. Open a terminal and navigate to the ORCA folder.
2. Make the setup script executable:
   ```bash
   chmod +x quick-setup-ubuntu.sh
   ```
3. Run the script:
   ```bash
   ./quick-setup-ubuntu.sh
   ```
   *(This will automatically install MicroK8s, enable necessary addons, deploy all infrastructure like Neo4j/Redis/Prometheus/Ollama, and start your backend and agent pods).*

**Option B: If the new system is Windows (PowerShell)**
1. Open PowerShell as an Administrator.
2. Navigate to the ORCA folder: `cd \path\to\ORCA`
3. Run the Windows setup script:
   ```powershell
   powershell -ExecutionPolicy Bypass -File setup-microk8s.ps1
   ```
   *(This script will check/install WSL2 for you and execute the MicroK8s setup inside it).*

### 4. Enable Access (Port Forwarding)
Once the setup script completes successfully, the services will be running inside the MicroK8s cluster. To access them from the host machine, open separate terminal windows and run these commands to set up port forwarding:

```bash
# Terminal 1: Backend API
sudo /snap/bin/microk8s kubectl -n orca port-forward svc/orca-backend 8000:8000

# Terminal 2: Neo4j Graph DB
sudo /snap/bin/microk8s kubectl -n orca port-forward svc/orca-neo4j 7687:7687

# Terminal 3: Redis
sudo /snap/bin/microk8s kubectl -n orca port-forward svc/orca-redis 6379:6379

# Terminal 4: Prometheus Metrics
sudo /snap/bin/microk8s kubectl -n orca port-forward svc/prometheus 9090:9090
```

### 5. Start the Frontend UI
To interact with the platform, you'll need to start the Next.js development server:
1. Open a new terminal and navigate to the frontend folder: `cd frontend`
2. Install dependencies (if you haven't yet): `npm install`
3. Start the UI: `npm run dev`

### 🎯 Summary of Available Services:
*   **Backend API**: `http://localhost:8000`
*   **Frontend UI**: `http://localhost:3000`
*   **Neo4j Database**: `bolt://localhost:7687` (Username: `neo4j`, Password: `OrcaSecure123`)
*   **Prometheus**: `http://localhost:9090`

---

## 🤖 Setting Up Ollama (AI Features)

ORCA relies on Ollama and the `mistral` model to provide AI-powered incident correlation.

### Option 1: Native Installation (Recommended for Speed & GPU support)
1. Download & Install Ollama from [ollama.com/download](https://ollama.com/download).
2. Open a terminal and run the following command to download the model:
   ```bash
   ollama run mistral
   ```
3. **Configure the ORCA Backend:** 
   Tell the backend to use your native Ollama by setting this environment variable before starting it:
   * **Windows (PowerShell):** `$env:OLLAMA_URL="http://localhost:11434"`
   * **Mac/Linux:** `export OLLAMA_URL="http://localhost:11434"`

### Option 2: Running Inside MicroK8s
If you deployed the platform using the automated MicroK8s scripts (`quick-setup-ubuntu.sh`), Ollama is already deployed as a Kubernetes Pod! However, if the AI features are failing, the 4GB model might have failed to download inside the virtual environment. 

To manually trigger the download inside the cluster:
1. Open your Ubuntu WSL terminal.
2. Find the name of the Ollama pod:
   ```bash
   sudo /snap/bin/microk8s kubectl -n orca get pods | grep ollama
   ```
3. Execute the pull command inside that pod (replace `YOUR-OLLAMA-POD-NAME` with the actual name):
   ```bash
   sudo /snap/bin/microk8s kubectl -n orca exec -it YOUR-OLLAMA-POD-NAME -- ollama pull mistral
   ```
