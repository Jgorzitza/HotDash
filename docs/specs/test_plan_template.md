# Test Plan Template

**File:** `docs/specs/test_plan_template.md`  
**Owner:** QA Agent  
**Purpose:** Standard template for test planning and evidence validation  
**Version:** 1.0  
**Last Updated:** 2025-10-15

---

## How to Use This Template

1. **Copy this template** for each new feature or significant change
2. **Fill in all sections** before implementation begins
3. **Update evidence** as tests are executed
4. **Link to GitHub Issue** and PR for traceability
5. **Validate DoD** before marking complete

---

## Test Plan: [Feature/Task Name]

**GitHub Issue:** #[issue-number]  
**Pull Request:** #[pr-number]  
**Agent:** [agent-name]  
**Created:** [YYYY-MM-DD]  
**Status:** [Draft | In Progress | Complete]

---

## 1) Scope & Objectives

### Feature Summary
[1-3 sentence description of what is being built/changed]

### Testing Objectives
- [ ] Verify acceptance criteria are met
- [ ] Ensure no regressions in existing functionality
- [ ] Validate error handling and edge cases
- [ ] Confirm rollback plan works
- [ ] Verify performance within budgets

### In Scope
- [What will be tested]
- [Specific features/components]
- [User flows]

### Out of Scope
- [What will NOT be tested in this plan]
- [Deferred to future testing]

---

## 2) Acceptance Criteria (from Issue)

Copy acceptance criteria from the GitHub Issue:

- [ ] [Criterion 1]
- [ ] [Criterion 2]
- [ ] [Criterion 3]

**Testability Check:**
- [ ] All criteria are measurable
- [ ] All criteria have clear pass/fail conditions
- [ ] All criteria can be verified with evidence

---

## 3) Test Types & Coverage

### 3.1 Unit Tests

**Framework:** Vitest  
**Coverage Target:** ≥ 80% for new code  
**Location:** `[path/to/tests]`

**Test Cases:**
| Test Case | Description | Status | Evidence |
|-----------|-------------|--------|----------|
| [Test 1] | [What it tests] | [ ] | [Link to test file] |
| [Test 2] | [What it tests] | [ ] | [Link to test file] |

**Commands:**
```bash
# Run unit tests
npm run test:unit

# Run with coverage
npm run test:coverage
```

---

### 3.2 Integration Tests

**Framework:** Vitest  
**Time Budget:** < 2 minutes  
**Location:** `[path/to/integration-tests]`

**Test Cases:**
| Test Case | Description | Dependencies | Status | Evidence |
|-----------|-------------|--------------|--------|----------|
| [Test 1] | [What it tests] | [External services] | [ ] | [Link] |
| [Test 2] | [What it tests] | [External services] | [ ] | [Link] |

**Commands:**
```bash
# Run integration tests
npm run test:integration
```

**Mocking Strategy:**
- [Which services are mocked]
- [Which services are real (staging)]
- [Test data fixtures used]

---

### 3.3 End-to-End (E2E) Tests

**Framework:** Playwright  
**Time Budget:** < 5 minutes  
**Environment:** Staging only  
**Location:** `[path/to/e2e-tests]`

**User Flows:**
| Flow | Steps | Expected Result | Status | Evidence |
|------|-------|-----------------|--------|----------|
| [Flow 1] | [Step-by-step] | [What user sees] | [ ] | [Screenshot/video] |
| [Flow 2] | [Step-by-step] | [What user sees] | [ ] | [Screenshot/video] |

**Commands:**
```bash
# Run E2E tests
npm run test:e2e

# Run specific test
npm run test:e2e -- [test-name]
```

**Test Data:**
- [Fixtures used]
- [Staging data requirements]
- [Cleanup strategy]

---

### 3.4 Manual Testing

**When Required:**
- [ ] UI/UX validation
- [ ] Accessibility testing
- [ ] Cross-browser compatibility
- [ ] Mobile responsiveness
- [ ] Performance validation

**Test Cases:**
| Test Case | Steps | Expected Result | Status | Evidence |
|-----------|-------|-----------------|--------|----------|
| [Test 1] | [Manual steps] | [Expected outcome] | [ ] | [Screenshot] |
| [Test 2] | [Manual steps] | [Expected outcome] | [ ] | [Screenshot] |

---

## 4) Evidence Requirements

### 4.1 Test Results

**Required Evidence:**
- [ ] All unit tests passing (screenshot or CI log)
- [ ] Integration tests passing (screenshot or CI log)
- [ ] E2E tests passing (screenshot or CI log)
- [ ] Coverage report showing ≥ 80% (screenshot)

**Evidence Location:**
- CI Logs: [Link to GitHub Actions run]
- Coverage Report: [Link to coverage report]
- Test Artifacts: [Link to test output files]

---

### 4.2 Functional Evidence

**Required Evidence:**
- [ ] Screenshots of working feature (before/after if applicable)
- [ ] Video/GIF of user flow (for complex interactions)
- [ ] API response samples (for backend changes)
- [ ] Database state verification (for data changes)

**Evidence Location:**
- Screenshots: [Link to PR comment or artifact]
- Videos: [Link to Loom/recording]
- API Samples: [Link to logs or PR comment]

---

### 4.3 Performance Evidence

**Required Evidence:**
- [ ] P95 latency < budget (specify budget)
- [ ] Page load time < 3s (for UI changes)
- [ ] API response time < budget (specify budget)
- [ ] No memory leaks detected

