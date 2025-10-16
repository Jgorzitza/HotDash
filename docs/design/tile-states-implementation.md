# Tile States Implementation Guide

**File:** `docs/design/tile-states-implementation.md`  
**Owner:** Designer  
**Version:** 1.0  
**Date:** 2025-10-15  
**Status:** Complete  
**Purpose:** Complete implementation guide for all tile states (empty, error, loading, accessibility)

---

## 1. Overview

Every tile must handle 4 primary states:
1. **Loading** - Data is being fetched
2. **Success** - Data loaded successfully
3. **Error** - Data fetch failed
4. **Empty** - No data available

---

## 2. Loading States (Skeletons)

### 2.1 Ops Pulse Tile Skeleton

```tsx
function OpsPulseSkeleton() {
  return (
    <Card>
      <BlockStack gap="400">
        <InlineStack align="space-between">
          <SkeletonDisplayText size="small" />
          <SkeletonBodyText lines={1} />
        </InlineStack>
        <SkeletonBodyText lines={1} />
        <InlineStack gap="400">
          <BlockStack gap="200">
            <SkeletonDisplayText size="medium" />
            <SkeletonBodyText lines={1} />
          </BlockStack>
          <BlockStack gap="200">
            <SkeletonDisplayText size="medium" />
            <SkeletonBodyText lines={1} />
          </BlockStack>
        </InlineStack>
      </BlockStack>
    </Card>
  );
}
```

### 2.2 Sales Pulse Tile Skeleton

```tsx
function SalesPulseSkeleton() {
  return (
    <Card>
      <BlockStack gap="400">
        <InlineStack align="space-between">
          <SkeletonDisplayText size="small" />
          <SkeletonBodyText lines={1} />
        </InlineStack>
        <SkeletonDisplayText size="large" />
        <SkeletonBodyText lines={3} />
      </BlockStack>
    </Card>
  );
}
```

### 2.3 List Tile Skeleton (Inventory, CX, Fulfillment)

```tsx
function ListTileSkeleton() {
  return (
    <Card>
      <BlockStack gap="400">
        <InlineStack align="space-between">
          <SkeletonDisplayText size="small" />
          <SkeletonBodyText lines={1} />
        </InlineStack>
        <BlockStack gap="200">
          {[1, 2, 3].map(i => (
            <SkeletonBodyText key={i} lines={2} />
          ))}
        </BlockStack>
      </BlockStack>
    </Card>
  );
}
```

### 2.4 Approval Card Skeleton

```tsx
function ApprovalCardSkeleton() {
  return (
    <Card>
      <BlockStack gap="300">
        <InlineStack align="space-between">
          <SkeletonDisplayText size="small" />
          <SkeletonBodyText lines={1} />
        </InlineStack>
        <SkeletonBodyText lines={2} />
        <InlineStack gap="200">
          <SkeletonBodyText lines={1} />
          <SkeletonBodyText lines={1} />
        </InlineStack>
      </BlockStack>
    </Card>
  );
}
```

---

## 3. Empty States

### 3.1 Ops Pulse - No Data

```tsx
<Card>
  <BlockStack gap="400">
    <InlineStack align="space-between">
      <Text variant="headingMd">Ops Pulse</Text>
      <Badge tone="info">No data</Badge>
    </InlineStack>
    <Text variant="bodySm" tone="subdued">
      No activation data yet.
    </Text>
  </BlockStack>
</Card>
```

### 3.2 Sales Pulse - No Orders

```tsx
<Card>
  <BlockStack gap="400">
    <InlineStack align="space-between">
      <Text variant="headingMd">Sales Pulse</Text>
      <Badge tone="info">No data</Badge>
    </InlineStack>
    <EmptyState
      heading="No orders yet"
      image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
    >
      <p>Orders will appear here when customers make purchases.</p>
    </EmptyState>
  </BlockStack>
</Card>
```

### 3.3 Fulfillment Health - All Clear

```tsx
<Card>
  <BlockStack gap="400">
    <InlineStack align="space-between">
      <Text variant="headingMd">Fulfillment Health</Text>
      <Badge tone="success">Healthy</Badge>
    </InlineStack>
    <InlineStack gap="200">
      <Icon source={CheckCircleIcon} tone="success" />
      <Text variant="bodySm">All recent orders are on track.</Text>
    </InlineStack>
  </BlockStack>
</Card>
```

### 3.4 Inventory Heatmap - No Alerts

