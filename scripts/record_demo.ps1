param(
  [string]$Out = "demo_outputs\demo_raw.mp4",
  [int]$Duration = 15
)

Write-Host "Recording demo to $Out for $Duration seconds"

if (-not (Get-Command ffmpeg -ErrorAction SilentlyContinue)) {
  Write-Error "ffmpeg is not installed or not in PATH. Install ffmpeg and retry."
  exit 1
}

# Simple Windows screen capture with ffmpeg (may need adjustments for device index)
ffmpeg -y -f gdigrab -framerate 25 -i desktop -t $Duration $Out

Write-Host "Recording complete: $Out"
