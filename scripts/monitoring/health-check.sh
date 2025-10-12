#!/bin/bash
# HotDash Production Health Check Script
# Version: 1.0
# Last Updated: October 12, 2025

set -e

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║        HotDash Production Health Check                         ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "Time: $(date -u '+%Y-%m-%d %H:%M:%S UTC')"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

OVERALL_STATUS="HEALTHY"

# Function to check health endpoint
check_health() {
    local service_name=$1
    local url=$2
    
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🔍 Checking: $service_name"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    # Check health endpoint with timeout
    if response=$(curl -sf --max-time 10 "$url" 2>&1); then
        echo -e "${GREEN}✅ HEALTHY${NC}"
        echo "Response: $response"
        
        # Extract response time
        response_time=$(curl -o /dev/null -s -w '%{time_total}' --max-time 10 "$url" 2>&1)
        echo "Response Time: ${response_time}s"
        
        # Warn if response time is slow
        if (( $(echo "$response_time > 2.0" | bc -l) )); then
            echo -e "${YELLOW}⚠️  WARNING: Slow response time (> 2s)${NC}"
        fi
    else
        echo -e "${RED}❌ UNHEALTHY${NC}"
        echo "Error: Could not reach health endpoint"
        echo "Response: $response"
        OVERALL_STATUS="UNHEALTHY"
    fi
    
    echo ""
}

# Check Agent SDK
check_health "Agent SDK" "https://hotdash-agent-service.fly.dev/health"

# Check LlamaIndex MCP
check_health "LlamaIndex MCP" "https://hotdash-llamaindex-mcp.fly.dev/health"

# Machine Status
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🖥️  Machine Status"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo ""
echo "Agent SDK Machines:"
fly machine list -a hotdash-agent-service 2>&1 | grep -v "^$" || echo "Could not retrieve machine list"

echo ""
echo "LlamaIndex MCP Machines:"
fly machine list -a hotdash-llamaindex-mcp 2>&1 | grep -v "^$" || echo "Could not retrieve machine list"

# Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Health Check Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Status: $OVERALL_STATUS"
echo "Completed: $(date -u '+%Y-%m-%d %H:%M:%S UTC')"
echo ""

if [ "$OVERALL_STATUS" = "UNHEALTHY" ]; then
    echo -e "${RED}⚠️  ACTION REQUIRED: One or more services are unhealthy${NC}"
    echo "Next steps:"
    echo "  1. Check service logs: fly logs -a [app-name]"
    echo "  2. Verify machine status: fly status -a [app-name]"
    echo "  3. Consider rollback if issue persists"
    echo ""
    exit 1
else
    echo -e "${GREEN}✅ All systems operational${NC}"
    echo ""
    exit 0
fi

