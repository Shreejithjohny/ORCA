# ORCA Infrastructure Manifests (Member A)

This directory contains Kubernetes manifests for the infrastructure/platform layer:

- Namespace policies (`namespace.yaml`): namespace, `ResourceQuota`, and `LimitRange`
- Redis Streams data bus (`redis.yaml`) using `redis:7-alpine`
- Neo4j graph DB (`neo4j.yaml`) with stable in-cluster endpoint `bolt://orca-neo4j:7687`
- Log pipeline (`fluent-bit.yaml`) from node logs to backend ingest
- eBPF DaemonSet (`ebpf-daemonset.yaml`) for TCP connect tracing path
- Monitoring stack (`prometheus-stack.yaml`): Prometheus, node-exporter, kube-state-metrics
- Neo4j schema DDL (`neo4j_schema.cypher`)

## Apply Order

```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f rbac/clusterroles.yaml
kubectl apply -f k8s/redis.yaml
kubectl apply -f k8s/neo4j.yaml
kubectl apply -f k8s/prometheus-stack.yaml
kubectl apply -f k8s/fluent-bit.yaml
kubectl apply -f k8s/ebpf-daemonset.yaml
```

## Neo4j Auth Secret

Create once before applying `neo4j.yaml`:

```bash
kubectl -n orca create secret generic neo4j-auth --from-literal=auth='neo4j/<strong-password>'
```

## Validate Stable Neo4j Endpoint

```bash
kubectl -n orca get svc orca-neo4j
kubectl -n orca run neo4j-check --rm -it --image=neo4j:5.19-community --restart=Never -- \
  cypher-shell -a bolt://orca-neo4j:7687 -u neo4j -p <strong-password> "RETURN 1"
```

## Sprint 4 Snapshot Procedure (MicroK8s)

This should be run on the cluster host, not committed artifacts:

```bash
microk8s status --wait-ready
sudo tar -czf /var/backups/orca-microk8s-$(date +%F).tgz /var/snap/microk8s/current
```

Do not commit kubeconfig files, cluster credentials, or snapshot archives to git.
