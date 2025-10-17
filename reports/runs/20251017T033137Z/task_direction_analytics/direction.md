# task_direction_analytics — Direction

- **Owner:** Manager Sub-Agent
- **Effective:** 2025-10-17
- **Version:** 1.0

## Objective
Rewrite `docs/directions/analytics.md` with the template so Analytics delivers KPI instrumentation, sampling guard proof, tile validation, and feedback hygiene required for launch.

## Current Tasks
1. Overwrite the file with `docs/directions/agenttemplate.md` structure.
2. Use the exact task list below (numbered 1–18):
   1. Validate Supabase metrics vs GA4 (`scripts/ops/check-analytics-parity`) and attach comparison log.
   2. Instrument idea pool KPIs (adoption, win rate, time-to-publish) within Supabase views and analytics pipeline; link SQL diff.
   3. Build sampling guard proof harness (`scripts/sampling-guard-proof.mjs`) and capture results.
   4. Implement dashboard tile telemetry (revenue, AOV, returns, approvals, ideas) using Prometheus metrics; attach output.
   5. Generate analytics fixtures for unit tests (`app/lib/analytics/fixtures.ts`) covering new KPIs; document usage.
   6. Coordinate with Engineer to expose instrumentation hooks in dashboard tiles; confirm via test logs.
   7. Backfill analytics aggregates to May 1 using `scripts/backfill-analytics.mjs`; share summary.
   8. Publish idea KPI API endpoint contract (`app/routes/api.analytics.idea-pool.ts`) alignment notes; attach diff reference.
   9. Extend GA4 anomaly alerts to include idea pool and Publer metrics; document thresholds.
   10. Provide weekly analytics digest template in `docs/specs/analytics_pipeline.md` with KPI targets.
   11. Deliver time-to-approve vs time-to-publish metric correlation report and store under `docs/specs/metrics_snapshots_qa_ceo.md`.
   12. Add analytics smoke test command to CI (`.github/workflows/test-metrics.yml`); link run output.
   13. Build analytics mocking utilities for Vitest (`tests/unit/routes/analytics.*`); include usage notes.
   14. Validate Publer webhook ingestion metrics and produce printout for DevOps.
   15. Document KPI definitions + formulas in `docs/specs/success_metrics.md` referencing feature pack schema.
   16. Pair with Product to ensure analytics tile success metrics match launch checklist; record meeting notes in feedback.
   17. Produce regression report on sampling guard runs (pass/fail history) and attach to feedback.
   18. Write feedback to `feedback/analytics/2025-10-17.md` and clean stray md files.
3. Populate Objective/Constraints/DoD/Risk/Links referencing GA4, Supabase, Publer requirements.
4. Add changelog entry for 2025-10-17.
5. Run `npx prettier --write docs/directions/analytics.md`.
6. Stage only `docs/directions/analytics.md`.
7. Log blockers in `feedback/manager/2025-10-17.md` if necessary.

## Constraints
- **Allowed Tools:** `bash`, `node`, `npm`, `npx prettier`, GA4 CLI/SDK, Supabase CLI, `rg`.
- **Touched Directories:** `docs/directions/analytics.md`.
- **Budget:** ≤ 45 minutes, ≤ 5,000 tokens, ≤ 3 files modified/staged.
- **Guardrails:** Restrict edits to analytics direction file.

## Definition of Done
- [ ] Template applied with provided tasks and sections.
- [ ] Constraints/DoD/Risk/Links align with analytics instrumentation requirements.
- [ ] Prettier executed.
- [ ] Only `docs/directions/analytics.md` staged.
- [ ] Blockers logged if any.

## Risk & Rollback
- **Risk Level:** Medium — analytics misalignment obscures KPI reporting.
- **Rollback Plan:** `git checkout -- docs/directions/analytics.md` before staging.
- **Monitoring:** Ensure tasks map to backlog items and feature pack analytics directives.

## Links & References
- Template: `docs/directions/agenttemplate.md`
- Feature Pack Analytics: `integrations/new_feature_20251017T033137Z/manager_agent_pack_v1/04-api/`
- Sampling Guard Script: `scripts/sampling-guard-proof.mjs`
- Analytics Specs: `docs/specs/analytics_pipeline.md`
- Feedback: `feedback/analytics/`

## Change Log
- 2025-10-17: Version 1.0 — Template rewrite with explicit analytics launch tasks.
