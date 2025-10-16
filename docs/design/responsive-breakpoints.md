# Responsive Breakpoints

**File:** `docs/design/responsive-breakpoints.md`  
**Owner:** Designer  
**Version:** 1.0  
**Date:** 2025-10-15  
**Status:** Complete

---

## 1. Purpose

Define responsive breakpoints and adaptive design patterns for the Hot Rod AN Control Center, ensuring optimal experience across all device sizes.

---

## 2. Breakpoint System

### 2.1 Breakpoint Definitions

Following Shopify Polaris responsive design principles:

| Breakpoint | Range | Target Devices | Grid Columns |
|------------|-------|----------------|--------------|
| **Mobile** | 320px - 767px | Phones | 1 column |
| **Tablet** | 768px - 1023px | Tablets, small laptops | 2 columns |
| **Desktop** | 1024px+ | Laptops, desktops | 3-4 columns (auto-fit) |

### 2.2 CSS Custom Properties

```css
:root {
  /* Breakpoint values */
  --occ-breakpoint-mobile: 320px;
  --occ-breakpoint-tablet: 768px;
  --occ-breakpoint-desktop: 1024px;
  --occ-breakpoint-wide: 1440px;
  
  /* Container max-widths */
  --occ-container-mobile: 100%;
  --occ-container-tablet: 100%;
  --occ-container-desktop: 1280px;
  --occ-container-wide: 1600px;
}
```

### 2.3 Media Query Mixins

**Mobile-first approach** (recommended):

```css
/* Mobile: Base styles (no media query) */
.component {
  /* Mobile styles here */
}

/* Tablet and up */
@media (min-width: 768px) {
  .component {
    /* Tablet styles here */
  }
}

/* Desktop and up */
@media (min-width: 1024px) {
  .component {
    /* Desktop styles here */
  }
}

/* Wide screens */
@media (min-width: 1440px) {
  .component {
    /* Wide screen styles here */
  }
}
```

---

## 3. Component Adaptations

### 3.1 Dashboard Tile Grid

**Mobile (< 768px):**
```css
.occ-tile-grid {
  display: grid;
  gap: var(--occ-tile-gap); /* 20px */
  grid-template-columns: 1fr; /* Single column */
  padding: var(--occ-space-4); /* 16px */
}
```

**Tablet (768px - 1023px):**
```css
@media (min-width: 768px) {
  .occ-tile-grid {
    grid-template-columns: repeat(2, 1fr); /* 2 columns */
    padding: var(--occ-space-6); /* 24px */
  }
}
```

**Desktop (1024px+):**
```css
@media (min-width: 1024px) {
  .occ-tile-grid {
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); /* Auto-fit */
    padding: var(--occ-space-8); /* 32px */
  }
}
```

### 3.2 Tile Card

**Mobile:**
- Full width (100%)
- Reduced padding: 16px
- Font scale: 0.9x
- Touch targets: min 44x44px
- Stack horizontal layouts vertically

**Tablet:**
- Standard padding: 20px
- Font scale: 1x
- Touch targets: min 44x44px
- Maintain horizontal layouts

**Desktop:**
- Standard padding: 20px
- Font scale: 1x
- Mouse interactions (hover states)
- Keyboard shortcuts visible

### 3.3 Approvals Drawer

**Mobile (< 768px):**
- Full screen overlay
- Simplified layout (single column)
- Larger buttons (min 44x44px)
- Swipe to close gesture
- Hide keyboard shortcut hints

**Tablet (768px - 1023px):**
- 80% viewport width
- Single column layout
- Standard button sizes
- Touch-optimized

**Desktop (1024px+):**
- 60% viewport width (max 800px)
- Multi-column layouts where appropriate
- Hover states enabled
- Keyboard shortcuts visible
- Mouse-optimized interactions

### 3.4 Modals

**Mobile:**
```css
.occ-modal {
  width: 100vw;
  height: 100vh;
  max-width: 100vw;
  border-radius: 0;
  padding: var(--occ-space-4);
}
```

**Tablet:**
```css
@media (min-width: 768px) {
  .occ-modal {
    width: 90vw;
    height: auto;
    max-width: 600px;
    border-radius: var(--occ-radius-modal);
    padding: var(--occ-space-6);
  }
}
```

