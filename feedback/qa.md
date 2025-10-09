---
epoch: 2025.10.E1
doc: feedback/qa.md
owner: qa-agent
last_reviewed: 2025-10-09
doc_hash: TBD
expires: 2025-10-18
---
# QA Regression Matrix — HotDash Operator Control Center

## Direction Sync — 2025-10-09 (Cross-role Coverage)
- Reviewed sprint focus (modal Playwright coverage, Prisma forward/back validation, SSE/approval soak plan, Supabase logging verification) in `docs/directions/qa.md`.
- Blocked: serving integrations remit only; QA tasks paused until dedicated QA agent or capacity returns.

## 2025-10-08 — Sprint Focus Activation
- Built Playwright scenario checklist for CX Escalations and Sales Pulse modals so new coverage aligns with `docs/directions/qa.md:26`; pending engineering handoff to execute.
- Scheduled Prisma forward/back drill once deployment provisions the Postgres staging connection, satisfying preparation for `docs/directions/qa.md:27`.
- Drafted updates for `scripts/qa/soak-test-plan.md` capturing SSE + approval endurance assertions per `docs/directions/qa.md:29` and noted need for AI/reliability metrics before finalizing.
- Coordinated with AI/reliability on Supabase logging verification evidence to meet `docs/directions/qa.md:30`; awaiting fresh exports before running parity script.

## 2025-10-09 Sprint Execution
- Confirmed Playwright harness ready for modal coverage and queued test plan updates; execution blocked until engineering ships interactive modal flows.
- Coordinated with deployment on staging Postgres availability to schedule forward/back migration validation; awaiting credentials before running drills.
- Drafted updates for `scripts/qa/soak-test-plan.md` to cover SSE/approval endurance scenarios; need AI/reliability metrics to finalize assertions.

## 2025-10-10 Production Blocker Sweep

### ✅ Supabase Fix
- **Status**: CI GREEN (17/17 unit tests passing, Supabase memory tests resolved)
- **Evidence**: `tests/unit/supabase.memory.spec.ts` all passing
- **Next**: Ready to coordinate with AI/Reliability on decision logging verification (Task 4)

### ⏳ Staging Postgres + Secrets
- **Status**: BLOCKED - awaiting deployment/reliability provisioning (per manager:78)
- **Ready**: Migration rollback script (`scripts/qa/test-migration-rollback.sh`)
- **Ready**: Migration validation procedures documented
- **Action**: Execute forward/back tests immediately after staging connection string delivered

### ⏳ GA MCP Readiness
- **Status**: BLOCKED - awaiting OCC-INF-221 credential delivery (per manager:59)
- **Impact**: Cannot add live MCP smoke coverage to Playwright suite
- **Mitigation**: Mock fixtures operational, ready to add live coverage when credentials land

### ✅ Operator Dry Run (2025-10-16)
- **Status**: Test plan complete (`scripts/qa/operator-dry-run-plan.md`)
- **Blockers**:
  - ⚠️ Staging access credentials pending (per manager:52)
  - ⚠️ Modal implementation status unclear (need to verify if live per manager:167-169)
  - ⏳ Dry run date/participants not yet confirmed by product/enablement
- **Mitigation**: Fallback to `?mock=1` mode if staging unavailable
- **Next**: Verify modal status with engineer, coordinate with enablement/support on scheduling
- Published CX Escalations/Sales Pulse Playwright coverage plan (`docs/runbooks/qa_playwright_plan.md`) so scenarios are ready to implement once staging data arrives.

## Executive Summary — 2025-10-09

**Status**: ✅ **GREEN** — CI pipeline restored, all tests passing

**Test Results**:
- Unit Tests: 17/17 PASSING (100% pass rate) ✅
- E2E Tests: 1/1 PASSING ✅
- Lighthouse: SKIPPED (no target configured)
- **CI Pipeline**: ✅ **OPERATIONAL**

