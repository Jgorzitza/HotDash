# QA Direction

- **Owner:** QA Agent
- **Effective:** 2025-10-19
- **Version:** 2.0

## Objective

Current Issue: #110

**UNBLOCKED**: Production app accessible at `https://hotdash-staging.fly.dev`. Execute comprehensive production QA using Chrome DevTools MCP, retest all suites, provide final GO/NO-GO recommendation.

## Production App Access

**URL**: `https://hotdash-staging.fly.dev`  
**Version**: hot-dash-22 (deployed)  
**Tool**: Chrome DevTools MCP for UI/UX testing  
**Status**: Accessible ✅

## Tasks (17 Molecules - Production QA)

### Phase 1: Production Smoke Tests (4 molecules)

1. **QA-001: Production Build Verification** (20 min)
   - Verify latest build deployed to Fly.io
   - Check build artifacts, version number
   - Evidence: Build logs, version hot-dash-22 confirmed

2. **QA-002: Health Endpoint Test** (15 min)
   - Test `/health` endpoint (may be 404 until next deploy with Engineer's route)
   - Verify response structure when available
   - Evidence: `curl https://hotdash-staging.fly.dev/health` results

3. **QA-003: Dashboard Load Test** (25 min)
   - Use Chrome DevTools MCP: `new_page` to production URL
   - Verify dashboard renders without errors
   - Check `list_console_messages` for errors
   - Evidence: Dashboard screenshot, console log clean

4. **QA-004: All Tiles Rendering** (30 min)
   - Use Chrome DevTools `take_snapshot` to list tiles
   - Verify all 8 expected tiles present
   - Check for data vs loading vs error states
   - Evidence: Tile inventory, screenshots

### Phase 2: Full Test Suite Execution (5 molecules)

5. **QA-005: Unit Test Suite Rerun** (35 min)
   - Run `npm run test:unit`
   - Current: 234/270 passing (87%)
   - Target: ≥95% passing
   - Evidence: Test results, failure analysis

6. **QA-006: Integration Test Suite** (40 min)
   - Run `npm run test:integration`
   - Verify contract tests passing (all 6 APIs)
   - Evidence: Integration test results

7. **QA-007: E2E Accessibility Tests** (50 min)
   - Run `npm run test:e2e` (Playwright a11y suite)
   - Fix port configuration (3000 → 5173 or use production URL)
   - Evidence: A11y test results, WCAG AA compliance

8. **QA-008: Security Scan Verification** (25 min)
   - Run `npm run scan` (Gitleaks)
   - Verify 0 secrets in codebase
   - Evidence: Security scan clean report

9. **QA-009: RLS Verification** (30 min)
   - Verify Data agent's RLS fix applied to production
   - Check 4 tables: ads_metrics_daily, agent_run, agent_qc, creds_meta
   - Use Supabase CLI: `psql $DATABASE_URL -c "SELECT tablename, rowsecurity FROM pg_tables WHERE tablename IN ('ads_metrics_daily', 'agent_run', 'agent_qc', 'creds_meta');"`
   - Evidence: All 4 tables show `rowsecurity = t`

### Phase 3: Production UI/UX Testing (5 molecules)

10. **QA-010: Critical User Flows** (60 min)
    - Use Chrome DevTools MCP on production
    - Test: Login → Dashboard → Tile interactions → Drawer workflows
    - Use `click`, `fill_form`, `take_screenshot`
    - Evidence: Flow completion screenshots, timing measurements

11. **QA-011: Approvals HITL Workflow** (50 min)
    - Test complete approval flow on production
    - Draft → Review → Grade (1-5) → Approve/Reject → Apply
    - Evidence: HITL workflow screenshots

12. **QA-012: Mobile Responsiveness** (40 min)
    - Use `resize_page`: 375px, 768px, 1024px
    - Test touch targets, scrolling, drawer behavior
    - Evidence: Mobile screenshots, responsiveness report

13. **QA-013: Browser Compatibility** (45 min)
    - Test on: Chrome, Firefox, Safari, Edge
    - Verify: consistent rendering, no browser-specific bugs
    - Evidence: Cross-browser screenshots

14. **QA-014: Performance Testing** (50 min)
    - Use `performance_start_trace` on production
    - Measure: tile load times, P95 <3s verification, Core Web Vitals
    - Evidence: Performance metrics, CWV scores

### Phase 4: Production Sign-off (3 molecules)

15. **QA-015: Final QA Packet** (40 min)
    - Consolidate all test results
    - Create GO/NO-GO recommendation
    - List any remaining defects with severity/owner/ETA
    - Evidence: Final QA Packet in `feedback/qa/2025-10-19.md`

16. **QA-016: Production Checklist** (30 min)
    - Verify all production requirements met:
      - ✅ Tests ≥95% passing
      - ✅ RLS enabled on critical tables
      - ✅ 0 secrets in code
      - ✅ Health checks configured
      - ✅ Rollback procedures documented
    - Evidence: Production readiness checklist

17. **QA-017: WORK COMPLETE** (15 min)
    - Final feedback entry
    - Hand off to Product for go/no-go decision
    - Evidence: Complete feedback file

## Constraints

- **Allowed Tools:** `npm`, `npx`, `curl`, `psql`, Chrome DevTools MCP
- **MCP Tools (Mandatory):**
  - **mcp*Chrome_DevTools*\***: All UI/UX testing functions
  - Production URL: `https://hotdash-staging.fly.dev`
- **Allowed Paths:** `tests/**`, `docs/runbooks/qa_**`, `reports/qa/**`, `artifacts/qa/**`, `feedback/qa/2025-10-19.md`
- **Budget:** ≤60 min per molecule

## Definition of Done

- [ ] All 17 molecules executed with evidence
- [ ] Production smoke tests passing
- [ ] Unit tests ≥95% passing
- [ ] Integration tests 100% passing
- [ ] RLS verified on 4 critical tables
- [ ] Security scan clean (0 secrets)
- [ ] Chrome DevTools production testing complete
- [ ] Final QA Packet with GO/NO-GO decision
- [ ] Feedback entry complete

## Contract Test

- **Production Health:** `curl https://hotdash-staging.fly.dev` (200 OK)
- **Test Suite:** `npm run test:ci` (≥95% passing)
- **Evidence:** Final QA Packet with all test results

## Risk & Rollback

- **Risk Level:** LOW (testing is read-only)
- **Rollback Plan:** N/A (no code changes)
- **Monitoring:** QA findings determine production readiness

## Links & References

- Production App: https://hotdash-staging.fly.dev
- Shopify Dashboard: https://dev.shopify.com/dashboard/185825868/apps/285941530625
- Feedback: `feedback/qa/2025-10-19.md`
- Previous QA Packet: `feedback/qa/2025-10-19.md` (NO-GO with 4 P0 blockers)

## Change Log

- 2025-10-19: Version 2.0 – **UNBLOCKED** - Production app accessible, retest protocol with Chrome DevTools MCP
- 2025-10-17: Version 1.0 – Initial QA direction
