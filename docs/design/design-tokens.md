# Design Tokens Documentation

**File:** `docs/design/design-tokens.md`  
**Owner:** Designer  
**Version:** 1.0  
**Date:** 2025-10-15  
**Status:** Complete

---

## 1. Purpose

Comprehensive documentation of design tokens for the Hot Rod AN Control Center, ensuring consistency and maintainability across all components.

---

## 2. Token System Overview

### 2.1 Token Hierarchy

1. **Primitive Tokens** - Base values (colors, sizes)
2. **Semantic Tokens** - Purpose-based (text-primary, bg-surface)
3. **Component Tokens** - Component-specific (tile-padding, button-bg)

### 2.2 Naming Convention

**Format:** `--occ-[category]-[property]-[variant]`

**Examples:**
- `--occ-color-text-primary`
- `--occ-space-4`
- `--occ-tile-padding`

---

## 3. Color Tokens

### 3.1 Status Colors

**Healthy (Success):**
```css
--occ-status-healthy-text: #1a7f37;
--occ-status-healthy-bg: #e3f9e5;
--occ-status-healthy-border: #2e844a;
```

**Attention (Critical):**
```css
--occ-status-attention-text: #d82c0d;
--occ-status-attention-bg: #fff4f4;
--occ-status-attention-border: #e85c4a;
```

**Unconfigured (Info):**
```css
--occ-status-unconfigured-text: #637381;
--occ-status-unconfigured-bg: #f6f6f7;
--occ-status-unconfigured-border: #d2d5d8;
```

### 3.2 Background Colors

```css
--occ-bg-primary: #ffffff;
--occ-bg-secondary: #f6f6f7;
--occ-bg-hover: #f6f6f7;
```

### 3.3 Border Colors

```css
--occ-border-default: #d2d5d8;
--occ-border-interactive: #2c6ecb;
--occ-border-focus: #2c6ecb;
```

### 3.4 Text Colors

```css
--occ-text-primary: #202223;
--occ-text-secondary: #637381;
--occ-text-interactive: #2c6ecb;
--occ-text-success: #1a7f37;
--occ-text-critical: #d82c0d;
--occ-text-warning: #916a00;
```

### 3.5 Color Contrast Ratios

| Token | Foreground | Background | Ratio | WCAG |
|-------|------------|------------|-------|------|
| `text-primary` | #202223 | #ffffff | 16.6:1 | AAA |
| `text-secondary` | #637381 | #ffffff | 5.7:1 | AA |
| `status-healthy-text` | #1a7f37 | #e3f9e5 | 4.8:1 | AA |
| `status-attention-text` | #d82c0d | #fff4f4 | 4.6:1 | AA |
| `status-unconfigured-text` | #637381 | #f6f6f7 | 4.5:1 | AA |

---

## 4. Spacing Tokens

### 4.1 Base Spacing Scale

```css
--occ-space-1: 4px;
--occ-space-2: 8px;
--occ-space-3: 12px;
--occ-space-4: 16px;
--occ-space-5: 20px;
--occ-space-6: 24px;
--occ-space-8: 32px;
--occ-space-10: 40px;
```

### 4.2 Semantic Spacing

**Tile:**
```css
--occ-tile-padding: 20px;
--occ-tile-gap: 20px;
--occ-tile-internal-gap: 16px;
```

**Modal:**
```css
--occ-modal-padding: 24px;
--occ-modal-gap: 16px;
```

### 4.3 Usage Guidelines

| Token | Use Case |
|-------|----------|
| `space-1` (4px) | Icon spacing, tight gaps |
| `space-2` (8px) | List item gaps, inline spacing |
| `space-3` (12px) | Form field spacing |
| `space-4` (16px) | Card padding, section gaps |
| `space-5` (20px) | Tile padding, large gaps |
| `space-6` (24px) | Modal padding, page margins |
| `space-8` (32px) | Section spacing, large margins |
| `space-10` (40px) | Page padding, hero spacing |

---

## 5. Typography Tokens

### 5.1 Font Families

```css
--occ-font-family-primary: -apple-system, BlinkMacSystemFont, 'San Francisco', 
  'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
--occ-font-family-monospace: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', 
  'source-code-pro', monospace;
```

### 5.2 Font Sizes

**Base Scale:**
```css
--occ-font-size-xs: 0.75rem;   /* 12px */
--occ-font-size-sm: 0.85rem;   /* 13.6px */
--occ-font-size-base: 1rem;    /* 16px */
--occ-font-size-lg: 1.15rem;   /* 18.4px */
--occ-font-size-xl: 1.5rem;    /* 24px */
--occ-font-size-2xl: 2rem;     /* 32px */
```

