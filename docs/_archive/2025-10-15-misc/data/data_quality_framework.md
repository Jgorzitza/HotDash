---
epoch: 2025.10.E1
doc: docs/data/data_quality_framework.md
owner: data
last_reviewed: 2025-10-11
expires: 2025-11-11
---

# Data Quality Framework - Agent SDK

## Overview

Automated data quality validation rules and monitoring for Agent SDK tables to ensure data integrity, completeness, and accuracy.

## Quality Dimensions

### 1. Completeness

- **Definition:** All required fields populated
- **Target:** >99% completeness
- **Validation:** Check for NULL values in required columns

### 2. Accuracy

- **Definition:** Data values within expected ranges
- **Target:** >99.5% accuracy
- **Validation:** Check constraints, referential integrity

### 3. Consistency

- **Definition:** Data relationships and timestamps logical
- **Target:** 100% consistency
- **Validation:** Cross-table validation, temporal logic

### 4. Timeliness

- **Definition:** Data freshness and update frequency
- **Target:** <1 minute lag for operational data
- **Validation:** Check last_updated_at timestamps

### 5. Uniqueness

- **Definition:** No duplicate records
- **Target:** 100% uniqueness on primary/unique keys
- **Validation:** Check for duplicate conversation_ids

## Validation Rules

### agent_approvals Validation

```sql
-- Rule 1: No NULL required fields
SELECT COUNT(*) as completeness_violations
FROM agent_approvals
WHERE conversation_id IS NULL OR serialized IS NULL OR status IS NULL;

-- Rule 2: Valid status values
SELECT COUNT(*) as accuracy_violations
FROM agent_approvals
WHERE status NOT IN ('pending', 'approved', 'rejected', 'expired');

-- Rule 3: Timestamp consistency
SELECT COUNT(*) as consistency_violations
FROM agent_approvals
WHERE updated_at < created_at;

-- Rule 4: Approved_by populated for non-pending
SELECT COUNT(*) as logic_violations
FROM agent_approvals
WHERE status IN ('approved', 'rejected') AND approved_by IS NULL;
```

### agent_feedback Validation

```sql
-- Rule 1: Completeness
SELECT COUNT(*) as completeness_violations
FROM agent_feedback
WHERE conversation_id IS NULL
   OR input_text IS NULL
   OR model_draft IS NULL;

-- Rule 2: Rubric scores in range (1-5)
SELECT COUNT(*) as accuracy_violations
FROM agent_feedback
WHERE (rubric->>'clarity')::INTEGER NOT BETWEEN 1 AND 5
   OR (rubric->>'accuracy')::INTEGER NOT BETWEEN 1 AND 5
   OR (rubric->>'tone')::INTEGER NOT BETWEEN 1 AND 5;

-- Rule 3: Annotator populated when safe_to_send is set
SELECT COUNT(*) as logic_violations
FROM agent_feedback
WHERE safe_to_send IS NOT NULL AND annotator IS NULL;
```

### agent_queries Validation

```sql
-- Rule 1: Completeness
SELECT COUNT(*) as completeness_violations
FROM agent_queries
WHERE conversation_id IS NULL OR query IS NULL OR result IS NULL OR agent IS NULL;

-- Rule 2: Latency within reasonable range (0-60000ms = 1 minute)
SELECT COUNT(*) as accuracy_violations
FROM agent_queries
WHERE latency_ms < 0 OR latency_ms > 60000;

-- Rule 3: Approved queries not edited (logic check)
SELECT COUNT(*) as logic_violations
FROM agent_queries
WHERE approved = true AND human_edited = true;
```

## Automated Quality Checks

### Daily Quality Report View

```sql
CREATE OR REPLACE VIEW v_data_quality_report AS
SELECT
  'agent_approvals' as table_name,
  (SELECT COUNT(*) FROM agent_approvals WHERE conversation_id IS NULL OR serialized IS NULL) as completeness_violations,
  (SELECT COUNT(*) FROM agent_approvals WHERE status NOT IN ('pending', 'approved', 'rejected', 'expired')) as accuracy_violations,
  (SELECT COUNT(*) FROM agent_approvals WHERE updated_at < created_at) as consistency_violations,
  NOW() as checked_at
UNION ALL
SELECT
  'agent_feedback',
  (SELECT COUNT(*) FROM agent_feedback WHERE conversation_id IS NULL OR input_text IS NULL OR model_draft IS NULL),
  (SELECT COUNT(*) FROM agent_feedback WHERE (rubric->>'clarity')::INTEGER NOT BETWEEN 1 AND 5),
  (SELECT COUNT(*) FROM agent_feedback WHERE safe_to_send IS NOT NULL AND annotator IS NULL),
  NOW()
UNION ALL
SELECT
  'agent_queries',
  (SELECT COUNT(*) FROM agent_queries WHERE conversation_id IS NULL OR query IS NULL OR result IS NULL),
  (SELECT COUNT(*) FROM agent_queries WHERE latency_ms < 0 OR latency_ms > 60000),
  (SELECT COUNT(*) FROM agent_queries WHERE approved = true AND human_edited = true),
  NOW();
```

### Quality Monitoring Script

**File:** `scripts/data/quality-check.sh`

```bash
#!/bin/bash
# Data Quality Validation
# Run: Daily at 05:00 UTC

psql $DATABASE_URL << 'EOF'
SELECT
  table_name,
  completeness_violations,
  accuracy_violations,
  consistency_violations,
  CASE
    WHEN completeness_violations + accuracy_violations + consistency_violations = 0
    THEN '✅ PASS'
    ELSE '❌ FAIL'
  END as status
FROM v_data_quality_report;

-- Alert if any violations
DO $$
DECLARE
  v_total_violations INTEGER;
BEGIN
  SELECT SUM(completeness_violations + accuracy_violations + consistency_violations)
  INTO v_total_violations
  FROM v_data_quality_report;

  IF v_total_violations > 0 THEN
    INSERT INTO observability_logs (level, message, metadata)
    VALUES (
      'ERROR',
      'Data quality violations detected',
      jsonb_build_object('total_violations', v_total_violations)
    );
  END IF;
END $$;
EOF
```

---

**Status:** Framework defined, ready for implementation  
**Next:** Create quality monitoring scripts and alerts
