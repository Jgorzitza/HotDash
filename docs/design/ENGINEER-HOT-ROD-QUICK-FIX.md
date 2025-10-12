---
epoch: 2025.10.E1
doc: docs/design/ENGINEER-HOT-ROD-QUICK-FIX.md
owner: designer
created: 2025-10-12
priority: P0 - Launch Blocker
---

# Engineer Quick Fix Guide - Hot Rod AN Theme

**Status**: 🔴 P0 - Launch Blocker  
**Estimated Time**: 1-1.5 hours  
**Impact**: 52% → 95% brand consistency

---

## Quick Summary

Your technical implementation is **EXCELLENT** ⭐ 
- ✅ Design tokens perfect
- ✅ Polaris components perfect
- ✅ Component architecture solid

**What's Missing**: Hot Rod AN automotive-themed copy (not implemented yet)

**Solution**: Import constants from `app/copy/hot-rodan-strings.ts` (already created for you)

---

## 5 Files to Update (30 min total)

### 1. TileCard.tsx (5 min) ⚡ IMMEDIATE

**File**: `app/components/tiles/TileCard.tsx`

```diff
+ import { HOT_ROD_STATUS } from '~/copy/hot-rodan-strings';

- const STATUS_LABELS: Record<TileStatus, string> = {
-   ok: "Healthy",
-   error: "Attention needed",
-   unconfigured: "Configuration required",
- };
+ const STATUS_LABELS: Record<TileStatus, string> = {
+   ok: HOT_ROD_STATUS.ok,              // "All systems ready"
+   error: HOT_ROD_STATUS.error,        // "Attention needed" (unchanged)
+   unconfigured: HOT_ROD_STATUS.unconfigured, // "Tune-up required"
+ };
```

**Evidence**: Line 26-30 in current file

---

### 2. CXEscalationsTile.tsx (10 min) ⚡ HIGH

**File**: `app/components/tiles/CXEscalationsTile.tsx`

```diff
+ import { HOT_ROD_EMPTY_STATES } from '~/copy/hot-rodan-strings';

  if (!conversations.length) {
-   return <p style={{ color: "var(--occ-text-secondary)", margin: 0 }}>No SLA breaches detected.</p>;
+   return (
+     <div style={{ color: "var(--occ-text-secondary)" }}>
+       <p style={{ margin: 0, fontWeight: 600 }}>
+         {HOT_ROD_EMPTY_STATES.cxEscalations.title}
+       </p>
+       <p style={{ margin: "var(--occ-space-1) 0 0 0", fontSize: "var(--occ-font-size-sm)" }}>
+         {HOT_ROD_EMPTY_STATES.cxEscalations.message}
+       </p>
+     </div>
+   );
  }
```

**Evidence**: Line 26-28 in current file

---

### 3. SalesPulseTile.tsx (5 min) ⚡ HIGH

**File**: `app/components/tiles/SalesPulseTile.tsx`

```diff
+ import { HOT_ROD_EMPTY_STATES } from '~/copy/hot-rodan-strings';

  {summary.pendingFulfillment.length ? (
    // ... existing list code ...
  ) : (
    <p
      style={{
        color: "var(--occ-text-secondary)",
        margin: "var(--occ-space-2) 0 0 0",
      }}
    >
-     No fulfillment blockers detected.
+     {HOT_ROD_EMPTY_STATES.fulfillment.message}
    </p>
  )}
```

**Evidence**: Line 99-106 in current file

---

### 4. approvals/route.tsx (5 min) ⚡ IMMEDIATE

**File**: `app/routes/approvals/route.tsx`

