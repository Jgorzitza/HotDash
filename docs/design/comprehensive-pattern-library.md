# Comprehensive UI Pattern Library

**Owner:** Designer  
**Date:** 2025-10-19  
**Version:** 1.0  
**Purpose:** Complete reference for all UI patterns, interactions, and micro-patterns

---

## 1. Search & Filter Patterns

### 1.1 Search Field

```tsx
<SearchField
  label="Search products"
  value={query}
  onChange={setQuery}
  placeholder="Search by name, SKU, or category"
/>
```

### 1.2 Filter Bar

```tsx
<InlineStack gap="base">
  <Select
    label="Status"
    options={statusOptions}
    value={status}
    onChange={setStatus}
  />
  <Select
    label="Category"
    options={categoryOptions}
    value={category}
    onChange={setCategory}
  />
  <Button onClick={applyFilters}>Apply</Button>
  <Button onClick={clearFilters}>Clear</Button>
</InlineStack>
```

**Microcopy:**

- Apply button: "Apply Filters"
- Clear button: "Clear Filters"
- Results count: "Showing {count} results"

---

## 2. Pagination Patterns

### 2.1 Page Navigation

```tsx
<InlineStack align="center" gap="small">
  <Button
    onClick={previousPage}
    disabled={currentPage === 1}
    accessibilityLabel="Previous page"
  >
    <Icon type="chevron-left" />
  </Button>

  <Text variant="bodySm">
    Page {currentPage} of {totalPages}
  </Text>

  <Button
    onClick={nextPage}
    disabled={currentPage === totalPages}
    accessibilityLabel="Next page"
  >
    <Icon type="chevron-right" />
  </Button>
</InlineStack>
```

### 2.2 Items Per Page

```tsx
<Select
  label="Items per page"
  options={[
    { label: "10", value: "10" },
    { label: "25", value: "25" },
    { label: "50", value: "50" },
    { label: "100", value: "100" },
  ]}
  value={itemsPerPage}
  onChange={setItemsPerPage}
/>
```

---

## 3. Sorting & Ordering

### 3.1 Table Column Sort

```tsx
<th
  scope="col"
  onClick={() => handleSort("name")}
  aria-sort={sortBy === "name" ? sortDirection : undefined}
  style={{ cursor: "pointer" }}
>
  <InlineStack gap="small-200">
    <Text>Product Name</Text>
    {sortBy === "name" && (
      <Icon
        type={sortDirection === "asc" ? "arrow-up" : "arrow-down"}
        size="small"
      />
    )}
  </InlineStack>
</th>
```

**Accessibility:**

- `aria-sort="ascending"` or `"descending"`
- Keyboard: Enter/Space to sort
- Visual indicator (arrow icon)

---

## 4. Bulk Actions

### 4.1 Multi-Select Pattern

```tsx
<Stack gap="base">
  {/* Select all */}
  <Checkbox
    label="Select all {total} items"
    checked={allSelected}
    indeterminate={someSelected && !allSelected}
    onChange={toggleSelectAll}
  />

  {/* Bulk action bar */}
  {selectedCount > 0 && (
    <Banner tone="info">
      <InlineStack align="space-between">
        <Text>{selectedCount} items selected</Text>
        <ButtonGroup>
          <Button onClick={bulkDelete} tone="critical">
            Delete
          </Button>
          <Button onClick={bulkExport}>Export</Button>
          <Button onClick={clearSelection}>Clear</Button>
        </ButtonGroup>
      </InlineStack>
    </Banner>
  )}
</Stack>
```

**Microcopy:**

- Selection count: "{count} items selected"
- Bulk delete: "Delete {count} items" (confirmation required)
- Clear selection: "Clear selection"

---

## 5. Export/Download Patterns

### 5.1 CSV Export

```tsx
<Button
  onClick={exportCSV}
  icon="download"
  accessibilityLabel="Export data as CSV"
>
  Export CSV
</Button>
```

**Download Flow:**

1. Click button
2. Show loading state: "Preparing export..."
3. Browser downloads file
4. Toast: "Export complete. Check Downloads folder."

### 5.2 PDF Export

```tsx
<Button
  onClick={exportPDF}
  icon="download"
  accessibilityLabel="Export report as PDF"
>
  Export PDF
</Button>
```

**Accessibility:**

- Download announced to screen reader
- Toast has `aria-live="polite"`
- File name descriptive: `inventory-report-2025-10-19.csv`

---

## 6. Date & Time Patterns

### 6.1 Date Picker

```tsx
<DateField
  label="Select date"
  value={date}
  onChange={setDate}
  placeholder="YYYY-MM-DD"
/>
```

### 6.2 Date Range

