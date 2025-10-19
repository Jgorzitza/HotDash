# Component Accessibility Quick Reference

**Owner:** Designer  
**For:** Engineering Team  
**Date:** 2025-10-19  
**Purpose:** Fast reference for implementing accessible Polaris components

---

## Quick Checklist

Before committing any component:

- [ ] All buttons have descriptive text or `accessibilityLabel`
- [ ] All form inputs have `label` prop
- [ ] All images have `alt` text (or `alt=""` for decorative)
- [ ] Keyboard navigation works (Tab, Enter, Escape)
- [ ] Focus indicators visible
- [ ] Color contrast ≥4.5:1 for text
- [ ] `aria-live` for dynamic content
- [ ] No jsx-a11y lint errors

---

## 1. Buttons

### Icon-Only Button

```tsx
// ❌ Bad - no accessible name
<Button><Icon type="x" /></Button>

// ✅ Good - has aria-label
<Button accessibilityLabel="Close drawer">
  <Icon type="x" />
</Button>
```

### Button with Text

```tsx
// ✅ Good - text is accessible name
<Button variant="primary">Approve</Button>
<Button tone="critical">Reject</Button>
```

### Button States

```tsx
// Disabled
<Button disabled>Approve</Button>

// Loading
<Button loading>Saving...</Button>

// Both preserve accessible name
```

---

## 2. Form Inputs

### Text Field

```tsx
// ❌ Bad - no label
<TextField placeholder="Enter email" />

// ✅ Good - has label
<TextField
  label="Email Address"
  type="email"
  autoComplete="email"
/>

// ✅ Good - with error
<TextField
  label="Email Address"
  type="email"
  error={error ? "Email must include @ symbol" : undefined}
  aria-describedby="email-error"
/>
```

### Required Fields

```tsx
<TextField
  label="Email Address"
  required
  // Polaris adds "(required)" and aria-required automatically
/>
```

### Textarea

```tsx
<TextField
  label="Reply text"
  multiline={4}
  placeholder="Lead with the key outcome..."
/>
```

---

## 3. Interactive Elements

### Clickable Regions

```tsx
// ❌ Bad - div with onClick
<div onClick={handleClick}>Action</div>

// ✅ Good - use Button or Link
<Button onClick={handleClick}>Action</Button>
<Link url="/path">Navigate</Link>

// ✅ Acceptable - with full keyboard support
<div
  role="button"
  tabIndex="0"
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick(e);
    }
  }}
>
  Action
</div>
```

### Links vs Buttons

```tsx
// Links for navigation
<Link url="/ideas">View Idea Pool</Link>
<a href="/external" target="_blank" rel="noopener">
  External <Icon type="external" />
</a>

// Buttons for actions
<Button onClick={handleApprove}>Approve</Button>
<Button onClick={openModal}>View Details</Button>
```

---

## 4. Dynamic Content

### Live Regions

```tsx
// Tile updates (polite - doesn't interrupt)
<div aria-live="polite" aria-atomic="true">
  Last refreshed {timeAgo}
</div>

// Error messages (assertive - interrupts)
<Banner tone="critical" role="alert">
  {errorMessage}
</Banner>

// Status changes
<Badge tone={tone} aria-live="polite">
  {statusText}
</Badge>
```

### Loading States

```tsx
// Initial load
<div aria-busy="true" aria-label="Loading tile data">
  <Spinner />
</div>

// Background refresh
<div aria-busy={refreshing}>
  {data && <Content data={data} />}
  {refreshing && <Spinner size="small" />}
</div>
```

---

## 5. Modal & Drawer Patterns

### Modal Accessibility

```tsx
<Modal
  heading="Approval Details" // Announces to screen readers
  onClose={handleClose} // Escape key support
>
  {/* Focus trapped inside modal */}
  <Stack gap="base">
    <Text>Content</Text>
    <ButtonGroup>
      <Button onClick={handleClose}>Cancel</Button>
      <Button variant="primary" onClick={handleApprove}>
        Approve
      </Button>
    </ButtonGroup>
  </Stack>
</Modal>
```

### Focus Management

```tsx
const modalRef = useRef<HTMLDivElement>(null);
const triggerRef = useRef<HTMLButtonElement>(null);

const openModal = () => {
  setOpen(true);
  // Focus moves to modal heading automatically (Polaris handles)
};

const closeModal = () => {
  setOpen(false);
  // Return focus to trigger
  triggerRef.current?.focus();
};

// Escape key
useEffect(() => {
  if (!open) return;
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === "Escape") closeModal();
  };
  window.addEventListener("keydown", handleEscape);
  return () => window.removeEventListener("keydown", handleEscape);
}, [open]);
```

---

## 6. Tables

### Accessible Table Structure

```tsx
<table>
  <caption>Inventory Heatmap</caption>
  <thead>
    <tr>
      <th scope="col">Product</th>
      <th scope="col">Quantity</th>
      <th scope="col">Days of Cover</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">Product Name</th>
      <td>50</td>
      <td>15</td>
    </tr>
  </tbody>
</table>
```

### Scrollable Table (Tablet)

