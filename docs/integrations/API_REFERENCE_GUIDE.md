# HotDash External API Reference Guide

**Owner:** Integrations  
**Created:** 2025-10-11  
**Purpose:** Document all external API usage patterns, endpoints, and integration contracts  
**Audience:** Engineers, Integrations, Deployment agents

---

## Overview

HotDash integrates with 4 primary external APIs:
1. **Shopify Admin API** - E-commerce data (orders, inventory, products)
2. **Chatwoot API** - Customer support conversations
3. **Google Analytics Data API** - Web analytics and landing page sessions
4. **OpenAI API** - AI inference and embeddings (via packages/ai)

This document catalogs all API endpoints, query patterns, authentication methods, and rate limiting considerations.

---

## 1. Shopify Admin API

### API Configuration
- **Base URL:** Provided via Shopify App Bridge (`admin.graphql`)
- **API Version:** 2024-10 / 2025-10 (current)
- **Authentication:** OAuth 2.0 (handled by @shopify/shopify-app-react-router)
- **Protocol:** GraphQL (Admin API)
- **Documentation:** https://shopify.dev/docs/api/admin-graphql/latest

### Authentication Flow
```typescript
// From app/services/shopify/client.ts
import { authenticate } from "../../shopify.server";

const { admin, session } = await authenticate.admin(request);
const response = await admin.graphql(QUERY, { variables });
```

### Implemented Endpoints/Queries

#### 1.1 Sales Pulse Query
**Purpose:** Fetch recent orders with revenue and line item details  
**File:** `app/services/shopify/orders.ts` lines 19-54  
**Function:** `getSalesPulseSummary()`

**Status:** ⚠️ NEEDS FIX - Uses deprecated `financialStatus` field

**Current Query:**
```graphql
query SalesPulse($first: Int!, $query: String) {
  orders(first: $first, sortKey: CREATED_AT, reverse: true, query: $query) {
    edges {
      node {
        id
        name
        createdAt
        displayFulfillmentStatus
        financialStatus  # ❌ DEPRECATED
        currentTotalPriceSet {
          shopMoney {
            amount
            currencyCode
          }
        }
        lineItems(first: 20) {
          edges {
            node {
              sku
              title
              quantity
              discountedTotalSet {
                shopMoney {
                  amount
                  currencyCode
                }
              }
            }
          }
        }
      }
    }
  }
}
```

**Required Fix:** Change `financialStatus` → `displayFinancialStatus`

**Query Parameters:**
- `first`: Max orders to fetch (default: 50, from `SHOPIFY_SALES_ORDER_LIMIT` env var)
- `query`: Date filter string (e.g., `created_at:>=2025-10-01T00:00:00Z`)

**Response Shape:**
```typescript
interface SalesPulseResponse {
  data?: {
    orders: {
      edges: Array<{
        node: {
          id: string;
          name: string;
          createdAt: string;
          displayFulfillmentStatus: string;
          displayFinancialStatus: string;  // ✅ Correct field
          currentTotalPriceSet?: {
            shopMoney: { amount: string; currencyCode: string };
          };
          lineItems: {
            edges: Array<{
              node: {
                sku: string | null;
                title: string;
                quantity: number;
                discountedTotalSet?: {
                  shopMoney: { amount: string; currencyCode: string };
                };
              };
            }>;
          };
        };
      }>;
    };
  };
  errors?: Array<{ message: string }>;
}
```

**Rate Limiting:**
- Shopify API: 2 requests/second (bucket-based)
- Retry Logic: Implemented in `app/services/shopify/client.ts`
- Backoff: Exponential with jitter (500ms base, max 2 retries)

---

#### 1.2 Fulfillment Query
**Purpose:** Fetch pending fulfillments and tracking information  
**File:** `packages/integrations/shopify.ts` lines 3-12  
**Function:** `getPendingFulfillments()` in `app/services/shopify/orders.ts`

**Status:** ⚠️ NEEDS FIX - Invalid structure (incorrect edges usage)

**Current Query:**
```graphql
query($first:Int!, $after:String) {
  orders(first:$first, after:$after, sortKey:CREATED_AT, reverse:true) {
    pageInfo { hasNextPage endCursor }
    edges { node {
      id name displayFulfillmentStatus
      fulfillments(first: 5) { 
        edges { node {  # ❌ INVALID - Fulfillment not a connection
          id status 
          trackingInfo { number url }
          events(first:10){ edges{ node { id status createdAt } } }
        } }
      }
    } }
  }
}
```

