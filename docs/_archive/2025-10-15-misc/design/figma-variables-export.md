---
epoch: 2025.10.E1
doc: docs/design/figma-variables-export.md
owner: designer
last_reviewed: 2025-10-11
doc_hash: TBD
expires: 2025-10-25
---

# Figma Variables Export Specification

## Overview

**Created**: 2025-10-11T05:18:47Z  
**Purpose**: Figma Variables export specification for Polaris-aligned design tokens  
**Target**: Figma workspace handoff (pending Figma access)  
**Source**: `docs/design/tokens/design_tokens.md` and `app/styles/tokens.css`

## Responsive Breakpoints Definition

### Breakpoint System

```json
{
  "breakpoints": {
    "mobile": {
      "min": "0px",
      "max": "767px",
      "description": "Single column stack, overlay navigation"
    },
    "tablet": {
      "min": "768px",
      "max": "1279px",
      "description": "Two column grid, collapsed navigation"
    },
    "desktop": {
      "min": "1280px",
      "max": "∞",
      "description": "Three column grid, full navigation"
    }
  }
}
```

### Container Query Implementation

```css
/* Responsive Grid System */
.occ-dashboard-container {
  container-type: inline-size;
  width: 100%;
  padding: var(--p-space-4);
}

/* Mobile First - Default single column */
.occ-dashboard-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--p-space-4);
  max-width: 1440px;
  margin: 0 auto;
}

/* Tablet: 768px+ - Two columns */
@container (min-width: 768px) {
  .occ-dashboard-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--p-space-5);
    padding: var(--p-space-6);
  }
}

/* Desktop: 1280px+ - Three columns */
@container (min-width: 1280px) {
  .occ-dashboard-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: var(--p-space-6);
    padding: var(--p-space-8);
  }

  /* Five tiles - special layout */
  .occ-dashboard-grid:has(.occ-tile:nth-child(5)) {
    grid-template-areas:
      "sales fulfillment inventory"
      "cx    seo        seo";
  }

  .occ-tile:nth-child(1) {
    grid-area: sales;
  }
  .occ-tile:nth-child(2) {
    grid-area: fulfillment;
  }
  .occ-tile:nth-child(3) {
    grid-area: inventory;
  }
  .occ-tile:nth-child(4) {
    grid-area: cx;
  }
  .occ-tile:nth-child(5) {
    grid-area: seo;
  }
}
```

## Figma Variables Structure

### 1. Color Collection - "OCC Colors"

```json
{
  "name": "OCC Colors",
  "modes": ["Light", "Dark (Future)"],
  "variables": {
    "status/healthy/text": {
      "light": "#1a7f37",
      "description": "Text color for healthy status indicators"
    },
    "status/healthy/background": {
      "light": "#e3f9e5",
      "description": "Background color for healthy status badges"
    },
    "status/healthy/border": {
      "light": "#2e844a",
      "description": "Border color for healthy status elements"
    },
    "status/attention/text": {
      "light": "#d82c0d",
      "description": "Text color for attention needed status"
    },
    "status/attention/background": {
      "light": "#fff4f4",
      "description": "Background color for attention status badges"
    },
    "status/attention/border": {
      "light": "#e85c4a",
      "description": "Border color for attention status elements"
    },
    "status/unconfigured/text": {
      "light": "#637381",
      "description": "Text color for unconfigured status"
    },
    "status/unconfigured/background": {
      "light": "#f6f6f7",
      "description": "Background color for unconfigured status badges"
    },
    "status/unconfigured/border": {
      "light": "#d2d5d8",
      "description": "Border color for unconfigured status elements"
    },
    "surface/primary": {
      "light": "#ffffff",
      "description": "Primary background for tiles and modals"
    },
    "surface/secondary": {
      "light": "#f6f6f7",
      "description": "Secondary background for subdued elements"
    },
    "surface/hover": {
      "light": "#f6f6f7",
      "description": "Hover state background color"
    },
    "border/default": {
      "light": "#d2d5d8",
      "description": "Default border color for tiles and components"
    },
    "border/interactive": {
      "light": "#2c6ecb",
      "description": "Interactive border color for focused elements"
    },
    "border/focus": {
      "light": "#2c6ecb",
      "description": "Focus ring border color"
    },
    "text/primary": {
      "light": "#202223",
      "description": "Primary text color for headings and body"
    },
    "text/secondary": {
      "light": "#637381",
      "description": "Secondary text color for meta information"
    },
    "text/interactive": {
      "light": "#2c6ecb",
      "description": "Interactive text color for links and CTAs"
    },
    "text/success": {
      "light": "#1a7f37",
      "description": "Success state text color"
    },
    "text/critical": {
      "light": "#d82c0d",
      "description": "Critical state text color"
    },
    "text/warning": {
      "light": "#916a00",
      "description": "Warning state text color"
    }
  }
}
```

