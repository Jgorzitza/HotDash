# API Contracts Documentation

## Overview

This directory contains API contract documentation for all backend services consumed by the frontend.

## Services

### Shopify Admin GraphQL Client

**Module**: `app/lib/shopify/client.ts`

**Interface**:
```typescript
interface ShopifyGraphQLClient {
  query<T>(query: string, variables?: Record<string, any>): Promise<T>;
  mutate<T>(mutation: string, variables?: Record<string, any>): Promise<T>;
  getShopDomain(): string;
  getOperatorEmail(): string | null;
}
```

**Usage**:
```typescript
import { createShopifyClient } from "~/lib/shopify/client";

const client = await createShopifyClient(request);
const data = await client.query<OrdersResponse>(ORDERS_QUERY, { first: 10 });
```

**Features**:
- Automatic retry with exponential backoff (max 3 retries)
- Rate limiting (2 req/sec)
- Metrics tracking
- Error handling

---

### Supabase RPC Client

**Module**: `app/lib/supabase/client.ts`

**Interface**:
```typescript
interface SupabaseRPCClient {
  rpc<T>(functionName: string, params?: Record<string, any>): Promise<T>;
  from<T>(table: string): any;
  getClient(): SupabaseClient;
}
```

**Helper Methods**:
```typescript
SupabaseRPC.getApprovalQueue(params: { limit?, offset?, status? }): Promise<any[]>
SupabaseRPC.logAuditEntry(params: { scope, actor, action, ... }): Promise<number>
SupabaseRPC.getDashboardMetricsHistory(params: { shopDomain, factType?, ... }): Promise<any[]>
```

**Usage**:
```typescript
import { createSupabaseClient, SupabaseRPC } from "~/lib/supabase/client";

const client = createSupabaseClient();
const result = await client.rpc("my_function", { param: "value" });

// Or use helpers
const queue = await SupabaseRPC.getApprovalQueue({ limit: 50 });
```

---

### Chatwoot API Client

**Module**: `app/lib/chatwoot/client.ts`

**Interface**:
```typescript
interface ChatwootClient {
  getConversations(filters?: ConversationFilters): Promise<PaginatedResponse<ChatwootConversation>>;
  getConversation(conversationId: number): Promise<ChatwootConversation>;
  createMessage(conversationId: number, content: string, isPrivate?: boolean): Promise<ChatwootMessage>;
  updateConversationStatus(conversationId: number, status: string): Promise<void>;
}

interface ConversationFilters {
  status?: 'open' | 'resolved' | 'pending';
  inboxId?: number;
  page?: number;
}
```

**Usage**:
```typescript
import { createChatwootClient } from "~/lib/chatwoot/client";

const client = createChatwootClient();
const conversations = await client.getConversations({ status: 'open', page: 1 });
```

---

### GA4 Analytics Client

**Module**: `app/lib/analytics/client.ts`

**Interface**:
```typescript
interface GA4Client {
  getRevenue(startDate: string, endDate: string): Promise<GA4RevenueData>;
  getTraffic(startDate: string, endDate: string): Promise<GA4TrafficData>;
  getRevenueLastNDays(days: number): Promise<GA4RevenueData>;
  getTrafficLastNDays(days: number): Promise<GA4TrafficData>;
}
```

**Helper Methods**:
```typescript
GA4Helpers.getLastNDays(days: number): { startDate, endDate }
GA4Helpers.getCurrentMonth(): { startDate, endDate }
GA4Helpers.getPreviousMonth(): { startDate, endDate }
GA4Helpers.getYearToDate(): { startDate, endDate }
GA4Helpers.getComparisonPeriods(days: number): { current, previous }
```

**Usage**:
```typescript
import { createGA4Client, GA4Helpers } from "~/lib/analytics/client";

const client = createGA4Client();
const revenue = await client.getRevenueLastNDays(30);

// Or use helpers
const { startDate, endDate } = GA4Helpers.getLastNDays(7);
const traffic = await client.getTraffic(startDate, endDate);
```

---

## API Routes

### Dashboard Metrics

**GET** `/api/shopify/revenue`
- Returns: `{ totalRevenue, currency, orderCount, windowDays, generatedAt }`
- Cache: 5 minutes

