# API Client Library Consolidation
**Owner**: Integrations  
**Date**: 2025-10-12  
**Status**: Active  
**Review Cycle**: Quarterly

---

## Executive Summary

This document reviews all API client implementations in HotDash, identifies consolidation opportunities, and proposes a standardized API client pattern. The goal is to reduce code duplication, improve maintainability, and establish consistent error handling, retry logic, and observability across all external API integrations.

**Current State**:
- 4 distinct API client implementations (Shopify, Chatwoot, GA, OpenAI)
- Inconsistent error handling patterns
- Duplicated retry logic
- No standardized observability/metrics

**Proposed State**:
- Unified base client class with common patterns
- Standardized error handling and retry logic
- Built-in observability and metrics
- Type-safe configuration

---

## 1. Current API Client Inventory

### 1.1 Shopify Client

**Location**: `app/services/shopify/client.ts`  
**Type**: GraphQL client with Shopify App Bridge  
**Key Features**:
- ✅ Retry logic with exponential backoff
- ✅ Jitter implementation
- ✅ Testable (dependency injection)
- ❌ No metrics/observability
- ❌ No circuit breaker
- ❌ No rate limiting

**Code Pattern**:
```typescript
// Shopify client wraps admin.graphql with retry logic
const wrappedAdmin = {
  graphql: (query, options) => graphqlWithRetry(originalGraphql, query, options)
};

// Retry logic: MAX_RETRIES=2, BASE_DELAY=500ms
for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
  const response = await originalGraphql(query, options);
  if (!isRetryableStatus(response.status)) return response;
  
  // Exponential backoff with 10% jitter
  const delay = BASE_DELAY * Math.pow(2, attempt) + random() * BASE_DELAY * 0.1;
  await wait(delay);
}
```

**Strengths**:
- Clean retry implementation
- Good separation of concerns
- Testable with dependency injection

**Weaknesses**:
- No observability (metrics, logging)
- No circuit breaker
- Retry logic not reusable

---

### 1.2 Chatwoot Client

**Location**: `packages/integrations/chatwoot.ts`  
**Type**: REST API client (factory function)  
**Key Features**:
- ✅ Clean factory pattern
- ✅ Type-safe interfaces
- ❌ No retry logic
- ❌ No metrics/observability
- ❌ Basic error handling only
- ❌ No rate limiting

**Code Pattern**:
```typescript
export function chatwootClient(cfg: ChatwootConfig) {
  const headers = { 'api_access_token': cfg.token };
  const base = `${cfg.baseUrl}/api/v1/accounts/${cfg.accountId}`;
  
  return {
    async listOpenConversations(page=1) {
      const r = await fetch(`${base}/conversations?page=${page}`, { headers });
      if (!r.ok) throw new Error(`Chatwoot ${r.status}`);
      return (await r.json()).data;
    },
    // ... 7 more methods
  };
}
```

**Strengths**:
- Simple factory pattern
- Clean method signatures
- Type-safe

**Weaknesses**:
- No retry logic (critical for production)
- Minimal error handling
- No observability
- Duplicates fetch boilerplate

---

### 1.3 Google Analytics Client

**Location**: `app/services/ga/directClient.ts`  
**Type**: Official SDK wrapper  
**Key Features**:
- ✅ Uses official @google-analytics/data SDK
- ✅ Good error context
- ✅ Comprehensive documentation
- ❌ No retry logic
- ❌ No metrics/observability
- ❌ SDK errors not standardized

**Code Pattern**:
```typescript
export function createDirectGaClient(propertyId: string): GaClient {
  const client = new BetaAnalyticsDataClient();
  
  return {
    async fetchLandingPageSessions(range: DateRange) {
      try {
        const [response] = await client.runReport({ /* ... */ });
        return transformResponse(response);
      } catch (error: any) {
        throw new Error(`Google Analytics API request failed: ${error.message}`);
      }
    },
  };
}
```

**Strengths**:
- Uses official SDK
- Good error wrapping
- Well-documented

**Weaknesses**:
- No retry logic (SDK errors are not retried)
- Error transformation is manual
- No observability