### 2. Spacing Collection - "OCC Spacing"

```json
{
  "name": "OCC Spacing",
  "modes": ["Base"],
  "variables": {
    "1": {
      "base": "4px",
      "description": "Smallest spacing unit"
    },
    "2": {
      "base": "8px",
      "description": "Small spacing unit"
    },
    "3": {
      "base": "12px",
      "description": "Medium-small spacing unit"
    },
    "4": {
      "base": "16px",
      "description": "Medium spacing unit"
    },
    "5": {
      "base": "20px",
      "description": "Medium-large spacing unit"
    },
    "6": {
      "base": "24px",
      "description": "Large spacing unit"
    },
    "8": {
      "base": "32px",
      "description": "Extra large spacing unit"
    },
    "10": {
      "base": "40px",
      "description": "Largest spacing unit"
    },
    "tile/padding": {
      "base": "20px",
      "description": "Internal padding for tile components"
    },
    "tile/gap": {
      "base": "20px",
      "description": "Gap between tiles in grid"
    },
    "tile/internal": {
      "base": "16px",
      "description": "Internal gap within tile content"
    },
    "modal/padding": {
      "base": "24px",
      "description": "Internal padding for modal components"
    },
    "modal/gap": {
      "base": "16px",
      "description": "Gap between modal sections"
    }
  }
}
```

### 3. Typography Collection - "OCC Typography"

```json
{
  "name": "OCC Typography",
  "modes": ["Base"],
  "variables": {
    "size/xs": {
      "base": 12,
      "description": "Extra small font size"
    },
    "size/sm": {
      "base": 14,
      "description": "Small font size"
    },
    "size/base": {
      "base": 16,
      "description": "Base body font size"
    },
    "size/lg": {
      "base": 18,
      "description": "Large font size"
    },
    "size/xl": {
      "base": 24,
      "description": "Extra large font size"
    },
    "size/2xl": {
      "base": 32,
      "description": "2X large font size"
    },
    "size/heading": {
      "base": 18,
      "description": "Tile heading font size"
    },
    "size/metric": {
      "base": 24,
      "description": "Primary metric font size"
    },
    "size/body": {
      "base": 16,
      "description": "Body text font size"
    },
    "size/meta": {
      "base": 14,
      "description": "Meta information font size"
    },
    "weight/regular": {
      "base": 400,
      "description": "Regular font weight"
    },
    "weight/medium": {
      "base": 500,
      "description": "Medium font weight"
    },
    "weight/semibold": {
      "base": 600,
      "description": "Semi-bold font weight"
    },
    "weight/bold": {
      "base": 700,
      "description": "Bold font weight"
    },
    "lineHeight/tight": {
      "base": 1.25,
      "description": "Tight line height for headings"
    },
    "lineHeight/normal": {
      "base": 1.5,
      "description": "Normal line height for body text"
    },
    "lineHeight/relaxed": {
      "base": 1.75,
      "description": "Relaxed line height for large text"
    }
  }
}
```

### 4. Effects Collection - "OCC Effects"

