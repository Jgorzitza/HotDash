# QA Test Documentation Templates — Hot Rod AN

**Version**: 1.0  
**Created**: 2025-10-21  
**Owner**: Support Agent  
**Audience**: QA Agent, All Testing Teams

---

## Table of Contents

1. [Test Documentation Template](#test-documentation-template)
2. [Evidence Logging Guidelines](#evidence-logging-guidelines)
3. [Bug Report Template](#bug-report-template)

---

## Test Documentation Template

Use this template for all feature testing documentation.

### Template Structure

```markdown
# Test Report: [Feature Name]

**Test Date**: YYYY-MM-DD  
**Tester**: [Agent Name]  
**Feature**: [Feature ID] - [Feature Description]  
**Test Environment**: [Staging/Production]  
**Build/Commit**: [Git commit hash]

---

## Test Summary

**Total Tests**: [X]  
**Passed**: [X] ✅  
**Failed**: [X] ❌  
**Blocked**: [X] ⏸️  
**Pass Rate**: [XX]%

---

## Test Cases

### Test Case 1: [Test Name]

**Test ID**: TC-001  
**Priority**: P0/P1/P2/P3  
**Type**: Functional/Integration/E2E/Performance

**Objective**: [What are you testing?]

**Preconditions**:
- [Condition 1]
- [Condition 2]

**Test Steps**:
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Expected Result**:
- [Expected outcome 1]
- [Expected outcome 2]

**Actual Result**:
- [What actually happened]

**Status**: ✅ PASS / ❌ FAIL / ⏸️ BLOCKED

**Evidence**:
- Screenshot: [path/to/screenshot.png]
- Log: [relevant log excerpt]
- Commit: [git commit reference]

**Notes**: [Any additional observations]

---

### Test Case 2: [Test Name]

[Repeat structure above]

---

## Edge Cases Tested

List edge cases explicitly tested:

1. **Null Values**: ✅/❌
   - Description: [what was tested]
   - Result: [outcome]

2. **Empty Strings**: ✅/❌
   - Description: [what was tested]
   - Result: [outcome]

3. **Special Characters**: ✅/❌
   - Description: [what was tested]
   - Result: [outcome]

4. **Max Length Input**: ✅/❌
   - Description: [what was tested]
   - Result: [outcome]

5. **Concurrent Operations**: ✅/❌
   - Description: [what was tested]
   - Result: [outcome]

---

## Performance Metrics

**Measured**: [Date/Time]

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Load Time | < 3s | [X]s | ✅/❌ |
| API Response | < 500ms | [X]ms | ✅/❌ |
| Memory Usage | < 100MB | [X]MB | ✅/❌ |
| CPU Usage | < 50% | [X]% | ✅/❌ |

---

## Accessibility Testing

**WCAG 2.2 AA Compliance**:

- ✅/❌ Keyboard Navigation (Tab, Enter, Escape)
- ✅/❌ Screen Reader (NVDA/JAWS tested)
- ✅/❌ Color Contrast (4.5:1 minimum)
- ✅/❌ Focus Indicators (visible on all interactive elements)
- ✅/❌ ARIA Labels (buttons, inputs, modals)
- ✅/❌ Semantic HTML (proper heading hierarchy)

**Screen Reader Test Log**:
```
[Timestamp] [Action] [Screen Reader Output]
14:30:00    Tab to button    "Approve, button"
14:30:05    Press Enter      "Submitting request..."
```

---

## Browser Compatibility

| Browser | Version | Status | Notes |
|---------|---------|--------|-------|
| Chrome | 120+ | ✅/❌ | [issues] |
| Firefox | 120+ | ✅/❌ | [issues] |
| Safari | 17+ | ✅/❌ | [issues] |
| Edge | 120+ | ✅/❌ | [issues] |

---

## Mobile Responsiveness

| Device | Screen Size | Status | Notes |
|--------|-------------|--------|-------|
| iPhone SE | 375x667 | ✅/❌ | [issues] |
| iPhone 14 Pro | 393x852 | ✅/❌ | [issues] |
| iPad | 768x1024 | ✅/❌ | [issues] |
| Desktop | 1920x1080 | ✅/❌ | [issues] |

---

## Bugs Found

See [Bug Report Template](#bug-report-template) for detailed bug reports.

**Summary**:
- Critical: [X] (P0)
- High: [X] (P1)
- Medium: [X] (P2)
- Low: [X] (P3)

**Bug IDs**: BUG-001, BUG-002, BUG-003

---

## Recommendations

1. [Recommendation 1]
2. [Recommendation 2]
3. [Recommendation 3]

---

## Sign-Off

**Tested By**: [Agent Name]  
**Date**: YYYY-MM-DD  
**Status**: ✅ Approved / ❌ Rejected / ⏸️ Needs Rework  
**Next Steps**: [What needs to happen]

```

---

## Evidence Logging Guidelines

### What is Evidence?

**Evidence** = Proof that testing was performed and results are verifiable

### Required Evidence for All Tests

1. **Screenshots/Screen Recordings**
   - Capture before/after states
   - Show success/failure states
   - Include browser dev tools if relevant
   - Format: PNG/JPG for images, MP4 for videos
   - Location: `artifacts/qa/[date]/[feature]/`

2. **Log Excerpts**
   - Console logs (browser)
   - Server logs (API responses)
   - Error messages (full stack trace if available)
   - Format: Text, max 50 lines per excerpt
   - Highlight relevant lines

3. **Code References**
   - Git commit hash
   - File paths tested
   - Line numbers if relevant
   - Example: `app/components/Modal.tsx:45-67`

4. **Test Data**
   - Input values used
   - Expected vs actual output
   - Edge cases tested
   - Format: JSON, CSV, or inline markdown tables

5. **Performance Metrics**
   - Response times
   - Load times
   - Memory/CPU usage
   - Network requests (count, size)
   - Format: Tables or inline metrics

### Evidence Format Standards

#### ✅ GOOD Evidence Example

```markdown
**Test**: PII Card displays redacted email

**Evidence**:
- Screenshot: artifacts/qa/2025-10-21/pii-card/redacted-email.png
- Input: john.doe@example.com
- Expected: j***@e***.com
- Actual: j***@e***.com ✅
- Code: app/components/PIICard.tsx:89-102
- Commit: bdc9541
- Performance: Redaction took 2.3ms ✅
```

#### ❌ BAD Evidence Example

```markdown
**Test**: PII Card works

**Evidence**:
- Tested it
- Looks good
```

**Why Bad**: No screenshots, no specific results, no code references, not reproducible

---

### Evidence Storage

**Location**: `artifacts/qa/[YYYY-MM-DD]/[feature-name]/`

**Structure**:
```
artifacts/qa/
└── 2025-10-21/
    └── pii-card/
        ├── screenshots/
        │   ├── redacted-email.png
        │   ├── redacted-phone.png
        │   └── full-pii-card.png
        ├── logs/
        │   ├── console-output.txt
        │   └── api-response.json
        └── test-report.md
```

### Evidence in Feedback Files

**Rule**: Log evidence as **summaries**, not verbose outputs

**Max Lines Per Command**: 10 lines

#### ✅ GOOD Summary

```markdown
**Evidence**:
- Files tested: 3 (Modal.tsx, PIICard.tsx, CXEscalationModal.tsx)
- Test cases passed: 12/15 (80%)
- Screenshots: 8 saved to artifacts/qa/2025-10-21/
- Performance: All <3s load time ✅
- Accessibility: Keyboard nav ✅, Screen reader ✅
- Bugs found: 2 (BUG-042, BUG-043)
```

#### ❌ BAD Verbose Output

```markdown
**Evidence**:
[100+ lines of npm test output]
[50+ lines of console.log]
[30+ lines of API response JSON]
```

---

### Evidence Checklist

Before submitting test report, verify:

- [ ] Screenshots captured and saved
- [ ] Logs excerpted (not full verbatim output)
- [ ] Code references included (file paths, commits)
- [ ] Test data documented (input/output)
- [ ] Performance metrics measured
- [ ] Evidence stored in artifacts/ directory
- [ ] Summary logged in feedback file (max 10 lines)

---

## Bug Report Template

Use this template for all bugs found during testing.

### Template Structure

```markdown
# Bug Report: [Bug Title]

**Bug ID**: BUG-[XXX]  
**Reported By**: [Agent Name]  
**Date**: YYYY-MM-DD  
**Feature**: [Feature ID/Name]  
**Priority**: P0/P1/P2/P3  
**Status**: New/In Progress/Fixed/Closed

---

## Summary

[One-sentence description of the bug]

---

## Environment

**Branch**: [git branch]  
**Commit**: [git commit hash]  
**Test Environment**: Staging/Production  
**Browser**: [Browser + version]  
**Device**: Desktop/Mobile ([specific device])  
**OS**: [Operating system]

---

## Reproduction Steps

**Preconditions**:
- [Setup requirement 1]
- [Setup requirement 2]

**Steps to Reproduce**:
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Frequency**: Always/Sometimes/Rarely

---

## Expected Behavior

[What should happen]

Example:
- PII Card should display redacted email as `j***@e***.com`
- Public Reply should not contain full email address

---

## Actual Behavior

[What actually happens]

Example:
- PII Card displays full email `john.doe@example.com` (not redacted)
- Public Reply also contains full email (security risk)

---

## Evidence

**Screenshots**:
- Before: [path/to/before.png]
- After: [path/to/after.png]
- Error: [path/to/error.png]

**Logs**:
```
[Relevant log excerpt - max 20 lines]
Error: Cannot read property 'email' of undefined
  at PIIBroker.redact (app/services/pii-broker.ts:45)
  at CustomerFrontAgent.composeReply (app/agents/customer-front.ts:123)
```

**Console Output**:
```
[Relevant console output - max 20 lines]
TypeError: email is not a function
```

**Code Reference**:
- File: app/components/PIICard.tsx
- Lines: 89-102
- Commit: bdc9541

**Performance Impact** (if applicable):
- Response time: 5.2s (target: <3s) ❌
- Memory usage: 150MB (target: <100MB) ❌

---

## Impact Assessment

**Severity**: Critical/High/Medium/Low

**Impact**:
- [ ] Security Risk (PII exposure, data leak)
- [ ] Data Loss/Corruption
- [ ] System Crash/Unavailable
- [ ] Performance Degradation
- [ ] UX/UI Issue
- [ ] Accessibility Issue
- [ ] Minor Visual Bug

**Affected Users**: All/Operators Only/Specific Scenario

**Workaround Available**: Yes/No  
**Workaround**: [If yes, describe workaround]

---

## Priority Justification

**Why P0 (Critical)**:
- System unusable or security risk
- Affects all users
- No workaround available
- Immediate fix required

**Why P1 (High)**:
- Major feature broken
- Affects many users
- Workaround exists but difficult
- Fix needed within 48 hours

**Why P2 (Medium)**:
- Minor feature broken
- Affects some users
- Easy workaround available
- Fix needed within 1 week

**Why P3 (Low)**:
- Cosmetic issue
- Affects few users
- Easy workaround
- Fix can wait for next release

---

## Suggested Fix

[If you know how to fix it, suggest approach]

Example:
- Check if email exists before calling redaction function
- Add null check: `if (!email) return 'Unknown';`
- Update type definition to require email field

---

## Related Issues

**Related Bugs**: BUG-XXX, BUG-YYY  
**Related Features**: FEATURE-XXX  
**Related PRs**: PR-XXX (if fix already attempted)

---

## Growth Engine Specific

**If this is a Growth Engine bug, answer**:

- [ ] Agent involved: Customer-Front/Accounts/Storefront/CEO-Front
- [ ] Sub-agent handoff issue: Yes/No
- [ ] PII Broker issue: Yes/No
- [ ] HITL approval issue: Yes/No
- [ ] Decision log issue: Yes/No
- [ ] MCP tool issue: Yes/No (which tool?)

**Agent Context**:
- Conversation ID: [if applicable]
- Message ID: [if applicable]
- Agent version: [e.g., customer-front-v1.2]
- Sub-agent used: [accounts/storefront/none]

---

## Assignee

**Assigned To**: [Agent Name]  
**Target Fix Date**: YYYY-MM-DD  
**Actual Fix Date**: YYYY-MM-DD (when fixed)

---

## Resolution

**Status**: New/In Progress/Fixed/Closed

**Fix Description**: [How it was fixed]

**Fix Commit**: [git commit hash]

**Fix Verified By**: [QA Agent Name]

**Fix Verified Date**: YYYY-MM-DD

**Verification Evidence**:
- [Screenshot/log showing fix works]
- [Test case passed]

---

## Notes

[Any additional context, observations, or discussion]

```

---

## Quick Reference

### Priority Definitions

| Priority | Description | Response Time | Example |
|----------|-------------|---------------|---------|
| **P0 (Critical)** | System down, security risk, data loss | < 4 hours | PII exposed, auth broken, payments failing |
| **P1 (High)** | Major feature broken, many users affected | < 48 hours | Modal won't open, API 500 errors, widget missing |
| **P2 (Medium)** | Minor feature broken, some users affected | < 1 week | Sorting broken, filter not working, styling off |
| **P3 (Low)** | Cosmetic issue, few users affected | Next release | Color slightly off, tooltip wording unclear |

---

### Test Status Definitions

| Status | Symbol | Meaning |
|--------|--------|---------|
| **PASS** | ✅ | Test passed, feature works as expected |
| **FAIL** | ❌ | Test failed, bug found, needs fix |
| **BLOCKED** | ⏸️ | Test cannot proceed due to dependency or environment issue |
| **SKIP** | ⏭️ | Test intentionally skipped (not applicable, deprecated) |
| **PENDING** | 🔄 | Test started but not completed yet |

---

### Evidence Checklist (Quick)

Every test needs:
- [ ] Screenshot/recording
- [ ] Log excerpt (max 20 lines)
- [ ] Code reference (file + line + commit)
- [ ] Input/output data
- [ ] Performance metrics (if applicable)

---

### Bug Report Checklist (Quick)

Every bug report needs:
- [ ] Clear title
- [ ] Reproduction steps (3+ steps)
- [ ] Expected vs actual behavior
- [ ] Evidence (screenshots + logs)
- [ ] Priority justification
- [ ] Impact assessment

---

## Examples

### Example 1: Functional Test

**Test**: Modal opens when button clicked

**Test ID**: TC-042  
**Type**: Functional

**Steps**:
1. Navigate to `/dashboard`
2. Click "Approve" button
3. Verify modal appears

**Expected**: Modal displays with grading sliders  
**Actual**: Modal displays correctly ✅  
**Evidence**: Screenshot at `artifacts/qa/2025-10-21/modal/approve-modal.png`

**Status**: ✅ PASS

---

### Example 2: Edge Case Test

**Test**: PII Card handles null email

**Test ID**: TC-043  
**Type**: Edge Case

**Steps**:
1. Send conversation with no customer email
2. Open PII Card
3. Check email field

**Expected**: Display "Email: Not provided"  
**Actual**: Error: "Cannot read property 'email' of undefined" ❌  
**Evidence**:
- Screenshot: `artifacts/qa/2025-10-21/pii-card/null-email-error.png`
- Console log: `TypeError at PIICard.tsx:89`
- Commit: bdc9541

**Status**: ❌ FAIL  
**Bug Filed**: BUG-042

---

### Example 3: Performance Test

**Test**: Dashboard tile load time

**Test ID**: TC-044  
**Type**: Performance

**Steps**:
1. Navigate to `/dashboard`
2. Measure time to "tiles visible"
3. Record performance metrics

**Expected**: < 3s load time  
**Actual**: 2.1s ✅  
**Evidence**:
- Chrome DevTools Performance tab
- Metrics: LCP 1.8s, FCP 0.9s, TTI 2.1s
- Screenshot: `artifacts/qa/2025-10-21/performance/dashboard-metrics.png`

**Status**: ✅ PASS

---

## Template Usage Tips

1. **Copy Template**: Copy the markdown template above
2. **Fill Sections**: Replace placeholders with actual data
3. **Add Evidence**: Capture screenshots/logs before declaring PASS/FAIL
4. **Be Specific**: "Modal doesn't work" ❌ → "Approve modal doesn't open when button clicked" ✅
5. **Include Context**: Browser, device, commit hash, environment
6. **Log Summaries**: Keep feedback file evidence under 10 lines
7. **Store Full Evidence**: Save detailed evidence to `artifacts/qa/[date]/`

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-10-21 | Support Agent | Initial creation (SUPPORT-011) |

---

**END OF DOCUMENT**

