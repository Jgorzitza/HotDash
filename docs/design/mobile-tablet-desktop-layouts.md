# Mobile, Tablet, Desktop Layout Specifications

**File:** `docs/design/mobile-tablet-desktop-layouts.md`  
**Owner:** Designer  
**Version:** 1.0  
**Date:** 2025-10-15  
**Status:** Complete  
**Purpose:** Comprehensive responsive layout specifications for all breakpoints

---

## 1. Breakpoint System

### Mobile: 320px - 767px
- **Grid:** 1 column
- **Padding:** 16px
- **Touch targets:** 44x44px minimum
- **Font scale:** 0.9x

### Tablet: 768px - 1023px
- **Grid:** 2 columns
- **Padding:** 24px
- **Touch targets:** 44x44px minimum
- **Font scale:** 1x

### Desktop: 1024px+
- **Grid:** 3-4 columns (auto-fit)
- **Padding:** 32px
- **Click targets:** 36x36px minimum
- **Font scale:** 1x

---

## 2. Mobile Layouts (< 768px)

### 2.1 Dashboard Tile Grid

```css
.occ-tile-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  padding: 16px;
}
```

**Visual:**
```
┌─────────────────────┐
│  Ops Pulse          │
│  [Healthy]          │
│  Activation: 85%    │
└─────────────────────┘
┌─────────────────────┐
│  Sales Pulse        │
│  [Healthy]          │
│  $1,250.50          │
└─────────────────────┘
┌─────────────────────┐
│  Fulfillment Health │
│  [Healthy]          │
│  All on track       │
└─────────────────────┘
```

### 2.2 Tile Card Internal Layout

**Stack vertically:**
```tsx
<Card>
  <BlockStack gap="300">
    {/* Header */}
    <InlineStack align="space-between" blockAlign="start">
      <Text variant="headingMd">Sales Pulse</Text>
      <Badge tone="success">Healthy</Badge>
    </InlineStack>
    
    {/* Meta */}
    <Text variant="bodySm" tone="subdued">
      Last updated 2 min ago
    </Text>
    
    {/* Content - stacked */}
    <BlockStack gap="200">
      <Text variant="bodyLg">$1,250.50</Text>
      <Text variant="bodySm">15 orders</Text>
    </BlockStack>
    
    {/* Action */}
    <Button fullWidth>View details</Button>
  </BlockStack>
</Card>
```

### 2.3 Approvals Card

**Full width, stacked:**
```tsx
<Card>
  <BlockStack gap="300">
    <InlineStack align="space-between">
      <Text variant="headingMd">CX Reply</Text>
      <Badge tone="warning">High risk</Badge>
    </InlineStack>
    
    <Text variant="bodySm">Shipping delay apology</Text>
    
    <Text variant="bodySm" tone="subdued">
      Created 2 min ago by ai-customer
    </Text>
    
    {/* Actions - full width, stacked */}
    <BlockStack gap="200">
      <Button variant="primary" fullWidth>Approve</Button>
      <Button variant="secondary" fullWidth>Reject</Button>
    </BlockStack>
  </BlockStack>
</Card>
```

### 2.4 Modal/Drawer

**Full screen:**
```css
.occ-modal-mobile {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
  border-radius: 0;
  padding: 16px;
}
```

---

## 3. Tablet Layouts (768px - 1023px)

### 3.1 Dashboard Tile Grid

```css
@media (min-width: 768px) {
  .occ-tile-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
    padding: 24px;
  }
}
```

**Visual:**
```
┌──────────────────┐  ┌──────────────────┐
│  Ops Pulse       │  │  Sales Pulse     │
│  [Healthy]       │  │  [Healthy]       │
│  Activation: 85% │  │  $1,250.50       │
└──────────────────┘  └──────────────────┘
┌──────────────────┐  ┌──────────────────┐
│  Fulfillment     │  │  Inventory       │
│  [Healthy]       │  │  [Attention]     │
│  All on track    │  │  5 low stock     │
└──────────────────┘  └──────────────────┘
```

### 3.2 Tile Card Internal Layout

