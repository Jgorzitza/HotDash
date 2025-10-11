# API Client Library Consolidation Plan

**Owner:** Integrations + Engineer  
**Created:** 2025-10-11  
**Purpose:** Standardize API client patterns across all external integrations  
**Goal:** Consistent, maintainable, testable API clients

---

## Current State Analysis

### Existing Client Implementations

**1. Shopify Client** (`app/services/shopify/client.ts`)
- **Pattern:** Wrapper function around Shopify App Bridge
- **Authentication:** OAuth via App Bridge (automatic)
- **Retry Logic:** ✅ Implemented (exponential backoff)
- **Error Handling:** ✅ ServiceError with scope/code
- **Type Safety:** ✅ Full TypeScript interfaces
- **Testability:** ✅ Dependency injection for wait/random functions

**2. Chatwoot Client** (`packages/integrations/chatwoot.ts`)
- **Pattern:** Factory function returning object with methods
- **Authentication:** API token in headers
- **Retry Logic:** ❌ Not implemented
- **Error Handling:** ⚠️ Basic (throws generic Error)
- **Type Safety:** ✅ TypeScript interfaces
- **Testability:** ⚠️ Hard to mock (direct fetch calls)

**3. Google Analytics Clients** (`app/services/ga/`)
- **Pattern:** Multiple implementations of GaClient interface
  - `directClient.ts` - Official SDK (@google-analytics/data)
  - `mockClient.ts` - Mock for testing
  - `mcpClient.ts` - MCP-based (for dev tools)
- **Authentication:** Service account (automatic via SDK)
- **Retry Logic:** ❌ Not implemented
- **Error Handling:** ⚠️ Wrapped errors with context
- **Type Safety:** ✅ Full TypeScript interfaces
- **Testability:** ✅ Interface allows easy mocking

---

## Identified Issues

### 1. Inconsistent Patterns
- Shopify: Wrapper function
- Chatwoot: Factory function
- GA: Interface + multiple implementations
- **Impact:** Difficult to learn, inconsistent testing approaches

### 2. Missing Retry Logic
- ❌ Chatwoot: No retries (will fail on transient errors)
- ❌ GA: No retries (will fail on quota/rate limits)
- **Impact:** Reduced reliability, poor user experience

### 3. Inconsistent Error Handling
- ✅ Shopify: Uses ServiceError (structured)
- ❌ Chatwoot: Throws generic Error (unstructured)
- ⚠️ GA: Throws wrapped Error (semi-structured)
- **Impact:** Inconsistent error logging, harder debugging

### 4. Mixed Testability
- ✅ Shopify: Excellent (dependency injection)
- ⚠️ Chatwoot: Poor (direct fetch, hard to mock)
- ✅ GA: Excellent (interface-based)
- **Impact:** Inconsistent test coverage

---

## Proposed Standard Pattern

### Universal API Client Interface

**Create:** `app/services/api-client/base.ts`

