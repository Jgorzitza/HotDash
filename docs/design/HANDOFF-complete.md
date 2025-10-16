# Complete Design Handoff Specification

**File:** `docs/design/HANDOFF-complete.md`  
**Owner:** Designer  
**Version:** 1.0  
**Date:** 2025-10-15  
**Status:** Complete

---

## 1. Purpose

Comprehensive handoff specification for all features in the Hot Rod AN Control Center, providing engineers with everything needed for implementation.

---

## 2. Design System Foundation

### 2.1 Core Documentation

**Complete design specifications:**
1. ✅ `dashboard-tiles.md` - All 7 tiles design system
2. ✅ `responsive-breakpoints.md` - Mobile, tablet, desktop breakpoints
3. ✅ `loading-states.md` - Skeleton screens, spinners, progress indicators
4. ✅ `error-states.md` - Error patterns, empty states, recovery
5. ✅ `accessibility.md` - WCAG 2.1 AA compliance, ARIA, keyboard nav
6. ✅ `polaris-guide.md` - Shopify Polaris component usage
7. ✅ `design-tokens.md` - Colors, spacing, typography tokens

### 2.2 Implementation Files

**Source files:**
- `app/styles/tokens.css` - Design tokens implementation
- `app/components/tiles/` - Tile components
- `app/routes/` - Route implementations

---

## 3. Dashboard Tiles Implementation

### 3.1 TileCard Container

**Component:** `app/components/tiles/TileCard.tsx`

**Props:**
```typescript
interface TileCardProps<T> {
  title: string;
  tile: TileState<T>;
  render: (data: T) => ReactNode;
  testId?: string;
}

interface TileState<T> {
  status: 'ok' | 'error' | 'unconfigured';
  data?: T;
  fact?: TileFact;
  source?: 'fresh' | 'cache' | 'mock';
  error?: string;
}
```

**Implementation checklist:**
- [x] Three-state status system (ok, error, unconfigured)
- [x] Status badges with color coding
- [x] Last refreshed timestamp
- [x] Source indicator (fresh/cache/mock)
- [x] Error message display
- [x] Empty state handling

### 3.2 Tile Grid Layout

**Component:** Dashboard route (`app/routes/app._index.tsx`)

**CSS:**
```css
.occ-tile-grid {
  display: grid;
  gap: var(--occ-tile-gap); /* 20px */
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
}
```

**Responsive behavior:**
- Mobile (< 768px): 1 column
- Tablet (768-1023px): 2 columns
- Desktop (1024px+): 3-4 columns (auto-fit)

### 3.3 Individual Tiles

**Implemented:**
1. ✅ Ops Pulse - `OpsMetricsTile.tsx`
2. ✅ Sales Pulse - `SalesPulseTile.tsx`
3. ✅ Fulfillment Health - `FulfillmentHealthTile.tsx`
4. ✅ Inventory Heatmap - `InventoryHeatmapTile.tsx`
5. ✅ CX Escalations - `CXEscalationsTile.tsx`

**To implement:**
6. ⏳ SEO Content - See `dashboard-tiles.md` section 4.6
7. ⏳ Approvals Queue - See `dashboard-tiles.md` section 4.7

---

## 4. Approvals Queue Implementation

### 4.1 Route

**Path:** `/approvals`  
**Component:** `app/routes/approvals.tsx`

**Implementation checklist:**
- [x] Page layout with title and subtitle
- [x] Auto-refresh every 5 seconds
- [x] Loading state (SkeletonPage)
- [x] Empty state ("All clear!")
- [x] Error state with retry
- [x] Dev mode indicator

### 4.2 Approval Card

**Component:** `app/components/approvals/ApprovalCard.tsx`

**Props:**
```typescript
interface ApprovalCardProps {
  approval: Approval;
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string) => Promise<void>;
}

interface Approval {
  id: string;
  type: string;
  summary: string;
  createdAt: string;
  tool: string;
  arguments: Record<string, any>;
}
```

**Implementation checklist:**
- [x] Card layout with Polaris Card
- [x] Header with type and summary
- [x] Risk level badge (high/medium/low)
- [x] Created timestamp
- [x] Tool call preview (collapsible)
- [x] Approve/Reject buttons
- [x] Loading states on buttons
- [x] Error handling

### 4.3 Approvals Drawer (Future)

**Spec:** See archived `HANDOFF-approval-queue-ui.md`

**To implement:**
- ⏳ Drawer layout with 6 sections
- ⏳ Evidence tabs (Diffs, Samples, Queries)
- ⏳ Risks & Rollback section
- ⏳ Tool Calls Preview
- ⏳ Grading interface (HITL)
- ⏳ Keyboard shortcuts
- ⏳ Screen reader support

---

## 5. Loading States Implementation

### 5.1 Skeleton Screens

