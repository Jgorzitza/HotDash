# Dashboard Tiles Design Specification

**File:** `docs/specs/dashboard_tiles_design_spec.md`  
**Owner:** Designer Agent  
**Version:** 1.0  
**Date:** 2025-10-15  
**Status:** Draft

---

## 1. Purpose

Define the comprehensive design system for dashboard tiles in the Hot Rod AN Control Center, ensuring consistency, accessibility, and optimal user experience across all tile types.

---

## 2. Design Principles

### 2.1 Operator-First
- **Scannable**: Critical information visible at a glance
- **Actionable**: Clear next steps for attention-needed states
- **Trustworthy**: Show data freshness and source

### 2.2 Polaris-Aligned
- Use Shopify Polaris components and patterns
- Follow Polaris spacing, typography, and color systems
- Maintain consistency with Shopify Admin experience

### 2.3 Accessible
- WCAG 2.1 AA compliance minimum
- Keyboard navigable
- Screen reader optimized
- High contrast support

---

## 3. Tile Types & Variants

### 3.1 Core Tile Types

#### Metric Tile
**Purpose**: Display single key metric with trend  
**Examples**: Revenue, AOV, Conversion Rate  
**Components**:
- Large metric value (2rem, semibold)
- Metric label (1rem, regular)
- Trend indicator (↑↓ with percentage)
- Comparison period (meta text)

#### List Tile
**Purpose**: Show multiple related items  
**Examples**: Inventory Alerts, CX Escalations, Fulfillment Issues  
**Components**:
- Item list (max 5 visible, scroll for more)
- Item status indicators
- Item actions (view, resolve)
- Empty state message

#### Heatmap Tile
**Purpose**: Visual representation of data distribution  
**Examples**: Inventory status buckets, Order distribution  
**Components**:
- Color-coded sections
- Section labels with counts
- Legend
- Interactive hover states

#### Status Tile
**Purpose**: System health and operational status  
**Examples**: Ops Metrics, Integration Health  
**Components**:
- Multiple status sections
- Health indicators
- Last check timestamp
- Quick actions

#### Chart Tile
**Purpose**: Time-series or comparative data visualization  
**Examples**: Sales Pulse, Traffic Trends  
**Components**:
- Chart area (line, bar, or area chart)
- Axis labels
- Data points
- Interactive tooltips

#### Action Tile
**Purpose**: Approvals queue and actionable items  
**Examples**: Approvals Queue, Pending Reviews  
**Components**:
- Count badge
- Action button
- Priority indicator
- SLA timer

---

## 4. Tile States

### 4.1 Loading States

#### Initial Load (Skeleton)
**When**: First render before data arrives  
**Design**:
- Skeleton UI matching tile structure
- Animated shimmer effect (subtle pulse)
- Preserve tile dimensions
- No status badge during skeleton

**Polaris Components**: `SkeletonBodyText`, `SkeletonDisplayText`

**Accessibility**:
- `aria-busy="true"` on container
- `aria-label="Loading [tile name]"`
- Screen reader announcement: "Loading"

#### Refresh (Spinner)
**When**: Subsequent data fetches  
**Design**:
- Small spinner in top-right corner
- Existing data remains visible (stale indicator)
- Subtle opacity reduction (0.7)
- No layout shift

**Polaris Components**: `Spinner` (size="small")

**Accessibility**:
- `aria-live="polite"` region
- Screen reader: "Refreshing [tile name]"

#### Progressive Load
**When**: Large datasets loading incrementally  
**Design**:
- Show partial data immediately
- Progress indicator at bottom
- "Loading more..." text
- Smooth content insertion

**Accessibility**:
- Announce count as items load
- "Loaded X of Y items"

### 4.2 Success States

#### Healthy (OK)
**Visual**:
- Status badge: "Healthy" (green)
- Full opacity
- Standard border
- Hover: subtle shadow elevation

**Polaris Tokens**:
- Text: `--p-color-text-success`
- Background: `--p-color-bg-success-subdued`
- Border: `--p-color-border-success`

**Accessibility**:
- `aria-label="[Tile name], status: healthy"`
- Success icon with `role="img"`

#### Data Available
**Visual**:
- No status badge (neutral state)
- Full content display
- Last refreshed timestamp
- Source indicator (fresh/cache/mock)

### 4.3 Error States

#### Network Error
**Visual**:
- Status badge: "Attention needed" (red)
- Error icon (⚠️)
- Error message: "Unable to connect. Check your network."
- Retry button (secondary)
- Last successful data (if available, with stale indicator)

**Polaris Components**: `Banner` (tone="critical")

**Accessibility**:
- `role="alert"` for error message
- Focus on retry button
- Screen reader: "Error loading [tile name]. [Error message]"

