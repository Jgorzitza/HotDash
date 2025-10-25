#!/bin/bash
# Production Health Check Script
# Monitors production application health and creates alerts
#
# Usage: ./scripts/ops/check-production-health.sh
#
# @see DEVOPS-017

set -e

echo "=== Production Health Check ==="
echo "Timestamp: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
echo ""

# Configuration
APP_URL="${APP_URL:-https://hotdash-staging.fly.dev}"
HEALTH_ENDPOINT="${APP_URL}/api/monitoring/health"
ALERT_THRESHOLD_ERROR_RATE=5
ALERT_THRESHOLD_P95=3000
ALERT_THRESHOLD_UPTIME=99

# Colors for output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# Check health endpoint
echo "1. Checking Health Endpoint"
HEALTH_RESPONSE=$(curl -s -w "\n%{http_code}" "$HEALTH_ENDPOINT" || echo "000")
HTTP_CODE=$(echo "$HEALTH_RESPONSE" | tail -n1)
HEALTH_BODY=$(echo "$HEALTH_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
  echo -e "${GREEN}✅ HEALTHY${NC} (HTTP $HTTP_CODE)"
elif [ "$HTTP_CODE" = "503" ]; then
  echo -e "${RED}❌ UNHEALTHY${NC} (HTTP $HTTP_CODE)"
else
  echo -e "${YELLOW}⚠️ DEGRADED${NC} (HTTP $HTTP_CODE)"
fi
echo ""

# Parse health metrics
if [ "$HTTP_CODE" != "000" ] && [ -n "$HEALTH_BODY" ]; then
  echo "2. Health Metrics"
  
  # Extract metrics using jq if available
  if command -v jq &> /dev/null; then
    STATUS=$(echo "$HEALTH_BODY" | jq -r '.status // "unknown"')
    MESSAGE=$(echo "$HEALTH_BODY" | jq -r '.message // "No message"')
    ERROR_TOTAL=$(echo "$HEALTH_BODY" | jq -r '.metrics.errors.total // 0')
    ERROR_CRITICAL=$(echo "$HEALTH_BODY" | jq -r '.metrics.errors.critical // 0')
    PERF_ROUTE_P95=$(echo "$HEALTH_BODY" | jq -r '.metrics.performance.routeP95 // 0')
    PERF_API_P95=$(echo "$HEALTH_BODY" | jq -r '.metrics.performance.apiP95 // 0')
    UPTIME=$(echo "$HEALTH_BODY" | jq -r '.metrics.uptime.overall // 100')
    ALERTS_UNACK=$(echo "$HEALTH_BODY" | jq -r '.metrics.alerts.unacknowledged // 0')
    ALERTS_CRITICAL=$(echo "$HEALTH_BODY" | jq -r '.metrics.alerts.critical // 0')
    
    echo "Status: $STATUS"
    echo "Message: $MESSAGE"
    echo ""
    echo "Errors:"
    echo "  Total: $ERROR_TOTAL"
    echo "  Critical: $ERROR_CRITICAL"
    echo ""
    echo "Performance:"
    echo "  Route P95: ${PERF_ROUTE_P95}ms"
    echo "  API P95: ${PERF_API_P95}ms"
    echo ""
    echo "Uptime:"
    echo "  Overall: ${UPTIME}%"
    echo ""
    echo "Alerts:"
    echo "  Unacknowledged: $ALERTS_UNACK"
    echo "  Critical: $ALERTS_CRITICAL"
    echo ""
    
    # Check thresholds and create alerts
    echo "3. Threshold Checks"
    ALERTS_TRIGGERED=0
    
    if [ "$ERROR_CRITICAL" -gt 0 ]; then
      echo -e "${RED}⚠️ ALERT: Critical errors detected ($ERROR_CRITICAL)${NC}"
      ALERTS_TRIGGERED=$((ALERTS_TRIGGERED + 1))
    fi
    
    if [ "$PERF_ROUTE_P95" -gt "$ALERT_THRESHOLD_P95" ]; then
      echo -e "${YELLOW}⚠️ WARNING: Route P95 exceeds threshold (${PERF_ROUTE_P95}ms > ${ALERT_THRESHOLD_P95}ms)${NC}"
      ALERTS_TRIGGERED=$((ALERTS_TRIGGERED + 1))
    fi
    
    UPTIME_INT=$(echo "$UPTIME" | cut -d. -f1)
    if [ "$UPTIME_INT" -lt "$ALERT_THRESHOLD_UPTIME" ]; then
      echo -e "${RED}⚠️ ALERT: Uptime below threshold (${UPTIME}% < ${ALERT_THRESHOLD_UPTIME}%)${NC}"
      ALERTS_TRIGGERED=$((ALERTS_TRIGGERED + 1))
    fi
    
    if [ "$ALERTS_CRITICAL" -gt 0 ]; then
      echo -e "${RED}⚠️ ALERT: Unacknowledged critical alerts ($ALERTS_CRITICAL)${NC}"
      ALERTS_TRIGGERED=$((ALERTS_TRIGGERED + 1))
    fi
    
    if [ "$ALERTS_TRIGGERED" -eq 0 ]; then
      echo -e "${GREEN}✅ All thresholds within acceptable ranges${NC}"
    fi
    echo ""
  else
    echo "jq not installed - showing raw response:"
    echo "$HEALTH_BODY"
    echo ""
  fi
else
  echo -e "${RED}❌ Failed to fetch health metrics${NC}"
  echo ""
fi

# Check response time
echo "4. Response Time Check"
START=$(date +%s%N)
curl -s "$APP_URL" > /dev/null || true
END=$(date +%s%N)
DURATION=$(( ($END - $START) / 1000000 ))
echo "Response time: ${DURATION}ms"
if [ $DURATION -gt 5000 ]; then
  echo -e "${RED}⚠️ SLOW (>5s threshold)${NC}"
elif [ $DURATION -gt 3000 ]; then
  echo -e "${YELLOW}⚠️ WARNING (>3s target)${NC}"
else
  echo -e "${GREEN}✅ GOOD (<3s)${NC}"
fi
echo ""

# Check Fly machine status
echo "5. Machine Status"
if command -v flyctl &> /dev/null; then
  flyctl status --app hotdash-staging 2>/dev/null | grep -E "STATE|CHECKS" || echo "Unable to fetch machine status"
else
  echo "Fly CLI not available"
fi
echo ""

echo "=== Health Check Complete ==="

