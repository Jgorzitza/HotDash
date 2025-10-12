#!/bin/bash
#
# Fly.io Alert Check Script
# 
# Purpose: Check alert conditions and log issues
# Usage: ./scripts/ops/fly-alert-check.sh
# Run via cron: */5 * * * * cd /path/to/hot-dash && ./scripts/ops/fly-alert-check.sh
# 
# Created: 2025-10-11
# Owner: Reliability Team

set -e

# Configuration
FLY_BIN="${HOME}/.fly/bin/fly"
LOG_FILE="feedback/reliability.md"
APPS=("hotdash-chatwoot" "hotdash-staging")
TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%SZ)

# Alert thresholds
CPU_WARN=70
CPU_CRIT=90
MEM_WARN=70
MEM_CRIT=85

# Colors for terminal output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to log to feedback file
log_feedback() {
  echo "[$TIMESTAMP] $1" >> "$LOG_FILE"
}

# Function to check if app exists
app_exists() {
  local app=$1
  if $FLY_BIN apps list 2>/dev/null | grep -q "$app"; then
    return 0
  else
    return 1
  fi
}

# Function to check machine status
check_machine_status() {
  local app=$1
  local machines=$($FLY_BIN machine list -a "$app" 2>/dev/null || echo "")
  
  if [ -z "$machines" ]; then
    log_feedback "🚨 CRITICAL: $app - Unable to list machines"
    echo -e "${RED}✗ CRITICAL: $app - Cannot list machines${NC}"
    return 1
  fi
  
  # Check for running machines
  local running=$(echo "$machines" | grep -c "started" || echo "0")
  local total=$(echo "$machines" | grep -c "^app" || echo "0")
  
  if [ "$running" -eq 0 ] && [ "$total" -gt 0 ]; then
    log_feedback "🚨 CRITICAL: $app - No running machines (0/$total)"
    echo -e "${RED}✗ CRITICAL: $app - No running machines${NC}"
    return 1
  fi
  
  echo -e "${GREEN}✓${NC} $app: $running/$total machines running"
  return 0
}

# Function to check health endpoint
check_health_endpoint() {
  local app=$1
  local url="https://${app}.fly.dev/health"
  
  local response=$(curl -sS -w "%{http_code}|%{time_total}" -o /dev/null "$url" 2>&1 || echo "failed|0")
  local http_code=$(echo "$response" | cut -d'|' -f1)
  local time_total=$(echo "$response" | cut -d'|' -f2)
  
  if [ "$http_code" = "failed" ]; then
    log_feedback "⚠️ WARNING: $app - Health check connection failed"
    echo -e "${RED}✗ WARNING: $app - Health check failed (connection)${NC}"
    return 1
  fi
  
  if [ "$http_code" != "200" ]; then
    log_feedback "⚠️ WARNING: $app - Health check returned $http_code"
    echo -e "${YELLOW}⚠ WARNING: $app - Health check $http_code${NC}"
    return 1
  fi
  
  # Check response time
  local time_ms=$(echo "$time_total * 1000" | bc 2>/dev/null || echo "999999")
  local time_int=${time_ms%.*}
  
  if [ "$time_int" -gt 2000 ]; then
    log_feedback "⚠️ WARNING: $app - Slow health check (${time_total}s)"
    echo -e "${YELLOW}⚠ WARNING: $app - Slow response (${time_total}s)${NC}"
  else
    echo -e "${GREEN}✓${NC} $app: Health OK (${time_total}s)"
  fi
  
  return 0
}

# Function to check for OOM kills
check_oom_kills() {
  local app=$1
  
  # Get recent logs
  local logs=$($FLY_BIN logs -a "$app" 2>&1 | tail -100 || echo "")
  
  if echo "$logs" | grep -qi "oom"; then
    local oom_count=$(echo "$logs" | grep -ci "oom")
    log_feedback "🚨 CRITICAL: $app - OOM kill detected (${oom_count} occurrences in recent logs)"
    echo -e "${RED}✗ CRITICAL: $app - OOM kill detected${NC}"
    return 1
  fi
  
  return 0
}

# Function to check error rate
check_error_rate() {
  local app=$1
  
  # Get recent logs
  local logs=$($FLY_BIN logs -a "$app" 2>&1 | tail -200 || echo "")
  
  if [ -z "$logs" ]; then
    return 0
  fi
  
  # Count total log lines and errors
  local total_lines=$(echo "$logs" | wc -l)
  local error_lines=$(echo "$logs" | grep -ciE "(error|exception|failed)" || echo "0")
  
  if [ "$total_lines" -eq 0 ]; then
    return 0
  fi
  
  # Calculate error percentage
  local error_pct=$(echo "scale=2; $error_lines * 100 / $total_lines" | bc 2>/dev/null || echo "0")
  local error_pct_int=${error_pct%.*}
  
  if [ "$error_pct_int" -ge 5 ]; then
    log_feedback "🚨 CRITICAL: $app - High error rate (${error_pct}%)"
    echo -e "${RED}✗ CRITICAL: $app - Error rate ${error_pct}%${NC}"
    return 1
  elif [ "$error_pct_int" -ge 1 ]; then
    log_feedback "⚠️ WARNING: $app - Elevated error rate (${error_pct}%)"
    echo -e "${YELLOW}⚠ WARNING: $app - Error rate ${error_pct}%${NC}"
    return 1
  fi
  
  return 0
}

# Main execution
main() {
  log_feedback "Alert Check - Starting"
  echo -e "\n${YELLOW}======================================${NC}"
  echo -e "${YELLOW}Fly.io Alert Check${NC}"
  echo -e "${YELLOW}Time: $TIMESTAMP${NC}"
  echo -e "${YELLOW}======================================${NC}\n"
  
  # Check if fly CLI is available
  if [ ! -x "$FLY_BIN" ]; then
    echo -e "${RED}✗ Fly CLI not found at: ${FLY_BIN}${NC}"
    log_feedback "ERROR: Fly CLI not found"
    exit 1
  fi
  
  # Check authentication
  if ! $FLY_BIN auth whoami >/dev/null 2>&1; then
    echo -e "${RED}✗ Not authenticated with Fly.io${NC}"
    log_feedback "ERROR: Not authenticated with Fly.io"
    exit 1
  fi
  
  local overall_issues=0
  
  # Check each app
  for app in "${APPS[@]}"; do
    echo -e "\n${YELLOW}Checking: ${app}${NC}"
    
    if ! app_exists "$app"; then
      echo -e "${YELLOW}⚠ App not found (may not be deployed yet)${NC}"
      continue
    fi
    
    # Run all checks
    check_machine_status "$app" || overall_issues=$((overall_issues + 1))
    check_health_endpoint "$app" || overall_issues=$((overall_issues + 1))
    check_oom_kills "$app" || overall_issues=$((overall_issues + 1))
    check_error_rate "$app" || overall_issues=$((overall_issues + 1))
  done
  
  # Summary
  echo -e "\n${YELLOW}======================================${NC}"
  if [ $overall_issues -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed${NC}"
    log_feedback "Alert Check - All healthy ✅"
  else
    echo -e "${RED}✗ Found $overall_issues issue(s)${NC}"
    log_feedback "Alert Check - Found $overall_issues issue(s) ⚠️"
  fi
  echo -e "${YELLOW}======================================${NC}\n"
  
  exit $overall_issues
}

# Run main function
main "$@"