**Horizontal where appropriate:**
```tsx
<Card>
  <BlockStack gap="400">
    <InlineStack align="space-between">
      <Text variant="headingMd">Sales Pulse</Text>
      <Badge tone="success">Healthy</Badge>
    </InlineStack>
    
    {/* Content - can be horizontal */}
    <InlineStack gap="400" align="space-between">
      <BlockStack gap="100">
        <Text variant="bodyLg">$1,250.50</Text>
        <Text variant="bodySm" tone="subdued">Revenue</Text>
      </BlockStack>
      <BlockStack gap="100">
        <Text variant="bodyLg">15</Text>
        <Text variant="bodySm" tone="subdued">Orders</Text>
      </BlockStack>
    </InlineStack>
    
    <Button>View details</Button>
  </BlockStack>
</Card>
```

### 3.3 Approvals Card

**Horizontal actions:**
```tsx
<Card>
  <BlockStack gap="300">
    <InlineStack align="space-between">
      <Text variant="headingMd">CX Reply</Text>
      <Badge tone="warning">High risk</Badge>
    </InlineStack>
    
    <Text variant="bodySm">Shipping delay apology</Text>
    
    {/* Actions - horizontal */}
    <ButtonGroup>
      <Button variant="primary">Approve</Button>
      <Button variant="secondary">Reject</Button>
    </ButtonGroup>
  </BlockStack>
</Card>
```

### 3.4 Modal/Drawer

**80% width:**
```css
@media (min-width: 768px) {
  .occ-modal {
    width: 80vw;
    max-width: 600px;
    height: auto;
    border-radius: 16px;
    padding: 24px;
  }
}
```

---

## 4. Desktop Layouts (1024px+)

### 4.1 Dashboard Tile Grid

```css
@media (min-width: 1024px) {
  .occ-tile-grid {
    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    gap: 20px;
    padding: 32px;
  }
}
```

**Visual (3 columns):**
```
┌────────────┐  ┌────────────┐  ┌────────────┐
│ Ops Pulse  │  │ Sales      │  │ Fulfillment│
│ [Healthy]  │  │ [Healthy]  │  │ [Healthy]  │
│ 85%        │  │ $1,250.50  │  │ All good   │
└────────────┘  └────────────┘  └────────────┘
┌────────────┐  ┌────────────┐  ┌────────────┐
│ Inventory  │  │ CX Escal.  │  │ Approvals  │
│ [Attention]│  │ [Healthy]  │  │ [Review]   │
│ 5 low      │  │ No issues  │  │ 3 pending  │
└────────────┘  └────────────┘  └────────────┘
```

### 4.2 Tile Card Internal Layout

**Multi-column where beneficial:**
```tsx
<Card>
  <BlockStack gap="400">
    <InlineStack align="space-between">
      <Text variant="headingMd">Sales Pulse</Text>
      <Badge tone="success">Healthy</Badge>
    </InlineStack>
    
    {/* Content - 3 columns */}
    <InlineStack gap="400" align="space-between">
      <BlockStack gap="100">
        <Text variant="bodyLg">$1,250.50</Text>
        <Text variant="bodySm" tone="subdued">Revenue</Text>
      </BlockStack>
      <BlockStack gap="100">
        <Text variant="bodyLg">15</Text>
        <Text variant="bodySm" tone="subdued">Orders</Text>
      </BlockStack>
      <BlockStack gap="100">
        <Text variant="bodyLg">$83.37</Text>
        <Text variant="bodySm" tone="subdued">AOV</Text>
      </BlockStack>
    </InlineStack>
    
    <InlineStack gap="200">
      <Button>View details</Button>
      <Button variant="plain">Export</Button>
    </InlineStack>
  </BlockStack>
</Card>
```

### 4.3 Approvals Card

**Compact, horizontal:**
```tsx
<Card>
  <InlineStack align="space-between" blockAlign="center">
    <BlockStack gap="100">
      <InlineStack gap="200">
        <Text variant="headingMd">CX Reply</Text>
        <Badge tone="warning">High risk</Badge>
      </InlineStack>
      <Text variant="bodySm" tone="subdued">
        Shipping delay apology · 2 min ago
      </Text>
    </BlockStack>
    
    <ButtonGroup>
      <Button variant="primary">Approve</Button>
      <Button variant="secondary">Reject</Button>
    </ButtonGroup>
  </InlineStack>
</Card>
```

### 4.4 Modal/Drawer

