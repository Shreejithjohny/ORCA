# MicroK8s Setup Guide for ORCA

This document describes the lightweight recommended MicroK8s setup for Member A and the team.
It is designed for Windows users with WSL2 and Ubuntu.

## Why MicroK8s
- The ORCA playbook requires a MicroK8s/K3s single-node cluster for Member A.
- MicroK8s supports snapshots and a real Linux kernel environment for eBPF.
- This guide uses WSL2 + Ubuntu, which is lighter than a full VM.

## Prerequisites
- Windows 10/11 with WSL2 enabled
- Ubuntu 22.04 (recommended) installed in WSL2
- At least 4 CPU cores and 8GB RAM available for the cluster
- `snapd` and `curl` available inside Ubuntu
- `git` installed on Windows or in WSL2

## Install Ubuntu WSL2
1. Open PowerShell as Administrator.
2. Install Ubuntu if not already installed:

```powershell
wsl --install -d Ubuntu
```

3. Launch Ubuntu from the Start menu.

## Install MicroK8s inside Ubuntu
In the Ubuntu shell:

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl
sudo snap install core
sudo snap install microk8s --classic --channel=1.28/stable
```

## Configure the current user
Add yourself to the MicroK8s group so you can run commands without `sudo`:

```bash
sudo usermod -a -G microk8s "$USER"
sudo chown -f -R "$USER" ~/.kube
newgrp microk8s
```

If needed, close and reopen the Ubuntu shell after this step.

## Enable required addons
Run:

```bash
microk8s status --wait-ready
microk8s enable dns storage prometheus
```

For ORCA, eBPF and the infra stack do not require extra addons beyond these.

## Use `kubectl` with MicroK8s
You can use MicroK8s-provided kubectl directly:

```bash
alias kubectl='microk8s kubectl'
```

To make this permanent, add the alias to `~/.bashrc` or `~/.zshrc`.

## Work with the ORCA repo from WSL2
If your repo is on Windows under `D:\HACKATHONS\orca\ORCA`, access it from Ubuntu with:

```bash
cd /mnt/d/HACKATHONS/orca/ORCA
```

Then apply manifests from the repo directly.

**Pro tip:** For smooth kubectl access without password issues, launch Ubuntu WSL directly from Windows Start menu or via `wsl -d Ubuntu` from PowerShell, then run your kubectl commands directly in the Ubuntu bash shell. This avoids password-piping complications.

## Apply the ORCA manifests
From the repo root in Ubuntu, run these commands in order:

```bash
# Create namespace first
microk8s kubectl apply -f k8s/namespace.yaml

# Create Neo4j auth secret (CRITICAL - must be done before applying neo4j.yaml)
microk8s kubectl -n orca create secret generic neo4j-auth --from-literal=auth='neo4j/<strong-password>'

# Apply remaining manifests
microk8s kubectl apply -f rbac/clusterroles.yaml
microk8s kubectl apply -f k8s/redis.yaml
microk8s kubectl apply -f k8s/neo4j.yaml
microk8s kubectl apply -f k8s/prometheus-stack.yaml
microk8s kubectl apply -f k8s/fluent-bit.yaml
microk8s kubectl apply -f k8s/ebpf-daemonset.yaml
```

**Important:** Replace `<strong-password>` with a secure password. Current validated password for testing: `OrcaSecure123`

## Validate the cluster
Check basic cluster status:

```bash
microk8s kubectl get nodes
microk8s kubectl get pods -A
```

Check the `orca` namespace and services:

```bash
microk8s kubectl -n orca get all
```

## Accessing services from Windows
WSL2 exposes Linux ports to Windows automatically.
If a pod listens on a port, you can usually open it from Windows via `localhost`.
For example, if the frontend or backend is forwarded to `3000` or `8080`, use:

```text
http://localhost:3000
http://localhost:8080
```

If you need explicit port-forwarding for a service:

```bash
microk8s kubectl -n orca port-forward svc/<service-name> 8080:80
```

## Snapshot procedure
When the cluster is ready, create a backup snapshot for the demo:

```bash
microk8s status --wait-ready
sudo tar -czf /var/backups/orca-microk8s-$(date +%F).tgz /var/snap/microk8s/current
```

> Do not commit snapshot files, kubeconfigs, or credentials to git.

## Teammate guidance
- Use the same repo branch and the same `k8s/` and `rbac/` manifests.
- If they are on Windows, this guide is the recommended setup path.
- If they cannot run WSL2, they may use Minikube as a fallback, but MicroK8s is preferred for compliance.
- Keep the current Minikube PR as a safety net; do MicroK8s work in a new branch.

## Notes
- Do not use Docker Desktop Kubernetes for ORCA eBPF workloads.
- This setup is the lightweight MicroK8s path and preserves the playbook requirement.
- If you need to expose additional services, use `microk8s kubectl port-forward` or configure service types carefully.
