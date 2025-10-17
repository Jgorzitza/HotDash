---
epoch: 2025.10.E1
doc: docs/data/realtime_analytics_pipeline.md
owner: data
last_reviewed: 2025-10-11
expires: 2025-11-11
---

# Real-time Analytics Pipeline Design

## Overview

Real-time analytics pipeline for Agent SDK performance monitoring with sub-second data freshness, streaming updates, and live dashboard capabilities.

## Requirements

### Data Freshness

- **Target Latency:** <1 second from event to dashboard
- **Update Frequency:** Continuous (streaming) or 1-second polling
- **Historical Retention:** 7 days hot, 30 days warm, 90 days cold

### Use Cases

1. **Live Agent Monitoring** - Operations dashboard showing current agent activity
2. **Real-time Queue Management** - Approval queue depth and age monitoring
3. **Performance Alerts** - Immediate notification of degraded performance
4. **Capacity Planning** - Real-time load and utilization tracking

## Architecture

### Component Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Real-time Analytics Pipeline                        │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────┐      ┌──────────────┐      ┌──────────────┐      ┌──────────┐
│   Agent SDK  │      │   Supabase   │      │   Real-time  │      │Dashboard │
│  Operations  │ ───> │   Database   │ ───> │    Views     │ ───> │  (Live)  │
│              │      │   (Postgres) │      │   + Listen   │      │          │
└──────────────┘      └──────────────┘      └──────────────┘      └──────────┘
       │                     │                      │                    │
       │                     │                      │                    │
   INSERT into         Trigger fires           Broadcast            Subscribe
   agent_queries       on INSERT/UPDATE        via PG_NOTIFY        to channel
   agent_approvals     └─> pg_notify()         WebSocket/SSE        React hooks
   agent_feedback                               Realtime API
```

### Technology Stack

**Database:** Supabase PostgreSQL  
**Real-time:** Supabase Realtime (via pg_notify + WebSocket)  
**Views:** Materialized views with incremental refresh  
**Caching:** Redis (optional, for sub-second aggregates)  
**Frontend:** React hooks with Supabase Realtime subscriptions

## Implementation Design

### Option 1: Supabase Realtime (Recommended)

**Pros:**

- Native Supabase integration
- WebSocket-based (low latency)
- Automatic reconnection handling
- RLS-aware (security built-in)
- No additional infrastructure

**Cons:**

- Limited to row-level changes (not aggregates)
- Requires client-side aggregation for metrics
- Connection pooling limits (1000 concurrent clients)

**Implementation:**

```typescript
// Dashboard component subscribes to real-time changes
const subscription = supabase
  .channel("agent_performance")
  .on(
    "postgres_changes",
    { event: "*", schema: "public", table: "agent_queries" },
    (payload) => {
      // Update dashboard state
      handleNewQuery(payload.new);
    },
  )
  .subscribe();
```

**Use Cases:**

- Live agent query feed
- Real-time approval queue updates
- Instant notification of new feedback

### Option 2: Polling with Incremental Views

**Pros:**

- Simple implementation
- Aggregate data directly from database
- No WebSocket complexity
- Works with existing infrastructure

**Cons:**

- Higher latency (1-5 seconds)
- More database load (frequent queries)
- Not true "real-time" (near-real-time)

**Implementation:**

```typescript
// Poll every 1 second for updated metrics
useEffect(() => {
  const interval = setInterval(async () => {
    const { data } = await supabase
      .from("v_agent_performance_snapshot")
      .select("*");
    setMetrics(data);
  }, 1000);
  return () => clearInterval(interval);
}, []);
```

**Use Cases:**

- Aggregate metrics (approval rates, latency averages)
- Dashboard tiles with summary stats
- Performance scorecards

### Option 3: Hybrid (Best of Both)

**Approach:**

- Use Realtime for instant notifications (new approvals, queue alerts)
- Use polling (5-second interval) for aggregate metrics
- Cache computed aggregates in materialized views
- Refresh materialized views every 30 seconds

**Implementation:**

```typescript
// Real-time notifications
supabase
  .channel("alerts")
  .on(
    "postgres_changes",
    {
      event: "INSERT",
      schema: "public",
      table: "agent_approvals",
      filter: "status=eq.pending",
    },
    (payload) => showNotification("New approval pending"),
  )
  .subscribe();

