# Hot Rod AN Design System Guide

**Owner:** Designer  
**Date:** 2025-10-19  
**Version:** 1.0  
**Purpose:** Consolidated design system reference for Engineering and QA teams

---

## 1. Foundation Principles

### 1.1 Design Philosophy

**Operator-First Design:**

- Prioritize speed with clarity over visual flourish
- Every interaction shows evidence and enables rollback
- Status always visible (Healthy/Attention needed/Configuration required)
- HITL (Human-in-the-Loop) by default for all customer-facing actions

**Polaris Alignment:**

- Use Shopify Polaris components exclusively
- Follow Polaris tone guide: short sentences, present tense, clear outcomes
- Leverage Polaris design tokens for consistency
- No custom CSS for spacing, colors, or typography

**Accessibility First:**

- WCAG 2.1 AA minimum standard
- Keyboard navigation for all interactive elements
- Screen reader support with proper ARIA
- Color contrast ≥4.5:1 for text, ≥3:1 for UI components

---

## 2. Design Tokens

### 2.1 Color System

**Status Colors:**

```css
--occ-status-healthy-text: #1a7f37; /* Green, 4.8:1 contrast */
--occ-status-attention-text: #d82c0d; /* Red, 4.6:1 contrast */
--occ-status-unconfigured-text: #637381; /* Gray, 4.5:1 contrast */
```

**Text Colors:**

```css
--occ-text-primary: #202223; /* Body text, 16.6:1 contrast */
--occ-text-secondary: #637381; /* Meta text, subdued */
```

**Polaris Badge Tones:**

- `success`: Green (healthy, complete, approved)
- `warning`: Yellow (pending, filling, caution)
- `critical`: Red (error, attention, rejected)
- `info`: Blue (draft, informational)

### 2.2 Spacing System

**Grid & Layout:**

```css
--occ-tile-padding: 20px; /* Internal tile padding */
--occ-tile-gap: 20px; /* Gap between tiles */
--occ-tile-internal-gap: 16px; /* Gap within tile sections */
```

**Polaris Spacing Props:**

```tsx
// Use named values, not pixel values
<Stack gap="base">           // 16px
<Stack gap="small">          // 8px
<Stack gap="large">          // 24px
<Box padding="base">         // 16px
<Box padding="small-200">    // 12px
```

### 2.3 Typography System

**Size Scale:**

```css
--occ-font-size-heading: 1.15rem; /* Tile headings */
--occ-font-size-metric: 1.5rem; /* Large metrics (5/5, revenue) */
--occ-font-size-body: 1rem; /* Body text */
--occ-font-size-meta: 0.85rem; /* Timestamps, sources */
--occ-font-weight-semibold: 600; /* Metrics, labels */
```

**Polaris Text Variants:**

```tsx
<Text variant="heading2xl">  // Large metrics (5/5)
<Text variant="headingMd">   // Section headings
<Text variant="bodySm">      // Meta text, timestamps
<Text variant="bodyLg">      // Emphasis
```

### 2.4 Effects & Borders

```css
--occ-radius-tile: 12px;
--occ-shadow-tile: Polaris card shadow;
--occ-shadow-tile-hover: Elevated shadow;
```

---

## 3. Component Library

### 3.1 Core Components

**TileCard (Status Container):**

```tsx
interface TileCardProps<T> {
  title: string;
  tile: TileState<T>;
  render: (data: T) => ReactNode;
  testId?: string;
}

interface TileState<T> {
  status: "ok" | "error" | "unconfigured";
  data?: T;
  fact?: TileFact;
  source?: "fresh" | "cache" | "mock";
  error?: string;
}
```

**Status System:**

- `ok` → Green badge "Healthy"
- `error` → Red badge "Attention needed"
- `unconfigured` → Gray badge "Configuration required"

**Polaris Mapping:**

```tsx
<Badge
  tone={status === "ok" ? "success" : status === "error" ? "critical" : "info"}
>
  {STATUS_LABELS[status]}
</Badge>
```

### 3.2 Button Patterns

**Primary Actions:**

```tsx
<Button variant="primary">Approve</Button>
<Button variant="primary">View Idea Pool</Button>
<Button variant="primary">Save product</Button>
```

**Secondary Actions:**

```tsx
<Button variant="secondary">Request changes</Button>
<Button variant="secondary">Save as draft</Button>
<Button variant="secondary">Try Again</Button>
```

**Critical Actions:**

