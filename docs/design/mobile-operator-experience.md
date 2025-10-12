---
epoch: 2025.10.E1
doc: docs/design/mobile-operator-experience.md
owner: designer
created: 2025-10-12
task: 1F
---

# Task 1F: Mobile Operator Experience

## Purpose
Design mobile-responsive approval queue and touch-optimized controls for operators on phones and tablets.

## Mobile Breakpoints

```css
/* Mobile portrait */
@media (max-width: 489px) {
  /* 1 column layout, full-width buttons */
}

/* Mobile landscape / small tablet */
@media (min-width: 490px) and (max-width: 767px) {
  /* 1-2 column layout */
}

/* Tablet */
@media (min-width: 768px) and (max-width: 1039px) {
  /* 2 column layout */
}

/* Desktop */
@media (min-width: 1040px) {
  /* 3+ column layout */
}
```

## Mobile Approval Queue

### Page Layout (Mobile)
```typescript
<Page
  title="Mission Control"
  narrowWidth  // Polaris prop for mobile
>
  <BlockStack gap="400">
    {approvals.map(approval => (
      <MobileApprovalCard key={approval.id} approval={approval} />
    ))}
  </BlockStack>
</Page>
```

### Mobile Approval Card
```typescript
<Card>
  <BlockStack gap="300">
    {/* Header - conversation ID + risk badge */}
    <InlineStack align="space-between" blockAlign="center">
      <Text variant="headingSm">Conv #{id}</Text>
      <Badge tone="critical">HIGH</Badge>
    </InlineStack>
    
    {/* Tool info */}
    <Text>Tool: send_email</Text>
    <Text variant="bodySm" tone="subdued">2 min ago</Text>
    
    {/* Full-width buttons (stacked) */}
    <BlockStack gap="200">
      <Button
        fullWidth
        variant="primary"
        tone="success"
        size="large"  // Larger for touch
      >
        Approve
      </Button>
      <Button
        fullWidth
        variant="primary"
        tone="critical"
        size="large"
      >
        Reject
      </Button>
    </BlockStack>
  </BlockStack>
</Card>
```

## Touch Optimization

### Touch Target Sizes (WCAG 2.5.5)
```css
/* Minimum 44x44px (iOS), 48x48px (Android) */
.mobile-button {
  min-height: 48px;
  min-width: 48px;
  padding: 16px 20px;
  font-size: 16px;  /* Prevents iOS zoom on focus */
}

.mobile-approve-button {
  min-height: 56px;  /* Larger for critical action */
}
```

### Touch Gestures (Optional Enhancement)
```typescript
// Swipe right = approve, swipe left = reject
<div
  onTouchStart={handleTouchStart}
  onTouchMove={handleTouchMove}
  onTouchEnd={handleTouchEnd}
>
  {/* Card content */}
</div>
```

**Note**: Buttons are primary interaction. Swipe is secondary enhancement.

### Touch Feedback
```css
.mobile-button:active {
  transform: scale(0.98);
  background-color: var(--p-color-bg-surface-active);
}
```

## Mobile Navigation

### Bottom Nav Bar (Fixed)
```typescript
<div className="mobile-bottom-nav">
  <InlineStack gap="0" align="space-around">
    <NavButton
      icon={HomeIcon}
      label="Dashboard"
      active={path === '/'}
    />
    <NavButton
      icon={ApprovalIcon}
      label="Approvals"
      badge={pendingCount}
      active={path === '/approvals'}
    />
    <NavButton
      icon={MetricsIcon}
      label="Metrics"
      active={path === '/metrics'}
    />
  </InlineStack>
</div>
```

```css
.mobile-bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--p-color-bg-surface);
  border-top: 1px solid var(--p-color-border-subdued);
  padding: 8px 0;
  z-index: 100;
  /* Safe area for iOS notch */
  padding-bottom: env(safe-area-inset-bottom);
}
```

## Mobile Tile Views

### Dashboard Tiles (Mobile)
```typescript
// Desktop: 3-4 column grid
// Mobile: 1 column, stacked

<div className="dashboard-grid">
  <TileCard title="Sales Pulse" />
  <TileCard title="CX Escalations" />
  <TileCard title="Inventory" />
</div>
```

```css
.dashboard-grid {
  display: grid;
  gap: var(--p-space-400);
  
  /* Mobile: 1 column */
  grid-template-columns: 1fr;
}

@media (min-width: 768px) {
  .dashboard-grid {
    /* Tablet: 2 columns */
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1040px) {
  .dashboard-grid {
    /* Desktop: 3 columns */
    grid-template-columns: repeat(3, 1fr);
  }
}
```

## Mobile-Specific Features

### Pull-to-Refresh
```typescript
const [refreshing, setRefreshing] = useState(false);

<div
  onTouchStart={handlePullStart}
  onTouchMove={handlePullMove}
  onTouchEnd={handlePullEnd}
>
  {refreshing && (
    <div className="pull-refresh-indicator">
      <Spinner size="small" />
    </div>
  )}
  {/* Content */}
</div>
```

### Sticky Header (Mobile)
```css
.mobile-page-header {
  position: sticky;
  top: 0;
  background: var(--p-color-bg-surface);
  z-index: 10;
  border-bottom: 1px solid var(--p-color-border-subdued);
  padding: 12px 16px;
}
```

### Mobile Empty State
```typescript
<EmptyState
  heading="All clear!"
  image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
>
  <p>No pending approvals.</p>
  <Button onClick={refreshPage}>Refresh</Button>
</EmptyState>
```

## Responsive Patterns

### Hide on Mobile
```css
.desktop-only {
  display: none;
}

@media (min-width: 768px) {
  .desktop-only {
    display: block;
  }
}
```

### Show on Mobile Only
```css
.mobile-only {
  display: block;
}

@media (min-width: 768px) {
  .mobile-only {
    display: none;
  }
}
```

### Responsive Text
```typescript
// Desktop: "Conversation #101"
// Mobile: "Conv #101"

<Text variant="headingMd">
  <span className="desktop-only">Conversation</span>
  <span className="mobile-only">Conv</span>
  {` #${id}`}
</Text>
```

## Mobile Performance

### Lazy Load Images
```html
<img src={imageUrl} loading="lazy" alt={alt} />
```

### Reduce Bundle Size
```typescript
// Code split mobile components
const MobileApprovalQueue = lazy(() => import('./MobileApprovalQueue'));
```

### Optimize for 3G
- Minimize API calls
- Use pagination (10 items/page on mobile)
- Compress images
- Lazy load below fold

## Testing Checklist

- [ ] Test on iPhone (Safari)
- [ ] Test on Android (Chrome)
- [ ] Test in landscape orientation
- [ ] Test with iOS notch (safe areas)
- [ ] Test with Android navigation bar
- [ ] Verify touch targets ≥ 48px
- [ ] Test pull-to-refresh
- [ ] Test bottom nav sticky behavior
- [ ] Verify font size ≥ 16px (prevents zoom)

---

**Status**: Mobile operator experience designed - touch-optimized, responsive, performant

