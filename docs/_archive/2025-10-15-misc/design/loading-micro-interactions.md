---
epoch: 2025.10.E1
doc: docs/design/loading-micro-interactions.md
owner: designer
created: 2025-10-12
task: 1H
---

# Task 1H: Loading State Micro-interactions

## Purpose
Design skeleton loaders, animations, and progressive disclosure patterns for all loading states.

## Skeleton Loaders

### Page Skeleton (Approval Queue)
```typescript
import { SkeletonPage, Layout, Card, SkeletonBodyText } from '@shopify/polaris';

<SkeletonPage title="Loading approvals...">
  <Layout>
    <Layout.Section>
      <Card>
        <SkeletonBodyText lines={3} />
      </Card>
      <Card>
        <SkeletonBodyText lines={3} />
      </Card>
      <Card>
        <SkeletonBodyText lines={3} />
      </Card>
    </Layout.Section>
  </Layout>
</SkeletonPage>
```

**Visual**: Gray placeholder rectangles with shimmer animation
**Duration**: Until data loads (< 2s ideal)

### Approval Card Skeleton
```typescript
<Card>
  <BlockStack gap="300">
    {/* Header skeleton */}
    <InlineStack align="space-between">
      <SkeletonDisplayText size="small" />
      <SkeletonDisplayText size="small" />
    </InlineStack>
    
    {/* Body skeleton */}
    <SkeletonBodyText lines={2} />
    
    {/* Button skeleton */}
    <InlineStack gap="200">
      <div style={{ width: '100px', height: '36px', background: '#E3E5E7', borderRadius: '6px' }} />
      <div style={{ width: '100px', height: '36px', background: '#E3E5E7', borderRadius: '6px' }} />
    </InlineStack>
  </BlockStack>
</Card>
```

### Tile Skeleton (Dashboard)
```typescript
<Card>
  <BlockStack gap="300">
    <SkeletonDisplayText size="small" />
    <SkeletonBodyText lines={1} />
    <SkeletonDisplayText size="large" />
  </BlockStack>
</Card>
```

## Loading Animations

### Button Loading
```typescript
<Button
  variant="primary"
  tone="success"
  loading={isApproving}
  disabled={isApproving}
>
  {isApproving ? 'Approving...' : 'Approve'}
</Button>
```

**Built-in Polaris spinner**: No custom animation needed

### Inline Loading (Small Spinner)
```typescript
<InlineStack gap="200" blockAlign="center">
  <Spinner size="small" />
  <Text>Loading approvals...</Text>
</InlineStack>
```

### Progress Bar (Determinate)
```typescript
<ProgressBar progress={uploadProgress} />
<Text variant="bodySm" tone="subdued">
  {uploadProgress}% complete
</Text>
```

**Use when**: Progress is measurable (file upload, batch operation)

### Indeterminate Loader (Unknown Duration)
```typescript
<ProgressBar progress={75} tone="highlight" />
```

**Use when**: Duration unknown (API call, processing)

## Progressive Disclosure

### Load More Pattern
```typescript
<BlockStack gap="400">
  {/* Show first 10 approvals */}
  {approvals.slice(0, visibleCount).map(approval => (
    <ApprovalCard key={approval.id} approval={approval} />
  ))}
  
  {/* Load more button */}
  {visibleCount < approvals.length && (
    <Button
      onClick={() => setVisibleCount(v => v + 10)}
      loading={isLoadingMore}
    >
      Load more ({approvals.length - visibleCount} remaining)
    </Button>
  )}
</BlockStack>
```

**Pattern**: Show 10, load 10 more on demand

### Infinite Scroll
```typescript
import { useIntersectionObserver } from '@shopify/react-hooks';

function ApprovalQueue() {
  const [page, setPage] = useState(1);
  const sentinelRef = useRef(null);
  
  useIntersectionObserver({
    target: sentinelRef,
    onIntersect: () => {
      if (!isLoading && hasMore) {
        loadNextPage();
      }
    },
  });
  
  return (
    <>
      {approvals.map(a => <ApprovalCard key={a.id} approval={a} />)}
      
      {/* Sentinel element for infinite scroll */}
      <div ref={sentinelRef}>
        {isLoading && <Spinner />}
      </div>
    </>
  );
}
```

