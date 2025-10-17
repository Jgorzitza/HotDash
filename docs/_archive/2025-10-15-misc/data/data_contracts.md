---
epoch: 2025.10.E1
doc: docs/data/data_contracts.md
owner: data
last_reviewed: 2025-10-05
doc_hash: TBD
expires: 2025-10-19
---

# Data Contracts — Operator Control Center

## Purpose

This document defines the expected schema and semantics for data sources feeding the Operator Control Center. It serves as a contract between upstream providers (Shopify, Chatwoot, Google Analytics) and the dashboard services, enabling early detection of breaking changes and schema drift.

---

## 1. Shopify Admin GraphQL

### Service: Orders (Sales Pulse)

**Endpoint**: `POST /admin/api/{version}/graphql.json`

**Query**: `SalesPulse`

**Required Fields**:

```graphql
orders(first: Int!, sortKey: CREATED_AT, reverse: Boolean, query: String) {
  edges {
    node {
      id: ID!
      name: String!
      createdAt: DateTime!
      displayFulfillmentStatus: String
      financialStatus: String
      currentTotalPriceSet {
        shopMoney {
          amount: Decimal!
          currencyCode: CurrencyCode!
        }
      }
      lineItems(first: Int!) {
        edges {
          node {
            sku: String
            title: String!
            quantity: Int!
            discountedTotalSet {
              shopMoney {
                amount: Decimal!
                currencyCode: CurrencyCode!
              }
            }
          }
        }
      }
    }
  }
}
```

**Assumptions**:

- `createdAt` is ISO 8601 UTC timestamp
- `currentTotalPriceSet` may be null for draft/test orders (handle gracefully)
- `displayFulfillmentStatus` enum: `FULFILLED | UNFULFILLED | PARTIAL | RESTOCKED | SCHEDULED` (as of API version 2024-10)
- `financialStatus` enum: `PENDING | AUTHORIZED | PARTIALLY_PAID | PAID | PARTIALLY_REFUNDED | REFUNDED | VOIDED` (nullable)
- SKU is nullable; fallback to `title` for aggregation

**Version Policy**:

- Currently using stable API version `2024-10`
- Monitor Shopify changelog for deprecations; migrate within one quarter
- If field removed, log to `feedback/data.md` and implement fallback logic

**Test Coverage**:

- Mock fixtures: `tests/fixtures/shopify/orders.json`
- Validation: assert required fields present and types match TypeScript interfaces

---

### Service: Inventory (Inventory Heatmap)

**Query**: `InventoryLevels`

**Required Fields**:

```graphql
productVariants(first: Int!) {
  edges {
    node {
      id: ID!
      sku: String
      title: String!
      inventoryQuantity: Int
      product {
        title: String!
      }
    }
  }
}
```

**Assumptions**:

- `inventoryQuantity`: aggregate across all locations (Shopify sums automatically)
- Negative values possible (overselling enabled); clamp to 0 for display
- `sku` may be null; fallback to `product.title + variant.title`

**Version Policy**: Same as Orders (stable `2024-10`)

---

## 2. Chatwoot REST API

### Service: Escalations (CX Escalations)

**Endpoint**: `GET /api/v1/accounts/{account_id}/conversations`

**Query Parameters**:

- `status`: `open` or `pending`
- `page`: pagination (1-indexed)

**Response Schema**:

```typescript
{
  payload: Conversation[]
}

interface Conversation {
  id: number
  inbox_id: number
  status: "open" | "pending" | "resolved" | "snoozed"
  created_at: number  // Unix timestamp (seconds)
  tags: string[]
  meta: {
    sender?: {
      name?: string
    }
  }
  contacts?: Array<{
    name?: string
  }>
}
```

**Assumptions**:

- `created_at` is Unix epoch seconds (multiply by 1000 for JS Date)
- `status` is stable enum; `open` and `pending` indicate active conversations
- `tags` array may be empty; check for `escalation` tag explicitly
- Customer name resolution: `meta.sender.name` > `contacts[0].name` > fallback "Customer"

**Breaking Change Alerts**:

- If `created_at` changes to ISO string, log schema drift immediately
- If `status` adds new values, ensure backward compatibility (default to unknown state)

**Test Coverage**:

- Mock fixtures: `tests/fixtures/chatwoot/conversations.json`
- Validate timestamp parsing and SLA breach calculation logic

---

### Service: Messages (Conversation Details)

**Endpoint**: `GET /api/v1/accounts/{account_id}/conversations/{conversation_id}/messages`

**Response Schema**:

```typescript
{
  payload: Message[]
}

interface Message {
  id: number
  content: string
  message_type: 0 | 1 | 2  // 0=incoming, 1=outgoing, 2=activity
  created_at: number  // Unix timestamp (seconds)
  sender?: {
    type: "contact" | "user"
  }
}
```

**Assumptions**:

- `message_type` mapping: `0` = customer message, `1` = agent reply, `2` = system activity
- SLA clock starts from most recent `message_type=0` (incoming customer message)
- `created_at` is Unix seconds (consistent with Conversation schema)

**Test Coverage**:

- Mock fixtures: `tests/fixtures/chatwoot/messages.json`
- Validate message sorting and last-customer-message extraction

---

## 3. Google Analytics (MCP)

### Service: Sessions (SEO & Content Watch)

**Endpoint**: `{MCP_HOST}/sessions/landing-pages` _(future implementation)_

**Current Status**: Mock mode (`GA_USE_MOCK=1`)

**Expected Request**:

```json
{
  "propertyId": "GA4_PROPERTY_ID",
  "dateRange": {
    "start": "2025-09-28", // ISO date string (YYYY-MM-DD)
    "end": "2025-10-05"
  }
}
```

