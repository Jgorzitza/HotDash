---
epoch: 2025.10.E1
doc: docs/design/tokens/responsive_breakpoints.md
owner: designer
last_reviewed: 2025-10-05
doc_hash: TBD
expires: 2025-10-18
---
# Responsive Breakpoints — Operator Control Center

## Breakpoint System

### Primary Breakpoints

| Breakpoint | Min Width | Grid Columns | Tile Min Width | Use Case |
|------------|-----------|--------------|----------------|----------|
| Desktop    | 1280px    | 3            | 320px          | Primary operator workstation |
| Tablet     | 768px     | 2            | 320px          | Secondary devices, on-the-go |
| Mobile     | 0px       | 1            | 100%           | Emergency access only |

### Implementation

```css
/* Desktop (default) - 3 column grid */
@media (min-width: 1280px) {
  .dashboard-grid {
    grid-template-columns: repeat(3, minmax(320px, 1fr));
    gap: var(--p-space-5, 20px);
  }
}

/* Tablet - 2 column grid */
@media (min-width: 768px) and (max-width: 1279px) {
  .dashboard-grid {
    grid-template-columns: repeat(2, minmax(320px, 1fr));
    gap: var(--p-space-4, 16px);
  }
}

/* Mobile - 1 column stack */
@media (max-width: 767px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
    gap: var(--p-space-3, 12px);
  }
}
```

### Current Implementation (Auto-fit)

The existing dashboard uses:
```css
grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
```

This provides responsive behavior that adapts to container width automatically.

## Container Queries (Future Enhancement)

For Shopify Admin embedded context, consider container queries to adapt to app frame size:

```css
@container (min-width: 1280px) {
  .dashboard-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@container (min-width: 768px) and (max-width: 1279px) {
  .dashboard-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
```

## Responsive Tile Behavior

### Tile Content Adaptation

| Screen Size | Tile Height | Action Buttons | Metric Display |
|-------------|-------------|----------------|----------------|
| Desktop     | Auto (min 280px) | Horizontal layout | Full |
| Tablet      | Auto (min 280px) | Horizontal layout | Full |
| Mobile      | Auto (min 200px) | Stack vertical | Abbreviated |

### Modal Responsive Behavior

| Screen Size | Modal Width | Modal Position | Actions Layout |
|-------------|-------------|----------------|----------------|
| Desktop     | 600px       | Center screen  | Horizontal |
| Tablet      | 90vw (max 600px) | Center screen | Horizontal |
| Mobile      | 100vw       | Full screen    | Stack vertical |

## Touch Targets (Mobile)

All interactive elements meet minimum touch target size:
- Buttons: min 44px × 44px
- Tile cards: min 48px touch area
- Modal close: min 44px × 44px

## Typography Scaling

### Desktop (1280px+)
- H1 (Page heading): 2rem (32px)
- H2 (Tile heading): 1.15rem (18.4px)
- Body: 1rem (16px)
- Meta: 0.85rem (13.6px)

### Tablet (768px - 1279px)
- H1: 1.75rem (28px)
- H2: 1.1rem (17.6px)
- Body: 1rem (16px)
- Meta: 0.85rem (13.6px)

### Mobile (<768px)
- H1: 1.5rem (24px)
- H2: 1rem (16px)
- Body: 0.95rem (15.2px)
- Meta: 0.8rem (12.8px)

## Spacing Adjustments

### Desktop
- Tile padding: var(--p-space-5, 20px)
- Tile gap: var(--p-space-5, 20px)
- Internal gaps: var(--p-space-4, 16px)

### Tablet
- Tile padding: var(--p-space-4, 16px)
- Tile gap: var(--p-space-4, 16px)
- Internal gaps: var(--p-space-3, 12px)

### Mobile
- Tile padding: var(--p-space-3, 12px)
- Tile gap: var(--p-space-3, 12px)
- Internal gaps: var(--p-space-2, 8px)

## Testing Requirements

### Viewport Testing Matrix

| Device Class | Viewports to Test | Orientation |
|--------------|-------------------|-------------|
| Desktop      | 1280px, 1440px, 1920px | Landscape |
| Tablet       | 768px, 834px, 1024px | Both |
| Mobile       | 375px, 390px, 428px | Portrait |

### Browser Support

- Chrome 110+
- Firefox 110+
- Safari 16+
- Edge 110+

### Shopify Admin Embedded

Test within:
- Shopify Admin desktop frame
- Shopify Admin mobile app (iOS/Android)
- Shopify Admin tablet view

## Performance Considerations

- Lazy load tile content below the fold on mobile
- Reduce animation complexity on mobile devices
- Use `prefers-reduced-motion` media query for accessibility
- Consider `content-visibility: auto` for off-screen tiles

## Handoff Notes for Engineer

1. Implement responsive grid using CSS Grid with auto-fit (existing approach is solid)
2. Add explicit breakpoint overrides for modal sizing
3. Test touch targets on actual devices (not just browser DevTools)
4. Validate focus order remains logical across breakpoints
5. Ensure action buttons remain accessible on small screens (no truncation)
