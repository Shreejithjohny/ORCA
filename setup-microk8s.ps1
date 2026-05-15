# ORCA MicroK8s Full Setup - Windows PowerShell Version
# Run as Administrator (not required for WSL commands)
# This script sets up WSL2 + MicroK8s + Full ORCA Stack

param(
    [switch]$SkipWSLSetup,
    [switch]$SkipMicroK8s,
    [string]$UbuntuPath = "Ubuntu-22.04"
)

# Colors
$Green = @{ ForegroundColor = "Green" }
$Yellow = @{ ForegroundColor = "Yellow" }
$Red = @{ ForegroundColor = "Red" }

function Print-Section {
    param([string]$Title)
    Write-Host "`n>>> $Title" @Yellow
}

function Invoke-WSLCommand {
    param(
        [string]$Command,
        [string]$DistroName = "Ubuntu"
    )
    wsl -d $DistroName -e bash -c $Command
}

$ORCA_PASSWORD = "OrcaSecure123"
$RepoPath = (Get-Location).Path

# ============ PART 1: WSL2 CHECK/SETUP ============

if (-not $SkipWSLSetup) {
    Print-Section "PART 1: Checking WSL2 Setup"
    
    # Check WSL version
    $WSLStatus = wsl --list --verbose
    if ($WSLStatus -like "*Ubuntu*") {
        Write-Host "✓ WSL2 with Ubuntu found" @Green
    }
    else {
        Write-Host "Installing WSL2..." @Yellow
        Write-Host "This script requires Administrator privileges for WSL setup." @Red
        
        # Check if running as admin
        if (-not ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
            Write-Host "PLEASE RUN THIS SCRIPT AS ADMINISTRATOR" @Red
            exit 1
        }
        
        Write-Host "Enabling WSL2 features..." @Yellow
        Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Windows-Subsystem-Linux -All -NoRestart
        Enable-WindowsOptionalFeature -Online -FeatureName VirtualMachinePlatform -All -NoRestart
        
        Write-Host "Installing Ubuntu 22.04..." @Yellow
        wsl --install -d Ubuntu-22.04
        
        Write-Host "Please restart your computer and run this script again." @Yellow
        exit 0
    }
}

# ============ PART 2: MICROK8S CHECK/SETUP ============

Print-Section "PART 2: Checking MicroK8s Installation"

$MicroK8sCheck = Invoke-WSLCommand "which microk8s" $UbuntuPath
if ($MicroK8sCheck) {
    Write-Host "✓ MicroK8s already installed" @Green
}
else {
    Write-Host "Installing MicroK8s..." @Yellow
    
    $InstallCommands = @(
        "sudo snap install core",
        "sudo snap install microk8s --classic --channel=1.28/stable",
        "sudo usermod -a -G microk8s `$USER",
        "sudo chown -f -R `$USER ~/.kube"
    )
    
    foreach ($cmd in $InstallCommands) {
        Invoke-WSLCommand $cmd $UbuntuPath
    }
    
    Write-Host "MicroK8s installed. Please run 'newgrp microk8s' in Ubuntu first, then run this script again." @Yellow
    exit 0
}

# Start MicroK8s and enable addons
Print-Section "PART 3: Starting MicroK8s and Enabling Addons"

Invoke-WSLCommand "microk8s status --wait-ready" $UbuntuPath
Write-Host "Enabling addons..." @Yellow
Invoke-WSLCommand "microk8s enable dns storage prometheus || true" $UbuntuPath
Write-Host "✓ MicroK8s is ready" @Green

# ============ PART 4: DEPLOY KUBERNETES STACK ============

Print-Section "PART 4: Deploying Kubernetes Stack"

Write-Host "This will deploy the entire infrastructure to MicroK8s in Ubuntu:" @Yellow
Write-Host "  - Namespace & RBAC" 
Write-Host "  - Redis"
Write-Host "  - Neo4j (Graph DB)"
Write-Host "  - Prometheus"
Write-Host "  - Fluent-bit"
Write-Host "  - eBPF"
Write-Host "  - Backend"
Write-Host "  - Demo services"

