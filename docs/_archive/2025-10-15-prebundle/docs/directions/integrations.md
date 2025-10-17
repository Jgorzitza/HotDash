---
epoch: 2025.10.E1
doc: docs/directions/integrations.md
owner: manager
last_reviewed: 2025-10-10
doc_hash: TBD
expires: 2025-10-17
---

# Integrations — Direction (Operator Control Center)

## Canon

- North Star: docs/NORTH_STAR.md
- Git & Delivery Protocol: docs/git_protocol.md
- Direction Governance: docs/directions/README.md
- MCP Allowlist: docs/policies/mcp-allowlist.json
- Credential Map: docs/ops/credential_index.md
- Agent Launch Checklist (manager executed): docs/runbooks/agent_launch_checklist.md

> Manager authored. Integrations agent must channel change requests to the manager with evidence; do not edit direction docs directly.

## Local Execution Policy (Auto-Run)

You may run local, non-interactive commands and scripts without approval. Guardrails:

- Scope: local repo and local tooling; do not change remote infra/secrets under auto-run. Status/read-only checks are okay.
- Non-interactive: disable pagers; avoid interactive prompts.
- Evidence: log timestamp, command, outputs in feedback/integrations.md; store logs under artifacts/integrations/.
- Secrets: load from vault/env; never print values.
- Tooling: npx supabase locally; git/gh with --no-pager; prefer rg else grep -nE.
- Retry: 2 attempts then escalate with logs.

- Own external vendor onboarding (GA MCP, Chatwoot, Supabase, social sentiment providers) and track status in `docs/integrations/`.
- For Shopify-related work, consult the Shopify developer MCP (`shopify-dev-mcp`) for contracts and flows—capture MCP references in readiness docs instead of guessing endpoints.
- Coordinate credential requests, sandbox validation, and rate-limit testing with engineering, data, and reliability before production handoff.
- Maintain typed client contract summaries and ensure they stay in sync with upstream changes.
- Provide go-live checklists and contact logs for each integration so deployment can execute quickly when windows open.
- Stack guardrails: enforce `docs/directions/README.md#canonical-toolkit--secrets` (Supabase-only Postgres, Chatwoot on Supabase, React Router 7, OpenAI + LlamaIndex). Reference Shopify docs: docs/dev/appreact.md, docs/dev/authshop.md, docs/dev/session-storage.md for current guidance. Do not introduce alternate databases; PRs will be blocked by the Canonical Toolkit Guard if violations are detected.
- Maintain API contracts using docs/dev/admin-graphql.md (Admin), docs/dev/storefront-mcp.md (Storefront MCP), and docs/dev/webpixels-shopify.md (pixels).

- Do not spin up alternate databases or MCPs without manager approval.
- Log integration status updates, blockers, and decisions in `feedback/integrations.md`.
- Start executing assigned tasks immediately; log progress and blockers in `feedback/integrations.md` without waiting for additional manager approval.

## Current Sprint Focus — 2025-10-10

Own external integrations beyond Chatwoot and keep managers informed via `feedback/integrations.md`. You are responsible for taking each task from start to finish: capture the command/output for every step, log blockers with evidence, and only escalate after two documented attempts with timestamps.

## Aligned Task List — 2025-10-11 (Updated: Accelerated Delivery)

**Reference Docs**:

- docs/mcp/tools/llamaindex.json - LlamaIndex MCP tools already defined
- docs/directions/mcp-tools-reference.md - All 7 MCP servers

**Tasks in Priority Order** (execute sequentially, log blockers in feedback/integrations.md and continue):

1. ✅ **MCP Server Health Check** - COMPLETE (2025-10-11)
   - Context7 Docker cleanup (20 stopped containers removed)
   - MCP server verification complete
   - Evidence: feedback/integrations.md

2. **MCP Server Health Dashboard** - Monitor all 7 MCP servers
   - Test connectivity to all MCP servers (shopify, context7, github, supabase, fly, google-analytics, llamaindex-rag)
   - Check response times for each
   - Document availability and any issues
   - Create health monitoring script
   - Evidence: Health check results, monitoring script

3. **LlamaIndex MCP Registration** - Update MCP configuration after Engineer deploys
   - Verify LlamaIndex MCP server deployed to Fly.io
   - Test all 3 tools: query_support, refresh_index, insight_report
   - Update docs/mcp/tools/llamaindex.json with deployment URL
   - Add to MCP allowlist: docs/policies/mcp-allowlist.json
   - Evidence: Test results, configuration updates

4. **Shopify API Validation** - Ensure all GraphQL queries validated
   - Scan codebase for Shopify GraphQL queries
   - Validate each with Shopify Dev MCP
   - Check for deprecated API calls (pre-2024)
   - Document validation results
   - Evidence: Validation report with MCP confirmation

5. **Agent SDK API Integration Review** - Validate Agent SDK uses correct APIs
   - Review Agent SDK Shopify tool implementations (when @engineer builds)
   - Review Agent SDK Chatwoot tool implementations
   - Verify all API calls follow documented patterns
   - Check rate limiting and error handling
   - Coordinate: Tag @engineer for any fixes needed
   - Evidence: Integration review checklist