// Polling for aggregates (5-second interval)
const { data } = await supabase
  .from("v_agent_performance_snapshot")
  .select("*");
```

**Recommended:** This hybrid approach balances latency, database load, and implementation complexity.

## Data Pipeline Specification

### Streaming Data Sources

**1. Agent Query Events**

- **Source:** `agent_queries` table
- **Event Types:** INSERT (new query)
- **Payload:** query, agent, latency_ms, conversation_id
- **Frequency:** Variable (1-100 queries/minute per agent)
- **Channel:** `agent_queries_stream`

**2. Approval Queue Events**

- **Source:** `agent_approvals` table
- **Event Types:** INSERT (new approval), UPDATE (status change)
- **Payload:** conversation_id, status, created_at, approved_by
- **Frequency:** Variable (1-20 approvals/minute)
- **Channel:** `approval_queue_stream`

**3. Training Data Events**

- **Source:** `agent_feedback` table
- **Event Types:** INSERT (new feedback), UPDATE (annotation)
- **Payload:** conversation_id, safe_to_send, labels, annotator
- **Frequency:** Low (1-10 feedback/hour)
- **Channel:** `training_feedback_stream`

### Aggregation Layer

**Pre-computed Metrics (Updated every 30 seconds):**

```sql
-- Real-time agent performance snapshot
CREATE MATERIALIZED VIEW mv_realtime_agent_performance AS
SELECT
  agent,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '1 minute') as queries_last_minute,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '5 minutes') as queries_last_5min,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '1 hour') as queries_last_hour,
  AVG(latency_ms) FILTER (WHERE created_at > NOW() - INTERVAL '5 minutes') as avg_latency_5min,
  MAX(latency_ms) FILTER (WHERE created_at > NOW() - INTERVAL '5 minutes') as max_latency_5min,
  CASE
    WHEN AVG(latency_ms) FILTER (WHERE created_at > NOW() - INTERVAL '1 minute') > 200 THEN 'degraded'
    WHEN AVG(latency_ms) FILTER (WHERE created_at > NOW() - INTERVAL '1 minute') > 100 THEN 'warning'
    ELSE 'healthy'
  END as current_health_status,
  NOW() as last_updated_at
FROM agent_queries
GROUP BY agent;

