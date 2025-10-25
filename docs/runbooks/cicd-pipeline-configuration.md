# CI/CD Pipeline Configuration

## Overview

This document describes the complete CI/CD pipeline configuration for HotDash, including automated testing, deployment automation, and comprehensive monitoring.

## Pipeline Architecture

### 1. Continuous Integration (CI)
- **Trigger**: Story completion (manager closes stories)
- **Workflow**: `.github/workflows/ci.yml`
- **Purpose**: Automated testing and validation

### 2. Continuous Deployment (CD)
- **Staging**: `.github/workflows/deploy-staging.yml`
- **Production**: `.github/workflows/deploy-production-enhanced.yml`
- **Purpose**: Automated deployment to staging and production environments

### 3. CI Guards
- **MCP Evidence**: `.github/workflows/ci-guards.yml`
- **Heartbeat**: `.github/workflows/idle-guard.yml`
- **Dev MCP Ban**: `.github/workflows/dev-mcp-ban.yml`
- **Purpose**: Quality gates and compliance checks

## CI Pipeline Details

### Workflow: `.github/workflows/ci.yml`

#### Triggers
```yaml
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
```

#### Jobs

##### 1. build-test
- **Purpose**: Run comprehensive test suite
- **Steps**:
  1. Checkout code
  2. Setup Node.js 20
  3. Install dependencies with npm cache
  4. Run CI suite (`npm run ci`)
  5. Dev MCP Ban Check
  6. Upload test results

##### 2. manager-outcome
- **Purpose**: Assert manager produced PR or escalation
- **Dependencies**: build-test
- **Steps**:
  1. Checkout code
  2. Assert manager outcome script

#### CI Suite (`npm run ci`)
```json
{
  "ci": "npm run fmt && npm run lint && npm run test:ci && npm run scan"
}
```

**Components**:
- **Formatting**: `npm run fmt` - Prettier formatting
- **Linting**: `npm run lint` - ESLint validation
- **Testing**: `npm run test:ci` - Comprehensive test suite
- **Security**: `npm run scan` - Secret scanning

## CD Pipeline Details

### Staging Deployment: `.github/workflows/deploy-staging.yml`

#### Triggers
```yaml
on:
  push:
    branches:
      - main
      - 'manager-reopen-*'
  pull_request:
    branches:
      - main
      - 'manager-reopen-*'
  workflow_dispatch:
```

#### Jobs

##### 1. ci-guards
- **Purpose**: Verify MCP evidence, heartbeat, and dev MCP ban
- **Trigger**: Pull requests only
- **Steps**:
  1. Setup Node.js
  2. Get PR body
  3. Verify MCP evidence
  4. Verify heartbeat
  5. Dev MCP ban check

##### 2. pre-deploy
- **Purpose**: Pre-deployment validation
- **Dependencies**: ci-guards
- **Steps**:
  1. Checkout code
  2. Check deployment conditions
  3. Verify CI checks passed

##### 3. build
- **Purpose**: Build application
- **Dependencies**: pre-deploy
- **Steps**:
  1. Checkout code
  2. Setup Node.js 20
  3. Install dependencies
  4. Build application
  5. Upload build artifacts

##### 4. deploy
- **Purpose**: Deploy to Fly.io staging
- **Environment**: staging
- **Dependencies**: pre-deploy, build
- **Steps**:
  1. Setup Fly.io CLI
  2. Deploy to hotdash-staging
  3. Get deployment info
  4. Record deployment metadata
  5. Upload deployment artifacts

##### 5. health-check
- **Purpose**: Verify deployment health
- **Dependencies**: deploy
- **Steps**:
  1. Wait for stabilization
  2. Health check endpoints
  3. Verify Fly.io machine status

##### 6. rollback-on-failure
- **Purpose**: Automatic rollback on failure
- **Trigger**: Failure of deploy or health-check
- **Steps**:
  1. Get previous version
  2. Rollback deployment
  3. Verify rollback
  4. Record rollback metadata

### Production Deployment: `.github/workflows/deploy-production-enhanced.yml`

#### Triggers
```yaml
on:
  workflow_dispatch:
    inputs:
      reason:
        description: 'Reason for production deployment'
        required: true
        type: string
      enable_ipv6_database:
        description: 'Enable IPv6 database configuration'
        required: false
        type: boolean
        default: true
```

#### Jobs