```tsx
<div role="region" aria-label="Inventory heatmap" style={{ overflowX: "auto" }}>
  <table>...</table>
</div>
```

---

## 7. Images & Media

### Product Images

```tsx
// ✅ Good - descriptive alt
<img src="product.jpg" alt="Blue running shoes, women's size 10, mesh upper" />
```

### Decorative Images

```tsx
// ✅ Good - empty alt
<img src="background-pattern.svg" alt="" />
```

### Icons in Polaris

```tsx
// Icon in button (button text provides label)
<Button>
  <Icon type="check" /> Approve
</Button>

// Icon-only (needs aria-label)
<Button accessibilityLabel="Approve">
  <Icon type="check" />
</Button>
```

---

## 8. Heading Hierarchy

### Dashboard Structure

```tsx
<Page title="Hot Rod AN Control Center">
  {" "}
  {/* h1 */}
  <Layout>
    <TileCard title="Sales Pulse">
      {" "}
      {/* h2 */}
      <Stack>
        <Text variant="headingMd">Top SKUs</Text> {/* h3 */}
        <List>...</List>
      </Stack>
    </TileCard>

    <TileCard title="Inventory Heatmap">
      {" "}
      {/* h2 */}
      {/* ... */}
    </TileCard>
  </Layout>
</Page>
```

### Rules

- Single `<h1>` per page (Page title)
- Tiles use `<h2>`
- Tile sections use `<h3>`
- Never skip levels (h1→h3)

---

## 9. Color & Contrast

### Text Contrast Requirements

| Element Type                    | Minimum Ratio | Polaris Verification            |
| ------------------------------- | ------------- | ------------------------------- |
| Normal text (<18px)             | 4.5:1         | Use default Polaris text colors |
| Large text (≥18px or 14px bold) | 3:1           | Use Polaris heading variants    |
| UI components                   | 3:1           | Use Polaris Badge/Button tones  |

### Verified Ratios

- Healthy status: 4.8:1 ✅
- Attention status: 4.6:1 ✅
- Unconfigured status: 4.5:1 ✅
- Body text: 16.6:1 ✅

### Non-Color Indicators

```tsx
// ❌ Bad - color only
<span style={{ color: 'red' }}>Error</span>

// ✅ Good - color + icon + text
<Badge tone="critical" icon="alert-circle">
  Error
</Badge>
```

---

## 10. Keyboard Shortcuts Reference

| Key        | Action               | Context                                 |
| ---------- | -------------------- | --------------------------------------- |
| Tab        | Navigate forward     | All focusable elements                  |
| Shift+Tab  | Navigate backward    | All focusable elements                  |
| Enter      | Activate button/link | Buttons, links, custom interactive      |
| Space      | Activate button      | Buttons, checkboxes, custom interactive |
| Escape     | Close modal/drawer   | Modals, drawers, popovers               |
| Arrow keys | Navigate lists/menus | Select dropdowns, radio groups          |

---

## 11. Common Violations & Fixes

### Missing Label

```tsx
// ❌ Violation
<input type="email" placeholder="Email" />

// ✅ Fix
<TextField label="Email Address" type="email" />
```

### Non-Focusable Interactive

```tsx
// ❌ Violation
<div onClick={handleClick}>Click</div>

// ✅ Fix
<Button onClick={handleClick}>Click</Button>
```

### Missing Keyboard Handler

```tsx
// ❌ Violation
<div onClick={handleClick} role="button">Click</div>

// ✅ Fix
<div
  role="button"
  tabIndex="0"
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === "Enter" || e.key === " ") handleClick(e);
  }}
>
  Click
</div>
```

### Missing Alt Text

```tsx
// ❌ Violation
<img src="product.jpg" />

// ✅ Fix
<img src="product.jpg" alt="Product name and description" />
```

### Skipped Heading Level

```tsx
// ❌ Violation
<h1>Page</h1>
<h3>Section</h3>

// ✅ Fix
<h1>Page</h1>
<h2>Section</h2>
```

---

## 12. Testing Commands

```bash
# Lint (includes jsx-a11y rules)
npm run lint

# Check specific file
npx eslint app/components/MyComponent.tsx

# Check accessibility in browser
# 1. Install axe DevTools extension
# 2. Open component in browser
# 3. Run axe scan
# 4. Fix all violations

# Lighthouse audit
# 1. Open Chrome DevTools
# 2. Lighthouse tab
# 3. Run audit
# 4. Accessibility score should be ≥95
```

---

## 13. Resources

**Polaris Documentation:**

- Components: https://polaris.shopify.com/components
- Tokens: https://polaris.shopify.com/tokens
- Accessibility: https://polaris.shopify.com/foundations/accessibility

**Internal References:**

- Design system guide: `docs/design/design-system-guide.md`
- QA accessibility checklist: `docs/design/qa-accessibility-audit-checklist.md`
- Microcopy spec: `docs/design/approvals_microcopy.md`

**WCAG Resources:**

- Quick reference: https://www.w3.org/WAI/WCAG21/quickref/
- Contrast checker: https://webaim.org/resources/contrastchecker/

---

## Change Log

- **2025-10-19:** v1.0 - Initial component accessibility quick reference for engineers
