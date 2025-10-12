# Modal React Router Handoff — CX Escalations & Sales Pulse (2025-10-10)

## Purpose
Consolidates routing, focus, and tooltip specifications so engineering can wire the CX Escalations and Sales Pulse modals using React Router 7 background routes while QA finalizes Playwright coverage.

## Routes
| Modal | Route file (proposed) | URL pattern | Search param | Background source |
| --- | --- | --- | --- | --- |
| CX Escalations | `app/routes/app.escalations.tsx` | `/app/escalations` | `modal=cx-escalations` | `/app` dashboard loader |
| Sales Pulse | `app/routes/app.sales-pulse.tsx` | `/app/sales-pulse` | `modal=sales-pulse` | `/app` dashboard loader |

- CTAs call `navigate("?modal=<id>", { state: { background: location }, preventScrollReset: true })`.
- Modal routes render inline when `location.state?.background` exists; otherwise they fall back to full-page layout for deep links.
- Closing the modal triggers `navigate(-1)` which brings users back to the background route and restores focus to CTA.

## Focus order checkpoints
| Modal | Focus sequence | Playwright assertion hints |
| --- | --- | --- |
| CX Escalations | 1) `#cx-escalations-customer-name` → 2) `.occ-sla-pill` → 3) `select[name="template"]` → 4) `button[data-testid="cx-approve"]` → 5) `button[data-testid="cx-follow-up"]` → 6) `button[data-testid="cx-escalations-close"]` | `page.keyboard.press("Tab")` + expect `page.locator(':focus').getAttribute('data-testid')` to match sequence |
| Sales Pulse | 1) `a.occ-skip-link` → 2) `button[data-testid="sales-delta-chip"]` → 3) `div[data-testid="sales-chart"]` → 4) `div[role="tablist"]` (optional) → 5) `button[data-testid="sales-plan"]` → 6) `button[data-testid="sales-log"]` → 7) `button[data-testid="sales-close"]` | same approach |

## Tooltip inventory
- SLA badge (`data-testid="cx-sla-tooltip"`) — placement `top-start`, copy: "SLA clock stops when the approval response is sent." Triggered on focus/hover.
- Template helper (`data-testid="cx-template-tooltip"`) — placement `right`, copy: "Templates include legal-approved messaging for tier escalation."
- Escalation ladder reminder (`data-testid="cx-ladder-tooltip"`) — placement `bottom`, copy: "Open the CX Escalations job aid for step-by-step handoff."
- Revenue delta chip (`data-testid="sales-delta-tooltip"`) — placement `top-end`, copy: "Compared to the same time yesterday."
- Plan Campaign CTA (`data-testid="sales-plan-tooltip"`) — placement `bottom`, copy: "Opens Campaign Planner in a new tab."

Attach these IDs to tooltips so QA can target them and confirm `aria-describedby` wiring.

## Assets
- Annotated overlays: `docs/design/assets/modal-cx-escalations-annotations.svg`, `docs/design/assets/modal-sales-pulse-annotations.svg` (updated callout labels 1-6).
- Written spec: `docs/design/tooltip_modal_annotations_2025-10-09.md` (React Router handoff section).
- Focus-visible styles: `artifacts/engineering/component-library-static-package-2025-10-09/focus-styles.css`.

## Next steps
1. Engineering wires routes + tooltips, updates tests to respect modal search params.
2. QA executes Playwright regression focusing on tab order + tooltip visibility.
3. Designer to convert spec into Figma library components once workspace access restored (blocker tracked in `feedback/designer.md`).
