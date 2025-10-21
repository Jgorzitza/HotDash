# Designer Direction v5.2

📌 **FIRST ACTION: Git Setup**
```bash
cd /home/justin/HotDash/hot-dash
git fetch origin
git checkout manager-reopen-20251020
git pull origin manager-reopen-20251020
git branch --show-current  # Verify: should show manager-reopen-20251020
```

**Owner**: Manager  
**Effective**: 2025-10-21T03:57Z  
**Version**: 5.2  
**Status**: ACTIVE — Phase 6 Validation + Phase 9 Prep + Audits

---

## Objective

**Validate Phase 6 implementation + Prepare Phase 9 + Comprehensive audits**

---

## MANDATORY MCP USAGE

**Before any validation work, pull design system docs**:

```bash
# Polaris design patterns
mcp_context7_get-library-docs("/websites/polaris-react_shopify", "accessibility WCAG patterns")

# Chrome DevTools for testing
# Use mcp_Chrome_DevTools_take_snapshot for evidence
```

**Log evidence in feedback with screenshots/snapshots**.

---

## ACTIVE TASKS (10h total)

### DES-009: Settings Page Design Validation (2h)

**Wait For**: Engineer ENG-014 to ENG-022 complete

**Requirements**:
- Validate Settings page matches design specs
- Check all 4 tabs (Dashboard, Appearance, Notifications, Account)
- Verify drag/drop animations smooth
- Test theme switcher (Light/Dark/Auto)
- Mobile responsive check

**MCP Required**: Use Chrome DevTools MCP for snapshot evidence

**Validation Checklist**:
- [ ] Settings page layout matches `docs/design/settings-page-spec.md`
- [ ] Drag/drop tile reorder animations smooth (no jank)
- [ ] Theme selector working (Light/Dark/Auto with instant apply)
- [ ] All toggles/checkboxes functional
- [ ] Mobile responsive (320px to 1920px)
- [ ] Focus trap working (Tab key navigation)
- [ ] ARIA labels present on all interactive elements
- [ ] Color contrast WCAG 2.2 AA compliant

**Deliverables**:
- Screenshot evidence of all 4 tabs
- Issues list (if any) for Engineer to fix
- Sign-off in feedback when passing

**Time**: 2 hours (after Engineer Phase 6 complete)

---

### DES-010: Onboarding Flow Wireframes (3h)

**Requirements**:
- Design 4-step onboarding tour for Phase 9
- Welcome screen + 4 feature highlights
- Hot Rodan brand voice throughout
- Mobile + desktop layouts

**Wireframes Needed**:
1. **Welcome Screen**: "Welcome to Hot Rod AN Control Center"
2. **Step 1**: Dashboard overview (8 tiles explanation)
3. **Step 2**: Approval queue workflow (HITL concept)
4. **Step 3**: Notifications system (toast/banner/browser)
5. **Step 4**: Settings personalization (theme, tiles)

**Polaris Components**: Modal, Button, ProgressBar, Text, Icon

**Deliverables**:
- `docs/design/onboarding-flow-wireframes.md` (new file)
- 5 wireframe sketches (welcome + 4 steps)
- Microcopy for each screen
- Accessibility notes

**Time**: 3 hours

---

### DES-011: Mobile Optimization Review (2h)

**Requirements**:
- Review ALL implemented features (Phases 1-6) on mobile
- Test iOS Safari + Android Chrome
- Document issues and recommendations

**Test Devices**:
- iOS Safari (iPhone 12+)
- Android Chrome (Pixel 5+)
- Responsive mode (Chrome DevTools 320px-428px)

**Areas to Test**:
- Dashboard tiles (touch interactions)
- Modals (CX, Sales, Inventory)
- Drag & drop tile reorder (touch events)
- Notifications (toast, banner)
- Settings page (all tabs)
- Approval queue

**MCP Required**: Use Chrome DevTools MCP for mobile snapshots

**Deliverables**:
- Mobile test report in `docs/design/mobile-optimization-report.md`
- Screenshot evidence of issues
- Recommendations for Engineer

**Time**: 2 hours

---

### DES-012: Accessibility Audit Phase 1-6 Features (3h)

