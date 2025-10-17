# API Rate Limiting Strategy

**Owner:** Integrations  
**Created:** 2025-10-11  
**Purpose:** Comprehensive rate limiting and throttling strategy for all external APIs  
**Status:** Production-ready framework

---

## Executive Summary

HotDash integrates with 4 rate-limited external APIs. This document defines:

- Rate limits for each API
- Current implementation status
- Recommended improvements
- Monitoring and alerting strategy

**Current State:**

- ✅ Shopify: Retry logic implemented
- ❌ Chatwoot: No retry logic
- ❌ Google Analytics: No retry logic
- ✅ OpenAI: SDK handles retries

**Target State:** All APIs with robust retry, backoff, and monitoring

---

## API Rate Limits Reference

### 1. Shopify Admin API

**Rate Limit Type:** Bucket-based (leaky bucket algorithm)  
**Base Limit:** 2 requests per second  
**Bucket Size:** 40 requests (burst capacity)  
**Recovery Rate:** 2 per second  
**Documentation:** https://shopify.dev/docs/api/usage/rate-limits

**GraphQL Specific:**

- Calculated cost per query (based on complexity)
- Cost = fields queried + nested levels
- Max cost per query: 1000 points
- Available points: Bucket size × 50 (2000 points default)
- Cost header: `X-Shopify-Shop-Api-Call-Limit: 39/40` (requests used/available)

**429 Response:**

```json
{
  "errors": "Exceeded 2 calls per second for api client. Slow down!"
}
```

**Retry-After Header:** Not provided (use exponential backoff)

---

### 2. Chatwoot API

**Rate Limit Type:** Unknown (not publicly documented)  
**Observed Behavior:** No 429 errors in testing (as of 2025-10-11)  
**Conservative Estimate:** 60 requests per minute  
**Burst Capacity:** Unknown

**Best Practices:**

- Implement preemptive throttling (1 request/second)
- Add retry logic for 429 and 5xx responses
- Monitor for rate limit headers (if added)

**Recommended Headers to Check:**

- `X-RateLimit-Limit`
- `X-RateLimit-Remaining`
- `Retry-After`

---

### 3. Google Analytics Data API

**Rate Limit Type:** Quota-based (daily and concurrent)  
**Daily Quota:** 400 requests/day (free tier, per project)  
**Concurrent Requests:** 10 simultaneous requests per project  
**Per-Property Quota:** 200,000 tokens per day  
**Documentation:** https://developers.google.com/analytics/devguides/reporting/data/v1/quotas

**Quota Consumption:**

- Simple query: 1-5 tokens
- Complex query (many dimensions/metrics): 10-50 tokens
- Each API call: Minimum 1 request credit

**429 Response:**

```json
{
  "error": {
    "code": 429,
    "message": "Resource exhausted",
    "status": "RESOURCE_EXHAUSTED"
  }
}
```

**Retry-After:** May include header (respect if present)

**Quota Errors:**

- `RATE_LIMIT_EXCEEDED` - Too many concurrent requests
- `RESOURCE_EXHAUSTED` - Daily quota exceeded

---

### 4. OpenAI API

**Rate Limit Type:** Tier-based (varies by account)  
**Tier 1 (New accounts):**

- Requests: 3 requests/minute
- Tokens: 40,000 tokens/minute
- Daily: 200 requests/day

**Tier 2-5:** Higher limits (see OpenAI dashboard for exact values)

**Model-Specific:**

- GPT-4: Lower limits (expensive model)
- GPT-3.5-turbo: Higher limits
- Embeddings: Separate quota

**Documentation:** https://platform.openai.com/docs/guides/rate-limits

**429 Response:**

```json
{
  "error": {
    "message": "Rate limit reached",
    "type": "rate_limit_error",
    "code": "rate_limit_exceeded"
  }
}
```

**Retry-After Header:** Provided (seconds to wait)

**SDK Handling:** OpenAI SDK has built-in exponential backoff (up to 2 retries)

---

## Current Implementation Analysis

### Shopify Admin API ✅

**Implementation:** `app/services/shopify/client.ts` lines 23-59

**Current Strategy:**

