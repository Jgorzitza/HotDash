---
epoch: 2025.10.E1
doc: docs/directions/chatwoot.md
owner: manager
last_reviewed: 2025-10-10
doc_hash: TBD
expires: 2025-10-17
---
# Chatwoot Integrations — Direction (Operator Control Center)
## Canon
- North Star: docs/NORTH_STAR.md
- Git & Delivery Protocol: docs/git_protocol.md
- Direction Governance: docs/directions/README.md
- MCP Allowlist: docs/policies/mcp-allowlist.json
- Credential Map: docs/ops/credential_index.md
- Agent Launch Checklist (manager executed): docs/runbooks/agent_launch_checklist.md

> Manager authored. This agent owns the Chatwoot Fly deployment end-to-end; do not pass work off until evidence proves completion.

## Local Execution Policy (Auto-Run)

You may run local, non-interactive commands and scripts without approval. Guardrails:

- Scope: local repo and local Supabase; under auto-run do not change Fly apps or secrets. Status/list checks are fine.
- Non-interactive: disable pagers; avoid interactive prompts.
- Evidence: log timestamp, command, outputs in feedback/chatwoot.md; artifacts under artifacts/integrations/ or artifacts/chatwoot/.
- Secrets: use vault/env; never print values.
- Tooling: npx supabase for local; git/gh with --no-pager; prefer rg else grep -nE.
- Retry: 2 attempts then escalate with logs.

- Execute all Chatwoot Fly tasks captured in `docs/deployment/chatwoot_fly_runbook.md` and the status artifact `artifacts/integrations/chatwoot-fly-deployment-2025-10-10.md`.
- Before touching Fly, source credentials locally (`source vault/occ/fly/api_token.env`) and confirm `FLY_API_TOKEN` is set via `/home/justin/.fly/bin/fly auth status` (and not the placeholder). Capture the confirmation in your feedback log.
- Coordinate directly with reliability/deployment for infrastructure needs but retain task ownership—log every update (including the command/output) in `feedback/chatwoot.md`.
- Ensure secrets, health checks, and evidence bundles are complete before handing off to support/QA.
- Stack guardrails: Chatwoot persists to Supabase only (see `docs/directions/README.md#canonical-toolkit--secrets`); do not provision Fly Postgres or alternate databases.
- Align Chatwoot automation with Shopify data sources: docs/dev/admin-graphql.md for admin facts, docs/dev/storefront-mcp.md for customer context.

## Current Sprint Focus — 2025-10-10
Work through the runbook sequentially and close each item with evidence:

## Aligned Task List — 2025-10-11 (Updated: Accelerated Delivery)

**Reference Docs**:
- docs/AgentSDKopenAI.md - Sections 4-5 for Chatwoot integration patterns
- docs/integrations/chatwoot_readiness.md - Integration checklist (your completed work)

**Tasks in Priority Order** (execute sequentially, log blockers in feedback/chatwoot.md and continue):

1. ✅ **Agent SDK Integration Plan** - COMPLETE (2025-10-11, 1-2h)
   - 2,500 lines comprehensive webhook integration guide
   - 350 lines code implementation
   - 7 test scenarios documented
   - Evidence: feedback/chatwoot.md with complete plan

2. **Webhook Configuration for Agent SDK** - Set up webhook endpoint for incoming messages
   - Configure webhook in Chatwoot Settings → Integrations → Webhooks
   - Point to: https://hotdash-agent-service.fly.dev/webhooks/chatwoot (will be available after @engineer deploys)
   - Subscribe to: message_created event
   - Test webhook delivery with curl or Chatwoot test button
   - Document webhook secret for HMAC verification
   - Coordinate: Tag @engineer when webhook endpoint is live
   - Evidence: Webhook configuration screenshot, test payload logged in feedback/chatwoot.md

3. **HMAC Signature Verification** - Implement security for webhooks
   - Create script to verify Chatwoot webhook signatures
   - Test with sample payloads from your integration guide
   - Document verification process in runbook
   - Provide code snippet to @engineer for server.ts
   - Evidence: Verification script, test results

4. **Conversation Flow Testing** - Verify all API endpoints work
   - Test private note creation API
   - Test public reply API (without sending to customers)
   - Test conversation metadata retrieval
   - Test agent assignment APIs
   - Document API response formats and error codes
   - Evidence: API test results, curl examples documented

5. **End-to-End Agent Flow Testing** - Test full Agent SDK integration
   - Send test message through Chatwoot
   - Verify webhook delivered to Agent SDK
   - Verify private note created with agent draft
   - Test approval → public reply flow (staging only)
   - Document complete conversation lifecycle
   - Coordinate: Tag @engineer and @qa for integration testing
   - Evidence: Full conversation screenshots, logs

**Ongoing Requirements**:
- Coordinate with @engineer on webhook endpoint availability
- Tag @reliability for Chatwoot Fly.io health verification
- Log all API tests in feedback/chatwoot.md with timestamps
- No production webhook configuration until internal testing complete

---

### 🚀 IMMEDIATE TASK (While Deployment Fixes DSN)

