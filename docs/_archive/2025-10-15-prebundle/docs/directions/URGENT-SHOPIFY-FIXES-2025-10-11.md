---
epoch: 2025.10.E1
doc: docs/directions/URGENT-SHOPIFY-FIXES-2025-10-11.md
owner: manager
created: 2025-10-11T21:10:00Z
priority: P0-CRITICAL
expires: 2025-10-12T00:00:00Z
---

# 🚨 URGENT: Shopify GraphQL Query Fixes - P0 DEPLOY BLOCKER

**Issued**: 2025-10-11T21:10:00Z  
**Owner**: Engineer Agent  
**Priority**: P0 - DEPLOY BLOCKER  
**Deadline**: Complete before continuing LlamaIndex MCP work

---

## Critical Finding

Integrations agent validated all Shopify GraphQL queries with Shopify Dev MCP and found:

- ❌ **ALL 4 QUERIES FAILED VALIDATION**
- ❌ Using deprecated 2023 API patterns
- ❌ **BLOCKS PRODUCTION DEPLOYMENT**

**Evidence**: `artifacts/integrations/audit-2025-10-11/shopify_graphql_validation_failures.md`

**Impact**: Sales Pulse, Fulfillment Health, Inventory Heatmap tiles completely broken

---

## IMMEDIATE ACTIONS REQUIRED

### Fix 1: SALES_PULSE_QUERY (15 minutes - P0)

**File**: `app/services/shopify/orders.ts` line 28  
**Change**: `financialStatus` → `displayFinancialStatus`

**Current (Broken)**:

```graphql
financialStatus  # ❌ DEPRECATED
```

**Corrected**:

```graphql
displayFinancialStatus  # ✅ CURRENT API
```

**Also Update**: Line 65 interface type to `displayFinancialStatus`

---

### Fix 2: LOW_STOCK_QUERY (30 minutes - P0)

**File**: `app/services/shopify/inventory.ts` lines 14-48

**Changes**:

1. Add required argument: `quantities(names: ["available"])`
2. Update field: `availableQuantity` → `quantity`
3. Update function: `computeAvailableQuantity` (lines 85-94) to extract from quantities array

**Current (Broken)**:

```graphql
quantities {
  availableQuantity  # ❌ Wrong field + missing argument
}
```

**Corrected**:

```graphql
quantities(names: ["available"]) {  # ✅ Required argument
  name
  quantity  # ✅ Correct field
}
```

**Function Update**:

```typescript
function computeAvailableQuantity(variant: InventoryVariantNode) {
  let total = 0;
  const levels = variant.inventoryItem?.inventoryLevels?.edges ?? [];
  for (const level of levels) {
    const node = level.node;
    const availableQty = node.quantities?.find((q) => q.name === "available");
    total += availableQty?.quantity ?? 0;
  }
  return total;
}
```

---

### Fix 3: ORDER_FULFILLMENTS_QUERY (30 minutes - P1)

**File**: `packages/integrations/shopify.ts` lines 3-12

**Issue**: Fulfillment is an ARRAY, not a connection. Remove edges/node pattern.

**See corrected query in**: `artifacts/integrations/audit-2025-10-11/shopify_graphql_validation_failures.md` lines 149-179

---

### Fix 4: UPDATE_VARIANT_COST (60 minutes - P1)

**File**: `packages/integrations/shopify.ts` lines 14-20

**Issue**: `productVariantUpdate` mutation removed in 2024. Use `productSet` instead.

**Breaking Change**: Requires productId parameter (not just variantId)

**See corrected mutation in**: `artifacts/integrations/audit-2025-10-11/shopify_graphql_validation_failures.md` lines 218-253

---

## Validation Requirement

After EACH fix, re-validate with Shopify MCP:

```
Using shopify MCP, validate this GraphQL query for Admin API:
[paste corrected query]
```

**Do not proceed to next fix until current fix validates successfully.**

---

## Priority Order

1. 🚨 **SALES_PULSE_QUERY** (15 min) - Most critical tile
2. 🚨 **LOW_STOCK_QUERY** (30 min) - High impact tile
3. ⚠️ **ORDER_FULFILLMENTS_QUERY** (30 min) - Feature blocker
4. ⚠️ **UPDATE_VARIANT_COST** (60 min) - If feature is used

**Total Time**: 2-2.5 hours to fix all queries

---

## Evidence Required

Log in `feedback/engineer.md`:

- Timestamp for each fix
- Shopify MCP validation confirmation
- Updated fixtures
- Test results
- TypeScript type updates

---

## LlamaIndex MCP Work

**PAUSE** LlamaIndex MCP server work until these are fixed.

**Rationale**: Shopify queries block production deployment. LlamaIndex MCP doesn't. Fix deploy blockers first.

**Resume**: After all 4 queries validate successfully with Shopify MCP.

---

**Manager**: This validates our MCP-first development principle. Excellent catch by Integrations agent.

**Directive**: Fix all 4 queries, validate each with Shopify MCP, document in feedback/engineer.md, THEN resume LlamaIndex MCP work.

**Deadline**: Complete within 3 hours.