**Required Fix:** Remove `edges/node` wrapper on `fulfillments` and `trackingInfo`

**Corrected Pattern:**
```graphql
fulfillments(first: 5) {  # Returns [Fulfillment!]!
  id
  status
  trackingInfo {  # Returns [FulfillmentTrackingInfo!]!
    company
    number
    url
  }
  events(first: 10) {  # This IS a connection
    edges {
      node {
        id
        status
        createdAt
      }
    }
  }
}
```

---

#### 1.3 Inventory Query
**Purpose:** Fetch low-stock product variants  
**File:** `app/services/shopify/inventory.ts` lines 14-48  
**Function:** `getInventoryAlerts()`

**Status:** ⚠️ NEEDS FIX - Deprecated field access + missing required argument

**Current Query:**
```graphql
query InventoryHeatmap($first: Int!, $query: String!) {
  productVariants(first: $first, query: $query) {
    edges {
      node {
        id
        title
        sku
        inventoryQuantity
        product {
          id
          title
        }
        inventoryItem {
          id
          inventoryLevels(first: 5) {
            edges {
              node {
                id
                location {
                  id
                  name
                }
                quantities {  # ❌ Missing required 'names' argument
                  availableQuantity  # ❌ Field doesn't exist
                }
              }
            }
          }
        }
      }
    }
  }
}
```

**Required Fix:**
```graphql
quantities(names: ["available"]) {  # ✅ Required argument
  name
  quantity  # ✅ Correct field
}
```

**Query Variables:**
- `first`: Max variants (default: 50, from `SHOPIFY_INVENTORY_LIMIT`)
- `query`: Inventory filter (e.g., `inventory_quantity:<10`)

**Available Quantity Names:**
- `available` - Can be sold
- `on_hand` - Physically present
- `committed` - Allocated to orders
- `reserved` - Held aside
- `damaged` - Unsellable
- `safety_stock` - Buffer stock
- `quality_control` - In inspection
- `incoming` - On the way

---

#### 1.4 Variant Cost Update Mutation
**Purpose:** Update product variant cost  
**File:** `packages/integrations/shopify.ts` lines 14-20

**Status:** ❌ BROKEN - Mutation removed from API

**Current Mutation:**
```graphql
mutation($id: ID!, $cost: MoneyInput!) {
  productVariantUpdate(input:{id:$id, inventoryItem:{cost:$cost}}) {  # ❌ REMOVED
    productVariant { id title inventoryItem { unitCost { amount currencyCode } } }
    userErrors { field message }
  }
}
```

**Required Replacement - Use `productSet`:**
```graphql
mutation UpdateVariantCost($productId: ID!, $variantId: ID!, $cost: String!) {
  productSet(
    synchronous: true
    input: {
      variants: [{
        id: $variantId
        inventoryItem: { cost: $cost }
      }]
    }
    identifier: { id: $productId }
  ) {
    product { id }
    productVariants {
      id
      title
      inventoryItem {
        unitCost {
          amount
          currencyCode
        }
      }
    }
    userErrors { field message }
  }
}
```

**Breaking Change:**
- Now requires both `productId` AND `variantId`
- Cost is string, not MoneyInput object
- Response structure changed (includes product)

---

### Shopify API Best Practices

**1. Always Validate Queries with MCP:**
```typescript
// Before using any Shopify query
await mcp_shopify_validate_graphql_codeblocks({
  conversationId: "...",
  api: "admin",
  codeblocks: [myQuery]
});
```

**2. Handle Rate Limiting:**
```typescript
// Implemented in client.ts (lines 30-59)
- Max retries: 2
- Base delay: 500ms
- Exponential backoff with 10% jitter
- Retry on: 429 (rate limit) or 5xx (server errors)
```

**3. Error Handling:**
```typescript
if (!response.ok) {
  throw new ServiceError(`Shopify query failed with ${response.status}`, {
    scope: "shopify.orders",
    code: `${response.status}`,
    retryable: response.status >= 500
  });
}

if (payload.errors?.length) {
  throw new ServiceError(payload.errors.map(e => e.message).join("; "), {
    scope: "shopify.orders",
    code: "GRAPHQL_ERROR"
  });
}
```

