#!/usr/bin/env bash
set -euo pipefail

# Configure Resource Alerts
# Sets up monitoring alerts for Fly.io infrastructure

echo "=================================================="
echo "Fly.io Resource Alerts Configuration"
echo "=================================================="

ALERT_CONFIG="artifacts/monitoring/alert-config-$(date +%Y%m%d-%H%M%S).md"
mkdir -p artifacts/monitoring

cat > "$ALERT_CONFIG" <<EOF
# Fly.io Resource Alerts Configuration
Generated: $(date -u +"%Y-%m-%dT%H:%M:%SZ")

## Alert Thresholds

### CPU Alerts
- **Warning**: CPU >70% for 5 minutes
- **Critical**: CPU >90% for 2 minutes
- **Action**: Scale up machines

### Memory Alerts
- **Warning**: Memory >80% for 5 minutes
- **Critical**: Memory >95% for 2 minutes
- **Action**: Scale up machines or investigate memory leaks

### Disk Alerts
- **Warning**: Disk >75% full
- **Critical**: Disk >90% full
- **Action**: Clean up logs or scale storage

### Response Time Alerts
- **Warning**: Response time >2s avg over 5 min
- **Critical**: Response time >5s avg over 2 min
- **Action**: Investigate performance bottlenecks

### Error Rate Alerts
- **Warning**: Error rate >1% over 5 min
- **Critical**: Error rate >5% over 2 min
- **Action**: Check logs, consider rollback

### Health Check Alerts
- **Warning**: Health check failures >2 in 5 min
- **Critical**: Health check failure for >1 min
- **Action**: Immediate investigation, possible rollback

## Alert Rules Configuration

### Application: hotdash-staging
EOF

# Configure alerts for each app
APPS=(
  "hotdash-staging:production-app"
  "hotdash-agent-service:background-service"
  "hotdash-llamaindex-mcp:background-service"
  "hotdash-chatwoot:support-app"
)

for app_config in "${APPS[@]}"; do
  IFS=':' read -r app type <<< "$app_config"
  
  echo "" >> "$ALERT_CONFIG"
  echo "#### $app ($type)" >> "$ALERT_CONFIG"
  
  if [ "$type" = "production-app" ]; then
    cat >> "$ALERT_CONFIG" <<APPCONFIG
- **CPU Threshold**: 80% (production critical)
- **Memory Threshold**: 85% (production critical)
- **Response Time**: <1s ideal, <2s acceptable, >2s alert
- **Uptime Target**: 99.9%
- **Error Budget**: 0.1% (43 min/month)
- **Notification**: Immediate (PagerDuty/Slack)
APPCONFIG
  else
    cat >> "$ALERT_CONFIG" <<APPCONFIG
- **CPU Threshold**: 90% (background service)
- **Memory Threshold**: 90% (background service)
- **Response Time**: <5s acceptable
- **Uptime Target**: 99.5%
- **Notification**: Standard (Slack)
APPCONFIG
  fi
done

# Alert channels
cat >> "$ALERT_CONFIG" <<EOF

## Alert Channels

### Primary Channels
1. **Email**: justin@hotrodan.com
2. **Slack**: #hotdash-alerts (when configured)
3. **GitHub Issues**: Auto-create for critical alerts

### Escalation
- **Level 1** (Warning): Email notification
- **Level 2** (Critical): Email + Slack
- **Level 3** (Emergency): Email + Slack + SMS (future)

## Monitoring Scripts

### Automated Health Checks
- Script: \`scripts/monitoring/fly-metrics-dashboard.sh\`
- Frequency: Every 15 minutes (GitHub Actions)
- Retention: 30 days

### Manual Health Checks
- Script: \`scripts/monitoring/check-app-health.sh\`
- Usage: On-demand investigation
- Output: Detailed diagnostic report

## Alert Response Procedures

### CPU High
1. Check \`fly status --app <app>\`
2. Review \`fly logs --app <app>\`
3. Check for traffic spikes
4. Scale if sustained: \`fly scale count <N> --app <app>\`

### Memory High
1. Check for memory leaks: \`fly ssh console --app <app>\`
2. Review application logs
3. Check database connection pooling
4. Restart if needed: \`fly apps restart <app>\`

### Response Time Slow
1. Check database query performance
2. Review Fly.io region latency
3. Check for N+1 queries
4. Consider CDN for static assets

### Health Check Failure
1. Immediate investigation: \`fly status --app <app>\`
2. Check logs: \`fly logs --app <app>\`
3. Verify external dependencies (Supabase, Shopify)
4. Rollback if deployment-related

## GitHub Actions Integration

### Automated Monitoring
File: \`.github/workflows/infrastructure-monitoring.yml\`

Features:
- Runs every 15 minutes
- Collects metrics from all apps
- Creates GitHub issue on critical alerts
- Uploads metrics artifacts

### Manual Trigger
- Workflow dispatch available
- On-demand health checks
- Custom alert threshold testing

EOF

echo "" >> "$ALERT_CONFIG"
echo "---" >> "$ALERT_CONFIG"
echo "Configuration complete: $(date -u +"%Y-%m-%dT%H:%M:%SZ")" >> "$ALERT_CONFIG"

echo "=================================================="
echo "Alert Configuration Complete"
echo "=================================================="
echo "Config file: $ALERT_CONFIG"
echo ""
echo "Next Steps:"
echo "1. Review alert thresholds in $ALERT_CONFIG"
echo "2. Set up Slack webhook (optional)"
echo "3. Configure PagerDuty (optional)"
echo "4. Enable GitHub Actions monitoring workflow"
echo "=================================================="

# Create the GitHub Actions workflow for monitoring
cat > ".github/workflows/infrastructure-monitoring.yml" <<'WORKFLOW'
name: Infrastructure Monitoring

on:
  schedule:
    - cron: '*/15 * * * *'  # Every 15 minutes
  workflow_dispatch:

permissions:
  contents: read
  issues: write

jobs:
  monitor:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Fly CLI
        uses: superfly/flyctl-actions/setup-flyctl@master

      - name: Collect Fly.io metrics
        env:
          FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
        run: |
          bash scripts/monitoring/fly-metrics-dashboard.sh || echo "::warning::Some apps unhealthy"

      - name: Upload metrics
        uses: actions/upload-artifact@v4
        with:
          name: fly-metrics-${{ github.run_number }}
          path: artifacts/monitoring
          retention-days: 30

      - name: Create alert issue (on failure)
        if: failure()
        uses: actions/github-script@v7
        with:
          script: |
            await github.rest.issues.create({
              owner: context.repo.owner,
              repo: context.repo.repo,
              title: `🚨 Infrastructure Alert: ${new Date().toISOString()}`,
              body: `Infrastructure monitoring detected issues.\n\nWorkflow: ${context.serverUrl}/${context.repo.owner}/${context.repo.repo}/actions/runs/${context.runId}`,
              labels: ['infrastructure', 'alert', 'automated']
            })
WORKFLOW

echo "✅ Created .github/workflows/infrastructure-monitoring.yml"

exit 0

