---
title: Query Result Caching Strategy
created: 2025-10-12
owner: data
status: design
---

# Query Result Caching Strategy for Agent Dashboard

## Overview

**Goal**: Sub-100ms dashboard response times with minimal database load

**Approach**: Multi-layer caching (application → database → materialized views)

## Caching Layers

### Layer 1: Browser/Client Cache (EdgeRuntime)

**Implementation**: React Query with optimistic updates

```typescript
// app/lib/queries/agentMetrics.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useQueueStatus() {
  return useQuery({
    queryKey: ['agent', 'queue', 'status'],
    queryFn: async () => {
      const res = await fetch('/api/agent/queue/status');
      return res.json();
    },
    staleTime: 5000, // Consider fresh for 5s
    cacheTime: 60000, // Keep in cache for 1m
    refetchInterval: 10000, // Poll every 10s
    refetchOnWindowFocus: true,
  });
}

export function useApproveQueueItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (approvalId: string) => {
      const res = await fetch(`/api/agent/approve/${approvalId}`, {
        method: 'POST',
      });
      return res.json();
    },
    onMutate: async (approvalId) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['agent', 'queue', 'status'] });
      const previous = queryClient.getQueryData(['agent', 'queue', 'status']);
      
      queryClient.setQueryData(['agent', 'queue', 'status'], (old: any) => ({
        ...old,
        pending_count: old.pending_count - 1,
        approved_today: old.approved_today + 1,
      }));
      
      return { previous };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      queryClient.setQueryData(['agent', 'queue', 'status'], context.previous);
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['agent', 'queue'] });
    },
  });
}
```

**TTL by Query Type**:
- Real-time queue status: 5s stale, 10s refetch interval
- Hourly trends: 5m stale, 15m refetch interval
- Daily aggregates: 1h stale, no refetch
- Historical analysis: 24h stale, no refetch

### Layer 2: Server-Side Cache (Vercel KV / Redis)

**Implementation**: Cache API responses with smart invalidation

```typescript
// app/lib/cache/agentCache.ts
import { kv } from '@vercel/kv';

export async function getCachedQueueStatus() {
  const cached = await kv.get('agent:queue:status');
  if (cached) return cached;
  
  // Query database
  const status = await db.query('SELECT * FROM mv_agent_queue_realtime');
  
  // Cache for 10 seconds
  await kv.set('agent:queue:status', status, { ex: 10 });
  
  return status;
}

export async function invalidateQueueCache() {
  await kv.del('agent:queue:status');
  await kv.del('agent:queue:pending');
  await kv.del('agent:queue:hourly');
}

// Webhook handler for Supabase Realtime
export async function onApprovalChange(payload: any) {
  await invalidateQueueCache();
  // Optionally push update via WebSocket
  broadcastToConnectedClients('queue-update', payload);
}
```

**Cache Keys**:
```typescript
const CACHE_KEYS = {
  QUEUE_STATUS: 'agent:queue:status', // TTL: 10s
  QUEUE_PENDING: 'agent:queue:pending:{shop}', // TTL: 30s
  ACCURACY_HOURLY: 'agent:accuracy:hourly', // TTL: 5m
  TRAINING_QUALITY: 'agent:training:quality:7d', // TTL: 1h
  QUERY_PERFORMANCE: 'agent:performance:live', // TTL: 1m
} as const;
```

**Invalidation Strategy**:
- **Write-through**: Invalidate on every write
- **Time-based**: Auto-expire with TTL
- **Event-based**: Supabase Realtime webhooks trigger invalidation

### Layer 3: Database Materialized Views (PostgreSQL)

**Already Implemented**:
- `mv_agent_queue_realtime` - Queue metrics (trigger-refreshed)
- `mv_agent_accuracy_rolling` - Hourly rates (15m refresh)
- `mv_query_performance_live` - Agent latency (1m refresh)

**Refresh Schedule** (via pg_cron):
```sql
-- Every minute: Query performance
SELECT cron.schedule(
  'refresh-query-perf',
  '* * * * *',
  $$REFRESH MATERIALIZED VIEW CONCURRENTLY mv_query_performance_live$$
);

-- Every 15 minutes: Accuracy metrics
SELECT cron.schedule(
  'refresh-accuracy',
  '*/15 * * * *',
  $$REFRESH MATERIALIZED VIEW CONCURRENTLY mv_agent_accuracy_rolling$$
);

-- Queue metrics: Refreshed by trigger (real-time)
```

### Layer 4: Query Result Cache (PostgreSQL)

**Shared Buffers**: Default 128MB, consider increasing for production

```ini
# postgresql.conf
shared_buffers = 256MB  # Cache frequently accessed pages
effective_cache_size = 1GB  # Total memory for caching
work_mem = 16MB  # Memory for sorting/aggregation
```