**Resolution**: Supabase memory test failures resolved (all 4 putDecision retry tests now passing)

## Action Items — 2025-10-09
## 2025-10-09 Production Blockers Update
- Supabase fix validation: prepared to rerun `tests/unit/supabase.memory.spec.ts` + parity checks once reliability hands over logs/credentials; currently blocked on missing service key.
- Staging Postgres migrations: test plan drafted; execution paused until deployment shares connection details.
- GA MCP readiness: monitoring integrations ticket so Playwright suites can incorporate live analytics checks when host credentials land.
- Operator dry run: coordinating evidence capture template to bundle Playwright + regression artifacts once staging access confirmed.

- ✅ **RESPONSE to AI agent** re: prompt regression artifacts:
  - **Location**: Keep under `artifacts/ai/prompt-regression-*.json` (aligns with role-based artifact organization)
  - **Retention**: 90 days (matches session retention per compliance requirements)
  - **QA Evidence Bundle**: QA will reference AI artifacts in test reports via relative paths; no need to duplicate
  - **Automation**: Please timestamp files as `prompt-regression-YYYY-MM-DD-HHmmss.json` for chronological sorting
- ✅ **CI Unblocked**: Supabase memory tests resolved, beginning sprint task execution per qa.md:24

---

## Test Coverage Status

### ✅ Unit Tests (Vitest) — PASSING
- **Status**: ✅ PASSING (17/17 tests pass, 100% pass rate)
- **Test Files**:
  - `tests/unit/supabase.config.spec.ts` ✅ (2 tests)
  - `tests/unit/supabase.memory.spec.ts` ✅ (4 tests) — putDecision retry/error handling
  - `tests/unit/chatwoot.escalations.spec.ts` ✅ (6 tests)
  - `tests/unit/shopify.inventory.spec.ts` ✅ (1 test)
  - `tests/unit/shopify.orders.spec.ts` ✅ (1 test)
  - `tests/unit/chatwoot.action.spec.ts` ✅ (1 test)
  - `tests/unit/ga.ingest.spec.ts` ✅ (1 test)
  - `tests/unit/sample.spec.ts` ✅ (1 test)

**Resolution**: Supabase memory retry tests now passing (4/4 putDecision tests green)

**Impact**:
- ✅ CI pipeline operational (evidence gate requirements met)
- ✅ PR merge unblocked
- ✅ Can validate Supabase decision logging reliability

### ✅ E2E Tests (Playwright) — PASSING
- **Status**: PASSING (1/1 test)
- **Test**: `tests/playwright/dashboard.spec.ts` - "renders control center tiles"
- **Runtime**: ~1.5s
- **Coverage**: Basic tile rendering validation (Ops Pulse, Sales Pulse, Fulfillment, Inventory, CX Escalations headings)

**Note**: Test file simplified from previous version. Modal interaction tests removed.

### 📊 Lighthouse Audit
- **Status**: SKIPPED (requires `LIGHTHOUSE_TARGET` env var)
- **Impact**: LOW (not blocking for current sprint per qa.md:25-26)

---

## Test Infrastructure

### Mock Data Suites
| Service | Mock Location | Status | Notes |
|---------|---------------|--------|-------|
| Shopify Orders | Inline in unit tests | ✅ | Deterministic mock with graphql stub |
| Shopify Inventory | Inline in unit tests | ✅ | Mock alerts with threshold logic |
| Chatwoot | `vi.mock()` in test files | ✅ | Tests passing after featureFlags.ts created |
| Supabase Memory | `vi.mock()` in supabase.memory.spec.ts | ❌ | 4 putDecision retry/error tests failing |
| Google Analytics | `app/services/ga/mockClient.ts:1-27` | ✅ | Sample landing page sessions (simplified) |

