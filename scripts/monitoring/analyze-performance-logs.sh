#!/bin/bash
# Performance Log Analysis Script
# Extracts performance metrics from Fly.io logs

echo "=== Performance Log Analysis ==="
echo "App: hotdash-staging"
echo "Timestamp: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
echo ""

# Get logs
echo "Fetching recent logs..."
LOGS=$(flyctl logs --app hotdash-staging 2>/dev/null | tail -500)

# Extract response times (from Express/React Router logs)
echo "1. Response Times"
echo "$LOGS" | grep -E "GET.*[0-9]+\.[0-9]+ ms" | awk '{print $(NF-1)}' | sort -n | tail -20 | awk '
BEGIN {count=0; sum=0}
{
  gsub(/ms/, "", $1)
  sum += $1
  count++
  times[count] = $1
}
END {
  if (count > 0) {
    avg = sum / count
    printf "   Avg: %.2f ms\n", avg
    printf "   Min: %.2f ms\n", times[1]
    printf "   Max: %.2f ms\n", times[count]
    if (count >= 10) {
      p95_idx = int(count * 0.95)
      printf "   P95: %.2f ms\n", times[p95_idx]
    }
  }
}'
echo ""

# Count errors
echo "2. Error Summary"
ERROR_COUNT=$(echo "$LOGS" | grep -icE "error|fail")
echo "   Total errors: $ERROR_COUNT"
if [ $ERROR_COUNT -gt 0 ]; then
  echo "   Recent errors:"
  echo "$LOGS" | grep -iE "error|fail" | tail -5
fi
echo ""

# Check for common issues
echo "3. Common Issues"
DB_ERRORS=$(echo "$LOGS" | grep -ic "database\|postgres\|prisma")
if [ $DB_ERRORS -gt 0 ]; then
  echo "   ⚠️ Database-related logs: $DB_ERRORS"
fi

TIMEOUT_ERRORS=$(echo "$LOGS" | grep -ic "timeout\|timed out")
if [ $TIMEOUT_ERRORS -gt 0 ]; then
  echo "   ⚠️ Timeout errors: $TIMEOUT_ERRORS"
fi

MEMORY_WARNINGS=$(echo "$LOGS" | grep -ic "out of memory\|oom")
if [ $MEMORY_WARNINGS -gt 0 ]; then
  echo "   ⚠️ Memory warnings: $MEMORY_WARNINGS"
fi

echo ""
echo "=== Analysis Complete ==="


