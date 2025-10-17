#!/usr/bin/env bash
set -euo pipefail

ROOT=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
HEARTBEAT_FILE="$ROOT/reports/manager/heartbeat.json"
CONFIG="$ROOT/manager.config.json"
TIMEOUT_SEC=360

if [[ -f "$CONFIG" ]]; then
  idle=$(jq -r '.idle_timeout_sec // empty' "$CONFIG" 2>/dev/null || echo "")
  if [[ -n "$idle" && "$idle" =~ ^[0-9]+$ && "$idle" -gt 0 ]]; then
    # Allow a 60s grace buffer beyond idle timeout.
    TIMEOUT_SEC=$(( idle + 60 ))
  fi
fi

if [[ ! -f "$HEARTBEAT_FILE" ]]; then
  echo "Heartbeat file missing: $HEARTBEAT_FILE" >&2
  echo '{"type":"plan_update","ts":"'"$(date -u +%FT%TZ)"'","task_id":"manager","msg":"reslice_stalled"}'
  exit 1
fi

last_ts=$(jq -r '.ts // empty' "$HEARTBEAT_FILE" 2>/dev/null || echo "")
if [[ -z "$last_ts" ]]; then
  echo "Heartbeat timestamp missing" >&2
  echo '{"type":"plan_update","ts":"'"$(date -u +%FT%TZ)"'","task_id":"manager","msg":"reslice_stalled"}'
  exit 1
fi

last_epoch=$(date -u -d "$last_ts" +%s 2>/dev/null || echo 0)
now_epoch=$(date -u +%s)

if (( last_epoch == 0 )); then
  echo "Invalid heartbeat timestamp" >&2
  echo '{"type":"plan_update","ts":"'"$(date -u +%FT%TZ)"'","task_id":"manager","msg":"reslice_stalled"}'
  exit 1
fi

age=$(( now_epoch - last_epoch ))
if (( age > TIMEOUT_SEC )); then
  echo "Heartbeat stale: $age seconds (threshold $TIMEOUT_SEC)" >&2
  echo '{"type":"plan_update","ts":"'"$(date -u +%FT%TZ)"'","task_id":"manager","msg":"reslice_stalled"}'
  exit 1
fi

echo "Heartbeat ok: $age seconds old (threshold $TIMEOUT_SEC)"
