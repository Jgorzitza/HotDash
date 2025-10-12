---
epoch: 2025.10.E1
doc: docs/directions/qa.md
owner: manager
last_reviewed: 2025-10-12
doc_hash: TBD
expires: 2025-10-19
---
# QA — Direction (Operator Control Center)
## Canon
- North Star: docs/NORTH_STAR.md
- Git & Delivery Protocol: docs/git_protocol.md
- Direction Governance: docs/directions/README.md
- MCP Allowlist: docs/policies/mcp-allowlist.json
- Credential Map: docs/ops/credential_index.md
- Agent Launch Checklist (manager executed): docs/runbooks/agent_launch_checklist.md

> Manager authored. QA must not modify or add direction files; propose changes via evidence-backed request to manager.

## Local Execution Policy (Auto-Run)

You may run local, non-interactive test and audit commands without asking for approval each time. Guardrails:

- Scope and safety: local repo and local Supabase only; no remote infra changes; status/read-only checks are fine.
- Non-interactive only: add flags to avoid prompts; disable pagers (git --no-pager; pipe outputs). Avoid less/man/vim.
- Evidence logging: record timestamp, command, and artifact paths in feedback/qa.md; store traces/screens under artifacts/qa/.
- Secrets: never print values; load from env/vault; reference names only.
- Tooling: use npx supabase for local usage; git/gh with --no-pager; prefer rg else grep -nE.
- Retry: up to 2 attempts, then escalate with logs.

- Guard Evidence Gates: block merge without Vitest + Playwright + Lighthouse proof and mock/live screenshots.
- Maintain mock data suites for Shopify/Chatwoot/GA; ensure tests run offline with deterministic fixtures (default Playwright runs use `mock=1`).
- When validating Shopify behaviours, pull expected responses and flows from the Shopify developer MCP (`shopify-dev-mcp`) to avoid speculative coverage gaps.
- Add Playwright coverage per tile (summary + drill-in + approval action) and run smoke on every PR.
- Track regression matrix in `feedback/qa.md`; call out API rate-limit or credential blockers daily.
- Verify Prisma migrations roll forward/back on the Supabase Postgres stack (local via `supabase start`, staging via vault secrets) before sign-off.
- Coordinate soak tests for streaming/approvals; log results under artifacts/ with timestamps.
- Stack guardrails: audit against `docs/directions/README.md#canonical-toolkit--secrets` (Supabase-only Postgres, Chatwoot on Supabase, React Router 7, OpenAI + LlamaIndex) and flag any divergence.
- Reference docs/dev/admin-graphql.md when validating Admin API flows and docs/dev/storefront-mcp.md for storefront agent coverage.
- Start executing assigned tasks immediately; log progress and blockers in `feedback/qa.md` without waiting for additional manager approval. For every finding, document the remediation attempts you executed (command + output). Only escalate to another team when the fix is out of QA scope or fails twice with evidence attached.

## Current Sprint Focus — 2025-10-12
QA operates as the audit arm of the team. Validate the health of the environment and surface risks; individual feature owners are responsible for their own tests. Execute the steps below in parallel and log findings in `feedback/qa.md`.

## Aligned Task List — 2025-10-11 (Updated: Accelerated Delivery)

**LAUNCH CRITICAL TASKS** (Priority Order - Do These FIRST):

## 🚨 P0 LAUNCH TESTING (Do Immediately as Engineer Completes)

1. **Test LlamaIndex MCP Server** (when Engineer completes Task 3)
   - Verify MCP server responds to queries
   - Test all 3 tools (query_support, refresh_index, insight_report)
   - Performance test (<500ms response)
   - Evidence: Test results, response times logged
   - Status: ⏳ READY - waiting for Engineer Task 3 to deploy

**While Waiting for Engineer - Execute These**:

1A. **Prepare LlamaIndex MCP Test Suite**
   - Write test plan for all 3 MCP tools
   - Create test queries for each tool
   - Document expected responses
   - Prepare performance benchmarks
   - Evidence: Test plan document
   - Timeline: 2-3 hours

1B. **Prepare Agent SDK Test Scenarios**
   - Design E2E test scenarios for approval flow
   - Create test data (sample customer inquiries)
   - Document expected agent responses
   - Prepare approval test cases
   - Evidence: Test scenario document
   - Timeline: 2-3 hours

1C. **Prepare Webhook Test Strategy**
   - Design webhook test payloads
   - Document signature verification tests
   - Create error handling test cases
   - Prepare integration test plan
   - Evidence: Webhook test strategy
   - Timeline: 1-2 hours

1D. **Review Existing Test Coverage**
   - Audit current test suite for gaps
   - Identify untested critical paths
   - Document areas needing coverage
   - Prioritize test additions
   - Evidence: Coverage gap report
   - Timeline: 2-3 hours

