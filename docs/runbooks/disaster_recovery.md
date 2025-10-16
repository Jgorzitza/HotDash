# Disaster Recovery Plan

## Overview

This document outlines the procedures for recovering from major incidents affecting the HotDash application.

## Incident Severity Levels

### P0 - Critical (Production Down)
- **Impact:** Production completely unavailable
- **Response Time:** Immediate (< 15 minutes)
- **Examples:** Database failure, complete app crash, Fly.io outage

### P1 - High (Degraded Service)
- **Impact:** Major features unavailable or severely degraded
- **Response Time:** < 1 hour
- **Examples:** Shopify API failures, slow response times, partial outages

### P2 - Medium (Minor Issues)
- **Impact:** Non-critical features affected
- **Response Time:** < 4 hours
- **Examples:** Individual tile failures, non-critical API errors

## Emergency Contacts

- **Manager:** Create GitHub Issue with `P0` label
- **Fly.io Support:** https://fly.io/docs/about/support/
- **Supabase Support:** https://supabase.com/support
- **Shopify Support:** https://help.shopify.com/

## Disaster Scenarios & Recovery Procedures

### Scenario 1: Production Application Down

**Symptoms:**
- Health checks failing
- 500 errors on all endpoints
- Application not responding

**Immediate Actions (< 15 minutes):**

1. **Check Fly.io Status**
   ```bash
   fly status -a hotdash-production
   fly logs -a hotdash-production --tail
   ```

2. **Verify Recent Deployments**
   ```bash
   fly releases -a hotdash-production
   ```

3. **Rollback to Last Known Good Version**
   ```bash
   # Via GitHub Actions
   # Go to: https://github.com/Jgorzitza/HotDash/actions/workflows/rollback-production.yml
   # Click "Run workflow"
   # Reason: "Emergency rollback - production down"
   
   # Or manual rollback
   PREV_IMAGE=$(fly releases --app hotdash-production --image | awk 'NR==2 {print $NF}')
   fly deploy --app hotdash-production --image "$PREV_IMAGE"
   ```

4. **Verify Recovery**
   ```bash
   curl https://hotdash-production.fly.dev/health
   fly status -a hotdash-production
   ```

5. **Create Incident Report**
   - Create GitHub Issue with `P0` and `incident` labels
   - Document timeline, actions taken, root cause

**Recovery Time Objective (RTO):** < 5 minutes

### Scenario 2: Database Failure

**Symptoms:**
- Database connection errors
- Timeout errors
- Data inconsistencies

**Immediate Actions (< 30 minutes):**

1. **Check Supabase Status**
   - Visit: https://status.supabase.com/
   - Check Supabase dashboard for alerts

2. **Verify Database Connectivity**
   ```bash
   # Get DATABASE_URL
   DATABASE_URL=$(fly secrets list -a hotdash-production | grep DATABASE_URL | awk '{print $2}')
   
   # Test connection
   psql "$DATABASE_URL" -c "SELECT 1;"
   ```

3. **If Database is Down - Restore from Backup**
   ```bash
   # List available backups
   ls -lh /data/backups/database/
   
   # Restore latest backup
   LATEST_BACKUP=$(ls -t /data/backups/database/hotdash_production_*.sql.gz | head -1)
   ./scripts/backup/restore-database.sh production "$LATEST_BACKUP"
   ```

4. **Verify Data Integrity**
   ```bash
   psql "$DATABASE_URL" -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';"
   ```

**Recovery Time Objective (RTO):** < 30 minutes
**Recovery Point Objective (RPO):** < 24 hours (daily backups)

### Scenario 3: Secrets Compromised

**Symptoms:**
- Unauthorized access detected
- Suspicious API calls
- Security alerts

**Immediate Actions (< 15 minutes):**

1. **Rotate All Secrets**
   ```bash
   # Shopify
   fly secrets set SHOPIFY_API_KEY=<new-key> -a hotdash-production
   fly secrets set SHOPIFY_API_SECRET=<new-secret> -a hotdash-production
   
   # Database
   # Contact Supabase support to rotate credentials
   
   # Session
   fly secrets set SESSION_SECRET=$(openssl rand -base64 32) -a hotdash-production
   
   # Chatwoot
   fly secrets set CHATWOOT_ACCESS_TOKEN=<new-token> -a hotdash-production
   ```

2. **Revoke Old Credentials**
   - Shopify: Partner Dashboard → Apps → Credentials
   - Supabase: Dashboard → Settings → API
   - Chatwoot: Settings → Integrations

3. **Review Access Logs**
   ```bash
   fly logs -a hotdash-production | grep -i "unauthorized\|error\|failed"
   ```

4. **Document Incident**
   - Create security incident report
   - Document timeline and actions
   - Update security procedures

**Recovery Time Objective (RTO):** < 15 minutes

### Scenario 4: Data Corruption

