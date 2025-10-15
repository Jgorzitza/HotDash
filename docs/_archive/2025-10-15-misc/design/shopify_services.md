---
epoch: 2025.10.E1
doc: docs/design/shopify_services.md
owner: manager
last_reviewed: 2025-10-04
doc_hash: TBD
expires: 2025-10-18
---
# Technical Design — Shopify Data Services

## Problem
Operators need a trustworthy, single source of truth for sales velocity, fulfillment status, and inventory health. Current template code only demonstrates demo mutations and lacks production-ready data access. We must build hardened services that ingest Shopify Admin GraphQL data, cache responsibly, and expose typed interfaces to dashboard tiles.

## Scope
- Orders, fulfillment, and payment status for Sales Pulse tile.
- Inventory levels, velocity, and variants metadata for Inventory Heatmap tile.
- Shared utilities for API pagination, rate limiting, and retry logic.
- Data normalization into Prisma tables (`dashboard_facts`, `decisions`) and in-memory caches.

## Architecture
- Directory: `app/services/shopify/`
  - `client.ts`: wraps `authenticate.admin` to produce a typed GraphQL client with retry/backoff.
  - `orders.ts`: functions `fetchRecentOrders`, `summarizeRevenue`, `findPendingFulfillments` using `ORDER_FULFILLMENTS_QUERY` (see `packages/integrations/shopify.ts`).
  - `inventory.ts`: functions `fetchLowStockVariants`, `calculateVelocity`, `recommendReorder` using inventory queries (new GraphQL snippet TBD).
  - `cache.ts`: simple in-memory cache with TTL + key builder per shop/session. Future: swap to KV store.
- Prisma models
  - `DashboardFact`: stores normalized metrics (`type`, `scope`, `value`, `metadata`, `shop_domain`, timestamps).
  - `DecisionLog`: mirrored to support audit trail (shared with approvals flow).
- Loader pattern
  - Dashboard route loader invokes services.
  - Services read/write `DashboardFact` when fresh data computed, include `refreshedAt` field.

## Data Contracts
- Expose TypeScript interfaces in `app/services/shopify/types.ts`:
  - `OrderSummary { shopDomain; totalRevenue; revenueTarget; topSkus: SkuMetric[]; pendingFulfillment: FulfillmentIssue[]; generatedAt }`
  - `InventoryAlert { sku; productId; variantId; quantityAvailable; daysOfCover; recommendation; generatedAt }`
- Service functions return `{ data, evidence }` where `evidence` is array of persisted fact IDs or URLs for audits.

## Caching & Rate Limits
- Default TTL: 5 minutes per shop; override via env `SHOPIFY_CACHE_TTL_MS`.
- Implement exponential backoff on 429 responses (initial 500ms, cap 5s).
- Use GraphQL `pageInfo.endCursor` to batch; fetch max 50 orders per call.

## Error Handling
- All services throw `ServiceError` with `{ scope, code, message, retryable }`.
- Dashboard loader catches, surfaces toast + fallback tile state (“data currently unavailable”).
- Log errors via `pino` logger (new utility) with context (shop, query, variables sans secrets).

## Testing Strategy
- Vitest unit tests for each service, using MSW to mock GraphQL responses, verifying pagination, caching, and error handling.
- Contract tests verifying Prisma persistence by running against SQLite test db via Prisma test utils.
- Playwright smoke: stub API to deliver deterministic data, assert tile renders metrics + refresh timestamp.

## Open Questions
- Need final GraphQL query for inventory velocity (likely `inventoryItems` + `inventoryLevels`).
- Confirm if we should store raw Shopify IDs in Prisma or use shop/sku composite keys.

## Deliverables
1. Service modules (`client.ts`, `orders.ts`, `inventory.ts`, `types.ts`, `cache.ts`).
2. Unit test suite under `app/services/shopify/__tests__`.
3. Prisma migration adding `DashboardFact` and `DecisionLog` models.
4. Evidence: Vitest run, Prisma migrate output, Playwright screenshot/log.
