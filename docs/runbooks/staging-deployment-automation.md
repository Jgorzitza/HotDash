# Staging Deployment Automation

## Overview
This runbook documents the automated staging deployment process that triggers on merge to main branch and ensures reliable, monitored deployments.

## Deployment Triggers

### Automatic Deployment
- **Push to main branch**: Triggers automatic deployment to staging
- **Manager reopen branches**: Triggers deployment for manager-coordinated work
- **Manual dispatch**: Allows manual deployment with reason tracking

### Deployment Conditions
- All CI checks must pass
- CI guards (MCP Evidence, Heartbeat, Dev MCP Ban) must pass
- Build process must complete successfully
- Health checks must pass after deployment

## Deployment Process

### 1. Pre-Deployment Checks
- **CI Guards**: MCP Evidence, Heartbeat, Dev MCP Ban validation
- **Build Verification**: All CI checks passed
- **Commit Validation**: Valid commit SHA and metadata

### 2. Build Process
- **Node.js Setup**: Version 20 with npm caching
- **Dependency Installation**: `npm ci` for reliable builds
- **Application Build**: `npm run build` with production environment
- **Artifact Upload**: Build artifacts stored for 7 days

### 3. Deployment to Fly.io
- **Fly.io CLI Setup**: Latest version with authentication
- **Remote Deployment**: `flyctl deploy --remote-only --app hotdash-staging`
- **Deployment Metadata**: Version, timestamp, and trigger information
- **Artifact Storage**: Deployment metadata stored for 90 days

### 4. Health Verification
- **Stabilization Wait**: 30-second wait for deployment to stabilize
- **Health Endpoint Check**: `/health` endpoint validation
- **Root Endpoint Check**: Fallback to root endpoint if health fails
- **Machine Status**: Fly.io machine status verification

### 5. Automatic Rollback
- **Failure Detection**: Automatic rollback on health check failure
- **Previous Version**: Automatic detection of previous stable version
- **Rollback Execution**: Automatic rollback to previous version
- **Verification**: Health check after rollback completion

## Environment Configuration

### Staging Environment
- **App Name**: `hotdash-staging`
- **URL**: `https://hotdash-staging.fly.dev`
- **Region**: `ord` (Chicago)
- **Machine Specs**: 1GB RAM, 1 CPU (shared)

### Required Secrets
- `FLY_API_TOKEN`: Fly.io API token for deployment
- Environment variables configured in Fly.io app settings

## Monitoring and Alerting

### Deployment Metadata
- **Commit SHA**: Full commit hash for traceability
- **Deployment Time**: UTC timestamp of deployment
- **Trigger Information**: Push, PR, or manual dispatch
- **Actor**: GitHub user who triggered deployment
- **Workflow Run**: Direct link to GitHub Actions run

### Health Check Endpoints
- **Primary**: `https://hotdash-staging.fly.dev/health`
- **Fallback**: `https://hotdash-staging.fly.dev/`
- **Expected Status**: HTTP 200 or 302 (redirect)

### Rollback Tracking
- **Automatic Rollback**: Triggered on health check failure
- **Rollback Metadata**: Previous version, reason, timestamp
- **Verification**: Health check after rollback
- **Artifact Storage**: Rollback metadata stored for 90 days

## Deployment Artifacts

### Build Artifacts
- **Name**: `build-{commit-sha}`
- **Contents**: `build/`, `package.json`, `package-lock.json`
- **Retention**: 7 days

### Deployment Artifacts
- **Name**: `deployment-staging-{run-number}`
- **Contents**: Deployment metadata, status JSON
- **Retention**: 90 days

### Rollback Artifacts
- **Name**: `rollback-staging-{run-number}`
- **Contents**: Rollback metadata and status
- **Retention**: 90 days

## Troubleshooting

### Common Issues

1. **Build Failure**
   - Check Node.js version compatibility
   - Verify all dependencies are available
   - Review build logs for specific errors

2. **Deployment Failure**
   - Verify Fly.io API token is valid
   - Check Fly.io app configuration
   - Review deployment logs for errors

3. **Health Check Failure**
   - Verify app is running on Fly.io
   - Check application logs for errors
   - Verify environment variables are set

4. **Rollback Issues**
   - Check if previous version exists
   - Verify rollback command execution
   - Review rollback logs for errors

### Debug Commands

```bash
# Check Fly.io app status
flyctl status --app hotdash-staging

# View app logs
flyctl logs --app hotdash-staging

# Check releases
flyctl releases --app hotdash-staging

# Manual rollback
flyctl releases {version} --app hotdash-staging
```

## Success Criteria

- [ ] Automatic deployment on merge to main
- [ ] CI guards integrated into deployment process
- [ ] Health checks pass after deployment
- [ ] Automatic rollback on failure
- [ ] Deployment metadata tracking
- [ ] Artifact storage and retention
- [ ] Manual deployment capability
- [ ] Rollback verification process

## Configuration Files

### Workflow Files
- `.github/workflows/deploy-staging.yml`: Main deployment workflow
- `.github/workflows/ci.yml`: CI checks with Dev MCP Ban
- `.github/workflows/ci-guards.yml`: CI guards validation

### Scripts
- `scripts/ci/verify-dev-mcp-ban.cjs`: Dev MCP import validation
- `scripts/ci/verify-mcp-evidence.js`: MCP evidence validation
- `scripts/ci/verify-heartbeat.js`: Heartbeat validation

### Documentation
- `docs/runbooks/staging-deployment-automation.md`: This runbook
- `docs/runbooks/ci-guards-setup.md`: CI guards documentation
- `docs/runbooks/store-switch-checklist.md`: Store switch procedures
