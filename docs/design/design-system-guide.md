---
epoch: 2025.10.E1
doc: docs/design/design-system-guide.md
owner: designer
created: 2025-10-11
last_reviewed: 2025-10-11
doc_hash: TBD
expires: 2025-10-25
---

# HotDash Design System - Component Library Guide

**Version**: 1.0  
**Framework**: React Router 7 + Shopify Polaris  
**Last Updated**: 2025-10-11  
**Owner**: Designer Agent

---

## Table of Contents

1. [Design System Overview](#design-system-overview)
2. [Polaris Components Used](#polaris-components-used)
3. [Custom OCC Components](#custom-occ-components)
4. [Design Tokens](#design-tokens)
5. [Component Usage Guidelines](#component-usage-guidelines)
6. [Do's and Don'ts](#dos-and-donts)
7. [Accessibility Standards](#accessibility-standards)
8. [Responsive Patterns](#responsive-patterns)

---

## 1. Design System Overview

### Philosophy

HotDash follows the **Shopify Polaris Design System** to ensure consistency with the Shopify Admin experience. Our custom components (prefixed with `occ-` for "Operator Control Center") extend Polaris patterns while maintaining full compatibility.

### Design Principles

1. **Operator-First**: Prioritize clarity and actionable information
2. **Polaris-Native**: Use Polaris components whenever possible
3. **Accessible**: WCAG 2.2 AA compliance mandatory
4. **Responsive**: Support desktop (1280px+), tablet (768px), mobile
5. **Consistent**: Maintain visual and functional consistency across all views

### Technology Stack

- **UI Framework**: Shopify Polaris (via `@shopify/polaris`)
- **Icons**: Shopify Polaris Icons (via `@shopify/polaris-icons`)
- **Router**: React Router 7
- **TypeScript**: Strict mode enabled
- **Styling**: Polaris tokens + minimal custom CSS

---

## 2. Polaris Components Used

### Layout Components

#### `<Page>`
**Purpose**: Top-level page container  
**Usage**: Every route should use `<Page>` or Shopify App Bridge `<s-page>`

```typescript
import { Page } from '@shopify/polaris';

<Page
  title="Approval Queue"
  subtitle="3 pending approvals"
  primaryAction={{ content: 'Refresh', onAction: handleRefresh }}
  secondaryActions={[
    { content: 'Settings', url: '/app/settings' }
  ]}
>
  {/* Page content */}
</Page>

// OR with App Bridge (current pattern):
<s-page heading="Operator Control Center">
  {/* Content */}
</s-page>
```

**When to Use**:
- ✅ Every top-level route
- ✅ When you need page-level actions
- ❌ Inside modals or nested components

---

#### `<Layout>` & `<Layout.Section>`
**Purpose**: Create page layouts with consistent spacing

```typescript
import { Layout } from '@shopify/polaris';

<Page title="Dashboard">
  <Layout>
    <Layout.Section>
      {/* Main content - full width */}
    </Layout.Section>
    
    <Layout.Section variant="oneThird">
      {/* Sidebar - 1/3 width */}
    </Layout.Section>
  </Layout>
</Page>
```

**When to Use**:
- ✅ Multi-column layouts
- ✅ Sidebar + main content
- ❌ Simple single-column content (use BlockStack instead)

---

#### `<Card>`
**Purpose**: Container for related content (tiles, lists, forms)

```typescript
import { Card } from '@shopify/polaris';

// Basic card
<Card>
  <Text>Card content</Text>
</Card>

// Card with sections
<Card>
  <Card.Section>
    <Text variant="headingMd" as="h2">Section Title</Text>
  </Card.Section>
  <Card.Section>
    <Text>Section content</Text>
  </Card.Section>
</Card>

// Card with subdued section
<Card>
  <Card.Section>
    <Text>Primary content</Text>
  </Card.Section>
  <Card.Section subdued>
    <Text>Secondary content</Text>
  </Card.Section>
</Card>
```

**When to Use**:
- ✅ Dashboard tiles
- ✅ Approval cards
- ✅ Form containers
- ✅ List containers
- ❌ Page-level layout (use Layout instead)

**Current Usage in HotDash**:
- Dashboard tiles (via custom `.occ-tile` class - consider migrating to `<Card>`)
- Approval queue cards
- Modal content sections

---

#### `<BlockStack>` & `<InlineStack>`
**Purpose**: Flexible vertical (BlockStack) and horizontal (InlineStack) layouts

```typescript
import { BlockStack, InlineStack } from '@shopify/polaris';

// Vertical stack with consistent spacing
<BlockStack gap="400">
  <Text>Item 1</Text>
  <Text>Item 2</Text>
  <Text>Item 3</Text>
</BlockStack>

// Horizontal stack with alignment
<InlineStack gap="200" align="space-between" blockAlign="center">
  <Text>Left content</Text>
  <Badge>Right badge</Badge>
</InlineStack>

// Nested stacks for complex layouts
<BlockStack gap="400">
  <InlineStack gap="200">
    <Icon source={CheckIcon} />
    <Text>Success message</Text>
  </InlineStack>
  <Divider />
  <Text>Additional content</Text>
</BlockStack>
```

**Gap Values** (Polaris spacing scale):
- `gap="100"` → 4px (tight)
- `gap="200"` → 8px (default)
- `gap="300"` → 12px (comfortable)
- `gap="400"` → 16px (spacious)
- `gap="500"` → 20px (very spacious)

**When to Use**:
- ✅ ANY vertical or horizontal layout
- ✅ Spacing between related elements
- ✅ Alignment control
- ❌ Don't use CSS flexbox/grid directly (use Polaris first)

---

#### `<Box>`
**Purpose**: Generic container with Polaris styling props

```typescript
import { Box } from '@shopify/polaris';

// Background color
<Box background="bg-surface-secondary" padding="400">
  <Text>Content</Text>
</Box>

// Border and shadow
<Box
  borderColor="border"
  borderWidth="025"
  borderRadius="200"
  shadow="100"
  padding="300"
>
  <Text>Bordered content</Text>
</Box>

// Positioning
<Box position="relative" inset="0">
  <Box position="absolute" insetBlockStart="0" insetInlineStart="0">
    <Text>Positioned content</Text>
  </Box>
</Box>
```

**Common Props**:
- `background` - Surface colors
- `padding` - Internal spacing
- `borderRadius` - Corner rounding
- `borderColor` - Border colors
- `shadow` - Elevation
- `position` - Layout positioning

**When to Use**:
- ✅ Custom backgrounds
- ✅ Borders and shadows
- ✅ Padding without flex/grid
- ❌ Simple text (use Text component)

---

### Typography Components

#### `<Text>`
**Purpose**: All text content with semantic variants

```typescript
import { Text } from '@shopify/polaris';

// Headings
<Text variant="headingXl" as="h1">Page Title</Text>
<Text variant="headingLg" as="h2">Section Title</Text>
<Text variant="headingMd" as="h3">Subsection Title</Text>
<Text variant="headingSm" as="h4">Minor Heading</Text>

// Body text
<Text variant="bodyLg">Large body text</Text>
<Text variant="bodyMd">Default body text</Text>
<Text variant="bodySm">Small body text</Text>

// Font weight
<Text fontWeight="regular">Normal weight</Text>
<Text fontWeight="medium">Medium weight</Text>
<Text fontWeight="semibold">Semi-bold weight</Text>
<Text fontWeight="bold">Bold weight</Text>

// Tone (color)
<Text tone="subdued">Secondary text</Text>
<Text tone="success">Success message</Text>
<Text tone="critical">Error message</Text>
<Text tone="warning">Warning message</Text>
<Text tone="info">Info message</Text>

// Alignment
<Text alignment="start">Left aligned</Text>
<Text alignment="center">Center aligned</Text>
<Text alignment="end">Right aligned</Text>

// Screen reader only
<Text visuallyHidden>Screen reader only content</Text>
```

**When to Use**:
- ✅ ALL text content
- ✅ Headings (with semantic `as` prop)
- ✅ Body text with tone/weight variants
- ❌ Don't use raw `<p>`, `<span>`, `<h1>` elements

**Current Usage**:
- Tile headings: `variant="headingMd"`
- Body text: `variant="bodyMd"`
- Meta info: `variant="bodySm" tone="subdued"`

---

### Action Components

#### `<Button>`
**Purpose**: Primary, secondary, and tertiary actions

```typescript
import { Button } from '@shopify/polaris';
import { PlusIcon } from '@shopify/polaris-icons';

// Primary action (filled)
<Button variant="primary" onClick={handleSave}>
  Save Changes
</Button>

// Secondary action (outlined)
<Button onClick={handleCancel}>
  Cancel
</Button>

// Plain/tertiary action (text only)
<Button variant="plain" onClick={handleDismiss}>
  Dismiss
</Button>

// Destructive action
<Button tone="critical" onClick={handleDelete}>
  Delete
</Button>

// With icon
<Button icon={PlusIcon}>
  Add Item
</Button>

// Loading state
<Button loading={isSubmitting} disabled={isSubmitting}>
  {isSubmitting ? 'Saving...' : 'Save'}
</Button>

// Sizes
<Button size="micro">Tiny</Button>
<Button size="slim">Small</Button>
<Button size="medium">Default</Button>
<Button size="large">Large</Button>

// Full width
<Button fullWidth>Block button</Button>
```

**Variants**:
- `primary` - Main action (blue filled)
- `secondary` - Secondary action (outlined) - DEFAULT
- `plain` - Tertiary action (text only)
- `monochromePlain` - Subtle text button

**Tones**:
- Default - Interactive blue
- `critical` - Red (destructive actions)
- `success` - Green (confirmations)

**When to Use**:
- ✅ All clickable actions
- ✅ Form submissions
- ✅ Navigation actions
- ❌ Don't use `<button>` or `<a>` directly

**Current Usage**:
- Modal actions: Primary for confirm, plain for cancel
- Tile actions: Plain variant for "View Details"
- Approval queue: Primary for approve, critical tone for reject

---

#### `<ButtonGroup>`
**Purpose**: Group related buttons with consistent spacing

```typescript
import { ButtonGroup } from '@shopify/polaris';

// Horizontal button group
<ButtonGroup>
  <Button variant="primary">Approve</Button>
  <Button tone="critical">Reject</Button>
  <Button variant="plain">Cancel</Button>
</ButtonGroup>

// Segmented (connected buttons)
<ButtonGroup variant="segmented">
  <Button>Day</Button>
  <Button>Week</Button>
  <Button>Month</Button>
</ButtonGroup>

// Full width on mobile
<ButtonGroup fullWidth>
  <Button>Option 1</Button>
  <Button>Option 2</Button>
</ButtonGroup>
```

**When to Use**:
- ✅ Multiple related actions (approve/reject/cancel)
- ✅ Modal footer actions
- ✅ Toolbar buttons
- ❌ Single buttons (use Button alone)

---

### Feedback Components

#### `<Badge>`
**Purpose**: Status indicators and labels

```typescript
import { Badge } from '@shopify/polaris';

// Status badges
<Badge tone="success">Healthy</Badge>
<Badge tone="warning">Attention Needed</Badge>
<Badge tone="critical">Error</Badge>
<Badge tone="info">Info</Badge>
<Badge tone="attention">Warning</Badge>

// Progress badges
<Badge progress="incomplete">In Progress</Badge>
<Badge progress="partiallyComplete">Partial</Badge>
<Badge progress="complete">Complete</Badge>

// Sizes
<Badge size="small">Small</Badge>
<Badge>Default</Badge>
<Badge size="large">Large</Badge>
```

**Tone Mapping**:
- `success` - Green (healthy status, completed)
- `warning` - Yellow (caution, needs attention)
- `critical` - Red (errors, high risk)
- `info` - Blue (informational)
- `attention` - Amber (moderate risk, warnings)

**When to Use**:
- ✅ Status indicators (healthy, error, unconfigured)
- ✅ Risk levels (low, medium, high)
- ✅ Counts and labels
- ❌ Don't use for long text (use Text instead)

**Current Usage**:
- Tile status: "Healthy" (success), "Attention needed" (critical)
- Approval risk: "LOW RISK" (success), "MEDIUM RISK" (warning), "HIGH RISK" (critical)

---

#### `<Banner>`
**Purpose**: Page-level or section-level notifications

```typescript
import { Banner } from '@shopify/polaris';

// Info banner
<Banner tone="info" title="Information">
  <Text>Important information for the user.</Text>
</Banner>

// Warning banner
<Banner tone="warning" title="Warning">
  <Text>Something needs attention.</Text>
</Banner>

// Critical banner
<Banner tone="critical" title="Error">
  <Text>Something went wrong.</Text>
</Banner>

// Success banner
<Banner tone="success" title="Success">
  <Text>Action completed successfully.</Text>
</Banner>

// With action
<Banner
  tone="warning"
  title="Update Available"
  action={{ content: 'Update Now', onAction: handleUpdate }}
>
  <Text>A new version is available.</Text>
</Banner>

// Dismissible
<Banner
  tone="info"
  onDismiss={handleDismiss}
>
  <Text>This message can be dismissed.</Text>
</Banner>
```

**Tone Guidelines**:
- `info` - Informational, neutral
- `success` - Positive outcomes
- `warning` - Caution, needs attention
- `critical` - Errors, failures

**When to Use**:
- ✅ Page-level notifications
- ✅ Error messages with context
- ✅ Success confirmations
- ✅ Important warnings
- ❌ Don't use for inline validation (use InlineError)
- ❌ Don't use for transient messages (use Toast)

**Current Usage**:
- Mock mode banner (info tone)
- Error states in approval cards (critical tone)
- Offline detection (warning tone)

---

#### `<Toast>` (via App Bridge)
**Purpose**: Transient success/error messages

```typescript
import { useToast } from '@shopify/app-bridge-react';

function MyComponent() {
  const toast = useToast();
  
  const handleSave = async () => {
    try {
      await saveData();
      toast.show('Saved successfully');
    } catch (error) {
      toast.show('Save failed', { isError: true });
    }
  };
  
  return <Button onClick={handleSave}>Save</Button>;
}
```

**When to Use**:
- ✅ Action confirmations ("Saved", "Deleted")
- ✅ Quick feedback (< 5 seconds)
- ✅ Non-critical errors
- ❌ Don't use for complex errors (use Banner)
- ❌ Don't use for persistent messages

---

### Form Components

#### `<TextField>`
**Purpose**: Single-line text input

```typescript
import { TextField } from '@shopify/polaris';

// Basic input
<TextField
  label="Email address"
  value={email}
  onChange={setEmail}
  autoComplete="email"
/>

// With help text
<TextField
  label="Store name"
  value={storeName}
  onChange={setStoreName}
  helpText="This appears in your Shopify admin"
/>

// With error
<TextField
  label="Phone number"
  value={phone}
  onChange={setPhone}
  error={phoneError}
  autoComplete="tel"
/>

// Required field
<TextField
  label="Username"
  value={username}
  onChange={setUsername}
  requiredIndicator
/>

// Prefix/suffix
<TextField
  label="Price"
  type="number"
  value={price}
  onChange={setPrice}
  prefix="$"
  suffix="USD"
/>
```

**When to Use**:
- ✅ All single-line text inputs
- ✅ Email, URL, phone fields
- ✅ Numbers with prefix/suffix
- ❌ Don't use HTML `<input>` directly

---

#### `<Select>`
**Purpose**: Dropdown selection

```typescript
import { Select } from '@shopify/polaris';

<Select
  label="Country"
  options={[
    { label: 'United States', value: 'US' },
    { label: 'Canada', value: 'CA' },
    { label: 'United Kingdom', value: 'UK' },
  ]}
  value={country}
  onChange={setCountry}
/>

// With option groups
<Select
  label="Category"
  options={[
    {
      label: 'Products',
      options: [
        { label: 'T-shirts', value: 'tshirt' },
        { label: 'Shoes', value: 'shoes' },
      ],
    },
    {
      label: 'Services',
      options: [
        { label: 'Consulting', value: 'consulting' },
      ],
    },
  ]}
  value={category}
  onChange={setCategory}
/>
```

**When to Use**:
- ✅ < 10 options
- ✅ Single selection
- ❌ Many options (use Autocomplete or Combobox)
- ❌ Don't use HTML `<select>` directly

**Current Usage**:
- Sales Pulse modal: Action selection dropdown

---

#### `<Checkbox>` & `<RadioButton>`
**Purpose**: Boolean and single-choice selections

```typescript
import { Checkbox, RadioButton, BlockStack } from '@shopify/polaris';

// Checkbox
<Checkbox
  label="Enable notifications"
  checked={notificationsEnabled}
  onChange={setNotificationsEnabled}
/>

// Radio group
<BlockStack gap="200">
  <RadioButton
    label="Option 1"
    checked={selected === '1'}
    id="option1"
    onChange={() => setSelected('1')}
  />
  <RadioButton
    label="Option 2"
    checked={selected === '2'}
    id="option2"
    onChange={() => setSelected('2')}
  />
</BlockStack>
```

---

### Overlay Components

#### `<Modal>`
**Purpose**: Modal dialogs for focused tasks

```typescript
import { Modal } from '@shopify/polaris';

<Modal
  open={isOpen}
  onClose={handleClose}
  title="Modal Title"
  primaryAction={{
    content: 'Save',
    onAction: handleSave,
  }}
  secondaryActions={[
    {
      content: 'Cancel',
      onAction: handleClose,
    },
  ]}
>
  <Modal.Section>
    <Text>Modal content goes here</Text>
  </Modal.Section>
</Modal>

// Large modal
<Modal
  open={isOpen}
  onClose={handleClose}
  title="Large Modal"
  size="large"
>
  {/* Content */}
</Modal>

// Small modal
<Modal
  open={isOpen}
  onClose={handleClose}
  title="Confirmation"
  size="small"
>
  {/* Content */}
</Modal>
```

**Sizes**:
- `small` - 400px max width
- `medium` - 600px max width (default)
- `large` - 800px max width
- `fullScreen` - Full viewport

**When to Use**:
- ✅ Forms and data entry
- ✅ Confirmations
- ✅ Detailed views
- ❌ Don't use HTML `<dialog>` directly (unless App Bridge pattern)

**Current Usage**:
- CX Escalation modal: Medium size with approve/reject actions
- Sales Pulse modal: Medium size with action selection

**Migration Note**: Current modals use `<dialog>` element. Consider migrating to `<Modal>` for better Polaris integration.

---

### Feedback & Status Components

#### `<Spinner>`
**Purpose**: Loading indicators

```typescript
import { Spinner } from '@shopify/polaris';

// Default spinner
<Spinner size="small" />
<Spinner size="large" />

// With accessible label
<Spinner accessibilityLabel="Loading content" />

// In button (use Button's loading prop instead)
<Button loading>Loading...</Button>
```

**When to Use**:
- ✅ Page-level loading
- ✅ Section loading
- ❌ Don't use in buttons (use Button's `loading` prop)

---

#### `<ProgressBar>`
**Purpose**: Show progress of operations

```typescript
import { ProgressBar } from '@shopify/polaris';

<ProgressBar progress={75} />

// Sizes
<ProgressBar progress={50} size="small" />
<ProgressBar progress={50} size="medium" />
<ProgressBar progress={50} size="large" />

// Tones
<ProgressBar progress={25} tone="critical" />
<ProgressBar progress={75} tone="success" />
```

**When to Use**:
- ✅ File uploads
- ✅ Multi-step processes
- ✅ Known-duration operations
- ❌ Unknown duration (use Spinner)

---

#### `<Skeleton>` Components
**Purpose**: Loading placeholders that match content shape

```typescript
import { 
  SkeletonBodyText, 
  SkeletonDisplayText, 
  SkeletonThumbnail,
  SkeletonTabs,
} from '@shopify/polaris';

// Text skeleton
<SkeletonBodyText lines={3} />

// Heading skeleton
<SkeletonDisplayText size="small" />
<SkeletonDisplayText size="medium" />
<SkeletonDisplayText size="large" />

// Image skeleton
<SkeletonThumbnail size="small" />
<SkeletonThumbnail size="medium" />
<SkeletonThumbnail size="large" />

// Tab skeleton
<SkeletonTabs count={3} />
```

**When to Use**:
- ✅ Initial page load
- ✅ Lazy-loaded content
- ✅ Known content structure
- ❌ Unknown content (use Spinner)

**Current Usage** (Recommended):
- Approval queue: Use SkeletonBodyText for card loading

---

### Data Display Components

#### `<DataTable>`
**Purpose**: Tabular data with sorting

```typescript
import { DataTable } from '@shopify/polaris';

<DataTable
  columnContentTypes={['text', 'numeric', 'numeric', 'text']}
  headings={['Product', 'Quantity', 'Revenue', 'Status']}
  rows={[
    ['Board XL', 14, '$2,800', 'In Stock'],
    ['Gloves Pro', 32, '$1,920', 'Low Stock'],
  ]}
  sortable={[true, true, true, false]}
  defaultSortDirection="descending"
  initialSortColumnIndex={2}
/>
```

**When to Use**:
- ✅ Tabular data
- ✅ Sorting needed
- ✅ Numeric alignment
- ❌ Simple lists (use List or custom ul)

---

#### `<List>` & `<List.Item>`
**Purpose**: Unordered or ordered lists

```typescript
import { List } from '@shopify/polaris';

// Unordered list
<List>
  <List.Item>First item</List.Item>
  <List.Item>Second item</List.Item>
  <List.Item>Third item</List.Item>
</List>

// Numbered list
<List type="number">
  <List.Item>Step one</List.Item>
  <List.Item>Step two</List.Item>
</List>

// Bullet list
<List type="bullet">
  <List.Item>Feature A</List.Item>
  <List.Item>Feature B</List.Item>
</List>
```

**When to Use**:
- ✅ Bulleted/numbered lists
- ✅ Steps or sequences
- ❌ Complex data (use DataTable)

**Current Usage**:
- Tile content: Uses custom styled `<ul>` - **consider migrating to `<List>`**

---

## 3. Custom OCC Components

### Custom Components We've Created

#### `<TileCard>`
**Purpose**: Wrapper for dashboard tiles with status handling

**File**: `app/components/tiles/TileCard.tsx`

**Props**:
```typescript
interface TileCardProps<T> {
  title: string;
  tile: TileState<T>;
  render: (data: T) => ReactNode;
  testId?: string;
}
```

**States**:
- `ok` - Healthy status (green badge)
- `error` - Error status (red badge)
- `unconfigured` - Not configured (gray badge)

**Migration Path**: Consider refactoring to use Polaris `<Card>` with `<Banner>` for errors.

---

#### Custom Tile Components

All tile components follow the same pattern:

**Files**:
- `CXEscalationsTile.tsx`
- `SalesPulseTile.tsx`
- `FulfillmentHealthTile.tsx`
- `InventoryHeatmapTile.tsx`
- `SEOContentTile.tsx`
- `OpsMetricsTile.tsx`

**Common Pattern**:
```typescript
export function SomeTile({ data }: Props) {
  return (
    <>
      {/* Main content */}
      <Text variant="headingMd">{data.metric}</Text>
      
      {/* List of items */}
      <ul style={{...}}>  {/* Could use <List> */}
        {items.map(item => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
      
      {/* Action button */}
      <button className="occ-link-button">  {/* Could use <Button variant="plain"> */}
        View Details
      </button>
    </>
  );
}
```

**Improvement Opportunities**:
1. Replace custom `<ul>` styling with `<List>`
2. Replace `.occ-link-button` with `<Button variant="plain">`
3. Use `<BlockStack>` for vertical spacing instead of inline styles

---

### Custom Modal Components

#### `<CXEscalationModal>`
**Purpose**: Customer escalation review and response

**Current Pattern**: Uses HTML `<dialog>` with custom classes  
**Polaris Migration**: Replace with `<Modal>` component

**Before** (Current):
```typescript
<dialog open className="occ-modal">
  <div className="occ-modal__header">
    <h2>Title</h2>
    <button className="occ-button occ-button--plain">Close</button>
  </div>
  {/* ... */}
</dialog>
```

**After** (Polaris):
```typescript
<Modal
  open={open}
  onClose={onClose}
  title="CX Escalation — Jamie Lee"
  primaryAction={{ content: 'Approve & Send', onAction: handleApprove }}
  secondaryActions={[
    { content: 'Escalate', onAction: handleEscalate },
    { content: 'Mark Resolved', onAction: handleResolve },
  ]}
>
  <Modal.Section>
    {/* Content */}
  </Modal.Section>
</Modal>
```

**Benefits**:
- Automatic focus management
- Built-in ARIA attributes
- Consistent styling with Shopify Admin
- Accessibility out of the box

---

## 4. Design Tokens

### Color Tokens

#### Polaris Color System

**Surface Colors**:
```css
background="bg-surface"              /* #ffffff - Primary white */
background="bg-surface-secondary"    /* #f6f6f7 - Light gray */
background="bg-surface-tertiary"     /* #e8eaed - Medium gray */
background="bg-surface-hover"        /* #f6f6f7 - Hover state */
background="bg-surface-active"       /* #e8eaed - Active state */
background="bg-surface-selected"     /* #f2f7fe - Selected blue */
```

**Status Colors**:
```css
/* Success (Green) */
background="bg-success"              /* #1a7f37 */
background="bg-success-subdued"      /* #e3f9e5 */
tone="success"                       /* For Text, Badge, Banner */

/* Critical (Red) */
background="bg-critical"             /* #d82c0d */
background="bg-critical-subdued"     /* #fff4f4 */
tone="critical"

/* Warning (Yellow) */
background="bg-warning"              /* #916a00 */
background="bg-warning-subdued"      /* #fef5e9 */
tone="warning"

/* Info (Blue) */
background="bg-info"                 /* #1f5d99 */
background="bg-info-subdued"         /* #e8f5fa */
tone="info"
```

**Text Colors**:
```css
tone="base"       /* #202223 - Primary text */
tone="subdued"    /* #637381 - Secondary text */
tone="disabled"   /* #b4b9be - Disabled text */
tone="success"    /* #1a7f37 - Success text */
tone="critical"   /* #d82c0d - Error text */
tone="warning"    /* #916a00 - Warning text */
tone="info"       /* #1f5d99 - Info text */
```

**Border Colors**:
```css
borderColor="border"                 /* #d2d5d8 - Default */
borderColor="border-secondary"       /* #e8eaed - Subtle */
borderColor="border-focus"           /* #2c6ecb - Focus ring */
borderColor="border-success"         /* #2e844a */
borderColor="border-critical"        /* #e85c4a */
```

---

### Spacing Tokens

**Polaris Spacing Scale**:
```css
"050"  →  2px   (Hairline)
"100"  →  4px   (Tight)
"200"  →  8px   (Default)
"300"  →  12px  (Comfortable)
"400"  →  16px  (Spacious)
"500"  →  20px  (Very spacious)
"600"  →  24px  (Extra spacious)
"800"  →  32px  (Large gap)
"1000" →  40px  (XL gap)
"1200" →  48px  (XXL gap)
```

**Usage in Components**:
```typescript
<BlockStack gap="400">       {/* 16px vertical gap */}
<InlineStack gap="200">      {/* 8px horizontal gap */}
<Box padding="300">          {/* 12px padding all sides */}
<Box paddingBlock="400">     {/* 16px top/bottom */}
<Box paddingInline="500">    {/* 20px left/right */}
```

---

### Typography Tokens

**Font Sizes** (via Text variants):
```typescript
variant="headingXl"  → 28px (Page titles)
variant="headingLg"  → 24px (Major sections)
variant="headingMd"  → 18px (Tile headings)
variant="headingSm"  → 14px (Minor headings)
variant="bodyLg"     → 18px (Large body)
variant="bodyMd"     → 16px (Default body)
variant="bodySm"     → 14px (Small text, meta)
```

**Font Weights**:
```typescript
fontWeight="regular"   → 400
fontWeight="medium"    → 500
fontWeight="semibold"  → 600
fontWeight="bold"      → 700
```

**Line Heights**:
- Automatically set by Polaris based on variant
- `headings`: 1.25 (tight)
- `body`: 1.5 (comfortable)

---

### Border Radius Tokens

```css
borderRadius="050"  →  2px   (Very subtle)
borderRadius="100"  →  4px   (Subtle)
borderRadius="200"  →  8px   (Default)
borderRadius="300"  →  12px  (Prominent)
borderRadius="400"  →  16px  (Large)
borderRadius="full" →  9999px (Pills)
```

**Usage**:
```typescript
<Box borderRadius="200">  {/* 8px - Default for cards */}
<Box borderRadius="300">  {/* 12px - Modals */}
<Box borderRadius="100">  {/* 4px - Buttons */}
```

---

### Shadow Tokens

```css
shadow="100"  → Subtle elevation (cards at rest)
shadow="200"  → Low elevation (cards on hover)
shadow="300"  → Medium elevation (dropdowns)
shadow="400"  → High elevation (modals)
shadow="500"  → Highest elevation (popovers)
```

**Usage**:
```typescript
<Box shadow="100">  {/* Card default */}
<Box shadow="400">  {/* Modal */}
```

---

## 5. Component Usage Guidelines

### Dashboard Tiles

**Current Pattern**:
```typescript
<TileCard
  title="Sales Pulse"
  tile={salesData}
  render={(data) => <SalesPulseTile summary={data} enableModal />}
/>
```

**Recommended Enhancement**:
```typescript
<Card>
  <BlockStack gap="400">
    <InlineStack align="space-between">
      <Text variant="headingMd" as="h2">Sales Pulse</Text>
      <Badge tone={statusTone}>{statusLabel}</Badge>
    </InlineStack>
    
    <SalesPulseTile summary={data} />
    
    <Button variant="plain" onClick={openModal}>
      View Details
    </Button>
  </BlockStack>
</Card>
```

**Benefits**:
- Native Polaris Card styling
- Better accessibility
- Automatic responsive behavior
- Consistent with Shopify Admin

---

### Modal Patterns

**Current Pattern** (HTML dialog):
```typescript
<dialog open className="occ-modal">
  <div className="occ-modal__header">{/* ... */}</div>
  <div className="occ-modal__body">{/* ... */}</div>
  <div className="occ-modal__footer">{/* ... */}</div>
</dialog>
```

**Recommended Pattern** (Polaris Modal):
```typescript
<Modal
  open={open}
  onClose={onClose}
  title="Modal Title"
  primaryAction={{ content: 'Primary', onAction: handlePrimary }}
  secondaryActions={[...]}
>
  <Modal.Section>
    {/* Content with BlockStack for spacing */}
    <BlockStack gap="400">
      {/* Sections */}
    </BlockStack>
  </Modal.Section>
</Modal>
```

**Benefits**:
- Automatic focus trap
- Escape key handling
- Consistent spacing
- Built-in accessibility

---

### Form Patterns

**Best Practice**:
```typescript
<BlockStack gap="400">
  <TextField
    label="Email"
    type="email"
    value={email}
    onChange={setEmail}
    error={emailError}
    requiredIndicator
    autoComplete="email"
  />
  
  <Select
    label="Priority"
    options={priorityOptions}
    value={priority}
    onChange={setPriority}
  />
  
  <Checkbox
    label="Send notification"
    checked={sendNotif}
    onChange={setSendNotif}
  />
</BlockStack>
```

**Key Points**:
- Use `<BlockStack>` for consistent vertical spacing
- Include labels (accessibility requirement)
- Use `requiredIndicator` for required fields
- Include `autoComplete` attributes
- Show errors inline with `error` prop

---

## 6. Do's and Don'ts

### ✅ DO

**Component Selection**:
- ✅ Use Polaris components first, always
- ✅ Use `<Text>` for all text content
- ✅ Use `<Button>` for all actions
- ✅ Use `<BlockStack>` and `<InlineStack>` for layout
- ✅ Use Polaris tokens for spacing, colors, typography
- ✅ Use `accessibilityLabel` on interactive elements
- ✅ Use semantic heading variants with `as` prop

**Styling**:
- ✅ Use Polaris props (`background`, `padding`, `gap`)
- ✅ Use tone prop for color variants
- ✅ Respect Polaris spacing scale
- ✅ Use Polaris icons from `@shopify/polaris-icons`

**Accessibility**:
- ✅ Include labels on all form inputs
- ✅ Use semantic headings (h1, h2, h3)
- ✅ Provide `accessibilityLabel` for icon-only buttons
- ✅ Use `visuallyHidden` for screen-reader-only text
- ✅ Test with keyboard navigation
- ✅ Test with screen readers

---

### ❌ DON'T

**Component Selection**:
- ❌ Don't use raw HTML elements (`<button>`, `<input>`, `<select>`)
- ❌ Don't use `<div>` for layout (use `<Box>`, `<BlockStack>`, `<InlineStack>`)
- ❌ Don't use `<span>` or `<p>` for text (use `<Text>`)
- ❌ Don't create custom buttons (use `<Button>`)

**Styling**:
- ❌ Don't use inline styles (except Polaris-generated values)
- ❌ Don't use custom CSS classes for Polaris components
- ❌ Don't use arbitrary spacing values (use Polaris scale)
- ❌ Don't use hex colors directly (use Polaris tokens)
- ❌ Don't use CSS flexbox/grid (use Polaris stack components)

**Accessibility**:
- ❌ Don't skip labels on form inputs
- ❌ Don't use color alone to convey information
- ❌ Don't use non-semantic headings (div styled as heading)
- ❌ Don't forget keyboard navigation
- ❌ Don't use poor color contrast

---

## 7. Accessibility Standards

### WCAG 2.2 Level AA Requirements

All components must meet:

1. **Perceivable**
   - Text alternatives for non-text content
   - Color contrast ratio ≥ 4.5:1 for text
   - Resize text to 200% without loss of functionality

2. **Operable**
   - All functionality available via keyboard
   - No keyboard traps
   - Skip links provided
   - Focus indicators visible

3. **Understandable**
   - Consistent navigation
   - Labels and instructions provided
   - Error identification and suggestions

4. **Robust**
   - Valid HTML/ARIA markup
   - Compatible with assistive technologies

### Polaris Accessibility Features

Polaris components include:
- ✅ Proper ARIA attributes
- ✅ Keyboard navigation
- ✅ Focus management
- ✅ Screen reader support
- ✅ Color contrast compliance
- ✅ Responsive text sizing

### Testing Checklist

For every new component:
- [ ] Keyboard navigation works
- [ ] Screen reader announces correctly
- [ ] Focus indicators visible
- [ ] Color contrast verified
- [ ] Works at 200% zoom
- [ ] Responsive on mobile
- [ ] Error states accessible

---

## 8. Responsive Patterns

### Breakpoints

```typescript
// Polaris uses these breakpoints:
xs:  0px      // Mobile portrait
sm:  490px    // Mobile landscape  
md:  768px    // Tablet
lg:  1040px   // Desktop
xl:  1440px   // Large desktop
```

### HotDash Breakpoints

```typescript
Mobile:   < 768px   // Single column, stacked tiles
Tablet:   768-1279px // Two columns
Desktop:  1280px+    // Three columns
```

### Responsive Component Patterns

**Use Polaris responsive props**:
```typescript
// Hide on mobile
<Box display={{ xs: 'none', md: 'block' }}>
  {/* Desktop only */}
</Box>

// Stack on mobile, inline on desktop
<InlineStack gap="200" wrap={true}>
  {/* Items wrap on small screens */}
</InlineStack>

// Full width on mobile
<Button fullWidth={{ xs: true, md: false }}>
  {/* Full width on mobile only */}
</Button>
```

**Current Dashboard Grid**:
```css
.occ-tile-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: var(--occ-tile-gap);
}
```

**Polaris Alternative**:
```typescript
<Layout>
  {tiles.map(tile => (
    <Layout.Section key={tile.id} variant={{ xs: 'oneThird', md: 'oneHalf', lg: 'oneThird' }}>
      <TileCard {...tile} />
    </Layout.Section>
  ))}
</Layout>
```

---

## 9. Migration Guide

### Phase 1: Low-Risk Migrations

**Replace link buttons with Polaris Button**:
```typescript
// Before:
<button className="occ-link-button" onClick={...}>View Details</button>

// After:
<Button variant="plain" onClick={...}>View Details</Button>
```

**Replace custom lists with Polaris List**:
```typescript
// Before:
<ul style={{ margin: 0, paddingLeft: '1.1rem', ... }}>
  <li>Item</li>
</ul>

// After:
<List>
  <List.Item>Item</List.Item>
</List>
```

---

### Phase 2: Medium-Risk Migrations

**Replace custom modals with Polaris Modal**:
```typescript
// Before:
<dialog open className="occ-modal">...</dialog>

// After:
<Modal open={open} onClose={onClose} title="...">...</Modal>
```

**Benefits**: Better accessibility, focus management, consistent styling

---

### Phase 3: Custom Components Enhancement

**Enhance TileCard with Polaris**:
```typescript
// Current: Custom component with inline styles
// Future: Polaris Card with BlockStack

function TileCard({ title, status, children }: Props) {
  return (
    <Card>
      <BlockStack gap="400">
        <InlineStack align="space-between">
          <Text variant="headingMd" as="h2">{title}</Text>
          <Badge tone={statusTone}>{statusLabel}</Badge>
        </InlineStack>
        {children}
      </BlockStack>
    </Card>
  );
}
```

---

## 10. Quick Reference

### Common Patterns Cheat Sheet

**Page with content**:
```typescript
<Page title="Page Title">
  <Layout>
    <Layout.Section>
      <Card>
        <BlockStack gap="400">
          <Text variant="headingMd" as="h2">Section</Text>
          <Text variant="bodyMd">Content</Text>
        </BlockStack>
      </Card>
    </Layout.Section>
  </Layout>
</Page>
```

**Form with validation**:
```typescript
<BlockStack gap="400">
  <TextField label="Name" value={name} onChange={setName} error={errors.name} requiredIndicator />
  <ButtonGroup>
    <Button variant="primary" onClick={handleSave}>Save</Button>
    <Button onClick={handleCancel}>Cancel</Button>
  </ButtonGroup>
</BlockStack>
```

**Status indicator**:
```typescript
<InlineStack gap="200" blockAlign="center">
  <Icon source={CheckIcon} tone="success" />
  <Text tone="success">Success</Text>
</InlineStack>
```

**Loading state**:
```typescript
{isLoading ? (
  <SkeletonBodyText lines={3} />
) : (
  <Text>{content}</Text>
)}
```

**Error banner**:
```typescript
{error && (
  <Banner tone="critical" title="Error" onDismiss={clearError}>
    <Text>{errorMessage}</Text>
  </Banner>
)}
```

---

## 11. Resources

### Documentation
- **Polaris Components**: https://polaris.shopify.com/components
- **Polaris Tokens**: https://polaris.shopify.com/tokens
- **Polaris Patterns**: https://polaris.shopify.com/patterns
- **Polaris Icons**: https://polaris.shopify.com/icons

### Internal Docs
- **Design Tokens**: `docs/design/tokens/design_tokens.md`
- **Figma Variables**: `docs/design/figma-variables-export.md`
- **Accessibility**: `docs/design/accessibility_criteria.md`
- **Visual Hierarchy**: `docs/design/visual_hierarchy_review.md`

### Tools
- **Polaris Figma Kit**: Available in Shopify Partner resources
- **Color Contrast Checker**: https://webaim.org/resources/contrastchecker/
- **Accessibility Testing**: axe DevTools browser extension

---

## 12. Component Inventory

### Current HotDash Components

**Polaris Components in Use**:
- Page (via App Bridge `<s-page>`)
- Text (limited usage)
- Button (limited usage)
- (More Polaris components to be adopted)

**Custom OCC Components**:
- TileCard (wrapper with status handling)
- SalesPulseTile (content renderer)
- FulfillmentHealthTile (content renderer)
- InventoryHeatmapTile (content renderer)
- CXEscalationsTile (content renderer)
- SEOContentTile (content renderer)
- OpsMetricsTile (content renderer)
- CXEscalationModal (dialog with form)
- SalesPulseModal (dialog with action selection)

**Custom CSS Classes** (to be migrated):
- `.occ-tile` → Migrate to `<Card>`
- `.occ-tile-grid` → Migrate to `<Layout>` or grid utilities
- `.occ-button` variants → Migrate to `<Button>`
- `.occ-modal` variants → Migrate to `<Modal>`
- `.occ-link-button` → Migrate to `<Button variant="plain">`

---

## 13. Design System Governance

### Adding New Components

**Process**:
1. Check if Polaris component exists
2. If yes, use Polaris component
3. If no, create custom component following Polaris patterns
4. Document in this guide
5. Log in `feedback/designer.md`

### Modifying Existing Components

**Process**:
1. Identify component to modify
2. Check Polaris patterns for guidance
3. Maintain accessibility standards
4. Test across breakpoints
5. Document changes
6. Update this guide

### Component Review Criteria

Before approval, verify:
- [ ] Uses Polaris components where possible
- [ ] Follows Polaris token system
- [ ] Meets WCAG 2.2 AA standards
- [ ] Works on all breakpoints
- [ ] Keyboard accessible
- [ ] Screen reader friendly
- [ ] Documented in design system guide

---

**Status**: Design System Guide Complete  
**Created**: 2025-10-11  
**Owner**: Designer Agent  
**Next Review**: After Polaris migration (if initiated)

