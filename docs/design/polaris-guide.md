# Polaris Component Usage Guide

**File:** `docs/design/polaris-guide.md`  
**Owner:** Designer  
**Version:** 1.0  
**Date:** 2025-10-15  
**Status:** Complete

---

## 1. Purpose

Comprehensive guide for using Shopify Polaris components in the Hot Rod AN Control Center, ensuring consistency and best practices.

---

## 2. Core Layout Components

### 2.1 Page

**Purpose:** Top-level container for routes

**When to use:**
- Every route should have a Page component
- Provides consistent header, title, and actions

**Example:**
```tsx
import { Page } from '@shopify/polaris';

function Dashboard() {
  return (
    <Page
      title="Dashboard"
      subtitle="Monitor your store performance"
      primaryAction={{ content: 'Refresh', onAction: handleRefresh }}
      secondaryActions={[
        { content: 'Export', onAction: handleExport },
      ]}
    >
      {/* Page content */}
    </Page>
  );
}
```

**Props:**
- `title` - Page heading (required)
- `subtitle` - Optional description
- `primaryAction` - Main action button
- `secondaryActions` - Additional actions
- `breadcrumbs` - Navigation breadcrumbs

### 2.2 Layout

**Purpose:** Responsive grid layout

**When to use:**
- Multi-column layouts
- Sidebar + main content
- Responsive tile grids

**Example:**
```tsx
import { Layout } from '@shopify/polaris';

function Dashboard() {
  return (
    <Layout>
      <Layout.Section>
        {/* Main content */}
      </Layout.Section>
      <Layout.Section variant="oneThird">
        {/* Sidebar */}
      </Layout.Section>
    </Layout>
  );
}
```

**Variants:**
- `oneThird` - 1/3 width column
- `oneHalf` - 1/2 width column
- Default - Full width

### 2.3 Card

**Purpose:** Content container with elevation

**When to use:**
- Grouping related content
- Tile containers
- Form sections

**Example:**
```tsx
import { Card } from '@shopify/polaris';

function TileCard() {
  return (
    <Card>
      <BlockStack gap="400">
        <Text variant="headingMd" as="h2">Sales Pulse</Text>
        <Text variant="bodyMd">$1,250.50</Text>
      </BlockStack>
    </Card>
  );
}
```

**Props:**
- `title` - Card heading
- `sectioned` - Adds padding (deprecated, use BlockStack)
- `actions` - Card actions
- `subdued` - Subdued background

### 2.4 BlockStack

**Purpose:** Vertical layout with consistent spacing

**When to use:**
- Stacking elements vertically
- Form fields
- Card content

**Example:**
```tsx
import { BlockStack } from '@shopify/polaris';

<BlockStack gap="400">
  <Text>First item</Text>
  <Text>Second item</Text>
  <Text>Third item</Text>
</BlockStack>
```

**Gap values:**
- `"050"` - 2px
- `"100"` - 4px
- `"200"` - 8px
- `"300"` - 12px
- `"400"` - 16px
- `"500"` - 20px
- `"600"` - 24px

### 2.5 InlineStack

**Purpose:** Horizontal layout with consistent spacing

**When to use:**
- Buttons side-by-side
- Inline elements
- Header actions

**Example:**
```tsx
import { InlineStack } from '@shopify/polaris';

<InlineStack gap="200" align="space-between">
  <Text>Label</Text>
  <Badge>Status</Badge>
</InlineStack>
```

**Props:**
- `gap` - Spacing between items
- `align` - Alignment (start, center, end, space-between)
- `blockAlign` - Vertical alignment

---

## 3. Action Components

### 3.1 Button

**Purpose:** Trigger actions

**When to use:**
- Primary actions (save, submit, approve)
- Secondary actions (cancel, back)
- Tertiary actions (links, minor actions)

**Example:**
```tsx
import { Button } from '@shopify/polaris';

<Button variant="primary" onClick={handleSave}>
  Save
</Button>

<Button variant="secondary" onClick={handleCancel}>
  Cancel
</Button>

<Button variant="plain" onClick={handleEdit}>
  Edit
</Button>
```

**Variants:**
- `primary` - Main action (blue)
- `secondary` - Secondary action (outlined)
- `tertiary` - Tertiary action (text only)
- `plain` - Plain text button

**Tones:**
- `critical` - Destructive actions (red)
- `success` - Positive actions (green)

**Props:**
- `loading` - Show spinner
- `disabled` - Disable button
- `fullWidth` - Full width button
- `size` - `slim`, `medium`, `large`

### 3.2 ButtonGroup

**Purpose:** Group related buttons

**When to use:**
- Multiple actions together
- Approve/Reject pairs
- Form actions

**Example:**
```tsx
import { ButtonGroup } from '@shopify/polaris';

<ButtonGroup>
  <Button onClick={handleApprove}>Approve</Button>
  <Button onClick={handleReject}>Reject</Button>
</ButtonGroup>
```

