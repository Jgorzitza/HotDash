# Dashboard Recovery Plan — Missing Tiles

**Date**: 2025-10-20T00:40:00Z  
**Issue**: Dashboard implementation incomplete vs. agreed design spec  
**Status**: 2 of 8 tiles missing from implementation

---

## What's Missing

### Current State: 6/8 Tiles Implemented

**Implemented** ✅:

1. Ops Pulse
2. Sales Pulse
3. Fulfillment Health
4. Inventory Heatmap
5. CX Escalations
6. SEO & Content Watch

**Missing** ❌: 7. **Idea Pool** - Product suggestion backlog 8. **Approvals Queue** - Pending agent actions

---

## Design Spec (Intact)

File: `docs/design/dashboard-tiles.md`  
Date: 2025-10-15  
Status: ✅ **COMPLETE SPECIFICATION EXISTS**

### Idea Pool Tile Spec (lines 528-670):

- Display: 5/5 pool capacity
- Wildcard indicator
- Pending/accepted/rejected counts
- "View Idea Pool" button
- Full layout, states, accessibility spec

### Approvals Queue Tile Spec (lines 281-301):

- Display: Pending count
- Oldest pending time
- "Review queue" button
- Links to /approvals route

---

## Current Dashboard File

**File**: `app/routes/app._index.tsx`  
**Lines**: 392 total  
**Tiles Rendered** (lines 344-388): Only 6 tiles

**Missing from JSX**:

```tsx
// MISSING: Idea Pool Tile
<TileCard
  title="Idea Pool"
  tile={data.ideaPool}
  render={(pool) => <IdeaPoolTile pool={pool} />}
  testId="tile-idea-pool"
/>

// MISSING: Approvals Queue Tile
<TileCard
  title="Approvals Queue"
  tile={data.approvals}
  render={(approvals) => <ApprovalsQueueTile approvals={approvals} />}
  testId="tile-approvals-queue"
/>
```

---

## What Got Lost

**Analysis**:

- Design spec was created 2025-10-15 (complete, intact)
- Dashboard implementation has 6 tiles (working)
- Tiles 7-8 were **never implemented** in code
- This appears to be incomplete work, not deleted work

**Git History**: No commits show Idea Pool or Approvals Queue tile implementations being added then deleted

**Likely Cause**:

- Agents may have been directed to implement only the first 6 tiles
- Tiles 7-8 were deferred as "future" work
- Design spec included all 8 for completeness

---

## Recovery Steps

### 1. Create Missing Tile Components

**Idea Pool Tile** (15-20 min):

- File: `app/components/tiles/IdeaPoolTile.tsx`
- Interface: `IdeaPoolData` (from design spec lines 536-545)
- Layout: Pool capacity, wildcard badge, metrics, CTA button
- States: OK, empty, error

**Approvals Queue Tile** (10-15 min):

- File: `app/components/tiles/ApprovalsQueueTile.tsx`
- Interface: `ApprovalSummary` (from design spec lines 288-291)
- Layout: Count badge, oldest pending time, "Review queue" button
- States: OK, empty, error

### 2. Create Backend Data Loaders

**Idea Pool Loader** (10 min):

- Function: `getIdeaPoolSummary()`
- Location: `app/services/ideas/` (new)
- Query: `product_suggestions` table in Supabase
- Returns: Pool stats (total, wildcard, pending/accepted/rejected)

**Approvals Queue Loader** (10 min):

- Function: `getApprovalsSummary()`
- Location: `app/services/approvals.ts` (exists)
- Query: `decision_log` table for pending approvals
- Returns: Count, oldest timestamp

### 3. Update Dashboard Route

**File**: `app/routes/app._index.tsx`

**Add to LoaderData** (line 37):

```typescript
interface LoaderData {
  // existing...
  ideaPool: TileState<IdeaPoolData>;
  approvals: TileState<ApprovalSummary>;
}
```

**Add to loader** (line 68):

```typescript
const ideaPool = await resolveTile(() => getIdeaPoolSummary());
const approvals = await resolveTile(() => getApprovalsSummary());
```

**Add to Response** (line 76):

```typescript
return Response.json({
  // existing...
  ideaPool,
  approvals,
});
```

**Add to JSX** (after line 388):

```tsx
<TileCard
  title="Idea Pool"
  tile={data.ideaPool}
  render={(pool) => <IdeaPoolTile pool={pool} />}
  testId="tile-idea-pool"
/>

<TileCard
  title="Approvals Queue"
  tile={data.approvals}
  render={(approvals) => <ApprovalsQueueTile approvals={approvals} />}
  testId="tile-approvals-queue"
/>
```

### 4. Update Exports

**File**: `app/components/tiles/index.ts`

Add:

```typescript
export { IdeaPoolTile } from "./IdeaPoolTile";
export { ApprovalsQueueTile } from "./ApprovalsQueueTile";
export type { IdeaPoolData, ApprovalSummary } from "./types";
```

---

## Estimated Time

**Total**: 45-55 minutes for Engineer agent

1. IdeaPoolTile component: 15-20 min
2. ApprovalsQueueTile component: 10-15 min
3. Backend loaders: 20 min
4. Dashboard integration: 10 min

---

## Agent Assignment

**Engineer**: Implement missing tile components + backend loaders  
**Data**: Verify Supabase queries for idea pool  
**QA**: Test 8-tile dashboard layout

---

## Priority

**P2** (Non-blocking for launch):

- Current 6 tiles cover core operational needs
- Idea Pool & Approvals Queue are "nice to have"
- Can be added post-launch

**However**: Since design spec was agreed with CEO, this should be prioritized to match expectations

---

## Evidence Locations

- Design Spec: `docs/design/dashboard-tiles.md` (lines 528-670 for Idea Pool)
- Current Dashboard: `app/routes/app._index.tsx` (lines 344-391 show 6 tiles)
- Tile Components: `app/components/tiles/` (6 files exist, 2 missing)
