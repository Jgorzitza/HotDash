# API Rate Limiting Strategy
**Owner**: Integrations  
**Date**: 2025-10-12  
**Status**: Active  
**Review Cycle**: Quarterly

---

## Executive Summary

This document defines rate limiting strategies for all external APIs used by HotDash. It ensures service reliability, prevents API abuse, protects vendor relationships, and maintains cost predictability.

**Key Metrics**:
- 4 external APIs monitored
- Rate limits defined for each service tier
- Monitoring and alerting configured
- Backoff strategies documented

---

## 1. Shopify Admin API

### Official Rate Limits

**API Type**: REST + GraphQL  
**Documentation**: https://shopify.dev/api/usage/rate-limits

#### REST API (Leaky Bucket Algorithm)
- **Standard**: 2 requests/second per store
- **Plus**: 4 requests/second per store
- **Shopify Plus**: 20 requests/second per store
- **Bucket Size**: 40 requests
- **Refill Rate**: 2 requests/second (Standard)

#### GraphQL API (Calculated Query Cost)
- **Cost Limit**: 1000 points (default, can be increased)
- **Restore Rate**: 50 points/second
- **Max Query Cost**: 1000 points per query
- **Throttle Status**: Returned in `extensions.cost` field

#### Headers to Monitor
```
X-Shopify-Shop-Api-Call-Limit: 32/40
Retry-After: 2.0
```

### HotDash Strategy

#### Implementation
```typescript
// packages/integrations/shopify-rate-limiter.ts
class ShopifyRateLimiter {
  private readonly maxRequestsPerSecond = 2; // Conservative (Standard tier)
  private readonly burstSize = 20; // Half of bucket to avoid throttling
  private readonly retryAttempts = 3;
  private readonly baseBackoffMs = 1000;
}
```

#### Rate Limiting Rules
1. **Default Rate**: 1.5 req/sec (75% of Standard limit)
2. **Burst Handling**: Allow bursts up to 20 requests
3. **GraphQL Cost**: Target < 200 points per query
4. **Priority Queuing**:
   - Priority 1: Real-time operator actions (checkout, orders)
   - Priority 2: Dashboard data refreshes
   - Priority 3: Background sync jobs

#### Backoff Strategy
```
Attempt 1: Wait 1 second
Attempt 2: Wait 2 seconds + jitter
Attempt 3: Wait 4 seconds + jitter
Attempt 4+: Fail and alert
```

#### Cost Optimization
- Use GraphQL for complex queries (lower total cost)
- Batch related queries where possible
- Cache frequently accessed data (products, collections)
- Use webhooks instead of polling

#### Monitoring
- Track `X-Shopify-Shop-Api-Call-Limit` header
- Alert when > 80% of bucket used
- Log all 429 responses
- Dashboard metric: API quota utilization %

---

## 2. Chatwoot API

### Official Rate Limits

**API Type**: REST  
**Documentation**: https://www.chatwoot.com/developers/api

#### Self-Hosted (HotDash Configuration)
- **No hard limits** (we control the instance)
- **Database constraints**: Postgres connection pool limits
- **Recommended**: 100 requests/minute per API key

#### SaaS Plans (for reference)
- **Starter**: 60 requests/minute
- **Business**: 120 requests/minute
- **Enterprise**: 300 requests/minute

### HotDash Strategy

#### Implementation
```typescript
// packages/integrations/chatwoot-rate-limiter.ts
class ChatwootRateLimiter {
  private readonly maxRequestsPerMinute = 100;
  private readonly burstSize = 20;
  private readonly retryAttempts = 3;
  private readonly baseBackoffMs = 2000;
}
```

#### Rate Limiting Rules
1. **Default Rate**: 80 req/min (80% of self-imposed limit)
2. **Webhook Processing**: No rate limit (async queue)
3. **Background Jobs**: 30 req/min max
4. **Interactive API Calls**: Priority queue, 50 req/min