**60% width, max 800px:**
```css
@media (min-width: 1024px) {
  .occ-modal {
    width: 60vw;
    max-width: 800px;
    padding: 24px;
  }
}
```

---

## 5. Component Adaptations

### 5.1 Navigation

**Mobile:**
- Hamburger menu
- Bottom nav bar (optional)
- Full-screen overlay

**Tablet:**
- Collapsed sidebar with icons
- Expandable on tap

**Desktop:**
- Full sidebar navigation
- Always visible
- Hover states

### 5.2 Page Header

**Mobile:**
```tsx
<BlockStack gap="200">
  <Text variant="headingLg">Dashboard</Text>
  <Button fullWidth>Refresh</Button>
</BlockStack>
```

**Tablet/Desktop:**
```tsx
<InlineStack align="space-between">
  <Text variant="headingLg">Dashboard</Text>
  <ButtonGroup>
    <Button>Refresh</Button>
    <Button variant="plain">Export</Button>
  </ButtonGroup>
</InlineStack>
```

### 5.3 Forms

**Mobile:**
- Full width inputs
- Stacked labels
- Full width buttons

**Tablet/Desktop:**
- Inline labels (where appropriate)
- Multi-column forms
- Button groups

---

## 6. Touch vs Mouse Interactions

### 6.1 Mobile/Tablet (Touch)

**Touch targets:**
- Minimum: 44x44px
- Recommended: 48x48px
- Spacing: 8px minimum

**Interactions:**
- Tap to activate
- Swipe to dismiss (modals)
- Pull to refresh
- Long press for context menu

**No hover states:**
```css
@media (hover: none) {
  .button:hover {
    /* No hover effect */
  }
}
```

### 6.2 Desktop (Mouse)

**Click targets:**
- Minimum: 36x36px
- Recommended: 40x40px

**Interactions:**
- Click to activate
- Hover for preview
- Right-click for context menu
- Keyboard shortcuts

**Hover states:**
```css
@media (hover: hover) {
  .button:hover {
    background-color: var(--occ-bg-hover);
  }
}
```

---

## 7. Typography Scaling

### 7.1 Mobile

```css
@media (max-width: 767px) {
  :root {
    --occ-font-size-heading: 1.05rem;
    --occ-font-size-metric: 1.35rem;
    --occ-font-size-body: 0.95rem;
  }
}
```

### 7.2 Tablet/Desktop

```css
@media (min-width: 768px) {
  :root {
    --occ-font-size-heading: 1.15rem;
    --occ-font-size-metric: 1.5rem;
    --occ-font-size-body: 1rem;
  }
}
```

---

## 8. Implementation Checklist

### 8.1 Mobile
- [ ] Single column grid
- [ ] Full width cards
- [ ] Stacked layouts
- [ ] 44x44px touch targets
- [ ] Full screen modals
- [ ] Reduced font sizes
- [ ] Swipe gestures

### 8.2 Tablet
- [ ] 2 column grid
- [ ] Horizontal layouts where appropriate
- [ ] 44x44px touch targets
- [ ] 80% width modals
- [ ] Standard font sizes
- [ ] Touch + mouse support

### 8.3 Desktop
- [ ] 3-4 column auto-fit grid
- [ ] Multi-column layouts
- [ ] 36x36px click targets
- [ ] 60% width modals (max 800px)
- [ ] Hover states
- [ ] Keyboard shortcuts

---

## 9. Testing Checklist

### 9.1 Devices
- [ ] iPhone SE (375px)
- [ ] iPhone 14 (390px)
- [ ] iPad Mini (768px)
- [ ] iPad Pro (1024px)
- [ ] Desktop (1280px, 1920px)

### 9.2 Orientations
- [ ] Portrait (all devices)
- [ ] Landscape (all devices)
- [ ] Rotation transitions smooth

### 9.3 Interactions
- [ ] Touch targets adequate (mobile/tablet)
- [ ] Hover states work (desktop)
- [ ] Keyboard navigation (desktop)
- [ ] Swipe gestures (mobile)

---

## 10. References

- **Responsive Breakpoints:** `docs/design/responsive-breakpoints.md`
- **Dashboard Tiles:** `docs/design/dashboard-tiles.md`
- **Design Tokens:** `docs/design/design-tokens.md`
- **Polaris Responsive:** https://polaris.shopify.com/design/responsive

