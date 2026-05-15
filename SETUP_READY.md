# ORCA MicroK8s Setup - Ready to Deploy! 🚀

## What's Been Prepared For You

I've created a complete, production-ready setup for your ORCA project. Everything is now in place to run:
- **Backend** (FastAPI on port 8000)
- **Frontend** (Next.js on port 3000)
- **Infrastructure** (Redis, Neo4j, Prometheus, Fluent-bit, eBPF)
- **Full observability stack** in MicroK8s

## Files Created

### 📋 Documentation
| File | Purpose |
|------|---------|
| **COMPLETE_SETUP_GUIDE.md** | Detailed step-by-step guide for all 8 setup phases |
| **SETUP_CHECKLIST.md** | Quick reference with all commands in checklist format |
| **TROUBLESHOOTING.md** | Solutions for 15+ common issues |

### 🐳 Docker Files
| File | Purpose |
|------|---------|
| **backend/Dockerfile** | Containerizes FastAPI backend |
| **frontend/Dockerfile** | Multi-stage build for Next.js frontend |

### 🤖 Automation Scripts
| File | Purpose |
|------|---------|
| **setup-microk8s.sh** | Fully automated bash setup (run in Ubuntu) |
| **setup-microk8s.ps1** | PowerShell setup for Windows users |

---

## 🚀 Quick Start (3 Approaches)

### **APPROACH 1: Fastest - Automated Bash Script (Recommended)**

If you have WSL2 + Ubuntu already:

```bash
# Inside Ubuntu WSL2 shell
cd /mnt/d/HACKATHONS/orca/ORCA  # or your path
chmod +x setup-microk8s.sh
./setup-microk8s.sh
```

This will:
- ✅ Install/configure MicroK8s
- ✅ Deploy all Kubernetes manifests
- ✅ Build backend Docker image
- ✅ Setup port forwarding
- ✅ Verify everything
- ⏱️ Takes ~5-10 minutes

---

### **APPROACH 2: PowerShell from Windows**

Run from Windows PowerShell (as Administrator):

```powershell
cd c:\Users\shree\Documents\ORCA
powershell -ExecutionPolicy Bypass -File setup-microk8s.ps1
```

This will:
- ✅ Check/setup WSL2 if needed
- ✅ Install MicroK8s
- ✅ Deploy everything via WSL commands
- ✅ Build backend in Docker (if available)
- ⏱️ Takes ~10-15 minutes

---

### **APPROACH 3: Manual but Clear - Follow the Guide**

For complete control and understanding:

1. Open **SETUP_CHECKLIST.md**
2. Work through each section step-by-step
3. Check off items as you complete them
4. Use **TROUBLESHOOTING.md** if anything fails

---

## 📋 What Gets Deployed

### **Infrastructure** (all automatically managed)
```
✅ Redis        - Data bus (netflows, logs)
✅ Neo4j        - Graph database (7687)
✅ Prometheus   - Metrics collection (9090)
✅ Fluent-bit   - Log pipeline
✅ eBPF         - Kernel-level network tracing
```

### **Application Layer**
```
✅ Backend      - FastAPI (8000)
   - /health/llm
   - /ingest/logs
   - /incident/explain
   - /nlp/explain

✅ Frontend     - Next.js (3000)
   - Full dashboard UI
   - Real-time incident feed
   - Metrics visualization
   - Graph exploration
```

---

## 🎯 After Setup - What to Expect

### **Services Accessible**
```
Backend:    http://localhost:8000
Frontend:   http://localhost:3000
Neo4j:      bolt://localhost:7687  (user: neo4j, pass: OrcaSecure123)
Redis:      localhost:6379
Prometheus: http://localhost:9090
```

### **Test the Backend**
```bash
# Health check
curl http://localhost:8000/health/llm

# Send a test incident
curl -X POST http://localhost:8000/incident/explain \
  -H "Content-Type: application/json" \
  -d '{"severity":"critical","message":"Test incident"}'
```

### **Frontend**
```
Visit: http://localhost:3000
- View incidents in real-time
- Explore dependency graph
- Check metrics
- Review logs
```

---

## 🔧 If Something Goes Wrong

### **I'm confused where to start**
→ Read **SETUP_CHECKLIST.md** - it's organized by section

### **Setup script failed at step X**
→ Check **TROUBLESHOOTING.md** for that specific issue

### **A specific pod won't start**
```bash
# Get detailed error
kubectl -n orca describe pod <pod-name>

# Check logs
kubectl -n orca logs <pod-name> --tail=100

# Search troubleshooting guide
grep -i "pod not starting" TROUBLESHOOTING.md
```

### **Services can't communicate**
```bash
# Test DNS
kubectl -n orca run test --rm -it --image=busybox --restart=Never -- nslookup orca-redis

# Test network
kubectl -n orca run curl --rm -it --image=curlimages/curl --restart=Never -- \
  curl http://orca-backend:8000/health/llm
```

---

## 💡 Pro Tips

