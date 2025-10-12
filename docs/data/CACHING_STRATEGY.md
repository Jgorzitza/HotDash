# Hot Rod AN Caching Strategy

**Purpose**: Define caching strategy for frequently accessed analytics data  
**Last Updated**: 2025-10-12  
**Owner**: DATA Agent

---

## Overview

Caching strategy for Hot Rod AN dashboard to achieve <200ms query performance and reduce database load.

---

## Caching Layers

### Layer 1: Database-Level Caching

#### Materialized Views (Future Enhancement)
Currently using regular views. Consider materializing for:

- `v_sales_pulse_current` - Refresh every 5 minutes
- `v_inventory_alerts` - Refresh every 10 minutes  
- `v_kpi_summary` - Refresh every 5 minutes

**Implementation**:
```sql
-- Example: Materialized view for sales pulse
CREATE MATERIALIZED VIEW mv_sales_pulse_current AS
SELECT * FROM v_sales_pulse_current;

-- Refresh schedule (via cron job)
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_sales_pulse_current;
```

**Benefits**:
- Pre-computed aggregations
- Faster query response (50-100ms vs 200-500ms)
- Reduced DB load for complex joins

**Trade-offs**:
- Staleness (5-10 minute lag acceptable for analytics)
- Storage overhead (minimal for aggregated data)

### Layer 2: Application-Level Caching (Redis)

#### Cache Configuration

**Hot Cache (5-minute TTL)**:
- Dashboard tile data (all 5 tiles)
- KPI summary
- Active alerts/escalations

**Warm Cache (15-minute TTL)**:
- Historical trends (30-day, 90-day)
- Customer segment summaries
- Product performance by category

**Cold Cache (1-hour TTL)**:
- Growth milestones
- YTD metrics
- CEO time savings aggregates

#### Cache Keys

```typescript
const CACHE_KEYS = {
  // Tile data
  salesPulse: 'dashboard:tile:sales_pulse:v1',
  inventoryHeatmap: 'dashboard:tile:inventory:v1',
  fulfillmentHealth: 'dashboard:tile:fulfillment:v1',
  cxEscalations: 'dashboard:tile:cx:v1',
  opsMetrics: 'dashboard:tile:ops:v1',
  
  // Aggregates
  kpiSummary: 'dashboard:kpi:summary:v1',
  growthMilestones: 'dashboard:growth:milestones:v1',
  ceoTimeSavings: 'dashboard:time_savings:v1',
  
  // Alerts
  criticalAlerts: 'dashboard:alerts:critical:v1',
  allAlerts: 'dashboard:alerts:all:v1',
};
```

#### Cache Invalidation Strategy

**Immediate Invalidation Triggers**:
- New order created → Invalidate `salesPulse`, `kpiSummary`
- Inventory updated → Invalidate `inventoryHeatmap`, `kpiSummary`
- SLA breach detected → Invalidate `fulfillmentHealth`, `cxEscalations`, `criticalAlerts`
- Shop activated → Invalidate `opsMetrics`

**Scheduled Invalidation**:
- EOD (00:00 UTC) → Invalidate all daily metrics
- 1st of month → Invalidate monthly/YTD metrics

**Pattern**:
```typescript
// Cache-aside pattern
async function getSalesPulse() {
  const cached = await redis.get(CACHE_KEYS.salesPulse);
  if (cached) return JSON.parse(cached);
  
  const data = await db.query('SELECT * FROM v_sales_pulse_current');
  await redis.setex(CACHE_KEYS.salesPulse, 300, JSON.stringify(data)); // 5 min TTL
  return data;
}

// Invalidation on order create
async function onOrderCreated(orderId) {
  await redis.del(CACHE_KEYS.salesPulse, CACHE_KEYS.kpiSummary);
}
```

### Layer 3: CDN/Edge Caching

#### Static Data Caching

Cache at CDN edge for:
- Historical trend charts (30-90 day data)
- Customer segment analysis
- Product category analytics

**Headers**:
```
Cache-Control: public, max-age=300, s-maxage=600
```

**Purge Strategy**:
- On-demand purge when underlying data changes
- Automatic purge at EOD

---

## Caching by Data Type

### Real-Time Data (No Caching)

Never cache (always query live):
- Current SLA breach status
- Active escalations requiring immediate action
- Real-time inventory for checkout flow

### Near-Real-Time Data (5-min Cache)

Light caching acceptable:
- Dashboard tile KPIs
- Top products/SKUs
- Current alerts summary

### Historical Data (15-min to 1-hour Cache)

Longer caching acceptable:
- 30-day revenue trends
- Customer segment distribution
- Product performance by category
- Growth metrics

### Aggregated Metrics (1-hour to 24-hour Cache)