**Evidence Location:**
- Performance Logs: [Link to metrics]
- Lighthouse Report: [Link to report] (if UI)
- Profiling Results: [Link to profiler output]

---

### 4.4 Security Evidence

**Required Evidence:**
- [ ] Gitleaks scan passing (no secrets detected)
- [ ] No PII in test data or logs
- [ ] Authentication/authorization tested
- [ ] Input validation tested

**Evidence Location:**
- Gitleaks Report: [Link to CI run]
- Security Test Results: [Link to test output]

---

## 5) Error Handling & Edge Cases

### Error Scenarios
| Scenario | Expected Behavior | Test Status | Evidence |
|----------|-------------------|-------------|----------|
| [Error 1] | [How system handles it] | [ ] | [Link] |
| [Error 2] | [How system handles it] | [ ] | [Link] |

### Edge Cases
| Edge Case | Expected Behavior | Test Status | Evidence |
|-----------|-------------------|-------------|----------|
| [Edge 1] | [How system handles it] | [ ] | [Link] |
| [Edge 2] | [How system handles it] | [ ] | [Link] |

---

## 6) Rollback Plan

### Rollback Strategy
[Describe how to undo this change if needed]

### Rollback Steps
1. [Step 1]
2. [Step 2]
3. [Step 3]

### Rollback Testing
- [ ] Rollback steps documented
- [ ] Rollback tested in staging
- [ ] Rollback time estimated: [X minutes]
- [ ] Data recovery plan documented (if applicable)

**Rollback Evidence:**
- [Link to rollback test results]
- [Screenshot of successful rollback]

---

## 7) Definition of Done (DoD) Checklist

### Global DoD (from NORTH_STAR)
- [ ] Acceptance criteria satisfied with tests/evidence
- [ ] Rollback documented and tested
- [ ] Calls are MCP/SDK-backed (no speculative endpoints)
- [ ] HITL reviews/grades captured (if customer-facing)
- [ ] Issue linkage present (`Fixes #<issue>`)
- [ ] Allowed paths declared and respected
- [ ] CI checks green (Docs Policy, Danger, Gitleaks, AI Config)
- [ ] No disallowed `.md` files created
- [ ] Metrics updated if behavior changed
- [ ] Audit entry present (if runtime change)

### Feature-Specific DoD
- [ ] [Feature-specific criterion 1]
- [ ] [Feature-specific criterion 2]
- [ ] [Feature-specific criterion 3]

### Test-Specific DoD
- [ ] Unit tests: ≥ 80% coverage
- [ ] Integration tests: < 2 minutes execution time
- [ ] E2E tests: < 5 minutes execution time
- [ ] All tests passing in CI
- [ ] No flaky tests (3 consecutive passes)
- [ ] Test data uses fixtures only (no production data)
- [ ] Evidence uploaded and linked in PR

---

## 8) Dependencies & Blockers

### Dependencies
- [ ] [Dependency 1: description]
- [ ] [Dependency 2: description]

### Blockers
- [ ] [Blocker 1: description and owner]
- [ ] [Blocker 2: description and owner]

### External Services
- [ ] [Service 1: status and access]
- [ ] [Service 2: status and access]

---

## 9) Risk Assessment

### Risks
| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| [Risk 1] | [High/Med/Low] | [High/Med/Low] | [How to mitigate] |
| [Risk 2] | [High/Med/Low] | [High/Med/Low] | [How to mitigate] |

### Data Risks
- [ ] No production data used in tests
- [ ] No PII in test fixtures
- [ ] Test data cleanup strategy defined

---

## 10) Sign-off

### QA Approval
- [ ] All tests passing
- [ ] Evidence complete and valid
- [ ] DoD checklist satisfied
- [ ] Rollback plan tested
- [ ] No blockers remaining

**QA Sign-off:**  
Name: [QA Agent]  
Date: [YYYY-MM-DD]  
Status: [Approved | Needs Changes]  
Notes: [Any additional notes]

### Manager Approval
- [ ] Acceptance criteria met
- [ ] Evidence reviewed
- [ ] Governance checks passed
- [ ] Ready to merge/deploy

**Manager Sign-off:**  
Name: [Manager]  
Date: [YYYY-MM-DD]  
Status: [Approved | Needs Changes]  
Notes: [Any additional notes]

---

## 11) Post-Deployment Validation

### Production Checks (if applicable)
- [ ] Feature deployed successfully
- [ ] Smoke tests passing in production
- [ ] Metrics within expected ranges
- [ ] No errors in production logs
- [ ] Rollback plan accessible

### Monitoring
- [ ] Alerts configured (if needed)
- [ ] Dashboards updated (if needed)
- [ ] Metrics tracked: [List metrics]

---

## 12) Lessons Learned

### What Went Well
- [Item 1]
- [Item 2]

### What Could Be Improved
- [Item 1]
- [Item 2]

### Action Items for Future
- [ ] [Action 1]
- [ ] [Action 2]

---

## Appendix: Quick Reference

### Test Commands
```bash
# Run all tests
npm run test

# Run specific test type
npm run test:unit
npm run test:integration
npm run test:e2e

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch
```

### Evidence Checklist
- [ ] Test results (CI logs)
- [ ] Coverage report
- [ ] Screenshots (before/after)
- [ ] Video/GIF (user flows)
- [ ] Performance metrics
- [ ] Security scan results
- [ ] Rollback test results

### Links
- GitHub Issue: #[issue-number]
- Pull Request: #[pr-number]
- CI Run: [link]
- Coverage Report: [link]
- Evidence Folder: [link]

