# Production Rollback Procedures

**Owner:** DevOps  
**Last Updated:** 2025-10-23  
**Status:** Active

## Overview

This runbook provides comprehensive procedures for rolling back production deployments in case of issues. All rollback procedures are designed to minimize downtime and ensure data integrity.

## Quick Reference

### Emergency Rollback (< 5 minutes)

```bash
# Automated rollback to previous version
./scripts/ops/rollback-production.sh

# Or via GitHub Actions
# Go to: Actions → Rollback Production → Run workflow
```

### Rollback to Specific Version

```bash
# Rollback to a specific version number
./scripts/ops/rollback-production.sh <version>

# Example: rollback to version 42
./scripts/ops/rollback-production.sh 42
```

## When to Rollback

### Immediate Rollback Required

- ❌ Application not responding (HTTP 5xx errors)
- ❌ Critical functionality broken
- ❌ Data corruption detected
- ❌ Security vulnerability introduced
- ❌ Performance degradation >50%

### Consider Rollback

- ⚠️ Non-critical bugs affecting users
- ⚠️ Performance degradation 20-50%
- ⚠️ Increased error rates
- ⚠️ Failed health checks

### Do NOT Rollback

- ✅ Minor UI issues
- ✅ Non-user-facing bugs
- ✅ Issues that can be hotfixed quickly
- ✅ Database migration already applied (requires special procedure)

## Rollback Methods

### Method 1: Automated Script (Recommended)

**Use when:** Quick rollback needed, previous version known to be stable

```bash
# Navigate to project root
cd /path/to/hot-dash

# Run rollback script
./scripts/ops/rollback-production.sh

# Follow prompts
# - Confirm rollback (type 'yes')
# - Wait for health checks
# - Verify application functionality
```

**What it does:**
1. Captures pre-rollback state
2. Identifies previous stable version
3. Executes rollback via Fly.io
4. Waits for deployment to complete
5. Runs health checks
6. Captures post-rollback state
7. Generates rollback report

**Artifacts saved to:** `artifacts/rollback/<timestamp>/`

### Method 2: GitHub Actions Workflow

**Use when:** Rollback from remote location, audit trail needed

1. Go to GitHub Actions: https://github.com/Jgorzitza/HotDash/actions
2. Select "Rollback Production" workflow
3. Click "Run workflow"
4. Select target version (or leave blank for previous)
5. Provide rollback reason
6. Click "Run workflow"
7. Monitor workflow progress
8. Verify health checks pass

**Advantages:**
- Full audit trail
- Automated notifications
- Health check validation
- Rollback verification

### Method 3: Manual Fly.io CLI

**Use when:** Script fails, need manual control

```bash
# 1. Check current releases
flyctl releases --app hotdash-production

# 2. Identify target version
# Look for the last known good version

# 3. Execute rollback
flyctl releases rollback <version> --app hotdash-production --yes

# 4. Wait for rollback to complete (30-60 seconds)
sleep 30

# 5. Verify status
flyctl status --app hotdash-production

# 6. Check health
curl https://hotdash-production.fly.dev/health

# 7. Monitor logs
flyctl logs --app hotdash-production
```

## Zero-Downtime Rollback

Production is configured for zero-downtime rollbacks using Fly.io's rolling deployment strategy:

### Configuration (fly.production.toml)

```toml
[deploy]
  strategy = "rolling"
  wait_timeout = "5m"
  max_unavailable = 0.25

[http_service]
  min_machines_running = 2
  
  [[http_service.checks]]
    grace_period = "10s"
    interval = "15s"
    path = "/health"
    [http_service.checks.restart]
      policy = "on-failure"
      max_retries = 3
```

### How It Works

1. **Rolling Strategy:** Machines are updated one at a time
2. **Health Checks:** New machines must pass health checks before old ones are stopped
3. **Max Unavailable:** Maximum 25% of machines can be unavailable during rollback
4. **Automatic Restart:** Failed machines are automatically restarted up to 3 times

### Expected Behavior

- **Downtime:** 0 seconds (traffic routed to healthy machines)
- **Duration:** 2-5 minutes (depending on number of machines)
- **User Impact:** None (seamless transition)

