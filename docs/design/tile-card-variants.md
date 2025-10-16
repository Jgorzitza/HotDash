# Tile Card Variants Specification

**File:** `docs/design/tile-card-variants.md`  
**Owner:** Designer  
**Version:** 1.0  
**Date:** 2025-10-15  
**Status:** Complete  
**Purpose:** Define tile card visual variants with Polaris Badge tones

---

## 1. Overview

Tile cards use Polaris Badge components for status indication, ensuring consistency with Shopify design system and accessibility compliance.

---

## 2. Status Variants

### 2.1 Success (Healthy)

**When to use:** Normal operation, no issues detected

**Polaris Badge:**
```tsx
<Badge tone="success">Healthy</Badge>
```

**Visual:**
- Badge color: Green
- Badge text: "Healthy"
- Tile border: Default (no special styling)
- Tile background: Default white

**Example:**
```tsx
<Card>
  <BlockStack gap="400">
    <InlineStack align="space-between">
      <Text variant="headingMd" as="h2">Sales Pulse</Text>
      <Badge tone="success">Healthy</Badge>
    </InlineStack>
    <Text variant="bodyMd">$1,250.50</Text>
  </BlockStack>
</Card>
```

**Use cases:**
- All metrics within normal range
- No errors or warnings
- Data fresh and up-to-date

---

### 2.2 Warning (Attention Needed)

**When to use:** Potential issues, degraded functionality, approaching thresholds

**Polaris Badge:**
```tsx
<Badge tone="warning">Attention needed</Badge>
```

**Visual:**
- Badge color: Yellow/Orange
- Badge text: "Attention needed"
- Tile border: Optional yellow accent (2px left border)
- Tile background: Default white

**Example:**
```tsx
<Card>
  <BlockStack gap="400">
    <InlineStack align="space-between">
      <Text variant="headingMd" as="h2">Inventory Heatmap</Text>
      <Badge tone="warning">Attention needed</Badge>
    </InlineStack>
    <Text variant="bodyMd" tone="subdued">
      5 products below reorder point
    </Text>
  </BlockStack>
</Card>
```

**Use cases:**
- Low stock warnings
- Approaching SLA deadlines
- Degraded performance
- Stale data (cache)

---

### 2.3 Critical (Error)

**When to use:** System failure, data loss risk, urgent action required

**Polaris Badge:**
```tsx
<Badge tone="critical">Error</Badge>
```

**Visual:**
- Badge color: Red
- Badge text: "Error"
- Tile border: Optional red accent (2px left border)
- Tile background: Default white

**Example:**
```tsx
<Card>
  <BlockStack gap="400">
    <InlineStack align="space-between">
      <Text variant="headingMd" as="h2">CX Escalations</Text>
      <Badge tone="critical">Error</Badge>
    </InlineStack>
    <Banner tone="critical">
      <p>Unable to load conversations. Check Chatwoot connection.</p>
    </Banner>
  </BlockStack>
</Card>
```

**Use cases:**
- Network errors
- API failures
- Authentication errors
- Data validation failures

---

### 2.4 Info (Configuration Required)

**When to use:** Feature requires setup, not yet configured

**Polaris Badge:**
```tsx
<Badge tone="info">Configuration required</Badge>
```

**Visual:**
- Badge color: Blue
- Badge text: "Configuration required"
- Tile border: Default
- Tile background: Default white

**Example:**
```tsx
<Card>
  <BlockStack gap="400">
    <InlineStack align="space-between">
      <Text variant="headingMd" as="h2">SEO Content</Text>
      <Badge tone="info">Configuration required</Badge>
    </InlineStack>
    <EmptyState
      heading="Connect Google Analytics"
      action={{ content: 'Set up', onAction: handleSetup }}
    >
      <p>Connect your Google Analytics account to enable this tile.</p>
    </EmptyState>
  </BlockStack>
</Card>
```

**Use cases:**
- Integration not connected
- Feature not enabled
- Setup incomplete

---

### 2.5 Attention (Needs Review)

**When to use:** Items requiring human review, pending approvals

**Polaris Badge:**
```tsx
<Badge tone="attention">Needs review</Badge>
```