**Semantic Sizes:**
```css
--occ-font-size-heading: 1.15rem;  /* 18.4px */
--occ-font-size-metric: 1.5rem;    /* 24px */
--occ-font-size-body: 1rem;        /* 16px */
--occ-font-size-meta: 0.85rem;     /* 13.6px */
```

### 5.3 Font Weights

```css
--occ-font-weight-regular: 400;
--occ-font-weight-medium: 500;
--occ-font-weight-semibold: 600;
--occ-font-weight-bold: 700;
```

### 5.4 Line Heights

```css
--occ-line-height-tight: 1.25;
--occ-line-height-normal: 1.5;
--occ-line-height-relaxed: 1.75;
```

### 5.5 Typography Scale

| Element | Size | Weight | Line Height |
|---------|------|--------|-------------|
| H1 | 2rem (32px) | 700 | 1.25 |
| H2 | 1.5rem (24px) | 600 | 1.25 |
| H3 | 1.15rem (18.4px) | 600 | 1.25 |
| Body | 1rem (16px) | 400 | 1.5 |
| Small | 0.85rem (13.6px) | 400 | 1.5 |
| Metric | 1.5rem (24px) | 600 | 1.25 |

---

## 6. Border Radius Tokens

### 6.1 Base Scale

```css
--occ-radius-sm: 8px;
--occ-radius-md: 12px;
--occ-radius-lg: 16px;
--occ-radius-full: 9999px;
```

### 6.2 Semantic Radius

```css
--occ-radius-tile: 12px;
--occ-radius-modal: 16px;
--occ-radius-button: 8px;
```

### 6.3 Usage Guidelines

| Token | Use Case |
|-------|----------|
| `radius-sm` (8px) | Buttons, badges, small cards |
| `radius-md` (12px) | Tiles, cards, inputs |
| `radius-lg` (16px) | Modals, large containers |
| `radius-full` (9999px) | Pills, circular buttons |

---

## 7. Shadow Tokens

### 7.1 Base Scale

```css
--occ-shadow-sm: 0 1px 2px rgba(15, 23, 42, 0.12);
--occ-shadow-md: 0 2px 4px rgba(15, 23, 42, 0.12);
--occ-shadow-lg: 0 4px 8px rgba(15, 23, 42, 0.12);
--occ-shadow-xl: 0 8px 16px rgba(15, 23, 42, 0.12);
```

### 7.2 Semantic Shadows

```css
--occ-shadow-tile: 0 1px 2px rgba(15, 23, 42, 0.12);
--occ-shadow-tile-hover: 0 2px 4px rgba(15, 23, 42, 0.12);
--occ-shadow-modal: 0 8px 16px rgba(15, 23, 42, 0.12);
```

### 7.3 Usage Guidelines

| Token | Use Case | Elevation |
|-------|----------|-----------|
| `shadow-sm` | Tiles, cards | Low |
| `shadow-md` | Hover states, dropdowns | Medium |
| `shadow-lg` | Modals, popovers | High |
| `shadow-xl` | Overlays, drawers | Very high |

---

## 8. Animation Tokens

### 8.1 Duration

```css
--occ-duration-fast: 150ms;
--occ-duration-normal: 250ms;
--occ-duration-slow: 350ms;
```

### 8.2 Easing

```css
--occ-easing-default: cubic-bezier(0.4, 0.0, 0.2, 1);
--occ-easing-in: cubic-bezier(0.4, 0.0, 1, 1);
--occ-easing-out: cubic-bezier(0.0, 0.0, 0.2, 1);
--occ-easing-in-out: cubic-bezier(0.4, 0.0, 0.2, 1);
```

### 8.3 Usage Guidelines

| Token | Use Case |
|-------|----------|
| `duration-fast` (150ms) | Hover states, focus |
| `duration-normal` (250ms) | Transitions, fades |
| `duration-slow` (350ms) | Modals, drawers |

| Easing | Use Case |
|--------|----------|
| `easing-default` | General transitions |
| `easing-in` | Elements leaving |
| `easing-out` | Elements entering |
| `easing-in-out` | Elements moving |

---

## 9. Component Tokens

### 9.1 Tile

```css
--occ-tile-min-width: 320px;
--occ-tile-min-height: 280px;
--occ-tile-bg: #ffffff;
--occ-tile-border: #d2d5d8;
--occ-tile-padding: 20px;
--occ-tile-gap: 20px;
--occ-tile-internal-gap: 16px;
```

### 9.2 Button