## Post-Rollback Verification

### 1. Health Checks

```bash
# Basic health
curl https://hotdash-production.fly.dev/health

# Monitoring health
curl https://hotdash-production.fly.dev/api/monitoring/health

# Expected: HTTP 200 with healthy status
```

### 2. Monitoring Dashboard

```bash
# View deployment dashboard
./scripts/ops/deployment-dashboard.sh

# Or access via browser
open https://hotdash-production.fly.dev/api/monitoring/dashboard?period=1h
```

**Check for:**
- ✅ Error rate < 1%
- ✅ Route P95 < 3000ms
- ✅ Uptime > 99%
- ✅ No critical alerts

### 3. Functional Testing

**Critical paths to test:**
1. Homepage loads
2. User authentication works
3. Dashboard displays data
4. API endpoints respond
5. Database queries succeed

### 4. Log Monitoring

```bash
# Monitor logs for errors
flyctl logs --app hotdash-production

# Look for:
# - Error messages
# - Failed requests
# - Database connection issues
# - Unexpected behavior
```

## Rollback Artifacts

All rollbacks generate artifacts in `artifacts/rollback/<timestamp>/`:

- `pre-rollback-status.txt` - Status before rollback
- `pre-rollback-releases.json` - Releases before rollback
- `post-rollback-status.txt` - Status after rollback
- `post-rollback-releases.json` - Releases after rollback
- `rollback-summary.txt` - Rollback summary report

**Retention:** 30 days (gitignored, local only)

## Troubleshooting

### Rollback Failed

**Symptoms:** Rollback command fails, application still unhealthy

**Actions:**
1. Check Fly.io status: https://status.fly.io/
2. Verify API token: `flyctl auth whoami`
3. Check machine status: `flyctl status --app hotdash-production`
4. Try manual rollback via Fly.io dashboard
5. Contact Fly.io support if infrastructure issue

### Health Checks Failing After Rollback

**Symptoms:** Rollback completes but health checks fail

**Actions:**
1. Check application logs: `flyctl logs --app hotdash-production`
2. Verify database connectivity
3. Check environment variables: `flyctl secrets list --app hotdash-production`
4. Restart machines: `flyctl machine restart <machine-id> --app hotdash-production`
5. Consider rolling back to earlier version

### Database Migration Issues

**Symptoms:** Rollback fails due to database schema mismatch

**Actions:**
1. **DO NOT** rollback application if migration already applied
2. Create hotfix to make code compatible with new schema
3. Deploy hotfix instead of rolling back
4. Document incident for future prevention

**Prevention:**
- Always make migrations backward-compatible
- Test migrations in staging first
- Use feature flags for schema-dependent features

## Communication

### During Rollback

1. **Notify team:** Post in #engineering Slack channel
2. **Update status page:** If customer-facing issue
3. **Document reason:** In rollback summary

### After Rollback

1. **Post-mortem:** Schedule within 24 hours
2. **Root cause analysis:** Document what went wrong
3. **Prevention plan:** How to avoid in future
4. **Update runbooks:** If new scenario encountered

## Monitoring

### Real-Time Monitoring

```bash
# Watch deployment dashboard
./scripts/ops/deployment-dashboard.sh --watch

# Monitor logs
flyctl logs --app hotdash-production --follow
```

### Alerts

Production monitoring workflow runs every 15 minutes and creates GitHub issues for:
- Application downtime
- Failed health checks
- High error rates
- Performance degradation

## Related Documentation

- [Production Deployment Guide](./production-deployment-enhanced.md)
- [CI/CD Pipeline Configuration](./cicd-pipeline-configuration.md)
- [Production Monitoring](../lib/monitoring/README.md)
- [Fly.io Configuration](../../fly.production.toml)

## Contacts

- **DevOps Lead:** Check team directory
- **On-Call Engineer:** PagerDuty rotation
- **Fly.io Support:** https://fly.io/docs/about/support/

## Revision History

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2025-10-23 | 1.0 | Initial version | DevOps |