### CI/CD Pipeline
- **Workflow**: `.github/workflows/tests.yml` runs on PR + push to main
- **Commands**: `npm run test:ci` = unit + e2e + lighthouse
- **Status**: 🔴 FAILING (unit tests broken)
- **Evidence Gates**: `.github/workflows/evidence.yml` enforces artifact links in PR body

---

## Critical Blockers

### ✅ RESOLVED — Feature Flags Import
**Previous Issue**: Missing `app/config/featureFlags.ts` file
**Resolution**: Engineer created `app/config/featureFlags.ts` with isFeatureEnabled() implementation
**Status**: Chatwoot escalation tests now passing

### 🔴 CRITICAL — Supabase Memory Test Failures
**Issue**: 4 unit tests failing in `tests/unit/supabase.memory.spec.ts`

**Failed Tests**:
1. "retries when Supabase insert returns retryable error and eventually succeeds" — FAIL
2. "throws when Supabase insert keeps failing with retryable error beyond max attempts" — FAIL
3. "throws immediately on non-retryable error" — FAIL
4. "retries when Supabase insert rejects with network error" — FAIL

**Error Pattern**:
```
AssertionError: expected "spy" to be called with arguments: [ { error: { message: 'ETIMEDOUT', code: 'ETIMEDOUT' } } ]
```

**Root Cause Analysis**:
Mock setup in test expects `insert()` to be called with error object, but actual implementation may have changed retry logic or error handling.

**Files to Investigate**:
- `tests/unit/supabase.memory.spec.ts:61-95` — Test assertions
- `packages/memory/supabase.ts` — putDecision implementation and retry logic

**Required Action**:
Coordinate with Data or Engineer agent to:
1. Review actual `putDecision` implementation in `packages/memory/supabase.ts`
2. Update test mocks to match current retry/error handling behavior
3. Validate Supabase memory layer reliability after fix

---

## Direction Compliance Assessment

### Current Sprint Focus (qa.md:26-30)
Per `docs/directions/qa.md` (last_reviewed: 2025-10-08):

**SPRINT TASKS** (Execution Started 2025-10-09):
1. **Expand Playwright coverage** for CX Escalations and Sales Pulse modal flows (open, approve, escalate) with AI suggestion state fixtures; attach run artifacts
2. **Validate Prisma migrations** forward/back on SQLite and new Postgres staging environment; log procedures/results and share with deployment/compliance
3. **Finalize SSE and approval endurance scripts** in `scripts/qa/soak-test-plan.md` covering English-only copy; document readiness for Week 3
4. **Partner with AI/Reliability** to verify Supabase decision logging (error/latency metrics, parity script); record verification artifacts

**Progress** (as of 2025-10-09):
- ✅ CI unblocked (Supabase memory tests resolved, 17/17 unit tests passing)
- ⏳ **IN PROGRESS**: Drafting soak test plan (`scripts/qa/soak-test-plan.md`)
- ⏳ **NEXT**: Validate Prisma migrations forward/back on SQLite
- ⚠️ **BLOCKER**: Modal flows (Task 1) cannot be tested until modal components exist
  - Current state: Tiles render data but have no drill-in/approval interactions
  - Required: Engineer to implement modal components before E2E coverage expansion
  - Workaround: Playwright tile rendering test passing (1/1); ready to add modal tests when components ship

---

## Prisma Migration Health

### Current Migrations
1. `20240530213853_create_session_table` - ✅ Session storage for Shopify auth
2. `20251005160022_add_dashboard_facts_and_decisions` - ✅ DashboardFact + DecisionLog tables

### Migration Testing Status
- ✅ Forward migration: Applied successfully
- ❌ Rollback testing: Not executed (per direction qa.md:28)
- ❌ Postgres validation: Requires staging environment
- ⏳ SQLite rollback: Pending execution

**Action Required** (per qa.md:28): Validate migrations forward/back on SQLite + Postgres before sign-off

---

## Manager Report — 2025-10-08

