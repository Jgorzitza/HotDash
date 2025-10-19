# Monitoring Setup Guide

**Created**: 2025-10-19  
**Owner**: DevOps  
**Molecule**: D-014  
**Purpose**: Application monitoring configuration and alerting

## Monitoring Stack

### Current Infrastructure

**Built-in Monitoring**:

- Fly.io Metrics (CPU, Memory, Network)
- GitHub Actions workflow status
- Gitleaks daily scan results
- Drift sweep automation

**Application Health Endpoints**:

- `/health` - Basic health check
- `/api/health` - API health check

### Recommended Additions

1. **Error Tracking**: Sentry or similar
2. **Performance Monitoring**: New Relic, Datadog, or Prometheus
3. **Uptime Monitoring**: UptimeRobot, Pingdom, or StatusCake
4. **Log Aggregation**: Logtail, Papertrail, or CloudWatch

## Health Endpoints

### GET /health

**Purpose**: Basic application health  
**Response**:

```json
{
  "status": "ok",
  "timestamp": "2025-10-19T12:00:00Z"
}
```

**Monitoring**: Check every 60 seconds  
**Alert if**: Status ≠ "ok" or response time >5s

### GET /api/health

**Purpose**: API and database connectivity  
**Response**:

```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2025-10-19T12:00:00Z"
}
```

**Monitoring**: Check every 60 seconds  
**Alert if**: Status ≠ "healthy" or database ≠ "connected"

## Fly.io Metrics

### Access Metrics Dashboard

```bash
# View app status
fly status -a hotdash-app

# View metrics
fly dashboard -a hotdash-app
```

**Key Metrics**:

- CPU usage
- Memory usage
- Request count
- Response time (P50, P95, P99)
- Error rate

### Configure Alerts (Fly.io Dashboard)

1. Navigate to app dashboard
2. Alerts → Create alert
3. Configure thresholds:
   - CPU >80% for 5 minutes
   - Memory >90% for 5 minutes
   - Error rate >5% for 5 minutes

## GitHub Actions Monitoring

**Workflow Health Check**:

```bash
# Check recent workflow runs
gh run list --limit 20 --json conclusion,status,name

# Count failures
gh run list --json conclusion --jq '[.[] | select(.conclusion=="failure")] | length'
```

**Alert Conditions**:

- CI failure rate >20% (over 10 runs)
- Gitleaks finds new secrets
- Docs policy failures
- Deploy workflow failures

**Monitoring Script** (add to cron):

```bash
#!/bin/bash
# scripts/ops/monitor-workflows.sh

FAILURE_COUNT=$(gh run list --limit 10 --json conclusion \
  --jq '[.[] | select(.conclusion=="failure")] | length')

if [ "$FAILURE_COUNT" -gt 2 ]; then
  echo "⚠️ WARNING: $FAILURE_COUNT failed workflows in last 10 runs"
  # Send alert (email, Slack, etc.)
fi
```

## Drift Sweep Monitoring

**Automation**: Daily via `scripts/ops/daily-drift-sweep.sh`  
**Report**: `reports/status/gaps.md`

**Monitor**:

```bash
# Run drift sweep
./scripts/ops/daily-drift-sweep.sh

# Check exit code
if [ $? -ne 0 ]; then
  echo "❌ Drift violations detected"
  cat reports/status/gaps.md
fi
```

**Alert if**: Script returns non-zero exit code

## Key Performance Indicators (KPIs)

### Application Performance

| Metric               | Target    | Alert Threshold |
| -------------------- | --------- | --------------- |
| P95 Response Time    | <3s       | >5s             |
| Error Rate           | <0.1%     | >1%             |
| Uptime               | >99.9%    | <99%            |
| Database Connections | <80% pool | >90%            |

### Infrastructure Health

| Metric         | Target | Alert Threshold |
| -------------- | ------ | --------------- |
| CPU Usage      | <70%   | >85%            |
| Memory Usage   | <70%   | >85%            |
| Disk Usage     | <70%   | >85%            |
| Network Errors | <0.01% | >0.1%           |

### CI/CD Health

| Metric              | Target | Alert Threshold |
| ------------------- | ------ | --------------- |
| CI Success Rate     | >95%   | <80%            |
| Deploy Success Rate | >99%   | <95%            |
| Build Time          | <10min | >15min          |
| Test Coverage       | >80%   | <70%            |

## Alert Configuration

### Alert Channels

**Recommended Setup**:

1. **Email**: Critical alerts
2. **Slack/Discord**: All alerts
3. **PagerDuty**: Production outages (if using)
4. **GitHub Issues**: Track recurring issues

### Alert Severity Levels

**P0 - Critical** (immediate action):

- Production down
- Database unreachable
- Error rate >10%
- Security incident

**P1 - High** (action within 1 hour):

- Performance degradation (P95 >10s)
- Error rate >1%
- Disk usage >90%

**P2 - Medium** (action within 4 hours):

- Error rate >0.5%
- CPU/Memory >85%
- CI failures >3 consecutive

**P3 - Low** (action within 24 hours):

- Drift violations
- Planning files expired
- Non-critical test failures

## Monitoring Checklist

### Daily Checks

- [ ] Review Fly.io dashboard for anomalies
- [ ] Check drift sweep report
- [ ] Verify Gitleaks scan passed
- [ ] Review error logs
- [ ] Check CI success rate

### Weekly Checks

- [ ] Review performance trends
- [ ] Analyze slow queries
- [ ] Check disk usage trends
- [ ] Review alert frequency
- [ ] Update monitoring thresholds if needed

### Monthly Checks

- [ ] Review and update KPI targets
- [ ] Analyze incident patterns
- [ ] Test alert delivery
- [ ] Review monitoring costs
- [ ] Update runbooks based on incidents

## Incident Response

### When Alert Fires

1. **Acknowledge**: Confirm receipt
2. **Assess**: Check severity and impact
3. **Triage**: Determine root cause
4. **Mitigate**: Apply immediate fix or rollback
5. **Resolve**: Implement permanent fix
6. **Document**: Post-mortem for P0/P1 incidents

### Escalation Path

1. **DevOps**: First responder
2. **Engineer**: If code-related
3. **Manager**: If requires coordination
4. **CEO**: If business-critical

## Future Enhancements

### Phase 1 (Next Sprint)

- [ ] Set up Sentry for error tracking
- [ ] Configure Fly.io metric alerts
- [ ] Create monitoring dashboard

### Phase 2 (Next Month)

- [ ] Implement custom metrics (tile load times, approval latency)
- [ ] Set up log aggregation
- [ ] Create SLA dashboard

### Phase 3 (Next Quarter)

- [ ] Implement distributed tracing
- [ ] Set up performance budgets
- [ ] Create automated remediation

## Related Documentation

- Deployment: `docs/runbooks/production_deploy.md`
- Backup/Recovery: `docs/runbooks/backup_recovery.md`
- CI/CD: `docs/runbooks/cicd_pipeline.md`
