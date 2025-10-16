# Component Specifications: Badge, Pagination, Filter Bar

**File:** `docs/design/component-specs-badge-pagination-filter.md`  
**Owner:** Designer  
**Version:** 1.0  
**Date:** 2025-10-15  
**Status:** Complete  
**Purpose:** Detailed specs for Badge/Tag/Chip, Pagination, and Filter Bar components

---

## 1. Badge Component

### 1.1 Purpose
Display status, counts, or labels in a compact format.

### 1.2 Polaris Badge Tones

| Tone | Color | Use Case |
|------|-------|----------|
| `success` | Green | Healthy, complete, positive |
| `critical` | Red | Error, urgent, failure |
| `warning` | Yellow | Caution, approaching limit |
| `attention` | Orange | Needs review, action required |
| `info` | Blue | Informational, setup required |
| `new` | Teal | New items, recent updates |

### 1.3 Usage

**Status Badge:**
```tsx
<Badge tone="success">Healthy</Badge>
<Badge tone="critical">Error</Badge>
<Badge tone="warning">Attention needed</Badge>
```

**Count Badge:**
```tsx
<Badge>{approvalCount}</Badge>
<Badge tone="attention">{pendingCount} pending</Badge>
```

**Label Badge:**
```tsx
<Badge>CX Reply</Badge>
<Badge tone="info">Configuration required</Badge>
```

### 1.4 Accessibility

**Always include text:**
```tsx
<Badge tone="success">Healthy</Badge>
```

**Screen reader announcement:**
```tsx
<Badge tone="critical">
  <span className="sr-only">Status: </span>
  Error
</Badge>
```

### 1.5 Sizing

**Small (default):**
```tsx
<Badge>Label</Badge>
```

**With icon:**
```tsx
<Badge>
  <InlineStack gap="100">
    <Icon source={CheckCircleIcon} />
    <span>Healthy</span>
  </InlineStack>
</Badge>
```

---

## 2. Tag Component (Future)

### 2.1 Purpose
Removable labels for filtering or categorization.

### 2.2 Polaris Tag

**Basic Tag:**
```tsx
<Tag onRemove={handleRemove}>Customer</Tag>
```

**Multiple Tags:**
```tsx
<InlineStack gap="200">
  <Tag onRemove={() => removeFilter('status')}>Status: Pending</Tag>
  <Tag onRemove={() => removeFilter('type')}>Type: CX Reply</Tag>
</InlineStack>
```

### 2.3 Usage

**Filter Tags:**
```tsx
{activeFilters.map(filter => (
  <Tag key={filter.key} onRemove={() => removeFilter(filter.key)}>
    {filter.label}
  </Tag>
))}
```

**Category Tags:**
```tsx
<InlineStack gap="200">
  <Tag>High Priority</Tag>
  <Tag>Customer Facing</Tag>
</InlineStack>
```

### 2.4 Accessibility

**Remove button label:**
```tsx
<Tag onRemove={handleRemove}>
  <span>Customer</span>
  <button aria-label="Remove Customer filter">×</button>
</Tag>
```

---

## 3. Chip Component (Future)

### 3.1 Purpose
Selectable options in a compact format (alternative to checkboxes).

### 3.2 Implementation

**Choice List as Chips:**
```tsx
<ChoiceList
  title="Filter by status"
  choices={[
    { label: 'Pending', value: 'pending' },
    { label: 'Approved', value: 'approved' },
    { label: 'Rejected', value: 'rejected' },
  ]}
  selected={selectedStatuses}
  onChange={setSelectedStatuses}
  allowMultiple
/>
```

**Custom Chip:**
```tsx
<button
  className={`chip ${selected ? 'chip-selected' : ''}`}
  onClick={handleToggle}
  aria-pressed={selected}
>
  {label}
</button>
```

### 3.3 States

**Default:**
```css
.chip {
  background: var(--occ-bg-secondary);
  border: 1px solid var(--occ-border-default);
  padding: 8px 12px;
  border-radius: 16px;
}
```

**Selected:**
```css
.chip-selected {
  background: var(--occ-button-primary-bg);
  color: var(--occ-button-primary-text);
  border-color: var(--occ-button-primary-bg);
}
```

**Hover:**
```css
.chip:hover {
  border-color: var(--occ-border-interactive);
}
```

---

## 4. Pagination Component

### 4.1 Purpose
Navigate through pages of data.

### 4.2 Polaris Pagination

**Basic Pagination:**
```tsx
<Pagination
  hasPrevious={page > 0}
  hasNext={hasMoreData}
  onPrevious={() => setPage(page - 1)}
  onNext={() => setPage(page + 1)}
/>
```

