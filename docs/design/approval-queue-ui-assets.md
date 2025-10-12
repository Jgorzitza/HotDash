---
epoch: 2025.10.E1
doc: docs/design/approval-queue-ui-assets.md
owner: designer
created: 2025-10-12
---

# Task 1A: UI Assets for Approval Queue

## Icons for Approve/Reject Actions

**Source**: Use Shopify Polaris icons (already included)

### Approve Action
```typescript
import { CheckCircleIcon } from '@shopify/polaris-icons';

<Button icon={CheckCircleIcon} variant="primary" tone="success">
  Approve
</Button>
```

**Icon**: `CheckCircleIcon` (✓ in circle)
**Color**: Success green (`--p-color-icon-success`)
**Size**: 20px (standard button icon size)

### Reject Action
```typescript
import { CancelSmallIcon } from '@shopify/polaris-icons';

<Button icon={CancelSmallIcon} variant="primary" tone="critical">
  Reject
</Button>
```

**Icon**: `CancelSmallIcon` (X in circle)
**Color**: Critical red (`--p-color-icon-critical`)
**Size**: 20px

### Alternative: Text-Only Buttons (Recommended)
For better accessibility and clarity, use text-only buttons without icons:

```typescript
<Button variant="primary" tone="success">Approve</Button>
<Button variant="primary" tone="critical">Reject</Button>
```

**Rationale**: Text is clearer than icons for critical actions. Icons can be ambiguous.

---

## Loading States

### 1. Initial Page Load (Skeleton)
```typescript
import { SkeletonPage, Card, SkeletonBodyText } from '@shopify/polaris';

<SkeletonPage title="Approval Queue">
  <Card>
    <SkeletonBodyText lines={3} />
  </Card>
  <Card>
    <SkeletonBodyText lines={3} />
  </Card>
</SkeletonPage>
```

**Visual**: Gray placeholder rectangles that pulse gently
**Duration**: Until data loads (typically < 1s)
**Animation**: Built-in Polaris skeleton animation

### 2. Action Loading (Approve/Reject in Progress)
```typescript
<Button
  variant="primary"
  tone="success"
  loading={isApproving}
  disabled={isApproving || isRejecting}
>
  Approve
</Button>
```

**Visual**: Button shows spinner, text remains visible
**Interaction**: Both buttons disabled during action
**Duration**: Until API responds (typically 0.5-2s)

### 3. Background Refresh (Non-Intrusive)
```typescript
<div style={{ position: 'relative' }}>
  {isRefreshing && (
    <div style={{ 
      position: 'absolute', 
      top: 8, 
      right: 8,
      opacity: 0.6 
    }}>
      <Spinner size="small" />
    </div>
  )}
  {/* Approval cards */}
</div>
```

**Visual**: Small spinner in corner of page
**Behavior**: Doesn't block interaction
**Frequency**: Every 5 seconds (auto-refresh)

---

## Empty State Illustration

### No Pending Approvals
```typescript
import { EmptyState } from '@shopify/polaris';

<EmptyState
  heading="All clear!"
  image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
>
  <p>No pending approvals at this time. Check back later.</p>
</EmptyState>
```

**Visual**: Polaris standard empty state illustration (file folder)
**Copy**: 
- Heading: "All clear!"
- Body: "No pending approvals at this time. Check back later."
**Tone**: Positive (this is a good state - no work needed)

### Alternative Custom Empty State
```typescript
<div style={{ 
  textAlign: 'center', 
  padding: '60px 20px',
  color: 'var(--p-color-text-subdued)'
}}>
  <Text variant="headingLg" as="h2">✓ All Caught Up</Text>
  <Box paddingBlockStart="200">
    <Text variant="bodyMd" tone="subdued">
      No agent actions need approval right now.
    </Text>
  </Box>
</div>
```

**Visual**: Simple checkmark emoji, centered text
**Copy**: "✓ All Caught Up" / "No agent actions need approval right now."

---

## Error State Visuals

