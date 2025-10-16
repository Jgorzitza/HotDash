# Sanity Checks & Coordination Notes

**File:** `docs/specs/sanity_checks_and_coordination.md`  
**Owner:** data agent  
**Date:** 2025-10-16  
**Tasks:** 15-16 - Sanity check SQL and coordination notes

---

## Task 15: Sanity Check SQL

### Approvals Count by State

```sql
SELECT 
  state,
  COUNT(*) as count,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 2) as percentage
FROM approvals
GROUP BY state
ORDER BY count DESC;
```

**Expected Output:**
```
state           | count | percentage
----------------|-------|------------
pending_review  |   150 |      45.00
draft           |   100 |      30.00
approved        |    50 |      15.00
applied         |    30 |       9.00
audited         |     3 |       0.90
learned         |     1 |       0.30
```

### Approvals Count by Kind

```sql
SELECT 
  kind,
  COUNT(*) as count,
  AVG(EXTRACT(EPOCH FROM (updated_at - created_at))/60) as avg_age_minutes
FROM approvals
GROUP BY kind
ORDER BY count DESC;
```

### Pending Approvals Older Than 2 Hours

```sql
SELECT 
  id,
  kind,
  summary,
  created_by,
  created_at,
  EXTRACT(EPOCH FROM (NOW() - created_at))/3600 as age_hours
FROM approvals
WHERE state = 'pending_review'
  AND created_at < NOW() - INTERVAL '2 hours'
ORDER BY created_at ASC;
```

**Alert if:** Count > 5 (SLA breach)

### Approvals Without Evidence

```sql
SELECT 
  id,
  kind,
  state,
  summary,
  created_by
FROM approvals
WHERE evidence IS NULL
  AND state IN ('pending_review', 'approved');
```

**Alert if:** Count > 0 (validation failure)

### Approvals Without Rollback Plan

```sql
SELECT 
  id,
  kind,
  state,
  summary
FROM approvals
WHERE rollback IS NULL
  AND state IN ('approved', 'applied');
```

**Alert if:** Count > 0 (safety violation)

### Grade Distribution

```sql
SELECT 
  'tone' as metric,
  AVG(tone) as avg_grade,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY tone) as median_grade,
  MIN(tone) as min_grade,
  MAX(tone) as max_grade
FROM approval_grades
UNION ALL
SELECT 
  'accuracy',
  AVG(accuracy),
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY accuracy),
  MIN(accuracy),
  MAX(accuracy)
FROM approval_grades
UNION ALL
SELECT 
  'policy',
  AVG(policy),
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY policy),
  MIN(policy),
  MAX(policy)
FROM approval_grades;
```

**Target:** avg_grade >= 4.5 for all metrics

### Edit Distance Analysis

```sql
SELECT 
  field,
  COUNT(*) as edit_count,
  AVG(edit_distance) as avg_edit_distance,
  MAX(edit_distance) as max_edit_distance
FROM approval_edits
GROUP BY field
ORDER BY edit_count DESC;
```

**Alert if:** avg_edit_distance > 50 (significant rewrites)

### Audit Log Coverage

```sql
SELECT 
  COUNT(DISTINCT a.id) as total_approvals,
  COUNT(DISTINCT al.entity_id::BIGINT) as audited_approvals,
  ROUND(100.0 * COUNT(DISTINCT al.entity_id::BIGINT) / NULLIF(COUNT(DISTINCT a.id), 0), 2) as audit_coverage_pct
FROM approvals a
LEFT JOIN audit_logs al ON al.entity_type = 'approval' AND al.entity_id = a.id::TEXT
WHERE a.state IN ('approved', 'applied', 'audited');
```

**Target:** audit_coverage_pct >= 95%

---

## Task 16: Coordination Notes

### For Engineer (UI/API Integration)

**Approvals Drawer Component:**

```typescript
// 1. Fetch approval details
const fetchApproval = async (id: number) => {
  const { data } = await supabase.rpc('get_approval_detail', { p_approval_id: id });
  return data;
};

// 2. Validate before enabling Approve button
const validateApproval = async (id: number) => {
  const { data } = await supabase.rpc('validate_approval', { p_approval_id: id });
  if (!data.valid) {
    setErrors(data.errors);
    setApproveDisabled(true);
  } else {
    setApproveDisabled(false);
  }
};

// 3. Approve with grades
const approveApproval = async (id: number, grades: Grades) => {
  const { data } = await supabase.rpc('approve_approval', {
    p_approval_id: id,
    p_reviewer: user.email,
    p_tone: grades.tone,
    p_accuracy: grades.accuracy,
    p_policy: grades.policy,
    p_notes: grades.notes
  });
  return data;
};
```

