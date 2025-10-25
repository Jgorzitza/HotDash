#!/bin/sh
set -euo pipefail

cd /opt/langfuse-worker
export PORT="${PORT:-3030}"

exec ./worker/entrypoint.sh node worker/dist/index.js
