# Database Recovery Runbook

**Created**: 2025-10-21  
**Agent**: Data  
**Task**: DATA-009  
**Version**: 1.0

---

## Overview

### Purpose

Step-by-step procedures for backing up and recovering the HotDash Supabase database.

### Key Metrics

- **RTO (Recovery Time Objective)**: 30 minutes
- **RPO (Recovery Point Objective)**: <1 minute

### Backup Types

| Type                | Frequency       | Retention  | Speed    | Use Case        |
| ------------------- | --------------- | ---------- | -------- | --------------- |
| **PITR (WAL)**      | Continuous      | 7 days     | 15-20min | Recent recovery |
| **Daily Snapshots** | Daily 00:00 UTC | 30 days    | 15-20min | Daily restore   |
| **Manual**          | On-demand       | Indefinite | 30-45min | Pre-migration   |

---

## Quick Recovery Guide

### Decision Tree

**Data loss detected** →

- Recent (<7 days)? → **Use PITR** (Option 1 - fastest)
- Older (<30 days)? → **Use Daily Snapshot** (Option 2)
- Specific tables? → **Selective Restore** (Option 3)
- Need schema? → **Logical Restore** (Option 4)

---

## Option 1: Point-in-Time Recovery (PITR)

**Use Case**: Restore to specific timestamp (last 7 days)

**Time**: 15-20 minutes

**Prerequisites**:

- Supabase Management API access token
- Specific recovery timestamp

**Steps**:

1. **Convert timestamp to Unix**:

```bash
date -u -d "2025-10-21 08:00:00" +%s
# Output: 1735689600
```

2. **Initiate PITR**:

```bash
curl -X POST "https://api.supabase.com/v1/projects/$PROJECT_REF/database/backups/restore-pitr" \
  -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"recovery_time_target_unix": "1735689600"}'
```

3. **Monitor progress** (check every 30 seconds):

```bash
curl -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
  "https://api.supabase.com/v1/projects/$PROJECT_REF/database/backups"
```

4. **Verify restore**:

```sql
-- Check table counts
SELECT tablename, n_live_tup FROM pg_stat_user_tables ORDER BY n_live_tup DESC;

-- Check latest timestamps
SELECT MAX(created_at) FROM decision_log;
SELECT MAX(created_at) FROM notifications;
```

5. **Test RLS**:

```sql
SET LOCAL ROLE authenticated;
SELECT COUNT(*) FROM notifications;  -- Should work
```

---

## Option 2: Daily Snapshot Restore

**Use Case**: Restore from daily backup (up to 30 days)

**Time**: 15-20 minutes

**Steps via Dashboard**:

1. Login: https://supabase.com/dashboard
2. Select project
3. Navigate: Database → Backups
4. Select backup from list
5. Click: **Restore** button
6. Confirm: Data overwrite warning
7. Wait: ~15-20 minutes
8. Verify: Same as PITR Option 1

---

## Option 3: Selective Table Restore

**Use Case**: Restore specific corrupted tables

**Time**: 10-15 minutes

**Prerequisites**: pg_dump backup of table

**Steps**:

```bash
# 1. Backup current state
pg_dump "$DATABASE_URL" --table="public.corrupted_table" > pre-recovery-backup.sql

# 2. Drop corrupted table (CAUTION!)
psql "$DATABASE_URL" -c "DROP TABLE IF EXISTS public.corrupted_table CASCADE;"

# 3. Restore from backup
psql "$DATABASE_URL" < table-backup.sql

# 4. Rebuild indexes
psql "$DATABASE_URL" -c "REINDEX TABLE public.corrupted_table;"

# 5. Update statistics
psql "$DATABASE_URL" -c "ANALYZE public.corrupted_table;"
```

---

## Option 4: Full Logical Restore

**Use Case**: Restore from pg_dump backup

**Time**: 30-45 minutes

**Steps**:

