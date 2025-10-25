---
epoch: 2025.10.E1
doc: docs/design/wireframes/dashboard_wireframes.md
owner: designer
last_reviewed: 2025-10-13
doc_hash: TBD
expires: 2025-10-20
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

### Polaris Implementation Notes

- Modal container uses Polaris `Modal` with `sectioned` layout; actions render via `ButtonGroup` to match Polaris spacing tokens.
- Conversation preview maps to Polaris `LegacyCard` sections so transcripts remain scrollable and focusable.
- Approval buttons reuse the primary/secondary button tokens defined in `docs/design/tokens/design_tokens.md` (`--occ-button-primary`, `--occ-button-secondary`).

### Focus Order & Keyboard Flow

1. Close button (`aria-label="Close escalation modal"`)
2. Modal heading (programmatically focused for screen reader context)
3. Conversation preview (`role="log"`; allow arrow navigation)
4. Suggested reply textarea
5. Internal note textarea (helper text includes `customer.support@hotrodan.com`)
6. Primary action `Approve & Send Reply`
7. Secondary action `Escalate to Manager`
8. Secondary action `Mark Resolved`
9. Plain action `Cancel`

### Supabase & Audit Trail Hooks

- Approvals write to `supabase.from('cx_escalations_decisions')`; include `decision_type`, `agent_id`, and `transcript_id`.
- `Escalate to Manager` pushes a record to `supabase.functions.invoke('create_escalation_ticket')`.
- Every submit action also emails `customer.support@hotrodan.com` via the centralized notification worker; copy mirrors `modal.escalation.support_inbox`.

### Toast & Retry States

- Success toast fires on resolved promise from Supabase insert (see `toast.success.reply_sent` and `toast.success.decision_logged`).
- Error toast surfaces API failure (`toast.error.network`) with contextual retry link that re-focuses the primary CTA.
- Gracefully degrade when Supabase is offline by disabling primary buttons and showing banner copy: “Decision logging unavailable. Try again later or email customer.support@hotrodan.com manually.”

## Tile Detail Modal — Sales Pulse

### Revenue Variance Review with Decision Logging

```
┌──────────────────────────────────────────────────────────┐
│ ✕  Sales Pulse — Variance Review                        │
├──────────────────────────────────────────────────────────┤
│                                                          │
│ Snapshot (Last 24h)                                      │
│ • Revenue: $8,425.50 (▲ 12% WoW)                        │
│ • Orders: 58                                             │
│ • Avg order: $145.27                                     │
│                                                          │
│ Top SKUs                                                 │
│ • Powder Board XL — 14 units                            │
│ • Thermal Gloves — 12 units                             │
│                                                          │
│ Action                                                   │
│ ┌────────────────────────────────────────────────────┐ │
│ │ What do you want to do?                          ▼ │ │
│ │  ▸ Log follow-up                                 │ │
│ │  ▸ Escalate to ops                               │ │
│ └────────────────────────────────────────────────────┘ │
│                                                          │
│ Notes (audit trail)                                      │
│ ┌────────────────────────────────────────────────────┐ │
│ │ “Followed up with ops about delayed ski bindings.” │ │
│ └────────────────────────────────────────────────────┘ │
│                                                          │
│ [Log follow-up]         [Cancel]                         │
└──────────────────────────────────────────────────────────┘
```

### Polaris Implementation Notes

- Built with Polaris `Modal` + `FormLayout`; action selector uses Polaris `Select`.
- Primary CTA text mirrors the current select option (`Log follow-up` or `Escalate to ops`).
- Notes textarea leverages Polaris `TextField` with `multiline` and helper text referencing `customer.support@hotrodan.com` when escalation exceeds 15%.

### Focus Order & Keyboard Flow

1. Close button (`aria-label="Close sales pulse modal"`)
2. Modal heading (programmatically focused for announcements)
3. Action select (keyboard toggles between `Log follow-up` / `Escalate to ops`)
4. Notes textarea (`aria-describedby="sales-action-helper"`)
5. Primary CTA (`Log follow-up` or `Escalate to ops`)
6. Plain action `Cancel`

### Supabase & Toast Alignment

- Actions write to `supabase.from('sales_pulse_actions')` with `action_type`, `notes`, and `delta_percent`.
- When `Escalate to ops` is chosen, enqueue notification email to `customer.support@hotrodan.com` and flag tile status to `attention`.
- Success toast uses `toast.success.decision_logged`; copy includes SKU list when Escalate path selected.
- Error toast uses `toast.error.retry_prompt` with CTA to retry mutation; maintain focus on CTA to satisfy WCAG 3.2.4.

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

### Toast Trigger Matrix

| Flow                          | Trigger                                               | Toast ID                         | Follow-up                                                        |
| ----------------------------- | ----------------------------------------------------- | -------------------------------- | ---------------------------------------------------------------- |
| CX Escalation — Approve       | Supabase insert succeeds (`cx_escalations_decisions`) | `toast.success.reply_sent`       | Auto-dismiss after 6s; ensure transcript log highlights decision |
| CX Escalation — Escalate      | `create_escalation_ticket` function resolves          | `toast.success.action_confirmed` | Copy includes `customer.support@hotrodan.com` acknowledgement    |
| Sales Pulse — Log follow-up   | Supabase insert succeeds (`sales_pulse_actions`)      | `toast.success.decision_logged`  | Offer inline link to audit trail                                 |
| Sales Pulse — Escalate to ops | Notification worker resolves email send               | `toast.success.decision_logged`  | Set tile status to Attention on next refresh                     |
| Any modal — API failure       | Promise rejected                                      | `toast.error.network`            | Retry button re-focuses modal CTA                                |

### Approval Sequence (Happy Path)

```
Tile CTA → Modal opens (focus close button)
      ↓
User reviews Supabase-backed data (transcript/snapshot)
      ↓
Primary action → Supabase mutation
      ↓
Success toast → focus returns to originating CTA
      ↓
Audit trail badge updates + tile summary reflects latest state
```

### Accessibility Checklist

- Toasts announce via `role="status"` and sit in the DOM after `.app-shell` so screen readers hear them after actions.
- Retry surfaces maintain focus order; pressing Escape collapses toasts without moving focus.
- Support inbox email appears as plain text (not link) to avoid focus trap; copy deck entry `modal.escalation.support_inbox`.

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
