---
epoch: 2025.10.E1
doc: docs/design/wireframes/polaris-dashboard-wireframes.md
owner: designer
last_reviewed: 2025-10-11
doc_hash: TBD
expires: 2025-10-18
---

# Enhanced Polaris-Aligned Dashboard Wireframes

## Overview
**Created**: 2025-10-11T04:53:28Z  
**Purpose**: Updated dashboard wireframes with enhanced Polaris alignment and responsive behavior  
**Responsive Breakpoints**: Desktop (1280px+), Tablet (768px+), Mobile (<768px)  
**Figma Variables**: Ready for token handoff (pending Figma workspace access)

## Responsive Grid System

### Desktop Layout (1280px+) - Primary Experience
```
┌─────────────────────────────────────────────────────────────────────────────┐
│ [Polaris AppProvider]                                                       │
│   [TopBar: Home | Additional page] [UserMenu]                              │
├─────────────────────────────────────────────────────────────────────────────┤
│ [Page: title="Operator Control Center"]                                    │
│                                                                             │
│ [Layout.Section]                                                            │
│   ┌─────────────────┬─────────────────┬─────────────────┐                  │
│   │ [Card:          │ [Card:          │ [Card:          │                  │
│   │  title="Sales   │  title="Fulfill│  title="Invent  │                  │
│   │  Pulse"]        │  Health"]       │  Heatmap"]      │                  │
│   │                 │                 │                 │                  │
│   │ [Badge:         │ [Badge:         │ [Badge:         │                  │
│   │  status=success]│  status=success]│  status=warning]│                  │
│   │ "Healthy"       │ "Healthy"       │ "Attention"     │                  │
│   │                 │                 │                 │                  │
│   │ [TextStyle:     │ [TextStyle:     │ [TextStyle:     │                  │
│   │  variation=     │  variation=     │  variation=     │                  │
│   │  headingLg]     │  headingLg]     │  headingLg]     │                  │
│   │ $8,425.50       │ All orders      │ 2 alerts        │                  │
│   │                 │ on track        │                 │                  │
│   │ [TextStyle:     │                 │ [List: type=    │                  │
│   │  variation=     │                 │  bullet]        │                  │
│   │  bodyMd]        │                 │ • Powder Board  │                  │
│   │ 58 orders       │                 │   XL: 6 left    │                  │
│   │                 │                 │ • Thermal       │                  │
│   │ [List: type=    │                 │   Gloves: 12    │                  │
│   │  bullet]        │                 │                 │                  │
│   │ • Powder Board  │                 │                 │                  │
│   │   XL: 14 units  │                 │                 │                  │
│   │                 │                 │                 │                  │
│   │ [ButtonGroup:   │ [ButtonGroup:   │ [ButtonGroup:   │                  │
│   │  segmented]     │  segmented]     │  segmented]     │                  │
│   │ [Button:        │ [Button:        │ [Button:        │                  │
│   │  primary]       │  primary]       │  primary]       │                  │
│   │ View Details    │ View Details    │ Take Action     │                  │
│   └─────────────────┴─────────────────┴─────────────────┘                  │
│                                                                             │
│ [Layout.Section: secondary]                                                 │
│   ┌─────────────────┬─────────────────┐                                   │
│   │ [Card:          │ [Card:          │                                   │
│   │  title="CX      │  title="SEO &   │                                   │
│   │  Escalations"]  │  Content"]      │                                   │
│   │                 │                 │                                   │
│   │ [Badge:         │ [Badge:         │                                   │
│   │  status=warning]│  status=success]│                                   │
│   │ "Attention"     │ "Healthy"       │                                   │
│   │                 │                 │                                   │
│   │ [TextStyle:     │ [TextStyle:     │                                   │
│   │  variation=     │  variation=     │                                   │
│   │  headingMd]     │  bodyMd]        │                                   │
│   │ 1 SLA breach    │ Traffic stable  │                                   │
│   │                 │                 │                                   │
│   │ [TextStyle:     │ Recent changes: │                                   │
│   │  variation=     │ [List: type=    │                                   │
│   │  bodyMd]        │  bullet]        │                                   │
│   │ Jamie Lee       │ • /new-arrivals │                                   │
│   │ Priority        │   -24% WoW      │                                   │
│   │                 │                 │                                   │
│   │ [Button:        │ [Button:        │                                   │
│   │  primary]       │  primary]       │                                   │
│   │ View & Reply    │ View Details    │                                   │
│   └─────────────────┴─────────────────┘                                   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Tablet Layout (768px - 1279px) - Two Column Grid
```
┌───────────────────────────────────────────────────────────┐
│ [Polaris AppProvider - Mobile optimized]                 │
│   [TopBar: collapsed navigation] [UserMenu]              │
├───────────────────────────────────────────────────────────┤
│ [Page: title="Control Center" fullWidth]                 │
│                                                           │
│ [Layout]                                                  │
│   ┌─────────────────────┬─────────────────────┐          │
│   │ [Card: sectioned]   │ [Card: sectioned]   │          │
│   │ Sales Pulse         │ Fulfillment Health  │          │
│   │ [Badge: success]    │ [Badge: success]    │          │
│   │ $8,425.50          │ All orders on track │          │
│   │ [Button: fullWidth] │ [Button: fullWidth] │          │
│   └─────────────────────┴─────────────────────┘          │
│                                                           │
│   ┌─────────────────────┬─────────────────────┐          │
│   │ [Card: sectioned]   │ [Card: sectioned]   │          │
│   │ Inventory Heatmap   │ CX Escalations      │          │
│   │ [Badge: warning]    │ [Badge: warning]    │          │
│   │ 2 alerts            │ 1 SLA breach        │          │
│   │ [Button: fullWidth] │ [Button: fullWidth] │          │
│   └─────────────────────┴─────────────────────┘          │
│                                                           │
│   ┌───────────────────────────────────────────┐          │
│   │ [Card: sectioned]                         │          │
│   │ SEO & Content Watch                       │          │
│   │ [Badge: success] Traffic stable           │          │
│   │ [Button: fullWidth]                       │          │
│   └───────────────────────────────────────────┘          │
│                                                           │
└───────────────────────────────────────────────────────────┘
```

### Mobile Layout (<768px) - Single Column Stack
```
┌─────────────────────────────────────┐
│ [TopBar: navigation=overlay]        │
├─────────────────────────────────────┤
│ [Page: narrowWidth]                 │
│ Operator Control Center             │
│                                     │
│ [Stack: spacing=loose]              │
│   ┌─────────────────────────────┐   │
│   │ [Card: sectioned]           │   │
│   │ Sales Pulse                 │   │
│   │ [Badge: success] Healthy    │   │
│   │                             │   │
│   │ [TextStyle: headingLg]      │   │
│   │ $8,425.50                   │   │
│   │ [TextStyle: bodyMd]         │   │
│   │ 58 orders                   │   │
│   │                             │   │
│   │ [Button: fullWidth,         │   │
│   │  primary]                   │   │
│   │ View Details                │   │
│   └─────────────────────────────┘   │
│                                     │
│   ┌─────────────────────────────┐   │
│   │ [Card: sectioned]           │   │
│   │ Fulfillment Health          │   │
│   │ [Badge: success] Healthy    │   │
│   │ All orders on track         │   │
│   │ [Button: fullWidth]         │   │
│   └─────────────────────────────┘   │
│                                     │
│   ┌─────────────────────────────┐   │
│   │ [Card: sectioned]           │   │
│   │ Inventory Heatmap           │   │
│   │ [Badge: warning] Attention  │   │
│   │ 2 alerts                    │   │
│   │ [Button: fullWidth]         │   │
│   └─────────────────────────────┘   │
│                                     │
│   [... additional cards]           │
│                                     │
└─────────────────────────────────────┘
```

## Enhanced Modal Specifications with Polaris Components

### CX Escalation Modal - Polaris Implementation
```
┌────────────────────────────────────────────────────────────┐
│ [Modal: large, title="CX Escalation"]                     │
│   [Button: plain, icon=CancelSmallMinor]                  │
├────────────────────────────────────────────────────────────┤
│ [Modal.Section]                                            │
│   [Card: sectioned]                                        │
│     [Stack]                                                │
│       [TextStyle: variation=headingMd]                     │
│       Customer: Jamie Lee                                  │
│                                                            │
│       [InlineStack: gap="200"]                            │
│         [Badge: status=critical] Priority                  │
│         [Badge: status=critical] SLA Breached             │
│         [TextStyle: variation=bodySm]                      │
│         2h 15m ago                                         │
│                                                            │
│   [Divider]                                               │
│                                                            │
│   [Card: title="Conversation Preview"]                    │
│     [Scrollable: height="200px"]                         │
│       [Stack: spacing=tight]                             │
│         [TextContainer]                                   │
│           [TextStyle: variation=bodyMd]                   │
│           Jamie: "Where is my order? It's been 5 days..."│
│                                                           │
│           [TextStyle: variation=bodySm,                   │
│            color=subdued]                                 │
│           2 hours ago                                     │
│                                                           │
│   [Modal.Section]                                         │
│     [FormLayout]                                          │
│       [FormLayout.Group]                                  │
│         [TextField: label="Suggested Reply"               │
│          multiline=4                                      │
│          value="Hi Jamie, thanks for your patience..."]   │
│                                                           │
│         [TextField: label="Internal Notes"                │
│          multiline=3                                      │
│          helpText="Add context for audit trail"]         │
│                                                           │
│       [FormLayout.Group: condensed]                       │
│         [Select: label="Action Required"                  │
│          options=[                                        │
│            {label: "Send Reply", value: "reply"},        │
│            {label: "Escalate to Manager", value: "esc"}, │
│            {label: "Mark Resolved", value: "resolve"}    │
│          ]]                                               │
│                                                           │
│ [Modal.Section]                                           │
│   [InlineStack: align=end]                               │
│     [ButtonGroup]                                         │
│       [Button: outline] Cancel                            │
│       [Button: primary] Send Reply                        │
│                                                           │
└────────────────────────────────────────────────────────────┘
```

### Sales Pulse Modal - Polaris Implementation  
```
┌────────────────────────────────────────────────────────────┐
│ [Modal: medium, title="Sales Pulse Review"]               │
│   [Button: plain, icon=CancelSmallMinor]                  │
├────────────────────────────────────────────────────────────┤
│ [Modal.Section]                                            │
│   [Card: title="24-Hour Snapshot"]                        │
│     [DescriptionList]                                      │
│       [DescriptionList.Description]                       │
│         term="Revenue"                                     │
│         [InlineStack]                                      │
│           [TextStyle: variation=headingLg]                 │
│           $8,425.50                                        │
│           [Badge: status=success] +12% WoW                 │
│                                                            │
│       [DescriptionList.Description]                       │
│         term="Orders" description="58"                     │
│                                                            │
│       [DescriptionList.Description]                       │
│         term="Average Order" description="$145.27"        │
│                                                            │
│   [Card: title="Top Performing SKUs"]                     │
│     [DataTable: columnContentTypes=["text", "numeric"]]   │
│       headers=["Product", "Units Sold", "Revenue"]        │
│       rows=[                                               │
│         ["Powder Board XL", "14", "$2,100"],             │
│         ["Thermal Gloves", "12", "$720"]                  │
│       ]                                                    │
│                                                            │
│ [Modal.Section]                                            │
│   [FormLayout]                                             │
│     [FormLayout.Group]                                     │
│       [Select: label="Action Required"                     │
│        options=[                                           │
│          {label: "Log follow-up", value: "log"},         │
│          {label: "Escalate to ops", value: "escalate"}   │
│        ]]                                                  │
│                                                            │
│       [TextField: label="Notes (Audit Trail)"             │
│        multiline=3                                         │
│        placeholder="Add context for decision..."]         │
│                                                            │
│ [Modal.Section]                                            │
│   [InlineStack: align=end]                                │
│     [ButtonGroup]                                          │
│       [Button: outline] Cancel                             │
│       [Button: primary] Log Follow-up                      │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

