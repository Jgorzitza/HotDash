#!/usr/bin/env bash
set -euo pipefail
if [ "$#" -lt 3 ]; then
  echo "Usage: $0 <agent> -- <command> [args...]" >&2
  exit 2
fi
AGENT="$1"; shift
if [ "${1:-}" != "--" ]; then
  echo "Usage: $0 <agent> -- <command> [args...]" >&2
  exit 2
fi
shift
DATE="$(date -u +%Y-%m-%d)"
ROOT="artifacts/$AGENT/$DATE/heartbeat"
mkdir -p "$ROOT"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
FOREGROUND="$ROOT/foreground-$STAMP.ndjson"
REQ_ID="$(uuidgen 2>/dev/null || cat /proc/sys/kernel/random/uuid)"
start_ts="$(date -u +%FT%TZ)"
{
  echo "{\"type\":\"heartbeat\",\"phase\":\"start\",\"request_id\":\"$REQ_ID\",\"timestamp\":\"$start_ts\",\"cmd\":\"$*\"}"
} | tee -a "$FOREGROUND" >/dev/null
(
  "$@" 2>&1 | while IFS= read -r line; do
    ts="$(date -u +%FT%TZ)"
    printf '{"type":"log","request_id":"%s","timestamp":"%s","message":%s}\n' "$REQ_ID" "$ts" "$(jq -Rs . <<<"$line")" | tee -a "$FOREGROUND" >/dev/null
  done
) && exit_code=0 || exit_code=$?
end_ts="$(date -u +%FT%TZ)"
echo "{\"type\":\"heartbeat\",\"phase\":\"end\",\"request_id\":\"$REQ_ID\",\"timestamp\":\"$end_ts\",\"exit_code\":$exit_code,\"foreground\":\"$FOREGROUND\"}" | tee -a "$FOREGROUND" >/dev/null
exit "$exit_code"