**Expected Response**:

```typescript
{
  landingPages: Array<{
    landingPage: string; // e.g., "/products/shoes"
    sessions: number; // total sessions in range
    wowDelta: number; // decimal, e.g., -0.25 = 25% drop
    evidenceUrl?: string; // optional GA4 UI link
  }>;
}
```

**Assumptions**:

- `sessions` is GA4 session count (user-scoped, 30-min inactivity)
- `wowDelta` pre-calculated by MCP (current week vs. prior week)
- If MCP unavailable, mock client returns deterministic fixture
- Date range: inclusive of start and end dates

**Breaking Change Protocol**:

- Once MCP live, version the endpoint (e.g., `/v1/sessions/landing-pages`)
- If schema changes, log to `feedback/data.md` within 24h and coordinate with MCP maintainer
- Mock client updated to match production contract

**Test Coverage**:

- Mock fixtures: `app/services/ga/mockClient.ts` (inline deterministic data)
- Integration test: placeholder pending MCP availability

---

## 4. Prisma Schema (Internal Storage)

### Table: DashboardFact

**Schema** (from `prisma/schema.prisma`):

```prisma
model DashboardFact {
  id          Int      @id @default(autoincrement())
  shopDomain  String
  factType    String
  scope       String?
  value       Json
  metadata    Json?
  evidenceUrl String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([shopDomain, factType])
  @@index([createdAt])
}
```

**Fact Types** (standardized):

- `shopify.sales.summary`
- `shopify.inventory.coverage`
- `shopify.fulfillment.issues`
- `chatwoot.escalations`
- `chatwoot.sla.breaches`
- `ga.sessions.anomalies`

**Value JSON Structure** (examples):

**shopify.sales.summary**:

```json
{
  "shopDomain": "example.myshopify.com",
  "totalRevenue": 1234.56,
  "currency": "USD",
  "orderCount": 42,
  "topSkus": [
    { "sku": "SKU123", "title": "Product A", "quantity": 10, "revenue": 500 }
  ],
  "pendingFulfillment": [],
  "generatedAt": "2025-10-05T12:00:00Z"
}
```

**chatwoot.escalations**:

```json
[
  {
    "id": 123,
    "inboxId": 1,
    "status": "open",
    "customerName": "Jane Doe",
    "lastMessageAt": "2025-10-05T10:30:00Z",
    "slaBreached": true,
    "tags": ["escalation"],
    "suggestedReplyId": "template-1",
    "suggestedReply": "We're looking into this..."
  }
]
```

**ga.sessions.anomalies**:

```json
[
  {
    "landingPage": "/products/shoes",
    "sessions": 320,
    "wowDelta": -0.25,
    "isAnomaly": true
  }
]
```

**Metadata JSON Structure**:

```json
{
  "propertyId": "GA4_PROPERTY_ID",
  "range": { "start": "2025-09-28", "end": "2025-10-05" },
  "generatedAt": "2025-10-05T12:00:00Z",
  "configSnapshot": { "slaMinutes": 60 }
}
```

**Migration Policy**:

- Schema changes require Prisma migration + seed/backfill script
- Coordinate with engineer before adding columns or indexes
- Test on SQLite (dev) and Postgres (staging) before production deploy

---

## 5. Schema Drift Monitoring

### Process

1. **Weekly validation**: Data agent runs contract validation tests every Monday
2. **Automated checks**: CI pipeline runs mock response validation on every PR
3. **Manual review**: Any upstream API change flagged in Shopify/Chatwoot/GA changelogs triggers review

### Reporting

- **File**: `feedback/data.md`
- **SLA**: Report breaking changes within 24 hours of detection
- **Severity levels**:
  - **P0 (Critical)**: Required field removed or type changed → immediate escalation to manager
  - **P1 (High)**: Enum value added/deprecated → log and assess impact within 1 week
  - **P2 (Low)**: Optional field added → document for future use

### Example Drift Report (in `feedback/data.md`):

```markdown
## Schema Drift Alert — 2025-10-05

**Source**: Shopify Admin GraphQL
**Change**: `displayFulfillmentStatus` enum added new value `ON_HOLD`
**Detected**: 2025-10-05 08:00 UTC
**Impact**: Medium (new status not handled in current logic)
**Action**: Update TypeScript enum and add handling in `app/services/shopify/orders.ts:153`
**Assignee**: engineer
**Target**: 2025-10-08
```

---

## 6. Validation & Testing

### Contract Tests (Vitest)

- **Location**: `tests/unit/contracts/`
- **Coverage**:
  - Shopify: `shopify.orders.contract.test.ts`, `shopify.inventory.contract.test.ts`
  - Chatwoot: `chatwoot.conversations.contract.test.ts`
  - GA: `ga.sessions.contract.test.ts` (mocked until MCP live)

### Mock Fixtures

- **Shopify**: `tests/fixtures/shopify/` (orders, inventory, products)
- **Chatwoot**: `tests/fixtures/chatwoot/` (conversations, messages)
- **GA**: Inline in `app/services/ga/mockClient.ts` (deterministic landing page data)

### Integration Tests (Playwright)

- **Scope**: E2E dashboard rendering with mocked API responses
- **Assertions**: Verify tile displays correct KPIs and anomaly flags
- **Run cadence**: Every PR, pre-deploy

---

## References

- KPI Definitions: `docs/data/kpis.md`
- Prisma Schema: `prisma/schema.prisma`
- Service Implementations: `app/services/shopify/`, `app/services/chatwoot/`, `app/services/ga/`
- Direction: `docs/directions/data.md`
- Strategy: `docs/strategy/initial_delivery_plan.md`
