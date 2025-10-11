---
epoch: 2025.10.E1
doc: docs/directions/engineer.md
owner: manager
last_reviewed: 2025-10-12
doc_hash: TBD
expires: 2025-10-19
---
# Engineer — Direction (Operator Control Center)
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

🚨 **URGENT P0 DEPLOY BLOCKER** - Added 2025-10-11T21:10Z - Fix BEFORE continuing other tasks

**FIX SHOPIFY GRAPHQL QUERIES** - All 4 queries invalid, using deprecated 2023 API patterns
- Evidence: artifacts/integrations/audit-2025-10-11/shopify_graphql_validation_failures.md
- Impact: Sales Pulse, Fulfillment, Inventory tiles completely broken
- Priority: Fix BEFORE resuming LlamaIndex MCP work
- Fixes (in order):
  1. app/services/shopify/orders.ts line 28: financialStatus → displayFinancialStatus (15 min)
  2. app/services/shopify/inventory.ts lines 14-48: Add quantities(names:["available"]), fix field + function (30 min)
  3. packages/integrations/shopify.ts lines 3-12: Remove edges/node from Fulfillment (30 min)
  4. packages/integrations/shopify.ts lines 14-20: Migrate to productSet mutation (60 min)
- Validation: Use Shopify Dev MCP to validate EACH fix before moving to next
- Evidence: MCP validation confirmations, test results in feedback/engineer.md
- Timeline: Complete all 4 within 3 hours, THEN resume LlamaIndex MCP

1. ✅ **GA Direct API Integration** - COMPLETE (2025-10-11, 2h)
   - Evidence: artifacts/engineer/20251011T142951Z/ga-tests.log
   - Files: app/services/ga/directClient.ts, mockClient.ts, client.ts
   - Tests: 21 tests passing, 100% coverage

2. **LlamaIndex RAG MCP Server** - Create HTTP MCP wrapper around existing llama-workflow CLI
   - Scaffold apps/llamaindex-mcp-server/ with @modelcontextprotocol/sdk, express, zod
   - Implement src/server.ts with MCP protocol handler for 3 tools (query_support, refresh_index, insight_report)
   - Create thin wrappers in src/handlers/*.ts using execSync to call scripts/ai/llama-workflow/dist/cli.js
   - Create Dockerfile and fly.toml (512MB, auto-stop enabled)
   - Deploy to Fly.io: `fly launch --no-deploy && fly secrets set OPENAI_API_KEY=... && fly deploy`
   - Update .mcp.json with HTTP endpoint: "llamaindex-rag": {"type": "http", "url": "https://hotdash-llamaindex-mcp.fly.dev/mcp"}
   - Test from Cursor: "Using llamaindex-rag MCP, query: test"
   - Target: <500ms P95 response time
   - Coordinate: Tag @ai in feedback/engineer.md for code review and optimization
   - Evidence: MCP server responding, health checks passing, documented in feedback/engineer.md

3. **Agent SDK Service** - Build OpenAI Agent SDK customer support automation
   - Scaffold apps/agent-service/src/{agents,tools,feedback} with @openai/agents, express, zod
   - Implement tools/rag.ts (MCP wrapper pointing to llamaindex-rag server)
   - Implement tools/shopify.ts (direct GraphQL from docs/AgentSDKopenAI.md section 5)
   - Implement tools/chatwoot.ts (direct API from docs/AgentSDKopenAI.md section 4)
   - Define agents in agents/index.ts: triageAgent, orderSupportAgent, productQAAgent with handoffs
   - Implement server.ts with webhook endpoint (POST /webhooks/chatwoot) and approval endpoints (GET /approvals, POST /approvals/:id/:idx/:action)
   - Implement feedback/store.ts for training data collection (Supabase tables from @data)
   - Deploy to Fly.io with secrets: OPENAI_API_KEY, CHATWOOT_API_TOKEN, SHOPIFY_ADMIN_TOKEN
   - Coordinate: Tag @chatwoot for webhook config, @data for schemas, @ai for RAG integration
   - Evidence: Agent service responding to test webhooks, documented in feedback/engineer.md

4. **Approval Queue UI** - Build operator approval interface in dashboard
   - Create app/routes/approvals.tsx with loader fetching from Agent SDK /approvals endpoint
   - Implement app/components/ApprovalCard.tsx using Designer specs from feedback/designer.md
   - Wire approve/reject actions to POST /approvals/:id/:idx/approve|reject
   - Add real-time updates (polling every 5s or websockets)
   - Implement loading, error, and empty states per Designer specs
   - Test keyboard navigation and accessibility
   - Coordinate: Tag @designer for component review, @qa for test scenarios
   - Evidence: Working approval queue with screenshot, documented in feedback/engineer.md

5. **Fix Test Blockers** - Resolve QA-identified P0 issues
   - Fix logger.server.spec.ts (mock fetch or configure Supabase test instance)
   - Install @vitest/coverage-v8 dependency
   - Add SCOPES to .env.example with documentation
   - Re-run test suite and verify 100% pass rate
   - Evidence: Clean test run logs

6. **End-to-End Testing** - Full system integration verification
   - Test: Chatwoot webhook → Agent SDK → LlamaIndex MCP → Approval queue
   - Test: Operator approves action → Agent executes → Chatwoot reply sent
   - Test: Operator rejects action → Agent stops → Private note created
   - Document test results and performance metrics
   - Evidence: E2E test passing, performance within targets

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
