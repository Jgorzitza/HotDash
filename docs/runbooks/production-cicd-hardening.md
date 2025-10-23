# Production CI/CD Pipeline Hardening

**Owner:** DevOps  
**Last Updated:** 2025-10-23  
**Status:** Active

## Overview

This document describes the hardened production CI/CD pipeline with automated testing gates, deployment approval workflows, security scanning, performance testing, and monitoring integration.

## Pipeline Architecture

### Quality Gates

All production deployments must pass through multiple quality gates:

```
┌─────────────────────────────────────────────────────────────┐
│                   Production Deployment                      │
└─────────────────────────────────────────────────────────────┘
                            ↑
                            │
┌─────────────────────────────────────────────────────────────┐
│              Deployment Quality Gate (Required)              │
├─────────────────────────────────────────────────────────────┤
│  1. Security Scan (Gitleaks + npm audit)                    │
│  2. Automated Tests (Unit + E2E + A11y + Lighthouse)        │
│  3. Performance Test (Lighthouse score ≥ 80)                │
│  4. Staging Health Check (Must be healthy)                  │
│  5. CI Guards (MCP Evidence + Heartbeat + Dev MCP Ban)      │
└─────────────────────────────────────────────────────────────┘
                            ↑
                            │
┌─────────────────────────────────────────────────────────────┐
│                  Manual Approval Required                    │
│              (GitHub Environment Protection)                 │
└─────────────────────────────────────────────────────────────┘
```

## Automated Testing Gates

### 1. Security Scanning

**Workflow:** `.github/workflows/production-deployment-gate.yml`

**Checks:**
- **Gitleaks:** Scans for secrets in code
- **npm audit:** Checks for vulnerable dependencies
- **SARIF Upload:** Results uploaded to GitHub Security tab

**Failure Conditions:**
- Secrets detected in code
- High or critical vulnerabilities in dependencies

**Remediation:**
- Rotate exposed secrets immediately
- Update vulnerable dependencies
- Re-run deployment after fixes

### 2. Automated Test Suite

**Tests Run:**
- **Unit Tests:** All unit tests must pass
- **E2E Tests:** End-to-end functionality tests
- **Accessibility Tests:** WCAG compliance checks
- **Lighthouse Tests:** Performance and best practices

**Failure Conditions:**
- Any test fails
- Test coverage below threshold
- Critical accessibility issues

**Artifacts:**
- Test results uploaded as artifacts
- Available for 30 days
- Viewable in GitHub Actions

### 3. Performance Testing

**Tool:** Lighthouse CI

**Thresholds:**
- Performance score: ≥ 80
- Accessibility score: ≥ 90
- Best practices score: ≥ 80
- SEO score: ≥ 80

**Failure Conditions:**
- Performance score below 80
- Critical performance regressions

**Metrics Tracked:**
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Time to Interactive (TTI)
- Cumulative Layout Shift (CLS)

### 4. Staging Health Check

**Endpoint:** `https://hotdash-staging.fly.dev/health`

**Checks:**
- Basic health endpoint (HTTP 200/302)
- Monitoring health endpoint
- Application responsiveness

**Failure Conditions:**
- Staging returns HTTP 5xx
- Health check timeout
- Monitoring endpoint unavailable

**Rationale:**
- Staging must be healthy before production deployment
- Validates deployment process works
- Catches environment-specific issues

### 5. CI Guards

**Guards Enforced:**
- **MCP Evidence:** All code changes have MCP evidence JSONL
- **Heartbeat:** Long-running tasks have heartbeat logs
- **Dev MCP Ban:** No Dev MCP imports in production code
- **Docs Policy:** All markdown files in allowed paths

**Failure Conditions:**
- Missing MCP evidence for code changes
- Stale heartbeat (>15 minutes)
- Dev MCP imports in `app/` directory
- Unauthorized markdown files

## Deployment Approval Workflow

### GitHub Environment Protection

**Environment:** `production`

**Protection Rules:**
1. **Required Reviewers:** 1 reviewer required
2. **Wait Timer:** 5 minute wait before deployment
3. **Deployment Branches:** Only `main` branch
4. **Environment Secrets:** Production secrets isolated

**Approval Process:**
1. Developer triggers deployment workflow
2. Quality gates run automatically
3. If gates pass, deployment waits for approval
4. Reviewer checks:
   - Deployment reason is valid
   - All gates passed
   - Staging is healthy
   - No active incidents
5. Reviewer approves deployment
6. Deployment proceeds automatically

### Manual Approval Required

**Who Can Approve:**
- Repository administrators
- Designated production approvers

**Approval Checklist:**
- [ ] Deployment reason documented
- [ ] All quality gates passed
- [ ] Staging is healthy and tested
- [ ] No active production incidents
- [ ] Rollback plan understood
- [ ] Monitoring dashboard ready

## Rollback Automation

### Automatic Rollback

**Triggers:**
- Health check fails after deployment
- Application returns HTTP 5xx errors
- Critical errors detected in logs

**Process:**
1. Detect failure condition
2. Capture current state
3. Identify previous stable version
4. Execute rollback via Fly.io
5. Wait for rollback to complete
6. Verify health checks pass
7. Send failure notification

**Workflow:** `.github/workflows/deploy-production-enhanced.yml` (rollback-on-failure job)

### Manual Rollback

**Methods:**
1. **Automated Script:** `./scripts/ops/rollback-production.sh`
2. **GitHub Actions:** Rollback Production workflow
3. **Fly.io CLI:** Manual rollback command

**Documentation:** `docs/runbooks/production-rollback-procedures.md`

## Deployment Notifications

### Success Notifications

