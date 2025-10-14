---
epoch: 2025.10.E1
doc: docs/runbooks/agent_database_backup_automation.md
owner: data
last_reviewed: 2025-10-14
expires: 2025-10-21
---

# Agent Database Backup Automation

## Overview

Automated backup and recovery procedures for Agent SDK database tables ensuring data protection and disaster recovery capability.

## Backup Strategy

**Frequency**: Daily at 3:00 AM UTC (after data retention cleanup)  
**Retention**: 7 days (rolling window)  
**Storage**: Local filesystem (`artifacts/data/backups/`)  
**Compression**: gzip (typically 70-80% size reduction)  
**Verification**: Automated integrity checks

## Backed Up Tables (11)

### Agent SDK Core Tables
1. `AgentFeedback` - Training data and annotations
2. `AgentQuery` - Query logs with performance metrics  
3. `AgentApproval` - Legacy approval queue
4. `agent_approvals` - Enhanced approval queue

### Supporting Tables
5. `agent_sdk_learning_data` - Training feedback loop
6. `agent_sdk_notifications` - Real-time notifications
7. `agent_training_archive` - 90-day archives
8. `agent_retention_cleanup_log` - Cleanup execution log

### Data Quality Tables
9. `data_quality_checks` - Quality check results
10. `data_quality_log` - Quality execution log
11. `data_quality_metrics` - Daily quality scores

## Automated Backup

### Backup Script

**Location**: `scripts/data/backup-agent-tables.sh`  
**Execution**: Automated via cron

**What it does**:
1. Loads Supabase credentials from vault
2. Uses pg_dump to export 11 agent tables
3. Compresses with gzip
4. Verifies backup integrity
5. Cleans up backups older than 7 days
6. Logs execution

**Manual Execution**:
```bash
cd ~/HotDash/hot-dash
./scripts/data/backup-agent-tables.sh
```

**Expected Output**:
```
🔄 Starting backup of Agent SDK tables...
Timestamp: 2025-10-14T18:00:00Z
✅ Backup complete
File: artifacts/data/backups/agent_tables_20251014_180000.sql
Size: 2.4M
✅ Backup compressed
Compressed: artifacts/data/backups/agent_tables_20251014_180000.sql.gz
Size: 456K
✅ Backup verification passed
Remaining backups: 7
```

### Cron Schedule

```sql
-- Daily backup at 3:00 AM UTC (after data cleanup at 2 AM)
SELECT cron.schedule(
  'daily-agent-backup',
  '0 3 * * *',
  $$
  -- Run via shell script (requires pg_cron with shell access)
  -- Alternative: Use pg_dump within cron job
  $$
);
```

