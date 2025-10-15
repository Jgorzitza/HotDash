# Shopify Inventory Metafields Integration

**Version:** 1.0  
**Date:** 2025-10-15  
**Owner:** inventory agent  
**Status:** Research Complete - Implementation Pending

---

## Overview

This document provides comprehensive research and implementation guidance for using Shopify metafields to store and manage inventory-related data for the Hot Dash control center.

**Purpose:** Enable rich inventory management by storing lead times, safety stock, bundle flags, and picker payout data directly on Shopify products.

---

## 1. Shopify Metafields Fundamentals

### What Are Metafields?

Metafields are custom fields that extend Shopify's standard data model. They allow apps to store additional information on resources like products, variants, orders, and customers.

### Key Concepts

**Identifier:**
- **Namespace:** Groups related metafields (e.g., `app.inventory`)
- **Key:** Specific field name (e.g., `lead_time_days`)
- **Combined:** `namespace.key` uniquely identifies a metafield

**Value:**
- Always stored as a **string** in the API
- Type determines validation and interpretation

**Type:**
- Enforces data validation (e.g., `number_integer`, `boolean`)
- Provides Liquid support for themes
- Cannot be changed to incompatible types without clearing data

**Definition (Optional but Recommended):**
- Creates a schema for the metafield
- Enforces type consistency across all instances
- Enables admin UI for merchant editing

### Namespace Conventions

| Namespace | Purpose | Example |
|-----------|---------|---------|
| `custom.*` | Merchant-managed fields | `custom.care_instructions` |
| `app.*` | App-specific fields | `app.inventory.lead_time_days` |
| `system.*` | Shopify internal use | Not for apps |

**Recommendation:** Use `app.inventory` namespace for all Hot Dash inventory metafields.

---

## 2. Metafield Types for Inventory

### Relevant Types

| Type | Use Case | Example Value | Storage Format |
|------|----------|---------------|----------------|
| `number_integer` | Lead time, safety stock, pack count | `21` | `"21"` (string) |
| `number_decimal` | Costs, weights, rates | `12.50` | `"12.50"` (string) |
| `boolean` | Bundle flag, active status | `true` | `"true"` (string) |
| `single_line_text_field` | SKUs, notes | `VND-12345` | `"VND-12345"` |
| `date` | Expected restock date | `2025-11-15` | `"2025-11-15"` |
| `json` | Complex structures (bundle components) | `{"components":[...]}` | JSON string |

### Type Validation

- **number_integer:** Must be a valid integer (no decimals)
- **number_decimal:** Must be a valid decimal number
- **boolean:** Must be `"true"` or `"false"` (string)
- **date:** Must be ISO 8601 format (`YYYY-MM-DD`)
- **json:** Must be valid JSON string

### Type Migration

⚠️ **Important:** Changing metafield types can invalidate existing data.

**Safe migrations:**
- `number_integer` → `number_decimal`
- `single_line_text_field` → `multi_line_text_field`

**Unsafe migrations:**
- `date_time` → `money` (incompatible)
- `number_integer` → `boolean` (incompatible)

**Action:** Clear invalid values before migration or use API to update.

---

## 3. Proposed Metafield Schema

### Core Inventory Metafields

| Key | Type | Description | Default | Required |
|-----|------|-------------|---------|----------|
| `lead_time_days` | `number_integer` | Days from PO to receipt | `14` | No |
| `safety_stock` | `number_integer` | Buffer stock quantity | Calculated | No |
| `is_bundle` | `boolean` | Product is a bundle/kit | `false` | No |
| `pack_count` | `number_integer` | Pieces per unit sold | `1` | No |
| `reorder_point_override` | `number_integer` | Manual ROP override | Calculated | No |
| `vendor_sku` | `single_line_text_field` | Vendor's SKU reference | - | No |
| `min_order_quantity` | `number_integer` | Minimum PO quantity | `1` | No |
| `expected_restock_date` | `date` | Next expected restock | - | No |

**Note:** Picker payout is calculated at the order level based on total pick quantity (1-4 pcs: $2, 5-10 pcs: $4, 11+ pcs: $7), not per-product.

### Extended Metafields (Future)

| Key | Type | Description |
|-----|------|-------------|
| `bundle_components` | `json` | Array of component SKUs and quantities |
| `cost_per_unit` | `number_decimal` | Unit cost for margin calculation |
| `storage_location` | `single_line_text_field` | Warehouse location code |
| `reorder_notes` | `multi_line_text_field` | Special instructions for reordering |

