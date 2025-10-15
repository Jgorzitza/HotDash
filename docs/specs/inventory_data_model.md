# Inventory Data Model Specification

**Version:** 1.0  
**Date:** 2025-10-15  
**Owner:** inventory agent  
**Status:** Draft - Spec Only (No Implementation)

---

## Overview

This specification defines the complete data model for the Hot Dash inventory management system, including:
- Reorder Point (ROP) calculation formula
- Kit/bundle structure and detection
- Picker payout logic and brackets
- Status bucket definitions
- Shopify metafield mappings

**Coordination:** This spec informs the data agent's schema design for Supabase tables.

---

## 1. Reorder Point (ROP) Formula

### Core Formula

```
ROP = (Average Daily Sales × Lead Time Days) + Safety Stock
```

### Components

#### Average Daily Sales
- **Calculation:** Total units sold / Number of days in period
- **Period:** Last 30, 60, or 90 days (configurable)
- **Source:** Shopify order line items aggregated by SKU
- **Handling:** If no sales history, use merchant-provided estimate or default to 0

#### Lead Time Days
- **Definition:** Days from PO placement to inventory receipt
- **Source:** Product metafield `app.inventory.lead_time_days`
- **Default:** 14 days if not specified
- **Range:** 1-365 days

#### Safety Stock
- **Purpose:** Buffer against demand variability and lead time uncertainty
- **Formula:** `(Max Daily Sales × Max Lead Time) - (Avg Daily Sales × Avg Lead Time)`
- **Alternative (Simpler):** `Average Daily Sales × Safety Factor`
  - Safety Factor: 0.5 to 2.0 (default: 1.0)
- **Source:** Product metafield `app.inventory.safety_stock` or calculated
- **Minimum:** 0 (no negative safety stock)

### Example Calculation

```
Product: Hot Rod Exhaust Header
Average Daily Sales: 3 units/day (last 60 days)
Lead Time: 21 days
Safety Stock: 10 units (merchant-specified)

ROP = (3 × 21) + 10 = 63 + 10 = 73 units

Action: Reorder when available inventory drops below 73 units
```

### Days of Cover (WOS - Weeks of Stock)

```
Days of Cover = Current Available Quantity / Average Daily Sales
Weeks of Stock = Days of Cover / 7
```

**Example:**
- Current Quantity: 45 units
- Average Daily Sales: 3 units/day
- Days of Cover: 45 / 3 = 15 days
- Weeks of Stock: 15 / 7 = 2.14 weeks

---

## 2. Status Buckets

Products are categorized into status buckets based on current inventory levels relative to ROP and sales velocity.

### Bucket Definitions

| Status | Condition | Priority | Action |
|--------|-----------|----------|--------|
| `in_stock` | Quantity > ROP | Low | Monitor |
| `low_stock` | ROP ≥ Quantity > (ROP × 0.5) | Medium | Plan reorder |
| `urgent_reorder` | (ROP × 0.5) ≥ Quantity > 0 | High | Reorder immediately |
| `out_of_stock` | Quantity = 0 | Critical | Expedite reorder |

### Calculation Logic

```typescript
function getStatusBucket(
  availableQuantity: number,
  rop: number
): 'in_stock' | 'low_stock' | 'urgent_reorder' | 'out_of_stock' {
  if (availableQuantity === 0) return 'out_of_stock';
  if (availableQuantity <= rop * 0.5) return 'urgent_reorder';
  if (availableQuantity <= rop) return 'low_stock';
  return 'in_stock';
}
```

### Dashboard Display

- **In Stock:** Green indicator, no alert
- **Low Stock:** Yellow indicator, "Plan Reorder" badge
- **Urgent Reorder:** Orange indicator, "Reorder Now" badge
- **Out of Stock:** Red indicator, "Out of Stock" badge

---

## 3. Kit/Bundle Structure

### Detection Method

Kits and bundles are identified via Shopify product tags:

- **Bundle Flag:** `BUNDLE:TRUE` tag on product
- **Pack Count:** `PACK:X` tag (where X is the number of pieces)

### Examples

```
Product: "Hot Rod Starter Kit"
Tags: ["BUNDLE:TRUE", "PACK:5", "Featured"]
Interpretation: This is a bundle containing 5 pieces
```

```
Product: "Spark Plug Set"
Tags: ["PACK:8", "Maintenance"]
Interpretation: Not a bundle, but sold as a pack of 8 units
```

### Metafield Alternative (Future Enhancement)

For more complex bundle structures, use metafields:

- `app.inventory.is_bundle` (boolean) - Replaces `BUNDLE:TRUE` tag
- `app.inventory.pack_count` (number_integer) - Replaces `PACK:X` tag
- `app.inventory.bundle_components` (json) - Array of component SKUs and quantities

**Example JSON:**
```json
{
  "components": [
    {"sku": "HEADER-001", "quantity": 1},
    {"sku": "GASKET-002", "quantity": 2},
    {"sku": "BOLT-KIT-003", "quantity": 1}
  ]
}
```

### Bundle Inventory Logic

**Option 1: Simple (Tag-Based)**
- Bundle inventory = Product's own inventory quantity
- No component tracking
- Suitable for pre-assembled kits

**Option 2: Component-Based (Future)**
- Bundle availability = MIN(component_qty / required_qty) for all components
- Requires component relationship tracking
- Suitable for kits assembled on demand

**Initial Implementation:** Use Option 1 (tag-based, simple)

---

## 4. Picker Payout Logic

### Purpose

Calculate picker compensation based on piece count picked, not line items or orders.

### Piece Count Determination

1. **Check for `PACK:X` tag** on product
   - If present, pieces = order quantity × X
   - Example: Order 3 units of "PACK:8" → 3 × 8 = 24 pieces

