# Infrastructure Monitoring

**Version**: 1.0  
**Last Updated**: 2025-10-21  
**Owner**: DevOps  
**Status**: ACTIVE

---

## Overview

Comprehensive monitoring for all HotDash infrastructure components across staging and production environments.

## Applications Monitored

| App | Environment | URL | Critical | Monitoring |
|-----|-------------|-----|----------|------------|
| **hotdash-staging** | Staging | hotdash-staging.fly.dev | Yes | Full |
| **hotdash-production** | Production | hotdash-production.fly.dev | Yes | Full |
| **hotdash-chatwoot** | Shared | hotdash-chatwoot.fly.dev | Yes | Full |
| **hotdash-agent-service** | Shared | hotdash-agent-service.fly.dev | Medium | Basic |
| **hotdash-llamaindex-mcp** | Shared | hotdash-llamaindex-mcp.fly.dev | Medium | Basic |

---

## Alert Configuration

### Critical Alerts (Immediate Action)

**1. App Down**
- **Trigger**: Health check fails for >2 minutes
- **Action**: Page on-call, immediate investigation
- **Escalation**: Manager + CEO if >15 minutes

**2. High Error Rate**
- **Trigger**: >5% of requests return 5xx errors
- **Duration**: 5 minutes sustained
- **Action**: Review logs, identify cause, consider rollback

**3. Database Connection Failure**
- **Trigger**: Connection errors in logs
- **Action**: Check Supabase status, verify credentials, restart if needed

**4. Memory Exhaustion**
- **Trigger**: Memory >90% for >5 minutes
- **Action**: Scale up machine or investigate memory leak

**5. Response Time Degradation**
- **Trigger**: P95 response time >10s
- **Duration**: 10 minutes sustained
- **Action**: Check database slow queries, external API latency

### Warning Alerts (Monitor Closely)

**1. Elevated Error Rate**
- **Trigger**: >1% error rate
- **Action**: Monitor, create bug ticket if persistent

**2. Slow Response Times**
- **Trigger**: P95 >5s
- **Action**: Review performance, consider optimization

**3. CPU Usage High**
- **Trigger**: >80% CPU for >15 minutes
- **Action**: Monitor, consider scaling if persistent

**4. Disk Space**
- **Trigger**: >80% disk usage
- **Action**: Clean logs, investigate storage growth

### Info Alerts (Track Trends)

**1. Traffic Spikes**
- **Trigger**: Request rate 3x normal
- **Action**: Monitor, ensure auto-scaling working

**2. Cache Miss Rate**
- **Trigger**: >50% cache misses
- **Action**: Review caching strategy

---

## Monitoring Dashboards

### Fly.io Native Dashboards

**Staging**: https://fly.io/apps/hotdash-staging/monitoring  
**Production**: https://fly.io/apps/hotdash-production/monitoring  
**Chatwoot**: https://fly.io/apps/hotdash-chatwoot/monitoring

**Metrics Available**:
- Request rate (req/s)
- Response times (P50, P95, P99)
- Error rates (5xx%)
- CPU usage (%)
- Memory usage (MB/%
- Network I/O (MB/s)
- Machine health status

### Custom Monitoring Scripts

**Location**: `scripts/monitoring/`

**1. Health Check** (`check-staging-health.sh`):
```bash
./scripts/monitoring/check-staging-health.sh
```
Checks: Health endpoint, response time, machine status, recent errors

**2. Performance Analysis** (`analyze-performance-logs.sh`):
```bash
./scripts/monitoring/analyze-performance-logs.sh
```
Analyzes: Response time distribution (avg, min, max, P95), error counts, common issues

---

## Daily Monitoring Checklist

### Every Morning (9am)

- [ ] Check all app statuses via Fly dashboard
- [ ] Review overnight logs for errors
- [ ] Verify health endpoints (200 status)
- [ ] Check email for any alerts
- [ ] Review performance metrics (response times, error rates)

**Commands**:
```bash
# Quick health check all apps
flyctl status --app hotdash-staging
flyctl status --app hotdash-production
flyctl status --app hotdash-chatwoot

# Check for errors
flyctl logs --app hotdash-staging | grep -iE "error|fail" | tail -10
flyctl logs --app hotdash-production | grep -iE "error|fail" | tail -10
```

### Every Evening (6pm)

- [ ] Review day's metrics summary
- [ ] Check for any degradation trends
- [ ] Verify automated backups ran (Supabase)
- [ ] Update feedback file with any issues

---

## Incident Response Procedures

### App Down

**Immediate Actions** (within 2 minutes):
1. Check Fly machine status: `flyctl status --app <app-name>`
2. Check logs for crash reason: `flyctl logs --app <app-name> -n 100`
3. Restart machine if crashed: `flyctl machine start <machine-id>`
4. If restart fails: Rollback to previous version

**Investigation** (within 15 minutes):
1. Identify root cause (code, database, external service)
2. Document in feedback file
3. Create hotfix if needed
4. Deploy fix or rollback

**Escalation** (if >15 minutes):
1. Notify Manager in feedback
2. CEO notification if critical customer impact

### High Error Rate

**Actions**:
1. Identify error pattern: `flyctl logs | grep -E "500|502|503"`
2. Check database connections
3. Check external API status (Shopify, GA, Search Console)
4. If widespread: Rollback to previous version
5. If isolated: Create bug ticket, monitor

### Performance Degradation

**Actions**:
1. Check database slow queries
2. Check external API latency
3. Review recent code changes
4. Check machine resources (CPU, memory)
5. Consider scaling if resource-bound
6. Consider rollback if code-related

---

## Monitoring Metrics

### Application Metrics

**Response Times**:
- Target: <1s P50, <3s P95
- Warning: >3s P95
- Critical: >5s P95

**Error Rates**:
- Target: <0.1%
- Warning: >1%
- Critical: >5%

**Availability**:
- Target: 99.9% (SLO)
- Warning: <99.5%
- Critical: <99%

### Infrastructure Metrics

**CPU Usage**:
- Normal: <50%
- Warning: >80%
- Critical: >90%

**Memory Usage**:
- Normal: <70%
- Warning: >80%
- Critical: >90%

**Disk Usage**:
- Normal: <60%
- Warning: >80%
- Critical: >90%

### Database Metrics

**Connection Pool**:
- Normal: <80% utilized
- Warning: >80%
- Critical: >95%

**Query Performance**:
- Target: <100ms P95
- Warning: >500ms P95
- Critical: >1s P95

---

## Log Retention

**Fly.io Logs**: 7 days (platform default)  
**GitHub Actions Artifacts**: 90-365 days (configurable)  
**Supabase Logs**: Per plan limits

**Export Strategy**:
- Critical incidents: Export logs to artifacts
- Performance analysis: Weekly log dumps
- Security events: Immediate export + retain

---

## Monitoring Tools

### Native Tools

- **Fly.io Dashboard**: Real-time metrics, machine status
- **Supabase Dashboard**: Database metrics, query performance
- **GitHub Actions**: Deployment history, workflow runs

### Scripts

- `scripts/monitoring/check-staging-health.sh`: Health checks
- `scripts/monitoring/analyze-performance-logs.sh`: Performance analysis
- Future: Custom dashboard in HotDash app

---

## Related Documentation

- **Performance Monitoring**: `docs/runbooks/performance-monitoring.md`
- **Deployment Rollback**: `docs/runbooks/deployment-rollback.md`
- **Database Migration**: `docs/runbooks/database-migration-pipeline.md`
- **DevOps Directions**: `docs/directions/devops.md`

---

**📊 End of Runbook**

