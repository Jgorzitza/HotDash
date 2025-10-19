# Pilot Direction

- **Owner:** Pilot Agent
- **Effective:** 2025-10-19
- **Version:** 4.0

## Objective

Current Issue: #115

**UNBLOCKED**: Production app live at `https://hotdash-staging.fly.dev` - Execute comprehensive UX validation and production smoke tests using Chrome DevTools MCP.

## Production App Access

**URL**: `https://hotdash-staging.fly.dev`  
**Tool**: Chrome DevTools MCP (use `mcp_Chrome_DevTools_*` functions)  
**Status**: Version hot-dash-22 deployed and accessible ✅

## Tasks (15 Molecules - UX Validation)

### Completed Molecules (4/15) ✅

1. **PIL-010:** Production Smoke Test Suite (45 min) ✅
   - Evidence: `docs/runbooks/production_smoke_tests.md`

2. **PIL-012:** UX Issue Prioritization (30 min) ✅
   - Evidence: `docs/tests/ux-issues-prioritized.md`

3. **PIL-013:** Pilot Validation Report (35 min) ✅
   - Evidence: `reports/pilot/validation-2025-10-19.md`

4. **PIL-015:** WORK COMPLETE Block (10 min) ✅
   - Evidence: `feedback/pilot/2025-10-19.md`

### Production Testing Molecules (11 remaining)

5. **PIL-001: Critical User Flow Testing** (50 min)
   - Use Chrome DevTools MCP:
     - `new_page` → production URL
     - `take_snapshot` → identify interactive elements
     - `click` → test tile interactions
     - `take_screenshot` → capture each step
   - Flow: Login → Dashboard → Tile click → Drawer open → Approval workflow
   - Evidence: Flow screenshots, completion times, UX friction points

6. **PIL-002: Dashboard Tile Interaction Testing** (35 min)
   - Test all 8 tiles with Chrome DevTools
   - `click`, `hover`, `take_screenshot` for each state
   - Verify: Click response, hover effects, loading indicators
   - Evidence: Tile interaction screenshots

7. **PIL-003: Approvals HITL Flow Validation** (40 min)
   - Test complete approval workflow:
     - Draft → Review → Grade → Approve/Reject → Apply
   - Use `fill_form` for grading inputs
   - Evidence: Complete HITL flow screenshots with timing

8. **PIL-004: Keyboard Navigation Testing** (35 min)
   - Test tab order, Enter/Escape, focus indicators
   - Use Chrome DevTools accessibility panel
   - Evidence: Keyboard nav audit report

9. **PIL-005: Mobile Responsiveness Testing** (30 min)
   - `resize_page` to 375px, 768px, 1024px
   - Test touch targets, scrolling, drawer behavior
   - Evidence: Mobile screenshots at each breakpoint

10. **PIL-006: Error Scenario Testing** (35 min)
    - Use `evaluate_script` to trigger network failures
    - Test validation errors, edge cases
    - Evidence: Error state screenshots

11. **PIL-007: Loading Performance Perception** (30 min)
    - Use `performance_start_trace` and `performance_stop_trace`
    - Measure tile load times, skeleton state duration
    - Evidence: Performance metrics, Core Web Vitals

12. **PIL-008: Copy/Microcopy Review** (25 min)
    - Review button labels, error messages, help text
    - Compare with design spec
    - Evidence: Microcopy audit document

13. **PIL-009: Accessibility Manual Testing** (40 min)
    - Screen reader testing (Chrome DevTools a11y tree)
    - Color contrast verification
    - ARIA label validation
    - Evidence: WCAG AA compliance report

14. **PIL-011: Production Environment Validation** (40 min)
    - Full smoke test on https://hotdash-staging.fly.dev
    - Verify: All tiles load, drawers open, no console errors
    - Use `list_console_messages` to check for errors
    - Evidence: Production validation report

15. **PIL-014: Final UX Report** (30 min)
    - Consolidate all findings
    - Create prioritized UX improvement list
    - Provide GO/NO-GO recommendation
    - Evidence: Final UX validation report

## Constraints

- **Allowed Tools:** Chrome DevTools MCP (all functions), `bash`, `curl`
- **MCP Tools (Mandatory):**
  - **mcp_Chrome_DevTools_new_page**: Open production app
  - **mcp_Chrome_DevTools_take_screenshot**: UI state capture
  - **mcp_Chrome_DevTools_take_snapshot**: Page analysis
  - **mcp_Chrome_DevTools_click**: Interaction testing
  - **mcp_Chrome_DevTools_fill_form**: Form testing
  - **mcp_Chrome_DevTools_resize_page**: Responsive testing
  - **mcp_Chrome_DevTools_evaluate_script**: Error scenarios
  - **mcp_Chrome_DevTools_performance_start_trace**: Performance testing
  - **mcp_Chrome_DevTools_list_console_messages**: Error detection
- **Allowed Paths:** `docs/runbooks/production_smoke_tests.md`, `docs/tests/**`, `reports/pilot/**`, `artifacts/pilot/**`, `feedback/pilot/2025-10-19.md`
- **Budget:** ≤60 min per molecule

## Definition of Done

- [ ] All 15 molecules executed with Chrome DevTools MCP evidence
- [ ] Complete UX validation report
- [ ] Production smoke tests passing
- [ ] GO/NO-GO recommendation provided
- [ ] Screenshot gallery created
- [ ] Feedback entry complete

## Contract Test

- **Command:** `curl https://hotdash-staging.fly.dev` (200 OK)
- **Visual:** All tiles visible and interactive via Chrome DevTools
- **Evidence:** Production validation report with screenshots

## Risk & Rollback

- **Risk Level:** LOW (read-only testing)
- **Rollback Plan:** N/A (no code changes)
- **Monitoring:** UX findings feed into Product go/no-go decision

## Links & References

- Production App: https://hotdash-staging.fly.dev
- Shopify Dashboard: https://dev.shopify.com/dashboard/185825868/apps/285941530625
- Feedback: `feedback/pilot/2025-10-19.md`
- Reports: `reports/pilot/validation-2025-10-19.md`

## Change Log

- 2025-10-19: Version 4.0 – **UNBLOCKED** - Production app accessible, Chrome DevTools MCP ready
- 2025-10-19: Version 3.0 – Created, 4/15 complete, blocked by server
