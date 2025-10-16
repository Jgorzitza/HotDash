# Validation & Rollback Notes

**File:** `docs/specs/validation_and_rollback_notes.md`  
**Owner:** data agent  
**Date:** 2025-10-16  
**Tasks:** 13-14 - Validation SQL prerequisites and rollback verification

---

## Task 13: /validate SQL Prerequisites for Engineer

### What the Approvals Drawer Blocks On

The `/validate` endpoint should check these SQL prerequisites before enabling "Approve":

**1. Evidence Present and Valid**
```sql
SELECT 
  CASE 
    WHEN evidence IS NULL THEN 'Missing evidence'
    WHEN NOT (evidence ? 'samples' OR evidence ? 'queries' OR evidence ? 'template') THEN 'Evidence missing required keys'
    ELSE 'OK'
  END as evidence_check
FROM approvals
WHERE id = $1;
```

**2. Rollback Plan Documented**
```sql
SELECT 
  CASE 
    WHEN rollback IS NULL THEN 'Missing rollback plan'
    WHEN NOT (rollback ? 'action') THEN 'Rollback missing action'
    ELSE 'OK'
  END as rollback_check
FROM approvals
WHERE id = $1;
```

**3. Impact Assessment Reasonable**
```sql
SELECT 
  CASE 
    WHEN impact IS NULL THEN 'Missing impact assessment'
    WHEN jsonb_array_length(jsonb_object_keys(impact)) < 1 THEN 'Impact assessment empty'
    ELSE 'OK'
  END as impact_check
FROM approvals
WHERE id = $1;
```

**4. Actions Valid**
```sql
SELECT 
  CASE 
    WHEN actions IS NULL THEN 'Missing actions'
    WHEN jsonb_typeof(actions) != 'array' THEN 'Actions must be array'
    WHEN jsonb_array_length(actions) = 0 THEN 'Actions array empty'
    ELSE 'OK'
  END as actions_check
FROM approvals
WHERE id = $1;
```

**5. State Allows Approval**
```sql
SELECT 
  CASE 
    WHEN state NOT IN ('draft', 'pending_review') THEN 'Cannot approve from state: ' || state
    ELSE 'OK'
  END as state_check
FROM approvals
WHERE id = $1;
```

### Complete Validation Query

```sql
CREATE OR REPLACE FUNCTION public.validate_approval(p_approval_id BIGINT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_approval RECORD;
  v_errors TEXT[] := '{}';
BEGIN
  SELECT * INTO v_approval FROM approvals WHERE id = p_approval_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('valid', false, 'errors', ARRAY['Approval not found']);
  END IF;
  
  -- Check evidence
  IF v_approval.evidence IS NULL THEN
    v_errors := array_append(v_errors, 'Missing evidence');
  END IF;
  
  -- Check rollback
  IF v_approval.rollback IS NULL OR NOT (v_approval.rollback ? 'action') THEN
    v_errors := array_append(v_errors, 'Missing or incomplete rollback plan');
  END IF;
  
  -- Check impact
  IF v_approval.impact IS NULL THEN
    v_errors := array_append(v_errors, 'Missing impact assessment');
  END IF;
  
  -- Check actions
  IF v_approval.actions IS NULL OR jsonb_array_length(v_approval.actions) = 0 THEN
    v_errors := array_append(v_errors, 'Missing or empty actions');
  END IF;
  
  -- Check state
  IF v_approval.state NOT IN ('draft', 'pending_review') THEN
    v_errors := array_append(v_errors, 'Cannot approve from state: ' || v_approval.state);
  END IF;
  
  RETURN jsonb_build_object(
    'valid', array_length(v_errors, 1) IS NULL,
    'errors', COALESCE(v_errors, '{}'),
    'approval_id', p_approval_id
  );
END;
$$;
```

### Engineer Integration

```typescript
// In Approvals Drawer component
const validateApproval = async (approvalId: number) => {
  const { data } = await supabase.rpc('validate_approval', { p_approval_id: approvalId });
  
  if (!data.valid) {
    setErrors(data.errors);
    setApproveButtonDisabled(true);
  } else {
    setErrors([]);
    setApproveButtonDisabled(false);
  }
};
```

---

## Task 14: Rollback Verification Notes

### Apply/Down Plan

**All migrations have rollback scripts:**

| Migration | Rollback Script | Tested |
|-----------|----------------|--------|
| 20251015_approvals_workflow.sql | 20251015_approvals_workflow.rollback.sql | ✅ |
| 20251015_audit_logs.sql | 20251015_audit_logs.rollback.sql | ✅ |
| 20251016_approvals_seed_data.sql | (DELETE statements) | ✅ |
| 20251016_approvals_rpc_functions.sql | (DROP FUNCTION) | ✅ |
| 20251016_approvals_metrics_rollup.sql | (DROP TABLE, FUNCTION, cron) | ✅ |

### Rollback Testing Procedure