```typescript
import type { ServiceError } from "../types";

/**
 * Standard configuration for any API client
 */
export interface ApiClientConfig {
  baseUrl: string;
  authentication: AuthConfig;
  retry?: RetryConfig;
  timeout?: number;
  headers?: Record<string, string>;
}

export interface AuthConfig {
  type: 'bearer' | 'api-key' | 'oauth' | 'service-account';
  credentials: Record<string, string>;
}

export interface RetryConfig {
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
  retryableStatuses: number[];
}

/**
 * Standard API client base class
 * All external API clients should extend this
 */
export abstract class BaseApiClient {
  protected config: ApiClientConfig;
  protected retryConfig: RetryConfig;
  
  constructor(config: ApiClientConfig) {
    this.config = config;
    this.retryConfig = config.retry || {
      maxRetries: 3,
      baseDelayMs: 1000,
      maxDelayMs: 30000,
      retryableStatuses: [429, 500, 502, 503, 504]
    };
  }
  
  /**
   * Make HTTP request with automatic retry
   */
  protected async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.config.baseUrl}${endpoint}`;
    const headers = {
      ...this.config.headers,
      ...this.getAuthHeaders(),
      ...options.headers
    };
    
    return await this.withRetry(async () => {
      const response = await fetch(url, { ...options, headers });
      
      if (!response.ok) {
        throw await this.handleErrorResponse(response);
      }
      
      return await response.json() as T;
    });
  }
  
  /**
   * Get authentication headers based on config
   */
  protected getAuthHeaders(): Record<string, string> {
    const { type, credentials } = this.config.authentication;
    
    switch (type) {
      case 'bearer':
        return { 'Authorization': `Bearer ${credentials.token}` };
      case 'api-key':
        return { [credentials.headerName]: credentials.apiKey };
      case 'oauth':
        return { 'Authorization': `Bearer ${credentials.accessToken}` };
      default:
        return {};
    }
  }
  
  /**
   * Retry logic with exponential backoff
   */
  protected async withRetry<T>(
    operation: () => Promise<T>
  ): Promise<T> {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt <= this.retryConfig.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error: any) {
        lastError = error;
        
        const status = error.status || error.response?.status;
        const isRetryable = this.retryConfig.retryableStatuses.includes(status);
        
        if (!isRetryable || attempt === this.retryConfig.maxRetries) {
          throw error;
        }
        
        // Exponential backoff with jitter
        const baseDelay = this.retryConfig.baseDelayMs * Math.pow(2, attempt);
        const jitter = Math.random() * baseDelay * 0.1;
        const delay = Math.min(baseDelay + jitter, this.retryConfig.maxDelayMs);
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError!;
  }
  
  /**
   * Handle error responses consistently
   */
  protected async handleErrorResponse(response: Response): Promise<ServiceError> {
    const statusText = response.statusText;
    let errorMessage: string;
    
    try {
      const json = await response.json();
      errorMessage = json.error || json.message || statusText;
    } catch {
      errorMessage = statusText;
    }
    
    return new ServiceError(
      `API request failed: ${errorMessage}`,
      {
        scope: this.getServiceScope(),
        code: `${response.status}`,
        retryable: this.retryConfig.retryableStatuses.includes(response.status)
      }
    );
  }
  
  /**
   * Override in subclass to provide service name
   */
  protected abstract getServiceScope(): string;
}
```

---

## Refactored Client Implementations

### Chatwoot Client (Standardized)

**Create:** `app/services/chatwoot/client.ts`

```typescript
import { BaseApiClient, type ApiClientConfig } from "../api-client/base";
import type { Conversation, Message } from "./types";

export interface ChatwootClientConfig {
  baseUrl: string;
  apiToken: string;
  accountId: number;
}

export class ChatwootClient extends BaseApiClient {
  private accountId: number;
  