-- Refresh every 30 seconds via pg_cron
SELECT cron.schedule(
  'refresh_realtime_agent_performance',
  '*/30 * * * * *',  -- Every 30 seconds
  'REFRESH MATERIALIZED VIEW CONCURRENTLY mv_realtime_agent_performance;'
);
```

### Database Triggers for Notifications

```sql
-- Trigger: Notify on new pending approval
CREATE OR REPLACE FUNCTION notify_new_approval()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'pending' THEN
    PERFORM pg_notify(
      'approval_queue_stream',
      json_build_object(
        'id', NEW.id,
        'conversation_id', NEW.conversation_id,
        'created_at', NEW.created_at
      )::text
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_notify_new_approval
AFTER INSERT ON agent_approvals
FOR EACH ROW
WHEN (NEW.status = 'pending')
EXECUTE FUNCTION notify_new_approval();

-- Trigger: Notify on agent query performance degradation
CREATE OR REPLACE FUNCTION notify_slow_query()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.latency_ms > 200 THEN
    PERFORM pg_notify(
      'performance_alert_stream',
      json_build_object(
        'agent', NEW.agent,
        'latency_ms', NEW.latency_ms,
        'query', LEFT(NEW.query, 100),
        'created_at', NEW.created_at
      )::text
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_notify_slow_query
AFTER INSERT ON agent_queries
FOR EACH ROW
WHEN (NEW.latency_ms > 200)
EXECUTE FUNCTION notify_slow_query();
```

## Live Dashboard Updates

### Implementation Pattern

**Frontend (React + Supabase Realtime):**

```typescript
// hooks/useRealtimeAgentMetrics.ts
export function useRealtimeAgentMetrics() {
  const [metrics, setMetrics] = useState<AgentMetrics[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    // Subscribe to performance snapshot (polling)
    const pollInterval = setInterval(async () => {
      const { data } = await supabase
        .from("mv_realtime_agent_performance")
        .select("*");
      setMetrics(data || []);
    }, 5000); // Poll every 5 seconds

    // Subscribe to real-time alerts
    const alertChannel = supabase
      .channel("performance_alerts")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "agent_queries",
          filter: "latency_ms=gt.200",
        },
        (payload) => {
          setAlerts((prev) => [payload.new, ...prev].slice(0, 10));
        },
      )
      .subscribe();

    // Subscribe to approval queue
    const queueChannel = supabase
      .channel("approval_queue")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "agent_approvals" },
        (payload) => {
          handleQueueUpdate(payload);
        },
      )
      .subscribe();

    return () => {
      clearInterval(pollInterval);
      alertChannel.unsubscribe();
      queueChannel.unsubscribe();
    };
  }, []);

  return { metrics, alerts };
}
```

**Dashboard Component:**

```typescript
// components/AgentPerformanceDashboard.tsx
export function AgentPerformanceDashboard() {
  const { metrics, alerts } = useRealtimeAgentMetrics();

  return (
    <div className="dashboard">
      <LiveMetricsTile metrics={metrics} />
      <PerformanceAlerts alerts={alerts} />
      <ApprovalQueueWidget />
    </div>
  );
}
```

## Data Freshness Requirements

### Tier 1: Real-time (<1 second)

- **New approval requests** - Immediate notification
- **Performance degradation** - Instant alert if latency >200ms
- **Queue SLA breaches** - Immediate alert if pending >5 minutes
- **Critical safety issues** - Instant alert if unsafe response detected

**Implementation:** pg_notify + Supabase Realtime

### Tier 2: Near Real-time (1-5 seconds)

- **Agent performance snapshot** - Current queries/hour, latency, approval rate
- **Queue depth metrics** - Current pending count and age distribution
- **Annotator activity** - Active annotators and productivity

**Implementation:** Polling materialized views (5-second interval)

### Tier 3: Delayed (30 seconds - 1 minute)

- **Aggregate metrics** - Rolling averages, percentiles
- **Quality scores** - Composite scores across multiple dimensions
- **Trend analysis** - Moving averages and forecasts

**Implementation:** Materialized view refresh (30-second interval)

### Tier 4: Batch (5-30 minutes)

- **Historical analysis** - Daily/weekly/monthly rollups
- **Compliance reports** - Audit trail and retention compliance
- **Data quality checks** - Completeness, accuracy, consistency

**Implementation:** Scheduled jobs (pg_cron)

## Notification Channels

### Channel 1: approval_queue_stream

**Purpose:** New and updated approval requests

**Events:**

- INSERT with status = 'pending'
- UPDATE changing status

**Payload:**

```json
{
  "id": 123,
  "conversation_id": "conv-abc",
  "status": "pending",
  "created_at": "2025-10-11T15:00:00Z",
  "age_minutes": 0.5
}
```

### Channel 2: performance_alert_stream

**Purpose:** Performance degradation alerts

**Events:**

- INSERT with latency_ms > 200
- Agent health status change to 'degraded'

**Payload:**

```json
{
  "agent": "data",
  "latency_ms": 245,
  "query": "SELECT order_status...",
  "created_at": "2025-10-11T15:00:00Z",
  "severity": "warning"
}
```

### Channel 3: training_feedback_stream

**Purpose:** New training data and annotations

**Events:**

- INSERT (new feedback)
- UPDATE with safe_to_send change

**Payload:**

```json
{
  "id": 456,
  "conversation_id": "conv-xyz",
  "safe_to_send": false,
  "labels": ["risky", "requires_review"],
  "annotator": "qa_team_1"
}
```

## Caching Strategy

### Level 1: Materialized View Cache (30-second refresh)

**Views:**

- mv_realtime_agent_performance (agent-level aggregates)
- mv_approval_queue_summary (queue metrics by status)
- mv_training_quality_snapshot (quality scores and distribution)

**Refresh Strategy:**

```sql
-- Incremental refresh every 30 seconds
SELECT cron.schedule(
  'refresh_realtime_metrics',
  '*/30 * * * * *',
  $$
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_realtime_agent_performance;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_approval_queue_summary;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_training_quality_snapshot;
  $$
);
```

### Level 2: Application Cache (5-second TTL)

**Use Case:** High-frequency dashboard polling

**Implementation:**

```typescript
// In-memory cache with 5-second TTL
const metricsCache = new Map<string, { data: any; expires: number }>();

