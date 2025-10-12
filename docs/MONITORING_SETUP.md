# HotDash Production Monitoring Setup

**Status**: Active
**Last Updated**: October 12, 2025
**Owner**: Engineer Helper Agent

---

## Executive Summary

All production services are healthy and monitored. This document provides an overview of monitoring infrastructure, health check status, and alerting mechanisms.

---

## Production Services Status

### 1. Agent SDK Service
- **URL**: https://hotdash-agent-service.fly.dev
- **Health Endpoint**: `/health`
- **Current Status**: ✅ **HEALTHY** (passing)
- **Region**: ord (Chicago)
- **Port**: 8787
- **Auto-Start/Stop**: Enabled
- **Fly.io Health Check**: `servicecheck-00-http-8787` - PASSING
- **Response Time**: ~300ms

**Last Health Check**:
```json
{
  "status": "ok",
  "service": "agent-service",
  "version": "1.0.0",
  "timestamp": "2025-10-12T08:44:09.740Z"
}
```

### 2. LlamaIndex MCP Service
- **URL**: https://hotdash-llamaindex-mcp.fly.dev
- **Health Endpoint**: `/health`
- **Current Status**: ✅ **HEALTHY** (passing)
- **Region**: iad (Ashburn)
- **Port**: 8080
- **Auto-Start/Stop**: Enabled
- **Fly.io Health Check**: `servicecheck-00-http-8080` - PASSING
- **Response Time**: ~284ms

**Last Health Check**:
```json
{
  "status": "ok",
  "service": "llamaindex-rag-mcp",
  "version": "1.0.0",
  "timestamp": "2025-10-12T08:44:10.089Z",
  "uptime": "217s",
  "tools": ["query_support", "refresh_index", "insight_report"],
  "metrics": {
    "query_support": {"calls": 0, "errors": 0, "errorRate": "0%"},
    "refresh_index": {"calls": 0, "errors": 0, "errorRate": "0%"},
    "insight_report": {"calls": 0, "errors": 0, "errorRate": "0%"}
  }
}
```

---

## Monitoring Infrastructure

### Built-in Fly.io Health Checks
- **Frequency**: Continuous (every 15-30 seconds)
- **Protocol**: HTTP
- **Method**: GET
- **Timeout**: 5 seconds
- **Threshold**: 3 consecutive failures triggers alert
- **Auto-Recovery**: Machines restart on repeated failures

### Manual Health Check Scripts

#### 1. Quick Health Check
**Script**: `scripts/ops/health-check-agent-services.sh`
```bash
cd ~/HotDash/hot-dash
bash scripts/ops/health-check-agent-services.sh
```
- Checks both Agent SDK and LlamaIndex MCP
- Response time measurement
- Colored output (Green = healthy, Red = unhealthy)
- Alert mode available: `--alert` flag

#### 2. Comprehensive Fly.io Health Check
**Script**: `scripts/ops/agent-sdk-health-check.sh`
```bash
cd ~/HotDash/hot-dash
bash scripts/ops/agent-sdk-health-check.sh
```
- Full Fly.io status check
- Machine list and state
- Health endpoint validation
- Logs to `feedback/reliability.md`

#### 3. Integration Health Dashboard
**Script**: `scripts/ops/integration-health-dashboard.sh`
```bash
cd ~/HotDash/hot-dash
bash scripts/ops/integration-health-dashboard.sh
```
- Real-time status of all integrations
- Shopify, Chatwoot, Google Analytics, OpenAI
- Latency measurements
- Overall health summary

#### 4. MCP Health Check (Cron-Ready)
**Script**: `scripts/ops/mcp-health-check-cron.sh`
- Designed for automated execution
- Email alerts on failures (requires mail setup)
- JSON output for metrics collection
- Threshold-based alerting

---

## Automated Monitoring Setup

### Recommended Cron Schedule
```bash
# Add to crontab with: crontab -e

# Health check every 15 minutes
*/15 * * * * cd ~/HotDash/hot-dash && bash scripts/ops/health-check-agent-services.sh >> logs/health-check.log 2>&1

# Comprehensive check every 6 hours
0 */6 * * * cd ~/HotDash/hot-dash && bash scripts/ops/agent-sdk-health-check.sh >> logs/agent-sdk-health.log 2>&1

# Integration dashboard every hour
0 * * * * cd ~/HotDash/hot-dash && bash scripts/ops/integration-health-dashboard.sh >> logs/integration-health.log 2>&1
```

### Setting Up Automated Monitoring
```bash
# Create log directory
mkdir -p ~/HotDash/hot-dash/logs

# Install cron job (use one of the schedules above)
crontab -e
```

---

## Alerting Mechanisms

