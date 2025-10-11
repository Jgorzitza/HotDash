---
epoch: 2025.10.E1
doc: docs/data/agent_sdk_retention_policy.md
owner: data
last_reviewed: 2025-10-11
expires: 2025-11-11
---

# Agent SDK Data Retention Policy

## Overview

This policy defines retention periods for Agent SDK training data and operational records stored in Supabase.

## Retention Periods

| Table | Data Type | Retention Period | Rationale |
|-------|-----------|------------------|-----------|
| agent_approvals | Operational | 90 days | Approval audit trail, compliance |
| agent_feedback | Training Data | 30 days | Model training, then archived |
| agent_queries | Operational | 60 days | Performance analysis, auditing |

## Detailed Policies

### agent_approvals (Approval Queue)

**Retention:** 90 days

**Purpose:**
- Maintain approval audit trail for compliance
- Track human-in-the-loop decision patterns
- Support retrospective analysis of approval workflows

**Cleanup Trigger:**
- Records older than 90 days automatically deleted
- Exception: Records with `status = 'pending'` are flagged for manual review before deletion

**Implementation:**
```sql
-- Monthly cleanup job (pg_cron)
DELETE FROM agent_approvals 
WHERE created_at < NOW() - INTERVAL '90 days'
  AND status != 'pending';
```

### agent_feedback (Training Data)

**Retention:** 30 days (active) + archival

**Purpose:**
- Collect human feedback for model fine-tuning
- Build quality annotation datasets
- Measure annotator agreement and consistency

**Lifecycle:**
1. **Days 0-7:** Active annotation period
2. **Days 7-30:** Available for quality review and analysis
3. **Day 30:** Archived to cold storage (S3/backup)
4. **Day 31:** Deleted from primary database

**Archive Process:**
```bash
# Weekly archive job
psql $DB_URL -c "
  COPY (
    SELECT * FROM agent_feedback 
    WHERE created_at BETWEEN NOW() - INTERVAL '37 days' AND NOW() - INTERVAL '30 days'
  ) TO '/backups/agent_feedback_$(date +%Y%m%d).csv' WITH CSV HEADER;
"

# Delete archived records
psql $DB_URL -c "
  DELETE FROM agent_feedback 
  WHERE created_at < NOW() - INTERVAL '30 days';
"
```

**Exception:** Records with `safe_to_send = false` (flagged unsafe) retained for 180 days for safety analysis.

### agent_queries (Query Tracking)

**Retention:** 60 days

**Purpose:**
- Monitor query performance and latency
- Track approval rates per agent
- Audit data access patterns

**Cleanup Trigger:**
- Records older than 60 days automatically deleted
- Exception: Queries with high latency (>200ms) retained for 180 days for optimization analysis

**Implementation:**
```sql
-- Bi-weekly cleanup job
DELETE FROM agent_queries 
WHERE created_at < NOW() - INTERVAL '60 days'
  AND (latency_ms IS NULL OR latency_ms < 200);
```

## Compliance & Privacy

### Personal Data

**PII Handling:**
- No direct PII stored in Agent SDK tables
- conversation_id acts as pseudonymous identifier
- Serialized JSONB may contain customer context (redacted where possible)

**GDPR Compliance:**
- Right to erasure: Provide script to delete all records for specific conversation_id
- Data minimization: Only store data necessary for training/operations
- Purpose limitation: Data used only for stated purposes (training, auditing)

**Erasure Script:**
```sql
-- Delete all Agent SDK data for a specific conversation
DELETE FROM agent_queries WHERE conversation_id = $1;
DELETE FROM agent_feedback WHERE conversation_id = $1;
DELETE FROM agent_approvals WHERE conversation_id = $1;
```

### Security

**Access Control:**
- All tables protected with RLS (Row Level Security)
- service_role: Full access (Agent SDK operations)
- authenticated: Read own conversations only
- annotator/qa_team: Read all feedback (for quality review)
- operator_readonly: Read all queries (for monitoring)

**Audit Trail:**
- All deletions logged to `observability_logs`
- Retention cleanup runs logged with row counts
- Manual deletions require two-person approval

## Automation

### Scheduled Jobs (pg_cron)

**Weekly Archival (Sundays 02:00 UTC):**
```sql
-- Archive and delete old feedback
SELECT cron.schedule(
  'agent_feedback_retention', 
  '0 2 * * 0', 
  $$ 
    DELETE FROM agent_feedback 
    WHERE created_at < NOW() - INTERVAL '30 days'
      AND (safe_to_send IS NULL OR safe_to_send = true);
  $$
);
```

**Monthly Cleanup (First day of month, 03:00 UTC):**
```sql
-- Clean up old approvals and queries
SELECT cron.schedule(
  'agent_sdk_retention', 
  '0 3 1 * *', 
  $$ 
    DELETE FROM agent_approvals WHERE created_at < NOW() - INTERVAL '90 days' AND status != 'pending';
    DELETE FROM agent_queries WHERE created_at < NOW() - INTERVAL '60 days' AND (latency_ms IS NULL OR latency_ms < 200);
  $$
);
```

### Monitoring

**Retention Alerts:**
- Alert if table size exceeds 10GB (indicates cleanup failure)
- Alert if oldest record exceeds retention + 7 days grace period
- Weekly report of archived data counts

**Dashboard Metrics:**
- Current table sizes (agent_approvals, agent_feedback, agent_queries)
- Oldest record age per table
- Cleanup job success/failure rate
- Archive storage utilization

## Testing

### Test Retention Scripts

**Location:** `scripts/data/test-retention.sh`

**Test Cases:**
1. Insert records with backdated timestamps
2. Run cleanup scripts manually
3. Verify correct records deleted
4. Verify exceptions retained (pending, unsafe, high-latency)

### Verification Queries

```sql
-- Check oldest records per table
SELECT 
  'agent_approvals' as table_name,
  MIN(created_at) as oldest_record,
  AGE(NOW(), MIN(created_at)) as age
FROM agent_approvals
UNION ALL
SELECT 'agent_feedback', MIN(created_at), AGE(NOW(), MIN(created_at)) FROM agent_feedback
UNION ALL
SELECT 'agent_queries', MIN(created_at), AGE(NOW(), MIN(created_at)) FROM agent_queries;

-- Check for records exceeding retention
SELECT 
  'Overdue approvals' as metric,
  COUNT(*) as count
FROM agent_approvals 
WHERE created_at < NOW() - INTERVAL '90 days'
UNION ALL
SELECT 'Overdue feedback', COUNT(*) 
FROM agent_feedback 
WHERE created_at < NOW() - INTERVAL '30 days' AND safe_to_send != false
UNION ALL
SELECT 'Overdue queries', COUNT(*) 
FROM agent_queries 
WHERE created_at < NOW() - INTERVAL '60 days' AND latency_ms < 200;
```

## Review & Updates

**Review Cadence:** Quarterly (Jan, Apr, Jul, Oct)

**Review Criteria:**
- Storage costs vs. data utility
- Compliance requirements changes
- Model training data needs
- Performance analysis requirements

**Update Process:**
1. Data team proposes retention changes
2. Manager reviews with compliance/legal
3. Engineer implements technical changes
4. QA validates cleanup scripts
5. Document version updated

## Contacts

**Questions:** @data team  
**Compliance:** @compliance team  
**Implementation:** @engineer team  

**Last Updated:** 2025-10-11  
**Next Review:** 2026-01-11  
**Version:** 1.0

