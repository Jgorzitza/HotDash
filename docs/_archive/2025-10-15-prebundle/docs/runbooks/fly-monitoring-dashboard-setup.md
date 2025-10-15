# Fly.io Monitoring Dashboard Setup Runbook

**Created**: 2025-10-11  
**Owner**: Reliability Team  
**Status**: Active  
**Last Updated**: 2025-10-11T20:43:00Z

## Overview

This runbook covers the setup and configuration of monitoring dashboards and alerts for all HotDash applications deployed on Fly.io.

## Applications to Monitor

Based on current infrastructure (2025-10-11):

| App Name | Type | Priority | Alert Level |
|----------|------|----------|-------------|
| **hotdash-chatwoot** (web) | Rails/Chatwoot | HIGH | Critical |
| **hotdash-chatwoot** (worker) | Sidekiq | HIGH | Critical |
| **hotdash-staging** | React Router 7 | MEDIUM | Warning |
| **hotdash-staging-db** | PostgreSQL | MEDIUM | Critical |
| **hotdash-llamaindex-mcp** | MCP Server | HIGH | Critical |
| **hotdash-agent-service** | Agent Service | HIGH | Critical |

## Fly.io Metrics Dashboard Access

### Web Dashboard
- **URL**: https://fly.io/dashboard
- **Direct App Metrics**: `https://fly.io/apps/<app-name>/metrics`
- **Machine Metrics**: `https://fly.io/apps/<app-name>/machines/<machine-id>`

### CLI Access
```bash
# View app metrics via CLI
~/.fly/bin/fly dashboard -a <app-name>

# Open in browser
~/.fly/bin/fly open -a <app-name>
```

## Alert Configuration

### Alert Thresholds by Metric

#### 1. CPU Utilization

| Severity | Threshold | Duration | Action |
|----------|-----------|----------|--------|
| **Critical** | > 90% | 5 minutes | Scale up CPU immediately |
| **Warning** | > 70% | 10 minutes | Plan CPU scaling |
| **Info** | > 50% | 15 minutes | Monitor trend |

**Configuration:**
```toml
# fly.toml
[[services.checks]]
  grace_period = "10s"
  interval = "30s"
  method = "GET"
  path = "/health"
  timeout = "5s"
  type = "http"

  [[services.checks.headers]]
    name = "X-Monitoring"
    value = "fly-health-check"
```

#### 2. Memory Usage

| Severity | Threshold | Duration | Action |
|----------|-----------|----------|--------|
| **Critical** | > 85% | 5 minutes | Scale memory immediately |
| **Warning** | > 70% | 10 minutes | Investigate memory leaks |
| **Info** | > 50% | 15 minutes | Monitor trend |

**OOM Kill Detection:**
```bash
# Check for OOM kills in logs
~/.fly/bin/fly logs -a <app-name> | grep -i "oom"

# Check machine events
~/.fly/bin/fly machine status <machine-id> -a <app-name>
# Look for exit_code=137, oom_killed=true
```

#### 3. Error Rate

| Severity | Threshold | Duration | Action |
|----------|-----------|----------|--------|
| **Critical** | > 5% | 5 minutes | Execute rollback |
| **Warning** | > 1% | 10 minutes | Investigate errors |
| **Info** | > 0.5% | 15 minutes | Monitor trend |

**Error Monitoring:**
```bash
# Monitor error logs in real-time
~/.fly/bin/fly logs -a <app-name> | grep -iE "(error|exception|failed)"

# Count errors in last hour
~/.fly/bin/fly logs -a <app-name> | grep -i error | wc -l
```

#### 4. Response Time / Latency

| Severity | Threshold | Duration | Action |
|----------|-----------|----------|--------|
| **Critical** | P95 > 2000ms | 10 minutes | Scale resources |
| **Warning** | P95 > 1000ms | 15 minutes | Investigate slow queries |
| **Info** | P95 > 500ms | 20 minutes | Monitor trend |

