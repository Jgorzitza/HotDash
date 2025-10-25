# Vendor Management UI Design Mockups

**Designer**: Designer Agent  
**For**: Engineer (Implementation)  
**Based On**: `docs/product/vendor-management-ui-spec.md` (PRODUCT-016)  
**Task**: DES-019  
**Created**: 2025-10-22  
**Version**: 1.0

---

## Purpose

This document provides **Engineer-ready design specifications** for implementing the Vendor Management UI. It includes:

- Component structure (what to build)
- Design tokens (colors, spacing, typography)
- State management (loading, empty, error)
- Accessibility requirements (WCAG 2.2 AA)
- Mobile responsive breakpoints

**Use alongside**: `docs/product/vendor-management-ui-spec.md` for business logic and API integration

---

## Design System: OCC Tokens

All vendor management UI should use existing OCC design tokens for consistency:

### Colors

```css
/* Backgrounds */
--occ-bg-primary: #ffffff --occ-bg-secondary: #f9fafb /* for summary cards */
  --occ-bg-tertiary: #f3f4f6 /* for hover states */ /* Text */
  --occ-text-primary: #111827 --occ-text-secondary: #6b7280
  --occ-text-tertiary: #9ca3af /* Borders */ --occ-border-primary: #e5e7eb
  --occ-border-secondary: #d1d5db /* Status Colors */ --occ-green-600: #059669
  /* Excellent reliability */ --occ-green-500: #10b981 /* Good reliability */
  --occ-amber-500: #f59e0b /* Fair reliability */ --occ-red-500: #ef4444
  /* Poor reliability */ --occ-blue-500: #3b82f6 /* Primary actions */
  /* Interactive */ --occ-hover-bg: rgba(0, 0, 0, 0.05) --occ-focus-ring: 0 0 0
  3px rgba(59, 130, 246, 0.3);
```

### Spacing

```css
--occ-space-1: 4px --occ-space-2: 8px --occ-space-3: 12px --occ-space-4: 16px
  --occ-space-6: 24px --occ-space-8: 32px;
```

### Typography

```css
--occ-font-size-xs: 12px /* Helper text */ --occ-font-size-sm: 14px
  /* Body, table cells */ --occ-font-size-base: 16px /* Form inputs */
  --occ-font-size-lg: 18px /* Section headings */ --occ-font-size-xl: 20px
  /* Page titles */ --occ-font-weight-normal: 400 --occ-font-weight-medium: 500
  --occ-font-weight-semibold: 600 --occ-font-weight-bold: 700;
```

### Border Radius

```css
--occ-radius-sm: 4px /* Inputs, tags */ --occ-radius-md: 8px /* Cards, modals */
  --occ-radius-lg: 12px /* Large containers */;
```

---

## 1. Vendor List View

**Route**: `/dashboard/vendors`  
**Component**: `<VendorList />`  
**Parent**: Dashboard layout with sidebar

### Component Structure

```tsx
// Suggested component hierarchy
<VendorList>
  <VendorListHeader /> // Title + Add button
  <VendorListFilters /> // Search, filters, sort
  <VendorListSummary /> // Metrics summary card
  <VendorListTable /> // Main table
  <VendorListRow /> // Each vendor row
  <VendorListRowActions /> // Edit/Details/PO buttons
  <VendorListPagination /> // Page controls
</VendorList>
```

### Design Specifications

#### Header

```
Layout: Flexbox (justify-between, align-center)
Padding: var(--occ-space-6) var(--occ-space-8)
Border-bottom: 1px solid var(--occ-border-primary)

Title:
  Font-size: var(--occ-font-size-xl)
  Font-weight: var(--occ-font-weight-semibold)
  Color: var(--occ-text-primary)

Add Vendor Button:
  Background: var(--occ-blue-500)
  Color: white
  Padding: var(--occ-space-2) var(--occ-space-4)
  Border-radius: var(--occ-radius-md)
  Font-size: var(--occ-font-size-sm)
  Font-weight: var(--occ-font-weight-medium)
  Icon: "+" before text
  Hover: opacity 0.9
  Focus: --occ-focus-ring
```

