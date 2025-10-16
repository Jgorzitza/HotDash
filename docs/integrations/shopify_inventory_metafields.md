# Shopify Inventory Metafields Integration

**Version:** 2.0  
**Date:** 2025-10-16  
**Status:** Active  
**Owner:** Inventory Agent  

## Overview

This document specifies the Shopify metafields integration for inventory management, including field definitions, sync patterns, and fallback strategies.

## Metafield Namespace

**Namespace:** `app.inventory`

All inventory-related metafields use this namespace to avoid conflicts with other apps.

## Metafield Definitions

### 1. lead_time_days

**Key:** `app.inventory.lead_time_days`  
**Type:** `number_integer`  
**Description:** Number of days from order placement to receipt  
**Default:** 14 days  
**Range:** 1-365 days  

**Usage:**
```graphql
leadTime: metafield(namespace: "app.inventory", key: "lead_time_days") {
  value
}
```

**Example:** `21` (21 days lead time)

### 2. safety_stock

**Key:** `app.inventory.safety_stock`  
**Type:** `number_integer`  
**Description:** Minimum buffer inventory units  
**Default:** Calculated from average daily sales × safety factor  
**Range:** 0-10000 units  

**Usage:**
```graphql
safetyStock: metafield(namespace: "app.inventory", key: "safety_stock") {
  value
}
```

**Example:** `50` (50 units safety stock)

### 3. is_bundle

**Key:** `app.inventory.is_bundle`  
**Type:** `boolean`  
**Description:** Indicates if product is a bundle/kit  
**Default:** `false`  
**Fallback:** Check for `BUNDLE:TRUE` or `BUNDLE` tag  

**Usage:**
```graphql
isBundle: metafield(namespace: "app.inventory", key: "is_bundle") {
  value
}
```

**Example:** `true`

### 4. pack_count

**Key:** `app.inventory.pack_count`  
**Type:** `number_integer`  
**Description:** Number of pieces per unit (for picker payouts)  
**Default:** 1  
**Range:** 1-1000  
**Fallback:** Check for `PACK:X` tag  

**Usage:**
```graphql
packCount: metafield(namespace: "app.inventory", key: "pack_count") {
  value
}
```

**Example:** `8` (8-pack bundle)

### 5. reorder_point_override

**Key:** `app.inventory.reorder_point_override`  
**Type:** `number_integer`  
**Description:** Manual override for calculated ROP  
**Default:** null (use calculated ROP)  
**Range:** 0-100000 units  

**Usage:**
```graphql
ropOverride: metafield(namespace: "app.inventory", key: "reorder_point_override") {
  value
}
```

**Example:** `100` (override ROP to 100 units)

### 6. vendor_sku

**Key:** `app.inventory.vendor_sku`  
**Type:** `single_line_text_field`  
**Description:** Vendor's SKU for this product  
**Default:** null  
**Max Length:** 255 characters  

**Usage:**
```graphql
vendorSku: metafield(namespace: "app.inventory", key: "vendor_sku") {
  value
}
```

**Example:** `"ACME-12345"`

### 7. min_order_quantity

**Key:** `app.inventory.min_order_quantity`  
**Type:** `number_integer`  
**Description:** Minimum order quantity for this product  
**Default:** 1  
**Range:** 1-10000 units  

**Usage:**
```graphql
minOrderQty: metafield(namespace: "app.inventory", key: "min_order_quantity") {
  value
}
```

**Example:** `12` (must order in multiples of 12)

## GraphQL Query

### Complete Query

```graphql
query GetProductInventoryMetafields($first: Int!, $after: String) {
  products(first: $first, after: $after) {
    pageInfo {
      hasNextPage
      endCursor
    }
    edges {
      node {
        id
        title
        tags
        leadTime: metafield(namespace: "app.inventory", key: "lead_time_days") {
          value
        }
        safetyStock: metafield(namespace: "app.inventory", key: "safety_stock") {
          value
        }
        isBundle: metafield(namespace: "app.inventory", key: "is_bundle") {
          value
        }
        packCount: metafield(namespace: "app.inventory", key: "pack_count") {
          value
        }
        ropOverride: metafield(namespace: "app.inventory", key: "reorder_point_override") {
          value
        }
        vendorSku: metafield(namespace: "app.inventory", key: "vendor_sku") {
          value
        }
        minOrderQty: metafield(namespace: "app.inventory", key: "min_order_quantity") {
          value
        }
        variants(first: 1) {
          edges {
            node {
              id
              sku
            }
          }
        }
      }
    }
  }
}
```

### Variables

```json
{
  "first": 50,
  "after": null
}
```

## Tag-Based Fallback