2. **Test Agent SDK Service** (when Engineer completes Task 4)
   - Test agent receives webhook, processes request
   - Verify approval queue populates
   - Test approval/reject endpoints work
   - Evidence: E2E test passing

3. **Test Webhook Endpoints** (when Engineer completes Task 5)
   - Send test webhook to /api/webhooks/chatwoot
   - Verify signature validation works
   - Confirm event routing
   - Evidence: Webhook processed successfully

4. **Test Approval Queue UI** (when Engineer completes Task 6)
   - Test operator can view pending approvals
   - Test approve/reject buttons work
   - Verify decision logs to Supabase
   - Evidence: UI test passing, screenshots

5. **Integration E2E Test** (when Engineer completes Task 7)
   - Full workflow: Chatwoot → Agent → Approval → Response
   - Verify all pieces work together
   - Document any issues
   - Evidence: Complete E2E passing

**Timeline**: Shadow Engineer's work, test immediately as each completes

---

## ✅ EXCELLENT WORK (2025-10-12T00:50Z)

**Your Test Results**: Found LlamaIndex MCP is NOT WORKING (0/3 tools functional)

**Manager Action**: Escalated to Engineer as P0 blocker

**Your Next Steps**:
1. Continue with Tasks 1A-1D (prep work)
2. Execute 4-hour quality validation cycle NOW
3. When Engineer fixes LlamaIndex MCP, retest immediately
4. When Engineer fixes Shopify queries, verify fixes

**Priority**: Quality validation of ALL agent work (find issues early)

---

## 🆕 URGENT TASK (CEO Request - Do FIRST)

**Task 0**: Verify Engineer's Claims Using MCPs
- Use Fly MCP: Check if llamaindex-mcp app actually deployed
- Use GitHub MCP: Check commits today (verify work is in git)
- Use Shopify MCP: Validate if Shopify queries actually fixed
- Test actual functionality (not just check status)
- **Evidence**: MCP query results, factual status of each claim
- **Timeline**: 30-60 min
- **Why**: Engineer claims work "complete" but your tests found issues

Execute Task 0 FIRST, then validation cycle + prep tasks. Report in feedback/qa.md.

---

## 📋 ADDITIONAL LAUNCH-ALIGNED TASKS (In-Depth)

**Task 1E**: Hot Rodan Smoke Test Suite
- Create smoke tests specific to Hot Rodan product catalog
- Test with actual hot rod parts SKUs
- Verify automotive-specific data displays correctly
- Evidence: Smoke test suite
- Timeline: 2-3 hours

**Task 1F**: Performance Budget Enforcement
- Set performance budgets per tile (<300ms load)
- Create automated performance tests
- Test with production data volumes
- Evidence: Performance test suite
- Timeline: 2-3 hours

**Task 1G**: Accessibility Testing
- Screen reader testing for approval queue
- Keyboard navigation validation
- WCAG 2.1 AA compliance check
- Evidence: Accessibility audit report
- Timeline: 2-3 hours

**Task 1H**: Cross-Browser Testing
- Test in Chrome, Firefox, Safari
- Test on mobile devices (iOS/Android)
- Document any browser-specific issues
- Evidence: Browser compatibility report
- Timeline: 2-3 hours

**Task 1I**: Security Testing
- Test webhook signature validation
- Test SQL injection protection
- Test XSS prevention
- Evidence: Security test results
- Timeline: 2-3 hours

**Task 1J**: Load Testing
- Simulate multiple concurrent operators
- Test approval queue under load
- Verify no race conditions
- Evidence: Load test results
- Timeline: 2-3 hours

Execute 1A-1J + validation cycles. Total: ~25-30 hours launch-aligned work.

---

## 📋 QUALITY VALIDATION (Every 4 Hours - Ongoing)

**Tasks in Priority Order** (execute sequentially, log blockers in feedback/qa.md and continue):

1. ✅ **Test Suite Audit** - COMPLETE (2025-10-11, 45 min)
   - 43/50 tests passing (85.7% pass rate)
   - 8 security vulnerabilities identified
   - 7 P0 blockers documented with owners
   - Evidence: artifacts/qa/2025-10-11T142942Z/

2. **Resolve Test Blockers** - Fix P0 issues to get test suite to 100%
   - Fix logger.server.spec.ts (coordinate with @engineer for mock fetch setup)
   - Install @vitest/coverage-v8: npm install -D @vitest/coverage-v8
   - Add SCOPES to .env.example with documentation
   - Re-run test suite: npm run test:unit
   - Verify 100% pass rate
   - Evidence: Clean test output, documented in feedback/qa.md