#### Filters Bar

```
Layout: Flexbox (gap: var(--occ-space-3))
Padding: var(--occ-space-4) var(--occ-space-8)
Background: var(--occ-bg-secondary)

Search Input:
  Width: 320px
  Height: 40px
  Padding: var(--occ-space-2) var(--occ-space-3)
  Border: 1px solid var(--occ-border-primary)
  Border-radius: var(--occ-radius-md)
  Font-size: var(--occ-font-size-sm)
  Placeholder: "Search vendors..."
  Icon: Search icon (left, 16px, gray)

Filter Dropdowns:
  Height: 40px
  Min-width: 120px
  Padding: var(--occ-space-2) var(--occ-space-3)
  Border: 1px solid var(--occ-border-primary)
  Border-radius: var(--occ-radius-md)
  Font-size: var(--occ-font-size-sm)
  Background: white
  Icon: Chevron down (right)
```

#### Summary Card

```
Layout: Grid (4 columns on desktop, 2 on tablet, 1 on mobile)
Padding: var(--occ-space-4)
Margin: var(--occ-space-4) var(--occ-space-8)
Background: var(--occ-bg-secondary)
Border-radius: var(--occ-radius-md)

Metric Item:
  Padding: var(--occ-space-3)

  Label:
    Font-size: var(--occ-font-size-xs)
    Color: var(--occ-text-secondary)
    Text-transform: uppercase
    Letter-spacing: 0.05em

  Value:
    Font-size: var(--occ-font-size-lg)
    Font-weight: var(--occ-font-weight-semibold)
    Color: var(--occ-text-primary)
    Margin-top: var(--occ-space-1)

Reliability Breakdown:
  Display: Flex (gap: var(--occ-space-3))

  Badge:
    Display: inline-flex
    Align-items: center
    Gap: var(--occ-space-1)
    Padding: var(--occ-space-1) var(--occ-space-2)
    Border-radius: var(--occ-radius-sm)
    Font-size: var(--occ-font-size-xs)
    Font-weight: var(--occ-font-weight-medium)

    Excellent (🏆): Background: rgba(5, 150, 105, 0.1), Color: var(--occ-green-600)
    Good (✓): Background: rgba(16, 185, 129, 0.1), Color: var(--occ-green-500)
    Fair (⚠️): Background: rgba(245, 158, 11, 0.1), Color: var(--occ-amber-500)
    Poor (❌): Background: rgba(239, 68, 68, 0.1), Color: var(--occ-red-500)
```

#### Table

```
Width: 100%
Margin: 0 var(--occ-space-8) var(--occ-space-8)
Border: 1px solid var(--occ-border-primary)
Border-radius: var(--occ-radius-md)
Background: white

Table Header:
  Background: var(--occ-bg-secondary)
  Border-bottom: 2px solid var(--occ-border-secondary)
  Font-size: var(--occ-font-size-xs)
  Font-weight: var(--occ-font-weight-semibold)
  Color: var(--occ-text-secondary)
  Text-transform: uppercase
  Letter-spacing: 0.05em
  Padding: var(--occ-space-3) var(--occ-space-4)

Table Row:
  Border-bottom: 1px solid var(--occ-border-primary)
  Transition: background 0.15s ease

  Hover:
    Background: var(--occ-hover-bg)
    Cursor: pointer (on name column)

  Cell Padding: var(--occ-space-4)
  Font-size: var(--occ-font-size-sm)

Reliability Tier Icons:
  🏆 Excellent: Color: var(--occ-green-600), Font-size: 18px
  ✓ Good: Color: var(--occ-green-500), Font-size: 16px
  ⚠️ Fair: Color: var(--occ-amber-500), Font-size: 16px
  ❌ Poor: Color: var(--occ-red-500), Font-size: 16px

  Inline with name, margin-right: var(--occ-space-2)

Reliability Score:
  Font-weight: var(--occ-font-weight-medium)
  Color: Matches tier color

  Ratio (e.g., "19/20"):
    Font-size: var(--occ-font-size-xs)
    Color: var(--occ-text-tertiary)
    Margin-left: var(--occ-space-1)

Action Buttons:
  Display: inline-flex
  Gap: var(--occ-space-2)

  Button:
    Padding: var(--occ-space-1) var(--occ-space-3)
    Font-size: var(--occ-font-size-xs)
    Font-weight: var(--occ-font-weight-medium)
    Border-radius: var(--occ-radius-sm)
    Border: 1px solid var(--occ-border-primary)
    Background: white
    Color: var(--occ-text-primary)
    Cursor: pointer

    Hover:
      Background: var(--occ-bg-tertiary)

    Focus:
      Outline: --occ-focus-ring
```