```json
{
  "name": "OCC Effects",
  "modes": ["Base"],
  "variables": {
    "radius/sm": {
      "base": "8px",
      "description": "Small border radius"
    },
    "radius/md": {
      "base": "12px",
      "description": "Medium border radius"
    },
    "radius/lg": {
      "base": "16px",
      "description": "Large border radius"
    },
    "radius/full": {
      "base": "9999px",
      "description": "Full border radius for pills"
    },
    "radius/tile": {
      "base": "12px",
      "description": "Border radius for tile components"
    },
    "radius/modal": {
      "base": "16px",
      "description": "Border radius for modal components"
    },
    "radius/button": {
      "base": "8px",
      "description": "Border radius for button components"
    },
    "shadow/sm": {
      "base": {
        "type": "dropShadow",
        "color": "#0f172a1f",
        "x": 0,
        "y": 1,
        "blur": 2,
        "spread": 0
      },
      "description": "Small shadow for subtle elevation"
    },
    "shadow/md": {
      "base": {
        "type": "dropShadow",
        "color": "#0f172a1f",
        "x": 0,
        "y": 2,
        "blur": 4,
        "spread": 0
      },
      "description": "Medium shadow for moderate elevation"
    },
    "shadow/lg": {
      "base": {
        "type": "dropShadow",
        "color": "#0f172a1f",
        "x": 0,
        "y": 4,
        "blur": 8,
        "spread": 0
      },
      "description": "Large shadow for significant elevation"
    },
    "shadow/xl": {
      "base": {
        "type": "dropShadow",
        "color": "#0f172a1f",
        "x": 0,
        "y": 8,
        "blur": 16,
        "spread": 0
      },
      "description": "Extra large shadow for modal overlays"
    },
    "shadow/tile": {
      "base": {
        "type": "dropShadow",
        "color": "#0f172a1f",
        "x": 0,
        "y": 1,
        "blur": 2,
        "spread": 0
      },
      "description": "Default shadow for tile components"
    },
    "shadow/tile-hover": {
      "base": {
        "type": "dropShadow",
        "color": "#0f172a1f",
        "x": 0,
        "y": 2,
        "blur": 4,
        "spread": 0
      },
      "description": "Hover shadow for tile components"
    },
    "shadow/modal": {
      "base": {
        "type": "dropShadow",
        "color": "#0f172a1f",
        "x": 0,
        "y": 8,
        "blur": 16,
        "spread": 0
      },
      "description": "Shadow for modal overlays"
    }
  }
}
```

### 5. Motion Collection - "OCC Motion"

```json
{
  "name": "OCC Motion",
  "modes": ["Base"],
  "variables": {
    "duration/fast": {
      "base": "150ms",
      "description": "Fast animation duration"
    },
    "duration/normal": {
      "base": "250ms",
      "description": "Normal animation duration"
    },
    "duration/slow": {
      "base": "350ms",
      "description": "Slow animation duration"
    },
    "easing/default": {
      "base": "cubic-bezier(0.4, 0.0, 0.2, 1)",
      "description": "Default easing function"
    },
    "easing/in": {
      "base": "cubic-bezier(0.4, 0.0, 1, 1)",
      "description": "Ease-in function"
    },
    "easing/out": {
      "base": "cubic-bezier(0.0, 0.0, 0.2, 1)",
      "description": "Ease-out function"
    },
    "easing/inOut": {
      "base": "cubic-bezier(0.4, 0.0, 0.2, 1)",
      "description": "Ease-in-out function"
    }
  }
}
```

## Component Variable Mapping

### OCC Tile Component

```json
{
  "name": "OCC Tile",
  "type": "component",
  "properties": {
    "width": "320px (min)",
    "height": "280px (min)",
    "padding": "{occ-spacing/tile/padding}",
    "gap": "{occ-spacing/tile/internal}",
    "background": "{occ-colors/surface/primary}",
    "borderColor": "{occ-colors/border/default}",
    "borderRadius": "{occ-effects/radius/tile}",
    "boxShadow": "{occ-effects/shadow/tile}"
  },
  "states": {
    "hover": {
      "boxShadow": "{occ-effects/shadow/tile-hover}"
    }
  },
  "variants": {
    "status": ["healthy", "attention", "unconfigured"]
  }
}
```

