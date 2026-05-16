#!/bin/bash
export PATH=$PATH:/snap/bin
microk8s enable dns storage prometheus
cd /mnt/c/Users/shree/Documents/ORCA
microk8s kubectl apply -f k8s/namespace.yaml
microk8s kubectl apply -f rbac/clusterroles.yaml
microk8s kubectl -n orca create secret generic neo4j-auth --from-literal=auth="neo4j/OrcaSecure123" --dry-run=client -o yaml | microk8s kubectl apply -f -
microk8s kubectl apply -f k8s/redis.yaml
microk8s kubectl apply -f k8s/neo4j.yaml
microk8s kubectl apply -f k8s/prometheus-stack.yaml
microk8s kubectl apply -f k8s/fluent-bit.yaml
microk8s kubectl apply -f k8s/ebpf-daemonset.yaml
microk8s kubectl apply -f k8s/backend.yaml
microk8s kubectl apply -f k8s/graph-populator.yaml
microk8s kubectl apply -f k8s/incident-generator.yaml
microk8s kubectl apply -f k8s/metrics-generator.yaml
microk8s kubectl apply -f k8s/cpu-agent.yaml
echo "Deployment applied!"
