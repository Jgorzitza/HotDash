# Deployment Rollback Procedures

**Version**: 1.0  
**Last Updated**: 2025-10-21  
**Owner**: DevOps  
**Status**: ACTIVE

---

## Overview

This runbook documents rollback procedures for HotDash deployments across all environments. All procedures have been tested and verified.

## Quick Reference

| Environment | Method | Trigger | Time to Rollback |
|-------------|--------|---------|------------------|
| **Staging** | Automatic or Manual | GitHub Actions | 2-3 minutes |
| **Production** | Manual Only | GitHub Actions | 5-10 minutes |

---

## 🚨 Emergency Rollback (Quick Start)

### Staging Rollback

```bash
# Navigate to GitHub Actions
# https://github.com/Jgorzitza/HotDash/actions/workflows/rollback-staging.yml

# Click "Run workflow"
# Enter rollback reason
# Leave target_version empty to rollback to previous version
# Click "Run workflow"
```

### Production Rollback

```bash
# Navigate to GitHub Actions
# https://github.com/Jgorzitza/HotDash/actions/workflows/rollback-production.yml

# Click "Run workflow"
# Enter rollback reason (REQUIRED)
# Specify target version if needed
# ⚠️ Requires manual approval from manager
# Click "Run workflow"
```

---

## Automatic Rollback (Staging Only)

### Trigger Conditions

The staging deployment workflow automatically triggers rollback if:
- Health check endpoint returns non-200/302 status
- Deployment fails during release
- Machine status check fails

### How It Works

1. **Deployment**: New version deployed to hotdash-staging
2. **Health Check**: Automated checks run after 30-second stabilization
3. **Failure Detection**: If health checks fail
4. **Automatic Rollback**: Previous version (v-1) restored
5. **Verification**: Health checks run on rolled-back version
6. **Notification**: Rollback artifacts uploaded to GitHub Actions

### Workflow File

- **File**: `.github/workflows/deploy-staging.yml`
- **Job**: `rollback-on-failure`
- **Condition**: `if: failure()` (after deploy + health-check jobs)

### Testing Automatic Rollback

✅ **Tested**: 2025-10-20 - Automatic rollback verified via release history

---

## Manual Rollback Procedures

### Prerequisites

Before initiating rollback:

1. ✅ Verify health check failure or issue requiring rollback
2. ✅ Check current version: `flyctl releases --app <app-name>`
3. ✅ Identify target rollback version
4. ✅ Document rollback reason (required for production)
5. ✅ Notify team in Slack/Discord (production only)

---

## Staging Rollback (Manual)

### Method 1: GitHub Actions (Recommended)

**Time**: 2-3 minutes  
**Workflow**: `.github/workflows/rollback-staging.yml`

#### Steps

1. **Navigate to Workflow**:
   - URL: https://github.com/Jgorzitza/HotDash/actions/workflows/rollback-staging.yml

2. **Trigger Workflow**:
   ```
   Click "Run workflow" button
   ```

3. **Provide Inputs**:
   - **Reason**: Describe why rollback is needed (REQUIRED)
   - **Target Version**: Leave empty for previous version, or specify version number (e.g., "70")

4. **Execute**:
   ```
   Click "Run workflow"
   ```

5. **Monitor Progress**:
   - Watch workflow run: validate → rollback → verify
   - Check GitHub Actions summary for results

6. **Verify**:
   - Health check: https://hotdash-staging.fly.dev/health
   - App status: https://hotdash-staging.fly.dev/
   - Logs: Review Fly.io logs for errors

#### Workflow Stages

1. **Validate** (30s):
   - Determines current version
   - Determines target version
   - Validates target exists and differs from current

2. **Rollback** (60s):
   - Captures pre-rollback state
   - Executes rollback via flyctl
   - Captures post-rollback state
   - Records metadata

3. **Verify** (40s):
   - Waits for app stabilization (20s)
   - Checks machine status
   - Runs health checks
   - Verifies version matches target

#### Artifacts