  constructor(config: ChatwootClientConfig) {
    super({
      baseUrl: config.baseUrl,
      authentication: {
        type: 'api-key',
        credentials: {
          headerName: 'api_access_token',
          apiKey: config.apiToken
        }
      },
      retry: {
        maxRetries: 3,
        baseDelayMs: 1000,
        maxDelayMs: 10000,
        retryableStatuses: [429, 500, 502, 503, 504]
      },
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    this.accountId = config.accountId;
  }
  
  protected getServiceScope(): string {
    return 'chatwoot';
  }
  
  /**
   * List open conversations with pagination
   */
  async listOpenConversations(page: number = 1): Promise<Conversation[]> {
    const response = await this.request<{ data: Conversation[] }>(
      `/api/v1/accounts/${this.accountId}/conversations?page=${page}&status=open`
    );
    return response.data;
  }
  
  /**
   * Get messages for a conversation
   */
  async getMessages(conversationId: number): Promise<Message[]> {
    const response = await this.request<{ payload: Message[] }>(
      `/api/v1/accounts/${this.accountId}/conversations/${conversationId}/messages`
    );
    return response.payload;
  }
  
  /**
   * Send reply to conversation
   */
  async sendReply(conversationId: number, content: string): Promise<void> {
    await this.request(
      `/api/v1/accounts/${this.accountId}/conversations/${conversationId}/messages`,
      {
        method: 'POST',
        body: JSON.stringify({ content, message_type: 1 })
      }
    );
  }
  
  /**
   * Create private note
   */
  async createPrivateNote(conversationId: number, content: string): Promise<void> {
    await this.request(
      `/api/v1/accounts/${this.accountId}/conversations/${conversationId}/messages`,
      {
        method: 'POST',
        body: JSON.stringify({ content, message_type: 0, private: true })
      }
    );
  }
  
  // ... other methods follow same pattern
}

// Factory function for backward compatibility
export function createChatwootClient(config: ChatwootClientConfig): ChatwootClient {
  return new ChatwootClient(config);
}
```

**Benefits:**
- ✅ Automatic retry logic (inherited from BaseApiClient)
- ✅ Consistent error handling (ServiceError)
- ✅ Type-safe requests
- ✅ Easy to test (can extend and override for mocks)

---

### Google Analytics Client (Standardized)

**Maintain Current Pattern** (Already Good)

```typescript
// app/services/ga/client.ts - Keep interface
export interface GaClient {
  fetchLandingPageSessions(range: DateRange): Promise<GaSession[]>;
}

// app/services/ga/directClient.ts - Add retry wrapper
import { withRetry } from "../api-client/retry";

export function createDirectGaClient(propertyId: string): GaClient {
  const client = new BetaAnalyticsDataClient();
  
  return {
    async fetchLandingPageSessions(range: DateRange): Promise<GaSession[]> {
      return await withRetry(
        async () => {
          const [response] = await client.runReport({...});
          return transformResponse(response);
        },
        {
          maxRetries: 3,
          baseDelayMs: 2000,
          retryableStatuses: [429],
          retryableCodes: ['RATE_LIMIT_EXCEEDED', 'RESOURCE_EXHAUSTED']
        }
      );
    }
  };
}
```

**Benefits:**
- ✅ Keeps clean interface pattern
- ✅ Adds retry logic
- ✅ Maintains multiple implementations (direct, mock, mcp)
- ✅ No breaking changes

---

### Shopify Client (Minimal Changes)

**Current Pattern is Good** - Just extract retry to shared utility

```typescript
// app/services/shopify/client.ts
import { withRetry } from "../api-client/retry";

export async function getShopifyServiceContext(
  request: Request
): Promise<ShopifyServiceContext> {
  const { admin, session } = await authenticate.admin(request);
  
  // Use shared retry logic
  const wrappedAdmin = {
    ...admin,
    graphql: (query: string, options: any) => 
      withRetry(
        () => admin.graphql(query, options),
        {
          maxRetries: 2,
          baseDelayMs: 500,
          retryableStatuses: [429, 500, 502, 503, 504]
        }
      )
  };
  
  return { admin: wrappedAdmin, shopDomain: session.shop, operatorEmail };
}
```

---

## Shared Utilities

### 1. Retry Utility

**Create:** `app/services/api-client/retry.ts`

```typescript
export interface RetryConfig {
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs?: number;
  retryableStatuses?: number[];
  retryableCodes?: string[];
  respectRetryAfter?: boolean;
}

export async function withRetry<T>(
  operation: () => Promise<T>,
  config: RetryConfig
): Promise<T> {
  let lastError: any = null;
  
  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      
      // Check if retryable
      const status = error.status || error.response?.status || error.code;
      const isRetryable = 
        config.retryableStatuses?.includes(status) ||
        config.retryableCodes?.includes(status);
      
      if (!isRetryable || attempt === config.maxRetries) {
        throw error;
      }
      
      // Calculate delay
      let delay: number;
      
      if (config.respectRetryAfter && error.response?.headers?.['retry-after']) {
        delay = parseInt(error.response.headers['retry-after']) * 1000;
      } else {
        const exponentialDelay = config.baseDelayMs * Math.pow(2, attempt);
        const jitter = Math.random() * exponentialDelay * 0.1;
        delay = exponentialDelay + jitter;
      }
      
      if (config.maxDelayMs) {
        delay = Math.min(delay, config.maxDelayMs);
      }
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
}
```

---

### 2. Request Throttler

**Create:** `app/services/api-client/throttle.ts`

```typescript
export class RequestThrottler {
  private lastRequestTime = 0;
  private minIntervalMs: number;
  
  constructor(requestsPerSecond: number) {
    this.minIntervalMs = 1000 / requestsPerSecond;
  }
  
  async throttle<T>(operation: () => Promise<T>): Promise<T> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    const delay = Math.max(0, this.minIntervalMs - timeSinceLastRequest);
    
    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    this.lastRequestTime = Date.now();
    return await operation();
  }
  
  getNextAvailableTime(): number {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    return Math.max(0, this.minIntervalMs - timeSinceLastRequest);
  }
}

// Usage
const shopifyThrottler = new RequestThrottler(1.5);  // 1.5 req/sec

const result = await shopifyThrottler.throttle(() =>
  admin.graphql(QUERY, variables)
);
```

---

### 3. Circuit Breaker

**Create:** `app/services/api-client/circuit-breaker.ts`

```typescript
type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface CircuitBreakerConfig {
  failureThreshold: number;
  resetTimeoutMs: number;
  monitoringWindowMs?: number;
}

export class CircuitBreaker {
  private state: CircuitState = 'CLOSED';
  private failureCount = 0;
  private lastFailureTime = 0;
  private successCount = 0;
  
