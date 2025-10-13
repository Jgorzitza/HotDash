---
title: Agent Data Retention Automation Runbook
created: 2025-10-12
owner: data
reviewed_by: compliance
status: active
---

# Agent Data Retention Automation

## Overview

Automated cleanup system for Agent SDK training data implementing 30-day retention policy with backup and audit logging.

## Automated Function

### Function: `cleanup_agent_training_data()`

**Purpose**: Automatically archive and delete old training data  
**Schedule**: Recommended daily at 2:00 AM UTC  
**Retention**: 30 days for training data, 7 days for resolved approvals

**Signature**:
```sql
cleanup_agent_training_data(
  retention_days INTEGER DEFAULT 30,
  archive_before_delete BOOLEAN DEFAULT TRUE
)
```

**Returns**: Table with cleanup results per table

**Parameters**:
- `retention_days`: Days to retain data (default: 30)
- `archive_before_delete`: Whether to backup before deletion (default: TRUE)

### Usage Examples

**1. Run with defaults (30 days, with backup)**:
```sql
SELECT * FROM cleanup_agent_training_data();
```

**2. Custom retention period (60 days)**:
```sql
SELECT * FROM cleanup_agent_training_data(60, true);
```

**3. Emergency cleanup without backup** (NOT RECOMMENDED):
```sql
SELECT * FROM cleanup_agent_training_data(30, false);
```

## Scheduling Options

### Option 1: Supabase pg_cron (Recommended)

```sql
-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule daily cleanup at 2:00 AM UTC
SELECT cron.schedule(
  'agent-training-retention',
  '0 2 * * *',  -- Daily at 2:00 AM UTC
  $$SELECT cleanup_agent_training_data(30, true)$$
);

-- Verify schedule
SELECT * FROM cron.job WHERE jobname = 'agent-training-retention';

-- View job run history
SELECT * FROM cron.job_run_details 
WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'agent-training-retention')
ORDER BY start_time DESC LIMIT 10;
```

### Option 2: External Cron Job

```bash
# Add to crontab
0 2 * * * cd /home/justin/HotDash/hot-dash && mcp_supabase_apply_migration(name: "cleanup_agent_training_data") >> /var/log/agent-retention.log 2>&1
```

### Option 3: Supabase Edge Function

```typescript
// supabase/functions/cleanup-agent-data/index.ts
import { createClient } from '@supabase/supabase-js'

Deno.serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )
  
  const { data, error } = await supabase.rpc('cleanup_agent_training_data', {
    retention_days: 30,
    archive_before_delete: true
  })
  
  if (error) {
    return new Response(JSON.stringify({ error }), { status: 500 })
  }
  
  return new Response(JSON.stringify({ success: true, results: data }), { status: 200 })
})
```

## Archive Tables

### agent_training_archive

Stores backed-up data before deletion:

**Columns**:
- `id`: Unique identifier
- `original_table`: Source table name
- `original_id`: Original record ID
- `data`: Full record as JSON
- `archived_at`: When archived
- `archive_reason`: Why archived
- `retention_days`: How long to keep archive (default: 90 days)

**Retention**: Archives kept for 90 days, then deleted

### agent_retention_cleanup_log

Audit trail of all cleanup operations:

**Columns**:
- `cleanup_date`: When cleanup ran
- `table_name`: Table cleaned
- `rows_archived`: Number of rows backed up
- `rows_deleted`: Number of rows removed
- `oldest_date_deleted`: Cutoff date used
- `cleanup_type`: 'scheduled', 'manual', 'emergency'
- `execution_status`: 'success', 'partial', 'failed'
- `error_message`: Error details if failed
- `execution_time_ms`: Performance metric

## Monitoring

### Check Cleanup Status