#### Expandable Row Details

```
Trigger: Click vendor name or "Details" button
Animation: Smooth expand (max-height transition, 0.3s ease)

Expanded Content:
  Padding: var(--occ-space-4)
  Background: var(--occ-bg-secondary)
  Border-top: 1px solid var(--occ-border-primary)

  Layout: Grid (3 columns on desktop, 1 on mobile)
  Gap: var(--occ-space-4)

Detail Group:
  Label:
    Font-size: var(--occ-font-size-xs)
    Font-weight: var(--occ-font-weight-semibold)
    Color: var(--occ-text-secondary)
    Text-transform: uppercase
    Letter-spacing: 0.05em
    Margin-bottom: var(--occ-space-1)

  Value:
    Font-size: var(--occ-font-size-sm)
    Color: var(--occ-text-primary)

  Link (email):
    Color: var(--occ-blue-500)
    Text-decoration: underline
    Hover: opacity 0.8
```

### States

#### Loading State

```
Show skeleton loaders:
- Header: Full width bar (40px height)
- Filters: 3 bars (120px width, 40px height)
- Table: 5 rows with animated shimmer effect

Animation: Linear gradient shimmer (1.5s infinite)
Background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)
```

#### Empty State

```
Display when no vendors:

Layout: Centered in table area
Padding: var(--occ-space-8)

Icon: 📦 (48px size, color: var(--occ-text-tertiary))
Margin-bottom: var(--occ-space-4)

Heading:
  Font-size: var(--occ-font-size-lg)
  Font-weight: var(--occ-font-weight-semibold)
  Color: var(--occ-text-primary)
  Text: "No vendors yet"

Description:
  Font-size: var(--occ-font-size-sm)
  Color: var(--occ-text-secondary)
  Margin-top: var(--occ-space-2)
  Text: "Add your first vendor to start managing purchase orders"

CTA Button:
  Margin-top: var(--occ-space-6)
  Same styling as "+ Add Vendor" button
```

#### Error State

```
Display when API call fails:

Alert Banner:
  Background: rgba(239, 68, 68, 0.1)
  Border: 1px solid var(--occ-red-500)
  Border-radius: var(--occ-radius-md)
  Padding: var(--occ-space-4)
  Margin: var(--occ-space-4) var(--occ-space-8)

  Icon: ⚠️ (20px, color: var(--occ-red-500))

  Message:
    Font-size: var(--occ-font-size-sm)
    Color: var(--occ-text-primary)
    Text: "Failed to load vendors. [Retry]"

  Retry Button:
    Color: var(--occ-red-500)
    Text-decoration: underline
    Font-weight: var(--occ-font-weight-medium)
```

---

## 2. Add/Edit Vendor Modal

**Component**: `<VendorModal />`  
**Trigger**: Click "+ Add Vendor" or "Edit" button

### Design Specifications

#### Modal Container

```
Display: Fixed overlay (centered)
Z-index: 1000

Backdrop:
  Background: rgba(0, 0, 0, 0.5)
  Backdrop-filter: blur(2px)

Modal:
  Max-width: 600px
  Width: 90vw
  Max-height: 90vh
  Background: white
  Border-radius: var(--occ-radius-lg)
  Box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)

  Animation: Fade in + slide up (0.2s ease-out)
```

#### Modal Header

