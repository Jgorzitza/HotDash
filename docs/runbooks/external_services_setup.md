# External Services Setup Guide

## Overview

This guide provides instructions for setting up external services that enhance the HotDash observability and alerting capabilities.

## Services Overview

| Service | Purpose | Priority | Status |
|---------|---------|----------|--------|
| Grafana | Metrics visualization | High | Not configured |
| Loki/CloudWatch | Log aggregation | Medium | Not configured |
| PagerDuty | Incident alerting | Medium | Not configured |
| Slack | Team notifications | Low | Not configured |

## 1. Grafana Dashboard Setup

### Purpose
Visualize Prometheus metrics in real-time dashboards.

### Prerequisites
- Prometheus metrics endpoint running (`/metrics`)
- Grafana Cloud account (free tier available)

### Setup Steps

1. **Create Grafana Cloud Account**
   - Visit: https://grafana.com/auth/sign-up/create-user
   - Select free tier
   - Note your Grafana URL and API key

2. **Configure Prometheus Data Source**
   ```yaml
   # In Grafana UI: Configuration → Data Sources → Add Prometheus
   Name: HotDash Metrics
   URL: https://hotdash-production.fly.dev/metrics
   Access: Server (default)
   ```

3. **Import Dashboard**
   - Use dashboard ID: 1860 (Node Exporter Full)
   - Or create custom dashboard with panels for:
     - HTTP request rate
     - P95/P99 latency
     - Error rate
     - Database query duration
     - Cache hit rate
     - Shopify API performance

4. **Configure Alerts**
   ```yaml
   # Example alert rules
   - alert: HighErrorRate
     expr: rate(http_request_errors_total[5m]) > 0.05
     for: 5m
     annotations:
       summary: "High error rate detected"
   
   - alert: HighLatency
     expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 3
     for: 10m
     annotations:
       summary: "P95 latency > 3s"
   ```

5. **Add to GitHub Secrets**
   ```bash
   gh secret set GRAFANA_API_KEY
   gh secret set GRAFANA_URL
   ```

### Cost
- **Free tier:** 10,000 series, 50GB logs, 14-day retention
- **Paid tier:** $8/month for more capacity

---

## 2. Log Aggregation Setup

### Option A: Grafana Loki (Recommended)

**Advantages:**
- Integrates with Grafana
- Cost-effective
- Good for structured logs

**Setup:**

1. **Enable Loki in Grafana Cloud**
   - Already included in Grafana Cloud free tier
   - Get Loki endpoint URL and credentials

2. **Configure Log Shipping**
   ```yaml
   # Add to fly.toml
   [metrics]
     port = 9091
     path = "/metrics"
   
   [logging]
     destination = "loki"
     loki_url = "https://logs-prod-us-central1.grafana.net/loki/api/v1/push"
     loki_username = "your-username"
     loki_password = "your-api-key"
   ```

3. **Query Logs in Grafana**
   - Use LogQL queries
   - Create log panels in dashboards
   - Set up log-based alerts

### Option B: AWS CloudWatch

**Advantages:**
- Integrated with AWS ecosystem
- Powerful querying
- Long retention

**Setup:**

1. **Create CloudWatch Log Group**
   ```bash
   aws logs create-log-group --log-group-name /hotdash/production
   ```

2. **Configure Fly.io to Ship Logs**
   ```bash
   # Install AWS CLI in Fly.io app
   # Configure log shipping via sidecar or log forwarder
   ```

3. **Set Up CloudWatch Insights**
   - Create queries for error tracking
   - Set up metric filters
   - Configure alarms

**Cost:**
- $0.50 per GB ingested
- $0.03 per GB stored per month

---

## 3. PagerDuty Integration

### Purpose
Alert on-call engineers for critical incidents.

### Setup Steps

1. **Create PagerDuty Account**
   - Visit: https://www.pagerduty.com/sign-up/
   - Free tier: 10 users, 14-day trial

2. **Create Service**
   - Services → New Service
   - Name: HotDash Production
   - Integration: Events API v2
   - Note the Integration Key

3. **Configure GitHub Actions Integration**
   
   Create `.github/workflows/pagerduty-alert.yml`:
   ```yaml
   name: PagerDuty Alert
   
   on:
     workflow_call:
       inputs:
         severity:
           required: true
           type: string
         summary:
           required: true
           type: string
   
   jobs:
     alert:
       runs-on: ubuntu-latest
       steps:
         - name: Send PagerDuty Alert
           run: |
             curl -X POST https://events.pagerduty.com/v2/enqueue \
               -H 'Content-Type: application/json' \
               -d '{
                 "routing_key": "${{ secrets.PAGERDUTY_INTEGRATION_KEY }}",
                 "event_action": "trigger",
                 "payload": {
                   "summary": "${{ inputs.summary }}",
                   "severity": "${{ inputs.severity }}",
                   "source": "GitHub Actions",
                   "custom_details": {
                     "workflow": "${{ github.workflow }}",
                     "run_id": "${{ github.run_id }}"
                   }
                 }
               }'
   ```

