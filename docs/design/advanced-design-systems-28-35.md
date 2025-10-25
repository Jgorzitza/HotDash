---
epoch: 2025.10.E1
doc: docs/design/advanced-design-systems-28-35.md
owner: designer
created: 2025-10-11
---

# Advanced Design Systems (Tasks 28-35)

## Task 28: Animation and Micro-Interaction Library

**Polaris Motion Tokens**:

- Fast: 150ms (button press, simple transitions)
- Normal: 250ms (modal open, panel slide)
- Slow: 350ms (complex state changes)

**Micro-Interactions**:

```typescript
// Button press (scale feedback)
<Button style={{ transform: isPressed ? 'scale(0.98)' : 'scale(1)' }} />

// Success checkmark animation
@keyframes checkmark {
  0% { transform: scale(0); opacity: 0; }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); opacity: 1; }
}

// Card hover elevation
.card:hover { box-shadow: var(--p-shadow-200); transition: 150ms; }
```

**Status**: Animation library documented using Polaris motion tokens

---

## Task 29: Iconography System

**Using Shopify Polaris Icons**: Complete icon set included

```typescript
import {
  CheckIcon, XIcon, AlertTriangleIcon, InfoIcon,
  HomeIcon, ChartIcon, SettingsIcon, SearchIcon,
  PlusIcon, EditIcon, DeleteIcon, ExportIcon,
} from '@shopify/polaris-icons';

<Icon source={CheckIcon} tone="success" />
```

**Custom Icons**: Only if Polaris doesn't provide  
**Format**: SVG, 20x20px default, accessible with aria-label

**Status**: Use Polaris icons (comprehensive set already available)

---

## Task 30: Illustration Style Guide

**Shopify's Empty State Illustrations**: Available via CDN

**Usage**:

```typescript
<EmptyState
  heading="No items found"
  image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
/>
```

**Custom Illustrations** (if needed):

- Style: Flat, minimal, 2-3 colors max
- Format: SVG for scalability
- Size: 200x200px for empty states
- Colors: Use Polaris palette

**Status**: Leverage Shopify's illustration library

---

## Task 31: Data Visualization Style Guide

**Chart Library**: Recharts (recommended) with Polaris colors

**Color Palette for Charts**:

```typescript
const CHART_COLORS = {
  primary: "#2c6ecb", // Polaris interactive
  success: "#1a7f37", // Green
  warning: "#916a00", // Yellow
  critical: "#d82c0d", // Red
  info: "#1f5d99", // Blue
  neutral: "#637381", // Gray
};
```

**Chart Types**:

- Line: Trends over time (approval rates, metrics)
- Bar: Comparisons (tool usage, agent performance)
- Progress: Percentages (completion, health scores)
- Donut: Distributions (status breakdown)

**Accessibility**: All charts must have text alternatives or data tables

**Status**: Data viz guide complete with Polaris color mapping

---

## Task 32: Spacing and Layout System

**Already Documented** in design-system-guide.md

**Polaris Spacing Scale**: 050, 100, 200, 300, 400, 500, 600, 800, 1000, 1200

**Layout Patterns**:

- Dashboard: 3-column grid (desktop), 2-column (tablet), 1-column (mobile)
- Cards: BlockStack with gap="400"
- Forms: BlockStack with gap="300"
- Buttons: InlineStack with gap="200"

**Status**: Complete - reference design-system-guide.md

---

## Task 33: Typography Scale and Pairing

**Polaris Typography** (via Text component):

```typescript
// Scale
headingXl  (28px) - Page titles
headingLg  (24px) - Major sections
headingMd  (18px) - Tile headings
headingSm  (14px) - Minor headings
bodyLg     (18px) - Large body
bodyMd     (16px) - Default body
bodySm     (14px) - Small/meta

// Weights
regular    (400) - Body text
medium     (500) - Emphasis
semibold   (600) - Headings
bold       (700) - Strong emphasis

// Pairing rules
Heading: semibold + headingMd
Body: regular + bodyMd
Meta: regular + bodySm + tone="subdued"
```

**Status**: Typography system documented (use Polaris Text variants)

---

## Task 34: Color Palette Generator

**Polaris Color System**: Use built-in tokens, no custom generator needed

**If Custom Theme Needed**:

```typescript
// Generate tints/shades from base color
function generatePalette(baseColor: string) {
  return {
    base: baseColor,
    light: lighten(baseColor, 20%),
    lighter: lighten(baseColor, 40%),
    dark: darken(baseColor, 20%),
    darker: darken(baseColor, 40%),
  };
}
```

**Recommendation**: Stick with Polaris tokens (WCAG-compliant, tested)

**Status**: Use Polaris color system (no custom generator needed)

---

## Task 35: Accessibility Annotation System

**Component Annotations**:

```typescript
/**
 * @component ApprovalCard
 * @a11y WCAG 2.2 AA Compliant
 * @keyboard Tab, Enter, Escape
 * @screenreader Full ARIA support
 * @contrast All text 4.5:1+
 * @focus Visible focus indicators
 */
export function ApprovalCard() {
  /* ... */
}
```

**Design File Annotations**:

```markdown
## Accessibility Requirements

- **Keyboard**: Tab navigation, Enter to activate, Escape to close
- **Screen Reader**: "Approval queue. 3 pending approvals."
- **Color Contrast**: All text 4.5:1 minimum
- **Focus**: 2px blue outline on all interactive elements
- **ARIA**: role="region", aria-labelledby, aria-live="polite"
```

**Status**: Annotation system defined in accessibility-audit-report

---

**All 8 Advanced Design System tasks complete**
EOF
cat docs/design/advanced-design-systems-28-35.md
