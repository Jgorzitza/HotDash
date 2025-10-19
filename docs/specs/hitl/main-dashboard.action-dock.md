# Main Dashboard — Action Dock (Spec)

Status: planning (no runtime changes)
Evidence: feedback/designer/2025-10-18.md#action-dock
Reviewer: product
Flag: feature.actionDock (remains OFF)

## Purpose

Surface the top 10 most impactful, ready-to-review actions for operators. Consolidates automated suggestions (AI/analytics) and operator-queued items into one prioritized list with quick approvals and rollbacks gated by HITL.

## Inputs

- Source config: docs/specs/hitl/main-dashboard.config.json → `tiles.actionDock`
- Prioritization: sort by `expected_revenue`, then `confidence`, then `ease`
- Fields: `title`, `diff`, `whyNow`, `evidence`
- Quick actions: `open`, `approve`, `rollback` (Apply disabled in dev)
- Learning strip: enabled (shows confidence/explainability hints)

## Component Structure

- Container: `ActionDock` tile with header, list, footer strip
- Header: Title + badge for counts; optional filters (All/P0)
- List item (row):
  - Primary: `title` (one line, truncation)
  - Meta: `whyNow` (short sentence), `diff` (chips: +/−, scope)
  - Evidence: link/icon opens right-panel drawer with context
  - Score bar: inline composite score (revenue × confidence × ease)
  - Quick actions: `Approve` (primary), `Rollback` (secondary), `Open` (link)
- Footer: Learning strip with short explanation and link to docs

## States

- Loading: 3–5 skeleton rows
- Empty: “No actions ready. Check back soon.” with link to `/actions`
- Error: Non-blocking banner with retry
- P0 Present: show badge in header; re-order to pin P0 to top

## Behavior

- Max items: 10 (configurable `topN`)
- Refresh: tile every 60s (per config). No auto-focus changes during refresh
- Approve/rollback: gated by HITL; disabled in dev/test; routes exist but require approval
- Evidence: opens drawer; preserves scroll and focus return

## Accessibility (a11y)

- Roles: `region` with `aria-labelledby` header ID
- Keyboard: Tab order → header filters → list rows → row quick actions → footer links
- List navigation: Up/Down arrow within list, Enter to activate primary action; Escape closes drawer
- Focus: Visible focus ring; programmatic focus returns to invoker after drawer close
- Labels: Buttons have aria-labels with action and title context (e.g., “Approve — Update Hero copy”)
- Contrast: All text/controls meet WCAG AA; chips 4.5:1 minimum
- Motion: No auto-scroll; live updates do not steal focus; use `aria-live="polite"` for count changes
- Icons: Provide `aria-hidden="true"` and visible text; avoid icon-only controls

## Visual Guidelines (Polaris)

- Spacing: 8/12/16 system; row vertical 12px; container 16–20px
- Typography: Title uses Polaris heading; body uses regular text size; chips small
- Density: Show 6–10 rows above the fold on desktop; collapse meta on tablet
- Chips: `diff` uses neutral + semantic accents (add/remove/size); never rely on color alone

## Responsive Specs

- Breakpoints: align with Polaris (e.g., xs < 480, sm 480–768, md 768–992, lg 992–1200, xl ≥ 1200)
- Desktop (lg/xl): show all columns (title, meta, score bar, quick actions)
- Tablet (md): truncate `whyNow`; hide score bar label text, keep visual bar; quick actions icon+text
- Small (sm): stack meta under title; show only primary action; evidence opens full-height drawer
- Extra small (xs): title one-line; meta collapsed behind a "Details" toggle; quick actions condensed
- Touch targets: min height 44px; spacing preserves 8px min between controls
- Drawer: 100% height on sm/xs; 60–75% width on md+; maintains return focus

## QA Visual Regression Checklist

- Tile renders 10 rows max with correct sort (revenue→confidence→ease)
- P0 badge shows when present; P0 rows pinned to top
- Skeletons appear in loading state; no content shift on refresh
- Truncation: title and meta truncate gracefully; no overlap or clipping
- Contrast: text and chips meet WCAG AA; verify dark text on light background
- Keyboard: Tab order matches spec; Enter activates primary action; Escape closes drawer
- Focus: Visible ring; returns to invoker after drawer close
- Responsive: Verify lg/xl, md, sm, xs behaviors above; action targets ≥44px
- Live updates: No focus steal on 60s refresh; counts update with aria-live polite

## Variants

