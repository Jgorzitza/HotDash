---
title: Agent Analytics API Specification
version: 1.0.0
created: 2025-10-12
owner: data
status: design
---

# Agent Analytics API v1.0

## Overview

**Purpose**: RESTful API for querying agent performance metrics, training data, and quality scores.

**Base URL**: `https://api.hotdash.dev/v1/agent-analytics`

**Authentication**: Bearer token (Supabase JWT or API key)

**Rate Limits**: 100 requests/minute per token

## API Endpoints

### 1. Queue Metrics

#### GET /queue/status

**Description**: Get current approval queue status

**Query Parameters**: None

**Response** (200 OK):
```json
{
  "pending_count": 15,
  "urgent_count": 3,
  "avg_confidence": 87.5,
  "oldest_pending_age_minutes": 45,
  "approved_today": 42,
  "rejected_today": 3,
  "refreshed_at": "2025-10-12T16:50:00Z"
}
```

**Performance**: < 100ms (cached)

**Example**:
```bash
curl -H "Authorization: Bearer $TOKEN" \
  https://api.hotdash.dev/v1/agent-analytics/queue/status
```

---

#### GET /queue/pending

**Description**: List pending approvals with filtering

**Query Parameters**:
- `priority` (optional): Filter by priority (urgent, high, normal, low)
- `min_confidence` (optional): Minimum confidence score (0-100)
- `limit` (optional, default: 20): Number of results
- `offset` (optional, default: 0): Pagination offset

**Response** (200 OK):
```json
{
  "data": [
    {
      "id": "uuid",
      "conversation_id": "CONV-123",
      "customer_name": "John Doe",
      "confidence_score": 95,
      "priority": "normal",
      "pending_minutes": 15,
      "draft_preview": "Great question! AN fittings use a 37° flare..."
    }
  ],
  "pagination": {
    "total": 15,
    "limit": 20,
    "offset": 0,
    "has_more": false
  }
}
```

**Performance**: < 200ms

---

### 2. Performance Metrics

#### GET /metrics/accuracy

**Description**: Agent approval accuracy over time

**Query Parameters**:
- `period` (optional, default: "24h"): Time period (1h, 24h, 7d, 30d)
- `granularity` (optional, default: "hour"): Aggregation level (hour, day, week)

**Response** (200 OK):
```json
{
  "period": "24h",
  "granularity": "hour",
  "data": [
    {
      "window_start": "2025-10-12T15:00:00Z",
      "total_drafts": 12,
      "approved_count": 10,
      "approval_rate_pct": 83.33,
      "avg_confidence": 88.5
    }
  ],
  "summary": {
    "overall_approval_rate": 85.2,
    "total_drafts": 287,
    "avg_confidence": 87.3
  }
}
```

**Performance**: < 200ms (materialized view)

---

#### GET /metrics/performance

**Description**: Agent query performance by type

**Query Parameters**:
- `period` (optional, default: "1h"): Time window
- `agent` (optional): Filter by specific agent type

**Response** (200 OK):
```json
{
  "data": [
    {
      "agent": "cx-agent",
      "query_count": 142,
      "avg_latency_ms": 245,
      "p95_latency_ms": 450,
      "slow_query_count": 3,
      "performance_rating": "good"
    },
    {
      "agent": "inventory-agent",
      "query_count": 89,
      "avg_latency_ms": 187,
      "p95_latency_ms": 320,
      "slow_query_count": 1,
      "performance_rating": "excellent"
    }
  ]
}
```

**Performance**: < 150ms

---

### 3. Training Data

#### GET /training/quality

**Description**: Training data quality scores

**Query Parameters**:
- `period` (optional, default: "7d"): Time window

**Response** (200 OK):
```json
{
  "period": "7d",
  "total_annotations": 45,
  "avg_clarity": 4.2,
  "avg_accuracy": 4.5,
  "avg_helpfulness": 4.3,
  "avg_tone": 4.4,
  "avg_overall": 4.35,
  "flagged_unsafe": 2,
  "safety_rate_pct": 95.56,
  "active_annotators": 3
}
```

**Performance**: < 100ms

---

#### GET /training/export

**Description**: Export training data in various formats

