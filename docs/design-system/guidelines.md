# Usage Guidelines

Best practices and patterns for using the HotDash Design System.

## Core Principles

### 1. Operator-First Design

**Speed over aesthetics** - Operators need to make fast decisions.

✅ **DO:**
- Use clear, scannable layouts
- Prioritize critical information
- Minimize clicks to action
- Show status at a glance

❌ **DON'T:**
- Hide important data in modals
- Use decorative elements that slow scanning
- Require multiple steps for common actions

### 2. Consistency

**Use the design system** - Don't reinvent components.

✅ **DO:**
- Use existing components and tokens
- Follow established patterns
- Maintain visual hierarchy
- Use consistent spacing

❌ **DON'T:**
- Create custom components without reason
- Mix different design patterns
- Use arbitrary spacing values
- Deviate from Polaris patterns

### 3. Accessibility

**WCAG 2.2 AA compliance** - Design for everyone.

✅ **DO:**
- Use semantic HTML
- Provide keyboard navigation
- Include ARIA labels
- Maintain color contrast ratios
- Test with screen readers

❌ **DON'T:**
- Rely solely on color for meaning
- Create keyboard traps
- Use low-contrast text
- Ignore focus states

## Layout Patterns

### Dashboard Grid

Use the tile grid for dashboard layouts:

```tsx
<div className="occ-tile-grid">
  <SalesPulseTile />
  <InventoryHealthTile />
  <CustomerSentimentTile />
  <GrowthMetricsTile />
</div>
```

**Guidelines:**
- Minimum 320px tile width
- 20px gap between tiles
- Auto-fit responsive columns
- Maintain consistent tile heights when possible

### Tile Structure

Standard tile structure:

```tsx
<div className="occ-tile">
  {/* Header */}
  <div className="tile-header">
    <h2>Tile Title</h2>
    <button>Action</button>
  </div>
  
  {/* Content */}
  <div className="tile-content">
    <div className="metric">$12,345</div>
    <div className="status">Healthy</div>
  </div>
  
  {/* Footer */}
  <div className="tile-footer">
    <span className="occ-text-meta">Last updated: 2 min ago</span>
  </div>
</div>
```

## Color Usage

### Status Colors

Use status colors consistently:

**Healthy (Green):**
- Metrics above target
- Successful operations
- Positive trends
- Available inventory

**Attention (Red):**
- Metrics below target
- Errors and failures
- Negative trends
- Stockouts

**Unconfigured (Gray):**
- Not yet configured
- Neutral states
- Disabled features
- Pending actions

### Text Colors

```css
/* Primary text - main content */
color: var(--occ-text-primary);

/* Secondary text - supporting content */
color: var(--occ-text-secondary);

/* Metadata - timestamps, labels */
color: var(--occ-text-meta);
```

## Typography

### Hierarchy

```css
/* Page title */
font-size: var(--occ-font-size-2xl);
font-weight: var(--occ-font-weight-bold);

/* Tile heading */
font-size: var(--occ-font-size-heading);
font-weight: var(--occ-font-weight-semibold);

/* Metric value */
font-size: var(--occ-font-size-metric);
font-weight: var(--occ-font-weight-bold);

/* Body text */
font-size: var(--occ-font-size-body);
font-weight: var(--occ-font-weight-regular);

/* Metadata */
font-size: var(--occ-font-size-meta);
font-weight: var(--occ-font-weight-regular);
```

### Line Length

- **Optimal:** 50-75 characters per line
- **Maximum:** 90 characters per line
- Use `max-width` to constrain long text blocks

## Spacing

### Consistent Spacing

Use the 4px grid system:

```css
/* Tight spacing - related elements */
gap: var(--occ-space-2); /* 8px */

/* Normal spacing - grouped content */
gap: var(--occ-space-4); /* 16px */

/* Loose spacing - sections */
gap: var(--occ-space-6); /* 24px */
```

### Padding

```css
/* Tile padding */
padding: var(--occ-tile-padding); /* 20px */

/* Modal padding */
padding: var(--occ-modal-padding); /* 24px */

/* Button padding */
padding: var(--occ-space-3) var(--occ-space-5); /* 12px 20px */
```

## Interaction Patterns

