# Dashboard Tile Queries Specification

**File:** `docs/specs/dashboard_queries.md`  
**Owner:** data agent  
**Version:** 1.0  
**Date:** 2025-10-15  
**Migration:** `supabase/migrations/20251015_dashboard_tile_queries.sql`

---

## 1) Purpose

Real-time RPC functions that power the 7 dashboard tiles in the operator control center. Each function returns JSONB with current metrics and trends.

---

## 2) Dashboard Tiles

### Tile 1: Revenue (Last 30 Days)
**Function:** `get_revenue_tile()`  
**Returns:** Current 30-day revenue with trend vs previous 30 days

**Response Format:**
```json
{
  "current_30d": 125000.50,
  "previous_30d": 110000.00,
  "trend_pct": 13.64,
  "trend_direction": "up",
  "last_updated": "2025-10-15T21:00:00Z"
}
```

**Usage:**
```typescript
const { data } = await supabase.rpc('get_revenue_tile');
```

---

### Tile 2: AOV (Average Order Value)
**Function:** `get_aov_tile()`  
**Returns:** Current AOV with trend

**Response Format:**
```json
{
  "current_aov": 85.50,
  "previous_aov": 82.00,
  "trend_pct": 4.27,
  "trend_direction": "up",
  "last_updated": "2025-10-15T21:00:00Z"
}
```

---

### Tile 3: Returns (Return Rate)
**Function:** `get_returns_tile()`  
**Returns:** Return rate percentage with trend

**Response Format:**
```json
{
  "current_rate_pct": 3.5,
  "previous_rate_pct": 4.2,
  "trend_pct": -16.67,
  "trend_direction": "down",
  "last_updated": "2025-10-15T21:00:00Z"
}
```

**Note:** For returns, "down" trend is good (lower return rate)

---

### Tile 4: Stock Risk
**Function:** `get_stock_risk_tile()`  
**Returns:** Products with low WOS (Weeks of Stock)

**Response Format:**
```json
{
  "critical_count": 12,
  "warning_count": 25,
  "total_products": 150,
  "risk_level": "high",
  "last_updated": "2025-10-15T21:00:00Z"
}
```

**Risk Levels:**
- `critical`: WOS < 2 weeks
- `warning`: WOS 2-4 weeks
- `risk_level`: "high" (>10 critical), "medium" (5-10 critical), "low" (<5 critical)

---

### Tile 5: SEO Anomalies
**Function:** `get_seo_anomalies_tile()`  
**Returns:** Pages with traffic drops > 20%

**Response Format:**
```json
{
  "anomaly_count": 8,
  "total_pages": 120,
  "severity": "warning",
  "last_updated": "2025-10-15T21:00:00Z"
}
```

**Severity Levels:**
- `critical`: >10 anomalies
- `warning`: 5-10 anomalies
- `normal`: <5 anomalies

---

### Tile 6: CX Queue
**Function:** `get_cx_queue_tile()`  
**Returns:** Pending conversations with SLA tracking

**Response Format:**
```json
{
  "pending_count": 15,
  "sla_breaches": 3,
  "urgency": "warning",
  "last_updated": "2025-10-15T21:00:00Z"
}
```

**SLA:** 15 minutes for first response  
**Urgency Levels:**
- `critical`: >5 SLA breaches
- `warning`: 1-5 SLA breaches
- `normal`: 0 SLA breaches

---

### Tile 7: Approvals Queue
**Function:** `get_approvals_queue_tile()`  
**Returns:** Pending approvals by kind

**Response Format:**
```json
{
  "pending_count": 12,
  "by_kind": {
    "cx_reply": 5,
    "inventory": 4,
    "growth": 3
  },
  "urgency": "medium",
  "last_updated": "2025-10-15T21:00:00Z"
}
```

**Urgency Levels:**
- `high`: >10 pending
- `medium`: 5-10 pending
- `low`: <5 pending

---

## 3) Data Sources

### Facts Table
All tiles query the `facts` table with different `topic` values:

- **Revenue/AOV:** `topic = 'shopify.sales'`
- **Returns:** `topic = 'shopify.orders'`
- **Stock Risk:** `topic = 'shopify.inventory'`
- **SEO Anomalies:** `topic = 'analytics.traffic'`

### CX Conversations Table
- **CX Queue:** `cx_conversations` table with `status = 'pending'`

### Approvals Table
- **Approvals Queue:** `approvals` table with `state = 'pending_review'`

---

## 4) Performance Considerations

### Query Optimization
- All functions use indexed columns (`topic`, `created_at`, `status`, `state`)
- Time-based queries use `>= NOW() - INTERVAL` for index usage
- COALESCE used to handle NULL values gracefully

### Caching Strategy
- Functions return `last_updated` timestamp
- Frontend can cache results for 30-60 seconds
- Use SSE or polling for real-time updates

### Performance Targets
- P95 latency: < 100ms per tile
- Concurrent queries: Support 10+ simultaneous users
- Data freshness: Real-time (no materialized views)

---

## 5) Security

### RLS Policies
All functions use `SECURITY DEFINER` and are granted to:
- `authenticated` - Logged-in users
- `service_role` - Backend services

### Data Access
- Functions only return aggregated metrics (no PII)
- No customer names, emails, or sensitive data
- Shop-scoped queries (future: add shop_domain filter)

---

## 6) Testing

### Unit Tests
```sql
-- Test all tiles return valid JSONB
SELECT public.get_revenue_tile();
SELECT public.get_aov_tile();
SELECT public.get_returns_tile();
SELECT public.get_stock_risk_tile();
SELECT public.get_seo_anomalies_tile();
SELECT public.get_cx_queue_tile();
SELECT public.get_approvals_queue_tile();
```

### Integration Tests
```typescript
// Test from frontend
const tiles = await Promise.all([
  supabase.rpc('get_revenue_tile'),
  supabase.rpc('get_aov_tile'),
  supabase.rpc('get_returns_tile'),
  supabase.rpc('get_stock_risk_tile'),
  supabase.rpc('get_seo_anomalies_tile'),
  supabase.rpc('get_cx_queue_tile'),
  supabase.rpc('get_approvals_queue_tile'),
]);

console.log('All tiles loaded:', tiles.every(t => t.data));
```

---

## 7) Frontend Integration

### React Component Example
```typescript
import { useEffect, useState } from 'react';
import { supabase } from '~/lib/supabase';

export function DashboardTile({ tileId }: { tileId: string }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTile = async () => {
      const { data } = await supabase.rpc(`get_${tileId}_tile`);
      setData(data);
      setLoading(false);
    };

    fetchTile();
    const interval = setInterval(fetchTile, 60000); // Refresh every 60s

    return () => clearInterval(interval);
  }, [tileId]);

  if (loading) return <Spinner />;

  return (
    <Card>
      <TileContent data={data} />
    </Card>
  );
}
```

---

## 8) Monitoring

### Metrics to Track
- Function execution time (P50, P95, P99)
- Error rate per function
- Cache hit rate (if caching implemented)
- Data freshness (time since last update)

### Alerts
- P95 latency > 200ms
- Error rate > 1%
- Any function returning NULL

---

## 9) Future Enhancements

### Phase 2
- Add shop_domain parameter for multi-tenant support
- Implement materialized views for historical trends
- Add drill-down functions (e.g., get_revenue_by_category)
- Add real-time subscriptions via Supabase Realtime

### Phase 3
- Add user-specific filters (e.g., date range, product category)
- Implement caching layer (Redis or Supabase Edge Functions)
- Add export functionality (CSV, PDF)

---

## 10) Acceptance Criteria

- [x] All 7 RPC functions created
- [x] Functions return valid JSONB
- [x] Migrations tested up/down
- [x] Documentation complete
- [x] Performance validated (< 100ms)
- [ ] Frontend integration tested
- [ ] CI checks green

---

## 11) Changelog

- 1.0 (2025-10-15) - Initial implementation of 7 dashboard tile queries