```bash
# 1. Extract backup (if compressed)
gunzip backup.sql.gz

# 2. Restore
psql "$DATABASE_URL" < backup.sql

# 3. Verify
psql "$DATABASE_URL" -c "SELECT COUNT(*) FROM pg_tables WHERE schemaname='public';"
```

---

## Manual Backup Procedures

### Via Dashboard (Recommended)

1. Dashboard → Database → Backups
2. Click: **Create Backup**
3. Name: `manual-backup-YYYY-MM-DD-HH-MM`
4. Wait: ~2-5 minutes
5. Verify: Status = "Completed"

### Via pg_dump

```bash
# Full backup
pg_dump "$DATABASE_URL" --no-owner --no-privileges --clean > backup.sql
gzip backup.sql

# Schema only
pg_dump "$DATABASE_URL" --schema-only > schema-backup.sql

# Specific tables
pg_dump "$DATABASE_URL" \
  --table="public.decision_log" \
  --table="public.notifications" \
  --data-only > critical-tables.sql
```

---

## Testing Procedures

### Quarterly PITR Test (Staging)

**Frequency**: Every 3 months

**Steps**:

1. Insert test record with timestamp
2. Wait 5 minutes (WAL archive)
3. Delete test record
4. Perform PITR to restore point
5. Verify test record restored
6. Document: Recovery time, success/failure

**Expected Results**:

- Test record restored ✅
- All other data intact ✅
- RLS policies functional ✅
- Recovery time: <20 minutes ✅

---

## Troubleshooting

### Issue 1: "No base backup found"

**Resolution**: Use daily snapshot instead of PITR

### Issue 2: Restored data is old

**Resolution**: Check WAL lag, accept data loss if lag was high

### Issue 3: RLS not working

**Resolution**:

```sql
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
```

### Issue 4: Indexes missing

**Resolution**:

```sql
REINDEX SCHEMA public;
ANALYZE;
```

### Issue 5: Connection pool exhausted

**Resolution**:

```sql
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE state = 'idle' AND pid <> pg_backend_pid();
```

---

## Command Reference

**List backups**:

```bash
curl -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
  "https://api.supabase.com/v1/projects/$PROJECT_REF/database/backups"
```

**PITR restore**:

```bash
curl -X POST ".../database/backups/restore-pitr" \
  -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
  -d '{"recovery_time_target_unix": "1735689600"}'
```

**Manual backup**:

```bash
pg_dump "$DATABASE_URL" --no-owner --no-privileges > backup.sql
```

**Check table counts**:

```sql
SELECT tablename, n_live_tup FROM pg_stat_user_tables ORDER BY n_live_tup DESC;
```

---

## Recovery Timeline

| Phase        | Time      | Activities                             |
| ------------ | --------- | -------------------------------------- |
| Detection    | 0-5min    | Alert, confirm incident                |
| Assessment   | 5-10min   | Identify recovery point, get approvals |
| Initiation   | 10-12min  | Start recovery process                 |
| Recovery     | 12-27min  | Database restore                       |
| Verification | 27-30min  | Verify data, test functionality        |
| **Total**    | **30min** | **RTO target**                         |

---

## Compliance

- **Encryption**: AES-256 at rest ✅
- **Access Logs**: Supabase audit logs ✅
- **Retention**: 30 days (backups), 365 days (data)
- **GDPR**: Right to erasure documented ✅

---

## Escalation

1. **Data Agent** → Attempts recovery
2. **Manager** → Approves, coordinates
3. **DevOps** → Provides access
4. **CEO** → Final approval (production)
5. **Supabase Support** → support@supabase.io

---

## Testing Checklist

- [ ] Quarterly staging PITR test (Next: **\_**)
- [ ] Recovery metrics validated (RTO: **_, RPO: _**)
- [ ] Team trained on procedures
- [ ] Runbook updated with actuals

---

**Status**: ✅ READY FOR TESTING  
**Next Review**: Quarterly  
**Owner**: Data + DevOps
