#!/bin/sh
set -euo pipefail

cd /app
export PORT="${PORT:-3000}"

# Langfuse entrypoint handles database + ClickHouse migrations before booting
exec ./web/entrypoint.sh node ./web/server.js --keepAliveTimeout 110000
