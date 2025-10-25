# Component Library

HotDash component library with usage examples and best practices.

## Tiles

### Standard Tile

The primary container for dashboard content.

**HTML:**
```html
<div class="occ-tile">
  <h2 class="occ-text-primary">Tile Title</h2>
  <p class="occ-text-meta">Metadata or timestamp</p>
  <div class="occ-status-healthy">Healthy</div>
</div>
```

**CSS:**
```css
.occ-tile {
  min-width: var(--occ-tile-min-width);
  min-height: var(--occ-tile-min-height);
  background-color: var(--occ-tile-bg);
  border: 1px solid var(--occ-tile-border);
  border-radius: var(--occ-radius-tile);
  box-shadow: var(--occ-shadow-tile);
  padding: var(--occ-tile-padding);
  display: flex;
  flex-direction: column;
  gap: var(--occ-tile-internal-gap);
}
```

**Features:**
- Responsive min-width (320px)
- Hover shadow effect
- Dark mode support
- Flexible content layout

### Tile Grid

Responsive grid layout for tiles.

**HTML:**
```html
<div class="occ-tile-grid">
  <div class="occ-tile">...</div>
  <div class="occ-tile">...</div>
  <div class="occ-tile">...</div>
</div>
```

**CSS:**
```css
.occ-tile-grid {
  display: grid;
  gap: var(--occ-tile-gap);
  grid-template-columns: repeat(auto-fit, minmax(var(--occ-tile-min-width), 1fr));
}
```

**Features:**
- Auto-fit responsive columns
- Consistent gap spacing
- Maintains minimum tile width

## Status Indicators

### Healthy Status

```html
<div class="occ-status-healthy">Healthy</div>
```

**Usage:** Positive metrics, successful operations

### Attention Status

```html
<div class="occ-status-attention">Attention Required</div>
```

**Usage:** Critical alerts, errors, urgent actions

### Unconfigured Status

```html
<div class="occ-status-unconfigured">Not Configured</div>
```

**Usage:** Neutral states, disabled features

## Typography

### Text Styles

```html
<p class="occ-text-primary">Primary text</p>
<p class="occ-text-secondary">Secondary text</p>
<p class="occ-text-meta">Metadata text</p>
```

### Headings

```css
.tile-heading {
  font-size: var(--occ-font-size-heading);
  font-weight: var(--occ-font-weight-semibold);
  color: var(--occ-text-primary);
  line-height: var(--occ-line-height-tight);
}
```

### Metrics

```css
.metric-value {
  font-size: var(--occ-font-size-metric);
  font-weight: var(--occ-font-weight-bold);
  color: var(--occ-text-primary);
  line-height: var(--occ-line-height-tight);
}
```

## Buttons

### Primary Button

```css
.button-primary {
  background-color: var(--occ-button-primary-bg);
  color: var(--occ-button-primary-text);
  padding: var(--occ-space-3) var(--occ-space-5);
  border-radius: var(--occ-radius-button);
  border: none;
  font-weight: var(--occ-font-weight-medium);
  cursor: pointer;
  transition: all var(--occ-duration-fast) var(--occ-easing-default);
}

.button-primary:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}
```

### Secondary Button

```css
.button-secondary {
  background-color: var(--occ-button-secondary-bg);
  color: var(--occ-button-secondary-text);
  padding: var(--occ-space-3) var(--occ-space-5);
  border-radius: var(--occ-radius-button);
  border: 1px solid var(--occ-button-secondary-border);
  font-weight: var(--occ-font-weight-medium);
  cursor: pointer;
  transition: all var(--occ-duration-fast) var(--occ-easing-default);
}

.button-secondary:hover {
  background-color: var(--occ-bg-hover);
}
```

## Modals

```css
.modal {
  width: var(--occ-modal-width);
  max-width: var(--occ-modal-max-width);
  background-color: var(--occ-modal-bg);
  border-radius: var(--occ-radius-modal);
  box-shadow: var(--occ-shadow-modal);
  padding: var(--occ-modal-padding);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--occ-modal-gap);
}

.modal-content {
  display: flex;
  flex-direction: column;
  gap: var(--occ-modal-gap);
}
```

## Toast Notifications

### Success Toast

```css
.toast-success {
  background-color: var(--occ-toast-success-bg);
  color: var(--occ-toast-success-text);
  border: 1px solid var(--occ-toast-success-border);
  border-radius: var(--occ-radius-md);
  padding: var(--occ-space-4);
  animation: occ-toast-enter var(--occ-duration-normal) var(--occ-easing-default);
}
```

### Error Toast

```css
.toast-error {
  background-color: var(--occ-toast-error-bg);
  color: var(--occ-toast-error-text);
  border: 1px solid var(--occ-toast-error-border);
  border-radius: var(--occ-radius-md);
  padding: var(--occ-space-4);
  animation: occ-toast-enter var(--occ-duration-normal) var(--occ-easing-default);
}
```

### Info Toast

```css
.toast-info {
  background-color: var(--occ-toast-info-bg);
  color: var(--occ-toast-info-text);
  border: 1px solid var(--occ-toast-info-border);
  border-radius: var(--occ-radius-md);
  padding: var(--occ-space-4);
  animation: occ-toast-enter var(--occ-duration-normal) var(--occ-easing-default);
}
```

## Animations

### Toast Enter/Exit

```css
@keyframes occ-toast-enter {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes occ-toast-exit {
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(100%);
  }
}
```

### Pulse Animation

```css
@keyframes occ-pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.pulse {
  animation: occ-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
```

### Pulse Ring (for live indicators)

```css
@keyframes occ-pulse-ring {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(1.5);
    opacity: 0;
  }
}

.pulse-ring {
  animation: occ-pulse-ring 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
}
```

## Theme Toggle

```html
<div class="theme-toggle">
  <label class="theme-toggle__label">Theme</label>
  <select class="theme-toggle__select">
    <option value="light">Light</option>
    <option value="dark">Dark</option>
    <option value="system">System</option>
  </select>
</div>
```

```css
.theme-toggle {
  display: flex;
  align-items: center;
  gap: var(--occ-space-2);
}

.theme-toggle__select {
  padding: var(--occ-space-2) var(--occ-space-3);
  border-radius: var(--occ-radius-button);
  border: 1px solid var(--occ-border-default);
  background-color: var(--occ-bg-primary);
  color: var(--occ-text-primary);
}
```

## Best Practices

1. **Use semantic classes** - Prefer `.occ-tile` over custom classes
2. **Compose components** - Build complex UIs from simple components
3. **Support dark mode** - Test all components in both themes
4. **Follow accessibility** - Use proper ARIA labels and keyboard navigation
5. **Maintain consistency** - Use design tokens for all styling
6. **Optimize performance** - Use CSS animations over JavaScript
7. **Test responsiveness** - Verify components work on all screen sizes

## Component Checklist

When creating new components:

- [ ] Uses design tokens (no hardcoded values)
- [ ] Supports dark mode
- [ ] Responsive (mobile-first)
- [ ] Accessible (WCAG 2.2 AA)
- [ ] Documented with examples
- [ ] Tested in all browsers
- [ ] Follows Polaris patterns