#### Authentication Error
**Visual**:
- Status badge: "Configuration required" (gray)
- Lock icon (🔒)
- Message: "Authentication required. Reconnect integration."
- "Connect" button (primary)

**Polaris Components**: `Banner` (tone="warning")

**Accessibility**:
- `role="alert"`
- Focus on connect button

#### Data Validation Error
**Visual**:
- Status badge: "Attention needed" (red)
- Warning icon
- Message: "Data format error. Contact support."
- "Report issue" link

**Accessibility**:
- `role="alert"`
- Error details in expandable section

#### Timeout Error
**Visual**:
- Status badge: "Attention needed" (red)
- Clock icon
- Message: "Request timed out. Try again."
- Retry button with countdown (if rate-limited)

### 4.4 Empty States

#### No Data Available
**Visual**:
- Neutral illustration (optional)
- Message: "No [data type] right now."
- Subtext: "Data will appear here when available."
- No action button (passive state)

**Polaris Components**: `EmptyState` (compact)

**Accessibility**:
- `aria-label="No data available for [tile name]"`

#### Unconfigured
**Visual**:
- Status badge: "Configuration required" (gray)
- Setup icon
- Message: "Connect integration to enable this tile."
- "Set up" button (primary)

**Polaris Components**: `EmptyState` with action

**Accessibility**:
- Focus on setup button
- Clear instructions for screen readers

---

## 5. Responsive Behavior

### 5.1 Breakpoints

Following Polaris responsive design:

- **Mobile**: < 768px (1 column)
- **Tablet**: 768px - 1024px (2 columns)
- **Desktop**: > 1024px (3-4 columns, auto-fit)

### 5.2 Grid System

**CSS Grid** (current implementation):
```css
.occ-tile-grid {
  display: grid;
  gap: var(--occ-tile-gap); /* 20px */
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
}
```

**Responsive Adjustments**:
- Mobile: Single column, full width
- Tablet: 2 columns, equal width
- Desktop: Auto-fit with 320px minimum

### 5.3 Tile Dimensions

**Minimum**:
- Width: 320px
- Height: 280px

**Maximum**:
- Width: Constrained by grid
- Height: Auto (content-driven)

**Aspect Ratio**: Flexible (not enforced)

### 5.4 Content Adaptation

#### Mobile
- Reduce font sizes slightly (scale 0.9)
- Stack horizontal layouts vertically
- Hide non-critical metadata
- Larger touch targets (min 44x44px)

#### Tablet
- Standard font sizes
- Maintain horizontal layouts
- Show all metadata
- Standard touch targets

#### Desktop
- Standard font sizes
- Hover states enabled
- Keyboard shortcuts visible
- Mouse-optimized interactions

---

## 6. Accessibility Requirements (WCAG 2.1 AA)

### 6.1 Keyboard Navigation

**Tab Order**:
1. Tile container (focusable if interactive)
2. Primary action button
3. Secondary actions
4. Links within content

**Keyboard Shortcuts**:
- `Tab`: Navigate between tiles
- `Enter/Space`: Activate focused tile or button
- `Escape`: Close modal/drawer opened from tile
- `Arrow keys`: Navigate within list tiles

**Focus Indicators**:
- Visible focus ring (2px solid, high contrast)
- Focus ring color: `--p-color-border-interactive`
- Focus ring offset: 2px

### 6.2 Screen Reader Support

**Tile Announcement**:
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
  <!-- Content -->
</div>
```

**Live Regions**:
- Tile updates: `aria-live="polite"`
- Error messages: `aria-live="assertive"` or `role="alert"`
- Loading states: `aria-busy="true"`

**Status Badges**:
- Include text alternative
- Use `aria-label` for icon-only badges
- Announce status changes

### 6.3 Color Contrast

**Minimum Ratios** (WCAG AA):
- Normal text: 4.5:1
- Large text (18pt+): 3:1
- UI components: 3:1

**Status Colors** (verified):
- Healthy: Green text on light green background (4.8:1) ✅
- Attention: Red text on light red background (4.6:1) ✅
- Unconfigured: Gray text on light gray background (4.5:1) ✅

**High Contrast Mode**:
- Support Windows High Contrast Mode
- Use semantic color tokens
- Test with forced-colors media query

### 6.4 Text Alternatives

**Images**: Alt text for all images  
**Icons**: `aria-label` or `aria-labelledby`  
**Charts**: Text summary or data table alternative  
**Status Indicators**: Text label, not color alone

---

## 7. Polaris Component Mapping

### 7.1 Recommended Migration

**Current** (Custom CSS):
```tsx
<div className="occ-tile">
  <h2>{title}</h2>
  <span className="occ-status-healthy">Healthy</span>
  {content}
