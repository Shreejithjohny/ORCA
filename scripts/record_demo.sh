#!/usr/bin/env bash
set -euo pipefail

# Record screen demo using ffmpeg (macOS/Linux)
# Example (record full screen): ./scripts/record_demo.sh demo_outputs/demo_raw.mp4 10
# Requires: ffmpeg installed and accessible in PATH

OUT=${1:-demo_outputs/demo_raw.mp4}
DURATION=${2:-15}

if ! command -v ffmpeg >/dev/null 2>&1; then
  echo "ffmpeg not found. Install ffmpeg to record video." >&2
  exit 1
fi

echo "Recording screen for $DURATION seconds to $OUT"

# Linux (X11) example - change :0.0 and screen size as needed
if [[ "$OSTYPE" == "linux-gnu" ]]; then
  ffmpeg -y -video_size 1280x720 -framerate 25 -f x11grab -i :0.0 -t "$DURATION" "$OUT"
  exit 0
fi

# macOS example (use the default screen capture device)
if [[ "$OSTYPE" == "darwin" ]]; then
  ffmpeg -y -f avfoundation -framerate 30 -i "1:none" -t "$DURATION" "$OUT"
  exit 0
fi

echo "Unsupported OS for this script. Use OBS or another screen recorder." >&2
exit 1
