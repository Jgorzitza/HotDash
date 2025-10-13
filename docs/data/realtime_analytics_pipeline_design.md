---
title: Real-time Analytics Pipeline Design
created: 2025-10-12
owner: data
status: design
---

# Real-time Analytics Pipeline for Agent Performance

## Architecture Overview

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│  Source Tables  │ ──────▶ │  Materialized    │ ──────▶ │   Dashboard     │
│  (Agent SDK)    │ Trigger │  Views + Cache   │  Query  │   Tiles         │
└─────────────────┘         └──────────────────┘         └─────────────────┘
        │                            │                            │
        │                            │                            │
        ▼                            ▼                            ▼
  agent_approvals          v_agent_metrics_rt            Real-time UI
  AgentFeedback           (refreshed on write)         (< 1s latency)
  AgentQuery
```

## Components

### 1. Source Tables (Real-time Write Layer)

**High-Velocity Tables** (frequent writes):
- `agent_approvals` - Every agent draft (~10-100/hour)
- `AgentQuery` - Every API call (~100-1000/hour)
- `agent_sdk_notifications` - Real-time alerts

**Medium-Velocity Tables** (periodic writes):
- `AgentFeedback` - Training annotations (~10-50/day)
- `agent_sdk_learning_data` - Improvement tracking

### 2. Materialized Views (Analytics Layer)

**Strategy**: Incremental refresh on write using triggers

#### Materialized View 1: Real-time Queue Metrics
```sql
CREATE MATERIALIZED VIEW mv_agent_queue_realtime AS
SELECT 
  'current' as snapshot_time,
  COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
  COUNT(*) FILTER (WHERE status = 'approved') as approved_today,
  COUNT(*) FILTER (WHERE status = 'rejected') as rejected_today,
  AVG(confidence_score) FILTER (WHERE status = 'pending') as avg_confidence,
  COUNT(*) FILTER (WHERE priority = 'urgent') as urgent_count,
  MIN(created_at) FILTER (WHERE status = 'pending') as oldest_pending,
  NOW() as refreshed_at
FROM agent_approvals
WHERE created_at > CURRENT_DATE;

CREATE UNIQUE INDEX ON mv_agent_queue_realtime(snapshot_time);
```

#### Materialized View 2: Agent Accuracy (Rolling)
```sql
CREATE MATERIALIZED VIEW mv_agent_accuracy_rolling AS
SELECT 
  window_start,
  total_drafts,
  approved_count,
  ROUND(100.0 * approved_count / total_drafts, 2) as approval_rate_pct,
  avg_confidence,
  avg_review_time_seconds
FROM (
  SELECT 
    DATE_TRUNC('hour', created_at) as window_start,
    COUNT(*) as total_drafts,
    COUNT(*) FILTER (WHERE status = 'approved') as approved_count,
    AVG(confidence_score) as avg_confidence,
    AVG(EXTRACT(EPOCH FROM (reviewed_at - created_at))) as avg_review_time_seconds
  FROM agent_approvals
  WHERE created_at > NOW() - INTERVAL '24 hours'
  GROUP BY DATE_TRUNC('hour', created_at)
) sub;

CREATE UNIQUE INDEX ON mv_agent_accuracy_rolling(window_start);
```

#### Materialized View 3: Query Performance (Live)
```sql
CREATE MATERIALIZED VIEW mv_query_performance_live AS
SELECT 
  agent,
  COUNT(*) as query_count_1h,
  AVG("latencyMs") as avg_latency_ms,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY "latencyMs") as p95_latency_ms,
  COUNT(*) FILTER (WHERE "latencyMs" > 1000) as slow_query_count,
  NOW() as refreshed_at
FROM "AgentQuery"
WHERE "createdAt" > NOW() - INTERVAL '1 hour'
GROUP BY agent;

CREATE UNIQUE INDEX ON mv_query_performance_live(agent);
```

### 3. Refresh Strategy

**Option A: Trigger-based Refresh (Recommended)**
- **Pros**: Real-time updates, no polling overhead
- **Cons**: Slightly increased write latency
- **Use case**: Critical real-time metrics (queue depth, alerts)

**Option B: Scheduled Refresh (pg_cron)**
- **Pros**: Predictable resource usage, batched updates
- **Cons**: Stale data between refreshes (5-60s lag)
- **Use case**: Historical trends, aggregations

**Option C: Hybrid Approach (Recommended)**
- Critical metrics: Trigger-based (< 1s latency)
- Historical metrics: Scheduled every 15 minutes
- Deep analytics: Scheduled nightly

### 4. Trigger-based Real-time Updates

```sql
-- Refresh function for queue metrics
CREATE OR REPLACE FUNCTION refresh_agent_queue_realtime()
RETURNS TRIGGER AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_agent_queue_realtime;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger on agent_approvals
CREATE TRIGGER trg_refresh_queue_on_insert
AFTER INSERT OR UPDATE OR DELETE ON agent_approvals
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_agent_queue_realtime();

-- Similar triggers for other materialized views...
```

### 5. Dashboard Tile Queries

**Tile 1: Current Queue Status** (< 100ms)
```sql
-- Query the materialized view (fast!)
SELECT 
  pending_count,
  urgent_count,
  avg_confidence,
  EXTRACT(EPOCH FROM (NOW() - oldest_pending))/60 as oldest_age_minutes
