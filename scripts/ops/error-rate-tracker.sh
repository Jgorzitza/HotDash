#!/bin/bash
# Error Rate Tracking Script
# Monitors error rates across all Hot Rod AN services
# Created: 2025-10-12
# Owner: Reliability Team

set -e

# Configuration
LOG_DIR="artifacts/reliability/error-logs"
TIMESTAMP=$(date -u +%Y%m%dT%H%M%SZ)

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Create log directory
mkdir -p "$LOG_DIR"

echo "========================================="
echo "Error Rate Tracking - $TIMESTAMP"
echo "========================================="
echo ""

# Function to check service for errors
check_errors() {
    local service=$1
    local url=$2
    
    echo "Checking: $service"
    
    # Get metrics/health response
    response=$(curl -sS "$url" 2>&1)
    
    if echo "$response" | jq . >/dev/null 2>&1; then
        # Try to extract error metrics
        if echo "$response" | jq -e '.metrics' >/dev/null 2>&1; then
            # Has metrics object
            error_rate=$(echo "$response" | jq -r '.metrics.query_support.errorRate // "0%"' 2>/dev/null || echo "N/A")
            errors=$(echo "$response" | jq -r '.metrics.query_support.errors // 0' 2>/dev/null || echo "0")
            calls=$(echo "$response" | jq -r '.metrics.query_support.calls // 0' 2>/dev/null || echo "0")
            
            echo "  Error Rate: $error_rate"
            echo "  Errors: $errors / $calls calls"
            
            # Log to CSV
            echo "$TIMESTAMP,$service,$error_rate,$errors,$calls" >> "$LOG_DIR/error-rates-$(date -u +%Y%m%d).csv"
            
            # Alert if error rate is high
            error_pct=$(echo "$error_rate" | tr -d '%')
            if [ -n "$error_pct" ] && [ "$error_pct" != "N/A" ]; then
                if (( $(echo "$error_pct > 5" | bc -l) )); then
                    echo -e "  ${RED}⚠ HIGH ERROR RATE!${NC}"
                elif (( $(echo "$error_pct > 1" | bc -l) )); then
                    echo -e "  ${YELLOW}⚠ Elevated error rate${NC}"
                else
                    echo -e "  ${GREEN}✓ Error rate normal${NC}"
                fi
            fi
        else
            echo "  No metrics available"
        fi
    else
        echo -e "  ${RED}✗ Unable to parse response${NC}"
    fi
    
    echo ""
}

# Check LlamaIndex MCP service
check_errors "llamaindex-mcp" "https://hotdash-llamaindex-mcp.fly.dev/metrics"

# Check Agent Service (if it has metrics endpoint)
echo "Checking: agent-service"
response=$(curl -sS "https://hotdash-agent-service.fly.dev/health" 2>&1)
if echo "$response" | jq -e '.status' >/dev/null 2>&1; then
    status=$(echo "$response" | jq -r '.status')
    echo "  Status: $status"
    if [ "$status" = "ok" ]; then
        echo -e "  ${GREEN}✓ No errors reported${NC}"
        echo "$TIMESTAMP,agent-service,0%,0,0" >> "$LOG_DIR/error-rates-$(date -u +%Y%m%d).csv"
    fi
else
    echo -e "  ${RED}✗ Unable to check status${NC}"
fi
echo ""

# Summary
echo "========================================="
echo "Error Rate Summary"
echo "========================================="

if [ -f "$LOG_DIR/error-rates-$(date -u +%Y%m%d).csv" ]; then
    echo "Today's error rates logged to:"
    echo "  $LOG_DIR/error-rates-$(date -u +%Y%m%d).csv"
    echo ""
    
    echo "Recent entries:"
    tail -5 "$LOG_DIR/error-rates-$(date -u +%Y%m%d).csv"
fi

echo ""
echo "Run this script regularly (e.g., via cron every 15 minutes)"
echo "Example crontab entry:"
echo "*/15 * * * * cd /home/justin/HotDash/hot-dash && ./scripts/ops/error-rate-tracker.sh >> artifacts/reliability/error-logs/tracker.log 2>&1"

