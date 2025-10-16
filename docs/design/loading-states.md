# Loading States and Skeletons

**File:** `docs/design/loading-states.md`  
**Owner:** Designer  
**Version:** 1.0  
**Date:** 2025-10-15  
**Status:** Complete

---

## 1. Purpose

Define loading states, skeleton screens, and loading animations for all components in the Hot Rod AN Control Center, ensuring perceived performance and user confidence.

---

## 2. Loading State Principles

### 2.1 Design Principles

1. **Show Progress** - Users should know something is happening
2. **Preserve Layout** - Prevent layout shifts during loading
3. **Match Structure** - Skeleton should match final content structure
4. **Subtle Animation** - Gentle pulse, not distracting
5. **Accessible** - Announce loading state to screen readers

### 2.2 When to Use Each Pattern

| Pattern | Use Case | Duration |
|---------|----------|----------|
| **Skeleton Screen** | Initial page/component load | > 1 second |
| **Spinner** | Button actions, refresh | < 3 seconds |
| **Progress Bar** | File uploads, long operations | > 3 seconds |
| **Inline Spinner** | Small updates, background refresh | Any duration |

---

## 3. Skeleton Screens

### 3.1 Tile Skeleton

**Structure:** Matches TileCard layout

```tsx
function TileSkeleton() {
  return (
    <div className="occ-tile occ-skeleton">
      <div className="occ-skeleton-header">
        <div className="occ-skeleton-text occ-skeleton-heading" />
        <div className="occ-skeleton-badge" />
      </div>
      <div className="occ-skeleton-text occ-skeleton-meta" />
      <div className="occ-skeleton-content">
        <div className="occ-skeleton-text occ-skeleton-large" />
        <div className="occ-skeleton-text" />
        <div className="occ-skeleton-text" />
      </div>
    </div>
  );
}
```

**CSS:**
```css
.occ-skeleton {
  pointer-events: none;
  user-select: none;
}

.occ-skeleton-text {
  height: 1em;
  background: linear-gradient(
    90deg,
    var(--occ-bg-secondary) 0%,
    var(--occ-bg-hover) 50%,
    var(--occ-bg-secondary) 100%
  );
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.5s ease-in-out infinite;
  border-radius: 4px;
}

.occ-skeleton-heading {
  width: 60%;
  height: 1.15rem;
}

.occ-skeleton-meta {
  width: 40%;
  height: 0.85rem;
  opacity: 0.7;
}

.occ-skeleton-large {
  width: 50%;
  height: 1.5rem;
  margin-bottom: var(--occ-space-2);
}

.occ-skeleton-badge {
  width: 80px;
  height: 24px;
  background: var(--occ-bg-secondary);
  border-radius: var(--occ-radius-sm);
  animation: skeleton-shimmer 1.5s ease-in-out infinite;
}

@keyframes skeleton-shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
```

### 3.2 Dashboard Skeleton

**Full page skeleton with multiple tiles:**

```tsx
function DashboardSkeleton() {
  return (
    <div className="occ-tile-grid">
      {Array.from({ length: 6 }).map((_, i) => (
        <TileSkeleton key={i} />
      ))}
    </div>
  );
}
```

### 3.3 Approval Card Skeleton

```tsx
function ApprovalCardSkeleton() {
  return (
    <div className="occ-approval-card occ-skeleton">
      <div className="occ-skeleton-header">
        <div className="occ-skeleton-text occ-skeleton-heading" />
        <div className="occ-skeleton-badge" />
      </div>
      <div className="occ-skeleton-text occ-skeleton-meta" />
      <div className="occ-skeleton-content">
        <div className="occ-skeleton-text" />
        <div className="occ-skeleton-text" />
        <div className="occ-skeleton-text" style={{ width: '70%' }} />
      </div>
      <div className="occ-skeleton-actions">
        <div className="occ-skeleton-button" />
        <div className="occ-skeleton-button" />
      </div>
    </div>
  );
}
```

### 3.4 Modal Skeleton

```tsx
function ModalSkeleton() {
  return (
    <div className="occ-modal occ-skeleton">
      <div className="occ-skeleton-header">
        <div className="occ-skeleton-text occ-skeleton-heading" />
      </div>
      <div className="occ-skeleton-content">
        <div className="occ-skeleton-text" />
        <div className="occ-skeleton-text" />
        <div className="occ-skeleton-text" style={{ width: '80%' }} />
        <div className="occ-skeleton-divider" />
        <div className="occ-skeleton-text" />
        <div className="occ-skeleton-text" />
      </div>
      <div className="occ-skeleton-footer">
        <div className="occ-skeleton-button" />
        <div className="occ-skeleton-button" />
      </div>
    </div>
  );
}
```