```typescript
const MAX_RETRIES = 2;
const BASE_DELAY_MS = 500;

function isRetryableStatus(status: number): boolean {
  return status === 429 || status >= 500;
}

async function graphqlWithRetry(
  originalGraphql: (query: string, options: any) => Promise<Response>,
  query: string,
  options: any,
): Promise<Response> {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    lastResponse = await originalGraphql(query, options);

    if (!isRetryableStatus(lastResponse.status)) {
      return lastResponse;
    }

    if (attempt === MAX_RETRIES) {
      return lastResponse;
    }

    // Exponential backoff with jitter
    const baseDelay = BASE_DELAY_MS * Math.pow(2, attempt);
    const jitter = randomFn() * baseDelay * 0.1;
    const delay = baseDelay + jitter;

    await waitFn(delay);
  }
}
```

**Delays:**

- Attempt 1: 500ms + jitter (450-550ms)
- Attempt 2: 1000ms + jitter (900-1100ms)
- Attempt 3: Returns failure

**Strengths:**

- ✅ Handles 429 (rate limit) and 5xx (server errors)
- ✅ Exponential backoff prevents hammering
- ✅ Jitter prevents thundering herd
- ✅ Testable (dependency injection for wait/random)

**Potential Improvements:**

- ⏳ Log rate limit events for monitoring
- ⏳ Extract delay values to backoff header if present
- ⏳ Add circuit breaker for repeated failures

---

### Chatwoot API ❌

**Implementation:** `packages/integrations/chatwoot.ts`

**Current Strategy:** NONE - No retry logic implemented

**Impact:**

- ❌ 429 errors will fail immediately
- ❌ Transient 5xx errors not retried
- ❌ Network blips cause false failures

**Recommended Implementation:**

```typescript
async function chatwootWithRetry<T>(
  apiCall: () => Promise<T>,
  maxRetries = 3,
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error: any) {
      lastError = error;

      const status = error.response?.status;
      const isRetryable = status === 429 || status >= 500;

      if (!isRetryable || attempt === maxRetries) {
        throw error;
      }

      // Exponential backoff
      const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}
```

---

### Google Analytics Data API ❌

**Implementation:** `app/services/ga/directClient.ts`

**Current Strategy:** NONE - No retry logic implemented

**Impact:**

- ❌ Quota errors will fail immediately
- ❌ Concurrent limit errors not handled
- ❌ No automatic backoff for RESOURCE_EXHAUSTED

**Recommended Implementation:**

```typescript
async function gaWithRetry<T>(
  apiCall: () => Promise<T>,
  maxRetries = 3,
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error: any) {
      lastError = error;

      // GA errors have specific codes
      const errorCode = error.code;
      const isRetryable =
        errorCode === 429 ||
        errorCode === "RATE_LIMIT_EXCEEDED" ||
        errorCode === "RESOURCE_EXHAUSTED" ||
        (errorCode >= 500 && errorCode < 600);

      if (!isRetryable || attempt === maxRetries) {
        throw error;
      }

      // Check for Retry-After header
      const retryAfter = error.response?.headers?.["retry-after"];
      const delay = retryAfter
        ? parseInt(retryAfter) * 1000
        : Math.min(2000 * Math.pow(2, attempt), 30000);

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}
```

---

### OpenAI API ✅

**Implementation:** Via `openai` SDK (built-in retry)

**SDK Strategy:**

- Automatic retry on 429, 500, 503
- Exponential backoff (up to 2 retries)
- Respects `Retry-After` header
- Configurable via SDK options

**Current Usage:**

```typescript
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  maxRetries: 2, // Default, can configure
  timeout: 60000, // 60 seconds
});
```

**No Additional Work Needed:** SDK handles rate limiting properly

---

## Recommended Rate Limiting Architecture

### Universal Retry Pattern

**Create Shared Utility:** `app/services/retry.ts`