**GET** `/api/shopify/aov`
- Returns: `{ averageOrderValue, currency, orderCount, totalRevenue, windowDays, generatedAt }`
- Cache: 5 minutes

**GET** `/api/shopify/returns`
- Returns: `{ returnCount, totalRefundValue, currency, returnRate, windowDays, generatedAt }`
- Cache: 5 minutes

**GET** `/api/shopify/stock`
- Returns: `{ atRiskCount, criticalCount, lowStockThreshold, totalVariantsChecked, generatedAt }`
- Cache: 5 minutes

### Health Check

**GET** `/api/health`
- Returns: `{ status, timestamp, latencyMs, checks: { shopify, supabase, chatwoot, ga4 } }`
- Status: 200 if healthy, 503 if degraded
- No cache

---

## Error Handling

All clients throw structured errors:

```typescript
class APIError extends Error {
  code: string;
  statusCode: number;
  retryable: boolean;
  context?: Record<string, any>;
}
```

Error types:
- `NetworkError` - Network failures (retryable)
- `TimeoutError` - Request timeouts (retryable)
- `RateLimitError` - Rate limit exceeded (retryable)
- `AuthenticationError` - Auth failures (not retryable)
- `ValidationError` - Invalid input (not retryable)
- `NotFoundError` - Resource not found (not retryable)
- `ServerError` - Server errors (retryable)

---

## Rate Limits

- **Shopify**: 2 requests/second
- **Chatwoot**: 10 requests/second
- **GA4**: 10 requests/second
- **Supabase**: 100 requests/second

All clients automatically enforce rate limits with token bucket algorithm.

---

## Caching

Global LRU caches available:

```typescript
import { shopifyCache, supabaseCache, analyticsCache } from "~/lib/cache/lru";

// Check cache
const cached = shopifyCache.get("key");
if (cached) return cached;

// Set cache
shopifyCache.set("key", data);
```

Cache TTLs:
- Shopify: 5 minutes
- Supabase: 2 minutes
- Analytics: 10 minutes

---

## Pagination

Cursor-based pagination:

```typescript
import { createCursorPaginationResult, encodeCursor, decodeCursor } from "~/lib/pagination";

const result = createCursorPaginationResult(items, limit, (item) => item.id);
// Returns: { data, nextCursor, hasMore }
```

Offset-based pagination:

```typescript
import { createOffsetPaginationResult } from "~/lib/pagination";

const result = createOffsetPaginationResult(items, totalCount, page, perPage);
// Returns: { data, meta: { currentPage, perPage, totalPages, totalCount } }
```

---

## Monitoring

### SLA Monitoring

```typescript
import { checkSLA, getAllSLAStatus } from "~/lib/monitoring/sla";

const status = checkSLA("shopify");
// Returns: { compliant, violations, metrics: { p95LatencyMs, errorRatePercent, availabilityPercent } }
```

### Retry Budget

```typescript
import { getRetryBudgetMetrics, checkRetryBudget } from "~/lib/monitoring/retry-budget";

const metrics = getRetryBudgetMetrics("shopify");
// Returns: { totalRequests, retriedRequests, retryRate, budgetRemaining, budgetExhausted }
```

---

## Webhooks

### Shopify Order Create

**POST** `/webhooks/shopify/orders/create`
- Authenticated via Shopify webhook verification
- Idempotent (duplicate webhooks ignored)
- Logs to audit trail

### Chatwoot Conversation Update

**POST** `/webhooks/chatwoot/conversation/update`
- Authenticated via X-Chatwoot-Signature header
- Idempotent (duplicate webhooks ignored)
- Logs to audit trail

---

## Best Practices

1. **Always use clients** - Don't call APIs directly
2. **Handle errors** - Wrap calls in try/catch
3. **Check cache first** - Use LRU caches for frequent reads
4. **Use pagination** - For large datasets
5. **Monitor SLAs** - Check compliance regularly
6. **Respect rate limits** - Clients enforce automatically
7. **Log operations** - Use structured logger with request IDs

---

## Examples

See `tests/integration/api/clients.test.ts` for comprehensive examples.