**Visual:**
- Badge color: Orange
- Badge text: "Needs review"
- Tile border: Default
- Tile background: Default white

**Example:**
```tsx
<Card>
  <BlockStack gap="400">
    <InlineStack align="space-between">
      <Text variant="headingMd" as="h2">Approvals Queue</Text>
      <Badge tone="attention">Needs review</Badge>
    </InlineStack>
    <Text variant="bodyMd">3 pending approvals</Text>
    <Button onClick={handleReview}>Review queue</Button>
  </BlockStack>
</Card>
```

**Use cases:**
- Pending approvals
- Items awaiting review
- Action required (non-urgent)

---

### 2.6 New (Recently Added)

**When to use:** New items, recent updates

**Polaris Badge:**
```tsx
<Badge tone="new">New</Badge>
```

**Visual:**
- Badge color: Teal
- Badge text: "New"
- Tile border: Default
- Tile background: Default white

**Example:**
```tsx
<Card>
  <BlockStack gap="400">
    <InlineStack align="space-between">
      <Text variant="headingMd" as="h2">Sales Pulse</Text>
      <Badge tone="new">New</Badge>
    </InlineStack>
    <Text variant="bodyMd">New orders in last hour: 5</Text>
  </BlockStack>
</Card>
```

**Use cases:**
- New orders
- Recent updates
- Fresh data

---

## 3. Polaris Badge Tone Reference

| Tone | Color | Use Case | Example |
|------|-------|----------|---------|
| `success` | Green | Healthy, complete, positive | "Healthy", "Complete", "Active" |
| `critical` | Red | Error, urgent, failure | "Error", "Failed", "Urgent" |
| `warning` | Yellow | Caution, approaching limit | "Attention needed", "Low stock" |
| `attention` | Orange | Needs review, action required | "Needs review", "Pending" |
| `info` | Blue | Informational, setup required | "Configuration required", "Info" |
| `new` | Teal | New items, recent updates | "New", "Updated" |

---

## 4. Tile Border Accents (Optional)

### 4.1 Left Border Accent

**When to use:** Emphasize critical or warning states

**CSS:**
```css
.tile-warning {
  border-left: 3px solid var(--p-color-border-warning);
}

.tile-critical {
  border-left: 3px solid var(--p-color-border-critical);
}
```

**Polaris Implementation:**
```tsx
<Card>
  <div style={{ borderLeft: '3px solid var(--p-color-border-critical)' }}>
    {/* Tile content */}
  </div>
</Card>
```

### 4.2 Full Border Highlight

**When to use:** Interactive tiles, hover states

**CSS:**
```css
.tile:hover {
  border-color: var(--p-color-border-interactive);
  box-shadow: var(--p-shadow-200);
}
```

---

## 5. Accessibility

### 5.1 Color + Text

**Rule:** Never rely on color alone

**Implementation:**
- ✅ Badge includes text label ("Healthy", "Error", etc.)
- ✅ Screen reader announces badge text
- ✅ Icon + text for critical states

**Example:**
```tsx
<Badge tone="critical">
  <InlineStack gap="100">
    <Icon source={AlertCircleIcon} />
    <span>Error</span>
  </InlineStack>
</Badge>
```

### 5.2 ARIA Labels

**Tile with status:**
```tsx
<div 
  role="region"
  aria-labelledby="tile-heading"
  aria-describedby="tile-status"
>
  <h2 id="tile-heading">Sales Pulse</h2>
  <span id="tile-status" className="sr-only">
    Status: Healthy. Last refreshed 2 minutes ago.
  </span>
  <Badge tone="success">Healthy</Badge>
</div>
```

### 5.3 Color Contrast

**Polaris Badge contrast ratios:**
- Success: 4.5:1+ ✅
- Critical: 4.5:1+ ✅
- Warning: 4.5:1+ ✅
- Info: 4.5:1+ ✅
- Attention: 4.5:1+ ✅
- New: 4.5:1+ ✅

All Polaris Badge tones meet WCAG 2.1 AA requirements.

---

## 6. Implementation Examples