```typescript
export interface RetryConfig {
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
  retryableStatuses: number[];
  retryableCodes?: string[];
  respectRetryAfter?: boolean;
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 30000,
  retryableStatuses: [429, 500, 502, 503, 504],
  respectRetryAfter: true,
};

export async function withRetry<T>(
  operation: () => Promise<T>,
  config: Partial<RetryConfig> = {},
): Promise<T> {
  const finalConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= finalConfig.maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;

      // Check if retryable
      const status = error.response?.status || error.code;
      const isRetryable =
        finalConfig.retryableStatuses.includes(status) ||
        finalConfig.retryableCodes?.includes(status);

      if (!isRetryable || attempt === finalConfig.maxRetries) {
        throw error;
      }

      // Calculate delay
      let delay: number;
      if (
        finalConfig.respectRetryAfter &&
        error.response?.headers?.["retry-after"]
      ) {
        delay = parseInt(error.response.headers["retry-after"]) * 1000;
      } else {
        // Exponential backoff with jitter
        const exponentialDelay = finalConfig.baseDelayMs * Math.pow(2, attempt);
        const jitter = Math.random() * exponentialDelay * 0.1;
        delay = Math.min(exponentialDelay + jitter, finalConfig.maxDelayMs);
      }

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}
```

**Usage:**

```typescript
// In any API client
const data = await withRetry(() => fetch(url, options), {
  maxRetries: 3,
  baseDelayMs: 500,
});
```

---

### Service-Specific Configurations

**Shopify:**

```typescript
const SHOPIFY_RETRY_CONFIG: RetryConfig = {
  maxRetries: 2,
  baseDelayMs: 500,
  maxDelayMs: 5000,
  retryableStatuses: [429, 500, 502, 503, 504],
  respectRetryAfter: false, // Shopify doesn't provide header
};
```

**Chatwoot:**

```typescript
const CHATWOOT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 10000,
  retryableStatuses: [429, 500, 502, 503, 504],
  respectRetryAfter: true, // Check for header
};
```

**Google Analytics:**

```typescript
const GA_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelayMs: 2000,
  maxDelayMs: 30000,
  retryableStatuses: [429],
  retryableCodes: ["RATE_LIMIT_EXCEEDED", "RESOURCE_EXHAUSTED"],
  respectRetryAfter: true, // GA provides Retry-After
};
```

---

## Proactive Rate Limiting

### Request Throttling

**Create:** `app/services/throttle.ts`

```typescript
export class RequestThrottler {
  private queue: Array<() => void> = [];
  private lastRequest = 0;
  private minIntervalMs: number;

  constructor(requestsPerSecond: number) {
    this.minIntervalMs = 1000 / requestsPerSecond;
  }

  async throttle<T>(operation: () => Promise<T>): Promise<T> {
    // Wait for minimum interval since last request
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequest;
    const delay = Math.max(0, this.minIntervalMs - timeSinceLastRequest);

    if (delay > 0) {
      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    this.lastRequest = Date.now();
    return await operation();
  }
}

// Usage
const shopifyThrottler = new RequestThrottler(1.5); // 1.5 req/sec (safe margin)

const result = await shopifyThrottler.throttle(() =>
  admin.graphql(QUERY, variables),
);
```

**Benefits:**

- Prevents hitting rate limits proactively
- Smoother request distribution
- Reduces 429 errors significantly

---

## Circuit Breaker Pattern

### For Repeated Failures

**Create:** `app/services/circuit-breaker.ts`

```typescript
export class CircuitBreaker {
  private failureCount = 0;
  private lastFailureTime = 0;
  private state: "CLOSED" | "OPEN" | "HALF_OPEN" = "CLOSED";

  constructor(
    private threshold: number = 5,
    private timeoutMs: number = 60000, // 1 minute
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    // If circuit is open, fail fast
    if (this.state === "OPEN") {
      const timeSinceFailure = Date.now() - this.lastFailureTime;
      if (timeSinceFailure < this.timeoutMs) {
        throw new Error("Circuit breaker is OPEN - too many recent failures");
      }
      this.state = "HALF_OPEN"; // Try one request
    }

    try {
      const result = await operation();

      // Success - reset or close circuit
      if (this.state === "HALF_OPEN") {
        this.state = "CLOSED";
      }
      this.failureCount = 0;

      return result;
    } catch (error) {
      this.failureCount++;
      this.lastFailureTime = Date.now();

      if (this.failureCount >= this.threshold) {
        this.state = "OPEN";
      }

      throw error;
    }
  }

  getState() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      lastFailureTime: this.lastFailureTime,
    };
  }
}

// Usage
const shopifyCircuit = new CircuitBreaker(5, 60000);

const result = await shopifyCircuit.execute(() =>
  shopifyThrottler.throttle(() => admin.graphql(QUERY)),
);
```