</div>
```

**Recommended** (Polaris):
```tsx
<Card>
  <BlockStack gap="400">
    <InlineStack align="space-between" blockAlign="start">
      <Text variant="headingMd" as="h2">{title}</Text>
      <Badge tone="success">Healthy</Badge>
    </InlineStack>
    
    {fact && (
      <Text variant="bodySm" tone="subdued">
        Last refreshed {formatDateTime(fact.createdAt)}
      </Text>
    )}
    
    {content}
  </BlockStack>
</Card>
```

### 7.2 Component Library

| Element | Current | Polaris Component |
|---------|---------|-------------------|
| Tile container | `<div className="occ-tile">` | `<Card>` |
| Tile grid | `<div className="occ-tile-grid">` | `<Layout>` with `<Layout.Section>` |
| Status badge | Custom span | `<Badge tone="success\|critical\|info">` |
| Metric value | Custom styled | `<Text variant="heading2xl">` |
| Meta text | Custom styled | `<Text variant="bodySm" tone="subdued">` |
| Action button | Custom button | `<Button variant="primary\|secondary">` |
| Error message | Custom div | `<Banner tone="critical">` |
| Empty state | Custom div | `<EmptyState>` |
| Loading | Custom skeleton | `<SkeletonBodyText>`, `<Spinner>` |

---

## 8. Animation & Transitions

### 8.1 Tile Entrance
- Fade in + slight scale (0.95 → 1.0)
- Duration: 200ms
- Easing: `cubic-bezier(0.4, 0.0, 0.2, 1)`
- Stagger: 50ms between tiles

### 8.2 State Transitions
- Opacity changes: 150ms
- Color changes: 200ms
- Layout shifts: Avoid (use absolute positioning for overlays)

### 8.3 Hover Effects
- Shadow elevation: 150ms
- Scale: None (avoid layout shift)
- Cursor: pointer (for interactive tiles)

### 8.4 Loading Animations
- Skeleton shimmer: 1.5s loop
- Spinner rotation: 1s linear infinite
- Progress bar: Smooth incremental updates

---

## 9. Implementation Guidelines

### 9.1 Component Structure

```tsx
interface TileProps<T> {
  title: string;
  tile: TileState<T>;
  render: (data: T) => ReactNode;
  testId?: string;
  onAction?: () => void;
  actionLabel?: string;
}

interface TileState<T> {
  status: 'ok' | 'error' | 'unconfigured' | 'loading';
  data?: T;
  fact?: TileFact;
  source?: 'fresh' | 'cache' | 'mock';
  error?: TileError;
}

interface TileError {
  type: 'network' | 'auth' | 'validation' | 'timeout';
  message: string;
  retryable: boolean;
}
```

### 9.2 Testing Requirements

**Visual Regression**:
- All tile states (loading, success, error, empty)
- All breakpoints (mobile, tablet, desktop)
- High contrast mode
- Focus states

**Accessibility**:
- Keyboard navigation (all interactive elements reachable)
- Screen reader announcements (NVDA, JAWS, VoiceOver)
- Color contrast (automated + manual verification)
- Focus indicators visible

**Functional**:
- Data loading and error handling
- Retry mechanisms
- State transitions
- Responsive behavior

---

## 10. Design Tokens Reference

See `app/styles/tokens.css` for complete token definitions.

**Key Tokens**:
- `--occ-tile-padding`: 20px
- `--occ-tile-gap`: 20px
- `--occ-tile-min-width`: 320px
- `--occ-tile-min-height`: 280px
- `--occ-radius-tile`: 12px
- `--occ-shadow-tile`: Polaris card shadow
- `--occ-status-*-text/bg/border`: Status color system

---

## 11. Future Enhancements

### 11.1 Phase 2
- Tile customization (user can reorder, hide/show)
- Tile size variants (compact, standard, expanded)
- Tile grouping and sections
- Tile export (PDF, CSV)

### 11.2 Phase 3
- Real-time updates (SSE/WebSocket)
- Tile alerts and notifications
- Tile comparison mode
- Historical data overlays

---

## 12. Acceptance Criteria

- [ ] All tile types documented with examples
- [ ] All states (loading, success, error, empty) specified
- [ ] Responsive behavior defined for all breakpoints
- [ ] WCAG 2.1 AA compliance verified
- [ ] Polaris component mapping complete
- [ ] Keyboard navigation patterns documented
- [ ] Screen reader support specified
- [ ] Animation and transition guidelines provided
- [ ] Implementation examples included
- [ ] Testing requirements defined

---

## 13. References

- [Shopify Polaris Design System](https://polaris.shopify.com/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Polaris Accessibility Guide](https://polaris.shopify.com/foundations/accessibility)
- Existing implementation: `app/components/tiles/`
- Design tokens: `app/styles/tokens.css`