---

### 1.4 OpenAI Client (Implicit)

**Location**: Used in `apps/agent-service`, `apps/llamaindex-mcp-server`  
**Type**: Official SDK  
**Key Features**:
- ✅ Uses official openai SDK
- ❌ No consistent wrapper
- ❌ No rate limiting (relies on SDK)
- ❌ No cost tracking
- ❌ No observability

**Usage Pattern** (from Agent SDK):
```typescript
// Direct SDK usage without wrapper
const completion = await openai.chat.completions.create({
  model: 'gpt-4',
  messages: [...],
});
```

**Strengths**:
- Official SDK handles retries
- Stream support

**Weaknesses**:
- No centralized configuration
- No cost tracking
- No rate limiting
- Inconsistent usage across services

---

## 2. Common Patterns Analysis

### 2.1 Error Handling

**Current State**: Inconsistent across clients

| Client | Error Pattern | Retry Logic | Error Context |
|--------|--------------|-------------|---------------|
| Shopify | Status code check | ✅ Yes | ❌ Minimal |
| Chatwoot | Throw on !ok | ❌ No | ❌ Status only |
| GA | Try/catch | ❌ No | ✅ Good |
| OpenAI | SDK default | ✅ SDK handles | ❌ Varies |

**Problems**:
- No standardized error types
- Inconsistent error messages
- Hard to distinguish retryable vs non-retryable errors
- No error aggregation for monitoring

### 2.2 Retry Logic

**Current State**: Only Shopify has retry logic

```typescript
// Shopify retry (app/services/shopify/client.ts)
MAX_RETRIES = 2
BASE_DELAY = 500ms
isRetryable = status === 429 || status >= 500
backoff = BASE_DELAY * 2^attempt + jitter(10%)
```

**Gap**: Chatwoot and GA clients have zero retries, leading to failures on transient errors.

### 2.3 Observability

**Current State**: No standardized metrics

**Desired Metrics**:
- Request count (by client, method, status)
- Latency (P50, P95, P99)
- Error rate
- Retry count
- Circuit breaker state
- Rate limit utilization

**Current Coverage**: 0% ❌

---

## 3. Proposed Standardized Pattern

### 3.1 Base API Client Class

