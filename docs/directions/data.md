# Data - RLS FIX FIRST + Database Schema

> P0: Enable RLS on 4 tables. Then document schema. Production database ready.

**Issue**: #106 | **Repository**: Jgorzitza/HotDash | **Allowed Paths**: supabase/**, docs/specs/database\_**

## Constraints

- **SECURITY**: P0 - 4 tables missing RLS (BLOCKS PRODUCTION)
- CLI Tools: `psql` with $DATABASE_URL (vault credentials in .env.local)
- Connection: Session pooler (IPv4 requirement)
- MCP: `mcp_context7_get-library-docs` for React Router 7 patterns (library: `/remix-run/react-router`)
- Framework: React Router 7 (NOT Remix)
- All migrations reversible, RLS mandatory

## Definition of Done

- [ ] RLS enabled on 4 critical tables (P0)
- [ ] All 18 local migrations documented
- [ ] Remote migration status verified (56 migrations)
- [ ] Schema documentation complete
- [ ] Production migration plan ready
- [ ] Evidence: RLS verified, schema documented

---

## Production Molecules

### DATA-001-P0: Enable RLS on 4 Critical Tables (60 min) - **DO FIRST**

**Priority**: P0 - BLOCKS PRODUCTION
**Source**: Supabase Linter (reports/manager/SUPABASE_REMEDIATION_PLAN.md)
**Tables**: ads_metrics_daily, agent_run, agent_qc, creds_meta

**Commands**:

```bash
source .env.local

# Table 1: ads_metrics_daily
psql $DATABASE_URL -c "ALTER TABLE public.ads_metrics_daily ENABLE ROW LEVEL SECURITY;"
psql $DATABASE_URL -c "CREATE POLICY authenticated_read_ads_metrics ON public.ads_metrics_daily FOR SELECT TO authenticated USING (true);"
psql $DATABASE_URL -c "CREATE POLICY service_write_ads_metrics ON public.ads_metrics_daily FOR ALL TO service_role USING (true);"

# Table 2: agent_run
psql $DATABASE_URL -c "ALTER TABLE public.agent_run ENABLE ROW LEVEL SECURITY;"
psql $DATABASE_URL -c "CREATE POLICY service_role_full_access_agent_run ON public.agent_run FOR ALL TO service_role USING (true);"

# Table 3: agent_qc
psql $DATABASE_URL -c "ALTER TABLE public.agent_qc ENABLE ROW LEVEL SECURITY;"
psql $DATABASE_URL -c "CREATE POLICY service_role_full_access_agent_qc ON public.agent_qc FOR ALL TO service_role USING (true);"

# Table 4: creds_meta (CRITICAL)
psql $DATABASE_URL -c "ALTER TABLE public.creds_meta ENABLE ROW LEVEL SECURITY;"
psql $DATABASE_URL -c "CREATE POLICY service_role_only_creds_meta ON public.creds_meta FOR ALL TO service_role USING (true);"

# Verify ALL enabled
psql $DATABASE_URL -c "SELECT tablename, rowsecurity FROM pg_tables WHERE tablename IN ('ads_metrics_daily', 'agent_run', 'agent_qc', 'creds_meta');"
```

**Expected**: All 4 tables show `rowsecurity = t`
**Evidence**: Verification query output showing RLS enabled

### DATA-002: Verify Remote Migration Status (20 min)

**Command**: `psql $DATABASE_URL -c "SELECT COUNT(*) FROM supabase_migrations.schema_migrations;"`
**Expected**: 56 migrations (Manager verified)
**Document**: Latest migration version, gap analysis
**Evidence**: Remote status documented

### DATA-003: Local Migration Inventory (30 min)

**Action**: Document all 18 local migration files
**File**: docs/specs/database_schema.md
**Include**: Tables created, purpose, columns, constraints
**Evidence**: Complete schema doc

### DATA-004: Migration Gap Analysis (25 min)

**Compare**: Local 18 vs Remote 56 (38 gap)
**Query**: `psql $DATABASE_URL -c "SELECT version FROM supabase_migrations.schema_migrations ORDER BY version;"`
**Document**: Which remote migrations not in local
**Evidence**: Gap analysis report

