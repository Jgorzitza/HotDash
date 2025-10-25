#!/bin/sh
set -euo pipefail

# LiteLLM expects REDIS_HOST/PORT/PASSWORD when using redis-based caches.
# The platform provides a REDIS_URL secret (redis://:pass@host:port/0). Parse it
# once on boot so both exact + semantic caching work without extra templating.
if [ -n "${REDIS_URL:-}" ]; then
  eval "$(python3 <<'PY'
import os
import urllib.parse as urlparse

redis_url = os.environ.get("REDIS_URL")
if not redis_url:
    raise SystemExit(0)
parsed = urlparse.urlparse(redis_url)
if parsed.hostname:
    print(f'export REDIS_HOST="{parsed.hostname}"')
if parsed.port:
    print(f'export REDIS_PORT="{parsed.port}"')
if parsed.password:
    print(f'export REDIS_PASSWORD="{parsed.password}"')
if parsed.scheme == "rediss":
    print('export REDIS_TLS_ENABLED="1"')
PY
  )"
fi

# Default configuration location (can be overridden via env)
LITELLM_CONFIG_PATH="${LITELLM_CONFIG:-/app/config/litellm.config.yaml}"
if [ ! -f "$LITELLM_CONFIG_PATH" ]; then
  echo "LiteLLM config not found at $LITELLM_CONFIG_PATH" >&2
  exit 1
fi

PORT="${PORT:-4000}"
WORKERS="${LITELLM_WORKERS:-2}"
TIMEOUT="${LITELLM_REQUEST_TIMEOUT:-600}"

# Run via gunicorn for better concurrency once deployed on Fly Machines.
exec litellm \
  --config "$LITELLM_CONFIG_PATH" \
  --host 0.0.0.0 \
  --port "$PORT" \
  --run_gunicorn \
  --num_workers "$WORKERS" \
  --request_timeout "$TIMEOUT"
