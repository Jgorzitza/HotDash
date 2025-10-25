# HotDash Design System

**Operator Control Center Design System**  
Aligned with Shopify Polaris Design Tokens

## Overview

The HotDash Design System provides a comprehensive set of design tokens, components, and guidelines for building consistent, accessible, and operator-first interfaces.

### Key Principles

1. **Operator-First**: Optimized for speed, clarity, and decision-making
2. **Polaris-Aligned**: Built on Shopify Polaris design tokens for consistency
3. **Accessible**: WCAG 2.2 AA compliant
4. **Responsive**: Mobile-first, works across all devices
5. **Dark Mode**: Full dark mode support

## Quick Start

### Using Design Tokens

```css
/* Import tokens in your CSS */
@import '../styles/tokens.css';

/* Use tokens in your styles */
.my-component {
  background-color: var(--occ-bg-primary);
  color: var(--occ-text-primary);
  padding: var(--occ-space-4);
  border-radius: var(--occ-radius-md);
}
```

### Using Utility Classes

```tsx
<div className="occ-tile">
  <h2 className="occ-text-primary">Sales Pulse</h2>
  <p className="occ-text-meta">Last 7 days</p>
  <div className="occ-status-healthy">Healthy</div>
</div>
```

## Documentation

- [Design Tokens](./tokens.md) - Complete token reference
- [Components](./components.md) - Component library
- [Usage Guidelines](./guidelines.md) - Best practices and patterns
- [Accessibility](./accessibility.md) - WCAG compliance guide

## Design Tokens

### Colors

#### Status Colors
- `--occ-status-healthy-*` - Green for healthy/success states
- `--occ-status-attention-*` - Red for critical/error states
- `--occ-status-unconfigured-*` - Gray for neutral/unconfigured states

#### Semantic Colors
- `--occ-bg-primary` - Primary background
- `--occ-bg-secondary` - Secondary background
- `--occ-text-primary` - Primary text
- `--occ-text-secondary` - Secondary text
- `--occ-border-default` - Default border color

### Spacing

Based on 4px grid system:
- `--occ-space-1` - 4px
- `--occ-space-2` - 8px
- `--occ-space-3` - 12px
- `--occ-space-4` - 16px
- `--occ-space-5` - 20px
- `--occ-space-6` - 24px
- `--occ-space-8` - 32px
- `--occ-space-10` - 40px

### Typography

#### Font Families
- `--occ-font-family-primary` - System font stack
- `--occ-font-family-monospace` - Monospace for code/data

#### Font Sizes
- `--occ-font-size-xs` - 0.75rem (12px)
- `--occ-font-size-sm` - 0.85rem (13.6px)
- `--occ-font-size-base` - 1rem (16px)
- `--occ-font-size-lg` - 1.15rem (18.4px)
- `--occ-font-size-xl` - 1.5rem (24px)
- `--occ-font-size-2xl` - 2rem (32px)

#### Semantic Font Sizes
- `--occ-font-size-heading` - 1.15rem
- `--occ-font-size-metric` - 1.5rem
- `--occ-font-size-body` - 1rem
- `--occ-font-size-meta` - 0.85rem

### Border Radius
- `--occ-radius-sm` - 8px
- `--occ-radius-md` - 12px
- `--occ-radius-lg` - 16px
- `--occ-radius-full` - 9999px (fully rounded)

### Shadows
- `--occ-shadow-sm` - Subtle shadow
- `--occ-shadow-md` - Medium shadow
- `--occ-shadow-lg` - Large shadow
- `--occ-shadow-xl` - Extra large shadow

### Animation
- `--occ-duration-fast` - 150ms
- `--occ-duration-normal` - 250ms
- `--occ-duration-slow` - 350ms
- `--occ-easing-default` - cubic-bezier(0.4, 0.0, 0.2, 1)

## Component Tokens

### Tiles
```css
--occ-tile-min-width: 320px;
--occ-tile-min-height: 280px;
--occ-tile-padding: 20px;
--occ-tile-gap: 20px;
--occ-tile-bg: #ffffff;
--occ-tile-border: #d2d5d8;
--occ-radius-tile: 12px;
--occ-shadow-tile: 0 1px 2px rgba(15, 23, 42, 0.12);
```

### Buttons
```css
--occ-button-primary-bg: #2c6ecb;
--occ-button-primary-text: #ffffff;
--occ-button-secondary-bg: transparent;
--occ-button-secondary-text: #2c6ecb;
--occ-radius-button: 8px;
```

### Modals
```css
--occ-modal-width: 600px;
--occ-modal-max-width: 90vw;
--occ-modal-padding: 24px;
--occ-modal-gap: 16px;
--occ-radius-modal: 16px;
--occ-shadow-modal: 0 8px 16px rgba(15, 23, 42, 0.12);
```

## Dark Mode

All tokens support dark mode via `[data-theme="dark"]` attribute:

```tsx
// Toggle dark mode
document.documentElement.setAttribute('data-theme', 'dark');

// Toggle light mode
document.documentElement.setAttribute('data-theme', 'light');
```

Dark mode tokens automatically adjust:
- Background colors become darker
- Text colors become lighter
- Borders become more subtle
- Shadows become more pronounced

## Utility Classes

### Layout
- `.occ-tile` - Standard tile component
- `.occ-tile-grid` - Responsive tile grid

### Status
- `.occ-status-healthy` - Green status text
- `.occ-status-attention` - Red status text
- `.occ-status-unconfigured` - Gray status text

### Typography
- `.occ-text-primary` - Primary text color
- `.occ-text-secondary` - Secondary text color
- `.occ-text-meta` - Metadata text (small, subdued)

## Polaris Integration

All tokens fall back to Shopify Polaris design tokens:

```css
--occ-bg-primary: var(--p-color-bg-surface, #ffffff);
```

This ensures:
1. Consistency with Shopify Admin
2. Automatic updates when Polaris tokens change
3. Graceful fallbacks if Polaris tokens are unavailable

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari 14+, Chrome Android 90+)

## Contributing

When adding new tokens or components:

1. Follow Polaris naming conventions
2. Provide both light and dark mode values
3. Document in this guide
4. Add usage examples
5. Test accessibility (WCAG 2.2 AA)

## Resources

- [Shopify Polaris Design System](https://polaris.shopify.com/)
- [Polaris Tokens](https://polaris.shopify.com/tokens/colors)
- [WCAG 2.2 Guidelines](https://www.w3.org/WAI/WCAG22/quickref/)
- [Complete Vision Spec](../specs/complete_vision.md)

## Version

**Current Version:** 1.0.0  
**Last Updated:** 2025-10-24  
**Polaris Version:** Compatible with Polaris 12.x+