**Tile Skeleton:**
```tsx
function TileSkeleton() {
  return (
    <div className="occ-tile occ-skeleton">
      <div className="occ-skeleton-header">
        <div className="occ-skeleton-text occ-skeleton-heading" />
        <div className="occ-skeleton-badge" />
      </div>
      <div className="occ-skeleton-text occ-skeleton-meta" />
      <div className="occ-skeleton-content">
        <div className="occ-skeleton-text occ-skeleton-large" />
        <div className="occ-skeleton-text" />
        <div className="occ-skeleton-text" />
      </div>
    </div>
  );
}
```

**CSS:** See `loading-states.md` section 3.1

### 5.2 Button Loading

**Polaris Button:**
```tsx
<Button loading={isLoading} onClick={handleAction}>
  Approve
</Button>
```

**Implementation:** Built-in Polaris feature

### 5.3 Page Loading

**Polaris SkeletonPage:**
```tsx
<SkeletonPage title="Dashboard">
  <SkeletonBodyText lines={3} />
</SkeletonPage>
```

**Implementation:** Used in approvals route

---

## 6. Error States Implementation

### 6.1 Network Error

**Component:**
```tsx
<Banner tone="critical" onDismiss={handleDismiss}>
  <p>Unable to connect. Check your network connection and try again.</p>
</Banner>
```

**Implementation:** Polaris Banner component

### 6.2 Empty States

**Tile Empty State:**
```tsx
{!data.length && (
  <p style={{ color: 'var(--occ-text-secondary)', margin: 0 }}>
    No [data type] right now.
  </p>
)}
```

**Approvals Empty State:**
```tsx
<EmptyState
  heading="All clear!"
  image="https://cdn.shopify.com/..."
>
  <p>No pending approvals right now.</p>
</EmptyState>
```

**Implementation:** Polaris EmptyState component

---

## 7. Accessibility Implementation

### 7.1 Keyboard Navigation

**Tab Order:**
1. Skip link (hidden until focused)
2. Navigation
3. Main content
4. Tiles (if interactive)
5. Buttons and links

**Focus Management:**
```tsx
import { useFocusTrap } from '@shopify/polaris';

function Modal({ open }) {
  const focusTrapRef = useFocusTrap(open);
  return <div ref={focusTrapRef} role="dialog" aria-modal="true">...</div>;
}
```

### 7.2 ARIA Labels

**Tile:**
```tsx
<div 
  role="region"
  aria-labelledby="tile-heading-1"
  aria-describedby="tile-status-1"
>
  <h2 id="tile-heading-1">Sales Pulse</h2>
  <span id="tile-status-1" className="sr-only">
    Status: Healthy. Last refreshed 2 minutes ago.
  </span>
</div>
```

**Button:**
```tsx
<button aria-label="Close modal">
  <span aria-hidden="true">×</span>
</button>
```

### 7.3 Live Regions

**Loading:**
```tsx
<div aria-live="polite" aria-atomic="true" className="sr-only">
  {isLoading ? 'Loading data...' : 'Data loaded'}
</div>
```

**Error:**
```tsx
<div role="alert" aria-live="assertive">
  Error: {errorMessage}
</div>
```

---

## 8. Responsive Implementation

### 8.1 Breakpoints

**CSS Media Queries:**
```css
/* Mobile: Base styles (no media query) */

/* Tablet and up */
@media (min-width: 768px) {
  /* Tablet styles */
}

/* Desktop and up */
@media (min-width: 1024px) {
  /* Desktop styles */
}
```

### 8.2 Component Adaptations

**Tile Grid:**
```css
.occ-tile-grid {
  grid-template-columns: 1fr; /* Mobile */
}

@media (min-width: 768px) {
  .occ-tile-grid {
    grid-template-columns: repeat(2, 1fr); /* Tablet */
  }
}

@media (min-width: 1024px) {
  .occ-tile-grid {
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); /* Desktop */
  }
}
```

### 8.3 Touch Targets

**Mobile:**
```css
.occ-button {
  min-height: 44px;
  min-width: 44px;
}
```

**Desktop:**
```css
@media (min-width: 1024px) {
  .occ-button {
    min-height: 36px;
    min-width: 36px;
  }
}
```

---

## 9. Polaris Migration

### 9.1 Current State

**Custom CSS components:**
- TileCard (custom CSS)
- Tile grid (custom CSS)
- Status badges (custom CSS)

**Polaris components:**
- Button (Polaris)
- Banner (Polaris)
- EmptyState (Polaris)
- SkeletonPage (Polaris)
- Card (Polaris - in approvals)

### 9.2 Migration Path

**Phase 1: Keep custom CSS for tiles**
- Tiles work well with current implementation
- Polaris Card doesn't fit tile structure perfectly
- Custom CSS provides more control

**Phase 2: Migrate to Polaris where beneficial**
- Use Polaris for new components
- Migrate buttons to Polaris Button
- Use Polaris layout components (BlockStack, InlineStack)