**4. Caching Strategy:**
```typescript
// From app/services/shopify/cache.ts
- TTL: 60 seconds (configurable)
- Cache key: `shopify:{operation}:{shopDomain}:{params}`
- Storage: In-memory Map (per Node process)
```

---

## 2. Chatwoot API

### API Configuration
- **Base URL:** `https://hotdash-chatwoot.fly.dev` (staging)
- **API Version:** v1
- **Authentication:** API Access Token (Bearer)
- **Protocol:** REST JSON
- **Documentation:** https://www.chatwoot.com/developers/api

### Authentication
```typescript
// From packages/integrations/chatwoot.ts
headers: {
  'api_access_token': config.apiToken,
  'Content-Type': 'application/json'
}
```

### Implemented Endpoints

#### 2.1 List Conversations
**Purpose:** Fetch unassigned conversations for escalation review  
**File:** `app/services/chatwoot/escalations.ts` lines 145-165  
**Function:** `getEscalationConversations()`

**Endpoint:**
```
GET /api/v1/accounts/{accountId}/conversations
```

**Query Parameters:**
- `status`: Filter by status (e.g., "open", "pending")
- `assignee_type`: Filter by assignee (e.g., "unassigned")
- `page`: Pagination (starts at 1)

**Request Example:**
```typescript
const url = `${baseUrl}/api/v1/accounts/${accountId}/conversations?status=open&assignee_type=unassigned&page=${page}`;
const response = await fetch(url, {
  headers: {
    'api_access_token': apiToken,
    'Content-Type': 'application/json'
  }
});
```

**Response Shape:**
```typescript
interface ConversationsResponse {
  data: {
    meta: {
      all_count: number;
      unassigned_count: number;
    };
    payload: Array<{
      id: number;
      messages: Array<{
        id: number;
        content: string;
        created_at: number;  // Unix timestamp
        message_type: 0 | 1 | 2;  // 0=incoming, 1=outgoing, 2=activity
        sender: {
          name: string;
          email?: string;
        };
      }>;
      meta: {
        sender: {
          name: string;
          email?: string;
        };
      };
      custom_attributes: {
        sla_breach_at?: string;
      };
    }>;
  };
}
```

#### 2.2 Get Conversation Messages
**Purpose:** Fetch message history for a conversation  
**Endpoint:**
```
GET /api/v1/accounts/{accountId}/conversations/{conversationId}/messages
```

**Implementation:** Embedded in conversations list response (messages array)

---

### Chatwoot Best Practices

**1. SLA Breach Detection:**
```typescript
// From escalations.ts
const SLA_MINUTES = Number(process.env.CX_SLA_MINUTES ?? 60);

function isSlaBreached(timestamp: number, slaMinutes: number) {
  const ageMs = Date.now() - timestamp * 1000;
  return ageMs > slaMinutes * 60 * 1000;
}
```

**2. Conversation Categorization:**
```typescript
// Keyword-based classification
const SHIPPING_KEYWORDS = ["ship", "shipping", "delivery", "tracking"...];
const REFUND_KEYWORDS = ["refund", "return", "damage", "replacement"...];

function pickTemplate(tags: string[], messages: ConversationMessage[]) {
  // Match against keywords to select appropriate response template
}
```

**3. Template Selection:**
```typescript
// From chatwoot/templates.ts
export const CHATWOOT_TEMPLATES: Record<string, ReplyTemplate> = {
  shipping: {
    subject: "tracking",
    suggestion: "Hi {customerName}, I can help you track your order..."
  },
  refund: {
    subject: "refund",
    suggestion: "Hi {customerName}, I understand you'd like a refund..."
  }
};
```

**4. Caching:**
```typescript
// Cache conversations for 60 seconds
const CACHE_TTL_MS = Number(process.env.CHATWOOT_CACHE_TTL_MS ?? 60_000);
const CACHE_KEY = `chatwoot:escalations:${accountId}`;
```

**5. Pagination:**
```typescript
const MAX_PAGES = Number(process.env.CHATWOOT_MAX_PAGES ?? 2);
// Fetches multiple pages to get complete conversation list
```

---

## 3. Google Analytics Data API

### API Configuration
- **Library:** `@google-analytics/data` v4.12.1
- **Client:** `BetaAnalyticsDataClient`
- **Authentication:** Service Account JSON
- **Credentials:** `vault/occ/google/analytics-service-account.json`
- **Project ID:** hotrodan-seo-reports
- **Property ID:** From `GA_PROPERTY_ID` env var
- **Documentation:** https://developers.google.com/analytics/devguides/reporting/data/v1