**Props:**
- `gap` - Spacing between buttons
- `variant` - `segmented` for connected buttons

---

## 4. Feedback Components

### 4.1 Badge

**Purpose:** Status indicators

**When to use:**
- Tile status (Healthy, Attention needed)
- Item counts
- Labels

**Example:**
```tsx
import { Badge } from '@shopify/polaris';

<Badge tone="success">Healthy</Badge>
<Badge tone="critical">Attention needed</Badge>
<Badge tone="info">Configuration required</Badge>
```

**Tones:**
- `success` - Green (healthy, complete)
- `critical` - Red (error, urgent)
- `warning` - Yellow (caution)
- `info` - Blue (informational)
- `attention` - Orange (needs attention)
- `new` - Teal (new items)

### 4.2 Banner

**Purpose:** Important messages

**When to use:**
- Error messages
- Success confirmations
- Warnings
- Informational notices

**Example:**
```tsx
import { Banner } from '@shopify/polaris';

<Banner tone="critical" onDismiss={handleDismiss}>
  <p>Unable to save changes. Please try again.</p>
</Banner>

<Banner tone="success">
  <p>Changes saved successfully.</p>
</Banner>
```

**Tones:**
- `critical` - Errors
- `warning` - Warnings
- `success` - Success messages
- `info` - Informational

### 4.3 Toast

**Purpose:** Temporary notifications

**When to use:**
- Action confirmations
- Background process updates
- Non-critical notifications

**Example:**
```tsx
import { Toast, Frame } from '@shopify/polaris';

function App() {
  const [toastActive, setToastActive] = useState(false);
  
  const toggleToast = () => setToastActive(!toastActive);
  
  const toastMarkup = toastActive ? (
    <Toast content="Changes saved" onDismiss={toggleToast} />
  ) : null;
  
  return (
    <Frame>
      {toastMarkup}
      {/* App content */}
    </Frame>
  );
}
```

### 4.4 Spinner

**Purpose:** Loading indicator

**When to use:**
- Page loading
- Component loading
- Button loading (use Button `loading` prop)

**Example:**
```tsx
import { Spinner } from '@shopify/polaris';

<Spinner size="small" />
<Spinner size="large" />
```

**Sizes:**
- `small` - 20px
- `large` - 44px

### 4.5 SkeletonPage

**Purpose:** Page loading skeleton

**When to use:**
- Initial page load
- Route transitions

**Example:**
```tsx
import { SkeletonPage, SkeletonBodyText } from '@shopify/polaris';

<SkeletonPage title="Dashboard">
  <SkeletonBodyText lines={3} />
</SkeletonPage>
```

---

## 5. Overlay Components

### 5.1 Modal

**Purpose:** Focused task or information

**When to use:**
- Confirmations
- Forms
- Detailed views

**Example:**
```tsx
import { Modal } from '@shopify/polaris';

<Modal
  open={isOpen}
  onClose={handleClose}
  title="Confirm Action"
  primaryAction={{
    content: 'Confirm',
    onAction: handleConfirm,
  }}
  secondaryActions={[
    {
      content: 'Cancel',
      onAction: handleClose,
    },
  ]}
>
  <Modal.Section>
    <p>Are you sure you want to proceed?</p>
  </Modal.Section>
</Modal>
```

**Sizes:**
- `small` - 380px
- `medium` - 560px (default)
- `large` - 800px
- `full` - Full screen

### 5.2 Popover

**Purpose:** Contextual information or actions

**When to use:**
- Dropdown menus
- Tooltips
- Contextual help

**Example:**
```tsx
import { Popover, ActionList } from '@shopify/polaris';

<Popover
  active={isOpen}
  activator={<Button onClick={togglePopover}>More actions</Button>}
  onClose={togglePopover}
>
  <ActionList
    items={[
      { content: 'Edit', onAction: handleEdit },
      { content: 'Delete', onAction: handleDelete },
    ]}
  />
</Popover>
```

---

## 6. Form Components

### 6.1 TextField

**Purpose:** Text input

**When to use:**
- Single-line text input
- Email, URL, number inputs

**Example:**
```tsx
import { TextField } from '@shopify/polaris';

<TextField
  label="Email"
  type="email"
  value={email}
  onChange={setEmail}
  error={emailError}
  helpText="We'll never share your email"
/>
```

**Types:**
- `text` - Default
- `email` - Email input
- `number` - Number input
- `password` - Password input
- `search` - Search input
- `tel` - Phone input
- `url` - URL input

### 6.2 Select

**Purpose:** Dropdown selection

**When to use:**
- Choosing from predefined options
- Filters

**Example:**
```tsx
import { Select } from '@shopify/polaris';

<Select
  label="Status"
  options={[
    { label: 'All', value: 'all' },
    { label: 'Pending', value: 'pending' },
    { label: 'Approved', value: 'approved' },
  ]}
  value={status}
  onChange={setStatus}
/>
```

