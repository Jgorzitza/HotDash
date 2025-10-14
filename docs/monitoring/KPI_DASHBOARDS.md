# KPI Dashboards System
**Created**: 2025-10-14  
**Owner**: Reliability  
**Status**: Operational  
**Growth Spec**: I1-I8

## Overview

Automated monitoring system providing real-time visibility into growth automation metrics.

## Architecture

### Components
1. **Analytics Views** (`supabase/analytics/kpi_dashboards.sql`)
   - Pre-aggregated metrics for fast queries
   - Hourly/daily rollups
   - Real-time current state views

2. **API Endpoint** (`app/routes/api/dashboards.kpis.ts`)
   - REST API for dashboard data
   - Query parameter filtering
   - JSON response format

3. **Monitoring Script** (`scripts/monitoring/kpi-dashboard-check.mjs`)
   - Automated health checks
   - Console output for logs
   - Alert detection built-in

## Dashboards

### Dashboard 1: Action Throughput
**Metrics**:
- Actions created/hour
- Actions approved/hour
- Actions rejected/hour
- Current backlog size
- Oldest pending action age

**API**: `GET /api/dashboards/kpis?dashboard=throughput`

**View**: `v_action_throughput_hourly`, `v_action_backlog_current`

**Alerts**:
- Backlog > 1000: Capacity issue

### Dashboard 2: Recommender Performance
**Metrics**:
- Total actions by conversation
- Approval rate by recommender
- Rejection rate
- Processing time averages
- Daily approval trends

**API**: `GET /api/dashboards/kpis?dashboard=recommender`

**Views**: `v_recommender_performance`, `v_daily_approval_metrics`

**Alerts**:
- Rejection rate > 10%: Quality issue

### Dashboard 3: SEO Impact
**Status**: Placeholder (requires GA/GSC integration)

**Implementation**: Growth Spec A1-A7

**API**: `GET /api/dashboards/kpis?dashboard=seo`

### Dashboard 4: System Health
**Metrics**:
- Queue depth (real-time)
- Error count (last hour)
- Average response time
- Actions per hour
- Agent performance summary

**API**: `GET /api/dashboards/kpis?dashboard=health`

**Views**: `v_system_health_current`, `v_api_health_metrics`, `v_agent_performance_summary`

**Alerts**:
- Errors > 10/hour: Reliability issue
- Response time > 1000ms: Performance issue

## Usage

### API Access
```bash
# Get all dashboards
curl http://localhost:45001/api/dashboards/kpis

# Get specific dashboard
curl http://localhost:45001/api/dashboards/kpis?dashboard=health
```

### Automated Monitoring
```bash
# Run monitoring check
node scripts/monitoring/kpi-dashboard-check.mjs

# Schedule with cron (every 5 minutes)
*/5 * * * * cd /path/to/hot-dash && node scripts/monitoring/kpi-dashboard-check.mjs >> logs/kpi-monitor.log 2>&1
```

### Database Queries
```sql
-- Check current system health
SELECT * FROM v_system_health_current;

-- Check action backlog
SELECT * FROM v_action_backlog_current;

-- View hourly throughput
SELECT * FROM v_action_throughput_hourly LIMIT 24;

-- Check recommender performance
SELECT * FROM v_recommender_performance;
```

## Deployment

### Local Development
1. Ensure Supabase is running: `npx supabase start`
2. Apply analytics views: `psql $DATABASE_URL -f supabase/migrations/20251014185034_kpi_dashboard_analytics.sql`
3. Test monitoring script: `node scripts/monitoring/kpi-dashboard-check.mjs`
4. Access API: `http://localhost:45001/api/dashboards/kpis`

### Production
1. Deploy migration via Supabase CLI
2. Configure environment variables (SUPABASE_URL, SUPABASE_SERVICE_KEY)
3. Set up cron job for monitoring script
4. Configure alerting (see P1-T2: Alerting System)

## Files

- **Analytics**: `supabase/analytics/kpi_dashboards.sql`
- **Migration**: `supabase/migrations/20251014185034_kpi_dashboard_analytics.sql`
- **API**: `app/routes/api/dashboards.kpis.ts`
- **Monitor**: `scripts/monitoring/kpi-dashboard-check.mjs`
- **Docs**: `docs/monitoring/KPI_DASHBOARDS.md` (this file)

## Metrics Coverage

**Implemented** ✅:
- I1: Action throughput tracking
- I2: Recommender performance
- I4: System health monitoring
- I5: Agent performance metrics
- I8: Error rate tracking

**Pending** ⏳:
- I3: SEO impact (requires GA/GSC integration - Growth Spec A1-A7)
- I6-I7: Advanced metrics (next iteration)

## Next Steps

1. **Alerting System** (P1-T2): Configure proactive alerts
2. **SLO Tracking** (P1-T3): Service level objective monitoring
3. **SEO Integration**: Implement when data pipelines ready (A1-A7)
4. **Dashboard UI**: Build visual interface (optional - API-first)

---

**Evidence**: Database views operational, API endpoint functional, monitoring script tested
**Timestamp**: 2025-10-14T18:52:00Z
