# Performance Monitoring Setup

**Version**: 1.0  
**Last Updated**: 2025-10-21  
**Owner**: DevOps  
**Status**: ACTIVE

---

## Overview

Performance monitoring for HotDash staging and production environments, tracking tile load times, response times, and alerting on performance degradation.

## Metrics Tracked

### P95 Tile Load Times

- **Target**: <3 seconds
- **Warning**: >3s <5s
- **Critical**: >5s

### Response Times

- **Target**: <1s
- **Warning**: >1s <5s
- **Critical**: >5s

### Error Rates

- **Target**: <1%
- **Warning**: >1% <5%
- **Critical**: >5%

---

## Fly.io Built-in Monitoring

Fly.io provides built-in metrics via the platform:

### View Metrics

```bash
# View app metrics dashboard
flyctl dashboard --app hotdash-staging

# View metrics in web UI
# https://fly.io/apps/hotdash-staging/monitoring
```

### Available Metrics

- **Response time** (P50, P95, P99)
- **Request rate** (requests per second)
- **Error rate** (5xx errors)
- **CPU usage**
- **Memory usage**
- **Network I/O**

---

## Application-Level Metrics

### Client-Side Performance Tracking

HotDash tracks tile load times in the browser using Performance API:

**Location**: `app/hooks/useTilePerformance.ts` (to be created by Engineer)

**Metrics Collected**:

- Tile mount time
- API fetch duration
- Render completion time
- Total tile load time

**Storage**: Client-side metrics sent to `/api/metrics/tile-performance`

### Server-Side Logging

**Location**: `app/utils/metrics.server.ts`

Current metrics logged every 60 seconds:

```typescript
{
  "counters": {},  // Request counts
  "gauges": {},    // Current values (connections, memory)
  "histograms": {}, // Distribution (response times)
  "timers": {}     // Duration tracking
}
```

---

## Alerting Setup

### Method 1: Fly.io Email Alerts (Recommended)

**Setup**:

1. Navigate to https://fly.io/apps/hotdash-staging/monitoring
2. Click "Alerts" tab
3. Add alert rules:

**Alert 1: High Error Rate**

```yaml
Metric: HTTP 5xx Error Rate
Condition: > 5%
Duration: 5 minutes
Action: Email to jgorzitza@outlook.com
```

**Alert 2: Slow Response Times**

```yaml
Metric: P95 Response Time
Condition: > 5000ms
Duration: 5 minutes
Action: Email to jgorzitza@outlook.com
```

**Alert 3: Machine Down**

```yaml
Metric: Machine Health
Condition: Not healthy
Duration: 2 minutes
Action: Email to jgorzitza@outlook.com
```

### Method 2: GitHub Actions Monitoring (Automated)

**Workflow**: `.github/workflows/monitor-performance.yml` (to be created)

```yaml
name: Performance Monitoring

on:
  schedule:
    - cron: "*/15 * * * *" # Every 15 minutes
  workflow_dispatch:

jobs:
  monitor:
    runs-on: ubuntu-latest
    steps:
      - name: Check staging health
        run: |
          HEALTH=$(curl -s -w "%{http_code}" https://hotdash-staging.fly.dev/health -o /dev/null)
          if [ "$HEALTH" != "200" ]; then
            echo "::error::Staging health check failed: HTTP $HEALTH"
            exit 1
          fi

      - name: Check response time
        run: |
          START=$(date +%s%N)
          curl -s https://hotdash-staging.fly.dev/ > /dev/null
          END=$(date +%s%N)
          DURATION=$(( ($END - $START) / 1000000 ))  # Convert to ms

          echo "Response time: ${DURATION}ms"

          if [ $DURATION -gt 5000 ]; then
            echo "::warning::Slow response time: ${DURATION}ms (>5s threshold)"
          fi
```

---

## Performance Dashboard

### Fly.io Dashboard

**URL**: https://fly.io/apps/hotdash-staging/monitoring

**Metrics Available**:

- Real-time machine status
- Request rate (req/s)
- Response times (P50, P95, P99)
- Error rates
- CPU and memory usage
- Network throughput

