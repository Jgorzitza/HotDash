---
epoch: 2025.10.E1
doc: docs/directions/engineer-helper.md
owner: manager
last_reviewed: 2025-10-12
doc_hash: TBD
expires: 2025-10-19
---

# Engineer Helper — Direction (Operator Control Center)

## Canon
- North Star: docs/NORTH_STAR.md
- Git & Delivery Protocol: docs/git_protocol.md
- Direction Governance: docs/directions/README.md
- MCP Allowlist: docs/policies/mcp-allowlist.json
- Credential Map: docs/ops/credential_index.md
- Shopify Auth Pattern: docs/ops/SHOPIFY-AUTH-PATTERN.md
- Human Approval Policy: docs/ops/HUMAN-APPROVAL-REQUIRED.md

> Manager authored. Engineer Helper must not create or edit direction files; submit evidence-backed change requests via manager.

## Mission

**You are the Engineer Helper agent.** Your job is to unblock the primary Engineer agent by fixing critical issues, handling smaller tasks, and tackling technical debt. You work in parallel with Engineer to accelerate delivery.

## Local Execution Policy (Auto-Run)

You are authorized to run local, non-interactive commands and scripts without asking for approval each time. Follow these guardrails:

- Scope: Operate inside /home/justin/HotDash/hot-dash and local dev services (Supabase 127.0.0.1)
- Non-interactive: Add flags to avoid prompts; disable pagers
- Evidence: Log timestamp, command, output paths in feedback/engineer-helper.md
- Secrets: Load from vault/env; never print values
- Tooling: npx supabase for local; git/gh with --no-pager; prefer rg else grep -nE
- Retry: Up to 2 times then escalate with logs
- Git commits: Create commits for your fixes, reference in feedback

## Current Sprint Focus — 2025-10-12

**Primary Mission**: Unblock Engineer by fixing P0 issues

**Coordinate With**: Engineer (main), QA (testing), Integrations (verification)

---

## 🚨 P0 BLOCKER TASKS (Do IMMEDIATELY)

### Task 1: Fix 4 Shopify GraphQL Queries (URGENT - Launch Blocker)

**Background**: Integrations agent found 4 broken Shopify queries using deprecated 2023 API patterns

**Files to Fix**:

**Fix 1**: `app/services/shopify/orders.ts` (line ~28)
- Change: `financialStatus` → `displayFinancialStatus`
- Why: Field renamed in 2024 API
- Timeline: 15 min

**Fix 2**: `app/services/shopify/inventory.ts` (line ~60)
- Change: `availableQuantity` → `quantities(names: ["available"]) { name quantity }`
- Why: Direct field no longer available
- Timeline: 30 min

**Fix 3**: `packages/integrations/shopify.ts` (lines 3-12)
- Change: Remove `edges/node` wrapper from Fulfillment query
- Why: Structure changed
- Timeline: 30 min

**Fix 4**: `packages/integrations/shopify.ts` (lines 14-20)
- Change: `productVariantUpdate` → modern mutation
- Why: Deprecated
- Timeline: 60 min

**Validation**:
- Use Shopify Dev MCP to validate EACH fix
- Test queries return expected data
- Coordinate with Integrations agent to verify

**Evidence**: 
- File paths + line numbers of each fix
- Shopify MCP validation confirmations
- Test results showing queries work
- Git commit hash

**Timeline**: 2-3 hours total

---

### Task 2: Fix LlamaIndex MCP Import Errors (URGENT - Launch Blocker)

**Background**: QA agent tested LlamaIndex MCP - all 3 tools return 500 errors

**Issues Found**:

**Issue 1**: Import errors in `scripts/ai/llama-workflow/dist/pipeline/query.js`
- LlamaIndex API calls don't match installed version
- Fix imports to match current llamaindex package
- Timeline: 1-2 hours

**Issue 2**: Mock processor broken (null check missing)
- Add null checks for result arrays
- Test mock mode thoroughly
- Ensure fallback works without OpenAI
- Timeline: 30-60 min

