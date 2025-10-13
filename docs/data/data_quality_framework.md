---
title: Data Quality Framework
created: 2025-10-12
owner: data
status: active
---

# Data Quality Framework for Agent SDK

## Overview

**Purpose**: Ensure high-quality data in Agent SDK tables through automated validation and monitoring.

**Quality Dimensions**: Completeness, Accuracy, Consistency, Timeliness (CACT Framework)

**Automation**: Scheduled checks with alerting on failures

## Quality Dimensions

### 1. Completeness

**Definition**: Required fields must not be NULL

**Checks**:
- agent_approvals: conversation_id, customer_message, draft_response must be present
- AgentFeedback: conversationId, inputText, modelDraft must be present
- AgentQuery: query, agent must be present

**Threshold**:
- ✅ Pass: 95%+ complete
- ⚠️ Warn: 80-95% complete
- ❌ Fail: < 80% complete

**Function**: `check_data_completeness(table_name, required_columns)`

**Example**:
```sql
SELECT * FROM check_data_completeness('agent_approvals', 
  ARRAY['conversation_id', 'customer_message', 'draft_response']);
```

### 2. Accuracy

**Definition**: Data values must be valid and within expected ranges

**Checks**:
- confidence_score: 0-100 range
- status: One of (pending, approved, rejected, edited)
- priority: One of (low, normal, high, urgent)
- Email format: Valid email addresses

**Threshold**:
- ✅ Pass: 99%+ accurate
- ⚠️ Warn: 95-99% accurate
- ❌ Fail: < 95% accurate

**Function**: `check_data_accuracy()`

**Example**:
```sql
SELECT * FROM check_data_accuracy();
```

### 3. Consistency

**Definition**: Foreign keys and relationships must be valid

**Checks**:
- No orphaned feedback (conversationId must link to approval)
- No orphaned queries (conversationId must link to approval)
- No orphaned learning data (approval_id must exist)

**Threshold**:
- ✅ Pass: 95%+ consistent
- ⚠️ Warn: 80-95% consistent
- ❌ Fail: < 80% consistent

**Function**: `check_data_consistency()`

**Example**:
```sql
SELECT * FROM check_data_consistency();
```

### 4. Timeliness

**Definition**: Data must be fresh and not stale

**Checks**:
- No pending approvals > 24h old
- No query logs > 60 days old (should be cleaned by retention policy)
- Materialized views refreshed within SLA

**Threshold**:
- ✅ Pass: 90%+ fresh
- ⚠️ Warn: 70-90% fresh
- ❌ Fail: < 70% fresh

**Function**: `check_data_timeliness()`

**Example**:
```sql
SELECT * FROM check_data_timeliness();
```

## Running Quality Checks

### Manual Execution

```sql
-- Run all quality checks
SELECT * FROM run_all_quality_checks();

-- Run specific dimension
SELECT * FROM check_data_completeness('agent_approvals', 
  ARRAY['conversation_id', 'customer_message', 'draft_response']);

SELECT * FROM check_data_accuracy();
SELECT * FROM check_data_timeliness();
SELECT * FROM check_data_consistency();
```

### Automated Execution (pg_cron)

```sql
-- Schedule daily quality checks at 3:00 AM
SELECT cron.schedule(
  'daily-data-quality-check',
  '0 3 * * *',
  $$
  INSERT INTO data_quality_log (check_name, table_name, quality_dimension, check_result, score, failure_details)
  SELECT 
    check_name,
    'agent_tables',
    dimension,
    result,
    score,
    details
  FROM run_all_quality_checks();
  $$
);
```

## Quality Monitoring

### Current Quality Dashboard

```sql
-- Overall quality score (average of all dimensions)
SELECT 
  AVG(score) as overall_quality_score,
  COUNT(*) FILTER (WHERE check_result = 'pass') as passed_checks,
  COUNT(*) FILTER (WHERE check_result = 'warn') as warning_checks,
  COUNT(*) FILTER (WHERE check_result = 'fail') as failed_checks
FROM v_data_quality_current;

-- Quality by dimension
SELECT 
  quality_dimension,
  score,
  check_result,
  minutes_since_check
FROM v_data_quality_current
ORDER BY score ASC;
```

### Quality Trend (Last 30 Days)

```sql
SELECT 
  DATE_TRUNC('day', checked_at) as day,
  quality_dimension,
  AVG(score) as avg_score,
  MIN(score) as min_score,
  MAX(score) as max_score
FROM data_quality_log
WHERE checked_at > NOW() - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', checked_at), quality_dimension
ORDER BY day DESC, quality_dimension;
```

## Alerts & Notifications

### Alert Rules

**Critical** (Immediate Action):
- Any quality check fails (score < 80)
- Completeness < 90%
- Accuracy < 95%

**Warning** (Review Within 24h):
- Quality score 80-95%
- Timeliness check warns
- Consistency orphans > 10

**Info** (Weekly Review):
- Quality score 95-99%
- Minor completeness issues

