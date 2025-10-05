---
epoch: 2025.10.E1
doc: docs/design/wireframes/dashboard_wireframes.md
owner: designer
last_reviewed: 2025-10-05
doc_hash: TBD
expires: 2025-10-18
---
# Operator Control Center — Wireframes

## Dashboard View (Default State)

### Layout Structure
```
┌─────────────────────────────────────────────────────────────────┐
│ [App Nav: Home | Additional page]                              │
├─────────────────────────────────────────────────────────────────┤
│ Operator Control Center                                         │
│                                                                 │
│ ┌────────────┬────────────┬────────────┐                      │
│ │ Sales      │ Fulfillment│ Inventory  │                      │
│ │ Pulse      │ Health     │ Heatmap    │                      │
│ │            │            │            │                      │
│ │ Healthy ✓  │ Healthy ✓  │ Attention  │                      │
│ │            │            │ needed ⚠   │                      │
│ │ $8,425.50  │ All orders │ 2 alerts   │                      │
│ │ 58 orders  │ on track   │            │                      │
│ │            │            │ • Powder   │                      │
│ │ Top SKUs:  │            │   Board XL │                      │
│ │ • Powder   │            │   6 left   │                      │
│ │   Board XL │            │ • Thermal  │                      │
│ │   14 units │            │   Gloves   │                      │
│ │            │            │   12 left  │                      │
│ │ [View     ]│ [View     ]│ [Take     ]│                      │
│ │  Details   │  Details   │  Action   ]│                      │
│ └────────────┴────────────┴────────────┘                      │
│                                                                 │
│ ┌────────────┬────────────┐                                   │
│ │ CX         │ SEO &      │                                   │
│ │ Escalations│ Content    │                                   │
│ │            │ Watch      │                                   │
│ │ Attention  │ Healthy ✓  │                                   │
│ │ needed ⚠   │            │                                   │
│ │            │ Traffic    │                                   │
│ │ 1 SLA      │ stable     │                                   │
│ │ breach     │            │                                   │
│ │            │ Recent:    │                                   │
│ │ Jamie Lee  │ • /new-    │                                   │
│ │ Priority   │   arrivals │                                   │
│ │            │   -24% WoW │                                   │
│ │ [View     ]│ [View     ]│                                   │
│ │  & Reply   │  Details   │                                   │
│ └────────────┴────────────┘                                   │
└─────────────────────────────────────────────────────────────────┘
```

## Tile Detail Modal — CX Escalations

### CX Escalation Detail View with Approval Flow
```
┌──────────────────────────────────────────────────────────┐
│ ✕  CX Escalation — Jamie Lee                            │
├──────────────────────────────────────────────────────────┤
│                                                          │
│ Status: Open • Priority                                  │
│ SLA: Breached (2h 15m ago)                              │
│ Last Message: 2 hours ago                               │
│                                                          │
│ ┌────────────────────────────────────────────────────┐ │
│ │ Conversation Preview                               │ │
│ │                                                    │ │
│ │ Jamie: "Where is my order? It's been 5 days..."  │ │
│ │                                                    │ │
│ └────────────────────────────────────────────────────┘ │
│                                                          │
│ Suggested Reply (AI-generated):                         │
│ ┌────────────────────────────────────────────────────┐ │
│ │ "Hi Jamie, thanks for your patience. We're        │ │
│ │ expediting your order update now."                │ │
│ └────────────────────────────────────────────────────┘ │
│                                                          │
│ ┌────────────────────────────────────────────────────┐ │
│ │ Actions:                                           │ │
│ │                                                    │ │
│ │ [Approve & Send Reply]  [Edit Reply]              │ │
│ │ [Escalate to Manager]   [Mark Resolved]           │ │
│ └────────────────────────────────────────────────────┘ │
│                                                          │
│                               [Cancel]  [Confirm Action]│
└──────────────────────────────────────────────────────────┘
```

## Tile Detail Modal — Inventory Heatmap

### Inventory Alert with Reorder Approval
```
┌──────────────────────────────────────────────────────────┐
│ ✕  Inventory Alert — Powder Board XL                    │
├──────────────────────────────────────────────────────────┤
│                                                          │
│ SKU: BOARD-XL                                           │
│ Current Stock: 6 units                                  │
│ Threshold: 10 units                                     │
│ Days of Cover: 2.5 days                                 │
│                                                          │
│ ┌────────────────────────────────────────────────────┐ │
│ │ 14-Day Velocity Analysis                           │ │
│ │                                                    │ │
│ │ Avg daily sales: 2.4 units                        │ │
│ │ Peak day: 5 units (Oct 2)                         │ │
│ │ Trend: Increasing (+15% WoW)                      │ │
│ └────────────────────────────────────────────────────┘ │
│                                                          │
│ Recommended Action:                                     │
│ ┌────────────────────────────────────────────────────┐ │
│ │ Reorder Quantity: 30 units                        │ │
│ │ Lead Time: 7 days                                 │ │
│ │ Supplier: Acme Distribution                       │ │
│ └────────────────────────────────────────────────────┘ │
│                                                          │
│ ┌────────────────────────────────────────────────────┐ │
│ │ Actions:                                           │ │
│ │                                                    │ │
│ │ [Create Draft PO]      [Adjust Quantity]          │ │
│ │ [Mark as Intentional]  [Snooze Alert]             │ │
│ └────────────────────────────────────────────────────┘ │
│                                                          │
│                               [Cancel]  [Confirm Action]│
└──────────────────────────────────────────────────────────┘
```