**With Label:**
```tsx
<Pagination
  label={`Page ${page + 1} of ${totalPages}`}
  hasPrevious={page > 0}
  hasNext={page < totalPages - 1}
  onPrevious={() => setPage(page - 1)}
  onNext={() => setPage(page + 1)}
/>
```

### 4.3 Usage Patterns

**Approvals List:**
```tsx
function ApprovalsList() {
  const [page, setPage] = useState(0);
  const pageSize = 20;
  
  const { data: approvals } = useLoaderData();
  
  return (
    <>
      <ResourceList items={approvals} />
      <Pagination
        hasPrevious={page > 0}
        hasNext={approvals.length === pageSize}
        onPrevious={() => setPage(page - 1)}
        onNext={() => setPage(page + 1)}
      />
    </>
  );
}
```

**Tile List:**
```tsx
function TileList({ items, pageSize = 10 }) {
  const [page, setPage] = useState(0);
  const start = page * pageSize;
  const end = start + pageSize;
  const pageItems = items.slice(start, end);
  
  return (
    <>
      <BlockStack gap="200">
        {pageItems.map(item => <TileItem key={item.id} item={item} />)}
      </BlockStack>
      <Pagination
        hasPrevious={page > 0}
        hasNext={end < items.length}
        onPrevious={() => setPage(page - 1)}
        onNext={() => setPage(page + 1)}
      />
    </>
  );
}
```

### 4.4 Accessibility

**Keyboard Navigation:**
- `Tab` to focus pagination
- `Enter` or `Space` to activate previous/next
- `Arrow Left` for previous (optional)
- `Arrow Right` for next (optional)

**Screen Reader:**
```tsx
<nav aria-label="Pagination">
  <Pagination
    hasPrevious={hasPrevious}
    hasNext={hasNext}
    onPrevious={handlePrevious}
    onNext={handleNext}
  />
</nav>
```

**Announcements:**
```tsx
<div aria-live="polite" aria-atomic="true" className="sr-only">
  Page {page + 1} of {totalPages}
</div>
```

### 4.5 Responsive

**Mobile:**
- Compact pagination (no label)
- Larger touch targets (44x44px)

**Desktop:**
- Full pagination with label
- Standard click targets (36x36px)

---

## 5. Filter Bar Component

### 5.1 Purpose
Filter and search data with multiple criteria.

### 5.2 Polaris Filters

**Basic Filters:**
```tsx
<Filters
  queryValue={searchQuery}
  queryPlaceholder="Search approvals"
  onQueryChange={setSearchQuery}
  onQueryClear={() => setSearchQuery('')}
  filters={[
    {
      key: 'status',
      label: 'Status',
      filter: (
        <ChoiceList
          title="Status"
          choices={[
            { label: 'Pending', value: 'pending' },
            { label: 'Approved', value: 'approved' },
            { label: 'Rejected', value: 'rejected' },
          ]}
          selected={statusFilter}
          onChange={setStatusFilter}
          allowMultiple
        />
      ),
    },
    {
      key: 'type',
      label: 'Type',
      filter: (
        <ChoiceList
          title="Type"
          choices={[
            { label: 'CX Reply', value: 'cx_reply' },
            { label: 'Inventory', value: 'inventory' },
            { label: 'Growth', value: 'growth' },
          ]}
          selected={typeFilter}
          onChange={setTypeFilter}
          allowMultiple
        />
      ),
    },
  ]}
  appliedFilters={appliedFilters}
  onClearAll={handleClearAll}
/>
```

### 5.3 Applied Filters Display

**Filter Tags:**
```tsx
{appliedFilters.length > 0 && (
  <InlineStack gap="200">
    {appliedFilters.map(filter => (
      <Tag key={filter.key} onRemove={() => removeFilter(filter.key)}>
        {filter.label}
      </Tag>
    ))}
    <Button variant="plain" onClick={handleClearAll}>
      Clear all
    </Button>
  </InlineStack>
)}
```

### 5.4 Usage Patterns

