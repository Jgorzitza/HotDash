# Data Agent Direction

- **Owner:** Manager Sub-Agent
- **Effective:** 2025-10-17
- **Version:** 1.0

## Objective

Deliver the Supabase feature pack launch backlog by authoring migrations, RLS, fixtures, telemetry, and documentation so staging and analytics consumers are production-ready for the idea pool release.

## Current Tasks

1. Diff the feature pack Supabase schema against `supabase/migrations/**` and produce a migration plan in feedback.
2. Author combined migration for idea pool tables/views (`supabase/migrations/20251017_idea_pool_bundle.sql`) with rollback script.
3. Update analytics aggregates/views to include idea KPIs and CX metrics; attach SQL diff.
4. Extend inventory + CX RLS policies to cover new idea pool tables; document rationale.
5. Implement RLS tests in `supabase/rls_tests.sql` covering idea, analytics, approvals tables.
6. Wire `scripts/data/apply-migrations.mjs` to run new bundle on staging; capture CLI output.
7. Refresh Supabase seeds (`supabase/seeds/`) with idea pool + analytics fixtures.
8. Generate SQL fixtures powering dashboard tiles (revenue, AOV, returns, approvals, idea pool); store in `tests/fixtures/`.
9. Build Supabase RPC/edge functions from feature pack list and confirm contract with integrations.
10. Coordinate with Integrations to publish API schema JSON for analytics + idea endpoints; attach API contract diff.
11. Produce data lineage doc in `docs/specs/analytics_pipeline.md` reflecting new jobs.
12. Install nightly data quality job verifying Supabase metrics vs GA4/Publer (script stub + schedule).
13. Add Supabase metrics instrumentation (Prometheus) for ingestion success/failure; document thresholds.
14. Validate `npm run test:ci -- --runInBand` after migrations applied; attach logs.
15. Run `scripts/data/backfill-analytics.mjs` for historical data through May 1; share summary.
16. Deliver rollback playbook for idea pool schema in `docs/runbooks/migration_rollback.md`.
17. Partner with Analytics on sampling guard inputs and publish dataset dictionary in `docs/specs/metrics_snapshots_qa_ceo.md`.
18. Write feedback to `feedback/data/2025-10-17.md` and clean stray md files.

## Constraints

- **Allowed Tools:** `bash`, `node`, `npm`, `npx prettier`, `supabase`, `psql`, `rg`
- **Touched Directories:** `docs/directions/data.md`
- **Budget:** ≤ 45 minutes, ≤ 5,000 tokens, ≤ 3 files modified/staged
- **Guardrails:** Do not edit other direction files; uphold Supabase security and analytics compliance guardrails.

## Definition of Done

- [ ] Objective satisfied with Supabase launch backlog scoped to feature pack deliverables.
- [ ] `npm run fmt`, `npm run lint`, `npm run test:ci`, and `npm run scan` executed with proofs attached to feedback or PR.
- [ ] Migrations, RLS policies, seeds, fixtures, and rollback scripts produced with CLI evidence captured.
- [ ] API contracts, specs, and runbooks updated to reflect analytics and idea pool changes.
- [ ] Feedback entry committed to `feedback/data/2025-10-17.md` with outputs and stray markdown cleanup recorded.

## Risk & Rollback

- **Risk Level:** Medium — inaccurate backlog jeopardizes data readiness.
- **Rollback Plan:** `git checkout -- docs/directions/data.md` before staging.
- **Monitoring:** Align tasks with backlog T3 + feature pack schemas.

## Links & References

- North Star: `docs/NORTH_STAR.md`
- Feature Pack Schema: `integrations/new_feature_20251017T033137Z/manager_agent_pack_v1/03-database/`
- API Contracts: `integrations/new_feature_20251017T033137Z/manager_agent_pack_v1/04-api/`
- Data Specs: `docs/specs/analytics_pipeline.md`
- Feedback: `feedback/data/`

## Change Log

- 2025-10-17: Version 1.0 – Template rewrite with explicit launch tasks.