##### 1. pre-deploy
- **Purpose**: Production deployment validation
- **Steps**:
  1. Validate deployment window (business hours)
  2. Check staging health
  3. Verify required CI checks

##### 2. setup-infrastructure
- **Purpose**: Setup production infrastructure
- **Dependencies**: pre-deploy
- **Steps**:
  1. Allocate IPv6 addresses
  2. Configure database for IPv6
  3. Verify Fly.io app exists

##### 3. build
- **Purpose**: Build production application
- **Dependencies**: pre-deploy, setup-infrastructure
- **Steps**:
  1. Build with production optimizations
  2. Upload build artifacts

##### 4. deploy
- **Purpose**: Deploy to production
- **Environment**: production
- **Dependencies**: pre-deploy, setup-infrastructure, build
- **Steps**:
  1. Deploy with IPv6 configuration
  2. Record deployment metadata
  3. Upload deployment artifacts

##### 5. health-check
- **Purpose**: Production health verification
- **Dependencies**: deploy
- **Steps**:
  1. Health check endpoints
  2. Verify Fly.io machine status
  3. Test IPv6 connectivity

##### 6. rollback-on-failure
- **Purpose**: Automatic production rollback
- **Trigger**: Failure of deploy or health-check
- **Steps**:
  1. Rollback to previous version
  2. Verify rollback success
  3. Record rollback metadata

##### 7. notify-failure
- **Purpose**: Failure notifications
- **Trigger**: Any failure
- **Steps**:
  1. Send email notification

##### 8. notify-success
- **Purpose**: Success notifications
- **Trigger**: Successful deployment
- **Steps**:
  1. Send email notification

##### 9. summary
- **Purpose**: Deployment summary
- **Trigger**: Always
- **Steps**:
  1. Generate deployment summary

## CI Guards Configuration

### MCP Evidence Verification
- **Script**: `scripts/ci/verify-mcp-evidence.cjs`
- **Purpose**: Verify MCP tool usage evidence
- **Location**: `artifacts/{agent}/{date}/mcp/`

### Heartbeat Verification
- **Script**: `scripts/ci/verify-heartbeat.cjs`
- **Purpose**: Verify agent activity heartbeat
- **Location**: `artifacts/{agent}/{date}/heartbeat.ndjson`

### Dev MCP Ban Check
- **Script**: `scripts/ci/verify-dev-mcp-ban.cjs`
- **Purpose**: Prevent Dev MCP imports in production code
- **Scope**: app/ directory

## Environment Configuration

### Staging Environment
- **App**: hotdash-staging
- **URL**: https://hotdash-staging.fly.dev
- **Configuration**: fly.toml
- **Auto-deploy**: On push to main

### Production Environment
- **App**: hotdash-production
- **URL**: https://hotdash-production.fly.dev
- **Configuration**: fly.production.toml
- **Manual deploy**: Workflow dispatch only

### Required Secrets

#### GitHub Secrets
```bash
# Fly.io API token
FLY_API_TOKEN

# Email notifications
NOTIFICATION_EMAIL_USERNAME
NOTIFICATION_EMAIL_PASSWORD

# Database connections
DATABASE_URL
SUPABASE_URL
SUPABASE_ANON_KEY

# Shopify configuration
SHOPIFY_API_KEY
SHOPIFY_API_SECRET
```

#### Fly.io Secrets
```bash
# Set via: fly secrets set KEY=VALUE --app hotdash-production
DATABASE_URL="postgresql://..."
SHOPIFY_API_KEY="..."
SHOPIFY_API_SECRET="..."
SUPABASE_URL="..."
SUPABASE_ANON_KEY="..."

# IPv6 configuration (auto-set by deployment)
ECTO_IPV6=true
ERL_AFLAGS="-proto_dist inet6_tcp"
DATABASE_POOL_SIZE=10
DATABASE_TIMEOUT=30000
```

## Testing Strategy

### Automated Testing
```json
{
  "test:ci": "npm run test:unit && npm run test:e2e && npm run test:a1ly && npm run test:lighthouse"
}
```

#### Test Types
1. **Unit Tests**: `npm run test:unit`
   - Framework: Vitest
   - Coverage: Components and utilities

2. **E2E Tests**: `npm run test:e2e`
   - Framework: Playwright
   - Scope: Full application flows

