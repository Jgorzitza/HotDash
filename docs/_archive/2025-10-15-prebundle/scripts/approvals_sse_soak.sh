#!/usr/bin/env bash
set -euo pipefail
URL="${1:-http://127.0.0.1:3000/app/events}"
duration="${DURATION_SECONDS:-600}"
end=$(( $(date +%s) + duration ))
echo "Soaking SSE at $URL for ${duration}s..."
while [[ $(date +%s) -lt $end ]]; do
  curl -sS --no-buffer "$URL" | head -n 3
  sleep 5
done
echo "Done."
