# Shopify Inventory Sync Guide

**Version**: 1.0  
**Last Updated**: 2025-10-21  
**Owner**: Integrations Agent

---

## Overview

This guide documents the Shopify inventory synchronization system that fetches inventory levels from Shopify and stores them in the local dashboard for real-time inventory monitoring.

### Purpose

- Sync inventory levels from Shopify to local database
- Enable real-time inventory dashboards
- Track inventory across multiple locations
- Support inventory management workflows

---

## Architecture

```
┌──────────────┐
│   Shopify    │
│  GraphQL API │
└──────┬───────┘
       │
       │ GraphQL Query
       │
       ▼
┌──────────────┐
│Inventory Sync│
│   Service    │
└──────┬───────┘
       │
       │ Parse & Store
       │
       ▼
┌──────────────┐     ┌──────────────┐
│dashboard_fact│────▶│  Dashboard   │
│   Table      │     │    Tiles     │
└──────────────┘     └──────────────┘
```

---

## GraphQL Query

### Inventory Levels Query

**File**: `app/services/shopify/inventory-sync.ts`

**Query**:

```graphql
query GetInventoryLevels($first: Int!) {
  productVariants(first: $first) {
    edges {
      node {
        id
        sku
        title
        inventoryQuantity
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
                quantities(
                  names: ["available", "on_hand", "committed", "reserved"]
                ) {
                  name
                  quantity
                }
              }
            }
          }
        }
        product {
          id
          title
        }
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
```

**Validation**: ✅ Validated with Shopify GraphQL schema

**Required Scopes**:

- `read_products`
- `read_inventory`
- `read_locations`
- `read_markets_home`

---

## Data Model

### InventoryLevelData

```typescript
interface InventoryLevelData {
  variantId: string; // Shopify variant GID
  sku: string | null; // SKU (if set)
  productTitle: string; // Product name
  variantTitle: string; // Variant name
  locationId: string; // Location GID
  locationName: string; // Location display name
  available: number; // Available for sale
  onHand: number; // Physical inventory
  committed: number; // Committed to orders
  reserved: number; // Reserved inventory
}
```

### Inventory States

| State               | Description                                 |
| ------------------- | ------------------------------------------- |
| **available**       | Inventory available for sale                |
| **on_hand**         | Total physical inventory at location        |
| **committed**       | Inventory committed to orders               |
| **reserved**        | Inventory reserved (holds, QC)              |
| **incoming**        | Inventory in transit (not included in sync) |
| **damaged**         | Damaged goods (not included in sync)        |
| **safety_stock**    | Safety stock buffer (not included in sync)  |
| **quality_control** | Items in QC (not included in sync)          |

---

## Implementation

### Sync Service

**File**: `app/services/shopify/inventory-sync.ts`

**Function**: `syncInventoryFromShopify(adminGraphqlClient)`

**Usage**:

```typescript
import { syncInventoryFromShopify } from "~/services/shopify/inventory-sync";

// In a loader or action
const { admin } = await shopify.authenticate.admin(request);

const result = await syncInventoryFromShopify(admin.graphql);

if (result.success) {
  console.log(`Processed ${result.itemsProcessed} items`);
  console.log(`Stored ${result.itemsStored} records`);
} else {
  console.error("Sync failed:", result.error);
}
```

**Parameters**:

- `adminGraphqlClient`: Authenticated Shopify GraphQL client

**Returns**:

```typescript
interface InventorySyncResult {
  success: boolean;
  itemsProcessed: number;
  itemsStored: number;
  error?: string;
}
```

### API Route

**File**: `app/routes/api.inventory.sync.ts`

**Endpoint**: `POST /api/inventory/sync`

**Request**:

```bash
POST /api/inventory/sync
Content-Type: application/json
```

**Response**:

```json
{
  "success": true,
  "itemsProcessed": 150,
  "itemsStored": 150
}
```

**Usage Example**:

```typescript
// Trigger manual sync
const response = await fetch("/api/inventory/sync", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
});

const result = await response.json();
console.log("Sync result:", result);
```

---

## Webhooks

### Inventory Level Update Webhook

**Topic**: `INVENTORY_LEVELS_UPDATE`

**File**: `app/routes/api.webhooks.shopify.inventory.ts`

**Endpoint**: `POST /api/webhooks/shopify/inventory`

**Payload**:

```json
{
  "inventory_item_id": 808950810,
  "location_id": 655441491,
  "available": 42,
  "updated_at": "2025-10-21T10:00:00Z"
}
```

**Setup in Shopify**:

1. Navigate to Settings → Notifications → Webhooks
2. Create webhook
3. Topic: `Inventory levels update`
4. URL: `https://your-app.fly.dev/api/webhooks/shopify/inventory`
5. Format: JSON

**Authentication**: Automatic via Shopify webhook verification

---

## Database Integration