**Benefits:**

- Prevents cascade failures
- Gives APIs time to recover
- Reduces wasted requests during outages

---

## Monitoring Strategy

### Rate Limit Event Tracking

**Record to Supabase:** `observability_logs` table

```typescript
interface RateLimitEvent {
  timestamp: string;
  service: "shopify" | "chatwoot" | "ga" | "openai";
  event_type: "rate_limit" | "retry" | "circuit_open";
  status_code: number;
  retry_attempt: number;
  delay_ms: number;
  metadata: Record<string, any>;
}

async function logRateLimitEvent(event: RateLimitEvent) {
  await supabase.from("observability_logs").insert({
    log_level: "WARN",
    log_type: "RATE_LIMIT",
    scope: event.service,
    message: `Rate limit event: ${event.event_type}`,
    metadata: event,
  });
}
```

**Metrics to Track:**

- 429 response count per API
- Retry attempts per API
- Average delay time
- Circuit breaker state changes
- Quota approaching threshold (e.g., >80% daily quota)

---

### Dashboard Metrics

**Create Tile:** "API Health & Rate Limits"

**Metrics:**

1. **Request Volume (Last 24h)**
   - Shopify: X requests
   - Chatwoot: X requests
   - Google Analytics: X requests
   - OpenAI: X requests

2. **Rate Limit Events (Last 24h)**
   - 429 responses: X
   - Retry successes: X
   - Circuit breaker trips: X

3. **Quota Usage**
   - GA Daily Quota: X / 400 (X%)
   - OpenAI Tokens: X / 40,000 (X%)

4. **Average Response Times**
   - Shopify: Xms
   - Chatwoot: Xms
   - GA: Xms

**Alert Thresholds:**

- 🚨 > 10 rate limit events in 1 hour
- ⚠️ GA quota > 80%
- ⚠️ Circuit breaker open

---

## Implementation Roadmap

### Phase 1: Critical Improvements (This Sprint)

**Priority 1.1: Add Retry to Chatwoot Client**

- File: `packages/integrations/chatwoot.ts`
- Pattern: Match Shopify retry logic
- Config: 3 retries, 1s base delay, 10s max
- Owner: Engineer + Integrations
- ETA: 2 hours

**Priority 1.2: Add Retry to GA Client**

- File: `app/services/ga/directClient.ts`
- Pattern: Match Shopify retry logic + respect Retry-After
- Config: 3 retries, 2s base delay, 30s max
- Owner: Engineer + Integrations
- ETA: 2 hours

**Priority 1.3: Add Rate Limit Logging**

- File: `app/services/shopify/client.ts`
- Action: Log 429 responses to observability_logs
- Config: Include attempt number and delay
- Owner: Engineer
- ETA: 1 hour

---

### Phase 2: Enhanced Reliability (Next Sprint)

**Priority 2.1: Create Shared Retry Utility**

- File: `app/services/retry.ts` (new)
- Pattern: Universal retry function with config
- Migrate: Shopify, Chatwoot, GA to use shared utility
- Owner: Engineer
- ETA: 4 hours

**Priority 2.2: Add Request Throttling**

- File: `app/services/throttle.ts` (new)
- Pattern: RequestThrottler class
- Apply: Shopify (1.5 req/sec), Chatwoot (1 req/sec)
- Owner: Engineer
- ETA: 3 hours

**Priority 2.3: Implement Circuit Breakers**

- File: `app/services/circuit-breaker.ts` (new)
- Pattern: CircuitBreaker class
- Apply: All external APIs
- Owner: Engineer
- ETA: 4 hours

---

### Phase 3: Monitoring & Alerting (Week 2)

**Priority 3.1: Rate Limit Metrics Dashboard**

- Component: New dashboard tile
- Data: Query observability_logs
- Metrics: Request volume, 429 count, quota usage
- Owner: Engineer + Data
- ETA: 8 hours

**Priority 3.2: Automated Alerts**