2. **Check for `app.inventory.pack_count` metafield**
   - If present, pieces = order quantity × pack_count
   - Overrides tag if both exist

3. **Default:** If neither tag nor metafield, pieces = order quantity × 1

### Payout Brackets

| Pieces Picked | Rate per Piece | Notes |
|---------------|----------------|-------|
| 1-100 | $0.10 | Base rate |
| 101-500 | $0.12 | +20% for volume |
| 501-1000 | $0.15 | +50% for high volume |
| 1001+ | $0.18 | +80% for very high volume |

**Alternative: Flat Rate**
- Single rate: $0.12 per piece (simpler, no brackets)

### Calculation Example

**Order:**
- 5 units of "Spark Plug Set" (PACK:8)
- 2 units of "Oil Filter" (no pack tag)
- 1 unit of "Starter Kit" (PACK:5, BUNDLE:TRUE)

**Piece Count:**
- Spark Plugs: 5 × 8 = 40 pieces
- Oil Filters: 2 × 1 = 2 pieces
- Starter Kit: 1 × 5 = 5 pieces
- **Total:** 47 pieces

**Payout (Bracket Method):**
- 47 pieces × $0.10 = $4.70

**Payout (Flat Rate Method):**
- 47 pieces × $0.12 = $5.64

### Data Storage

**Supabase Table: `picker_payouts`**
```sql
CREATE TABLE picker_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT NOT NULL,
  picker_id UUID REFERENCES users(id),
  total_pieces INTEGER NOT NULL,
  payout_amount DECIMAL(10,2) NOT NULL,
  payout_rate DECIMAL(10,4) NOT NULL,
  picked_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Line Item Detail: `picker_payout_lines`**
```sql
CREATE TABLE picker_payout_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payout_id UUID REFERENCES picker_payouts(id),
  sku TEXT NOT NULL,
  product_title TEXT,
  order_quantity INTEGER NOT NULL,
  pack_count INTEGER NOT NULL DEFAULT 1,
  pieces INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 5. Shopify Metafield Mappings

### Namespace Convention

Use `app.inventory` namespace for all inventory-related metafields.

### Metafield Definitions

| Key | Type | Description | Example Value | Required |
|-----|------|-------------|---------------|----------|
| `lead_time_days` | `number_integer` | Days from PO to receipt | `21` | No (default: 14) |
| `safety_stock` | `number_integer` | Buffer stock quantity | `10` | No (calculated if missing) |
| `is_bundle` | `boolean` | Product is a bundle/kit | `true` | No (use tag fallback) |
| `pack_count` | `number_integer` | Pieces per unit | `8` | No (use tag fallback) |
| `picker_payout_rate` | `number_decimal` | Custom rate override | `0.15` | No (use bracket) |
| `reorder_point_override` | `number_integer` | Manual ROP override | `75` | No (use calculated) |
| `vendor_sku` | `single_line_text_field` | Vendor's SKU | `VND-12345` | No |
| `min_order_quantity` | `number_integer` | Minimum PO quantity | `50` | No |

### GraphQL Query Example

```graphql
query GetProductInventoryMetafields($productId: ID!) {
  product(id: $productId) {
    id
    title
    tags
    metafields(first: 10, namespace: "app.inventory") {
      edges {
        node {
          key
          value
          type
        }
      }
    }
    variants(first: 50) {
      edges {
        node {
          id
          sku
          inventoryQuantity
          inventoryItem {
            inventoryLevels(first: 5) {
              edges {
                node {
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

### Metafield Creation (Admin API)

```graphql
mutation CreateInventoryMetafields($productId: ID!) {
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

---

## 6. Data Flow & Integration

### Shopify → Supabase Sync

1. **Nightly Job:** Fetch all products with inventory metafields
2. **Parse:** Extract metafields and tags
3. **Calculate:** Compute ROP, status bucket, days of cover
4. **Store:** Update `products` and `inventory_snapshots` tables

### Real-Time Updates

- **Webhook:** `inventory_levels/update` → Recalculate status bucket
- **Webhook:** `orders/create` → Update sales velocity, recalculate ROP

### Dashboard Queries

- **Inventory Heatmap:** Query `inventory_snapshots` filtered by status bucket
- **Reorder Suggestions:** Query products where `status = 'urgent_reorder'`
- **Picker Payouts:** Aggregate `picker_payout_lines` by picker and date range

---

## 7. Coordination with Data Agent

### Required Supabase Tables

1. **`products`** - Product master data with metafield values
2. **`inventory_snapshots`** - Point-in-time inventory levels and calculations
3. **`sales_velocity`** - Historical sales data for ROP calculation
4. **`picker_payouts`** - Payout summary records
5. **`picker_payout_lines`** - Line item detail for payouts
6. **`reorder_suggestions`** - Generated PO recommendations

### Schema Requirements

- All metafield values stored as typed columns (not JSON blobs)
- Indexes on: `sku`, `status_bucket`, `rop`, `available_quantity`
- Timestamps: `created_at`, `updated_at` on all tables
- Foreign keys: `product_id` references across tables

---

## 8. Next Steps

1. **Data Agent:** Design and create Supabase schema based on this spec
2. **Integrations Agent:** Implement Shopify metafield sync job
3. **Engineer Agent:** Build dashboard UI for inventory heatmap
4. **Inventory Agent (Future):** Implement ROP calculation service and PO generation

---

## Appendix: References

- **Existing Spec:** `docs/specs/inventory_spec.md` (high-level overview)
- **Shopify Inventory API:** `app/services/shopify/inventory.ts`
- **Metafields Documentation:** `docs/integrations/shopify_inventory_metafields.md`
- **Data Contracts:** `docs/data/data_contracts.md`