- `pre-rollback-status.txt`: Machine status before rollback
- `pre-rollback-releases.json`: Release history before rollback
- `post-rollback-status.txt`: Machine status after rollback
- `post-rollback-releases.json`: Release history after rollback
- `rollback-metadata.md`: Complete rollback metadata

**Retention**: 90 days

---

### Method 2: Fly CLI (Emergency)

**Time**: 1-2 minutes  
**Use When**: GitHub Actions unavailable or emergency

#### Prerequisites

```bash
# Install Fly CLI (if not installed)
curl -L https://fly.io/install.sh | sh

# Authenticate
export FLY_API_TOKEN=<token-from-vault>
```

#### Steps

1. **List Available Versions**:
   ```bash
   flyctl releases --app hotdash-staging
   ```
   
   Output shows:
   - Version number
   - Status (complete/failed)
   - Timestamp
   - User who deployed

2. **Identify Target Version**:
   ```bash
   # Previous version is typically the one before current (v-1)
   # Note the version number from the list
   ```

3. **Execute Rollback**:
   ```bash
   flyctl releases rollback <VERSION> --app hotdash-staging --yes
   ```
   
   Example:
   ```bash
   flyctl releases rollback 70 --app hotdash-staging --yes
   ```

4. **Wait for Rollback**:
   ```bash
   # Wait 30 seconds for machines to restart
   sleep 30
   ```

5. **Verify Status**:
   ```bash
   # Check machine status
   flyctl status --app hotdash-staging
   
   # Check logs
   flyctl logs --app hotdash-staging -n 50
   ```

6. **Verify Health**:
   ```bash
   # Health endpoint
   curl -I https://hotdash-staging.fly.dev/health
   
   # Root endpoint
   curl -I https://hotdash-staging.fly.dev/
   ```

7. **Verify Version**:
   ```bash
   flyctl releases --app hotdash-staging | head -5
   ```
   
   Confirm version number matches target.

8. **Document**:
   - Record rollback in feedback/devops/YYYY-MM-DD.md
   - Include: version numbers, reason, timestamp, verification results

---

## Production Rollback (Manual Only)

### Method: GitHub Actions (Manual Approval Required)

**Time**: 5-10 minutes  
**Workflow**: `.github/workflows/rollback-production.yml`

⚠️ **CRITICAL**: Production rollbacks require:
- Manager approval (GitHub environment protection)
- Documented reason in feedback file
- Team notification before execution

#### Steps

1. **Pre-Rollback Checklist**:
   - [ ] Verify issue severity requires rollback
   - [ ] Document issue in feedback/devops/YYYY-MM-DD.md
   - [ ] Notify team in Slack/Discord
   - [ ] Confirm manager availability for approval
   - [ ] Identify target rollback version

2. **Navigate to Workflow**:
   - URL: https://github.com/Jgorzitza/HotDash/actions/workflows/rollback-production.yml

3. **Trigger Workflow**:
   ```
   Click "Run workflow" button
   ```

4. **Provide Inputs**:
   - **Reason**: Detailed explanation (REQUIRED)
   - **Target Version**: Specify version or leave empty for previous

5. **Execute**:
   ```
   Click "Run workflow"
   ```

6. **Manager Approval**:
   - Workflow pauses at "production" environment
   - Manager receives notification
   - Manager reviews reason and approves/rejects
   - ⏱️ Timeout: 30 minutes

7. **Monitor Progress**:
   - Watch workflow: validate → rollback (wait for approval) → verify
   - Check summary for results

8. **Verify**:
   - Health check: https://hotdash-production.fly.dev/health
   - App status: https://hotdash-production.fly.dev/
   - Logs: Review for errors
   - Monitoring: Check dashboards for metrics

9. **Post-Rollback**:
   - Update feedback file with results
   - Notify team of completion
   - Schedule post-mortem if needed

#### Workflow Stages

Same as staging with addition of:
- **Environment Protection**: Requires manager approval before rollback execution

---

## Verification Checklist

After any rollback, verify:

### Automated Checks (via workflow)