**Pattern**: Auto-load when scroll near bottom

### Lazy Load Images
```html
<img 
  src={imageUrl} 
  loading="lazy" 
  alt={alt}
  onLoad={() => setImageLoaded(true)}
/>

{!imageLoaded && (
  <div className="image-placeholder">
    <Spinner size="small" />
  </div>
)}
```

## Optimistic Updates

### Instant Feedback (Before API)
```typescript
const handleApprove = async (id: string) => {
  // 1. Update UI immediately (optimistic)
  const optimisticApproval = { ...approval, status: 'approved' };
  setApprovals(prevApprovals =>
    prevApprovals.map(a => a.id === id ? optimisticApproval : a)
  );
  
  try {
    // 2. Send to API
    await fetch(`/approvals/${id}/approve`, { method: 'POST' });
    
    // 3. Success - remove from queue after animation
    setTimeout(() => {
      setApprovals(prevApprovals =>
        prevApprovals.filter(a => a.id !== id)
      );
    }, 300);
  } catch (error) {
    // 4. Revert on error
    setApprovals(prevApprovals); // Restore previous state
    showError('Failed to approve');
  }
};
```

**Benefit**: Feels instant, no waiting for API

## Micro-interactions

### Hover State
```css
.approval-card {
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}

.approval-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}
```

### Focus State
```css
.approval-card:focus-visible {
  outline: 2px solid var(--p-color-border-focus);
  outline-offset: 2px;
}
```

### Click/Tap Feedback
```css
.approval-button:active {
  transform: scale(0.98);
}
```

### Slide In Animation (New Approval)
```css
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.new-approval {
  animation: slideIn 0.3s ease-out;
}
```

### Fade Out Animation (Removed Approval)
```css
@keyframes fadeOut {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.95);
  }
}

.removing-approval {
  animation: fadeOut 0.2s ease-in forwards;
}
```

### Pulse Animation (New Badge)
```css
@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.8;
  }
}

.new-badge {
  animation: pulse 1s ease infinite;
}
```

## Loading State Copy

### Page Load
```typescript
<SkeletonPage title="Starting engines..." />  // Hot Rodan flavor
// OR
<SkeletonPage title="Loading approvals..." />  // Neutral
```

### Action Load
```typescript
<Button loading>Approving...</Button>
<Button loading>Rejecting...</Button>
<Button loading>Loading...</Button>
```

### Background Refresh
```typescript
<InlineStack gap="200" blockAlign="center">
  <Spinner size="small" />
  <Text variant="bodySm" tone="subdued">Checking for updates...</Text>
</InlineStack>
```

## Performance Considerations

### Skeleton vs Spinner

**Use Skeleton When**:
- Initial page load
- Known layout structure
- Loading content that takes > 1s

**Use Spinner When**:
- Action feedback (button clicks)
- Unknown content structure
- Quick loads (< 1s)

### Animation Performance
```css
/* Use transform/opacity (GPU accelerated) */
.card {
  transition: transform 0.2s ease, opacity 0.2s ease;
}

/* Avoid animating layout properties */
/* ❌ BAD: width, height, left, top */
/* ✅ GOOD: transform, opacity */
```

### Reduce Motion
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Timing Guidelines

| Action | Duration | Easing |
|--------|----------|--------|
| Hover | 0.2s | ease |
| Click/Tap | 0.1s | ease-in |
| Slide in | 0.3s | ease-out |
| Fade out | 0.2s | ease-in |
| Button loading | Infinite | - |
| Page skeleton | Until load | - |

**Rule**: Keep all animations < 0.5s

## Implementation Checklist

- [ ] Skeleton loaders for page, cards, tiles
- [ ] Button loading states (built-in Polaris)
- [ ] Inline spinners for background operations
- [ ] Progressive disclosure (load more / infinite scroll)
- [ ] Optimistic updates (approve/reject)
- [ ] Hover/focus micro-interactions
- [ ] Slide in/out animations for cards
- [ ] Respect prefers-reduced-motion
- [ ] All animations < 0.5s duration

---

**Status**: Complete loading state micro-interaction system - skeleton loaders, animations, progressive disclosure

