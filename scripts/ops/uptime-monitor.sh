#!/bin/bash
# Uptime Monitoring Script
# Continuously monitors all Hot Rod AN services
# Created: 2025-10-12
# Owner: Reliability Team

set -e

# Configuration
CHECK_INTERVAL=300  # 5 minutes
LOG_DIR="artifacts/reliability/uptime-logs"
TIMESTAMP=$(date -u +%Y%m%dT%H%M%SZ)

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Create log directory
mkdir -p "$LOG_DIR"

# Services to monitor
declare -A SERVICES=(
    ["agent-service"]="https://hotdash-agent-service.fly.dev/health"
    ["llamaindex-mcp"]="https://hotdash-llamaindex-mcp.fly.dev/health"
    ["chatwoot"]="https://hotdash-chatwoot.fly.dev/api"
    ["staging"]="https://hotdash-staging.fly.dev/app"
)

# Function to check service uptime
check_service() {
    local name=$1
    local url=$2
    local timestamp=$(date -u +%Y-%m-%dT%H:%M:%SZ)
    
    response=$(curl -sS -w "\n%{http_code}|%{time_total}" -o /dev/null "$url" --max-time 10 2>&1)
    exit_code=$?
    
    if [ $exit_code -eq 0 ]; then
        http_code=$(echo "$response" | tail -1 | cut -d'|' -f1)
        time_total=$(echo "$response" | tail -1 | cut -d'|' -f2)
        
        if [ "$http_code" = "200" ]; then
            echo "$timestamp,$name,UP,$http_code,$time_total" >> "$LOG_DIR/uptime-$(date -u +%Y%m%d).csv"
            echo -e "${GREEN}✓${NC} $name: UP (${time_total}s)"
            return 0
        else
            echo "$timestamp,$name,DOWN,$http_code,$time_total" >> "$LOG_DIR/uptime-$(date -u +%Y%m%d).csv"
            echo -e "${RED}✗${NC} $name: DOWN (HTTP $http_code)"
            return 1
        fi
    else
        echo "$timestamp,$name,ERROR,0,0" >> "$LOG_DIR/uptime-$(date -u +%Y%m%d).csv"
        echo -e "${RED}✗${NC} $name: ERROR (unreachable)"
        return 1
    fi
}

# Function to calculate uptime percentage
calculate_uptime() {
    local service=$1
    local today=$(date -u +%Y%m%d)
    local log_file="$LOG_DIR/uptime-${today}.csv"
    
    if [ -f "$log_file" ]; then
        local total=$(grep "$service" "$log_file" | wc -l)
        local up=$(grep "$service,UP" "$log_file" | wc -l)
        
        if [ $total -gt 0 ]; then
            local percentage=$(echo "scale=2; ($up / $total) * 100" | bc)
            echo "$percentage%"
        else
            echo "N/A"
        fi
    else
        echo "N/A"
    fi
}

# Main monitoring loop
echo "==================================="
echo "Uptime Monitoring Started"
echo "Timestamp: $TIMESTAMP"
echo "Check Interval: ${CHECK_INTERVAL}s"
echo "==================================="
echo ""

# Create CSV header if needed
for service in "${!SERVICES[@]}"; do
    if [ ! -f "$LOG_DIR/uptime-$(date -u +%Y%m%d).csv" ]; then
        echo "timestamp,service,status,http_code,latency_seconds" > "$LOG_DIR/uptime-$(date -u +%Y%m%d).csv"
        break
    fi
done

# Run checks in a loop
iteration=0
while true; do
    iteration=$((iteration + 1))
    echo "--- Check #$iteration at $(date -u +%Y-%m-%dT%H:%M:%SZ) ---"
    
    for service in "${!SERVICES[@]}"; do
        check_service "$service" "${SERVICES[$service]}" || true
    done
    
    echo ""
    echo "Today's Uptime:"
    for service in "${!SERVICES[@]}"; do
        uptime=$(calculate_uptime "$service")
        echo "  $service: $uptime"
    done
    
    echo ""
    echo "Next check in ${CHECK_INTERVAL}s..."
    echo ""
    
    sleep $CHECK_INTERVAL
done

