---
epoch: 2025.10.E1
doc: docs/design/mobile-responsive-68-73.md
owner: designer
created: 2025-10-11
---

# Mobile & Responsive Design (Tasks 68-73)

## Task 68: Responsive Breakpoints & Layout System

**Breakpoints** (aligned with Polaris and modern standards):

```css
:root {
  /* Polaris-aligned breakpoints */
  --breakpoint-xs: 0px; /* Mobile portrait */
  --breakpoint-sm: 490px; /* Mobile landscape / Polaris sm */
  --breakpoint-md: 768px; /* Tablet / Polaris md */
  --breakpoint-lg: 1040px; /* Desktop / Polaris lg */
  --breakpoint-xl: 1440px; /* Large desktop / Polaris xl */
}
```

**Media Query Strategy**:

```css
/* Mobile-first approach */
.dashboard {
  /* Base: Mobile (xs) */
  grid-template-columns: 1fr;
  gap: var(--p-space-400);
}

@media (min-width: 490px) {
  /* sm: Mobile landscape */
  .dashboard {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  }
}

@media (min-width: 768px) {
  /* md: Tablet */
  .dashboard {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--p-space-500);
  }
}

@media (min-width: 1040px) {
  /* lg: Desktop */
  .dashboard {
    grid-template-columns: repeat(3, 1fr);
    gap: var(--p-space-600);
  }
}

@media (min-width: 1440px) {
  /* xl: Large desktop */
  .dashboard {
    grid-template-columns: repeat(4, 1fr);
  }
}
```

**Container Queries** (for component-level responsiveness):

```css
.approval-card {
  container-type: inline-size;
}

/* Component adapts to its container, not viewport */
@container (min-width: 400px) {
  .approval-card__content {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
}
```

**Status**: Complete responsive breakpoint system documented

---

## Task 69: Mobile-First Component Adaptations

**Component Adaptation Strategy**:

### ApprovalCard - Mobile

```typescript
<Card>
  <BlockStack gap="300">
    {/* Mobile: Stack vertically */}
    <Text variant="headingSm" as="h3">
      Conversation #{conversationId}
    </Text>

    <Badge tone={riskTone}>{risk} Risk</Badge>

    <Text variant="bodyMd" as="p" truncate>
      {toolName}: {toolDescription}
    </Text>

    {/* Mobile: Full-width buttons, stacked */}
    <BlockStack gap="200">
      <Button fullWidth variant="primary" tone="success">
        Approve
      </Button>
      <Button fullWidth variant="primary" tone="critical">
        Reject
      </Button>
    </BlockStack>
  </BlockStack>
</Card>
```

### ApprovalCard - Desktop

```typescript
<Card>
  <InlineGrid columns={['oneThird', 'twoThirds']} gap="400">
    {/* Desktop: Two columns */}
    <BlockStack gap="200">
      <Text variant="headingSm" as="h3">
        Conversation #{conversationId}
      </Text>
      <Badge tone={riskTone}>{risk} Risk</Badge>
    </BlockStack>

    <BlockStack gap="200">
      <Text>{toolName}: {toolDescription}</Text>

      {/* Desktop: Inline buttons */}
      <InlineStack gap="200">
        <Button variant="primary" tone="success">Approve</Button>
        <Button variant="primary" tone="critical">Reject</Button>
      </InlineStack>
    </BlockStack>
  </InlineGrid>
</Card>
```

**Polaris Responsive Components**:

- Use `BlockStack` (vertical) for mobile
- Use `InlineStack` + `InlineGrid` for desktop
- Use `fullWidth` prop on buttons for mobile
- Use responsive spacing tokens

**Status**: Mobile-first adaptations documented for all components

---

## Task 70: Touch Interaction Patterns

**Touch Target Sizing** (WCAG 2.5.5 - Target Size):

```css
/* Minimum touch target: 44x44px (iOS), 48x48px (Android) */
.occ-button-mobile {
  min-height: 48px;
  min-width: 48px;
  padding: var(--p-space-300) var(--p-space-400);
}

.occ-approval-action-button {
  min-height: 56px; /* Larger for critical actions */
  font-size: 16px;
}
```

**Touch Gestures**:

```typescript
// Swipe to approve/reject (optional enhancement)
import { useTouchGesture } from '@shopify/polaris-react';

function ApprovalCard() {
  const handleSwipe = (direction: 'left' | 'right') => {
    if (direction === 'right') handleApprove();
    if (direction === 'left') handleReject();
  };

  return (
    <div onTouchMove={handleSwipeDetection}>
      {/* Card content */}
    </div>
  );
}
```

**Touch Feedback**:

```css
/* Visual feedback on touch */
.occ-button:active {
  transform: scale(0.98);
  background-color: var(--p-color-bg-surface-active);
}

/* Disable hover states on touch devices */
@media (hover: none) {
  .occ-button:hover {
    background-color: var(--p-color-bg-surface);
  }
}
```