```sql
-- Recent cleanup runs
SELECT * FROM agent_retention_cleanup_log 
ORDER BY cleanup_date DESC 
LIMIT 10;

-- Total archived data by table
SELECT 
  original_table,
  COUNT(*) as archived_records,
  MIN(archived_at) as oldest_archive,
  MAX(archived_at) as newest_archive
FROM agent_training_archive
GROUP BY original_table;

-- Current data age distribution
SELECT 
  'AgentQuery' as table_name,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE "createdAt" > NOW() - INTERVAL '7 days') as last_7_days,
  COUNT(*) FILTER (WHERE "createdAt" > NOW() - INTERVAL '30 days') as last_30_days
FROM "AgentQuery"
UNION ALL
SELECT 
  'AgentFeedback',
  COUNT(*),
  COUNT(*) FILTER (WHERE "createdAt" > NOW() - INTERVAL '7 days'),
  COUNT(*) FILTER (WHERE "createdAt" > NOW() - INTERVAL '30 days')
FROM "AgentFeedback"
UNION ALL
SELECT 
  'agent_approvals',
  COUNT(*),
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '7 days'),
  COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '30 days')
FROM agent_approvals;
```

### Alerts

Set up monitoring for:
- **Cleanup failures**: Alert if cleanup_agent_training_data fails
- **Archive growth**: Alert if agent_training_archive > 100K rows
- **Old data**: Alert if any table has data > 60 days old

## Manual Operations

### Restore from Archive

```sql
-- Find archived record
SELECT * FROM agent_training_archive 
WHERE original_table = 'AgentQuery' 
AND data->>'query' LIKE '%AN fitting%';

-- Restore specific record
INSERT INTO "AgentQuery" 
SELECT (data->>'id')::TEXT, ... -- Map all fields from JSONB
FROM agent_training_archive
WHERE id = 'archive-record-uuid';
```

### Emergency Cleanup

If immediate space needed:

```sql
-- 1. Backup everything first
SELECT COUNT(*) FROM cleanup_agent_training_data(0, true);

-- 2. Clean archives older than 90 days
DELETE FROM agent_training_archive 
WHERE archived_at < NOW() - INTERVAL '90 days';

-- 3. Verify
SELECT * FROM agent_retention_cleanup_log 
ORDER BY cleanup_date DESC LIMIT 5;
```

## Testing Procedures

### Test Cleanup Function

```sql
-- 1. Insert test data with old dates
INSERT INTO "AgentQuery" (query, agent, "createdAt", "shopDomain")
VALUES ('TEST OLD QUERY', 'test-agent', NOW() - INTERVAL '31 days', 'test.myshopify.com');

-- 2. Run cleanup
SELECT * FROM cleanup_agent_training_data(30, true);

-- 3. Verify deletion
SELECT * FROM "AgentQuery" WHERE query = 'TEST OLD QUERY';
-- Should return 0 rows

-- 4. Verify archive
SELECT * FROM agent_training_archive WHERE original_table = 'AgentQuery' 
ORDER BY archived_at DESC LIMIT 5;
-- Should show the test record
```

## Rollback

### Disable Scheduled Cleanup

```sql
-- If using pg_cron
SELECT cron.unschedule('agent-training-retention');

-- Verify
SELECT * FROM cron.job WHERE jobname = 'agent-training-retention';
-- Should return 0 rows
```

### Drop Function and Tables

```sql
DROP FUNCTION IF EXISTS cleanup_agent_training_data(INTEGER, BOOLEAN);
DROP TABLE IF EXISTS agent_retention_cleanup_log CASCADE;
DROP TABLE IF NOT EXISTS agent_training_archive CASCADE;
```

## Compliance

### GDPR Right to Erasure

To delete all data for a specific customer:

```sql
-- Delete from current tables
DELETE FROM agent_approvals WHERE customer_email = 'customer@email.com';
DELETE FROM "AgentFeedback" WHERE "conversationId" IN (
  SELECT chatwoot_conversation_id FROM agent_approvals 
  WHERE customer_email = 'customer@email.com'
);

-- Delete from archives
DELETE FROM agent_training_archive 
WHERE data->>'customer_email' = 'customer@email.com';
```

## Performance

**Expected execution time**: 
- < 1 second for tables with < 1000 old records
- < 5 seconds for tables with < 10K old records
- < 30 seconds for tables with < 100K old records

**Storage saved**: ~1-5MB per day depending on approval volume

## Related Documents

- `docs/policies/agent_training_data_retention.md` - Retention policy
- `scripts/cleanup_agent_training_data.sql` - Manual cleanup script
- `scripts/seed_agent_training_data.sql` - Test data generation

---

**Status**: Active  
**Last Updated**: 2025-10-12  
**Next Review**: 2025-11-12