When metafields are not set, the system falls back to Shopify tags:

### Bundle Detection

**Metafield:** `app.inventory.is_bundle`  
**Fallback Tags:**
- `BUNDLE:TRUE`
- `BUNDLE`

**Logic:** Case-insensitive match

### Pack Count

**Metafield:** `app.inventory.pack_count`  
**Fallback Tag:** `PACK:X` (where X is a number)

**Examples:**
- `PACK:8` → pack count = 8
- `PACK:12` → pack count = 12
- `pack:6` → pack count = 6 (case-insensitive)

**Parsing:**
```typescript
const packTag = tags.find(tag => tag.toUpperCase().startsWith('PACK:'));
const packCount = packTag ? parseInt(packTag.split(':')[1], 10) : 1;
```

## Sync Patterns

### Full Sync

**Frequency:** Daily (overnight)  
**Process:**
1. Fetch all products with metafields (paginated)
2. Parse and validate metafield values
3. Upsert to Supabase inventory tables
4. Record sync summary to dashboard facts

**Rate Limiting:**
- 50 products per request
- 500ms delay between requests
- Max 1000 products per sync run

### Incremental Sync

**Frequency:** Hourly  
**Process:**
1. Fetch products updated since last sync
2. Parse and validate metafield values
3. Upsert changed products only
4. Record sync summary

**Webhook Trigger:** `products/update`

### On-Demand Sync

**Trigger:** User action or API call  
**Process:**
1. Fetch specific product by ID
2. Parse and validate metafields
3. Update Supabase immediately
4. Return sync result

## Validation Rules

### lead_time_days
- Must be integer
- Range: 1-365
- Default: 14 if invalid

### safety_stock
- Must be non-negative integer
- Range: 0-10000
- Default: calculated if invalid

### is_bundle
- Must be boolean string ("true" or "false")
- Default: false if invalid

### pack_count
- Must be positive integer
- Range: 1-1000
- Default: 1 if invalid

### reorder_point_override
- Must be non-negative integer
- Range: 0-100000
- Default: null (use calculated) if invalid

### vendor_sku
- Must be string
- Max length: 255 characters
- Default: null if invalid

### min_order_quantity
- Must be positive integer
- Range: 1-10000
- Default: 1 if invalid

## Error Handling

### Missing Metafields
- Use fallback tags if available
- Use system defaults if no tags
- Log warning in sync summary

### Invalid Values
- Parse and validate all values
- Use defaults for invalid values
- Log error in sync summary
- Continue processing other products

### API Errors
- Retry with exponential backoff (3 attempts)
- Log error details
- Skip product and continue
- Report in sync summary

### Rate Limit Errors
- Respect Shopify rate limits
- Implement 500ms delay between requests
- Use GraphQL cost analysis
- Reduce batch size if needed

## Sync Summary

After each sync, record summary to dashboard facts:

```typescript
{
  factType: 'inventory.metafields.synced',
  scope: 'ops',
  value: {
    totalProducts: 150,
    synced: 148,
    errors: 2,
    duration: 45000, // ms
  },
  metadata: {
    syncedAt: '2025-10-16T12:00:00Z',
    totalProducts: 150,
  }
}
```

## Implementation

### Service Location
`app/services/inventory/metafields-sync.ts`

### Key Functions

1. **fetchProductMetafields()** - Fetch single page
2. **fetchAllProductMetafields()** - Fetch all with pagination
3. **syncMetafieldsToSupabase()** - Sync to database
4. **performFullSync()** - Complete sync workflow

### Usage Example

```typescript
import { performFullSync } from '~/services/inventory/metafields-sync';

const result = await performFullSync(context);
console.log(`Synced ${result.synced}/${result.totalProducts} products`);
```

## Testing

### Test Cases

1. **Valid metafields** - All fields present and valid
2. **Missing metafields** - Fallback to tags
3. **Invalid values** - Use defaults
4. **Tag fallback** - BUNDLE:TRUE, PACK:8
5. **Pagination** - Multiple pages of products
6. **Rate limiting** - Respect delays
7. **Error handling** - API errors, invalid data

### Test Fixtures

Located in: `tests/fixtures/shopify/inventory-metafields.json`

## Monitoring

### Metrics to Track

- Sync duration
- Products synced per run
- Error rate
- Metafield coverage (% products with metafields)
- Tag fallback rate

### Alerts

- Sync duration > 2 minutes
- Error rate > 5%
- Sync failure (no products synced)

## See Also

- `docs/specs/inventory_data_model.md` - Data model specification
- `app/services/inventory/metafields-sync.ts` - Implementation
- Shopify Metafields API: https://shopify.dev/docs/api/admin-graphql/latest/objects/Metafield

