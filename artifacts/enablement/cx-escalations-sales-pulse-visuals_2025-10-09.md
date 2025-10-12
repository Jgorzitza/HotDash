# CX Escalations & Sales Pulse Job Aid Visuals — 2025-10-09

## Overview
This package supports enablement training for the Operator Control Center. Assets align with Shopify Polaris visuals and include annotations for focus, tooltips, and screen reader descriptions.

## Asset checklist
| Asset | Path | Usage Notes |
| --- | --- | --- |
| CX Escalations modal overlay | `docs/design/assets/modal-cx-escalations-annotations.svg` | Highlight SLA badge tooltip, template selector helper, and escalation ladder reminder. Include callout numbers 1-3 in training slide. |
| Sales Pulse modal overlay | `docs/design/assets/modal-sales-pulse-annotations.svg` | Emphasize revenue delta tooltip, skip link location, and action footer sequencing. Use consistent color legend with Polaris indigo/teal accents; annotate new support inbox reminder on the chart helper text. |
| Inventory Heatmap overlay | `docs/design/assets/modal-inventory-heatmap-annotations.svg` | Optional appendix visual showing tooltip copy for heatmap cells and export button. |
| Status icon bundle | `artifacts/engineering/component-library-static-package-2025-10-09/status-icons/` | Provide icons for escalation severity legend within job aid. |
| Focus styles CSS | `artifacts/engineering/component-library-static-package-2025-10-09/focus-styles.css` | Reference for enablement to describe keyboard focus indicators during live demo. |
| React Router modal spec | `docs/design/tooltip_modal_annotations_2025-10-09.md` | Updated 2025-10-10 to reflect current build; use for narration and QA alignment. |
| Offline modal package | `artifacts/design/offline-cx-sales-package-2025-10-11/` | Drop-in PNG mocks, JSX snippets, and focus checklist while Shopify Admin embed token/Figma access is pending. |

## Accessibility guidance
- **Alt text**: Use "Screenshot of [modal name] highlighting [callout description]" for each image. Avoid referencing color alone; include tooltip copy verbatim.
- **Contrast**: When placing callout numbers, use Polaris text critical (#d82c0d) on white backgrounds with a 2px outline for legibility.
- **Focus demo**: During live training, tab through modals to show `.occ-focus-visible` outline. Mention skip links and Escape key closure explicitly.
- **Translations**: Keep copy English-only in visuals; provide localized captions via separate transcript if needed.
- **Support inbox**: Reinforce that escalations and variance alerts route through `customer.support@hotrodan.com`; trainers should call out the inbox in narration and demo the logging workflow.

## Delivery status
- Assets transferred to enablement shared drive (2025-10-09 15:30 ET).
- Pending feedback: confirm whether CX Escalations job aid requires an additional printable checklist. Will follow up by 2025-10-10.
- Shopify Admin overlays: Stand up annotated Admin app overlays once design token access lands; placeholders tracked in `docs/design/shopify_admin_overlay_prep_2025-10-10.md`. Offline mocks available for interim training via `offline-cx-sales-package-2025-10-11`.