**Requirements**:
- Comprehensive WCAG 2.2 AA audit
- Test all interactive elements with screen reader
- Keyboard navigation testing
- Color contrast validation

**Scope**: All Phases 1-6 features
- Dashboard (8 tiles)
- Approval queue
- 3 modals (CX, Sales, Inventory)
- Notification system
- Settings page

**Testing Tools**:
- Screen reader: NVDA (Windows) or VoiceOver (Mac)
- Keyboard only (no mouse)
- Contrast checker: WebAIM Contrast Checker
- axe DevTools browser extension

**MCP Required**: Chrome DevTools MCP for accessibility tree inspection

**Deliverables**:
- Accessibility audit report: `docs/design/accessibility-audit-phase-1-6.md`
- Issues categorized: Critical, High, Medium, Low
- Remediation recommendations for Engineer
- WCAG 2.2 AA compliance score

**Time**: 3 hours

---

## Work Protocol

**1. MCP Tools** (MANDATORY):
```bash
# Polaris design patterns
mcp_context7_get-library-docs("/websites/polaris-react_shopify", "accessibility design system")

# Chrome DevTools for testing
mcp_Chrome_DevTools_take_snapshot()
mcp_Chrome_DevTools_take_screenshot()
```

**2. Coordinate with**:
- **Engineer**: Wait for Phase 6 completion before DES-009
- **QA**: Share findings for test plan creation
- **Manager**: Escalate critical issues immediately

**3. Reporting (Every 2 hours)**:
```md
## YYYY-MM-DDTHH:MM:SSZ — Designer: Phase 6 Validation

**Working On**: DES-009 (Settings Page Design Validation)
**Progress**: 70% - 3/4 tabs validated, mobile testing remaining

**Evidence**:
- Screenshots: settings-dashboard-tab.png, settings-appearance-tab.png (stored in artifacts/designer/)
- Issues found: 2 minor (color contrast on toggle labels, mobile drag handle size)
- MCP: Chrome DevTools snapshots captured
- Polaris patterns verified: All components match design system

**Blockers**: None
**Next**: Complete mobile testing, create issues list for Engineer
```

---

## Definition of Done

**DES-009**:
- [ ] All 4 Settings tabs validated
- [ ] Desktop + mobile tested
- [ ] Screenshot evidence provided
- [ ] Issues list created (if any)
- [ ] Sign-off given or blockers reported

**DES-010**:
- [ ] 5 wireframes complete (welcome + 4 steps)
- [ ] Microcopy written
- [ ] Accessibility notes included
- [ ] Ready for Engineer Phase 9 implementation

**DES-011**:
- [ ] Mobile test report complete
- [ ] iOS + Android tested
- [ ] Screenshot evidence attached
- [ ] Recommendations provided

**DES-012**:
- [ ] Comprehensive accessibility audit complete
- [ ] WCAG 2.2 AA compliance scored
- [ ] Issues categorized and documented
- [ ] Remediation recommendations clear

---

## Critical Reminders

**DO**:
- ✅ Use MCP Chrome DevTools for ALL testing evidence
- ✅ Test on real devices (not just emulators)
- ✅ Document issues clearly with reproduction steps
- ✅ Provide screenshot evidence
- ✅ Coordinate with Engineer on fixes

**DO NOT**:
- ❌ Validate without testing (must actually use the app)
- ❌ Skip mobile testing
- ❌ Approve work with accessibility violations
- ❌ Create ad-hoc documentation (use specified file paths)

---

## Timeline

**After Engineer Phase 6 Complete**: DES-009 (2h)  
**Parallel**: DES-010 (3h - can start now), DES-011 (2h), DES-012 (3h)

**Total**: 10 hours work

---

## Quick Reference

**Plan**: `docs/manager/PROJECT_PLAN.md` (Phase 6 + 9)  
**Task Assignments**: `feedback/manager/TASK_ASSIGNMENTS_2025-10-21.md`  
**Feedback**: `feedback/designer/2025-10-21.md`  
**Design Specs**: `docs/design/` (57 files)

---

**START WITH**: DES-010 (Onboarding wireframes - can start immediately while waiting for Engineer)

**NO MORE STANDBY - ACTIVE WORK ASSIGNED**
