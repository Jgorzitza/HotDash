#!/usr/bin/env bash
# Redeploy helper for LlamaIndex MCP server (user-level systemd)
# - Builds the server (TypeScript -> dist)
# - Restarts the systemd user service
# - Verifies health endpoint

set -euo pipefail

# Resolve repo root and app directory based on this script's location
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
APP_DIR="$REPO_ROOT/apps/llamaindex-mcp-server"
SERVICE_NAME="llamaindex-mcp.service"
PORT="4000"

info() { echo -e "\033[0;34m[INFO]\033[0m $*"; }
ok()   { echo -e "\033[0;32m[OK] \033[0m $*"; }
err()  { echo -e "\033[0;31m[ERR]\033[0m $*"; }

# Preflight checks
command -v node >/dev/null 2>&1 || { err "node not found in PATH"; exit 1; }
command -v npm  >/dev/null 2>&1 || { err "npm not found in PATH"; exit 1; }
command -v systemctl >/dev/null 2>&1 || { err "systemctl not found"; exit 1; }
command -v curl >/dev/null 2>&1 || { err "curl not found"; exit 1; }

if [ ! -d "$APP_DIR" ]; then
  err "App directory not found: $APP_DIR"
  exit 1
fi

info "Building LlamaIndex MCP server (npm run build)"
(
  cd "$APP_DIR"
  npm run build
)
ok "Build complete"

info "Restarting user service: $SERVICE_NAME"
systemctl --user restart "$SERVICE_NAME" || {
  err "Failed to restart service. Is it enabled? Try: systemctl --user enable --now $SERVICE_NAME"
  exit 1
}

# Wait for service to listen on the port and respond to health
info "Waiting for health endpoint on http://localhost:$PORT/health"
ATTEMPTS=20
SLEEP_SECS=0.5
for i in $(seq 1 $ATTEMPTS); do
  if curl -sfm 5 "http://localhost:$PORT/health" >/dev/null 2>&1; then
    ok "Service healthy on attempt $i"
    HEALTH_JSON=$(curl -sfm 5 "http://localhost:$PORT/health" | head -c 400)
    echo "$HEALTH_JSON"
    break
  fi
  sleep "$SLEEP_SECS"
  if [ "$i" -eq "$ATTEMPTS" ]; then
    err "Health check failed after $ATTEMPTS attempts"
    systemctl --user --no-pager --full status "$SERVICE_NAME" || true
    exit 1
  fi
done

ok "Redeploy complete"