### Storage (TODO: Data Agent)

**Table**: `dashboard_fact`

**Schema**:

```sql
CREATE TABLE dashboard_fact (
  id UUID PRIMARY KEY,
  fact_type VARCHAR(50), -- 'inventory_level'
  variant_id VARCHAR(255),
  location_id VARCHAR(255),
  metrics JSONB, -- {available, on_hand, committed, reserved}
  updated_at TIMESTAMP,
  UNIQUE(variant_id, location_id)
);
```

**Insert/Update**:

```typescript
await supabase.from("dashboard_fact").upsert(
  {
    fact_type: "inventory_level",
    variant_id: "gid://shopify/ProductVariant/123",
    location_id: "gid://shopify/Location/456",
    metrics: {
      available: 42,
      on_hand: 50,
      committed: 8,
      reserved: 0,
    },
    updated_at: new Date().toISOString(),
  },
  {
    onConflict: "variant_id,location_id",
  },
);
```

---

## Response Parsing

### Parse GraphQL Response

**Function**: `parseInventoryResponse(response)`

**Input**: Shopify GraphQL API response

**Output**: Array of `InventoryLevelData`

**Example**:

```typescript
import { parseInventoryResponse } from "~/services/shopify/inventory-sync";

const response = await admin.graphql({ data: { query: QUERY } });
const json = await response.json();
const levels = parseInventoryResponse(json);

levels.forEach((level) => {
  console.log(`${level.productTitle} (${level.variantTitle})`);
  console.log(`  Location: ${level.locationName}`);
  console.log(`  Available: ${level.available}`);
  console.log(`  On Hand: ${level.onHand}`);
  console.log(`  Committed: ${level.committed}`);
});
```

---

## Pagination

The sync service automatically handles pagination:

```typescript
let hasNextPage = true;
let cursor: string | null = null;
let allLevels: InventoryLevelData[] = [];

while (hasNextPage) {
  const response = await adminGraphqlClient.query({
    data: {
      query: INVENTORY_SYNC_QUERY,
      variables: {
        first: 50,
        ...(cursor && { after: cursor }),
      },
    },
  });

  const json = await response.json();
  const levels = parseInventoryResponse(json);
  allLevels = allLevels.concat(levels);

  hasNextPage = json?.data?.productVariants?.pageInfo?.hasNextPage || false;
  cursor = json?.data?.productVariants?.pageInfo?.endCursor || null;
}
```

**Safety Limit**: Maximum 10 iterations (500 variants) per sync

---

## Scheduling

### Manual Sync

Trigger via API:

```bash
curl -X POST https://your-app.fly.dev/api/inventory/sync \
  -H "Content-Type: application/json"
```

### Scheduled Sync (TODO: DevOps)

Recommended: Cron job every 15 minutes

```typescript
// In a worker or cron job
import { syncInventoryFromShopify } from "~/services/shopify/inventory-sync";

async function scheduledInventorySync() {
  const { admin } = await getShopifyAdminClient();

  const result = await syncInventoryFromShopify(admin.graphql);

  if (!result.success) {
    console.error("Scheduled sync failed:", result.error);
    // Alert operations team
  }
}

// Run every 15 minutes
setInterval(scheduledInventorySync, 15 * 60 * 1000);
```

---

## Monitoring

### Health Checks

```typescript
import { checkShopifyHealth } from "~/services/integrations/health";

const health = await checkShopifyHealth(admin.graphql);

console.log("Shopify healthy:", health.healthy);
console.log("Latency:", health.latencyMs + "ms");
console.log("Shop:", health.details?.shop);
```

### Metrics to Track

1. **Sync Latency**: Time to complete full sync
2. **Items Processed**: Number of variants synced
3. **Error Rate**: Failed syncs / total syncs
4. **Last Sync Time**: Timestamp of last successful sync
5. **Webhook Delivery**: Webhook success rate

---

## Troubleshooting

### Issue: GraphQL errors

**Symptoms**: Sync fails with GraphQL errors

**Common Errors**:

```json
{
  "errors": [
    {
      "message": "Field 'inventoryQuantity' doesn't exist on type 'ProductVariant'",
      "locations": [{ "line": 5, "column": 9 }]
    }
  ]
}
```

**Resolution**:

1. Verify query against latest Shopify API version
2. Check required scopes are granted
3. Update GraphQL query if API changed

### Issue: Missing inventory data

**Symptoms**: Some products have no inventory levels

**Causes**:

- Product not tracked for inventory
- Location not connected to inventory item
- Product variant deleted

**Resolution**:

```typescript
const levels = parseInventoryResponse(response);

// Filter valid levels
const validLevels = levels.filter((level) => {
  return level.available !== null && level.onHand !== null;
});
```

### Issue: Slow sync performance

**Symptoms**: Sync takes > 30 seconds

