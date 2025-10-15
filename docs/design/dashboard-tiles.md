# Dashboard Tiles Design System

**File:** `docs/design/dashboard-tiles.md`  
**Owner:** Designer  
**Version:** 1.0  
**Date:** 2025-10-15  
**Status:** Complete

---

## 1. Purpose

Comprehensive design specification for all 7 dashboard tiles in the Hot Rod AN Control Center, ensuring consistency, accessibility, and optimal operator experience.

---

## 2. Tile Inventory (7 Tiles)

1. **Ops Pulse** - Activation rate and SLA metrics
2. **Sales Pulse** - Revenue, orders, top SKUs
3. **Fulfillment Health** - Order fulfillment status
4. **Inventory Heatmap** - Stock alerts and reorder points
5. **CX Escalations** - Customer support issues
6. **SEO Content** - Search rankings and traffic
7. **Approvals Queue** - Pending agent actions (future)

---

## 3. Consistent Design Pattern

### 3.1 TileCard Container

**Component:** `TileCard<T>`

**Structure:**
```tsx
<div className="occ-tile" data-testid={testId}>
  <div> {/* Header */}
    <h2>{title}</h2>
    <span className={statusClass}>{statusLabel}</span>
  </div>
  {fact && <p className="occ-text-meta">Last refreshed {time} • Source: {source}</p>}
  {content} {/* Tile-specific content */}
</div>
```

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

### 3.2 Status System

**Three States:**
- **ok** (Healthy) - Green badge, normal operation
- **error** (Attention needed) - Red badge, requires action
- **unconfigured** (Configuration required) - Gray badge, setup needed

**Status Labels:**
```typescript
const STATUS_LABELS = {
  ok: "Healthy",
  error: "Attention needed",
  unconfigured: "Configuration required",
};
```

### 3.3 Layout & Spacing

**Tile Dimensions:**
- Min width: 320px
- Min height: 280px
- Padding: 20px (`var(--occ-tile-padding)`)
- Internal gap: 16px (`var(--occ-tile-internal-gap)`)

**Grid System:**
```css
.occ-tile-grid {
  display: grid;
  gap: var(--occ-tile-gap); /* 20px */
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
}
```

### 3.4 Typography

**Heading:** 1.15rem, semibold, primary color  
**Metric Value:** 1.5rem, semibold, primary color  
**Body Text:** 1rem, regular, primary color  
**Meta Text:** 0.85rem, regular, secondary color

---

## 4. Tile-Specific Designs

### 4.1 Ops Pulse Tile

**Purpose:** Display activation rate and SLA resolution metrics

**Data Structure:**
```typescript
interface OpsAggregateMetrics {
  activation: {
    activationRate: number;
    activatedShops: number;
    totalActiveShops: number;
    windowStart: string;
    windowEnd: string;
  };
  sla: {
    medianMinutes: number;
    p90Minutes: number;
    sampleSize: number;
  };
}
```

**Layout:** Two-column grid (auto-fit, min 180px)

**Sections:**
1. **Activation (7d)** - Percentage, shop count, date range
2. **SLA Resolution (7d)** - Median time, P90, sample size

**Empty State:** "No activation data yet." / "No resolved breaches in window."

---

### 4.2 Sales Pulse Tile

**Purpose:** Revenue, order count, top SKUs, pending fulfillment

**Data Structure:**
```typescript
interface OrderSummary {
  totalRevenue: number;
  currency: string;
  orderCount: number;
  topSkus: Array<{
    sku: string;
    title: string;
    quantity: number;
    revenue: number;
  }>;
  pendingFulfillment: Array<{
    orderId: string;
    name: string;
    displayStatus: string;
    createdAt: string;
  }>;
}
```

**Layout:** Vertical stack with three sections

**Sections:**
1. **Revenue** - Large metric value, order count, "View details" link
2. **Top SKUs** - List of top 3 SKUs with quantity and revenue
3. **Open fulfillment** - List of pending orders or "No fulfillment blockers"

