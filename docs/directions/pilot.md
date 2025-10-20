# Pilot Direction v5.1

**Owner**: Manager  
**Effective**: 2025-10-20T20:00Z  
**Version**: 5.0  
**Status**: ACTIVE — End-to-End Testing (PARALLEL DAY 1-6)

---

## Objective

**Test features as they're built** - continuous validation across all phases

**Primary Reference**: `docs/manager/PROJECT_PLAN.md` (Option A Execution Plan — LOCKED)

**Timeline**: Day 1-6 (continuous) — START NOW

---

## Day 1 Tasks (START NOW - 2h)

### PILOT-001: Test Scenario Planning

**Create comprehensive test plan**:

**File**: `docs/specs/pilot-test-scenarios.md`

**Test Categories**:
1. **Approval Queue Workflows** (10 scenarios):
   - Approve customer reply
   - Reject with reason
   - Edit before approving
   - Escalate to manager
   - Multiple approvals in queue
   - Empty queue state
   - Error handling (API failure)
   - Keyboard navigation
   - Screen reader compatibility
   - Mobile view

2. **Enhanced Modal Testing** (15 scenarios):
   - CX Modal: All grading combinations
   - Sales Modal: Each action type
   - Inventory Modal: Reorder workflow
   - All modals: Accessibility (keyboard, focus trap, Escape)
   - All modals: Error states
   - All modals: Loading states

3. **Dashboard Testing** (8 scenarios):
   - All 8 tiles loading
   - Tile refresh
   - Error states
   - Empty states
   - Drag-drop reordering (Phase 6)
   - Tile visibility toggle (Phase 6)

4. **Notification Testing** (8 scenarios):
   - Toast notifications (success/error/info)
   - Banner alerts
   - Browser notifications
   - Notification center
   - Mark as read/unread

5. **Settings Testing** (12 scenarios):
   - Each settings tab
   - Theme switcher
   - Preference persistence
   - Reset to defaults
   - Integration health checks

6. **Real-Time Testing** (5 scenarios):
   - SSE connection
   - Live updates
   - Connection loss handling
   - Reconnection
   - Multiple tabs

7. **Performance Testing** (5 scenarios):
   - Page load time (<3s)
   - Tile load time (<2s)
   - Modal open time (<500ms)
   - API response time (<1s)
   - Large dataset handling (100+ approvals)

8. **Accessibility Testing** (WCAG 2.2 AA):
   - Keyboard-only navigation
   - Screen reader testing
   - Color contrast verification
   - Focus management

---

## Day 2-6: Continuous Testing

### PILOT-002: Test Each Phase as Engineer Completes

**After Each Phase**:
1. Run relevant test scenarios
2. Document results (pass/fail)
3. Report bugs immediately to Engineer
4. Retest after fixes

**Example Report**:
```md
## Phase 2 Testing Complete

**Tests Run**: 15/15 scenarios
**Results**: 13 PASS, 2 FAIL

**Failures**:
1. CX Modal grading sliders:
   - Issue: Slider values don't persist after modal close
   - Severity: P1 (blocks Phase 2 completion)
   - Assigned to: Engineer

2. Sales Modal:
   - Issue: Action dropdown doesn't show on mobile
   - Severity: P2 (mobile view)
   - Assigned to: Engineer

**Pass Highlights**:
- Keyboard navigation: ✅ All controls reachable
- Grading submission: ✅ Data storing correctly
- Accessibility: ✅ Focus trap working

**Verdict**: Phase 2 BLOCKED until 2 issues fixed
```

---

### PILOT-003: Performance Testing

**Load Testing**:
- Simulate 100+ approval queue items
- Test dashboard with all tiles loading simultaneously
- Stress test SSE connections (Phase 5)
- Memory leak detection (long session)

**Tools**:
- Browser DevTools (Performance tab)
- Lighthouse
- Manual testing

