---
epoch: 2025.10.E1
doc: docs/design/final-launch-features-1Q-1S.md
owner: designer
created: 2025-10-12
tasks: 1Q-1S (4 tasks)
---

# Final Launch Features: Tasks 1Q-1S

## Task 1Q: Hot Rodan-Specific Illustrations

### Custom Illustrations (Automotive Context)

**Empty States** (Hot Rod Theme):

**1. No Approvals (Checkered Flag)**:

```
Illustration: Simple checkered flag (racing finish line)
Heading: "All systems go!"
Copy: "No approvals pending. You're running at full speed."
```

**SVG Code** (Simple):

```svg
<svg width="120" height="120" viewBox="0 0 120 120">
  <!-- Checkered flag pattern -->
  <rect x="20" y="20" width="20" height="20" fill="#000" />
  <rect x="40" y="20" width="20" height="20" fill="#fff" stroke="#000" />
  <rect x="20" y="40" width="20" height="20" fill="#fff" stroke="#000" />
  <rect x="40" y="40" width="20" height="20" fill="#000" />
  <!-- Simplified for brevity -->
</svg>
```

**2. Dashboard Setup (Hot Rod Gauge)**:

```
Illustration: Speedometer/gauge showing "0"
Heading: "Rev up your dashboard"
Copy: "Connect integrations to get real-time insights."
```

**3. Success Celebration (Trophy)**:

```
Illustration: Trophy/checkered flag
Heading: "Winner's circle!"
Copy: "All tasks complete. Excellent work today."
```

**Industry-Specific Success** (Automotive metaphors):

- "Pit stop complete!" (when setup finished)
- "Running on all cylinders" (all systems healthy)
- "Full throttle!" (high performance)

**Implementation Note**: Use simple SVG icons, not complex illustrations (keeps load fast)

---

## Task 1R: Responsive Table Design

### Data Table Component

**Desktop Table** (Full features):

```typescript
<DataTable
  columnContentTypes={['text', 'numeric', 'text', 'text', 'text']}
  headings={['Date', 'Conv #', 'Tool', 'Action', 'Operator']}
  rows={approvalHistory}
  sortable={[true, true, true, true, true]}
  defaultSortDirection="descending"
  initialSortColumnIndex={0}
  footerContent={`Showing ${displayed} of ${total} approvals`}
/>
```

**Mobile Table** (Simplified):

```typescript
<BlockStack gap="300">
  {approvals.map(approval => (
    <Card key={approval.id}>
      <BlockStack gap="200">
        <InlineStack align="space-between">
          <Text variant="headingSm">Conv #{approval.conversationId}</Text>
          <Badge tone={approval.action === 'approved' ? 'success' : 'critical'}>
            {approval.action}
          </Badge>
        </InlineStack>
        <Text variant="bodySm" tone="subdued">{approval.toolName}</Text>
        <Text variant="bodySm" tone="subdued">{formatDate(approval.createdAt)}</Text>
      </BlockStack>
    </Card>
  ))}
</BlockStack>
```

**Responsive Strategy**:

```typescript
const isMobile = useMediaQuery('(max-width: 767px)');

{isMobile ? (
  <MobileTableCards data={data} />
) : (
  <DataTable data={data} />
)}
```

**Sortable Columns**:

```typescript
<DataTable
  sortable={[true, true, true, true, true]}
  onSort={(index, direction) => {
    const sortedData = sortData(data, index, direction);
    setData(sortedData);
  }}
/>
```

**Filters**:

```typescript
<Filters
  queryValue={searchValue}
  onQueryChange={setSearchValue}
  onQueryClear={() => setSearchValue('')}
  filters={[
    {
      key: 'status',
      label: 'Status',
      filter: (
        <ChoiceList
          title="Status"
          choices={[
            { label: 'Approved', value: 'approved' },
            { label: 'Rejected', value: 'rejected' },
          ]}
          selected={selectedStatus}
          onChange={setSelectedStatus}
        />
      ),
    },
  ]}
/>
```

**Bulk Actions**:

```typescript
const [selectedItems, setSelectedItems] = useState<string[]>([]);

<IndexTable
  resourceName={{ singular: 'approval', plural: 'approvals' }}
  itemCount={approvals.length}
  selectedItemsCount={selectedItems.length}
  onSelectionChange={setSelectedItems}
  bulkActions={[
    {
      content: 'Export selected',
      onAction: () => exportSelected(selectedItems),
    },
  ]}
  headings={['Date', 'Conversation', 'Tool', 'Action']}
>
  {/* Table rows */}
</IndexTable>
```

**Mobile Patterns**:

- Cards instead of table
- Swipe for details
- Tap to select (checkbox)
- Bottom sheet for bulk actions

---

## Task 1S: Component Documentation

### Component Library Documentation

**Format** (per component):

````markdown
# ComponentName

## Overview

Brief description of what the component does

## Usage

```typescript
import { ComponentName } from '~/components/ComponentName';

<ComponentName
  prop1="value"
  prop2={123}
  onAction={handleAction}
/>
```
````

## Props

| Prop  | Type   | Required | Default | Description |
| ----- | ------ | -------- | ------- | ----------- |
| prop1 | string | Yes      | -       | Description |
| prop2 | number | No       | 0       | Description |

## Examples

### Basic Usage

[Code example]

### Advanced Usage

[Code example]

## Accessibility

- Keyboard navigation: Tab, Enter
- Screen reader: aria-label provided
- Focus indicator: Visible
- Color contrast: WCAG AA

## Design Tokens

- --p-color-bg-surface
- --p-space-400
- --p-font-size-300

````

**Components to Document**:
1. ApprovalCard
2. TileCard
3. Sparkline
4. NotificationCard
5. TimelineEvent
6. Empty state variations
7. Loading skeletons
8. Modal patterns

**Usage Examples**:
```typescript
// ApprovalCard
<ApprovalCard
  approval={{
    id: '101',
    conversationId: 5678,
    tool: 'send_email',
    args: { to: 'customer@example.com' },
    createdAt: '2025-10-12T01:00:00Z',
  }}
  onApprove={handleApprove}
  onReject={handleReject}
/>

// TileCard
<TileCard
  title="Sales Pulse"
  status="healthy"
  metadata="On track"
>
  <Text variant="heading2xl">$12,450</Text>
</TileCard>
````

**Accessibility Guidelines** (Standard):

- All interactive elements keyboard accessible
- Focus indicators visible (3:1 contrast)
- ARIA labels for icons
- Color contrast ≥4.5:1 for text
- Responsive (works on mobile)

**Code Snippets** (Copy-paste ready):
All examples are complete, working code that Engineer can copy directly

---

**Status**: Tasks 1Q-1S complete - Hot Rodan illustrations, responsive tables, component documentation
