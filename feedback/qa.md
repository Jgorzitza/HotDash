---
epoch: 2025.10.E1
doc: feedback/qa.md
owner: qa-agent
last_reviewed: 2025-10-05
doc_hash: TBD
expires: 2025-10-18
---
# QA Regression Matrix — HotDash Operator Control Center

## Test Coverage Status

### ✅ Unit Tests (Vitest)
- **Status**: PASSING (6/6 tests)
- **Coverage**:
  - `tests/unit/shopify.orders.spec.ts` - Sales Pulse aggregation with mock data
  - `tests/unit/shopify.inventory.spec.ts` - Inventory alerts
  - `tests/unit/chatwoot.action.spec.ts` - Escalation action handling
  - `tests/unit/chatwoot.escalations.spec.ts` - Escalation detection
  - `tests/unit/ga.ingest.spec.ts` - Landing page anomaly detection with mock GA client
  - `tests/unit/sample.spec.ts` - Basic test runner validation
- **Mock Data**: ✅ All services (Shopify, Chatwoot, GA) have deterministic mock clients
- **Offline Capability**: ✅ Tests run without external API dependencies

### ⚠️ E2E Tests (Playwright)
- **Status**: FAILING (1/1 test)
- **Test**: `tests/playwright/dashboard.spec.ts` - "renders control center tiles"
- **Issue**: Custom `<s-page>` element does not expose semantic heading role
- **Error**: `getByRole('heading', { name: /Operator Control Center/i })` - element not found
- **Root Cause**: app._index.tsx:392 uses `<s-page heading="...">` which may not render proper `<h1>` with accessible role
- **Blocker**: YES - prevents PR merge per evidence gate requirements
- **Fix Required**: Update test selector or ensure `<s-page>` renders accessible heading

### 📊 Lighthouse Audit
- **Status**: CONFIGURED (script exists at `scripts/ci/run-lighthouse.mjs:23`)
- **Gating**: Requires `LIGHTHOUSE_TARGET` env var to run
- **Current State**: SKIPPED (no target URL configured yet)
- **Note**: Will be required for PR merge once routing is live per `.github/workflows/evidence.yml:12`

### 🎭 Screenshot Evidence
- **Configuration**: Playwright HTML reporter outputs to `./coverage/playwright/`
- **Mock Mode**: ✅ Dashboard renders in mock mode with `DASHBOARD_USE_MOCK=1` or `?mock=1`
- **Status**: Evidence gate requires artifacts in PR body (vitest, playwright, lighthouse per `scripts/ci/require-artifacts.js`)

## Test Infrastructure

### Mock Data Suites
| Service | Mock Location | Status | Notes |
|---------|---------------|--------|-------|
| Shopify Orders | Inline in unit tests | ✅ | Deterministic mock with graphql stub |
| Shopify Inventory | Inline in unit tests | ✅ | Mock alerts with threshold logic |
| Chatwoot | `vi.mock()` in test files | ✅ | Client methods mocked |
| Google Analytics | `app/services/ga/mockClient.ts:3-27` | ✅ | Sample landing page sessions |

### CI/CD Pipeline
- **Workflow**: `.github/workflows/tests.yml` runs on PR + push to main
- **Commands**: `npm run test:ci` = unit + e2e + lighthouse
- **Evidence Gates**: `.github/workflows/evidence.yml` enforces artifact links in PR body

## Known Blockers

### 🔴 CRITICAL
1. **Playwright Test Failure** - Dashboard tile rendering test fails due to heading selector
   - **Impact**: PR merge blocked by evidence gate
   - **Location**: `tests/playwright/dashboard.spec.ts:6-18`
   - **Action**: Fix `<s-page>` heading accessibility OR update test selector to use testId

### 🟡 MEDIUM
2. **Missing Regression Matrix** - No `feedback/qa.md` existed until now
   - **Impact**: Cannot track regression history per direction
   - **Action**: This file created; maintain going forward

3. **Playwright Coverage Gaps** - Only 1 E2E test exists
   - **Missing**: Drill-in interactions, approval actions per tile
   - **Required**: Per directions/qa.md:12 - "Add Playwright coverage per tile (summary + drill-in + approval action)"
   - **Action**: Expand test suite to cover all 5 tiles with user interactions

4. **No Soak Test Artifacts** - Direction requires streaming/approval soak tests
   - **Missing**: No soak test implementation found
   - **Expected Location**: `artifacts/` directory with timestamps per direction
   - **Action**: Create SSE streaming stress tests and approval flow endurance tests

### 🟢 LOW
5. **Lighthouse Target Unconfigured** - Audit skipped without target URL
   - **Impact**: Will become blocker when dashboard goes live
   - **Action**: Set `LIGHTHOUSE_TARGET` env var once routing is production-ready

## Prisma Migration Health

### Current Migrations
1. `20240530213853_create_session_table` - ✅ Session storage for Shopify auth
2. `20251005160022_add_dashboard_facts_and_decisions` - ✅ DashboardFact + DecisionLog tables

### Migration Testing Requirements (Per Direction)
- ✅ Forward migration capability - migrations exist
- ❌ **UNTESTED**: Rollback capability on SQLite
- ❌ **UNTESTED**: Rollback capability on Postgres
- ❌ **UNTESTED**: CI/staging validation before sign-off

**Action Required**: Test `prisma migrate rollback` on both SQLite (dev) and Postgres (staging) before production deploy

## Recommendations

### Immediate (This Week)
1. Fix Playwright heading selector to unblock PR merges
2. Add test coverage for each tile's drill-in and approval flows
3. Test Prisma migration rollback on SQLite + Postgres

### Next Sprint
1. Implement SSE streaming soak tests (simulate 100+ concurrent dashboard sessions)
2. Create approval flow endurance test (100+ rapid escalation replies)
3. Set up Lighthouse target URL and configure baseline thresholds
4. Add visual regression testing with Playwright screenshots

### Ongoing
1. Update this matrix after every sprint with new test results
2. Track API rate-limit blockers (Shopify, Chatwoot, GA) in daily standup
3. Maintain deterministic fixtures as APIs evolve

---
**Next Review**: 2025-10-18 (align with doc expiration)
**QA Agent Status**: ✅ All direction tasks assessed, 1 critical blocker identified

## Governance Acknowledgment — 2025-10-06
- Reviewed docs/directions/README.md and docs/directions/qa.md; acknowledge manager-only ownership and Supabase secret policy.