**1. Apply Migration**
```bash
psql $DATABASE_URL -f supabase/migrations/20251015_approvals_workflow.sql
```

**2. Verify Objects Created**
```sql
\dt approvals*
\df get_approvals*
SELECT * FROM approvals LIMIT 1;
```

**3. Apply Rollback**
```bash
psql $DATABASE_URL -f supabase/migrations/20251015_approvals_workflow.rollback.sql
```

**4. Verify Objects Removed**
```sql
\dt approvals*  -- Should return "Did not find any relation"
\df get_approvals*  -- Should return "Did not find any function"
```

**5. Re-apply Migration (Idempotency Test)**
```bash
psql $DATABASE_URL -f supabase/migrations/20251015_approvals_workflow.sql
```

### Rollback Order (Reverse Dependency)

**Correct Order:**
1. Drop dependent objects first (triggers, policies, indexes)
2. Drop functions
3. Drop tables (child tables before parent tables)

**Example from approvals_workflow.rollback.sql:**
```sql
-- 1. Drop triggers
DROP TRIGGER IF EXISTS trg_approvals_updated_at ON public.approvals;

-- 2. Drop policies
DROP POLICY IF EXISTS approvals_service_role ON public.approvals;
-- ... (all policies)

-- 3. Drop indexes
DROP INDEX IF EXISTS public.approvals_state_kind_created_at_idx;
-- ... (all indexes)

-- 4. Drop tables (child first)
DROP TABLE IF EXISTS public.approval_edits;  -- Child
DROP TABLE IF EXISTS public.approval_grades;  -- Child
DROP TABLE IF EXISTS public.approval_items;  -- Child
DROP TABLE IF EXISTS public.approvals;  -- Parent
```

### Rollback Safety Checks

**Before Rollback:**
- [ ] Backup database
- [ ] Verify no active connections using tables
- [ ] Check for dependent objects not in rollback script
- [ ] Notify team of rollback window

**After Rollback:**
- [ ] Verify all objects removed
- [ ] Check for orphaned data
- [ ] Test re-application of migration
- [ ] Update migration status in tracking system

### Emergency Rollback

**If production issue detected:**

```bash
# 1. Immediate rollback
psql $PROD_DATABASE_URL -f supabase/migrations/20251015_approvals_workflow.rollback.sql

# 2. Verify rollback
psql $PROD_DATABASE_URL -c "\dt approvals*"

# 3. Log incident
INSERT INTO audit_logs (actor, action, entity_type, payload, result)
VALUES ('ops', 'migration.rollback', 'migration', 
  '{"migration": "20251015_approvals_workflow", "reason": "production issue"}'::jsonb,
  'success');

# 4. Notify team
# (Send alert via monitoring system)
```

### Rollback Artifacts

**Location:** `supabase/migrations/*.rollback.sql`

**Naming Convention:** `<timestamp>_<name>.rollback.sql`

**Required Content:**
- DROP statements for all created objects
- Reverse order of creation
- IF EXISTS clauses for safety
- Comments explaining what's being removed

### Testing Matrix

| Migration | Apply | Rollback | Re-apply | Status |
|-----------|-------|----------|----------|--------|
| approvals_workflow | ✅ | ✅ | ✅ | PASS |
| audit_logs | ✅ | ✅ | ✅ | PASS |
| approvals_seed_data | ✅ | ✅ | ✅ | PASS |
| approvals_rpc_functions | ✅ | ✅ | ✅ | PASS |
| approvals_metrics_rollup | ✅ | ✅ | ✅ | PASS |

---

## Coordination Notes

### For Engineer (UI/API)

**Approvals Drawer Prerequisites:**
1. Call `validate_approval(approval_id)` before enabling "Approve" button
2. Display validation errors to user
3. Block approval if validation fails
4. Show evidence, impact, risk, and rollback in UI

**Sample Tile Queries:**
```typescript
// Get approvals queue
const { data } = await supabase.rpc('get_approvals_queue_tile');

// Get approvals list
const { data } = await supabase.rpc('get_approvals_list', {
  p_state: 'pending_review',
  p_kind: 'cx_reply',
  p_limit: 10
});
```

### For Integrations (Supabase Client)

**RPC Function Signatures:**
- `get_approvals_list(state, kind, reviewer, limit, offset)` → TABLE
- `get_approvals_queue_tile()` → JSONB
- `validate_approval(approval_id)` → JSONB
- `rollup_approvals_metrics_daily(date)` → JSONB

**RLS Policies:**
- Service role: Full access
- Authenticated: Read-only
- Reviewers: Can update approvals and grades

### For QA

**Test Cases:**
1. Create approval → validate → approve → verify audit log
2. Create approval with missing evidence → validate → should fail
3. Rollback migration → verify objects removed → re-apply → verify objects recreated
4. Query approvals queue → verify counts match database
5. Test RLS policies with different user roles

---

## Changelog

- 1.0 (2025-10-16) - Initial validation and rollback notes for BLOCKER-FIRST RESET

