# ORCA Project Status & Demo Guide

## 📊 Current Status

### What's Ready ✅
- ✅ Full documentation (8 guides)
- ✅ Docker containers (Backend & Frontend)
- ✅ Kubernetes manifests (all services)
- ✅ Automated setup scripts
- ✅ Comprehensive demo guide
- ✅ Troubleshooting reference

### What's NOT Running Yet ❌
- ❌ WSL2 / Ubuntu (not installed)
- ❌ MicroK8s (not running)
- ❌ Backend service (not deployed)
- ❌ Frontend (not deployed)
- ❌ Redis/Neo4j/Prometheus (not deployed)

---

## 🚀 To Run Everything & See the Demo

### Quick Path (Recommended)
Follow these 2 documents in order:

1. **[QUICK_SETUP_MANUAL.md](QUICK_SETUP_MANUAL.md)** ← Step-by-step setup
   - Install WSL2
   - Install Ubuntu
   - Install MicroK8s
   - Deploy all services
   - Setup port forwarding
   
2. **[ORCA_DEMO.md](ORCA_DEMO.md)** ← Test everything
   - Test Backend API
   - Query Neo4j
   - View Redis streams
   - Check Prometheus metrics
   - Access Dashboard
   - Run end-to-end workflow

**Total Time: 30-45 minutes**

---

## 📋 What You'll Get

After following the setup, you'll have:

### Infrastructure ✅
```
✅ Redis        (localhost:6379)  - Data bus
✅ Neo4j        (localhost:7687)  - Graph database
✅ Prometheus   (localhost:9090)  - Metrics
✅ Fluent-bit   (internal)        - Log pipeline
✅ eBPF         (kernel level)    - Network tracing
```

### Application Layer ✅
```
✅ Backend      (localhost:8000)
   - /health/llm
   - /ingest/logs
   - /incident/explain
   - /nlp/explain

✅ Frontend     (localhost:3000)
   - Incident dashboard
   - Service graphs
   - Metrics charts
   - Log viewer
```

---

## 📁 Documentation Guide

| Document | Purpose | Step |
|----------|---------|------|
| **QUICK_SETUP_MANUAL.md** | How to install everything | 1 |
| **ORCA_DEMO.md** | How to test and demo | 2 |
| SETUP_INDEX.md | Navigation guide | Reference |
| SETUP_CHECKLIST.md | Detailed checklist | Reference |
| COMPLETE_SETUP_GUIDE.md | Deep explanations | Reference |
| TROUBLESHOOTING.md | Problem solutions | If issues |

---

## 🎯 Next Steps (Right Now!)

### Option 1: Follow Manual Setup (Recommended First Time)
```
Open: QUICK_SETUP_MANUAL.md
Follow each STEP from 1 to 8
```

### Option 2: Use Automated Script
```powershell
# After installing WSL2 & Ubuntu, run in Ubuntu:
cd /mnt/c/Users/shree/Documents/ORCA
chmod +x setup-microk8s.sh
./setup-microk8s.sh
```

### Option 3: Read Full Guide First
```
Open: SETUP_INDEX.md
Then choose your approach
```

---

## ⏱️ Timeline

| Phase | Time | What Happens |
|-------|------|--------------|
| **Enable WSL2** | 10 min | Windows setup |
| **Install Ubuntu** | 5 min | Download & install |
| **Install MicroK8s** | 10 min | Kubernetes cluster |
| **Deploy Services** | 10 min | All pods start |
| **Port Forwarding** | 2 min | Access from Windows |
| **Verification** | 3 min | Check everything works |
| **Total** | **~40 min** | **Full running system** |

---

## ✅ Success Criteria

After setup, all of these should be true:

```
✅ wsl --list shows Ubuntu
✅ Ubuntu can run 'microk8s status'
✅ kubectl -n orca get pods shows 7+ pods in Running state
✅ curl http://localhost:8000/health/llm returns {"status":"ok"}
✅ redis-cli -p 6379 ping returns PONG
✅ cypher-shell connects to bolt://localhost:7687
✅ http://localhost:9090 loads Prometheus UI
✅ http://localhost:3000 loads dashboard (if frontend deployed)
```