---

## 4. GraphQL Queries

### Query Product Metafields

```graphql
query GetProductInventoryMetafields($productId: ID!) {
  product(id: $productId) {
    id
    title
    tags
    
    # Query specific metafield
    leadTime: metafield(namespace: "app.inventory", key: "lead_time_days") {
      value
      type
    }
    
    safetyStock: metafield(namespace: "app.inventory", key: "safety_stock") {
      value
      type
    }
    
    isBundle: metafield(namespace: "app.inventory", key: "is_bundle") {
      value
      type
    }
    
    packCount: metafield(namespace: "app.inventory", key: "pack_count") {
      value
      type
    }
    
    # Query all metafields in namespace
    inventoryMetafields: metafields(first: 20, namespace: "app.inventory") {
      edges {
        node {
          key
          value
          type
        }
      }
    }
  }
}
```

### Query Multiple Products with Metafields

```graphql
query GetAllProductsWithInventoryMetafields($first: Int!, $after: String) {
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
        
        variants(first: 1) {
          edges {
            node {
              sku
              inventoryQuantity
            }
          }
        }
      }
    }
  }
}
```

### Query with Inventory Levels

```graphql
query GetProductWithInventoryAndMetafields($productId: ID!) {
  product(id: $productId) {
    id
    title
    
    # Metafields
    leadTime: metafield(namespace: "app.inventory", key: "lead_time_days") {
      value
    }
    
    safetyStock: metafield(namespace: "app.inventory", key: "safety_stock") {
      value
    }
    
    # Inventory
    variants(first: 50) {
      edges {
        node {
          id
          sku
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
                  quantities(names: ["available"]) {
                    name
                    quantity
                  }
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

---

## 5. GraphQL Mutations

### Create/Update Metafields

```graphql
mutation UpdateProductInventoryMetafields($productId: ID!) {
  productUpdate(input: {
    id: $productId,
    metafields: [
      {
        namespace: "app.inventory",
        key: "lead_time_days",
        value: "21",
        type: "number_integer"
      },
      {
        namespace: "app.inventory",
        key: "safety_stock",
        value: "10",
        type: "number_integer"
      },
      {
        namespace: "app.inventory",
        key: "is_bundle",
        value: "true",
        type: "boolean"
      },
      {
        namespace: "app.inventory",
        key: "pack_count",
        value: "8",
        type: "number_integer"
      }
    ]
  }) {
    product {
      id
      metafields(first: 10, namespace: "app.inventory") {
        edges {
          node {
            key
            value
            type
          }
        }
      }
    }
    userErrors {
      field
      message
    }
  }
}
```

### Create Metafield Definition (Recommended)

```graphql
mutation CreateInventoryMetafieldDefinitions {
  leadTimeDef: metafieldDefinitionCreate(definition: {
    name: "Lead Time (Days)",
    namespace: "app.inventory",
    key: "lead_time_days",
    description: "Number of days from PO placement to inventory receipt",
    type: "number_integer",
    ownerType: PRODUCT,
    validations: [
      {
        name: "min",
        value: "1"
      },
      {
        name: "max",
        value: "365"
      }
    ]
  }) {
    createdDefinition {
      id
      name
    }
    userErrors {
      field
      message
    }
  }
  
  safetyStockDef: metafieldDefinitionCreate(definition: {
    name: "Safety Stock",
    namespace: "app.inventory",
    key: "safety_stock",
    description: "Buffer stock quantity to prevent stockouts",
    type: "number_integer",
    ownerType: PRODUCT,
    validations: [
      {
        name: "min",
        value: "0"
      }
    ]
  }) {
    createdDefinition {
      id
      name
    }
    userErrors {
      field
      message
    }
  }
  
  isBundleDef: metafieldDefinitionCreate(definition: {
    name: "Is Bundle",
    namespace: "app.inventory",
    key: "is_bundle",
    description: "Indicates if this product is a bundle/kit",
    type: "boolean",
    ownerType: PRODUCT
  }) {
    createdDefinition {
      id
      name
    }
    userErrors {
      field
      message
    }
  }
  
  packCountDef: metafieldDefinitionCreate(definition: {
    name: "Pack Count",
    namespace: "app.inventory",
    key: "pack_count",
    description: "Number of pieces per unit sold (for picker payout)",
    type: "number_integer",
    ownerType: PRODUCT,
    validations: [
      {
        name: "min",
        value: "1"
      }
    ]
  }) {
    createdDefinition {
      id
      name
    }
    userErrors {
      field
      message
    }
  }
}
```

### Delete Metafield

```graphql
mutation DeleteProductMetafield($metafieldId: ID!) {
  metafieldDelete(input: {
    id: $metafieldId
  }) {
    deletedId
    userErrors {
      field
      message
    }
  }
}
```

---

## 6. Tag-Based Fallback

### Current Implementation (Existing Spec)

Products use tags for bundle and pack information:
- `BUNDLE:TRUE` - Indicates a bundle/kit
- `PACK:X` - Indicates pack count (e.g., `PACK:8`)

### Migration Strategy

**Phase 1: Dual Support (Current)**
- Read from metafields first
- Fall back to tags if metafield not present
- Continue writing tags for backward compatibility

**Phase 2: Metafield Primary**
- Write to metafields on product updates
- Keep tags for legacy support
- Dashboard reads metafields only

**Phase 3: Metafield Only (Future)**
- Remove tag parsing logic
- Migrate all existing tags to metafields
- Tags used only for merchant-facing categorization

### Code Example (Dual Support)

```typescript
function getPackCount(product: ShopifyProduct): number {
  // Try metafield first
  const metafield = product.metafields?.find(
    m => m.namespace === 'app.inventory' && m.key === 'pack_count'
  );
  if (metafield?.value) {
    return parseInt(metafield.value, 10);
  }
  
  // Fall back to tag
  const packTag = product.tags.find(t => t.startsWith('PACK:'));
  if (packTag) {
    const count = parseInt(packTag.split(':')[1], 10);
    if (!isNaN(count)) return count;
  }
  
  // Default
  return 1;
}