## Toast Notification Specifications

### Success Toast (Polaris Implementation)
```
[Toast: content="Reply sent to Jamie Lee. Decision logged to audit trail."
 action={
   content: "View Audit",
   onAction: () => navigate("/audit/cx-escalations")
 }
 duration=6000
 color="success"]
```

### Error Toast (Polaris Implementation)
```  
[Toast: content="Unable to send reply. Network error occurred."
 action={
   content: "Retry",
   onAction: () => retryAction()
 }
 duration=0
 color="critical"]
```

### Loading Toast (Polaris Implementation)
```
[Toast: content="Sending reply..."
 loading=true
 duration=0]
```

## Enhanced Status Badge System

### Polaris Badge Implementation
```typescript
// Status mapping for Polaris Badge component
const STATUS_MAPPING = {
  healthy: {
    status: "success" as const,
    children: "Healthy"
  },
  attention: {
    status: "critical" as const, 
    children: "Attention needed"
  },
  unconfigured: {
    status: "new" as const,
    children: "Configuration required"
  }
} as const;

// Usage in tile components
<Badge {...STATUS_MAPPING[tile.status]} />
```

## Responsive Container Queries

### CSS Implementation for Polaris Alignment
```css
/* Container query-based responsive behavior */
.occ-dashboard-grid {
  container-type: inline-size;
  display: grid;
  gap: var(--p-space-5);
}

/* Desktop: 3-column grid (1280px+) */
@container (min-width: 1280px) {
  .occ-dashboard-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .occ-tile-card {
    min-height: 320px;
  }
}

/* Tablet: 2-column grid (768px - 1279px) */
@container (min-width: 768px) and (max-width: 1279px) {
  .occ-dashboard-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .occ-tile-card {
    min-height: 280px;
  }
}

/* Mobile: Single column (<768px) */
@container (max-width: 767px) {
  .occ-dashboard-grid {
    grid-template-columns: 1fr;
  }
  
  .occ-tile-card {
    min-height: 240px;
  }
  
  .occ-button-group {
    flex-direction: column;
  }
  
  .occ-button {
    width: 100%;
  }
}
```

