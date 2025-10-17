# Production Deployment Runbook

## Overview

This runbook describes the process for deploying the HotDash application to production on Fly.io.

## Prerequisites

- [ ] All CI checks passing on main branch
- [ ] Staging deployment successful and healthy
- [ ] Manager approval obtained
- [ ] Deployment window: Monday-Friday, 9am-5pm PT
- [ ] FLY_API_TOKEN configured in GitHub Secrets

### Required CI Checks

The following CI checks MUST pass before production deployment:

1. **Docs Policy** - Ensures all markdown files are in allowed paths
2. **Danger** - Validates PR has Issue linkage and allowed paths
3. **Gitleaks** - Scans for secrets in code
4. **AI Config** - Validates AI agent configuration
5. **Health Check** - Verifies health check workflow is functional

These checks are enforced by branch protection on `main` and verified during deployment.

### Email Notifications

All deployments send email notifications to justin@hotrodan.com:

- **Success:** ✅ Production Deployment Successful
- **Failure:** 🚨 Production Deployment Failed
- **Rollback:** ⚠️ Production Rollback Executed

Notifications include:

- Commit SHA
- Deployment reason
- Deployed by (GitHub actor)
- Deployment time and version
- Workflow run link
- Health check status

## Deployment Process

### Automated Deployment (Recommended)

1. **Navigate to GitHub Actions**
   - Go to: https://github.com/Jgorzitza/HotDash/actions/workflows/deploy-production.yml

2. **Click "Run workflow"**
   - Branch: `main`
   - Reason: Describe the deployment (e.g., "Deploy v1.0.0 with new dashboard features")
   - Skip staging check: Leave unchecked (only check for emergencies)

3. **Monitor Deployment**
   - Watch the workflow progress
   - Verify each job completes successfully:
     - Pre-deployment validation
     - Build
     - Deploy
     - Health check
   - If health check fails, automatic rollback will trigger

4. **Verify Deployment**
   - Check app URL: https://hotdash-production.fly.dev
   - Verify health endpoint: https://hotdash-production.fly.dev/health
   - Check Fly.io status: `fly status -a hotdash-production`
   - Verify email notification received (if deployment failed)

### Verification Steps

After deployment completes, perform these verification checks:

1. **Health Check Verification**

   ```bash
   # Check health endpoint
   curl https://hotdash-production.fly.dev/health

   # Expected response:
   # {"status":"healthy","timestamp":"...","uptime":...}
   ```

2. **Fly.io Status Verification**

   ```bash
   # Check app status
   fly status -a hotdash-production

   # Expected: Status = deployed, Machines = running
   ```

3. **Application Functionality**
   - Navigate to https://hotdash-production.fly.dev
   - Verify login works
   - Check dashboard loads
   - Test critical features

4. **Metrics Verification**

   ```bash
   # Check metrics endpoint
   curl https://hotdash-production.fly.dev/metrics

   # Should return Prometheus format metrics
   ```

5. **Log Verification**

   ```bash
   # Check recent logs
   fly logs -a hotdash-production --tail

   # Look for deployment success messages
   # Verify no errors in startup
   ```

## Rollback Process

### Automated Rollback (Recommended)

1. **Navigate to GitHub Actions**
   - Go to: https://github.com/Jgorzitza/HotDash/actions/workflows/rollback-production.yml

2. **Click "Run workflow"**
   - Target version: Leave empty for previous version, or specify version number
   - Reason: Describe why rollback is needed (REQUIRED)

3. **Monitor Rollback**
   - Watch the workflow progress
   - Verify rollback completes in < 2 minutes
   - Check health verification passes

4. **Verify Rollback**
   - Check app is healthy: https://hotdash-production.fly.dev
   - Verify correct version deployed
   - Check Fly.io status: `fly status -a hotdash-production`
   - Verify email notification received

### Rollback Verification Steps

After rollback completes, verify the system is stable:

1. **Version Verification**

   ```bash
   # Check deployed version
   fly releases -a hotdash-production

   # Verify rollback to previous version
   ```

