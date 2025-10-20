# QA Direction

- **Owner:** Manager Agent
- **Effective:** 2025-10-20
- **Version:** 4.0

## Objective

**Issue**: #110  
Execute comprehensive production QA + provide final GO/NO-GO

## Current Status

P0 /health ✅ (deployed), Chatwoot ✅ (restored), AppProvider ❌ (Engineer fixing)

## Tasks

### ✅ ENGINEER FIXED - STAGING IS LIVE - TEST NOW

**STAGING READY** (Deployed 2025-10-20T15:58Z):
- Fly version: 48
- Shopify version: hot-dash-29
- AppProvider i18n: FIXED ✅
- URL: https://hotdash-staging.fly.dev

### IMMEDIATE (30 min) - TEST NOW

**QA-018**: Retest AppProvider Fix
1. Open https://hotdash-staging.fly.dev
2. Click "View breakdown" button on Sales Pulse tile
3. Verify: Modal opens (NO crash)
4. Test ALL interactive buttons
5. Screenshot evidence: buttons working
6. Report: PASS/FAIL

**QA-019**: Retest /health Endpoint
1. `curl https://hotdash-staging.fly.dev/health`
2. Expected: HTTP 200 with JSON status
3. Report: PASS/FAIL

### THEN (2-3h) - UI/UX Testing

**QA-012 to QA-017**: Resume from Oct 19 direction
- Mobile responsiveness
- Browser compatibility  
- Performance testing
- Final QA packet
- Production checklist
- GO/NO-GO recommendation

### Final Decision

**GO** if:
- ✅ /health endpoint working
- ✅ AppProvider i18n fixed (buttons work)
- ✅ Designer validates UI
- ✅ Pilot validates HITL flow

**NO-GO** if:
- ❌ AppProvider still crashes
- ❌ Critical functionality broken

## Constraints

**Tools**: Chrome DevTools MCP (available per Manager), npm, curl  
**Budget**: ≤ 3 hours total  
**Paths**: tests/**, reports/qa/**, feedback/qa/**

## Links

- Previous QA: feedback/qa/2025-10-19.md (CONDITIONAL GO, B+ grade)
- Chrome DevTools MCP: Verified working by Manager

## Definition of Done

- [ ] AppProvider fix verified (buttons don't crash)
- [ ] /health endpoint tested
- [ ] Final GO/NO-GO decision provided
- [ ] Evidence logged in feedback/qa/2025-10-20.md