- Trigger: > 10 rate limit events in 1 hour
- Channel: Slack/Email/Dashboard notification
- Action: Auto-throttle or circuit open
- Owner: Reliability
- ETA: 4 hours

**Priority 3.3: Quota Monitoring**

- Service: Google Analytics daily quota
- Check: Every hour
- Alert: At 70%, 85%, 95%
- Action: Reduce request frequency
- Owner: Reliability + Integrations
- ETA: 3 hours

---

## Testing Strategy

### Unit Tests

**Test Retry Logic:**

```typescript
describe("withRetry", () => {
  it("should retry on 429", async () => {
    const mockFn = jest
      .fn()
      .mockRejectedValueOnce({ response: { status: 429 } })
      .mockResolvedValue({ data: "success" });

    const result = await withRetry(mockFn);

    expect(mockFn).toHaveBeenCalledTimes(2);
    expect(result).toEqual({ data: "success" });
  });

  it("should respect Retry-After header", async () => {
    // Test implementation
  });

  it("should fail after max retries", async () => {
    // Test implementation
  });
});
```

**Test Circuit Breaker:**

```typescript
describe("CircuitBreaker", () => {
  it("should open after threshold failures", async () => {
    const breaker = new CircuitBreaker(3, 60000);
    const failingOp = () => Promise.reject(new Error("fail"));

    // Trigger 3 failures
    for (let i = 0; i < 3; i++) {
      await expect(breaker.execute(failingOp)).rejects.toThrow();
    }

    // Circuit should now be open
    expect(breaker.getState().state).toBe("OPEN");
  });
});
```

---

### Integration Tests

**Test Rate Limit Handling:**

```bash
# Simulate Shopify rate limit
# Mock API to return 429 on first request, 200 on second
# Verify: Automatic retry succeeds
```

**Test Quota Exhaustion:**

```bash
# Simulate GA quota exhausted (RESOURCE_EXHAUSTED)
# Verify: Appropriate error handling, no infinite retries
```

---

## Performance Impact

### Retry Logic Overhead

**Best Case (No Errors):**

- Additional latency: 0ms
- Memory overhead: Minimal (closure per retry)

**Worst Case (Max Retries):**

- Shopify: 500ms + 1000ms = 1.5s additional latency
- Chatwoot: 1s + 2s + 4s = 7s additional latency
- GA: 2s + 4s + 8s = 14s additional latency

**Mitigation:**

- Set reasonable max delays
- Circuit breaker prevents repeated long waits
- Cache results to reduce API calls

---

### Throttling Overhead

**Shopify (1.5 req/sec):**

- Delay per request: ~666ms average
- Impact: Acceptable for dashboard (not user-blocking)

**Chatwoot (1 req/sec):**

- Delay per request: ~1000ms average
- Impact: Minimal (escalations batched)

**Trade-off:** Slightly slower vs. never hitting rate limits

---

## Configuration Management

### Environment Variables

**New Variables:**

```bash
# Shopify
SHOPIFY_MAX_RETRIES=2
SHOPIFY_BASE_DELAY_MS=500
SHOPIFY_THROTTLE_RPS=1.5

# Chatwoot
CHATWOOT_MAX_RETRIES=3
CHATWOOT_BASE_DELAY_MS=1000
CHATWOOT_THROTTLE_RPS=1

# Google Analytics
GA_MAX_RETRIES=3
GA_BASE_DELAY_MS=2000
GA_RESPECT_RETRY_AFTER=true

# OpenAI (SDK defaults)
OPENAI_MAX_RETRIES=2
OPENAI_TIMEOUT_MS=60000
```

**Document in:** `.env.example` with explanations

---

## Production Deployment Checklist

### Pre-Deployment

- [ ] Retry logic implemented for Chatwoot
- [ ] Retry logic implemented for Google Analytics
- [ ] Rate limit logging added to all clients
- [ ] Shared retry utility created and tested
- [ ] Environment variables documented
- [ ] Unit tests for retry logic pass

### Post-Deployment Monitoring

- [ ] Monitor 429 response frequency (first 24 hours)
- [ ] Verify retry logic activates correctly
- [ ] Check GA quota consumption rate
- [ ] Validate circuit breaker triggers appropriately
- [ ] Review observability_logs for rate limit events

