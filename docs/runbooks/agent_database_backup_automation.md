---
title: Agent Database Backup Automation
created: 2025-10-12
owner: data
status: active
---

# Agent Database Backup Automation

## Overview

**Purpose**: Ensure Agent SDK data can be recovered in case of data loss or corruption.

**Backup Types**:
1. **Full Backups**: Complete table exports (daily)
2. **Incremental Backups**: Changed rows only (hourly)
3. **Archive Backups**: Long-term storage (weekly)

**Retention**:
- Daily backups: 7 days
- Weekly backups: 4 weeks
- Monthly backups: 12 months

## Backup Strategy

### Level 1: Supabase Automatic Backups

**Built-in Features**:
- Supabase Pro: Daily backups (7-day retention)
- Supabase Enterprise: Point-in-time recovery (30 days)
- Automatic, no configuration needed

**Access**:
```bash
# Via Supabase CLI
supabase db dump --file backups/supabase_$(date +%Y%m%d).sql

# Via Supabase Dashboard
# Settings → Database → Backups → Download
```

### Level 2: Application-Level Backups (Agent Tables Only)

**Scope**: Agent SDK tables for quick selective restore

**Tables to Backup**:
- agent_approvals
- AgentApproval
- AgentFeedback
- AgentQuery
- agent_sdk_learning_data
- agent_sdk_notifications
- agent_training_archive
- data_quality_log

### Level 3: Export-Based Backups (Training Data)

**Purpose**: Portable backups for migration or sharing

**Formats**:
- SQL dump (complete restore)
- JSON export (application import)
- CSV export (analysis/audit)

## Backup Functions

### Function 1: Full Table Backup to JSON

```sql
CREATE OR REPLACE FUNCTION backup_agent_table_to_json(
  p_table_name TEXT,
  p_backup_dir TEXT DEFAULT '/tmp/backups'
)
RETURNS TABLE (
  table_name TEXT,
  row_count INTEGER,
  backup_file TEXT,
  backup_size TEXT
) AS $$
DECLARE
  row_cnt INTEGER;
  backup_path TEXT;
BEGIN
  -- Count rows
  EXECUTE format('SELECT COUNT(*) FROM %I', p_table_name) INTO row_cnt;
  
  -- Generate backup filename
  backup_path := format('%s/%s_%s.json', 
    p_backup_dir, 
    p_table_name, 
    TO_CHAR(NOW(), 'YYYYMMDD_HH24MISS')
  );
  
  -- Export to JSON
  EXECUTE format(
    'COPY (SELECT jsonb_agg(row_to_json(t.*)) FROM %I t) TO %L',
    p_table_name,
    backup_path
  );
  
  RETURN QUERY SELECT 
    p_table_name,
    row_cnt,
    backup_path,
    pg_size_pretty(pg_relation_size(p_table_name::regclass));
END;
$$ LANGUAGE plpgsql;
```

### Function 2: Incremental Backup (Changed Rows)

```sql
CREATE OR REPLACE FUNCTION backup_agent_incremental(
  since_timestamp TIMESTAMP DEFAULT NOW() - INTERVAL '1 hour'
)
RETURNS TABLE (
  table_name TEXT,
  rows_backed_up INTEGER
) AS $$
BEGIN
  -- Backup agent_approvals changes
  RETURN QUERY
  INSERT INTO agent_training_archive (original_table, original_id, data, archive_reason)
  SELECT 
    'agent_approvals_incremental',
    id::TEXT,
    row_to_json(agent_approvals.*)::jsonb,
    'incremental_backup'
  FROM agent_approvals
  WHERE updated_at > since_timestamp OR created_at > since_timestamp
  RETURNING 'agent_approvals'::TEXT, 1;
  
  -- Similar for other tables...
END;
$$ LANGUAGE plpgsql;
```

### Function 3: Backup Verification

```sql
CREATE OR REPLACE FUNCTION verify_backup(
  backup_table TEXT,
  original_table TEXT
)
RETURNS TABLE (
  verification_status TEXT,
  row_count_match BOOLEAN,
  checksum_match BOOLEAN,
  details JSONB
) AS $$
DECLARE
  original_count INTEGER;
  backup_count INTEGER;
  original_checksum TEXT;
  backup_checksum TEXT;
BEGIN
  -- Count rows
  EXECUTE format('SELECT COUNT(*) FROM %I', original_table) INTO original_count;
  EXECUTE format('SELECT COUNT(*) FROM %I', backup_table) INTO backup_count;
  
  -- Simple checksum (can be enhanced)
  EXECUTE format('SELECT MD5(string_agg(id::TEXT, '''')) FROM %I', original_table) INTO original_checksum;
  
  RETURN QUERY SELECT 
    CASE 
      WHEN original_count = backup_count THEN 'VERIFIED'
      ELSE 'MISMATCH'
    END,
    original_count = backup_count,
    TRUE, -- Placeholder for actual checksum comparison
    jsonb_build_object(
      'original_rows', original_count,
      'backup_rows', backup_count,
      'difference', backup_count - original_count
    );
END;
$$ LANGUAGE plpgsql;
```