```tsx
<Card>
  <BlockStack gap="400">
    <InlineStack align="space-between">
      <Text variant="headingMd">Inventory Heatmap</Text>
      <Badge tone="success">Healthy</Badge>
    </InlineStack>
    <InlineStack gap="200">
      <Icon source={CheckCircleIcon} tone="success" />
      <Text variant="bodySm">No low stock alerts right now.</Text>
    </InlineStack>
  </BlockStack>
</Card>
```

### 3.5 CX Escalations - No Issues

```tsx
<Card>
  <BlockStack gap="400">
    <InlineStack align="space-between">
      <Text variant="headingMd">CX Escalations</Text>
      <Badge tone="success">Healthy</Badge>
    </InlineStack>
    <InlineStack gap="200">
      <Icon source={CheckCircleIcon} tone="success" />
      <Text variant="bodySm">No SLA breaches detected.</Text>
    </InlineStack>
  </BlockStack>
</Card>
```

### 3.6 Approvals Queue - All Clear

```tsx
<EmptyState
  heading="All clear!"
  image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
>
  <p>No pending approvals right now.</p>
</EmptyState>
```

---

## 4. Error States

### 4.1 Network Error

```tsx
<Card>
  <BlockStack gap="400">
    <InlineStack align="space-between">
      <Text variant="headingMd">Sales Pulse</Text>
      <Badge tone="critical">Error</Badge>
    </InlineStack>
    <Banner tone="critical" onDismiss={handleDismiss}>
      <p>Unable to connect. Check your network connection and try again.</p>
    </Banner>
    <Button onClick={handleRetry}>Retry</Button>
  </BlockStack>
</Card>
```

### 4.2 Authentication Error

```tsx
<Card>
  <BlockStack gap="400">
    <InlineStack align="space-between">
      <Text variant="headingMd">Sales Pulse</Text>
      <Badge tone="critical">Error</Badge>
    </InlineStack>
    <Banner tone="warning">
      <p>Authentication required. Reconnect Shopify to continue.</p>
    </Banner>
    <Button variant="primary" onClick={handleReconnect}>
      Reconnect Shopify
    </Button>
  </BlockStack>
</Card>
```

### 4.3 API Error

```tsx
<Card>
  <BlockStack gap="400">
    <InlineStack align="space-between">
      <Text variant="headingMd">CX Escalations</Text>
      <Badge tone="critical">Error</Badge>
    </InlineStack>
    <Banner tone="critical">
      <p>Unable to load conversations. Check Chatwoot connection.</p>
    </Banner>
    <InlineStack gap="200">
      <Button onClick={handleRetry}>Retry</Button>
      <Button variant="plain" onClick={handleSupport}>
        Contact support
      </Button>
    </InlineStack>
  </BlockStack>
</Card>
```

### 4.4 Unconfigured State

```tsx
<Card>
  <BlockStack gap="400">
    <InlineStack align="space-between">
      <Text variant="headingMd">SEO Content</Text>
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

---

## 5. Accessibility Annotations

### 5.1 Tile Container

```tsx
<div 
  role="region"
  aria-labelledby="tile-heading-sales"
  aria-describedby="tile-status-sales"
  tabIndex={0}
>
  <Card>
    <BlockStack gap="400">
      <InlineStack align="space-between">
        <Text variant="headingMd" as="h2" id="tile-heading-sales">
          Sales Pulse
        </Text>
        <Badge tone="success">Healthy</Badge>
      </InlineStack>
      
      <span id="tile-status-sales" className="sr-only">
        Status: Healthy. Last refreshed 2 minutes ago. Source: fresh data.
      </span>
      
      {/* Content */}
    </BlockStack>
  </Card>
</div>
```

### 5.2 Loading State

```tsx
<div aria-busy="true" aria-label="Loading sales data">
  <SalesPulseSkeleton />
</div>

{/* Live region for screen readers */}
<div aria-live="polite" aria-atomic="true" className="sr-only">
  {isLoading ? 'Loading sales data...' : 'Sales data loaded'}
</div>
```

### 5.3 Error State

```tsx
<div role="alert" aria-live="assertive">
  <Banner tone="critical">
    <p>Unable to connect. Check your network connection and try again.</p>
  </Banner>
</div>
```

### 5.4 Empty State

```tsx
<div role="status" aria-label="No data available">
  <EmptyState heading="No orders yet">
    <p>Orders will appear here when customers make purchases.</p>
  </EmptyState>
</div>
```

### 5.5 Interactive Elements

```tsx
{/* Button with clear label */}
<Button 
  onClick={handleRetry}
  aria-label="Retry loading sales data"