---

## 4. Spinner Patterns

### 4.1 Button Loading Spinner

**Polaris Button with loading prop:**

```tsx
<Button loading={isLoading} onClick={handleAction}>
  Approve
</Button>
```

**Custom implementation:**
```tsx
function LoadingButton({ loading, children, ...props }) {
  return (
    <button className="occ-button" disabled={loading} {...props}>
      {loading && <span className="occ-spinner occ-spinner-sm" />}
      <span style={{ opacity: loading ? 0.7 : 1 }}>{children}</span>
    </button>
  );
}
```

**CSS:**
```css
.occ-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spinner-rotate 0.6s linear infinite;
}

.occ-spinner-sm {
  width: 14px;
  height: 14px;
  border-width: 2px;
}

.occ-spinner-md {
  width: 20px;
  height: 20px;
  border-width: 2px;
}

.occ-spinner-lg {
  width: 32px;
  height: 32px;
  border-width: 3px;
}

@keyframes spinner-rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
```

### 4.2 Inline Refresh Spinner

**Small spinner in tile header during refresh:**

```tsx
function TileCard({ title, tile, isRefreshing }) {
  return (
    <div className="occ-tile">
      <div className="occ-tile-header">
        <h2>{title}</h2>
        {isRefreshing && <span className="occ-spinner occ-spinner-sm" />}
        <span className={statusClass}>{statusLabel}</span>
      </div>
      {/* Content */}
    </div>
  );
}
```

### 4.3 Centered Page Spinner

**Full page loading:**

```tsx
function PageSpinner() {
  return (
    <div className="occ-page-spinner">
      <span className="occ-spinner occ-spinner-lg" />
      <p>Loading...</p>
    </div>
  );
}
```

**CSS:**
```css
.occ-page-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: var(--occ-space-4);
  color: var(--occ-text-secondary);
}
```

---

## 5. Progress Indicators

### 5.1 Linear Progress Bar

**For file uploads, long operations:**

```tsx
function ProgressBar({ progress, label }) {
  return (
    <div className="occ-progress-container">
      {label && <p className="occ-progress-label">{label}</p>}
      <div className="occ-progress-bar">
        <div 
          className="occ-progress-fill" 
          style={{ width: `${progress}%` }}
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
      <p className="occ-progress-percent">{progress}%</p>
    </div>
  );
}
```

**CSS:**
```css
.occ-progress-container {
  width: 100%;
}

.occ-progress-label {
  font-size: var(--occ-font-size-sm);
  color: var(--occ-text-secondary);
  margin-bottom: var(--occ-space-2);
}

.occ-progress-bar {
  width: 100%;
  height: 8px;
  background-color: var(--occ-bg-secondary);
  border-radius: var(--occ-radius-full);
  overflow: hidden;
}

.occ-progress-fill {
  height: 100%;
  background-color: var(--occ-button-primary-bg);
  transition: width 0.3s ease;
}

.occ-progress-percent {
  font-size: var(--occ-font-size-sm);
  color: var(--occ-text-secondary);
  margin-top: var(--occ-space-2);
  text-align: right;
}
```

### 5.2 Indeterminate Progress

**When progress is unknown:**

```css
.occ-progress-fill-indeterminate {
  width: 30%;
  animation: progress-indeterminate 1.5s ease-in-out infinite;
}

@keyframes progress-indeterminate {
  0% {
    transform: translateX(-100%);
  }
  50% {
    transform: translateX(350%);
  }
  100% {
    transform: translateX(-100%);
  }
}
```

---

## 6. Stale Data Indicators

### 6.1 Stale Data Overlay

**When showing cached data during refresh:**

```tsx
function TileCard({ tile, isRefreshing }) {
  return (
    <div className={`occ-tile ${isRefreshing ? 'occ-tile-stale' : ''}`}>
      {/* Content */}
    </div>
  );
}
```

**CSS:**
```css
.occ-tile-stale {
  opacity: 0.7;
  position: relative;
}

.occ-tile-stale::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 10px,
    rgba(0, 0, 0, 0.02) 10px,
    rgba(0, 0, 0, 0.02) 20px
  );
  pointer-events: none;
}
```

### 6.2 Stale Data Badge

