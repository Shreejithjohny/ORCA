@echo off
REM ORCA MicroK8s Setup - Simplified Windows Batch Script
REM This script sets up WSL2 and Ubuntu, then runs the deployment

setlocal enabledelayedexpansion

echo.
echo ====================================
echo ORCA MicroK8s Setup - Windows Helper
echo ====================================
echo.

REM Check if WSL is installed
echo Checking WSL2 status...
wsl --list --verbose >nul 2>&1
if errorlevel 1 (
    echo.
    echo WSL2 not found. Installing...
    echo This requires Administrator privileges.
    echo.
    powershell -NoProfile -ExecutionPolicy Bypass -Command ^
        "Start-Process powershell -ArgumentList '-NoProfile -ExecutionPolicy Bypass -Command \"dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart; dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart; wsl --set-default-version 2; wsl --install -d Ubuntu\"' -Verb RunAs -Wait"
    
    echo.
    echo Please restart your computer, then:
    echo   1. Launch Ubuntu from Start menu
    echo   2. Create a user account
    echo   3. Run this script again
    pause
    exit /b
)

REM Check for Ubuntu
echo Checking for Ubuntu distribution...
wsl --list --verbose | findstr /i "ubuntu" >nul
if errorlevel 1 (
    echo Ubuntu not found. Installing...
    wsl --install -d Ubuntu
    pause
    exit /b
)

echo.
echo Ubuntu found. Setting up MicroK8s...
echo.

REM Run setup in WSL Ubuntu
wsl -d Ubuntu bash -c "^
set -e; \
echo '=== Installing MicroK8s ==='; \
sudo snap install core; \
sudo snap install microk8s --classic --channel=1.28/stable; \
sudo usermod -a -G microk8s $USER; \
sudo chown -f -R $USER ~/.kube; \
echo 'Please wait for MicroK8s to be ready...'; \
microk8s status --wait-ready; \
microk8s enable dns hostpath-storage registry gpu; \
echo 'MicroK8s is ready!'; \
"

echo.
echo.
echo ====================================
echo MicroK8s Deployment Phase
echo ====================================
echo.

REM Get repo path
set REPO_PATH=c:\Users\shree\Documents\ORCA

echo Deploying ORCA services to MicroK8s...
echo Repo path: !REPO_PATH!
echo.

REM Convert Windows path to WSL path
for /f "tokens=*" %%A in ('powershell -NoProfile "Write-Host (\'!REPO_PATH!\').ToLower().Replace(\':\', \'\').Replace(\'\\\', \'/\') | ForEach-Object {'/mnt/' + $_}"') do set "WSL_REPO_PATH=%%A"

wsl -d Ubuntu bash -c "^
cd '!WSL_REPO_PATH!'; \
echo '=== Applying Kubernetes Manifests ==='; \
kubectl apply -f k8s/namespace.yaml; \
kubectl apply -f rbac/clusterroles.yaml; \
kubectl -n orca create secret generic neo4j-auth --from-literal=auth='neo4j/OrcaSecure123' --dry-run=client -o yaml ^| kubectl apply -f -; \
echo ''; \
echo '=== Deploying Infrastructure ==='; \
kubectl apply -f k8s/redis.yaml; \
kubectl apply -f k8s/neo4j.yaml; \
kubectl apply -f k8s/prometheus-stack.yaml; \
kubectl apply -f k8s/fluent-bit.yaml; \
kubectl apply -f k8s/ebpf-daemonset.yaml; \
kubectl apply -f k8s/backend.yaml; \
kubectl apply -f k8s/ollama.yaml; \
echo ''; \
echo '=== Deploying Agents ==='; \
kubectl apply -f k8s/incident-generator.yaml; \
kubectl apply -f k8s/metrics-generator.yaml; \
kubectl apply -f k8s/cpu-agent.yaml; \
echo ''; \
echo '=== Waiting for services to start ==='; \
kubectl -n orca wait --for=condition=ready pod -l app=orca-redis --timeout=300s 2>/dev/null || echo 'Redis initializing...'; \
kubectl -n orca wait --for=condition=ready pod -l app=orca-neo4j --timeout=300s 2>/dev/null || echo 'Neo4j initializing...'; \
kubectl -n orca wait --for=condition=ready pod -l app=orca-ollama --timeout=300s 2>/dev/null || echo 'Ollama initializing...'; \
echo '=== Pulling Mistral model into Ollama pod ==='; \
OLLAMA_POD=\$(kubectl -n orca get pods -l app=orca-ollama -o jsonpath='{.items[0].metadata.name}'); \
kubectl -n orca exec \$OLLAMA_POD -- ollama pull mistral || echo 'Failed to pull mistral. You may need to do it manually.'; \
echo ''; \
echo '=== Pod Status ==='; \
kubectl -n orca get pods; \
echo ''; \
echo '=== Services ==='; \
kubectl -n orca get svc \
"

echo.
echo ====================================
echo Setup Complete!
echo ====================================
echo.
echo Access your ORCA services:
echo   Backend:    http://localhost:8000
echo   Neo4j:      bolt://localhost:7687
echo   Redis:      localhost:6379
echo   Prometheus: http://localhost:9090
echo.
echo Next step: Open Ubuntu terminal and run port forwarding:
echo   kubectl -n orca port-forward svc/orca-backend 8000:8000 ^&
echo   kubectl -n orca port-forward svc/orca-redis 6379:6379 ^&
echo.
pause
