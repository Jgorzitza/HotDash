---
title: Agent Training Data Retention Policy
created: 2025-10-12
owner: data
reviewed_by: compliance
status: active
---

# Agent Training Data Retention Policy

## Purpose

Define data retention rules for Agent SDK training data to balance model improvement needs with privacy compliance and storage costs.

## Scope

This policy applies to all Agent SDK tables:
- `agent_approvals` - Approval queue
- `AgentFeedback` - Training annotations
- `AgentQuery` - Query performance logs
- `agent_sdk_learning_data` - Edit/improvement tracking
- `agent_sdk_notifications` - Operator notifications

## Retention Rules

### Active Approval Queue (Hot Data)
**Tables**: `agent_approvals`, `agent_sdk_notifications`

- **Pending approvals**: Retained until resolved (approved/rejected)
- **Resolved approvals**: Retained for **7 days** after resolution
- **Rationale**: Operators may need to reference recent decisions

### Training Data (Warm Data)
**Tables**: `AgentFeedback`, `agent_sdk_learning_data`

- **Retention Period**: **30 days**
- **Purpose**: Model fine-tuning and quality improvement
- **After 30 days**: Data anonymized or deleted
- **Exception**: High-value training examples can be flagged for extended retention

### Query Performance Logs (Cold Data)
**Table**: `AgentQuery`

- **Retention Period**: **30 days**  
- **Purpose**: Performance optimization and debugging
- **Aggregated metrics**: Retained indefinitely (no PII)
- **Raw query logs**: Deleted after 30 days

## Automated Cleanup

### Daily Cleanup Job
- **Schedule**: Runs daily at 2:00 AM UTC
- **Script**: `scripts/cleanup_agent_training_data.sql`
- **Execution**: Via cron or scheduled function
- **Logging**: Results logged to `agent_training_cleanup_logs`

### Manual Cleanup
- **Script**: `scripts/cleanup_agent_training_data.sql`
- **Usage**: Run Option 1 (test data) or Option 2 (30-day retention)
- **Verification**: Check row counts after cleanup

## Privacy & Compliance

### PII Handling
- Customer emails, names stored in `agent_approvals` 
- **Retention**: Maximum 30 days
- **Deletion**: Automatic via retention policy
- **GDPR**: Supports right to be forgotten (delete by customer_email)

### Data Minimization
- Only store data necessary for training
- No sensitive payment information
- No passwords or access tokens

### Access Control
- **RLS Enabled**: All tables have Row Level Security
- **Shop Isolation**: Data isolated by shopDomain
- **Service Role**: Can access all data for training
- **App Role**: Can only access own shop data

## Backup Before Cleanup

### Archive High-Value Data
Before cleanup, archive valuable training examples:

```sql
-- Create archive table (if not exists)
CREATE TABLE IF NOT EXISTS agent_training_archive (
  id UUID PRIMARY KEY,
  original_table TEXT,
  original_id TEXT,
  data JSONB,
  archived_at TIMESTAMP DEFAULT NOW(),
  archive_reason TEXT
);

-- Archive high-quality responses
INSERT INTO agent_training_archive (original_table, original_id, data, archive_reason)
SELECT 
  'agent_approvals',
  id,
  row_to_json(agent_approvals.*)::jsonb,
  'High confidence response'
FROM agent_approvals
WHERE confidence_score >= 90 AND status = 'approved';
```

## Monitoring

### Metrics to Track
- Total rows per table
- Data age distribution (0-7 days, 7-30 days, 30+ days)
- Cleanup job success/failure rate
- Storage used by training data

### Alerts
- **Warning**: If any table exceeds 100K rows
- **Critical**: If cleanup job fails 2 consecutive days
- **Info**: Weekly summary of data growth

## Exception Handling

### Extended Retention
Cases where data may be retained longer than 30 days:
1. **Active Investigation**: Security or quality incident
2. **Legal Hold**: Pending legal matters
3. **High-Value Training**: Exceptionally good examples (flagged manually)

**Process**: Manager must approve extended retention with written justification

## Audit Trail

All cleanup operations logged to `DecisionLog`:
```json
{
  "scope": "data-retention",
  "actor": "automated-cleanup",
  "action": "delete_old_training_data",
  "rationale": "30-day retention policy",
  "metadata": {
    "rows_deleted": 1234,
    "tables": ["agent_approvals", "AgentFeedback", "AgentQuery"],
    "cutoff_date": "2025-09-12"
  }
}
```

## Review Schedule

- **Policy Review**: Quarterly
- **Next Review**: 2025-01-12
- **Owner**: Data Agent
- **Approver**: Manager + Compliance

## Related Documents

- `docs/runbooks/agent_sdk_rollback.md` - Rollback procedures
- `scripts/seed_agent_training_data.sql` - Test data generation
- `scripts/cleanup_agent_training_data.sql` - Cleanup implementation
- `docs/policies/mcp-allowlist.json` - MCP tool permissions

---

**Status**: Active  
**Effective Date**: 2025-10-12  
**Compliance**: GDPR-compliant, SOC 2-ready

