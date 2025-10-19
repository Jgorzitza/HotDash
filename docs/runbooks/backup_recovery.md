# Backup & Recovery Procedures

**Created**: 2025-10-19  
**Owner**: DevOps  
**Molecule**: D-015  
**Purpose**: Database backup and application recovery procedures

## Database Backups (Supabase)

### Automated Backups

**Provider**: Supabase automated backups  
**Frequency**: Daily  
**Retention**: 7 days (Free tier), 30 days (Pro tier)  
**Location**: Supabase infrastructure (managed)

**Verify Automated Backups**:

1. Login to Supabase Dashboard
2. Project Settings → Database → Backups
3. Verify latest backup timestamp (<24 hours)

### Manual Backup

**When to use**:

- Before major migrations
- Before production deploys
- Before data cleanup operations
- On-demand for compliance/audit

**Command**:

```bash
# Set production database URL
PROD_DB_URL="postgresql://user:pass@host:port/database"

# Create timestamped backup
BACKUP_FILE="backups/manual-$(date +%Y%m%d-%H%M%S).sql"
mkdir -p backups

# Full database dump
pg_dump $PROD_DB_URL > "$BACKUP_FILE"

# Verify backup created
ls -lh "$BACKUP_FILE"
wc -l "$BACKUP_FILE"

# Compress for storage
gzip "$BACKUP_FILE"
```

**Backup Size**: Typically 10-50MB (varies with data volume)

### Backup Verification

```bash
# Check backup integrity
gunzip -c backups/manual-YYYYMMDD-HHMMSS.sql.gz | head -100

# Expected output: SQL DDL statements and data

# Test restore to local database (optional)
createdb test_restore
gunzip -c backups/manual-YYYYMMDD-HHMMSS.sql.gz | psql test_restore
dropdb test_restore  # cleanup
```

## Recovery Procedures

### Database Recovery Scenarios

#### Scenario 1: Bad Migration

**Symptoms**: Migration failed or caused data corruption  
**Recovery Time**: 5-15 minutes

**Steps**:

```bash
# 1. Identify pre-migration backup
ls -lt backups/ | head -5

# 2. Stop application (prevent writes)
# Via Fly.io:
fly apps stop hotdash-app

# 3. Restore database
gunzip -c backups/pre-deploy-YYYYMMDD-HHMMSS.sql.gz | \
  psql $PROD_DB_URL

# 4. Verify data integrity
psql $PROD_DB_URL -c "SELECT COUNT(*) FROM users;"
psql $PROD_DB_URL -c "SELECT COUNT(*) FROM orders;"

# 5. Restart application
fly apps restart hotdash-app

# 6. Run smoke tests
curl -f https://app.hotrodan.com/health
```

#### Scenario 2: Accidental Data Deletion

**Symptoms**: Critical data deleted (users, orders, products)  
**Recovery Time**: 10-30 minutes

**Options**:

**A. Point-in-Time Recovery (PITR)** - Supabase Pro only

1. Dashboard → Settings → Database → Restore
2. Select timestamp before deletion
3. Confirm restore
4. Wait for PITR completion (5-15min)
5. Verify data restored

**B. Manual Restore from Backup**

```bash
# Find backup from before deletion
ls -lt backups/ | grep "$(date -d '1 day ago' +%Y%m%d)"

# Restore specific table (if full restore not needed)
pg_restore --data-only --table=users \
  backups/manual-YYYYMMDD-HHMMSS.sql.gz | \
  psql $PROD_DB_URL
```

#### Scenario 3: Complete Database Corruption

**Symptoms**: Database unreachable, data integrity failures  
**Recovery Time**: 15-45 minutes

**Steps**:

```bash
# 1. Create new database instance (Supabase Dashboard)
# OR drop and recreate existing

# 2. Restore from latest backup
gunzip -c backups/latest-good-backup.sql.gz | \
  psql $NEW_DB_URL

# 3. Update application DATABASE_URL
# In GitHub Secrets or Fly.io secrets

# 4. Run migrations to catch up
supabase db push --db-url $NEW_DB_URL

# 5. Verify RLS policies
supabase db lint --db-url $NEW_DB_URL

# 6. Switch application to new database
fly secrets set DATABASE_URL=$NEW_DB_URL

# 7. Restart application
fly apps restart hotdash-app
```

## Application Recovery

### Scenario 1: Bad Deployment

**Symptoms**: Application errors, health checks failing  
**Recovery Time**: 5-10 minutes

**Via GitHub Actions**:

```bash
# Trigger rollback workflow
gh workflow run rollback-production

# Monitor rollback
gh run watch
```

**Via Fly.io Manual**:

```bash
# List recent releases
fly releases -a hotdash-app

# Rollback to previous version
fly releases rollback -a hotdash-app

# Verify health
curl -f https://app.hotrodan.com/health
```

### Scenario 2: Configuration Error

**Symptoms**: Environment variable issue, secrets misconfigured  
**Recovery Time**: 5-15 minutes

```bash
# Update secrets via Fly.io
fly secrets set KEY=value -a hotdash-app

# OR via GitHub Secrets (for next deploy)
gh secret set KEY -b "value"

# Restart to pick up changes
fly apps restart hotdash-app

# Verify
fly logs -a hotdash-app
```

### Scenario 3: Complete Outage

**Symptoms**: Application unreachable, all health checks failing  
**Recovery Time**: 10-30 minutes

**Steps**:

1. Check infrastructure status (Fly.io, Supabase)
2. Verify DNS resolution
3. Check recent deploys/changes
4. Rollback to last known good version
5. Verify database accessible
6. Scale up if resource issue
7. Check logs for root cause

## Backup Storage

### Local Backups

**Location**: `backups/` directory (gitignored)  
**Retention**: Keep 7 days locally, 30 days archived

**Cleanup old backups**:

```bash
# Remove backups older than 7 days
find backups/ -name "*.sql.gz" -mtime +7 -delete

# Archive to S3/cloud storage (if configured)
aws s3 sync backups/ s3://hotdash-backups/$(date +%Y%m)/
```

### Remote Backups

**Recommended**: Store critical backups off-site

- AWS S3
- Google Cloud Storage
- Backblaze B2
- Any S3-compatible storage

**Encryption**: Encrypt backups before uploading

```bash
# Encrypt backup
gpg --symmetric --cipher-algo AES256 backup.sql.gz

# Decrypt for restore
gpg --decrypt backup.sql.gz.gpg > backup.sql.gz
```

## Recovery Time Objectives (RTO)

| Scenario            | Target RTO | Acceptable Data Loss (RPO) |
| ------------------- | ---------- | -------------------------- |
| Bad migration       | 15 min     | 0 (full restore)           |
| Data deletion       | 30 min     | <1 hour (last backup)      |
| Database corruption | 45 min     | <24 hours (daily backup)   |
| Bad deployment      | 10 min     | 0 (code rollback)          |
| Complete outage     | 30 min     | <24 hours                  |

## Testing Recovery

### Monthly Recovery Drill

```bash
# 1. Create test backup
pg_dump $PROD_DB_URL > test-recovery-$(date +%Y%m%d).sql

# 2. Create test database
createdb recovery_test

# 3. Restore backup
psql recovery_test < test-recovery-$(date +%Y%m%d).sql

# 4. Verify data integrity
psql recovery_test -c "SELECT COUNT(*) FROM users;"
psql recovery_test -c "SELECT COUNT(*) FROM orders;"

# 5. Time the recovery process (should be <target RTO)

# 6. Cleanup
dropdb recovery_test
rm test-recovery-*.sql
```

**Document results**: `reports/recovery-drills/YYYY-MM-DD.md`

## Backup Checklist

### Pre-Migration Backup (Required)

- [ ] Create manual backup with timestamp
- [ ] Verify backup file created (>0 bytes)
- [ ] Test backup can be read (gunzip -t)
- [ ] Document backup location in migration notes
- [ ] Estimate restore time (<target RTO)

### Pre-Deploy Backup (Recommended)

- [ ] Verify automated backup <24hrs old
- [ ] Optional: Create manual backup
- [ ] Verify database accessible
- [ ] Document backup timestamp

### Weekly Backup Verification

- [ ] Check Supabase dashboard for automated backups
- [ ] Verify all backups present (7 days)
- [ ] Test restore from oldest backup
- [ ] Archive monthly snapshots to remote storage
- [ ] Cleanup local backups >7 days

## Emergency Contacts

**Database Issues**:

- Supabase Support: support@supabase.io
- Dashboard: https://app.supabase.com

**Application Issues**:

- Fly.io Support: https://fly.io/docs/about/support/
- Status: https://status.flyio.net

**Internal**:

- DevOps: See escalation runbook
- Manager: See escalation runbook

## Related Documentation

- Production Deploy: `docs/runbooks/production_deploy.md`
- Environment Vars: `docs/runbooks/required_env_vars.md`
- CI/CD Pipeline: `docs/runbooks/cicd_pipeline.md`