## Accessibility Annotations

### Focus Management Flow
```
Tab Order for Dashboard:
1. TopBar navigation
2. User menu
3. First tile CTA button
4. Second tile CTA button  
5. Third tile CTA button
6. Fourth tile CTA button
7. Fifth tile CTA button

Tab Order for Modal (CX Escalation):
1. Close button (×)
2. Suggested reply textarea  
3. Internal notes textarea
4. Action selection dropdown
5. Cancel button
6. Primary action button (Send Reply)

Escape Key Behavior:
- Dashboard: No action (no overlays)
- Modal: Close modal, return focus to trigger
- Toast: Dismiss toast, maintain current focus
```

### Screen Reader Announcements
```html
<!-- Dashboard tile status announcements -->
<div role="region" aria-labelledby="sales-pulse-title">
  <h2 id="sales-pulse-title">Sales Pulse</h2>
  <div aria-live="polite" aria-atomic="true">
    <span class="sr-only">Status:</span>
    <Badge status="success">Healthy</Badge>
  </div>
</div>

<!-- Modal announcements -->
<Modal
  title="CX Escalation"
  open={isOpen}
  onClose={onClose}
  aria-describedby="escalation-description"
>
  <div id="escalation-description" className="sr-only">
    Customer service escalation modal for Jamie Lee. 
    Priority issue with SLA breach requiring immediate attention.
  </div>
</Modal>

<!-- Toast announcements -->
<Toast
  content="Reply sent successfully"
  aria-live="assertive"
  role="status"
/>
```