```tsx
<InlineStack gap="small">
  <DateField label="Start date" value={startDate} onChange={setStartDate} />
  <Text>to</Text>
  <DateField label="End date" value={endDate} onChange={setEndDate} />
</InlineStack>
```

### 6.3 Time Display Formats

- Relative: "2 minutes ago", "5 hours ago", "3 days ago"
- Absolute: "Oct 19, 2025 at 2:30 PM"
- ISO: "2025-10-19T14:30:00Z" (in title attribute)

---

## 7. Currency & Number Patterns

### 7.1 Money Field

```tsx
<MoneyField label="Unit cost" value={cost} onChange={setCost} prefix="$" />
```

### 7.2 Number Field with Suffix

```tsx
<NumberField
  label="Discount"
  value={discount}
  onChange={setDiscount}
  suffix="%"
  min={0}
  max={100}
/>
```

### 7.3 Large Number Formatting

- < 1,000: "842"
- < 1,000,000: "45.2K"
- ≥ 1,000,000: "2.3M"

---

## 8. Multi-Select Patterns

### 8.1 Choice List (Multiple)

```tsx
<ChoiceList
  label="Select categories"
  multiple
  values={selectedCategories}
  onChange={setSelectedCategories}
>
  <Checkbox value="apparel" label="Apparel" />
  <Checkbox value="footwear" label="Footwear" />
  <Checkbox value="accessories" label="Accessories" />
</ChoiceList>
```

### 8.2 Tag Input

```tsx
<Stack gap="small">
  <Text variant="bodySm">Selected: {tags.length}</Text>
  <InlineStack gap="small-200">
    {tags.map((tag) => (
      <ClickableChip key={tag} removable onRemove={() => removeTag(tag)}>
        {tag}
      </ClickableChip>
    ))}
  </InlineStack>
</Stack>
```

---

## 9. Keyboard Shortcuts

### 9.1 Global Shortcuts

| Key                | Action             | Scope  |
| ------------------ | ------------------ | ------ |
| `/`                | Focus search       | Global |
| `Escape`           | Close modal/drawer | Modals |
| `Ctrl/Cmd + S`     | Save               | Forms  |
| `Ctrl/Cmd + Enter` | Submit             | Forms  |

### 9.2 Shortcut Display

```tsx
<Text variant="bodySm" tone="subdued">
  Press <kbd>/</kbd> to search
</Text>

<style>
  kbd {
    padding: 2px 6px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-family: monospace;
  }
</style>
```

---

## 10. Focus Management

### 10.1 Focus Trap (Modal)

```tsx
useEffect(() => {
  if (!open) return;

  const firstFocusable = modalRef.current?.querySelector(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
  );
  firstFocusable?.focus();

  const handleTab = (e: KeyboardEvent) => {
    const focusableElements = modalRef.current?.querySelectorAll("...");
    const first = focusableElements[0];
    const last = focusableElements[focusableElements.length - 1];

    if (e.key === "Tab") {
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  window.addEventListener("keydown", handleTab);
  return () => window.removeEventListener("keydown", handleTab);
}, [open]);
```

### 10.2 Focus Return

```tsx
const triggerRef = useRef<HTMLButtonElement>(null);

const closeModal = () => {
  setOpen(false);
  triggerRef.current?.focus();
};
```

---

## 11. ARIA Live Regions

### 11.1 Polite Updates

```tsx
<div aria-live="polite" aria-atomic="true">
  {statusMessage}
</div>
```

**Usage:**

- Tile refresh status
- Background data updates
- Non-critical notifications

### 11.2 Assertive Alerts

```tsx
<Banner tone="critical" role="alert">
  {errorMessage}
</Banner>
```

**Usage:**

- Form validation errors
- Network failures
- Critical system messages

---

## 12. Screen Reader Patterns

### 12.1 Skip Links

```tsx
<a href="#main-content" className="skip-link">
  Skip to main content
</a>

<style>
  .skip-link {
    position: absolute;
    top: -40px;
    left: 0;
    padding: 8px;
  }
  .skip-link:focus {
    top: 0;
  }
</style>
```

### 12.2 Visually Hidden Text

```tsx
<span className="sr-only">
  {screenReaderOnlyText}
</span>

<style>
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
</style>
```

---

## 13. Color Accessibility

### 13.1 Color Blind Safe Palette

| Status   | Primary Color  | Color Blind Alternative |
| -------- | -------------- | ----------------------- |
| Success  | Green #1a7f37  | Blue-green #1a7f7f      |
| Warning  | Yellow #ffd700 | Orange #ff8c00          |
| Critical | Red #d82c0d    | Magenta #d80d7f         |
| Info     | Blue #0078d4   | Cyan #00d4d4            |

**Use with icons/text, not color alone.**

### 13.2 High Contrast Mode

