# Ads Direction

- **Owner:** Ads Agent
- **Effective:** 2025-10-18
- **Version:** 2.1

## Objective

Current Issue: #101

Deliver production-ready Ads intelligence. Today: run ads aggregation/backfill script, verify tile calculations match helpers, and attach logs.

## Tasks

1. Execute `npm run ops:ads-backfill` and save logs to `artifacts/ads/2025-10-18/backfill.log`.
2. Run unit tests for ROAS/CPC helpers and attach results.
3. Cross-check dashboard tile values against helper outputs; note discrepancies with owner/ETA.
4. Write feedback to `feedback/ads/2025-10-18.md` and clean up stray md files.

## Constraints

- **Allowed Tools:** `bash`, `npm`, `npx`, `node`, `rg`, `jq`
- **Process:** Follow docs/OPERATING_MODEL.md (Signals→Learn pipeline), use MCP servers for tool calls, and log daily feedback per docs/RULES.md.
- **Touched Directories:** `app/lib/ads/**`, `app/components/dashboard/**`, `tests/unit/ads/**`, `artifacts/ads/2025-10-18/**`, `feedback/ads/2025-10-18.md`
- **Budget:** time ≤ 60 minutes, tokens ≤ 140k, files ≤ 50 per PR
- **Guardrails:** Respect Allowed paths; HITL-only publishing via Publer; no secrets committed; ensure CI green before merge; work must tie to the current Issue and Allowed paths listed there.

## Tasks

1. Follow docs/manager/EXECUTION_ROADMAP.md (Ads — Roadmap). Autonomy Mode applies. Log evidence in `feedback/ads/<YYYY-MM-DD>.md`.

## Definition of Done

- [ ] All ads metrics slices (A–C) merged with evidence and ≤50 files each
- [ ] `npm run fmt` and `npm run lint`
- [ ] `npm run test:ci` with ads tests and Playwright suite green
- [ ] `npm run scan` with clean report
- [ ] Dashboard tiles and approvals docs updated
- [ ] Feedback entry completed with test logs and follow-ups recorded
- [ ] Contract test passes

## Autonomy Mode (Do Not Stop)

- If blocked > 15 minutes, log blocker and pick the next task below. Do not idle.
- Keep diffs in Allowed paths; attach evidence.

## Fallback Work Queue (aligned to NORTH_STAR)

1. Slice‑B foundations — scripts/ops/backfill-ads-aggregations.ts
2. Slice‑C scaffolding — tests/integration/api.ads.slice-c.spec.ts
3. Approvals payload shaping — app/routes/api.ads.slice-\*.ts
4. Action Dock drilldowns (docs only)
5. Parity checks vs dashboards
6. Outlier detection thresholds and alerts (docs)
7. Metrics aggregator guardrails (divide‑by‑zero, nulls)
8. Connector stubs for additional ad platforms (docs only)
9. Test data fixtures for regression stability
10. Evidence bundling for ads PRs (queries, charts)

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
- Feedback: `feedback/ads/2025-10-18.md`
- Specs / Runbooks: `docs/specs/ads_pipeline.md`

## Change Log

- 2025-10-18: Version 2.1 – Launch-day: backfill + helper parity
- 2025-10-17: Version 2.0 – Production launch alignment with HITL workflow
- 2025-10-17: Version 1.3 – Template rewrite aligning ads strategy with Publer cadence and analytics tasks
- 2025-10-16: Version 1.2 – Ads intelligence launch plan (aggregates, approvals, anomalies)
- 2025-10-15: Version 1.1 – Ads performance tracking foundation
