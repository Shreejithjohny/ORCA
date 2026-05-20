# PowerShell seeder for ORCA ingestion endpoint
param(
  [string]$BaseUrl = "http://localhost:8000"
)

Write-Host "Seeding incidents to $BaseUrl"

$body1 = '{"log":"Disk space critical on node-03","level":"ERROR","kubernetes":{"namespace_name":"production","pod_name":"node-03"}}'
Invoke-RestMethod -Uri "$BaseUrl/ingest/logs" -Method Post -Body $body1 -ContentType 'application/json'
Start-Sleep -Seconds 1

$body2 = '{"log":"Database connection lost","level":"CRITICAL","kubernetes":{"namespace_name":"production","pod_name":"db-master-0"}}'
Invoke-RestMethod -Uri "$BaseUrl/ingest/logs" -Method Post -Body $body2 -ContentType 'application/json'
Start-Sleep -Seconds 1

$body3 = '{"log":"High CPU usage detected (95%)","level":"WARNING","kubernetes":{"namespace_name":"payments","pod_name":"payment-gateway-1"}}'
Invoke-RestMethod -Uri "$BaseUrl/ingest/logs" -Method Post -Body $body3 -ContentType 'application/json'
Start-Sleep -Seconds 1

$body4 = '{"log":"Elevated 5xx rate from upstream","level":"ERROR","kubernetes":{"namespace_name":"api","pod_name":"api-server-2"}}'
Invoke-RestMethod -Uri "$BaseUrl/ingest/logs" -Method Post -Body $body4 -ContentType 'application/json'

Write-Host "Seed complete. Open http://localhost:3000/ or GET http://localhost:8000/api/incidents to verify."
