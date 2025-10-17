# Bug Reporting and Triage Procedures

**Version**: 1.0  
**Date**: 2025-10-11  
**Owner**: QA Team  
**Process**: Bug Lifecycle Management

---

## Quick Reference

**Filing a Bug**: Use template below, attach evidence, set priority  
**Triaging Bugs**: QA reviews within 4 hours, assigns priority and owner  
**Fixing Bugs**: Engineer fixes, QA verifies before closing

---

## Bug Severity Classification

### P0: Critical (Production Down)

**Definition**: Core functionality completely broken, users cannot work  
**Examples**:

- Dashboard won't load (500 error)
- Authentication system down
- Database offline
- All API requests failing

**SLA**: 1 hour response, 4 hour fix  
**Notification**: Immediate (Slack @channel, email, SMS)  
**Owner**: On-call engineer + QA  
**Testing**: Immediate verification in production

---

### P1: High (Major Feature Broken)

**Definition**: Major functionality broken, significant user impact, workaround exists  
**Examples**:

- Approval queue not loading
- Cannot approve drafts
- Webhook processing failing
- Real-time updates not working

**SLA**: 4 hour response, 24 hour fix  
**Notification**: Slack tag, GitHub issue  
**Owner**: Feature owner + QA  
**Testing**: Verify in staging before production deploy

---

### P2: Medium (Minor Feature Issues)

**Definition**: Minor functionality affected, workaround exists, limited user impact  
**Examples**:

- UI rendering glitch
- Slow loading (but works)
- Minor data inconsistency
- Feature works but UX is poor

**SLA**: 24 hour response, 1 week fix  
**Notification**: GitHub issue  
**Owner**: Assigned to sprint  
**Testing**: Standard PR review process

---

### P3: Low (Cosmetic or Enhancement)

**Definition**: Cosmetic issue, documentation error, enhancement request  
**Examples**:

- Button alignment off by 2px
- Tooltip text typo
- Missing help text
- Feature request

**SLA**: Next sprint planning  
**Notification**: GitHub issue  
**Owner**: Backlog  
**Testing**: Standard PR review process

---

## Bug Report Template

### GitHub Issue Template

```markdown
---
name: Bug Report
about: Report a bug or issue
title: "[BUG] "
labels: bug, needs-triage
---

## 🐛 Bug Description

[Clear, concise description of what went wrong]

## 📋 Steps to Reproduce

1. Navigate to '/app/approvals'
2. Click 'Approve' on first queue item
3. Click 'Confirm' in modal
4. Observe error

## ✅ Expected Behavior

- Approval should succeed
- Item should be removed from queue
- Success notification should appear
- Response should be sent to customer

## ❌ Actual Behavior

- Error message: "Failed to send reply to Chatwoot"
- Item remains in queue
- No notification shown
- Customer did not receive response

## 🌍 Environment

- **Environment**: Staging / Production
- **Browser**: Chrome 118.0.5993.88
- **OS**: macOS 14.0
- **User**: operator-user-001
- **Shop**: test-shop.myshopify.com
- **Timestamp**: 2025-10-11T15:30:00Z

## 📸 Evidence

- Screenshot: [Attach or link]
- Console log: [Paste or attach]
- Network HAR: [Attach if available]
- Stack trace: [Paste if available]

## 📊 Impact Assessment

- **Severity**: P0 / P1 / P2 / P3 (QA will verify)
- **Users Affected**: All operators / Specific user / Single incident
- **Frequency**: Always / Intermittent / Once
- **Workaround Available**: Yes / No
  - If yes, describe: [Workaround steps]

## 🔍 Additional Context

[Any other information that might be helpful]

- Recent deployments?
- Related changes?
- Similar past issues?

## ✅ Definition of Done

- [ ] Root cause identified
- [ ] Fix implemented
- [ ] Regression test added
- [ ] QA verified in staging
- [ ] Deployed to production
- [ ] Monitoring confirms fix
```

---

## Bug Triage Process

### QA Triage (Within 4 Hours)

**Steps**:

1. **Verify**: Reproduce the bug
2. **Classify**: Assign severity (P0-P3)
3. **Assess**: Determine user impact
4. **Evidence**: Ensure evidence attached
5. **Assign**: Tag appropriate owner
6. **Label**: Add relevant labels

**Labels**:

- `bug` - Confirmed bug
- `needs-reproduction` - Cannot reproduce
- `needs-investigation` - Needs deeper analysis
- `regression` - Previously worked, now broken
- `flaky-test` - Intermittent test failure
- `wontfix` - Intentional behavior
- `duplicate` - Duplicate of existing issue

### Priority Matrix

| User Impact →     | Low | Medium | High |
| ----------------- | --- | ------ | ---- |
| **Frequency ↓**   |     |        |      |
| **Always**        | P2  | P1     | P0   |
| **Often (>10%)**  | P3  | P2     | P1   |
| **Rarely (<10%)** | P3  | P3     | P2   |

---

## Bug Verification Process

### Before Marking "Fixed"

**QA Must**:

1. Pull fix branch
2. Reproduce original bug (should fail before fix)
3. Verify bug is fixed (should pass after fix)
4. Run regression tests
5. Check for side effects
6. Verify regression test added
7. Document verification in issue

**Verification Template**:

```markdown
## ✅ QA Verification

**Tested**: 2025-10-11T16:00:00Z  
**Environment**: Staging  
**Tester**: @qa-agent

### Test Results

- [x] Reproduced original bug
- [x] Verified fix resolves issue
- [x] Regression test added: tests/unit/approval-fix.spec.ts
- [x] No side effects observed
- [x] Related functionality works

### Evidence

- Before (broken): artifacts/qa/bug-123-before.png
- After (fixed): artifacts/qa/bug-123-after.png
- Test output: artifacts/qa/bug-123-test-results.log

**Status**: ✅ VERIFIED - Ready for production
```

---

## Common Bug Categories

### 1. Functional Bugs

**Definition**: Feature doesn't work as designed  
**Example**: Approve button doesn't send response  
**Test**: Add integration or E2E test

### 2. UI/UX Bugs

**Definition**: Visual or interaction issues  
**Example**: Button too small, poor contrast  
**Test**: Add visual regression or accessibility test

### 3. Performance Bugs

**Definition**: Feature works but too slowly  
**Example**: Approval queue loads in 5 seconds  
**Test**: Add performance benchmark test

### 4. Security Bugs

**Definition**: Security vulnerability  
**Example**: XSS injection possible  
**Test**: Add security test case

### 5. Data Bugs

**Definition**: Data integrity issues  
**Example**: Confidence score shows 150% (impossible)  
**Test**: Add validation test

### 6. Integration Bugs

**Definition**: Service integration failure  
**Example**: Chatwoot API returns 500  
**Test**: Add integration test with error scenario

---

## Bug Investigation Tools

### Browser DevTools

- **Console**: Check for JavaScript errors
- **Network**: Inspect API requests/responses
- **Application**: Check localStorage, cookies, cache
- **Performance**: Profile slow operations

### Playwright Inspector

```bash
# Debug test interactively
npx playwright test --debug tests/e2e/approval-queue.spec.ts

# Generate trace for analysis
npx playwright test --trace on
npx playwright show-trace trace.zip
```

### Database Inspection

```bash
# Check Supabase tables
npx supabase db inspect

# Query specific data
psql $DATABASE_URL -c "SELECT * FROM agent_sdk_approval_queue WHERE status = 'error'"
```

### Log Analysis

```bash
# Check application logs
npm run ops:tail-logs

# Check Supabase edge function logs
npx supabase functions logs chatwoot-webhook

# Check CI logs
gh run view <run-id> --log-failed
```

---

## Bug Prevention

### Pre-Commit Checks

- TypeScript compilation
- Unit tests pass
- Linting clean

### PR Requirements

- Tests included
- Description explains "why"
- Evidence of manual testing
- Accessibility checked
- Performance impact considered

### Code Review Checklist

- Business logic tested
- Error handling present
- Edge cases considered
- Security implications reviewed
- Performance implications reviewed

---

## Flaky Test Management

### Identifying Flaky Tests

**Indicators**:

- Passes sometimes, fails other times
- Fails in CI but passes locally
- Timing-dependent failures
- Order-dependent failures

**Tracking**:

```yaml
# .github/workflows/flaky-test-tracking.yml
# Runs tests 10 times to detect flakiness
- name: Detect flaky tests
  run: |
    for i in {1..10}; do
      npm run test:e2e || echo "Run $i failed"
    done
```

### Fixing Flaky Tests

**Common Causes & Fixes**:

| Cause                 | Fix                                       |
| --------------------- | ----------------------------------------- |
| Race conditions       | Add proper `waitFor` statements           |
| Timing dependencies   | Use deterministic waits, not `setTimeout` |
| Random test data      | Use seeded random or fixed data           |
| External dependencies | Mock external services                    |
| Order dependencies    | Make tests independent                    |
| Shared state          | Clean up between tests                    |

### Last Resort: Quarantine

```typescript
// Mark as flaky while investigating
test.fixme("flaky test - see issue #789", async () => {
  // Test is not run in CI
  // But preserved for investigation
});
```

---

## Release Blocker Criteria

**PR is BLOCKED from merging if**:

- Any quality gate fails (code, tests, security)
- P0 bugs introduced
- Test coverage decreases >5%
- Performance regresses >20%
- Accessibility violations introduced
- Security vulnerabilities introduced

**Release is BLOCKED if**:

- Any P0 bugs open
- > 3 P1 bugs open
- Regression test suite fails
- Staging smoke tests fail
- Performance targets not met
- Security scan has critical findings

---

## QA Sign-Off Process

### PR Approval

QA signs off when:

- [ ] All quality gates pass
- [ ] Tests added for new functionality
- [ ] No new bugs introduced
- [ ] Evidence attached (screenshots for UI changes)
- [ ] Documentation updated if needed

### Release Approval

QA signs off when:

- [ ] All PRs in release are approved
- [ ] Staging tests all pass
- [ ] Smoke tests pass
- [ ] Performance benchmarks meet targets
- [ ] No critical bugs open
- [ ] Rollback plan documented

**Sign-off Format**:

```markdown
## ✅ QA Sign-Off

**PR #123**: Approval Queue UI Implementation  
**Reviewer**: @qa-agent  
**Date**: 2025-10-11

### Verification Results

- [x] All quality gates passed
- [x] Manual testing completed (see artifacts/qa/pr-123/)
- [x] Accessibility verified (0 violations)
- [x] Performance verified (P95 < 200ms)
- [x] Security reviewed (no concerns)

**Status**: ✅ APPROVED for merge

**Evidence**: artifacts/qa/pr-123-signoff/
```

---

**End of Bug Reporting and Triage Procedures**

**Maintained by**: QA Team  
**Last Updated**: 2025-10-11  
**Process Owner**: QA Lead
