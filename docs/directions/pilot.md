# Pilot Direction v6.0

📌 **FIRST ACTION: Git Setup**
```bash
cd /home/justin/HotDash/hot-dash
git fetch origin
git checkout manager-reopen-20251020
git pull origin manager-reopen-20251020
git branch --show-current  # Verify: should show manager-reopen-20251020
```

**Owner**: Manager
**Effective**: 2025-10-21T01:25:00Z
**Version**: 6.0
**Status**: PILOT-002 - Test Phase 2 in Production (1 hour)

---

## ✅ PILOT-001: COMPLETE

**Deliverable**: ✅ Test plan created (71 scenarios, 1332 lines)
**File**: docs/specs/pilot-test-scenarios.md
**Status**: Ready for use in testing

---

## START NOW: PILOT-002 - Test Phase 2 Enhanced Modals (1 hour)

**Context**: Phase 2 passed Designer validation (3rd attempt). Now test in production staging environment.

**What to Test**: 3 enhanced modals (CX Escalation, Sales Pulse, Inventory Modal)

### Test Objectives

1. **Functional Testing** (30 min)
   - All 3 modals open and close correctly
   - Grading sliders work (CX modal)
   - WoW variance displays (Sales modal - may show placeholder)
   - 14-day chart renders (Inventory modal - may show placeholder)
   - All action buttons functional
   - Toast notifications appear on actions

2. **Accessibility Testing** (20 min)
   - Keyboard navigation (Tab/Shift+Tab through controls)
   - Focus trap works (focus stays in modal)
   - Escape key closes modal
   - Screen reader compatibility (if available)
   - Focus indicators visible (4.5:1 contrast)
   - Initial focus on close button

3. **Performance Testing** (10 min)
   - Modal load time < 1s
   - No janky animations
   - Memory leaks check (open/close 10 times, check DevTools)

### Test Execution

**Environment**: https://hotdash-staging.fly.dev

**Test Scenarios to Execute** (from pilot-test-scenarios.md):
- Scenario 1: CX Modal (keyboard navigation)
- Scenario 2: CX Modal (grading sliders)
- Scenario 5: Sales Modal (variance display)
- Scenario 8: Inventory Modal (chart rendering)
- Scenario 12: Accessibility (focus trap)
- Scenario 13: Accessibility (Escape key)
- Scenario 15: Performance (load time)

**Deliverables**:
- Test results (PASS/FAIL for each scenario)
- Screenshots of any issues
- Performance metrics (load times, memory usage)
- Bug reports (if any) documented in feedback

**Format** (in feedback file):
```md
## Test Results - Phase 2 Enhanced Modals

### CX Escalation Modal
- ✅ Opens/closes: PASS
- ✅ Grading sliders: PASS (functional)
- ✅ Keyboard navigation: PASS
- ✅ Focus trap: PASS
- ✅ Escape key: PASS
- ✅ Toast notification: PASS
- Performance: 650ms load time ✅

### Sales Pulse Modal
- ✅ Opens/closes: PASS
- ⚠️ WoW variance: PLACEHOLDER (pending Analytics service)
- ✅ Keyboard navigation: PASS
...
```

**Time**: 60 minutes

**After PILOT-002**: Report results to Manager, await Phase 3 testing assignment

---

## Reminder: Test Plan Ready

Use `docs/specs/pilot-test-scenarios.md` for detailed test scenarios across all 13 phases.
