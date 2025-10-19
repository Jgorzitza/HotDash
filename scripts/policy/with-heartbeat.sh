#!/usr/bin/env bash
# Heartbeat wrapper for long-running commands
# Usage: scripts/policy/with-heartbeat.sh <command>
set -euo pipefail

HEARTBEAT_DIR="${HEARTBEAT_DIR:-artifacts/heartbeat}"
TIMESTAMP=$(date -u +%Y%m%dT%H%M%SZ)
OUTPUT_FILE="${HEARTBEAT_DIR}/foreground-${TIMESTAMP}.ndjson"

mkdir -p "$HEARTBEAT_DIR"

# Log start event
echo "{\"event\":\"start\",\"timestamp\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",\"command\":\"$*\"}" >> "$OUTPUT_FILE"

# Execute command and capture exit code
set +e
"$@" 2>&1 | tee -a "$OUTPUT_FILE"
EXIT_CODE=$?
set -e

# Log end event
echo "{\"event\":\"end\",\"timestamp\":\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",\"exit_code\":$EXIT_CODE}" >> "$OUTPUT_FILE"

exit $EXIT_CODE