### **Keep Port Forwards Running**
The setup scripts start these as background jobs. To verify:
```bash
ps aux | grep port-forward
```

### **Watch Pods Deploy**
```bash
kubectl -n orca get pods -w
```

### **Stream Logs**
```bash
kubectl -n orca logs -f deployment/orca-backend
```

### **Restart Everything Clean**
```bash
kubectl delete namespace orca
kubectl apply -f k8s/namespace.yaml
# Then reapply manifests
```

---

## 📚 Document Guide

Use these documents in this order:

1. **SETUP_CHECKLIST.md** - First time setup
   - Go through section by section
   - Check off items
   - Takes 15-20 minutes

2. **TROUBLESHOOTING.md** - If something fails
   - Find your issue
   - Apply the solution
   - Re-run the failed step

3. **COMPLETE_SETUP_GUIDE.md** - Deep dive reference
   - Understand what each component does
   - Why certain steps matter
   - Detailed explanations

---

## 🎓 Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Windows 10/11                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │             WSL2 Ubuntu 22.04                    │  │
│  │  ┌────────────────────────────────────────────┐  │  │
│  │  │         MicroK8s 1.28                      │  │  │
│  │  │  ┌──────────────────────────────────────┐  │  │  │
│  │  │  │      ORCA Kubernetes Namespace       │  │  │  │
│  │  │  │                                      │  │  │  │
│  │  │  │  ┌─────────────────────────────────┐ │  │  │  │
│  │  │  │  │   Application Layer             │ │  │  │  │
│  │  │  │  │  ┌──────────┐  ┌───────────┐  │ │  │  │  │
│  │  │  │  │  │ Backend  │  │ Frontend  │  │ │  │  │  │
│  │  │  │  │  │ (8000)   │  │ (3000)    │  │ │  │  │  │
│  │  │  │  │  └──────────┘  └───────────┘  │ │  │  │  │
│  │  │  │  └─────────────────────────────────┘ │  │  │  │
│  │  │  │                                      │  │  │  │
│  │  │  │  ┌─────────────────────────────────┐ │  │  │  │
│  │  │  │  │   Infrastructure Layer          │ │  │  │  │
│  │  │  │  │  ┌──────────┐  ┌────────────┐  │ │  │  │  │
│  │  │  │  │  │  Redis   │  │   Neo4j    │  │ │  │  │  │
│  │  │  │  │  │ (6379)   │  │  (7687)    │  │ │  │  │  │
│  │  │  │  │  └──────────┘  └────────────┘  │ │  │  │  │
│  │  │  │  │  ┌──────────────────────────┐  │ │  │  │  │
│  │  │  │  │  │   Prometheus (9090)      │  │ │  │  │  │
│  │  │  │  │  │   Fluent-bit, eBPF       │  │ │  │  │  │
│  │  │  │  │  └──────────────────────────┘  │ │  │  │  │
│  │  │  │  └─────────────────────────────────┘ │  │  │  │
│  │  │  └────────────────────────────────────────┘  │  │  │
│  │  └──────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Port-Forward Bridge (localhost:*)              │   │
│  │  • 8000 → Backend  • 6379 → Redis               │   │
│  │  • 3000 → Frontend • 7687 → Neo4j               │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## ✅ Next Steps

### **Right Now (Pick One)**
1. **Fast path**: Run `./setup-microk8s.sh` in Ubuntu
2. **Windows path**: Run `setup-microk8s.ps1` in PowerShell as admin
3. **Manual path**: Follow `SETUP_CHECKLIST.md` step-by-step

### **After Setup** (5 minutes)
- Access backend: `curl http://localhost:8000/health/llm`
- Open frontend: `http://localhost:3000`
- Verify Neo4j: Check connection in `TROUBLESHOOTING.md`

### **For Production** (Optional)
- Create cluster snapshot: See `COMPLETE_SETUP_GUIDE.md` Part 8
- Setup monitoring: Prometheus is already deployed at `http://localhost:9090`
- Configure logging: Fluent-bit is already forwarding logs to `/ingest/logs`

---

## 📞 Quick Reference

### Common Commands
```bash
# Check all pods
kubectl -n orca get pods

# View pod logs
kubectl -n orca logs <pod-name>

# Port forward a service
kubectl -n orca port-forward svc/<service> 8000:8000

# Execute in pod
kubectl -n orca exec -it <pod-name> -- bash

# Watch metrics
kubectl top pods -n orca
```

### Troubleshooting Priority
1. Check pod status: `kubectl -n orca get pods`
2. Check logs: `kubectl -n orca logs <pod-name>`
3. Check events: `kubectl -n orca get events`
4. Reference: `TROUBLESHOOTING.md`

---

## 🎉 You're All Set!

Everything needed for a complete MicroK8s deployment of ORCA is ready. Choose your setup method above and you'll have a fully functional observability platform running in ~15 minutes.

**Questions?** Check **TROUBLESHOOTING.md** or **COMPLETE_SETUP_GUIDE.md**

Good luck! 🚀