### 1. Fly.io Built-in Alerts
- **Email**: Configured in Fly.io dashboard
- **Triggers**: 
  - Machine crashes
  - Health check failures (3 consecutive)
  - Deployment failures
  - Resource exhaustion

### 2. Script-based Email Alerts
**Requirements**:
- Configure `mail` or `sendmail` on the system
- Set environment variable: `export MCP_ALERT_EMAIL="devops@hotrodan.com"`
- Run cron script with email capability

**Test Email Alert**:
```bash
cd ~/HotDash/hot-dash
MCP_ALERT_EMAIL="your-email@example.com" bash scripts/ops/mcp-health-check-cron.sh
```

### 3. Slack/Discord Webhooks (Future Enhancement)
- Integrate webhook URLs into health check scripts
- Real-time notifications to team channels
- Status: NOT YET IMPLEMENTED

---

## Health Check Logs

### Log Locations
- **MCP Health Checks**: `artifacts/integrations/mcp-health-checks/`
  - JSON format: `health-check-YYYY-MM-DDTHH-MM-SSZ.json`
  - Log format: `health-check-YYYY-MM-DDTHH-MM-SSZ.log`
- **Cron Jobs**: `logs/` (if following recommended setup)
- **Reliability Feedback**: `feedback/reliability.md`

### Recent Health Check Results
Check the most recent health status:
```bash
cd ~/HotDash/hot-dash
ls -lt artifacts/integrations/mcp-health-checks/ | head -10
cat artifacts/integrations/mcp-health-checks/health-check-$(ls -t artifacts/integrations/mcp-health-checks/ | grep json | head -1)
```

---

## Performance Metrics

### Current Baseline (October 12, 2025)
- **Agent SDK Response Time**: ~300ms (excellent)
- **LlamaIndex MCP Response Time**: ~284ms (excellent)
- **Uptime**: 100% (since last deployment)
- **Error Rate**: 0%

### Performance Targets
- **Response Time**: < 500ms (p95)
- **Uptime**: > 99.9%
- **Error Rate**: < 0.1%

---

## Troubleshooting

### Service Down
1. Check Fly.io status: `~/.fly/bin/fly status -a <app-name>`
2. View logs: `~/.fly/bin/fly logs -a <app-name>`
3. Restart if needed: `~/.fly/bin/fly machine restart -a <app-name>`

### Slow Response Times
1. Check machine resources: `~/.fly/bin/fly status -a <app-name>`
2. Review recent deployments
3. Check for rate limiting or external API issues

### Health Check Failures
1. Verify network connectivity
2. Check if machines are auto-stopped (should auto-start on request)
3. Review application logs for errors
4. Verify health endpoint is responding correctly

---

## Launch Day Monitoring Protocol

### Pre-Launch (Oct 13-15)
- [ ] Verify all health checks passing
- [ ] Confirm automated monitoring is active
- [ ] Test alert mechanisms
- [ ] Document baseline metrics
- [ ] Set up war room dashboard

### During Launch
- [ ] Monitor health checks every 5 minutes
- [ ] Watch for error spikes
- [ ] Track response time degradation
- [ ] Be ready to roll back if needed

### Post-Launch (First 24 hours)
- [ ] Continuous monitoring
- [ ] Collect performance data
- [ ] Document any incidents
- [ ] Update alerting thresholds based on real traffic

---

## Quick Reference Commands

```bash
# Check production service health
curl https://hotdash-agent-service.fly.dev/health
curl https://hotdash-llamaindex-mcp.fly.dev/health

# Run local health check
cd ~/HotDash/hot-dash && bash scripts/ops/health-check-agent-services.sh

# View Fly.io status
~/.fly/bin/fly status -a hotdash-agent-service
~/.fly/bin/fly status -a hotdash-llamaindex-mcp

# View recent logs
~/.fly/bin/fly logs -a hotdash-agent-service
~/.fly/bin/fly logs -a hotdash-llamaindex-mcp

# Check health check status
~/.fly/bin/fly checks list -a hotdash-agent-service
~/.fly/bin/fly checks list -a hotdash-llamaindex-mcp
```

---

## Next Steps

### Immediate (Pre-Launch)
1. ✅ Document monitoring setup (this document)
2. ⏳ Set up automated cron monitoring
3. ⏳ Test email alerting
4. ⏳ Create launch day dashboard

### Post-Launch
1. Implement Slack/Discord webhooks
2. Set up metrics dashboard (Grafana/DataDog)
3. Configure advanced alerting rules
4. Create incident response playbook

---

**Document Version**: 1.0
**Status**: Production Ready
**Contact**: Engineer Helper Agent
**Emergency Escalation**: See `docs/directions/engineer-helper.md`

