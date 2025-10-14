---
epoch: 2025.10.E1
doc: docs/directions/engineer.md
owner: manager
last_reviewed: 2025-10-13
doc_hash: TBD
expires: 2025-10-20
---
# Engineer — Direction (Operator Control Center)

## Canon
- North Star: docs/NORTH_STAR.md
- Git & Delivery Protocol: docs/git_protocol.md
- Direction Governance: docs/directions/README.md
- Credential Map: docs/ops/credential_index.md
- Manager Feedback: feedback/manager.md (check for latest assignments)

## 🎉 P0 COMPLETE: Shopify App Deployed Successfully (2025-10-13)

**Status**: ✅ ALL DEPLOYMENT WORK COMPLETE
- App deployed to hotdash-staging.fly.dev
- Installed on dev store (hotroddash.myshopify.com)  
- CEO verified: 6/6 tiles working
- All scopes fixed, credentials configured

**Next**: Awaiting new feature work assignments

---

## 🚨 P1 UPCOMING: Integration & Refinement Work (2025-10-13)

**Status**: WAITING ON OTHER TEAMS
**Your work blocked until dependencies complete**

### Task E1: Live Chat Widget Installation (WAITING)

**Dependency**: Chatwoot agent must complete Task 4 first
- Expected: 2025-10-14T18:00:00Z
- Blocker: Need widget embed code from Chatwoot

**When Ready**:
1. Receive embed code from Chatwoot agent
2. Identify installation location (likely Hot Rod AN theme layout)
3. Add widget code to appropriate template
4. Test on dev store
5. Verify widget loads and connects to Chatwoot
6. Mobile responsiveness check

**MCP Tools**:
- ✅ Context7 MCP: Verify React Router 7 / theme structure if needed
- ✅ Shopify MCP: If modifying theme files via API

**Timeline**: 1 hour (after Chatwoot provides code)
**Evidence**: Log in feedback/engineer.md

---

### Task E2: SEO Pulse Tile Refinement Implementation (WAITING)

**Dependencies**: 
- Data agent WoW calculation (est. 2025-10-16T12:00:00Z)
- Designer visual hierarchy (est. 2025-10-15T18:00:00Z)

**When Ready**:
1. Receive Designer Figma mockup + component specs
2. Receive Data API changes (WoW delta calculations)
3. Update SEO Pulse tile component:
   - Implement visual hierarchy (colors, icons, arrows)
   - Add trend indicators (up/down/stable)
   - Implement empty state
   - Filter to top N anomalies
   - Add mobile responsive layout
4. Test with real data
5. Screenshot for Designer approval
6. Deploy to dev store

**MCP Tools**:
- ✅ Context7 MCP: Verify React Router 7 patterns (training data outdated)
- ✅ Shopify MCP: Validate any GraphQL changes

**Code Examples** (will refine based on Designer specs):
```typescript
// Trend indicator component
function TrendIndicator({ wowDelta }: { wowDelta: number }) {
  const isDecrease = wowDelta <= -20;
  const isIncrease = wowDelta >= 20;
  
  return (
    <div className={cn(
      "flex items-center gap-2",
      isDecrease && "text-red-600",
      isIncrease && "text-green-600"
    )}>
      {isDecrease && <ArrowDown className="h-4 w-4" />}
      {isIncrease && <ArrowUp className="h-4 w-4" />}
      <span className="font-medium">
        {wowDelta > 0 && "+"}{wowDelta.toFixed(1)}%
      </span>
    </div>
  );
}
```

**Timeline**: 4 hours (after dependencies complete)
**Evidence**: Log in feedback/engineer.md

---

### Task E3: Picker Payment Admin UI (WAITING)

**Dependencies**:
- Data schema complete (est. 2025-10-14T02:00:00Z)
- Integrations historical orders (est. 2025-10-15T16:00:00Z)

**When Ready**:
1. Create new route: `/app/picker-payments`
2. Build admin panel components:
   - Picker balance summary table
   - Unassigned orders list
   - Assign picker interface
   - Record payment form
   - Product picker_quantity editor
3. Integrate with Data agent's views:
   - `picker_balances` view
   - `unassigned_fulfilled_orders` view
   - `picker_order_history` view
4. Add to navigation
5. Test all flows
6. Mobile responsive

**MCP Tools**:
- ✅ Context7 MCP: React Router 7 patterns (MANDATORY - no training data)
- ✅ Supabase MCP: If need to verify schema

