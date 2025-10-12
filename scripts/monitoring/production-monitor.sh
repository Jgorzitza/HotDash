#!/bin/bash
# HotDash Production Continuous Monitor
# Version: 1.0
# Last Updated: October 12, 2025

set -e

# Configuration
INTERVAL=300  # 5 minutes
LOG_FILE="/tmp/production-monitor.log"
ALERT_LOG="/tmp/production-alerts.log"

# Ensure log files exist
touch "$LOG_FILE" "$ALERT_LOG"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║        HotDash Production Continuous Monitor                   ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "Started: $(date -u '+%Y-%m-%d %H:%M:%S UTC')"
echo "Interval: ${INTERVAL}s ($(($INTERVAL / 60)) minutes)"
echo "Log file: $LOG_FILE"
echo ""

# Function to log with timestamp
log() {
    echo "[$(date -u '+%Y-%m-%d %H:%M:%S UTC')] $1" | tee -a "$LOG_FILE"
}

# Function to alert
alert() {
    local message="[$(date -u '+%Y-%m-%d %H:%M:%S UTC')] ❌ ALERT: $1"
    echo -e "${RED}$message${NC}"
    echo "$message" >> "$ALERT_LOG"
}

# Function to check service
check_service() {
    local service_name=$1
    local url=$2
    
    if curl -sf --max-time 10 "$url" > /dev/null 2>&1; then
        log "✅ $service_name: HEALTHY"
        return 0
    else
        alert "$service_name UNHEALTHY"
        return 1
    fi
}

# Monitoring loop
iteration=1
while true; do
    log "━━━ Monitoring Check #$iteration ━━━"
    
    check_service "Agent SDK" "https://hotdash-agent-service.fly.dev/health"
    check_service "LlamaIndex MCP" "https://hotdash-llamaindex-mcp.fly.dev/health"
    
    log "Check complete. Next check in $INTERVAL seconds."
    log ""
    
    iteration=$((iteration + 1))
    sleep $INTERVAL
done

