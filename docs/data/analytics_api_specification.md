---
epoch: 2025.10.E1
doc: docs/data/analytics_api_specification.md
owner: data
last_reviewed: 2025-10-14
expires: 2025-10-21
---

# Analytics API Specification

## Overview

RESTful API specification for Hot Dash analytics and agent performance metrics.

**Base URL**: `https://hot-dash.fly.dev/api` (staging)  
**Authentication**: Supabase JWT (required for all endpoints)  
**Rate Limit**: 60 requests/minute per user  
**Response Format**: JSON  
**API Version**: v1

## Authentication

All endpoints require Supabase authentication via JWT token in Authorization header.

**Request Headers**:
```http
Authorization: Bearer <supabase_jwt_token>
Content-Type: application/json
```

**Error Response** (401 Unauthorized):
```json
{
  "error": "Unauthorized",
  "message": "Valid Supabase JWT required",
  "code": "AUTH_REQUIRED"
}
```

## API Endpoints

### 1. Dashboard Analytics

#### GET /api/analytics/dashboard/summary

Returns real-time dashboard summary with 24h metrics and comparisons.

**Parameters**: None

**Response** (200 OK):
```json
{
  "orders_last_hour": 5,
  "revenue_last_hour": 1247.50,
  "orders_last_24h": 42,
  "revenue_last_24h": 8932.15,
  "avg_order_value_24h": 212.67,
  "orders_prev_24h": 38,
  "revenue_prev_24h": 8124.30,
  "fulfillment_rate_24h": 94.5,
  "orders_pending_24h": 3,
  "new_customers_24h": 8,
  "active_customers_24h": 35,
  "returning_customers_24h": 15,
  "last_updated": "2025-10-14T18:45:00Z"
}
```

**Loader Implementation**:
```typescript
export async function loader({ request }: LoaderFunctionArgs) {
  const supabase = await createClient(request);
  const { data, error } = await supabase.rpc('get_dashboard_summary');
  
  if (error) throw json({ error: error.message }, { status: 500 });
  return json({ dashboard: data });
}
```

**Caching**: 5 minutes (matches materialized view refresh)

---

#### GET /api/analytics/dashboard/trends

Returns hourly trend data for visualization.

**Query Parameters**:
- `hours` (optional): Number of hours to retrieve (default: 24, max: 168)

**Request**:
```http
GET /api/analytics/dashboard/trends?hours=48
```

**Response** (200 OK):
```json
[
  {
    "hour_start": "2025-10-14T17:00:00Z",
    "total_orders": 3,
    "total_revenue": 645.30,
    "avg_order_value": 215.10,
    "fulfillment_rate_pct": 100.0,
    "orders_fulfilled": 3,
    "orders_pending": 0,
    "new_customers": 1,
    "active_customers": 3,
    "returning_customers": 2,
    "total_sessions": 12,
    "orders_hoh_pct_change": 50.0,
    "revenue_hoh_pct_change": 32.5
  },
  // ... more hours
]
```

**Loader Implementation**:
```typescript
export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const hours = Math.min(parseInt(url.searchParams.get('hours') || '24'), 168);
  
  const supabase = await createClient(request);
  const { data, error } = await supabase.rpc('get_hourly_trends', { hours_back: hours });
  
  if (error) throw json({ error: error.message }, { status: 500 });
  return json({ trends: data }, {
    headers: { 'Cache-Control': 'public, max-age=900' } // 15 min cache
  });
}
```

**Caching**: 15 minutes

---

#### GET /api/analytics/dashboard/anomalies

Returns active anomaly alerts sorted by severity.

**Parameters**: None

**Response** (200 OK):
```json
[
  {
    "hour_start": "2025-10-14T17:00:00Z",
    "anomaly_type": "low_order_volume",
    "deviation_pct": 62.5,
    "severity": "high",
    "total_orders": 3,
    "avg_orders_24h": 8,
    "total_revenue": 645.30,
    "avg_revenue_24h": 1750.00,
    "fulfillment_rate_pct": 100.0,
    "avg_fulfillment_24h": 95.0
  }
]
```

**Empty State** (No Anomalies):
```json
[]
```

**Caching**: 5 minutes

---

### 2. Agent Performance

