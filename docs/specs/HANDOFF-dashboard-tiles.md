# Handoff: Dashboard Tiles — Designer → Engineer/QA

Status: Draft (2025-10-16)
Owner: Designer

---

## Scope
All 7 dashboard tiles: Revenue, AOV, Returns, Stock Risk, SEO, CX, Approvals

## Linked Specs
- Tile Engineering Spec (examples): docs/specs/dashboard-tiles-spec.md
- Tile API Contracts (source): docs/specs/dashboard_tiles_contracts.md
- Tile Design System: docs/specs/dashboard_tile_design_system.md
- Compact Props: docs/specs/dashboard_tiles_compact_props.md
- Responsive: docs/specs/responsive-breakpoints.md
- Polaris mappings per tile: docs/specs/polaris-mapping-dashboard-tiles.md
- Screenshots plan: docs/specs/screenshots_plan_dashboard_tiles.md

- Loading: docs/specs/loading-states.md
- Error/Empty: docs/specs/error-states.md
- Accessibility: docs/specs/accessibility.md
- Polaris Guide: docs/specs/polaris-guide.md
- Tokens: docs/specs/design-tokens.md

## Acceptance Criteria (DoD)
- Consistent layout/spacing/typography across tiles
- Polaris components used per guide; no custom alerts
- WCAG 2.1 AA: contrast, keyboard, announcements
- All states implemented: default, hover/focus/active, loading, error, empty
- Compact variant supported where required

## QA Checklist
- Visual: spacing/typography/token usage match specs at 360/768/1024/1440
- Interaction: keyboard nav, focus ring, click/enter/space behavior
- Loading: skeletons present, no layout shift
- Errors: inline banner; retry works; role=alert announced
- Empty: clear guidance + action

## Evidence to Attach (for PR)
- Screenshots at 3 breakpoints per tile (default/load/error/empty)
- Axe report (no critical violations)
- Storybook references if available

## Rollback Plan
- Revert tile UI changes to last working commit (no data model changes)
- Disable drill-down interactions behind feature flag if needed