#### Backoff Strategy
```
Attempt 1: Wait 2 seconds
Attempt 2: Wait 4 seconds + jitter
Attempt 3: Wait 8 seconds + jitter
Attempt 4+: Fail and alert
```

#### Cost Optimization
- Use webhooks for real-time updates (no polling)
- Batch conversation updates
- Cache conversation metadata
- Use pagination efficiently

#### Monitoring
- Track request rate per minute
- Alert when > 70 requests/minute sustained
- Monitor Sidekiq queue depth
- Dashboard metric: API utilization %

---

## 3. OpenAI API

### Official Rate Limits

**API Type**: REST  
**Documentation**: https://platform.openai.com/docs/guides/rate-limits

#### GPT-4 (Tier 1 - New Accounts)
- **Requests**: 500 requests/minute (RPM)
- **Tokens**: 40,000 tokens/minute (TPM)
- **Max Tokens/Request**: 8,192

#### GPT-4 (Tier 3 - $50+ spent)
- **Requests**: 5,000 RPM
- **Tokens**: 300,000 TPM
- **Max Tokens/Request**: 8,192

#### GPT-3.5-turbo (Tier 1)
- **Requests**: 3,500 RPM
- **Tokens**: 60,000 TPM

### HotDash Strategy

#### Implementation
```typescript
// packages/ai/openai-rate-limiter.ts
class OpenAIRateLimiter {
  private readonly maxRequestsPerMinute = 400; // Conservative Tier 1
  private readonly maxTokensPerMinute = 35000; // Conservative Tier 1
  private readonly retryAttempts = 3;
  private readonly baseBackoffMs = 5000;
}
```

#### Rate Limiting Rules
1. **Default Rate**: 400 RPM (80% of Tier 1 limit)
2. **Token Budget**: 35,000 TPM (87.5% of limit)
3. **Per-Tool Limits**:
   - Agent SDK chat: 200 RPM, 20k TPM
   - LlamaIndex queries: 100 RPM, 10k TPM
   - Background insights: 100 RPM, 5k TPM

#### Backoff Strategy
```
Attempt 1: Wait 5 seconds (OpenAI specific)
Attempt 2: Wait 10 seconds + jitter
Attempt 3: Wait 20 seconds + jitter
Attempt 4+: Fail and alert
```

#### Cost Optimization
- Use streaming for long responses (better UX, same cost)
- Set reasonable max_tokens limits
- Use GPT-3.5-turbo for simple tasks
- Cache common queries (FAQ responses)
- Batch similar requests where possible

#### Monitoring
- Track RPM and TPM consumption
- Alert when > 80% of either limit
- Track cost per request ($)
- Dashboard metrics:
  - API utilization % (RPM and TPM)
  - Cost per day
  - Average tokens per request

---

## 4. Google Analytics Data API

### Official Rate Limits

**API Type**: REST  
**Documentation**: https://developers.google.com/analytics/devguides/reporting/data/v1/quotas

#### Per Property Per Day
- **Requests**: 200,000 requests/day/property
- **Tokens**: 40,000 tokens/day/property

#### Per Property Per Hour  
- **Tokens**: 1,000 tokens/hour/property (soft limit)

#### Concurrent Requests
- **Max**: 10 concurrent requests per property

#### Real-time API
- **Requests**: 5 requests/second

### HotDash Strategy

#### Implementation
```typescript
// packages/integrations/ga-rate-limiter.ts
class GoogleAnalyticsRateLimiter {
  private readonly maxConcurrent = 5; // Half of limit
  private readonly maxRequestsPerHour = 100; // Conservative
  private readonly maxRequestsPerDay = 2000; // 1% of daily limit
  private readonly retryAttempts = 3;
  private readonly baseBackoffMs = 3000;
}
```

