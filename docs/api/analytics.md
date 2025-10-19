# Analytics API Documentation

## Overview

The Analytics API provides access to business metrics including revenue, conversion rates, traffic data, and idea pool analytics. All endpoints return JSON responses with consistent schemas.

**Base URL**: `/api/analytics`  
**Authentication**: Session-based (Shopify embedded app)  
**Rate Limiting**: Not yet implemented  
**Caching**: 5-minute TTL on all metric endpoints

---

## Endpoints

### GET /api/analytics/health

Health check endpoint for monitoring analytics pipeline status.

**Response Schema**:

```typescript
{
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  components: {
    ga4Client: { status: "up" | "down" | "unknown"; message?: string; lastCheck?: string; };
    caching: { status: "up" | "down" | "unknown"; message?: string; lastCheck?: string; };
    samplingGuard: { status: "up" | "down" | "unknown"; message?: string; lastCheck?: string; };
    endpoints: { status: "up" | "down" | "unknown"; message?: string; lastCheck?: string; };
  };
  version: string;
}
```

**Example Response**:

```json
{
  "status": "healthy",
  "timestamp": "2025-10-19T08:00:00.000Z",
  "components": {
    "ga4Client": {
      "status": "up",
      "message": "GA4 client configured and ready"
    },
    "caching": {
      "status": "up",
      "message": "Cache system operational (5min TTL)"
    },
    "samplingGuard": {
      "status": "up",
      "message": "Sampling guard proof available"
    },
    "endpoints": {
      "status": "up",
      "message": "All 5 analytics endpoints available"
    }
  },
  "version": "1.0.0"
}
```

**Status Codes**:

- `200` - Healthy or degraded
- `503` - Unhealthy (one or more components down)

---

### GET /api/analytics/revenue

Returns revenue metrics for the last 30 days with trend comparison.

**Response Schema**:

```typescript
{
  revenue: number;
  period: string;
  change?: number;
  currency: string;
  previousPeriod?: {
    revenue: number;
    period: string;
  };
}
```

**Example Response**:

```json
{
  "revenue": 12500,
  "period": "2024-09-19 to 2024-10-19",
  "change": 5.9,
  "currency": "USD",
  "previousPeriod": {
    "revenue": 11800,
    "period": "previous 30 days"
  }
}
```

**Status Codes**:

- `200` - Success
- `500` - Server error (returns minimal data)

**Cache**: 5 minutes

---

### GET /api/analytics/conversion-rate

Returns conversion rate metrics for the last 30 days with trend comparison.

**Response Schema**:

```typescript
{
  conversionRate: number;
  period: string;
  change?: number;
  previousPeriod?: {
    conversionRate: number;
    period: string;
  };
}
```

**Example Response**:

```json
{
  "conversionRate": 2.8,
  "period": "2024-09-19 to 2024-10-19",
  "change": 7.7,
  "previousPeriod": {
    "conversionRate": 2.6,
    "period": "previous 30 days"
  }
}
```

**Status Codes**:

- `200` - Success
- `500` - Server error (returns minimal data)

**Cache**: 5 minutes

---

### GET /api/analytics/traffic

Returns traffic metrics for the last 30 days with trend comparison.

**Response Schema**:

```typescript
{
  sessions: number;
  users: number;
  pageviews: number;
  period: string;
  bounceRate?: number;
  avgSessionDuration?: number;
  previousPeriod?: {
    sessions: number;
    users: number;
    pageviews: number;
    period: string;
  };
}
```

**Example Response**:

```json
{
  "sessions": 5214,
  "users": 3911,
  "pageviews": 13035,
  "period": "2024-09-19 to 2024-10-19",
  "bounceRate": 45.2,
  "avgSessionDuration": 145,
  "previousPeriod": {
    "sessions": 5500,
    "users": 4125,
    "pageviews": 13750,
    "period": "previous 30 days"
  }
}
```

**Status Codes**:

- `200` - Success
- `500` - Server error (returns minimal data)

**Cache**: 5 minutes

---

### GET /api/analytics/idea-pool

Returns idea pool analytics including pending, approved, and rejected ideas.

**Response Schema**:

```typescript
{
  success: boolean;
  data: {
    items: Array<{
      id: string;
      title: string;
      status: "pending_review" | "draft" | "approved" | "rejected";
      rationale: string;
      projectedImpact: string;
      priority: "high" | "medium" | "low";
      confidence: number;
      createdAt: string;
      updatedAt: string;
      reviewer?: string;
    }>;
    totals: {
      pending: number;
      approved: number;
      rejected: number;
    };
  };
  source: string;
  timestamp: string;
  warnings?: string[];
  error?: string;
}
```