**Desktop:**
```css
@media (min-width: 1024px) {
  .occ-modal {
    width: 600px;
    max-width: 90vw;
    padding: var(--occ-modal-padding);
  }
}
```

### 3.5 Navigation

**Mobile:**
- Hamburger menu (collapsed)
- Bottom navigation bar (optional)
- Full-screen menu overlay

**Tablet:**
- Collapsed sidebar with icons
- Expandable on hover/tap

**Desktop:**
- Full sidebar navigation
- Always visible
- Hover states

---

## 4. Typography Scaling

### 4.1 Font Size Adjustments

**Mobile (< 768px):**
```css
:root {
  --occ-font-size-heading: 1.05rem; /* Reduced from 1.15rem */
  --occ-font-size-metric: 1.35rem; /* Reduced from 1.5rem */
  --occ-font-size-body: 0.95rem; /* Reduced from 1rem */
  --occ-font-size-meta: 0.8rem; /* Reduced from 0.85rem */
}
```

**Tablet (768px+):**
```css
@media (min-width: 768px) {
  :root {
    --occ-font-size-heading: 1.15rem;
    --occ-font-size-metric: 1.5rem;
    --occ-font-size-body: 1rem;
    --occ-font-size-meta: 0.85rem;
  }
}
```

**Desktop (1024px+):**
- Standard sizes (no change from tablet)

### 4.2 Line Height Adjustments

**Mobile:**
- Tighter line height for space efficiency
- `--occ-line-height-normal: 1.4`

**Tablet & Desktop:**
- Standard line height
- `--occ-line-height-normal: 1.5`

---

## 5. Spacing Adjustments

### 5.1 Container Padding

**Mobile:**
```css
.occ-container {
  padding: var(--occ-space-4); /* 16px */
}
```

**Tablet:**
```css
@media (min-width: 768px) {
  .occ-container {
    padding: var(--occ-space-6); /* 24px */
  }
}
```

**Desktop:**
```css
@media (min-width: 1024px) {
  .occ-container {
    padding: var(--occ-space-8); /* 32px */
  }
}
```

### 5.2 Component Gaps

**Mobile:**
- Reduced gaps for space efficiency
- Tile gap: 16px
- Internal gap: 12px

**Tablet & Desktop:**
- Standard gaps
- Tile gap: 20px
- Internal gap: 16px

---

## 6. Touch Target Sizes

### 6.1 Minimum Sizes (WCAG 2.1 AA)

**Mobile & Tablet:**
- Minimum touch target: **44x44px**
- Recommended: **48x48px**
- Spacing between targets: **8px minimum**

**Desktop:**
- Minimum click target: **24x24px**
- Recommended: **32x32px**

### 6.2 Button Sizing

**Mobile:**
```css
.occ-button {
  min-height: 44px;
  padding: 12px 20px;
  font-size: 1rem;
}
```

**Tablet:**
```css
@media (min-width: 768px) {
  .occ-button {
    min-height: 40px;
    padding: 10px 16px;
    font-size: 0.95rem;
  }
}
```

**Desktop:**
```css
@media (min-width: 1024px) {
  .occ-button {
    min-height: 36px;
    padding: 8px 16px;
    font-size: 0.9rem;
  }
}
```

---

## 7. Layout Patterns

### 7.1 Stack vs. Inline

**Mobile:** Stack everything vertically
```css
.occ-layout {
  display: flex;
  flex-direction: column;
  gap: var(--occ-space-4);
}
```

**Tablet & Desktop:** Inline where appropriate
```css
@media (min-width: 768px) {
  .occ-layout {
    flex-direction: row;
    gap: var(--occ-space-6);
  }
}
```

### 7.2 Grid Auto-Fit Pattern

**Responsive without media queries:**
```css
.occ-grid {
  display: grid;
  gap: var(--occ-tile-gap);
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
}
```

This automatically adjusts:
- Mobile: 1 column (if viewport < 320px + gaps)
- Tablet: 2 columns (if viewport fits 2 × 320px + gaps)
- Desktop: 3-4 columns (if viewport fits more)

---

## 8. Image and Media Handling

### 8.1 Responsive Images

```html
<img
  src="image-mobile.jpg"
  srcset="
    image-mobile.jpg 320w,
    image-tablet.jpg 768w,
    image-desktop.jpg 1024w,
    image-wide.jpg 1440w
  "
  sizes="
    (max-width: 767px) 100vw,
    (max-width: 1023px) 50vw,
    33vw
  "
  alt="Description"
/>
```