**Query Parameters**:
- `format` (required): Export format (json, csv, jsonl)
- `days` (optional, default: 30): Days of data to export
- `include_pii` (optional, default: false): Include personal information
- `min_confidence` (optional, default: 70): Minimum confidence score

**Response** (200 OK):
```json
{
  "format": "jsonl",
  "row_count": 287,
  "download_url": "https://api.hotdash.dev/downloads/training_20251012.jsonl",
  "expires_at": "2025-10-13T16:50:00Z",
  "file_size_bytes": 524288
}
```

**Performance**: < 5s (async job for large exports)

---

### 4. Data Quality

#### GET /quality/current

**Description**: Current data quality scores

**Query Parameters**: None

**Response** (200 OK):
```json
{
  "overall_score": 97.5,
  "dimensions": [
    {
      "name": "completeness",
      "score": 98.2,
      "status": "pass",
      "details": {
        "total_rows": 1247,
        "null_counts": {
          "customer_message": 0,
          "draft_response": 2
        }
      }
    },
    {
      "name": "accuracy",
      "score": 99.1,
      "status": "pass",
      "details": {
        "total_rows": 1247,
        "invalid_rows": 11
      }
    },
    {
      "name": "timeliness",
      "score": 95.0,
      "status": "pass",
      "details": {
        "stale_pending": 1,
        "total_pending": 15
      }
    },
    {
      "name": "consistency",
      "score": 98.0,
      "status": "pass",
      "details": {
        "orphan_records": 5
      }
    }
  ],
  "checked_at": "2025-10-12T16:50:00Z"
}
```

**Performance**: < 100ms

---

#### GET /quality/trend

**Description**: Quality score trend over time

**Query Parameters**:
- `days` (optional, default: 30): Number of days

**Response** (200 OK):
```json
{
  "period_days": 30,
  "data": [
    {
      "date": "2025-10-12",
      "overall_score": 97.5,
      "completeness": 98.2,
      "accuracy": 99.1,
      "timeliness": 95.0,
      "consistency": 98.0
    }
  ],
  "trend": {
    "direction": "improving",
    "change_pct": 2.3
  }
}
```

**Performance**: < 250ms

---

### 5. Historical Analysis

#### GET /analytics/approval-rate

**Description**: Historical approval rate analysis

**Query Parameters**:
- `start_date` (required): Start date (YYYY-MM-DD)
- `end_date` (required): End date (YYYY-MM-DD)
- `group_by` (optional, default: "day"): Grouping (hour, day, week, month)

**Response** (200 OK):
```json
{
  "start_date": "2025-10-01",
  "end_date": "2025-10-12",
  "group_by": "day",
  "data": [
    {
      "date": "2025-10-12",
      "total_drafts": 87,
      "approved": 74,
      "rejected": 5,
      "edited": 8,
      "approval_rate_pct": 85.06
    }
  ]
}
```

**Performance**: < 500ms

---

## Authentication & Authorization

### Authentication Methods

**1. Bearer Token (Recommended)**
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**2. API Key**
```http
X-API-Key: [REDACTED]...
```

**3. Supabase JWT** (for internal tools)
```http
Authorization: Bearer <supabase_jwt_token>
```

### Authorization Levels

| Role | Access | Rate Limit |
|------|--------|------------|
| service_role | Full access (all endpoints) | 1000/min |
| authenticated | Read-only (GET endpoints) | 100/min |
| anon | Public endpoints only | 10/min |
| api_key | Scoped access (configurable) | 100/min |

### Row-Level Security

All queries respect RLS policies:
- Shop isolation via `shopDomain` filter
- User isolation via session variables
- Service role bypasses RLS for admin queries

## Rate Limiting

### Strategy

**Implementation**: Token bucket algorithm

**Limits by Tier**:
```typescript
const RATE_LIMITS = {
  FREE: { requests: 10, window: '1m' },
  PRO: { requests: 100, window: '1m' },
  ENTERPRISE: { requests: 1000, window: '1m' },
};
```

### Rate Limit Headers