Long caching for expensive queries:
- YTD revenue calculations
- CEO time savings aggregates
- Historical comparisons (YoY, QoQ)

---

## Cache Warming Strategy

### Pre-warm Cache (Before Peak Hours)

**Schedule**: 06:00 UTC (before business hours in US timezones)

**Warm these queries**:
```sql
-- Tile 1: Sales Pulse
SELECT * FROM v_sales_pulse_current;

-- Tile 2: Inventory Alerts
SELECT * FROM v_inventory_alerts;

-- Tile 3: Fulfillment Issues
SELECT * FROM v_fulfillment_issues WHERE issue_severity IN ('critical', 'high');

-- Tile 4: CX Escalations
SELECT * FROM v_cx_escalations WHERE status IN ('open', 'pending');

-- Tile 5: Ops Metrics
SELECT * FROM v_sla_performance_7d;

-- KPI Summary
SELECT * FROM v_kpi_summary;
```

**Implementation**:
```bash
# Cron job to warm cache
0 6 * * * curl -X POST https://api.hotrodan.com/cache/warm
```

---

## Cache Size Estimates

| Cache Item | Estimated Size | Quantity | Total |
|------------|---------------|----------|-------|
| Sales Pulse tile | 2 KB | 1 | 2 KB |
| Inventory Alerts | 50 KB | 1 | 50 KB |
| Fulfillment Issues | 20 KB | 1 | 20 KB |
| CX Escalations | 30 KB | 1 | 30 KB |
| Ops Metrics | 10 KB | 1 | 10 KB |
| KPI Summary | 5 KB | 1 | 5 KB |
| Historical Trends | 100 KB | 4 views | 400 KB |
| **Total Estimated** | | | **~520 KB** |

**Redis Memory Required**: 1-2 GB (with overhead and multiple cache versions)

---

## Performance Monitoring

### Cache Hit Rate Targets

- **Dashboard tiles**: > 90% hit rate (5-min TTL)
- **Historical data**: > 95% hit rate (15-min TTL)
- **Aggregates**: > 98% hit rate (1-hour TTL)

### Monitoring Metrics

```typescript
// Track these metrics
interface CacheMetrics {
  hitRate: number;        // Target: > 90%
  missRate: number;       // Target: < 10%
  avgLatency: number;     // Target: < 5ms
  evictionRate: number;   // Target: < 5%
  memoryUsage: number;    // Target: < 80% of allocated
}
```

### Alert Conditions

- Cache hit rate < 80% for 5+ minutes
- Average cache latency > 10ms
- Memory usage > 90%
- Eviction rate > 20%

---

## Cache Bypass Scenarios

### When to Skip Cache

1. **Admin/Debug Mode**: Query param `?nocache=true`
2. **Data Export**: Export requests always hit DB directly
3. **Real-time Alerts**: SLA breaches, critical inventory
4. **Manual Data Refreshes**: Operator-triggered refresh

### Implementation

```typescript
async function getDashboardTile(tileId: string, options: QueryOptions) {
  if (options.noCache || options.adminMode || options.export) {
    return await db.query(getTileQuery(tileId));
  }
  
  return await getCachedTileData(tileId);
}
```

---

## Future Enhancements

### Phase 2: Edge Caching

Deploy dashboard to edge locations:
- Cloudflare Workers / Vercel Edge
- Cache dashboard HTML + initial data at edge
- Sub-100ms page loads globally

### Phase 3: Intelligent Pre-fetching

Pre-fetch likely next queries:
- User views Tile 1 → Pre-fetch Tiles 2-5
- User clicks "Trends" → Pre-fetch 30/90-day data
- Morning login → Pre-warm all tiles

### Phase 4: Real-Time Updates

WebSocket connections for:
- Live order count updates
- Real-time SLA breach notifications
- Instant inventory alerts

---

## Implementation Checklist

- [ ] Set up Redis instance (or use Supabase/Upstash)
- [ ] Implement cache-aside pattern for tile queries
- [ ] Add cache invalidation webhooks
- [ ] Set up cache warming cron job
- [ ] Monitor cache hit rates
- [ ] Document cache key versioning strategy
- [ ] Test cache performance under load

---

## Cache Key Versioning

Version cache keys to enable:
- Zero-downtime schema changes
- A/B testing different queries
- Gradual rollout of optimizations

**Pattern**: `{resource}:{identifier}:v{version}`

**Example**:
```
v1 → v2 migration:
- Deploy new code using v2 keys
- Keep v1 cache for 5 minutes (grace period)
- Auto-purge v1 after TTL expires
```

---

**Status**: Strategy defined, ready for implementation  
**Next Steps**: Integrate with dashboard API endpoints

