# ORCA MicroK8s Setup - Documentation Index

**Start here!** 👇

---

## 🚀 Getting Started (Pick Your Path)

### **Path 1: I'm in a hurry**
1. Open → [SETUP_READY.md](SETUP_READY.md)
2. Follow "Quick Start → Approach 1 (Automated Bash Script)"
3. Done in ~10 minutes!

### **Path 2: I like checklists**
1. Open → [SETUP_CHECKLIST.md](SETUP_CHECKLIST.md)
2. Go through section by section
3. Check off items as you complete them
4. Takes ~20 minutes, very clear

### **Path 3: I want to understand everything**
1. Open → [COMPLETE_SETUP_GUIDE.md](COMPLETE_SETUP_GUIDE.md)
2. Read through all 8 parts
3. Execute each step carefully
4. Takes ~30 minutes, very thorough

---

## 📚 Documentation Overview

| Document | Purpose | Best For |
|----------|---------|----------|
| **SETUP_READY.md** | High-level overview & quick start | New users, quick reference |
| **SETUP_CHECKLIST.md** | Step-by-step with all commands | Following along, not skipping |
| **COMPLETE_SETUP_GUIDE.md** | Detailed explanations + context | Understanding, learning |
| **TROUBLESHOOTING.md** | Solutions for 15+ common issues | When something fails |
| **MICROK8S_SETUP.md** | Original MicroK8s guide | Reference, details |

---

## 🤖 Automation Scripts

### Bash Script (Recommended for Ubuntu)
```bash
# Inside Ubuntu WSL2
cd /your/repo/path
chmod +x setup-microk8s.sh
./setup-microk8s.sh
```
**What it does:**
- ✅ Installs/configures MicroK8s
- ✅ Deploys all Kubernetes manifests
- ✅ Builds backend image
- ✅ Starts port forwarding
- ✅ Validates everything

---

### PowerShell Script (For Windows Users)
```powershell
# Run as Administrator
cd c:\Users\shree\Documents\ORCA
powershell -ExecutionPolicy Bypass -File setup-microk8s.ps1
```
**What it does:**
- ✅ Checks/installs WSL2 if needed
- ✅ Installs MicroK8s via WSL commands
- ✅ Deploys all manifests
- ✅ Builds Docker images
- ✅ Sets up port forwarding

---

## 🐳 Docker Files

These containerize your services:

| File | Contains | Purpose |
|------|----------|---------|
| **backend/Dockerfile** | FastAPI app | Runs backend in Kubernetes |
| **frontend/Dockerfile** | Next.js app | Runs frontend in Kubernetes |

Both are already created and ready to use.

---

## 🎯 Quick Decision Tree

```
START HERE
    ↓
Do you have WSL2 + Ubuntu?
    ├─ YES → Run setup-microk8s.sh (fastest)
    ├─ NO → Run setup-microk8s.ps1 (handles setup)
    └─ NOT SURE → Read SETUP_READY.md first

Setup failed?
    ↓
Check TROUBLESHOOTING.md
    ↓
Issue not found?
    ↓
Try COMPLETE_SETUP_GUIDE.md
    ↓
Still stuck?
    ↓
Run diagnostics:
  kubectl -n orca get all
  kubectl -n orca describe pod <pod-name>
  kubectl -n orca logs <pod-name>
```

---

## 📋 Setup Phases Overview

### **Phase 1: Prerequisites** (5 min)
- WSL2 + Ubuntu 22.04
- 4+ CPU cores, 8GB+ RAM

### **Phase 2: MicroK8s Installation** (5 min)
- Install snapd
- Install MicroK8s 1.28
- Enable addons (DNS, storage, prometheus)

### **Phase 3: Infrastructure** (3 min)
- Create Kubernetes namespace
- Apply RBAC rules
- Create Neo4j secret

### **Phase 4: Core Services** (5 min)
- Deploy Redis (data bus)
- Deploy Neo4j (graph DB)
- Deploy Prometheus (metrics)

### **Phase 5: Observability** (2 min)
- Deploy Fluent-bit (logs)
- Deploy eBPF (network tracing)

### **Phase 6: Backend** (2 min)
- Build backend Docker image
- Deploy backend to Kubernetes

### **Phase 7: Frontend** (3 min - optional)
- Option A: Run dev mode on Windows
- Option B: Build container and deploy to K8s

### **Phase 8: Verification** (3 min)
- Check all pods running
- Test connections
- Create snapshot

**Total Time: 25-35 minutes**

---

## ✅ After Setup - Verification

Once everything is running, you should be able to access:

```
✅ Backend:    http://localhost:8000
✅ Frontend:   http://localhost:3000  
✅ Neo4j:      bolt://localhost:7687 (neo4j/OrcaSecure123)
✅ Redis:      localhost:6379
✅ Prometheus: http://localhost:9090
```

