#!/bin/bash
#
# Chatwoot Performance Monitoring Script
# Purpose: Monitor API response times, webhook latency, and conversation metrics
# Usage: ./scripts/ops/monitor-chatwoot-performance.sh [--interval SECONDS] [--duration MINUTES]
#
# Requirements:
# - Chatwoot API token in vault/occ/chatwoot/api_token_staging.env
# - curl, jq, bc installed

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
VAULT_FILE="$PROJECT_ROOT/vault/occ/chatwoot/api_token_staging.env"
ARTIFACTS_DIR="$PROJECT_ROOT/artifacts/chatwoot/performance-$(date -u +%Y%m%dT%H%M%SZ)"

# Default values
INTERVAL=60  # seconds between checks
DURATION=5   # minutes to monitor
ALERT_THRESHOLD_MS=2000  # alert if response time > 2s

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --interval)
      INTERVAL="$2"
      shift 2
      ;;
    --duration)
      DURATION="$2"
      shift 2
      ;;
    --threshold)
      ALERT_THRESHOLD_MS="$2"
      shift 2
      ;;
    --help|-h)
      echo "Usage: $0 [OPTIONS]"
      echo ""
      echo "Options:"
      echo "  --interval SECONDS    Check interval (default: 60)"
      echo "  --duration MINUTES    Total monitoring duration (default: 5)"
      echo "  --threshold MS        Alert threshold in ms (default: 2000)"
      echo "  --help, -h            Show this help"
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

# Create artifacts directory
mkdir -p "$ARTIFACTS_DIR"

# Load credentials
if [ ! -f "$VAULT_FILE" ]; then
    echo "Error: Vault file not found: $VAULT_FILE"
    exit 1
fi

source "$VAULT_FILE"

CHATWOOT_BASE_URL="https://hotdash-chatwoot.fly.dev"
API_TOKEN="$CHATWOOT_API_TOKEN_STAGING"
ACCOUNT_ID="${CHATWOOT_ACCOUNT_ID_STAGING:-1}"

echo "================================="
echo "Chatwoot Performance Monitor"
echo "================================="
echo ""
echo "Configuration:"
echo "  Base URL: $CHATWOOT_BASE_URL"
echo "  Interval: ${INTERVAL}s"
echo "  Duration: ${DURATION}min"
echo "  Alert Threshold: ${ALERT_THRESHOLD_MS}ms"
echo "  Artifacts: $ARTIFACTS_DIR"
echo ""

# Calculate iterations
ITERATIONS=$((DURATION * 60 / INTERVAL))
echo "Will run $ITERATIONS checks over $DURATION minutes"
echo ""

# Initialize metrics file
METRICS_FILE="$ARTIFACTS_DIR/metrics.jsonl"
touch "$METRICS_FILE"

# Metrics arrays
declare -a response_times
declare -a health_checks
declare -a conversation_counts