function isBundle(product: ShopifyProduct): boolean {
  // Try metafield first
  const metafield = product.metafields?.find(
    m => m.namespace === 'app.inventory' && m.key === 'is_bundle'
  );
  if (metafield?.value) {
    return metafield.value === 'true';
  }
  
  // Fall back to tag
  return product.tags.includes('BUNDLE:TRUE');
}
```

---

## 7. Implementation Checklist

### Setup (One-Time)

- [ ] Create metafield definitions via GraphQL mutation
- [ ] Verify definitions in Shopify Admin → Settings → Custom Data
- [ ] Test metafield creation on sample product
- [ ] Verify metafield query returns expected data

### Sync Job (Nightly)

- [ ] Query all products with `app.inventory` metafields
- [ ] Parse metafield values (handle string-to-type conversion)
- [ ] Fall back to tags if metafields missing
- [ ] Store in Supabase `products` table
- [ ] Log any parsing errors or missing data

### Real-Time Updates (Webhooks)

- [ ] Subscribe to `products/update` webhook
- [ ] Parse metafields from webhook payload
- [ ] Update Supabase product record
- [ ] Recalculate ROP if relevant metafields changed

### Admin UI (Future)

- [ ] Build metafield editor in Hot Dash admin
- [ ] Allow merchant to set lead time, safety stock, pack count
- [ ] Validate input before sending to Shopify
- [ ] Show current values from Shopify

---

## 8. Best Practices

### ✅ DO

- Use `app.inventory` namespace for all inventory metafields
- Create metafield definitions for consistency
- Validate data before writing to metafields
- Handle missing metafields gracefully (use defaults)
- Parse string values to appropriate types
- Log errors when metafield operations fail

### ❌ DON'T

- Use `custom.*` namespace (reserved for merchants)
- Store large JSON blobs in metafields (use sparingly)
- Change metafield types without data migration
- Assume metafields always exist (check for null)
- Store sensitive data in metafields (use Supabase)
- Bypass metafield definitions (creates inconsistency)

---

## 9. References

- **Shopify Metafields Docs:** https://shopify.dev/docs/apps/build/custom-data
- **Metafield Types:** https://shopify.dev/docs/apps/build/custom-data/metafields/list-of-data-types
- **GraphQL Admin API:** https://shopify.dev/docs/api/admin-graphql
- **Existing Inventory Service:** `app/services/shopify/inventory.ts`
- **Data Model Spec:** `docs/specs/inventory_data_model.md`