FROM mv_agent_queue_realtime;
```

**Tile 2: Hourly Approval Rate Chart** (< 200ms)
```sql
SELECT 
  window_start,
  approval_rate_pct,
  total_drafts
FROM mv_agent_accuracy_rolling
WHERE window_start > NOW() - INTERVAL '24 hours'
ORDER BY window_start;
```

**Tile 3: Agent Performance Leaderboard** (< 150ms)
```sql
SELECT 
  agent,
  query_count_1h,
  avg_latency_ms,
  CASE 
    WHEN avg_latency_ms < 200 THEN 'excellent'
    WHEN avg_latency_ms < 500 THEN 'good'
    WHEN avg_latency_ms < 1000 THEN 'fair'
    ELSE 'needs_attention'
  END as performance_rating
FROM mv_query_performance_live
ORDER BY avg_latency_ms ASC;
```

**Tile 4: Training Data Quality Score** (< 100ms)
```sql
SELECT 
  COUNT(*) as total_annotations,
  ROUND(AVG((rubric->>'clarity')::int), 2) as avg_clarity,
  ROUND(AVG((rubric->>'accuracy')::int), 2) as avg_accuracy,
  COUNT(*) FILTER (WHERE "safeToSend" = false) as flagged_unsafe
FROM "AgentFeedback"
WHERE "createdAt" > NOW() - INTERVAL '7 days';
```

## Data Freshness SLAs

| Metric | Freshness | Update Method | Query Latency |
|--------|-----------|---------------|---------------|
| Queue Depth | < 1s | Trigger | < 100ms |
| Approval Rate (hourly) | < 15m | Scheduled | < 200ms |
| Query Performance | < 1m | Trigger | < 150ms |
| Training Quality | < 1h | Scheduled | < 100ms |
| Historical Trends | < 24h | Nightly | < 500ms |

## Implementation Phases

### Phase 1: Foundation (Immediate)
1. Create 3 core materialized views
2. Set up trigger-based refresh for queue metrics
3. Implement basic dashboard queries

### Phase 2: Optimization (Week 2)
1. Add pg_cron for scheduled refreshes
2. Implement CONCURRENTLY refresh where possible
3. Add caching layer (Redis/Vercel KV)

### Phase 3: Scale (Month 2)
1. Partition large tables by created_at
2. Implement incremental view maintenance
3. Add query result caching in application layer

## Monitoring & Alerts

**Monitor**:
- Materialized view refresh duration
- Dashboard query response times
- Trigger execution overhead on writes
- Data freshness lag (actual vs SLA)

**Alerts**:
- 🔴 Critical: Queue depth > 50 AND oldest_age > 1 hour
- 🟠 Warning: Materialized view refresh > 5 seconds
- 🟠 Warning: Dashboard query > 1 second
- 🟡 Info: Data freshness lag > 2x SLA

## Resource Impact

**Storage**:
- Materialized views: ~10-50MB per view
- Indexes: ~5-20MB per view
- Total: ~150MB for complete analytics layer

**Compute**:
- Trigger overhead: ~10-50ms per write
- Scheduled refresh: ~1-5s per refresh
- Dashboard queries: ~50-200ms per query

**Cost**: Minimal for < 100K rows/day write volume

## Migration Plan

1. **Create views** - Run migration with CREATE MATERIALIZED VIEW
2. **Initial population** - REFRESH MATERIALIZED VIEW (one-time)
3. **Add triggers** - Wire up real-time refresh logic
4. **Add indexes** - Optimize query performance
5. **Test dashboard** - Verify SLAs met
6. **Schedule refreshes** - Set up pg_cron jobs
7. **Monitor** - Track performance for 7 days
8. **Optimize** - Adjust based on real usage patterns

## Rollback Plan

```sql
-- Drop triggers
DROP TRIGGER IF EXISTS trg_refresh_queue_on_insert ON agent_approvals;

-- Drop materialized views
DROP MATERIALIZED VIEW IF EXISTS mv_agent_queue_realtime CASCADE;
DROP MATERIALIZED VIEW IF EXISTS mv_agent_accuracy_rolling CASCADE;
DROP MATERIALIZED VIEW IF EXISTS mv_query_performance_live CASCADE;

-- Revert to standard views (slower but still functional)
-- Dashboard falls back to v_agent_* views
```

## Dashboard Integration

**React Query Configuration**:
```typescript
// Fast polling for real-time metrics
useQuery(['queue-status'], fetchQueueStatus, {
  refetchInterval: 5000, // 5s polling
  staleTime: 3000,
})

// Slower polling for trends
useQuery(['hourly-accuracy'], fetchAccuracy, {
  refetchInterval: 60000, // 1m polling
  staleTime: 30000,
})
```

**WebSocket Enhancement** (Future):
- Use Supabase Realtime for < 1s updates
- Subscribe to agent_approvals changes
- Push updates directly to connected clients

## Success Metrics

**Performance**:
- ✅ Dashboard loads in < 2 seconds
- ✅ All tiles render in < 500ms
- ✅ Real-time updates within SLA

**Reliability**:
- ✅ 99.9% uptime for analytics layer
- ✅ Zero data loss on refresh failures
- ✅ Graceful degradation to standard views

**Scale**:
- ✅ Handles 1000 writes/hour with < 50ms trigger overhead
- ✅ Supports 100 concurrent dashboard users
- ✅ Query response times remain < 500ms at scale

---

**Status**: Design complete, ready for implementation  
**Next Step**: Create materialized views migration  
**Estimated Implementation**: 2-4 hours

