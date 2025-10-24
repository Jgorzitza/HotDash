# Design Tokens Reference

Complete reference for all HotDash design tokens, aligned with Shopify Polaris.

## Color Tokens

### Status Colors

#### Healthy (Success/Green)
```css
--occ-status-healthy-text: #1a7f37;      /* Text color */
--occ-status-healthy-bg: #e3f9e5;        /* Background color */
--occ-status-healthy-border: #2e844a;    /* Border color */
```

**Usage:** Healthy metrics, successful operations, positive states

**Dark Mode:**
```css
--occ-status-healthy-text: #4ade80;
--occ-status-healthy-bg: #1a2e1a;
--occ-status-healthy-border: #22c55e;
```

#### Attention (Critical/Red)
```css
--occ-status-attention-text: #d82c0d;
--occ-status-attention-bg: #fff4f4;
--occ-status-attention-border: #e85c4a;
```

**Usage:** Critical alerts, errors, stockouts, urgent actions

**Dark Mode:**
```css
--occ-status-attention-text: #f87171;
--occ-status-attention-bg: #2e1a1a;
--occ-status-attention-border: #ef4444;
```

#### Unconfigured (Neutral/Gray)
```css
--occ-status-unconfigured-text: #637381;
--occ-status-unconfigured-bg: #f6f6f7;
--occ-status-unconfigured-border: #d2d5d8;
```

**Usage:** Unconfigured features, neutral states, disabled elements

**Dark Mode:**
```css
--occ-status-unconfigured-text: #9ca3af;
--occ-status-unconfigured-bg: #1f2937;
--occ-status-unconfigured-border: #374151;
```

### Background Colors

```css
--occ-bg-primary: #ffffff;        /* Primary surface */
--occ-bg-secondary: #f6f6f7;      /* Secondary surface */
--occ-bg-hover: #f6f6f7;          /* Hover state */
```

**Dark Mode:**
```css
--occ-bg-primary: #111827;
--occ-bg-secondary: #1f2937;
--occ-bg-hover: #374151;
```

### Border Colors

```css
--occ-border-default: #d2d5d8;    /* Default borders */
--occ-border-interactive: #2c6ecb; /* Interactive elements */
--occ-border-focus: #2c6ecb;      /* Focus rings */
```

**Dark Mode:**
```css
--occ-border-default: #374151;
--occ-border-interactive: #3b82f6;
--occ-border-focus: #3b82f6;
```

### Text Colors

```css
--occ-text-primary: #202223;      /* Primary text */
--occ-text-secondary: #637381;    /* Secondary text */
--occ-text-interactive: #2c6ecb;  /* Links, interactive text */
--occ-text-success: #1a7f37;      /* Success messages */
--occ-text-critical: #d82c0d;     /* Error messages */
--occ-text-warning: #916a00;      /* Warning messages */
```

**Dark Mode:**
```css
--occ-text-primary: #f9fafb;
--occ-text-secondary: #9ca3af;
--occ-text-interactive: #60a5fa;
--occ-text-success: #4ade80;
--occ-text-critical: #f87171;
--occ-text-warning: #fbbf24;
```

## Spacing Tokens

Based on 4px grid system:

```css
--occ-space-1: 4px;    /* Tight spacing */
--occ-space-2: 8px;    /* Small spacing */
--occ-space-3: 12px;   /* Medium-small spacing */
--occ-space-4: 16px;   /* Medium spacing */
--occ-space-5: 20px;   /* Medium-large spacing */
--occ-space-6: 24px;   /* Large spacing */
--occ-space-8: 32px;   /* Extra large spacing */
--occ-space-10: 40px;  /* XXL spacing */
```

### Semantic Spacing

```css
--occ-tile-padding: 20px;         /* Tile internal padding */
--occ-tile-gap: 20px;             /* Gap between tiles */
--occ-tile-internal-gap: 16px;    /* Gap within tile content */
--occ-modal-padding: 24px;        /* Modal internal padding */
--occ-modal-gap: 16px;            /* Gap within modal content */
```

## Typography Tokens

### Font Families

```css
--occ-font-family-primary: -apple-system, BlinkMacSystemFont, 'San Francisco', 
                           'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
--occ-font-family-monospace: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 
                             'source-code-pro', monospace;
```

### Font Sizes

```css
--occ-font-size-xs: 0.75rem;    /* 12px - Very small text */
--occ-font-size-sm: 0.85rem;    /* 13.6px - Small text */
--occ-font-size-base: 1rem;     /* 16px - Body text */
--occ-font-size-lg: 1.15rem;    /* 18.4px - Large text */
--occ-font-size-xl: 1.5rem;     /* 24px - Extra large */
--occ-font-size-2xl: 2rem;      /* 32px - Headings */
```

### Semantic Font Sizes

```css
--occ-font-size-heading: 1.15rem;  /* Tile headings */
--occ-font-size-metric: 1.5rem;    /* Large metrics */
--occ-font-size-body: 1rem;        /* Body text */
--occ-font-size-meta: 0.85rem;     /* Metadata, timestamps */
```

### Font Weights

```css
--occ-font-weight-regular: 400;    /* Regular text */
--occ-font-weight-medium: 500;     /* Medium emphasis */
--occ-font-weight-semibold: 600;   /* Strong emphasis */
--occ-font-weight-bold: 700;       /* Bold text */
```

### Line Heights

