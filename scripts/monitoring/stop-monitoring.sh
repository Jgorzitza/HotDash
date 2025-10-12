#!/bin/bash

# Stop Health Monitoring Daemon
# Run with: ./scripts/monitoring/stop-monitoring.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
PID_FILE="$PROJECT_ROOT/logs/monitoring/health-daemon.pid"

if [ ! -f "$PID_FILE" ]; then
  echo "Health monitoring daemon is not running (no PID file found)"
  exit 1
fi

PID=$(cat "$PID_FILE")

if ! ps -p "$PID" > /dev/null 2>&1; then
  echo "Health monitoring daemon is not running (PID $PID not found)"
  rm "$PID_FILE"
  exit 1
fi

echo "Stopping health monitoring daemon (PID: $PID)..."
kill "$PID"

# Wait for process to stop
for i in {1..10}; do
  if ! ps -p "$PID" > /dev/null 2>&1; then
    echo "Health monitoring daemon stopped successfully"
    rm "$PID_FILE"
    exit 0
  fi
  sleep 1
done

# Force kill if still running
if ps -p "$PID" > /dev/null 2>&1; then
  echo "Force stopping daemon..."
  kill -9 "$PID"
  rm "$PID_FILE"
  echo "Health monitoring daemon force stopped"
fi