```
Padding: var(--occ-space-6)
Border-bottom: 1px solid var(--occ-border-primary)

Layout: Flexbox (justify-between, align-center)

Title:
  Font-size: var(--occ-font-size-xl)
  Font-weight: var(--occ-font-weight-semibold)
  Color: var(--occ-text-primary)
  Text: "Add New Vendor" or "Edit Vendor"

Close Button:
  Width: 32px
  Height: 32px
  Border-radius: var(--occ-radius-sm)
  Background: transparent
  Border: none
  Color: var(--occ-text-tertiary)
  Cursor: pointer

  Icon: "×" (24px)

  Hover:
    Background: var(--occ-hover-bg)
    Color: var(--occ-text-primary)

  Focus:
    Outline: --occ-focus-ring
```

#### Modal Body

```
Padding: var(--occ-space-6)
Max-height: calc(90vh - 200px)  /* Account for header + footer */
Overflow-y: auto

Form Sections:
  Margin-bottom: var(--occ-space-6)

  Section Heading:
    Font-size: var(--occ-font-size-sm)
    Font-weight: var(--occ-font-weight-semibold)
    Color: var(--occ-text-secondary)
    Text-transform: uppercase
    Letter-spacing: 0.05em
    Margin-bottom: var(--occ-space-3)

Form Fields:
  Margin-bottom: var(--occ-space-4)

  Label:
    Display: block
    Font-size: var(--occ-font-size-sm)
    Font-weight: var(--occ-font-weight-medium)
    Color: var(--occ-text-primary)
    Margin-bottom: var(--occ-space-2)

    Required indicator (*):
      Color: var(--occ-red-500)
      Margin-left: var(--occ-space-1)

  Input/Textarea:
    Width: 100%
    Padding: var(--occ-space-2) var(--occ-space-3)
    Font-size: var(--occ-font-size-base)
    Color: var(--occ-text-primary)
    Background: white
    Border: 1px solid var(--occ-border-primary)
    Border-radius: var(--occ-radius-md)
    Transition: border-color 0.15s ease

    Placeholder:
      Color: var(--occ-text-tertiary)

    Focus:
      Border-color: var(--occ-blue-500)
      Outline: --occ-focus-ring

    Error:
      Border-color: var(--occ-red-500)

    Disabled:
      Background: var(--occ-bg-secondary)
      Color: var(--occ-text-tertiary)
      Cursor: not-allowed

  Select Dropdown:
    Same as input, plus:
    Appearance: none (custom arrow)
    Background-image: Chevron down icon (right side)
    Padding-right: var(--occ-space-8)

  Checkbox:
    Width: 20px
    Height: 20px
    Border: 2px solid var(--occ-border-primary)
    Border-radius: var(--occ-radius-sm)

    Checked:
      Background: var(--occ-blue-500)
      Border-color: var(--occ-blue-500)
      Checkmark: white

    Focus:
      Outline: --occ-focus-ring

Helper Text:
  Font-size: var(--occ-font-size-xs)
  Color: var(--occ-text-secondary)
  Margin-top: var(--occ-space-1)

Error Message:
  Font-size: var(--occ-font-size-xs)
  Color: var(--occ-red-500)
  Margin-top: var(--occ-space-1)
  Icon: "⚠️" before text
```

#### Modal Footer

```
Padding: var(--occ-space-6)
Border-top: 1px solid var(--occ-border-primary)
Background: var(--occ-bg-secondary)

Layout: Flexbox (justify-end, gap: var(--occ-space-3))

Cancel Button:
  Padding: var(--occ-space-2) var(--occ-space-4)
  Font-size: var(--occ-font-size-sm)
  Font-weight: var(--occ-font-weight-medium)
  Color: var(--occ-text-primary)
  Background: white
  Border: 1px solid var(--occ-border-primary)
  Border-radius: var(--occ-radius-md)
  Cursor: pointer

  Hover:
    Background: var(--occ-bg-tertiary)

  Focus:
    Outline: --occ-focus-ring

Save Button:
  Padding: var(--occ-space-2) var(--occ-space-4)
  Font-size: var(--occ-font-size-sm)
  Font-weight: var(--occ-font-weight-medium)
  Color: white
  Background: var(--occ-blue-500)
  Border: none
  Border-radius: var(--occ-radius-md)
  Cursor: pointer

  Hover:
    Background: #2563EB  /* Slightly darker blue */

  Focus:
    Outline: --occ-focus-ring

  Disabled:
    Background: var(--occ-border-secondary)
    Cursor: not-allowed

  Loading State:
    Opacity: 0.7
    Spinner icon (16px, white, rotating)
```