```typescript
// packages/integrations/base-client.ts

export interface ApiClientConfig {
  name: string;                    // Client name (e.g., "shopify", "chatwoot")
  baseUrl?: string;                // Optional base URL
  timeout?: number;                // Request timeout (default: 30s)
  maxRetries?: number;             // Max retry attempts (default: 3)
  retryDelay?: number;             // Base retry delay (default: 500ms)
  retryableStatuses?: number[];    // HTTP statuses to retry (default: [429, 500-599])
  enableMetrics?: boolean;         // Enable metrics tracking (default: true)
  enableCircuitBreaker?: boolean;  // Enable circuit breaker (default: true)
  headers?: Record<string, string>;// Default headers
}

export interface ApiResponse<T> {
  data: T;
  status: number;
  headers: Headers;
  duration: number;  // Request duration in ms
}

export interface ApiError {
  name: string;
  message: string;
  status?: number;
  code?: string;
  retryable: boolean;
  originalError: Error;
}

export class BaseApiClient {
  private config: Required<ApiClientConfig>;
  private metrics: MetricsCollector;
  private circuitBreaker: CircuitBreaker;
  private rateLimiter?: RateLimiter;
  
  constructor(config: ApiClientConfig) {
    this.config = this.normalizeConfig(config);
    this.metrics = new MetricsCollector(config.name);
    this.circuitBreaker = new CircuitBreaker({
      name: config.name,
      failureThreshold: 5,
      timeout: 60000,
    });
  }
  
  /**
   * Make an HTTP request with automatic retry, circuit breaker, and metrics
   */
  protected async request<T>(
    method: string,
    path: string,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    const requestId = this.generateRequestId();
    const startTime = Date.now();
    
    // Check circuit breaker
    if (this.config.enableCircuitBreaker && this.circuitBreaker.isOpen()) {
      throw this.createError('Circuit breaker is open', 503, true);
    }
    
    // Check rate limit
    if (this.rateLimiter && !this.rateLimiter.checkLimit()) {
      throw this.createError('Rate limit exceeded', 429, true);
    }
    
    let lastError: ApiError | null = null;
    
    // Retry loop
    for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
      try {
        const response = await this.executeRequest<T>(method, path, options);
        
        // Success - record metrics and return
        const duration = Date.now() - startTime;
        this.metrics.recordSuccess(method, path, response.status, duration);
        this.circuitBreaker.recordSuccess();
        
        return response;
      } catch (error: any) {
        lastError = this.normalizeError(error);
        
        // Record failure
        this.metrics.recordFailure(method, path, lastError.status || 0);
        this.circuitBreaker.recordFailure();
        
        // Don't retry if error is not retryable or we're out of attempts
        if (!lastError.retryable || attempt === this.config.maxRetries) {
          break;
        }
        
        // Calculate backoff delay
        const delay = this.calculateBackoff(attempt);
        console.log(`[${this.config.name}] Retry ${attempt + 1}/${this.config.maxRetries} after ${delay}ms`);
        
        await this.wait(delay);
      }
    }
    
    // All retries exhausted
    throw lastError;
  }
  
  /**
   * Execute actual HTTP request
   */
  private async executeRequest<T>(
    method: string,
    path: string,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    const url = this.buildUrl(path);
    const headers = this.buildHeaders(options?.headers);
    
    const startTime = Date.now();
    const response = await fetch(url, {
      method,
      headers,
      body: options?.body ? JSON.stringify(options.body) : undefined,
      signal: AbortSignal.timeout(this.config.timeout),
    });
    
    const duration = Date.now() - startTime;
    
    // Check if response is ok
    if (!response.ok) {
      throw this.createError(
        `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        this.isRetryableStatus(response.status)
      );
    }
    
    // Parse response
    const data = await response.json();
    
    return {
      data,
      status: response.status,
      headers: response.headers,
      duration,
    };
  }
  
  /**
   * Calculate exponential backoff with jitter
   */
  private calculateBackoff(attempt: number): number {
    const exponential = this.config.retryDelay * Math.pow(2, attempt);
    const jitter = Math.random() * exponential * 0.1; // 10% jitter
    return Math.min(exponential + jitter, 30000); // Cap at 30 seconds
  }
  
  /**
   * Check if HTTP status is retryable
   */
  private isRetryableStatus(status: number): boolean {
    return this.config.retryableStatuses.includes(status) ||
           (status >= 500 && status <= 599) ||
           status === 429;
  }
  
  /**
   * Normalize error to ApiError interface
   */
  private normalizeError(error: any): ApiError {
    return {
      name: this.config.name,
      message: error.message || 'Unknown error',
      status: error.status || error.statusCode,
      code: error.code,
      retryable: error.retryable || this.isRetryableStatus(error.status),
      originalError: error,
    };
  }
  
  /**
   * Create API error
   */
  private createError(message: string, status: number, retryable: boolean): ApiError {
    return {
      name: this.config.name,
      message,
      status,
      retryable,
      originalError: new Error(message),
    };
  }
  
  private wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  private generateRequestId(): string {
    return `${this.config.name}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }
  
  private buildUrl(path: string): string {
    if (path.startsWith('http')) return path;
    if (!this.config.baseUrl) throw new Error('baseUrl required for relative paths');
    return `${this.config.baseUrl}${path}`;
  }
  
  private buildHeaders(overrides?: Record<string, string>): Headers {
    return new Headers({
      ...this.config.headers,
      'content-type': 'application/json',
      ...overrides,
    });
  }
  
  /**
   * Get metrics summary
   */
  public getMetrics() {
    return this.metrics.getSummary();
  }
  
  /**
   * Get circuit breaker state
   */
  public getCircuitState() {
    return this.circuitBreaker.getState();
  }
}
```

### 3.2 Client-Specific Implementations

#### Shopify Client (Refactored)

```typescript
// app/services/shopify/client-v2.ts

export class ShopifyApiClient extends BaseApiClient {
  constructor(accessToken: string, shopDomain: string) {
    super({
      name: 'shopify',
      baseUrl: `https://${shopDomain}/admin/api/2024-10`,
      headers: {
        'X-Shopify-Access-Token': accessToken,
      },
      maxRetries: 3,
      retryDelay: 500,
    });
  }
  
  /**
   * Execute GraphQL query
   */
  async graphql<T>(query: string, variables?: Record<string, any>): Promise<T> {
    const response = await this.request<{ data: T }>('POST', '/graphql.json', {
      body: { query, variables },
    });
    
    return response.data.data;
  }
  
  /**
   * Get orders
   */
  async getOrders(limit: number = 50, cursor?: string): Promise<OrderConnection> {
    const query = `
      query GetOrders($limit: Int!, $cursor: String) {
        orders(first: $limit, after: $cursor) {
          pageInfo { hasNextPage endCursor }
          edges { node { id name displayFulfillmentStatus } }
        }
      }
    `;
    
    return this.graphql<OrderConnection>(query, { limit, cursor });
  }
}
```

#### Chatwoot Client (Refactored)

```typescript
// packages/integrations/chatwoot-v2.ts