```tsx
{tile.source === 'cache' && (
  <span className="occ-badge occ-badge-warning">
    Cached
  </span>
)}
```

---

## 7. Component-Specific Loading States

### 7.1 Ops Pulse Tile

**Skeleton:**
- Two-column grid skeleton
- Metric value placeholders
- Meta text placeholders

### 7.2 Sales Pulse Tile

**Skeleton:**
- Large metric value (revenue)
- List of 3 items (top SKUs)
- List of 2 items (pending fulfillment)

### 7.3 Inventory Heatmap Tile

**Skeleton:**
- List of 4-5 items
- Each item: text + number

### 7.4 CX Escalations Tile

**Skeleton:**
- List of 3 items
- Each item: text + button

### 7.5 Approvals Queue

**Skeleton:**
- 3 approval cards
- Each card: header, content, actions

---

## 8. Accessibility

### 8.1 ARIA Attributes

**Loading state:**
```html
<div aria-busy="true" aria-label="Loading dashboard">
  <TileSkeleton />
</div>
```

**Progress bar:**
```html
<div 
  role="progressbar" 
  aria-valuenow={progress}
  aria-valuemin={0}
  aria-valuemax={100}
  aria-label="Upload progress"
>
  {/* Progress bar */}
</div>
```

**Button loading:**
```html
<button aria-busy="true" disabled>
  <span className="sr-only">Loading...</span>
  <span className="occ-spinner" aria-hidden="true" />
  Approve
</button>
```

### 8.2 Screen Reader Announcements

**Live region for loading updates:**
```tsx
<div aria-live="polite" aria-atomic="true" className="sr-only">
  {isLoading ? 'Loading data...' : 'Data loaded'}
</div>
```

### 8.3 Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  .occ-skeleton-text,
  .occ-spinner,
  .occ-progress-fill-indeterminate {
    animation: none;
  }
  
  .occ-skeleton-text {
    background: var(--occ-bg-secondary);
  }
}
```

---

## 9. Performance Considerations

### 9.1 Skeleton Rendering

- Render skeletons immediately (no delay)
- Use CSS animations (GPU-accelerated)
- Avoid JavaScript-based animations
- Minimize DOM nodes in skeleton

### 9.2 Spinner Optimization

- Use CSS transforms (not position changes)
- Single spinner component, reused
- Lazy load heavy spinners

### 9.3 Progressive Loading

```tsx
function Dashboard() {
  const [tiles, setTiles] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Load critical tiles first
    loadCriticalTiles().then(data => {
      setTiles(data);
      setLoading(false);
    });
    
    // Load remaining tiles in background
    loadRemainingTiles().then(data => {
      setTiles(prev => [...prev, ...data]);
    });
  }, []);
  
  return loading ? <DashboardSkeleton /> : <TileGrid tiles={tiles} />;
}
```

---

## 10. Testing Checklist

### 10.1 Visual Testing

- [ ] Skeleton matches final content structure
- [ ] No layout shift when content loads
- [ ] Animation is smooth (60fps)
- [ ] Spinner is centered and visible
- [ ] Progress bar updates smoothly

### 10.2 Accessibility Testing

- [ ] `aria-busy` announced by screen readers
- [ ] Loading state announced
- [ ] Progress updates announced
- [ ] Reduced motion respected
- [ ] Focus management during loading

### 10.3 Performance Testing

- [ ] Skeleton renders < 100ms
- [ ] Animation doesn't block main thread
- [ ] No jank during loading
- [ ] Memory usage acceptable

---

## 11. Implementation Guidelines

### 11.1 When to Show Skeleton

- Initial page load (> 1 second expected)
- Component mount (> 500ms expected)
- Navigation between routes

### 11.2 When to Show Spinner

- Button actions (< 3 seconds expected)
- Background refresh (any duration)
- Inline updates (< 1 second expected)

### 11.3 When to Show Progress Bar

- File uploads
- Long operations (> 3 seconds)
- Multi-step processes

### 11.4 Timing Guidelines

- Show loading indicator after 300ms delay (avoid flash)
- Minimum display time: 500ms (avoid flicker)
- Timeout: Show error after 30 seconds

---

## 12. References

- Design tokens: `app/styles/tokens.css`
- Dashboard tiles: `docs/design/dashboard-tiles.md`
- Polaris loading patterns: https://polaris.shopify.com/components/feedback-indicators/spinner
- WCAG 2.1 AA: https://www.w3.org/WAI/WCAG21/quickref/
- Skeleton screens: https://www.lukew.com/ff/entry.asp?1797