**Phase 3: Full Polaris adoption (future)**
- Evaluate Polaris Card for tiles
- Migrate all custom CSS to Polaris
- Use Polaris tokens exclusively

---

## 10. Testing Requirements

### 10.1 Visual Regression

**Tools:** Percy, Chromatic, or manual screenshots

**Test cases:**
- All tile states (ok, error, unconfigured, loading, empty)
- All breakpoints (mobile, tablet, desktop)
- Focus states
- High contrast mode

### 10.2 Accessibility

**Tools:** axe DevTools, Lighthouse, Pa11y

**Test cases:**
- Keyboard navigation (all interactive elements reachable)
- Screen reader announcements (NVDA, JAWS, VoiceOver)
- Color contrast (4.5:1 for text, 3:1 for UI)
- Focus indicators visible
- ARIA labels correct

### 10.3 Functional

**Test cases:**
- Data loading and error handling
- Retry mechanisms
- State transitions
- Responsive behavior
- Modal interactions
- Form submissions

---

## 11. Performance Targets

### 11.1 Metrics

**Target:**
- P95 tile load < 3s
- First Contentful Paint < 1.5s
- Time to Interactive < 3.5s
- Lighthouse Performance score ≥ 90

**Current:**
- Dashboard loads in ~2s (good)
- Approvals loads in ~1s (excellent)

### 11.2 Optimization

**Implemented:**
- Auto-fit grid (no media queries)
- CSS animations (GPU-accelerated)
- Lazy loading modals

**To implement:**
- Code splitting for routes
- Image optimization
- Bundle size reduction

---

## 12. Implementation Priorities

### 12.1 Phase 1: Foundation (Complete ✅)

- [x] Design tokens
- [x] TileCard component
- [x] 5 tile implementations
- [x] Responsive grid
- [x] Loading states
- [x] Error states
- [x] Accessibility basics

### 12.2 Phase 2: Approvals (Complete ✅)

- [x] Approvals route
- [x] Approval card component
- [x] Auto-refresh
- [x] Empty state
- [x] Error handling
- [x] Dev mode

### 12.3 Phase 3: Remaining Tiles (Next)

- [ ] SEO Content tile
- [ ] Approvals Queue tile (summary)
- [ ] Tile interactions (modals)

### 12.4 Phase 4: Approvals Drawer (Future)

- [ ] Drawer layout
- [ ] Evidence tabs
- [ ] Grading interface
- [ ] Keyboard shortcuts
- [ ] Full HITL workflow

---

## 13. Known Issues & Limitations

### 13.1 Current Limitations

**Tiles:**
- No real-time updates (refresh on page load)
- No tile customization (reorder, hide/show)
- No tile size variants

**Approvals:**
- Basic approval flow only
- No grading interface yet
- No evidence tabs yet
- No keyboard shortcuts yet

### 13.2 Future Enhancements

**Tiles:**
- Real-time updates (SSE/WebSocket)
- Tile customization
- Tile export (PDF, CSV)
- Historical data overlays

**Approvals:**
- Full drawer implementation
- Grading interface (HITL)
- Evidence tabs
- Keyboard shortcuts
- Batch operations

---

## 14. Engineer Checklist

### 14.1 Before Starting

- [ ] Read all design specs (`dashboard-tiles.md`, `responsive-breakpoints.md`, etc.)
- [ ] Review design tokens (`app/styles/tokens.css`)
- [ ] Check Polaris documentation
- [ ] Set up accessibility testing tools (axe, Lighthouse)

### 14.2 During Implementation

- [ ] Use design tokens (no hardcoded values)
- [ ] Follow Polaris component patterns
- [ ] Implement all states (loading, error, empty)
- [ ] Test keyboard navigation
- [ ] Test screen readers
- [ ] Test responsive behavior
- [ ] Write unit tests
- [ ] Document any deviations

### 14.3 Before PR

- [ ] Visual regression tests pass
- [ ] Accessibility audit passes (axe, Lighthouse ≥ 95)
- [ ] All states tested
- [ ] Responsive behavior verified
- [ ] Code reviewed
- [ ] Documentation updated

---

## 15. References

**Design Specifications:**
- `docs/design/dashboard-tiles.md`
- `docs/design/responsive-breakpoints.md`
- `docs/design/loading-states.md`
- `docs/design/error-states.md`
- `docs/design/accessibility.md`
- `docs/design/polaris-guide.md`
- `docs/design/design-tokens.md`

**Implementation:**
- `app/styles/tokens.css`
- `app/components/tiles/`
- `app/routes/`

**External:**
- Polaris: https://polaris.shopify.com/
- WCAG 2.1: https://www.w3.org/WAI/WCAG21/quickref/
- React Router 7: https://reactrouter.com/

---

## 16. Contact

**Designer:** Designer Agent  
**Feedback:** `feedback/designer/2025-10-15.md`  
**Questions:** Create GitHub Issue with `design` label

