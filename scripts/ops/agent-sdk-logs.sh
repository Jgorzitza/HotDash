#!/bin/bash
#
# Agent SDK Log Monitoring Script
# 
# Purpose: Monitor and filter logs for Agent SDK services
# Usage: ./scripts/ops/agent-sdk-logs.sh [service] [options]
# 
# Created: 2025-10-11
# Owner: Reliability Team

set -e

# Configuration
FLY_BIN="${HOME}/.fly/bin/fly"
LLAMAINDEX_APP="hotdash-llamaindex-mcp"
AGENT_SERVICE_APP="hotdash-agent-service"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Usage information
usage() {
  cat << EOF
Agent SDK Log Monitoring Script

Usage: $0 [service] [filter]

Services:
  llamaindex       Monitor LlamaIndex MCP service logs
  agent-service    Monitor Agent Service logs
  all             Monitor both services (default)

Filters:
  errors          Show only errors
  slow            Show slow operations
  health          Show health check requests
  all            Show all logs (default)

Examples:
  $0                              # Monitor all services, all logs
  $0 llamaindex                   # Monitor LlamaIndex, all logs
  $0 llamaindex errors            # Monitor LlamaIndex, errors only
  $0 agent-service slow           # Monitor Agent Service, slow ops only
  $0 all errors                   # Monitor both services, errors only

EOF
  exit 1
}

# Function to monitor logs with filter
monitor_logs() {
  local app_name=$1
  local filter=${2:-all}
  
  echo -e "${BLUE}========================================${NC}"
  echo -e "${BLUE}Monitoring: ${app_name}${NC}"
  echo -e "${BLUE}Filter: ${filter}${NC}"
  echo -e "${BLUE}Press Ctrl+C to stop${NC}"
  echo -e "${BLUE}========================================${NC}\n"
  
  case $filter in
    errors)
      $FLY_BIN logs -a "$app_name" 2>&1 | grep --line-buffered -iE "(error|exception|failed|fatal)" | while read -r line; do
        echo -e "${RED}${line}${NC}"
      done
      ;;
    slow)
      $FLY_BIN logs -a "$app_name" 2>&1 | grep --line-buffered -iE "(slow|timeout|latency|duration)" | while read -r line; do
        echo -e "${YELLOW}${line}${NC}"
      done
      ;;
    health)
      $FLY_BIN logs -a "$app_name" 2>&1 | grep --line-buffered -iE "(health|/health)" | while read -r line; do
        echo -e "${GREEN}${line}${NC}"
      done
      ;;
    all|*)
      $FLY_BIN logs -a "$app_name" 2>&1 | while read -r line; do
        # Color code based on content
        if echo "$line" | grep -qiE "(error|exception|failed|fatal)"; then
          echo -e "${RED}${line}${NC}"
        elif echo "$line" | grep -qiE "(warn|warning)"; then
          echo -e "${YELLOW}${line}${NC}"
        elif echo "$line" | grep -qiE "(info|success)"; then
          echo -e "${GREEN}${line}${NC}"
        else
          echo "$line"
        fi
      done
      ;;
  esac
}

# Function to check if app exists
check_app_exists() {
  local app_name=$1
  if $FLY_BIN apps list 2>/dev/null | grep -q "$app_name"; then
    return 0
  else
    return 1
  fi
}

# Main execution
main() {
  local service=${1:-all}
  local filter=${2:-all}
  
  # Check if fly CLI is available
  if [ ! -x "$FLY_BIN" ]; then
    echo -e "${RED}✗ Fly CLI not found at: ${FLY_BIN}${NC}"
    echo "Please install Fly CLI or update FLY_BIN path"
    exit 1
  fi
  
  # Check authentication
  if ! $FLY_BIN auth whoami >/dev/null 2>&1; then
    echo -e "${RED}✗ Not authenticated with Fly.io${NC}"
    echo "Run: $FLY_BIN auth login"
    exit 1
  fi
  
  case $service in
    llamaindex)
      if ! check_app_exists "$LLAMAINDEX_APP"; then
        echo -e "${YELLOW}⚠ LlamaIndex MCP app not found (may not be deployed yet)${NC}"
        exit 1
      fi
      monitor_logs "$LLAMAINDEX_APP" "$filter"
      ;;
    agent-service)
      if ! check_app_exists "$AGENT_SERVICE_APP"; then
        echo -e "${YELLOW}⚠ Agent Service app not found (may not be deployed yet)${NC}"
        exit 1
      fi
      monitor_logs "$AGENT_SERVICE_APP" "$filter"
      ;;
    all)
      echo -e "${BLUE}Monitoring both services...${NC}"
      echo -e "${YELLOW}Note: Logs will be interleaved. Use specific service for cleaner output.${NC}\n"
      
      # Check which services exist
      llamaindex_exists=false
      agent_service_exists=false
      
      if check_app_exists "$LLAMAINDEX_APP"; then
        llamaindex_exists=true
      fi
      
      if check_app_exists "$AGENT_SERVICE_APP"; then
        agent_service_exists=true
      fi
      
      if [ "$llamaindex_exists" = false ] && [ "$agent_service_exists" = false ]; then
        echo -e "${YELLOW}⚠ No Agent SDK apps found (may not be deployed yet)${NC}"
        exit 1
      fi
      
      # Monitor both services in background
      if [ "$llamaindex_exists" = true ]; then
        monitor_logs "$LLAMAINDEX_APP" "$filter" &
        pid_llamaindex=$!
      fi
      
      if [ "$agent_service_exists" = true ]; then
        monitor_logs "$AGENT_SERVICE_APP" "$filter" &
        pid_agent=$!
      fi
      
      # Wait for Ctrl+C
      trap 'kill $pid_llamaindex $pid_agent 2>/dev/null; exit 0' INT
      wait
      ;;
    -h|--help|help)
      usage
      ;;
    *)
      echo -e "${RED}✗ Unknown service: ${service}${NC}"
      echo ""
      usage
      ;;
  esac
}

# Run main function
main "$@"

