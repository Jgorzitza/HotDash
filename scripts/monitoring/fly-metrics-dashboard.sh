#!/usr/bin/env bash
set -euo pipefail

# Fly.io Metrics Dashboard
# Collects and displays infrastructure metrics from all Fly.io apps

echo "=================================================="
echo "Fly.io Infrastructure Metrics Dashboard"
echo "=================================================="
echo "Timestamp: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
echo "=================================================="

METRICS_LOG="artifacts/monitoring/fly-metrics-$(date +%Y%m%d-%H%M%S).md"
mkdir -p artifacts/monitoring

cat > "$METRICS_LOG" <<EOF
# Fly.io Infrastructure Metrics
Generated: $(date -u +"%Y-%m-%dT%H:%M:%SZ")

## Applications

EOF

# List of Fly apps to monitor
APPS=(
  "hotdash-staging"
  "hotdash-agent-service"
  "hotdash-llamaindex-mcp"
  "hotdash-chatwoot"
)

# Check each app
for app in "${APPS[@]}"; do
  echo "### $app" | tee -a "$METRICS_LOG"
  echo "" >> "$METRICS_LOG"
  
  # Get app status
  echo "Fetching status for $app..."
  if fly status --app "$app" > /tmp/fly-status-$app.txt 2>&1; then
    echo "#### Status" >> "$METRICS_LOG"
    echo '```' >> "$METRICS_LOG"
    cat /tmp/fly-status-$app.txt | head -20 >> "$METRICS_LOG"
    echo '```' >> "$METRICS_LOG"
    echo "" >> "$METRICS_LOG"
    
    # Extract key metrics
    MACHINES=$(cat /tmp/fly-status-$app.txt | grep -c "started" || echo "0")
    HEALTHY=$(cat /tmp/fly-status-$app.txt | grep -c "passing" || echo "0")
    
    echo "- **Machines**: $MACHINES" | tee -a "$METRICS_LOG"
    echo "- **Healthy**: $HEALTHY" | tee -a "$METRICS_LOG"
    
    # Health status
    if [ "$HEALTHY" -gt 0 ]; then
      echo "- **Health**: ✅ HEALTHY" | tee -a "$METRICS_LOG"
    else
      echo "- **Health**: ❌ UNHEALTHY" | tee -a "$METRICS_LOG"
    fi
  else
    echo "- **Status**: ❌ ERROR fetching status" | tee -a "$METRICS_LOG"
  fi
  
  echo "" >> "$METRICS_LOG"
done

# Resource allocation summary
echo "## Resource Allocation" >> "$METRICS_LOG"
echo "" >> "$METRICS_LOG"

for app in "${APPS[@]}"; do
  if [ -f "/tmp/fly-status-$app.txt" ]; then
    # Extract VM size/resources if available
    if grep -q "VM" /tmp/fly-status-$app.txt; then
      echo "### $app Resources" >> "$METRICS_LOG"
      grep -A 2 "VM" /tmp/fly-status-$app.txt >> "$METRICS_LOG" || echo "- Resources: Standard" >> "$METRICS_LOG"
      echo "" >> "$METRICS_LOG"
    fi
  fi
done

# Recent deployments
echo "## Recent Activity" >> "$METRICS_LOG"
echo "" >> "$METRICS_LOG"

for app in "${APPS[@]}"; do
  echo "### $app Releases" >> "$METRICS_LOG"
  if fly releases --app "$app" -j 5 > /tmp/fly-releases-$app.txt 2>&1; then
    echo '```' >> "$METRICS_LOG"
    cat /tmp/fly-releases-$app.txt | head -10 >> "$METRICS_LOG"
    echo '```' >> "$METRICS_LOG"
  else
    echo "- No release info available" >> "$METRICS_LOG"
  fi
  echo "" >> "$METRICS_LOG"
done

# Overall health summary
echo "## Health Summary" >> "$METRICS_LOG"
echo "" >> "$METRICS_LOG"

TOTAL_APPS=${#APPS[@]}
HEALTHY_APPS=0

for app in "${APPS[@]}"; do
  if [ -f "/tmp/fly-status-$app.txt" ]; then
    if grep -q "passing" /tmp/fly-status-$app.txt; then
      ((HEALTHY_APPS++))
    fi
  fi
done

echo "- **Total Apps**: $TOTAL_APPS" | tee -a "$METRICS_LOG"
echo "- **Healthy Apps**: $HEALTHY_APPS" | tee -a "$METRICS_LOG"
echo "- **Health Rate**: $(( HEALTHY_APPS * 100 / TOTAL_APPS ))%" | tee -a "$METRICS_LOG"

if [ $HEALTHY_APPS -eq $TOTAL_APPS ]; then
  echo "- **Status**: ✅ ALL HEALTHY" | tee -a "$METRICS_LOG"
else
  echo "- **Status**: ⚠️ SOME UNHEALTHY" | tee -a "$METRICS_LOG"
fi

echo "" >> "$METRICS_LOG"
echo "---" >> "$METRICS_LOG"
echo "Report generated: $(date -u +"%Y-%m-%dT%H:%M:%SZ")" >> "$METRICS_LOG"

echo "=================================================="
echo "Metrics Collection Complete"
echo "=================================================="
echo "Healthy Apps: $HEALTHY_APPS/$TOTAL_APPS"
echo "Report: $METRICS_LOG"
echo "=================================================="

# Clean up temp files
rm -f /tmp/fly-status-*.txt /tmp/fly-releases-*.txt

# Exit with error if any apps unhealthy
if [ $HEALTHY_APPS -lt $TOTAL_APPS ]; then
  echo "⚠️  WARNING: Some apps are unhealthy!"
  exit 1
fi

exit 0

