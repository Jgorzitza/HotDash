# Interactive States & Iconography

**File:** `docs/design/interactive-states-iconography.md`  
**Owner:** Designer  
**Version:** 1.0  
**Date:** 2025-10-15  
**Status:** Complete  
**Purpose:** Interactive states (hover/focus/active) and iconography set

---

## 1. Interactive States

### 1.1 Button States

**Default:**
```css
.button {
  background-color: var(--occ-button-primary-bg);
  color: var(--occ-button-primary-text);
  border: none;
  transition: background-color 150ms ease;
}
```

**Hover:**
```css
.button:hover {
  background-color: var(--occ-button-primary-bg-hover);
  cursor: pointer;
}
```

**Focus:**
```css
.button:focus-visible {
  outline: 2px solid var(--occ-border-focus);
  outline-offset: 2px;
  box-shadow: 0 0 0 3px rgba(44, 110, 203, 0.2);
}
```

**Active (Pressed):**
```css
.button:active {
  background-color: var(--occ-button-primary-bg-active);
  transform: translateY(1px);
}
```

**Disabled:**
```css
.button:disabled {
  background-color: var(--occ-bg-secondary);
  color: var(--occ-text-secondary);
  cursor: not-allowed;
  opacity: 0.5;
}
```

**Loading:**
```css
.button[aria-busy="true"] {
  cursor: wait;
  opacity: 0.7;
}
```

### 1.2 Tile Card States

**Default:**
```css
.tile {
  background: var(--occ-bg-primary);
  border: 1px solid var(--occ-border-default);
  box-shadow: var(--occ-shadow-sm);
  transition: all 150ms ease;
}
```

**Hover (if interactive):**
```css
.tile:hover {
  border-color: var(--occ-border-interactive);
  box-shadow: var(--occ-shadow-md);
  cursor: pointer;
}
```

**Focus:**
```css
.tile:focus-visible {
  outline: 2px solid var(--occ-border-focus);
  outline-offset: 2px;
}
```

**Active (Pressed):**
```css
.tile:active {
  transform: scale(0.99);
}
```

### 1.3 Link States

**Default:**
```css
a {
  color: var(--occ-text-interactive);
  text-decoration: none;
  transition: color 150ms ease;
}
```

**Hover:**
```css
a:hover {
  color: var(--occ-text-interactive-hover);
  text-decoration: underline;
}
```

**Focus:**
```css
a:focus-visible {
  outline: 2px solid var(--occ-border-focus);
  outline-offset: 2px;
  text-decoration: underline;
}
```

**Visited:**
```css
a:visited {
  color: var(--occ-text-interactive-visited);
}
```

### 1.4 Input States

**Default:**
```css
input {
  border: 1px solid var(--occ-border-default);
  background: var(--occ-bg-primary);
  transition: border-color 150ms ease;
}
```

**Hover:**
```css
input:hover {
  border-color: var(--occ-border-interactive);
}
```

**Focus:**
```css
input:focus {
  border-color: var(--occ-border-focus);
  outline: 2px solid var(--occ-border-focus);
  outline-offset: 0;
}
```

**Error:**
```css
input[aria-invalid="true"] {
  border-color: var(--occ-status-attention-border);
}
```

**Disabled:**
```css
input:disabled {
  background: var(--occ-bg-secondary);
  color: var(--occ-text-secondary);
  cursor: not-allowed;
}
```

---

## 2. Iconography Set

### 2.1 Status Icons

**Success (Healthy):**
- Icon: `CheckCircleIcon` (Polaris)
- Color: Green (`var(--occ-text-success)`)
- Usage: Healthy tiles, success messages, completed actions

**Error (Critical):**
- Icon: `AlertCircleIcon` (Polaris)
- Color: Red (`var(--occ-text-critical)`)
- Usage: Error tiles, error messages, failed actions

**Warning (Attention):**
- Icon: `AlertTriangleIcon` (Polaris)
- Color: Yellow (`var(--occ-text-warning)`)
- Usage: Warning tiles, attention messages, risky actions

**Info (Configuration):**
- Icon: `InfoIcon` (Polaris)
- Color: Blue (`var(--occ-text-info)`)
- Usage: Info messages, unconfigured tiles, help text