### 8.2 Background Images

```css
.hero {
  background-image: url('hero-mobile.jpg');
}

@media (min-width: 768px) {
  .hero {
    background-image: url('hero-tablet.jpg');
  }
}

@media (min-width: 1024px) {
  .hero {
    background-image: url('hero-desktop.jpg');
  }
}
```

---

## 9. Orientation Handling

### 9.1 Landscape Mode (Mobile)

```css
@media (max-width: 767px) and (orientation: landscape) {
  .occ-modal {
    max-height: 90vh;
    overflow-y: auto;
  }
  
  .occ-tile-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
```

### 9.2 Portrait Mode (Tablet)

```css
@media (min-width: 768px) and (max-width: 1023px) and (orientation: portrait) {
  .occ-tile-grid {
    grid-template-columns: 1fr;
  }
}
```

---

## 10. Testing Checklist

### 10.1 Device Testing

**Mobile:**
- [ ] iPhone SE (375x667)
- [ ] iPhone 12/13/14 (390x844)
- [ ] iPhone 14 Pro Max (430x932)
- [ ] Samsung Galaxy S21 (360x800)
- [ ] Google Pixel 5 (393x851)

**Tablet:**
- [ ] iPad Mini (768x1024)
- [ ] iPad Air (820x1180)
- [ ] iPad Pro 11" (834x1194)
- [ ] iPad Pro 12.9" (1024x1366)
- [ ] Samsung Galaxy Tab (800x1280)

**Desktop:**
- [ ] 1024x768 (small laptop)
- [ ] 1280x720 (HD)
- [ ] 1366x768 (common laptop)
- [ ] 1920x1080 (Full HD)
- [ ] 2560x1440 (2K)
- [ ] 3840x2160 (4K)

### 10.2 Browser Testing

- [ ] Chrome (mobile, tablet, desktop)
- [ ] Safari (iOS, macOS)
- [ ] Firefox (mobile, desktop)
- [ ] Edge (desktop)
- [ ] Samsung Internet (mobile)

### 10.3 Orientation Testing

- [ ] Portrait mode (all devices)
- [ ] Landscape mode (all devices)
- [ ] Rotation transitions smooth

---

## 11. Performance Considerations

### 11.1 Mobile Optimization

- Reduce image sizes for mobile
- Lazy load below-the-fold content
- Minimize JavaScript bundle size
- Use CSS containment for tiles

### 11.2 Tablet Optimization

- Balance between mobile and desktop assets
- Progressive enhancement
- Touch and mouse support

### 11.3 Desktop Optimization

- Full feature set
- Hover states and animations
- Keyboard shortcuts
- Multi-column layouts

---

## 12. Accessibility Across Breakpoints

### 12.1 Zoom Support

**200% Zoom (WCAG 2.1 AA):**
- No horizontal scroll
- All content readable
- No overlapping elements

**400% Zoom:**
- Single column layout
- Larger touch targets
- Simplified navigation

### 12.2 Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 12.3 High Contrast Mode

```css
@media (prefers-contrast: high) {
  :root {
    --occ-border-default: #000000;
    --occ-text-primary: #000000;
    --occ-bg-primary: #ffffff;
  }
}
```

---

## 13. Implementation Guidelines

### 13.1 Mobile-First Approach

1. Start with mobile styles (base)
2. Add tablet styles with `@media (min-width: 768px)`
3. Add desktop styles with `@media (min-width: 1024px)`
4. Test on real devices, not just browser DevTools

### 13.2 Progressive Enhancement

1. Core functionality works on all devices
2. Enhanced features for larger screens
3. Graceful degradation for older browsers

### 13.3 Container Queries (Future)

When browser support improves:
```css
@container (min-width: 768px) {
  .tile {
    /* Styles based on container width, not viewport */
  }
}
```

---

## 14. References

- Design tokens: `app/styles/tokens.css`
- Dashboard tiles: `docs/design/dashboard-tiles.md`
- Polaris responsive design: https://polaris.shopify.com/design/responsive
- WCAG 2.1 AA: https://www.w3.org/WAI/WCAG21/quickref/
- Touch target sizes: https://www.w3.org/WAI/WCAG21/Understanding/target-size.html

