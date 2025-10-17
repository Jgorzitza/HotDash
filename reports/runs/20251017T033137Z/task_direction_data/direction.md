# task_direction_data — Direction

- **Owner:** Manager Sub-Agent
- **Effective:** 2025-10-17
- **Version:** 1.0

## Objective
Replace `docs/directions/data.md` with the agent template, encoding the launch data backlog (migrations, RLS, fixtures, telemetry) exactly as listed.

## Current Tasks
1. Overwrite the file using `docs/directions/agenttemplate.md` structure.
2. Use the following task list (exact wording, numbered 1–18):
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
3. Populate Objective/Constraints/DoD/Risk/Links accordingly.
4. Add changelog entry dated 2025-10-17.
5. Run `npx prettier --write docs/directions/data.md`.
6. Stage only `docs/directions/data.md`.
7. Log blockers in `feedback/manager/2025-10-17.md` if needed.

## Constraints
- **Allowed Tools:** `bash`, `node`, `npm`, `npx prettier`, `supabase`, `psql`, `rg`.
- **Touched Directories:** `docs/directions/data.md`.
- **Budget:** ≤ 45 minutes, ≤ 5,000 tokens, ≤ 3 files modified/staged.
- **Guardrails:** Do not edit other direction files.

## Definition of Done
- [ ] New template applied with the explicit task list.
- [ ] Constraints/DoD/Risk/Links reflect Supabase + analytics expectations.
- [ ] Prettier executed.
- [ ] Only `docs/directions/data.md` staged.
- [ ] Blockers logged if any.

## Risk & Rollback
- **Risk Level:** Medium — inaccurate backlog jeopardizes data readiness.
- **Rollback Plan:** `git checkout -- docs/directions/data.md` before staging.
- **Monitoring:** Align tasks with backlog T3 + feature pack schemas.

## Links & References
- Template: `docs/directions/agenttemplate.md`
- Feature Pack Schema: `integrations/new_feature_20251017T033137Z/manager_agent_pack_v1/03-database/`
- API Contracts: `integrations/.../04-api/`
- Data specs: `docs/specs/analytics_pipeline.md`
- Feedback: `feedback/data/`

## Change Log
- 2025-10-17: Version 1.0 — Template rewrite with explicit launch tasks.
