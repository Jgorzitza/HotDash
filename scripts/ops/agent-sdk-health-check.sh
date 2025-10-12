#!/bin/bash
# Agent SDK Health Check Script
# Generated: 2025-10-12T08:49:01Z
# Owner: Reliability Agent
# Usage: ./scripts/ops/agent-sdk-health-check.sh

set -euo pipefail

# Colors for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
AGENT_SERVICE_URL="https://hotdash-agent-service.fly.dev"
MCP_SERVICE_URL="https://hotdash-llamaindex-mcp.fly.dev"
TIMEOUT_SECONDS=10
TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%SZ)

echo "=================================================="
echo "Agent SDK Health Check - ${TIMESTAMP}"
echo "=================================================="
echo ""

# Function to check service health
check_service() {
    local name=$1
    local url=$2
    local endpoint=$3
    
    echo -e "${BLUE}Checking ${name}...${NC}"
    
    # Make request and capture response
    response=$(curl -sS -w "\n%{http_code}|%{time_total}" "${url}${endpoint}" --max-time ${TIMEOUT_SECONDS} 2>&1)
    exit_code=$?
    
    if [ $exit_code -ne 0 ]; then
        echo -e "${RED}✗ FAILED${NC} - Service unreachable"
        echo "  Error: ${response}"
        return 1
    fi
    
    # Parse response
    http_code=$(echo "$response" | tail -1 | cut -d'|' -f1)
    time_total=$(echo "$response" | tail -1 | cut -d'|' -f2)
    body=$(echo "$response" | head -n-1)
    
    # Check HTTP status
    if [ "$http_code" = "200" ]; then
        echo -e "${GREEN}✓ HEALTHY${NC}"
        echo "  Status: HTTP ${http_code}"
        echo "  Latency: ${time_total}s"
        
        # Try to parse JSON response
        if echo "$body" | jq . >/dev/null 2>&1; then
            echo "  Response: $(echo "$body" | jq -c .)"
        else
            echo "  Response: ${body:0:100}..."
        fi
        
        return 0
    else
        echo -e "${RED}✗ UNHEALTHY${NC}"
        echo "  Status: HTTP ${http_code}"
        echo "  Latency: ${time_total}s"
        echo "  Response: ${body:0:200}"
        return 1
    fi
}

# Check services
echo "=== Service Health Checks ==="
echo ""

AGENT_HEALTHY=0
MCP_HEALTHY=0

check_service "hotdash-agent-service" "$AGENT_SERVICE_URL" "/health" && AGENT_HEALTHY=1 || true
echo ""

check_service "hotdash-llamaindex-mcp" "$MCP_SERVICE_URL" "/health" && MCP_HEALTHY=1 || true
echo ""

# Check MCP metrics endpoint if health is OK
if [ $MCP_HEALTHY -eq 1 ]; then
    echo -e "${BLUE}Checking MCP metrics endpoint...${NC}"
    metrics=$(curl -sS --max-time ${TIMEOUT_SECONDS} "${MCP_SERVICE_URL}/metrics" 2>&1)
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ METRICS AVAILABLE${NC}"
        if echo "$metrics" | jq . >/dev/null 2>&1; then
            echo "  Metrics: $(echo "$metrics" | jq -c .)"
            
            # Extract key metrics
            uptime=$(echo "$metrics" | jq -r '.uptime // "N/A"')
            echo "  Uptime: ${uptime}"
            
            # Check for error rates
            query_support_errors=$(echo "$metrics" | jq -r '.tools.query_support.errors // 0')
            query_support_calls=$(echo "$metrics" | jq -r '.tools.query_support.calls // 0')
            query_support_error_rate=$(echo "$metrics" | jq -r '.tools.query_support.errorRate // "0%"')
            
            if [ "$query_support_calls" -gt 0 ]; then
                echo "  Query Support: ${query_support_calls} calls, ${query_support_errors} errors (${query_support_error_rate})"
                
                if [ "$query_support_errors" -gt 0 ]; then
                    echo -e "  ${YELLOW}⚠ WARNING: query_support has errors${NC}"
                fi
            fi
        fi
    else
        echo -e "${YELLOW}⚠ Metrics endpoint not available${NC}"
    fi
    echo ""
fi

# Summary
echo "=================================================="
echo "Summary"
echo "=================================================="

if [ $AGENT_HEALTHY -eq 1 ] && [ $MCP_HEALTHY -eq 1 ]; then
    echo -e "${GREEN}✓ ALL SERVICES HEALTHY${NC}"
    exit 0
elif [ $AGENT_HEALTHY -eq 1 ] || [ $MCP_HEALTHY -eq 1 ]; then
    echo -e "${YELLOW}⚠ PARTIAL OUTAGE${NC}"
    [ $AGENT_HEALTHY -eq 0 ] && echo "  - agent-service: UNHEALTHY"
    [ $MCP_HEALTHY -eq 0 ] && echo "  - llamaindex-mcp: UNHEALTHY"
    exit 1
else
    echo -e "${RED}✗ ALL SERVICES DOWN${NC}"
    exit 2
fi