**Code Example** (loader pattern - verify with Context7 MCP):
```typescript
// Route: app/routes/app.picker-payments.tsx
import { type LoaderFunctionArgs } from "react-router";

export async function loader({ request }: LoaderFunctionArgs) {
  // Fetch picker balances from view
  const { data: balances } = await supabase
    .from('picker_balances')
    .select('*')
    .order('balance_cents', { ascending: false });
    
  return { balances };
}
```

**Timeline**: 8 hours (after dependencies complete)
**Evidence**: Log in feedback/engineer.md

---

## MCP Tool Requirements

**MANDATORY for React Router 7**:
- ✅ Context7 MCP: Verify loader/action patterns (training data has v6/Remix patterns)
- ✅ Context7 MCP: Check import paths (changed in RR7)
- ✅ Context7 MCP: Validate route module structure

**For Shopify Work**:
- ✅ Shopify MCP: Validate GraphQL queries
- ✅ Shopify MCP: Introspect schema if adding new queries

**For Database**:
- ✅ Supabase MCP: Verify schema if needed

## Current Status Summary

**Completed Work** ✅:
- P0: Shopify app deployment
- All 6 tiles operational
- CEO has working app on dev store

**Upcoming Work** ⏳:
- E1: Live chat widget (1h - after Chatwoot)
- E2: SEO Pulse refinement (4h - after Data + Designer)
- E3: Picker payment UI (8h - after Data + Integrations)

**Estimated Timeline**: E1 tomorrow, E2 in 3 days, E3 in 4 days

---

## Evidence Gate

Every task must log in feedback/engineer.md:
- Timestamp (YYYY-MM-DDTHH:MM:SSZ)
- Task completed
- Code changes (file paths)
- Test results
- Screenshots (if UI work)
- Issues encountered

## Coordination

- **Chatwoot**: Provides widget code for E1
- **Designer**: Provides mockup for E2
- **Data**: Provides API changes for E2, schema for E3
- **Integrations**: Provides historical data for E3
- **QA**: Tests each feature after implementation
- **Manager**: Monitors progress in daily standups

---

## ⏸️ PREVIOUS ASSIGNMENT: COMPLETE SHOPIFY APP DEPLOYMENT (P0)

**Your immediate priority**: Complete Fly.io deployment and get app visible in Shopify admin

**Current status**:
- ✅ Build complete (15.71s, 1612+ modules)
- 🔄 Fly deployment in progress (timeout fixed)
- 🎯 Install on dev store, verify in Shopify admin

**START HERE NOW** (Complete deployment):
```bash
cd ~/HotDash/hot-dash

# 1. Monitor deployment completion with Fly MCP
# mcp_fly_fly-status(app: "hotdash-staging")
# Expected: App healthy, no errors

# 2. Install app on Hot Rod AN dev store
# Navigate to: hotroddash.myshopify.com/admin/apps
# Install Hot Dash from Partner Dashboard
# Verify: OAuth flow completes, all scopes granted

# 3. Test app in Shopify admin
# Navigate: Apps > Hot Dash
# Verify: 5 tiles render with real data
# Screenshot: All tiles visible for CEO

# 4. Verify LlamaIndex MCP integration
# Test: Agent-assisted approval suggestions work
# Confirm: Knowledge base queries return results

# Evidence: Deployment logs, installation screenshots, app functionality verification
# Log to: feedback/engineer.md
```

**MCP TOOLS REQUIRED**:
- ✅ Fly MCP: mcp_fly_fly-status, mcp_fly_fly-logs (deployment monitoring)
- ✅ Shopify MCP: mcp_shopify_validate_graphql_codeblocks (data validation)
- ✅ Context7 MCP: React Router 7 patterns if debugging needed

**Timeline**: 30-45 minutes (deployment completion + installation)

**Success Metric**: CEO can click "Hot Dash" in Shopify admin and see working dashboard

## Canon
- North Star: docs/NORTH_STAR.md
- Git & Delivery Protocol: docs/git_protocol.md
- Direction Governance: docs/directions/README.md
- MCP Allowlist: docs/policies/mcp-allowlist.json
- Credential Map: docs/ops/credential_index.md
- Agent Launch Checklist (manager executed): docs/runbooks/agent_launch_checklist.md