>
  Retry
</Button>

{/* Link with context */}
<Link 
  url="/sales/details"
  aria-label="View detailed sales report"
>
  View details
</Link>
```

---

## 6. Complete Tile Implementation Pattern

```tsx
interface TileProps<T> {
  title: string;
  tile: TileState<T>;
  render: (data: T) => ReactNode;
  onRetry?: () => void;
  onSetup?: () => void;
}

interface TileState<T> {
  status: 'loading' | 'ok' | 'error' | 'unconfigured';
  data?: T;
  fact?: TileFact;
  error?: string;
}

function TileCard<T>({ title, tile, render, onRetry, onSetup }: TileProps<T>) {
  // Loading state
  if (tile.status === 'loading') {
    return (
      <div aria-busy="true" aria-label={`Loading ${title}`}>
        <TileSkeleton />
      </div>
    );
  }
  
  // Error state
  if (tile.status === 'error') {
    return (
      <Card>
        <BlockStack gap="400">
          <InlineStack align="space-between">
            <Text variant="headingMd">{title}</Text>
            <Badge tone="critical">Error</Badge>
          </InlineStack>
          <Banner tone="critical" role="alert">
            <p>{tile.error || 'Unable to load data.'}</p>
          </Banner>
          {onRetry && <Button onClick={onRetry}>Retry</Button>}
        </BlockStack>
      </Card>
    );
  }
  
  // Unconfigured state
  if (tile.status === 'unconfigured') {
    return (
      <Card>
        <BlockStack gap="400">
          <InlineStack align="space-between">
            <Text variant="headingMd">{title}</Text>
            <Badge tone="info">Configuration required</Badge>
          </InlineStack>
          <EmptyState
            heading="Setup required"
            action={onSetup ? { content: 'Set up', onAction: onSetup } : undefined}
          >
            <p>Connect integration to enable this tile.</p>
          </EmptyState>
        </BlockStack>
      </Card>
    );
  }
  
  // Success state with data
  if (tile.data) {
    return (
      <div 
        role="region"
        aria-labelledby={`tile-heading-${title}`}
        aria-describedby={`tile-status-${title}`}
      >
        <Card>
          <BlockStack gap="400">
            <InlineStack align="space-between">
              <Text variant="headingMd" as="h2" id={`tile-heading-${title}`}>
                {title}
              </Text>
              <Badge tone="success">Healthy</Badge>
            </InlineStack>
            
            {tile.fact && (
              <Text variant="bodySm" tone="subdued">
                Last refreshed {formatTime(tile.fact.createdAt)}
              </Text>
            )}
            
            <span id={`tile-status-${title}`} className="sr-only">
              Status: Healthy. Last refreshed {formatTime(tile.fact?.createdAt)}.
            </span>
            
            {render(tile.data)}
          </BlockStack>
        </Card>
      </div>
    );
  }
  
  // Empty state (no data)
  return (
    <Card>
      <BlockStack gap="400">
        <InlineStack align="space-between">
          <Text variant="headingMd">{title}</Text>
          <Badge tone="info">No data</Badge>
        </InlineStack>
        <Text variant="bodySm" tone="subdued">
          No data available right now.
        </Text>
      </BlockStack>
    </Card>
  );
}
```

---

## 7. Testing Checklist

### 7.1 Loading States
- [ ] Skeleton matches final content structure
- [ ] No layout shift when content loads
- [ ] `aria-busy="true"` present
- [ ] Screen reader announces loading

### 7.2 Empty States
- [ ] Friendly, contextual messages
- [ ] Success empty states use success tone
- [ ] No data empty states use info tone
- [ ] Icons present where appropriate

### 7.3 Error States
- [ ] Error messages clear and actionable
- [ ] Retry button present (if retryable)
- [ ] `role="alert"` on error messages
- [ ] Screen reader announces errors

### 7.4 Accessibility
- [ ] All tiles have `role="region"`
- [ ] Headings have unique IDs
- [ ] Status announced to screen readers
- [ ] Keyboard navigation works
- [ ] Focus indicators visible

---

## 8. References

- **Loading States:** `docs/design/loading-states.md`
- **Error States:** `docs/design/error-states.md`
- **Accessibility:** `docs/design/accessibility.md`
- **Dashboard Tiles:** `docs/design/dashboard-tiles.md`
- **Polaris EmptyState:** https://polaris.shopify.com/components/layout-and-structure/empty-state
- **Polaris Skeleton:** https://polaris.shopify.com/components/feedback-indicators/skeleton-page