#### GET /api/analytics/agent/queue

Returns approval queue metrics.

**Query Parameters**:
- `groupBy` (optional): `hour` or `day` (default: `day`)
- `days` (optional): Number of days to retrieve (default: 7, max: 30)

**Response** (200 OK):
```json
[
  {
    "day_bucket": "2025-10-14",
    "total_items": 12,
    "pending_count": 3,
    "approved_count": 7,
    "rejected_count": 2,
    "edited_count": 0,
    "urgent_count": 1,
    "high_count": 4,
    "normal_count": 7,
    "low_count": 0,
    "avg_confidence": 87.5,
    "min_confidence": 65,
    "max_confidence": 98,
    "avg_resolution_minutes": 45.2,
    "metrics_updated_at": "2025-10-14T18:45:00Z"
  }
]
```

---

#### GET /api/analytics/agent/accuracy

Returns agent response accuracy metrics by agent type.

**Query Parameters**:
- `days` (optional): Number of days (default: 7, max: 30)
- `agent` (optional): Filter by agent type

**Response** (200 OK):
```json
[
  {
    "agent_type": "product_search",
    "day_bucket": "2025-10-14",
    "total_queries": 45,
    "approved_queries": 42,
    "human_edited_queries": 8,
    "approval_rate_pct": 93.33,
    "edit_rate_pct": 17.78,
    "avg_latency_ms": 234.5,
    "max_latency_ms": 892,
    "avg_accuracy_score": 4.2,
    "avg_helpfulness_score": 4.5,
    "avg_tone_score": 4.8,
    "safe_to_send_count": 40
  }
]
```

---

#### GET /api/analytics/agent/quality

Returns training data quality metrics.

**Query Parameters**:
- `days` (optional): Number of days (default: 7, max: 30)

**Response** (200 OK):
```json
[
  {
    "day_bucket": "2025-10-14",
    "total_training_examples": 28,
    "safe_examples": 25,
    "unsafe_examples": 3,
    "safety_rate_pct": 89.29,
    "avg_accuracy": 4.3,
    "avg_helpfulness": 4.5,
    "avg_tone": 4.7,
    "overall_quality_score": 4.5,
    "high_quality_rate_pct": 85.71,
    "unique_annotators": 2,
    "unique_categories": 8,
    "positive_sentiment": 12,
    "neutral_sentiment": 14,
    "negative_sentiment": 2,
    "avg_model_confidence": 87.5,
    "avg_response_time_ms": 245.8
  }
]
```

---

#### GET /api/analytics/agent/summary

Returns quick 24-hour agent performance summary.

**Parameters**: None

**Response** (200 OK):
```json
{
  "time_period": "last_24h",
  "pending_approvals": 3,
  "approvals_24h": 12,
  "avg_confidence_24h": 87.5,
  "queries_24h": 45,
  "avg_latency_24h": 234.5,
  "approved_queries_24h": 42,
  "training_examples_24h": 28,
  "safe_examples_24h": 25,
  "avg_accuracy_24h": 4.3,
  "summary_updated_at": "2025-10-14T18:45:00Z"
}
```

**Caching**: 5 minutes

---

### 3. Data Export

#### POST /api/analytics/export/training-data

Exports training dataset with optional PII redaction.

**Request Body**:
```json
{
  "include_pii": false,
  "date_from": "2025-10-01T00:00:00Z",
  "date_to": "2025-10-14T23:59:59Z",
  "format": "json"
}
```

**Response** (200 OK):
```json
[
  {
    "conversation_id": 1001,
    "input_text": "Customer asks: When will my order ship?",
    "model_draft": "Your order will ship within 2-3 business days...",
    "safe_to_send": true,
    "category": "shipping_inquiry",
    "sentiment": "neutral",
    "tone": "professional",
    "accuracy_score": 5.0,
    "helpfulness_score": 5.0,
    "tone_score": 5.0,
    "notes": "Perfect response",
    "confidence": 0.95,
    "response_time_ms": 234,
    "created_at": "2025-10-14T10:30:00Z"
  }
]
```

**Authorization**: service_role only (sensitive data)  
**Rate Limit**: 10 requests/hour (heavy operation)

---

## Security

### Authentication