> Manager authored. Agents must not create or edit direction files; request changes via manager with evidence.

## Local Execution Policy (Auto-Run)

You are authorized to run local, non-interactive commands and scripts without asking for approval each time. Follow these guardrails:

- Scope and safety
  - Operate inside /home/justin/HotDash/hot-dash and local dev services (Supabase 127.0.0.1).
  - Do not change remote infrastructure or git history under this policy. Status/read-only checks are okay.
  - Avoid destructive ops (rm -rf outside project, docker system prune, sudo apt, etc.).

- Non-interactive only
  - Add flags to avoid prompts; do not use interactive shells/editors.
  - Disable pagers (git --no-pager; pipe to files). No less/man/vim.

- Evidence logging
  - Log timestamp, command, output path(s) in feedback/engineer.md; put large outputs under artifacts/engineer/.

- Secrets handling
  - Load from vault/env; never print secret values. Reference variable names only.

- Tooling specifics
  - Supabase via npx supabase for local status/start/stop; no remote ops.
  - Git/GH allowed: status, diff, grep (with --no-pager); not allowed: commit/push/force-push under auto-run.
  - Prefer rg; fallback grep -nE.

- Retry and escalate
  - Retry up to 2 times then escalate with evidence.

- Ship tiles behind feature flags per molecule (`agent/engineer/<tile>`); keep PRs under 400 LOC.
- Extend Shopify/Chatwoot/GA services only via typed interfaces; never call raw fetch from loaders.
- When touching Shopify surfaces, pull contracts and workflows from the Shopify developer MCP (`shopify-dev-mcp`)—no guessing or ad-hoc endpoints.
- Keep the Shopify React Router and session-storage references on hand:
  - docs/dev/appreact.md (interacting with Shopify Admin)
  - docs/dev/authshop.md (authenticate.admin reference)
  - docs/dev/session-storage.md (Prisma session adapter)
  - docs/dev/admin-graphql.md (Admin API queries/mutations)
  - docs/dev/storefront-mcp.md (Storefront agent integration)
- Evidence mandate: Vitest + Playwright + Lighthouse artifacts linked on every PR.
- For schema updates, pair migrations with Prisma client regen and data backfill scripts.
- Maintain caching discipline (respect TTL envs) and log ServiceErrors with scope + code.
- Develop against the local Supabase stack: run `supabase start`, export `.env.local`, run migrations with `npm run setup`, and tail events with `scripts/ops/tail-supabase-logs.sh` (see `docs/runbooks/supabase_local.md`). SQLite is no longer supported.
- Coordinate with QA on mock fixtures; mock mode must stay green before switching to live data.
- Stack guardrails: follow `docs/directions/README.md#canonical-toolkit--secrets` (Supabase-only Postgres, Chatwoot on Supabase, React Router 7, OpenAI + LlamaIndex); do not introduce alternate stacks.
- Prohibited: adding MySQL/MongoDB/SQLite datasources, or direct Redis clients in app code. Redis is only permitted for Chatwoot under deploy/chatwoot/.
- Start executing assigned tasks immediately; capture progress/blockers in `feedback/engineer.md` without waiting for additional manager approval.