## Empty and Error State Enhancements

### Empty State - Polaris Implementation
```
┌─────────────────────────────────────┐
│ [Card: sectioned]                   │
│   CX Escalations                    │
│   [Badge: status=success] Healthy   │
│                                     │
│   [EmptyState:                      │
│    image="/empty-states/healthy.svg"│
│    heading="No escalations"         │
│    action={                         │
│      content: "Review settings",    │
│      url: "/settings/cx"            │
│    }]                               │
│     All conversations are on track! │
│     No SLA breaches detected.       │
│                                     │
│   [TextStyle: variation=bodySm,     │
│    color=subdued]                   │
│   Last refreshed 2 min ago          │
│                                     │
└─────────────────────────────────────┘
```

### Error State - Polaris Implementation  
```
┌─────────────────────────────────────┐
│ [Card: sectioned]                   │
│   SEO & Content Watch               │
│   [Badge: status=critical]          │
│   Attention needed                  │
│                                     │
│   [EmptyState:                      │
│    image="/empty-states/error.svg"  │
│    heading="Unable to load data"    │
│    action={                         │
│      content: "Retry",              │
│      onAction: () => refetch()      │
│    }                                │
│    secondaryAction={                │
│      content: "View details",       │
│      url: "/diagnostics"            │
│    }]                               │
│     API rate limit exceeded.        │
│     Please wait before retrying.    │
│                                     │
│   [TextStyle: variation=bodySm]     │
│   Last attempted 1 min ago          │
│                                     │
└─────────────────────────────────────┘
```