If all above are true → **System is fully operational!** 🎉

---

## 🔍 Quick Health Check Commands

Once setup is done, run these to verify everything:

```bash
# From Ubuntu terminal:
kubectl -n orca get pods              # Should show all Running
kubectl -n orca get svc               # Should show all services
kubectl top pods -n orca              # Should show resource usage
kubectl -n orca get events            # Should show successful operations

# From Windows PowerShell:
curl http://localhost:8000/health/llm  # Test backend
redis-cli -p 6379 ping                 # Test Redis
```

---

## 📞 During Setup

### If something fails:
1. Check **TROUBLESHOOTING.md** (has 15+ solutions)
2. Run diagnostics:
   ```bash
   kubectl -n orca describe pod <pod-name>
   kubectl -n orca logs <pod-name>
   ```
3. Consult **COMPLETE_SETUP_GUIDE.md** for detailed explanations

### Common issues:
- **Pod stuck in Pending**: Run `microk8s enable storage`
- **Can't access from Windows**: Ensure port-forward is running in Ubuntu
- **Service won't start**: Check pod logs with `kubectl logs`

---

## 🎬 Demo Workflow

Once everything is running:

```
1. Send a test log via Backend API
   ↓
2. Verify it appears in Redis stream
   ↓
3. Query Neo4j to see service relationships
   ↓
4. Check Prometheus for metrics
   ↓
5. View incident in dashboard
   ↓
6. Get NLP analysis of incident
```

See **ORCA_DEMO.md** for detailed demo scripts!

---

## 📚 Key Files Structure

```
ORCA/
├── QUICK_SETUP_MANUAL.md     ← Start here!
├── ORCA_DEMO.md              ← Then here!
├── SETUP_INDEX.md            ← Navigation
│
├── setup-microk8s.sh         ← Automated bash
├── setup-microk8s.ps1        ← Automated PowerShell (needs fixing)
├── setup-quick.bat           ← Batch helper
│
├── backend/Dockerfile        ← Backend containerization
├── frontend/Dockerfile       ← Frontend containerization
│
├── k8s/                       ← All K8s manifests
│   ├── namespace.yaml
│   ├── redis.yaml
│   ├── neo4j.yaml
│   ├── prometheus-stack.yaml
│   ├── fluent-bit.yaml
│   ├── ebpf-daemonset.yaml
│   ├── backend.yaml
│   └── ...
│
└── ... (other files)
```

---

## 🎓 What You'll Learn

By following this setup and demo:
- How to set up Kubernetes on Windows
- How to containerize Python/Node applications
- How to deploy infrastructure services (Redis, Neo4j, Prometheus)
- How to use Kubernetes manifests
- How to troubleshoot container/pod issues
- How to build an observability platform

---

## 💡 Pro Tips

1. **Keep multiple terminal windows open**
   - One for kubectl commands
   - One for port-forward
   - One for logs

2. **Use watch command**
   ```bash
   watch kubectl -n orca get pods
   ```

3. **Tail logs**
   ```bash
   kubectl -n orca logs -f deployment/orca-backend
   ```

4. **Test incrementally**
   - Deploy one service
   - Verify it works
   - Move to next

---

## 🆘 Get Help

**Before asking for help:**
1. Read **TROUBLESHOOTING.md** (likely has your issue)
2. Check pod logs (most errors are there)
3. Run diagnostics commands
4. Search documentation

**If still stuck:**
- See **COMPLETE_SETUP_GUIDE.md** Part 8 (Troubleshooting)
- Capture error messages
- Note exact steps you took

---

## 🎉 You're Ready!

Everything you need to get ORCA running is prepared:
- ✅ Documentation complete
- ✅ Dockerfiles ready
- ✅ Kubernetes manifests configured
- ✅ Demo guide comprehensive
- ✅ Troubleshooting included

**👉 Next: Open [QUICK_SETUP_MANUAL.md](QUICK_SETUP_MANUAL.md) and follow the steps!**

Questions? See **SETUP_INDEX.md** for guidance.

Good luck! 🚀