## Approval Flow Annotations

### Toast Notifications

#### Success Toast (After Approval)
```
┌───────────────────────────────────────┐
│ ✓ Action Confirmed                    │
│                                       │
│ Reply sent to Jamie Lee.              │
│ Decision logged to audit trail.       │
│                                       │
│                          [Dismiss] ✕  │
└───────────────────────────────────────┘
```

#### Error Toast (Failed Action)
```
┌───────────────────────────────────────┐
│ ⚠ Action Failed                       │
│                                       │
│ Unable to send reply. Network error.  │
│ Please try again.                     │
│                                       │
│                    [Retry] [Dismiss]  │
└───────────────────────────────────────┘
```

#### Confirmation Dialog (Destructive Action)
```
┌──────────────────────────────────────────┐
│ Confirm Purchase Order                   │
├──────────────────────────────────────────┤
│                                          │
│ You're about to create a PO for:        │
│                                          │
│ • 30 units of Powder Board XL           │
│ • Estimated cost: $1,800                │
│ • Supplier: Acme Distribution           │
│                                          │
│ This action will be logged in the       │
│ decision audit trail.                   │
│                                          │
│             [Cancel]  [Confirm & Create]│
└──────────────────────────────────────────┘
```

## Empty States

### Tile with No Data
```
┌──────────────────────────────┐
│ CX Escalations               │
│                              │
│ Healthy ✓                    │
│                              │
│ ┌──────────────────────────┐ │
│ │  ☺                       │ │
│ │                          │ │
│ │ No SLA breaches detected.│ │
│ │ All conversations are on │ │
│ │ track!                   │ │
│ └──────────────────────────┘ │
│                              │
│ Last refreshed 2 min ago     │
└──────────────────────────────┘
```

### Tile Unconfigured State
```
┌──────────────────────────────┐
│ CX Escalations               │
│                              │
│ Configuration required ⚙     │
│                              │
│ ┌──────────────────────────┐ │
│ │  ⚙                       │ │
│ │                          │ │
│ │ Connect integration to   │ │
│ │ enable this tile.        │ │
│ │                          │ │
│ │ [Configure Chatwoot]     │ │
│ └──────────────────────────┘ │
└──────────────────────────────┘
```

### Tile Error State
```
┌──────────────────────────────┐
│ SEO & Content Watch          │
│                              │
│ Attention needed ⚠           │
│                              │
│ ┌──────────────────────────┐ │
│ │  ⚠                       │ │
│ │                          │ │
│ │ Unable to load data.     │ │
│ │ API rate limit exceeded. │ │
│ │                          │ │
│ │ [Retry]  [View Details]  │ │
│ └──────────────────────────┘ │
│                              │
│ Last attempted 1 min ago     │
└──────────────────────────────┘
```

## Mobile/Tablet Responsive Behavior

### Tablet (768px) - 2 Column Grid
```
┌─────────────────────────────┐
│ Operator Control Center     │
│                             │
│ ┌───────────┬───────────┐  │
│ │ Sales     │ Fulfill-  │  │
│ │ Pulse     │ ment      │  │
│ └───────────┴───────────┘  │
│                             │
│ ┌───────────┬───────────┐  │
│ │ Inventory │ CX        │  │
│ │ Heatmap   │ Escalate  │  │
│ └───────────┴───────────┘  │
│                             │
│ ┌───────────────────────┐  │
│ │ SEO & Content Watch   │  │
│ └───────────────────────┘  │
└─────────────────────────────┘
```

### Desktop (1280px+) - 3 Column Grid (Primary)
Tiles arrange in 3-column grid as shown in main dashboard view above.

## Interaction States

### Tile Hover State
- Subtle elevation increase (shadow-200)
- Border color shift to interactive-border
- Cursor: pointer

### Button States
- Default: Solid fill with primary color
- Hover: Darken 10%
- Active: Darken 20% + subtle scale(0.98)
- Disabled: 40% opacity + cursor not-allowed
- Focus: 2px outline with focus-ring color

### Loading State (Tile Refresh)
```
┌──────────────────────────────┐
│ Sales Pulse                  │
│                              │
│ [Spinner] Refreshing...      │
│                              │
│ Last refreshed 5 min ago     │
└──────────────────────────────┘
```

## Design Notes

1. **Polaris Alignment**: All components use Shopify Polaris design tokens and follow Polaris patterns for modals, buttons, and status indicators.

2. **Status Indicators**:
   - ✓ Healthy (green-600)
   - ⚠ Attention needed (yellow-600)
   - ⚙ Configuration required (gray-500)

3. **Typography Scale**:
   - Tile headings: 1.15rem, weight 600
   - Primary metrics: 1.5rem, weight 600
   - Body text: 1rem, weight 400
   - Meta text: 0.85rem, weight 400

4. **Spacing System**:
   - Tile padding: var(--p-space-5, 20px)
   - Tile gap: var(--p-space-5, 20px)
   - Internal gaps: var(--p-space-4, 16px)

5. **Focus Order**: Tab navigation flows left-to-right, top-to-bottom through tiles, then into action buttons within each tile.