### Loading State - Polaris Implementation
```
┌─────────────────────────────────────┐
│ [Card: sectioned]                   │
│   Sales Pulse                       │
│   [Badge: status=info] Refreshing   │
│                                     │
│   [Stack: alignment=center]         │
│     [Spinner: size=large]           │
│     [TextStyle: variation=bodyMd]   │
│     Loading latest data...          │
│                                     │
│   [TextStyle: variation=bodySm,     │
│    color=subdued]                   │
│   Last refreshed 5 min ago          │
│                                     │
└─────────────────────────────────────┘
```

## Copy Deck Integration

### Tile Action Labels (English-only)
```typescript
const TILE_COPY = {
  salesPulse: {
    title: "Sales Pulse",
    cta: "View Details",
    ctaAriaLabel: "View sales pulse details and take action"
  },
  fulfillmentHealth: {
    title: "Fulfillment Health", 
    cta: "View Details",
    ctaAriaLabel: "View fulfillment health details"
  },
  inventoryHeatmap: {
    title: "Inventory Heatmap",
    cta: "Take Action", 
    ctaAriaLabel: "Take action on inventory alerts"
  },
  cxEscalations: {
    title: "CX Escalations",
    cta: "View & Reply",
    ctaAriaLabel: "View customer escalation and send reply"
  },
  seoContent: {
    title: "SEO & Content Watch",
    cta: "View Details",
    ctaAriaLabel: "View SEO and content performance details"
  }
} as const;
```

### Status Messages (English-only)
```typescript
const STATUS_COPY = {
  healthy: {
    label: "Healthy",
    description: "All systems operating normally"
  },
  attention: {
    label: "Attention needed", 
    description: "Action required to resolve issues"
  },
  unconfigured: {
    label: "Configuration required",
    description: "Integration setup needed"
  }
} as const;
```

### Modal Action Labels (English-only)
```typescript
const MODAL_COPY = {
  cxEscalation: {
    title: "CX Escalation",
    primaryAction: "Send Reply",
    secondaryAction: "Cancel",
    actionLabels: {
      reply: "Send Reply",
      escalate: "Escalate to Manager", 
      resolve: "Mark Resolved"
    }
  },
  salesPulse: {
    title: "Sales Pulse Review",
    primaryAction: "Log Follow-up",
    secondaryAction: "Cancel",
    actionLabels: {
      log: "Log Follow-up",
      escalate: "Escalate to Ops"
    }
  }
} as const;
```

