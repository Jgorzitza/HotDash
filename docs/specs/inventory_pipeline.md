# Inventory Pipeline - Complete Specification

**Version:** 2.0  
**Last Updated:** 2025-10-19  
**Status:** Production Ready

## Overview

The Hot Rod AN inventory intelligence system provides automated inventory management with ROP calculations, picker payouts, status buckets, Shopify sync, and PO generation.

## Architecture

```
Shopify Products (Source)
    ↓
Inventory Sync Service
    ↓
ROP Calculation Service
    ↓
Status Bucket Classification
    ↓
Approval Flow (HITL)
    ↓
Actions: PO Generation, Shopify Drafts, Picker Payouts
```

## Core Services

### 1. ROP Calculation Service

**File:** `app/services/inventory/rop.ts`  
**Tests:** `tests/unit/services/inventory/rop.spec.ts` (18 tests, all passing)

#### Formula

```
ROP = (Average Daily Demand × Lead Time Days) + Safety Stock

Safety Stock (min-max method):
  = (Max Daily Sales × Max Lead Time) - (Avg Daily Sales × Avg Lead Time)
```

#### Example

```typescript
import { calculateROP, calculateSafetyStock } from "~/services/inventory/rop";

// Calculate safety stock
const safety = calculateSafetyStock({
  averageDailySales: 12,
  averageLeadTimeDays: 5,
  maxDailySales: 18,
  maxLeadTimeDays: 8,
});
// Returns: 84 units

// Calculate ROP
const rop = calculateROP({
  avgDailyDemand: 12,
  leadTimeDays: 14, // 2-week lead time
  safetyStockDays: 7, // 1-week buffer
});
// Returns: 252 units (reorder when stock hits 252)
```

#### Functions

- `calculateROP(params)` - Basic ROP calculation
- `calculateSafetyStock(params)` - Min-max safety stock method
- `calculateROPWithSafety(params)` - Combined calculation with auto safety stock

### 2. Picker Payout Service

**File:** `app/services/inventory/payout.ts`  
**Tests:** `tests/unit/services/inventory/payout.spec.ts` (31 tests, all passing)

#### Payout Brackets

| Pieces | Rate  |
| ------ | ----- |
| 1-4    | $2.00 |
| 5-10   | $4.00 |
| 11+    | $7.00 |

#### Bundle/Pack Support

- `BUNDLE:TRUE` - Product contains multiple SKUs
- `PACK:X` - X pieces per unit (e.g., PACK:6 = 6-pack)

#### Example

```typescript
import {
  calculatePickerPayout,
  calculateOrderPayout,
} from "~/services/inventory/payout";

// Single order
calculatePickerPayout(8); // $4.00 (8 pieces)

// With rush bonus
calculatePickerPayout(40, {
  rushBonus: 2.5,
  rushThreshold: 35,
}); // $9.50 ($7.00 base + $2.50 rush)

// Full order with multiple line items
calculateOrderPayout([
  { quantity: 2, tags: ["PACK:6"] }, // 12 pieces
  { quantity: 3, tags: [] }, // 3 pieces
  { quantity: 1, tags: ["BUNDLE:TRUE", "PACK:2"] }, // 2 pieces
]);
// Total: 17 pieces → $7.00
```

#### Functions

- `calculatePickerPayout(pieces, options?)` - Calculate payout for piece count
- `parsePieceCount(tags)` - Extract PACK:X from tags
- `isBundle(tags)` - Check for BUNDLE:TRUE
- `calculateTotalPieces(quantity, tags)` - Calculate total pieces with pack multiplier
- `calculateOrderPayout(lineItems, options?)` - Calculate payout for entire order

### 3. Status Bucket Service

**File:** `app/services/inventory/status.ts`  
**Tests:** `tests/unit/services/inventory/status.spec.ts` (37 tests, all passing)

#### Status Buckets

| Status           | Condition          | Urgency     | Action              |
| ---------------- | ------------------ | ----------- | ------------------- |
| `out_of_stock`   | Qty ≤ 0            | Critical    | Emergency order     |
| `urgent_reorder` | Qty ≤ Safety Stock | Critical    | Order immediately   |
| `low_stock`      | Qty ≤ ROP          | High/Medium | Reorder recommended |
| `in_stock`       | Qty > ROP          | None        | No action           |

#### Days of Cover (WOS)

```
Days of Cover = Current Quantity / Average Daily Sales
```

