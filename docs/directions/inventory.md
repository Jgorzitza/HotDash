# Inventory Direction v5.2

📌 **FIRST ACTION: Git Setup**
```bash
cd /home/justin/HotDash/hot-dash
git fetch origin
git checkout manager-reopen-20251020
git pull origin manager-reopen-20251020
git branch --show-current  # Verify: should show manager-reopen-20251020
```

**Owner**: Manager  
**Effective**: 2025-10-21T03:10Z  
**Version**: 5.2  
**Status**: ACTIVE — Real-Time Inventory Integration

---

## Objective

**Integrate inventory system with Engineer's dashboard tiles and modals**

**Primary Reference**: `docs/manager/PROJECT_PLAN.md` (Option A Execution Plan — LOCKED)

**Context**: Your INVENTORY-001 through INVENTORY-005 complete. Engineer has built 8 dashboard tiles including Inventory Risk tile. NOW integrate your backend services with Engineer's UI.

---

## ACTIVE TASKS (START NOW - 6h)

### INVENTORY-006: Inventory Modal Backend Integration (2h)

**Engineer has**: Inventory modal UI (ENG-007) with 14-day chart placeholder  
**You provide**: Real data endpoints

**Create API Routes**:

**File**: `app/routes/api.inventory.product.$productId.ts`
```typescript
// GET /api/inventory/product/:productId
// Returns: current stock, ROP, safety stock, seasonal factor, vendor info
export async function loader({ params }: LoaderFunctionArgs) {
  const { productId } = params;
  
  // Call your services:
  const rop = await calculateSeasonalROP(productId);
  const forecast = await getDemandForecast(productId);
  const vendor = await getVendorInfo(productId);
  const poStatus = await getPOTracking(productId);
  
  return Response.json({
    productId,
    currentStock: 42, // from Shopify
    reorderPoint: rop,
    safetyStock: 15,
    seasonalFactor: 1.25,
    forecast30d: forecast,
    vendor,
    purchaseOrders: poStatus,
  });
}
```

**File**: `app/routes/api.inventory.chart-data.$productId.ts`
```typescript
// GET /api/inventory/chart-data/:productId
// Returns: 14-day demand velocity for chart
export async function loader({ params }: LoaderFunctionArgs) {
  const chartData = await get14DayChartData(params.productId);
  return Response.json(chartData);
}
```

**Deliverables**:
- [ ] 2 API routes created
- [ ] Routes return real data from your services
- [ ] Test routes with curl or browser
- [ ] Document in `docs/integrations/inventory-modal-api.md`

---

### INVENTORY-007: Real-Time Inventory Tile Data (2h)

**Engineer has**: Inventory Risk tile showing mock data  
**You provide**: Real inventory status calculations

**Create Service**: `app/services/inventory/tile-data.ts`

```typescript
export async function getInventoryTileData() {
  // Calculate from ALL products:
  const allProducts = await getAllProducts(); // from Shopify
  
  const statusBuckets = {
    inStock: 0,
    lowStock: 0,
    outOfStock: 0,
    urgentReorder: 0,
  };
  
  const topRisks: Array<{
    productId: string;
    productName: string;
    currentStock: number;
    rop: number;
    daysUntilStockout: number;
  }> = [];
  
  for (const product of allProducts) {
    const rop = await calculateSeasonalROP(product.id);
    const forecast = await getDemandForecast(product.id);
    
    // Bucket logic
    if (product.stock === 0) statusBuckets.outOfStock++;
    else if (product.stock < rop * 0.5) statusBuckets.urgentReorder++;
    else if (product.stock < rop) statusBuckets.lowStock++;
    else statusBuckets.inStock++;
    
    // Calculate days until stockout
    const dailyDemand = forecast.forecast_30d / 30;
    const daysLeft = product.stock / dailyDemand;
    
    if (daysLeft < 7) {
      topRisks.push({
        productId: product.id,
        productName: product.title,
        currentStock: product.stock,
        rop,
        daysUntilStockout: Math.ceil(daysLeft),
      });
    }
  }
  
  // Sort top 5 risks
  topRisks.sort((a, b) => a.daysUntilStockout - b.daysUntilStockout);
  
  return {
    statusBuckets,
    topRisks: topRisks.slice(0, 5),
    lastUpdated: new Date().toISOString(),
  };
}
```

**Create API Route**: `app/routes/api.inventory.tile-data.ts`
```typescript
export async function loader() {
  const data = await getInventoryTileData();
  return Response.json(data);
}
```

**Deliverables**:
- [ ] Service calculates real-time inventory status
- [ ] API route returns tile data
- [ ] Test with multiple products
- [ ] Notify Engineer when ready

---

### INVENTORY-008: Kits & Bundles Support (2h)

**Engineer needs**: Ability to handle BUNDLE:TRUE SKUs in modals

**Implement Bundle Logic**:

