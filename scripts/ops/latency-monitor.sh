#!/bin/bash
# Latency Monitoring Script
# Tracks response times for all APIs
# Created: 2025-10-12

set -e

LOG_DIR="artifacts/reliability/latency-logs"
mkdir -p "$LOG_DIR"

TIMESTAMP=$(date -u +%Y%m%dT%H%M%SZ)

echo "Latency Monitoring - $TIMESTAMP"
echo "======================================"

declare -A SERVICES=(
    ["agent-service"]="https://hotdash-agent-service.fly.dev/health"
    ["llamaindex-mcp"]="https://hotdash-llamaindex-mcp.fly.dev/health"
    ["chatwoot"]="https://hotdash-chatwoot.fly.dev/api"
)

# Create CSV header if needed
if [ ! -f "$LOG_DIR/latency-$(date -u +%Y%m%d).csv" ]; then
    echo "timestamp,service,latency_ms,http_code" > "$LOG_DIR/latency-$(date -u +%Y%m%d).csv"
fi

for service in "${!SERVICES[@]}"; do
    url="${SERVICES[$service]}"
    
    response=$(curl -sS -w "\n%{http_code}|%{time_total}" -o /dev/null "$url" --max-time 10 2>&1)
    
    if [ $? -eq 0 ]; then
        http_code=$(echo "$response" | tail -1 | cut -d'|' -f1)
        time_total=$(echo "$response" | tail -1 | cut -d'|' -f2)
        latency_ms=$(echo "$time_total * 1000" | bc)
        
        echo "$service: ${latency_ms}ms (HTTP $http_code)"
        echo "$TIMESTAMP,$service,$latency_ms,$http_code" >> "$LOG_DIR/latency-$(date -u +%Y%m%d).csv"
    else
        echo "$service: ERROR"
        echo "$TIMESTAMP,$service,0,0" >> "$LOG_DIR/latency-$(date -u +%Y%m%d).csv"
    fi
done

echo ""
echo "Logged to: $LOG_DIR/latency-$(date -u +%Y%m%d).csv"

