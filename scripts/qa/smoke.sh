#!/usr/bin/env bash
set -euo pipefail

# Simple SSR smoke: starts the built server, checks / and /approvals, then stops.
# Usage: scripts/qa/smoke.sh [port]

PORT=${1:-3456}
OUTDIR="artifacts/qa/$(date +%F)/app_usability"
mkdir -p "$OUTDIR"

echo "[smoke] starting server on :$PORT" | tee -a "$OUTDIR/smoke.log"
PORT=$PORT nohup npm run -s start >"$OUTDIR/server.log" 2>&1 & echo $! > "$OUTDIR/server.pid"

PID=$(cat "$OUTDIR/server.pid")
sleep 2

echo "SMOKE $(date -Is)" | tee -a "$OUTDIR/smoke.log"
echo "GET /" | tee -a "$OUTDIR/smoke.log"
curl -sS -o /dev/null -w "HTTP:%{http_code}\n" "http://127.0.0.1:$PORT/" | tee -a "$OUTDIR/smoke.log" || true
echo "GET /approvals" | tee -a "$OUTDIR/smoke.log"
curl -sS -o /dev/null -w "HTTP:%{http_code}\n" "http://127.0.0.1:$PORT/approvals" | tee -a "$OUTDIR/smoke.log" || true

kill "$PID" >/dev/null 2>&1 || true
sleep 1

echo "[smoke] logs saved to $OUTDIR" | tee -a "$OUTDIR/smoke.log"