6. **Production Secrets Readiness** - Prepare for pilot launch
   - Verify all required secrets in vault/occ/
   - Document secret mirroring checklist for production
   - Coordinate: Tag @deployment for production mirroring timeline
   - Evidence: Secret inventory, readiness checklist

**Ongoing Requirements**:

- Monitor MCP server health continuously
- Validate all Shopify queries with MCP
- Log all integration checks in feedback/integrations.md

---

### 🚀 PARALLEL TASKS (While Engineer Fixes Shopify + Builds MCP)

**Task A: MCP Health Monitoring Automation** - Create monitoring scripts

- Create script to test all 7 MCP servers
- Check response times and availability
- Generate health report
- Schedule for cron/GitHub Actions
- Evidence: Monitoring script, health report

**Task B: API Documentation Review** - Document all external APIs

- Document Shopify Admin API usage patterns
- Document Chatwoot API endpoints used
- Document Google Analytics API (for reference)
- Create API reference guide
- Evidence: API documentation

**Task C: Integration Testing Scripts** - Prepare test automation

- Create integration test scripts for each external API
- Mock API responses for CI testing
- Document test data requirements
- Create test fixtures
- Evidence: Integration test suite

Execute A (most valuable), then B and C.

---

### 🚀 EXPANDED TASK LIST (2x Capacity for Fast Agent)

**Task D: API Rate Limiting Strategy**

- Document rate limits for all external APIs (Shopify, Chatwoot, GA, OpenAI)
- Design rate limiting and throttling approach
- Create monitoring for API usage
- Plan for rate limit handling and backoff
- Evidence: Rate limiting strategy document

**Task E: Webhook Security Framework**

- Design webhook authentication patterns for all services
- Document signature verification methods
- Create webhook testing framework
- Plan for webhook monitoring and alerting
- Evidence: Webhook security guide

**Task F: API Client Library Consolidation**

- Review all API client implementations
- Identify consolidation opportunities
- Design standardized API client pattern
- Create shared utilities for common operations
- Evidence: API client consolidation plan

**Task G: Integration Health Dashboard**

- Design comprehensive integration health dashboard
- Define health check metrics for each integration
- Create visualization specifications
- Plan for automated health monitoring
- Evidence: Integration dashboard design

**Task H: Third-Party Service Evaluation**

- Research additional integration opportunities
- Evaluate potential new services (CRM, analytics, social)
- Document integration complexity and value
- Create integration priority matrix
- Evidence: Service evaluation report

**Task I: Integration Testing Automation**

- Create automated integration test suite
- Design continuous integration testing workflow
- Implement mock servers for external APIs
- Document testing best practices
- Evidence: Automated test suite

**Task J: Vendor Relationship Documentation**

- Document all vendor contacts and relationships
- Create vendor escalation procedures
- Track vendor SLAs and performance
- Plan for vendor performance reviews
- Evidence: Vendor management framework

Execute D-J in any order - all strengthen integration reliability.

---

### 🚀 SECOND MASSIVE EXPANSION (Another 20 Tasks)

**Task K-O: Integration Platform** (5 tasks)

- K: Design integration marketplace for HotDash (allow third-party integrations)
- L: Create integration SDK and developer documentation
- M: Design OAuth flow for third-party app authentication
- N: Create integration testing and certification program
- O: Design integration analytics and monitoring dashboard

**Task P-T: Advanced Integrations** (5 tasks)

- P: Research and plan Klaviyo email marketing integration
- Q: Design Facebook/Instagram social media integration
- R: Plan Stripe/payment gateway integration for billing insights
- S: Create Zendesk integration for support ticket sync
- T: Design Slack integration for operator notifications

**Task U-Y: API Management** (5 tasks)

- U: Design API gateway for all integrations
- V: Create API versioning and deprecation strategy
- W: Implement API documentation auto-generation
- X: Design API analytics and usage tracking
- Y: Create API key management and rotation system

**Task Z-AD: Data Integration** (5 tasks)

- Z: Design ETL pipelines for all external data sources
- AA: Create data sync scheduling and orchestration
- AB: Implement conflict resolution for bidirectional sync
- AC: Design data mapping and transformation framework
- AD: Create integration data quality monitoring

Execute K-AD in any order. Total: 36 tasks, ~20-25 hours work.

---

### 🚀 FIFTH MASSIVE EXPANSION (Another 20 Tasks)

**Task AE-AI: Monitoring & Alerting** (5 tasks)

- AE: Design integration health scoring system
- AF: Create SLA tracking and violation alerting
- AG: Implement integration performance dashboards
- AH: Design anomaly detection for integration failures
- AI: Create integration cost tracking and optimization

**Task AJ-AN: Testing & Quality** (5 tasks)

- AJ: Create integration regression test suite
- AK: Design contract testing framework
- AL: Implement integration load testing
- AM: Create integration chaos engineering tests
- AN: Design integration performance benchmarking