**Supabase JWT Required**:
```typescript
const supabase = await createClient(request);
const { data: { user } } = await supabase.auth.getUser();

if (!user) {
  throw json({ error: 'Unauthorized' }, { status: 401 });
}
```

### Authorization

**Role-Based Access**:
- `authenticated`: Dashboard analytics, agent metrics (read-only)
- `service_role`: Data exports, quality checks (admin)

**RLS Enforcement**:
All database functions are `SECURITY DEFINER` and enforce RLS from source tables.

### Rate Limiting

**Per User Limits**:
- Dashboard endpoints: 60 req/min
- Agent metrics: 60 req/min
- Export endpoints: 10 req/hour

**Implementation** (React Router middleware):
```typescript
import { rateLimit } from '~/lib/rate-limit';

export async function loader({ request }: LoaderFunctionArgs) {
  await rateLimit(request, { max: 60, window: 60 }); // 60/min
  
  // ... rest of loader
}
```

**Error Response** (429 Too Many Requests):
```json
{
  "error": "Rate limit exceeded",
  "retry_after": 45,
  "limit": 60,
  "window": 60
}
```

## Error Handling

### Standard Error Format

```json
{
  "error": "Error type",
  "message": "Human-readable description",
  "code": "ERROR_CODE",
  "details": {} // Optional additional context
}
```

### Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `AUTH_REQUIRED` | 401 | Missing or invalid JWT |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Endpoint not found |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `VALIDATION_ERROR` | 400 | Invalid parameters |
| `DATABASE_ERROR` | 500 | Database query failed |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

## API Versioning

**Version in URL**: `/api/v1/analytics/...`  
**Current Version**: v1  
**Breaking Changes**: Require new version (v2)  
**Deprecation**: 6-month notice period

**Version Header**:
```http
X-API-Version: 1
```

## Performance

### Response Time Targets

| Endpoint | P50 | P95 | P99 |
|----------|-----|-----|-----|
| /dashboard/summary | < 15ms | < 30ms | < 50ms |
| /dashboard/trends | < 25ms | < 50ms | < 100ms |
| /dashboard/anomalies | < 15ms | < 30ms | < 50ms |
| /agent/queue | < 30ms | < 60ms | < 100ms |
| /agent/accuracy | < 30ms | < 60ms | < 100ms |
| /agent/quality | < 30ms | < 60ms | < 100ms |
| /agent/summary | < 20ms | < 40ms | < 80ms |
| /export/training-data | < 2s | < 5s | < 10s |

### Caching Strategy

**Client-Side** (HTTP headers):
```http
Cache-Control: public, max-age=300, stale-while-revalidate=60
```

**Server-Side** (materialized views):
- Views refresh every 5-15 minutes
- Acts as query result cache
- CONCURRENT refresh (no locking)

**CDN** (future):
- Cache at edge for public metrics
- 5-minute TTL
- Purge on data updates

## Monitoring

### Metrics to Track

1. **Request Volume**
   - Requests per endpoint per hour
   - Peak usage times
   - User distribution

2. **Performance**
   - Response times (P50, P95, P99)
   - Database query times
   - Cache hit rates

3. **Errors**
   - Error rate by endpoint
   - Error types distribution
   - Failed authentication attempts

4. **Usage Patterns**
   - Most-used endpoints
   - Parameter combinations
   - Export frequency

### Logging

**Request Logging**:
```typescript
{
  timestamp: '2025-10-14T18:45:30Z',
  method: 'GET',
  path: '/api/analytics/dashboard/summary',
  user_id: 'uuid',
  response_time_ms: 12,
  status_code: 200,
  cache_hit: true
}
```

**Error Logging**:
```typescript
{
  timestamp: '2025-10-14T18:45:30Z',
  error_code: 'DATABASE_ERROR',
  message: 'Query timeout',
  endpoint: '/api/analytics/agent/accuracy',
  user_id: 'uuid',
  stack_trace: '...'
}
```

## React Router Implementation

### Route Structure

```
app/routes/
├── api.analytics.dashboard.summary.ts
├── api.analytics.dashboard.trends.ts
├── api.analytics.dashboard.anomalies.ts
├── api.analytics.agent.queue.ts
├── api.analytics.agent.accuracy.ts
├── api.analytics.agent.quality.ts
├── api.analytics.agent.summary.ts
└── api.analytics.export.training-data.ts
```