Test with:
```bash
# Backend health
curl http://localhost:8000/health/llm

# Backend ingestion
curl -X POST http://localhost:8000/ingest/logs \
  -H "Content-Type: application/json" \
  -d '{"test":"data"}'

# Neo4j connection
cypher-shell -a bolt://localhost:7687 -u neo4j -p OrcaSecure123 "RETURN 1"

# Redis connection  
redis-cli -p 6379 ping
```

---

## 🛠️ Useful Commands (Keep Handy)

```bash
# Monitor everything
kubectl -n orca get pods -w

# View all services
kubectl -n orca get svc

# Get pod logs
kubectl -n orca logs -f deployment/orca-backend

# Check resource usage
kubectl top pods -n orca

# Describe a pod (debugging)
kubectl -n orca describe pod <pod-name>

# Port forward a service
kubectl -n orca port-forward svc/orca-backend 8000:8000

# Execute command in pod
kubectl -n orca exec -it <pod-name> -- bash

# Check MicroK8s status
microk8s status

# Restart MicroK8s
microk8s stop && microk8s start

# View all resources
kubectl -n orca get all

# Delete namespace (reset)
kubectl delete namespace orca
```

---

## 🚨 Common Issues (Quick Fixes)

| Issue | Quick Fix |
|-------|-----------|
| Pod stuck in Pending | `microk8s enable storage` |
| Image not found | Rebuild: `docker build -t orca-backend:latest .` |
| Can't connect from Windows | Check port-forward: `ps aux \| grep port-forward` |
| Neo4j won't start | Check secret: `kubectl -n orca get secret neo4j-auth` |
| Services can't communicate | Test DNS: `kubectl -n orca run test --image=busybox -- nslookup orca-redis` |

**For more**, see [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

---

## 📞 File Organization

```
ORCA/
├── SETUP_READY.md                ← START HERE for quick overview
├── SETUP_CHECKLIST.md            ← Use this to setup step-by-step
├── SETUP_INDEX.md                ← You are here
├── COMPLETE_SETUP_GUIDE.md       ← Detailed explanations
├── TROUBLESHOOTING.md            ← When things break
├── MICROK8S_SETUP.md             ← Original MicroK8s guide
│
├── setup-microk8s.sh             ← Automated bash script
├── setup-microk8s.ps1            ← Automated PowerShell script
│
├── backend/
│   └── Dockerfile                ← Backend containerization
├── frontend/
│   └── Dockerfile                ← Frontend containerization
│
├── k8s/
│   ├── namespace.yaml
│   ├── redis.yaml
│   ├── neo4j.yaml
│   ├── prometheus-stack.yaml
│   ├── fluent-bit.yaml
│   ├── ebpf-daemonset.yaml
│   ├── backend.yaml
│   └── ... (other manifests)
│
└── services/
    ├── backend/
    │   └── requirements.txt
    └── nlp/
        └── chain.py
```

---

## 🎓 Learning Resources

### If you want to understand MicroK8s better:
- See: **MICROK8S_SETUP.md** (original guide)
- Or: https://microk8s.io/docs

### If you want to understand Kubernetes:
- Pods: Groups of containers
- Services: Network abstraction
- Deployments: Manage pod replicas
- StatefulSets: For stateful apps (like Redis, Neo4j)
- ConfigMaps: Configuration storage
- Secrets: Sensitive data storage

### If you want to understand ORCA architecture:
- See: **README.md** in repo root
- Check: **k8s/README.md** for infrastructure details

---

## 🎯 Success Criteria

After setup, you should have:

✅ MicroK8s cluster running  
✅ All pods in `Running` state  
✅ Services accessible via port-forward  
✅ Backend responding to HTTP requests  
✅ Frontend dashboard loading  
✅ Neo4j accessible via bolt  
✅ Redis stream working  
✅ Logs being ingested  

If all above are true → **Setup successful!** 🎉

---

## 🚀 Next Steps After Setup

1. **Explore the dashboard** - Frontend at http://localhost:3000
2. **Check the backend** - Test endpoints in backend API
3. **Verify Neo4j** - Query the graph database
4. **Monitor metrics** - Prometheus at http://localhost:9090
5. **Create cluster snapshot** - For backup (see COMPLETE_SETUP_GUIDE.md Part 8)

---

## 💡 Pro Tips

1. **Keep terminal windows open** - One for kubectl, one for port-forward
2. **Use watch command** - `kubectl -n orca get pods -w`
3. **Tail logs** - `kubectl -n orca logs -f deployment/orca-backend`
4. **Save commands** - Create aliases in ~/.bashrc
5. **Monitor resources** - `watch kubectl top pods -n orca`

---

## 🤝 Need Help?

1. **Check TROUBLESHOOTING.md first** - Likely has your issue
2. **Collect diagnostics** - Run all the `kubectl` commands
3. **Review your logs** - Most errors are in pod logs
4. **Ask yourself** - Is my service really running? Are dependencies available?

---

## 📞 Contact / Issues

If something doesn't work:

1. Note which step failed
2. Get the error message
3. Search TROUBLESHOOTING.md
4. If not found, increase log verbosity and try again

---

**Ready to start? Pick your path at the top of this document!** ⬆️