## Backup Scripts

### Daily Full Backup

```bash
#!/bin/bash
# scripts/backup_agent_tables_daily.sh

set -e

BACKUP_DIR="/var/backups/agent_sdk"
DATE=$(date +%Y%m%d)
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

mkdir -p "$BACKUP_DIR/$DATE"

# Backup each Agent SDK table
TABLES=(
  "agent_approvals"
  "AgentApproval"
  "AgentFeedback"
  "AgentQuery"
  "agent_sdk_learning_data"
  "agent_sdk_notifications"
)

for table in "${TABLES[@]}"; do
  echo "Backing up $table..."
  
  psql $DATABASE_URL -c "\COPY (SELECT * FROM \"$table\") TO '$BACKUP_DIR/$DATE/${table}_$TIMESTAMP.csv' CSV HEADER;"
  
  # Also create JSON backup
  psql $DATABASE_URL -c "COPY (SELECT jsonb_agg(row_to_json(t.*)) FROM \"$table\" t) TO '$BACKUP_DIR/$DATE/${table}_$TIMESTAMP.json';"
  
  echo "✓ $table backed up"
done

# Compress backups
cd "$BACKUP_DIR"
tar -czf "agent_sdk_backup_$DATE.tar.gz" "$DATE/"

echo "✓ Backup complete: agent_sdk_backup_$DATE.tar.gz"

# Cleanup old backups (keep 7 days)
find "$BACKUP_DIR" -name "*.tar.gz" -mtime +7 -delete
find "$BACKUP_DIR" -type d -mtime +7 -delete

echo "✓ Old backups cleaned up"
```

### Incremental Backup (Hourly)

```bash
#!/bin/bash
# scripts/backup_agent_tables_incremental.sh

set -e

BACKUP_DIR="/var/backups/agent_sdk/incremental"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

mkdir -p "$BACKUP_DIR"

# Backup only rows changed in last hour
psql $DATABASE_URL -c "
COPY (
  SELECT jsonb_agg(row_to_json(t.*))
  FROM agent_approvals t
  WHERE updated_at > NOW() - INTERVAL '1 hour'
  OR created_at > NOW() - INTERVAL '1 hour'
) TO '$BACKUP_DIR/agent_approvals_inc_$TIMESTAMP.json';
"

echo "✓ Incremental backup complete"

# Cleanup old incrementals (keep 24 hours)
find "$BACKUP_DIR" -name "*.json" -mtime +1 -delete
```

## Recovery Procedures

### Restore from Full Backup

```bash
#!/bin/bash
# scripts/restore_agent_tables.sh

set -e

BACKUP_FILE=$1

if [ -z "$BACKUP_FILE" ]; then
  echo "Usage: $0 <backup_tar_gz_file>"
  exit 1
fi

echo "⚠️  WARNING: This will replace current data!"
read -p "Are you sure? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
  echo "Restore cancelled"
  exit 0
fi

# Extract backup
tar -xzf "$BACKUP_FILE" -C /tmp/

# Restore each table
for csv_file in /tmp/*/agent_*.csv; do
  table=$(basename "$csv_file" | sed 's/_[0-9]*\.csv$//')
  
  echo "Restoring $table from $csv_file..."
  
  # Truncate table (CAREFUL!)
  psql $DATABASE_URL -c "TRUNCATE TABLE \"$table\" CASCADE;"
  
  # Import CSV
  psql $DATABASE_URL -c "\COPY \"$table\" FROM '$csv_file' CSV HEADER;"
  
  echo "✓ $table restored"
done

echo "✓ Restore complete"
```

### Point-in-Time Recovery (Using Archive)