### DATA-005: RLS Test Scenarios (45 min)

**File**: supabase/rls_tests.sql
**Tests**: User permissions, admin access, public read-only, service role
**Run**: `psql $DATABASE_URL -f supabase/rls_tests.sql`
**Evidence**: All RLS tests passing

### DATA-006: Data Validation Queries (30 min)

**File**: supabase/validation_queries.sql
**Checks**: No orphans, valid statuses, constraint compliance
**Evidence**: Validation queries documented

### DATA-007: Database Schema ERD (40 min)

**Tool**: dbdiagram.io or mermaid
**Include**: All tables, relationships, RLS policies
**File**: docs/specs/database_schema.md (diagram section)
**Evidence**: ERD created

### DATA-008: RPC Functions Documentation (30 min)

**Functions**: get_revenue_metrics, get_inventory_summary, etc.
**File**: docs/specs/supabase_rpcs.md
**Include**: Signatures, parameters, usage, React Router 7 loader examples
**Evidence**: RPC docs complete

### DATA-009: Seed Data Creation (40 min)

**File**: supabase/seed.sql
**Data**: Approvals, ideas (5 + 1 wildcard), analytics, inventory
**Test**: `psql $DATABASE_URL -f supabase/seed.sql`
**Evidence**: Seed data loads successfully

### DATA-010: Staging Migration Plan (45 min)

**File**: docs/runbooks/migration_apply_plan.md (update from existing)
**Include**: Pre-flight checklist, apply steps, validation, rollback
**Coordinate**: DevOps for deployment timing
**Evidence**: Plan ready for staging

### DATA-011: Performance Index Strategy (25 min)

**File**: docs/specs/database_performance.md
**Identify**: Slow queries, missing indexes, optimization needs
**Evidence**: Performance strategy documented

### DATA-012: Production Backup Verification (20 min)

**Check**: Supabase auto-backup enabled (dashboard)
**Document**: Backup schedule, retention policy, restore procedure
**Evidence**: Backup confirmed, restore tested

### DATA-013: Security Definer Views Documentation (30 min)

**Priority**: P1 (from Supabase remediation)
**File**: docs/specs/security_definer_views.md
**List**: All 92 views with SECURITY DEFINER
**Review**: Which are intentional admin views vs security risks
**Evidence**: Views documented and reviewed

### DATA-014: Production Migration Execution (60 min)

**COORDINATE**: DevOps + Manager approval
**Pre-flight**: Backup exists, staging validated, RLS enabled
**Execute**: Apply migrations to production
**Evidence**: Production migration log

### DATA-015: Post-Migration Validation (30 min)

**Run**: validation_queries.sql against production
**Verify**: Integrity, performance, RLS all working
**Evidence**: Validation report all passing

### DATA-016: WORK COMPLETE Block (10 min)

**Update**: feedback/data/2025-10-19.md
**Include**: RLS enabled on 4 tables, schema documented, migrations applied
**Evidence**: Feedback entry

---

## React Router 7 Pattern for Data Routes

```typescript
// app/routes/api.data.metrics.ts
import type { Route } from "./+types/api.data.metrics";
import { createClient } from "@supabase/supabase-js";

export async function loader({ request }: Route.LoaderArgs) {
  // Server-side Supabase query
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!, // ✅ Correct
  );

  const { data } = await supabase.from("metrics").select();
  return { metrics: data }; // Auto-serialized
}
```

**MCP**: Query Context7 for loader patterns if needed

---

## Foreground Proof

1. RLS verification output (4 tables enabled) - **P0 EVIDENCE**
2. Remote migration count (56)
3. database_schema.md with all tables
4. Migration gap analysis
5. rls_tests.sql passing
6. validation_queries.sql created
7. ERD diagram
8. supabase_rpcs.md docs
9. seed.sql loadable
10. migration_apply_plan.md ready
11. Performance strategy doc
12. Backup confirmed
13. security_definer_views.md (92 views reviewed)
14. Production migration log
15. Validation report
16. WORK COMPLETE feedback

**TOTAL ESTIMATE**: ~8 hours (1h P0 + 7h schema/migrations)
**SUCCESS**: Production database secure, schema documented, migrations ready