### Performance Validation

- [ ] Dashboard load time acceptable (< 3s)
- [ ] No user-visible delays from throttling
- [ ] API response times within SLA
- [ ] No excessive retry loops (check logs)

---

## Vendor Communication Plan

### Shopify

**Contact:** Shopify Partner Support  
**Purpose:** Monitor for rate limit policy changes  
**Frequency:** Check API changelog monthly  
**Escalation:** If seeing persistent 429s, request limit increase

### Chatwoot

**Contact:** Self-hosted (Fly deployment)  
**Purpose:** Configure rate limits in Chatwoot settings  
**Action:** Review Chatwoot admin settings for API rate limits  
**Note:** We control this - can adjust if needed

### Google Analytics

**Contact:** Google Cloud Support (if paid tier)  
**Purpose:** Request quota increase if needed  
**Current:** Free tier (400 req/day sufficient for now)  
**Upgrade:** If approaching 80% daily quota consistently

### OpenAI

**Contact:** OpenAI Support  
**Purpose:** Monitor usage tier and request upgrades  
**Current:** Check usage tier in OpenAI dashboard  
**Upgrade:** Request tier increase if hitting limits

---

## Future Enhancements

### Adaptive Rate Limiting

```typescript
// Learn optimal rate from API responses
class AdaptiveThrottler {
  private currentRate: number;
  private minRate: number;
  private maxRate: number;

  adjustRate(response: Response) {
    if (response.status === 429) {
      // Decrease rate (more conservative)
      this.currentRate = this.currentRate * 0.8;
    } else if (response.ok) {
      // Slowly increase rate (test limits)
      this.currentRate = this.currentRate * 1.05;
    }

    // Clamp to min/max
    this.currentRate = Math.max(
      this.minRate,
      Math.min(this.maxRate, this.currentRate),
    );
  }
}
```

### Distributed Rate Limiting

```typescript
// For multi-instance deployments
// Use Redis to track request counts across all instances
class DistributedRateLimiter {
  async checkLimit(
    key: string,
    limit: number,
    windowMs: number,
  ): Promise<boolean> {
    const count = await redis.incr(key);
    if (count === 1) {
      await redis.pexpire(key, windowMs);
    }
    return count <= limit;
  }
}
```

---

## Summary & Recommendations

### Current State

- ✅ Shopify: Good (retry logic implemented)
- ❌ Chatwoot: Needs improvement (no retry)
- ❌ Google Analytics: Needs improvement (no retry)
- ✅ OpenAI: Good (SDK handles it)

### Immediate Actions (This Sprint)

1. **Add retry logic to Chatwoot client** (2 hours)
2. **Add retry logic to GA client** (2 hours)
3. **Add rate limit event logging** (1 hour)

### Medium-term (Next Sprint)

1. **Create shared retry utility** (4 hours)
2. **Implement request throttling** (3 hours)
3. **Add circuit breakers** (4 hours)

### Long-term (Next Month)

1. **Rate limit metrics dashboard** (8 hours)
2. **Automated alerting** (4 hours)
3. **Quota monitoring** (3 hours)

**Total Estimated Effort:** 31 hours (across 3 sprints)

---

## Acceptance Criteria

### Phase 1 Complete When:

- ✅ All 4 APIs have retry logic
- ✅ All retry attempts logged
- ✅ Unit tests for retry logic pass
- ✅ No unhandled 429 errors in production

### Phase 2 Complete When:

- ✅ Shared retry utility in use across all APIs
- ✅ Request throttling prevents 99% of 429s
- ✅ Circuit breakers protect from cascade failures
- ✅ Performance impact < 500ms p95

### Phase 3 Complete When:

- ✅ Dashboard shows real-time quota usage
- ✅ Alerts fire before quota exhaustion
- ✅ Team has runbook for rate limit incidents
- ✅ 30 days of successful monitoring

---

**Strategy Document Created:** 2025-10-11 21:40 UTC  
**Implementation Owner:** Engineer (with Integrations support)  
**Priority:** P1 - Critical for production reliability  
**Next:** Coordinate with Engineer to schedule implementation