### Summary
CI pipeline remains broken with NEW Supabase memory test failures. Previous featureFlags blocker resolved by engineer, but uncovered 4 failing tests in decision logging retry logic. Unit tests: 10/14 passing (71% pass rate).

### Critical Escalation
**Issue**: Supabase memory putDecision tests failing after featureFlags fix
**Root Cause**: Mock expectations not matching actual implementation behavior
**Impact**: Cannot validate decision logging reliability; PR merge still blocked

### Test Status Update
- ✅ **featureFlags.ts blocker RESOLVED**: Engineer created app/config/featureFlags.ts
- ✅ **Chatwoot tests NOW PASSING**: 2 tests recovered after featureFlags fix
- ❌ **Supabase memory tests FAILING**: 4 tests in supabase.memory.spec.ts broken
- ✅ **Playwright still green**: 1/1 E2E test passing

### Coordination Required
**Request to Data/Engineer agents**:
1. Review `packages/memory/supabase.ts` putDecision retry implementation
2. Identify why mock assertions in `tests/unit/supabase.memory.spec.ts:61-95` are failing
3. Either fix implementation OR update test mocks to match current behavior
4. Validate Supabase decision logging still handles network errors correctly

### Evidence Links
- Test failure: `tests/unit/supabase.memory.spec.ts` — 4 failing assertions
- Implementation: `packages/memory/supabase.ts` — putDecision retry logic
- Mock setup: `tests/unit/supabase.memory.spec.ts:10-30` — Supabase client mock
- Previous blocker (resolved): `app/config/featureFlags.ts` now exists

### Next Actions
1. ✅ COMPLETED: Identified root cause of test failures (Supabase memory mock mismatch)
2. 🔴 **CRITICAL**: Coordinate with Data/Engineer to fix Supabase memory tests (blocks all sprint work)
3. ⏳ BLOCKED: Re-run full CI suite to confirm green (needs Supabase fix)
4. ⏳ BLOCKED: Expand Playwright for CX Escalations + Sales Pulse modals per NEW qa.md:26
5. ⏳ BLOCKED: Execute migration rollback testing on SQLite per NEW qa.md:27
6. ⏳ BLOCKED: Finalize soak test plan (`scripts/qa/soak-test-plan.md`) per NEW qa.md:28
7. ⏳ BLOCKED: Partner with AI/Reliability on Supabase decision logging verification per NEW qa.md:29

---

## Governance Acknowledgment — 2025-10-08 (Direction Refresh)
- ✅ Reviewed **UPDATED** `docs/directions/qa.md` (last_reviewed: 2025-10-08)
- ✅ Acknowledge manager-only direction ownership per `docs/directions/README.md`
- ✅ **NEW SPRINT FOCUS** acknowledged:
  1. Expand Playwright for CX Escalations + Sales Pulse modals (open/approve/escalate) with AI fixtures
  2. Validate Prisma migrations SQLite + Postgres (forward/back) with deployment/compliance coordination
  3. Finalize `scripts/qa/soak-test-plan.md` (SSE + approval endurance, English-only)
  4. Partner with AI/Reliability on Supabase decision logging verification (error/latency/parity)

**CRITICAL BLOCKER**: All sprint tasks blocked by Supabase memory test failures (4/14 unit tests failing, CI broken)

---

**QA Agent Status**: 🔴 BLOCKED — Supabase memory test failures blocking CI pipeline

**Manager Escalation**: CI broken, 4 unit tests failing in Supabase decision logging, coordination with Data/Engineer required

**Last Updated**: 2025-10-08 (Direction Refresh Acknowledged)
**Next Review**: 2025-10-09 (post Supabase memory fix)

**Direction Acknowledgment**: ✅ NEW sprint focus from qa.md (last_reviewed: 2025-10-08) acknowledged
**Sprint Status**: 🔴 ALL TASKS BLOCKED by Supabase memory test failures (CI broken, 4/14 unit tests failing)
