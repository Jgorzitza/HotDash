# Data Direction

- **Owner:** Data Agent
- **Effective:** 2025-10-18
- **Version:** 2.1

## Objective

Current Issue: #106

Provide production-grade data pipelines (Supabase migrations, seeds, RLS tests) that power dashboard tiles, idea pool, and audit trails with rollback plans. Today: confirm IPv4 pooler connection and non-destructive staging apply.

## Tasks

1. Source IPv4 pooler from vault (`vault/occ/supabase/database_url_staging.env`) and verify connectivity; attach proof.
2. Run non-destructive apply rehearsal per `docs/runbooks/data_staging_apply.md` and capture logs.
3. Maintain synthetic multi-tenant datasets for RLS verification; share results with QA.
4. Keep data change log (`docs/specs/inventory_pipeline.md`, `data_change_log.md`) updated with rollbacks.
5. Write feedback to `feedback/data/2025-10-18.md` and clean up stray md files.

## Constraints

- **Allowed Tools:** `bash`, `npm`, `npx`, `node`, `psql`, `rg`, `jq`
- **Process:** Follow docs/OPERATING_MODEL.md (Signals→Learn pipeline), use MCP servers for tool calls, and log daily feedback per docs/RULES.md.
- **Touched Directories:** `supabase/migrations/**`, `supabase/seeds/**`, `docs/runbooks/**`, `feedback/data/2025-10-18.md`
- **Budget:** time ≤ 60 minutes, tokens ≤ 140k, files ≤ 50 per PR
- **Guardrails:** No direct prod changes without migration; RLS tests mandatory.

## Tasks

1. Follow docs/manager/EXECUTION_ROADMAP.md (Data — Roadmap). Autonomy Mode applies. Log evidence in `feedback/data/<YYYY-MM-DD>.md`.

## Definition of Done

- [ ] Migrations applied with logs stored in artifacts
- [ ] RLS verification evidence attached
- [ ] `npm run fmt` and `npm run lint`
- [ ] `npm run test:ci`
- [ ] `npm run scan`
- [ ] Docs/runbooks updated
- [ ] Feedback recorded with commands
- [ ] Contract test passes
- [ ] Foreground Proof: committed `artifacts/data/<YYYY-MM-DD>/logs/heartbeat.log`

## Autonomy Mode (Do Not Stop)

- If blocked > 15 minutes (access, CI, staging locks), record a blocker note on the Issue and proceed to the next item in the fallback queue. Do not idle.
- Keep all work in allowed data paths; attach commands, logs, and SQL diffs.

## Foreground Proof (Required)

- For any step expected to run >15s, run via `scripts/policy/with-heartbeat.sh data -- <command>`.
- Append ISO timestamps on each step to `artifacts/data/<YYYY-MM-DD>/logs/heartbeat.log`.
- Include this path under “Foreground Proof” in your PR body and commit the log. PRs without it fail CI.

## Fallback Work Queue (aligned to NORTH_STAR)

1. Apply/rehearse migrations in staging for: approvals, idea pool, growth analytics, CX metrics, dashboard views (supabase/migrations/\*)
2. Author rollback scripts for each new migration; verify in staging (no data loss)
3. Expand RLS tests in `supabase/rls_tests.sql` to cover new tables and views; attach results
4. Seeds: create/update synthetic datasets for multi-tenant scenarios (supabase/seeds/\*)
5. Indexing plan: add indexes for common filters/joins used by tiles; document rationale
6. Materialized views or cached rollups plan for nightly jobs; retention policy
7. Migration idempotency and retry notes; apply logs bundling and hashing
8. Performance profiling of dashboard queries; add hints or indexes as needed
9. Data quality checks: NOT NULL/defaults/constraints audit; add migrations where safe
10. Evidence bundling: artifacts for apply/rollback/rls tests with timestamps and SHA manifests

## Contract Test

- **Command:** `psql $SUPABASE_URL -f supabase/rls_tests.sql`
- **Expectations:** RLS tests pass for knowledge, inventory, analytics tables.

## Risk & Rollback

- **Risk Level:** Medium — Bad migrations break tiles; mitigated via staging rehearsals.
- **Rollback Plan:** Use Supabase migration rollback scripts and restore backups.
- **Monitoring:** Supabase metrics dashboard, migration apply logs, dashboard query alerts.

## Links & References

- North Star: `docs/NORTH_STAR.md`
- Roadmap: `docs/roadmap.md`
- Feedback: `feedback/data/2025-10-18.md`
- Specs / Runbooks: `docs/runbooks/data_staging_apply.md`

## Change Log

- 2025-10-18: Version 2.1 – IPv4 pooler verification and non-destructive apply
- 2025-10-17: Version 2.0 – Production apply plan + evidence requirements
- 2025-10-15: Version 1.0 – Initial data alignment tasks