**Symptoms:**
- Incorrect data displayed
- Data validation errors
- User reports of missing/wrong data

**Immediate Actions (< 1 hour):**

1. **Identify Scope of Corruption**
   ```bash
   # Connect to database
   psql "$DATABASE_URL"
   
   # Check recent changes
   SELECT * FROM audit_log ORDER BY created_at DESC LIMIT 100;
   ```

2. **Stop Further Corruption**
   - Put application in maintenance mode if needed
   - Disable affected features

3. **Restore from Backup**
   ```bash
   # Find backup before corruption
   ls -lh /data/backups/database/
   
   # Restore to staging first for verification
   ./scripts/backup/restore-database.sh staging <backup-file>
   
   # Verify data integrity in staging
   # Then restore to production
   ./scripts/backup/restore-database.sh production <backup-file>
   ```

4. **Verify Data Integrity**
   - Run data validation queries
   - Check critical business data
   - Verify with users if needed

**Recovery Time Objective (RTO):** < 1 hour
**Recovery Point Objective (RPO):** < 24 hours

### Scenario 5: Fly.io Platform Outage

**Symptoms:**
- All Fly.io apps down
- Fly.io status page shows outage
- Cannot access Fly.io dashboard

**Immediate Actions:**

1. **Verify Outage**
   - Check: https://status.fly.io/
   - Check Fly.io community: https://community.fly.io/

2. **Communicate with Users**
   - Post status update
   - Provide ETA if available

3. **Monitor Fly.io Status**
   - Wait for Fly.io to resolve
   - No action needed on our end

4. **Verify Recovery**
   ```bash
   fly status -a hotdash-production
   curl https://hotdash-production.fly.dev/health
   ```

**Recovery Time Objective (RTO):** Dependent on Fly.io

## Backup & Restore Procedures

### Daily Automated Backups

Backups run automatically via cron:
- **Frequency:** Daily at 2 AM UTC
- **Retention:** 30 days
- **Location:** `/data/backups/database/`

### Manual Backup

```bash
./scripts/backup/backup-database.sh production
```

### Restore from Backup

```bash
# List backups
ls -lh /data/backups/database/

# Restore
./scripts/backup/restore-database.sh production <backup-file>
```

## Communication Plan

### Internal Communication

1. **Create GitHub Issue**
   - Title: `[P0] Production Down - <brief description>`
   - Labels: `P0`, `incident`, `devops`
   - Assign to manager

2. **Update Issue with Progress**
   - Timeline of events
   - Actions taken
   - Current status

### External Communication (if needed)

1. **Status Page Update**
   - Post incident notice
   - Provide ETA
   - Update as resolved

2. **User Notification**
   - Email affected users
   - Explain impact
   - Provide resolution timeline

## Post-Incident Review

Within 24 hours of resolution:

1. **Create Incident Report**
   - Timeline of events
   - Root cause analysis
   - Actions taken
   - Lessons learned

2. **Update Runbooks**
   - Document new procedures
   - Update recovery steps
   - Add to known issues

3. **Implement Preventive Measures**
   - Add monitoring/alerts
   - Update deployment procedures
   - Improve testing

## Testing & Drills

### Quarterly Disaster Recovery Drill

1. **Backup & Restore Test**
   - Restore staging from backup
   - Verify data integrity
   - Document time taken

2. **Rollback Test**
   - Deploy to staging
   - Rollback to previous version
   - Verify functionality

3. **Incident Response Simulation**
   - Simulate P0 incident
   - Follow runbook procedures
   - Document gaps/improvements

## Monitoring & Alerts

### Critical Alerts

- Production health check failures
- Database connection errors
- High error rates (> 5%)
- Slow response times (P95 > 3s)

### Alert Channels

- GitHub Issues (automated)
- Email (critical only)
- Slack (if configured)

## Recovery Metrics

### Target Metrics

- **RTO (Recovery Time Objective):**
  - P0: < 5 minutes
  - P1: < 1 hour
  - P2: < 4 hours

- **RPO (Recovery Point Objective):**
  - Database: < 24 hours (daily backups)
  - Application: 0 (stateless, can redeploy)

### Actual Performance

Track in incident reports:
- Time to detect
- Time to respond
- Time to resolve
- Data loss (if any)

## Appendix

### Quick Reference Commands

```bash
# Check production status
fly status -a hotdash-production

# View logs
fly logs -a hotdash-production --tail

# Rollback deployment
fly deploy --app hotdash-production --image <previous-image>

# Backup database
./scripts/backup/backup-database.sh production

# Restore database
./scripts/backup/restore-database.sh production <backup-file>

# Rotate secrets
fly secrets set SECRET_NAME=value -a hotdash-production
```

### Escalation Path

1. DevOps Agent (automated response)
2. Manager (GitHub Issue)
3. Fly.io Support (platform issues)
4. Supabase Support (database issues)

