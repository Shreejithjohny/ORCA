#!/usr/bin/env bash
set -euo pipefail

# Usage: ./scripts/build_and_push_backend.sh <registry> [tag]
# Example: ./scripts/build_and_push_backend.sh ghcr.io/myorg 1.0.0

REGISTRY=${1:-}
TAG=${2:-latest}

if [ -z "$REGISTRY" ]; then
  echo "Usage: $0 <registry> [tag]" >&2
  exit 1
fi

IMAGE="$REGISTRY/orca-backend:$TAG"

echo "Building backend image $IMAGE"
docker build -f backend/Dockerfile -t "$IMAGE" .

echo "Pushing $IMAGE"
docker push "$IMAGE"

echo "Done. Update k8s/backend.yaml to use image: $IMAGE and apply with kubectl." 
