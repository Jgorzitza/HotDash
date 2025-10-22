# Inventory Direction v7.0 — Growth Engine Integration

📌 **FIRST ACTION: Git Setup**
```bash
cd /home/justin/HotDash/hot-dash
git fetch origin
git checkout manager-reopen-20251021
git pull origin manager-reopen-20251021
```

**Owner**: Manager  
**Effective**: 2025-10-21T20:30Z  
**Version**: 8.0  
**Status**: ✅ 3/4 TASKS COMPLETE (2025-10-21T17:35Z) — INVENTORY-019 Active

---

## ✅ ALL PREVIOUS INVENTORY TASKS COMPLETE

**Completed** (from feedback/inventory/2025-10-21.md):
1. ✅ INVENTORY-001: Seasonal Demand Adjustments (seasonality.ts - 243 lines)
2. ✅ INVENTORY-002: Demand Forecasting (demand-forecast.ts - 331 lines)
3. ✅ INVENTORY-003: Vendor Management (vendor-management.ts - 441 lines)
4. ✅ INVENTORY-004: PO Tracking System (po-tracking.ts - 485 lines)
5. ✅ INVENTORY-005: Chart Integration (integrated in demand-forecast)
6. ✅ INVENTORY-006: Modal Backend (2 API routes, integration doc)
7. ✅ INVENTORY-007: Real-Time Tile Data (tile-data service + API route)
8. ✅ INVENTORY-008: Kits & Bundles Support (bundles.ts - 244 lines)
9. ✅ INVENTORY-009: Automated Reorder Alerts (reorder-alerts.ts - 289 lines)
10. ✅ INVENTORY-010: Inventory Analytics (analytics.ts - 350 lines)
11. ✅ INVENTORY-011: PO Automation (po-automation.ts - 232 lines)
12. ✅ INVENTORY-012: Optimization Service (optimization.ts - 144 lines)
13. ✅ INVENTORY-013: Inventory Reporting (reporting.ts - 56 lines)
14. ✅ INVENTORY-014: Engineer Modal Support (verified)

**Total Output**: 14 services, ~3,500 lines, comprehensive inventory management

---

## 🎯 NEW: Growth Engine Architecture (Effective 2025-10-21)

**Context**: Growth Engine Final Pack integrated into project (commit: 546bd0e)

### Security & Evidence Requirements (CI Merge Blockers)
1. **MCP Evidence JSONL** (code changes): `artifacts/inventory/<date>/mcp/<tool>.jsonl`
2. **Heartbeat NDJSON** (tasks >2h): `artifacts/inventory/<date>/heartbeat.ndjson` (15min max staleness)
3. **Dev MCP Ban**: NO Dev MCP imports in `app/` (production code only)
4. **PR Template**: Must include MCP Evidence + Heartbeat + Dev MCP Check sections

**See**: `.cursor/rules/10-growth-engine-pack.mdc` for full requirements

---

## 🚀 PHASE 10: Vendor Management + ALC Services (9 hours) — P1 PRIORITY

**Objective**: Build services for Vendor Management and Average Landed Cost calculation with Shopify sync

### Prerequisites
- ✅ Data agent completes DATA-017, DATA-018 (Vendor + PO tables) — DEPENDENCY

### Context

**Vendor Management** (CEO-confirmed):
- Centralized vendor database with reliability tracking
- **Reliability Score**: 0-100% = `(on_time_deliveries / total_deliveries) × 100`
- Multi-SKU support (same product, multiple vendors)
- Operator sees: "Premium Suppliers (92% reliable, 7d lead, $24.99/unit)"

**Average Landed Cost** (CEO-confirmed with clarifications):
```typescript
// ALC includes existing inventory
New_ALC = ((Previous_ALC × On_Hand_Qty) + New_Receipt_Total) / (On_Hand_Qty + New_Receipt_Qty)

// Receipt cost includes freight and duty BY WEIGHT
New_Receipt_Total = Vendor_Invoice + Freight_By_Weight + Duty_By_Weight
```

**Shopify Cost Sync**: Push new ALC to Shopify `inventoryItem.unitCost` after every receipt

---

### INVENTORY-016: Vendor Service Enhancement (3h)

**File**: `app/services/inventory/vendor-service.ts` (NEW)

**Purpose**: Enhance existing vendor-management.ts (441 lines) with Growth Engine requirements

**Functions to Add**:

```typescript
// Get vendor with reliability metrics
export async function getVendorWithMetrics(vendorId: string) {
  const vendor = await prisma.vendor.findUnique({
    where: { id: vendorId },
    include: {
      productMappings: true,
      purchaseOrders: {
        where: { actualDeliveryDate: { not: null } },
        orderBy: { actualDeliveryDate: 'desc' },
        take: 10
      }
    }
  });
  
  if (!vendor) return null;
  
  // Calculate current reliability score
  const onTimeRate = vendor.totalOrders > 0 
    ? (vendor.onTimeDeliveries / vendor.totalOrders) * 100 
    : 0;
  
  return {
    ...vendor,
    reliabilityScore: onTimeRate,
    avgLeadTimeDays: calculateAvgLeadTime(vendor.purchaseOrders),
    lastOrderDate: vendor.purchaseOrders[0]?.orderDate
  };
}

// Update reliability score when PO received
export async function updateVendorReliability(
  vendorId: string,
  expectedDate: Date,
  actualDate: Date
) {
  const onTime = actualDate <= expectedDate;
  
  await prisma.vendor.update({
    where: { id: vendorId },
    data: {
      totalOrders: { increment: 1 },
      onTimeDeliveries: onTime ? { increment: 1 } : undefined,
      lateDeliveries: !onTime ? { increment: 1 } : undefined,
      reliabilityScore: {
        // Recalculate: (onTimeDeliveries / totalOrders) * 100
      }
    }
  });
}

// Get best vendor for product (by reliability, lead time, cost)
export async function getBestVendorForProduct(
  variantId: string,
  criteria: 'cost' | 'speed' | 'reliability' = 'reliability'
) {
  const mappings = await prisma.vendorProductMapping.findMany({
    where: { variantId },
    include: {
      vendor: true
    }
  });
  
  // Sort by criteria
  const sorted = mappings.sort((a, b) => {
    if (criteria === 'cost') return a.costPerUnit - b.costPerUnit;
    if (criteria === 'speed') return a.vendor.leadTimeDays - b.vendor.leadTimeDays;
    return (b.vendor.reliabilityScore || 0) - (a.vendor.reliabilityScore || 0);
  });
  
  return sorted[0];
}

// Get vendor dropdown options (for UI)
export async function getVendorOptions(variantId?: string) {
  const where = variantId 
    ? { productMappings: { some: { variantId } } }
    : { isActive: true };
  
  const vendors = await prisma.vendor.findMany({
    where,
    include: {
      productMappings: variantId ? {
        where: { variantId }
      } : undefined
    }
  });
  
  return vendors.map(v => ({
    id: v.id,
    label: `${v.name} (${v.reliabilityScore?.toFixed(0)}% reliable, ${v.leadTimeDays}d lead, $${v.productMappings[0]?.costPerUnit || 0}/unit)`,
    reliabilityScore: v.reliabilityScore,
    leadTimeDays: v.leadTimeDays,
    costPerUnit: v.productMappings[0]?.costPerUnit
  }));
}
```