3. **Agent SDK Test Strategy** - Create comprehensive test plan
   - Write integration test plan for webhook flow (Chatwoot → Agent SDK → approval)
   - Create E2E test scenarios: approve action, reject action, timeout handling
   - Document test data requirements (sample conversations, mock approvals)
   - Prepare Playwright test stubs for approval queue UI
   - Coordinate: Tag @engineer when tests are ready to implement
   - Evidence: Test plan document, test stubs created

4. **Agent SDK Integration Tests** - Write and execute tests
   - Create tests/integration/agent-sdk-webhook.spec.ts
   - Test webhook payload processing
   - Test agent tool execution
   - Test approval state persistence
   - Test approve/reject flows
   - Run tests and document results
   - Evidence: Test results, coverage report

5. **Approval Queue E2E Tests** - Playwright automation
   - Create tests/e2e/approval-queue.spec.ts
   - Test operator views approval queue
   - Test operator approves action
   - Test operator rejects action
   - Test real-time updates
   - Test error handling
   - Evidence: Playwright test results, screenshots

6. **Security Testing** - Validate Agent SDK security
   - Test CSRF protection on approval endpoints
   - Test authentication/authorization
   - Test input validation and sanitization
   - Test rate limiting
   - Verify no secrets in logs
   - Evidence: Security test report

7. **Performance Baseline** - Capture performance metrics
   - Run Lighthouse on dashboard
   - Measure P95 latencies for all routes
   - Test approval queue under load
   - Document performance baselines
   - Evidence: Lighthouse report, performance metrics

**Ongoing Requirements**:
- Coordinate with @engineer on test environment setup
- Run tests continuously as features are built
- Report failures immediately in feedback/qa.md
- Keep mock=1 mode working for CI

---

### 🚀 PRIORITY: Execute Task 3 NOW (Doesn't Require Implementation)

**Task 3: Agent SDK Test Strategy** - Can start immediately
- Write integration test plan for webhook flow
- Create E2E test scenarios (approve/reject/timeout)
- Document test data requirements
- Prepare Playwright test stubs
- Evidence: Complete test plan, stub files created

**This doesn't require Agent SDK to be built yet** - you're planning the tests.

### 🚀 ADDITIONAL PARALLEL TASKS

**Task A: Performance Testing Framework** - Prepare for load testing
- Design load test scenarios for approval queue
- Create performance benchmarking scripts
- Document performance budgets (<100ms routes, <500ms MCP)
- Prepare Lighthouse CI configuration
- Evidence: Performance test framework

**Task B: Security Test Suite** - Prepare security tests
- Design security test scenarios (CSRF, auth, injection)
- Create test data for security testing
- Document security requirements
- Prepare penetration test checklist
- Evidence: Security test plan

Execute Task 3 immediately, then A and B in parallel.

---

### 🚀 MASSIVE EXPANSION (5x Capacity) - 15 Additional Tasks

**Task C-G: Automated Testing Infrastructure** (5 tasks)
- C: Create visual regression testing suite (Percy or Chromatic)
- D: Implement API contract testing (Pact or similar)
- E: Design mutation testing framework
- F: Create accessibility automation (axe-core CI integration)
- G: Implement test data generation framework

**Task H-L: Quality Assurance Processes** (5 tasks)
- H: Design code review checklist and automation
- I: Create quality gates for all PRs
- J: Implement automated security scanning (SAST/DAST)
- K: Design performance budgeting and enforcement
- L: Create test coverage monitoring and alerts

**Task M-Q: Testing Documentation** (5 tasks)
- M: Write comprehensive testing guide for all developers
- N: Create test best practices documentation
- O: Document QA processes and workflows
- P: Create bug reporting and triage procedures
- Q: Design test maintenance and debt reduction plan

Execute C-Q in any order. Total: 24 tasks, ~15 hours of QA work.

---

### 🚨 CRITICAL NEW RESPONSIBILITY: VELOCITY QUALITY VALIDATION (2025-10-11T22:30Z)

**CEO Directive**: "Validate task completion quality - we're moving fast, ensure we're not generating garbage code"

**Your New Role**: Quality gatekeeper for all agent work

**Validation Process** (Execute every 4 hours):

1. **Evidence Review** (30 min): Check all agent feedback for completed tasks have proper proof
2. **Proof Validation** (60 min): Random sample 3-5 tasks per agent, verify quality  
3. **Quality Report** (15 min): Rate agents 🟢🟡🔴, escalate issues to Manager

**Evidence Standards**:
- ✅ Code: File path + line numbers + description
- ✅ Tests: Test file + passing status
- ✅ Docs: Document path + sections  
- ✅ Design: Asset paths + screenshots
- ❌ NOT acceptable: "Done", "Complete", "Finished"

**Full Process**: `docs/runbooks/qa_validation_process.md`

---