**Sent When:**
- Deployment completes successfully
- All health checks pass

**Contains:**
- Commit SHA
- Deployment reason
- Deployed by (GitHub user)
- Deployment time
- Version number
- Health status
- App URL
- Workflow run link

**Recipients:**
- justin@hotrodan.com
- (Add more as needed)

### Failure Notifications

**Sent When:**
- Deployment fails
- Health checks fail
- Rollback triggered

**Contains:**
- Commit SHA
- Deployment reason
- Deployed by (GitHub user)
- Failure stage (build/deploy/health)
- Rollback status
- Workflow run link
- Action required

**Recipients:**
- justin@hotrodan.com
- On-call engineer (if configured)

### Notification Channels

**Current:**
- Email (via GitHub Actions)

**Future:**
- Slack integration
- PagerDuty for critical failures
- SMS for on-call engineers

## Monitoring Integration

### Pre-Deployment Monitoring

**Checks:**
- Staging health status
- Current production health
- Active alerts
- Error rates

**Source:** `/api/monitoring/health` endpoint

### Post-Deployment Monitoring

**Automated Checks:**
- Health endpoint verification
- Monitoring endpoint verification
- Error rate monitoring
- Performance metrics

**Duration:** 5 minutes after deployment

**Failure Actions:**
- Automatic rollback if health fails
- Alert on-call engineer
- Create incident issue

### Continuous Monitoring

**Workflow:** `.github/workflows/production-monitoring.yml`

**Frequency:** Every 15 minutes

**Checks:**
- Application availability
- Health endpoint status
- Error rates
- Performance metrics
- Alert status

**Actions:**
- Create GitHub issue on failure
- Update existing issues
- Track incident duration

## Pipeline Configuration Files

### Quality Gate Workflow

**File:** `.github/workflows/production-deployment-gate.yml`

**Purpose:** Enforce quality gates before deployment

**Jobs:**
- security-scan
- automated-tests
- performance-test
- staging-health
- ci-guards
- summary

### Production Deployment Workflow

**File:** `.github/workflows/deploy-production-enhanced.yml`

**Purpose:** Deploy to production with approval and monitoring

**Jobs:**
- deployment-gate (calls quality gate workflow)
- pre-deploy (validation)
- setup-infrastructure
- build
- deploy
- health-check
- rollback-on-failure (if needed)
- notify-failure (if needed)
- notify-success (if successful)
- summary

### Rollback Workflow

**File:** `.github/workflows/rollback-production.yml`

**Purpose:** Manual rollback trigger

**Jobs:**
- validate (check target version)
- rollback (execute rollback)
- verify (health checks)
- notify (send notifications)

## Security Measures

### Secret Management

**Storage:**
- GitHub Secrets (CI/CD)
- Fly.io Secrets (runtime)
- Local vault (development)

**Scanning:**
- Gitleaks on every commit
- Secret scanning enabled
- Push protection enabled

**Rotation:**
- Every 90 days minimum
- Immediately on exposure
- After team member departure

### Access Control

**GitHub:**
- Branch protection on `main`
- Required reviews for PRs
- Status checks required
- Environment protection for production

**Fly.io:**
- API token in GitHub Secrets
- Limited to deployment workflows
- Rotated regularly

## Troubleshooting

### Quality Gate Failures

**Security Scan Failed:**
1. Check Gitleaks output for secrets
2. Rotate any exposed secrets
3. Check npm audit for vulnerabilities
4. Update vulnerable dependencies
5. Re-run deployment

**Tests Failed:**
1. Check test results artifacts
2. Reproduce failures locally
3. Fix failing tests
4. Verify all tests pass locally
5. Push fixes and re-run

**Performance Test Failed:**
1. Check Lighthouse report
2. Identify performance regressions
3. Optimize slow operations
4. Re-run performance tests
5. Verify score ≥ 80

**Staging Health Failed:**
1. Check staging logs
2. Verify staging deployment
3. Fix staging issues
4. Wait for staging to stabilize
5. Re-run deployment

### Deployment Failures

**Build Failed:**
1. Check build logs
2. Verify dependencies install
3. Check for TypeScript errors
4. Fix build issues locally
5. Push fixes and re-deploy

**Deploy Failed:**
1. Check Fly.io status
2. Verify API token valid
3. Check machine status
4. Review deployment logs
5. Contact Fly.io support if needed

**Health Check Failed:**
1. Check application logs
2. Verify database connectivity
3. Check environment variables
4. Automatic rollback triggered
5. Investigate root cause

## Metrics and KPIs

### Deployment Metrics

- **Deployment Frequency:** Track deployments per week
- **Lead Time:** Time from commit to production
- **Change Failure Rate:** % of deployments requiring rollback
- **Mean Time to Recovery (MTTR):** Time to recover from failures

### Quality Metrics

- **Test Pass Rate:** % of tests passing
- **Security Scan Pass Rate:** % of scans with no issues
- **Performance Score:** Average Lighthouse score
- **Staging Health:** % uptime of staging environment

### Target SLOs

- Deployment frequency: ≥ 2 per week
- Lead time: < 2 hours
- Change failure rate: < 5%
- MTTR: < 30 minutes
- Test pass rate: 100%
- Security scan pass rate: 100%
- Performance score: ≥ 85
- Staging health: ≥ 99.5%

## Related Documentation

- [Production Deployment Guide](./production-deployment-enhanced.md)
- [Production Rollback Procedures](./production-rollback-procedures.md)
- [CI/CD Pipeline Configuration](./cicd-pipeline-configuration.md)
- [Production Monitoring](../lib/monitoring/README.md)

## Revision History

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2025-10-23 | 1.0 | Initial version | DevOps |

