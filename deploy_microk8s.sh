#!/bin/bash
set -e

echo "Creating Neo4j auth secret..."
microk8s kubectl -n orca create secret generic neo4j-auth --from-literal=auth='neo4j/OrcaSecure123' || echo "Secret already exists"

echo "Applying RBAC..."
microk8s kubectl apply -f /mnt/d/HACKATHONS/orca/ORCA/rbac/clusterroles.yaml

echo "Applying Redis..."
microk8s kubectl apply -f /mnt/d/HACKATHONS/orca/ORCA/k8s/redis.yaml

echo "Applying Neo4j..."
microk8s kubectl apply -f /mnt/d/HACKATHONS/orca/ORCA/k8s/neo4j.yaml

echo "Applying Fluent Bit..."
microk8s kubectl apply -f /mnt/d/HACKATHONS/orca/ORCA/k8s/fluent-bit.yaml

echo "Applying eBPF DaemonSet..."
microk8s kubectl apply -f /mnt/d/HACKATHONS/orca/ORCA/k8s/ebpf-daemonset.yaml

echo "All manifests applied successfully!"