4. **Add Integration Key to Secrets**
   ```bash
   gh secret set PAGERDUTY_INTEGRATION_KEY
   ```

5. **Update Health Check Workflow**
   ```yaml
   # In .github/workflows/health-check.yml
   - name: Alert PagerDuty on failure
     if: failure()
     uses: ./.github/workflows/pagerduty-alert.yml
     with:
       severity: critical
       summary: "Production health check failed"
   ```

**Cost:**
- Free tier: 14-day trial
- Starter: $19/user/month
- Professional: $39/user/month

---

## 4. Slack Integration

### Purpose
Send notifications to team Slack channels.

### Setup Steps

1. **Create Slack App**
   - Visit: https://api.slack.com/apps
   - Create New App → From scratch
   - Name: HotDash Alerts
   - Select workspace

2. **Configure Incoming Webhooks**
   - Features → Incoming Webhooks → Activate
   - Add New Webhook to Workspace
   - Select channel (e.g., #hotdash-alerts)
   - Copy Webhook URL

3. **Add to GitHub Secrets**
   ```bash
   gh secret set SLACK_WEBHOOK_URL
   ```

4. **Create Slack Notification Workflow**
   
   Create `.github/workflows/slack-notify.yml`:
   ```yaml
   name: Slack Notification
   
   on:
     workflow_call:
       inputs:
         message:
           required: true
           type: string
         color:
           required: false
           type: string
           default: "good"
   
   jobs:
     notify:
       runs-on: ubuntu-latest
       steps:
         - name: Send Slack notification
           run: |
             curl -X POST ${{ secrets.SLACK_WEBHOOK_URL }} \
               -H 'Content-Type: application/json' \
               -d '{
                 "attachments": [{
                   "color": "${{ inputs.color }}",
                   "text": "${{ inputs.message }}",
                   "footer": "HotDash GitHub Actions",
                   "ts": '$(date +%s)'
                 }]
               }'
   ```

5. **Use in Workflows**
   ```yaml
   # Example: Notify on deployment
   - name: Notify Slack
     uses: ./.github/workflows/slack-notify.yml
     with:
       message: "✅ Production deployment successful"
       color: "good"
   ```

**Cost:**
- Free tier: Unlimited messages
- Pro: $7.25/user/month (for advanced features)

---

## Integration Priority

### Phase 1: Essential (Implement First)
1. ✅ Prometheus metrics (already implemented)
2. ✅ Structured logging (already implemented)
3. 🔲 Grafana dashboards (high priority)

### Phase 2: Enhanced Observability
4. 🔲 Log aggregation (Loki or CloudWatch)
5. 🔲 Custom Grafana dashboards
6. 🔲 Log-based alerts

### Phase 3: Alerting
7. 🔲 Slack notifications (low cost, high value)
8. 🔲 PagerDuty integration (for on-call)

---

## Cost Summary

| Service | Free Tier | Paid Tier | Recommendation |
|---------|-----------|-----------|----------------|
| Grafana Cloud | 10K series, 50GB logs | $8/month | Start with free |
| Loki | Included in Grafana | Included | Use free tier |
| CloudWatch | 5GB free | $0.50/GB | Only if using AWS |
| PagerDuty | 14-day trial | $19-39/user/month | Evaluate need |
| Slack | Unlimited | $7.25/user/month | Use free tier |

**Estimated Monthly Cost:**
- Minimal setup: $0 (all free tiers)
- Full setup: $8-50/month (Grafana + optional PagerDuty)

---

## Next Steps

1. **Immediate:**
   - Set up Grafana Cloud account
   - Configure Prometheus data source
   - Import basic dashboard

2. **Short-term (1-2 weeks):**
   - Enable Loki log aggregation
   - Create custom dashboards
   - Set up Slack notifications

3. **Long-term (1 month+):**
   - Evaluate PagerDuty need
   - Optimize alert rules
   - Create runbooks for common alerts

---

## References

- Grafana Cloud: https://grafana.com/products/cloud/
- Loki Documentation: https://grafana.com/docs/loki/
- PagerDuty: https://www.pagerduty.com/
- Slack API: https://api.slack.com/
- Prometheus: https://prometheus.io/docs/

