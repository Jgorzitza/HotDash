#!/bin/bash

# Start Health Monitoring Daemon
# Run with: ./scripts/monitoring/start-monitoring.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
PID_FILE="$PROJECT_ROOT/logs/monitoring/health-daemon.pid"
LOG_FILE="$PROJECT_ROOT/logs/monitoring/daemon.log"

# Create logs directory
mkdir -p "$PROJECT_ROOT/logs/monitoring"

# Check if already running
if [ -f "$PID_FILE" ]; then
  PID=$(cat "$PID_FILE")
  if ps -p "$PID" > /dev/null 2>&1; then
    echo "Health monitoring daemon is already running (PID: $PID)"
    echo "To stop it, run: kill $PID"
    exit 1
  else
    # Stale PID file
    rm "$PID_FILE"
  fi
fi

echo "Starting health monitoring daemon..."
echo "Logs: $LOG_FILE"
echo "PID file: $PID_FILE"

# Start the daemon in the background
cd "$PROJECT_ROOT"
nohup npx tsx scripts/monitoring/health-check-daemon.ts > "$LOG_FILE" 2>&1 &
PID=$!

# Save PID
echo "$PID" > "$PID_FILE"

echo "Health monitoring daemon started (PID: $PID)"
echo ""
echo "Commands:"
echo "  - View logs:  tail -f $LOG_FILE"
echo "  - Stop daemon: kill $PID (or run ./scripts/monitoring/stop-monitoring.sh)"
echo "  - View stats:  cat logs/monitoring/health-stats.json"