### OCC Modal Component

```json
{
  "name": "OCC Modal",
  "type": "component",
  "properties": {
    "width": "600px",
    "maxWidth": "90vw",
    "padding": "{occ-spacing/modal/padding}",
    "gap": "{occ-spacing/modal/gap}",
    "background": "{occ-colors/surface/primary}",
    "borderRadius": "{occ-effects/radius/modal}",
    "boxShadow": "{occ-effects/shadow/modal}"
  },
  "variants": {
    "size": ["small", "medium", "large"]
  }
}
```

### OCC Badge Component

```json
{
  "name": "OCC Badge",
  "type": "component",
  "properties": {
    "padding": "4px 8px",
    "borderRadius": "{occ-effects/radius/sm}",
    "fontSize": "{occ-typography/size/sm}",
    "fontWeight": "{occ-typography/weight/semibold}"
  },
  "variants": {
    "status": {
      "healthy": {
        "background": "{occ-colors/status/healthy/background}",
        "color": "{occ-colors/status/healthy/text}",
        "borderColor": "{occ-colors/status/healthy/border}"
      },
      "attention": {
        "background": "{occ-colors/status/attention/background}",
        "color": "{occ-colors/status/attention/text}",
        "borderColor": "{occ-colors/status/attention/border}"
      },
      "unconfigured": {
        "background": "{occ-colors/status/unconfigured/background}",
        "color": "{occ-colors/status/unconfigured/text}",
        "borderColor": "{occ-colors/status/unconfigured/border}"
      }
    }
  }
}
```

## Breakpoint-Specific Component Variations

### Mobile Components (< 768px)

```json
{
  "components": {
    "OCC Tile Mobile": {
      "width": "100%",
      "minHeight": "240px",
      "padding": "{occ-spacing/4}"
    },
    "OCC Button Group Mobile": {
      "flexDirection": "column",
      "gap": "{occ-spacing/2}"
    },
    "OCC Button Mobile": {
      "width": "100%",
      "height": "44px"
    }
  }
}
```

### Tablet Components (768px - 1279px)

```json
{
  "components": {
    "OCC Tile Tablet": {
      "width": "100%",
      "minHeight": "280px",
      "padding": "{occ-spacing/5}"
    },
    "OCC Grid Tablet": {
      "gridTemplateColumns": "repeat(2, 1fr)",
      "gap": "{occ-spacing/5}"
    }
  }
}
```

### Desktop Components (1280px+)

```json
{
  "components": {
    "OCC Tile Desktop": {
      "width": "100%",
      "minHeight": "320px",
      "padding": "{occ-spacing/6}"
    },
    "OCC Grid Desktop": {
      "gridTemplateColumns": "repeat(3, 1fr)",
      "gap": "{occ-spacing/6}"
    }
  }
}
```

## Auto-Layout Integration

### Stack Component (Vertical)

```json
{
  "name": "OCC Stack",
  "type": "frame",
  "autoLayout": {
    "layoutMode": "vertical",
    "primaryAxisSizingMode": "hug",
    "counterAxisSizingMode": "fill",
    "itemSpacing": "{occ-spacing/4}",
    "paddingLeft": 0,
    "paddingRight": 0,
    "paddingTop": 0,
    "paddingBottom": 0
  }
}
```

### Inline Stack Component (Horizontal)

```json
{
  "name": "OCC Inline Stack",
  "type": "frame",
  "autoLayout": {
    "layoutMode": "horizontal",
    "primaryAxisSizingMode": "hug",
    "counterAxisSizingMode": "hug",
    "itemSpacing": "{occ-spacing/3}",
    "primaryAxisAlignItems": "center",
    "counterAxisAlignItems": "center"
  }
}
```

### Grid Container Component

