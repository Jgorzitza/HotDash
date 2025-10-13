---
epoch: 2025.10.E1
doc: docs/directions/engineer-helper.md
owner: manager
last_reviewed: 2025-10-12
doc_hash: TBD
expires: 2025-10-19
---

# Engineer Helper — Direction (Operator Control Center)

## 🚨 CRITICAL: FIX LLAMAINDEX MCP (P0 - LAUNCH CRITICAL)

**Your immediate priority**: Fix LlamaIndex MCP to enable agent-assisted approvals

**Current status**:
- ✅ agent_metrics.sql syntax error fixed
- 🔄 LlamaIndex MCP still broken (0/3 tools functional)
- 🎯 Enable agent-assisted approvals and knowledge base

**START HERE NOW** (Fix LlamaIndex MCP):
```bash
cd ~/HotDash/hot-dash

# 1. Diagnose LlamaIndex MCP issues
# Use Context7 MCP to check current patterns
# mcp_context7_get-library-docs(context7CompatibleLibraryID: "/modelcontextprotocol/sdk", topic: "protocol")

# 2. Fix embedding model configuration
# Update query.ts and buildIndex.ts with proper LLM config
# Test: query_support, refresh_index, insight_report

# 3. Verify functionality with Hot Rod AN content
# Test queries return accurate responses
# Confirm: 100% query accuracy, <5s response times

# 4. Enable knowledge base for approvals
# Verify: Agent-assisted approval suggestions work
# Test: Approval queue integration

# Evidence: LlamaIndex MCP operational, agent-assisted approvals enabled
# Log to: feedback/engineer-helper.md
```

**MCP TOOLS REQUIRED**:
- ✅ Context7 MCP: mcp_context7_get-library-docs (protocol patterns)
- ✅ grep: Find existing patterns in codebase
- ❌ DO NOT guess React Router 7 patterns

**Timeline**: 45 minutes (P0 - launch critical)

**Success Metric**: LlamaIndex MCP operational for agent-assisted approvals

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


---

## 🎯 MANAGER DECISION ON TASK 2 (LlamaIndex MCP)

**Your Report**: 63 TypeScript errors due to LlamaIndex 0.12.0 breaking changes

**Decision**: **Option C - Deprioritize for now (Not Launch-Critical)**

**Rationale**:
- LlamaIndex MCP is for RAG queries (support knowledge base)
- NOT blocking dashboard tiles or approvals (core launch features)
- AI agent can continue building knowledge base content without MCP live
- Can ship launch without LlamaIndex MCP, enable post-launch

**Your Updated Task Status**:
1. ✅ Task 1: COMPLETE (Shopify GraphQL already fixed)
2. ⏸️ Task 2: PAUSED (deprioritize LlamaIndex MCP - not launch-critical)
3. ✅ Task 3: COMPLETE (TypeScript errors fixed)

**Next Actions for You**:
1. ✅ Commit your Task 3 fixes (agent-sdk-mocks.ts) 
2. ✅ Create PR with clean commit message
3. ✅ Notify Integrations to re-validate Shopify queries
4. ✅ Document decision to deprioritize LlamaIndex MCP
5. **Then**: Join main Engineer on Task 6 (Approval Queue UI) - Designer specs ready!

**Updated Timeline**:
- Task 3 commit + PR: 15-20 min
- Coordination: 10 min  
- **Total remaining**: ~30 min, then help Engineer with UI

**Why This Works**:
- Unblocks you from 3-4 hour refactor
- Preserves launch timeline
- LlamaIndex MCP can be fixed post-launch when more time
- Gets you working on higher-priority UI work with Engineer

**Status**: 🟢 DECISION MADE - Complete Task 3 commit, then help Engineer with Approval UI (Task 6)

---

## 🎯 MANAGER FINAL DIRECTION - JOIN ENGINEER ON TASK 6

**Your Status**:
- ✅ Task 1: COMPLETE (Shopify GraphQL validated)
- ⏸️ Task 2: PAUSED per CEO (LlamaIndex deprioritized, not launch-critical)
- ✅ Task 3: COMPLETE (TypeScript errors fixed, ready to commit)

**Next Actions**:
1. ✅ Commit Task 3 fixes to `tests/fixtures/agent-sdk-mocks.ts`
2. ✅ Create PR: "fix: resolve TypeScript errors in agent-sdk-mocks"
3. **Then**: JOIN Engineer on Task 6 (Approval Queue UI)

**Task 6 is Now Unblocked**:
- Designer completed ALL specs (20 tasks total)
- Specs ready in `docs/design/` directory
- Engineer starting Task 6 now
- You help with implementation (3-4h together)

**Your Role in Task 6**:
- Help build Approval Queue UI components
- Implement ApprovalCard based on Designer specs
- Test responsive design and accessibility
- Support Engineer with any blockers

**Status**: 🟢 ACTIVE - Commit Task 3, then pair with Engineer on Task 6

---

## 🚨 UPDATED PRIORITY (2025-10-13T22:52:00Z) — Manager Assignment

**Status**: All tasks complete ✅  
**New Assignment**: Code Quality & Documentation

### P0: Code Review & Refactoring (3-4 hours)

**Goal**: Improve code quality across the codebase

**Tasks**:
1. **Code Review Backlog**
   - Review recent PRs (if any)
   - Review critical code paths
   - Identify refactoring opportunities
   - Document technical debt

2. **Refactoring Priorities**
   - Complex functions (>50 lines)
   - Duplicate code
   - Poor naming
   - Missing error handling

3. **Code Quality Metrics**
   - Measure cyclomatic complexity
   - Identify code smells
   - Document improvements
   - Create refactoring plan

**Evidence**: Code review notes, refactoring PRs, quality metrics

### P1: Documentation Improvements (2-3 hours)

**Goal**: Comprehensive technical documentation

**Tasks**:
1. **API Documentation**
   - Document all API endpoints
   - Add request/response examples
   - Document error codes
   - Create API reference guide

2. **Code Documentation**
   - Add JSDoc comments to public APIs
   - Document complex algorithms
   - Add inline comments for clarity
   - Update README files

3. **Architecture Documentation**
   - Document system architecture
   - Create component diagrams
   - Document data flows
   - Update technical specs

**Evidence**: Documentation files, API reference, architecture docs

### P2: Developer Experience (2 hours)

**Goal**: Improve developer workflow

**Tasks**:
1. **Development Setup**
   - Improve setup documentation
   - Create setup scripts
   - Document common issues
   - Create troubleshooting guide

2. **Development Tools**
   - Configure VS Code settings
   - Add useful extensions
   - Create code snippets
   - Improve linting rules

**Evidence**: Setup guide, tool configuration, snippets

**Timeline**: Start with P0, report progress every 2 hours to feedback/engineer-helper.md

**Coordination**:
- Engineer: Coordinate on refactoring
- QA: Coordinate on test coverage
- All agents: Documentation review
- Manager: Report completion for next assignment

---
