---
epoch: 2025.10.E1
doc: docs/design/modal_refresh_2025-10-13.md
owner: designer
last_reviewed: 2025-10-13
doc_hash: TBD
expires: 2025-10-20
---

# Modal Refresh Spec — CX Escalations & Sales Pulse (2025-10-13)

## Overview
- Reflect the latest React Router 7 modal flows backed by Supabase mutations.
- Ensure Polaris alignment for structure, spacing, and focus handling.
- Document toast/approval paths so engineering can wire Playwright coverage.
- Copy set to English-only; cross-check with `docs/design/copy_deck.md`.

## CX Escalations Modal (Supabase audit + approval)
```
┌──────────────────────────────────────────────────────────┐
│ ✕  CX Escalation — Jamie Lee                            │
├──────────────────────────────────────────────────────────┤
│ SLA badge: Breached (2h 15m ago) • Priority: High        │
│ Last replied: 2 hours ago                               │
│                                                          │
│ Conversation preview (role="log", aria-live="polite")    │
│  • Customer (2h 15m ago)                                 │
│    "Where is my order? It's been 5 days..."              │
│  • Agent (Draft)                                         │
│    "Hi Jamie, thanks for your patience..."               │
│                                                          │
│ Suggested reply (AI)                                     │
│ [ textarea ]                                             │
│ Helper: Log final decision to customer.support@hotrodan.com│
│                                                          │
│ Internal note (audit trail)                              │
│ [ textarea ]                                             │
│ Helper: Visible to operators only.                       │
│                                                          │
│ [Approve & Send Reply] [Escalate to Manager]             │
│ [Mark Resolved]            [Cancel]                      │
└──────────────────────────────────────────────────────────┘
```

### Interaction & Focus
- Initial focus: close button → programmatically move to modal heading for SR context.
- Focus order: close → heading → conversation log (scrollable) → suggested reply → internal note → primary/secondary CTAs → cancel.
- `Escalate to Manager` requires confirmation toast referencing `customer.support@hotrodan.com`.

### Supabase Mapping
| Trigger | Table/Function | Notes |
|---------|----------------|-------|
| Approve & Send Reply | `cx_escalations_decisions` | Insert `decision_type='approve'`, include AI draft, operator note. |
| Escalate to Manager | `create_escalation_ticket` function | Returns ticket ID; send email via worker. |
| Mark Resolved | `cx_escalations` update | Set `status='resolved'`, log resolver + timestamp. |

## Sales Pulse Modal (variance follow-up)
```
┌──────────────────────────────────────────────────────────┐
│ ✕  Sales Pulse — Variance Review                        │
├──────────────────────────────────────────────────────────┤
│ Revenue snapshot (last 24h): $8,425.50 (▲ 12% WoW)       │
│ Orders: 58 • Avg order value: $145.27                    │
│                                                          │
│ Top SKUs (list)                                          │
│ • Powder Board XL — 14 units                             │
│ • Thermal Gloves — 12 units                              │
│                                                          │
│ Action                                                   │
│ [ Select ▾ ]  (Log follow-up | Escalate to ops)          │
│ Helper: Variance escalations notify customer.support@hotrodan.com. |
│                                                          │
│ Notes (audit trail)                                      │
│ [ textarea ]                                             │
│                                                          │
│ [Log follow-up]            [Cancel]                      │
└──────────────────────────────────────────────────────────┘
```

### Interaction & Focus
- Entry focus: close button → heading → action select → notes → primary CTA → cancel.
- CTA label mirrors selected action; maintain `aria-live="polite"` on helper text when action changes.
- Use Polaris `Select` + `TextField` components for parity with Admin overlays.

### Supabase Mapping
| Trigger | Table | Notes |
|---------|-------|-------|
| Log follow-up | `sales_pulse_actions` | Insert `action_type='follow_up'`, `notes`, `sku_highlights`. |
| Escalate to ops | `sales_pulse_actions` + notify worker | Insert `action_type='escalate'`, send email via worker. |

## Toast & Audit Trail Alignment
- Success path → `toast.success.decision_logged` (both modals).
- Escalation path → `toast.success.action_confirmed` with ticket ID inline.
- Failure path → `toast.error.network` with Retry (returns focus to CTA).
- All toasts announce via `role="status"`; auto-dismiss after 6s; manual dismiss retains focus on originating element.

## Accessibility Checklist
- Modal headings use `aria-labelledby`.
- Conversation log uses semantic grouping with timestamps announced.
- Ensure Escape closes modal and returns focus to originating tile CTA (`navigate(-1)` fallback).
- Toasts respect `prefers-reduced-motion`: fade only, no slide.

## Evidence & Follow-up
- **Figma placeholder**: pending workspace access; ASCII spec linked for engineering unblock.
- **Playwright guidance**: add tests verifying toast copy, focus restoration, and Supabase mutation responses.
- Update `feedback/designer.md` with actual Figma link once tokens land. For now, reference this doc plus `docs/design/wireframes/dashboard_wireframes.md`.