**Benchmarks**:
- Page load: <3s
- Tile load: <2s each
- Modal open: <500ms
- API calls: <1s
- No memory leaks after 1h session

---

### PILOT-004: User Acceptance Testing

**Real-world workflows**:
- Simulate full operator day (login → review queue → approve 10 items → review analytics → adjust settings)
- Test error recovery (network loss, API failures)
- Test edge cases (empty states, max limits)
- Validate user experience (no confusion, clear actions)

**Report UX Issues**:
- Confusing interactions
- Unclear labels
- Missing feedback
- Performance issues

---

## Work Protocol

**1. Testing Tools**:
- Browser DevTools
- Lighthouse
- axe DevTools (accessibility)
- Keyboard only (unplug mouse)
- Screen reader (if available)

**2. Reporting (Every 2 hours)**:
```md
## YYYY-MM-DDTHH:MM:SSZ — Pilot: Phase N Testing

**Working On**: Testing Phase N implementations
**Progress**: 8/15 test scenarios complete

**Evidence**:
- Tests run: 8 scenarios
- Pass rate: 7/8 (87.5%)
- Issues found: 1 (P2 severity)
- Performance: All benchmarks met ✅

**Blockers**: None
**Next**: Complete remaining scenarios, report to Engineer
```

**3. Coordinate**:
- **Engineer**: Report bugs immediately (don't wait)
- **Designer**: Share UX issues
- **QA**: Share test results for code verification

---

## Definition of Done

**Test Planning**:
- [ ] 60+ test scenarios documented
- [ ] Organized by phase
- [ ] Acceptance criteria clear

**Continuous Testing**:
- [ ] Every phase tested before CEO checkpoint
- [ ] Bugs reported within 1 hour of discovery
- [ ] Regression testing (old features still work)

**Performance Testing**:
- [ ] All benchmarks met
- [ ] No memory leaks
- [ ] Load testing passed

**UAT**:
- [ ] Real workflows tested
- [ ] UX validated
- [ ] Edge cases covered

---

## Phase Schedule

**Day 1**: PILOT-001 (test planning - 2h) — START NOW
**Day 2-6**: PILOT-002, 003, 004 (continuous testing - 12h across phases)

**Total**: 14 hours across Days 1-6 (continuous parallel work)

---

## Quick Reference

**Plan**: `docs/manager/PROJECT_PLAN.md`
**Feedback**: `feedback/pilot/2025-10-20.md`

---

**START WITH**: PILOT-001 (test scenario planning NOW - 2h) — PARALLEL DAY 1

---

## Credential & Blocker Protocol

### If You Need Credentials:

**Step 1**: Check `vault/` directory first
- Google credentials: `vault/occ/google/`
- Bing credentials: `vault/occ/bing/`
- Publer credentials: `vault/occ/publer/`
- Other services: `vault/occ/<service-name>/`

**Step 2**: If not in vault, report in feedback:
```md
## HH:MM - Credential Request
**Need**: [specific credential name]
**For**: [what task/feature]
**Checked**: vault/occ/<path>/ (not found)
**Status**: Moving to next task, awaiting CEO
```

**Step 3**: Move to next task immediately (don't wait idle)

### If You Hit a True Blocker:

**Before reporting blocker, verify you**:
1. ✅ Checked vault for credentials
2. ✅ Inspected codebase for existing patterns
3. ✅ Pulled Context7 docs for the library
4. ✅ Reviewed RULES.md and relevant direction sections

**If still blocked**:
```md
## HH:MM - Blocker Report
**Blocked On**: [specific issue]
**What I Tried**: [list 3+ things you attempted]
**Vault Checked**: [yes/no, paths checked]
**Docs Pulled**: [Context7 libraries consulted]
**Asking CEO**: [specific question or guidance needed]
**Moving To**: [next task ID you're starting]
```

**Then immediately move to next task** - CEO will respond when available

**Key Principle**: NEVER sit idle. If one task blocked → start next task right away.