**Latency Monitoring:**
```bash
# Run synthetic check
SYNTHETIC_CHECK_URL="https://<app-name>.fly.dev/health" \
SYNTHETIC_CHECK_BUDGET_MS=800 \
node scripts/ci/synthetic-check.mjs

# Monitor response times
time curl -sS "https://<app-name>.fly.dev/health"
```

#### 5. Health Check Status

| Severity | Condition | Action |
|----------|-----------|--------|
| **Critical** | Health check failing > 5 minutes | Restart machines, execute rollback |
| **Warning** | Health check failing > 2 minutes | Investigate logs |
| **Info** | Intermittent failures | Monitor closely |

**Health Check Monitoring:**
```bash
# Check health endpoint
curl -sS -w "\nStatus: %{http_code}, Time: %{time_total}s\n" \
  "https://<app-name>.fly.dev/health"

# Continuous health monitoring (every 30s)
watch -n 30 'curl -sS -w "\nStatus: %{http_code}, Time: %{time_total}s\n" "https://<app-name>.fly.dev/health"'
```

#### 6. Auto-scaling Issues

| Severity | Condition | Action |
|----------|-----------|--------|
| **Warning** | Machines not stopping after 10 min idle | Check auto_stop_machines config |
| **Warning** | Machines not starting on request | Check auto_start_machines config |
| **Info** | Slow auto-start (> 10s) | Investigate cold start performance |

## Application-Specific Alert Configurations

### Chatwoot (Rails + Sidekiq)

**Critical Alerts:**
- OOM kills on worker machine (currently 512MB - needs 2GB)
- Health check failures on `/api` endpoint
- Redis connection failures
- Sidekiq queue backing up (> 1000 jobs)

**Warning Alerts:**
- Memory > 70% on web machine
- Response time > 500ms on `/api`
- Worker processing time > 30s per job

**Monitoring Commands:**
```bash
# Check both machines
~/.fly/bin/fly machine list -a hotdash-chatwoot

# Monitor web machine
~/.fly/bin/fly machine status 8d9515fe056ed8 -a hotdash-chatwoot

# Monitor worker machine (NEEDS 2GB SCALING)
~/.fly/bin/fly machine status 683713eb7d9008 -a hotdash-chatwoot

# Check Chatwoot health
curl -sS "https://hotdash-chatwoot.fly.dev/api"

# Monitor logs for errors
~/.fly/bin/fly logs -a hotdash-chatwoot | grep -iE "(error|exception|oom)"
```

### Staging App (React Router 7)

**Critical Alerts:**
- Health check failures (all machines down)
- Error rate > 5%
- P95 latency > 2000ms

**Warning Alerts:**
- Memory > 70%
- CPU > 70%
- P95 latency > 800ms

**Monitoring Commands:**
```bash
# Check app status
~/.fly/bin/fly status -a hotdash-staging

# Check machines
~/.fly/bin/fly machine list -a hotdash-staging

# Monitor performance
SYNTHETIC_CHECK_URL="https://hotdash-staging.fly.dev/app?mock=0" \
SYNTHETIC_CHECK_BUDGET_MS=800 \
node scripts/ci/synthetic-check.mjs

# Monitor logs
~/.fly/bin/fly logs -a hotdash-staging | grep -iE "(error|warn)"
```

### Agent SDK Services (When Deployed)

**Critical Alerts:**
- MCP query P95 latency > 1000ms
- Approval queue response > 60s
- OOM kills
- Service unavailable

**Warning Alerts:**
- MCP query P95 latency > 500ms
- Approval queue response > 30s
- Memory > 70%
- Error rate > 1%

**Monitoring Commands:**
```bash
# Use dedicated health check script
./scripts/ops/agent-sdk-health-check.sh

# Monitor specific service
./scripts/ops/agent-sdk-logs.sh llamaindex errors

# Check auto-scaling
~/.fly/bin/fly machine list -a hotdash-llamaindex-mcp
# Verify machines stop when idle, start on request
```

## Setting Up Fly.io Monitoring

### Step 1: Access Fly.io Dashboard

1. Navigate to https://fly.io/dashboard
2. Select organization: `personal`
3. View all apps in the dashboard

### Step 2: Configure Per-App Monitoring

For each application:

1. Click on app name
2. Go to **Monitoring** tab
3. Review available metrics:
   - CPU usage
   - Memory usage
   - Network I/O
   - Disk usage (for volumes)
   - Request rate
   - Response time

4. Note current baselines for comparison

### Step 3: Health Check Configuration

Ensure each app has health checks defined in `fly.toml`:

```toml
[http_service]
  internal_port = 8080
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true

[http_service.checks]
  interval = "15s"
  timeout = "10s"
  grace_period = "30s"
  method = "GET"
  path = "/health"
```

### Step 4: External Monitoring Setup

**Recommended Tools:**
- **UptimeRobot** or **BetterUptime**: HTTP(S) monitoring
- **Sentry**: Error tracking and performance monitoring
- **Datadog** or **New Relic**: Full observability (if budget allows)

**Synthetic Checks (Local):**
```bash
# Create cron job for regular synthetic checks
# Run every 15 minutes
*/15 * * * * cd /home/justin/HotDash/hot-dash && SYNTHETIC_CHECK_URL="https://hotdash-staging.fly.dev/app?mock=0" SYNTHETIC_CHECK_BUDGET_MS=800 node scripts/ci/synthetic-check.mjs >> logs/synthetic-checks.log 2>&1
```

## Alert Routing and Escalation

### Alert Channels

1. **Critical Alerts** (SEV-1):
   - Slack: #incidents channel
   - Email: reliability@team, engineer@team, manager@team
   - SMS: On-call rotation (if configured)
   - Response Time: < 5 minutes

2. **Warning Alerts** (SEV-2):
   - Slack: #monitoring channel
   - Email: reliability@team
   - Response Time: < 15 minutes

3. **Info Alerts** (SEV-3):
   - Slack: #monitoring channel
   - Logged to feedback/reliability.md
   - Response Time: < 30 minutes

### Escalation Matrix

| Time | Action | Escalate To |
|------|--------|-------------|
| T+0 | Alert detected | Reliability Team |
| T+5min | Still critical | + Engineer |
| T+15min | Still critical | + Manager |
| T+30min | Still critical | Emergency procedures |

## Monitoring Scripts

### Continuous Monitoring Script

Create `scripts/ops/fly-continuous-monitor.sh`:

```bash
#!/bin/bash
# Continuous monitoring of all Fly apps
# Logs to artifacts/monitoring/

INTERVAL=60  # seconds
LOG_DIR="artifacts/monitoring"
mkdir -p "$LOG_DIR"

while true; do
  TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%SZ)
  
  echo "[$TIMESTAMP] Monitoring check..." | tee -a "$LOG_DIR/continuous-monitor.log"
  
  # Check each app
  for app in hotdash-chatwoot hotdash-staging; do
    echo "  Checking $app..." | tee -a "$LOG_DIR/continuous-monitor.log"
    
    # App status
    ~/.fly/bin/fly status -a "$app" > "$LOG_DIR/${app}-status-${TIMESTAMP}.txt" 2>&1
    
    # Machine list
    ~/.fly/bin/fly machine list -a "$app" > "$LOG_DIR/${app}-machines-${TIMESTAMP}.txt" 2>&1
    
    # Health check
    curl -sS -w "\n%{http_code}|%{time_total}" "https://${app}.fly.dev/health" \
      > "$LOG_DIR/${app}-health-${TIMESTAMP}.txt" 2>&1
  done
  
  sleep $INTERVAL
done
```

### Alert Check Script

Create `scripts/ops/fly-alert-check.sh`:

```bash
#!/bin/bash
# Check alert conditions and log issues
# Run every 5 minutes via cron

LOG_FILE="feedback/reliability.md"
TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%SZ)

check_app() {
  local app=$1
  local status=$(~/.fly/bin/fly status -a "$app" 2>&1)
  
  # Check if all machines are down
  if echo "$status" | grep -q "no machines"; then
    echo "[$TIMESTAMP] 🚨 CRITICAL: $app has no running machines" >> "$LOG_FILE"
    return 1
  fi
  
  # Check health endpoint
  local health=$(curl -sS -w "%{http_code}" -o /dev/null "https://${app}.fly.dev/health" 2>&1)
  if [ "$health" != "200" ]; then
    echo "[$TIMESTAMP] ⚠️ WARNING: $app health check failed (status: $health)" >> "$LOG_FILE"
    return 1
  fi
  
  return 0
}

echo "[$TIMESTAMP] Running alert checks..." >> "$LOG_FILE"

# Check all apps
for app in hotdash-chatwoot hotdash-staging; do
  check_app "$app" || echo "[$TIMESTAMP] Alert for $app logged" >> "$LOG_FILE"
done
```

