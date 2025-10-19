# Pilot Direction

- **Owner:** Pilot Agent
- **Effective:** 2025-10-19
- **Version:** 3.0

## Objective

Current Issue: #115

Execute comprehensive UX validation and production smoke tests across all user flows, accessibility, and performance perception testing.

## Tasks (15 Molecules)

**P0 UNBLOCKER** (depends on Engineer fixing server):
- **PIL-000-P0:** BLOCKED - Waiting for Engineer to fix server startup error (`react-router` export issue)
  - **Impact:** Blocks 11 of 15 molecules requiring running app
  - **ETA:** Pending Engineer ENG-000-P1 completion
  - **Evidence:** Server starts successfully on `npm run dev`

### Executable Molecules (completed):

1. **PIL-010:** Production Smoke Test Suite (45 min) ✅
2. **PIL-012:** UX Issue Prioritization (30 min) ✅
3. **PIL-013:** Pilot Validation Report (35 min) ✅
4. **PIL-015:** WORK COMPLETE Block (10 min) ✅

### Blocked Molecules (require running server):

5. **PIL-001:** Critical User Flow Testing (50 min)
   - Login → Dashboard → Tile interactions → Drawer workflows
   - Evidence: Screenshots, flow completion times

6. **PIL-002:** Dashboard Tile Interaction Testing (35 min)
   - All 8 tiles: click, hover, loading states
   - Evidence: Chrome DevTools screenshots

7. **PIL-003:** Approvals HITL Flow Validation (40 min)
   - Draft → Review → Approve/Reject → Apply
   - Evidence: Complete flow screenshots, timing

8. **PIL-004:** Keyboard Navigation Testing (35 min)
   - Tab order, Enter/Escape, focus indicators
   - Evidence: Accessibility audit report

9. **PIL-005:** Mobile Responsiveness Testing (30 min)
   - 375px, 768px, 1024px breakpoints
   - Evidence: Screenshots at each breakpoint

10. **PIL-006:** Error Scenario Testing (35 min)
    - Network failures, validation errors, edge cases
    - Evidence: Error state screenshots

11. **PIL-007:** Loading Performance Perception (30 min)
    - Skeleton states, spinner timing, perceived speed
    - Evidence: Performance metrics

12. **PIL-008:** Copy/Microcopy Review (25 min)
    - Button labels, error messages, help text
    - Evidence: Microcopy audit document

13. **PIL-009:** Accessibility Manual Testing (40 min)
    - Screen reader, color contrast, ARIA labels
    - Evidence: WCAG AA compliance report

14. **PIL-011:** Staging Environment Validation (40 min)
    - Full production smoke test on staging
    - Evidence: Staging validation report

15. **PIL-014:** Engineer Coordination - Fix Critical UX (30 min)
    - Report P0 UX issues to Engineer
    - Evidence: Issue tickets created

## Constraints

- **Allowed Tools:** Chrome DevTools MCP, `npm`, `curl`, screenshot tools
- **Process:** Follow OPERATING_MODEL.md, use Chrome DevTools MCP for UI diagnostics
- **Allowed Paths:** `docs/runbooks/production_smoke_tests.md`, `docs/tests/ux-issues-prioritized.md`, `reports/pilot/**`, `feedback/pilot/2025-10-19.md`
- **Budget:** Time ≤ 60 minutes per molecule

## Definition of Done

- [ ] All 15 molecules executed with evidence
- [ ] GO/NO-GO recommendation provided
- [ ] UX issues prioritized and routed to owners
- [ ] Validation report complete
- [ ] Feedback entry updated

## Contract Test

- **Command:** `curl http://localhost:5173/health` (once server running)
- **Expectations:** 200 OK response

## Risk & Rollback

- **Risk Level:** Low - Read-only validation work
- **Rollback Plan:** N/A (no code changes)
- **Monitoring:** Validation reports feed into Product go/no-go

## Links & References

- North Star: `docs/NORTH_STAR.md`
- Reports: `reports/pilot/validation-2025-10-19.md`
- Feedback: `feedback/pilot/2025-10-19.md`

## Change Log

- 2025-10-19: Version 3.0 – Created direction file; 4/15 molecules complete, 11 blocked by server error