```tsx
<Button variant="primary" tone="critical">Reject</Button>
<Button tone="critical">Cancel order</Button>
<Button tone="critical">Delete</Button>
```

### 3.3 Badge Usage

**Status Badges:**

```tsx
<Badge tone="success">Full</Badge>           // 5/5 ideas
<Badge tone="warning">Filling</Badge>        // <5 ideas
<Badge tone="info">Draft</Badge>             // Approval state
<Badge tone="critical">Attention</Badge>     // Errors
<Badge tone="warning">Wildcard</Badge>       // Special category
```

**Kind Badges:**

```tsx
<Badge>CX_REPLY</Badge>      // Default tone
<Badge>INVENTORY</Badge>
<Badge>GROWTH</Badge>
<Badge>MISC</Badge>
```

---

## 4. Layout Patterns

### 4.1 Responsive Grid

**Desktop (≥1280px):**

```tsx
<div className="occ-tile-grid">
  {/* Grid: 3-4 columns, auto-fit, minmax(320px, 1fr) */}
</div>
```

**Tablet (768-1279px):**

```tsx
{
  /* Grid: 2 columns, equal width */
}
{
  /* Stack to 1 column when <880px */
}
```

**Mobile (<768px):**

```tsx
{
  /* Grid: 1 column, full width */
}
{
  /* Font scale: 0.9 */
}
{
  /* Touch targets: min 44x44px */
}
```

### 4.2 Stack Patterns

**Vertical Stack (Block Direction):**

```tsx
<Stack direction="block" gap="base">
  <Text variant="headingMd">Section Title</Text>
  <Text>Body content</Text>
  <Button>Action</Button>
</Stack>
```

**Horizontal Stack (Inline Direction):**

```tsx
<InlineStack align="space-between">
  <Text tone="subdued">Label</Text>
  <Text fontWeight="semibold">Value</Text>
</InlineStack>
```

**Two-Column Layout (Desktop):**

```tsx
<Grid gridTemplateColumns="1fr 1fr" gap="base">
  <Box>
    <Text>Left column</Text>
  </Box>
  <Box>
    <Text>Right column</Text>
  </Box>
</Grid>
```

---

## 5. State Patterns

### 5.1 Loading States

**Skeleton (Initial Load):**

```tsx
{
  tile.status === "loading" && (
    <div className="occ-skeleton" aria-busy="true">
      {/* Shimmer animation, preserve dimensions */}
    </div>
  );
}
```

**Refresh (Background Update):**

```tsx
{
  tile.refreshing && (
    <div style={{ opacity: 0.7 }}>
      <Spinner size="small" />
      {/* Existing data remains visible */}
    </div>
  );
}
```

### 5.2 Error States

**Network Error:**

```tsx
<Banner tone="critical">
  Unable to connect. Check your network.
  <Button onClick={retry}>Retry</Button>
</Banner>
```

**Unconfigured:**

```tsx
<Banner tone="info">
  Connect integration to enable this tile.
  <Button variant="primary" onClick={setup}>
    Set up
  </Button>
</Banner>
```

**Validation Error:**

```tsx
<Banner tone="critical">
  Validation Errors
  <ul>
    {errors.map((e) => (
      <li key={e.field}>{e.message}</li>
    ))}
  </ul>
</Banner>
```

### 5.3 Empty States

**No Data:**

```tsx
<Text tone="subdued">No {dataType} right now.</Text>
<Text variant="bodySm" tone="subdued">
  Data will appear here when available.
</Text>
```

**Examples:**

- "No SLA breaches detected."
- "All recent orders are on track."
- "No low stock alerts right now."
- "No ideas in the pool yet."

---

## 6. Accessibility Patterns

### 6.1 Keyboard Navigation

**Interactive Divs (Avoid - Use Buttons):**

```tsx
// ❌ Bad
<div onClick={handleClick}>Click me</div>

// ✅ Good
<Button onClick={handleClick}>Click me</Button>

// ✅ Acceptable (if Button not suitable)
<div
  role="button"
  tabIndex="0"
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === "Enter" || e.key === " ") {
      handleClick(e);
    }
  }}
>
  Click me
</div>
```

**Focus Management:**

```tsx
// Modal opens → focus moves to heading
<Modal heading="Approval Details" />

// Modal closes → focus returns to trigger
<Button onClick={openModal}>View Details</Button>

// Escape key supported
useEffect(() => {
  const handleEscape = (e) => {
    if (e.key === "Escape") closeModal();
  };
  window.addEventListener("keydown", handleEscape);
  return () => window.removeEventListener("keydown", handleEscape);
}, []);
```