```diff
+ import { HOT_ROD_PAGES, HOT_ROD_EMPTY_STATES } from '~/copy/hot-rodan-strings';

  return (
    <Page
-     title="Approval Queue"
+     title={HOT_ROD_PAGES.approvalQueue}  // "Mission Control"
      subtitle={`${approvals.length} pending ${approvals.length === 1 ? 'approval' : 'approvals'}`}
    >
      <Layout>
        {/* ... error card ... */}
        
        {approvals.length === 0 ? (
          <Layout.Section>
            <Card>
              <EmptyState
-               heading="All clear!"
+               heading="All systems ready"
                image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
              >
-               <p>No pending approvals. Check back later.</p>
+               <p>No pending approvals. Your operation is running smoothly.</p>
              </EmptyState>
            </Card>
          </Layout.Section>
        ) : (
          // ... approval cards ...
        )}
      </Layout>
    </Page>
  );
```

**Evidence**: Lines 50, 68, 71 in current file

---

### 5. (Optional) Add Loading States (10 min) 🔄 MEDIUM

**Pattern to add to tiles**:

```tsx
import { HOT_ROD_LOADING } from '~/copy/hot-rodan-strings';

// In TileCard.tsx or individual tiles:
if (tile.status === 'loading') {
  return (
    <div className="occ-tile">
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 'var(--occ-space-2)' 
      }}>
        <Spinner size="small" />
        <p style={{ color: "var(--occ-text-secondary)", margin: 0 }}>
          {HOT_ROD_LOADING.tiles}
        </p>
      </div>
    </div>
  );
}
```

**Note**: Add `loading` to `TileStatus` type if not already present

---

## Copy Constants Reference

**Already created for you**: `app/copy/hot-rodan-strings.ts`

Contains:
- `HOT_ROD_STATUS` - Status labels
- `HOT_ROD_EMPTY_STATES` - Empty state messages
- `HOT_ROD_LOADING` - Loading messages
- `HOT_ROD_SUCCESS` - Success toast messages
- `HOT_ROD_ERROR` - Error toast messages
- `HOT_ROD_PAGES` - Page titles
- `HOT_ROD_ACTIONS` - Button labels

---

## Testing Checklist

After making changes, verify:

**Status Labels**:
- [ ] Tile shows "All systems ready" when status = ok
- [ ] Tile shows "Attention needed" when status = error
- [ ] Tile shows "Tune-up required" when status = unconfigured

**Empty States**:
- [ ] CX Escalations tile shows "All systems ready" + encouraging message
- [ ] Sales Pulse tile shows "Full speed ahead" message
- [ ] Approval Queue page shows "All systems ready" heading

**Page Titles**:
- [ ] Approval page shows "Mission Control" (not "Approval Queue")

**Loading States** (if implemented):
- [ ] Tiles show "Starting engines..." when loading

---

## Before/After Examples

### Status Labels

**Before**: 
```
[Healthy] (green text)
```

**After**:
```
[All systems ready] (green text)
```

---

### Empty State

**Before**:
```
No SLA breaches detected.
```

**After**:
```
All systems ready
No escalations detected. Excellent customer service performance!
```

---

### Page Title

**Before**:
```
Approval Queue
3 pending approvals
```

**After**:
```
Mission Control
3 pending approvals
```

---

## Why These Changes?

**Brand Alignment**: Hot Rod AN is automotive-themed (fast, powerful, reliable)

**Per Brand Spec** (`docs/design/hot-rodan-brand-integration.md`):
- Use automotive metaphors **sparingly** (1-2 per screen)
- Keep professional tone (this is a business tool)
- "All systems ready" = engine idling, ready to go
- "Mission Control" = driver's seat, full control

**Technical**: You already nailed the foundation (tokens, Polaris, architecture) ⭐

**Copy**: Just need to swap generic strings for automotive-themed strings

---

## Questions?

**Design Spec**: `docs/design/hot-rodan-brand-integration.md`  
**Copy Deck**: `docs/design/copy-decks.md`  
**Constants File**: `app/copy/hot-rodan-strings.ts`  
**Designer Feedback**: `feedback/designer.md`

---

**Estimated Time**: 30-40 min for all 5 files  
**Impact**: 52% → 95% brand consistency  
**Blocker**: No (just copy updates)  
**Priority**: P0 - Do before launch