### 6.1 TileCard Component

```tsx
interface TileCardProps<T> {
  title: string;
  tile: TileState<T>;
  render: (data: T) => ReactNode;
}

interface TileState<T> {
  status: 'ok' | 'warning' | 'error' | 'unconfigured';
  data?: T;
  fact?: TileFact;
}

function TileCard<T>({ title, tile, render }: TileCardProps<T>) {
  const badgeTone = {
    ok: 'success',
    warning: 'warning',
    error: 'critical',
    unconfigured: 'info',
  }[tile.status];
  
  const badgeText = {
    ok: 'Healthy',
    warning: 'Attention needed',
    error: 'Error',
    unconfigured: 'Configuration required',
  }[tile.status];
  
  return (
    <Card>
      <BlockStack gap="400">
        <InlineStack align="space-between">
          <Text variant="headingMd" as="h2">{title}</Text>
          <Badge tone={badgeTone}>{badgeText}</Badge>
        </InlineStack>
        
        {tile.fact && (
          <Text variant="bodySm" tone="subdued">
            Last refreshed {formatTime(tile.fact.createdAt)}
          </Text>
        )}
        
        {tile.status === 'ok' && tile.data && render(tile.data)}
        {tile.status === 'error' && <ErrorState error={tile.error} />}
        {tile.status === 'unconfigured' && <UnconfiguredState />}
      </BlockStack>
    </Card>
  );
}
```

### 6.2 Dynamic Badge Selection

```tsx
function getBadgeProps(status: string, hasData: boolean) {
  if (status === 'error') {
    return { tone: 'critical', text: 'Error' };
  }
  
  if (status === 'unconfigured') {
    return { tone: 'info', text: 'Configuration required' };
  }
  
  if (status === 'warning' || !hasData) {
    return { tone: 'warning', text: 'Attention needed' };
  }
  
  return { tone: 'success', text: 'Healthy' };
}

// Usage
const { tone, text } = getBadgeProps(tile.status, !!tile.data);
<Badge tone={tone}>{text}</Badge>
```

---

## 7. Testing Checklist

### 7.1 Visual Testing

- [ ] All badge tones render correctly
- [ ] Badge text is readable
- [ ] Border accents (if used) are visible
- [ ] Hover states work
- [ ] Focus indicators visible

### 7.2 Accessibility Testing

- [ ] Screen reader announces badge text
- [ ] Color contrast meets WCAG AA (4.5:1)
- [ ] Status not conveyed by color alone
- [ ] Keyboard navigation works
- [ ] High contrast mode supported

### 7.3 Functional Testing

- [ ] Badge updates when status changes
- [ ] Correct badge for each status
- [ ] Badge tone matches status severity
- [ ] Error states show error badge
- [ ] Unconfigured states show info badge

---

## 8. Migration from Custom CSS

### 8.1 Before (Custom CSS)

```tsx
<div className="occ-tile">
  <h2>{title}</h2>
  <span className="occ-status-healthy">Healthy</span>
</div>
```

```css
.occ-status-healthy {
  color: var(--occ-status-healthy-text);
  background-color: var(--occ-status-healthy-bg);
  padding: 4px 8px;
  border-radius: 4px;
}
```

### 8.2 After (Polaris Badge)

```tsx
<Card>
  <BlockStack gap="400">
    <InlineStack align="space-between">
      <Text variant="headingMd" as="h2">{title}</Text>
      <Badge tone="success">Healthy</Badge>
    </InlineStack>
  </BlockStack>
</Card>
```

**Benefits:**
- ✅ Consistent with Shopify design system
- ✅ Accessibility built-in
- ✅ Responsive by default
- ✅ Less custom CSS to maintain
- ✅ Automatic color contrast compliance

---

## 9. References

- **Polaris Badge:** https://polaris.shopify.com/components/feedback-indicators/badge
- **Dashboard Tiles:** `docs/design/dashboard-tiles.md`
- **Design Tokens:** `docs/design/design-tokens.md`
- **Accessibility:** `docs/design/accessibility.md`
- **Current Implementation:** `app/components/tiles/TileCard.tsx`