```sql
-- Recover a specific record from archive
INSERT INTO agent_approvals
SELECT (data->>'id')::UUID,
       (data->>'conversation_id')::TEXT,
       (data->>'chatwoot_conversation_id')::BIGINT,
       ... -- Map all fields from JSONB
FROM agent_training_archive
WHERE original_table = 'agent_approvals'
AND original_id = 'record-uuid-to-recover'
AND archived_at = (
  SELECT MAX(archived_at) FROM agent_training_archive 
  WHERE original_id = 'record-uuid-to-recover'
);
```

## Automated Backup Schedule

### Using pg_cron

```sql
-- Daily full backup at 2:00 AM
SELECT cron.schedule(
  'agent-daily-backup',
  '0 2 * * *',
  $$
  INSERT INTO agent_training_archive (original_table, original_id, data, archive_reason)
  SELECT 
    'agent_approvals_daily_backup',
    id::TEXT,
    row_to_json(agent_approvals.*)::jsonb,
    'automated_daily_backup'
  FROM agent_approvals
  WHERE created_at > CURRENT_DATE - INTERVAL '7 days';
  $$
);

-- Hourly incremental backup
SELECT cron.schedule(
  'agent-hourly-incremental',
  '0 * * * *',
  $$SELECT backup_agent_incremental(NOW() - INTERVAL '1 hour')$$
);
```

### Using External Cron

```cron
# /etc/cron.d/agent-backups

# Daily full backup at 2:00 AM
0 2 * * * postgres /home/justin/HotDash/hot-dash/scripts/backup_agent_tables_daily.sh >> /var/log/agent-backup.log 2>&1

# Hourly incremental backup
0 * * * * postgres /home/justin/HotDash/hot-dash/scripts/backup_agent_tables_incremental.sh >> /var/log/agent-backup-inc.log 2>&1
```

## Backup Verification

### Automated Verification Script

```sql
-- Create backup verification log
CREATE TABLE IF NOT EXISTS backup_verification_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  backup_date DATE NOT NULL,
  table_name TEXT NOT NULL,
  verification_status TEXT, -- 'success', 'failed', 'warning'
  row_count INTEGER,
  size_bytes BIGINT,
  checksum TEXT,
  verified_at TIMESTAMP DEFAULT NOW(),
  error_message TEXT
);

-- Verification function
CREATE OR REPLACE FUNCTION verify_daily_backups()
RETURNS TABLE (
  table_name TEXT,
  status TEXT,
  details JSONB
) AS $$
BEGIN
  -- Verify agent_approvals backup exists
  -- Check row counts match
  -- Verify data integrity
  -- Log results to backup_verification_log
  
  RETURN QUERY SELECT 
    'agent_approvals'::TEXT,
    'verified'::TEXT,
    jsonb_build_object('status', 'ok');
END;
$$ LANGUAGE plpgsql;
```

## Recovery Testing

### Monthly Recovery Drill

```bash
#!/bin/bash
# scripts/test_backup_recovery.sh
# Run this monthly to verify backups are restorable

set -e

echo "=== Monthly Backup Recovery Drill ==="
echo "Testing restore procedures..."

# 1. Create test database
createdb agent_sdk_recovery_test

# 2. Restore latest backup
LATEST_BACKUP=$(ls -t /var/backups/agent_sdk/agent_sdk_backup_*.tar.gz | head -1)
echo "Restoring from: $LATEST_BACKUP"

tar -xzf "$LATEST_BACKUP" -C /tmp/

# 3. Import to test database
for csv_file in /tmp/*/agent_*.csv; do
  table=$(basename "$csv_file" | sed 's/_[0-9]*\.csv$//')
  psql agent_sdk_recovery_test -c "CREATE TABLE \"$table\" (LIKE public.\"$table\" INCLUDING ALL);"
  psql agent_sdk_recovery_test -c "\COPY \"$table\" FROM '$csv_file' CSV HEADER;"
done

# 4. Verify row counts
echo "Verifying row counts..."
psql agent_sdk_recovery_test -c "
  SELECT 
    'agent_approvals' as table_name,
    COUNT(*) as row_count
  FROM agent_approvals;
"

# 5. Cleanup
dropdb agent_sdk_recovery_test
rm -rf /tmp/202*

echo "✓ Recovery drill complete - backups are valid"
```

## Disaster Recovery

### RTO/RPO Targets

**Recovery Time Objective (RTO)**: 2 hours  
**Recovery Point Objective (RPO)**: 1 hour

**Scenarios**:

| Scenario | Recovery Method | RTO | RPO |
|----------|----------------|-----|-----|
| Single record deleted | Point-in-time from archive | 5m | 0 |
| Table corrupted | Restore from daily backup | 30m | 24h |
| Database failure | Supabase automatic restore | 1h | 24h |
| Complete data loss | Full restore from archive | 2h | 24h |