### Example Route Implementation

```typescript
// app/routes/api.analytics.dashboard.summary.ts
import { json, type LoaderFunctionArgs } from '@remix-run/node';
import { createClient } from '~/lib/supabase.server';
import { rateLimit } from '~/lib/rate-limit';

export async function loader({ request }: LoaderFunctionArgs) {
  // Rate limiting
  await rateLimit(request, { max: 60, window: 60 });
  
  // Authentication
  const supabase = await createClient(request);
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return json(
      { error: 'Unauthorized', code: 'AUTH_REQUIRED' },
      { status: 401 }
    );
  }
  
  // Query database function
  const { data, error } = await supabase.rpc('get_dashboard_summary');
  
  if (error) {
    return json(
      { 
        error: 'Database error',
        message: error.message,
        code: 'DATABASE_ERROR'
      },
      { status: 500 }
    );
  }
  
  // Return with caching headers
  return json(data, {
    headers: {
      'Cache-Control': 'public, max-age=300, stale-while-revalidate=60',
      'X-API-Version': '1'
    }
  });
}
```

## Data Contracts

### Database Functions

All API endpoints map to database functions:

| Endpoint | Database Function | Schema |
|----------|------------------|--------|
| `/dashboard/summary` | `get_dashboard_summary()` | See docs/data/analytics_dashboard_api.md |
| `/dashboard/trends` | `get_hourly_trends(int)` | See docs/data/analytics_dashboard_api.md |
| `/dashboard/anomalies` | `get_active_anomalies()` | See docs/data/analytics_dashboard_api.md |
| `/agent/queue` | `SELECT * FROM approval_queue_metrics` | View query |
| `/agent/accuracy` | `SELECT * FROM agent_accuracy_metrics` | View query |
| `/agent/quality` | `SELECT * FROM training_quality_metrics` | View query |
| `/agent/summary` | `SELECT * FROM agent_performance_summary` | View query |
| `/export/training-data` | `export_training_dataset(bool, ts, ts)` | See migration |

**Schema Stability**: Database functions provide stable interface, UI can change independently

## Testing

### API Test Cases

**Test Suite** (`tests/api/analytics.test.ts`):
```typescript
describe('Analytics API', () => {
  test('GET /api/analytics/dashboard/summary requires auth', async () => {
    const response = await fetch('/api/analytics/dashboard/summary');
    expect(response.status).toBe(401);
  });
  
  test('GET /api/analytics/dashboard/summary returns valid data', async () => {
    const response = await authenticatedFetch('/api/analytics/dashboard/summary');
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('orders_last_24h');
    expect(data).toHaveProperty('revenue_last_24h');
  });
  
  test('GET /api/analytics/dashboard/trends respects hours parameter', async () => {
    const response = await authenticatedFetch('/api/analytics/dashboard/trends?hours=48');
    const data = await response.json();
    expect(data.trends).toBeInstanceOf(Array);
    expect(data.trends.length).toBeLessThanOrEqual(48);
  });
  
  // ... more tests
});
```

### Load Testing

**Target**: 100 concurrent users  
**Tool**: Artillery or k6

```yaml
# artillery-config.yml
config:
  target: 'https://hot-dash.fly.dev'
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - name: "Dashboard Analytics"
    flow:
      - get:
          url: "/api/analytics/dashboard/summary"
          headers:
            Authorization: "Bearer {{jwt}}"
```

## Future Enhancements

1. **WebSocket Support**: Real-time metric updates
2. **GraphQL API**: Flexible querying
3. **Batch Exports**: CSV, Excel, Parquet formats
4. **Streaming API**: Server-sent events for live data
5. **Custom Dashboards**: User-defined metric queries

## Related Documentation

- Database API: `docs/data/analytics_dashboard_api.md`
- Schema Design: `docs/data/analytics_dashboard_schema.md`
- Performance Optimization: `docs/data/query_performance_optimization.md`

---

**Version**: 1.0  
**Status**: Design Complete  
**Implementation**: Engineer (React Router routes)  
**Deployment**: Reliability (monitoring setup)
