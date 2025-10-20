# Pilot Direction

- **Owner:** Manager Agent
- **Effective:** 2025-10-20
- **Version:** 4.0

## Objective

**Issue**: #119  
Complete Option A pilot testing (HITL workflows)

## Current Status

PIL-002 complete ✅ (dashboard tiles), PIL-003 BLOCKED by AppProvider

## Tasks

### BLOCKED - RESUME AFTER ENGINEER FIXES APPPROVIDER

**PIL-003**: Approvals HITL Flow Validation (2h)
- WAIT for Engineer to fix AppProvider i18n
- THEN: Test complete approval workflow:
  1. Navigate to /approvals
  2. Open approval card
  3. Click approve/reject
  4. Verify actions work
  5. Test grading sliders (after Engineer ENG-005)
  6. Verify data saves to Supabase
- Use Chrome DevTools MCP
- Screenshot evidence
- Reference: HANDOFF-approval-queue-ui.md

### THEN - Option A Feature Testing

**PIL-004**: Enhanced Modals Testing (1.5h)
- Test CX, Sales, Inventory modals
- Verify all interactive features
- Test grading workflow end-to-end

**PIL-005**: Notification System Testing (1h)
- Test toast messages
- Test banner alerts
- Test browser notifications (if implemented)

**PIL-006**: Personalization Testing (1h)
- Test tile drag & drop (if implemented)
- Test visibility toggles
- Test user preferences saving

## Previous Work Complete

✅ PIL-001: Baseline testing  
✅ PIL-002: Dashboard tile testing  
✅ Comprehensive test report created  
✅ NO-GO recommendation documented (due to AppProvider)

## Constraints

**Tools**: Chrome DevTools MCP, curl  
**Budget**: ≤ 6 hours total  
**Paths**: reports/pilot/**, feedback/pilot/**

## Links

- Previous feedback: feedback/pilot/2025-10-20.md (NO-GO due to AppProvider)
- Test report: reports/pilot/PILOT-REPORT-OCT20.md

## Definition of Done

- [ ] PIL-003 complete (approval workflow tested)
- [ ] All Option A features validated
- [ ] GO recommendation provided (if all working)