**Testing**:
- Test all 3 tools locally: query_support, refresh_index, insight_report
- Verify each returns 200 (not 500)
- Performance test (<500ms)

**Redeploy**:
- After fixes, rebuild and redeploy to Fly.io
- Coordinate with Deployment agent for deploy
- Tag QA to retest after deploy

**Evidence**:
- File paths + line numbers of fixes
- Local test results (all 3 tools working)
- Redeployment logs
- QA retest confirmation
- Git commit hash

**Timeline**: 2-3 hours total

---

### Task 3: Fix TypeScript Build Errors (Quality Issue)

**Background**: 20 TypeScript errors in test fixtures blocking clean builds

**File**: `tests/fixtures/agent-sdk-mocks.ts`

**Errors**:
- Lines 190-230: jest namespace errors
- Line 241: Missing module '~/config/supabase.server'
- Lines 305-317: expect undefined
- Lines 368-395: Type mismatches

**Fixes**:
- Import jest properly or use vi from vitest
- Fix supabase.server import path
- Import expect from test framework
- Fix type mismatches in mock data

**Validation**:
- Run `npm run typecheck` → 0 errors
- Run tests → all passing

**Evidence**:
- File fixes with line numbers
- Clean typecheck output
- Passing test results
- Git commit hash

**Timeline**: 1-2 hours

---

## 📋 COORDINATION PROTOCOL

**With Engineer (Main)**:
- Report progress in feedback/engineer-helper.md
- Tag @engineer when tasks complete
- Don't duplicate work - check what Engineer is doing
- Hand off completed fixes for integration

**With QA**:
- Request retests after fixes
- Provide test instructions
- Coordinate on validation

**With Integrations**:
- Verify Shopify fixes work correctly
- Request validation of GraphQL queries

**With Deployment**:
- Coordinate LlamaIndex MCP redeploy
- Provide build artifacts

---

## ✅ SUCCESS CRITERIA

**Task 1 Complete When**:
- ✅ All 4 Shopify queries fixed and validated
- ✅ Integrations agent confirms fixes work
- ✅ Git committed

**Task 2 Complete When**:
- ✅ LlamaIndex MCP all 3 tools return 200
- ✅ QA retests and confirms working
- ✅ Redeployed to Fly.io
- ✅ Git committed

**Task 3 Complete When**:
- ✅ npm run typecheck → 0 errors
- ✅ All tests passing
- ✅ Git committed

**Overall**: Unblock Engineer to focus on Agent SDK + Approval UI

---

## 🎯 TIMELINE

**Total Estimated**: 5-8 hours for all 3 P0 tasks

**Parallel with Engineer**: While you fix these, Engineer can work on Agent SDK deployment

**Result**: Launch timeline back on track (today delivery possible)

---

## 📊 EVIDENCE REQUIREMENTS

**For Each Task**:
- ✅ File paths with line numbers: `app/services/shopify/orders.ts:28-35`
- ✅ Test results: `Tests pass (app/services/shopify/orders.test.ts: 8 passing)`
- ✅ Validation: `Shopify MCP validated query successfully`
- ✅ Git commit: `Committed in abc123f`
- ❌ NOT acceptable: "Fixed Shopify queries" without details

**QA Will Validate**: Your work goes through 4-hour validation cycles

---

## 🚀 START IMMEDIATELY

**Priority Order**:
1. Task 1: Shopify fixes (2-3h) - Unblocks dashboard tiles
2. Task 2: LlamaIndex fixes (2-3h) - Unblocks AI agent
3. Task 3: TypeScript errors (1-2h) - Code quality

**Total**: 5-8 hours of focused blocker removal

**Report in**: feedback/engineer-helper.md with evidence for each fix

---

**Status**: 🔴 **ACTIVE - P0 BLOCKER REMOVAL**  
**Mission**: Unblock Engineer, enable launch TODAY  
**Start**: Immediately with Task 1 (Shopify GraphQL fixes)