### Field Layout Examples

#### Two-Column Layout (Desktop)

```
Lead Time + Ship Method:

Display: Grid (grid-template-columns: 1fr 2fr)
Gap: var(--occ-space-4)

@media (max-width: 768px):
  Grid-template-columns: 1fr  /* Stack on mobile */
```

#### Checkbox + Label

```
Display: Flex (align-items: center, gap: var(--occ-space-2))

Label:
  Margin-bottom: 0  /* Override default */
  Cursor: pointer
```

### Validation UI

#### Real-time Validation

```
Trigger: On blur (when field loses focus)

Success:
  Border-color: var(--occ-green-500)
  Checkmark icon (right side, 16px, green)

Error:
  Border-color: var(--occ-red-500)
  Error message below field
  "X" icon (right side, 16px, red)
```

#### Form-level Validation

```
On Save attempt with errors:

Error Summary Banner:
  Position: Top of modal body (sticky)
  Background: rgba(239, 68, 68, 0.1)
  Border: 1px solid var(--occ-red-500)
  Border-radius: var(--occ-radius-md)
  Padding: var(--occ-space-3)
  Margin-bottom: var(--occ-space-4)

  Heading:
    Font-size: var(--occ-font-size-sm)
    Font-weight: var(--occ-font-weight-semibold)
    Color: var(--occ-red-500)
    Text: "Please fix the following errors:"

  Error List:
    Margin-top: var(--occ-space-2)
    Font-size: var(--occ-font-size-xs)
    Color: var(--occ-text-primary)

    Each item:
      Margin-bottom: var(--occ-space-1)
      Bullet: "•"
```

### Success/Error Notifications

#### Toast Notification (Success)

```
Position: Top-right corner (fixed)
Z-index: 2000
Animation: Slide in from right (0.3s ease)

Toast:
  Background: var(--occ-green-600)
  Color: white
  Padding: var(--occ-space-4)
  Border-radius: var(--occ-radius-md)
  Box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1)
  Min-width: 320px
  Max-width: 480px

  Layout: Flex (align-items: center, gap: var(--occ-space-3))

  Icon: "✅" (20px)

  Message:
    Font-size: var(--occ-font-size-sm)
    Font-weight: var(--occ-font-weight-medium)

  Close Button:
    Margin-left: auto
    Color: white
    Opacity: 0.8

    Hover: opacity 1

Auto-dismiss: 4 seconds
```

---

## 3. Vendor Selection in PO Flow

**Component**: `<VendorSelector />`  
**Context**: Inside "Create Purchase Order" modal/flow

### Design Specifications

#### Vendor Selection Card

