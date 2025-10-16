# PR Review Checklist Template

**File:** `docs/specs/pr_review_checklist.md`  
**Owner:** QA Agent  
**Purpose:** Automated checklist for PR reviews to ensure 100% DoD compliance  
**Version:** 1.0  
**Last Updated:** 2025-10-15

---

## How to Use This Checklist

1. **Copy this checklist** into every PR review comment
2. **Check each item** as you validate it
3. **Provide evidence** for each checked item
4. **Request changes** if any item fails
5. **Approve only** when all items pass

---

## PR Review Checklist

### 1. Issue Linkage ✅

- [ ] PR description includes `Fixes #<issue-number>` or `Refs #<issue-number>`
- [ ] Linked Issue exists and is open
- [ ] PR addresses the Issue's objective

**Evidence:**
- Issue link: #___
- Issue status: Open/Closed
- Alignment verified: Yes/No

---

### 2. Allowed Paths ✅

- [ ] PR description declares allowed paths
- [ ] All changed files match allowed paths pattern
- [ ] No files outside allowed paths modified

**Evidence:**
- Declared paths: `___`
- Changed files count: ___
- All files within paths: Yes/No

**Validation Command:**
```bash
# Check if files match allowed paths
git diff --name-only origin/main...HEAD
```

---

### 3. Feedback File ✅

- [ ] Feedback file exists: `feedback/<agent>/<YYYY-MM-DD>.md`
- [ ] Feedback file has completion signal: "WORK COMPLETE - READY FOR PR"
- [ ] Feedback file documents work performed
- [ ] MCP tool usage logged

**Evidence:**
- Feedback file: `feedback/___/2025-10-15.md`
- Completion signal: Present/Missing
- Work documented: Yes/No
- Tools logged: Yes/No

---

### 4. Definition of Done (DoD) ✅

#### Global DoD (from NORTH_STAR)

- [ ] **Acceptance criteria satisfied** with tests/evidence
- [ ] **Rollback documented** and tested
- [ ] **Calls are MCP/SDK-backed** (no speculative endpoints)
- [ ] **HITL reviews/grades captured** (if customer-facing)
- [ ] **Issue linkage** present
- [ ] **Allowed paths** declared and respected
- [ ] **CI checks green** (Docs Policy, Danger, Gitleaks, AI Config)
- [ ] **No disallowed `.md` files** created
- [ ] **Metrics updated** if behavior changed
- [ ] **Audit entry present** (if runtime change)

**Evidence:**
- Tests passing: Yes/No
- Rollback plan: Present/Missing
- MCP tools used: ___
- HITL enforced: Yes/No/N/A
- CI status: Green/Red

---

### 5. Evidence Requirements ✅

#### Test Evidence
- [ ] Unit tests passing (≥ 80% coverage)
- [ ] Integration tests passing (if applicable)
- [ ] E2E tests passing (if applicable)
- [ ] Coverage report provided

**Evidence:**
- Unit test results: ___
- Coverage: ___%
- Integration tests: Pass/Fail/N/A
- E2E tests: Pass/Fail/N/A

#### Functional Evidence
- [ ] Screenshots (before/after if UI changes)
- [ ] Video/GIF (for complex interactions)
- [ ] API response samples (for backend changes)
- [ ] Database state verification (for data changes)

**Evidence:**
- Screenshots: Present/Missing/N/A
- Video: Present/Missing/N/A
- API samples: Present/Missing/N/A
- DB verification: Present/Missing/N/A

#### Performance Evidence
- [ ] P95 latency < budget (specify budget)
- [ ] Page load time < 3s (for UI changes)
- [ ] API response time < budget (specify budget)
- [ ] No memory leaks detected

**Evidence:**
- P95 latency: ___ ms (budget: ___ ms)
- Page load: ___ s (budget: 3s)
- API response: ___ ms (budget: ___ ms)
- Memory leaks: None/Detected

#### Security Evidence
- [ ] Gitleaks scan passing (no secrets detected)
- [ ] No PII in test data or logs
- [ ] Authentication/authorization tested
- [ ] Input validation tested

**Evidence:**
- Gitleaks: Pass/Fail
- PII check: Pass/Fail
- Auth tested: Yes/No/N/A
- Input validation: Yes/No/N/A

---

### 6. Rollback Plan ✅

- [ ] Rollback steps documented
- [ ] Rollback tested in staging/dev
- [ ] Rollback time estimated
- [ ] Data recovery plan (if applicable)

**Evidence:**
- Rollback steps: Present/Missing
- Rollback tested: Yes/No
- Rollback time: ___ minutes
- Data recovery: Present/Missing/N/A

---

### 7. Code Quality ✅

- [ ] Code follows project conventions
- [ ] No console.log or debug statements
- [ ] Error handling present
- [ ] TypeScript types defined (no `any`)
- [ ] Comments explain complex logic

**Evidence:**
- Conventions followed: Yes/No
- Debug statements: None/Found
- Error handling: Present/Missing
- Types defined: Yes/No
- Comments: Adequate/Inadequate

