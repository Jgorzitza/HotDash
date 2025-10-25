# ALC Calculation UI Specification

**Owner**: Product Agent  
**Beneficiary**: Inventory + Integrations + Engineer  
**Created**: 2025-10-22  
**Version**: 1.0  
**Status**: Final  
**Backend Service**: INVENTORY-017 (alc.ts)

---

## Overview

This document defines the complete UI/UX for **Average Landed Cost (ALC) Calculation** - allowing operators to receive shipments, allocate freight/duty costs, and update product costs in Shopify.

**Goal**: Enable operators to accurately calculate and update product costs when receiving inventory, with full transparency into cost breakdowns.

---

## User Persona

**Inventory Manager/Operator**:

- Receives 2-5 shipments per week
- Needs to allocate freight/duty costs across products
- Must update Shopify with correct costs for margin calculations
- Wants transparency: "Why did the cost change from $245 to $253?"
- Key concern: Accuracy (costs directly affect profit margins)

---

## 1. Receiving Shipment Form

**Location**: `/dashboard/inventory/receive` or from PO detail view

**Trigger**: Click "Receive Shipment" from PO list or Inventory tile

**Purpose**: Record receipt of goods and calculate ALC

### Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Receive Shipment                                                  [X Close] │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ Step 1 of 3: Purchase Order & Vendor                                        │
│                                                                             │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ Purchase Order *                                                        │ │
│ │ [PO-2025-042 - Premium Suppliers - Expected Oct 22 ▾]                  │ │
│ │                                                                         │ │
│ │ PO Details:                                                             │ │
│ │ • Vendor: Premium Suppliers (95% reliable, 7d lead)                    │ │
│ │ • Order Date: Oct 15, 2025                                             │ │
│ │ • Expected: Oct 22, 2025                                               │ │
│ │ • Status: Pending Receipt                                              │ │
│ │ • Total Items: 3 products, 19 units                                    │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ Receipt Information                                                     │ │
│ │                                                                         │ │
│ │ Actual Receipt Date *                                                   │ │
│ │ [2025-10-21 ▾]  (1 day early ✅)                                       │ │
│ │                                                                         │ │
│ │ Received By                                                             │ │
│ │ [Sarah Johnson___________________________]                             │ │
│ │                                                                         │ │
│ │ Notes (optional)                                                        │ │
│ │ [Shipment in good condition, all boxes intact______________]           │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│                                                      [Cancel] [Next Step]   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Line Items & Quantities

**Step 2 of 3**: Verify received quantities

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Receive Shipment - Step 2: Verify Quantities                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ Verify each item received:                                                  │
│                                                                             │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ Product              SKU      Ordered  Received  Variance  Weight/Unit  │ │
│ │ ─────────────────────────────────────────────────────────────────────── │ │
│ │ Powder Snowboard 162 PS-162     5      [__5__]    0       3.2 kg       │ │
│ │ Vendor Invoice: $245.00/unit × 5 = $1,225.00                           │ │
│ │                                                                         │ │
│ │ Carbon Bindings XL   CB-XL      10     [__10_]    0       1.5 kg       │ │
│ │ Vendor Invoice: $189.00/unit × 10 = $1,890.00                          │ │
│ │                                                                         │ │
│ │ Ski Wax Kit          WAX-01     12     [__12_]    0       0.3 kg       │ │
│ │ Vendor Invoice: $24.99/unit × 12 = $299.88                             │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ Totals                                                                  │ │
│ │                                                                         │ │
│ │ Subtotal (Vendor Invoice):  $3,414.88                                  │ │
│ │ Total Weight:                19.6 kg (5×3.2 + 10×1.5 + 12×0.3)         │ │
│ │ Total Units:                 27 units                                  │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ ℹ️ Variance: Difference between ordered and received quantities             │
│                                                                             │
│                                                  [Back] [Cancel] [Next]     │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Variance Handling

**If received ≠ ordered**:

- Show yellow highlight on row
- Warning: "⚠️ Variance detected: Received 4 units but ordered 5"
- Options: [Accept Partial] [Enter Explanation] [Cancel Receipt]

---

## 3. Freight & Duty Allocation

**Step 3 of 3**: Allocate freight and duty costs

**KEY UX**: Show real-time calculation preview as user enters costs

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Receive Shipment - Step 3: Freight & Duty Allocation                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ Cost Allocation (Distributed by Weight)                                     │
│                                                                             │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ Total Freight Cost                                                      │ │
│ │ $ [__125.00__]                                                          │ │
│ │                                                                         │ │
│ │ Total Duty/Tax Cost                                                     │ │
│ │ $ [___85.00__]                                                          │ │
│ │                                                                         │ │
│ │ 💡 Costs will be allocated proportionally by weight                     │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ Cost Breakdown Preview (Updates as you type ↑)                         │ │
│ │                                                                         │ │
│ │ Product          Weight  Invoice  Freight  Duty   Total   Cost/Unit   │ │
│ │ ─────────────────────────────────────────────────────────────────────  │ │
│ │ Powder Board 162  16.0kg $1,225   $102.04  $69.39 $1,396  $279.20     │ │
│ │                   (82%)                                                │ │
│ │                                                                         │ │
│ │ Carbon Bindings   15.0kg $1,890    $95.66  $65.05 $2,051  $205.10     │ │
│ │                   (77%)                                                │ │
│ │                                                                         │ │
│ │ Ski Wax Kit        3.6kg  $300    $23.06  $15.70   $339   $28.23     │ │
│ │                   (18%)                                                │ │
│ │ ─────────────────────────────────────────────────────────────────────  │ │
│ │ TOTAL             19.6kg $3,415   $125.00  $85.00 $3,625               │ │
│ │                                                                         │ │
│ │ Weight % = (Item Weight / Total Weight) × 100                          │ │
│ │ Allocated Freight = Total Freight × Weight %                           │ │
│ │ Allocated Duty = Total Duty × Weight %                                 │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│                                            [Back] [Cancel] [Calculate ALC]  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Real-Time Calculation

**As operator types freight/duty amounts**:

- Breakdown table updates instantly
- Weight percentages shown for transparency
- Allocated costs highlighted when freight/duty > $0
- Total row updates

**Validation**:

- Freight and duty must be >= 0
- If total costs seem unusually high, show warning:
  - "⚠️ Total cost increased by 35% - please verify amounts"

---

## 4. ALC Calculation Preview

**Final step before saving**: Show ALC impact for each product

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ ALC Calculation Preview - Confirm Before Saving                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ ⚠️ This will update Shopify product costs                                   │
│                                                                             │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ Product            On Hand  Received  Old ALC  Receipt  New ALC  Change│ │
│ │ ─────────────────────────────────────────────────────────────────────  │ │
│ │ Powder Board 162     50        5      $245.00  $279.20  $248.14  ↑ 1%│ │
│ │ ✅ Shopify will update cost from $245.00 → $248.14                    │ │
│ │                                                                         │ │
│ │ Carbon Bindings XL   30       10      $185.00  $205.10  $190.03  ↑ 3%│ │
│ │ ✅ Shopify will update cost from $185.00 → $190.03                    │ │
│ │                                                                         │ │
│ │ Ski Wax Kit          100      12      $22.50   $28.23   $23.11   ↑ 3%│ │
│ │ ✅ Shopify will update cost from $22.50 → $23.11                      │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ Summary                                                                 │ │
│ │                                                                         │ │
│ │ Products Affected: 3                                                    │ │
│ │ Total Receipt Cost: $3,625.00                                           │ │
│ │ Average Cost Change: +2.3%                                              │ │
│ │                                                                         │ │
│ │ 💡 ALC Formula: ((Old_ALC × On_Hand_Qty) + Receipt_Total) / Total_Qty  │ │
│ │                                                                         │ │
│ │ Cost History: ✅ All changes will be logged for audit                   │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ ⚠️ Important: This action cannot be undone                                  │
│                                                                             │
│                            [Cancel] [✅ Confirm & Update Shopify Costs]     │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Visual Indicators

