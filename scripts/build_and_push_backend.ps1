param(
  [Parameter(Mandatory=$true)][string]$Registry,
  [string]$Tag = "latest"
)

$image = "$Registry/orca-backend:$Tag"
Write-Host "Building backend image $image"
docker build -f backend/Dockerfile -t $image .

Write-Host "Pushing $image"
docker push $image

Write-Host "Done. Update k8s/backend.yaml to use image: $image and apply with kubectl." 