#### Example

```typescript
import {
  getInventoryStatus,
  getReorderRecommendation,
} from "~/services/inventory/status";

const status = getInventoryStatus({
  onHand: 25,
  reorderPoint: 60,
  safetyStock: 20,
  averageDailySales: 8,
  incoming: 10,
});

// Returns:
// {
//   status: "low_stock",
//   daysOfCover: 3.13,  // 25 / 8 ≈ 3 days left
//   recommendedOrderQuantity: 45,  // (60+20) - (25+10)
//   ...
// }

const recommendation = getReorderRecommendation(
  status.status,
  status.daysOfCover,
  status.recommendedOrderQuantity,
);

// Returns:
// {
//   shouldReorder: true,
//   urgency: "high",  // < 7 days cover
//   message: "LOW STOCK: Less than 3.1 days of cover...",
//   orderQuantity: 45
// }
```

#### Functions

- `evaluateInventoryStatus(onHand, ROP, safety)` - Classify status bucket
- `calculateDaysOfCover(onHand, avgDaily)` - Calculate WOS
- `recommendOrderQuantity(params)` - Calculate order quantity
- `getInventoryStatus(params)` - Complete status assessment
- `getReorderRecommendation(status, days, qty)` - Get recommendation with urgency
- `groupByStatus(items)` - Group items by status bucket
- `calculateInventoryMetrics(items)` - Calculate health percentages

### 4. Shopify Sync Service

**File:** `app/services/inventory/shopify-sync.ts`  
**Tests:** `tests/unit/services/inventory/shopify-sync.spec.ts` (24 tests, all passing)

#### GraphQL Query

```graphql
query GetProductsInventory($first: Int!, $after: String) {
  products(first: $first, after: $after) {
    pageInfo {
      hasNextPage
      endCursor
    }
    edges {
      node {
        id
        title
        handle
        tags
        variants(first: 100) {
          edges {
            node {
              id
              sku
              title
              inventoryQuantity
              price
            }
          }
        }
      }
    }
  }
}
```

#### Example

```typescript
import {
  fetchAllInventory,
  filterInventory,
} from "~/services/inventory/shopify-sync";

// Fetch all inventory from Shopify
const allItems = await fetchAllInventory(shopifyFetch, 100);

// Filter low stock items with SKU
const lowStock = filterInventory(allItems, {
  maxQuantity: 50,
  hasSku: true,
});

// Filter bundles
const bundles = filterInventory(allItems, {
  tags: ["BUNDLE:TRUE"],
});
```

#### Functions

- `fetchAllInventory(fetchFn, batchSize)` - Fetch all products with pagination
- `parseShopifyInventoryResponse(response)` - Parse GraphQL response
- `filterInventory(items, filters)` - Filter by qty/tags/SKU
- `groupByProduct(items)` - Group variants by product
- `calculateInventoryValue(items)` - Calculate total value
- `sortInventory(items, sortBy, direction)` - Sort by qty/price/title

## Scripts

### PO Generation Script

**File:** `scripts/inventory/generate-po.mjs`

#### Usage

```bash
# Generate PO CSV for items below ROP
node scripts/inventory/generate-po.mjs --output=po-2025-10-19.csv

# Preview without saving
node scripts/inventory/generate-po.mjs --dry-run
```

#### CSV Format

```
SKU,Product,Variant,Current Qty,ROP,Safety Stock,Order Qty,Supplier,Unit Cost,Total Cost,Priority
JAL-001,Jalapeño Salsa,8oz,15,100,30,115,Hot Stuff Inc,3.50,402.50,critical
HSVP-12,Variety Pack,12-pack,25,60,20,55,Hot Stuff Inc,24.00,1320.00,high
```

#### Functions

- `generatePOCSV(items)` - Generate CSV content
- `filterByPriority(items, minPriority)` - Filter by urgency
- `groupBySupplier(items)` - Group items by supplier
- `calculatePOTotals(items)` - Calculate totals and counts
- `generatePOEmailBody(items, totals)` - Generate email template

### Shopify Draft Creation Script

**File:** `scripts/inventory/create-shopify-draft.mjs`

#### Usage

```bash
# Create draft product (dry run)
node scripts/inventory/create-shopify-draft.mjs --dry-run

# Create actual draft (requires Shopify client)
node scripts/inventory/create-shopify-draft.mjs --title="New Product"
```

#### Features

