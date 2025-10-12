---
epoch: 2025.10.E1
doc: docs/data/analytics_api_spec.md
owner: data
last_reviewed: 2025-10-11
expires: 2025-11-11
---

# Analytics API Specification

## Overview

REST API design for Agent SDK metrics queries with authentication, rate limiting, and caching.

## Base URL

**Development:** `http://localhost:54321/rest/v1/`  
**Production:** `https://[project-ref].supabase.co/rest/v1/`

## Authentication

**Method:** JWT Bearer Token (Supabase Auth)

**Headers:**
```
Authorization: Bearer <jwt_token>
apikey: <supabase_anon_key>
```

## Endpoints

### GET /v_agent_performance_snapshot

**Purpose:** Real-time agent performance metrics

**Response:**
```json
[
  {
    "agent": "data",
    "queries_last_hour": 24,
    "queries_last_24h": 156,
    "approval_rate_24h_pct": 92.5,
    "avg_latency_24h_ms": 87.3,
    "health_status": "healthy"
  }
]
```

**Rate Limit:** 100 requests/minute  
**Cache TTL:** 5 seconds

### GET /v_approval_queue_status

**Purpose:** Current approval queue status

**Response:**
```json
[
  {
    "status": "pending",
    "count": 6,
    "avg_age_minutes": 3.5,
    "sla_breaches": 0
  }
]
```

**Rate Limit:** 200 requests/minute  
**Cache TTL:** 10 seconds

### GET /v_training_data_quality

**Purpose:** Training data quality metrics

**Query Parameters:**
- `day` (optional): ISO date (default: today)

**Response:**
```json
[
  {
    "day": "2025-10-11",
    "total_feedback": 14,
    "safe_count": 10,
    "unsafe_count": 2,
    "avg_clarity_score": 3.9,
    "avg_overall_score": 4.1
  }
]
```

**Rate Limit:** 50 requests/minute  
**Cache TTL:** 30 seconds

## Rate Limiting

**Implementation:** Supabase built-in rate limiting + custom middleware

**Tiers:**
- Anonymous: 10 requests/minute
- Authenticated: 100 requests/minute
- Service Role: 1000 requests/minute

**Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1234567890
```

## Security

**RLS Enforcement:** All queries respect Row Level Security policies

**Allowed Operations:**
- GET (SELECT only)
- No POST/PUT/DELETE via public API

**Data Access:**
- Users see own conversation data only
- Operators see aggregate metrics only
- No raw query text exposed (hashed/summarized)

---

**Status:** API specification complete  
**Implementation:** Via Supabase PostgREST (automatic from views)