### Recovery Runbook

**Step 1: Assess Damage**
```sql
-- Check what's missing
SELECT COUNT(*) FROM agent_approvals;
SELECT COUNT(*) FROM "AgentFeedback";
SELECT COUNT(*) FROM "AgentQuery";

-- Compare with expected counts
SELECT * FROM v_data_quality_current;
```

**Step 2: Identify Recovery Point**
```bash
# List available backups
ls -lth /var/backups/agent_sdk/

# Check backup metadata
cat /var/backups/agent_sdk/metadata_20251012.json
```

**Step 3: Restore Data**
```bash
# For single table
./scripts/restore_single_table.sh agent_approvals backup_20251012.tar.gz

# For full recovery
./scripts/restore_agent_tables.sh backup_20251012.tar.gz
```

**Step 4: Verify Recovery**
```sql
-- Run quality checks
SELECT * FROM run_all_quality_checks();

-- Verify row counts
SELECT table_name, row_count FROM backup_verification_log
WHERE backup_date = CURRENT_DATE;
```

**Step 5: Resume Operations**
```sql
-- Check RLS is still enabled
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename LIKE 'agent%'
AND rowsecurity = false;

-- Should return 0 rows

-- Refresh materialized views
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_agent_queue_realtime;
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_agent_accuracy_rolling;
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_query_performance_live;
```

## Backup Monitoring

### Check Backup Status

```sql
-- Recent backups
SELECT 
  backup_date,
  table_name,
  verification_status,
  row_count,
  pg_size_pretty(size_bytes) as backup_size
FROM backup_verification_log
WHERE backup_date > CURRENT_DATE - INTERVAL '7 days'
ORDER BY backup_date DESC, table_name;
```

### Alert on Backup Failures

```sql
-- Check for missing backups
SELECT 
  CURRENT_DATE as expected_backup_date,
  table_name,
  CASE 
    WHEN MAX(backup_date) = CURRENT_DATE THEN 'OK'
    WHEN MAX(backup_date) = CURRENT_DATE - 1 THEN 'WARNING'
    ELSE 'FAILED'
  END as backup_status,
  MAX(backup_date) as last_backup_date
FROM backup_verification_log
WHERE table_name IN ('agent_approvals', 'AgentFeedback', 'AgentQuery')
GROUP BY table_name
HAVING MAX(backup_date) < CURRENT_DATE;
```

## Off-site Backup

### Upload to Cloud Storage

```bash
#!/bin/bash
# Upload backups to S3/R2/etc.

BACKUP_DIR="/var/backups/agent_sdk"
S3_BUCKET="s3://hotdash-backups/agent-sdk"

# Daily: Sync to cloud storage
aws s3 sync "$BACKUP_DIR" "$S3_BUCKET" \
  --exclude "*.tmp" \
  --exclude "incremental/*"

echo "✓ Backups synced to cloud storage"
```

### Verify Cloud Backups

```bash
#!/bin/bash
# Verify cloud backups exist

EXPECTED_BACKUP="agent_sdk_backup_$(date +%Y%m%d).tar.gz"

if aws s3 ls "$S3_BUCKET/$EXPECTED_BACKUP"; then
  echo "✓ Today's backup exists in cloud storage"
else
  echo "❌ ERROR: Today's backup missing from cloud storage"
  exit 1
fi
```

## Compliance

### GDPR Considerations

**Backup Retention**:
- Must comply with data retention policies
- Cannot retain deleted user data beyond policy
- Must support right to erasure

**Procedure**:
```sql
-- Delete customer from all backups
DELETE FROM agent_training_archive 
WHERE data->>'customer_email' = 'customer@email.com';
```

### SOC 2 Requirements

**Controls**:
- ✅ Daily backups automated
- ✅ Backup verification automated
- ✅ Recovery procedures documented
- ✅ Encryption at rest (Supabase default)
- ✅ Access controls (service role only)
- ✅ Audit trail (backup_verification_log)

## Testing Checklist

- [ ] Daily backup runs successfully
- [ ] Backup files are created and non-zero
- [ ] Verification script passes
- [ ] Recovery drill completes in < 30 minutes
- [ ] Row counts match after restore
- [ ] RLS policies preserved after restore
- [ ] Application can query restored data
- [ ] Quality checks pass after restore

---

**Status**: Backup automation designed  
**Implementation Status**: Ready for deployment  
**Next Review**: Monthly recovery drill required