## Figma Variables Export Preparation

### Token Categories for Figma
```json
{
  "collections": {
    "occ-colors": {
      "modes": ["light"],
      "variables": {
        "status/healthy/text": "#1a7f37",
        "status/healthy/background": "#e3f9e5", 
        "status/healthy/border": "#2e844a",
        "status/attention/text": "#d82c0d",
        "status/attention/background": "#fff4f4",
        "status/attention/border": "#e85c4a"
      }
    },
    "occ-spacing": {
      "modes": ["base"],
      "variables": {
        "tile/padding": "20px",
        "tile/gap": "20px", 
        "tile/internal": "16px",
        "modal/padding": "24px",
        "modal/gap": "16px"
      }
    },
    "occ-typography": {
      "modes": ["base"],
      "variables": {
        "size/heading": "1.15rem",
        "size/metric": "1.5rem",
        "size/body": "1rem", 
        "size/meta": "0.85rem",
        "weight/regular": 400,
        "weight/semibold": 600
      }
    }
  }
}
```

### Component Property Mapping
```json
{
  "components": {
    "OCC Tile": {
      "properties": {
        "background": "occ-colors/surface/primary",
        "padding": "occ-spacing/tile/padding",
        "border-radius": "occ-effects/radius/md",
        "box-shadow": "occ-effects/shadow/sm"
      }
    },
    "OCC Modal": {
      "properties": {
        "background": "occ-colors/surface/primary", 
        "padding": "occ-spacing/modal/padding",
        "border-radius": "occ-effects/radius/lg",
        "box-shadow": "occ-effects/shadow/xl"
      }
    }
  }
}
```

## Visual Hierarchy Validation

### Information Architecture
```
Priority 1 (Immediate attention):
- Status badges (especially "Attention needed")
- Critical metrics (revenue, SLA breaches)
- Primary action buttons

Priority 2 (Important context):
- Tile titles
- Key performance indicators 
- Secondary data points

Priority 3 (Supporting information):
- Meta information (last refreshed)
- Detailed lists and breakdowns
- Help text and descriptions
```

### Contrast Validation
```css
/* WCAG 2.2 AA compliance verification */
.occ-text-primary {
  color: #202223; /* 4.5:1 on white */
}

.occ-text-secondary {  
  color: #637381; /* 4.5:1 on white */
}

.occ-status-healthy-text {
  color: #1a7f37; /* 4.8:1 on white */
}

.occ-status-attention-text {
  color: #d82c0d; /* 4.5:1 on white */ 
}

.occ-button-primary {
  background: #2c6ecb; /* 4.5:1 with white text */
  color: #ffffff;
}
```

## Implementation Handoff Notes

### Development Priority
1. **Responsive grid implementation** - Container queries for breakpoint behavior
2. **Polaris component integration** - Replace custom components with Polaris equivalents  
3. **Toast notification system** - Implement Polaris Toast with proper announcements
4. **Focus management** - Ensure keyboard navigation follows Polaris patterns
5. **Copy integration** - Replace hardcoded strings with copy deck references

### QA Testing Requirements
- **Responsive behavior** - Test all breakpoints with real content
- **Screen reader compatibility** - Verify announcements and focus management
- **Keyboard navigation** - Tab order and escape key behavior
- **Color contrast** - Automated and manual contrast validation
- **Loading states** - Verify skeleton and spinner implementations

### Figma Handoff (Pending Access)
- **Variable collections** - Import token JSON as Figma variables
- **Component library** - Create master components with variable mapping
- **Prototype flows** - Interactive demos of approval and error flows
- **Annotation layers** - Development handoff specifications

---

**Wireframe Status**: Ready for development handoff  
**Responsive Testing**: Required across all breakpoints  
**Polaris Compliance**: Enhanced with native component specifications  
**Copy Integration**: Ready for marketing coordination  
**Figma Variables**: Prepared for token handoff  
**Contact**: customer.support@hotrodan.com