**Integration Points**:
- Update existing `vendor-management.ts` (enhance, don't replace)
- Call `updateVendorReliability()` from receiving workflow (INVENTORY-017)
- Use `getVendorOptions()` in Engineer's PO creation UI

**Tests**: `tests/unit/services/inventory/vendor-service.spec.ts`
- Test reliability score calculation
- Test best vendor selection (all 3 criteria)
- Test vendor options formatting
- Test score update on PO receipt

**Acceptance**:
- ✅ Vendor service enhanced with 4 new functions
- ✅ Reliability scoring implemented (0-100%)
- ✅ Best vendor selection logic (cost/speed/reliability)
- ✅ Unit tests passing (100% coverage for new functions)
- ✅ No linter errors

**MCP Required**: 
- Context7 → Prisma aggregations, relations

---

### INVENTORY-017: ALC Calculation Service (4h)

**File**: `app/services/inventory/alc.ts` (NEW)

**Purpose**: Calculate Average Landed Cost with freight/duty distribution BY WEIGHT

**Core Functions**:

```typescript
interface ReceiptInput {
  variantId: string;
  qtyReceived: number;
  vendorInvoiceAmount: number; // Per unit cost from vendor
  weight: number; // Weight per unit (kg)
}

interface ReceiptCostBreakdown {
  variantId: string;
  qtyReceived: number;
  vendorInvoiceAmount: number;
  allocatedFreight: number; // Distributed by weight
  allocatedDuty: number; // Distributed by weight
  totalReceiptCost: number; // Invoice + freight + duty
  costPerUnit: number; // totalReceiptCost / qtyReceived
}

// Calculate freight distribution by weight
function distributeFreightByWeight(
  receipts: ReceiptInput[],
  totalFreight: number
): Map<string, number> {
  const totalWeight = receipts.reduce((sum, r) => sum + (r.weight * r.qtyReceived), 0);
  
  const distribution = new Map<string, number>();
  receipts.forEach(receipt => {
    const itemTotalWeight = receipt.weight * receipt.qtyReceived;
    const weightRatio = itemTotalWeight / totalWeight;
    const allocatedFreight = totalFreight * weightRatio;
    distribution.set(receipt.variantId, allocatedFreight);
  });
  
  return distribution;
}

// Calculate duty distribution by weight
function distributeDutyByWeight(
  receipts: ReceiptInput[],
  totalDuty: number
): Map<string, number> {
  // Same logic as freight
  const totalWeight = receipts.reduce((sum, r) => sum + (r.weight * r.qtyReceived), 0);
  
  const distribution = new Map<string, number>();
  receipts.forEach(receipt => {
    const itemTotalWeight = receipt.weight * receipt.qtyReceived;
    const weightRatio = itemTotalWeight / totalWeight;
    const allocatedDuty = totalDuty * weightRatio;
    distribution.set(receipt.variantId, allocatedDuty);
  });
  
  return distribution;
}

// Calculate receipt cost breakdown
export function calculateReceiptCosts(
  receipts: ReceiptInput[],
  totalFreight: number,
  totalDuty: number
): ReceiptCostBreakdown[] {
  const freightDistribution = distributeFreightByWeight(receipts, totalFreight);
  const dutyDistribution = distributeDutyByWeight(receipts, totalDuty);
  
  return receipts.map(receipt => {
    const allocatedFreight = freightDistribution.get(receipt.variantId) || 0;
    const allocatedDuty = dutyDistribution.get(receipt.variantId) || 0;
    const totalReceiptCost = 
      (receipt.vendorInvoiceAmount * receipt.qtyReceived) + 
      allocatedFreight + 
      allocatedDuty;
    
    return {
      variantId: receipt.variantId,
      qtyReceived: receipt.qtyReceived,
      vendorInvoiceAmount: receipt.vendorInvoiceAmount,
      allocatedFreight,
      allocatedDuty,
      totalReceiptCost,
      costPerUnit: totalReceiptCost / receipt.qtyReceived
    };
  });
}

// Calculate new ALC (includes existing inventory)
export async function calculateNewALC(
  variantId: string,
  receiptCostPerUnit: number,
  receiptQty: number
): Promise<{ previousALC: number; newALC: number; previousOnHand: number; newOnHand: number }> {
  // Get current on-hand qty from Shopify
  const inventory = await fetchShopifyInventory(variantId);
  const previousOnHand = inventory.available || 0;
  
  // Get previous ALC from cost history
  const lastCostRecord = await prisma.productCostHistory.findFirst({
    where: { variantId },
    orderBy: { recordedAt: 'desc' }
  });
  const previousALC = lastCostRecord?.newAlc || receiptCostPerUnit;
  
  // Calculate new ALC (weighted average)
  const newALC = ((previousALC * previousOnHand) + (receiptCostPerUnit * receiptQty)) / (previousOnHand + receiptQty);
  const newOnHand = previousOnHand + receiptQty;
  
  return {
    previousALC,
    newALC,
    previousOnHand,
    newOnHand
  };
}

// Record cost history snapshot
export async function recordCostHistory(
  variantId: string,
  receiptId: string,
  previousALC: number,
  newALC: number,
  previousOnHand: number,
  newOnHand: number,
  receiptQty: number,
  receiptCostPerUnit: number
) {
  await prisma.productCostHistory.create({
    data: {
      variantId,
      receiptId,
      previousAlc: previousALC,
      newAlc: newALC,
      previousOnHand,
      newOnHand,
      receiptQty,
      receiptCostPerUnit,
      recordedAt: new Date()
    }
  });
}

// Complete receiving workflow
export async function processReceipt(
  poId: string,
  receipts: ReceiptInput[],
  totalFreight: number,
  totalDuty: number
): Promise<{
  receiptBreakdowns: ReceiptCostBreakdown[];
  alcUpdates: Array<{ variantId: string; previousALC: number; newALC: number }>;
}> {
  // 1. Calculate receipt costs (with freight/duty distribution)
  const receiptBreakdowns = calculateReceiptCosts(receipts, totalFreight, totalDuty);
  
  // 2. Calculate new ALC for each variant
  const alcUpdates = [];
  for (const breakdown of receiptBreakdowns) {
    const alc = await calculateNewALC(
      breakdown.variantId,
      breakdown.costPerUnit,
      breakdown.qtyReceived
    );
    
    // 3. Record cost history snapshot
    await recordCostHistory(
      breakdown.variantId,
      poId, // Will be receipt ID after creation
      alc.previousALC,
      alc.newALC,
      alc.previousOnHand,
      alc.newOnHand,
      breakdown.qtyReceived,
      breakdown.costPerUnit
    );
    
    alcUpdates.push({
      variantId: breakdown.variantId,
      previousALC: alc.previousALC,
      newALC: alc.newALC
    });
  }
  
  return { receiptBreakdowns, alcUpdates };
}
```

**Integration Points**:
- Called from receiving workflow UI (Engineer builds)
- Integrations agent syncs ALC to Shopify (INTEGRATIONS-XXX)

**Tests**: `tests/unit/services/inventory/alc.spec.ts`
- Test freight distribution by weight (3 items, different weights)
- Test duty distribution by weight
- Test ALC calculation (with existing inventory)
- Test ALC calculation (new product, no previous inventory)
- Test complete receipt processing
- Test cost history snapshot

**Acceptance**:
- ✅ ALC service implemented with all functions
- ✅ Freight/duty distribution BY WEIGHT correct
- ✅ ALC calculation includes previous inventory
- ✅ Cost history snapshots created
- ✅ Unit tests passing (100% coverage)
- ✅ No linter errors

**MCP Required**: 
- Context7 → TypeScript algorithms, decimal precision
- Context7 → Prisma transactions

---

### INVENTORY-018: Receiving Workflow Backend (2h)

**File**: `app/routes/actions/inventory.receive.ts` (NEW)

**Purpose**: Backend action for receiving PO with freight/duty inputs

**API Route**:

```typescript
import { type ActionFunctionArgs } from "react-router";
import { json } from "~/utils/http.server";
import { processReceipt } from "~/services/inventory/alc";
import { updateVendorReliability } from "~/services/inventory/vendor-service";
import { syncInventoryCostToShopify } from "~/services/shopify/inventory-sync";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const poId = formData.get("poId") as string;
  const totalFreight = parseFloat(formData.get("totalFreight") as string) || 0;
  const totalDuty = parseFloat(formData.get("totalDuty") as string) || 0;
  
  // Parse line items (JSON array)
  const lineItems = JSON.parse(formData.get("lineItems") as string);
  
  // Validate inputs
  if (!poId || !lineItems || lineItems.length === 0) {
    return Response.json(
      { success: false, error: "Missing required fields" },
      { status: 400 }
    );
  }
  
  try {
    // 1. Process receipt (calculate ALC, record history)
    const { receiptBreakdowns, alcUpdates } = await processReceipt(
      poId,
      lineItems,
      totalFreight,
      totalDuty
    );
    
    // 2. Sync ALC to Shopify for each variant
    for (const update of alcUpdates) {
      await syncInventoryCostToShopify(update.variantId, update.newALC);
    }
    
    // 3. Update PO status
    const po = await prisma.purchaseOrder.update({
      where: { id: poId },
      data: {
        status: 'received',
        actualDeliveryDate: new Date()
      },
      include: { vendor: true }
    });
    
    // 4. Update vendor reliability score
    if (po.expectedDeliveryDate && po.actualDeliveryDate) {
      await updateVendorReliability(
        po.vendorId,
        po.expectedDeliveryDate,
        po.actualDeliveryDate
      );
    }
    
    // 5. Log decision
    await logDecision({
      scope: 'ops',
      who: 'operator',
      what: 'receive_purchase_order',
      why: `PO ${po.poNumber} received: ${lineItems.length} items, freight $${totalFreight}, duty $${totalDuty}`,
      evidenceUrl: `/api/purchase-orders/${poId}`,
      createdAt: new Date()
    });
    
    return Response.json({
      success: true,
      data: {
        receiptBreakdowns,
        alcUpdates,
        vendorReliabilityUpdated: true
      }
    });
  } catch (error: any) {
    console.error("[Inventory] Receipt processing error:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
```

**Acceptance**:
- ✅ API route implemented
- ✅ Validates inputs (PO ID, line items, freight, duty)
- ✅ Calls ALC service
- ✅ Syncs to Shopify (via Integrations service)
- ✅ Updates vendor reliability
- ✅ Logs decision
- ✅ Returns receipt breakdown + ALC updates
- ✅ Error handling

**MCP Required**: 
- Context7 → React Router 7 action patterns

---

## 🔄 PHASE 11: Emergency Sourcing (5 hours) — P2 PRIORITY

**Objective**: Recommend local fast vendor when opportunity cost of stockout exceeds incremental cost

### Context

**Emergency Sourcing Logic** (from Growth Engine pack):
```
For OOS component blocking profitable bundle:

ELP (Expected Lost Profit) = feasible_sales_during_leadtime × unit_margin_bundle
IC (Incremental Cost) = (local_vendor_cost − primary_vendor_cost) × qty_needed

Recommend local vendor if:
  (ELP − IC) > 0  AND  resulting_bundle_margin ≥ 20%
```

**Example**:
- Bundle sells 5/day, margin $15/unit
- Primary vendor: 14 days lead time, $10/unit cost
- Local vendor: 3 days lead time, $13/unit cost
- OOS component needed: 100 units

```
ELP = (5 bundles/day × 11 days saved) × $15 margin = $825
IC = ($13 - $10) × 100 units = $300
Net benefit = $825 - $300 = $525 > 0 ✅ RECOMMEND
```

---

### INVENTORY-019: Emergency Sourcing Service (5h)

**File**: `app/services/inventory/emergency-sourcing.ts` (NEW)

**Functions**:

```typescript
interface EmergencySourcingInput {
  variantId: string; // OOS component
  bundleProductId: string; // Blocked bundle
  bundleMargin: number; // $/unit profit
  avgBundleSalesPerDay: number; // From demand forecast
  qtyNeeded: number; // How many units to order
}

interface VendorComparison {
  vendorId: string;
  vendorName: string;
  leadTimeDays: number;
  costPerUnit: number;
  totalCost: number;
  reliabilityScore: number;
}

interface EmergencySourcingRecommendation {
  shouldUseFastVendor: boolean;
  primaryVendor: VendorComparison;
  localVendor: VendorComparison;
  analysis: {
    daysSaved: number;
    feasibleSalesDuringSavedTime: number;
    expectedLostProfit: number;
    incrementalCost: number;
    netBenefit: number;
    resultingBundleMargin: number;
  };
  reason: string;
}

export async function analyzeEmergencySourcing(
  input: EmergencySourcingInput
): Promise<EmergencySourcingRecommendation> {
  // 1. Get vendor options
  const vendors = await prisma.vendorProductMapping.findMany({
    where: { variantId: input.variantId },
    include: { vendor: true }
  });
  
  if (vendors.length < 2) {
    throw new Error("Need at least 2 vendors for comparison");
  }
  
  // 2. Identify primary (best reliability) and local fast (shortest lead time)
  const primaryVendor = vendors.reduce((best, v) => 
    (v.vendor.reliabilityScore || 0) > (best.vendor.reliabilityScore || 0) ? v : best
  );
  
  const localVendor = vendors.reduce((fastest, v) => 
    v.vendor.leadTimeDays < fastest.vendor.leadTimeDays ? v : fastest
  );
  
  // 3. Calculate opportunity cost
  const daysSaved = primaryVendor.vendor.leadTimeDays - localVendor.vendor.leadTimeDays;
  const feasibleSales = input.avgBundleSalesPerDay * daysSaved;
  const expectedLostProfit = feasibleSales * input.bundleMargin;
  
  // 4. Calculate incremental cost
  const incrementalCost = (localVendor.costPerUnit - primaryVendor.costPerUnit) * input.qtyNeeded;
  
  // 5. Calculate net benefit
  const netBenefit = expectedLostProfit - incrementalCost;
  
  // 6. Calculate resulting bundle margin (after paying more for component)
  const componentCostIncrease = localVendor.costPerUnit - primaryVendor.costPerUnit;
  const resultingBundleMargin = input.bundleMargin - componentCostIncrease;
  const resultingMarginPct = resultingBundleMargin / input.bundleMargin;
  
  // 7. Make recommendation
  const shouldUseFast = netBenefit > 0 && resultingMarginPct >= 0.20;
  
  const reason = shouldUseFast
    ? `Net benefit of $${netBenefit.toFixed(2)} by saving ${daysSaved} days. Bundle margin remains ${(resultingMarginPct * 100).toFixed(1)}%.`
    : netBenefit <= 0
      ? `Incremental cost ($${incrementalCost.toFixed(2)}) exceeds expected lost profit ($${expectedLostProfit.toFixed(2)}).`
      : `Bundle margin would drop to ${(resultingMarginPct * 100).toFixed(1)}% (below 20% threshold).`;
  
  return {
    shouldUseFastVendor: shouldUseFast,
    primaryVendor: {
      vendorId: primaryVendor.vendorId,
      vendorName: primaryVendor.vendor.name,
      leadTimeDays: primaryVendor.vendor.leadTimeDays,
      costPerUnit: primaryVendor.costPerUnit,
      totalCost: primaryVendor.costPerUnit * input.qtyNeeded,
      reliabilityScore: primaryVendor.vendor.reliabilityScore || 0
    },
    localVendor: {
      vendorId: localVendor.vendorId,
      vendorName: localVendor.vendor.name,
      leadTimeDays: localVendor.vendor.leadTimeDays,
      costPerUnit: localVendor.costPerUnit,
      totalCost: localVendor.costPerUnit * input.qtyNeeded,
      reliabilityScore: localVendor.vendor.reliabilityScore || 0
    },
    analysis: {
      daysSaved,
      feasibleSalesDuringSavedTime: feasibleSales,
      expectedLostProfit,
      incrementalCost,
      netBenefit,
      resultingBundleMargin: resultingMarginPct
    },
    reason
  };
}

// Generate Action Queue card for emergency sourcing
export async function generateEmergencySourcingAction(
  variantId: string,
  bundleProductId: string
): Promise<ActionQueueCard | null> {
  // Get bundle demand forecast
  const forecast = await getDemandForecast(bundleProductId);
  const bundleMetrics = await getProductMetrics(bundleProductId);
  
  // Analyze emergency sourcing
  const recommendation = await analyzeEmergencySourcing({
    variantId,
    bundleProductId,
    bundleMargin: bundleMetrics.margin,
    avgBundleSalesPerDay: forecast.avgDailyDemand,
    qtyNeeded: 100 // Or calculate based on forecast
  });
  
  if (!recommendation.shouldUseFastVendor) {
    return null; // Don't create action if not recommended
  }
  
  // Create Action card
  return {
    type: 'inventory',
    title: `Emergency Sourcing: ${bundleMetrics.title}`,
    description: recommendation.reason,
    expectedRevenue: recommendation.analysis.netBenefit,
    confidence: 0.85,
    ease: 0.7,
    evidence: {
      daysSaved: recommendation.analysis.daysSaved,
      netBenefit: recommendation.analysis.netBenefit,
      incrementalCost: recommendation.analysis.incrementalCost,
      primaryVendor: recommendation.primaryVendor,
      localVendor: recommendation.localVendor
    }
  };
}
```

**Tests**: `tests/unit/services/inventory/emergency-sourcing.spec.ts`
- Test ELP calculation (positive case)
- Test IC calculation (positive case)
- Test net benefit > 0 (recommend fast vendor)
- Test net benefit < 0 (use primary vendor)
- Test margin threshold (20% minimum)
- Test Action card generation

**Acceptance**:
- ✅ Emergency sourcing service implemented
- ✅ ELP and IC calculations correct
- ✅ Net benefit logic correct
- ✅ 20% margin threshold enforced
- ✅ Action card generation works
- ✅ Unit tests passing (100% coverage)
- ✅ No linter errors

**MCP Required**: 
- Context7 → TypeScript algorithms, business logic

---

## 📋 Acceptance Criteria (All Tasks)

### Phase 10: Vendor/ALC Services (9h)
- ✅ INVENTORY-016: Vendor service enhancement (reliability scoring, best vendor selection)
- ✅ INVENTORY-017: ALC calculation service (freight/duty by weight, history snapshots)
- ✅ INVENTORY-018: Receiving workflow backend (API route, Shopify sync, vendor updates)
- ✅ All unit tests passing (100% coverage for new functions)
- ✅ Integration with Data agent's tables
- ✅ TypeScript clean, no linter errors

### Phase 11: Emergency Sourcing (5h)
- ✅ INVENTORY-019: Emergency sourcing service (ELP/IC calculation, 20% margin threshold)
- ✅ Action Queue card generation
- ✅ All unit tests passing
- ✅ TypeScript clean, no linter errors

---

## 🔧 Tools & Resources

### MCP Tools (MANDATORY)
1. **Context7 MCP**: For all service development
   - TypeScript algorithms (weighted averages, business logic)
   - Prisma relations, transactions, aggregations
   - React Router 7 action patterns
   - Decimal precision for currency calculations

2. **Web Search**: LAST RESORT ONLY

### Evidence Requirements (CI Merge Blockers)
1. **MCP Evidence JSONL**: `artifacts/inventory/<date>/mcp/vendor-alc.jsonl` and `mcp/emergency-sourcing.jsonl`
2. **Heartbeat NDJSON**: `artifacts/inventory/<date>/heartbeat.ndjson` (append every 15min)
3. **Dev MCP Check**: Verify NO Dev MCP imports in `app/`
4. **PR Template**: Fill out all sections

### Testing
- Unit tests for ALL new functions
- Test edge cases (division by zero, no vendors, negative margins)
- Test decimal precision (currency calculations)

---

## 🎯 Execution Order

**START NOW** - No idle time:

1. **INVENTORY-016**: Vendor Service Enhancement (3h) → START IMMEDIATELY
   - Pull Context7: Prisma relations
   - Implement reliability scoring
   - Implement best vendor selection
   - Write unit tests

2. **INVENTORY-017**: ALC Calculation Service (4h)
   - Pull Context7: TypeScript algorithms, decimal precision
   - Implement freight/duty distribution BY WEIGHT
   - Implement ALC calculation (includes previous inventory)
   - Implement cost history snapshots
   - Write unit tests

3. **INVENTORY-018**: Receiving Workflow Backend (2h)
   - Pull Context7: React Router 7 actions
   - Implement API route
   - Integrate ALC service
   - Integrate Shopify sync (via Integrations)
   - Update vendor reliability

4. **INVENTORY-019**: Emergency Sourcing Service (5h)
   - Pull Context7: TypeScript business logic
   - Implement ELP/IC calculations
   - Implement 20% margin threshold
   - Generate Action Queue cards
   - Write unit tests

**Total**: 14 hours (Phase 10: 9h, Phase 11: 5h)

**Expected Output**:
- 3 new services (~800-1,000 lines total)
- 1 API route
- 80+ unit tests
- Integration with Data agent's tables
- Integration with Integrations agent's Shopify sync

---

## 🚨 Critical Reminders

1. **NO IDLE**: Start INVENTORY-016 immediately after reading this direction
2. **MCP FIRST**: Pull Context7 docs BEFORE every task
3. **Evidence JSONL**: Create `artifacts/inventory/2025-10-21/mcp/` and log every MCP call
4. **Heartbeat**: Tasks >2h, append to `artifacts/inventory/2025-10-21/heartbeat.ndjson` every 15min
5. **DEPENDENCY**: Wait for Data agent to complete DATA-017, DATA-018 (tables) before starting
6. **Decimal Precision**: Use TypeScript Decimal type for all currency calculations
7. **Tests**: 100% coverage for business logic functions
8. **Feedback**: Update `feedback/inventory/2025-10-21.md` every 2 hours with progress

**Questions or blockers?** → Escalate immediately in feedback with details

**Let's build! 📦**

---

## ✅ COMPLETED (2025-10-21)

**INVENTORY-016**: Vendor Service ✅ (270 lines, 14/14 tests, reliability scoring)  
**INVENTORY-017**: ALC Calculation ✅ (380 lines, 11/11 tests, weighted avg)  
**INVENTORY-018**: Receiving Workflow ✅ (API route, integrated with vendor + ALC)

**Evidence**: Commits + Context7 MCP (Prisma, TypeScript algorithms)

---

## 🔧 MANDATORY: DEV MEMORY

```typescript
import { logDecision } from '~/services/decisions.server';
await logDecision({
  scope: 'build',
  actor: 'inventory',
  action: 'task_completed',
  rationale: 'INVENTORY-019: Emergency sourcing logic implemented',
  evidenceUrl: 'artifacts/inventory/2025-10-21/emergency-sourcing.md'
});
```

Call at EVERY task completion. 100% DB protection active.
