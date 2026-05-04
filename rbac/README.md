# RBAC Definitions (Member A)

This directory documents all ORCA infrastructure RBAC roles and bindings.

## Service Accounts

- `fluent-bit-sa`
- `ebpf-sa`
- `prometheus-sa`
- `kube-state-metrics-sa`

## ClusterRoles

- `fluent-bit-role`
  - Read-only pod and namespace metadata for Kubernetes log enrichment.

- `ebpf-role`
  - Read-only pod/node/namespace metadata for netflow attribution.

- `prometheus-role`
  - Read access to discovery resources and `/metrics` endpoint scraping.

- `kube-state-metrics-role`
  - Read access to workload/state resources consumed by kube-state-metrics.

## Apply

```bash
kubectl apply -f rbac/clusterroles.yaml
```

## Safety Notes

- Do not use wildcard (`*`) privileges.
- Keep RBAC permissions scoped to read-only unless there is a proven write requirement.
- Any new role must be documented in this file before merge.
