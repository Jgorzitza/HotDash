# API Rate Limiting Guide

**Created**: 2025-10-19  
**Owner**: DevOps  
**Purpose**: Prevent abuse and ensure service availability

## Rate Limit Strategy

### Public Endpoints

**Limits**:

- Anonymous users: 100 requests/hour
- Authenticated users: 1000 requests/hour
- Admin users: 10000 requests/hour

**Scope**: Per IP address or user ID

**Headers**:

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1634567890
```

### API Endpoints

| Endpoint Pattern  | Limit     | Window  | Scope     |
| ----------------- | --------- | ------- | --------- |
| /api/\*           | 100/hour  | Rolling | IP + User |
| /api/analytics/\* | 50/hour   | Rolling | IP + User |
| /api/shopify/\*   | 200/hour  | Rolling | User      |
| /health           | Unlimited | -       | -         |

### Admin Endpoints

| Endpoint Pattern | Limit     | Window  | Scope |
| ---------------- | --------- | ------- | ----- |
| /admin/\*        | 1000/hour | Rolling | User  |
| /approvals/\*    | 500/hour  | Rolling | User  |

## Implementation

### Middleware Approach

```typescript
// app/middleware/rate-limiter.ts
import { RateLimiterMemory } from "rate-limiter-flexible";

const limiter = new RateLimiterMemory({
  points: 100, // Requests allowed
  duration: 3600, // Per hour
});

export async function rateLimitMiddleware(request: Request) {
  const key = request.headers.get("X-Forwarded-For") || "unknown";

  try {
    await limiter.consume(key);
    return null; // Allowed
  } catch (error) {
    return new Response("Too Many Requests", {
      status: 429,
      headers: {
        "Retry-After": "3600",
        "X-RateLimit-Limit": "100",
        "X-RateLimit-Remaining": "0",
      },
    });
  }
}
```

### Redis-based (Production)

**For multi-instance deployments**:

```typescript
import { RateLimiterRedis } from "rate-limiter-flexible";
import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL);

const limiter = new RateLimiterRedis({
  storeClient: redis,
  points: 100,
  duration: 3600,
  keyPrefix: "rl",
});
```

## Response Handling

### 429 Too Many Requests

**Response**:

```json
{
  "error": "Too Many Requests",
  "message": "Rate limit exceeded. Please try again later.",
  "retryAfter": 3600,
  "limit": 100,
  "remaining": 0,
  "resetAt": "2025-10-19T15:00:00Z"
}
```

**Status Code**: 429  
**Headers**:

- `Retry-After`: Seconds until reset
- `X-RateLimit-Limit`: Total allowed requests
- `X-RateLimit-Remaining`: Requests remaining
- `X-RateLimit-Reset`: Unix timestamp of reset

## Monitoring

### Track Rate Limit Hits

```bash
# Count 429 responses in logs
fly logs -a hotdash-app | grep "429" | wc -l

# By endpoint
fly logs -a hotdash-app | grep "429" | grep "/api/analytics" | wc -l
```

### Adjust Limits

**If seeing many 429s**:

1. Analyze if legitimate traffic or abuse
2. If legitimate: Increase limits
3. If abuse: Add stricter limits or blocking

**If never hitting limits**:

- Limits may be too generous
- Consider lowering for better protection

## Bypass for Testing

### Development Environment

**Disable rate limiting**:

```typescript
// In development only
if (process.env.NODE_ENV === "development") {
  return null; // Skip rate limiting
}
```

### CI/CD

**Higher limits for automated tests**:

```typescript
const isCI = process.env.CI === "true";
const points = isCI ? 10000 : 100;
```

## Best Practices

### DO ✅

- Set generous but safe limits initially
- Monitor actual usage patterns
- Adjust based on data
- Provide clear error messages
- Include retry-after headers
- Log rate limit hits for analysis

### DON'T ❌

- Set limits too low (frustrates users)
- Rate limit health checks
- Apply same limits to all endpoints
- Forget to monitor 429 responses
- Block legitimate traffic

## Future Enhancements

**Phase 1**:

- [ ] Implement basic in-memory rate limiting
- [ ] Add rate limit headers
- [ ] Monitor 429 responses

**Phase 2**:

- [ ] Move to Redis for multi-instance support
- [ ] Implement per-user limits
- [ ] Add rate limit dashboard

**Phase 3**:

- [ ] Implement adaptive rate limiting (ML-based)
- [ ] Add custom limits per API key
- [ ] Implement quota system for heavy users

## Related Documentation

- Monitoring: `docs/runbooks/monitoring_setup.md`
- Security: `docs/runbooks/security_hardening.md`
- API Specs: `docs/specs/`
