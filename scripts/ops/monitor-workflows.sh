#!/usr/bin/env bash
# Monitor GitHub Actions workflow health
set -euo pipefail

THRESHOLD=${WORKFLOW_FAILURE_THRESHOLD:-2}
LOOKBACK=${WORKFLOW_LOOKBACK:-10}

echo "🔍 Monitoring GitHub Actions workflows..."
echo "Threshold: $THRESHOLD failures in last $LOOKBACK runs"
echo ""

# Get failure count
FAILURE_COUNT=$(gh run list --limit "$LOOKBACK" --json conclusion \
  --jq '[.[] | select(.conclusion=="failure")] | length')

TOTAL_RUNS=$(gh run list --limit "$LOOKBACK" --json conclusion --jq 'length')
SUCCESS_RATE=$(awk "BEGIN {printf \"%.1f\", (($TOTAL_RUNS - $FAILURE_COUNT) / $TOTAL_RUNS) * 100}")

echo "📊 Workflow Health:"
echo "  Total runs: $TOTAL_RUNS"
echo "  Failures: $FAILURE_COUNT"
echo "  Success rate: ${SUCCESS_RATE}%"
echo ""

if [ "$FAILURE_COUNT" -gt "$THRESHOLD" ]; then
  echo "⚠️  WARNING: $FAILURE_COUNT failed workflows (threshold: $THRESHOLD)"
  echo ""
  echo "Recent failures:"
  gh run list --limit "$LOOKBACK" --json conclusion,name,createdAt,headBranch \
    --jq '.[] | select(.conclusion=="failure") | "  - \(.name) (\(.headBranch)) at \(.createdAt)"'
  echo ""
  exit 1
else
  echo "✅ Workflow health: OK"
  exit 0
fi