# Convert Windows path to WSL path
$WSLRepoPath = "/mnt/" + $RepoPath.Replace(":\", "\").Replace("\", "/").ToLower()

$DeployScript = @"
cd $WSLRepoPath

# Create namespace
kubectl apply -f k8s/namespace.yaml

# Create RBAC
kubectl apply -f rbac/clusterroles.yaml

# Create Neo4j secret
kubectl -n orca create secret generic neo4j-auth --from-literal=auth='neo4j/$ORCA_PASSWORD' --dry-run=client -o yaml | kubectl apply -f -

# Deploy infrastructure
kubectl apply -f k8s/redis.yaml
kubectl apply -f k8s/neo4j.yaml
kubectl apply -f k8s/prometheus-stack.yaml
kubectl apply -f k8s/fluent-bit.yaml
kubectl apply -f k8s/ebpf-daemonset.yaml

# Wait for core services
echo 'Waiting for services to start...'
kubectl -n orca wait --for=condition=ready pod -l app=orca-redis --timeout=300s || true
kubectl -n orca wait --for=condition=ready pod -l app=orca-neo4j --timeout=300s || true

# Deploy backend
kubectl apply -f k8s/backend.yaml

# Deploy optional test services
kubectl apply -f k8s/graph-populator.yaml || true
kubectl apply -f k8s/incident-generator.yaml || true
kubectl apply -f k8s/metrics-generator.yaml || true
kubectl apply -f k8s/cpu-agent.yaml || true

echo 'Deployment complete!'
"@

Invoke-WSLCommand $DeployScript $UbuntuPath

# ============ PART 5: BUILD BACKEND ============

Print-Section "PART 5: Building Backend Docker Image"

# Check if Docker is available on Windows
if (Get-Command docker -ErrorAction SilentlyContinue) {
    Write-Host "Building backend image with Docker..." @Yellow
    docker build -t orca-backend:latest -f backend/Dockerfile .
    Write-Host "✓ Backend image built" @Green
}
else {
    Write-Host "Docker not found on Windows. Build it manually inside Ubuntu:" @Yellow
    Write-Host "  In Ubuntu: cd /mnt/c/Users/shree/Documents/ORCA && docker build -t orca-backend:latest -f backend/Dockerfile ." @Yellow
}

# ============ PART 6: SETUP PORT FORWARDING ============

Print-Section "PART 6: Setting Up Port Forwarding"

$PortForwardScript = @"
echo 'Starting port-forward daemons...'
nohup kubectl -n orca port-forward svc/orca-backend 8000:8000 > /tmp/pf-backend.log 2>&1 &
nohup kubectl -n orca port-forward svc/orca-redis 6379:6379 > /tmp/pf-redis.log 2>&1 &
nohup kubectl -n orca port-forward svc/orca-neo4j 7687:7687 > /tmp/pf-neo4j.log 2>&1 &
nohup kubectl -n orca port-forward svc/prometheus 9090:9090 > /tmp/pf-prom.log 2>&1 &
sleep 2
echo 'Port forwarding ready!'
"@

Invoke-WSLCommand $PortForwardScript $UbuntuPath
Write-Host "✓ Port forwarding configured" @Green

# ============ PART 7: VALIDATION ============

Print-Section "PART 7: Validation"

$CheckScript = @"
echo 'Pods in orca namespace:'
kubectl -n orca get pods

echo ''
echo 'Services:'
kubectl -n orca get svc

echo ''
echo 'Testing connectivity...'
kubectl -n orca run neo4j-check --rm -it --image=neo4j:5.19-community --restart=Never -- cypher-shell -a bolt://orca-neo4j:7687 -u neo4j -p $ORCA_PASSWORD 'RETURN 1' 2>/dev/null && echo '✓ Neo4j OK' || echo '⚠ Neo4j still initializing'
"@

Invoke-WSLCommand $CheckScript $UbuntuPath

# ============ SUMMARY ============

Print-Section "SETUP COMPLETE!"

Write-Host "Your ORCA platform is ready!`n" @Green

Write-Host "Access from Windows:" @Yellow
Write-Host "  Backend:    http://localhost:8000"
Write-Host "  Neo4j:      bolt://localhost:7687 (user: neo4j, password: $ORCA_PASSWORD)"
Write-Host "  Redis:      localhost:6379"
Write-Host "  Prometheus: http://localhost:9090"
Write-Host ""

Write-Host "Frontend setup (choose one):" @Yellow
Write-Host "  Option 1 (Dev mode):"
Write-Host "    cd frontend && npm install && npm run dev"
Write-Host ""
Write-Host "  Option 2 (Containerized in K8s):"
Write-Host "    docker build -t orca-frontend:latest -f frontend/Dockerfile ."
Write-Host "    Then apply frontend K8s manifest (see COMPLETE_SETUP_GUIDE.md)"
Write-Host ""

Write-Host "Common commands:" @Yellow
Write-Host "  View pods:      wsl -d $UbuntuPath -- kubectl -n orca get pods"
Write-Host "  View logs:      wsl -d $UbuntuPath -- kubectl -n orca logs POD_NAME"
Write-Host "  View services:  wsl -d $UbuntuPath -- kubectl -n orca get svc"
Write-Host ""

Write-Host "For detailed guide, see: COMPLETE_SETUP_GUIDE.md"