### 6.2 Screen Reader Support

**Accessible Labels:**

```tsx
// Icon-only button
<Button accessibilityLabel="Close drawer">
  <Icon type="x" />
</Button>

// Form input
<TextField
  label="Email Address"
  type="email"
  autoComplete="email"
/>

// Image
<img src="product.jpg" alt="Blue running shoes, size 10" />
```

**Live Regions:**

```tsx
// Polite announcements (tile updates)
<div aria-live="polite" aria-atomic="true">
  {statusMessage}
</div>

// Assertive announcements (errors)
<Banner tone="critical" role="alert">
  {errorMessage}
</Banner>
```

**Semantic HTML:**

```tsx
// ✅ Good - proper heading hierarchy
<h1>Hot Rod AN Control Center</h1>
  <h2>Sales Pulse</h2>
    <h3>Top SKUs</h3>
  <h2>Inventory Heatmap</h2>

// ❌ Bad - skipped level
<h1>Dashboard</h1>
<h3>Section</h3>  {/* Skips h2 */}
```

### 6.3 Form Accessibility

**Input with Label:**

```tsx
<label htmlFor="email">
  Email Address <span aria-label="required">(required)</span>
</label>
<input
  id="email"
  type="email"
  required
  aria-required="true"
  aria-describedby="email-error"
  autoComplete="email"
/>
<div id="email-error" role="alert">
  {error && "Please enter a valid email address"}
</div>
```

**Polaris TextField:**

```tsx
<TextField
  label="Email Address"
  type="email"
  required
  error={error ? "Please enter a valid email address" : undefined}
  autoComplete="email"
/>
```

---

## 7. Responsive Patterns

### 7.1 Breakpoint Strategy

**Mobile-First Approach:**

```tsx
// Base (mobile): 1 column
<Stack direction="block" gap="base">

// Tablet (768px+): 2 columns
@media (min-width: 768px) {
  grid-template-columns: repeat(2, 1fr);
}

// Desktop (1280px+): 3-4 columns
@media (min-width: 1280px) {
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
}
```

**Content Adaptation:**

```tsx
// Desktop: Side-by-side
<Grid gridTemplateColumns="1fr 1fr">
  <Box>Activation</Box>
  <Box>SLA</Box>
</Grid>

// Tablet: Stacked
<Stack direction="block">
  <Box>Activation</Box>
  <Box>SLA</Box>
</Stack>
```

### 7.2 Accessibility Preservation

**Reading Order Unchanged:**

```tsx
// Desktop and tablet both maintain top-to-bottom order
// CSS positioning used, not DOM reordering
<Stack direction={{ xs: "block", md: "inline" }}>
  <Box order={1}>First</Box>
  <Box order={2}>Second</Box>
</Stack>
```

**Touch Target Sizing:**

```tsx
// Mobile: minimum 44x44px
<Button style={{ minHeight: '44px', minWidth: '44px' }}>
  <Icon type="menu" />
</Button>

// Desktop: standard sizing
<Button>
  <Icon type="menu" />
</Button>
```

---

## 8. Microcopy Guidelines

### 8.1 CTA Patterns

**Format:** Verb + Noun (2 words maximum)

**Approved Examples:**

- "Approve" (action)
- "Reject" (action)
- "View Details" (navigation)
- "View Idea Pool" (navigation)
- "Request changes" (action)
- "Approve & send" (action + confirmation)
- "Mark resolved" (action)

**Anti-Patterns:**

- ❌ "Click here"
- ❌ "Submit"
- ❌ "Go"
- ❌ "Learn more" (too vague)

### 8.2 Error Messages

**Format:** Problem + Action or Context

**Approved Examples:**

- "Unable to connect. Check your network."
- "Validation failed. Fix highlighted errors."
- "Email must include @ symbol"
- "Failed to validate approval" (system error)

**Anti-Patterns:**

- ❌ "Error"
- ❌ "Invalid input"
- ❌ "Something went wrong"

### 8.3 Status Messages

**Format:** Clear state description

**Approved Examples:**

- "Healthy" (ok state)
- "Attention needed" (error state)
- "Configuration required" (unconfigured state)
- "Full" (5/5 capacity)
- "Filling" (<5 capacity)

---

## 9. Component Specifications