**Example Response**:

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "mock-1",
        "title": "Bundle hot rod detailing kit for Q4 gift season",
        "status": "pending_review",
        "rationale": "Holiday spikes historically lift bundle attach rate by 18%",
        "projectedImpact": "+$4.2k revenue / month",
        "priority": "high",
        "confidence": 0.7,
        "createdAt": "2024-10-17T08:00:00.000Z",
        "updatedAt": "2024-10-18T21:00:00.000Z",
        "reviewer": "inventory"
      }
    ],
    "totals": {
      "pending": 1,
      "approved": 1,
      "rejected": 0
    }
  },
  "source": "mock",
  "timestamp": "2024-10-19T08:00:00.000Z"
}
```

**Status Codes**:

- `200` - Success
- `500` - Server error

**Data Sources**:

- `mock` - Mock data (default when Supabase not configured)
- `supabase` - Live data from Supabase (requires `IDEA_POOL_SUPABASE_ENABLED=true`)

**Cache**: No caching (real-time data)

---

### GET /api/analytics/export

Export analytics data to CSV format for manual analysis.

**Query Parameters**:

- `format` - Export format: `csv` | `json` (default: `json`)
- `metrics` - Comma-separated list: `revenue,conversion,traffic,ideas` (default: all)

**Example**: `/api/analytics/export?format=csv&metrics=revenue,conversion`

**Status Codes**:

- `200` - Success
- `400` - Invalid parameters
- `500` - Server error

---

## Data Sources

### Google Analytics 4 (GA4)

Used for:

- Revenue metrics (totalRevenue, transactions)
- Conversion metrics (sessions, conversions, conversion rate)
- Traffic metrics (sessions, organic traffic, channel breakdown)

**Property**: Hot Rod AN (339826228)  
**Service Account**: Configured via `GOOGLE_APPLICATION_CREDENTIALS`  
**API**: Google Analytics Data API v1beta

### Shopify Admin GraphQL API

Used for:

- Future: Returns/refunds data (currently stubbed)
- Future: Order details, product data

**Status**: Stubbed with feature flag `ANALYTICS_REAL_DATA=false`

### Supabase

Used for:

- Idea pool data (when `IDEA_POOL_SUPABASE_ENABLED=true`)
- Future: Analytics fact tables, aggregations

---

## Feature Flags

### ANALYTICS_REAL_DATA

Controls whether to use real Shopify data or mock data for returns analytics.

- Default: `false` (mock data)
- Production: Set to `true` when Shopify credentials are configured

### IDEA_POOL_SUPABASE_ENABLED

Controls whether to use Supabase or mock data for idea pool analytics.

- Default: `false` (mock data)
- Production: Set to `true` when Supabase is configured

---

## Caching Strategy

All metric endpoints (revenue, conversion, traffic) use a 5-minute TTL cache to reduce API calls and improve performance.

**Implementation**: `getCached()` / `setCached()` in `app/lib/analytics/ga4.ts`  
**Cache Keys**:

- `analytics:revenue:30d`
- `analytics:traffic:30d`
- `analytics:traffic-breakdown:30d`

**Cache Metrics**: Tracked via `appMetrics.cacheHit()` / `appMetrics.cacheMiss()`

---

## Error Handling

All endpoints include comprehensive error handling:

1. **Try/Catch**: Wrap all external API calls
2. **Graceful Degradation**: Return minimal data on error (not full failure)
3. **Error Logging**: Console errors for debugging
4. **Sampling Detection**: Special handling for GA4 sampling errors (503 status)

**Example Error Response**:

```json
{
  "revenue": 0,
  "period": "error",
  "currency": "USD"
}
```

Status: `500 Internal Server Error`

---

## Monitoring & Operations

### Nightly Jobs

**Sampling Guard Proof**:

- **Script**: `scripts/analytics/sampling-guard-proof.mjs`
- **Schedule**: Nightly at 2:00 AM PT
- **Output**: `artifacts/analytics/sampling-proofs/sampling-proof-YYYYMMDD.json`
- **Purpose**: Detect anomalies in metrics data

**Dashboard Snapshot**:

- **Script**: `scripts/analytics/generate-snapshot.mjs`
- **Schedule**: Nightly at 3:00 AM PT
- **Output**: `artifacts/analytics/snapshots/YYYY-MM-DD.json`
- **Purpose**: Historical tracking and CEO review

### Health Checks

Use `/api/analytics/health` to monitor analytics pipeline status in production.

**Recommended Monitoring**:

- Uptime monitoring on health endpoint
- Alert on `unhealthy` or `degraded` status
- Track cache hit/miss ratios
- Monitor API response times (target: P95 < 3s)

---

## Migration & Rollout

Analytics migrations are coordinated with DevOps per `docs/specs/analytics_pipeline.md`.

**Timeline**:

- Staging: 2025-10-19 02:00 PT
- Production: 2025-10-20 02:00 PT

**Rollback**: Run rollback scripts in `supabase/migrations/*rollback.sql`

---

## Related Documentation

- **Pipeline Spec**: `docs/specs/analytics_pipeline.md`
- **Schemas**: `app/lib/analytics/schemas.ts`
- **GA4 Client**: `app/lib/analytics/ga4.ts`
- **Shopify Stub**: `app/lib/analytics/shopify-returns.stub.ts`
- **Idea Pool**: `app/lib/analytics/idea-pool.ts`