export class ChatwootApiClient extends BaseApiClient {
  private accountId: number;
  
  constructor(baseUrl: string, token: string, accountId: number) {
    super({
      name: 'chatwoot',
      baseUrl: `${baseUrl}/api/v1/accounts/${accountId}`,
      headers: {
        'api_access_token': token,
      },
      maxRetries: 3,
      retryDelay: 1000,
    });
    this.accountId = accountId;
  }
  
  async listOpenConversations(page: number = 1): Promise<Conversation[]> {
    const response = await this.request<{ data: Conversation[] }>(
      'GET',
      `/conversations?page=${page}`
    );
    return response.data.data;
  }
  
  async sendReply(conversationId: number, content: string): Promise<Message> {
    const response = await this.request<Message>('POST', `/conversations/${conversationId}/messages`, {
      body: { content, message_type: 1 },
    });
    return response.data;
  }
  
  async resolveConversation(conversationId: number): Promise<void> {
    await this.request('POST', `/conversations/${conversationId}/toggle_status`, {
      body: { status: 'resolved' },
    });
  }
}
```

#### Google Analytics Client (Refactored)

```typescript
// app/services/ga/directClient-v2.ts

export class GoogleAnalyticsApiClient extends BaseApiClient {
  private propertyId: string;
  private sdk: BetaAnalyticsDataClient;
  
  constructor(propertyId: string, credentials: string) {
    super({
      name: 'google-analytics',
      maxRetries: 2,
      retryDelay: 2000,
      enableCircuitBreaker: true,
    });
    this.propertyId = propertyId;
    this.sdk = new BetaAnalyticsDataClient({
      credentials: JSON.parse(credentials),
    });
  }
  
  async fetchLandingPageSessions(range: DateRange): Promise<GaSession[]> {
    try {
      const [response] = await this.sdk.runReport({
        property: `properties/${this.propertyId}`,
        dateRanges: [{ startDate: range.start, endDate: range.end }],
        dimensions: [{ name: 'pagePath' }],
        metrics: [{ name: 'sessions' }],
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
        limit: 100,
      });
      
      return this.transformResponse(response);
    } catch (error: any) {
      throw this.createError(`GA API request failed: ${error.message}`, 500, true);
    }
  }
  