### Authentication Setup
```typescript
// From app/services/ga/directClient.ts
import { BetaAnalyticsDataClient } from '@google-analytics/data';

// Set environment variable
process.env.GOOGLE_APPLICATION_CREDENTIALS = '/path/to/analytics-service-account.json';

// Client auto-loads credentials
const client = new BetaAnalyticsDataClient();
```

### Implemented Methods

#### 3.1 Run Report - Landing Page Sessions
**Purpose:** Fetch session counts by landing page  
**File:** `app/services/ga/directClient.ts` lines 34-93  
**Function:** `fetchLandingPageSessions()`

**Request:**
```typescript
const [response] = await client.runReport({
  property: `properties/${propertyId}`,
  dateRanges: [{
    startDate: '2025-10-01',  // YYYY-MM-DD format
    endDate: '2025-10-11'
  }],
  dimensions: [{ name: 'pagePath' }],  // Landing page
  metrics: [{ name: 'sessions' }],      // Session count
  orderBys: [{
    metric: { metricName: 'sessions' },
    desc: true
  }],
  limit: 100  // Top 100 pages
});
```

**Response Transformation:**
```typescript
const sessions: GaSession[] = (response.rows || []).map((row) => ({
  landingPage: row.dimensionValues?.[0]?.value || '',
  sessions: parseInt(row.metricValues?.[0]?.value || '0', 10),
  wowDelta: 0,  // Calculated separately
  evidenceUrl: undefined
}));
```

### Available Dimensions & Metrics

**Common Dimensions:**
- `pagePath` - URL path
- `pageTitle` - Page title
- `country` - User country
- `city` - User city
- `deviceCategory` - Desktop/Mobile/Tablet
- `browser` - Browser name
- `operatingSystem` - OS name

**Common Metrics:**
- `sessions` - Session count
- `totalUsers` - Unique users
- `screenPageViews` - Page views
- `conversions` - Goal completions
- `averageSessionDuration` - Avg session length

**Full List:** https://developers.google.com/analytics/devguides/reporting/data/v1/api-schema

---

### Google Analytics Best Practices

**1. Error Handling:**
```typescript
try {
  const [response] = await client.runReport({...});
} catch (error: any) {
  throw new Error(
    `Google Analytics API request failed: ${error.message}. ` +
    `Property ID: ${propertyId}, Date range: ${range.start} to ${range.end}`
  );
}
```

**2. Date Format:**
```typescript
// Use YYYY-MM-DD format
const startDate = '2025-10-01';
const endDate = '2025-10-11';

// Or relative dates
const startDate = '7daysAgo';
const endDate = 'today';
```

**3. Quota Management:**
- Core Reporting API: 400 requests/day/project (free tier)
- Concurrent requests: 10 per project
- Tokens per request: 1-10 depending on complexity

**4. Property ID Format:**
```typescript
// In API calls, prepend 'properties/'
property: `properties/${propertyId}`

// Property ID is numeric (e.g., '123456789')
// NOT the GA4 measurement ID (G-XXXXXXXXXX)
```

---

## 4. OpenAI API

### API Configuration
- **Library:** `openai` v6.3.0
- **Authentication:** API Key (Bearer token)
- **Credentials:** `vault/occ/openai/api_key_staging.env`
- **Documentation:** https://platform.openai.com/docs/api-reference

### Usage in HotDash
**Primary Use:** AI inference for decision suggestions and embeddings  
**Implementation:** `packages/ai/` and `scripts/ai/`  
**Scope:** Out of scope for this integrations reference (see AI agent docs)

**Integration Pattern:**
```typescript
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const completion = await client.chat.completions.create({
  model: 'gpt-4',
  messages: [...]
});
```

---

## API Rate Limiting Summary

| API | Rate Limit | Retry Strategy | Backoff |
|-----|------------|----------------|---------|
| Shopify Admin | 2 req/sec (bucket) | 2 retries | Exponential + jitter |
| Chatwoot | Unknown | None (yet) | None |
| Google Analytics | 10 concurrent | None (yet) | None |
| OpenAI | Tier-based | Built-in (SDK) | Exponential |

**Recommendations:**
1. Add retry logic to Chatwoot client
2. Add retry logic to GA client
3. Document rate limits in client code
4. Monitor rate limit errors in logs

