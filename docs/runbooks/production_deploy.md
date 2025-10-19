# Production Deployment Runbook

**Created**: 2025-10-19  
**Owner**: DevOps  
**Molecule**: D-013  
**Purpose**: Production deployment checklist and procedures

## Pre-Deployment Checklist

### 1. Code Quality

- [ ] All CI checks passing on main branch
- [ ] No failing tests (`npm run test:ci`)
- [ ] Lint clean (`npm run lint`)
- [ ] Format clean (`npm run fmt`)
- [ ] No Gitleaks secrets detected
- [ ] Docs policy passing
- [ ] Danger checks passing

### 2. Database Migrations

- [ ] Migrations tested in staging
- [ ] Rollback plan documented
- [ ] Backup taken before migration
- [ ] RLS policies verified
- [ ] Migration time estimated (<5min preferred)

### 3. Environment Variables

- [ ] All required env vars set (see `docs/runbooks/required_env_vars.md`)
- [ ] Secrets rotated if >90 days old
- [ ] No `.env` files committed
- [ ] GitHub Secrets configured

### 4. Dependencies

- [ ] `package-lock.json` committed
- [ ] No high/critical vulnerabilities (`npm audit`)
- [ ] All dependencies up to date (or documented exceptions)

### 5. Feature Flags

- [ ] New features behind flags
- [ ] Flag configuration documented
- [ ] Rollback via flag toggle verified

### 6. Monitoring

- [ ] Health endpoints responding
- [ ] Error tracking configured
- [ ] Performance monitoring active
- [ ] Alerts configured

## Deployment Steps

### Step 1: Final Verification (T-30min)

```bash
# Run full test suite
npm run test:ci

# Run security scans
npm run scan
gitleaks detect --source . --redact

# Verify docs policy
node scripts/policy/check-docs.mjs

# Check for drift
./scripts/ops/daily-drift-sweep.sh
```

### Step 2: Database Backup (T-15min)

```bash
# Supabase automated backups run daily
# Verify latest backup exists in Supabase dashboard

# Manual backup (if needed)
pg_dump $DATABASE_URL > backups/pre-deploy-$(date +%Y%m%d-%H%M%S).sql
```

### Step 3: Apply Migrations (T-10min)

```bash
# Review migrations
supabase db diff

# Apply to production
supabase db push --db-url $PRODUCTION_DB_URL

# Verify migrations applied
supabase db list-migrations
```

### Step 4: Deploy Application (T-5min)

```bash
# Trigger deploy workflow
gh workflow run deploy-production --ref main

# Monitor deploy
gh run watch

# Verify deployment
curl -f https://app.hotrodan.com/health
```

### Step 5: Smoke Tests (T+5min)

```bash
# Run production smoke tests
npm run test:smoke -- --url=https://app.hotrodan.com

# Verify tiles load
# Verify approvals drawer works
# Verify MCP tools connected
```

### Step 6: Post-Deploy Verification (T+15min)

- [ ] Health endpoint: 200 OK
- [ ] Dashboard tiles loading
- [ ] No error spikes in monitoring
- [ ] Database connections healthy
- [ ] MCP tools responding

## Rollback Procedure

### If Deploy Fails

**Option 1: Rollback via GitHub Actions**

```bash
gh workflow run rollback-production
```

**Option 2: Manual Rollback**

```bash
# Identify last known good commit
git log --oneline -10

# Deploy previous version
gh workflow run deploy-production --ref <commit-sha>
```

### If Database Migration Fails

```bash
# Restore from backup
psql $PRODUCTION_DB_URL < backups/pre-deploy-YYYYMMDD-HHMMSS.sql

# OR use Supabase Point-in-Time Recovery (PITR)
# Dashboard → Settings → Database → Restore
```

### Rollback Communication Template

```
🚨 PRODUCTION ROLLBACK - [Issue Description]

Time: <YYYY-MM-DD HH:MM UTC>
Affected: <Feature/Service>
Action: Rolling back to commit <sha>
ETA: <X minutes>
Impact: <User impact description>

Updates: <Link to status page/issue>
```

## Feature Flag Activation

### Enable Feature Post-Deploy

```typescript
// In app/lib/feature-flags.server.ts
export const FEATURE_FLAGS = {
  enableNewFeature: process.env.FEATURE_NEW_FEATURE === "true",
  // ...
};
```

**Activation Steps**:

1. Deploy with flag=false
2. Verify deploy successful
3. Set `FEATURE_NEW_FEATURE=true` in GitHub Secrets
4. Restart application
5. Monitor for errors
6. If issues: Set flag=false immediately

### Progressive Rollout

```typescript
// Percentage-based rollout
export function isFeatureEnabled(userId: string): boolean {
  const percentage = parseInt(process.env.FEATURE_ROLLOUT_PCT || "0");
  const hash = hashUserId(userId);
  return hash % 100 < percentage;
}
```

**Rollout Schedule**:

- Day 1: 5% of users
- Day 2: 25% of users
- Day 3: 50% of users
- Day 4: 100% of users

Monitor error rates at each step.

## Deploy Schedule

### Preferred Windows

- **Best**: Tuesday-Thursday, 10:00-14:00 EST
  - Allows time to monitor and rollback if needed
  - Avoids Monday (highest traffic) and Friday (weekend coverage)

- **Avoid**:
  - Friday PM (limited weekend coverage)
  - Monday AM (highest traffic)
  - Major holidays
  - Black Friday/Cyber Monday

### Emergency Deploys

For critical security fixes or P0 bugs:

- Can deploy anytime
- Require manager approval
- Follow abbreviated checklist (security/critical tests only)
- Post-deploy monitoring extended to 2 hours

## Communication

### Pre-Deploy Notification (T-1hour)

**Slack/Email Template**:

```
📢 Production Deploy Scheduled

Time: <YYYY-MM-DD HH:MM UTC>
Changes: <Brief description>
Expected duration: <X minutes>
Downtime: <None/Minimal/X minutes>

Changelog: <Link to release notes>
Rollback plan: <Link to this runbook>
```

### Post-Deploy Notification (T+30min)

```
✅ Production Deploy Complete

Time: <YYYY-MM-DD HH:MM UTC>
Duration: <X minutes>
Status: <Success/Partial/Rolled back>

Metrics:
- Health: ✅ All checks passing
- Errors: <Count, link to monitoring>
- Performance: <P95 response time>

Next steps: <Monitor for X hours / None>
```

## Database Migration Process

### Migration File Structure

```sql
-- Migration: YYYYMMDD_description.sql
-- Author: <Name>
-- Created: <Date>
-- Estimated time: <X minutes>

BEGIN;

-- Add new column (safe, no locks)
ALTER TABLE users ADD COLUMN new_field TEXT;

-- Create index concurrently (no locks)
CREATE INDEX CONCURRENTLY idx_users_new_field ON users(new_field);

-- Update data in batches (avoid long locks)
-- DO $$
-- DECLARE batch_size INT := 1000;
-- BEGIN
--   LOOP
--     UPDATE users SET new_field = 'value'
--     WHERE id IN (SELECT id FROM users WHERE new_field IS NULL LIMIT batch_size);
--     IF NOT FOUND THEN EXIT; END IF;
--     COMMIT;
--   END LOOP;
-- END $$;

COMMIT;
```

### Migration Best Practices

**DO ✅**:

- Use `BEGIN` and `COMMIT` for atomicity
- Create indexes `CONCURRENTLY`
- Update data in batches
- Add columns as nullable first, backfill, then add NOT NULL
- Test rollback procedure
- Estimate migration time
- Keep migrations <5min runtime

**DON'T ❌**:

- Lock tables during business hours
- Modify large amounts of data in single transaction
- Add NOT NULL columns without default
- Drop columns (mark as deprecated first)
- Rename columns (create new, migrate, deprecate old)

## Monitoring During Deploy

### Key Metrics to Watch

1. **Error Rate** (<0.1% baseline)
   - Monitor for spike >1%
   - Alert threshold: 2x baseline

2. **Response Time** (P95 <3s baseline)
   - Monitor for >5s
   - Alert threshold: >10s

3. **Database Connections** (<80% pool)
   - Monitor for >90%
   - Alert threshold: >95%

4. **CPU/Memory** (<70% baseline)
   - Monitor for >80%
   - Alert threshold: >90%

### Rollback Triggers

Automatic rollback if:

- Error rate >5%
- P95 response time >10s
- Database connections >95%
- Health endpoint fails

Manual rollback if:

- Critical bug discovered
- Data integrity issue
- Security vulnerability
- User-reported blockers

## Post-Deploy Tasks

- [ ] Monitor metrics for 1 hour
- [ ] Review error logs
- [ ] Verify backup completed
- [ ] Update deployment log
- [ ] Close deployment issue
- [ ] Post-mortem (if issues occurred)

## Deployment Log

Track all production deploys in `reports/deploys/<YYYY-MM-DD>.md`:

```markdown
# Production Deployment - YYYY-MM-DD

**Time**: HH:MM UTC  
**Duration**: X minutes  
**Deployed by**: <Name>  
**Commit**: <sha>

## Changes

- Feature: <description>
- Fix: <description>

## Migrations

- <migration file>: <time taken>

## Rollback

- Required: Yes/No
- Reason: <if yes>

## Issues

- None / <description>

## Metrics

- Error rate: <baseline → post-deploy>
- P95 latency: <baseline → post-deploy>
```

## Related Documentation

- Backup/Recovery: `docs/runbooks/backup_recovery.md`
- Environment vars: `docs/runbooks/required_env_vars.md`
- CI/CD pipeline: `docs/runbooks/cicd_pipeline.md`
- Monitoring: `docs/runbooks/monitoring_setup.md`