**Approvals Filter Bar:**
```tsx
function ApprovalsFilterBar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState([]);
  const [typeFilter, setTypeFilter] = useState([]);
  
  const appliedFilters = [
    ...statusFilter.map(status => ({
      key: `status-${status}`,
      label: `Status: ${status}`,
      onRemove: () => setStatusFilter(statusFilter.filter(s => s !== status)),
    })),
    ...typeFilter.map(type => ({
      key: `type-${type}`,
      label: `Type: ${type}`,
      onRemove: () => setTypeFilter(typeFilter.filter(t => t !== type)),
    })),
  ];
  
  return (
    <Filters
      queryValue={searchQuery}
      queryPlaceholder="Search approvals"
      onQueryChange={setSearchQuery}
      onQueryClear={() => setSearchQuery('')}
      filters={[
        {
          key: 'status',
          label: 'Status',
          filter: (
            <ChoiceList
              title="Status"
              choices={[
                { label: 'Pending', value: 'pending' },
                { label: 'Approved', value: 'approved' },
              ]}
              selected={statusFilter}
              onChange={setStatusFilter}
              allowMultiple
            />
          ),
        },
        {
          key: 'type',
          label: 'Type',
          filter: (
            <ChoiceList
              title="Type"
              choices={[
                { label: 'CX Reply', value: 'cx_reply' },
                { label: 'Inventory', value: 'inventory' },
              ]}
              selected={typeFilter}
              onChange={setTypeFilter}
              allowMultiple
            />
          ),
        },
      ]}
      appliedFilters={appliedFilters}
      onClearAll={() => {
        setStatusFilter([]);
        setTypeFilter([]);
      }}
    />
  );
}
```

### 5.5 Accessibility

**Search Input:**
```tsx
<input
  type="search"
  placeholder="Search approvals"
  aria-label="Search approvals"
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
/>
```

**Filter Buttons:**
```tsx
<button
  aria-label="Filter by status"
  aria-expanded={statusFilterOpen}
  onClick={toggleStatusFilter}
>
  Status
</button>
```

**Applied Filters:**
```tsx
<div role="region" aria-label="Applied filters">
  {appliedFilters.map(filter => (
    <Tag key={filter.key} onRemove={filter.onRemove}>
      {filter.label}
    </Tag>
  ))}
</div>
```

### 5.6 Responsive

**Mobile:**
- Stacked layout
- Full width search
- Filter buttons below search
- Applied filters below buttons

**Desktop:**
- Horizontal layout
- Search on left
- Filter buttons on right
- Applied filters below

---

## 6. Implementation Checklist

### 6.1 Badge
- [ ] All tones implemented (success, critical, warning, attention, info, new)
- [ ] Text always included (not icon-only)
- [ ] Screen reader support
- [ ] Color contrast meets WCAG AA

### 6.2 Tag
- [ ] Remove button functional
- [ ] Remove button has aria-label
- [ ] Keyboard accessible
- [ ] Focus indicator visible

### 6.3 Chip
- [ ] Selected state clear
- [ ] aria-pressed attribute
- [ ] Keyboard accessible
- [ ] Focus indicator visible

### 6.4 Pagination
- [ ] Previous/Next buttons functional
- [ ] Disabled states when no more pages
- [ ] Keyboard navigation works
- [ ] Screen reader announces page changes
- [ ] Responsive (compact on mobile)

### 6.5 Filter Bar
- [ ] Search input functional
- [ ] Filter dropdowns functional
- [ ] Applied filters display
- [ ] Clear all button works
- [ ] Keyboard accessible
- [ ] Screen reader support
- [ ] Responsive layout

---

## 7. Testing Checklist

### 7.1 Visual
- [ ] All components render correctly
- [ ] States visible (hover, focus, active, disabled)
- [ ] Colors match design tokens
- [ ] Spacing consistent

### 7.2 Functional
- [ ] Badge displays correct tone
- [ ] Tag remove button works
- [ ] Chip selection toggles
- [ ] Pagination navigates pages
- [ ] Filter bar filters data
- [ ] Clear all removes all filters

### 7.3 Accessibility
- [ ] Keyboard navigation works
- [ ] Screen reader announces changes
- [ ] Focus indicators visible
- [ ] Color contrast meets WCAG AA
- [ ] Touch targets adequate (mobile)

### 7.4 Responsive
- [ ] Components adapt to mobile
- [ ] Components adapt to tablet
- [ ] Components adapt to desktop
- [ ] Touch targets adequate
- [ ] No horizontal scroll

---

## 8. References

- **Polaris Badge:** https://polaris.shopify.com/components/feedback-indicators/badge
- **Polaris Tag:** https://polaris.shopify.com/components/selection-and-input/tag
- **Polaris Pagination:** https://polaris.shopify.com/components/navigation/pagination
- **Polaris Filters:** https://polaris.shopify.com/components/selection-and-input/filters
- **Design Tokens:** `docs/design/design-tokens.md`
- **Accessibility:** `docs/design/accessibility.md`

