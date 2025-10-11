#!/bin/bash
#
# Fly.io Continuous Monitoring Script
# 
# Purpose: Continuously monitor all Fly apps and log metrics
# Usage: ./scripts/ops/fly-continuous-monitor.sh
# 
# Created: 2025-10-11
# Owner: Reliability Team

set -e

# Configuration
FLY_BIN="${HOME}/.fly/bin/fly"
INTERVAL=${MONITORING_INTERVAL:-60}  # seconds between checks
LOG_DIR="artifacts/monitoring"
APPS=("hotdash-chatwoot" "hotdash-staging")

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Create log directory
mkdir -p "$LOG_DIR"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Fly.io Continuous Monitoring${NC}"
echo -e "${BLUE}Interval: ${INTERVAL}s${NC}"
echo -e "${BLUE}Apps: ${APPS[@]}${NC}"
echo -e "${BLUE}Logs: ${LOG_DIR}${NC}"
echo -e "${BLUE}Press Ctrl+C to stop${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Trap Ctrl+C for clean exit
trap 'echo -e "\n${YELLOW}Monitoring stopped${NC}"; exit 0' INT

# Function to check app health
check_app_health() {
  local app=$1
  local timestamp=$2
  local health_file="$LOG_DIR/${app}-health-${timestamp}.txt"
  
  # Try health check
  local response=$(curl -sS -w "\n%{http_code}|%{time_total}" -o /tmp/health_body "https://${app}.fly.dev/health" 2>&1 || echo "failed")
  
  if [ "$response" != "failed" ]; then
    local http_code=$(echo "$response" | tail -1 | cut -d'|' -f1)
    local time_total=$(echo "$response" | tail -1 | cut -d'|' -f2)
    local body=$(cat /tmp/health_body 2>/dev/null || echo "")
    
    echo "HTTP: $http_code, Time: ${time_total}s" > "$health_file"
    if [ -n "$body" ]; then
      echo "Body: $body" >> "$health_file"
    fi
    
    if [ "$http_code" = "200" ]; then
      echo -e "    Health: ${GREEN}✓ 200 OK${NC} (${time_total}s)"
      return 0
    else
      echo -e "    Health: ${RED}✗ $http_code${NC} (${time_total}s)"
      return 1
    fi
  else
    echo "Failed to connect" > "$health_file"
    echo -e "    Health: ${RED}✗ Connection failed${NC}"
    return 1
  fi
}

# Main monitoring loop
iteration=0
while true; do
  iteration=$((iteration + 1))
  TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%SZ)
  TIMESTAMP_FILE=$(date -u +%Y%m%d-%H%M%S)
  
  echo -e "\n${BLUE}[${TIMESTAMP}] Check #${iteration}${NC}"
  
  for app in "${APPS[@]}"; do
    echo -e "${YELLOW}Checking: ${app}${NC}"
    
    # Check if app exists
    if ! $FLY_BIN apps list 2>/dev/null | grep -q "$app"; then
      echo -e "  ${YELLOW}⚠ App not found (may not be deployed)${NC}"
      continue
    fi
    
    # App status
    status_file="$LOG_DIR/${app}-status-${TIMESTAMP_FILE}.txt"
    if $FLY_BIN status -a "$app" > "$status_file" 2>&1; then
      echo -e "    Status: ${GREEN}✓ Retrieved${NC}"
    else
      echo -e "    Status: ${RED}✗ Failed${NC}"
    fi
    
    # Machine list
    machines_file="$LOG_DIR/${app}-machines-${TIMESTAMP_FILE}.txt"
    if $FLY_BIN machine list -a "$app" > "$machines_file" 2>&1; then
      # Count running machines
      running=$(grep -c "started" "$machines_file" 2>/dev/null || echo "0")
      total=$(grep -c "^app" "$machines_file" 2>/dev/null || echo "0")
      echo -e "    Machines: ${GREEN}$running/$total running${NC}"
    else
      echo -e "    Machines: ${RED}✗ Failed to list${NC}"
    fi
    
    # Health check
    check_app_health "$app" "$TIMESTAMP_FILE"
  done
  
  # Cleanup old logs (keep last 24 hours)
  find "$LOG_DIR" -name "*-status-*.txt" -mmin +1440 -delete 2>/dev/null || true
  find "$LOG_DIR" -name "*-machines-*.txt" -mmin +1440 -delete 2>/dev/null || true
  find "$LOG_DIR" -name "*-health-*.txt" -mmin +1440 -delete 2>/dev/null || true
  
  echo -e "${BLUE}Next check in ${INTERVAL}s...${NC}"
  sleep "$INTERVAL"
done