async function getCachedMetrics(viewName: string) {
  const cached = metricsCache.get(viewName);
  if (cached && cached.expires > Date.now()) {
    return cached.data;
  }

  const { data } = await supabase.from(viewName).select("*");
  metricsCache.set(viewName, { data, expires: Date.now() + 5000 });
  return data;
}
```

### Level 3: CDN Cache (1-minute TTL)

**Use Case:** Public-facing analytics API

**Implementation:**

- API responses with `Cache-Control: max-age=60`
- CloudFlare caching at edge
- Invalidation via `PURGE` on critical updates

## Performance Targets

### Latency Targets

| Metric Type       | Target | Measurement               |
| ----------------- | ------ | ------------------------- |
| Event to Database | <100ms | INSERT execution time     |
| Database to View  | <1s    | Materialized view refresh |
| View to Dashboard | <500ms | API response time         |
| End-to-End        | <2s    | Event to user screen      |

### Throughput Targets

| Operation                      | Target | Peak Capacity |
| ------------------------------ | ------ | ------------- |
| Agent queries/second           | 100    | 500           |
| Approval requests/minute       | 50     | 200           |
| Feedback annotations/hour      | 100    | 500           |
| Dashboard viewers (concurrent) | 50     | 200           |

### Resource Limits

| Resource              | Limit  | Monitoring    |
| --------------------- | ------ | ------------- |
| Database connections  | 100    | Alert at >80  |
| WebSocket connections | 1000   | Alert at >800 |
| View refresh time     | <500ms | Alert at >2s  |
| API response time     | <200ms | Alert at >1s  |

## Monitoring & Alerting

### Key Metrics

**Performance Metrics:**

- Real-time view refresh latency
- Dashboard update frequency
- WebSocket connection count
- Database connection pool utilization

**Quality Metrics:**

- Data freshness (event timestamp vs. display time)
- Missing events (gaps in sequence)
- Duplicate events (deduplication effectiveness)
- Alert delivery time

### Alert Triggers

**Critical (Immediate):**

- View refresh failure (>3 consecutive failures)
- WebSocket connection pool exhausted (>90%)
- Database connection pool exhausted (>90%)
- End-to-end latency >10 seconds

**Warning (5-minute threshold):**

- View refresh latency >2 seconds
- Dashboard update lag >5 seconds
- WebSocket connections >80%
- Missing events detected

### Health Dashboard

**Metrics to Display:**

```sql
SELECT
  'Real-time Pipeline Health' as component,
  CASE
    WHEN last_refresh > NOW() - INTERVAL '1 minute' THEN 'healthy'
    WHEN last_refresh > NOW() - INTERVAL '5 minutes' THEN 'degraded'
    ELSE 'down'
  END as status,
  EXTRACT(EPOCH FROM (NOW() - last_refresh)) as seconds_since_refresh
