---
epoch: 2025.10.E1
doc: docs/design/tokens/design_tokens.md
owner: designer
last_reviewed: 2025-10-05
doc_hash: TBD
expires: 2025-10-18
---

# Design Tokens — Operator Control Center

## Overview

This document specifies design tokens for the Operator Control Center, aligned with Shopify Polaris Design System. Tokens are defined for export to Figma Variables and CSS custom properties.

## Color Tokens

### Semantic Colors (Tile Status)

```json
{
  "color": {
    "status": {
      "healthy": {
        "text": "var(--p-color-text-success, #1a7f37)",
        "background": "var(--p-color-bg-success-subdued, #e3f9e5)",
        "border": "var(--p-color-border-success, #2e844a)"
      },
      "attention": {
        "text": "var(--p-color-text-critical, #d82c0d)",
        "background": "var(--p-color-bg-critical-subdued, #fff4f4)",
        "border": "var(--p-color-border-critical, #e85c4a)"
      },
      "unconfigured": {
        "text": "var(--p-color-text-subdued, #637381)",
        "background": "var(--p-color-bg-surface-subdued, #f6f6f7)",
        "border": "var(--p-color-border-subdued, #d2d5d8)"
      }
    }
  }
}
```

### Background & Surface

```json
{
  "color": {
    "background": {
      "primary": "var(--p-color-bg-surface, #ffffff)",
      "secondary": "var(--p-color-bg-surface-subdued, #f6f6f7)",
      "hover": "var(--p-color-bg-surface-hover, #f6f6f7)"
    }
  }
}
```

### Border Colors

```json
{
  "color": {
    "border": {
      "default": "var(--p-color-border-subdued, #d2d5d8)",
      "interactive": "var(--p-color-border-interactive, #2c6ecb)",
      "focus": "var(--p-color-border-focus, #2c6ecb)"
    }
  }
}
```

### Text Colors

```json
{
  "color": {
    "text": {
      "primary": "var(--p-color-text, #202223)",
      "secondary": "var(--p-color-text-subdued, #637381)",
      "interactive": "var(--p-color-text-interactive, #2c6ecb)",
      "success": "var(--p-color-text-success, #1a7f37)",
      "critical": "var(--p-color-text-critical, #d82c0d)",
      "warning": "var(--p-color-text-warning, #916a00)"
    }
  }
}
```

## Typography Tokens

### Font Families

```json
{
  "font": {
    "family": {
      "primary": "-apple-system, BlinkMacSystemFont, 'San Francisco', 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif",
      "monospace": "'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 'source-code-pro', monospace"
    }
  }
}
```

### Font Sizes

```json
{
  "font": {
    "size": {
      "xs": "0.75rem",
      "sm": "0.85rem",
      "base": "1rem",
      "lg": "1.15rem",
      "xl": "1.5rem",
      "2xl": "2rem"
    }
  }
}
```

### Font Weights

```json
{
  "font": {
    "weight": {
      "regular": 400,
      "medium": 500,
      "semibold": 600,
      "bold": 700
    }
  }
}
```

### Line Heights

```json
{
  "font": {
    "lineHeight": {
      "tight": 1.25,
      "normal": 1.5,
      "relaxed": 1.75
    }
  }
}
```

## Spacing Tokens

### Space Scale (Polaris-aligned)

```json
{
  "space": {
    "1": "var(--p-space-1, 4px)",
    "2": "var(--p-space-2, 8px)",
    "3": "var(--p-space-3, 12px)",
    "4": "var(--p-space-4, 16px)",
    "5": "var(--p-space-5, 20px)",
    "6": "var(--p-space-6, 24px)",
    "8": "var(--p-space-8, 32px)",
    "10": "var(--p-space-10, 40px)"
  }
}
```

### Semantic Spacing

