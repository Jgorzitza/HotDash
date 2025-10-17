# Tooltip & Modal Focus Annotations — React Router Sync 2025-10-10

## Overview

Design reference for Operator Control Center modals, updated to match the current React Router build as of 2025-10-10. Use this doc to keep engineering, QA, enablement, and marketing aligned while we await refreshed Figma access and Shopify Admin embed tokens. Copy remains English-only per canon.

## Shared guidance

- **Focus containment**: Maintain `focus-trap` within each modal. When we reintroduce heading auto-focus, ensure the first tabbable control is surfaced immediately after the announcement.
- **Focus-visible helper**: Apply `.occ-focus-visible` (see `artifacts/engineering/component-library-static-package-2025-10-09/focus-styles.css`) to any custom interactive element.
- **ARIA labelling**: Every modal exposes `aria-labelledby` to the heading and uses semantic section headings (`h3`) for screen reader navigation. Keep `role="log"` regions polite.
- **Support inbox copy**: All decision flows now reference the unified support inbox `customer.support@hotrodan.com`; confirm strings match the copy deck.

## CX Escalations Modal

### Current React Router build

- **Entry focus**: Close button (`button[aria-label="Close escalation modal"]`). The native dialog focuses this control when opened via tile CTA.
- **Tab sequence**:
  1. Close button
  2. Suggested reply textarea (`aria-label="Reply text"`)
  3. Internal note textarea (`placeholder="Add context for audit trail"`)
  4. Primary action `Approve & send`
  5. Secondary action `Escalate`
  6. Secondary action `Mark resolved`
  7. Plain action `Cancel`
- **Copy alignment**: Internal note helper text must include the support inbox reminder (copy deck key `modal.escalation.support_inbox`).
- **ARIA hooks**: Conversation log stays at `role="log"` with `aria-live="polite"`; ensure articles retain `data-author` for styling but expose visible "Agent" / "Customer" labels.

### Backlog (design parity)

- Reinstate field-level tooltips (SLA badge, template helper, escalation ladder) when tokenized overlays return.
- Set explicit initial focus to the modal heading before moving to the first interactive control.
- Add QA selectors: `data-testid="cx-approve"`, `cx-escalate`, `cx-resolve`, `cx-cancel`.

## Sales Pulse Modal

### Current React Router build

- **Entry focus**: Close button (`button[aria-label="Close sales pulse modal"]`).
- **Tab sequence**:
  1. Close button
  2. Action select (defaults to `Log follow-up`; secondary option `Escalate to ops`)
  3. Notes textarea (`placeholder="Add context for the decision log"`)
  4. Primary submit button (label mirrors current select value)
  5. Plain action `Cancel`
- **Copy alignment**: Inline helper text beneath revenue snapshot should note that variance escalations route through `customer.support@hotrodan.com` when deviation exceeds 15% (copy deck key `modal.sales.helper_support`).
- **ARIA hooks**: Heading `id="sales-pulse-modal-title"`; lists under "Top SKUs" and "Open fulfillment" rely on semantic `ul` with descriptive list items.

### Backlog (design parity)

- Reintroduce revenue delta tooltip and chart helper once the viz component ships.
- Add skip link to the fulfillment table to hit WCAG 2.2 focus order goals.
- Add QA selectors: `data-testid="sales-action"`, `sales-submit`, `sales-cancel`.

## Inventory Heatmap Modal

- **Entry focus**: Filter dropdown remains the first tabbable element.
- **Tab sequence**: Filter dropdown → heatmap grid (roving tabindex) → legend (`role="list"`) → export button → close button.
- **Backlog**: Tooltip copy for grid cells and export button remains pending chart library update; keep spec in `docs/design/assets/modal-inventory-heatmap-annotations.svg` for future alignment.

## Fulfillment Health Modal

- **Entry focus**: Insight card heading (focus moved programmatically).
- **Tab sequence**: Insight card → detailed table (sticky header) → mitigation checklist → footer actions.
- **Backlog**: Carrier delay badge tooltip still outstanding in React Router; leave note in engineering backlog.

## React Router handoff summary

| Modal          | Route target       | Search param           | Background source | Return focus target                                    |
| -------------- | ------------------ | ---------------------- | ----------------- | ------------------------------------------------------ |
| CX Escalations | `/app/escalations` | `modal=cx-escalations` | `/app` dashboard  | Tile CTA (`button[data-testid="cx-escalations-open"]`) |
| Sales Pulse    | `/app/sales-pulse` | `modal=sales-pulse`    | `/app` dashboard  | Tile CTA (`button[data-testid="sales-pulse-open"]`)    |

- CTA navigation: `navigate("?modal=<id>", { state: { background: location }, preventScrollReset: true })` keeps the dashboard rendered underneath for SSR + Playwright.
- Close behavior: `navigate(-1)` restores focus; if the route was loaded directly (no background), render the modal full-screen.
- QA guidance: Use `page.locator(':focus')` to confirm tab order; assert button text matches selected action and that support inbox copy renders.

## Evidence & downstream sync

- Static overlays (update post-token): `docs/design/assets/modal-cx-escalations-annotations.svg`, `modal-sales-pulse-annotations.svg`, `modal-inventory-heatmap-annotations.svg`
- Accessibility checklist: `docs/design/accessibility_criteria.md`
- Enablement/marketing alignment: `artifacts/enablement/cx-escalations-sales-pulse-visuals_2025-10-09.md`, `docs/marketing/launch_comms_packet.md`
- Admin overlay prep (pending embed token): `docs/design/shopify_admin_overlay_prep_2025-10-10.md`
- Offline fallback assets: `artifacts/design/offline-cx-sales-package-2025-10-11/`