```css
--occ-button-primary-bg: #2c6ecb;
--occ-button-primary-text: #ffffff;
--occ-button-secondary-bg: transparent;
--occ-button-secondary-text: #2c6ecb;
--occ-button-secondary-border: #2c6ecb;
```

### 9.3 Modal

```css
--occ-modal-width: 600px;
--occ-modal-max-width: 90vw;
--occ-modal-bg: #ffffff;
--occ-modal-padding: 24px;
--occ-modal-gap: 16px;
```

### 9.4 Toast

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

---

## 10. Polaris Token Mapping

### 10.1 Color Mapping

| OCC Token | Polaris Token |
|-----------|---------------|
| `--occ-text-primary` | `--p-color-text` |
| `--occ-text-secondary` | `--p-color-text-subdued` |
| `--occ-bg-primary` | `--p-color-bg-surface` |
| `--occ-bg-secondary` | `--p-color-bg-surface-subdued` |
| `--occ-border-default` | `--p-color-border-subdued` |
| `--occ-border-interactive` | `--p-color-border-interactive` |

### 10.2 Spacing Mapping

| OCC Token | Polaris Token |
|-----------|---------------|
| `--occ-space-1` | `--p-space-1` (4px) |
| `--occ-space-2` | `--p-space-2` (8px) |
| `--occ-space-4` | `--p-space-4` (16px) |
| `--occ-space-5` | `--p-space-5` (20px) |
| `--occ-space-6` | `--p-space-6` (24px) |

### 10.3 Shadow Mapping

| OCC Token | Polaris Token |
|-----------|---------------|
| `--occ-shadow-sm` | `--p-shadow-100` |
| `--occ-shadow-md` | `--p-shadow-200` |
| `--occ-shadow-lg` | `--p-shadow-300` |
| `--occ-shadow-xl` | `--p-shadow-400` |

---

## 11. Usage Examples

### 11.1 Using Color Tokens

```css
.tile {
  background-color: var(--occ-bg-primary);
  color: var(--occ-text-primary);
  border: 1px solid var(--occ-border-default);
}

.tile-status-healthy {
  color: var(--occ-status-healthy-text);
  background-color: var(--occ-status-healthy-bg);
}
```

### 11.2 Using Spacing Tokens

```css
.tile {
  padding: var(--occ-tile-padding);
  gap: var(--occ-tile-internal-gap);
}

.tile-grid {
  gap: var(--occ-tile-gap);
}
```

### 11.3 Using Typography Tokens

```css
.heading {
  font-size: var(--occ-font-size-heading);
  font-weight: var(--occ-font-weight-semibold);
  line-height: var(--occ-line-height-tight);
}

.metric {
  font-size: var(--occ-font-size-metric);
  font-weight: var(--occ-font-weight-semibold);
}
```

### 11.4 Using Animation Tokens

```css
.button {
  transition: background-color var(--occ-duration-fast) var(--occ-easing-default);
}

.modal {
  animation: slide-in var(--occ-duration-normal) var(--occ-easing-out);
}
```

---

## 12. Token Maintenance

### 12.1 Adding New Tokens

1. **Define in tokens.css** - Add to `:root` block
2. **Document here** - Add to appropriate section
3. **Update Polaris mapping** - If using Polaris fallback
4. **Test contrast** - Verify WCAG AA compliance
5. **Update components** - Use new token

### 12.2 Modifying Tokens

1. **Check usage** - Search codebase for token usage
2. **Test impact** - Verify all components still work
3. **Update documentation** - Update this file
4. **Visual regression test** - Capture screenshots

### 12.3 Deprecating Tokens

1. **Mark as deprecated** - Add comment in tokens.css
2. **Find replacements** - Identify alternative tokens
3. **Update components** - Migrate to new tokens
4. **Remove after migration** - Delete deprecated token

---

## 13. Dark Mode (Future)

### 13.1 Planned Dark Mode Tokens

```css
@media (prefers-color-scheme: dark) {
  :root {
    --occ-bg-primary: #1a1a1a;
    --occ-bg-secondary: #2a2a2a;
    --occ-text-primary: #ffffff;
    --occ-text-secondary: #a0a0a0;
    --occ-border-default: #3a3a3a;
  }
}
```

### 13.2 Implementation Strategy

1. Define dark mode color palette
2. Test contrast ratios (WCAG AA)
3. Update all color tokens
4. Test all components
5. Add theme toggle

---

## 14. References

- Token implementation: `app/styles/tokens.css`
- Polaris tokens: https://polaris.shopify.com/tokens
- WCAG contrast: https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum
- Design system: `docs/design/design-system-guide.md`

