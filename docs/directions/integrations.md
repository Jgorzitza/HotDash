# Integrations Direction v7.0 — Growth Engine Integration

📌 **FIRST ACTION: Git Setup**
```bash
cd /home/justin/HotDash/hot-dash
git fetch origin
git checkout manager-reopen-20251021
git pull origin manager-reopen-20251021
```

**Owner**: Manager  
**Effective**: 2025-10-21T20:30Z  
**Version**: 9.0  
**Status**: ✅ ALL PHASE 10-11 TASKS COMPLETE (2025-10-21T17:25Z) — Cross-Functional Work Assigned

---

## ✅ ALL PREVIOUS INTEGRATIONS TASKS COMPLETE

**Completed** (from feedback/integrations/2025-10-21.md):
- ✅ INTEGRATIONS-001: Publer API Client (OAuth, retry, error handling)
- ✅ INTEGRATIONS-002: Publer Adapter (HITL workflow)
- ✅ INTEGRATIONS-003: Social Post Queue (priority, auto-retry)
- ✅ INTEGRATIONS-004: API Rate Limiting (token bucket)
- ✅ INTEGRATIONS-005: API Testing (with real credentials)
- ✅ INTEGRATIONS-006: Integration Tests (51 tests passing)
- ✅ INTEGRATIONS-007: Webhook Support (HMAC verification)
- ✅ INTEGRATIONS-008: Shopify Inventory Sync (GraphQL + webhooks)
- ✅ INTEGRATIONS-009: Health Monitoring (Publer, Shopify, Chatwoot)
- ✅ INTEGRATIONS-010: Contract Testing (included in 006)
- ✅ INTEGRATIONS-011: Documentation (1,783 lines)

**Total Output**: 11 tasks, 51 tests passing, 1,783 lines documentation

---

## 🎯 NEW: Growth Engine Architecture (Effective 2025-10-21)

**Context**: Growth Engine Final Pack integrated into project (commit: 546bd0e)

### Security & Evidence Requirements (CI Merge Blockers)
1. **MCP Evidence JSONL** (code changes): `artifacts/integrations/<date>/mcp/<tool>.jsonl`
2. **Heartbeat NDJSON** (tasks >2h): `artifacts/integrations/<date>/heartbeat.ndjson` (15min max staleness)
3. **Dev MCP Ban**: NO Dev MCP imports in `app/` (production code only)
4. **PR Template**: Must include MCP Evidence + Heartbeat + Dev MCP Check sections

**See**: `.cursor/rules/10-growth-engine-pack.mdc` for full requirements

---

## ✅ PHASE 10-11: ALL 5 TASKS COMPLETE (2025-10-21)

**Completion**: 2025-10-21T17:25Z (5 tasks in 2.5 hours!)  
**Evidence**: 6 files created (990 lines), 13 GraphQL validated, 5/5 tests passing, 9 MCP calls

**Completed Tasks**:
1. ✅ INTEGRATIONS-012: Shopify Cost Sync Service (inventoryItemUpdate mutation)
2. ✅ INTEGRATIONS-013: Metafield Definitions (BOM components)
3. ✅ INTEGRATIONS-014: Bundle Inventory Service (virtual stock calculations)
4. ✅ INTEGRATIONS-015: Warehouse Reconciliation (nightly cron 02:00 PST)
5. ✅ INTEGRATIONS-016: Bundle Editor UI Backend (POST /api/bundles/set-bom)

**Total Output**: 990 lines, 13 GraphQL operations validated via Shopify Dev MCP

---

## ✅ INTEGRATIONS-012: Shopify Cost Sync — COMPLETE

**Objective**: Sync Average Landed Cost (ALC) to Shopify `inventoryItem.unitCost` after every receipt

**Delivered** (2025-10-21T16:58Z):
- File: `app/services/shopify/inventory-cost-sync.ts` (177 lines)
- Tests: `tests/unit/services/shopify/inventory-cost-sync.spec.ts` (5/5 passing ✅)
- GraphQL: 2/2 validated (inventoryItemUpdate, productVariant)
- Rate limiting: 1s delay (respects Shopify 2 req/sec)
- Evidence: Commits + MCP JSONL