### Hover States

Always provide hover feedback:

```css
.interactive-element {
  transition: all var(--occ-duration-fast) var(--occ-easing-default);
}

.interactive-element:hover {
  background-color: var(--occ-bg-hover);
  transform: translateY(-1px);
  box-shadow: var(--occ-shadow-md);
}
```

### Focus States

Ensure keyboard navigation is visible:

```css
.interactive-element:focus {
  outline: 2px solid var(--occ-border-focus);
  outline-offset: 2px;
}
```

### Loading States

Show loading feedback:

```tsx
<div className="loading">
  <div className="pulse">Loading...</div>
</div>
```

## Responsive Design

### Mobile-First

Start with mobile layout, enhance for larger screens:

```css
/* Mobile (default) */
.tile-grid {
  grid-template-columns: 1fr;
}

/* Tablet */
@media (min-width: 768px) {
  .tile-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .tile-grid {
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  }
}
```

### Breakpoints

```css
/* Mobile: < 768px */
/* Tablet: 768px - 1023px */
/* Desktop: ≥ 1024px */
/* Wide: ≥ 1440px */
```

## Dark Mode

### Implementation

```tsx
// Toggle dark mode
const toggleTheme = () => {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
};
```

### Testing

Always test components in both themes:

```css
/* Light mode (default) */
.component {
  background-color: var(--occ-bg-primary);
  color: var(--occ-text-primary);
}

/* Dark mode (automatic via tokens) */
[data-theme="dark"] .component {
  /* Tokens automatically adjust */
}
```

## Accessibility

### Semantic HTML

```html
<!-- ✅ Good -->
<button onClick={handleClick}>Submit</button>
<nav aria-label="Main navigation">...</nav>
<main>...</main>

<!-- ❌ Bad -->
<div onClick={handleClick}>Submit</div>
<div className="nav">...</div>
<div className="content">...</div>
```

### ARIA Labels

```html
<!-- Interactive elements -->
<button aria-label="Close modal">×</button>

<!-- Status indicators -->
<div role="status" aria-live="polite">
  <span className="occ-status-healthy">Healthy</span>
</div>

<!-- Loading states -->
<div role="status" aria-live="polite" aria-busy="true">
  Loading...
</div>
```

### Keyboard Navigation

Ensure all interactive elements are keyboard accessible:

- Tab order follows visual order
- Enter/Space activates buttons
- Escape closes modals
- Arrow keys navigate lists

### Color Contrast

Maintain WCAG AA contrast ratios:

- **Normal text:** 4.5:1 minimum
- **Large text:** 3:1 minimum
- **UI components:** 3:1 minimum

## Performance

### CSS Best Practices

```css
/* ✅ Use CSS variables */
color: var(--occ-text-primary);

/* ✅ Use CSS animations */
animation: occ-pulse 2s infinite;

/* ❌ Avoid inline styles */
/* ❌ Avoid !important */
/* ❌ Avoid deep nesting */
```

### Animation Performance

```css
/* ✅ Animate transform and opacity */
.element {
  transition: transform 250ms, opacity 250ms;
}

/* ❌ Avoid animating layout properties */
/* Don't animate: width, height, margin, padding */
```

## Common Patterns

### Status Badge

```tsx
<span className={`status-badge ${status}`}>
  {status === 'healthy' && '✓ Healthy'}
  {status === 'attention' && '⚠ Attention'}
  {status === 'unconfigured' && '○ Not Configured'}
</span>
```

### Metric Display

```tsx
<div className="metric">
  <div className="metric-value">$12,345</div>
  <div className="metric-label">Revenue (7d)</div>
  <div className="metric-change positive">+12.5%</div>
</div>
```

### Action Button

```tsx
<button className="button-primary" onClick={handleAction}>
  Take Action
</button>
```

## Checklist

Before shipping a component:

- [ ] Uses design tokens (no hardcoded values)
- [ ] Supports dark mode
- [ ] Responsive (mobile-first)
- [ ] Accessible (WCAG 2.2 AA)
- [ ] Keyboard navigable
- [ ] Proper focus states
- [ ] Loading states
- [ ] Error states
- [ ] Documented
- [ ] Tested in all browsers

