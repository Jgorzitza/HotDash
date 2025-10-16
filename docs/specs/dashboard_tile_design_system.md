# Dashboard Tile Design System

Status: Draft (2025-10-16)
Owner: Designer
Related: docs/specs/dashboard-tiles-spec.md, docs/specs/dashboard_tiles_contracts.md

---

## Purpose
Visual + interaction system for all dashboard tiles to ensure consistency, Polaris alignment, and WCAG 2.1 AA compliance.

## Tile Anatomy
- Container: Card with padding 24px, radius 8px, shadow sm
- Title: Label/heading style
- Value: Prominent metric (numeric/currency/percent)
- Trend: Direction (up/down/neutral) + label (e.g., vs previous)
- Meta: Optional secondary info (AOV, transactions)
- Actions: Optional click/drill-down

## Supported Tiles (7)
- Revenue, AOV, Returns, Stock Risk, SEO, CX, Approvals
- Source of truth for data contracts: docs/specs/dashboard_tiles_contracts.md
- Compact props and examples: docs/specs/dashboard_tiles_compact_props.md



## Layout & Spacing
- Grid: 12-col desktop, 8-col tablet, 4-col mobile (see responsive-breakpoints)
- Gutter: 16px mobile, 20px tablet, 24px desktop
- Padding: 16/20/24 (mobile/tablet/desktop)
- Min height: 120px (compact), 160px (standard)

## Typography
- Title: 14px, 500, text-subdued
- Value: 28–32px, 700, text-strong; currency/percent formats
- Trend: 14px, 500; color-coded per direction

## Color & States
- Background: White (or surface)
- Border: 1px subtle on light backgrounds
- Trend Up: Green-600; Down: Red-600; Neutral: Gray-500
- Interactive: hover, focus-visible ring, active press
- Loading: Skeleton elements per loading-states spec
- Error/Empty: See error-states spec

## Interaction
- Clickable area: Whole card unless disabled
- Focus order: Title → Value → Actions
- Keyboard: Enter/Space activate; escape has no effect on tile
- Hit area: ≥ 44px for interactive affordances

## Polaris Mapping (reference)
- Container: Card / Box + Shadow tokens
- Stacks/Layout: Grid/Columns, InlineStack/BlockStack
- Icons/Indicators: Badge, Icon where applicable
- Skeletons: SkeletonDisplayText, SkeletonBodyText
- Feedback: Banner for errors, EmptyState for empty

## Accessibility
- Role/Name: aria-label on clickable tiles; concise
- Trend semantics: include direction text (not color alone)
- Contrast: ≥ 4.5:1 text, ≥ 3:1 large text/icons
- Motion: avoid flashing; respect prefers-reduced-motion

## Visual Examples (described)
- Revenue (Up): bold value, green up arrow, label “vs previous period”
- Conversion (Down): value in percent, red down arrow, contextual help

## Acceptance (Designer → Engineer)
- Consistent spacing and typography across 7 tiles
- States covered: default, hover/focus/active, loading, error, empty
- Contract matches dashboard-tiles-spec props

- Polaris mappings per tile: docs/specs/polaris-mapping-dashboard-tiles.md
- Screenshots plan: docs/specs/screenshots_plan_dashboard_tiles.md

## Links
- Responsive: docs/specs/responsive-breakpoints.md
- Loading: docs/specs/loading-states.md
- Errors/Empty: docs/specs/error-states.md
- Accessibility: docs/specs/accessibility.md
- Polaris: docs/specs/polaris-guide.md
- Tokens: docs/specs/design-tokens.md

