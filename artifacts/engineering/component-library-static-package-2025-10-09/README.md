# Operator Control Center — Component Library Static Package (2025-10-09)

## Overview
This static handoff package mirrors the in-progress Figma component library so engineering can ship UI updates while tool access is restored. All assets follow the Shopify Polaris design system and the canonical direction in `docs/directions/designer.md`.

The package contains:
- Updated focus-visible styles aligned with Polaris tokens (`focus-styles.css`).
- Source of truth for tile components, including structure, states, and responsive guidance (`component-inventory.json`).
- Status icon SVG bundle matching the semantic status tokens (healthy, attention, critical, unconfigured).
- Export notes for engineering, QA, and enablement teams.

## File inventory
| Path | Description |
| --- | --- |
| `focus-styles.css` | Drop-in CSS for the shared `TileCard` + modal triggers. Provides high-contrast focus ring with 2px offset, meeting WCAG 2.2 AA focus visibility requirements. |
| `component-inventory.json` | Machine-readable map of each tile component, its Polaris foundations, and supported states. |
| `status-icons/*.svg` | Optimized 24px icons (stroke-based) for status messaging. Includes healthy, attention, critical, and unconfigured variants with accessible titles. |
| `README.md` | This implementation guide + acceptance criteria summary. |

## Implementation checklist
1. Import `focus-styles.css` into the OCC dashboard bundle (or convert to CSS modules). Apply `.occ-focus-visible` to any interactive component lacking native focus support.
2. Map tile components to inventory entries when wiring data, ensuring all documented states exist before QA sign-off.
3. Reference `status-icons/*.svg` for inline usage inside tiles and toast notifications.
4. Confirm the accessibility acceptance tests in `docs/design/accessibility_criteria.md` remain satisfied after integration.

## Polaris alignment notes
- Typography references `docs/design/tokens/design_tokens.md` font tokens (variants `font.size.base`, `font.weight.semibold`).
- Spacing and layout rely on Polaris space scale values (`space.4`, `space.5`, `space.6`).
- Focus rings leverage Polaris focus color token fallback (`--p-color-border-focus`).
- Icons are designed to align with Polaris icon stroke (1.5px) and corner rounding.

## Evidence links
- Accessibility: `docs/design/accessibility_criteria.md`
- Tooltip & modal flows: `docs/design/tooltip_modal_annotations_2025-10-09.md`
- Enablement job aids: `artifacts/enablement/cx-escalations-sales-pulse-visuals_2025-10-09.md`

## Change log
- 2025-10-09: Initial static package created while waiting on Figma workspace access.