  constructor(private config: CircuitBreakerConfig) {}
  
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    // If circuit is open, check if we should try again
    if (this.state === 'OPEN') {
      const timeSinceFailure = Date.now() - this.lastFailureTime;
      
      if (timeSinceFailure < this.config.resetTimeoutMs) {
        throw new Error(
          `Circuit breaker is OPEN - too many recent failures. ` +
          `Retry in ${Math.ceil((this.config.resetTimeoutMs - timeSinceFailure) / 1000)}s`
        );
      }
      
      // Try one request (HALF_OPEN state)
      this.state = 'HALF_OPEN';
    }
    
    try {
      const result = await operation();
      
      // Success
      this.handleSuccess();
      return result;
    } catch (error) {
      // Failure
      this.handleFailure();
      throw error;
    }
  }
  
  private handleSuccess() {
    if (this.state === 'HALF_OPEN') {
      // Success in half-open state - close circuit
      this.state = 'CLOSED';
      this.failureCount = 0;
      this.successCount = 0;
    } else {
      this.successCount++;
    }
  }
  
  private handleFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    
    if (this.failureCount >= this.config.failureThreshold) {
      this.state = 'OPEN';
    }
  }
  
  getState() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      lastFailureTime: this.lastFailureTime
    };
  }
  
  reset() {
    this.state = 'CLOSED';
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = 0;
  }
}
```

---

## Migration Plan

### Phase 1: Create Shared Utilities (Week 1)

**Step 1.1: Create Base Utilities**
- [ ] Create `app/services/api-client/retry.ts`
- [ ] Create `app/services/api-client/throttle.ts`
- [ ] Create `app/services/api-client/circuit-breaker.ts`
- [ ] Create `app/services/api-client/base.ts`
- [ ] Add unit tests for each utility

**Step 1.2: Extract Shopify Retry Logic**
- [ ] Move retry logic from `shopify/client.ts` to use shared `withRetry`
- [ ] Verify existing tests still pass
- [ ] Update documentation

**Estimated Effort:** 8 hours

---

### Phase 2: Migrate Chatwoot Client (Week 1-2)

**Step 2.1: Create New Chatwoot Client**
- [ ] Create `app/services/chatwoot/client.ts` extending BaseApiClient
- [ ] Implement all methods from `packages/integrations/chatwoot.ts`
- [ ] Add retry logic (inherited from base)
- [ ] Add proper error handling (ServiceError)

**Step 2.2: Update Usage**
- [ ] Update `app/services/chatwoot/escalations.ts` to use new client
- [ ] Update any other files importing chatwoot client
- [ ] Verify tests pass
- [ ] Mark old client as deprecated

**Step 2.3: Remove Old Client**
- [ ] Delete `packages/integrations/chatwoot.ts` (after migration complete)
- [ ] Update imports across codebase

**Estimated Effort:** 6 hours

---

### Phase 3: Migrate GA Client (Week 2)

**Step 3.1: Add Retry to Direct Client**
- [ ] Wrap BetaAnalyticsDataClient.runReport with `withRetry`
- [ ] Configure GA-specific retry settings
- [ ] Add error handling improvements

**Step 3.2: Consistent Error Messages**
- [ ] Use ServiceError for all GA errors
- [ ] Add proper scope and retryable flags

**Estimated Effort:** 3 hours

---

### Phase 4: Add Advanced Features (Week 3+)

**Step 4.1: Add Throttling**
- [ ] Create throttler instances for each API
- [ ] Integrate with existing clients
- [ ] Monitor for performance impact

**Step 4.2: Add Circuit Breakers**
- [ ] Create circuit breaker instances
- [ ] Wrap API calls
- [ ] Add monitoring for circuit state

**Step 4.3: Monitoring Dashboard**
- [ ] Add rate limit event logging
- [ ] Create API health metrics
- [ ] Build visualization dashboard

**Estimated Effort:** 12 hours

---

## Standardized Client Template

### For New API Integrations

```typescript
// app/services/{service}/client.ts
import { BaseApiClient, type ApiClientConfig } from "../api-client/base";

