# Analytics Direction

- **Owner:** Analytics Agent
- **Effective:** 2025-10-18
- **Version:** 2.1

## Objective

Current Issue: #79

Quantify CWV impact to dollars and verify dashboard tiles. Today: update `seo-telemetry` spec and outline validation steps; run parity check and attach evidence.

## Tasks

1. Follow docs/manager/EXECUTION_ROADMAP.md (Analytics — Roadmap). Autonomy Mode applies. Log evidence in `feedback/analytics/<YYYY-MM-DD>.md`.

## Autonomy Mode (Do Not Stop)

- If blocked > 15 minutes, post blocker and continue with fallback work. Do not idle.
- Keep changes to specs/scripts within Allowed paths; attach logs.

## Foreground Proof (Required)

- For any step expected to run >15s, run via `scripts/policy/with-heartbeat.sh analytics -- <command>`.
- Append ISO timestamps on each step to `artifacts/analytics/<YYYY-MM-DD>/logs/heartbeat.log`.
- Include this path under “Foreground Proof” in your PR body and commit the log. PRs without it fail CI.

## Fallback Work Queue (aligned to NORTH_STAR)

1. CWV→$$ mapping (issue #79) — docs/specs/hitl/seo-telemetry\*
2. Dashboard tiles verification and latency checks
3. Sampling guard proof runs — scripts/sampling-guard-proof.mjs
4. GA4/GSC adapter docs alignment (no MCP) — integrations/\*\*
5. Parity test harness improvements and artifacts bundling
6. Metric definitions catalog (rev, sessions, CR, AOV) with owners
7. ETL reliability plan (retries, idempotency, alerts) — docs
8. Backfill strategy notes for empty tables and deltas
9. Tile SLA checks and error banners spec (when to grey tiles)
10. Cost guardrails for BigQuery jobs; schedule windows
11. Sampling thresholds and clamps; anomaly thresholds doc
12. Evidence bundling for analytics PRs (queries, charts)

## Upcoming (broad lanes — break into molecules)

- GSC Bulk Export → BigQuery dataset; GA4 joins
  - Allowed paths: `docs/specs/hitl/seo-telemetry*`, `integrations/**`, `scripts/ops/**`, `feedback/analytics/**`, `artifacts/analytics/**`
  - Deliverables: dataset/tables spec, nightly job outline, join logic for rank 4–10 + impressions↑/CTR↓
- UTM join + brand/vendor filters
  - Allowed paths: `docs/specs/hitl/ads-analytics.config.json`, `docs/specs/hitl/brand-filters.json`, `scripts/ops/**`
  - Deliverables: mapping tables, proportional-by-clicks fallback, non-brand share calc
- Action Dock data feed (Top‑10 by expected revenue × confidence × ease)
  - Allowed paths: `docs/specs/hitl/main-dashboard.config.json`, `docs/specs/hitl/seo-telemetry*`
  - Deliverables: scoring function definition, output contract for dashboard

## Constraints

- **Allowed Tools:** `bash`, `npm`, `npx`, `node`, `rg`, `jq`, `codex exec`
- **Process:** Follow docs/OPERATING_MODEL.md (Signals→Learn pipeline). Shopify via MCP; GA4/GSC via internal adapters (no MCP). Log daily feedback per docs/RULES.md.
- **Touched Directories:** `app/lib/analytics/**`, `scripts/ops/**`, `artifacts/analytics/2025-10-18/**`, `feedback/analytics/2025-10-18.md`
- **Budget:** time ≤ 60 minutes, tokens ≤ 140k, files ≤ 50 per PR
- **Guardrails:** No live credential handling in repo; feature flag real data; tests must run green before merge.

## Definition of Done

- [ ] Shopify returns stubs + flags delivered with tests
- [ ] Supabase migrations applied/logged
- [ ] `npm run fmt` and `npm run lint`
- [ ] `npm run test:ci`
- [ ] `npm run scan`
- [ ] Docs/runbooks updated with rollout/rollback steps
- [ ] Feedback updated with evidence + commands
- [ ] Contract test passes
- [ ] Foreground Proof: committed `artifacts/analytics/<YYYY-MM-DD>/logs/heartbeat.log`

## Contract Test

- **Command:** `node scripts/sampling-guard-proof.mjs`
- **Expectations:** Sampling guard script completes successfully and emits proof output for nightly review.

## Risk & Rollback

- **Risk Level:** Medium — Bad metrics misguide leadership; mitigated with mocks + HITL.
- **Rollback Plan:** Disable analytics feature flags, revert migrations, restore dashboards to last known good snapshot.
- **Monitoring:** Dashboard latency, Supabase job metrics, sampling guard proof output.

## Links & References

- North Star: `docs/NORTH_STAR.md`
- Roadmap: `docs/roadmap.md`
- Feedback: `feedback/analytics/2025-10-18.md`
- Specs / Runbooks: `docs/specs/analytics_pipeline.md`

## Change Log

- 2025-10-18: Version 2.1 – Launch-day parity check focus
- 2025-10-17: Version 2.0 – Production alignment with stubs + rollout plan
- 2025-10-15: Version 1.0 – Initial direction awaiting integration foundation
