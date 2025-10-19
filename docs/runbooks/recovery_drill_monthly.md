# Monthly Recovery Drill Checklist

**Created**: 2025-10-19  
**Owner**: DevOps  
**Frequency**: Monthly (first Tuesday)  
**Duration**: 30-45 minutes  
**Purpose**: Verify backup and recovery procedures work

## Objectives

1. Verify backups are being created
2. Test database restore procedure
3. Validate recovery time objectives (RTO)
4. Train team on recovery process
5. Identify and fix procedure gaps

## Pre-Drill Checklist

- [ ] Schedule drill during low-traffic window
- [ ] Notify team of drill time
- [ ] Verify test environment available
- [ ] Document starting state

## Drill Procedure

### Phase 1: Backup Verification (10 min)

#### Step 1.1: Verify Supabase Automated Backups

```bash
# Login to Supabase Dashboard
# Navigate to: Project → Settings → Database → Backups
# Verify: Latest backup timestamp <24 hours
```

**Expected**: Daily backups present, latest <24h  
**Record**: Latest backup timestamp: `_____________`

#### Step 1.2: Create Manual Backup

```bash
# Connect to database (use non-production)
export TEST_DB_URL="<test-database-url>"

# Create backup
BACKUP_FILE="backups/drill-$(date +%Y%m%d-%H%M%S).sql"
mkdir -p backups
pg_dump $TEST_DB_URL > "$BACKUP_FILE"

# Verify backup
ls -lh "$BACKUP_FILE"
wc -l "$BACKUP_FILE"
```

**Expected**: Backup file created, size >0 bytes  
**Record**:

- File: `_____________`
- Size: `_____________`
- Lines: `_____________`

### Phase 2: Recovery Test (15 min)

#### Step 2.1: Create Test Database

```bash
createdb recovery_drill_test
```

#### Step 2.2: Restore Backup

```bash
# Start timer
START_TIME=$(date +%s)

# Restore
psql recovery_drill_test < "$BACKUP_FILE"

# Calculate duration
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))
echo "Restore completed in ${DURATION} seconds"
```

**Expected**: Restore completes in <900s (15 min)  
**Record**: Actual duration: `_______ seconds`

#### Step 2.3: Verify Data Integrity

```bash
# Count records in key tables
psql recovery_drill_test -c "SELECT
  (SELECT COUNT(*) FROM users) as users,
  (SELECT COUNT(*) FROM orders) as orders,
  (SELECT COUNT(*) FROM products) as products;"

# Compare with source database
psql $TEST_DB_URL -c "SELECT
  (SELECT COUNT(*) FROM users) as users,
  (SELECT COUNT(*) FROM orders) as orders,
  (SELECT COUNT(*) FROM products) as products;"
```

**Expected**: Counts match between source and restored database  
**Record**:

- Match: Yes / No
- Discrepancies: `_____________`

### Phase 3: Application Recovery (10 min)

#### Step 3.1: Point Test App to Restored Database

```bash
# Update test app DATABASE_URL
export TEST_APP_DB_URL="postgresql://localhost/recovery_drill_test"

# Restart test app
# (Command depends on local setup)
```

#### Step 3.2: Run Smoke Tests

```bash
# Basic health check
curl -f http://localhost:3000/health

# API health check
curl -f http://localhost:3000/api/health

# Dashboard loads
curl -f http://localhost:3000/app
```

**Expected**: All endpoints return 200 OK  
**Record**:

- /health: Pass / Fail
- /api/health: Pass / Fail
- /app: Pass / Fail

### Phase 4: Cleanup (5 min)

```bash
# Drop test database
dropdb recovery_drill_test

# Remove drill backup
rm "$BACKUP_FILE"

# Verify cleanup
ls backups/drill-* 2>/dev/null || echo "Cleanup complete"
```

## Results Template

```markdown
# Recovery Drill Results - YYYY-MM-DD

**Date**: YYYY-MM-DD  
**Time**: HH:MM UTC  
**Conducted by**: <Name>  
**Duration**: XX minutes

## Backup Verification

- Latest automated backup: <timestamp>
- Manual backup created: <filename> (<size>)
- Backup integrity: ✅ Pass / ❌ Fail

## Restore Performance

- Restore duration: XXX seconds
- Target RTO: 900 seconds (15 min)
- Result: ✅ Within RTO / ❌ Exceeded RTO

## Data Integrity

- Records verified: users, orders, products
- Counts matched: ✅ Yes / ❌ No
- Discrepancies: None / <list>

## Application Recovery

- Health endpoints: ✅ Pass / ❌ Fail
- Smoke tests: ✅ Pass / ❌ Fail
- Functionality: ✅ Normal / ⚠️ Degraded / ❌ Failed

## Issues Identified

1. <Issue description>
2. <Issue description>

## Action Items

- [ ] <Fix procedure gap>
- [ ] <Update documentation>
- [ ] <Improve automation>

## RTO Analysis

- Target: 15 minutes
- Actual: XX minutes
- Status: ✅ Met / ❌ Exceeded
- Improvement needed: Yes / No

## Sign-off

- Drill completed: Yes / No
- Results documented: Yes / No
- Action items assigned: Yes / No
- Next drill scheduled: YYYY-MM-DD
```

## Success Criteria

**Drill passes if**:

- ✅ Backup created successfully
- ✅ Restore completed within RTO (15 min)
- ✅ Data integrity verified (counts match)
- ✅ Application functional after restore
- ✅ Procedure gaps documented

**Drill fails if**:

- ❌ Cannot create backup
- ❌ Restore exceeds RTO by >50%
- ❌ Data integrity issues found
- ❌ Application non-functional

## Follow-up Actions

**If drill passes**:

- Document results
- Archive drill backup (optional)
- Schedule next drill

**If drill fails**:

- P0 escalation to DevOps + Manager
- Fix procedure immediately
- Re-run drill within 1 week
- Update runbooks with fixes

## Related Documentation

- Backup/Recovery: `docs/runbooks/backup_recovery.md`
- Production Deploy: `docs/runbooks/production_deploy.md`
- Incident Response: `docs/runbooks/incident_response.md`
