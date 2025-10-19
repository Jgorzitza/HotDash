# Pilot - UX Validation + Production Smoke Tests

> Test all flows. Validate UX. Run smoke tests. Find issues. Ship confident.

**Issue**: #119 | **Repository**: Jgorzitza/HotDash | **Allowed Paths**: tests/e2e/**, docs/tests/**

## Constraints

- Real user perspective: Think like merchant using app
- E2E tests must cover critical paths
- Accessibility testing mandatory
- Production smoke tests ready for deploy
- Document all UX issues found

## Definition of Done

- [ ] All critical user flows tested end-to-end
- [ ] UX issues documented and prioritized
- [ ] Production smoke test suite ready
- [ ] Accessibility validation complete
- [ ] Pilot validation report delivered
- [ ] Evidence: E2E tests passing, UX report

## Production Molecules

### PIL-001: Critical User Flow Testing (50 min)

**Flows**:

1. Open app in Shopify Admin
2. View dashboard → All 8 tiles load
3. Click idea → Drawer opens → Approve idea
4. Check approvals queue → See approved idea
5. Click approval → Drawer opens → Grade approval
   **Evidence**: All flows working, video recorded

### PIL-002: Dashboard Tile Interaction Testing (35 min)

**Test**: Click each of 8 tiles
**Verify**: Appropriate action (drawer, detail view, or info display)
**Check**: No broken links, all interactions intuitive
**Evidence**: Interaction report

### PIL-003: Approvals HITL Flow Validation (40 min)

**Flow**: Draft generated → Review → Edit → Grade → Approve → Execute
**Check**: Every step clear, no confusion, grading intuitive
**Evidence**: HITL flow validated

### PIL-004: Keyboard Navigation Testing (35 min)

**Navigate**: Entire app using only keyboard (Tab, Shift+Tab, Enter, Escape)
**Check**: All interactive elements reachable, focus visible, logical order
**Evidence**: Keyboard nav working

### PIL-005: Mobile Responsiveness Testing (30 min)

**Devices**: iPhone SE (375x667), iPad (768x1024)
**Check**: Readable text, tappable buttons, no horizontal scroll
**Evidence**: Mobile screenshots

### PIL-006: Error Scenario Testing (35 min)

**Scenarios**:

- Network offline → Graceful error
- API timeout → Retry option
- Invalid data → Validation message
  **Evidence**: All errors user-friendly

### PIL-007: Loading Performance Perception (30 min)

**Test**: How loading feels to user
**Check**: Skeleton loaders smooth, no jarring content shifts, perceived fast
**Evidence**: Performance feels good

### PIL-008: Copy/Microcopy Review (25 min)

**Check**: All text clear, helpful, on-brand
**Flag**: Any confusing labels, missing help text
**Evidence**: Copy review notes

### PIL-009: Accessibility Manual Testing (40 min)

**Test**: Screen reader (NVDA or VoiceOver)
**Check**: All content announced, logical reading order, form labels
**Evidence**: Screen reader compatible

### PIL-010: Production Smoke Test Suite Creation (45 min)

**File**: docs/runbooks/production_smoke_tests.md
**Tests**:

1. /health returns 200
2. Dashboard loads <5s
3. All 8 tiles show data
4. One drawer opens and closes
5. No console errors
   **Evidence**: Smoke test checklist ready

### PIL-011: Staging Environment Validation (40 min)

**When staging deployed**: Run full E2E suite against staging
**Verify**: Real Shopify connection, real data flowing, no staging-specific bugs
**Evidence**: Staging validation report

### PIL-012: UX Issue Prioritization (30 min)

**Classify**: All UX issues as P0/P1/P2/P3
**P0**: Blocks core flow
**P1**: Significant confusion
**P2**: Minor inconvenience
**P3**: Nice to have
**Evidence**: Prioritized UX issue list

### PIL-013: Pilot Validation Report (35 min)

**File**: reports/pilot/validation-2025-10-19.md
**Include**: Flows tested, issues found, recommendations, GO/NO-GO input
**Evidence**: Report complete

### PIL-014: Engineer Coordination - Fix Critical UX (30 min)

**Coordinate**: Work with Engineer to fix any P0 UX issues
**Retest**: After fixes applied
**Evidence**: P0 issues resolved

### PIL-015: WORK COMPLETE Block (10 min)

**Update**: feedback/pilot/2025-10-19.md
**Include**: All flows validated, UX issues documented, smoke tests ready
**Evidence**: Feedback entry

## Foreground Proof

1. Critical user flow video
2. Tile interaction report
3. HITL flow validated
4. Keyboard navigation working
5. Mobile screenshots
6. Error scenarios tested
7. Loading performance good
8. Copy review notes
9. Screen reader compatible
10. production_smoke_tests.md created
11. Staging validation report
12. UX issue priority list
13. validation-2025-10-19.md report
14. P0 issues fixed
15. WORK COMPLETE feedback

**TOTAL ESTIMATE**: ~7 hours
**SUCCESS**: UX validated, all critical flows working, smoke tests ready for production