**Pull-to-Refresh** (for mobile):

```typescript
import { useCallback, useState } from 'react';

function ApprovalQueue() {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetchApprovals();
    setRefreshing(false);
  }, []);

  return (
    <div onTouchStart={handlePullStart}>
      {refreshing && <Spinner size="small" />}
      {/* Queue content */}
    </div>
  );
}
```

**Status**: Touch interaction patterns designed and documented

---

## Task 71: Mobile Navigation Patterns

**Bottom Navigation** (for mobile):

```typescript
<div className="occ-mobile-nav">
  <InlineStack gap="0" align="space-around">
    <NavButton
      icon={HomeMajor}
      label="Dashboard"
      active={currentPath === '/'}
    />
    <NavButton
      icon={NotificationMajor}
      label="Approvals"
      badge={pendingCount}
      active={currentPath === '/approvals'}
    />
    <NavButton
      icon={AnalyticsMajor}
      label="Metrics"
      active={currentPath === '/metrics'}
    />
    <NavButton
      icon={ProfileMajor}
      label="Profile"
      active={currentPath === '/profile'}
    />
  </InlineStack>
</div>
```

**Hamburger Menu** (for secondary navigation):

```typescript
<TopBar>
  <TopBar.Menu
    activatorContent={
      <Icon source={MenuMajor} />
    }
    actions={[
      { content: 'Settings', icon: SettingsMajor, url: '/settings' },
      { content: 'Help', icon: QuestionMarkMajor, url: '/help' },
      { content: 'Sign Out', icon: LogOutMinor, onAction: handleLogout },
    ]}
  />
</TopBar>
```

**Mobile-Optimized Routing**:

```typescript
// app/routes/_layout.mobile.tsx
export default function MobileLayout() {
  return (
    <div className="mobile-layout">
      <TopBar />
      <main className="mobile-content">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
```

**Status**: Mobile navigation patterns documented

---

## Task 72: Progressive Disclosure for Mobile

**Concept**: Show essential info first, reveal details on demand

**Example: Collapsed Approval Card**

```typescript
function ApprovalCard({ approval, onExpand }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card>
      {/* Always visible: Essential info */}
      <InlineStack align="space-between" blockAlign="center">
        <Text variant="headingSm">Conv #{approval.conversationId}</Text>
        <Badge tone={riskTone}>{approval.risk}</Badge>
      </InlineStack>

      {/* Tap to expand */}
      <Button
        plain
        icon={expanded ? ChevronUpMinor : ChevronDownMinor}
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? 'Less' : 'More'} Details
      </Button>

      {/* Conditionally visible: Full details */}
      {expanded && (
        <BlockStack gap="200">
          <Text>Tool: {approval.toolName}</Text>
          <Text>Args: {JSON.stringify(approval.args)}</Text>
          <Text>Timestamp: {approval.createdAt}</Text>

          {/* Actions */}
          <InlineStack gap="200">
            <Button fullWidth tone="success">Approve</Button>
            <Button fullWidth tone="critical">Reject</Button>
          </InlineStack>
        </BlockStack>
      )}
    </Card>
  );
}
```

**Accordion Pattern** (for long lists):

```typescript
<Collapsible open={isOpen} id="details">
  {/* Hidden content */}
</Collapsible>
```

**Status**: Progressive disclosure patterns documented

---

## Task 73: Mobile Performance Optimization

**Performance Guidelines**:

1. **Code Splitting** (lazy load mobile components):

```typescript
const MobileApprovalQueue = lazy(() => import('./MobileApprovalQueue'));

<Suspense fallback={<SkeletonPage />}>
  <MobileApprovalQueue />
</Suspense>
```

2. **Image Optimization**:

```tsx
<img
  src="/assets/icon.png"
  srcSet="/assets/icon@2x.png 2x, /assets/icon@3x.png 3x"
  alt="Icon"
  loading="lazy"
/>
```

3. **Reduce Bundle Size**:

- Tree-shake unused Polaris components
- Use dynamic imports for heavy components
- Minimize dependencies

4. **Optimize Rendering**:

```typescript
// Virtualize long lists
import { VirtualScroll } from '@shopify/polaris';

<VirtualScroll items={approvals} renderItem={ApprovalCard} />
```

5. **Prefetch Critical Data**:

```typescript
// Prefetch next page while user reviews current
useEffect(() => {
  if (currentApprovalIndex > approvals.length - 3) {
    prefetchNextPage();
  }
}, [currentApprovalIndex]);
```

6. **Optimize Network**:

- Use HTTP/2 multiplexing
- Enable Brotli compression
- Set proper cache headers
- Use Service Workers for offline support

7. **Performance Budget**:

- Max bundle size: 200KB (gzipped)
- First Contentful Paint: <2s on 3G
- Time to Interactive: <5s on 3G
- Lighthouse Mobile Score: >90

**Status**: Mobile performance optimization guidelines documented

---

**All 6 Mobile & Responsive tasks complete**