**Optimization**:

1. Reduce page size: `first: 25` instead of `first: 50`
2. Limit location count in inventoryLevels query
3. Add indexes to database table
4. Use incremental sync (only changed items)

```typescript
// Incremental sync (pseudo-code)
query GetInventoryLevels($updatedAfter: DateTime!) {
  productVariants(
    first: 50,
    query: "updated_at:>=${updatedAfter}"
  ) {
    // ...
  }
}
```

---

## API Reference

### syncInventoryFromShopify

```typescript
async function syncInventoryFromShopify(
  adminGraphqlClient: any,
): Promise<InventorySyncResult>;
```

**Parameters**:

- `adminGraphqlClient`: Authenticated Shopify GraphQL client

**Returns**: `InventorySyncResult`

- `success`: boolean
- `itemsProcessed`: number of variants processed
- `itemsStored`: number of records stored
- `error`: error message if failed

**Example**:

```typescript
const result = await syncInventoryFromShopify(admin.graphql);
```

### handleInventoryWebhook

```typescript
async function handleInventoryWebhook(
  payload: InventoryLevelWebhook,
): Promise<{ success: boolean; error?: string }>;
```

**Parameters**:

- `payload`: Webhook payload from Shopify

**Payload Structure**:

```typescript
interface InventoryLevelWebhook {
  inventory_item_id: number;
  location_id: number;
  available: number;
  updated_at: string;
}
```

**Returns**: Success/error result

---

## Best Practices

### 1. Use Webhooks for Real-Time Updates

```typescript
// Good: Webhook-driven updates
app.post("/api/webhooks/shopify/inventory", async (req, res) => {
  await handleInventoryWebhook(req.body);
  res.json({ success: true });
});

// Bad: Frequent polling
setInterval(async () => {
  await syncInventoryFromShopify(admin.graphql);
}, 60000); // Every minute - too frequent
```

### 2. Handle Pagination Correctly

```typescript
// Always check hasNextPage
let hasNextPage = true;
let cursor = null;

while (hasNextPage) {
  const response = await query({ after: cursor });
  // Process batch
  hasNextPage = response.pageInfo.hasNextPage;
  cursor = response.pageInfo.endCursor;
}
```

### 3. Validate GraphQL Operations

```typescript
// MANDATORY: Validate with Shopify MCP
import { mcp_shopify_validate_graphql_codeblocks } from "~/mcp";

const validation = await mcp_shopify_validate_graphql_codeblocks({
  conversationId: "your-conversation-id",
  api: "admin",
  codeblocks: [INVENTORY_SYNC_QUERY],
});

if (validation.status !== "VALID") {
  throw new Error("Invalid GraphQL query");
}
```

### 4. Error Handling

```typescript
try {
  const result = await syncInventoryFromShopify(admin.graphql);

  if (!result.success) {
    // Log error
    console.error("Sync failed:", result.error);

    // Alert if critical
    if (result.itemsProcessed === 0) {
      await alertOps("Inventory sync completely failed");
    }
  }
} catch (error) {
  console.error("Unexpected error:", error);
  // Fallback to cached data
}
```

---

## Performance

### Sync Performance Targets

- **Full Sync**: < 30 seconds for 500 variants
- **Incremental Sync**: < 5 seconds for 50 variants
- **Webhook Processing**: < 200ms per event

### Optimization Strategies

**1. Batch Processing**

```typescript
// Process in batches of 50
const BATCH_SIZE = 50;
let offset = 0;

while (offset < totalVariants) {
  const batch = await queryInventoryBatch(offset, BATCH_SIZE);
  await storeBatch(batch);
  offset += BATCH_SIZE;
}
```

**2. Parallel Location Queries**

```typescript
// Query multiple locations in parallel
const locationIds = ["loc1", "loc2", "loc3"];

const results = await Promise.all(
  locationIds.map((id) => queryInventoryAtLocation(id)),
);
```

**3. Database Indexing**

```sql
-- Add indexes for fast lookups
CREATE INDEX idx_fact_variant ON dashboard_fact(variant_id);
CREATE INDEX idx_fact_location ON dashboard_fact(location_id);
CREATE INDEX idx_fact_updated ON dashboard_fact(updated_at);
```

---

## Inventory States Explained

### Available

Inventory ready to be sold immediately.

**Query**:

```graphql
quantities(names: ["available"]) {
  quantity
}
```

**Use Case**: Display "In Stock" / "Out of Stock" on storefront

### On Hand

Total physical inventory at location.

**Formula**: `on_hand = available + committed + reserved + damaged + safety_stock + quality_control`

**Use Case**: Warehouse management, reorder calculations

### Committed

Inventory allocated to orders but not yet fulfilled.

**Use Case**: Fulfillment planning, shipping estimates

### Reserved

Inventory temporarily set aside (holds, quality checks).