## Cache Warming Strategy

### On Application Start

```typescript
// Warm critical caches on app startup
export async function warmAgentCaches() {
  const promises = [
    getCachedQueueStatus(),
    getCachedAccuracyMetrics(),
    getCachedQueryPerformance(),
  ];
  
  await Promise.all(promises);
  console.log('Agent caches warmed successfully');
}
```

### Scheduled Warming (Before Peak Traffic)

```typescript
// Cron job: 8:00 AM daily (before operators arrive)
export async function scheduledCacheWarm() {
  // Refresh all materialized views
  await db.query('REFRESH MATERIALIZED VIEW CONCURRENTLY mv_agent_queue_realtime');
  await db.query('REFRESH MATERIALIZED VIEW CONCURRENTLY mv_agent_accuracy_rolling');
  await db.query('REFRESH MATERIALIZED VIEW CONCURRENTLY mv_query_performance_live');
  
  // Pre-populate Redis cache
  await warmAgentCaches();
}
```

## Monitoring Cache Effectiveness

### Metrics to Track

```typescript
export interface CacheMetrics {
  hits: number;
  misses: number;
  hitRate: number;
  avgQueryTime: number;
  cacheSize: number;
}

export async function getCacheMetrics(): Promise<CacheMetrics> {
  const stats = await kv.info('stats');
  return {
    hits: parseInt(stats.keyspace_hits || '0'),
    misses: parseInt(stats.keyspace_misses || '0'),
    hitRate: calculateHitRate(stats),
    avgQueryTime: await getAvgQueryTime(),
    cacheSize: await kv.dbsize(),
  };
}
```

### Dashboard for Cache Health

**Metrics Tile**:
- Cache hit rate (target: > 90%)
- Average query time (target: < 50ms)
- Cache memory usage (target: < 100MB)
- Stale cache count (target: 0)

## Performance Budget

| Query Type | Budget | Cache Strategy | Fallback |
|------------|--------|----------------|----------|
| Queue Status | 50ms | Redis (10s TTL) | Direct query |
| Pending List | 100ms | Redis (30s TTL) | Mat view |
| Hourly Chart | 150ms | Redis (5m TTL) | Mat view |
| Weekly Report | 300ms | Redis (1h TTL) | Direct query |
| Historical | 500ms | No cache | Fact tables |

## Cache Invalidation Patterns

### Pattern 1: Write-Through Invalidation

```typescript
export async function approveQueueItem(id: string) {
  // 1. Update database
  await db.update('agent_approvals', { status: 'approved' }, { id });
  
  // 2. Invalidate caches
  await invalidateQueueCache();
  
  // 3. Warm critical caches
  await getCachedQueueStatus(); // Repopulates cache
}
```

### Pattern 2: Time-Based Expiration

```typescript
// Set TTL based on data volatility
export async function cacheWithTTL(key: string, data: any, volatility: 'high' | 'medium' | 'low') {
  const ttl = {
    high: 10, // 10s
    medium: 300, // 5m
    low: 3600, // 1h
  }[volatility];
  
  await kv.set(key, data, { ex: ttl });
}
```

### Pattern 3: Event-Based Invalidation (Supabase Realtime)

```typescript
// Subscribe to table changes
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(url, key);

supabase
  .channel('agent-approvals-changes')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'agent_approvals' },
    (payload) => {
      invalidateQueueCache();
      broadcastUpdate(payload);
    }
  )
  .subscribe();
```

## Testing Cache Performance

### Load Test Scenarios

```bash
# Test 1: Cold cache (no data cached)
ab -n 1000 -c 10 http://localhost:3000/api/agent/queue/status

# Test 2: Warm cache (data cached)
# Expected: 10-20x faster than cold cache

# Test 3: Cache invalidation impact
# Measure spike in query time when cache invalidated
```

### Benchmarks

**Target Performance**:
- Cold cache: < 200ms (direct query)
- Warm cache: < 50ms (Redis hit)
- Cache miss rate: < 10%
- Invalidation latency: < 100ms

## Rollback Plan

**Disable Caching**:
```typescript
// Environment variable
ENABLE_AGENT_CACHE=false

// Application code
export async function getQueueStatus() {
  if (process.env.ENABLE_AGENT_CACHE === 'false') {
    return db.query('SELECT * FROM mv_agent_queue_realtime');
  }
  return getCachedQueueStatus();
}
```

**Clear All Caches**:
```typescript
export async function clearAllAgentCaches() {
  const keys = await kv.keys('agent:*');
  for (const key of keys) {
    await kv.del(key);
  }
  console.log(`Cleared ${keys.length} agent cache keys`);
}
```

---

**Status**: Strategy designed, ready for implementation  
**Dependencies**: Vercel KV or Redis instance  
**Estimated Implementation**: 1-2 days

