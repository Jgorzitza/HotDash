# Screenshots Plan — Dashboard Tiles

Status: Draft (2025-10-16)
Owner: Designer

---

## Naming Convention
- <tile>-<state>-<breakpoint>.png
- Tiles: revenue | aov | returns | stock-risk | seo | cx | approvals
- States: default | loading | error | empty
- Breakpoints: mobile (360) | tablet (768) | desktop (1024)

Examples:
- revenue-default-desktop.png
- approvals-loading-mobile.png

## Required Matrix (7 tiles × 4 states × 3 bps = 84 images)
- For each tile, capture default/loading/error/empty at 360, 768, 1024 widths

## Capture Guidance
- Disable animations (prefers-reduced-motion) to avoid blur
- Use consistent seed/data fixtures
- Ensure no scrollbars; capture card bounding box with 16px margin

## Storage Location
- Place PNGs under docs/specs/assets/dashboard-tiles/
- Add them to PR as binary assets

## Evidence in PR
- Link 1 representative image per tile in PR description
- Attach axe scan summary (no critical violations)

## Future
- Automate via Playwright screenshots when Storybook is available
- Keep baselines for visual diffs (per-tile per-state per-bp)