### 2.2 Action Icons

**Approve:**
- Icon: `CheckIcon` (Polaris)
- Color: Green
- Usage: Approve buttons, success actions

**Reject:**
- Icon: `XIcon` (Polaris)
- Color: Red
- Usage: Reject buttons, cancel actions

**Edit:**
- Icon: `EditIcon` (Polaris)
- Color: Default
- Usage: Edit buttons, modify actions

**Delete:**
- Icon: `DeleteIcon` (Polaris)
- Color: Red
- Usage: Delete buttons, remove actions

**Refresh:**
- Icon: `RefreshIcon` (Polaris)
- Color: Default
- Usage: Refresh buttons, reload actions

**View:**
- Icon: `ViewIcon` (Polaris)
- Color: Default
- Usage: View details buttons, expand actions

**Close:**
- Icon: `XIcon` (Polaris)
- Color: Default
- Usage: Close buttons, dismiss actions

### 2.3 Navigation Icons

**Next:**
- Icon: `ChevronRightIcon` (Polaris)
- Color: Default
- Usage: Next buttons, forward navigation

**Previous:**
- Icon: `ChevronLeftIcon` (Polaris)
- Color: Default
- Usage: Previous buttons, back navigation

**Up:**
- Icon: `ChevronUpIcon` (Polaris)
- Color: Default
- Usage: Collapse, scroll up

**Down:**
- Icon: `ChevronDownIcon` (Polaris)
- Color: Default
- Usage: Expand, scroll down

**External Link:**
- Icon: `ExternalIcon` (Polaris)
- Color: Default
- Usage: External links, open in new tab

### 2.4 Data Icons

**Chart:**
- Icon: `ChartIcon` (Polaris)
- Color: Default
- Usage: Chart tiles, analytics

**List:**
- Icon: `ListIcon` (Polaris)
- Color: Default
- Usage: List tiles, items

**Calendar:**
- Icon: `CalendarIcon` (Polaris)
- Color: Default
- Usage: Date fields, time-based data

**Clock:**
- Icon: `ClockIcon` (Polaris)
- Color: Default
- Usage: Time stamps, duration

**User:**
- Icon: `PersonIcon` (Polaris)
- Color: Default
- Usage: User attribution, customer data

### 2.5 Tile-Specific Icons

**Ops Pulse:**
- Icon: `ActivityIcon` (Polaris)
- Color: Default
- Usage: Activation metrics, SLA

**Sales Pulse:**
- Icon: `CashDollarIcon` (Polaris)
- Color: Default
- Usage: Revenue, orders

**Fulfillment Health:**
- Icon: `PackageIcon` (Polaris)
- Color: Default
- Usage: Orders, shipping

**Inventory Heatmap:**
- Icon: `InventoryIcon` (Polaris)
- Color: Default
- Usage: Stock levels, alerts

**CX Escalations:**
- Icon: `ChatIcon` (Polaris)
- Color: Default
- Usage: Conversations, support

**SEO Content:**
- Icon: `SearchIcon` (Polaris)
- Color: Default
- Usage: Search rankings, traffic

**Approvals Queue:**
- Icon: `ChecklistIcon` (Polaris)
- Color: Default
- Usage: Pending approvals, review

---

## 3. Icon Usage Guidelines

### 3.1 Size

**Small:** 16px (inline with text)  
**Medium:** 20px (buttons, badges)  
**Large:** 24px (tile headers, page headers)  
**Extra Large:** 32px (empty states, illustrations)

### 3.2 Color

**Default:** Inherit from parent text color  
**Status:** Use status colors (success, critical, warning, info)  
**Interactive:** Use interactive color on hover

### 3.3 Accessibility

**Always provide text alternative:**
```tsx
<Icon source={CheckCircleIcon} />
<span className="sr-only">Success</span>
```

**Or use aria-label:**
```tsx
<Icon source={CheckCircleIcon} aria-label="Success" />
```

**Decorative icons:**
```tsx
<Icon source={CheckCircleIcon} aria-hidden="true" />
<span>Success</span>
```

---

## 4. Polaris Icon Implementation

### 4.1 Import