**Task AO-AS: Documentation & DevEx** (5 tasks)

- AO: Create integration developer guides
- AP: Design integration troubleshooting playbooks
- AQ: Implement integration examples and recipes
- AR: Create integration migration guides
- AS: Design integration best practices documentation

**Task AT-AX: Advanced Features** (5 tasks)

- AT: Design integration workflow automation
- AU: Create integration event streaming
- AV: Implement integration caching strategies
- AW: Design integration retry and circuit breaker patterns
- AX: Create integration feature flagging system

Execute AE-AX in any order. Total: 56 tasks, ~30 hours work.

---

### ⚡ BLOCKER MANAGEMENT (2025-10-11T22:25Z)

**Known Dependencies** (DO NOT wait - work around):

- Task 3 (LlamaIndex MCP): Blocked by Engineer deployment → SKIP, continue with other tasks
- Task 5 (Agent SDK integration): Blocked by Engineer implementation → SKIP, continue with other tasks

**Your Strategy**: Execute all non-blocked tasks (Tasks 2, 4, 6-13, AE-AX). Engineer will notify when blockers clear.

---

## ✅ EXCELLENT WORK (2025-10-12T00:50Z)

**Your Report**: Documented 4 launch-blocking Shopify GraphQL issues with exact fixes

**Manager Action**: Escalated to Engineer as P0 priority (must fix before Agent SDK)

**Your Status**: Continue with non-blocked tasks while Engineer fixes:

- Task 2: API rate limiting strategy
- Task 4: Webhook security framework
- Tasks 6-13: Continue execution
- Tasks AE-AX: Monitor integration health

**Next**: When Engineer fixes Shopify queries, verify fixes work correctly

Execute Tasks 2, 4, 6-AX. Report evidence in feedback/integrations.md.

---

## 📋 ADDITIONAL LAUNCH-ALIGNED TASKS (In-Depth)

**Task 6A**: Hot Rodan-Specific Integration Testing

- Test Shopify integration with Hot Rodan store data
- Verify automotive product catalog displays correctly
- Test with real hot rod part SKUs
- Evidence: Integration test results
- Timeline: 2-3 hours

**Task 6B**: Webhook Reliability Testing

- Test webhook delivery under various network conditions
- Verify retry logic works
- Test failure scenarios
- Evidence: Webhook reliability report
- Timeline: 2-3 hours

**Task 6C**: API Performance Monitoring

- Monitor Shopify API response times
- Track Chatwoot API latency
- Document performance baselines
- Evidence: Performance monitoring dashboard
- Timeline: 2-3 hours

**Task 6D**: Integration Health Dashboard

- Create dashboard showing all integration statuses
- Real-time health checks
- Alert on integration failures
- Evidence: Health dashboard design
- Timeline: 2-3 hours

**Task 6E**: Error Handling and Recovery

- Document all integration error scenarios
- Create recovery procedures for each
- Test error handling paths
- Evidence: Error recovery runbook
- Timeline: 2-3 hours

Execute 2, 4, 6-6E, AE-AX (all launch-aligned). Total: ~25-30 hours work.

---

## 🚨 LAUNCH CRITICAL REFOCUS (2025-10-11T22:50Z)

**CEO Decision**: Emergency refocus on launch gates

**Your Status**: PAUSED - Stand by until launch gates complete

**Why PAUSED**: Launch gates require Engineer, QA, Designer, Deployment work. Your tasks are valuable but not launch-blocking.

**When to Resume**: After all 7 launch gates complete (~48-72 hours)

**What to Do Now**: Stand by, review your completed work quality, ensure evidence is documented

**Your tasks remain in direction file - will resume after launch.**

---

## ✅ BLOCKER CLEARED (2025-10-11T23:20Z)

**Engineer Update**: Your blockers are CLEARED! 🎉

**What's Ready**:

- LlamaIndex MCP Server: DEPLOYED and WORKING
- Webhook Endpoints: LIVE and TESTED

**Your Action**: Resume blocked tasks immediately + continue with your task list

**Evidence**: Test the new functionality, document results, continue with remaining tasks

**Timeline**: No more waiting - execute now

---

## 🎯 MANAGER UPDATE - SHOPIFY REVALIDATION REQUEST

**Your Status**: Original audit found 4 Shopify GraphQL issues ✅

**Update**: Engineer fixed all 4 issues (2025-10-11 21:30 UTC, 1hr 15min after your report)

**Validation Confirmation**:

- Engineer Helper validated fixes with Shopify Dev MCP ✅
- QA Helper independently validated in comprehensive audit ✅
- Both agents report: 4/4 queries using current 2024+ API patterns

**Your Action**: Re-run Shopify integration validation and update status

**Expected Result**:

- Change from ❌ FAILED to ✅ PASS for all 4 queries
- Confirm: orders.ts, inventory.ts, fulfillments, variant cost all valid

**Timeline**: 30 min to revalidate

**Then**: Continue with your expanded task list (you have many more tasks available)

**Status**: 🟢 ACTIVE - Revalidate Shopify, then continue task list
