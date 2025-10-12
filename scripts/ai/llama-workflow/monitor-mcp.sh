#!/bin/bash
# LlamaIndex MCP Health Monitor
# Tracks latency, errors, and uptime

MCP_URL="https://hotdash-llamaindex-mcp.fly.dev"
LOG_DIR="packages/memory/logs/monitoring"
mkdir -p "$LOG_DIR"

TIMESTAMP=$(date -Iseconds)
LOG_FILE="$LOG_DIR/mcp-health-$(date +%Y-%m-%d).jsonl"

echo "🔍 Monitoring LlamaIndex MCP Server"
echo "Endpoint: $MCP_URL"
echo "Log: $LOG_FILE"
echo ""

# Health check
echo "Checking /health endpoint..."
HEALTH_START=$(date +%s%3N)
HEALTH_RESPONSE=$(curl -s -w "\n%{http_code}" "$MCP_URL/health")
HEALTH_END=$(date +%s%3N)
HEALTH_CODE=$(echo "$HEALTH_RESPONSE" | tail -1)
HEALTH_BODY=$(echo "$HEALTH_RESPONSE" | sed '$d')
HEALTH_LATENCY=$((HEALTH_END - HEALTH_START))

echo "  Status: $HEALTH_CODE"
echo "  Latency: ${HEALTH_LATENCY}ms"
echo ""

# Metrics check
echo "Checking /metrics endpoint..."
METRICS_START=$(date +%s%3N)
METRICS_RESPONSE=$(curl -s "$MCP_URL/metrics")
METRICS_END=$(date +%s%3N)
METRICS_LATENCY=$((METRICS_END - METRICS_START))

echo "  Latency: ${METRICS_LATENCY}ms"
echo ""

# Parse metrics
UPTIME=$(echo "$METRICS_RESPONSE" | jq -r '.uptime // "unknown"')
QUERY_CALLS=$(echo "$METRICS_RESPONSE" | jq -r '.tools.query_support.calls // 0')
QUERY_ERRORS=$(echo "$METRICS_RESPONSE" | jq -r '.tools.query_support.errors // 0')
QUERY_ERROR_RATE=$(echo "$METRICS_RESPONSE" | jq -r '.tools.query_support.errorRate // "0%"')
QUERY_AVG_LATENCY=$(echo "$METRICS_RESPONSE" | jq -r '.tools.query_support.avgLatencyMs // 0')
QUERY_P95_LATENCY=$(echo "$METRICS_RESPONSE" | jq -r '.tools.query_support.p95LatencyMs // 0')

echo "Current Metrics:"
echo "  Uptime: ${UPTIME}s"
echo "  query_support calls: $QUERY_CALLS"
echo "  query_support errors: $QUERY_ERRORS ($QUERY_ERROR_RATE)"
echo "  query_support avg latency: ${QUERY_AVG_LATENCY}ms"
echo "  query_support P95 latency: ${QUERY_P95_LATENCY}ms"
echo ""

# Determine health status
HEALTH_STATUS="healthy"
ALERTS=()

if [ "$HEALTH_CODE" != "200" ]; then
  HEALTH_STATUS="unhealthy"
  ALERTS+=("Health endpoint returned $HEALTH_CODE")
fi

if [ "$HEALTH_LATENCY" -gt 1000 ]; then
  HEALTH_STATUS="degraded"
  ALERTS+=("Health endpoint latency ${HEALTH_LATENCY}ms > 1000ms")
fi

if [ "$QUERY_P95_LATENCY" -gt 500 ]; then
  HEALTH_STATUS="degraded"
  ALERTS+=("query_support P95 latency ${QUERY_P95_LATENCY}ms > 500ms (target)")
fi

ERROR_RATE_NUM=$(echo "$QUERY_ERROR_RATE" | tr -d '%')
if [ ! -z "$ERROR_RATE_NUM" ] && [ "$ERROR_RATE_NUM" != "0" ] && [ $(echo "$ERROR_RATE_NUM > 1" | bc -l) -eq 1 ]; then
  HEALTH_STATUS="degraded"
  ALERTS+=("query_support error rate $QUERY_ERROR_RATE > 1% (target)")
fi

# Log to JSONL
LOG_ENTRY=$(jq -n \
  --arg ts "$TIMESTAMP" \
  --arg status "$HEALTH_STATUS" \
  --argjson health_latency "$HEALTH_LATENCY" \
  --argjson metrics_latency "$METRICS_LATENCY" \
  --arg uptime "$UPTIME" \
  --argjson query_calls "$QUERY_CALLS" \
  --argjson query_errors "$QUERY_ERRORS" \
  --arg query_error_rate "$QUERY_ERROR_RATE" \
  --argjson query_avg_latency "$QUERY_AVG_LATENCY" \
  --argjson query_p95_latency "$QUERY_P95_LATENCY" \
  --argjson alerts "$(printf '%s\n' "${ALERTS[@]}" | jq -R . | jq -s .)" \
  '{
    timestamp: $ts,
    status: $status,
    endpoints: {
      health: { latencyMs: $health_latency },
      metrics: { latencyMs: $metrics_latency }
    },
    uptime: $uptime,
    tools: {
      query_support: {
        calls: $query_calls,
        errors: $query_errors,
        errorRate: $query_error_rate,
        avgLatencyMs: $query_avg_latency,
        p95LatencyMs: $query_p95_latency
      }
    },
    alerts: $alerts
  }')

echo "$LOG_ENTRY" >> "$LOG_FILE"

# Display summary
echo "Health Status: $HEALTH_STATUS"
if [ ${#ALERTS[@]} -gt 0 ]; then
  echo ""
  echo "⚠️  Alerts:"
  for alert in "${ALERTS[@]}"; do
    echo "  - $alert"
  done
fi

echo ""
echo "✅ Monitoring data logged to: $LOG_FILE"

# Return exit code based on health
if [ "$HEALTH_STATUS" = "healthy" ]; then
  exit 0
else
  exit 1
fi