2. **Health Check**

   ```bash
   # Verify health endpoint
   curl https://hotdash-production.fly.dev/health

   # Expected: {"status":"healthy",...}
   ```

3. **Functionality Test**
   - Test critical user flows
   - Verify no errors in logs
   - Check metrics are being collected

4. **Incident Documentation**
   - Document what caused the rollback
   - Create GitHub issue if needed
   - Export to audit trail:
   ```bash
   ./scripts/ops/export-incident.sh \
     --type "rollback" \
     --severity "warning" \
     --details "Rolled back due to: <reason>"
   ```

### Rollback Time Targets

- **Target:** < 5 minutes from trigger to healthy
- **Automated rollback:** Triggered on health check failure
- **Manual rollback:** Available via workflow_dispatch
- **Emergency rollback:** Use Fly CLI directly if GitHub Actions unavailable

## Health Checks

### Automated Health Checks

The deployment workflow automatically performs health checks:

1. Tries `/health` endpoint (expects HTTP 200)
2. Falls back to `/` endpoint (expects HTTP 200 or 302)
3. Verifies Fly.io machine status

### Manual Health Checks

```bash
# Check HTTP endpoints
curl -I https://hotdash-production.fly.dev/health
curl -I https://hotdash-production.fly.dev/

# Check Fly.io status
fly status -a hotdash-production

# Check logs
fly logs -a hotdash-production

# Check machine health
fly checks list -a hotdash-production
```

## Monitoring

### Key Metrics

- **Uptime:** Target ≥ 99.9% (30-day)
- **Response Time:** P95 < 3s
- **Error Rate:** < 0.5%
- **Deployment Success Rate:** > 95%
- **Rollback Time:** < 5 minutes

### Monitoring Tools

- Fly.io Dashboard: https://fly.io/apps/hotdash-production/monitoring
- GitHub Actions: https://github.com/Jgorzitza/HotDash/actions
- Application Logs: `fly logs -a hotdash-production`

## Troubleshooting

### Deployment Fails

1. **Check CI Status**
   - Verify all CI checks passed on main
   - Review GitHub Actions logs

2. **Check Staging Health**
   - Verify staging is healthy
   - Test staging deployment first

3. **Check Secrets**
   - Verify all required secrets are configured
   - Check for expired credentials

4. **Check Logs**

   ```bash
   fly logs -a hotdash-production
   ```

5. **Rollback if Needed**
   - Use automated rollback workflow

### Health Check Fails

1. **Check Application Logs**

   ```bash
   fly logs -a hotdash-production --tail
   ```

2. **Check Machine Status**

   ```bash
   fly status -a hotdash-production
   fly checks list -a hotdash-production
   ```

3. **Restart Machine**

   ```bash
   fly machine restart <machine-id> -a hotdash-production
   ```

4. **Rollback if Persistent**
   - Use rollback workflow
   - Investigate issue in staging

## Deployment Checklist

### Pre-Deployment

- [ ] All CI checks passing on main
- [ ] Staging deployment successful
- [ ] Staging health checks passing
- [ ] Manager approval obtained
- [ ] Within deployment window (Mon-Fri, 9am-5pm PT)
- [ ] Rollback plan reviewed

### During Deployment

- [ ] Deployment workflow triggered
- [ ] Build successful
- [ ] Deployment successful
- [ ] Health checks passing
- [ ] No errors in logs

### Post-Deployment

- [ ] Application accessible
- [ ] Health endpoint responding
- [ ] Key features verified
- [ ] Monitoring dashboards updated
- [ ] Deployment documented

### If Rollback Needed

- [ ] Rollback workflow triggered
- [ ] Rollback completed in < 5 minutes
- [ ] Health checks passing after rollback
- [ ] Incident documented
- [ ] Root cause investigation scheduled

## Deployment Windows

**Allowed:**

- Monday-Friday, 9am-5pm Pacific Time
- Emergency deployments require manager approval

**Avoided:**

- Weekends
- Outside business hours
- Holidays
- During high-traffic periods

## Version History

- v1.0 (2025-10-15) - Initial production deployment runbook