---

### 8. Documentation ✅

- [ ] README updated (if needed)
- [ ] API documentation updated (if needed)
- [ ] Inline comments for complex logic
- [ ] JSDoc for public functions

**Evidence:**
- README: Updated/N/A
- API docs: Updated/N/A
- Comments: Present/Missing
- JSDoc: Present/Missing/N/A

---

### 9. Security ✅

- [ ] No secrets in code
- [ ] No hardcoded credentials
- [ ] Environment variables used
- [ ] Input sanitization present
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (output escaping)

**Evidence:**
- Secrets check: Pass/Fail
- Credentials: None/Found
- Env vars: Used/Hardcoded
- Input sanitization: Present/Missing
- SQL injection: Protected/Vulnerable
- XSS: Protected/Vulnerable

---

### 10. Accessibility ✅

- [ ] Semantic HTML used
- [ ] ARIA labels present (if needed)
- [ ] Keyboard navigation works
- [ ] Color contrast meets WCAG 2.1 AA
- [ ] Focus indicators visible

**Evidence:**
- Semantic HTML: Yes/No/N/A
- ARIA labels: Present/Missing/N/A
- Keyboard nav: Works/Broken/N/A
- Color contrast: Pass/Fail/N/A
- Focus indicators: Visible/Missing/N/A

---

### 11. Performance ✅

- [ ] No unnecessary re-renders (React)
- [ ] Lazy loading implemented (if needed)
- [ ] Images optimized
- [ ] Bundle size impact acceptable
- [ ] Database queries optimized

**Evidence:**
- Re-renders: Optimized/Issues
- Lazy loading: Present/N/A
- Images: Optimized/N/A
- Bundle size: +___ KB (acceptable: < 50KB)
- DB queries: Optimized/N/A

---

### 12. CI/CD ✅

- [ ] All CI checks passing
- [ ] Docs policy check: Pass
- [ ] Gitleaks check: Pass
- [ ] Danger check: Pass
- [ ] Test suite: Pass

**Evidence:**
- CI status: Green/Red
- Docs policy: Pass/Fail
- Gitleaks: Pass/Fail
- Danger: Pass/Fail
- Tests: Pass/Fail

---

## Review Decision

### ✅ APPROVE

**Conditions:**
- All checklist items pass
- Evidence provided for all items
- No blockers or critical issues

**Comment Template:**
```markdown
## QA Review: APPROVED ✅

All checklist items verified. Evidence complete. Ready to merge.

**Strengths:**
- [List 2-3 strengths]

**Minor Recommendations:**
- [Optional improvements for future]
```

---

### ⚠️ APPROVE WITH RECOMMENDATIONS

**Conditions:**
- All critical items pass
- Minor issues identified
- Evidence mostly complete

**Comment Template:**
```markdown
## QA Review: APPROVE WITH RECOMMENDATIONS ⚠️

Critical items verified. Minor improvements recommended.

**Approved:**
- [List passing items]

**Recommendations:**
- [List minor improvements]

**Action:** Can merge, address recommendations in follow-up.
```

---

### ❌ REQUEST CHANGES

**Conditions:**
- Critical items fail
- Missing evidence
- DoD not satisfied

**Comment Template:**
```markdown
## QA Review: REQUEST CHANGES ❌

Critical issues must be addressed before approval.

**Issues:**
- [List critical issues with specific details]

**Required Actions:**
- [List specific actions needed]

**Evidence Needed:**
- [List missing evidence]

**Action:** Please address all issues and request re-review.
```

---

## Automation Opportunities

### GitHub Actions Integration

```yaml
# .github/workflows/pr-checklist.yml
name: PR Checklist Validation

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - name: Check Issue Linkage
        run: |
          if ! grep -q "Fixes #\|Refs #" <<< "${{ github.event.pull_request.body }}"; then
            echo "❌ Missing Issue linkage"
            exit 1
          fi
      
      - name: Check Allowed Paths
        run: |
          if ! grep -q "Allowed paths:" <<< "${{ github.event.pull_request.body }}"; then
            echo "❌ Missing Allowed paths declaration"
            exit 1
          fi
      
      - name: Check Feedback File
        run: |
          # Check if feedback file exists
          # Implementation depends on agent and date
```

---

## Quick Reference

### Common Issues

**Missing Issue Linkage:**
- Add `Fixes #<issue>` to PR description

**Missing Allowed Paths:**
- Add `Allowed paths: <pattern>` to PR description

**Missing Feedback File:**
- Create `feedback/<agent>/<YYYY-MM-DD>.md`
- Add completion signal

**Missing Evidence:**
- Add screenshots for UI changes
- Add test results
- Add performance metrics

**CI Failing:**
- Check Gitleaks for secrets
- Check Docs Policy for disallowed `.md` files
- Check Danger for governance violations

---

## Version History

- **1.0 (2025-10-15):** Initial checklist with 12 categories and automation guidance