```json
{
  "spacing": {
    "tile": {
      "padding": "var(--p-space-5, 20px)",
      "gap": "var(--p-space-5, 20px)",
      "internal": "var(--p-space-4, 16px)"
    },
    "modal": {
      "padding": "var(--p-space-6, 24px)",
      "gap": "var(--p-space-4, 16px)"
    }
  }
}
```

## Border Radius Tokens

```json
{
  "borderRadius": {
    "sm": "var(--p-border-radius-1, 8px)",
    "md": "var(--p-border-radius-2, 12px)",
    "lg": "var(--p-border-radius-3, 16px)",
    "full": "9999px"
  }
}
```

## Shadow Tokens

```json
{
  "shadow": {
    "sm": "var(--p-shadow-100, 0 1px 2px rgba(15, 23, 42, 0.12))",
    "md": "var(--p-shadow-200, 0 2px 4px rgba(15, 23, 42, 0.12))",
    "lg": "var(--p-shadow-300, 0 4px 8px rgba(15, 23, 42, 0.12))",
    "xl": "var(--p-shadow-400, 0 8px 16px rgba(15, 23, 42, 0.12))"
  }
}
```

## Animation Tokens

### Duration

```json
{
  "animation": {
    "duration": {
      "fast": "150ms",
      "normal": "250ms",
      "slow": "350ms"
    }
  }
}
```

### Easing

```json
{
  "animation": {
    "easing": {
      "default": "cubic-bezier(0.4, 0.0, 0.2, 1)",
      "in": "cubic-bezier(0.4, 0.0, 1, 1)",
      "out": "cubic-bezier(0.0, 0.0, 0.2, 1)",
      "inOut": "cubic-bezier(0.4, 0.0, 0.2, 1)"
    }
  }
}
```

## Component-Specific Tokens

### Tile Card

```json
{
  "component": {
    "tile": {
      "minWidth": "320px",
      "minHeight": "280px",
      "backgroundColor": "var(--p-color-bg-surface, #ffffff)",
      "borderColor": "var(--p-color-border-subdued, #d2d5d8)",
      "borderRadius": "var(--p-border-radius-2, 12px)",
      "boxShadow": "var(--p-shadow-100, 0 1px 2px rgba(15, 23, 42, 0.12))",
      "padding": "var(--p-space-5, 20px)",
      "gap": "var(--p-space-4, 16px)"
    }
  }
}
```

### Modal

```json
{
  "component": {
    "modal": {
      "width": "600px",
      "maxWidth": "90vw",
      "backgroundColor": "var(--p-color-bg-surface, #ffffff)",
      "borderRadius": "var(--p-border-radius-3, 16px)",
      "boxShadow": "var(--p-shadow-400, 0 8px 16px rgba(15, 23, 42, 0.12))",
      "padding": "var(--p-space-6, 24px)"
    }
  }
}
```

### Button

```json
{
  "component": {
    "button": {
      "primary": {
        "backgroundColor": "var(--p-color-bg-interactive, #2c6ecb)",
        "textColor": "var(--p-color-text-on-interactive, #ffffff)",
        "borderRadius": "var(--p-border-radius-1, 8px)",
        "padding": "var(--p-space-3, 12px) var(--p-space-4, 16px)",
        "fontSize": "1rem",
        "fontWeight": 600
      },
      "secondary": {
        "backgroundColor": "transparent",
        "textColor": "var(--p-color-text-interactive, #2c6ecb)",
        "borderColor": "var(--p-color-border-interactive, #2c6ecb)",
        "borderRadius": "var(--p-border-radius-1, 8px)",
        "padding": "var(--p-space-3, 12px) var(--p-space-4, 16px)",
        "fontSize": "1rem",
        "fontWeight": 600
      }
    }
  }
}
```

### Toast Notification

