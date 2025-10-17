# Ads Direction

- **Owner:** Ads Agent
- **Effective:** 2025-10-17
- **Version:** 2.0

## Objective

Deliver production-ready Ads intelligence that keeps the dashboard tiles live, routes every campaign change through HITL approvals, and proves ROAS/CTR lift with automated tests and evidence.

## Tasks

1. Finalize Slice B + C of the ads metrics diff (≤50 files per PR) and ship ROAS/CPC/CPA helpers with Vitest coverage and fixtures.
2. Wire the Ads approvals drawer to the centralized approvals API, including evidence payloads, rollback plan, and alert hooks.
3. Partner with Analytics to stub Meta/Google data sources until credentials are approved; document follow-up in feedback.
4. Automate Publer campaign plan export (HITL only) and attach per-campaign impact metrics to Supabase.
5. Write feedback to `feedback/ads/2025-10-17.md` and clean up stray md files.

## Constraints

- **Allowed Tools:** `bash`, `npm`, `npx`, `node`, `rg`, `jq`
- **Process:** Follow docs/OPERATING_MODEL.md (Signals→Learn pipeline), use MCP servers for tool calls, and log daily feedback per docs/RULES.md.
- **Touched Directories:** `app/lib/ads/**`, `app/routes/api.ads.*`, `app/components/dashboard/**`, `tests/unit/ads/**`, `tests/e2e/**`, `docs/specs/ads_pipeline.md`, `feedback/ads/2025-10-17.md`
- **Budget:** time ≤ 60 minutes, tokens ≤ 140k, files ≤ 50 per PR
- **Guardrails:** Respect Allowed paths; HITL-only publishing via Publer; no secrets committed; ensure CI green before merge; work must tie to the current Issue and Allowed paths listed there.

## Definition of Done

- [ ] All ads metrics slices (A–C) merged with evidence and ≤50 files each
- [ ] `npm run fmt` and `npm run lint`
- [ ] `npm run test:ci` with ads tests and Playwright suite green
- [ ] `npm run scan` with clean report
- [ ] Dashboard tiles and approvals docs updated
- [ ] Feedback entry completed with test logs and follow-ups recorded
- [ ] Contract test passes

## Contract Test

- **Command:** `npx vitest run tests/unit/ads/tracking.spec.ts`
- **Expectations:** ROAS/CPC helpers return correct values and zero guards when spend/clicks are zero.

## Risk & Rollback

- **Risk Level:** Medium — Incorrect metrics mislead executives; mitigated by tests + HITL approvals.
- **Rollback Plan:** Feature-flag new metrics slices (`ADS_METRICS_SLICE_B/C`), revert module imports, redeploy.
- **Monitoring:** Supabase `ads_metrics_daily` table, dashboard tile latency, Publer queue health, approvals audit logs.

## Links & References

- North Star: `docs/NORTH_STAR.md`
- Roadmap: `docs/roadmap.md`
- Feedback: `feedback/ads/2025-10-17.md`
- Specs / Runbooks: `docs/specs/ads_pipeline.md`

## Change Log

- 2025-10-17: Version 2.0 – Production launch alignment with HITL workflow
- 2025-10-17: Version 1.3 – Template rewrite aligning ads strategy with Publer cadence and analytics tasks
- 2025-10-16: Version 1.2 – Ads intelligence launch plan (aggregates, approvals, anomalies)
- 2025-10-15: Version 1.1 – Ads performance tracking foundation
