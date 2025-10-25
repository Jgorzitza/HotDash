# Supabase Staging Apply Rehearsal

**Owner:** DevOps + Data  
**Created:** 2025-10-19  
**Status:** Ready for Execution

## Overview

This runbook guides the Supabase staging environment rehearsal required for production launch readiness. Per urgent QA findings (2025-10-19), RLS verification is a P0 blocker.

## Prerequisites

- Supabase CLI installed: `supabase --version` (current: 2.48.3)
- Access to staging Supabase project
- RLS test script ready: `supabase/rls_tests.sql`

## P0 Critical: RLS Verification

### Tables to Verify (from URGENT_QA_FINDINGS_OCT19.md):

1. `ads_metrics_daily`
2. `agent_run`
3. `agent_qc`
4. `creds_meta`

### Execution Steps:

```bash
# 1. Connect to staging Supabase
cd ~/HotDash/hot-dash
export SUPABASE_URL=$(grep SUPABASE_URL .env.staging | cut -d= -f2)
export SUPABASE_KEY=$(grep SUPABASE_SERVICE_KEY .env.staging | cut -d= -f2)

# 2. Verify connection
supabase db remote --status

# 3. Run RLS verification script
psql $SUPABASE_URL -c "\i supabase/rls_tests.sql" > artifacts/rls_verification_$(date +%Y%m%d_%H%M%S).log 2>&1

# 4. Check results
grep -E "(rls_enabled|PASS|FAIL)" artifacts/rls_verification_*.log | tail -20
```

### Expected Output:

```
tablename         | rls_enabled
------------------+-------------
ads_metrics_daily | t
agent_qc          | t
agent_run         | t
creds_meta        | t
```

### Pass Criteria:

- All 4 P0 tables show `rls_enabled = t`
- No errors in execution log
- Test completes in <30 seconds

### Fail Criteria & Escalation:

If ANY table shows `rls_enabled = f`:

1. **STOP** - This is a P0 security blocker
2. Document which table(s) failed
3. Escalate to Manager immediately with error log
4. DO NOT proceed with production deployment

## Migration Rehearsal

### Apply Pending Migrations:

```bash
# 1. Check pending migrations
supabase db diff

# 2. Apply to staging
supabase db push

# 3. Verify success
supabase db remote --status
```

### Rollback Drill:

```bash
# 1. Document current migration version
supabase migration list > artifacts/pre_rollback_state.txt

# 2. Simulate rollback (dry run)
supabase db reset --dry-run

# 3. Verify rollback plan
cat .supabase/migrations/*.sql | grep "DROP\|ALTER" | head -10
```

## Coordination with Data Agent

### Data Agent Responsibilities:

1. Execute RLS verification script
2. Document pass/fail for each P0 table
3. Provide results to QA for sign-off
4. If failures: Escalate to Manager

### DevOps Responsibilities:

1. Provide this runbook
2. Verify Supabase CLI access
3. Monitor staging environment health
4. Document rehearsal artifacts

## Success Criteria

- ✅ RLS enabled on all 4 P0 tables
- ✅ Migrations apply without errors
- ✅ Rollback plan documented
- ✅ Execution time <30 minutes
- ✅ Artifacts saved to `artifacts/rls_verification_*.log`

## Failure Recovery

If rehearsal fails:

1. Capture full error log
2. Document which step failed
3. Restore from last known good state
4. Escalate to Manager with evidence
5. Schedule retry after fixes

## Evidence Required

Save to `artifacts/devops/supabase_staging_$(date +%Y%m%d).log`:

- RLS verification results
- Migration apply logs
- Rollback plan output
- Execution timestamps

## Timeline

Per URGENT_QA_FINDINGS_OCT19.md:

- Data agent: 30 minutes for RLS verification
- DevOps: Supporting role, monitoring
- Critical path: Blocks production GO decision

## Related Documents

- Urgent QA Findings: `docs/directions/URGENT_QA_FINDINGS_OCT19.md`
- RLS Test Script: `supabase/rls_tests.sql`
- Secrets Audit: `docs/runbooks/secrets_audit_report.md`