### 6.3 Checkbox

**Purpose:** Boolean selection

**When to use:**
- Toggle options
- Multi-select

**Example:**
```tsx
import { Checkbox } from '@shopify/polaris';

<Checkbox
  label="Send email notification"
  checked={sendEmail}
  onChange={setSendEmail}
/>
```

---

## 7. Data Display Components

### 7.1 Text

**Purpose:** Typography

**When to use:**
- All text content
- Headings, body text, labels

**Example:**
```tsx
import { Text } from '@shopify/polaris';

<Text variant="headingLg" as="h1">Dashboard</Text>
<Text variant="headingMd" as="h2">Sales Pulse</Text>
<Text variant="bodyMd">$1,250.50</Text>
<Text variant="bodySm" tone="subdued">Last updated 2 min ago</Text>
```

**Variants:**
- `headingXl`, `headingLg`, `headingMd`, `headingSm`, `headingXs`
- `bodyLg`, `bodyMd`, `bodySm`

**Tones:**
- `subdued` - Secondary text
- `success` - Green text
- `critical` - Red text
- `warning` - Yellow text

### 7.2 DataTable

**Purpose:** Tabular data

**When to use:**
- Lists of data
- Comparison tables

**Example:**
```tsx
import { DataTable } from '@shopify/polaris';

<DataTable
  columnContentTypes={['text', 'numeric', 'numeric']}
  headings={['Product', 'Quantity', 'Revenue']}
  rows={[
    ['Widget', 4, '$400'],
    ['Gadget', 3, '$300'],
  ]}
/>
```

### 7.3 ResourceList

**Purpose:** List of items with actions

**When to use:**
- Approval cards
- Item lists with actions

**Example:**
```tsx
import { ResourceList, ResourceItem } from '@shopify/polaris';

<ResourceList
  items={approvals}
  renderItem={(item) => (
    <ResourceItem id={item.id}>
      <h3>{item.title}</h3>
      <p>{item.description}</p>
    </ResourceItem>
  )}
/>
```

---

## 8. Navigation Components

### 8.1 Tabs

**Purpose:** Section navigation

**When to use:**
- Multiple views of same content
- Dashboard sections

**Example:**
```tsx
import { Tabs } from '@shopify/polaris';

<Tabs
  tabs={[
    { id: 'overview', content: 'Overview' },
    { id: 'details', content: 'Details' },
  ]}
  selected={selectedTab}
  onSelect={setSelectedTab}
/>
```

### 8.2 Pagination

**Purpose:** Navigate pages

**When to use:**
- Large datasets
- Multi-page lists

**Example:**
```tsx
import { Pagination } from '@shopify/polaris';

<Pagination
  hasPrevious
  hasNext
  onPrevious={handlePrevious}
  onNext={handleNext}
/>
```

---

## 9. Best Practices

### 9.1 Component Selection

**Use Polaris components when:**
- ✅ Component exists in Polaris
- ✅ Matches use case
- ✅ Provides accessibility out of the box

**Use custom components when:**
- ⚠️ Polaris component doesn't exist
- ⚠️ Polaris component doesn't fit use case
- ⚠️ Custom styling required (use Polaris tokens)

### 9.2 Accessibility

**Always:**
- ✅ Use semantic Polaris components
- ✅ Provide labels for form fields
- ✅ Use appropriate button variants
- ✅ Test with keyboard navigation
- ✅ Test with screen readers

**Never:**
- ❌ Override Polaris accessibility features
- ❌ Remove focus indicators
- ❌ Use divs instead of buttons

### 9.3 Performance

**Do:**
- ✅ Lazy load modals and popovers
- ✅ Use SkeletonPage for loading states
- ✅ Memoize expensive components

**Don't:**
- ❌ Render large lists without virtualization
- ❌ Use too many nested Polaris components
- ❌ Override Polaris styles excessively

---

## 10. Migration from Custom CSS

### 10.1 TileCard Migration

**Before (Custom CSS):**
```tsx
<div className="occ-tile">
  <h2>{title}</h2>
  <span className="occ-status-healthy">Healthy</span>
  {content}
</div>
```

**After (Polaris):**
```tsx
<Card>
  <BlockStack gap="400">
    <InlineStack align="space-between">
      <Text variant="headingMd" as="h2">{title}</Text>
      <Badge tone="success">Healthy</Badge>
    </InlineStack>
    {content}
  </BlockStack>
</Card>
```

### 10.2 Button Migration

**Before:**
```tsx
<button className="occ-button occ-button-primary">
  Save
</button>
```

**After:**
```tsx
<Button variant="primary">Save</Button>
```

---

## 11. References

- Polaris Documentation: https://polaris.shopify.com/
- Polaris Components: https://polaris.shopify.com/components
- Polaris Patterns: https://polaris.shopify.com/patterns
- Polaris Tokens: https://polaris.shopify.com/tokens
- Design tokens: `app/styles/tokens.css`