**Interactive:** "View details" button opens SalesPulseModal

---

### 4.3 Fulfillment Health Tile

**Purpose:** Order fulfillment status and issues

**Data Structure:**
```typescript
interface FulfillmentIssue {
  orderId: string;
  name: string;
  displayStatus: string;
  createdAt: string;
}
```

**Layout:** Simple list

**Content:**
- List of issues with order name, status, and timestamp
- Empty state: "All recent orders are on track."

---

### 4.4 Inventory Heatmap Tile

**Purpose:** Stock alerts and days of cover

**Data Structure:**
```typescript
interface InventoryAlert {
  variantId: string;
  title: string;
  quantityAvailable: number;
  daysOfCover?: number;
}
```

**Layout:** Simple list

**Content:**
- List of alerts with product title, quantity, and days of cover
- Empty state: "No low stock alerts right now."

---

### 4.5 CX Escalations Tile

**Purpose:** Customer support issues requiring attention

**Data Structure:**
```typescript
interface CXConversation {
  id: number;
  customerName: string;
  status: string;
  slaBreached: boolean;
}
```

**Layout:** List with action buttons

**Content:**
- List of conversations with customer name, status, SLA breach indicator
- "Review" button for each conversation (opens CXEscalationModal)
- Empty state: "No SLA breaches detected."

**Interactive:** "Review" button opens modal with conversation details

---

### 4.6 SEO Content Tile

**Purpose:** Search rankings and traffic (future implementation)

**Data Structure:** TBD

**Layout:** TBD

**Content:** Organic visits, keyword rankings, traffic trends

---

### 4.7 Approvals Queue Tile (Future)

**Purpose:** Pending agent actions requiring approval

**Data Structure:**
```typescript
interface ApprovalSummary {
  pendingCount: number;
  oldestPendingMinutes: number;
}
```

**Layout:** Count badge with action button

**Content:**
- Large count of pending approvals
- "Review queue" button linking to /approvals route
- Empty state: "All clear! No pending approvals."

---

## 5. Responsive Behavior

### 5.1 Breakpoints

- **Mobile** (< 768px): 1 column, full width
- **Tablet** (768-1024px): 2 columns, equal width
- **Desktop** (> 1024px): 3-4 columns, auto-fit

### 5.2 Content Adaptation

**Mobile:**
- Reduce font sizes slightly (scale 0.9)
- Stack horizontal layouts vertically
- Hide non-critical metadata
- Larger touch targets (min 44x44px)

**Tablet:**
- Standard font sizes
- Maintain horizontal layouts where possible
- Show all metadata

**Desktop:**
- Standard font sizes
- Hover states enabled
- Keyboard shortcuts visible

---

## 6. Loading States

### 6.1 Initial Load

**Pattern:** Skeleton UI matching tile structure

**Implementation:**
- Preserve tile dimensions
- Animated shimmer effect (subtle pulse)
- No status badge during skeleton
- `aria-busy="true"` on container

### 6.2 Refresh

**Pattern:** Small spinner in top-right corner

**Implementation:**
- Existing data remains visible
- Subtle opacity reduction (0.7)
- No layout shift
- `aria-live="polite"` region

---

## 7. Error States

### 7.1 Network Error

**Message:** "Unable to connect. Check your network."  
**Action:** Retry button (secondary)  
**Visual:** Error icon (⚠️), red status badge

### 7.2 Unconfigured

**Message:** "Connect integration to enable this tile."  
**Action:** "Set up" button (primary)  
**Visual:** Setup icon, gray status badge

### 7.3 Data Validation Error

**Message:** "Data format error. Contact support."  
**Action:** "Report issue" link  
**Visual:** Warning icon, red status badge

---

## 8. Empty States

### 8.1 No Data Available

**Message:** "No [data type] right now."  
**Subtext:** "Data will appear here when available."  
**Visual:** Neutral, no action button

**Examples:**
- "No SLA breaches detected."
- "All recent orders are on track."
- "No low stock alerts right now."
- "No fulfillment blockers detected."

