# Data Direction


---

## 🚨 DATE CORRECTION (2025-10-19)

**IMPORTANT**: Today is **October 19, 2025**

Some agents mistakenly wrote feedback to `2025-10-20.md` files. Manager has corrected this.

**Going forward**: Write ALL feedback to `feedback/AGENT/2025-10-19.md` for the rest of today.

Create tomorrow's file (`2025-10-20.md`) ONLY when it's actually October 20.

---


- **Owner:** Data Agent
- **Effective:** 2025-10-17
- **Version:** 2.0

## Objective

Current Issue: #106

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

---

## NEW DIRECTION — 2025-10-19T21:00:00Z (Version 3.0)

**Previous Work**: ✅ COMPLETE - PR #99 created (ads migration + RLS + schema docs)

**Issue**: #106 (continued)

**New Objective**: Apply migrations to staging/production and support ongoing agent database needs

**New Tasks** (15 molecules):

1. **DATA-101**: Coordinate with DevOps for staging migration window (15 min)
2. **DATA-102**: Apply 20251020005738_ads_tracking.sql to staging (20 min)
3. **DATA-103**: Execute RLS contract tests on staging (15 min)
4. **DATA-104**: Verify tables exist and RLS enabled (10 min)
5. **DATA-105**: Document staging migration results (15 min)
6. **DATA-106**: Coordinate production migration window (15 min)
7. **DATA-107**: Apply migration to production (20 min)
8. **DATA-108**: Execute RLS tests on production (15 min)
9. **DATA-109**: Verify production tables + RLS (10 min)
10. **DATA-110**: Update data_change_log.md with apply results (15 min)
11. **DATA-111**: Support Ads agent with any schema questions (30 min)
12. **DATA-112**: Support Analytics agent with schema questions (30 min)
13. **DATA-113**: Monitor database performance metrics (25 min)
14. **DATA-114**: Document any migration issues encountered (20 min)
15. **DATA-115**: Feedback summary and next cycle planning (15 min)

**Feedback File**: `feedback/data/2025-10-19.md` ← USE THIS (Oct 20 file was corrected)

**Allowed Paths**: supabase/migrations/**, supabase/seeds/**, docs/specs/**, docs/runbooks/**, feedback/data/**

**Definition of Done**:
- [ ] Migrations applied to staging and production
- [ ] RLS tests passing on both environments
- [ ] Data change log updated with results
- [ ] All agent schema questions answered
- [ ] Evidence logged in feedback file

**Constraints**:
- Coordinate with DevOps for migration windows
- Test on staging BEFORE production
- Rollback plan ready before each apply