**Cost Change Direction**:

- ↑ **Increase**: Red arrow with percentage (e.g., "↑ 3%")
- ↓ **Decrease**: Green arrow with percentage (e.g., "↓ 2%")
- → **No Change**: Gray dash (e.g., "→ 0%")

**Change Magnitude Warnings**:

- > 10% change: Yellow warning "Large cost increase"
- > 25% change: Red warning "Very large cost increase - verify data"

---

## 5. Cost History View

**Location**: Product detail page or standalone `/dashboard/inventory/cost-history/:variantId`

**Purpose**: Audit trail showing all ALC changes for a product

### Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Cost History: Powder Snowboard 162cm                              [X Close]│
│ Current ALC: $248.14 · Last Updated: Oct 21, 2025                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ Filter: [Last 30 Days ▾]  [All Receipts ▾]                                 │
│                                                                             │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ Date         Receipt     Qty  Prev ALC  Receipt  New ALC   Change      │ │
│ │ ──────────────────────────────────────────────────────────────────────  │ │
│ │ Oct 21, 2025 PO-2025-042   5  $245.00  $279.20  $248.14   ↑ $3.14     │ │
│ │ [Expand ▾]                                                              │ │
│ │ ├─ Previous Inventory: 50 units @ $245.00 = $12,250.00                 │ │
│ │ ├─ New Receipt: 5 units @ $279.20 = $1,396.00                          │ │
│ │ │  ├─ Vendor Invoice: $245.00/unit × 5 = $1,225.00                     │ │
│ │ │  ├─ Allocated Freight: $102.04 (82% of $125 by weight)               │ │
│ │ │  └─ Allocated Duty: $69.39 (82% of $85 by weight)                    │ │
│ │ └─ New Total: 55 units @ $248.14 = $13,647.70                          │ │
│ │                                                                         │ │
│ │ Sep 15, 2025 PO-2025-031  20  $250.00  $239.50  $245.00   ↓ $5.00     │ │
│ │ [Expand ▾]                                                              │ │
│ │                                                                         │ │
│ │ Aug 10, 2025 PO-2025-018  30  $255.00  $248.00  $250.00   ↓ $5.00     │ │
│ │ [Expand ▾]                                                              │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ Cost Trend (Last 6 Months)                                              │ │
│ │                                                                         │ │
│ │ $255 ─────┐                                                             │ │
│ │ $250 ──────●──┐                                                         │ │
│ │ $245 ─────────●───●                                                     │ │
│ │ $240 ──────────────                                                     │ │
│ │       Aug   Sep   Oct                                                   │ │
│ │                                                                         │ │
│ │ Average ALC: $250.05 · Trend: ↓ Decreasing                              │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│ [Export to CSV] [Print Report] [Close]                                     │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Expandable Row Details

**Click to expand any history row**:

- Shows full calculation breakdown
- Previous inventory (qty × ALC)
- New receipt breakdown (vendor + freight + duty)
- New total (combined qty × new ALC)
- Receipt ID for reference

---

## 6. Confirmation & Success Flow

### Step 4: Confirmation

**After clicking "Confirm & Update Shopify Costs"**:

```
┌─────────────────────────────────────────────────────────────────┐
│ Processing Receipt...                                           │
│                                                                 │
│ ✓ Receipt recorded in database                                 │
│ ✓ Cost history snapshots created                               │
│ ⏳ Updating Shopify costs (3 products)...                       │
│                                                                 │
│ Progress: 2 of 3 complete                                       │
│ [████████████░░░░░] 67%                                         │
└─────────────────────────────────────────────────────────────────┘
```

### Success State