**Functions**: syncInventoryCostToShopify(), syncMultipleInventoryCosts()

---

## ✅ INTEGRATIONS-013-016: ALL REMAINING TASKS — COMPLETE

**INTEGRATIONS-013**: Metafield Definitions (244 lines, 3 GraphQL validated)  
**INTEGRATIONS-014**: Bundle Inventory Service (238 lines, 2 GraphQL validated)  
**INTEGRATIONS-015**: Warehouse Reconciliation + Nightly Cron (231 lines + script, 3 GraphQL validated)  
**INTEGRATIONS-016**: Bundle Editor UI Backend (68 lines API route)

**Total**: 958 additional lines, 13 GraphQL operations, 9 MCP calls total

---

## 🔧 MANDATORY: DEV MEMORY SYSTEM (Effective Immediately)

**ALL INTEGRATIONS WORK MUST**: Call `logDecision()` at task completion

```typescript
import { logDecision } from '~/services/decisions.server';

await logDecision({
  scope: 'build',
  actor: 'integrations',
  action: 'task_completed',
  rationale: 'INTEGRATIONS-012: Shopify cost sync service with 5/5 tests passing',
  evidenceUrl: 'artifacts/integrations/2025-10-21/shopify-cost-sync-complete.md'
});
```

**Protection**: 100% database safety (triggers prevent delete/update)

---

## 🔄 CROSS-FUNCTIONAL SUPPORT WORK (3 hours) — START NOW

**Strategic Deployment**: Support Analytics and Inventory with integration expertise

### INTEGRATIONS-017: Analytics GA4 Integration Support (1.5h) — P1

**Objective**: Help Analytics (ANALYTICS-017) implement action attribution GA4 queries

**Owner**: Integrations (GA4 expert)  
**Beneficiary**: Analytics

**Work**:
- Review Analytics' GA4 Data API implementation
- Help with authentication (service account from vault/occ/google/)
- Assist with dimension filtering (`hd_action_key` custom dimension)
- Debug any API errors or quota issues
- Optimize query performance (batch requests, caching)

**Dependencies**: None (can start immediately)

**Acceptance**: ✅ Analytics can query GA4 successfully, attribution working

---

### INTEGRATIONS-018: Inventory Emergency Sourcing Integration (1.5h) — P2

**Objective**: Help Inventory (INVENTORY-019) with vendor API integrations for emergency sourcing

**Owner**: Integrations  
**Beneficiary**: Inventory

**Work**:
- Provide patterns for external vendor API calls
- Help with rate limiting implementation
- Assist with error handling and retries
- Review webhook integration for automated quotes

**Dependencies**: Inventory starts INVENTORY-019

**Acceptance**: ✅ Inventory emergency sourcing can call vendor APIs

---

**Total Assigned**: 3 hours supporting Analytics + Inventory (NO IDLE)

---

## 🎯 ARCHIVED: Phase 10-11 Task Details (For Reference)

### Original Objective

### Prerequisites
- ✅ Inventory agent completes INVENTORY-017 (ALC calculation service) — DEPENDENCY

### Context

**CEO Requirement**: "Ensure Shopify current cost is updated during this process"

**Flow**:
```
1. PO received → Inventory calculates new ALC
2. Inventory calls Integrations.syncInventoryCostToShopify(variantId, newALC)
3. Integrations pushes to Shopify via inventoryItemUpdate mutation
4. Shopify admin shows correct cost
5. Affects: Inventory valuation reports, margin calculations
```

---

### INTEGRATIONS-012: Shopify Cost Sync Service (2h)

**File**: `app/services/shopify/inventory-cost-sync.ts` (NEW)

**Purpose**: Update Shopify inventoryItem.unitCost via GraphQL mutation

**GraphQL Mutation**:

```graphql
mutation inventoryItemUpdate($id: ID!, $input: InventoryItemInput!) {
  inventoryItemUpdate(id: $id, input: $input) {
    inventoryItem {
      id
      unitCost {
        amount
        currencyCode
      }
      updatedAt
    }
    userErrors {
      field
      message
    }
  }
}
```

**Service Functions**:

```typescript
import { shopifyAdmin } from "~/config/shopify.server";

interface CostSyncResult {
  success: boolean;
  variantId: string;
  previousCost?: number;
  newCost: number;
  shopifyInventoryItemId?: string;
  updatedAt?: string;
  error?: string;
}

// Get inventory item ID from variant ID
async function getInventoryItemIdFromVariant(
  variantGid: string
): Promise<string | null> {
  const query = `
    query getInventoryItemId($id: ID!) {
      productVariant(id: $id) {
        inventoryItem {
          id
        }
      }
    }
  `;
  
  const response = await shopifyAdmin.graphql(query, {
    variables: { id: variantGid }
  });
  
  return response.data?.productVariant?.inventoryItem?.id || null;
}

// Update inventory item cost
export async function syncInventoryCostToShopify(
  variantId: string,
  newCost: number
): Promise<CostSyncResult> {
  try {
    // 1. Get inventory item ID
    const inventoryItemId = await getInventoryItemIdFromVariant(variantId);
    
    if (!inventoryItemId) {
      return {
        success: false,
        variantId,
        newCost,
        error: "Inventory item not found for variant"
      };
    }
    
    // 2. Get current cost (for logging)
    const currentCostQuery = `
      query getCurrentCost($id: ID!) {
        inventoryItem(id: $id) {
          unitCost {
            amount
          }
        }
      }
    `;
    
    const currentCostResponse = await shopifyAdmin.graphql(currentCostQuery, {
      variables: { id: inventoryItemId }
    });
    
    const previousCost = parseFloat(
      currentCostResponse.data?.inventoryItem?.unitCost?.amount || "0"
    );
    
    // 3. Update cost
    const mutation = `
      mutation inventoryItemUpdate($id: ID!, $input: InventoryItemInput!) {
        inventoryItemUpdate(id: $id, input: $input) {
          inventoryItem {
            id
            unitCost {
              amount
              currencyCode
            }
            updatedAt
          }
          userErrors {
            field
            message
          }
        }
      }
    `;
    
    const updateResponse = await shopifyAdmin.graphql(mutation, {
      variables: {
        id: inventoryItemId,
        input: {
          cost: newCost.toFixed(2) // Shopify expects string with 2 decimals
        }
      }
    });
    
    // 4. Check for errors
    const userErrors = updateResponse.data?.inventoryItemUpdate?.userErrors || [];
    
    if (userErrors.length > 0) {
      return {
        success: false,
        variantId,
        newCost,
        shopifyInventoryItemId: inventoryItemId,
        error: userErrors.map((e: any) => e.message).join(", ")
      };
    }
    
    // 5. Success
    const updatedItem = updateResponse.data?.inventoryItemUpdate?.inventoryItem;
    
    return {
      success: true,
      variantId,
      previousCost,
      newCost,
      shopifyInventoryItemId: inventoryItemId,
      updatedAt: updatedItem?.updatedAt
    };
  } catch (error: any) {
    console.error("[Shopify] Cost sync error:", error);
    
    return {
      success: false,
      variantId,
      newCost,
      error: error.message || "Unknown error"
    };
  }
}

// Batch update for multiple variants (from single PO receipt)
export async function syncMultipleInventoryCosts(
  updates: Array<{ variantId: string; newCost: number }>
): Promise<CostSyncResult[]> {
  const results: CostSyncResult[] = [];
  
  for (const update of updates) {
    const result = await syncInventoryCostToShopify(update.variantId, update.newCost);
    results.push(result);
    
    // Rate limit: 2 requests/second (Shopify limit)
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  return results;
}
```

**Integration Point**: Called from Inventory receiving workflow (INVENTORY-018)

**Tests**: `tests/unit/services/shopify/inventory-cost-sync.spec.ts`
- Test get inventory item ID from variant
- Test cost update success
- Test cost update with userErrors
- Test batch updates
- Test rate limiting (500ms delay between requests)
- Mock Shopify GraphQL responses

**Acceptance**:
- ✅ Cost sync service implemented
- ✅ GraphQL mutation correct
- ✅ Get inventory item ID from variant ID
- ✅ Batch updates supported
- ✅ Rate limiting enforced (500ms between requests)
- ✅ Error handling (userErrors, network errors)
- ✅ Unit tests passing (100% coverage)
- ✅ Shopify Dev MCP validation passed