**Use Case**: Draft order reservations, quality control tracking

---

## Webhooks

### Setup

1. **In Shopify Admin**:
   - Settings → Notifications → Webhooks
   - Create webhook
   - Topic: `Inventory levels update`
   - Format: JSON
   - URL: `https://your-app.fly.dev/api/webhooks/shopify/inventory`

2. **Webhook Configuration**:
   - Authentication: Automatic (Shopify signs requests)
   - Retry: Automatic on non-200 responses
   - Timeout: 5 seconds

### Event Payload

```json
{
  "inventory_item_id": 808950810,
  "location_id": 655441491,
  "available": 42,
  "updated_at": "2025-10-21T14:53:39-04:00"
}
```

### Processing

```typescript
import { handleInventoryWebhook } from "~/services/shopify/inventory-sync";

const result = await handleInventoryWebhook(payload);

if (result.success) {
  console.log("Inventory updated");
} else {
  console.error("Update failed:", result.error);
}
```

---

## Integration with Dashboard

### Stock Risk Tile

**Data Source**: `dashboard_fact` table with `fact_type='inventory_level'`

**Query**:

```sql
SELECT
  variant_id,
  location_id,
  metrics->>'available' as available,
  metrics->>'on_hand' as on_hand
FROM dashboard_fact
WHERE fact_type = 'inventory_level'
  AND (metrics->>'available')::int < 10 -- Low stock threshold
ORDER BY (metrics->>'available')::int ASC
LIMIT 20;
```

### Inventory Tile

**Aggregations**:

```sql
-- Total inventory value
SELECT
  SUM((metrics->>'on_hand')::int * variant_cost) as total_value
FROM dashboard_fact
WHERE fact_type = 'inventory_level';

-- Low stock items
SELECT COUNT(*)
FROM dashboard_fact
WHERE fact_type = 'inventory_level'
  AND (metrics->>'available')::int < 10;
```

---

## Testing

### Manual Test

```bash
# Set up environment
export SHOPIFY_API_KEY=your-key
export SHOPIFY_API_SECRET=your-secret

# Run sync
npx tsx scripts/test-inventory-sync.ts
```

### Integration Tests

```typescript
import { describe, it, expect, vi } from "vitest";
import { parseInventoryResponse } from "~/services/shopify/inventory-sync";

describe("Inventory Sync", () => {
  it("should parse Shopify response correctly", () => {
    const mockResponse = {
      data: {
        productVariants: {
          edges: [
            {
              node: {
                id: "gid://shopify/ProductVariant/123",
                sku: "TEST-SKU",
                title: "Small",
                inventoryItem: {
                  inventoryLevels: {
                    edges: [
                      {
                        node: {
                          location: { id: "loc1", name: "Main" },
                          quantities: [
                            { name: "available", quantity: 10 },
                            { name: "on_hand", quantity: 15 },
                          ],
                        },
                      },
                    ],
                  },
                },
                product: { title: "T-Shirt" },
              },
            },
          ],
        },
      },
    };

    const levels = parseInventoryResponse(mockResponse);

    expect(levels).toHaveLength(1);
    expect(levels[0].available).toBe(10);
    expect(levels[0].onHand).toBe(15);
  });
});
```

---

## Security

### API Scopes

Required scopes in `shopify.app.toml`:

```toml
scopes = "read_products,read_inventory,read_locations"
```

### Webhook Verification

Shopify webhooks are automatically verified by the Shopify SDK:

```typescript
const { payload, topic, shop } = await shopify.authenticate.webhook(request);
// Signature already verified
```

---

## Troubleshooting

### Missing Scopes

**Error**: `"Access denied for inventoryLevel field"`

**Fix**: Add required scopes to `shopify.app.toml` and re-authenticate

### Rate Limiting

**Error**: `"Throttled"`

**Fix**: Use rate limiter

```typescript
import { getShopifyRateLimiter } from "~/lib/rate-limiter";

const limiter = getShopifyRateLimiter();

await limiter.execute(async () => {
  return await admin.graphql({ data: { query } });
});
```

---

## Migration from REST to GraphQL

### Old REST API (deprecated)

```javascript
const response = await admin.rest.resources.InventoryLevel.all({
  session: session,
  location_ids: "655441491",
});
```

### New GraphQL API

```typescript
const response = await admin.graphql({
  data: {
    query: `query { ... }`,
  },
});
```

**Benefits**:

- Type-safe with TypeScript
- Fetch only needed fields
- Better error handling
- Pagination support

---

## Support

### Documentation

- Shopify Inventory API: https://shopify.dev/docs/apps/build/orders-fulfillment/inventory-management-apps
- GraphQL Admin API: https://shopify.dev/docs/api/admin-graphql

### Contacts

- Owner: Integrations Agent
- Escalation: Manager

---

**End of Shopify Inventory Sync Guide**
