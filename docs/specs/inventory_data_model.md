# Inventory Data Model Specification

**Version:** 2.0  
**Date:** 2025-10-16  
**Status:** Active  
**Owner:** Inventory Agent  

## Overview

This document specifies the complete data model for the HotDash inventory management system, aligned with implemented services and actual code structures.

## Core Concepts

### ROP (Reorder Point)

**Formula:** `ROP = (Average Daily Sales × Lead Time Days) + Safety Stock`

**Purpose:** Determine when to reorder products to avoid stockouts while minimizing excess inventory.

**Components:**
- **Average Daily Sales:** Calculated from historical sales data (configurable period, default 30 days)
- **Lead Time Days:** Time from order placement to receipt (vendor-specific or default 14 days)
- **Safety Stock:** Buffer inventory to account for demand/supply variability

### Status Buckets

Products are classified into four status buckets based on current quantity vs ROP:

1. **in_stock:** `Current Quantity > ROP`
2. **low_stock:** `ROP >= Current Quantity > (ROP × 0.5)`
3. **urgent_reorder:** `(ROP × 0.5) >= Current Quantity > 0`
4. **out_of_stock:** `Current Quantity = 0`

### Weeks of Stock (WOS)

**Formula:** `WOS = (Current Quantity / Average Daily Sales) / 7`

**Purpose:** Measure how many weeks of inventory remain at current sales velocity.

### Days of Cover

**Formula:** `Days of Cover = Current Quantity / Average Daily Sales`

**Purpose:** Measure how many days of inventory remain at current sales velocity.

## Data Structures

### ROPResult

```typescript
interface ROPResult {
  sku: string;
  productId: string;
  variantId: string;
  currentQuantity: number;
  averageDailySales: number;
  leadTimeDays: number;
  safetyStock: number;
  rop: number;
  statusBucket: 'in_stock' | 'low_stock' | 'urgent_reorder' | 'out_of_stock';
  daysOfCover: number | null;
  weeksOfStock: number | null;
  shouldReorder: boolean;
  calculatedAt: string;
}
```

### PurchaseOrder

```typescript
interface PurchaseOrder {
  poNumber: string; // Format: PO-YYYYMMDD-HHMMSS
  vendor?: string;
  generatedAt: string;
  expectedDeliveryDate: string;
  lineItems: POLineItem[];
  totalItems: number;
  totalQuantity: number;
  totalCost: number;
  notes?: string;
}

interface POLineItem {
  sku: string;
  productTitle: string;
  currentQuantity: number;
  rop: number;
  recommendedOrderQuantity: number;
  unitCost?: number;
  totalCost?: number;
  vendorSku?: string;
  leadTimeDays: number;
  expectedDeliveryDate: string;
}
```

### BundleInfo

```typescript
interface BundleInfo {
  sku: string;
  productId: string;
  variantId: string;
  title: string;
  isBundle: boolean;
  packCount: number;
  components?: BundleComponent[];
  maxBundlesAvailable?: number;
  currentQuantity: number;
}

interface BundleComponent {
  sku: string;
  productId: string;
  variantId: string;
  quantityRequired: number;
  currentQuantity: number;
  availableForBundle: number;
}
```

### StockAlert

```typescript
interface StockAlert {
  sku: string;
  productId: string;
  variantId: string;
  alertType: 'low_stock' | 'urgent_reorder' | 'out_of_stock';
  currentQuantity: number;
  rop: number;
  daysOfCover: number | null;
  weeksOfStock: number | null;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  generatedAt: string;
}
```

### ReorderSuggestion

```typescript
interface ReorderSuggestion {
  sku: string;
  productId: string;
  variantId: string;
  currentQuantity: number;
  rop: number;
  suggestedOrderQuantity: number;
  confidence: 'low' | 'medium' | 'high';
  reasoning: string[];
  estimatedCost?: number;
  priority: number; // 1-10, higher is more urgent
  generatedAt: string;
}
```

### VendorProfile

```typescript
interface VendorProfile {
  vendorId: string;
  name: string;
  contactEmail?: string;
  contactPhone?: string;
  defaultLeadTimeDays: number;
  minLeadTimeDays?: number;
  maxLeadTimeDays?: number;
  minimumOrderQuantity?: number;
  minimumOrderValue?: number;
  paymentTerms?: string;
  notes?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### Risk Detection

```typescript
interface StockoutRisk {
  sku: string;
  productId: string;
  variantId: string;
  currentQuantity: number;
  averageDailySales: number;
  daysUntilStockout: number | null;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  projectedStockoutDate: string | null;
  recommendedAction: string;
  detectedAt: string;
}

