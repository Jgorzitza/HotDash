---
epoch: 2025.10.E1
doc: docs/design/modal_alt_text.md
owner: designer
last_reviewed: 2025-10-10
doc_hash: TBD
expires: 2025-10-17
---
# OCC Modal Alt Text & Focus Order — Interim Handoff

> Use this reference until live staging captures are available. Copy verbatim into enablement/QA materials and update once annotated screenshots from staging replace the static SVG overlays.

## CX Escalations Modal
- **Alt Text:** “CX Escalations modal for customer Jamie Lee. Header shows breached SLA timer in red badge. Conversation preview lists recent messages, tooltip icons mark template guidance, and action buttons include Approve & Send Reply, Edit Reply, Escalate to Manager, Mark Resolved. Audit trail banner displayed at bottom.”
- **Focus Order:**
  1. Close icon
  2. Customer name + SLA status block
  3. Conversation preview scroll region
  4. Template selector dropdown + helper tooltip
  5. Action buttons (Approve & Send Reply → Edit Reply → Escalate → Mark Resolved)
  6. Audit trail banner / footer link
- **Tooltip Notes:** Breach badge uses `top-start` tooltip clarifying breach timestamp; template helper sits `right` of selector; escalation ladder reminder anchored `bottom`.

## Sales Pulse Modal
- **Alt Text:** “Sales Pulse modal with revenue delta chip showing +12%. Chart panel highlights today versus rolling 7 day revenue, table lists top SKUs with stock status, fulfillment blockers section outlines two orders, footer banner reminds logging decision to Memory.”
- **Focus Order:**
  1. Close icon
  2. Header summary + revenue delta chip
  3. Chart container (includes skip link to metrics table)
  4. Metrics table (Top SKUs)
  5. Fulfillment blockers list
  6. Action buttons (Approve Alert → Notify Fulfillment → Dismiss)
  7. Decision logging reminder banner
- **Tooltip Notes:** Revenue delta chip tooltip positioned `top-end`; ensure copy matches marketing approval variant. Skip link returns focus to metrics table for keyboard users.

## Inventory Heatmap Modal
- **Alt Text:** “Inventory Heatmap modal for Powder Board XL. SKU summary block shows current stock 6 units, threshold 10, Days of Cover 2.5. Velocity analysis card details 14-day averages and peak day. Recommended reorder panel suggests 30 units from Acme Distribution. Action row offers Confirm, Mark Intentional, Snooze buttons.”
- **Focus Order:**
  1. Close icon
  2. SKU summary grid (including Days of Cover chip)
  3. Velocity analysis section
  4. Recommended reorder panel
  5. Action buttons (Confirm → Mark Intentional → Snooze)
  6. Footer toast region (post-action)
- **Tooltip Notes:** Days of Cover chip uses `top-end` tooltip explaining projection. Confirm button retains focus until toast announces result; toast should read “Action Confirmed — Decision logged to audit trail.”

## Accessibility Reminders
- Ensure `aria-live="polite"` on toast notifications across modals.
- Maintain 2px focus ring offset (`--occ-focus-ring`) on all interactive elements.
- Provide `aria-describedby` linkage between modal title and status badges where applicable.
- When staging captures are available, validate that alt text aligns with final UI labels and update this doc with final evidence links.