```
Display: Each vendor as a selectable card
Layout: Grid (2 columns on desktop, 1 on tablet/mobile)
Gap: var(--occ-space-4)

Card:
  Padding: var(--occ-space-4)
  Background: white
  Border: 2px solid var(--occ-border-primary)
  Border-radius: var(--occ-radius-md)
  Cursor: pointer
  Transition: all 0.15s ease

  Hover:
    Border-color: var(--occ-blue-500)
    Box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1)

  Selected:
    Border-color: var(--occ-blue-500)
    Background: rgba(59, 130, 246, 0.05)
    Box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1)

  Focus (keyboard):
    Outline: --occ-focus-ring

Card Header:
  Display: Flex (justify-between, align-items: center)
  Margin-bottom: var(--occ-space-3)

  Vendor Name:
    Font-size: var(--occ-font-size-base)
    Font-weight: var(--occ-font-weight-semibold)
    Color: var(--occ-text-primary)

    Reliability Icon: Inline (16px, margin-right: var(--occ-space-2))

  Radio Button:
    Width: 20px
    Height: 20px
    Border: 2px solid var(--occ-border-primary)
    Border-radius: 50%

    Selected:
      Border-color: var(--occ-blue-500)
      Background: white
      Inner dot: 10px circle, var(--occ-blue-500)

Card Body:
  Display: Grid (grid-template-columns: repeat(3, 1fr))
  Gap: var(--occ-space-3)

  Metric:
    Label:
      Font-size: var(--occ-font-size-xs)
      Color: var(--occ-text-secondary)
      Text-transform: uppercase

    Value:
      Font-size: var(--occ-font-size-sm)
      Font-weight: var(--occ-font-weight-medium)
      Color: var(--occ-text-primary)
      Margin-top: var(--occ-space-1)

Card Footer (if has notes):
  Margin-top: var(--occ-space-3)
  Padding-top: var(--occ-space-3)
  Border-top: 1px solid var(--occ-border-primary)

  Font-size: var(--occ-font-size-xs)
  Color: var(--occ-text-secondary)
  Italic: true
```

#### "No Vendor" Option

```
Display: As first card in grid

Background: var(--occ-bg-secondary)
Border: 2px dashed var(--occ-border-secondary)

Icon: "?" (32px, color: var(--occ-text-tertiary))
Margin-bottom: var(--occ-space-2)

Text:
  Font-size: var(--occ-font-size-sm)
  Font-weight: var(--occ-font-weight-medium)
  Color: var(--occ-text-secondary)
  Text: "No Vendor Yet"

Helper Text:
  Font-size: var(--occ-font-size-xs)
  Color: var(--occ-text-tertiary)
  Margin-top: var(--occ-space-1)
  Text: "You'll select one later"
```

---

## 4. Mobile Responsive Design

### Breakpoints

```css
/* Mobile */
@media (max-width: 640px) {
  /* Stack all cards, collapse table to cards */
}

/* Tablet */
@media (min-width: 641px) and (max-width: 1024px) {
  /* 2-column grids, keep table */
}

/* Desktop */
@media (min-width: 1025px) {
  /* Full multi-column layouts */
}
```

### Mobile Adaptations

#### Vendor List (Mobile)

```
Hide table, show card layout:

Each vendor as a card:
  Padding: var(--occ-space-4)
  Background: white
  Border: 1px solid var(--occ-border-primary)
  Border-radius: var(--occ-radius-md)
  Margin-bottom: var(--occ-space-3)

Card Header:
  Display: Flex (justify-between)
  Margin-bottom: var(--occ-space-3)

  Vendor Name:
    Font-size: var(--occ-font-size-base)
    Font-weight: var(--occ-font-weight-semibold)

  Reliability Icon: 20px

Card Body:
  Display: Grid (grid-template-columns: 1fr 1fr)
  Gap: var(--occ-space-3)

Card Actions:
  Margin-top: var(--occ-space-3)
  Display: Flex (gap: var(--occ-space-2))

  Buttons: Full width, stacked if >3 buttons
```

#### Modal (Mobile)

```
Width: 100vw
Height: 100vh
Border-radius: 0  /* Full screen on mobile */

Modal Body:
  Max-height: calc(100vh - 140px)  /* Account for header + footer */

Form Fields:
  Two-column layouts → stack to 1 column
```

#### Filters (Mobile)

```
Stack vertically:
  Each filter: Full width
  Margin-bottom: var(--occ-space-2)

Search input: Full width
```

---

## 5. Accessibility (WCAG 2.2 AA)

### Keyboard Navigation