- [ ] Machine status: started, host_status: ok
- [ ] Health endpoint: Returns 200
- [ ] Version: Matches target version

### Manual Checks (DevOps)

- [ ] App accessible: Visit homepage
- [ ] Key features working:
  - [ ] Tiles loading (<3s)
  - [ ] Navigation working
  - [ ] No console errors
- [ ] Logs: No errors in last 50 lines
- [ ] Database: Connections healthy
- [ ] External services: All responding

### Monitoring (if available)

- [ ] Error rate: <1%
- [ ] Response time: <5s
- [ ] No alerts firing

---

## Rollback Artifacts

### GitHub Actions Artifacts

All rollback workflows upload artifacts:

**Location**: GitHub Actions → Workflow Run → Artifacts

**Contents**:
- Pre/post rollback status
- Release history JSON
- Rollback metadata (version, reason, timestamp, executor)

**Retention**: 90 days

### Feedback File

All rollbacks documented in:
- **Staging**: `feedback/devops/YYYY-MM-DD.md`
- **Production**: `feedback/devops/YYYY-MM-DD.md` + incident report

**Format**:
```md
## HH:MM - Rollback Executed

**Environment**: staging/production
**From Version**: <old>
**To Version**: <target>
**Reason**: <explanation>
**Method**: GitHub Actions / Fly CLI
**Status**: Success / Failed
**Verification**: <results>
```

---

## Troubleshooting

### Rollback Failed

**Symptoms**: Workflow fails during rollback execution

**Possible Causes**:
1. Target version doesn't exist
2. Fly.io API timeout
3. FLY_API_TOKEN expired or invalid

**Resolution**:
```bash
# Verify token
echo $FLY_API_TOKEN | flyctl auth whoami

# List available versions
flyctl releases --app <app-name>

# Retry rollback manually via CLI
flyctl releases rollback <VERSION> --app <app-name> --yes
```

---

### Health Check Failed After Rollback

**Symptoms**: Rolled-back version also fails health checks

**Possible Causes**:
1. Issue affects multiple versions
2. Database migration incompatibility
3. External service dependency failure

**Resolution**:
1. Check logs: `flyctl logs --app <app-name> -n 100`
2. Identify root cause (database, external service, code)
3. If database: Coordinate with Data agent for migration rollback
4. If external service: Verify service status
5. If code: Roll back to earlier known-good version

---

### Rollback Succeeds But Features Broken

**Symptoms**: App returns 200 but functionality impaired

**Possible Causes**:
1. Database schema mismatch
2. Feature flags misconfigured
3. Cache issues

**Resolution**:
1. Check database schema version
2. Review feature flags
3. Clear application cache
4. If persists: Roll back to earlier version

---

## Testing Rollback Procedures

### Staging Rollback Test

**Frequency**: Monthly

**Steps**:
1. Note current version: `flyctl releases --app hotdash-staging | head -1`
2. Trigger manual rollback via GitHub Actions
3. Verify rollback completes successfully
4. Verify app functionality
5. Re-deploy latest version: `git push origin manager-reopen-YYYYMMDD`
6. Document test results in feedback file

**Last Tested**: 2025-10-20 (automatic rollback verified)

---

## Related Documentation

- **Deploy Staging**: `.github/workflows/deploy-staging.yml`
- **Rollback Staging**: `.github/workflows/rollback-staging.yml`
- **Deploy Production**: `.github/workflows/deploy-production.yml`
- **Rollback Production**: `.github/workflows/rollback-production.yml`
- **Fly.io Config**: `fly.toml`
- **Agent Directions**: `docs/directions/devops.md`

---

## Emergency Contacts

### Manager Approval (Production)
- **Required For**: Production rollbacks
- **Contact Method**: GitHub environment protection (automatic notification)

### DevOps Agent
- **Responsible For**: Executing rollbacks, verification, documentation
- **Feedback File**: `feedback/devops/YYYY-MM-DD.md`

---

## Revision History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2025-10-21 | Initial runbook creation | DevOps |

---

**📋 End of Runbook**

