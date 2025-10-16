# Design Tokens Quick Reference Card

**File:** `docs/design/tokens-quick-reference.md`  
**Owner:** Designer  
**Version:** 1.0  
**Date:** 2025-10-15  
**Status:** Complete  
**Purpose:** Quick reference for most commonly used design tokens

---

## Spacing Tokens

```css
--occ-space-1: 4px;   /* Tight spacing, icon gaps */
--occ-space-2: 8px;   /* List items, inline elements */
--occ-space-3: 12px;  /* Form fields */
--occ-space-4: 16px;  /* Card padding, section gaps */
--occ-space-5: 20px;  /* Tile padding */
--occ-space-6: 24px;  /* Modal padding */
--occ-space-8: 32px;  /* Section spacing */
```

**Usage:**
```css
.tile { padding: var(--occ-space-5); }
.modal { padding: var(--occ-space-6); }
```

---

## Color Tokens

### Status Colors
```css
/* Success (Green) */
--occ-status-healthy-text: #1a7f37;
--occ-status-healthy-bg: #e3f9e5;

/* Critical (Red) */
--occ-status-attention-text: #d82c0d;
--occ-status-attention-bg: #fff4f4;

/* Info (Gray) */
--occ-status-unconfigured-text: #637381;
--occ-status-unconfigured-bg: #f6f6f7;
```

### Text Colors
```css
--occ-text-primary: #202223;    /* Body text */
--occ-text-secondary: #637381;  /* Meta text */
--occ-text-interactive: #2c6ecb; /* Links */
```

### Background Colors
```css
--occ-bg-primary: #ffffff;   /* Main background */
--occ-bg-secondary: #f6f6f7; /* Subtle background */
```

---

## Typography Tokens

### Font Sizes
```css
--occ-font-size-xs: 0.75rem;   /* 12px - Tiny text */
--occ-font-size-sm: 0.85rem;   /* 13.6px - Meta text */
--occ-font-size-base: 1rem;    /* 16px - Body text */
--occ-font-size-lg: 1.15rem;   /* 18.4px - Headings */
--occ-font-size-xl: 1.5rem;    /* 24px - Metrics */
--occ-font-size-2xl: 2rem;     /* 32px - Page titles */
```

### Font Weights
```css
--occ-font-weight-regular: 400;   /* Body text */
--occ-font-weight-semibold: 600;  /* Headings, emphasis */
--occ-font-weight-bold: 700;      /* Strong emphasis */
```

**Usage:**
```css
h2 {
  font-size: var(--occ-font-size-lg);
  font-weight: var(--occ-font-weight-semibold);
}
```

---

## Border Radius Tokens

```css
--occ-radius-sm: 8px;    /* Buttons, badges */
--occ-radius-md: 12px;   /* Tiles, cards */
--occ-radius-lg: 16px;   /* Modals */
--occ-radius-full: 9999px; /* Pills, circular */
```

---

## Shadow Tokens

```css
--occ-shadow-sm: 0 1px 2px rgba(15, 23, 42, 0.12);  /* Tiles */
--occ-shadow-md: 0 2px 4px rgba(15, 23, 42, 0.12);  /* Hover */
--occ-shadow-lg: 0 4px 8px rgba(15, 23, 42, 0.12);  /* Modals */
```

---

## Animation Tokens

```css
--occ-duration-fast: 150ms;    /* Hover, focus */
--occ-duration-normal: 250ms;  /* Transitions */
--occ-duration-slow: 350ms;    /* Modals, drawers */

--occ-easing-default: cubic-bezier(0.4, 0.0, 0.2, 1);
```

---

## Component-Specific Tokens

### Tile
```css
--occ-tile-padding: 20px;
--occ-tile-gap: 20px;
--occ-tile-min-width: 320px;
--occ-tile-min-height: 280px;
```

### Button
```css
--occ-button-primary-bg: #2c6ecb;
--occ-button-primary-text: #ffffff;
```

### Modal
```css
--occ-modal-width: 600px;
--occ-modal-padding: 24px;
```

---

## Polaris Token Mapping

| OCC Token | Polaris Equivalent |
|-----------|-------------------|
| `--occ-space-4` | `--p-space-4` (16px) |
| `--occ-text-primary` | `--p-color-text` |
| `--occ-bg-primary` | `--p-color-bg-surface` |
| `--occ-border-default` | `--p-color-border-subdued` |

---

## Usage Examples

### Tile Styling
```css
.tile {
  padding: var(--occ-tile-padding);
  border-radius: var(--occ-radius-md);
  box-shadow: var(--occ-shadow-sm);
  background: var(--occ-bg-primary);
}
```

### Button Styling
```css
.button {
  padding: var(--occ-space-2) var(--occ-space-4);
  border-radius: var(--occ-radius-sm);
  font-size: var(--occ-font-size-base);
  font-weight: var(--occ-font-weight-semibold);
  transition: background-color var(--occ-duration-fast) var(--occ-easing-default);
}
```

### Typography
```css
h2 {
  font-size: var(--occ-font-size-lg);
  font-weight: var(--occ-font-weight-semibold);
  color: var(--occ-text-primary);
  margin-bottom: var(--occ-space-3);
}

p {
  font-size: var(--occ-font-size-base);
  color: var(--occ-text-primary);
  line-height: 1.5;
}

.meta {
  font-size: var(--occ-font-size-sm);
  color: var(--occ-text-secondary);
}
```

---

## Responsive Adjustments

### Mobile (< 768px)
```css
@media (max-width: 767px) {
  :root {
    --occ-tile-padding: 16px;
    --occ-font-size-lg: 1.05rem;
  }
}
```

### Desktop (1024px+)
```css
@media (min-width: 1024px) {
  :root {
    --occ-tile-padding: 20px;
    --occ-font-size-lg: 1.15rem;
  }
}
```

---

## Common Patterns

### Card with Status
```tsx
<Card>
  <BlockStack gap="400">
    <InlineStack align="space-between">
      <Text variant="headingMd">Title</Text>
      <Badge tone="success">Healthy</Badge>
    </InlineStack>
    <Text variant="bodySm" tone="subdued">
      Last updated 2 min ago
    </Text>
  </BlockStack>
</Card>
```

### Button Group
```tsx
<ButtonGroup>
  <Button variant="primary">Approve</Button>
  <Button variant="secondary">Reject</Button>
</ButtonGroup>
```

### Error Banner
```tsx
<Banner tone="critical">
  <p>Unable to connect. Check your network.</p>
</Banner>
```

---

## References

- **Full Documentation:** `docs/design/design-tokens.md`
- **Implementation:** `app/styles/tokens.css`
- **Polaris Tokens:** https://polaris.shopify.com/tokens

