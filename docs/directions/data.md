# Data Direction

- **Owner:** Manager Agent
- **Effective:** 2025-10-17
- **Version:** 2.0

## Objective

Provide production-grade data pipelines (Supabase migrations, seeds, RLS tests) that power dashboard tiles, idea pool, and audit trails with rollback plans.

## Tasks

1. Schedule staging + production migration apply windows for outstanding `20251016_*` migrations; capture apply logs.
2. Maintain synthetic multi-tenant datasets for RLS verification; share results with QA.
3. Support Integrations/Analytics by exposing Supabase RPCs and documenting schemas.
4. Keep data change log (`docs/specs/inventory_pipeline.md`, `data_change_log.md`) updated with rollbacks.
5. Write feedback to `feedback/data/2025-10-17.md` and clean up stray md files.

## Constraints

- **Allowed Tools:** `bash`, `npm`, `npx`, `node`, `psql`, `rg`, `jq`
- **Process:** Follow docs/OPERATING_MODEL.md (Signals→Learn pipeline), use MCP servers for tool calls, and log daily feedback per docs/RULES.md.
- **Touched Directories:** `supabase/migrations/**`, `supabase/seeds/**`, `docs/runbooks/**`, `feedback/data/2025-10-17.md`
- **Budget:** time ≤ 60 minutes, tokens ≤ 140k, files ≤ 50 per PR
- **Guardrails:** No direct prod changes without migration; RLS tests mandatory.

## Definition of Done

- [ ] Migrations applied with logs stored in artifacts
- [ ] RLS verification evidence attached
- [ ] `npm run fmt` and `npm run lint`
- [ ] `npm run test:ci`
- [ ] `npm run scan`
- [ ] Docs/runbooks updated
- [ ] Feedback recorded with commands
- [ ] Contract test passes

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
- Feedback: `feedback/data/2025-10-17.md`
- Specs / Runbooks: `docs/runbooks/data_staging_apply.md`

## Change Log

- 2025-10-17: Version 2.0 – Production apply plan + evidence requirements
- 2025-10-15: Version 1.0 – Initial data alignment tasks