```css
--occ-line-height-tight: 1.25;     /* Tight line height */
--occ-line-height-normal: 1.5;     /* Normal line height */
--occ-line-height-relaxed: 1.75;   /* Relaxed line height */
```

## Border Radius Tokens

```css
--occ-radius-sm: 8px;      /* Small radius - buttons */
--occ-radius-md: 12px;     /* Medium radius - tiles */
--occ-radius-lg: 16px;     /* Large radius - modals */
--occ-radius-full: 9999px; /* Fully rounded - pills, avatars */
```

### Semantic Border Radius

```css
--occ-radius-tile: 12px;    /* Tile corners */
--occ-radius-modal: 16px;   /* Modal corners */
--occ-radius-button: 8px;   /* Button corners */
```

## Shadow Tokens

```css
--occ-shadow-sm: 0 1px 2px rgba(15, 23, 42, 0.12);   /* Subtle shadow */
--occ-shadow-md: 0 2px 4px rgba(15, 23, 42, 0.12);   /* Medium shadow */
--occ-shadow-lg: 0 4px 8px rgba(15, 23, 42, 0.12);   /* Large shadow */
--occ-shadow-xl: 0 8px 16px rgba(15, 23, 42, 0.12);  /* Extra large shadow */
```

### Semantic Shadows

```css
--occ-shadow-tile: 0 1px 2px rgba(15, 23, 42, 0.12);        /* Tile shadow */
--occ-shadow-tile-hover: 0 2px 4px rgba(15, 23, 42, 0.12);  /* Tile hover shadow */
--occ-shadow-modal: 0 8px 16px rgba(15, 23, 42, 0.12);      /* Modal shadow */
```

## Animation Tokens

### Duration

```css
--occ-duration-fast: 150ms;     /* Fast animations */
--occ-duration-normal: 250ms;   /* Normal animations */
--occ-duration-slow: 350ms;     /* Slow animations */
```

### Easing

```css
--occ-easing-default: cubic-bezier(0.4, 0.0, 0.2, 1);  /* Default easing */
--occ-easing-in: cubic-bezier(0.4, 0.0, 1, 1);         /* Ease in */
--occ-easing-out: cubic-bezier(0.0, 0.0, 0.2, 1);      /* Ease out */
--occ-easing-in-out: cubic-bezier(0.4, 0.0, 0.2, 1);   /* Ease in-out */
```

## Component Tokens

### Tile Tokens

```css
--occ-tile-min-width: 320px;
--occ-tile-min-height: 280px;
--occ-tile-bg: #ffffff;
--occ-tile-border: #d2d5d8;
```

### Button Tokens

```css
--occ-button-primary-bg: #2c6ecb;
--occ-button-primary-text: #ffffff;
--occ-button-secondary-bg: transparent;
--occ-button-secondary-text: #2c6ecb;
--occ-button-secondary-border: #2c6ecb;
```

### Modal Tokens

```css
--occ-modal-width: 600px;
--occ-modal-max-width: 90vw;
--occ-modal-bg: #ffffff;
```

### Toast Tokens

```css
--occ-toast-success-bg: #e3f9e5;
--occ-toast-success-text: #1a7f37;
--occ-toast-success-border: #2e844a;

--occ-toast-error-bg: #fff4f4;
--occ-toast-error-text: #d82c0d;
--occ-toast-error-border: #e85c4a;

--occ-toast-info-bg: #e8f5fa;
--occ-toast-info-text: #1f5d99;
--occ-toast-info-border: #5c9ec7;
```

## Polaris Fallbacks

All tokens include Polaris fallbacks:

```css
--occ-bg-primary: var(--p-color-bg-surface, #ffffff);
```

This pattern ensures:
1. Tokens use Polaris values when available
2. Graceful fallback to HotDash values
3. Consistency with Shopify Admin
4. Future-proof design system

## Usage Examples

### Using Color Tokens

```css
.my-component {
  background-color: var(--occ-bg-primary);
  color: var(--occ-text-primary);
  border: 1px solid var(--occ-border-default);
}

.my-component:hover {
  background-color: var(--occ-bg-hover);
}
```

### Using Spacing Tokens

```css
.my-component {
  padding: var(--occ-space-4);
  margin-bottom: var(--occ-space-6);
  gap: var(--occ-space-3);
}
```

### Using Typography Tokens

```css
.my-heading {
  font-family: var(--occ-font-family-primary);
  font-size: var(--occ-font-size-heading);
  font-weight: var(--occ-font-weight-semibold);
  line-height: var(--occ-line-height-tight);
  color: var(--occ-text-primary);
}
```

### Using Animation Tokens

```css
.my-component {
  transition: all var(--occ-duration-normal) var(--occ-easing-default);
}

.my-component:hover {
  transform: translateY(-2px);
  box-shadow: var(--occ-shadow-md);
}
```

## Token Naming Convention

All tokens follow this pattern:

```
--occ-{category}-{property}-{variant}
```

Examples:
- `--occ-status-healthy-text` - Status category, healthy property, text variant
- `--occ-tile-padding` - Tile category, padding property
- `--occ-font-size-heading` - Font category, size property, heading variant

## Best Practices

1. **Always use tokens** - Never hardcode values
2. **Use semantic tokens** - Prefer `--occ-tile-padding` over `--occ-space-5`
3. **Support dark mode** - Test all components in both themes
4. **Follow Polaris** - Align with Shopify design patterns
5. **Document usage** - Add comments explaining token choices