### 1. Failed to Load Approvals (Network Error)
```typescript
<Banner tone="critical">
  <p>
    <strong>Failed to load approvals.</strong> Check your connection and{' '}
    <Button plain onClick={retry}>try again</Button>.
  </p>
</Banner>
```

**Visual**: Red banner at top of page
**Action**: Retry button (plain style, inline)
**Auto-retry**: Attempt automatic retry after 5s

### 2. Failed to Approve/Reject (Action Error)
```typescript
<Banner 
  tone="critical" 
  onDismiss={() => setError(null)}
>
  <p>
    Failed to {action === 'approve' ? 'approve' : 'reject'} this action. 
    Please try again.
  </p>
</Banner>
```

**Visual**: Red banner above approval card
**Dismissible**: Yes (X button)
**Persistence**: Remains until dismissed or retry succeeds

### 3. Expired Approval (Already Processed)
```typescript
<Card>
  <BlockStack gap="400">
    <Banner tone="warning">
      This approval has expired or was already processed by another operator.
    </Banner>
    <Button onClick={removeFromQueue}>Remove from queue</Button>
  </BlockStack>
</Card>
```

**Visual**: Yellow warning banner within card
**Action**: Remove button to dismiss stale approval
**Auto-remove**: After 30s, fade out and remove

### 4. API Error (500 Response)
```typescript
<Banner tone="critical">
  <p>
    <strong>Something went wrong.</strong> Our team has been notified. 
    Please <Button plain onClick={retry}>try again</Button> in a moment.
  </p>
</Banner>
```

**Visual**: Red banner
**Copy**: Generic error (don't expose technical details)
**Action**: Retry button

---

## Visual Specifications

### Color Tokens (Polaris)
```css
/* Status colors */
--status-success: var(--p-color-bg-success-strong);
--status-critical: var(--p-color-bg-critical-strong);
--status-warning: var(--p-color-bg-caution-strong);

/* Text colors */
--text-primary: var(--p-color-text);
--text-subdued: var(--p-color-text-subdued);
--text-success: var(--p-color-text-success);
--text-critical: var(--p-color-text-critical);

/* Background */
--bg-surface: var(--p-color-bg-surface);
--bg-subdued: var(--p-color-bg-surface-secondary);
```

### Spacing (Polaris)
```css
/* Card padding */
padding: var(--p-space-400); /* 16px */

/* Stack gap (between elements) */
gap: var(--p-space-300); /* 12px */

/* Section spacing */
margin-bottom: var(--p-space-500); /* 20px */
```

### Typography (Polaris)
```typescript
// Heading (Conversation #101)
<Text variant="headingMd" as="h2">

// Body text
<Text variant="bodyMd" as="p">

// Subdued text (timestamps, metadata)
<Text variant="bodySm" tone="subdued">
```

---

## Asset Checklist

✅ **Icons**: Use Polaris icons (CheckCircleIcon, CancelSmallIcon) - OR text-only buttons (recommended)
✅ **Loading States**: SkeletonPage, Button loading prop, small spinner for refresh
✅ **Empty State**: Polaris EmptyState component with standard illustration
✅ **Error Visuals**: Banner component (critical, warning tones)
✅ **Colors**: All Polaris tokens (no custom colors needed)
✅ **Spacing**: All Polaris spacing tokens
✅ **Typography**: All Polaris text variants

**Result**: No custom assets needed! All visuals use Polaris components and tokens.

---

## Implementation Notes for Engineer

1. **No custom graphics needed** - Polaris provides all necessary visual elements
2. **Icons optional** - Text-only buttons are clearer for critical actions
3. **Loading states** - Use built-in Polaris components (SkeletonPage, Button loading)
4. **Empty state** - Use Polaris EmptyState with standard illustration URL
5. **Errors** - Use Banner component with appropriate tones
6. **Colors/spacing** - Reference Polaris tokens only, no hardcoded values

**Evidence**: All assets specified using Polaris components - ready for implementation