- Multiple variants with SKU, price, inventory
- SEO fields (title, description)
- JSON-LD structured data (Schema.org Product)
- Images with alt text
- Product tags and metafields
- Draft status (requires approval before publishing)

#### Functions

- `generateProductDraft(productData)` - Create draft payload
- `generateProductJSONLD(productData)` - Generate Schema.org JSON-LD
- `validateProductData(productData)` - Validate before creation
- `parseProductFromCSV(row)` - Parse CSV import

## Deployment Checklist

### Pre-Deployment

- [x] All tests passing (110/110 tests across 4 services)
- [x] ROP calculations verified with real data
- [x] Payout brackets match picker compensation
- [x] Status buckets correctly classify inventory
- [x] Shopify sync handles pagination
- [x] Scripts tested with dry-run mode
- [ ] Environment variables configured
- [ ] Shopify API credentials valid
- [ ] Email/notification endpoints configured

### Production Rollout

1. **Phase 1: Read-Only (Week 1)**
   - Deploy services (ROP, Status, Sync)
   - Monitor calculations vs manual process
   - Verify status buckets match reality
   - No automated actions yet

2. **Phase 2: Picker Payouts (Week 2)**
   - Enable payout calculations
   - Verify against manual picker payout records
   - Adjust brackets if needed
   - Monitor for edge cases

3. **Phase 3: PO Generation (Week 3)**
   - Enable automated PO CSV generation
   - Review PO recommendations daily
   - Manually approve all orders
   - Track order vs actual need

4. **Phase 4: Approvals Flow (Week 4)**
   - Connect to HITL approvals drawer
   - CEO reviews all reorder recommendations
   - Track approval time and accuracy
   - Refine urgency thresholds

5. **Phase 5: Full Automation (Week 5+)**
   - Automated PO generation for approved items
   - Shopify draft creation for new products
   - Weekly performance review
   - Continuous optimization

### Monitoring

**Key Metrics:**

- ROP coverage: % of products with ROP defined
- Status distribution: % in each bucket
- Days of cover: Average across all products
- Payout accuracy: Calculated vs actual
- PO accuracy: Recommended vs actually needed
- Approval latency: Time to approve reorders

**Alerts:**

- Critical: >5 items out of stock
- High: >10 items in urgent_reorder
- Medium: Days of cover <7 for bestsellers
- Low: ROP coverage <90%

## API Contracts

### Inventory Status Endpoint (Future)

```typescript
GET /api/inventory/status
Response: {
  metrics: {
    total: number,
    inStock: number,
    lowStock: number,
    urgentReorder: number,
    outOfStock: number,
    healthPercentage: number
  },
  items: InventoryItem[],
  lastSync: string
}
```

### ROP Recommendation Endpoint (Future)

```typescript
POST /api/inventory/rop-recommendation
Body: {
  productId: string,
  variantId: string
}
Response: {
  currentQty: number,
  reorderPoint: number,
  safetyStock: number,
  daysOfCover: number,
  recommendation: {
    shouldReorder: boolean,
    urgency: string,
    orderQuantity: number,
    message: string
  }
}
```

## Rollback Plan

If issues arise:

1. **Disable automated actions**
   - Stop PO generation
   - Pause approvals flow
   - Continue read-only monitoring

2. **Revert to manual process**
   - Export current inventory data
   - Calculate ROPs manually
   - Generate POs using previous process

3. **Debug and fix**
   - Review logs for errors
   - Check calculation accuracy
   - Verify Shopify sync data
   - Test fixes in staging

4. **Gradual re-enable**
   - Start with read-only
   - Enable one feature at a time
   - Monitor closely for 48 hours

## Support & Maintenance

**Code Owners:** Inventory Agent  
**Primary Contact:** Manager  
**Documentation:** This file + JSDoc in source files  
**Test Coverage:** 110 tests across 4 core services  
**CI/CD:** All tests run on PR + merge to main

## Change Log

- **2025-10-19:** Version 2.0 - Production-ready system
  - Created ROP calculation service (18 tests)
  - Created picker payout service (31 tests)
  - Created status bucket service (37 tests)
  - Created Shopify sync service (24 tests)
  - Added PO generation script
  - Added Shopify draft creation script
  - Complete documentation with deployment plan

- **2025-10-15:** Version 1.0 - Initial specification
  - Dashboard tile RPCs planned
  - Inventory + approvals materializers outlined
  - RLS policies requirements defined
