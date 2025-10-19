#!/usr/bin/env bash
# Collect baseline performance metrics
set -euo pipefail

APP_URL="${APP_URL:-https://hotdash-app.fly.dev}"
OUTPUT_DIR="artifacts/metrics/$(date +%Y-%m-%d)"
TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%SZ)

mkdir -p "$OUTPUT_DIR"

echo "📊 Collecting performance metrics..."
echo "URL: $APP_URL"
echo "Output: $OUTPUT_DIR"
echo ""

# Collect health endpoint response time
echo "🔍 Testing /health endpoint..."
HEALTH_TIME=$(curl -o /dev/null -s -w '%{time_total}' "${APP_URL}/health" 2>&1 || echo "999")
HEALTH_MS=$(awk "BEGIN {printf \"%.0f\", $HEALTH_TIME * 1000}")
echo "Response time: ${HEALTH_MS}ms"

# Collect API health endpoint
echo "🔍 Testing /api/health endpoint..."
API_HEALTH_TIME=$(curl -o /dev/null -s -w '%{time_total}' "${APP_URL}/api/health" 2>&1 || echo "999")
API_HEALTH_MS=$(awk "BEGIN {printf \"%.0f\", $API_HEALTH_TIME * 1000}")
echo "Response time: ${API_HEALTH_MS}ms"

# Save metrics to JSON
cat > "${OUTPUT_DIR}/metrics-${TIMESTAMP}.json" << EOF
{
  "timestamp": "$TIMESTAMP",
  "app_url": "$APP_URL",
  "metrics": {
    "health_endpoint": {
      "url": "${APP_URL}/health",
      "response_time_ms": ${HEALTH_MS},
      "target_ms": 3000,
      "status": "$([ "$HEALTH_MS" -lt 3000 ] && echo 'ok' || echo 'slow')"
    },
    "api_health_endpoint": {
      "url": "${APP_URL}/api/health",
      "response_time_ms": ${API_HEALTH_MS},
      "target_ms": 3000,
      "status": "$([ "$API_HEALTH_MS" -lt 3000 ] && echo 'ok' || echo 'slow')"
    }
  },
  "targets": {
    "p95_response_time_ms": 3000,
    "error_rate_percent": 0.1,
    "uptime_percent": 99.9
  }
}
EOF

# Display summary
cat "${OUTPUT_DIR}/metrics-${TIMESTAMP}.json" | jq '.'

echo ""
echo "✅ Metrics collected: ${OUTPUT_DIR}/metrics-${TIMESTAMP}.json"