FROM (
  SELECT MAX(last_updated_at) as last_refresh
  FROM mv_realtime_agent_performance
) t;
```

## Implementation Phases

### Phase 1: Foundation (Week 1) - CURRENT

- ✅ Create base tables (agent_approvals, agent_feedback, agent_queries)
- ✅ Add RLS policies and indexes
- ✅ Create monitoring views
- ⏳ Implement pg_notify triggers
- ⏳ Create materialized views for real-time

### Phase 2: Real-time Layer (Week 2)

- [ ] Set up Supabase Realtime channels
- [ ] Implement frontend WebSocket subscriptions
- [ ] Create polling mechanism for aggregate views
- [ ] Add caching layer (application + CDN)
- [ ] Test end-to-end latency (<2s target)

### Phase 3: Optimization (Week 3)

- [ ] Tune materialized view refresh frequency
- [ ] Optimize database connection pooling
- [ ] Implement incremental refresh strategies
- [ ] Add monitoring and alerting
- [ ] Load test with realistic volumes

### Phase 4: Production (Week 4)

- [ ] Deploy to staging environment
- [ ] Monitor performance under load
- [ ] Fine-tune refresh intervals
- [ ] Deploy to production
- [ ] Document operational procedures

## SQL Implementation

### Trigger Functions for Real-time Notifications

**File:** `supabase/sql/realtime_triggers.sql`

```sql
-- Trigger: Notify on new pending approval
CREATE OR REPLACE FUNCTION notify_new_approval()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'pending' THEN
    PERFORM pg_notify(
      'approval_queue_stream',
      json_build_object(
        'event', 'new_approval',
        'id', NEW.id,
        'conversation_id', NEW.conversation_id,
        'created_at', NEW.created_at,
        'age_seconds', 0
      )::text
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_notify_new_approval ON agent_approvals;
CREATE TRIGGER trg_notify_new_approval
AFTER INSERT ON agent_approvals
FOR EACH ROW EXECUTE FUNCTION notify_new_approval();

-- Trigger: Notify on approval status change
CREATE OR REPLACE FUNCTION notify_approval_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status != NEW.status THEN
    PERFORM pg_notify(
      'approval_queue_stream',
      json_build_object(
        'event', 'status_change',
        'id', NEW.id,
        'conversation_id', NEW.conversation_id,
        'old_status', OLD.status,
        'new_status', NEW.status,
        'approved_by', NEW.approved_by,
        'resolution_seconds', EXTRACT(EPOCH FROM (NEW.updated_at - NEW.created_at))
      )::text
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_notify_approval_status_change ON agent_approvals;
CREATE TRIGGER trg_notify_approval_status_change
AFTER UPDATE ON agent_approvals
FOR EACH ROW EXECUTE FUNCTION notify_approval_status_change();

-- Trigger: Notify on slow query
CREATE OR REPLACE FUNCTION notify_slow_query()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.latency_ms > 200 THEN
    PERFORM pg_notify(
      'performance_alert_stream',
      json_build_object(
        'event', 'slow_query',
        'agent', NEW.agent,
        'latency_ms', NEW.latency_ms,
        'query', LEFT(NEW.query, 100),
        'conversation_id', NEW.conversation_id,
        'created_at', NEW.created_at
      )::text
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_notify_slow_query ON agent_queries;
CREATE TRIGGER trg_notify_slow_query
AFTER INSERT ON agent_queries
FOR EACH ROW
WHEN (NEW.latency_ms > 200)
EXECUTE FUNCTION notify_slow_query();
```

### Real-time Materialized Views

**File:** `supabase/sql/realtime_materialized_views.sql`

```sql
-- Materialized View 1: Real-time agent performance (refresh every 30s)
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_realtime_agent_performance AS
SELECT
  agent,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '1 minute') as queries_last_minute,
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '5 minutes') as queries_last_5min,
  AVG(latency_ms) FILTER (WHERE created_at > NOW() - INTERVAL '5 minutes') as avg_latency_5min,
  CASE
    WHEN AVG(latency_ms) FILTER (WHERE created_at > NOW() - INTERVAL '1 minute') > 200 THEN 'degraded'
    WHEN AVG(latency_ms) FILTER (WHERE created_at > NOW() - INTERVAL '1 minute') > 100 THEN 'warning'
    ELSE 'healthy'
  END as health_status,
  NOW() as refreshed_at
FROM agent_queries
WHERE created_at > NOW() - INTERVAL '1 hour'
GROUP BY agent;

CREATE UNIQUE INDEX mv_realtime_agent_performance_agent_idx ON mv_realtime_agent_performance (agent);

-- Materialized View 2: Approval queue summary (refresh every 30s)
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_approval_queue_summary AS
SELECT
  COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
  COUNT(*) FILTER (WHERE status = 'pending' AND created_at < NOW() - INTERVAL '5 minutes') as sla_breaches,
  AVG(EXTRACT(EPOCH FROM (NOW() - created_at)) / 60) FILTER (WHERE status = 'pending') as avg_pending_age_minutes,
  MAX(EXTRACT(EPOCH FROM (NOW() - created_at)) / 60) FILTER (WHERE status = 'pending') as max_pending_age_minutes,
  (SELECT conversation_id FROM agent_approvals WHERE status = 'pending' ORDER BY created_at ASC LIMIT 1) as oldest_pending_conversation,
  NOW() as refreshed_at
FROM agent_approvals
WHERE created_at > NOW() - INTERVAL '24 hours';

-- Refresh functions
CREATE OR REPLACE FUNCTION refresh_realtime_metrics()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_realtime_agent_performance;
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_approval_queue_summary;
END;
$$ LANGUAGE plpgsql;
```

## Testing & Validation

### Load Testing Scenarios

**Scenario 1: Normal Load**

- 50 queries/minute across 4 agents
- 5 approval requests/minute
- 2 feedback annotations/minute
- **Expected:** <1s end-to-end latency

**Scenario 2: Peak Load**

- 200 queries/minute across 4 agents
- 20 approval requests/minute
- 10 feedback annotations/minute
- **Expected:** <3s end-to-end latency

**Scenario 3: Stress Test**

- 500 queries/minute (burst)
- 50 approval requests/minute (burst)
- **Expected:** Graceful degradation, no data loss

### Validation Checks

**Data Consistency:**

```sql
-- Verify event counts match across views
SELECT
  (SELECT COUNT(*) FROM agent_queries WHERE created_at > NOW() - INTERVAL '5 minutes') as raw_count,
  (SELECT SUM(queries_last_5min) FROM mv_realtime_agent_performance) as materialized_count;
```

**Latency Measurement:**

```sql
-- Measure view refresh lag
SELECT
  NOW() - refreshed_at as refresh_lag
FROM mv_realtime_agent_performance
LIMIT 1;
```

## Operational Procedures

### Start Real-time Pipeline

```bash
# 1. Ensure Supabase is running
npx supabase start

# 2. Apply real-time triggers
psql $DATABASE_URL -f supabase/sql/realtime_triggers.sql

# 3. Create materialized views
psql $DATABASE_URL -f supabase/sql/realtime_materialized_views.sql

# 4. Schedule refresh jobs
psql $DATABASE_URL -c "
  SELECT cron.schedule(
    'refresh_realtime_metrics',
    '*/30 * * * * *',
    'SELECT refresh_realtime_metrics();'
  );
"

# 5. Start dashboard
npm run dev
```

### Monitor Real-time Pipeline

```bash
# Check view refresh status
psql $DATABASE_URL -c "
  SELECT refreshed_at, NOW() - refreshed_at as lag
  FROM mv_realtime_agent_performance LIMIT 1;
"

# Monitor notification channels
psql $DATABASE_URL -c "LISTEN approval_queue_stream;" &
psql $DATABASE_URL -c "LISTEN performance_alert_stream;" &

# Check pg_notify queue depth
psql $DATABASE_URL -c "
  SELECT COUNT(*) FROM pg_notification_queue;
"
```

### Stop Real-time Pipeline

```bash
# 1. Remove cron jobs
psql $DATABASE_URL -c "
  SELECT cron.unschedule('refresh_realtime_metrics');
"

# 2. Drop triggers (if needed)
# psql $DATABASE_URL -f supabase/sql/realtime_triggers.rollback.sql
```

## Cost & Resource Planning

### Database Resources

**Connection Pool:**

- Base: 20 connections
- Real-time listeners: +10 connections
- Dashboard polling: +5 connections per 100 users
- **Recommendation:** 50 connections for <500 concurrent users

**Storage:**

- Raw tables: ~1GB per month (estimated)
- Materialized views: ~100MB
- Indexes: ~200MB
- **Total:** ~1.3GB per month

**Compute:**

- View refresh: <100ms per refresh (negligible)
- pg_notify: <1ms per event
- **Total:** <5% additional CPU load

### API Resources

**Supabase Realtime:**

- Free tier: 200 concurrent connections
- Recommended tier: Pro (1000 connections)
- **Cost:** $25/month (Pro plan)

**Database:**

- Free tier: 500MB database, 2GB bandwidth
- Recommended tier: Pro (8GB database, 50GB bandwidth)
- **Cost:** Included in Supabase Pro

## Next Steps

### Implementation Roadmap

**Week 1 (Complete):**

- ✅ Base tables and views created
- ⏳ Trigger functions (next step)
- ⏳ Materialized views for real-time

**Week 2:**

- [ ] Frontend integration (React hooks)
- [ ] WebSocket subscriptions
- [ ] Caching layer
- [ ] End-to-end testing

**Week 3:**

- [ ] Load testing
- [ ] Performance tuning
- [ ] Monitoring setup
- [ ] Documentation

**Week 4:**

- [ ] Staging deployment
- [ ] Production deployment
- [ ] Operational handoff

---

**Status:** Design complete, ready for Phase 1 implementation  
**Next:** Create trigger functions and materialized views  
**Estimated Time:** 2-3 hours for Phase 1 completion
