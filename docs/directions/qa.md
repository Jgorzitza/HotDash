# QA - Production Validation Suite

> Validate everything. 100% test coverage. Zero regressions. Ship with confidence.

**Issue**: #110 | **Repository**: Jgorzitza/HotDash | **Allowed Paths**: tests/**, docs/tests/**

## Constraints

- MCP Tools: MANDATORY for validation
  - `mcp_shopify_introspect_graphql_schema` for API contract verification
  - `mcp_context7_get-library-docs` for React Router 7 patterns (library: `/remix-run/react-router`)
- Framework: React Router 7 (NOT Remix) - verify loader/action patterns
- All tests must pass before production
- Use real Shopify Admin for integration tests (via `shopify app dev`)
- Accessibility: WCAG 2.1 AA mandatory
- Performance: P95 <3s for all tiles
- No flaky tests - fix or skip with issue

## Definition of Done

- [ ] Unit: 100% passing (230+ tests)
- [ ] Integration: 100% passing (all API contracts verified)
- [ ] E2E: 100% passing (user flows end-to-end)
- [ ] Accessibility: <5 moderate violations, 0 critical
- [ ] Performance: All tiles <3s P95
- [ ] Evidence: Test reports + CI green

## Production Molecules

### QA-001: Unit Test Suite - 100% Green (30 min)

**Command**: `npm run test:unit`
**Current**: 230/230 passing (Manager confirmed)
**Action**: Verify no regressions, run full suite
**Fix**: Any new failures from Engineer changes
**Evidence**: Test output showing 100%, timestamp

### QA-002: Integration Test Contracts (45 min)

**Files**: tests/integration/\*.spec.ts
**MCP**: Use `mcp_shopify_introspect_graphql_schema` to verify contract shapes
**Contracts to verify**:

- Shopify Orders API: totalPriceSet.shopMoney.amount exists
- Shopify Inventory API: inventoryItem.id structure
- Chatwoot Conversations API: messages[].content
- GA4 Data API: rows[].metricValues
- Publer API: social_accounts structure
  **Test**: Mock API responses match real schema
  **Evidence**: All contracts passing

### QA-003: E2E User Flows - Playwright (60 min)

**Files**: tests/e2e/\*.spec.ts
**Server**: Must run `npm run dev` for E2E
**Critical Flows**:

1. Dashboard loads → All 8 tiles visible
2. Click idea → Idea pool drawer opens
3. Approve idea → Approval recorded
4. Click approval → Approvals drawer opens
5. Grade approval → Grades saved
6. Keyboard nav → All interactive elements reachable
   **Evidence**: All flows passing, video recording

### QA-004: Accessibility Audit - Full App (40 min)

**Tool**: Axe DevTools + Pa11y CLI
**Pages**: Dashboard, Approvals, Ideas
**Components**: All tiles, both drawers
**Run**:

```bash
npx pa11y-ci --config .pa11yci.json
```

**Fix**: Work with Engineer to fix criticals
**Evidence**: Audit report <5 moderate, 0 critical

### QA-005: Performance Testing - Tile Load Times (30 min)

**Tool**: Lighthouse CI + manual timing
**Target**: All 8 tiles load <3s P95
**Test**:

```bash
npm run test:perf
```

**Measure**: Network waterfall, Time to Interactive
**Evidence**: Performance report, all tiles meeting SLA

### QA-006: Feature Flag Validation (25 min)

**Flags**: ANALYTICS_REAL_DATA, IDEA_POOL_LIVE, SHOPIFY_REAL_DATA
**Test**:

- Flag=false → Mocks used, no external calls
- Flag=true → Real APIs called (in dev only)
- Production → All flags must default false
  **Evidence**: Flag states verified, no leaks to prod

### QA-007: Error Handling Validation (20 min)

**Scenarios**:

- Network timeout → User sees retry button
- API 500 error → User sees friendly message
- Invalid data → Validation error shown
- Missing permissions → Auth error shown
  **Test**: Manually trigger each, verify UX
  **Evidence**: All error states user-friendly

### QA-008: Responsive Layout Testing (25 min)

**Viewports**:

- Desktop: 1920x1080, 1280x800
- Tablet: 768x1024
- Mobile: 375x667 (iPhone SE)
  **Test**: Resize, verify no overflow, readable text
  **Evidence**: Screenshots at each breakpoint

### QA-009: Cross-Browser Testing (30 min)

**Browsers**: Chrome, Firefox, Safari (if Mac available), Edge
**Test**: Dashboard loads, interactions work
**Known issue**: Shopify Admin only supports modern browsers
**Evidence**: Test results per browser

### QA-010: Security Smoke Test (20 min)

**Checks**:

- No secrets in bundle: `grep -r "sk_" build/`
- No API keys in client: `grep -r "SUPABASE_SERVICE" build/client/`
- CSP headers present
- HTTPS only in production config
  **Evidence**: No secrets found, CSP configured

### QA-011: Data Integrity Validation (25 min)

**Coordinate with Data agent**:

- RLS policies block unauthorized access
- Idea pool maintains 5 suggestions
- Approvals audit log complete
- Grades saved correctly
  **Test**: Query database, verify constraints
  **Evidence**: All integrity checks passing

### QA-012: Staging Environment Validation (40 min)

**After DevOps deploys staging**:

- Health route: `curl https://staging.hotrodan.com/health`
- All tiles load
- Real Shopify connection works
- Database accessible
  **Evidence**: Staging working, screenshot

### QA-013: Go/No-Go Report Preparation (30 min)

**Collaborate with Product agent**:

- Compile all test results
- List P0/P1/P2 bugs
- Risk assessment
- Recommendation: GO or NO-GO
  **Evidence**: Report at docs/specs/production_go_no_go.md

### QA-014: Production Smoke Test Plan (20 min)

**Document**: docs/runbooks/production_smoke_tests.md
**Tests**:

1. /health returns 200
2. Dashboard loads <5s
3. Shopify Admin embedding works
4. No console errors
5. Feature flags all false
   **Evidence**: Runbook created, ready to execute

### QA-015: WORK COMPLETE Block (10 min)

**Update**: feedback/qa/2025-10-19.md
**Include**:

- All 15 molecules complete
- All test suites: 100% passing
- Go/No-Go report delivered
- Staging validated
- Next: Production smoke tests post-deploy

## Foreground Proof

1. Unit tests: 230/230 output
2. Integration contracts: All passing
3. E2E: Video of user flows
4. Accessibility: Pa11y report
5. Performance: Lighthouse report
6. Feature flags: Verification log
7. Error states: Screenshots
8. Responsive: Multi-viewport screenshots
9. Cross-browser: Test matrix
10. Security: No secrets found
11. Data integrity: SQL query results
12. Staging: Health check passing
13. Go/No-Go report: docs/specs/production_go_no_go.md
14. Smoke test plan: docs/runbooks/production_smoke_tests.md
15. WORK COMPLETE: feedback entry

## Test Commands Reference

```bash
# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# E2E tests (requires dev server)
npm run dev &
npm run test:e2e

# Accessibility
npx pa11y-ci

# Performance
npm run test:perf

# Full CI suite
npm run test:ci

# Security scan
npm run scan
```

## Rollback

If critical bug found in staging:

1. Document in BLOCKER report
2. Escalate to Manager
3. NO-GO recommendation
4. List required fixes before retry

**TOTAL ESTIMATE**: ~7 hours
**SUCCESS**: 100% tests passing, Go/No-Go report delivered, staging validated