**Alternative**: System cron (if pg_cron doesn't support shell scripts)
```bash
# Add to crontab
0 3 * * * cd ~/HotDash/hot-dash && ./scripts/data/backup-agent-tables.sh >> artifacts/data/backups/backup.log 2>&1
```

## Backup Verification

### Verification Script

**Location**: `scripts/data/verify-agent-backup.sh`

**Usage**:
```bash
./scripts/data/verify-agent-backup.sh artifacts/data/backups/agent_tables_20251014_180000.sql.gz
```

**Checks Performed**:
1. ✅ File readability
2. ✅ Gzip integrity (gunzip -t)
3. ✅ SQL content verification (expected tables present)
4. ✅ Backup statistics (sizes, line counts)

**Expected Output**:
```
🔍 Verifying backup: artifacts/data/backups/agent_tables_20251014_180000.sql.gz
✅ File is readable
✅ Gzip integrity valid
✅ Table found: AgentFeedback
✅ Table found: AgentQuery
✅ Table found: agent_approvals

📊 Backup Statistics:
  Compressed: 456K
  Uncompressed: 2.4M
  SQL Lines: 12,450

✅ Backup verification passed
```

## Restore Procedures

### Full Restore

**Script**: `scripts/data/restore-agent-tables.sh`

**Usage**:
```bash
./scripts/data/restore-agent-tables.sh artifacts/data/backups/agent_tables_20251014_180000.sql.gz
```

**What it does**:
1. Verifies backup file exists
2. Decompresses to temporary SQL file
3. Executes SQL against database
4. Verifies restored data (row counts)
5. Cleans up temporary files

**WARNING**: This will overwrite existing table data. Use with caution.

### Point-in-Time Recovery

**For specific table restoration**:
```bash
# Extract specific table from backup
gunzip -c backup.sql.gz | grep -A 10000 "Table: AgentFeedback" > feedback_only.sql

# Restore specific table
psql $DATABASE_URL -f feedback_only.sql
```

### Recovery Testing

**Test restore on local Supabase** (safe):
```bash
# Start local Supabase
supabase start

# Get local DB URL
source .env.local

# Test restore
DATABASE_URL=$DATABASE_URL ./scripts/data/restore-agent-tables.sh <backup_file>

# Verify data
psql $DATABASE_URL -c "SELECT COUNT(*) FROM \"AgentFeedback\";"
```

## Monitoring

### Backup Health Checks

**Daily verification query**:
```sql
-- Check if backup ran successfully
SELECT
  date_trunc('day', checked_at) as backup_date,
  check_result,
  rows_checked as tables_backed_up
FROM data_quality_log
WHERE check_name = 'agent_tables_backup'
ORDER BY checked_at DESC
LIMIT 7;
```

**Alert if**:
- No backup in last 24 hours
- Backup verification failed
- Backup file size < 100KB (suspiciously small)
- Backup file size > 100MB (suspiciously large)

### Backup Retention Compliance

```bash
# Check backup count (should be ~7)
ls -1 ~/HotDash/hot-dash/artifacts/data/backups/agent_tables_*.sql.gz | wc -l

# Check oldest backup (should be ~7 days old)
ls -lt ~/HotDash/hot-dash/artifacts/data/backups/agent_tables_*.sql.gz | tail -1
```

## Recovery Procedures

### Scenario 1: Accidental Data Deletion

**Steps**:
1. Identify most recent backup before deletion
2. Stop all agent processes (prevent new writes)
3. Restore from backup
4. Verify data integrity
5. Resume agent processes
6. Document incident in feedback/data.md

### Scenario 2: Data Corruption

**Steps**:
1. Identify corruption scope (which tables)
2. Find last known good backup
3. Restore affected tables only
4. Verify restored data quality
5. Run data quality checks
6. Document recovery in incident log

### Scenario 3: Full Database Loss

**Steps**:
1. Provision new Supabase instance (if needed)
2. Run all migrations (supabase db reset)
3. Restore from most recent backup
4. Verify all tables and row counts
5. Run comprehensive data quality checks
6. Resume operations
7. Post-mortem documentation

## Testing

### Test Backup Process

```bash
# Run backup
./scripts/data/backup-agent-tables.sh

# Verify backup
./scripts/data/verify-agent-backup.sh artifacts/data/backups/agent_tables_*.sql.gz

# Check backup size
ls -lh artifacts/data/backups/ | tail -1
```

**Expected**: Backup completes in < 30s, compressed file 400-600KB

### Test Restore Process

**On Local Supabase** (safe):
```bash
# Start local instance
supabase start

# Create test backup
DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:54322/postgres" \
  ./scripts/data/backup-agent-tables.sh

# Modify some data (simulate loss)
psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" \
  -c "DELETE FROM \"AgentFeedback\" WHERE id = '...'"

# Restore from backup
DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:54322/postgres" \
  ./scripts/data/restore-agent-tables.sh <backup_file>

# Verify restoration
psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" \
  -c "SELECT COUNT(*) FROM \"AgentFeedback\";"
```

## Automation Setup

### Cron Configuration

**System Cron** (recommended):
```bash
# Edit crontab
crontab -e

# Add daily backup at 3 AM
0 3 * * * cd ~/HotDash/hot-dash && ./scripts/data/backup-agent-tables.sh >> artifacts/data/backups/backup.log 2>&1
```

**pg_cron** (alternative):
```sql
SELECT cron.schedule(
  'daily-agent-backup',
  '0 3 * * *',
  'SELECT backup_agent_tables();'  -- Would need SQL-based backup function
);
```

## Security

### Access Control

**Backup Files**:
- Permissions: 600 (owner read/write only)
- Location: Not in git (artifacts/ is gitignored)
- Contains: Full table data including PII

**Credentials**:
- Loaded from vault (never hardcoded)
- Not logged to console
- Secure transmission to pg_dump

### Encryption

**At Rest**: Supabase encrypts database at rest  
**In Transit**: SSL/TLS for pg_dump connection  
**Backup Files**: Consider encrypting with gpg for sensitive data

**Optional GPG encryption**:
```bash
# Encrypt backup
gpg --symmetric --cipher-algo AES256 backup.sql.gz

# Decrypt for restore
gpg --decrypt backup.sql.gz.gpg > backup.sql.gz
```

## Disaster Recovery

### RTO/RPO Targets

**Recovery Time Objective (RTO)**: < 1 hour  
**Recovery Point Objective (RPO)**: < 24 hours (daily backups)

### Recovery Checklist

- [ ] Identify backup to restore from
- [ ] Verify backup integrity
- [ ] Stop active agent processes
- [ ] Restore database from backup
- [ ] Verify data integrity (row counts, key records)
- [ ] Run data quality checks
- [ ] Resume agent processes
- [ ] Monitor for 24 hours
- [ ] Document incident and lessons learned

## Troubleshooting

### Backup Fails

**Symptoms**: Backup script exits with error

**Common Causes**:
1. Database credentials invalid
2. Insufficient disk space
3. pg_dump not installed
4. Network connectivity issues

**Solutions**:
```bash
# Check credentials
source ~/HotDash/hot-dash/vault/occ/supabase/database_url_staging.env
psql $DATABASE_URL -c "SELECT version();"

# Check disk space
df -h ~/HotDash/hot-dash/artifacts/data/backups/

# Check pg_dump
which pg_dump
pg_dump --version
```

### Restore Fails

**Symptoms**: Restore script fails or data missing after restore

**Diagnosis**:
```bash
# Verify backup file
./scripts/data/verify-agent-backup.sh <backup_file>

# Check SQL syntax
gunzip -c <backup_file> | head -100

# Test on local first
DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:54322/postgres" \
  ./scripts/data/restore-agent-tables.sh <backup_file>
```

## Best Practices

1. **Test Restores Monthly**: Verify backups are restorable
2. **Monitor Backup Size**: Sudden changes indicate issues
3. **Secure Backup Files**: 600 permissions, encrypt if needed
4. **Document Incidents**: Log all backup/restore operations
5. **Offsite Backups**: Consider S3/Supabase Storage for production

## Quick Reference

**Backup**:
```bash
./scripts/data/backup-agent-tables.sh
```

**Verify**:
```bash
./scripts/data/verify-agent-backup.sh <backup_file>
```

**Restore**:
```bash
./scripts/data/restore-agent-tables.sh <backup_file>
```

**List Backups**:
```bash
ls -lh ~/HotDash/hot-dash/artifacts/data/backups/
```

---

**Contact**: data agent  
**Last Updated**: 2025-10-14  
**Next Review**: 2025-10-21