## Current Sprint Focus — 2025-10-12
Own each engineering deliverable end-to-end. Capture the command/output for every change in `feedback/engineer.md`, retry failures twice, and only escalate with the captured logs and mitigation attempts.
- Reconfirm sanitized history (`git fetch --all --prune`, `git grep postgresql://`) and log the clean check in `feedback/engineer.md`.
- Land the Supabase memory retry fixes (`packages/memory/supabase.ts`) with unit + e2e evidence; record command outputs.
- Update Shopify helpers (`shopify.app.toml`, env utilities) to align with React Router 7 + App Bridge v3 flows (no manual token capture required); attach diffs. Follow the current App Bridge configuration documented in [`@shopify/app-bridge-react`](https://www.npmjs.com/package/@shopify/app-bridge-react#configuration) when updating the client bootstrap.
- Update Playwright fixtures so local runs stay in `mock=1` without embed tokens; for live (`mock=0`) smoke use the Admin login credentials (`PLAYWRIGHT_SHOPIFY_EMAIL/PASSWORD`) instead of manual tokens.
- Pair with QA on modal Playwright coverage; ensure fixtures align with the canonical toolkit and the current dev flow (React Router 7 + Shopify CLI v3).
- Prep mock fixtures and staging toggles so DEPLOY-147 can close once latency thresholds are met and Fly memory scaling is complete.
- Wire the Supabase edge function (`supabase/functions/occ-log`) into the app logging pipeline and document deployment steps.
- Participate in the Monday/Thursday stack compliance audit, focusing on code references to deprecated stacks or secrets; log remediation steps.
- Clear the outstanding TypeScript build failures (`npm run typecheck`) by repairing the Chatwoot escalation types, Supabase memory client promises, and AI script typings before handing back to QA; log each fix + command output in `feedback/engineer.md` and re-run the full typecheck until it exits 0.

## Aligned Task List — 2025-10-11 (Updated: Accelerated Delivery)

**Reference Docs**:
- docs/AgentSDKopenAI.md - Complete Agent SDK implementation guide
- docs/design/ga_ingest.md - GA integration design
- docs/runbooks/llamaindex_workflow.md - Existing LlamaIndex CLI
- vault/occ/google/analytics-service-account.json - GA credentials (check with CEO if need enabling)

**Tasks in Priority Order** (execute sequentially, log blockers in feedback/engineer.md and continue):

## 🚨 LAUNCH CRITICAL REFOCUS (2025-10-11T22:50Z)

**CEO Decision**: Emergency refocus on launch gates. Long task lists OK but ALIGNED to shipping.

**Your Mission**: Complete 3 P0 tasks to enable launch. Nothing else until these ship.

---

1. ✅ **GA Direct API Integration** - COMPLETE  
   - Evidence: artifacts/engineer/20251011T142951Z/ga-tests.log
   - 21 tests passing, 100% coverage

2. ⚠️ **Shopify GraphQL Fixes** - REASSIGNED TO ENGINEER HELPER
   - QA/Integrations found issues remain
   - Engineer Helper now owns this

3. ⚠️ **LlamaIndex MCP** - REASSIGNED TO ENGINEER HELPER  
   - QA found 0/3 tools working
   - Engineer Helper fixing errors

**YOUR FOCUS NOW** (Tasks 4-7):

4. **Agent SDK Service** (P0 - LAUNCH GATE #2)
   - Fix TypeScript compilation in scripts/ai/llama-workflow
   - Scaffold apps/llamaindex-mcp-server/ with @modelcontextprotocol/sdk
   - Implement MCP protocol handler for 3 tools (query_support, refresh_index, insight_report)
   - Create Dockerfile and fly.toml (512MB, auto-stop enabled)
   - Deploy to Fly.io and verify queries work
   - Test with Cursor MCP client
   - **Evidence**: MCP server URL, test query result, deployment logs
   - **Blocks**: AI agent (2 tasks), Integrations (1 task)
   - **Timeline**: 8-12 hours

- Deploy apps/agent-service (already built) with vault credentials
- Credentials: vault/occ/chatwoot/api_token_staging.env + vault/occ/supabase/database_url_staging.env
- Use docs/dev/authshop.md for Shopify auth pattern (no manual tokens)
- Implement CEO approval queue per agentfeedbackprocess.md Section 8
- **Evidence**: Service deployed, health check passing
- **Timeline**: 1-2 hours (already built, just deploy)

5. **Approval Queue UI** (P0 - LAUNCH GATE #4)
- Build app/routes/approvals._index.tsx (minimal version)
- Create ApprovalCard component (use Designer's specs)
- Wire approve/reject to Task 4 APIs
- **Evidence**: UI working, CEO can approve one action
- **Coordinate**: Designer provides assets
- **Timeline**: 3-4 hours (minimal viable)

6. **E2E Integration Test** (P0 - LAUNCH GATE #7)
- Test: Webhook → Agent → Approval → CEO Approves → Action
- One complete customer support scenario
- **Evidence**: E2E test passing
- **Timeline**: 1-2 hours

**Total Remaining**: 5-8 hours (while Helper fixes blockers in parallel)

**Ongoing Requirements**:
- Use Context7 MCP to find existing patterns before implementing
- Use Shopify Dev MCP to validate all GraphQL queries
- Keep mock=1 mode working for development
- Log every task completion in feedback/engineer.md with timestamp and evidence path
- Tag other agents for coordination (@ai, @data, @chatwoot, @designer, @qa)

---

### 🚀 EXPANDED TASK LIST (2x Capacity for Fast Agent)

**Since Shopify fixes complete, expand with additional valuable tasks**:

**Task 7: Code Quality & Refactoring**
- Review codebase for duplicate code patterns
- Extract reusable utilities and helpers
- Refactor complex components for maintainability
- Improve type safety across services
- Evidence: Refactoring report, PR with improvements

**Task 8: Performance Optimization**
- Profile dashboard route load times
- Optimize slow loaders (<300ms target)
- Implement caching where beneficial
- Reduce bundle size
- Evidence: Performance improvements report

**Task 9: Error Handling Enhancement**
- Audit error handling across all services
- Implement consistent error boundaries
- Add user-friendly error messages
- Create error recovery workflows
- Evidence: Error handling improvements

**Task 10: API Client Standardization**
- Create consistent API client pattern for all external services
- Implement retry logic and circuit breakers
- Add request/response logging
- Standardize error handling
- Evidence: Standardized client implementations

**Task 11: Testing Infrastructure**
- Enhance test fixtures and mocks
- Add integration test helpers
- Create test data generation utilities
- Improve test performance
- Evidence: Testing infrastructure improvements

**Task 12: Documentation Generation**
- Add JSDoc comments to all public functions
- Generate API documentation
- Create component documentation
- Document service interfaces
- Evidence: Comprehensive code documentation

Execute 7-12 in any order while building Agent SDK components.

---

### 🚀 MASSIVE EXPANSION (5x Capacity) - 18 Additional Tasks

**Since you're incredibly fast, here's substantial work to keep you productive**:

**Task 13-18: LlamaIndex MCP Server Polish** (after basic deployment)
- 13: Add request/response logging and tracing
- 14: Implement health check endpoint with detailed status
- 15: Add metrics collection (query latency, error rates, cache hits)
- 16: Create admin API for index management
- 17: Implement graceful shutdown and restart
- 18: Add rate limiting per client

**Task 19-24: Agent SDK Advanced Features**
- 19: Implement conversation context persistence
- 20: Add agent performance tracking
- 21: Create agent analytics endpoints
- 22: Implement approval timeout handling
- 23: Add bulk approval operations
- 24: Create agent debugging tools

**Task 25-30: Testing & Quality**
- 25: Add integration tests for all Agent SDK tools
- 26: Create load testing suite for approval queue
- 27: Implement chaos testing for resilience
- 28: Add security penetration tests
- 29: Create performance regression test suite
- 30: Implement automated E2E smoke tests

Execute any order. Total: 30 tasks, ~15-20 hours of work.

---

### 📋 MANAGER NOTE TO ENGINEER (2025-10-11T22:15Z)

**CEO Direction**: "Always execute next available tasks on your list before taking a breather to check with user. Manager is monitoring your progress and will keep direction updated."

**Translation**: Keep working through your task list autonomously. I'm monitoring and will add more tasks as needed. Don't stop to check - just keep executing.

---

### 🚀 THIRD MASSIVE EXPANSION (Another 25 Tasks)

**Task 31-40: Advanced Agent SDK Features** (10 tasks)
- 31: Implement multi-language agent responses (i18n infrastructure)
- 32: Create agent A/B testing framework
- 33: Design agent personality customization system
- 34: Implement conversation branching and routing logic
- 35: Create agent escalation triggers and patterns
- 36: Design agent learning loop (feedback → improvement)
- 37: Implement agent performance benchmarking
- 38: Create agent debugging and introspection tools
- 39: Design agent collaboration (multi-agent handoffs)
- 40: Implement agent response streaming (real-time typing)

**Task 41-50: Platform & Infrastructure** (10 tasks)
- 41: Create GraphQL API for all Agent SDK data
- 42: Design real-time subscriptions for approval queue
- 43: Implement webhook retry and dead letter queue
- 44: Create background job processing system
- 45: Design caching layer for frequently accessed data
- 46: Implement distributed tracing across all services
- 47: Create service mesh for microservices communication
- 48: Design event sourcing for audit trail
- 49: Implement feature flagging system
- 50: Create configuration management service

**Task 51-55: Developer Experience** (5 tasks)
- 51: Create local development environment setup automation
- 52: Design development workflow documentation
- 53: Implement code generation tools for common patterns
- 54: Create debugging tools and utilities
- 55: Design developer onboarding guide

Execute 31-55 in any order. Total: 55 tasks, ~30-40 hours work.

---

### 🚀 SEVENTH MASSIVE EXPANSION (Another 30 Tasks)

**Task 56-62: Microservices Architecture** (7 tasks)
- 56: Design service mesh implementation
- 57: Create inter-service communication patterns
- 58: Implement service discovery and registry
- 59: Design distributed tracing across services
- 60: Create service versioning strategy
- 61: Implement circuit breakers and bulkheads
- 62: Design service deployment orchestration

**Task 63-70: Developer Experience** (8 tasks)
- 63: Create local development environment automation
- 64: Design development workflow documentation
- 65: Implement hot reload for all services
- 66: Create debugging tools and utilities
- 67: Design error handling and logging standards
- 68: Implement development productivity metrics
- 69: Create onboarding automation for new developers
- 70: Design code review automation and checklists

**Task 71-78: Performance Engineering** (8 tasks)
- 71: Implement application performance monitoring (APM)
- 72: Create performance profiling tools
- 73: Design query optimization framework
- 74: Implement lazy loading and code splitting
- 75: Create asset optimization pipeline
- 76: Design server-side rendering optimization
- 77: Implement edge caching strategies
- 78: Create performance regression detection

**Task 79-85: Infrastructure as Code** (7 tasks)
- 79: Design Terraform/Pulumi infrastructure modules
- 80: Create environment provisioning automation
- 81: Implement infrastructure testing
- 82: Design infrastructure versioning and rollback
- 83: Create infrastructure documentation generation
- 84: Implement cost estimation for infrastructure changes
- 85: Design multi-cloud abstraction layer

Execute 56-85 in any order. Total: 85 tasks, ~50-60 hours work.

---

### 📋 EVIDENCE REQUIREMENT REMINDER (2025-10-11T22:35Z)

**QA is now validating all completed tasks every 4 hours**

**Your Evidence Must Include**:
- ✅ File paths with line numbers: `app/services/foo.ts:12-45`
- ✅ Test results: `Tests pass (app/services/foo.test.ts: 15 passing)`
- ✅ Deployment status: `Deployed to staging: https://... (returns 200)`
- ✅ Commit hashes when applicable: `Committed in abc123f`

**NOT Acceptable**:
- ❌ "Task complete"
- ❌ "Implementation done"
- ❌ "Deployed successfully"

**QA will flag incomplete evidence and block further task assignments until corrected.**

---

### 🚨 CRITICAL UPDATES (2025-10-11T23:40Z)

**CEO Policy**: ALL customer interactions require CEO approval (no auto-execute)

**Implementation Change for Agent SDK**:
- ❌ Remove any auto-approve logic for customer responses
- ✅ 100% of customer-facing actions go to approval queue
- ✅ Capture CEO edits/feedback for agent training
- ✅ See: docs/ops/HUMAN-APPROVAL-REQUIRED.md

**Shopify Auth Clarification**:
- ✅ Use `authenticate.admin(request)` pattern (automatic)
- ❌ Don't ask for SHOPIFY_ADMIN_TOKEN (auto-generated)
- ✅ See: docs/ops/SHOPIFY-AUTH-PATTERN.md

**Credentials Available in Vault**:
- Chatwoot: vault/occ/chatwoot/api_token_staging.env
- Postgres: vault/occ/supabase/database_url_staging.env

**Deploy Agent SDK with these, then continue to Task 6 (Approval UI)**

---

## 🚨 CRITICAL BLOCKERS FROM QA + INTEGRATIONS (2025-10-12T00:50Z)

**QA Report**: LlamaIndex MCP deployed but NOT WORKING
- ❌ All 3 tools return 500 errors
- Issue 1: Import errors in query.js
- Issue 2: Mock processor broken
- **Action**: Fix BEFORE continuing to Agent SDK

**Integrations Report**: 4 Shopify GraphQL queries still broken
- ❌ financialStatus → displayFinancialStatus
- ❌ availableQuantity → quantities(names: ["available"])
- ❌ Fulfillment edges/node structure
- ❌ productVariantUpdate deprecated
- **Action**: Fix these BEFORE Agent SDK

**REVISED PRIORITY**:
1. Fix Shopify GraphQL (4 queries) - 2h
2. Fix LlamaIndex MCP (imports, mock) - 2h
3. QA retests and confirms both working
4. THEN proceed with Agent SDK deployment
5. THEN approval UI

**New Timeline**: 9-10 hours (adding 4h for fixes)

---

### ⚡ DEPENDENCY ALERT (2025-10-11T22:25Z)

**Agents Blocked by Your Work** (prioritize these):

1. **Chatwoot Agent** - Task 2 blocked: Needs webhook endpoint implemented
   - What they need: POST `/api/webhooks/chatwoot` endpoint
   - Impact: 1 agent blocked, 60+ tasks queued

2. **AI Agent** - Tasks E/F blocked: TypeScript compilation issues, deployment pending
   - What they need: Fix compilation, merge PR, deploy LlamaIndex MCP
   - Impact: 1 agent blocked, 30+ tasks queued

3. **Integrations Agent** - Tasks 3/5 blocked: Waiting on LlamaIndex MCP + Agent SDK
   - What they need: LlamaIndex MCP deployed, Agent SDK endpoints
   - Impact: 1 agent blocked, 50+ tasks queued

**Your Priority**: Unblock these 3 agents (affects 140+ tasks downstream)

**Process**: Agents are working around blockers, but clearing these will unlock full team velocity.

---

## 🎯 MANAGER UPDATE - DESIGNER SPECS READY, START TASK 6

**Designer Report**: ALL 20 TASKS COMPLETE including full Approval Queue UI specs ✅

**Available Specs for You**:
1. `docs/design/HANDOFF-approval-queue-ui.md` - Primary handoff
2. `docs/design/MINIMAL-approval-ui-assets-TODAY.md` - Today's delivery scope
3. `docs/design/approvalcard-component-spec.md` - Component details  
4. `docs/design/approval-queue-edge-states.md` - Edge cases
5. `docs/design/accessibility-approval-flow.md` - A11y requirements

**Task 6 Status**: UNBLOCKED - Start immediately ✅

**Engineer Helper Available**: Completed Task 3, deprioritized Task 2, ready to help you with UI

**Updated Tasks**:
- ✅ Task 4: Agent SDK Service (COMPLETE)
- ✅ Task 5: Webhook Endpoints (COMPLETE)
- 🟢 Task 6: Approval Queue UI - **START NOW** (3-4h with Engineer Helper)
- ⏳ Task 7: Integration Testing (after Task 6)

**Timeline**: 3-4 hours for Task 6 with helper, then 1-2h for Task 7

**Status**: 🟢 UNBLOCKED - Proceed with Task 6 (Approval UI) immediately

---

## 🚨 UPDATED PRIORITY (2025-10-13T22:45:00Z) — Manager Assignment

**Status**: All previous tasks complete ✅  
**New Assignment**: Performance Optimization & Technical Debt

### P0: Dashboard Performance Optimization (4-6 hours)

**Goal**: Reduce dashboard load time to <1 second

**Tasks**:
1. **Profile Current Performance**
   - Measure current load times for all 6 tiles
   - Identify bottlenecks (API calls, rendering, data processing)
   - Document baseline metrics

2. **Optimize Data Fetching**
   - Implement parallel API calls for tiles
   - Add request caching (5-minute TTL)
   - Optimize GraphQL queries (reduce overfetching)

3. **Optimize Rendering**
   - Implement React.lazy() for tile components
   - Add Suspense boundaries
   - Optimize re-renders with useMemo/useCallback

4. **Test & Validate**
   - Measure improvements
   - Verify <1s load time target
   - Test on slow connections

**Evidence**: Performance report with before/after metrics, code changes, test results

### P1: TypeScript Strict Mode Migration (2-3 hours)

**Goal**: Enable strict mode for better type safety

**Tasks**:
1. Enable `strict: true` in tsconfig.json
2. Fix type errors incrementally (start with critical paths)
3. Document any `any` types that remain
4. Update type definitions

**Evidence**: Clean typecheck output, PR with changes

### P2: Code Quality Improvements (2-3 hours)

**Goal**: Reduce technical debt

**Tasks**:
1. Fix remaining lint errors (if any)
2. Add JSDoc comments to public APIs
3. Refactor complex functions (>50 lines)
4. Update outdated dependencies

**Evidence**: Lint report, documentation updates, refactoring PR

**Timeline**: Start immediately, report progress every 2 hours to feedback/engineer.md

**Coordination**:
- Designer: May need UX input on loading states
- QA: Will need testing after optimization

**When Complete**: Log completion in feedback/engineer.md (manager monitors all feedback files)

---