**Task A: Webhook Signature Verification Script** - Can build now
- Create standalone script to verify Chatwoot webhook signatures
- Implement HMAC verification logic
- Test with sample payloads from your integration docs
- Document verification process
- Provide code snippet to @engineer for Agent SDK server.ts
- Evidence: Script working, test results, documentation

**Task B: API Testing Suite** - Prepare for post-DSN-fix testing
- Create curl scripts for all Chatwoot API endpoints
- Document expected responses
- Create test data (sample conversations)
- Prepare API integration tests
- Evidence: Complete test script library

**Task C: Conversation Flow Documentation** - Map complete lifecycle
- Document conversation states and transitions
- Map agent assignment logic
- Document private note vs public reply workflows
- Create flowchart for conversation lifecycle
- Evidence: Flow documentation with diagrams

Execute A immediately (most valuable), then B and C.

---

### 🚀 EXPANDED TASK LIST (2x Capacity for Fast Agent)

**Task D: Chatwoot Admin Configuration Documentation**
- Document super admin setup process
- Create API token generation guide with correct scopes
- Document account configuration best practices
- Create troubleshooting guide for common issues
- Evidence: Admin configuration guide in docs/integrations/

**Task E: Message Template Optimization**
- Review existing Chatwoot templates/macros
- Optimize for Agent SDK compatibility
- Create template variables for agent customization
- Document template best practices
- Evidence: Optimized templates, documentation

**Task F: Conversation Routing Logic**
- Design conversation assignment logic for agents
- Document routing rules (order support vs product questions)
- Create priority handling (VIP, urgent, standard)
- Map to Agent SDK triage patterns
- Evidence: Routing logic document with flowchart

**Task G: Performance Monitoring Setup**
- Create scripts to monitor Chatwoot API response times
- Track webhook delivery latency
- Monitor conversation volume metrics
- Document performance baselines
- Evidence: Monitoring scripts, baseline report

**Task H: Integration Testing Scripts**
- Create end-to-end test scripts for all Chatwoot APIs
- Mock webhook payloads for testing
- Create test data (sample conversations)
- Document expected responses
- Evidence: Complete test suite

**Task I: Operator Workflow Documentation**
- Document current manual Chatwoot workflows
- Identify automation opportunities with Agent SDK
- Create before/after workflow diagrams
- Calculate time savings
- Evidence: Workflow analysis

**Task J: Chatwoot-to-Supabase Sync Design**
- Design data sync from Chatwoot to Supabase for analytics
- Document conversation metrics to track
- Create sync job specification
- Plan for real-time vs batch sync
- Evidence: Sync design document

Execute D-J in any order - all independent and valuable.

---

### 🚀 MASSIVE EXPANSION (5x Capacity) - 15 Additional Tasks

**Task K-O: Advanced Chatwoot Automation** (5 tasks)
- K: Design auto-assignment rules for conversations (by topic, VIP status, complexity)
- L: Create canned response library optimized for agent customization
- M: Implement conversation tagging automation for analytics
- N: Design SLA monitoring and alerting system
- O: Create customer sentiment analysis integration

**Task P-T: Operator Productivity** (5 tasks)
- P: Design operator efficiency dashboard (response time, resolution rate, workload)
- Q: Create conversation templates for complex scenarios
- R: Implement keyboard shortcuts and operator UX improvements
- S: Design operator performance gamification system
- T: Create operator collaboration features (internal notes, @mentions)

**Task U-Y: Analytics & Reporting** (5 tasks)
- U: Design conversation analytics dashboard (volume, topics, resolution)
- Y: Create customer satisfaction tracking integration
- V: Implement conversation export and archiving system
- W: Design support knowledge gap identification system
- X: Create operator training need identification from conversation patterns

Execute K-Y in any order. Total: 22 tasks, ~12-15 hours of work.

---

### 🚀 THIRD MASSIVE EXPANSION (Another 20 Tasks)

**Task Z-AD: Advanced Automation** (5 tasks)
- Z: Design intelligent auto-responder for common queries
- AA: Create conversation prediction engine (intent, urgency, complexity)
- AB: Implement smart suggestion system for operators
- AC: Design automated quality scoring for conversations
- AD: Create conversation analytics and insights engine

**Task AE-AI: Operator Tools** (5 tasks)
- AE: Design operator workspace optimization tools
- AF: Create conversation search and discovery system
- AG: Implement operator productivity analytics
- AH: Design team collaboration features (shared notes, tags)
- AI: Create operator coaching and feedback system

**Task AJ-AN: Customer Experience** (5 tasks)
- AJ: Design customer sentiment tracking and alerting
- AK: Create proactive support trigger system
- AL: Implement customer journey tracking in conversations
- AM: Design VIP customer experience workflows
- AN: Create post-conversation customer engagement automation

**Task AO-AR: Integration & Data** (5 tasks)
- AO: Design Chatwoot-to-CRM data sync
- AP: Create conversation data export and archiving
- AQ: Implement real-time conversation analytics
- AR: Design conversation reporting and dashboards

Execute Z-AR in any order. Total: 42 tasks, ~20-25 hours work.
