# Stakeholder Comms — Daily Brief and Risk Summary (Product)

- Owner: Product Agent
- Effective: 2025-10-18
- Autopublish: OFF (feature toggles remain disabled)

## Purpose

Provide a concise, evidence‑linked briefing for stakeholders covering launch readiness, key metrics, blockers, risks, and explicit rollback notes. This packet references validated dashboard tiles and attached artifacts.

## Daily Brief (Template)

- Launch Readiness: <Green/Yellow/Red> — based on CI gates and HITL status
- CI Gates: fmt | lint | unit | e2e | a11y | lighthouse | scan → <pass/fail> with links
- Analytics Snapshot (GA4 via adapters): sessions, conv rate, revenue — artifact: `artifacts/analytics/YYYY-MM-DD/ga4-live-metrics.json`
- CX Health (Chatwoot): `/rails/health` + auth probe → <ok/warn>
- Approvals Backlog: pending count, oldest age; evidence in dashboard tile
- Inventory Risk: OOS + urgent SKUs (tile: Stock Risk)
- Notable Changes: top 1–3 changes since last report

## Blockers

- List each blocker with owner and ETA; ensure wording matches `docs/specs/dashboard_launch_checklist.md`.
- Contract Test reference: `rg 'Blocker' docs/specs/dashboard_launch_checklist.md` must find current items.

## Risks and Rollback

- Risk Level: <Low/Medium/High> — support with tile metrics and test status
- Rollback Plan: summarize immediate steps (disable feature flags, revert targeted PRs, restore fixtures)
- Monitoring: list dashboards and scripts (Chatwoot health, approvals SLA, GA sampling guard)

## Evidence Links

- Launch Checklist: `docs/specs/dashboard_launch_checklist.md`
- HITL Checklist: `docs/runbooks/ai_agent_review_checklist.md`
- GA4 Artifacts (adapters): `artifacts/analytics/YYYY-MM-DD/ga4-live-metrics.json`
- CX Health Logs: `artifacts/support/YYYY-MM-DD/chatwoot-health.log`
- CI Logs: attach summaries from `npm run fmt`, `npm run lint`, `npm run test:ci`, `npm run scan`

## Notes

- Shopify operations via MCP only; do not use direct HTTP.
- GA4 and GSC via internal adapters; do not route through MCP.
- Keep Autopublish OFF; schedule communications but require human approval per HITL.

## Release Sequencing

- Content: per `docs/specs/content_pipeline.md` — publish plan gated by analytics evidence; rollback via fixture reversion and flag disablement.
- Ads: per `docs/specs/hitl/ads-analytics.config.json` — UTM mapping and brand-share checks; rollback by pausing impacted campaigns and reverting mapping tables.
- Inventory: per `docs/specs/hitl/inventory-updates.md` — changes flow through approvals; rollback by reverting proposals and restoring prior stock levels in staging first.