```json
{
  "component": {
    "toast": {
      "success": {
        "backgroundColor": "var(--p-color-bg-success-subdued, #e3f9e5)",
        "textColor": "var(--p-color-text-success, #1a7f37)",
        "borderColor": "var(--p-color-border-success, #2e844a)"
      },
      "error": {
        "backgroundColor": "var(--p-color-bg-critical-subdued, #fff4f4)",
        "textColor": "var(--p-color-text-critical, #d82c0d)",
        "borderColor": "var(--p-color-border-critical, #e85c4a)"
      },
      "info": {
        "backgroundColor": "var(--p-color-bg-info-subdued, #e8f5fa)",
        "textColor": "var(--p-color-text-info, #1f5d99)",
        "borderColor": "var(--p-color-border-info, #5c9ec7)"
      }
    }
  }
}
```

## Figma Variables Export

### Variable Collections

1. **Color Collection**
   - Mode: Light (default)
   - Mode: Dark (future)

2. **Spacing Collection**
   - Scale: Base (default)

3. **Typography Collection**
   - Font sizes
   - Font weights
   - Line heights

4. **Effect Collection**
   - Shadows
   - Blur effects

### Figma Variable Naming Convention

```
{category}/{subcategory}/{property}
```

Examples:

- `color/status/healthy-text`
- `spacing/tile/padding`
- `typography/size/base`
- `effect/shadow/md`

## CSS Custom Properties Implementation

```css
:root {
  /* Colors - Status */
  --occ-status-healthy-text: var(--p-color-text-success, #1a7f37);
  --occ-status-healthy-bg: var(--p-color-bg-success-subdued, #e3f9e5);
  --occ-status-healthy-border: var(--p-color-border-success, #2e844a);

  --occ-status-attention-text: var(--p-color-text-critical, #d82c0d);
  --occ-status-attention-bg: var(--p-color-bg-critical-subdued, #fff4f4);
  --occ-status-attention-border: var(--p-color-border-critical, #e85c4a);

  --occ-status-unconfigured-text: var(--p-color-text-subdued, #637381);
  --occ-status-unconfigured-bg: var(--p-color-bg-surface-subdued, #f6f6f7);
  --occ-status-unconfigured-border: var(--p-color-border-subdued, #d2d5d8);

  /* Spacing */
  --occ-tile-padding: var(--p-space-5, 20px);
  --occ-tile-gap: var(--p-space-5, 20px);
  --occ-tile-internal-gap: var(--p-space-4, 16px);

  /* Typography */
  --occ-font-size-heading: 1.15rem;
  --occ-font-size-metric: 1.5rem;
  --occ-font-size-body: 1rem;
  --occ-font-size-meta: 0.85rem;

  /* Shadows */
  --occ-shadow-tile: var(--p-shadow-100, 0 1px 2px rgba(15, 23, 42, 0.12));
  --occ-shadow-tile-hover: var(
    --p-shadow-200,
    0 2px 4px rgba(15, 23, 42, 0.12)
  );
  --occ-shadow-modal: var(--p-shadow-400, 0 8px 16px rgba(15, 23, 42, 0.12));

  /* Border Radius */
  --occ-radius-tile: var(--p-border-radius-2, 12px);
  --occ-radius-modal: var(--p-border-radius-3, 16px);
  --occ-radius-button: var(--p-border-radius-1, 8px);
}
```

## Handoff Instructions

### For Figma

1. Import tokens as Figma Variables
2. Apply variables to component properties
3. Create component variants for different states
4. Export components to Figma library
5. Share library link in feedback/manager.md

### For Engineer

1. Import tokens as CSS custom properties
2. Reference tokens in component styles (not hardcoded values)
3. Use Polaris fallback values for compatibility
4. Test token application across all states
5. Validate against Polaris guidelines

## Token Validation Checklist

- [ ] All color tokens have Polaris fallbacks
- [ ] Spacing tokens align with 4px grid system
- [ ] Typography tokens meet WCAG 2.2 AA contrast requirements
- [ ] Shadow tokens provide sufficient depth perception
- [ ] Animation tokens respect prefers-reduced-motion
- [ ] All tokens are documented with semantic names
- [ ] Figma variables match CSS custom properties exactly
