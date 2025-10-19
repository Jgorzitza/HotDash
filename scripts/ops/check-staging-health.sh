#!/usr/bin/env bash
# Check staging environment health
set -euo pipefail

STAGING_URL="${STAGING_URL:-https://hotdash-staging.fly.dev}"
TIMEOUT=${HEALTH_CHECK_TIMEOUT:-10}

echo "🏥 Checking staging environment health..."
echo "URL: $STAGING_URL"
echo "Timeout: ${TIMEOUT}s"
echo ""

FAILURES=0

# Check 1: Basic health endpoint
echo "🔍 Testing /health..."
if curl -f -m "$TIMEOUT" --silent "${STAGING_URL}/health" > /dev/null; then
  echo "✅ /health: OK"
else
  echo "❌ /health: FAILED"
  ((FAILURES++))
fi

# Check 2: API health endpoint  
echo "🔍 Testing /api/health..."
if curl -f -m "$TIMEOUT" --silent "${STAGING_URL}/api/health" > /dev/null; then
  echo "✅ /api/health: OK"
else
  echo "❌ /api/health: FAILED"
  ((FAILURES++))
fi

# Check 3: Response time
echo "🔍 Testing response time..."
RESPONSE_TIME=$(curl -o /dev/null -s -w '%{time_total}' -m "$TIMEOUT" "${STAGING_URL}/health" 2>&1 || echo "999")
RESPONSE_MS=$(awk "BEGIN {printf \"%.0f\", $RESPONSE_TIME * 1000}")

if [ "$RESPONSE_MS" -lt 3000 ]; then
  echo "✅ Response time: ${RESPONSE_MS}ms (target <3000ms)"
else
  echo "⚠️  Response time: ${RESPONSE_MS}ms (exceeds 3000ms target)"
fi

# Check 4: SSL certificate
echo "🔍 Testing SSL certificate..."
if curl -f -m "$TIMEOUT" --silent "${STAGING_URL}" > /dev/null 2>&1; then
  echo "✅ SSL: Valid"
else
  echo "⚠️  SSL: Check failed (may not be configured yet)"
fi

# Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━"
if [ "$FAILURES" -eq 0 ]; then
  echo "✅ Staging health: ALL CHECKS PASSED"
  exit 0
else
  echo "❌ Staging health: $FAILURES check(s) failed"
  exit 1
fi