```
┌─────────────────────────────────────────────────────────────────┐
│ ✅ Receipt Processed Successfully                               │
│                                                                 │
│ PO-2025-042 received and costs updated:                        │
│                                                                 │
│ • Powder Snowboard 162: $245.00 → $248.14                      │
│ • Carbon Bindings XL: $185.00 → $190.03                        │
│ • Ski Wax Kit: $22.50 → $23.11                                 │
│                                                                 │
│ Receipt ID: RCP-2025-089                                        │
│ Recorded By: Sarah Johnson                                      │
│ Date: Oct 21, 2025                                             │
│                                                                 │
│ [View Receipt] [View Cost History] [Close]                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 7. Mobile Experience

### Receive Shipment (Mobile)

```
┌─────────────────────────────────┐
│ Receive Shipment       [X]      │
│                                 │
│ Step 1/3: PO & Vendor           │
│                                 │
│ PO Number                       │
│ [PO-2025-042 ▾]                 │
│                                 │
│ Premium Suppliers               │
│ Expected: Oct 22                │
│ 3 products, 19 units            │
│                                 │
│ Receipt Date                    │
│ [2025-10-21 ▾]                  │
│ 1 day early ✅                  │
│                                 │
│ Received By                     │
│ [Sarah Johnson______]           │
│                                 │
│ [Cancel] [Next]                 │
└─────────────────────────────────┘
```

### ALC Preview (Mobile)

```
┌─────────────────────────────────┐
│ ALC Preview            [X]      │
│                                 │
│ Powder Board 162                │
│ Old: $245.00 → New: $248.14     │
│ Change: ↑ $3.14 (1%)            │
│                                 │
│ Breakdown:                      │
│ • Invoice: $1,225.00            │
│ • Freight: $102.04 (82%)        │
│ • Duty: $69.39 (82%)            │
│ • Total: $1,396.43              │
│                                 │
│ [Show Formula] [Next Product]   │
└─────────────────────────────────┘
```

---

## 8. Error States

### Shopify Update Failed

```
┌─────────────────────────────────────────┐
│ ⚠️ Partial Success                      │
│                                         │
│ Receipt recorded, but Shopify update    │
│ failed for some products:               │
│                                         │
│ ✅ Powder Snowboard: Cost updated       │
│ ✅ Carbon Bindings: Cost updated        │
│ ❌ Ski Wax Kit: API error               │
│                                         │
│ Receipt ID: RCP-2025-089                │
│ Cost history saved for all products.    │
│                                         │
│ [Retry Shopify Update] [Close]          │
└─────────────────────────────────────────┘
```

### Invalid Data

```
┌─────────────────────────────────────────┐
│ ❌ Validation Error                     │
│                                         │
│ Cannot process receipt:                 │
│                                         │
│ • Freight cost cannot be negative       │
│ • Product weight missing for SKU WAX-01 │
│                                         │
│ Please fix these issues and try again.  │
│                                         │
│ [Go Back] [Close]                       │
└─────────────────────────────────────────┘
```

---

## 9. Data Requirements (for Engineer & Integrations)

**API Endpoints Needed**:

1. `GET /api/inventory/purchase-orders/pending`
   - Returns: POs awaiting receipt
   - For: PO selection dropdown

2. `POST /api/inventory/receive`
   - Body: poId, receiptDate, receivedBy, lineItems[], totalFreight, totalDuty
   - Uses: `processReceipt()` from alc.ts
   - Returns: Receipt processing result with ALC updates

3. `GET /api/inventory/cost-history/:variantId`
   - Query params: limit, startDate, endDate
   - Returns: ProductCostHistory records for variant

4. `POST /api/inventory/alc/preview`
   - Body: receipts[], totalFreight, totalDuty (same as receive, but no save)
   - Uses: `calculateReceiptCosts()` from alc.ts
   - Returns: Preview of ALC calculations (no database changes)

**Shopify Integration** (Integrations Agent):

5. `PUT /api/shopify/variants/:variantId/cost`
   - Body: newCost
   - Action: Updates Shopify variant cost field
   - Response: Success/failure status

6. `GET /api/shopify/variants/:variantId/inventory`
   - Returns: Current on-hand quantity from Shopify
   - Used by: ALC calculation (needs current inventory)

**UI Components Needed**:

1. ReceiveShipmentWizard component (multi-step form)
2. POSelector component
3. LineItemTable component (with quantity inputs)
4. FreightDutyAllocation component (with real-time preview)
5. ALCPreviewTable component
6. CostHistoryTimeline component
7. CostTrendChart component (simple line chart)

---

## 10. Operator Workflow

### Full Receiving Workflow

**Start** → Trigger from PO list ("Receive" button)  
↓  
**Step 1**: Select PO and enter receipt date  
↓  
**Step 2**: Verify quantities received (vs ordered)  
↓  
**Step 3**: Enter freight and duty costs

- See real-time allocation by weight
- Preview cost breakdown  
  ↓  
  **Step 4**: Review ALC preview
- See old vs new ALC for each product
- See Shopify update confirmation  
  ↓  
  **Confirm**: Click "Confirm & Update Shopify Costs"  
  ↓  
  **Processing**: Receipt saved, cost history recorded, Shopify updated  
  ↓  
  **Success**: Confirmation screen with receipt ID  
  ↓  
  **End** → Close modal, PO status updated to "Received"

**Total Time**: 3-5 minutes for typical 3-product receipt

---

## 11. Advanced Features (Phase 3)

### Batch Receipt Processing

**For high-volume operations**:

- Upload CSV with receipt data
- Bulk allocate freight/duty
- Preview all ALC changes before confirming
- Process 10+ POs at once

### Smart Allocation Suggestions

**Based on historical data**:

- "Similar shipments had freight around $150 for this weight"
- "Last PO from this vendor: $85 duty for 3 products"
- Auto-populate freight/duty based on similar receipts

### Cost Variance Alerts

**Email notifications**:

- If ALC increases >15%: "Large cost increase detected for Powder Board 162"
- If costs diverge from budget: "3 products now over target margin"

---

## 12. Success Metrics

**UX Quality Metrics**:

- Operator completes receiving in <5 minutes (avg)
- Cost entry errors <5% (proper validation)
- Operator confidence in ALC calculations (survey)

**Business Metrics**:

- 100% of receipts have freight/duty allocated (no skipped costs)
- Shopify costs updated within 24 hours of receipt (faster margin calculations)
- Cost history provides audit trail (compliance requirement)

---

## 13. Implementation Priority

**Phase 1 (MVP)** - Week 1:

1. Receive shipment form (Steps 1-3)
2. Basic ALC preview
3. Shopify cost update

**Phase 2** - Week 2: 4. Cost history view 5. Cost trend chart 6. Mobile optimization

**Phase 3** - Week 3: 7. Batch receipt processing 8. Smart allocation suggestions 9. Cost variance alerts

---

## Engineer Implementation Notes

**Data Flow**:

```
Operator Input (Form)
  ↓
calculateReceiptCosts() [alc.ts]
  ↓
calculateNewALC() [alc.ts]
  ↓
processReceipt() [alc.ts]
  ↓
Update Shopify via API [integrations]
  ↓
Success Confirmation
```

**State Management**:

- Receipt wizard state (3 steps)
- Real-time preview calculations (client-side for performance)
- Final submission (server-side for accuracy)

**Integrations Agent Coordination**:

- Shopify cost update API wrapper needed
- Shopify inventory query needed (for on-hand qty)
- Error handling for Shopify API failures

---

## Change Log

**v1.0 - 2025-10-22**:

- Initial UI specification
- Defined 3-step receiving workflow
- Specified freight/duty allocation UI with real-time preview
- Defined ALC preview with Shopify update confirmation
- Specified cost history view with audit trail
- Added mobile experience and error states

---

**Status**: Ready for Engineer + Integrations implementation  
**Dependencies**: INVENTORY-017 complete ✅  
**Next Step**: Engineer implements receiving wizard, Integrations adds Shopify cost update API