3. **Accessibility Tests**: `npm run test:a11y`
   - Framework: Playwright + axe-core
   - Standards: WCAG 2.1 AA

4. **Lighthouse Tests**: `npm run test:lighthouse`
   - Framework: Lighthouse CI
   - Metrics: Performance, accessibility, SEO

### Quality Gates
- **Formatting**: Prettier formatting required
- **Linting**: ESLint validation required
- **Security**: Secret scanning required
- **Testing**: All tests must pass
- **CI Guards**: MCP evidence, heartbeat, dev MCP ban

## Deployment Process

### Staging Deployment
1. **Trigger**: Push to main branch
2. **Validation**: CI guards, pre-deployment checks
3. **Build**: Application build with production settings
4. **Deploy**: Deploy to hotdash-staging.fly.dev
5. **Health Check**: Verify deployment health
6. **Rollback**: Automatic rollback on failure

### Production Deployment
1. **Trigger**: Manual workflow dispatch
2. **Validation**: Business hours, staging health, CI checks
3. **Infrastructure**: IPv6 setup, database configuration
4. **Build**: Production-optimized build
5. **Deploy**: Deploy to hotdash-production.fly.dev
6. **Health Check**: Comprehensive health verification
7. **Rollback**: Automatic rollback on failure
8. **Notification**: Email notifications for status

## Monitoring and Observability

### Health Checks
- **Staging**: `https://hotdash-staging.fly.dev/health`
- **Production**: `https://hotdash-production.fly.dev/health`
- **Frequency**: Every 30 seconds
- **Timeout**: 5 seconds

### Deployment Monitoring
- **Status**: Fly.io machine status
- **Logs**: Application logs via flyctl
- **Metrics**: Performance metrics
- **Alerts**: Email notifications

### CI/CD Metrics
- **Build Success Rate**: Track build failures
- **Deployment Success Rate**: Track deployment failures
- **Test Coverage**: Monitor test coverage
- **Security Scan Results**: Track security issues

## Troubleshooting

### Common Issues

#### CI Failures
1. **Test Failures**: Check test output and fix failing tests
2. **Linting Errors**: Fix ESLint violations
3. **Formatting Issues**: Run prettier formatting
4. **Security Issues**: Address secret scanning alerts

#### Deployment Failures
1. **Build Failures**: Check build logs for errors
2. **Health Check Failures**: Verify application health
3. **Fly.io Issues**: Check Fly.io status and quotas
4. **Environment Issues**: Verify environment variables

#### Rollback Procedures
```bash
# Manual rollback if needed
flyctl releases --app hotdash-staging
flyctl deploy --app hotdash-staging --image <previous-image>

# Verify rollback
flyctl status --app hotdash-staging
curl -f https://hotdash-staging.fly.dev/health
```

### Debug Commands
```bash
# Check CI status
gh run list --workflow=ci.yml

# Check deployment status
gh run list --workflow=deploy-staging.yml
gh run list --workflow=deploy-production-enhanced.yml

# View logs
flyctl logs --app hotdash-staging
flyctl logs --app hotdash-production

# Check machine status
flyctl status --app hotdash-staging
flyctl status --app hotdash-production
```

## Security Considerations

### Secret Management
- All secrets stored in GitHub Secrets and Fly.io Secrets
- No secrets in code or configuration files
- Regular rotation of API keys and tokens

### Access Control
- Production deployments require manual approval
- GitHub Actions requires appropriate permissions
- Fly.io API tokens with limited scope

### Security Scanning
- Automated secret scanning in CI pipeline
- Dependency vulnerability scanning
- Container security scanning

## Performance Optimization

### Build Optimization
- npm cache for faster dependency installation
- Parallel job execution where possible
- Artifact caching and retention

### Deployment Optimization
- Rolling deployment strategy
- Health checks with appropriate timeouts
- Resource allocation optimization

### Monitoring Optimization
- Efficient health check intervals
- Minimal resource usage for monitoring
- Appropriate alert thresholds

## Compliance and Audit

### Deployment Tracking
- Comprehensive deployment metadata
- Audit trail in GitHub Actions
- Rollback event recording

### Documentation
- Pipeline configuration documented
- Deployment procedures documented
- Troubleshooting procedures documented

### Monitoring
- Health check monitoring
- Performance monitoring
- Security monitoring

---

**Last Updated**: 2025-10-23  
**Version**: 1.0  
**Maintained by**: DevOps Team