```tsx
import {
  CheckCircleIcon,
  AlertCircleIcon,
  AlertTriangleIcon,
  InfoIcon,
  CheckIcon,
  XIcon,
  EditIcon,
  DeleteIcon,
  RefreshIcon,
  ViewIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ExternalIcon,
  ChartIcon,
  ListIcon,
  CalendarIcon,
  ClockIcon,
  PersonIcon,
  ActivityIcon,
  CashDollarIcon,
  PackageIcon,
  InventoryIcon,
  ChatIcon,
  SearchIcon,
  ChecklistIcon,
} from '@shopify/polaris-icons';
```

### 4.2 Usage with Polaris Icon Component

```tsx
import { Icon } from '@shopify/polaris';

<Icon source={CheckCircleIcon} tone="success" />
<Icon source={AlertCircleIcon} tone="critical" />
<Icon source={InfoIcon} tone="info" />
```

### 4.3 Usage in Buttons

```tsx
<Button icon={RefreshIcon}>Refresh</Button>
<Button icon={CheckIcon} variant="primary">Approve</Button>
<Button icon={XIcon} variant="secondary">Reject</Button>
```

---

## 5. Animation & Transitions

### 5.1 Hover Transitions

**Duration:** 150ms (fast)  
**Easing:** `ease` or `cubic-bezier(0.4, 0.0, 0.2, 1)`

```css
.interactive {
  transition: all 150ms ease;
}
```

### 5.2 Focus Transitions

**Duration:** 100ms (instant)  
**Easing:** `ease`

```css
.interactive:focus-visible {
  transition: outline 100ms ease;
}
```

### 5.3 Loading Animations

**Spinner rotation:**
```css
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.spinner {
  animation: spin 0.6s linear infinite;
}
```

**Pulse animation:**
```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.loading {
  animation: pulse 1.5s ease-in-out infinite;
}
```

---

## 6. Reduced Motion

### 6.1 Respect User Preferences

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 6.2 Alternative Feedback

When animations are disabled, provide alternative feedback:
- Instant state changes
- Color changes
- Text updates

---

## 7. Touch vs Mouse

### 7.1 Touch Devices

**No hover states:**
```css
@media (hover: none) {
  .interactive:hover {
    /* No hover effect */
  }
}
```

**Larger touch targets:**
```css
@media (hover: none) {
  .button {
    min-height: 44px;
    min-width: 44px;
  }
}
```

### 7.2 Mouse Devices

**Hover states enabled:**
```css
@media (hover: hover) {
  .interactive:hover {
    background-color: var(--occ-bg-hover);
  }
}
```

**Cursor changes:**
```css
.interactive {
  cursor: pointer;
}

.disabled {
  cursor: not-allowed;
}

.loading {
  cursor: wait;
}
```

---

## 8. Implementation Checklist

### 8.1 Interactive States
- [ ] All buttons have hover, focus, active, disabled states
- [ ] All links have hover, focus, visited states
- [ ] All inputs have hover, focus, error, disabled states
- [ ] Tiles have hover, focus states (if interactive)
- [ ] Transitions smooth (150ms)

### 8.2 Iconography
- [ ] All status icons implemented
- [ ] All action icons implemented
- [ ] All navigation icons implemented
- [ ] All tile-specific icons implemented
- [ ] Icons have text alternatives (ARIA or SR-only)

### 8.3 Accessibility
- [ ] Focus indicators visible (2px solid)
- [ ] Color contrast meets WCAG AA (3:1 for UI)
- [ ] Keyboard navigation works
- [ ] Screen reader announces state changes
- [ ] Reduced motion respected

### 8.4 Responsive
- [ ] Touch targets adequate (44x44px mobile)
- [ ] Hover states disabled on touch devices
- [ ] Cursor changes on mouse devices
- [ ] Animations smooth on all devices

---

## 9. References

- **Polaris Icons:** https://polaris.shopify.com/icons
- **Polaris Icon Component:** https://polaris.shopify.com/components/images-and-icons/icon
- **Design Tokens:** `docs/design/design-tokens.md`
- **Accessibility:** `docs/design/accessibility.md`
- **WCAG 2.1 Focus Visible:** https://www.w3.org/WAI/WCAG21/Understanding/focus-visible.html