**File**: `app/services/inventory/bundles.ts`
```typescript
export interface BundleComponent {
  componentProductId: string;
  quantity: number;
}

export async function getBundleComponents(bundleProductId: string): Promise<BundleComponent[]> {
  // Parse metafield: BUNDLE:TRUE,COMPONENTS:SKU1:2,SKU2:3
  const product = await getProduct(bundleProductId);
  const metafield = product.metafield?.value || '';
  
  if (!metafield.includes('BUNDLE:TRUE')) {
    return [];
  }
  
  // Parse COMPONENTS:SKU1:2,SKU2:3
  const componentsStr = metafield.match(/COMPONENTS:([^,]+)/)?.[1] || '';
  const components = componentsStr.split(',').map(part => {
    const [sku, qty] = part.split(':');
    return { componentProductId: sku, quantity: parseInt(qty) };
  });
  
  return components;
}

export async function calculateBundleROP(bundleProductId: string): Promise<number> {
  const components = await getBundleComponents(bundleProductId);
  
  if (components.length === 0) {
    // Regular product
    return calculateSeasonalROP(bundleProductId);
  }
  
  // Bundle: ROP = min(component_stock / component_qty_per_bundle)
  const componentROPs = await Promise.all(
    components.map(async c => {
      const componentStock = await getProductStock(c.componentProductId);
      return Math.floor(componentStock / c.quantity);
    })
  );
  
  return Math.min(...componentROPs);
}
```

**Integration**: Update existing ROP routes to handle bundles

**Deliverables**:
- [ ] Bundle parsing service
- [ ] ROP calculation handles bundles
- [ ] Test with bundle SKUs
- [ ] Document bundle format

---

## Work Protocol

**1. MCP Tools** (Use Context7 before implementing):
```bash
# React Router 7 for API routes:
mcp_context7_get-library-docs("/websites/reactrouter", "loaders API routes")

# TypeScript for type safety:
mcp_context7_get-library-docs("/microsoft/TypeScript", "type guards async")
```

**2. Coordinate with Engineer**:
- Notify when API routes ready for testing
- Provide API documentation
- Support integration issues

**3. Reporting (Every 2 hours)**:
```md
## YYYY-MM-DDTHH:MM:SSZ — Inventory: Modal Integration

**Working On**: INVENTORY-006 (API routes for Inventory Modal)
**Progress**: 60% - Product endpoint complete, chart endpoint in progress

**Evidence**:
- Files: app/routes/api.inventory.product.$productId.ts (87 lines)
- Routes tested: curl /api/inventory/product/123 → 200 OK
- Context7: React Router 7 loader patterns verified
- Engineer notified: Routes ready for UI integration

**Blockers**: None
**Next**: Complete chart data endpoint, test with real productIds
```

---

## Definition of Done

**INVENTORY-006**:
- [ ] 2 API routes created and tested
- [ ] Routes return real data from services
- [ ] Integration doc written
- [ ] Engineer notified

**INVENTORY-007**:
- [ ] Tile data service calculates buckets + risks
- [ ] API route functional
- [ ] Tested with 10+ products
- [ ] Engineer can fetch tile data

**INVENTORY-008**:
- [ ] Bundle parsing works
- [ ] ROP calculation handles bundles
- [ ] Tested with BUNDLE:TRUE SKUs
- [ ] Documentation updated

---

## Critical Reminders

**DO**:
- ✅ Use MCP Context7 for React Router 7 API patterns
- ✅ Test all routes before notifying Engineer
- ✅ Handle errors gracefully (fallback to mock data if Shopify fails)
- ✅ Coordinate actively with Engineer

**DO NOT**:
- ❌ Break existing inventory services
- ❌ Hardcode product IDs (make routes dynamic)
- ❌ Skip error handling
- ❌ Wait idle - if blocked, move to next task

---

## Timeline

**NOW - Hour 2**: INVENTORY-006 (API routes)  
**Hour 2-4**: INVENTORY-007 (Tile data)  
**Hour 4-6**: INVENTORY-008 (Bundles)

**Total**: 6 hours ACTIVE work

---

## Quick Reference

**Plan**: `docs/manager/PROJECT_PLAN.md`  
**Your Services**: app/services/inventory/*.ts  
**Engineer Tiles**: app/components/tiles/InventoryRiskTile.tsx  
**Feedback**: `feedback/inventory/2025-10-21.md`

---

**START WITH**: INVENTORY-006 (API routes) — Integrate backend with Engineer's UI NOW

---

## Credential & Blocker Protocol

### If You Need Credentials:

**Step 1**: Check `vault/` directory first
- Shopify credentials: `vault/occ/shopify/`
- Supabase credentials: `vault/occ/supabase/`

**Step 2**: If not in vault, report in feedback:
```md
## HH:MM - Credential Request
**Need**: [specific credential name]
**For**: [what task/feature]
**Checked**: vault/occ/<path>/ (not found)
**Status**: Moving to next task, awaiting CEO
```

**Step 3**: Move to next task immediately (don't wait idle)

### If You Hit a True Blocker:

**Before reporting blocker, verify you**:
1. ✅ Checked vault for credentials
2. ✅ Inspected codebase for existing patterns
3. ✅ Pulled Context7 docs for the library
4. ✅ Reviewed RULES.md and relevant direction sections

**If still blocked**:
```md
## HH:MM - Blocker Report
**Blocked On**: [specific issue]
**What I Tried**: [list 3+ things you attempted]
**Vault Checked**: [yes/no, paths checked]
**Docs Pulled**: [Context7 libraries consulted]
**Asking Manager**: [specific question or guidance needed]
**Moving To**: [next task ID you're starting]
```

**Then immediately move to next task** - Manager will respond when available

**Key Principle**: NEVER sit idle. If one task blocked → start next task right away.

---

## NO MORE STANDBY - ACTIVE WORK ASSIGNED

**Previous Status**: ❌ STANDBY (VIOLATION)  
**New Status**: ✅ ACTIVE - 3 tasks assigned (6h work)

Start INVENTORY-006 immediately.
