# Designer Direction v5.1

📌 **FIRST ACTION: Git Setup**
```bash
cd /home/justin/HotDash/hot-dash
git fetch origin
git checkout manager-reopen-20251020
git pull origin manager-reopen-20251020
git branch --show-current  # Verify: should show manager-reopen-20251020
```


**Owner**: Manager
**Effective**: 2025-10-21T00:00:00Z
**Version**: 5.1
**Status**: ✅ Phase 2 Validation COMPLETE (FAILED) - Awaiting Engineer Fixes

---

## ✅ YOUR WORK: COMPLETE

**Phase 2 Validation**: ✅ DONE (validated twice, documented 10 P0 issues)
**Evidence**: feedback/designer/2025-10-20.md
**Next**: Re-validate Phase 2 after Engineer fixes issues


## ✅ PHASE 2 VALIDATION: COMPLETE (FAILED - Awaiting Engineer Fixes)

**Your Work**: ✅ COMPLETE - Validated Phase 2 twice, documented 10 P0 issues
**Evidence**: feedback/designer/2025-10-20.md (lines 183-820)
**Verdict**: ❌ FAILED - Engineer must fix accessibility issues

**Issues Found** (10 P0):
1. ❌ Focus trap missing (ALL 3 modals)
2. ❌ Escape key missing (ALL 3 modals)  
3. ❌ Missing Edit button (CX modal)
4. ❌ WoW variance missing (Sales modal)
5. ❌ 14-day chart missing (Inventory modal)
6. ❌ Toast notifications missing (ALL 3 modals)
7. ❌ aria-live missing (Sales modal)
8. ❌ Initial focus missing (ALL 3 modals)

**Your Next Task**: Re-validate Phase 2 (third time) AFTER Engineer fixes issues

---

## Objective

**Validate ALL implementations match design specs EXACTLY** across 13 phases

**Primary Reference**: `docs/manager/PROJECT_PLAN.md` (Option A Execution Plan — LOCKED)

**Your Role**: Quality gate between Engineer work and CEO checkpoints

---

## Validation Requirements

### After EVERY Phase (11 Validations Total):

**Process**:
1. Engineer completes phase tasks
2. You validate against design specs
3. Pass → CEO checkpoint
4. Fail → Engineer fixes → You re-validate

**Validation Checklist** (use for each phase):
```md
## Phase N Validation

**Spec**: [docs/design/file.md]
**Implementation**: [app/components/file.tsx]

**Visual QA**:
- [ ] Layout matches wireframe exactly
- [ ] Spacing matches design tokens (8px grid)
- [ ] Colors match Hot Rodan palette (#E74C3C primary)
- [ ] Typography matches scale (heading/body sizes)
- [ ] States: default, hover, active, disabled, loading, error

**Accessibility**:
- [ ] Keyboard navigation (Tab through all controls)
- [ ] Focus indicators visible (4.5:1 contrast)
- [ ] Escape closes modals
- [ ] Screen reader labels (ARIA)
- [ ] Color contrast (4.5:1 text, 3:1 interactive)

**Interaction**:
- [ ] Buttons respond to click
- [ ] Forms validate inputs
- [ ] Loading states show during async
- [ ] Error states display correctly
- [ ] Success feedback (toast/banner)

**Verdict**: ✅ PASS / ❌ FAIL (with specific issues listed)
```

---

## Phase-by-Phase Validation Tasks

### ✅ PHASE 1: VALIDATED

**Status**: Passed CEO Checkpoint 1  
**Date**: 2025-10-20  
**Evidence**: Basic approval queue working

---

### 🔥 PHASE 2: Enhanced Modals + OpenAI SDK (45 min) — NEXT

**DES-003**: Validate Enhanced Modals

**Your Tasks**:

**1. CX Modal Validation** (20 min):
- **Spec**: `docs/design/modal-refresh-handoff.md`
- Check: Grading sliders (tone/accuracy/policy 1-5)
- Check: Conversation preview scrollable
- Check: AI reply display prominent
- Check: Internal notes textarea
- Check: 5 action buttons (Approve/Edit/Escalate/Resolve/Cancel)
- Check: Focus trap (Tab doesn't leave modal)
- Check: Escape key closes modal
- Check: Toast on success/error
- **Tool Required**: Test with screen reader if possible

**2. Sales Modal Validation** (10 min):
- **Spec**: `docs/design/dashboard_wireframes.md` lines 126-181
- Check: Variance display (WoW %)
- Check: Action dropdown (3 options)
- Check: Notes textarea
- Check: Dynamic button text

**3. Inventory Modal Validation** (15 min):
- **Spec**: `docs/design/dashboard_wireframes.md` lines 183-240
- Check: 14-day velocity chart
- Check: Reorder workflow
- Check: Quantity input
- Check: Vendor dropdown
- Check: "Approve Reorder" button

**Evidence Format**:
```md
## Phase 2 Validation Complete

**CX Modal**: ✅ PASS
- Grading sliders functional (1-5 range)
- Focus trap tested with keyboard
- Toast notifications working
- Matches spec lines 45-120

**Sales Modal**: ✅ PASS
- Variance display correct
- Action dropdown matches spec

**Inventory Modal**: ❌ FAIL
- Issue: Quantity input not validated (allows negative numbers)
- Issue: Vendor dropdown missing "Add new vendor" option per spec line 215
- Assigned back to Engineer for fix

**Verdict**: Phase 2 BLOCKED until Inventory fixes applied
```

**Breakpoint**: Your validation gates CEO Checkpoint 2

---

### PHASE 3: Missing Tiles Validation (30 min) — QUEUED

**DES-005**: Validate New Tiles

**Your Tasks**:

**1. Idea Pool Tile** (15 min):
- **Spec**: `docs/design/dashboard-tiles.md` lines 528-670
- Check: 5/5 capacity indicator
- Check: Wildcard badge present
- Check: Count display (pending/accepted/rejected)
- Check: "View Idea Pool" button working

**2. Approvals Queue Tile** (15 min):
- Check: Pending count prominent
- Check: Oldest time display
- Check: "Review queue" button → /approvals

**3. Dashboard Integration**:
- Check: 8/8 tiles in grid
- Check: Grid responsive (3-4 col desktop, 2 col tablet, 1 col mobile)

**Breakpoint**: Your validation gates CEO Checkpoint 3

---

### PHASE 6: Settings Validation — QUEUED

**DES-007**: Dashboard Settings Tab
**DES-009**: Appearance & Notification Tabs

**Your Tasks**:
- Validate drag & drop smooth (no jank)
- Validate theme switcher matches design
- Validate all settings persist correctly

**Breakpoint**: Your validation gates CEO Checkpoint 6

---

### PHASE 7-8: Data Viz Validation — QUEUED

**Your Tasks**:
- Validate charts match Polaris Viz patterns
- Validate interactive tooltips
- Validate print-friendly rendering

**Breakpoint**: Your validation gates CEO Checkpoint 7

---

### PHASE 13: Final Sign-Off — QUEUED

**DES-014**: Design System Audit
**DES-015**: Mobile & Dark Mode Verification

**Your Tasks**:
- Complete design system compliance check
- Verify all 57 design specs implemented
- Sign off on Option A completion
- Document any deferred features

**Breakpoint**: Your sign-off gates CEO Checkpoint 11 (FINAL)

---

## Validation Tools

**Use These**:
- Chrome DevTools (inspect spacing, colors)
- Keyboard (Tab, Enter, Escape navigation)
- Browser resize (responsive testing)
- Color contrast checker (WebAIM)
- Screen reader (if accessible)

**Document Issues**:
- Screenshot + annotation
- Spec reference (file + line number)
- Severity (P0 blocker / P1 important / P2 nice-to-have)

---

## Work Protocol

**1. MCP Tools** (Use when needed):
- Context7: Pull design system docs if clarification needed
- Web search: WCAG 2.2 AA requirements

**2. Reporting** (Every 2 hours):
```md
## YYYY-MM-DDTHH:MM:SSZ — Designer: Phase N Validation

**Working On**: Validating Phase N implementations
**Progress**: 2/3 components validated

**Evidence**:
- CX Modal: ✅ PASS (matches spec, accessible)
- Sales Modal: ⏸️ IN PROGRESS
- Inventory Modal: ❌ FAIL (2 issues found)

**Blockers**: None
**Next**: Complete Sales/Inventory validation
```

**3. Rejection Criteria**:
- Implementation < 90% of spec → FAIL
- Missing accessibility features → FAIL
- Color/spacing off by >10% → FAIL (request fix)
- Missing error/loading states → FAIL

---

## Current Status

**Phase**: 2 (Validation pending)
**Waiting For**: Engineer to complete ENG-005, ENG-006, ENG-007
**Next Task**: DES-003 (validate enhanced modals - 45 min)
**Total Validation Hours**: ~6 hours across all phases

---

## Quick Reference

**Plan**: `docs/manager/PROJECT_PLAN.md` (Option A Execution Plan)
**Specs**: `docs/design/*.md` (57 files - YOUR specifications)
**Vision**: `COMPLETE_VISION_OVERVIEW.md`
**Feedback**: `feedback/designer/2025-10-20.md`
**Startup**: `docs/runbooks/agent_startup_checklist.md`

---

**CRITICAL**: Your validation is the quality gate. If implementation doesn't match spec EXACTLY, send back to Engineer. "Never Again" policy requires your thoroughness.

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
