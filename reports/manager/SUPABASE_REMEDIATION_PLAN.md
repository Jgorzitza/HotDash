# Supabase Security Remediation Plan

**Created**: 2025-10-19T15:15:00Z
**Source**: docs/guides/SUPABASE_ERROR_WARNING.md (182 lines, Supabase Linter output)
**Severity**: P0 (4 RLS errors), P1 (92 security definer views), P2 (71 function warnings)

---

## CRITICAL (P0) - RLS Disabled on Public Tables

**Owner**: Data Agent
**Priority**: MUST FIX BEFORE PRODUCTION
**Count**: 4 tables

### Tables Missing RLS:
1. `ads_metrics_daily` - Analytics data
2. `agent_run` - Agent execution logs
3. `agent_qc` - Quality control data
4. `creds_meta` - Credential metadata ⚠️ VERY CRITICAL

**Fix Molecules (Assign to Data Agent)**:

#### FIX-RLS-001: Enable RLS on ads_metrics_daily (15 min)
```sql
ALTER TABLE public.ads_metrics_daily ENABLE ROW LEVEL SECURITY;

-- Policy: Authenticated users can read
CREATE POLICY "authenticated_read_ads_metrics"
ON public.ads_metrics_daily
FOR SELECT
TO authenticated
USING (true);

-- Policy: Service role can write
CREATE POLICY "service_write_ads_metrics"
ON public.ads_metrics_daily
FOR ALL
TO service_role
USING (true);
```
**Test**: `SELECT * FROM ads_metrics_daily` as anon (should fail)
**Evidence**: RLS enabled, policies created

#### FIX-RLS-002: Enable RLS on agent_run (15 min)
```sql
ALTER TABLE public.agent_run ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_full_access_agent_run"
ON public.agent_run
FOR ALL
TO service_role
USING (true);
```

#### FIX-RLS-003: Enable RLS on agent_qc (15 min)
```sql
ALTER TABLE public.agent_qc ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_full_access_agent_qc"
ON public.agent_qc
FOR ALL
TO service_role
USING (true);
```

#### FIX-RLS-004: Enable RLS on creds_meta (15 min)
```sql
ALTER TABLE public.creds_meta ENABLE ROW LEVEL SECURITY;

-- STRICT: Only service role
CREATE POLICY "service_role_only_creds_meta"
ON public.creds_meta
FOR ALL
TO service_role
USING (true);
```

**Total Time**: 60 minutes
**Blocker**: Cannot deploy to production without these

---

## HIGH PRIORITY (P1) - Security Definer Views

**Owner**: Data Agent (review), DevOps (deployment)
**Count**: 92 views
**Risk**: Views execute with creator permissions, bypass RLS

### Sample Affected Views:
- `v_stockout_prediction`
- `v_export_daily_performance`
- `v_data_freshness`
- `v_picker_payment_history`
- `ceo_editing_patterns`
- `approval_queue_metrics`
- ... 86 more

**Fix Options**:

**Option A**: Review each view, remove SECURITY DEFINER if not needed
**Option B**: Document as intentional (if admin views need elevated access)
**Option C**: Migrate to RLS policies instead of SECURITY DEFINER

**Recommendation**: **Option B for now** (document + defer)
- These views are for dashboard/analytics (admin use)
- Security definer may be intentional for performance
- Review post-production

**Molecule** (Assign to Data Agent):

#### FIX-VIEWS-001: Document Security Definer Views (30 min)
Create: `docs/specs/security_definer_views.md`
List all 92 views, purpose, why SECURITY DEFINER needed
Review: Can any be converted to normal views with RLS?
Evidence: Documentation complete

---

## MEDIUM PRIORITY (P2) - Function Search Path Mutable

**Owner**: Data Agent
**Count**: 71 functions
**Risk**: Functions could execute malicious code if search_path manipulated

### Sample Affected Functions:
- `get_current_account_id`
- `get_stock_risk_tile`
- `etl_inventory_daily`
- `process_picker_payment`
- `record_ceo_edit`
- ... 66 more

**Fix Pattern**:
```sql
-- Add to function definition
SET search_path = public, pg_temp;
```

**Molecule** (Assign to Data Agent):

#### FIX-FUNC-001: Fix Function Search Paths (60 min)
**Action**: Add `SET search_path = public` to all 71 functions
**Script**: Create migration to ALTER each function
**Evidence**: All functions secured

---

## LOW PRIORITY (P3) - Other Issues

**materialized_view_in_api** (8 views): Performance consideration, not security
**extension_in_public** (1 extension): Minor schema hygiene issue

**Defer**: Post-production cleanup

---

## ASSIGNMENT TO LANES

### Data Agent - IMMEDIATE (P0)
**Add to docs/directions/data.md**:

```markdown
### DATA-001-P0: Enable RLS on 4 Critical Tables (60 min) - DO FIRST
**Priority**: P0 - BLOCKS PRODUCTION
**Tables**: ads_metrics_daily, agent_run, agent_qc, creds_meta
**Action**: Execute FIX-RLS-001 through FIX-RLS-004 (see SUPABASE_REMEDIATION_PLAN.md)
**Test**: Verify RLS enabled, policies working
**Evidence**: All 4 tables RLS enabled
```

### Data Agent - HIGH (P1)
```markdown
### DATA-016: Document Security Definer Views (30 min)
**Action**: Execute FIX-VIEWS-001
**Evidence**: security_definer_views.md created
```

### Data Agent - MEDIUM (P2)
```markdown
### DATA-017: Secure Function Search Paths (60 min)
**Action**: Execute FIX-FUNC-001
**Evidence**: All 71 functions secured
```

---

## TOTAL REMEDIATION TIME

**P0 (Critical)**: 60 minutes - MUST DO before production
**P1 (High)**: 30 minutes - Document for review
**P2 (Medium)**: 60 minutes - Fix post-production

**RECOMMENDATION**: Execute P0 immediately, defer P1/P2

---

**Created**: 2025-10-19T15:15:00Z
**Status**: Ready for Data agent execution