**Dashboard Tile Component:**

```typescript
// Fetch queue summary
const fetchQueueSummary = async () => {
  const { data } = await supabase.rpc('get_approvals_queue_tile');
  return data;
  // Returns: { pending_count, by_kind, urgency, oldest_pending_at, ... }
};

// Fetch approvals list
const fetchApprovalsList = async (filters: Filters) => {
  const { data } = await supabase.rpc('get_approvals_list', {
    p_state: filters.state || null,
    p_kind: filters.kind || null,
    p_reviewer: filters.reviewer || null,
    p_limit: filters.limit || 50,
    p_offset: filters.offset || 0
  });
  return data;
};
```

**Real-time Subscriptions:**

```typescript
// Subscribe to approvals changes
const subscription = supabase
  .channel('approvals-changes')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'approvals'
  }, (payload) => {
    console.log('Approval changed:', payload);
    refreshApprovalsList();
  })
  .subscribe();
```

### For Integrations (Supabase Client)

**RPC Functions Available:**

| Function | Parameters | Returns | Purpose |
|----------|-----------|---------|---------|
| `get_approvals_list` | state, kind, reviewer, limit, offset | TABLE | Filtered list |
| `get_approvals_queue_tile` | none | JSONB | Queue summary |
| `validate_approval` | approval_id | JSONB | Validation check |
| `get_approval_detail` | approval_id | JSONB | Full details |
| `approve_approval` | approval_id, reviewer, grades | JSONB | Approve action |
| `rollup_approvals_metrics_daily` | date | JSONB | Metrics rollup |

**RLS Policies:**

| Role | Permissions |
|------|-------------|
| service_role | Full access (all operations) |
| authenticated | Read all approvals |
| reviewer/manager/admin | Update approvals, insert/update grades |
| agent | Read own approvals only |

**Example Integration:**

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Get pending approvals for CX
const { data: cxApprovals } = await supabase.rpc('get_approvals_list', {
  p_state: 'pending_review',
  p_kind: 'cx_reply',
  p_limit: 10
});

// Validate approval before showing Approve button
const { data: validation } = await supabase.rpc('validate_approval', {
  p_approval_id: 123
});

if (validation.valid) {
  // Enable Approve button
} else {
  // Show errors: validation.errors
}
```

### For QA (Testing)

**Test Cases:**

**1. Create Approval Flow**
- [ ] Create draft approval with all required fields
- [ ] Validate approval (should pass)
- [ ] Move to pending_review
- [ ] Verify appears in queue tile
- [ ] Verify appears in approvals list

**2. Validation Tests**
- [ ] Create approval without evidence → validate → should fail
- [ ] Create approval without rollback → validate → should fail
- [ ] Create approval without actions → validate → should fail
- [ ] Create approval with all fields → validate → should pass

**3. Approval Flow**
- [ ] Approve approval with grades
- [ ] Verify state changes to 'approved'
- [ ] Verify grades recorded in approval_grades
- [ ] Verify audit log entry created

**4. RLS Policy Tests**
- [ ] Service role can read/write all approvals
- [ ] Authenticated user can read all approvals
- [ ] Authenticated user cannot update approvals (unless reviewer)
- [ ] Reviewer can update approvals
- [ ] Agent can only read own approvals

**5. Performance Tests**
- [ ] Queue tile query < 100ms
- [ ] Approvals list query < 100ms
- [ ] Validation query < 50ms
- [ ] Approval detail query < 50ms

**6. Rollback Tests**
- [ ] Apply migration
- [ ] Verify tables created
- [ ] Apply rollback
- [ ] Verify tables removed
- [ ] Re-apply migration
- [ ] Verify tables recreated

**Test Data:**

Use seed data from `20251016_approvals_seed_data.sql`:
- 5 approvals with mixed states
- Approval items, grades, and edits included

**Test Environment:**

```bash
# Local Supabase
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres

# Apply migrations
psql $DATABASE_URL -f supabase/migrations/20251015_approvals_workflow.sql
psql $DATABASE_URL -f supabase/migrations/20251015_audit_logs.sql
psql $DATABASE_URL -f supabase/migrations/20251016_approvals_seed_data.sql
psql $DATABASE_URL -f supabase/migrations/20251016_approvals_rpc_functions.sql
psql $DATABASE_URL -f supabase/migrations/20251016_approvals_metrics_rollup.sql
```

---

## Changelog

- 1.0 (2025-10-16) - Initial sanity checks and coordination notes