**Response Headers**:
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1697126400
```

**Rate Limit Exceeded (429)**:
```json
{
  "error": "rate_limit_exceeded",
  "message": "Too many requests. Limit: 100 req/min",
  "retry_after_seconds": 45
}
```

## Error Responses

### Standard Error Format

```json
{
  "error": "error_code",
  "message": "Human-readable error message",
  "details": {
    "field": "Additional context"
  },
  "request_id": "req_abc123",
  "timestamp": "2025-10-12T16:50:00Z"
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `invalid_request` | 400 | Malformed request |
| `unauthorized` | 401 | Missing/invalid auth |
| `forbidden` | 403 | Insufficient permissions |
| `not_found` | 404 | Resource not found |
| `rate_limit_exceeded` | 429 | Too many requests |
| `internal_error` | 500 | Server error |

## API Security

### Security Headers

**Required on all responses**:
```http
Content-Security-Policy: default-src 'self'
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

### Input Validation

**All inputs must be validated**:
- Date formats: ISO 8601
- Enums: Strict whitelist
- Numbers: Range validation
- Text: Length limits + sanitization

**Example**:
```typescript
const validatePeriod = (period: string): string => {
  const allowed = ['1h', '24h', '7d', '30d'];
  if (!allowed.includes(period)) {
    throw new ValidationError('Invalid period');
  }
  return period;
};
```

### SQL Injection Prevention

**Use parameterized queries ONLY**:
```typescript
// ✅ SAFE
const result = await db.query(
  'SELECT * FROM agent_approvals WHERE shop_domain = $1',
  [shopDomain]
);

// ❌ DANGEROUS
const result = await db.query(
  `SELECT * FROM agent_approvals WHERE shop_domain = '${shopDomain}'`
);
```

## Performance Optimization

### Caching Strategy

**Cache Layers**:
1. CDN cache (Vercel Edge): Public endpoints, 1m TTL
2. Application cache (Redis): Authenticated endpoints, 10s-5m TTL
3. Database cache (Materialized views): Pre-aggregated data

**Cache Keys**:
```typescript
const getCacheKey = (endpoint: string, params: Record<string, any>) => {
  return `agent-api:${endpoint}:${JSON.stringify(params)}`;
};
```

### Query Optimization

**All queries use**:
- Materialized views where possible
- Indexed columns in WHERE clauses
- LIMIT for pagination
- Connection pooling

**Performance Budget**:
- Simple queries: < 100ms
- Complex aggregations: < 500ms
- Export operations: < 5s (async)

## Implementation Example

### TypeScript API Handler

```typescript
// app/api/v1/agent-analytics/queue/status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { rateLimit } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
  // 1. Rate limiting
  const identifier = request.headers.get('authorization') || request.ip;
  const { success } = await rateLimit(identifier);
  
  if (!success) {
    return NextResponse.json(
      { error: 'rate_limit_exceeded', message: 'Too many requests' },
      { status: 429, headers: {
        'X-RateLimit-Limit': '100',
        'X-RateLimit-Remaining': '0',
      }}
    );
  }
  
  // 2. Authentication
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${token}` } } }
  );
  
  // 3. Check cache
  const cacheKey = 'agent:queue:status';
  const cached = await redis.get(cacheKey);
  if (cached) {
    return NextResponse.json(cached, {
      headers: { 'X-Cache': 'HIT' }
    });
  }
  
  // 4. Query database (respects RLS)
  const { data, error } = await supabase
    .from('mv_agent_queue_realtime')
    .select('*')
    .single();
  
  if (error) {
    return NextResponse.json(
      { error: 'internal_error', message: error.message },
      { status: 500 }
    );
  }
  
  // 5. Cache result
  await redis.set(cacheKey, data, { ex: 10 });
  
  // 6. Return response
  return NextResponse.json(data, {
    headers: {
      'X-Cache': 'MISS',
      'X-RateLimit-Limit': '100',
      'X-RateLimit-Remaining': '99',
    }
  });
}
```

## OpenAPI 3.0 Specification

```yaml
openapi: 3.0.0
info:
  title: Agent Analytics API
  version: 1.0.0
  description: RESTful API for agent performance metrics
  contact:
    name: Data Team
    email: data@hotdash.dev

servers:
  - url: https://api.hotdash.dev/v1/agent-analytics
    description: Production
  - url: http://localhost:3000/api/v1/agent-analytics
    description: Local development

security:
  - BearerAuth: []
  - ApiKeyAuth: []

paths:
  /queue/status:
    get:
      summary: Get current queue status
      operationId: getQueueStatus
      tags: [Queue]
      responses:
        '200':
          description: Queue status retrieved successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/QueueStatus'
        '401':
          $ref: '#/components/responses/Unauthorized'
        '429':
          $ref: '#/components/responses/RateLimitExceeded'

  /queue/pending:
    get:
      summary: List pending approvals
      operationId: listPendingApprovals
      tags: [Queue]
      parameters:
        - name: priority
          in: query
          schema:
            type: string
            enum: [urgent, high, normal, low]
        - name: min_confidence
          in: query
          schema:
            type: integer
            minimum: 0
            maximum: 100
        - name: limit
          in: query
          schema:
            type: integer
            default: 20
            maximum: 100
        - name: offset
          in: query
          schema:
            type: integer
            default: 0
      responses:
        '200':
          description: Pending approvals list
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/PendingApprovalsList'

  /metrics/accuracy:
    get:
      summary: Get approval accuracy metrics
      operationId: getAccuracyMetrics
      tags: [Metrics]
      parameters:
        - name: period
          in: query
          schema:
            type: string
            enum: [1h, 24h, 7d, 30d]
            default: 24h
        - name: granularity
          in: query
          schema:
            type: string
            enum: [hour, day, week]
            default: hour
      responses:
        '200':
          description: Accuracy metrics
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/AccuracyMetrics'

components:
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
    ApiKeyAuth:
      type: apiKey
      in: header
      name: X-API-Key

  schemas:
    QueueStatus:
      type: object
      properties:
        pending_count:
          type: integer
        urgent_count:
          type: integer
        avg_confidence:
          type: number
        oldest_pending_age_minutes:
          type: number
        approved_today:
          type: integer
        rejected_today:
          type: integer
        refreshed_at:
          type: string
          format: date-time

    PendingApprovalsList:
      type: object
      properties:
        data:
          type: array
          items:
            $ref: '#/components/schemas/PendingApproval'
        pagination:
          $ref: '#/components/schemas/Pagination'

    PendingApproval:
      type: object
      properties:
        id:
          type: string
          format: uuid
        conversation_id:
          type: string
        customer_name:
          type: string
        confidence_score:
          type: integer
        priority:
          type: string
          enum: [urgent, high, normal, low]
        pending_minutes:
          type: number

    AccuracyMetrics:
      type: object
      properties:
        period:
          type: string
        granularity:
          type: string
        data:
          type: array
          items:
            type: object
        summary:
          type: object

    Pagination:
      type: object
      properties:
        total:
          type: integer
        limit:
          type: integer
        offset:
          type: integer
        has_more:
          type: boolean

  responses:
    Unauthorized:
      description: Authentication required
      content:
        application/json:
          schema:
            type: object
            properties:
              error:
                type: string
              message:
                type: string

    RateLimitExceeded:
      description: Rate limit exceeded
      content:
        application/json:
          schema:
            type: object
            properties:
              error:
                type: string
              message:
                type: string
              retry_after_seconds:
                type: integer
```

## Testing

### API Test Suite

```typescript
// tests/api/agent-analytics.test.ts
import { describe, it, expect } from 'vitest';

describe('Agent Analytics API', () => {
  describe('GET /queue/status', () => {
    it('returns current queue status', async () => {
      const response = await fetch('/api/v1/agent-analytics/queue/status', {
        headers: { Authorization: `Bearer ${testToken}` }
      });
      
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('pending_count');
      expect(data).toHaveProperty('avg_confidence');
    });
    
    it('respects rate limits', async () => {
      // Make 101 requests rapidly
      const requests = Array(101).fill(null).map(() => 
        fetch('/api/v1/agent-analytics/queue/status', {
          headers: { Authorization: `Bearer ${testToken}` }
        })
      );
      
      const responses = await Promise.all(requests);
      const rateLimited = responses.filter(r => r.status === 429);
      
      expect(rateLimited.length).toBeGreaterThan(0);
    });
  });
});
```

---

**Status**: API specification complete  
**Implementation**: Ready for Engineer  
**Estimated Development**: 2-3 days

