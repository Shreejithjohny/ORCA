# Member A Sprint 3 Execution Checklist

This checklist converts playbook assignments into executable validation steps.

## 1. Apply Infra Layer

```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f rbac/clusterroles.yaml
kubectl apply -f k8s/redis.yaml
kubectl apply -f k8s/neo4j.yaml
kubectl apply -f k8s/prometheus-stack.yaml
kubectl apply -f k8s/fluent-bit.yaml
kubectl apply -f k8s/ebpf-daemonset.yaml
```

## 2. Verify Neo4j Stable Endpoint

Expected in-cluster endpoint: `bolt://orca-neo4j:7687`

```bash
kubectl -n orca get svc orca-neo4j -o wide
kubectl -n orca get pods -l app=orca-neo4j
kubectl -n orca run neo4j-check --rm -it --image=neo4j:5.19-community --restart=Never -- \
  cypher-shell -a bolt://orca-neo4j:7687 -u neo4j -p <password> "RETURN 1"
```

## 3. Verify CALLS Edges Populated

```bash
kubectl -n orca run neo4j-calls-check --rm -it --image=neo4j:5.19-community --restart=Never -- \
  cypher-shell -a bolt://orca-neo4j:7687 -u neo4j -p <password> \
  "MATCH ()-[r:CALLS]->() RETURN count(r) AS calls_edges"
```

Pass condition: `calls_edges > 0` while test workloads generate traffic.

## 4. Verify eBPF -> Redis Netflow Path

```bash
kubectl -n orca get pods -l app=ebpf-tcp-connect
kubectl -n orca exec -it statefulset/orca-redis -- redis-cli XREAD COUNT 5 STREAMS netflows:default:unknown 0
```

If using namespaced/pod-specific stream keys, read with `netflows:<namespace>:<pod>`.

## 5. Verify Fluent Bit -> /ingest/logs

```bash
kubectl -n orca get pods -l app=fluent-bit
kubectl -n orca logs -l app=fluent-bit --tail=100
```

Check backend logs for `/ingest/logs` requests.

## 6. Prepare MicroK8s Snapshot (Sprint 4 Restore)

Run on cluster host (do not commit output):

```bash
microk8s status --wait-ready
sudo tar -czf /var/backups/orca-microk8s-$(date +%F).tgz /var/snap/microk8s/current
```

## 7. Guardrails From Playbook

- Do not use `:latest` images.
- Do not expose Neo4j via NodePort.
- Keep eBPF DaemonSet privileged.
- Do not commit kubeconfig, secrets, or snapshot archives.
- Document any new RBAC role in `rbac/README.md`.