### 9.1 Approvals Drawer

**Core Elements:**

- Title: `<h2>{approval.summary}</h2>`
- Status badge: Draft/Pending/Approved/Applied/Audited/Learned
- Kind badge: CX_REPLY/INVENTORY/GROWTH/MISC
- Tabs: Evidence, Impact & Risks, Actions
- Buttons: Reject (critical), Approve (primary), Apply (when approved)

**Accessibility:**

- Modal traps focus
- Escape closes and returns focus
- Tab order: tabs → buttons → close
- `aria-label` on drawer

**Reference:** `docs/design/approvals_microcopy.md` lines 10-33

### 9.2 Dashboard Tiles

**Standard Structure:**

```tsx
<TileCard title="Tile Name" tile={state}>
  {/* Status badge */}
  <Badge tone={statusTone}>{statusLabel}</Badge>

  {/* Meta text */}
  <Text variant="bodySm" tone="subdued">
    Last refreshed {time} • Source: {source}
  </Text>

  {/* Tile-specific content */}
  {renderContent(data)}
</TileCard>
```

**Minimum Dimensions:**

- Width: 320px
- Height: 280px
- Padding: 20px
- Internal gap: 16px

**Reference:** `docs/design/dashboard-tiles.md` lines 30-90

### 9.3 Idea Pool Tile

**Elements:**

```tsx
<Stack gap="base">
  <InlineStack align="space-between">
    <Stack gap="small">
      <Text variant="heading2xl" fontWeight="bold">
        5/5
      </Text>
      <Text variant="bodySm" tone="subdued">
        Ideas in pool
      </Text>
    </Stack>
    <Badge tone={isFull ? "success" : "warning"}>
      {isFull ? "Full" : "Filling"}
    </Badge>
  </InlineStack>

  {wildcard && (
    <InlineStack gap="small">
      <Badge tone="warning">Wildcard</Badge>
      <Text variant="bodySm">{wildcard.title}</Text>
    </InlineStack>
  )}

  <Button url="/ideas" variant="primary">
    View Idea Pool
  </Button>
</Stack>
```

**Reference:** `docs/design/dashboard-tiles.md` lines 549-680

### 9.4 CX Escalation Modal

**Title Format (Contract Test):**

```tsx
<h2>CX Escalation — {customerName}</h2>
```

**Grading Sliders:**

```tsx
<Slider
  label="Tone"
  min={1}
  max={5}
  defaultValue={3}
  value={tone}
  onChange={setTone}
  // Display: "Tone: 3"
/>
```

**Reference:** `docs/design/approvals_microcopy.md` lines 35-49

---

## 10. Implementation Checklist

### 10.1 Before Coding

- [ ] Read relevant design spec (approvals_microcopy.md or dashboard-tiles.md)
- [ ] Identify Polaris components needed
- [ ] Review accessibility requirements
- [ ] Check responsive behavior requirements

### 10.2 During Development

- [ ] Use Polaris components only (no custom CSS for spacing/colors)
- [ ] Add `aria-label` to icon-only buttons
- [ ] Add `label` prop to all form fields
- [ ] Test keyboard navigation (Tab, Enter, Escape)
- [ ] Verify focus indicators visible
- [ ] Check color contrast with WebAIM tool

### 10.3 Before PR

- [ ] Run `npm run fmt`
- [ ] Run `npm run lint` (0 jsx-a11y errors)
- [ ] Manual keyboard test (all functions accessible)
- [ ] Check responsive at 1280px, 768px, 375px
- [ ] Verify microcopy matches spec exactly
- [ ] Run contract tests if applicable

---

## 11. Cross-References

**Design Specifications:**

- Approvals & microcopy: `docs/design/approvals_microcopy.md`
- Dashboard tiles: `docs/design/dashboard-tiles.md`
- Visual regression: `docs/design/qa-visual-regression-scenarios.md`
- Accessibility: `docs/design/qa-accessibility-audit-checklist.md`
- Engineer pairing: `docs/design/engineer-pairing-checklist.md`
- Design sign-off: `docs/design/final-design-signoff.md`

**External Resources:**

- Polaris: https://polaris.shopify.com/
- WCAG 2.1: https://www.w3.org/WAI/WCAG21/quickref/
- jsx-a11y: https://github.com/jsx-eslint/eslint-plugin-jsx-a11y

---

## Change Log

- **2025-10-19:** v1.0 - Initial design system consolidation guide created by Designer
