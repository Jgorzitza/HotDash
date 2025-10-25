#!/bin/bash
# Staging Health Check Script
# Checks health endpoint, logs, and performance metrics

echo "=== HotDash Staging Health Check ==="
echo "Timestamp: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
echo ""

# Check health endpoint
echo "1. Health Endpoint Check"
HEALTH_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://hotdash-staging.fly.dev/health)
if [ "$HEALTH_CODE" = "200" ]; then
  echo "✅ HEALTHY (HTTP $HEALTH_CODE)"
else
  echo "❌ UNHEALTHY (HTTP $HEALTH_CODE)"
fi
echo ""

# Check response time
echo "2. Response Time Check"
START=$(date +%s%N)
curl -s https://hotdash-staging.fly.dev/ > /dev/null
END=$(date +%s%N)
DURATION=$(( ($END - $START) / 1000000 ))
echo "Response time: ${DURATION}ms"
if [ $DURATION -gt 5000 ]; then
  echo "⚠️ SLOW (>5s threshold)"
elif [ $DURATION -gt 3000 ]; then
  echo "⚠️ WARNING (>3s target)"
else
  echo "✅ GOOD (<3s)"
fi
echo ""

# Check Fly machine status
echo "3. Machine Status"
flyctl status --app hotdash-staging 2>/dev/null | grep -E "STATE|CHECKS" || echo "Fly CLI not available"
echo ""

# Check for errors in recent logs
echo "4. Recent Error Check"
ERROR_COUNT=$(flyctl logs --app hotdash-staging 2>/dev/null | grep -iE "error|ERROR|fail|FAIL" | wc -l)
echo "Errors in logs: $ERROR_COUNT"
if [ $ERROR_COUNT -eq 0 ]; then
  echo "✅ NO ERRORS"
else
  echo "⚠️ $ERROR_COUNT errors found - review logs"
fi
echo ""

echo "=== Health Check Complete ==="