---

## Error Handling Patterns

### ServiceError Class
```typescript
// From app/services/types.ts
class ServiceError extends Error {
  constructor(message: string, details: {
    scope: string;
    code: string;
    retryable?: boolean;
  });
}
```

**Usage:**
```typescript
if (!response.ok) {
  throw new ServiceError(`API call failed with ${response.status}`, {
    scope: "shopify.orders",
    code: `${response.status}`,
    retryable: response.status >= 500
  });
}
```

**Benefits:**
- Structured error logging
- Retry decision support
- Scope tracking for debugging

---

## API Call Monitoring

### Dashboard Facts Recording
All API calls record telemetry via `recordDashboardFact`:

```typescript
const fact = await recordDashboardFact({
  shopDomain,
  factType: "shopify.sales.summary",
  scope: "ops",
  value: toInputJson(summary),
  metadata: toInputJson({
    orderCount: edges.length,
    windowDays: SALES_WINDOW_DAYS,
    generatedAt: summary.generatedAt
  })
});
```

**Stored In:** Supabase `dashboard_facts` table  
**Purpose:** Audit trail, analytics, debugging

---

## Integration Testing Considerations

### Mocking Strategies

**Shopify Admin API:**
```typescript
// Use test fixtures
import ordersFixture from '../../../tests/fixtures/shopify/orders.json';

// Mock admin.graphql
const mockAdmin = {
  graphql: jest.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(ordersFixture)
  })
};
```

**Chatwoot API:**
```typescript
// Mock fetch responses
global.fetch = jest.fn().mockResolvedValue({
  ok: true,
  json: () => Promise.resolve(conversationsFixture)
});
```

**Google Analytics:**
```typescript
// Mock BetaAnalyticsDataClient
jest.mock('@google-analytics/data', () => ({
  BetaAnalyticsDataClient: jest.fn().mockImplementation(() => ({
    runReport: jest.fn().mockResolvedValue([mockResponse])
  }))
}));
```

---

## API Contract Compliance

### Shopify Admin API
- **Version Strategy:** Use latest stable (2024-10/2025-10)
- **Validation Required:** All queries must pass Shopify MCP validation
- **Breaking Changes:** Monitor Shopify API changelog
- **Update Frequency:** Monthly (Shopify releases)

### Chatwoot API
- **Version:** v1 (stable)
- **Breaking Changes:** Rare (monitor Chatwoot releases)
- **Update Frequency:** Quarterly checks

### Google Analytics Data API
- **Version:** v1beta (stable)
- **Breaking Changes:** Announced 6 months in advance
- **Update Frequency:** Annual review

---

## Security Considerations

### API Key Storage
✅ **Correct:**
- Store in `vault/occ/{service}/`
- Load via `source` command
- Never commit to git

❌ **Incorrect:**
- Hardcoded in source files
- Stored in `.env` files committed to git
- Passed via command-line arguments (visible in `ps`)

### API Key Rotation
**Process:**
1. Generate new key in service dashboard
2. Test new key in staging
3. Store in vault (keep old as `.old` backup)
4. Mirror to GitHub/Fly
5. Verify smoke tests pass
6. Remove old key after 7 days

**Schedule:** Per `docs/ops/credential_index.md`

---

## Deprecation Watch List

### Recently Deprecated (2024)
- ❌ Shopify: `Order.financialStatus` → use `displayFinancialStatus`
- ❌ Shopify: `productVariantUpdate` → use `productSet` or `productVariantsBulkUpdate`
- ❌ Shopify: Inventory `availableQuantity` → use `quantities(names: ["available"])`

### At Risk (Monitor)
- ⚠️ Shopify: `inventoryQuantity` on ProductVariant (may deprecate, use `inventoryItem.inventoryLevels`)
- ⚠️ Any Shopify REST API endpoints (GraphQL preferred)

---

## Contact & Escalation

**For API Issues:**
- Shopify: Tag @integrations + @engineer
- Chatwoot: Tag @integrations + @support
- Google Analytics: Tag @integrations + @data
- API Changes: Tag @integrations for review

**Evidence Requirements:**
- API request/response examples
- Error messages
- Timestamps
- Environment (staging/production)

---

**Documentation Created:** 2025-10-11 21:28 UTC  
**Next Review:** When APIs change or new integrations added  
**Maintained By:** Integrations agent