#### Rate Limiting Rules
1. **Concurrent Requests**: 5 max (50% of limit)
2. **Hourly Limit**: 100 requests/hour
3. **Daily Limit**: 2,000 requests/day (1% of limit)
4. **Real-time API**: 3 requests/second (60% of limit)
5. **Caching**: 5-minute TTL for dashboard data

#### Backoff Strategy
```
Attempt 1: Wait 3 seconds
Attempt 2: Wait 6 seconds + jitter
Attempt 3: Wait 12 seconds + jitter
Attempt 4+: Fail and alert
```

#### Cost Optimization
- Use date range batching
- Implement aggressive caching (5-15 min TTL)
- Pre-aggregate common queries
- Use sampling for large datasets
- Schedule heavy queries during off-peak hours

#### Monitoring
- Track requests per hour/day
- Track concurrent requests
- Alert when > 80 requests/hour
- Dashboard metrics:
  - API utilization % (hourly, daily)
  - Cache hit rate %
  - Average query latency

---

## 5. Cross-Cutting Concerns

### Circuit Breaker Pattern

Implement circuit breakers for all external APIs:

```typescript
// packages/integrations/circuit-breaker.ts
class CircuitBreaker {
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  private failureCount = 0;
  private readonly failureThreshold = 5;
  private readonly timeout = 60000; // 1 minute
  private readonly successThreshold = 2; // For HALF_OPEN
}
```

**States**:
- **CLOSED**: Normal operation
- **OPEN**: API failing, reject all requests
- **HALF_OPEN**: Testing if API recovered

**Thresholds**:
- Open circuit after 5 consecutive failures
- Test recovery after 60 seconds
- Require 2 successes to close circuit

### Rate Limiter Implementation

**Common Interface**:
```typescript
interface RateLimiter {
  checkLimit(clientId: string): boolean;
  getRemaining(clientId: string): number;
  getResetTime(clientId: string): number;
  recordRequest(clientId: string): void;
}
```

**Algorithms**:
1. **Token Bucket**: Shopify (allows bursts)
2. **Sliding Window**: OpenAI, Chatwoot (smooth rate)
3. **Fixed Window**: Google Analytics (daily/hourly quotas)

### Monitoring & Alerting

**Metrics to Track**:
1. Requests per minute/hour/day
2. Rate limit utilization %
3. 429 (Too Many Requests) count
4. 503 (Service Unavailable) count
5. Average latency
6. P95/P99 latency
7. Circuit breaker state changes
8. Retry count and success rate

**Alerts**:
| Metric | Threshold | Severity |
|--------|-----------|----------|
| Rate limit utilization | > 80% | WARNING |
| Rate limit utilization | > 95% | CRITICAL |
| 429 responses | > 10/hour | WARNING |
| Circuit breaker opens | Any | CRITICAL |
| API latency P95 | > 5 seconds | WARNING |
| Failed retries | > 20/hour | WARNING |

**Dashboard**:
- Real-time API utilization charts
- Historical rate limit breaches
- Cost tracking (per API)
- SLA compliance metrics

### Backoff & Retry Guidelines

**Jitter Formula**:
```typescript
const backoffMs = baseBackoffMs * Math.pow(2, attempt) + Math.random() * 1000;
```

**Retry Decision Tree**:
1. **4xx errors (except 429)**: Don't retry (client error)
2. **429 (Rate Limit)**: Retry with exponential backoff
3. **5xx errors**: Retry with exponential backoff
4. **Network errors**: Retry immediately, then backoff
5. **Timeout**: Retry with increased timeout

**Max Retries**: 3 attempts (except critical operations: 5)

### Testing Strategy

**Load Testing**:
```bash
# Test Shopify rate limits
k6 run --vus 10 --duration 60s tests/load/shopify-rate-limit.js

# Test Chatwoot rate limits
k6 run --vus 5 --duration 60s tests/load/chatwoot-rate-limit.js

# Test OpenAI rate limits
k6 run --vus 20 --duration 60s tests/load/openai-rate-limit.js
```