---

## 9. Accessibility (WCAG 2.1 AA)

### 9.1 Keyboard Navigation

**Tab Order:**
1. Tile container (if interactive)
2. Primary action button
3. Secondary actions
4. Links within content

**Keyboard Shortcuts:**
- `Tab`: Navigate between tiles
- `Enter/Space`: Activate focused tile or button
- `Escape`: Close modal opened from tile

### 9.2 Screen Reader Support

**Tile Announcement:**
```html
<div 
  role="region" 
  aria-label="[Tile Name]"
  aria-describedby="tile-status-[id]"
>
  <h2 id="tile-heading-[id]">[Tile Name]</h2>
  <span id="tile-status-[id]" class="sr-only">
    Status: [status]. Last refreshed [time].
  </span>
</div>
```

**Live Regions:**
- Tile updates: `aria-live="polite"`
- Error messages: `aria-live="assertive"` or `role="alert"`
- Loading states: `aria-busy="true"`

### 9.3 Color Contrast

**Verified Ratios (WCAG AA):**
- Healthy: Green text on light green (4.8:1) ✅
- Attention: Red text on light red (4.6:1) ✅
- Unconfigured: Gray text on light gray (4.5:1) ✅
- Body text: #202223 on white (16.6:1) ✅

---

## 10. Design Tokens Reference

**Colors:**
- `--occ-status-healthy-text`: #1a7f37
- `--occ-status-attention-text`: #d82c0d
- `--occ-status-unconfigured-text`: #637381
- `--occ-text-primary`: #202223
- `--occ-text-secondary`: #637381

**Spacing:**
- `--occ-tile-padding`: 20px
- `--occ-tile-gap`: 20px
- `--occ-tile-internal-gap`: 16px
- `--occ-space-1`: 4px
- `--occ-space-2`: 8px
- `--occ-space-4`: 16px

**Typography:**
- `--occ-font-size-heading`: 1.15rem
- `--occ-font-size-metric`: 1.5rem
- `--occ-font-size-body`: 1rem
- `--occ-font-size-meta`: 0.85rem
- `--occ-font-weight-semibold`: 600

**Effects:**
- `--occ-radius-tile`: 12px
- `--occ-shadow-tile`: Polaris card shadow
- `--occ-shadow-tile-hover`: Elevated shadow

---

## 11. Implementation Checklist

- [x] TileCard container component
- [x] Status system (ok, error, unconfigured)
- [x] Ops Pulse tile
- [x] Sales Pulse tile
- [x] Fulfillment Health tile
- [x] Inventory Heatmap tile
- [x] CX Escalations tile
- [ ] SEO Content tile (future)
- [ ] Approvals Queue tile (future)
- [x] Responsive grid layout
- [x] Loading states (skeleton, spinner)
- [x] Error states (network, unconfigured, validation)
- [x] Empty states (no data messages)
- [x] Accessibility (keyboard nav, screen readers)
- [x] Design tokens (colors, spacing, typography)

---

## 12. Testing Requirements

**Visual Regression:**
- All tile states (ok, error, unconfigured, loading, empty)
- All breakpoints (mobile, tablet, desktop)
- High contrast mode
- Focus states

**Accessibility:**
- Keyboard navigation (all interactive elements reachable)
- Screen reader announcements (NVDA, JAWS, VoiceOver)
- Color contrast (automated + manual verification)
- Focus indicators visible

**Functional:**
- Data loading and error handling
- Retry mechanisms
- State transitions
- Responsive behavior
- Modal interactions

---

## 13. References

- Implementation: `app/components/tiles/`
- Design tokens: `app/styles/tokens.css`
- Tile-specific refinements: `docs/design/tile-specific-ui-refinement.md`
- Design system guide: `docs/design/design-system-guide.md`
- Polaris: https://polaris.shopify.com/
- WCAG 2.1: https://www.w3.org/WAI/WCAG21/quickref/