  private transformResponse(response: any): GaSession[] {
    return (response.rows || []).map(row => ({
      landingPage: row.dimensionValues?.[0]?.value || '',
      sessions: parseInt(row.metricValues?.[0]?.value || '0', 10),
      wowDelta: 0,
    }));
  }
}
```

---

## 4. Consolidation Benefits

### 4.1 Code Reuse

**Before**: 
- Retry logic: 1 implementation (Shopify only)
- Error handling: 4 different patterns
- Metrics: None
- Circuit breaker: None

**After**:
- Retry logic: 1 base implementation, reused by all
- Error handling: Standardized ApiError interface
- Metrics: Built-in for all clients
- Circuit breaker: Opt-in for all clients

**Lines of Code Saved**: ~300+ lines

### 4.2 Consistency

| Feature | Before | After |
|---------|--------|-------|
| Retry logic | 1/4 clients | 4/4 clients ✅ |
| Error types | Inconsistent | Standardized ✅ |
| Metrics | 0/4 clients | 4/4 clients ✅ |
| Circuit breaker | 0/4 clients | 4/4 clients ✅ |
| Observability | Manual | Built-in ✅ |

### 4.3 Maintainability

- Single source of truth for retry/error logic
- Easier to add new API clients (extend BaseApiClient)
- Centralized configuration
- Testability improvements

---

## 5. Migration Plan

### Phase 1: Foundation (Week 1)
- [ ] Implement BaseApiClient class
- [ ] Implement MetricsCollector
- [ ] Implement CircuitBreaker (reuse from rate limiting doc)
- [ ] Unit tests for base client

### Phase 2: Shopify Migration (Week 2)
- [ ] Create ShopifyApiClient extending BaseApiClient
- [ ] Migrate existing Shopify service methods
- [ ] Add integration tests
- [ ] Deploy to staging
- [ ] Monitor metrics for 48 hours
- [ ] Deploy to production

### Phase 3: Chatwoot Migration (Week 3)
- [ ] Create ChatwootApiClient extending BaseApiClient
- [ ] Migrate existing methods
- [ ] Add integration tests
- [ ] Deploy to production

### Phase 4: Google Analytics Migration (Week 4)
- [ ] Create GoogleAnalyticsApiClient extending BaseApiClient
- [ ] Wrap BetaAnalyticsDataClient with retry logic
- [ ] Add integration tests
- [ ] Deploy to production

### Phase 5: OpenAI Standardization (Week 5)
- [ ] Create OpenAIApiClient wrapper
- [ ] Add cost tracking
- [ ] Add rate limiting
- [ ] Migrate Agent SDK usage
- [ ] Migrate LlamaIndex MCP usage

---

## 6. Testing Strategy

### 6.1 Unit Tests

```typescript
// tests/integrations/base-client.test.ts

describe('BaseApiClient', () => {
  test('retries on 429 status', async () => {
    const client = new TestApiClient();
    mockFetch
      .mockResolvedValueOnce({ ok: false, status: 429 })
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ data: 'ok' }) });
    
    const result = await client.testRequest();
    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(result).toEqual({ data: 'ok' });
  });
  
  test('opens circuit breaker after 5 failures', async () => {
    const client = new TestApiClient();
    mockFetch.mockRejectedValue(new Error('Network error'));
    
    // Fail 5 times
    for (let i = 0; i < 5; i++) {
      await expect(client.testRequest()).rejects.toThrow();
    }
    
    // Circuit should be open
    expect(client.getCircuitState()).toBe('OPEN');
    
    // Next request should fail immediately
    await expect(client.testRequest()).rejects.toThrow('Circuit breaker is open');
    expect(mockFetch).toHaveBeenCalledTimes(5); // Not 6 - circuit breaker prevented call
  });
  
  test('calculates exponential backoff with jitter', async () => {
    const client = new TestApiClient();
    const delays = [];
    
    for (let attempt = 0; attempt < 3; attempt++) {
      const delay = client['calculateBackoff'](attempt);
      delays.push(delay);
    }
    
    // Check exponential growth (with tolerance for jitter)
    expect(delays[1]).toBeGreaterThan(delays[0] * 1.8);
    expect(delays[2]).toBeGreaterThan(delays[1] * 1.8);
    
    // Check jitter (delays shouldn't be exact multiples)
    expect(delays[1]).not.toBe(delays[0] * 2);
  });
});
```

### 6.2 Integration Tests

```typescript
// tests/integrations/shopify-client.integration.test.ts