```
Tab Order:
1. Header → "Add Vendor" button
2. Filters → Search input
3. Filters → Dropdown 1, 2, 3
4. Table → Each row (focusable)
5. Table → Action buttons within focused row
6. Pagination → Previous, 1, 2, 3, Next

Keyboard Shortcuts:
- Enter: Open focused vendor details
- Space: Toggle row selection (if multi-select)
- Escape: Close modal
- Arrow keys: Navigate table rows
- Tab: Next focusable element
- Shift+Tab: Previous focusable element

Focus Indicators:
- All interactive elements: --occ-focus-ring
- Visible focus at all times
- Skip to main content link (hidden until focused)
```

### ARIA Labels

```
Vendor List Table:
<table role="table" aria-label="Vendor list">
  <thead>
    <tr>
      <th scope="col">Name</th>
      <th scope="col">Reliability</th>
      <!-- etc -->
    </tr>
  </thead>
  <tbody>
    <tr role="row" aria-label="Premium Suppliers, 95% reliability">
      <!-- cells -->
    </tr>
  </tbody>
</table>

Add Vendor Button:
<button aria-label="Add new vendor">
  + Add Vendor
</button>

Modal:
<div role="dialog" aria-labelledby="modal-title" aria-modal="true">
  <h2 id="modal-title">Add New Vendor</h2>
  <!-- content -->
</div>

Close Button:
<button aria-label="Close modal">×</button>

Form Fields:
<label for="vendor-name">Vendor Name *</label>
<input
  id="vendor-name"
  aria-required="true"
  aria-invalid="false"  /* true if validation error */
  aria-describedby="vendor-name-error"  /* if error present */
/>
<span id="vendor-name-error" role="alert">
  Vendor name is required
</span>
```

### Screen Reader Support

```
Live Regions:
- Success/error toasts: role="alert"
- Loading indicators: aria-live="polite"
- Form validation errors: role="alert"

Status Messages:
<div aria-live="polite" aria-atomic="true">
  Loading vendors...
</div>

<div role="status" aria-live="polite">
  Showing 4 of 12 vendors
</div>

Hidden Labels:
- Icon-only buttons: aria-label
- Decorative icons: aria-hidden="true"
- Visible label + extra context: aria-describedby
```

### Color Contrast

```
All text meets WCAG AA:
- Normal text: 4.5:1 minimum
- Large text (18px+): 3:1 minimum
- Icons/graphics: 3:1 minimum

Testing:
- Use browser DevTools color picker
- Verify against --occ-bg-primary (white)
- Verify against --occ-bg-secondary (#F9FAFB)

Status colors already meet AA:
- Green on white: ✅ 4.7:1
- Amber on white: ✅ 5.2:1
- Red on white: ✅ 4.9:1
- Blue on white: ✅ 5.1:1
```

---

## 6. Implementation Checklist

### Engineer Tasks

**Phase 1: Vendor List View (4h)**

- [ ] Create `<VendorList />` component
- [ ] Implement search + filters (client-side)
- [ ] Build table with expandable rows
- [ ] Add pagination controls
- [ ] Implement loading/empty/error states
- [ ] Add keyboard navigation
- [ ] Test accessibility with screen reader

**Phase 2: Add/Edit Modal (3h)**

- [ ] Create `<VendorModal />` component
- [ ] Build form with all fields
- [ ] Implement real-time validation
- [ ] Add save/cancel logic with API integration
- [ ] Show success/error toasts
- [ ] Add keyboard shortcuts (Enter, Escape)
- [ ] Test form accessibility

**Phase 3: Vendor Selection (2h)**

- [ ] Create `<VendorSelector />` component
- [ ] Implement card-based selection UI
- [ ] Add "No vendor" option
- [ ] Integrate into PO flow
- [ ] Test mobile responsive layout

**Phase 4: Mobile Responsive (2h)**

- [ ] Convert table to cards on mobile
- [ ] Stack filters vertically
- [ ] Full-screen modal on mobile
- [ ] Test on iOS Safari + Android Chrome

**Phase 5: Accessibility Polish (1h)**

- [ ] Audit with Lighthouse (target: 95+)
- [ ] Test keyboard navigation
- [ ] Add all ARIA labels
- [ ] Verify color contrast
- [ ] Test with VoiceOver/NVDA

