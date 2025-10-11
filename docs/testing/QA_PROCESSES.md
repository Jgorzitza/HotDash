# QA Processes and Workflows

**Version**: 1.0  
**Date**: 2025-10-11  
**Owner**: QA Team  
**Scope**: HotDash Operator Control Center

---

## Table of Contents

1. [QA Team Mission](#qa-team-mission)
2. [Quality Gates](#quality-gates)
3. [Test Execution Workflows](#test-execution-workflows)
4. [Bug Management](#bug-management)
5. [Release Testing](#release-testing)
6. [Regression Testing](#regression-testing)
7. [Performance Monitoring](#performance-monitoring)
8. [Security Auditing](#security-auditing)
9. [Metrics & Reporting](#metrics--reporting)

---

## QA Team Mission

**Mission**: Guard evidence gates and ensure every release meets quality standards before reaching production.

**Principles**:
- **Evidence-Based**: All claims backed by test results, screenshots, or logs
- **Proactive**: Find issues before they reach production
- **Automated**: Automate repetitive testing tasks
- **Collaborative**: Partner with engineering to improve testability

**Scope**:
- Local development environment validation
- CI/CD pipeline health monitoring
- Test suite maintenance and expansion
- Security and performance auditing
- Release sign-off

---

## Quality Gates

### Gate 1: Code Quality
**Trigger**: Every PR  
**Owner**: CI Automation  
**Checks**:
- ✅ TypeScript compilation (`npm run typecheck`)
- ✅ ESLint passes with zero warnings
- ✅ No `console.log()` in production code
- ✅ Conventional commit message format

**SLA**: Results within 5 minutes  
**Failure Action**: Block PR merge

---

### Gate 2: Unit Tests
**Trigger**: Every PR  
**Owner**: CI Automation + QA Review  
**Checks**:
- ✅ All unit tests pass (100% pass rate required)
- ✅ Coverage reported (target: >80%)
- ✅ No `.only()` or `.skip()` without justification
- ✅ New features have tests

**SLA**: Results within 10 minutes  
**Failure Action**: Block PR merge

---

### Gate 3: Integration Tests
**Trigger**: Every PR touching services or webhooks  
**Owner**: QA Team  
**Checks**:
- ✅ Webhook signature verification tests pass
- ✅ Service integration tests pass
- ✅ Database migration tests pass (rollback capability verified)
- ✅ MCP service interaction tests pass

**SLA**: Results within 15 minutes  
**Failure Action**: Block PR merge, assign to QA for diagnosis

---

### Gate 4: E2E Tests
**Trigger**: Every PR, staging deployment  
**Owner**: QA Team  
**Checks**:
- ✅ Critical path Playwright tests pass (mock mode)
- ✅ Dashboard renders without errors
- ✅ Approval queue workflows complete successfully
- ✅ No console errors during test run

**SLA**: Results within 15 minutes  
**Failure Action**: Block PR merge

---

### Gate 5: Accessibility
**Trigger**: Every PR touching UI  
**Owner**: QA Team  
**Checks**:
- ✅ Zero WCAG 2.1 AA violations
- ✅ Keyboard navigation works
- ✅ Screen reader compatibility verified
- ✅ Color contrast meets standards

**SLA**: Results within 10 minutes  
**Failure Action**: Block PR merge

---

### Gate 6: Security
**Trigger**: Every PR, weekly scheduled scan  
**Owner**: QA Team + Security  
**Checks**:
- ✅ No secrets in code (`gitleaks` scan)
- ✅ npm audit clean (no high/critical vulnerabilities)
- ✅ No SQL injection vulnerabilities
- ✅ CSRF protection validated

**SLA**: Results within 10 minutes  
**Failure Action**: Block PR merge for critical issues

---

### Gate 7: Performance
**Trigger**: Staging deployment, production deployment  
**Owner**: QA Team  
**Checks**:
- ✅ Lighthouse Performance score ≥ 90
- ✅ Lighthouse Accessibility score ≥ 95
- ✅ Route latencies within budget (<100ms P95 for critical)
- ✅ MCP services within budget (<500ms P95 for LlamaIndex)

**SLA**: Results within 20 minutes  
**Failure Action**: Warning (document regression, plan fix)

---

## Test Execution Workflows

### Daily: Continuous Testing

```mermaid
Developer pushes commit
  ↓
GitHub Actions triggers
  ├→ Gate 1: Code Quality (5 min)
  ├→ Gate 2: Unit Tests (10 min)
  ├→ Gate 3: E2E Tests (mock mode, 15 min)
  └→ Gate 4: Accessibility (10 min)
  ↓
All pass → ✅ Ready for review
Any fail → ❌ Block PR, notify developer
```

**Process**:
1. Developer pushes to PR branch
2. CI runs quality gates automatically
3. QA monitors for failures
4. QA investigates any flaky or unclear failures
5. QA comments on PR with guidance if needed

**QA Actions**:
- Monitor #github-notifications for test failures
- Investigate failures within 30 minutes
- Tag @engineer if test needs fixing
- Tag @developer if code needs fixing

---

### Weekly: Regression Suite

**Schedule**: Every Monday 9am  
**Duration**: 30 minutes  
**Owner**: QA Team

**Process**:
1. Run full E2E suite (`npm run test:e2e`)
2. Run accessibility suite (`npm run test:a11y`)
3. Run performance benchmarks (`npm run perf:all`)
4. Generate coverage report
5. Document any regressions in `feedback/qa.md`
6. File issues for any new failures

**Deliverable**: Weekly testing report in `feedback/qa.md`

---

### Monthly: Comprehensive Audit

**Schedule**: First Monday of month  
**Duration**: 4 hours  
**Owner**: QA Team

**Scope**:
- Security penetration testing
- Performance baseline updates
- Test coverage gaps analysis
- Test debt review
- CI/CD health check
- Documentation review

**Deliverable**: Monthly QA audit report to manager

---

### Quarterly: External Assessment

**Schedule**: End of quarter  
**Duration**: 1 week  
**Owner**: QA Team + External Auditor

**Scope**:
- Third-party penetration testing
- Accessibility audit (WCAG 2.1 AA)
- Load testing
- Security assessment
- Compliance review (GDPR, SOC 2)

**Deliverable**: External audit report + remediation plan

---

## Bug Management

### Bug Lifecycle

```
New → Triaged → In Progress → Fixed → Verified → Closed
 ↓      ↓           ↓           ↓        ↓          ↓
P0-P3  Owner     Engineer    QA Test  Deploy   Release
```

### Bug Severity Classification

| Priority | Description | SLA | Example |
|----------|-------------|-----|---------|
| P0 | Critical - Production down | 1 hour | Database offline, authentication broken |
| P1 | High - Major functionality broken | 24 hours | Approval queue not loading, webhook failing |
| P2 | Medium - Workaround exists | 1 week | UI glitch, minor data inconsistency |
| P3 | Low - Enhancement or minor issue | Next sprint | Cosmetic issues, documentation typos |

### Bug Report Template

```markdown
## Bug Description
[Clear, concise description of the issue]

## Steps to Reproduce
1. Go to '/app/approvals'
2. Click 'Approve' on first item
3. Observe error

## Expected Behavior
Approval should succeed and item should be removed from queue

## Actual Behavior
Error: "Failed to send reply to Chatwoot"

## Environment
- Environment: Staging
- Browser: Chrome 118
- User Role: Operator
- Timestamp: 2025-10-11T15:00:00Z

## Evidence
- Screenshot: artifacts/bugs/bug-123-screenshot.png
- Console log: artifacts/bugs/bug-123-console.log
- Network trace: artifacts/bugs/bug-123-network.har

## Impact
- Severity: P1 (High)
- Users Affected: All operators
- Workaround: Use Chatwoot UI directly

## Additional Context
[Any other relevant information]
```

---

## Release Testing

### Pre-Release Checklist

**Staging Deployment**:
- [ ] All quality gates pass
- [ ] E2E tests pass in staging environment
- [ ] Smoke tests pass (`mock=0` with real credentials)
- [ ] Performance benchmarks meet targets
- [ ] Accessibility scan clean
- [ ] Security scan clean
- [ ] Lighthouse scores meet targets
- [ ] Database migrations tested (forward and rollback)
- [ ] Evidence artifacts captured and linked

**Production Deployment**:
- [ ] Staging tests all pass
- [ ] Manager approval obtained
- [ ] Rollback plan documented
- [ ] Monitoring alerts configured
- [ ] Incident response team notified
- [ ] Release notes reviewed
- [ ] Post-deployment smoke test plan ready

### Post-Release Verification

**Within 30 minutes of deployment**:
1. Run production smoke tests
2. Check error rates in logs
3. Verify performance metrics
4. Monitor user activity
5. Check for elevated error rates
6. Confirm all features working

**Within 24 hours**:
1. Review error logs for anomalies
2. Check performance dashboard for regressions
3. Validate analytics data flowing correctly
4. Review customer support tickets for issues

---

## Regression Testing

### Regression Test Suite

**Scope**: Critical user journeys that must never break

**Tests**:
1. Operator can view dashboard
2. Operator can view approval queue
3. Operator can approve drafts
4. Operator can reject drafts
5. Operator can edit drafts
6. Operator can escalate cases
7. Real-time notifications work
8. Shopify Admin embed works

**Execution**:
- Automated: Every PR (CI)
- Manual: Before every release (QA)
- Schedule: Weekly Monday regression suite

### Regression Test Workflow

```
New Bug Found
  ↓
Create Regression Test (fails)
  ↓
Fix Bug
  ↓
Regression Test Passes
  ↓
Add to Regression Suite
  ↓
Never Break Again ✅
```

---

## Performance Monitoring

### Continuous Monitoring

**Automated**:
- Lighthouse CI on every PR
- Route latency tracking
- MCP service health checks
- Database query performance

**Manual**:
- Weekly performance benchmark runs
- Monthly performance audit
- Load testing before major releases

### Performance Regression Response

**Detected**: Lighthouse score drops >5 points OR P95 latency increases >20%

**Response**:
1. File performance regression issue (P1)
2. Run detailed profiling
3. Identify slow queries/components
4. Tag @engineer with evidence
5. Verify fix with before/after benchmarks

---

## Security Auditing

### Security Audit Schedule

**Weekly**:
- Automated dependency scan (`npm audit`)
- Secret scanning (`gitleaks`)
- OWASP ZAP baseline scan

**Monthly**:
- Manual penetration testing (QA team)
- Security test suite execution
- Vulnerability assessment

**Quarterly**:
- External penetration testing (3rd party)
- Compliance audit (GDPR, SOC 2)
- Security architecture review

### Security Issue Response

**P0 (Critical - Active Exploit)**:
1. Immediately notify security team and manager
2. Isolate affected systems
3. Apply emergency patch
4. Verify fix
5. Post-mortem within 24 hours

**P1 (High - Vulnerability with Known Exploit)**:
1. Notify security team within 1 hour
2. Schedule patch within 48 hours
3. Test thoroughly
4. Deploy to production
5. Document in security log

---

## Metrics & Reporting

### Daily Metrics

**Automated** (Slack #qa-metrics):
- Test pass rate (target: 100%)
- Test execution time (target: <30s unit, <5min E2E)
- Coverage percentage (target: >80%)
- Failed test count
- Flaky test count

### Weekly Report

**To**: Engineering team via `feedback/qa.md`

**Contents**:
- Test suite health summary
- New tests added this week
- Tests fixed/removed this week
- Coverage trend
- Known issues
- Action items

### Monthly Report

**To**: Manager

**Contents**:
- Quality metrics summary
- Test coverage progress
- Bug trends (filed vs. fixed)
- Performance trends
- Security findings
- Recommendations

---

## Escalation Procedures

### When to Escalate to Manager

- Critical test infrastructure failure
- Persistent test flakiness (>5% failure rate)
- Security vulnerability discovered
- Performance regression blocking release
- Resource constraints (time, tooling)

### When to Escalate to Engineer

- Test failures due to code changes
- Need help understanding functionality
- Test environment setup issues
- CI/CD pipeline failures

### When to Escalate to DevOps/Reliability

- CI runner issues
- Test environment instability
- Deployment pipeline failures
- Infrastructure performance issues

---

## QA Tools & Access

### Required Tools
- GitHub account (for PR reviews)
- Slack access (#qa, #engineering, #github-notifications)
- Supabase access (staging, local)
- Shopify Partner account (for Admin testing)
- Chatwoot admin access (for integration testing)

### Required Credentials
- `PLAYWRIGHT_SHOPIFY_EMAIL` - Shopify test account
- `PLAYWRIGHT_SHOPIFY_PASSWORD` - Shopify test account
- Supabase service keys (staging, local)
- Chatwoot API token (staging, local)

**Stored in**: `vault/occ/` and GitHub Secrets

---

## Continuous Improvement

### QA Retrospectives (Monthly)

**Questions**:
- What testing improvements did we make?
- What bugs escaped to production?
- What slowed us down?
- What can we automate?
- What documentation needs updating?

**Actions**:
- Update test strategy
- Improve automation
- Enhance documentation
- Optimize processes

---

**End of QA Processes Documentation**

**Related Docs**:
- [Testing Guide](./TESTING_GUIDE.md)
- [Best Practices](./BEST_PRACTICES.md)
- [Bug Reporting](./BUG_REPORTING.md) (Task P)
- [Test Maintenance Plan](./TEST_MAINTENANCE.md) (Task Q)

**Maintained by**: QA Team  
**Last Updated**: 2025-10-11