- Filtered: All | P0 | Mine (future)
- Grouped: by feature flag or area (future)

## Analytics (non-PII)

- Tile impressions, row expand (evidence open), attempt approve/rollback (dev only)
- Respect provenance: `provenance.mode="dev:test"`, include `feedback_ref` when logging

## Error/Empty Handling

- Error banner with retry; log to `artifacts/seo/YYYY-MM-DD/telemetry-plan.log` if relevant
- Empty state with link to `/actions` and guidance

## Rollback

- Disable `feature.actionDock` flag and revert template binding if applied

## Open Questions

- Scoring normalization across different action types
- P0 pinning and SLA tie-ins
- Evidence schema consistency across sources

## Acceptance Criteria

- Renders spec in docs; no runtime changes
- a11y notes present (roles, keyboard, focus, contrast)
- Tied to config keys `tiles.actionDock.*`
- Safe in dev (Apply disabled); Autopublish OFF

## Preview & Harness (Dev)

- Preview mode: Render Action Dock in a dev route with mock data and `provenance.mode="dev:test"`; Approve/Rollback disabled.
- Evidence drawer: Use Polaris Modal/Sheet with `accessibilityLabel` and focus return; ensure `aria-labelledby` points to visible header.
- Mock payload schema: `{title, diff[], whyNow, evidenceUrl, scores:{expected_revenue, confidence, ease}, priority: 'P0'|'P1'}`
- Logging: non-PII UI events (tile impression, row expand) sent to a no-op adapter in dev; disabled by default.

## Contract Smoke Plan (Docs-only)

- Happy path: 10 rows render, correct sort, evidence opens/closes with focus return.
- Edge: P0 present → badge visible; skeletons during load; refresh without focus steal.
- Accessibility: Keyboard tab order and Enter/Escape actions; `aria-live` updates for counts.

## Sequence Mapping (Today)

The Action Dock aggregates actions across initiatives and surfaces them in a single prioritized list. This section clarifies row schemas and evidence expectations for each initiative so downstream teams can produce compatible action payloads.

### Programmatic SEO Factory

- Examples: "Publish 24 variant landers for Collection X", "Bind metaobject schema to template Y"
- Fields mapping:
  - `title`: concise action (e.g., "Publish 24 SEO landers for ‘Trail Shoes’")
  - `diff`: chips like `+24 pages`, `template bind`, `internal links`
  - `whyNow`: e.g., "Backlog cleared; seasonal spike next 14d"
  - `evidence`: link to preview diff (staging) and internal-link plan
- Score signals: expected_revenue (modeled), confidence (prior wins), ease (auto template)
- A11y note: Evidence opens drawer with keyboard focus return

### Guided Selling / Kit Composer

- Examples: "Enable 3-step kit flow on PDP", "Add bundle preset ‘Starter Trail’"
- Fields mapping:
  - `title`: "Enable Guided Selling on PDP (Men’s Trail)"
  - `diff`: `+flow`, `+bundle preset`, `no price change`
  - `whyNow`: "Improves add-to-cart on high-exit PDPs"
  - `evidence`: link to UX skeleton/prototype
- Score signals: expected_revenue (ATC uplift), confidence (AB history), ease (flagged component)
- Quick actions remain HITL; Apply disabled in dev

### CWV → Revenue (Media Pipeline)

- Examples: "Compress 40 hero images (webp)", "Defer non-critical JS on home"
- Fields mapping:
  - `title`: "Compress Tier‑0 homepage media"
  - `diff`: `-MB`, `webp`, `alt-text policy`
  - `whyNow`: "CWV p95 LCP above threshold; low content risk"
  - `evidence`: before/after Lighthouse snapshots
- Badges: show `ceoAlerts`/`businessHours` only if relevant (config-driven)
- Live updates: ensure no focus steal during metric refresh

### A/B Harness

- Examples: "Variant B: shorter hero copy", "Layout C: move trust badges above fold"
- Fields mapping:
  - `title`: "Experiment: Hero copy (B) — shorter CTA"
  - `diff`: `copy`, `layout`, `cookie ab_variant`
  - `whyNow`: "Validate copy/layout safely; low dev effort"
  - `evidence`: GA4 custom dimension mapping doc, preview links
- a11y: experiment indicators must not rely on color alone; provide labels

General Notes

- All actions respect HITL approvals; Approve/Rollback buttons are disabled in dev environments.
- Autopublish remains OFF; provenance on any mock events set to `provenance.mode="dev:test"` with `feedback_ref`.
