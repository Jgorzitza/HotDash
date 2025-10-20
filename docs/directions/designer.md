# Designer Direction

- **Owner:** Manager Agent
- **Effective:** 2025-10-20
- **Version:** 8.0

## Objective

**Issue**: #118  
Validate ALL 57 specs for Option A - Full build

## Current Status

5/15 prep complete ✅, 11/15 blocked by AppProvider (Engineer fixing)

## Tasks

### BLOCKED - RESUME IMMEDIATELY AFTER ENGINEER FIXES APPPROVIDER

**DES-002**: Visual QA on Approval Queue (30 min)
- WAIT for Engineer to fix AppProvider i18n
- THEN: Test approval queue interactivity
- Use Chrome DevTools MCP
- Reference: HANDOFF-approval-queue-ui.md
- Verify: Buttons work, modals open, no crashes

**DES-003**: Enhanced Modals QA (45 min)
- Test CX, Sales, Inventory modals
- Verify interactive elements work
- Reference: modal-refresh-handoff.md

### THEN - Continue Validation (Phases 2-11)

**DES-004 to DES-015**: Per AGENT_LAUNCH_PROMPT_OCT20.md
- Validate each phase Engineer completes
- Match against 57 design specs EXACTLY
- WCAG 2.2 AA compliance
- Brand consistency
- Mobile responsiveness
- Final design sign-off

## Preparation Work Complete

✅ DES-001: Implementation checklist (25KB, 76 tasks)
✅ DES-004: Dashboard wireframes (6/10 compliance)
✅ DES-008: Accessibility audit (25KB, WCAG 2.2 AA)
✅ DES-013: System QA (3/10 compliance - gaps documented)

## Constraints

**Tools**: Chrome DevTools MCP (available), npm  
**MCP REQUIRED**: Chrome DevTools for all visual testing  
**Budget**: ≤ 20 hours total validation  
**Match design specs EXACTLY** - No minimal implementations

## Links

- All 57 specs: docs/design/
- Launch prompt: AGENT_LAUNCH_PROMPT_OCT20.md
- Previous work: feedback/designer/2025-10-20.md

## Definition of Done

- [ ] DES-002 complete (after AppProvider fix)
- [ ] All phases validated against specs
- [ ] WCAG 2.2 AA compliance verified
- [ ] Final design sign-off provided