### 🚀 SIXTH MASSIVE EXPANSION (Another 30 Tasks)

**Task R-W: Quality Engineering** (5 tasks)
- R: Design shift-left testing methodology
- S: Create quality metrics framework
- T: Implement defect prediction models
- U: Design test data management platform
- V: Create quality engineering training

**Task W-AB: Advanced Testing** (6 tasks)
- W: Design mutation testing framework
- X: Create property-based testing
- Y: Implement metamorphic testing
- Z: Design combinatorial testing
- AA: Create test case prioritization
- AB: Implement test impact analysis

**Task AC-AH: Test Automation Platform** (6 tasks)
- AC: Design test automation framework architecture
- AD: Create test orchestration platform
- AE: Implement parallel test execution
- AF: Design test result analytics
- AG: Create test flakiness detection
- AH: Implement test healing automation

**Task AI-AN: Quality Assurance Operations** (6 tasks)
- AI: Design QA metrics dashboard
- AJ: Create defect lifecycle management
- AK: Implement quality gates automation
- AL: Design test coverage analytics
- AM: Create quality trend analysis
- AN: Implement quality forecasting

**Task AO-AT: Specialized Testing** (7 tasks)
- AO: Design API contract testing framework
- AP: Create microservices testing strategy
- AQ: Implement data quality testing
- AR: Design ML model testing framework
- AS: Create accessibility testing automation
- AT: Implement localization testing
- AU: Design performance testing framework

**DO FIRST**: P0 Launch Testing (Tasks 1-5 above) + 4-hour validation cycles

**PAUSE UNTIL AFTER LAUNCH**: Tasks R-AU (advanced testing infrastructure)

Total: 5 P0 tasks + validation duty + 30 post-launch tasks

## Previous Task List — 2025-10-11
- Canonical toolkit checks
  - Verify no alt DBs or direct redis usage in app builds via CI status; flag violations.
- Shopify Admin testing
  - Use RR7 + CLI v3 flow; no token injection. Keep `mock=1` green; for `mock=0` live smoke, use Admin login credentials.
  - Use Shopify Dev MCP for Admin flows and assertions; do not guess responses.
- Secrets hygiene
  - Confirm no embed/session tokens exist in GitHub or vault for current flow; ensure artifacts/logs are sanitized.
- Evidence
  - Preserve Playwright traces, screenshots, and curl logs; log in `feedback/qa.md` with timestamps.

1. **Local Supabase verification**
   - Run `supabase start` and export `.env.local` before executing test suites (see `docs/runbooks/supabase_local.md`). Log the Prisma `npm run setup` output and confirm migrations succeed locally.
   - Tail logs via `scripts/ops/tail-supabase-logs.sh` during Playwright/analytics runs; attach relevant snippets to the evidence bundle.

2. **Security & secrets audit**
   - Verify RLS is enabled on all PostgREST tables (`notification_settings`, `notification_subscriptions`, etc.) by running the Supabase policies query yourself and attaching the results.
   - Check vault/GitHub secrets for accuracy (Supabase DSN, OpenAI key). Confirm no embed/session tokens are stored or required under the current React Router 7 + Shopify CLI v3 dev flow. Remove any residual `SHOPIFY_EMBED_TOKEN_*` secrets if present; log the cleanup.

3. **GitHub posture**
   - Audit branch protection, required reviewers, and Actions status. Flag missing reviewers or failing workflows.
   - Ensure required secrets (Supabase DSN, Chatwoot, GA MCP) appear in the environment; embed/session tokens should not be present.

4. **Code quality & performance**
   - Review latest PRs/build outputs for lint/test coverage trends and TODO debt.
   - Monitor Lighthouse/perf dashboards; log latencies and regression risks alongside reliability’s synthetic results.

5. **End-to-end readiness**
   - Maintain the “ready-to-fire” checklists for Shopify Admin suites, Prisma drills, and DEPLOY-147 evidence. Execute immediately when reliability clears latency thresholds and Fly memory scaling is complete; log the full command/output bundle.
   - Keep `npm run test:e2e -- --grep "dashboard modals"` smoke green and stage the full `npm run test:e2e` suite for when staging reopens. Use the Admin login credentials (`PLAYWRIGHT_SHOPIFY_EMAIL/PASSWORD`) for live runs—no manual tokens. As soon as engineering confirms the TypeScript build is clean, rerun `npm run typecheck` to verify and record the success before triggering the full Playwright suite. If a suite fails, attempt the fix (or pair with the owning engineer) before logging the issue.

6. **Stack compliance cadence**
   - Partner with the manager on the Monday/Thursday stack audit; highlight any tooling drift or secret misuse and assign remediation.

7. **Reporting**
   - Summarize audit findings, risks, and recommended follow-up owners in `feedback/qa.md` and notify impacted teams.
