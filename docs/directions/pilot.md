# Pilot Direction v5.2

📌 **FIRST ACTION: Git Setup**
```bash
cd /home/justin/HotDash/hot-dash
git fetch origin
git checkout manager-reopen-20251020
git pull origin manager-reopen-20251020
```

**Owner**: Manager  
**Effective**: 2025-10-21T04:08Z  
**Version**: 5.2  
**Status**: ACTIVE — Phase 6 Smoke Testing + Mobile + Production Readiness

---

## Objective

**Smoke test Phase 6 features + Mobile compatibility + Production readiness checklist**

---

## MANDATORY MCP USAGE

```bash
# Chrome DevTools for production testing
# Use MCP Chrome DevTools for all testing (take snapshots)
mcp_Chrome_DevTools_navigate_page("https://hotdash-staging.fly.dev")
mcp_Chrome_DevTools_take_snapshot()
```

---

## ACTIVE TASKS (8h total)

### PILOT-004: Phase 6 Settings Smoke Tests (2h) - START NOW

**Wait For**: Engineer Phase 6 complete

**Requirements**:
- Test Settings page on staging
- Drag/drop tile reorder
- Theme switching (Light/Dark/Auto)
- Visibility toggles
- All 4 settings tabs

**MCP Required**: Chrome DevTools MCP for testing evidence

**Test Checklist**:
- [ ] Settings page loads at /settings
- [ ] All 4 tabs render
- [ ] Drag/drop tile reorder working
- [ ] Theme switches apply immediately
- [ ] Tile visibility toggles work
- [ ] Preferences persist after refresh
- [ ] No console errors
- [ ] No broken links

**Deliverables**:
- Smoke test report in feedback with snapshots
- Issues list (if any)
- GO/NO-GO decision for Phase 6

**Time**: 2 hours (after Engineer complete)

---

### PILOT-005: Mobile Testing Safari/Chrome (2h)

**Requirements**:
- Test on iOS Safari (real device)
- Test on Android Chrome (real device)
- Document mobile-specific issues

**Test Areas**:
- Touch drag/drop
- Modal interactions
- Form inputs
- Theme switching
- Notification toasts

**MCP Required**: Chrome DevTools mobile emulation

**Time**: 2 hours

---

### PILOT-006: Edge Case Testing (2h)

**Requirements**:
- Test unusual scenarios
- Drag tile to invalid position
- Rapid theme switching
- All tiles hidden (edge case)
- Network interruption during save

**Time**: 2 hours

---

### PILOT-007: Production Readiness Checklist (2h)

**Requirements**:
- Comprehensive go/no-go checklist for Phase 6
- Performance benchmarks
- Security checks
- Accessibility verification

**File**: `docs/runbooks/phase-6-production-readiness.md` (new)

**Time**: 2 hours

---

## Work Protocol

**MCP Tools**: Chrome DevTools MCP MANDATORY

**Reporting (Every 2 hours)**:
```md
## YYYY-MM-DDTHH:MM:SSZ — Pilot: Phase 6 Smoke Tests

**Working On**: PILOT-004 (Settings smoke tests)
**Progress**: 60% - 3/4 tabs tested, drag/drop verified

**Evidence**:
- MCP Chrome DevTools: 4 snapshots captured
- Settings page: /settings loads successfully
- Drag/drop: Tested 5 tile reorders, all persisted correctly
- Theme switch: Light→Dark→Auto all working
- Issues found: 1 minor (mobile drag handle too small)

**Blockers**: None
**Next**: Test remaining tab, mobile testing
```

---

**START WITH**: PILOT-007 (Production readiness checklist) - Can start now while waiting for Engineer

**NO MORE STANDBY - ACTIVE WORK ASSIGNED**