interface OverstockRisk {
  sku: string;
  productId: string;
  variantId: string;
  currentQuantity: number;
  averageDailySales: number;
  weeksOfStock: number | null;
  riskLevel: 'low' | 'medium' | 'high';
  excessQuantity: number;
  estimatedCarryingCost?: number;
  recommendedAction: string;
  detectedAt: string;
}
```

## Picker Payout System

### Brackets (Per Order)

- **1-4 pieces:** $2.00
- **5-10 pieces:** $4.00
- **11+ pieces:** $7.00

### Piece Calculation

**Formula:** `Total Pieces = Order Quantity × Pack Count`

**Examples:**
- 3 units of single item (pack count 1) = 3 pieces → $2.00
- 1 unit of 8-pack bundle = 8 pieces → $4.00
- 2 units of 8-pack bundle = 16 pieces → $7.00

### PayoutCalculation

```typescript
interface PayoutCalculation {
  orderId: string;
  pickerId?: string;
  totalPieces: number;
  bracket: '1-4' | '5-10' | '11+';
  payoutAmount: number;
  lineItems: PayoutLineItem[];
  calculatedAt: string;
}
```

## Supabase Schema Requirements

### Tables

1. **inventory_rop_calculations**
   - Stores ROP calculation results
   - Indexed by sku, calculated_at
   - Retention: 90 days

2. **inventory_purchase_orders**
   - Stores generated POs
   - Indexed by po_number, vendor, generated_at
   - Retention: 2 years

3. **inventory_alerts**
   - Stores active alerts
   - Indexed by sku, severity, generated_at
   - Auto-expire after resolution

4. **inventory_suggestions**
   - Stores reorder suggestions
   - Indexed by sku, priority, generated_at
   - Retention: 30 days

5. **inventory_vendors**
   - Stores vendor profiles
   - Indexed by vendor_id, name
   - Permanent storage

6. **inventory_audit_log**
   - Stores all inventory actions
   - Indexed by entity_type, entity_id, timestamp
   - Retention: 2 years

### Dashboard Facts

All services record to `dashboard_facts` table with:
- `factType`: `inventory.*` namespace
- `scope`: `ops`
- `value`: JSON payload
- `metadata`: Searchable fields

## Calculation Examples

### Example 1: Basic ROP

**Input:**
- Current Quantity: 50
- Average Daily Sales: 3
- Lead Time: 14 days
- Safety Stock: 10

**Calculation:**
- ROP = (3 × 14) + 10 = 42 + 10 = 52
- Days of Cover = 50 / 3 = 16.67 days
- Weeks of Stock = 16.67 / 7 = 2.38 weeks
- Status: low_stock (50 < 52)

### Example 2: Bundle with Components

**Bundle:** Starter Kit (8-pack)
- Component A: Need 1, Have 100 → 100 kits available
- Component B: Need 2, Have 50 → 25 kits available
- Component C: Need 1, Have 30 → 30 kits available

**Result:** Max 25 kits available (limited by Component B)

### Example 3: Picker Payout

**Order:**
- 2 units of SKU-001 (pack count 1) = 2 pieces
- 1 unit of SKU-002 (pack count 8) = 8 pieces
- Total: 10 pieces → $4.00 payout

## Integration Points

### Shopify
- Product/variant data via Admin GraphQL
- Metafields for lead time, safety stock, bundle config
- Tags for bundle detection (BUNDLE:TRUE, PACK:X)

### Supabase
- RPC functions for bulk operations
- Real-time subscriptions for alerts
- Dashboard facts for metrics

### Dashboard
- Tile data via tile-hooks service
- Heatmap visualization
- Alert widgets

## Validation Rules

1. **ROP Calculation:**
   - Average daily sales ≥ 0
   - Lead time days > 0
   - Safety stock ≥ 0

2. **Purchase Orders:**
   - At least one line item
   - All quantities > 0
   - Valid vendor (if specified)

3. **Alerts:**
   - Valid severity level
   - Non-empty message
   - Valid SKU reference

4. **Suggestions:**
   - Priority between 1-10
   - Confidence level specified
   - At least one reasoning item

## Performance Targets

- ROP calculation: < 100ms per product
- Bulk ROP (100 products): < 5 seconds
- PO generation: < 500ms
- Alert generation: < 200ms per product
- Metafields sync: < 10 seconds per 100 products

## See Also

- `docs/integrations/shopify_inventory_metafields.md` - Shopify integration details
- `app/services/inventory/` - Implementation code
- `tests/unit/inventory.*.spec.ts` - Test suites