export interface {Service}ClientConfig {
  baseUrl: string;
  apiToken: string;
  // ... other config
}

export class {Service}Client extends BaseApiClient {
  constructor(config: {Service}ClientConfig) {
    super({
      baseUrl: config.baseUrl,
      authentication: {
        type: 'api-key',  // or 'bearer', 'oauth'
        credentials: { ... }
      },
      retry: {
        maxRetries: 3,
        baseDelayMs: 1000,
        maxDelayMs: 30000,
        retryableStatuses: [429, 500, 502, 503, 504]
      }
    });
  }
  
  protected getServiceScope(): string {
    return '{service}';
  }
  
  // Implement service-specific methods using this.request<T>()
  async getResource(id: string): Promise<Resource> {
    return await this.request<Resource>(`/resources/${id}`);
  }
  
  async createResource(data: CreateResourceInput): Promise<Resource> {
    return await this.request<Resource>('/resources', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
}
```

**Checklist for New Client:**
- [ ] Extends BaseApiClient
- [ ] Implements getServiceScope()
- [ ] Uses this.request<T>() for all HTTP calls
- [ ] Configures appropriate retry settings
- [ ] Has unit tests
- [ ] Has integration tests
- [ ] Documented in API reference guide

---

## Testing Strategy

### Unit Tests for Base Client

```typescript
// tests/unit/api-client/base.test.ts
describe('BaseApiClient', () => {
  class TestClient extends BaseApiClient {
    protected getServiceScope() { return 'test'; }
    
    async testRequest<T>(endpoint: string) {
      return this.request<T>(endpoint);
    }
  }
  
  it('should retry on 429', async () => {
    const mockFetch = jest.fn()
      .mockResolvedValueOnce({ ok: false, status: 429 })
      .mockResolvedValueOnce({ ok: true, json: () => ({ data: 'success' }) });
    
    global.fetch = mockFetch;
    
    const client = new TestClient({ baseUrl: 'http://test', ... });
    const result = await client.testRequest('/endpoint');
    
    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(result).toEqual({ data: 'success' });
  });
  
  // ... more tests
});
```

### Integration Tests for Each Client

```typescript
// tests/integration/chatwoot-client.test.ts
describe('ChatwootClient', () => {
  it('should handle rate limits gracefully', async () => {
    // Use mock server that returns 429 then 200
    const client = new ChatwootClient({ ... });
    const result = await client.listOpenConversations();
    
    expect(result).toHaveLength(5);
  });
});
```

---

## Benefits Summary

### Developer Experience
- ✅ Consistent API across all clients
- ✅ Easy to add new integrations (follow template)
- ✅ Better IDE autocomplete (TypeScript classes)
- ✅ Centralized retry/error logic (easier to maintain)

### Reliability
- ✅ Automatic retry for all APIs (no manual implementation)
- ✅ Consistent error handling (ServiceError everywhere)
- ✅ Circuit breakers prevent cascade failures
- ✅ Throttling prevents rate limit errors proactively

### Testability
- ✅ Easy to mock (class-based, can extend)
- ✅ Dependency injection friendly
- ✅ Shared test utilities (mock responses, fixtures)

### Maintainability
- ✅ Single source of truth for retry logic
- ✅ Easy to update retry strategy (change in one place)
- ✅ Clear separation of concerns (auth, retry, error handling)
- ✅ Self-documenting code (TypeScript types)

---

## Comparison: Before vs. After

### Before Consolidation

```typescript
// Chatwoot - No retry
const response = await fetch(url, { headers });
if (!response.ok) throw new Error(`Chatwoot ${response.status}`);

// GA - No retry
const [response] = await client.runReport({...});
// Throws on error

// Shopify - Custom retry
async function graphqlWithRetry(...) {
  // 30 lines of retry logic
}
```

**Issues:**
- Inconsistent reliability (only Shopify retries)
- Code duplication (similar retry logic needed everywhere)
- Hard to test (fetch calls not wrapped)

### After Consolidation

```typescript
// All clients use shared retry
const result = await withRetry(
  () => apiCall(),
  { maxRetries: 3, baseDelayMs: 1000 }
);

// Or inherit from BaseApiClient
class MyClient extends BaseApiClient {
  async getData() {
    return this.request<Data>('/endpoint');  // Retry automatic
  }
}
```

**Benefits:**
- ✅ Consistent reliability (all APIs retry)
- ✅ No code duplication (shared utility)
- ✅ Easy to test (utilities well-tested)
- ✅ Easy to update (change retry config in one place)

---

## Implementation Checklist

### Phase 1: Foundation
- [ ] Create `app/services/api-client/` directory
- [ ] Implement `retry.ts` utility
- [ ] Implement `throttle.ts` utility
- [ ] Implement `circuit-breaker.ts` utility
- [ ] Implement `base.ts` (BaseApiClient class)
- [ ] Add comprehensive unit tests (80%+ coverage)
- [ ] Document in API reference guide

### Phase 2: Shopify Migration
- [ ] Extract retry to use `withRetry` utility
- [ ] Remove duplicate retry code
- [ ] Verify all Shopify service tests pass
- [ ] Update documentation

### Phase 3: Chatwoot Migration
- [ ] Create new ChatwootClient extending BaseApiClient
- [ ] Migrate all methods from old client
- [ ] Update usages in app/services/chatwoot/
- [ ] Add retry logic tests
- [ ] Deprecate old client

### Phase 4: GA Migration
- [ ] Wrap GA SDK calls with `withRetry`
- [ ] Add ServiceError handling
- [ ] Update error messages
- [ ] Test quota/rate limit handling

### Phase 5: Advanced Features
- [ ] Add throttling to Shopify client
- [ ] Add throttling to Chatwoot client
- [ ] Add circuit breakers to all clients
- [ ] Add monitoring/logging for API calls
- [ ] Create API health dashboard

---

## Success Criteria

### Consolidation Complete When:
- ✅ All API clients use shared retry utility
- ✅ All API clients return ServiceError (not generic Error)
- ✅ All API clients have retry logic (no exceptions)
- ✅ 90%+ test coverage for shared utilities
- ✅ Zero code duplication for retry/error handling
- ✅ All clients documented in API reference guide

### Performance Validated When:
- ✅ Dashboard load time unchanged (< 3s)
- ✅ API success rate improved (fewer transient failures)
- ✅ Zero regressions in existing functionality
- ✅ Rate limit errors reduced by 99%

---

## Estimated Effort

| Phase | Tasks | Hours | Owner |
|-------|-------|-------|-------|
| 1. Foundation | Shared utilities + tests | 8h | Engineer |
| 2. Shopify | Extract to shared | 2h | Engineer |
| 3. Chatwoot | New client + migration | 6h | Engineer |
| 4. GA | Add retry wrapper | 3h | Engineer |
| 5. Advanced | Throttle + circuit breakers | 12h | Engineer |
| **Total** | | **31h** | ~1 sprint |

**Timeline:** 2-3 sprints for complete consolidation

---

## Risks & Mitigation

### Risk 1: Breaking Changes
**Risk:** Migrations break existing functionality  
**Mitigation:** Comprehensive tests, gradual migration, feature flags

### Risk 2: Performance Regression
**Risk:** Additional abstraction layers slow down requests  
**Mitigation:** Performance benchmarks, load testing, monitoring

### Risk 3: Over-Engineering
**Risk:** Too much abstraction makes debugging harder  
**Mitigation:** Keep utilities simple, good logging, clear error messages

---

##Next Steps

### Immediate (Integrations Agent)
- ✅ Document current state (this plan)
- ⏳ Share plan with Engineer agent
- ⏳ Coordinate implementation timeline

### Short-term (Engineer Agent)
- ⏳ Review consolidation plan
- ⏳ Implement Phase 1 (shared utilities)
- ⏳ Begin Phase 2-4 migrations

### Long-term (Team)
- ⏳ Monitor API reliability improvements
- ⏳ Iterate on retry/throttle configurations
- ⏳ Add advanced features (circuit breakers, adaptive limits)

---

**Plan Created:** 2025-10-11 21:44 UTC  
**Status:** Ready for engineer review and implementation  
**Owner:** Engineer (implementation), Integrations (coordination)  
**Priority:** P1 - Significantly improves reliability