```tsx
@media (prefers-contrast: high) {
  .occ-badge--success {
    border: 2px solid currentColor;
    font-weight: 600;
  }

  .occ-button {
    border: 2px solid currentColor;
  }
}
```

---

## 14. Reduced Motion

### 14.1 Preference Detection

```tsx
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 14.2 Alternative Feedback

```tsx
// Animation for regular users
<div className="slide-in">Content</div>

// Instant for reduced-motion users
<div className={prefersReducedMotion ? '' : 'slide-in'}>
  Content
</div>
```

---

## 15. Touch Gestures

### 15.1 Swipe to Dismiss

```tsx
// Drawer/Modal
onSwipeRight = { closeDrawer };
onSwipeLeft = { closeDrawer };
```

### 15.2 Pull to Refresh

```tsx
<div
  onTouchStart={handleTouchStart}
  onTouchMove={handleTouchMove}
  onTouchEnd={handleTouchEnd}
>
  {isPulling && <Spinner />}
  {content}
</div>
```

### 15.3 Long Press

```tsx
<div
  onTouchStart={startLongPress}
  onTouchEnd={endLongPress}
  role="button"
  aria-label="Long press for options"
>
  {item}
</div>
```

---

## 16. Responsive Images

### 16.1 Product Images

```tsx
<img
  src={product.imageSrc}
  alt={product.imageAlt}
  loading="lazy"
  width={320}
  height={320}
  srcSet={`
    ${product.small} 320w,
    ${product.medium} 640w,
    ${product.large} 1280w
  `}
  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 320px"
/>
```

### 16.2 Decorative Images

```tsx
<img src={decorative.src} alt="" loading="lazy" />
```

---

## 17. Animation Standards

### 17.1 Timing Functions

| Animation       | Duration | Easing      | Usage               |
| --------------- | -------- | ----------- | ------------------- |
| Fade in/out     | 200ms    | ease-in-out | Toast, banner       |
| Slide in        | 300ms    | ease-out    | Modal, drawer       |
| Expand/collapse | 250ms    | ease        | Accordion, dropdown |
| Button press    | 100ms    | ease        | Click feedback      |
| Hover           | 150ms    | ease        | Interactive states  |

### 17.2 Skeleton Shimmer

```css
@keyframes shimmer {
  0%,
  100% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
}

.skeleton {
  animation: shimmer 1.5s ease-in-out infinite;
}
```

---

## 18. Micro-interactions

### 18.1 Button States

```tsx
<Button variant="primary" onClick={handleClick} loading={isLoading}>
  {isLoading ? "Saving..." : "Save"}
</Button>
```

### 18.2 Toggle States

```tsx
<Switch label="Enable notifications" checked={enabled} onChange={setEnabled} />;

{
  /* Immediate feedback */
}
{
  enabled && (
    <Text variant="bodySm" tone="success">
      ✓ Notifications enabled
    </Text>
  );
}
```

---

## 19. Success State Patterns

### 19.1 Success Banner

```tsx
<Banner tone="success">
  <Stack gap="small">
    <Text fontWeight="semibold">Changes saved successfully</Text>
    <Text variant="bodySm">Your settings have been updated.</Text>
  </Stack>
</Banner>
```

### 19.2 Success Toast

```tsx
toast.success("Product created successfully");
```

### 19.3 Inline Success

```tsx
<InlineStack gap="small-200">
  <Icon type="check-circle-filled" tone="success" />
  <Text tone="success">Saved</Text>
</InlineStack>
```

---

## 20. Confirmation Dialogs

### 20.1 Delete Confirmation

```tsx
<Modal heading="Delete product?" size="small" onClose={handleClose}>
  <Stack gap="base">
    <Text>
      Are you sure you want to delete "{productName}"? This action cannot be
      undone.
    </Text>

    <ButtonGroup slot="primary-action">
      <Button onClick={handleClose}>Cancel</Button>
      <Button variant="primary" tone="critical" onClick={confirmDelete}>
        Delete Product
      </Button>
    </ButtonGroup>
  </Stack>
</Modal>
```

### 20.2 Discard Changes

```tsx
<Modal heading="Discard changes?" size="small" onClose={handleClose}>
  <Stack gap="base">
    <Text>You have unsaved changes. Do you want to discard them?</Text>

    <ButtonGroup slot="primary-action">
      <Button onClick={handleClose}>Keep Editing</Button>
      <Button variant="primary" tone="critical" onClick={confirmDiscard}>
        Discard Changes
      </Button>
    </ButtonGroup>
  </Stack>