**Rate Limit Simulation**:
- Mock API responses with 429 status
- Verify backoff strategy works
- Test circuit breaker state transitions
- Validate retry logic

---

## 6. Cost Projections

### Monthly Cost Estimates (Production)

| Service | Unit Cost | Monthly Usage | Monthly Cost |
|---------|-----------|---------------|--------------|
| Shopify API | Included | N/A | $0 |
| Chatwoot | Self-hosted | N/A | $0 (infra only) |
| OpenAI GPT-4 | $0.03/1k tokens (input) | 10M tokens | $300 |
| OpenAI GPT-4 | $0.06/1k tokens (output) | 5M tokens | $300 |
| Google Analytics | Free | <200k req/day | $0 |
| **Total** | | | **~$600/mo** |

**Cost Controls**:
1. Set per-user token budgets
2. Implement query caching
3. Use GPT-3.5 for simple tasks
4. Monitor and alert on cost spikes
5. Monthly cost review meetings

---

## 7. Implementation Checklist

### Phase 1: Core Infrastructure (Week 1)
- [ ] Implement rate limiter base classes
- [ ] Add circuit breaker pattern
- [ ] Create monitoring middleware
- [ ] Set up Grafana dashboards

### Phase 2: Per-API Implementation (Week 2)
- [ ] Shopify rate limiter with cost tracking
- [ ] Chatwoot rate limiter
- [ ] OpenAI rate limiter with token tracking
- [ ] Google Analytics rate limiter

### Phase 3: Testing & Validation (Week 3)
- [ ] Load testing suite
- [ ] Rate limit simulation tests
- [ ] Circuit breaker tests
- [ ] Integration tests

### Phase 4: Production Deployment (Week 4)
- [ ] Deploy rate limiters to staging
- [ ] Validate with real traffic
- [ ] Deploy to production
- [ ] Enable monitoring and alerts

---

## 8. Maintenance & Review

**Monthly Review**:
- Review rate limit utilization
- Analyze 429 response patterns
- Review cost vs budget
- Update limits based on usage patterns

**Quarterly Review**:
- Evaluate vendor tier upgrades
- Review backoff strategies
- Update load tests
- Audit alert thresholds

**Annual Review**:
- Full strategy review
- Vendor relationship review
- Cost optimization analysis
- Technology refresh evaluation

---

## 9. Escalation Procedures

### Rate Limit Breach
1. **Automated**: Circuit breaker opens, rejects requests
2. **Alert**: PagerDuty notification to on-call engineer
3. **Response**: Review logs, identify cause
4. **Resolution**: Adjust limits or fix code bug

### Cost Overrun
1. **Alert**: Billing alert when >110% of budget
2. **Response**: Disable non-critical AI features
3. **Investigation**: Identify high-cost operations
4. **Resolution**: Optimize or adjust budgets

### Vendor Rate Limit Changes
1. **Monitor**: Vendor changelog notifications
2. **Assessment**: Impact analysis
3. **Update**: Adjust HotDash limits
4. **Test**: Validate new limits in staging
5. **Deploy**: Roll out to production

---

## References

- [Shopify Rate Limits](https://shopify.dev/api/usage/rate-limits)
- [Chatwoot API Docs](https://www.chatwoot.com/developers/api)
- [OpenAI Rate Limits](https://platform.openai.com/docs/guides/rate-limits)
- [Google Analytics Quotas](https://developers.google.com/analytics/devguides/reporting/data/v1/quotas)
- [Circuit Breaker Pattern](https://martinfowler.com/bliki/CircuitBreaker.html)
- [Token Bucket Algorithm](https://en.wikipedia.org/wiki/Token_bucket)

---

**Document Version**: 1.0  
**Last Updated**: 2025-10-12  
**Next Review**: 2026-01-12  
**Owner**: Integrations Agent

