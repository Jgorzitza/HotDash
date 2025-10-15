#!/bin/bash
#
# Agent SDK Health Check Script
# 
# Purpose: Comprehensive health check for Agent SDK services
# Usage: ./scripts/ops/agent-sdk-health-check.sh
# 
# Created: 2025-10-11
# Owner: Reliability Team

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
FLY_BIN="${HOME}/.fly/bin/fly"
LLAMAINDEX_APP="hotdash-llamaindex-mcp"
AGENT_SERVICE_APP="hotdash-agent-service"
TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%SZ)

echo "========================================================================"
echo "  Agent SDK Health Check"
echo "  Timestamp: ${TIMESTAMP}"
echo "========================================================================"

# Function to check if an app exists
check_app_exists() {
  local app_name=$1
  if $FLY_BIN apps list | grep -q "$app_name"; then
    return 0
  else
    return 1
  fi
}

# Function to test health endpoint
test_health_endpoint() {
  local url=$1
  local app_name=$2
  
  echo -e "\nTesting health endpoint: ${url}"
  
  response=$(curl -sS -w "\n%{http_code}|%{time_total}" -o /tmp/health_body "$url" 2>&1)
  http_code=$(echo "$response" | tail -1 | cut -d'|' -f1)
  time_total=$(echo "$response" | tail -1 | cut -d'|' -f2)
  body=$(cat /tmp/health_body 2>/dev/null || echo "")
  
  if [ "$http_code" = "200" ]; then
    echo -e "  ${GREEN}✓ Status: 200 OK${NC}"
    echo -e "  ${GREEN}✓ Response Time: ${time_total}s${NC}"
    if [ -n "$body" ]; then
      echo "  Response: $body"
    fi
    return 0
  else
    echo -e "  ${RED}✗ Status: ${http_code}${NC}"
    echo -e "  ${RED}✗ Response Time: ${time_total}s${NC}"
    if [ -n "$body" ]; then
      echo "  Error: $body"
    fi
    return 1
  fi
}

# Function to check app status
check_app_status() {
  local app_name=$1
  
  echo -e "\n------------------------------------------------------------------"
  echo "Checking: ${app_name}"
  echo "------------------------------------------------------------------"
  
  if ! check_app_exists "$app_name"; then
    echo -e "  ${YELLOW}⚠ App not found (may not be deployed yet)${NC}"
    return 1
  fi
  
  echo -e "\n${GREEN}App Status:${NC}"
  $FLY_BIN status -a "$app_name" || {
    echo -e "  ${RED}✗ Failed to get app status${NC}"
    return 1
  }
  
  echo -e "\n${GREEN}Machine List:${NC}"
  $FLY_BIN machine list -a "$app_name" || {
    echo -e "  ${RED}✗ Failed to get machine list${NC}"
    return 1
  }
  
  # Test health endpoint
  local url="https://${app_name}.fly.dev/health"
  if ! test_health_endpoint "$url" "$app_name"; then
    echo -e "  ${RED}✗ Health check failed${NC}"
    return 1
  fi
  
  echo -e "\n${GREEN}✓ ${app_name} health check passed${NC}"
  return 0
}

# Main health check execution
main() {
  local overall_status=0
  
  # Check if fly CLI is available
  if [ ! -x "$FLY_BIN" ]; then
    echo -e "${RED}✗ Fly CLI not found at: ${FLY_BIN}${NC}"
    echo "Please install Fly CLI or update FLY_BIN path"
    exit 1
  fi
  
  # Check authentication
  echo -e "\nVerifying Fly.io authentication..."
  if ! $FLY_BIN auth whoami >/dev/null 2>&1; then
    echo -e "${RED}✗ Not authenticated with Fly.io${NC}"
    echo "Run: $FLY_BIN auth login"
    exit 1
  fi
  echo -e "${GREEN}✓ Authenticated${NC}"
  
  # Check LlamaIndex MCP service
  if ! check_app_status "$LLAMAINDEX_APP"; then
    overall_status=1
  fi
  
  # Check Agent Service
  if ! check_app_status "$AGENT_SERVICE_APP"; then
    overall_status=1
  fi
  
  # Summary
  echo -e "\n========================================================================"
  echo "  Health Check Summary"
  echo "========================================================================"
  
  if [ $overall_status -eq 0 ]; then
    echo -e "${GREEN}✓ All services healthy${NC}"
  else
    echo -e "${RED}✗ Some services have issues${NC}"
    echo -e "${YELLOW}⚠ Check details above${NC}"
  fi
  
  echo -e "\nCompleted: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo "========================================================================"
  
  # Log to feedback file
  if [ -f "feedback/reliability.md" ]; then
    echo "" >> feedback/reliability.md
    echo "[${TIMESTAMP}] Agent SDK Health Check" >> feedback/reliability.md
    if [ $overall_status -eq 0 ]; then
      echo "Result: All services healthy ✅" >> feedback/reliability.md
    else
      echo "Result: Some services have issues ⚠️" >> feedback/reliability.md
    fi
  fi
  
  exit $overall_status
}

# Run main function
main "$@"