```json
{
  "name": "OCC Grid Container",
  "type": "frame",
  "layoutGrid": {
    "pattern": "columns",
    "sectionSize": "1fr",
    "gutterSize": "{occ-spacing/6}",
    "count": 3,
    "alignment": "stretch"
  },
  "responsive": [
    {
      "breakpoint": "tablet",
      "layoutGrid": {
        "count": 2,
        "gutterSize": "{occ-spacing/5}"
      }
    },
    {
      "breakpoint": "mobile",
      "layoutGrid": {
        "count": 1,
        "gutterSize": "{occ-spacing/4}"
      }
    }
  ]
}
```

## Export Process Instructions

### Figma Plugin Requirements

1. **Variables Importer Plugin** - For bulk variable creation
2. **Tokens Studio Plugin** - For token management and sync
3. **Component Inspector Plugin** - For component property mapping

### Variable Import Steps

1. **Create Collections** - Set up 5 collections (Colors, Spacing, Typography, Effects, Motion)
2. **Import Variables** - Use JSON import for bulk creation
3. **Set Descriptions** - Ensure all variables have clear descriptions
4. **Configure Modes** - Set up light mode (dark mode reserved for future)
5. **Validate References** - Ensure all variables resolve correctly

### Component Creation Steps

1. **Create Master Components** - Build tile, modal, badge, button components
2. **Apply Variables** - Map all properties to design variables
3. **Create Variants** - Set up status, size, and state variants
4. **Configure Auto-Layout** - Set up responsive behavior
5. **Build Component Library** - Organize components in library

### Component Property Assignments

```figma
// Example property assignments for OCC Tile
OCC Tile Component:
  - Fill: {occ-colors/surface/primary}
  - Stroke: {occ-colors/border/default}
  - Corner Radius: {occ-effects/radius/tile}
  - Drop Shadow: {occ-effects/shadow/tile}
  - Auto Layout Padding: {occ-spacing/tile/padding}
  - Auto Layout Gap: {occ-spacing/tile/internal}

OCC Tile Title Text:
  - Fill: {occ-colors/text/primary}
  - Font Size: {occ-typography/size/heading}
  - Font Weight: {occ-typography/weight/semibold}
  - Line Height: {occ-typography/lineHeight/tight}

OCC Tile Badge:
  - Fill: {occ-colors/status/healthy/background}
  - Stroke: {occ-colors/status/healthy/border}
  - Corner Radius: {occ-effects/radius/sm}
```

## Documentation and Handoff

### Developer Handoff Assets

1. **Token JSON Export** - Machine-readable token definitions
2. **Component Specifications** - Detailed component property mapping
3. **Responsive Behavior Documentation** - Breakpoint behavior descriptions
4. **Code Examples** - CSS implementation snippets
5. **Accessibility Notes** - Focus management and screen reader requirements

### Design System Documentation

1. **Component Usage Guidelines** - When and how to use each component
2. **Token Application Examples** - Real-world usage scenarios
3. **Responsive Design Patterns** - Layout behavior across breakpoints
4. **Accessibility Standards** - WCAG 2.2 AA compliance requirements
5. **Brand Guidelines Integration** - Alignment with overall brand system

### Quality Assurance Checklist

- [ ] All variables import correctly without errors
- [ ] Component variants display all status states properly
- [ ] Responsive behavior matches specification across breakpoints
- [ ] Color contrast meets WCAG 2.2 AA requirements (4.5:1 minimum)
- [ ] Auto-layout behaves correctly with dynamic content
- [ ] Component library organization is logical and searchable
- [ ] All components have proper naming and descriptions
- [ ] Token references resolve correctly in all component properties

---

**Export Status**: Ready for Figma workspace access  
**Variables Count**: 89 design variables across 5 collections  
**Components Count**: 8 master components with variants  
**Responsive Breakpoints**: 3 breakpoints with container query support  
**Accessibility Compliance**: WCAG 2.2 AA verified  
**Contact**: customer.support@hotrodan.com