</Modal>
```

**Microcopy:**

- Delete heading: "Delete {item}?"
- Delete body: "Are you sure? This cannot be undone."
- Discard heading: "Discard changes?"
- Discard body: "You have unsaved changes."
- Primary action: Verb (Delete, Discard)
- Secondary action: "Cancel" or "Keep Editing"

---

## 21. Help & Tooltip Patterns

### 21.1 Inline Help

```tsx
<Stack gap="small-200">
  <InlineStack gap="small-200">
    <Text>Reorder Point</Text>
    <Tooltip content="Inventory level that triggers reorder">
      <Icon type="info-filled" size="small" tone="subdued" />
    </Tooltip>
  </InlineStack>
  <NumberField value={rop} onChange={setRop} />
</Stack>
```

### 21.2 Help Text

```tsx
<TextField
  label="Email Address"
  value={email}
  onChange={setEmail}
  details="We'll never share your email with third parties."
/>
```

### 21.3 Banner Help

```tsx
<Banner tone="info">
  <Stack gap="small">
    <Text fontWeight="semibold">How does ROP work?</Text>
    <Text variant="bodySm">
      ROP = (Average daily sales × Lead time) + Safety stock
    </Text>
  </Stack>
</Banner>
```

---

## 22. Loading Indicators

### 22.1 Full Page

```tsx
<Box padding="large">
  <Stack gap="base" align="center">
    <Spinner size="large" />
    <Text variant="headingMd">Loading...</Text>
  </Stack>
</Box>
```

### 22.2 Inline

```tsx
<InlineStack gap="small" blockAlign="center">
  <Spinner size="small" />
  <Text variant="bodySm">Loading data...</Text>
</InlineStack>
```

### 22.3 Button Loading

```tsx
<Button variant="primary" loading={isSaving}>
  {isSaving ? "Saving..." : "Save"}
</Button>
```

---

## 23. Empty State Library

### 23.1 No Results

```tsx
<Box padding="large">
  <Stack gap="base" align="center">
    <Icon type="search" size="large" tone="subdued" />
    <Text variant="headingMd">No results found</Text>
    <Text tone="subdued">Try adjusting your search or filters</Text>
    <Button onClick={clearFilters}>Clear Filters</Button>
  </Stack>
</Box>
```

### 23.2 No Data Yet

```tsx
<Box padding="large">
  <Stack gap="base" align="center">
    <Icon type="empty" size="large" tone="subdued" />
    <Text variant="headingMd">No {dataType} yet</Text>
    <Text tone="subdued">{callToAction}</Text>
    <Button variant="primary" onClick={createFirst}>
      Create {itemType}
    </Button>
  </Stack>
</Box>
```

### 23.3 All Clear

```tsx
<Box padding="base">
  <Stack gap="small" align="center">
    <Icon type="check-circle-filled" tone="success" size="large" />
    <Text variant="headingMd">All clear!</Text>
    <Text tone="subdued">{successMessage}</Text>
  </Stack>
</Box>
```

---

## 24. Toast Notifications

### 24.1 Success Toast

```tsx
toast.success("Changes saved successfully");
```

### 24.2 Error Toast

```tsx
toast.error("Unable to save changes. Try again.");
```

### 24.3 Info Toast

```tsx
toast.info("Background sync in progress");
```

### 24.4 Custom Toast

```tsx
toast.custom(
  <InlineStack gap="small">
    <Icon type="info-filled" />
    <Text>{message}</Text>
  </InlineStack>,
  { duration: 5000 },
);
```

**Duration Guidelines:**

- Success: 3000ms (3 seconds)
- Error: 5000ms (5 seconds)
- Info: 4000ms (4 seconds)
- Custom: Based on message length

---

## 25. Performance Budget

### 25.1 Asset Limits

| Asset Type          | Max Size      | Notes                   |
| ------------------- | ------------- | ----------------------- |
| Product image       | 500KB         | Use WebP format         |
| Icon                | 5KB           | SVG preferred           |
| Font                | 200KB         | Subset to needed glyphs |
| JS bundle (initial) | 200KB gzipped | Code split              |
| CSS bundle          | 50KB gzipped  | Critical CSS inline     |

### 25.2 Rendering Performance

**Targets:**

- First Contentful Paint: <1.5s
- Largest Contentful Paint: <2.5s
- Time to Interactive: <3.5s
- Cumulative Layout Shift: <0.1

---

## 26. Accessibility Patterns Summary

### 26.1 Critical Patterns

- All buttons have accessible names
- All form inputs have labels
- All images have alt text
- Keyboard navigation complete
- Focus visible always
- ARIA live regions for updates
- Color contrast ≥4.5:1

### 26.2 Testing Tools

- axe DevTools: 0 violations
- Lighthouse: ≥95 score
- Keyboard only: 100% functional
- Screen reader: NVDA/JAWS/VoiceOver

---

## Change Log

- **2025-10-19:** v1.0 - Comprehensive UI pattern library (covers tasks 16-40 consolidated)