**MCP Required**: 
- Shopify Dev MCP → inventoryItem, inventoryItemUpdate mutation + VALIDATE with `validate_graphql_codeblocks`

---

## 🔄 PHASE 11: Bundles-BOM + Warehouse Reconcile (11 hours) — P1 PRIORITY

### Context

**Bundles-BOM** (CEO clarification):
- Keep `PACK:X` tags for picker payouts (simpler)
- Add metafields for inventory tracking (actual component variants)
- **Dual System**: Tags for payouts, metafields for inventory management

**Warehouse Reconciliation** (CEO clarification):
- Not critical (app not live), build into dev process
- Main WH = primary inventory
- Canada WH = used for label printing, goes negative
- **Nightly Sync**: Reset Canada negative → adjust Main WH by offset

---

### INTEGRATIONS-013: Shopify Metafield Definitions (2h)

**File**: `app/services/shopify/metafield-definitions.ts` (NEW)

**Purpose**: Create metafield definitions for BOM components

**Metafield Definitions**:

```typescript
// Namespace: hotdash
// Owner: PRODUCT (bundle product)
// Key: bom.components
// Type: json
// Value format:
{
  "components": [
    {
      "handle": "20ft-braided-hose",
      "variant_map": {
        "black": "gid://shopify/ProductVariant/111",
        "red": "gid://shopify/ProductVariant/222"
      },
      "qty": 1
    },
    {
      "handle": "hose-nut",
      "variant_map": {
        "black": "gid://shopify/ProductVariant/333"
      },
      "qty": 8
    }
  ],
  "parameters": ["color"]
}

// Namespace: hotdash
// Owner: PRODUCT
// Key: bom.is_component
// Type: boolean
// Value: true (marks product as a component, not sold standalone)
```

**Service Functions**:

```typescript
import { shopifyAdmin } from "~/config/shopify.server";

// Create metafield definitions (run once)
export async function createBOMMetafieldDefinitions() {
  const definitions = [
    {
      name: "BOM Components",
      namespace: "hotdash",
      key: "bom_components",
      ownerType: "PRODUCT",
      type: "json",
      description: "Bill of Materials: Component variants and quantities for bundle products"
    },
    {
      name: "Is Component",
      namespace: "hotdash",
      key: "bom_is_component",
      ownerType: "PRODUCT",
      type: "boolean",
      description: "Marks product as a component (not sold standalone)"
    }
  ];
  
  for (const def of definitions) {
    const mutation = `
      mutation createMetafieldDefinition($definition: MetafieldDefinitionInput!) {
        metafieldDefinitionCreate(definition: $definition) {
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
    `;
    
    await shopifyAdmin.graphql(mutation, {
      variables: { definition: def }
    });
  }
}

// Set BOM components on bundle product
export async function setBOMComponents(
  productId: string,
  components: Array<{
    handle: string;
    variantMap: Record<string, string>;
    qty: number;
  }>,
  parameters: string[]
) {
  const bomData = {
    components: components.map(c => ({
      handle: c.handle,
      variant_map: c.variantMap,
      qty: c.qty
    })),
    parameters
  };
  
  const mutation = `
    mutation productUpdate($input: ProductInput!) {
      productUpdate(input: $input) {
        product {
          id
          metafield(namespace: "hotdash", key: "bom_components") {
            value
          }
        }
        userErrors {
          field
          message
        }
      }
    }
  `;
  
  return await shopifyAdmin.graphql(mutation, {
    variables: {
      input: {
        id: productId,
        metafields: [
          {
            namespace: "hotdash",
            key: "bom_components",
            type: "json",
            value: JSON.stringify(bomData)
          }
        ]
      }
    }
  });
}

// Get BOM components for bundle
export async function getBOMComponents(productId: string) {
  const query = `
    query getProduct($id: ID!) {
      product(id: $id) {
        metafield(namespace: "hotdash", key: "bom_components") {
          value
        }
      }
    }
  `;
  
  const response = await shopifyAdmin.graphql(query, {
    variables: { id: productId }
  });
  
  const metafield = response.data?.product?.metafield;
  
  if (!metafield) return null;
  
  return JSON.parse(metafield.value);
}
```

**Tests**: `tests/unit/services/shopify/metafield-definitions.spec.ts`
- Test metafield definition creation
- Test BOM components set
- Test BOM components get
- Test JSON parsing/serialization
- Mock Shopify GraphQL responses

**Acceptance**:
- ✅ Metafield definitions service implemented
- ✅ Create definitions function (run once)
- ✅ Set BOM components function
- ✅ Get BOM components function
- ✅ JSON schema validation
- ✅ Unit tests passing
- ✅ Shopify Dev MCP validation passed

**MCP Required**: 
- Shopify Dev MCP → metafieldDefinitionCreate, productUpdate + VALIDATE with `validate_graphql_codeblocks`

---

### INTEGRATIONS-014: Bundle Inventory Service (3h)

**File**: `app/services/shopify/bundle-inventory.ts` (NEW)

**Purpose**: Calculate virtual bundle stock based on BOM component availability

**Service Functions**:

```typescript
// Calculate virtual bundle stock
export async function calculateBundleStock(productId: string) {
  // 1. Get BOM components
  const bom = await getBOMComponents(productId);
  
  if (!bom) {
    // Fallback to tags for simple bundles
    return await calculateBundleStockFromTags(productId);
  }
  
  // 2. For each component, get available qty
  const componentAvailability: Array<{ handle: string; available: number; required: number }> = [];
  
  for (const component of bom.components) {
    // Get all variants in component (parameterized)
    const variants = Object.values(component.variant_map);
    
    // Sum available across all variants
    let totalAvailable = 0;
    for (const variantId of variants) {
      const inventory = await fetchShopifyInventory(variantId as string);
      totalAvailable += inventory.available || 0;
    }
    
    componentAvailability.push({
      handle: component.handle,
      available: totalAvailable,
      required: component.qty
    });
  }
  
  // 3. Calculate virtual stock (min available / required)
  const possibleBundles = componentAvailability.map(c => 
    Math.floor(c.available / c.required)
  );
  
  const virtualStock = Math.min(...possibleBundles);
  
  return {
    virtualStock,
    componentAvailability,
    limitingComponent: componentAvailability.find(
      c => Math.floor(c.available / c.required) === virtualStock
    )
  };
}

// Decrement component inventory when bundle sold
export async function decrementBundleComponents(
  productId: string,
  qtySold: number
) {
  const bom = await getBOMComponents(productId);
  
  if (!bom) return;
  
  const adjustments = [];
  
  for (const component of bom.components) {
    const qtyToDecrement = component.qty * qtySold;
    
    // Decrement from first available variant in variant_map
    for (const variantId of Object.values(component.variant_map)) {
      const inventory = await fetchShopifyInventory(variantId as string);
      
      if (inventory.available >= qtyToDecrement) {
        // Adjust this variant
        adjustments.push({
          variantId: variantId as string,
          qtyChange: -qtyToDecrement,
          reason: `Bundle sold: ${productId} (${qtySold} units)`
        });
        break;
      }
    }
  }
  
  // Apply all adjustments via inventoryAdjustQuantities mutation
  return await adjustInventoryQuantities(adjustments);
}
```

**Integration Points**:
- Dashboard tile: Show virtual bundle stock
- Reorder alerts: Use virtual stock for ROP calculation
- Order processing: Decrement components when bundle sold

**Tests**: `tests/unit/services/shopify/bundle-inventory.spec.ts`
- Test virtual stock calculation (2 components)
- Test virtual stock with limiting component
- Test component decrement (bundle sold)
- Test fallback to tags (no metafields)
- Mock Shopify inventory queries

**Acceptance**:
- ✅ Bundle inventory service implemented
- ✅ Virtual stock calculation correct
- ✅ Component decrement logic correct
- ✅ Fallback to tags for backward compat
- ✅ Unit tests passing
- ✅ Shopify Dev MCP validation passed

**MCP Required**: 
- Shopify Dev MCP → inventoryAdjustQuantities mutation + VALIDATE

---

### INTEGRATIONS-015: Warehouse Reconciliation Service (3h)

**File**: `app/services/shopify/warehouse-reconcile.ts` (NEW)

**Purpose**: Nightly sync to reset Canada WH negative inventory and adjust Main WH

**Context**:
- Main WH (`gid://shopify/Location/XXX`): Primary inventory
- Canada WH (`gid://shopify/Location/YYY`): Label printing only
- **Problem**: Canada WH goes negative when labels printed
- **Solution**: Nightly reset Canada → 0, adjust Main by offset

**Service Functions**:

```typescript
const MAIN_WH_ID = process.env.SHOPIFY_MAIN_WH_LOCATION_ID!;
const CANADA_WH_ID = process.env.SHOPIFY_CANADA_WH_LOCATION_ID!;

interface ReconciliationResult {
  variantId: string;
  canadaNegativeQty: number;
  mainPreviousQty: number;
  canadaNewQty: number; // 0
  mainNewQty: number; // mainPrevious - canadaNegative
  adjusted: boolean;
}

// Get all products with negative Canada WH inventory
async function getProductsWithNegativeCanadaInventory(): Promise<string[]> {
  const query = `
    query getInventoryLevels($locationId: ID!) {
      location(id: $locationId) {
        inventoryLevels(first: 250, query: "available:<0") {
          edges {
            node {
              item {
                variant {
                  id
                }
              }
              available
            }
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    }
  `;
  
  // Fetch all pages (if >250 products)
  let hasNext = true;
  let cursor = null;
  const negativeVariants: Array<{ variantId: string; available: number }> = [];
  
  while (hasNext) {
    const response = await shopifyAdmin.graphql(query, {
      variables: {
        locationId: CANADA_WH_ID,
        after: cursor
      }
    });
    
    const edges = response.data?.location?.inventoryLevels?.edges || [];
    negativeVariants.push(...edges.map((e: any) => ({
      variantId: e.node.item.variant.id,
      available: e.node.available
    })));
    
    hasNext = response.data?.location?.inventoryLevels?.pageInfo?.hasNextPage || false;
    cursor = response.data?.location?.inventoryLevels?.pageInfo?.endCursor;
  }
  
  return negativeVariants;
}

// Reconcile single variant
async function reconcileVariant(variantId: string, canadaNegativeQty: number): Promise<ReconciliationResult> {
  // 1. Get current Main WH inventory
  const mainInventory = await fetchShopifyInventoryByLocation(variantId, MAIN_WH_ID);
  const mainPreviousQty = mainInventory.available || 0;
  
  // 2. Calculate adjustments
  const canadaAdjustment = -canadaNegativeQty; // Reset to 0
  const mainAdjustment = canadaNegativeQty; // Reduce by negative amount
  
  // 3. Apply adjustments via inventoryAdjustQuantities mutation
  const mutation = `
    mutation inventoryAdjustQuantities($input: InventoryAdjustQuantitiesInput!) {
      inventoryAdjustQuantities(input: $input) {
        inventoryAdjustmentGroup {
          reason
          changes {
            name
            delta
          }
        }
        userErrors {
          field
          message
        }
      }
    }
  `;
  
  const response = await shopifyAdmin.graphql(mutation, {
    variables: {
      input: {
        reason: "correction",
        name: "Nightly warehouse reconciliation",
        changes: [
          {
            inventoryItemId: await getInventoryItemId(variantId),
            locationId: CANADA_WH_ID,
            delta: canadaAdjustment
          },
          {
            inventoryItemId: await getInventoryItemId(variantId),
            locationId: MAIN_WH_ID,
            delta: mainAdjustment
          }
        ]
      }
    }
  });
  
  const userErrors = response.data?.inventoryAdjustQuantities?.userErrors || [];
  
  return {
    variantId,
    canadaNegativeQty,
    mainPreviousQty,
    canadaNewQty: 0,
    mainNewQty: mainPreviousQty + mainAdjustment,
    adjusted: userErrors.length === 0
  };
}

// Nightly reconciliation (main function)
export async function runNightlyWarehouseReconciliation(): Promise<{
  totalReconciled: number;
  results: ReconciliationResult[];
  errors: string[];
}> {
  console.log("[Warehouse Reconcile] Starting nightly reconciliation");
  
  // 1. Get all products with negative Canada inventory
  const negativeProducts = await getProductsWithNegativeCanadaInventory();
  
  console.log(`[Warehouse Reconcile] Found ${negativeProducts.length} products to reconcile`);
  
  // 2. Reconcile each
  const results: ReconciliationResult[] = [];
  const errors: string[] = [];
  
  for (const product of negativeProducts) {
    try {
      const result = await reconcileVariant(product.variantId, product.available);
      results.push(result);
      
      // Rate limit: 2 requests/second
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error: any) {
      errors.push(`${product.variantId}: ${error.message}`);
    }
  }
  
  console.log(`[Warehouse Reconcile] Reconciled ${results.filter(r => r.adjusted).length}/${results.length} products`);
  
  // 3. Log results to decision_log
  await logDecision({
    scope: 'ops',
    who: 'system',
    what: 'warehouse_reconciliation',
    why: `Nightly sync: ${results.length} products reconciled`,
    evidenceUrl: `/api/warehouse-reconcile/results`,
    createdAt: new Date()
  });
  
  return {
    totalReconciled: results.filter(r => r.adjusted).length,
    results,
    errors
  };
}
```

**Cron Schedule**: `scripts/inventory/nightly-warehouse-reconcile.ts`

```typescript
// Run daily at 02:00 America/Los_Angeles
import { runNightlyWarehouseReconciliation } from "~/services/shopify/warehouse-reconcile";

async function main() {
  console.log("[Cron] Starting nightly warehouse reconciliation");
  
  const result = await runNightlyWarehouseReconciliation();
  
  console.log(`[Cron] Complete: ${result.totalReconciled} reconciled, ${result.errors.length} errors`);
  
  if (result.errors.length > 0) {
    console.error("[Cron] Errors:", result.errors);
  }
}

main().catch(console.error);
```

**DevOps Setup**: GitHub Actions or Fly.io cron (scheduled task)

**Tests**: `tests/unit/services/shopify/warehouse-reconcile.spec.ts`
- Test get negative Canada inventory
- Test reconcile single variant
- Test batch reconciliation
- Test error handling (Shopify API errors)
- Mock Shopify GraphQL responses

**Acceptance**:
- ✅ Warehouse reconcile service implemented
- ✅ Get negative Canada inventory function
- ✅ Reconcile variant function (adjust both warehouses)
- ✅ Nightly cron script ready
- ✅ Decision logging
- ✅ Unit tests passing
- ✅ Shopify Dev MCP validation passed

**MCP Required**: 
- Shopify Dev MCP → inventoryAdjustQuantities mutation, location queries + VALIDATE

---

### INTEGRATIONS-016: Bundle Editor UI Backend (3h)

**File**: `app/routes/api.bundles.set-bom.ts` (NEW)

**Purpose**: API route for Engineer's bundle editor UI to set BOM metafields

**API Route**:

```typescript
export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const productId = formData.get("productId") as string;
  const components = JSON.parse(formData.get("components") as string);
  const parameters = JSON.parse(formData.get("parameters") as string);
  
  try {
    await setBOMComponents(productId, components, parameters);
    
    return Response.json({ success: true });
  } catch (error: any) {
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
```

**Acceptance**:
- ✅ API route implemented
- ✅ Integrates with BOM metafield service
- ✅ Error handling
- ✅ React Router 7 action pattern

**MCP Required**: 
- Context7 → React Router 7 action patterns

---

## 📋 Acceptance Criteria (All Tasks)

### Phase 10: Shopify Cost Sync (2h)
- ✅ INTEGRATIONS-012: Shopify cost sync service (inventoryItemUpdate mutation)
- ✅ Batch updates supported
- ✅ Rate limiting enforced (500ms between requests)
- ✅ Unit tests passing
- ✅ Shopify Dev MCP validation passed

### Phase 11: Bundles-BOM + Warehouse Reconcile (11h)
- ✅ INTEGRATIONS-013: Metafield definitions (BOM components, is_component)
- ✅ INTEGRATIONS-014: Bundle inventory service (virtual stock, component decrement)
- ✅ INTEGRATIONS-015: Warehouse reconciliation service (nightly sync)
- ✅ INTEGRATIONS-016: Bundle editor UI backend (API route)
- ✅ All unit tests passing
- ✅ Shopify Dev MCP validation passed for ALL GraphQL

---

## 🔧 Tools & Resources

### MCP Tools (MANDATORY)
1. **Shopify Dev MCP**: FIRST for all Shopify GraphQL
   - inventoryItemUpdate, metafieldDefinitionCreate, productUpdate
   - inventoryAdjustQuantities, location queries
   - **VALIDATE with `validate_graphql_codeblocks`** - REQUIRED

2. **Context7 MCP**: For non-Shopify code
   - React Router 7 action patterns
   - TypeScript patterns

3. **Web Search**: LAST RESORT ONLY

### Evidence Requirements (CI Merge Blockers)
1. **MCP Evidence JSONL**: `artifacts/integrations/<date>/mcp/shopify-cost-sync.jsonl`, `mcp/bundles-bom.jsonl`, `mcp/warehouse-reconcile.jsonl`
2. **Heartbeat NDJSON**: `artifacts/integrations/<date>/heartbeat.ndjson` (append every 15min)
3. **Dev MCP Check**: Verify NO Dev MCP imports in `app/`
4. **PR Template**: Fill out all sections

### Testing
- Unit tests for ALL GraphQL mutations
- Mock Shopify Admin API responses
- Test rate limiting (500ms delays)
- Test error handling (userErrors, network errors)

---

## 🎯 Execution Order

**START NOW** - No idle time:

1. **INTEGRATIONS-012**: Shopify Cost Sync (2h) → START IMMEDIATELY
   - Pull Shopify Dev MCP: inventoryItemUpdate mutation
   - Implement cost sync service
   - VALIDATE with `validate_graphql_codeblocks`
   - Write unit tests

2. **INTEGRATIONS-013**: Metafield Definitions (2h)
   - Pull Shopify Dev MCP: metafieldDefinitionCreate, productUpdate
   - Implement create/set/get BOM functions
   - VALIDATE with `validate_graphql_codeblocks`
   - Write unit tests

3. **INTEGRATIONS-014**: Bundle Inventory Service (3h)
   - Pull Shopify Dev MCP: inventoryAdjustQuantities
   - Implement virtual stock calculation
   - Implement component decrement
   - VALIDATE with `validate_graphql_codeblocks`
   - Write unit tests

4. **INTEGRATIONS-015**: Warehouse Reconciliation (3h)
   - Pull Shopify Dev MCP: location queries, inventoryAdjustQuantities
   - Implement get negative inventory function
   - Implement reconcile function
   - Create cron script
   - VALIDATE with `validate_graphql_codeblocks`
   - Write unit tests

5. **INTEGRATIONS-016**: Bundle Editor Backend (3h)
   - Pull Context7: React Router 7 actions
   - Implement API route
   - Integrate with BOM service
   - Write tests

**Total**: 13 hours (Phase 10: 2h, Phase 11: 11h)

**Expected Output**:
- 4 new services (~1,000-1,200 lines)
- 1 API route
- 1 cron script
- 60+ unit tests
- All Shopify GraphQL validated via Shopify Dev MCP

---

## 🚨 Critical Reminders

1. **NO IDLE**: Start INTEGRATIONS-012 immediately after reading this direction
2. **MCP FIRST**: Pull Shopify Dev MCP BEFORE every Shopify GraphQL mutation
3. **VALIDATE ALWAYS**: Use `validate_graphql_codeblocks` for ALL GraphQL - MANDATORY
4. **Evidence JSONL**: Create `artifacts/integrations/2025-10-21/mcp/` and log every MCP call
5. **Heartbeat**: Tasks >2h, append to `artifacts/integrations/2025-10-21/heartbeat.ndjson` every 15min
6. **Rate Limiting**: 500ms between Shopify API calls (2 req/sec limit)
7. **Error Handling**: Check userErrors in ALL GraphQL responses
8. **Feedback**: Update `feedback/integrations/2025-10-21.md` every 2 hours with progress

**Questions or blockers?** → Escalate immediately in feedback with details

**Let's build! 🔌**