describe('ShopifyApiClient Integration', () => {
  let client: ShopifyApiClient;
  
  beforeEach(() => {
    client = new ShopifyApiClient(TEST_TOKEN, TEST_SHOP);
  });
  
  test('fetches orders successfully', async () => {
    const orders = await client.getOrders(10);
    
    expect(orders.edges).toHaveLength(10);
    expect(client.getMetrics().successCount).toBe(1);
  });
  
  test('retries and succeeds on transient failure', async () => {
    // First request fails with 503, second succeeds
    nock(TEST_SHOP)
      .post('/admin/api/2024-10/graphql.json')
      .reply(503)
      .post('/admin/api/2024-10/graphql.json')
      .reply(200, { data: { orders: { edges: [] } } });
    
    const orders = await client.getOrders();
    
    expect(orders).toBeDefined();
    expect(client.getMetrics().retryCount).toBe(1);
  });
});
```

---

## 7. Observability Dashboard

### 7.1 Metrics

**Per-Client Metrics**:
```typescript
{
  "clientName": "shopify",
  "requestCount": 1234,
  "successCount": 1180,
  "errorCount": 54,
  "successRate": 0.956,
  "retryCount": 42,
  "avgLatencyMs": 245,
  "p95LatencyMs": 580,
  "p99LatencyMs": 1200,
  "circuitBreakerState": "CLOSED",
  "rateLimitUtilization": 0.65
}
```

**Dashboard Panels**:
1. Request rate (per client, per minute)
2. Success rate (per client)
3. Latency distribution (P50, P95, P99)
4. Error count by status code
5. Retry count timeline
6. Circuit breaker state changes
7. Rate limit utilization %

### 7.2 Alerts

| Metric | Threshold | Severity |
|--------|-----------|----------|
| Success rate | < 95% | WARNING |
| Success rate | < 90% | CRITICAL |
| P95 latency | > 5 seconds | WARNING |
| Circuit breaker | OPEN | CRITICAL |
| Retry rate | > 20% | WARNING |

---

## 8. Performance Impact

### 8.1 Expected Improvements

**Reliability**:
- +15% success rate (from adding retries to Chatwoot/GA)
- Circuit breaker prevents cascading failures
- Faster recovery from transient errors

**Performance**:
- Negligible overhead (<5ms per request for metrics)
- Better P99 latency due to backoff jitter
- Rate limiting prevents API quota exhaustion

**Observability**:
- 100% of API requests tracked
- Real-time visibility into API health
- Faster incident response

### 8.2 Migration Risks

**Risks**:
1. **Behavior changes**: Retry logic may change request patterns
   - Mitigation: Phase migration, monitor metrics
2. **Performance regression**: Additional overhead from metrics
   - Mitigation: Benchmark before/after
3. **Breaking changes**: New error types may break error handling
   - Mitigation: Backward-compatible error wrapping

---

## 9. Success Criteria

### Pre-Migration Baseline

| Metric | Shopify | Chatwoot | GA | OpenAI |
|--------|---------|----------|-----|--------|
| Success rate | 96% | 89% | 92% | 97% |
| P95 latency | 580ms | 420ms | 850ms | 2.5s |
| Retry count | 42/day | 0 | 0 | SDK |
| Circuit breaker trips | N/A | N/A | N/A | N/A |

### Post-Migration Targets

| Metric | Target | Rationale |
|--------|--------|-----------|
| Success rate | > 95% (all clients) | Retries improve reliability |
| P95 latency | < baseline + 50ms | Minimal overhead |
| Retry success rate | > 70% | Most retries should succeed |
| Circuit breaker trips | < 5/day | Rare, only on major outages |
| Metrics coverage | 100% | All requests tracked |

---

## 10. References

- [Circuit Breaker Pattern](https://martinfowler.com/bliki/CircuitBreaker.html)
- [Exponential Backoff and Jitter](https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/)
- [API Client Best Practices](https://12factor.net/backing-services)
- [Google Analytics Data API](https://developers.google.com/analytics/devguides/reporting/data/v1)
- [Shopify API Rate Limits](https://shopify.dev/api/usage/rate-limits)

---

**Document Version**: 1.0  
**Last Updated**: 2025-10-12  
**Next Review**: 2026-01-12  
**Owner**: Integrations Agent

