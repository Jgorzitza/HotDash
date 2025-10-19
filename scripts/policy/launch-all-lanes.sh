#!/usr/bin/env bash
set -euo pipefail

# Launch continuous runners for all lanes in the background, with Foreground Proof.
# Usage: scripts/policy/launch-all-lanes.sh [lane ...]
# If no lanes provided, launches the full default set.

DATE=$(date +%F)
ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)
RUNNER="$ROOT/scripts/policy/codex-run.mjs"

if [[ ! -f "$RUNNER" ]]; then
  echo "Runner not found: $RUNNER" >&2
  exit 2
fi

LANES=("engineer" "qa" "designer" "product" "analytics" "seo" "ads" "content" "inventory" "data" "integrations" "support" "ai-customer" "ai-knowledge" "devops" "pilot" "manager")

if [[ $# -gt 0 ]]; then
  LANES=("$@")
fi

mkdir -p "$ROOT/artifacts/ops/$DATE"
MANIFEST="$ROOT/artifacts/ops/$DATE/all-lanes-pids.jsonl"
: > "$MANIFEST"

start_lane() {
  local lane="$1"
  local outdir="$ROOT/artifacts/$lane/$DATE/logs"
  mkdir -p "$outdir"
  local stdout_log="$outdir/codex-run.stdout.log"

  echo "[launch] $lane → $stdout_log"
  # Start runner in background; it will write heartbeat via the wrapper
  nohup node "$RUNNER" "$lane" >>"$stdout_log" 2>&1 &
  local pid=$!
  printf '{"ts":"%s","lane":"%s","pid":%d,"stdout":"%s"}\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$lane" "$pid" "$stdout_log" >> "$MANIFEST"
}

for lane in "${LANES[@]}"; do
  start_lane "$lane"
done

echo "Launched ${#LANES[@]} lane(s). PIDs recorded in $MANIFEST"

