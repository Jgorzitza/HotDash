#!/usr/bin/env bash
set -euo pipefail

# Usage: scripts/policy/with-heartbeat.sh <agent> -- <command...>
# Writes heartbeat lines to artifacts/<agent>/<YYYY-MM-DD>/logs/heartbeat.log
# and echoes progress to stdout while the command runs.

if [[ $# -lt 1 ]]; then
  echo "usage: $0 <agent> -- <command...>" >&2
  exit 2
fi

AGENT="$1"; shift || true
if [[ "${1:-}" == "--" ]]; then shift; fi
if [[ $# -lt 1 ]]; then
  echo "no command provided" >&2
  exit 2
fi

DATE=$(date +%F)
OUTDIR="artifacts/${AGENT}/${DATE}/logs"
mkdir -p "$OUTDIR"
LOGFILE="${OUTDIR}/heartbeat.log"
JSONHB="${OUTDIR}/heartbeat.ndjson"

iso() { date -u +%Y-%m-%dT%H:%M:%SZ; }

echo "$(iso) start cmd=$*" | tee -a "$LOGFILE"
printf '{"ts":"%s","event":"start","cmd":"%s"}\n' "$(iso)" "$*" >> "$JSONHB"

"$@" &
CMD_PID=$!

(
  while kill -0 "$CMD_PID" >/dev/null 2>&1; do
    printf '.'
    echo "$(iso) heartbeat pid=${CMD_PID}" >> "$LOGFILE"
    printf '{"ts":"%s","event":"heartbeat","pid":%d,"cmd":"%s"}\n' "$(iso)" "$CMD_PID" "$*" >> "$JSONHB"
    sleep 10
  done
) &
HB_PID=$!

wait "$CMD_PID" 2>/dev/null || STATUS=$?
STATUS=${STATUS:-0}

kill "$HB_PID" >/dev/null 2>&1 || true
echo ""  # newline for the dots
echo "$(iso) end status=${STATUS}" | tee -a "$LOGFILE"
printf '{"ts":"%s","event":"end","status":%d,"cmd":"%s"}\n' "$(iso)" "$STATUS" "$*" >> "$JSONHB"
exit "$STATUS"