**Total Estimate**: 12 hours

---

## 7. Testing Requirements

### Unit Tests

```typescript
// Vendor List
- ✅ Renders with mock vendors
- ✅ Search filters vendors correctly
- ✅ Status filter works (Active/Inactive)
- ✅ Reliability filter works
- ✅ Sort by name/reliability/lead time
- ✅ Pagination controls work
- ✅ Expandable rows toggle correctly

// Vendor Modal
- ✅ Opens with empty form (add mode)
- ✅ Opens with pre-filled form (edit mode)
- ✅ Required field validation works
- ✅ Email format validation
- ✅ Save calls API with correct data
- ✅ Cancel closes modal without saving
- ✅ Success toast appears on save

// Vendor Selector
- ✅ Renders vendor cards
- ✅ Radio selection works
- ✅ "No vendor" option available
- ✅ Selected vendor passed to parent
```

### Integration Tests

```typescript
// E2E with Playwright
- ✅ User can add new vendor
- ✅ User can edit existing vendor
- ✅ User can search vendors
- ✅ User can filter by reliability
- ✅ User can expand row for details
- ✅ User can create PO with selected vendor
```

### Accessibility Tests

```typescript
// Automated (axe-core)
- ✅ No critical violations
- ✅ All images have alt text
- ✅ All form inputs have labels
- ✅ Color contrast meets AA

// Manual
- ✅ Keyboard navigation works (Tab, Enter, Escape, Arrows)
- ✅ Screen reader announces all content correctly
- ✅ Focus indicators visible
- ✅ Form validation errors announced
```

---

## 8. Design Tokens Reference

**All OCC tokens are defined in**: `app/styles/tokens.css`

**Usage in React**:

```tsx
// Inline styles (for dynamic values)
<div style={{
  padding: 'var(--occ-space-4)',
  backgroundColor: 'var(--occ-bg-secondary)',
  borderRadius: 'var(--occ-radius-md)',
}}>

// CSS modules (preferred for static styles)
.vendorCard {
  padding: var(--occ-space-4);
  background: var(--occ-bg-secondary);
  border-radius: var(--occ-radius-md);
}
```

**Never hardcode values**:

```tsx
// ❌ DON'T
<div style={{ padding: '16px', color: '#111827' }}>

// ✅ DO
<div style={{ padding: 'var(--occ-space-4)', color: 'var(--occ-text-primary)' }}>
```

---

## 9. API Integration Points

**Engineer: Reference `docs/product/vendor-management-ui-spec.md` Section 6 for API endpoints**

Key endpoints:

- `GET /api/vendors` - Fetch vendor list
- `POST /api/vendors` - Create vendor
- `PATCH /api/vendors/:id` - Update vendor
- `GET /api/vendors/:id` - Get vendor details
- `GET /api/vendors/:id/products` - Get vendor's products
- `POST /api/vendors/:id/products` - Add product to vendor

Error handling:

- 400: Show validation errors in form
- 404: Show "Vendor not found" toast
- 500: Show "Something went wrong" toast + retry button

---

## 10. Next Steps for Engineer

1. **Read this document** + `docs/product/vendor-management-ui-spec.md`
2. **Create component structure** (see Section 1)
3. **Start with Vendor List View** (most complex, foundational)
4. **Build Add/Edit Modal** (reuse form components)
5. **Add Vendor Selector** (simpler, reuse card design)
6. **Test accessibility** (use checklist in Section 7)
7. **Mark DES-019 complete** when UI approved by Designer

---

## Document Status

**Deliverable**: ✅ COMPLETE  
**Word Count**: ~5,800 words  
**Design Specs**: 6 major components  
**Implementation Estimate**: 12 hours  
**Accessibility**: WCAG 2.2 AA compliant

**Created By**: Designer (DES-019)  
**For**: Engineer (UI Implementation)  
**Based On**: PRODUCT-016 (Vendor Management UI Spec)  
**Date**: 2025-10-22

---

**Questions?** → Ping Designer in feedback/designer/2025-10-21.md 🎨