### Alert Implementation

```sql
-- Create alert function
CREATE OR REPLACE FUNCTION alert_on_quality_failure()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.check_result = 'fail' OR NEW.score < 80 THEN
    -- Insert into notifications or send webhook
    INSERT INTO agent_sdk_notifications (
      type, priority, message, created_at
    ) VALUES (
      'quality_alert',
      'urgent',
      format('Data quality failure: %s scored %s%%', NEW.check_name, NEW.score),
      NOW()
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_quality_alert
AFTER INSERT ON data_quality_log
FOR EACH ROW
EXECUTE FUNCTION alert_on_quality_failure();
```

## Data Quality SLAs

| Dimension | Target Score | Alert Threshold | Review Frequency |
|-----------|--------------|-----------------|------------------|
| Completeness | ≥ 98% | < 95% | Daily |
| Accuracy | ≥ 99% | < 95% | Daily |
| Consistency | ≥ 98% | < 95% | Daily |
| Timeliness | ≥ 95% | < 90% | Daily |
| **Overall** | **≥ 97%** | **< 93%** | **Daily** |

## Remediation Playbooks

### Completeness Issues

**Problem**: NULL values in required fields

**Diagnosis**:
```sql
SELECT * FROM check_data_completeness('agent_approvals', 
  ARRAY['conversation_id', 'customer_message', 'draft_response']);
```

**Remediation**:
1. Identify rows with NULLs
2. Backfill from source data (Chatwoot)
3. Add NOT NULL constraints after cleanup
4. Update application validation

### Accuracy Issues

**Problem**: Invalid data values (out-of-range, wrong enum)

**Diagnosis**:
```sql
-- Find invalid records
SELECT * FROM agent_approvals 
WHERE confidence_score < 0 OR confidence_score > 100
OR status NOT IN ('pending', 'approved', 'rejected', 'edited');
```

**Remediation**:
1. Correct invalid values
2. Add CHECK constraints
3. Update application validation
4. Review agent logic

### Consistency Issues

**Problem**: Orphaned records (broken foreign keys)

**Diagnosis**:
```sql
-- Find orphans
SELECT f.* FROM "AgentFeedback" f
WHERE NOT EXISTS (
  SELECT 1 FROM agent_approvals a WHERE a.chatwoot_conversation_id = f."conversationId"
);
```

**Remediation**:
1. Delete orphaned records (after backup)
2. Strengthen foreign key constraints
3. Update deletion cascade rules
4. Review application logic

### Timeliness Issues

**Problem**: Stale pending approvals

**Diagnosis**:
```sql
-- Find stale approvals
SELECT * FROM agent_approvals
WHERE status = 'pending'
AND created_at < NOW() - INTERVAL '24 hours'
ORDER BY created_at;
```

**Remediation**:
1. Review and resolve stale items
2. Auto-reject after timeout
3. Increase operator capacity
4. Improve agent confidence

## Reporting

### Daily Quality Report

```sql
-- Summary for daily standup
SELECT 
  'Daily Data Quality Report' as report,
  (SELECT AVG(score) FROM v_data_quality_current) as overall_score,
  (SELECT COUNT(*) FROM v_data_quality_current WHERE check_result = 'fail') as failures,
  (SELECT COUNT(*) FROM v_data_quality_current WHERE check_result = 'warn') as warnings,
  (SELECT COUNT(*) FROM agent_approvals WHERE status = 'pending' AND created_at < NOW() - INTERVAL '24 hours') as stale_pending,
  NOW() as generated_at;
```

### Weekly Quality Trend

```sql
-- Quality improvement over time
SELECT 
  DATE_TRUNC('week', checked_at) as week,
  AVG(score) as avg_quality_score,
  COUNT(*) FILTER (WHERE check_result = 'fail') as total_failures
FROM data_quality_log
WHERE checked_at > NOW() - INTERVAL '12 weeks'
GROUP BY DATE_TRUNC('week', checked_at)
ORDER BY week;
```

## Integration with CI/CD

### Pre-Deployment Quality Gate

```bash
#!/bin/bash
# scripts/data-quality-gate.sh

# Run quality checks
psql $DATABASE_URL -c "SELECT * FROM run_all_quality_checks();" -t -A -F',' > /tmp/quality_results.csv

# Parse results
FAILURES=$(grep ',fail,' /tmp/quality_results.csv | wc -l)

if [ $FAILURES -gt 0 ]; then
  echo "❌ Data quality check failed: $FAILURES failures"
  exit 1
fi

echo "✅ Data quality check passed"
exit 0
```

### GitHub Action

```yaml
name: Data Quality Check
on: [pull_request]

jobs:
  quality-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run data quality checks
        run: ./scripts/data-quality-gate.sh
```

---

**Status**: Framework complete and operational  
**Functions**: 4 quality check functions  
**Monitoring**: Real-time quality view  
**Automation**: Scheduled checks with alerting