### Custom Dashboard (Future)

**Option 1: Grafana + Prometheus**

- Export Fly metrics to Prometheus
- Visualize in Grafana dashboard
- Custom alerts and SLOs

**Option 2: Application Metrics**

- Store tile load times in Supabase
- Build custom dashboard in HotDash `/admin/metrics`
- Track user-facing performance

---

## Performance Testing

### Load Testing

```bash
# Simple load test with curl
for i in {1..100}; do
  curl -s -w "%{time_total}\n" -o /dev/null https://hotdash-staging.fly.dev/
done | awk '{sum+=$1; count++} END {print "Avg:", sum/count, "s"}'
```

### Tile Performance Test

```bash
# Test each tile API endpoint
curl -w "@curl-format.txt" https://hotdash-staging.fly.dev/api/analytics/revenue
curl -w "@curl-format.txt" https://hotdash-staging.fly.dev/api/analytics/traffic
curl -w "@curl-format.txt" https://hotdash-staging.fly.dev/api/seo/enhanced
# ... etc for all 8 tiles
```

**Format file** (`curl-format.txt`):

```
time_namelookup:  %{time_namelookup}\n
time_connect:  %{time_connect}\n
time_appconnect:  %{time_appconnect}\n
time_pretransfer:  %{time_pretransfer}\n
time_redirect:  %{time_redirect}\n
time_starttransfer:  %{time_starttransfer}\n
----------\n
time_total:  %{time_total}\n
```

---

## Monitoring Schedule

### Daily

- [x] Check Fly.io dashboard for anomalies
- [x] Review error logs (flyctl logs)
- [x] Verify health endpoints (200 status)

### Weekly

- [ ] Review P95 response times
- [ ] Analyze error patterns
- [ ] Check database connection health
- [ ] Review GA API health (should see success logs every minute)

### Monthly

- [ ] Performance trend analysis
- [ ] Capacity planning review
- [ ] Alert threshold tuning

---

## Alert Response Procedures

### High Error Rate Alert

1. Check Fly.io logs: `flyctl logs --app hotdash-staging -n 100`
2. Identify error pattern (database, external API, code)
3. If critical: Rollback to previous version
4. If non-critical: Create bug ticket, schedule fix
5. Update feedback file with incident details

### Slow Response Time Alert

1. Check machine resources: `flyctl status --app hotdash-staging`
2. Check for database slow queries
3. Check external API latency (GA, Search Console, Shopify)
4. If machine resources exhausted: Scale up (increase CPU/memory)
5. If external API slow: Implement caching or timeouts
6. Document findings in feedback file

### Machine Down Alert

1. Check machine status: `flyctl status --app hotdash-staging`
2. Check logs for crash reason: `flyctl logs --app hotdash-staging`
3. Restart machine: `flyctl machine start <machine-id>`
4. If repeated crashes: Rollback to stable version
5. Escalate to Manager with logs and crash reason

---

## Current Monitoring Status

### Staging

- **App**: hotdash-staging.fly.dev
- **Version**: 74
- **Health**: ✅ HEALTHY (as of 2025-10-21T06:06:47Z)
- **Alerts**: Manual monitoring (Fly dashboard)
- **Performance**: Baseline being established

### Production

- **App**: Not yet deployed
- **Alerts**: TBD upon production deployment

---

## Next Steps

### Short Term (Phase 2-5)

- [x] Monitor v74 deployment health
- [ ] Establish baseline P95 tile load times
- [ ] Set up Fly.io email alerts
- [ ] Document tile load time benchmarks

### Long Term (Phase 11+)

- [ ] Custom metrics dashboard in HotDash
- [ ] Automated performance regression testing
- [ ] SLO tracking (99.9% uptime, <3s tile loads)
- [ ] Production monitoring setup

---

## Related Documentation

- **Fly.io Monitoring**: https://fly.io/docs/metrics-and-logs/
- **Deployment Workflow**: `.github/workflows/deploy-staging.yml`
- **Rollback Procedures**: `docs/runbooks/deployment-rollback.md`
- **Agent Directions**: `docs/directions/devops.md`

---

**📊 End of Runbook**