# Monitoring function
check_performance() {
  local iteration=$1
  local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
  
  echo "[$timestamp] Check $iteration/$ITERATIONS"
  
  # 1. Health check
  local health_start=$(date +%s%3N)
  local health_response=$(curl -s https://hotdash-chatwoot.fly.dev/api 2>/dev/null || echo '{"error":"failed"}')
  local health_end=$(date +%s%3N)
  local health_time=$((health_end - health_start))
  
  health_checks+=($health_time)
  
  # 2. API conversations list
  local api_start=$(date +%s%3N)
  local conv_response=$(curl -s -H "api_access_token: $API_TOKEN" \
    "$CHATWOOT_BASE_URL/api/v1/accounts/$ACCOUNT_ID/conversations?page=1" 2>/dev/null || echo '{"data":{"meta":{}}}')
  local api_end=$(date +%s%3N)
  local api_time=$((api_end - api_start))
  
  response_times+=($api_time)
  
  # 3. Extract conversation metrics
  local conv_count=$(echo "$conv_response" | jq -r '.data.meta.all_count // 0' 2>/dev/null || echo "0")
  local open_count=$(echo "$conv_response" | jq -r '.data.meta.mine_count // 0' 2>/dev/null || echo "0")
  conversation_counts+=($conv_count)
  
  # 4. Check queue services
  local queue_status=$(echo "$health_response" | jq -r '.queue_services // "unknown"' 2>/dev/null)
  local data_status=$(echo "$health_response" | jq -r '.data_services // "unknown"' 2>/dev/null)
  
  # Write to JSONL
  cat >> "$METRICS_FILE" << EOF
{"timestamp":"$timestamp","health_time_ms":$health_time,"api_time_ms":$api_time,"conversation_count":$conv_count,"open_count":$open_count,"queue_status":"$queue_status","data_status":"$data_status"}
EOF
  
  # Display results
  echo "  Health check: ${health_time}ms"
  echo "  API response: ${api_time}ms"
  echo "  Conversations: $conv_count total, $open_count open"
  echo "  Services: queue=$queue_status, data=$data_status"
  
  # Alert if threshold exceeded
  if [ "$api_time" -gt "$ALERT_THRESHOLD_MS" ]; then
    echo "  ⚠️  ALERT: API response time (${api_time}ms) exceeds threshold (${ALERT_THRESHOLD_MS}ms)"
  fi
  
  if [ "$queue_status" != "ok" ] || [ "$data_status" != "ok" ]; then
    echo "  ⚠️  ALERT: Service degradation detected"
  fi
  
  echo ""
}

# Run monitoring loop
for i in $(seq 1 $ITERATIONS); do
  check_performance $i
  
  # Sleep unless last iteration
  if [ $i -lt $ITERATIONS ]; then
    sleep $INTERVAL
  fi
done

# Calculate statistics
echo "================================="
echo "Performance Summary"
echo "================================="
echo ""

# Health check stats
if [ ${#health_checks[@]} -gt 0 ]; then
  health_sum=0
  health_min=${health_checks[0]}
  health_max=${health_checks[0]}
  
  for time in "${health_checks[@]}"; do
    health_sum=$((health_sum + time))
    if [ $time -lt $health_min ]; then health_min=$time; fi
    if [ $time -gt $health_max ]; then health_max=$time; fi
  done
  
  health_avg=$((health_sum / ${#health_checks[@]}))
  
  echo "Health Check Response Times:"
  echo "  Average: ${health_avg}ms"
  echo "  Min: ${health_min}ms"
  echo "  Max: ${health_max}ms"
  echo ""
fi

# API response stats
if [ ${#response_times[@]} -gt 0 ]; then
  api_sum=0
  api_min=${response_times[0]}
  api_max=${response_times[0]}
  alerts=0
  
  for time in "${response_times[@]}"; do
    api_sum=$((api_sum + time))
    if [ $time -lt $api_min ]; then api_min=$time; fi
    if [ $time -gt $api_max ]; then api_max=$time; fi
    if [ $time -gt $ALERT_THRESHOLD_MS ]; then alerts=$((alerts + 1)); fi
  done
  
  api_avg=$((api_sum / ${#response_times[@]}))
  
  echo "API Response Times:"
  echo "  Average: ${api_avg}ms"
  echo "  Min: ${api_min}ms"
  echo "  Max: ${api_max}ms"
  echo "  Alerts: $alerts / ${#response_times[@]}"
  echo ""
fi

# Conversation volume
if [ ${#conversation_counts[@]} -gt 0 ]; then
  conv_sum=0
  for count in "${conversation_counts[@]}"; do
    conv_sum=$((conv_sum + count))
  done
  conv_avg=$((conv_sum / ${#conversation_counts[@]}))
  
  echo "Conversation Volume:"
  echo "  Average: $conv_avg conversations"
  echo "  Last check: ${conversation_counts[-1]} conversations"
  echo ""
fi

# Generate report
cat > "$ARTIFACTS_DIR/report.md" << EOF
# Chatwoot Performance Report

**Date:** $(date -u +"%Y-%m-%d %H:%M:%S UTC")
**Duration:** $DURATION minutes
**Interval:** $INTERVAL seconds
**Checks:** $ITERATIONS

## Summary

### Health Check
- Average: ${health_avg}ms
- Min: ${health_min}ms
- Max: ${health_max}ms

### API Response Times
- Average: ${api_avg}ms
- Min: ${api_min}ms
- Max: ${api_max}ms
- Threshold Violations: $alerts / $ITERATIONS

### Conversation Volume
- Average: $conv_avg conversations

## Performance Status

$(if [ $api_avg -lt 1000 ]; then echo "✅ GOOD - Average response time < 1s"; elif [ $api_avg -lt 2000 ]; then echo "⚠️  ACCEPTABLE - Average response time < 2s"; else echo "🔴 POOR - Average response time > 2s"; fi)

$(if [ $alerts -eq 0 ]; then echo "✅ No threshold violations"; else echo "⚠️  $alerts threshold violations detected"; fi)

## Recommendations

$(if [ $api_avg -gt 1500 ]; then echo "- Consider scaling Chatwoot workers"; fi)
$(if [ $alerts -gt $((ITERATIONS / 4)) ]; then echo "- Investigate performance bottlenecks"; fi)
$(if [ $conv_avg -gt 50 ]; then echo "- Monitor conversation volume, consider additional agents"; fi)

## Data Files

- Metrics: $ARTIFACTS_DIR/metrics.jsonl
- Report: $ARTIFACTS_DIR/report.md

EOF

echo "Performance report saved to: $ARTIFACTS_DIR/report.md"
echo "Metrics data saved to: $ARTIFACTS_DIR/metrics.jsonl"
echo ""

# Final status
if [ $api_avg -lt 1000 ] && [ $alerts -eq 0 ]; then
  echo "✅ Performance is GOOD"
  exit 0
elif [ $api_avg -lt 2000 ]; then
  echo "⚠️  Performance is ACCEPTABLE"
  exit 0
else
  echo "🔴 Performance is POOR - Investigation needed"
  exit 1
fi