## Dashboard URLs Quick Reference

```bash
# Main Dashboard
https://fly.io/dashboard

# Chatwoot
https://fly.io/apps/hotdash-chatwoot/metrics
https://fly.io/apps/hotdash-chatwoot/machines

# Staging
https://fly.io/apps/hotdash-staging/metrics
https://fly.io/apps/hotdash-staging/machines

# Staging DB
https://fly.io/apps/hotdash-staging-db/metrics

# Agent SDK (when deployed)
https://fly.io/apps/hotdash-llamaindex-mcp/metrics
https://fly.io/apps/hotdash-agent-service/metrics
```

## Monitoring Checklist

### Daily (Automated via Scripts)
- [ ] Health checks for all apps
- [ ] Resource usage (CPU/memory) < thresholds
- [ ] Error rate < 1%
- [ ] Response time P95 < targets
- [ ] Auto-scaling working correctly

### Weekly (Manual Review)
- [ ] Review metric trends
- [ ] Update alert thresholds if needed
- [ ] Check for anomalies
- [ ] Document any incidents
- [ ] Update runbooks

### Monthly (Strategic Review)
- [ ] Capacity planning review
- [ ] Cost optimization analysis
- [ ] Alert fatigue assessment
- [ ] Monitoring tool evaluation
- [ ] Disaster recovery drill

## Evidence and Logging

All monitoring activities should be logged to `feedback/reliability.md`:

```
[YYYY-MM-DDTHH:MM:SSZ] Monitoring Check
Apps: hotdash-chatwoot, hotdash-staging
Status: All healthy ✅
CPU: Chatwoot 45%, Staging 32%
Memory: Chatwoot web 65%, worker 45%, Staging 51%
Latency: Chatwoot 340ms, Staging 521ms
Alerts: None
```

## Integration with CI/CD

### Pre-Deployment Monitoring
- Run health checks before deployment
- Baseline current metrics
- Set up deployment monitoring

### Post-Deployment Monitoring
- Monitor for 15 minutes minimum
- Compare to baseline metrics
- Alert on degradation
- Auto-rollback if critical thresholds breached

## Troubleshooting Monitoring Issues

### Dashboard Not Loading
1. Check Fly.io status: https://status.fly.io
2. Verify authentication: `~/.fly/bin/fly auth whoami`
3. Try CLI metrics: `~/.fly/bin/fly status -a <app>`

### Metrics Not Updating
1. Check machine status
2. Verify health checks passing
3. Review app logs for issues
4. Restart machines if needed

### False Alarms
1. Review alert thresholds
2. Check for known issues (deployments, maintenance)
3. Adjust sensitivity if needed
4. Document exclusions

## References

- Fly.io Metrics Documentation: https://fly.io/docs/reference/metrics/
- Agent SDK Monitoring: `docs/runbooks/agent-sdk-monitoring.md`
- Incident Response: `docs/runbooks/agent-sdk-incident-response.md`
- Synthetic Checks: `scripts/ci/synthetic-check.mjs`

## Changelog

| Date | Change | Author |
|------|--------|--------|
| 2025-10-11 | Initial creation | Reliability Agent |

## Next Steps

1. ⏳ Access Fly.io dashboard and review current metrics
2. ⏳ Configure health checks for all apps
3. ⏳ Set up synthetic monitoring cron jobs
4. ⏳ Create monitoring scripts (continuous, alert-check)
5. ⏳ Document baseline metrics
6. ⏳ Test alert procedures
7. ⏳ Set up external monitoring (UptimeRobot/Sentry)

