---
epoch: 2025.10.E1
doc: docs/directions/support.md
owner: manager
last_reviewed: 2025-10-10
doc_hash: TBD
expires: 2025-10-17
---
# Support — Direction (Operator Control Center)
## Canon
- North Star: docs/NORTH_STAR.md
- Git & Delivery Protocol: docs/git_protocol.md
- Direction Governance: docs/directions/README.md
- MCP Allowlist: docs/policies/mcp-allowlist.json
- Credential Map: docs/ops/credential_index.md
- Agent Launch Checklist (manager executed): docs/runbooks/agent_launch_checklist.md

> Manager authored. Support must not produce or edit direction documents; submit evidence-backed change requests via manager.

## Local Execution Policy (Auto-Run)

You may run local, non-interactive commands and scripts without approval. Guardrails:

- Scope: local repo and local Supabase; no remote infra changes under auto-run. Status checks are fine.
- Non-interactive: disable pagers; avoid interactive prompts.
- Evidence: log timestamp, command, outputs in feedback/support.md; store under artifacts/support/.
- Secrets: load from vault/env; never print values.
- Tooling: npx supabase for local; git/gh with --no-pager; prefer rg else grep -nE.
- Retry: up to 2 attempts; then escalate with logs.

- Maintain playbooks for operator escalations; map each CX tile action to internal SOP and escalation ladder.
- Ensure Chatwoot templates stay current; review daily with AI/engineer and log updates in Memory (scope `ops`).
- Train support reps on dashboard workflows; capture Q&A and file tickets for confusing states.
- Gather operator feedback; funnel critical gaps into product backlog with evidence (screenshots, timestamps).
- Monitor integrations post-release; alert reliability if errors breach thresholds or SLAs slip.
- Stack guardrails: ensure every playbook references the canonical toolkit (`docs/directions/README.md#canonical-toolkit--secrets`)—Supabase backend, Chatwoot on Supabase, React Router 7, OpenAI/LlamaIndex posture; remove legacy tool references.
- For customer workflows, coordinate with docs/dev/storefront-mcp.md and consult docs/dev/webpixels-shopify.md before deploying tracking scripts.
- Keep feedback/support.md updated with incidents, resolution time, and follow-up tasks.
- Start executing assigned tasks immediately; log progress and blockers in `feedback/support.md` without waiting for additional manager approval.

## Current Sprint Focus — 2025-10-10
Own each item to completion—do not wait for other teams to close loops. Log the command, artifact, or outreach (with timestamp) for every task in `feedback/support.md`, and follow up until blockers clear.

## Aligned Task List — 2025-10-11 (Updated: Accelerated Delivery)

**Reference Docs**:
- docs/AgentSDKopenAI.md - Section 13 for training loop and feedback collection
- docs/runbooks/operator_training_qa_template.md

**Tasks in Priority Order** (execute sequentially, log blockers in feedback/support.md and continue):

1. ✅ **Support Inbox Audit** - COMPLETE (2025-10-11)
   - Verified 112 references to customer.support@hotrodan.com
   - All references consistent
   - Evidence: artifacts/support/logs/inbox-references.log

2. **Knowledge Base Content Preparation** - ✅ REASSIGNED TO AI AGENT

   **Manager Decision (2025-10-11T21:45Z)**: Task reassigned to @ai agent (better suited for content creation)
   
   **Your Action**: **SKIP to Task 3** - Your operational expertise more valuable on operator training
   
   **Optional**: Review KB content quality after @ai creates it, provide operator perspective

3. **Operator Training for Agent SDK** - Create training materials for approval queue
   - Update operator_training_qa_template.md with Agent SDK workflows
   - Document how to review approval requests
   - Create decision guide for approve vs reject
   - Document escalation procedures
   - Add FAQ for agent automation
   - Evidence: Training materials updated

4. **Agent Response Quality Guidelines** - Define standards for AI responses
   - Create rubric for evaluating agent responses (factuality, helpfulness, tone, policy alignment)
   - Document brand voice guidelines for customer communication
   - Define what requires human approval vs auto-send (if applicable)
   - Create examples of good vs bad responses
   - Evidence: Quality guidelines document

5. **Feedback Collection Process** - Set up operator feedback mechanism
   - Design form/process for operators to rate agent responses
   - Document how to submit corrections/improvements
   - Create workflow for flagging good responses for training data
   - Coordinate: Tag @data for feedback storage schema
   - Evidence: Feedback process documented

6. **Pilot Customer Communication** - Prepare for pilot rollout
   - Draft customer communication about AI-assisted support
   - Create opt-in messaging
   - Prepare FAQ for customer concerns
   - Document customer escalation path
   - Evidence: Communication templates

**Ongoing Requirements**:
- Coordinate with @chatwoot on conversation workflows
- Tag @ai for content ingestion coordination
- Log all training materials in feedback/support.md

---

### 🚀 EXECUTE TASK 2 IMMEDIATELY (Critical for LlamaIndex RAG)

**Task 2: Knowledge Base Content Preparation** - URGENT for AI agent

Create comprehensive support content:
- data/support/shipping-policy.md (return window, procedures, costs)
- data/support/refund-policy.md (eligibility, process, timelines)
- data/support/product-troubleshooting.md (common issues, solutions)
- data/support/order-tracking.md (how to track, common delays)
- data/support/exchange-process.md (eligibility, steps)
- data/support/common-questions-faq.md (top 20 customer questions)

**Format**: Markdown, clear sections, scannable by LlamaIndex

**Timeline**: 2-3 hours for comprehensive content

**Coordinate**: Tag @ai when complete for ingestion

**Evidence**: 6+ content files created in data/support/

---

### 🚀 ADDITIONAL PARALLEL TASKS

**Task A: Operator Training Materials** - Update for Agent SDK
- Update operator_training_qa_template.md
- Add Agent SDK approval queue workflows
- Document decision guide for approvals
- Evidence: Training materials ready

Execute Task 2 FIRST (AI needs it), then Task A.

---

### 🚀 EXPANDED TASK LIST (2x Capacity for Fast Agent)

**Task 7: Customer Support Escalation Matrix**
- Create detailed escalation procedures for all issue types
- Document when to escalate vs resolve with agents
- Define SLA thresholds for escalations
- Create escalation flowchart
- Evidence: Escalation matrix document

**Task 8: Support Metrics Tracking Design**
- Define support metrics to track (CSAT, response time, resolution rate)
- Design metrics collection process
- Create reporting dashboard specification
- Plan for metric-driven improvements
- Evidence: Metrics tracking framework

**Task 9: Customer Communication Templates**
- Create email templates for common scenarios
- Design chat response templates
- Document tone and style guidelines
- Create template library for operators
- Evidence: Complete template library

**Task 10: Support Knowledge Base Organization**
- Organize existing support content by category
- Create tagging and categorization system
- Design search and retrieval workflow
- Plan for knowledge base maintenance
- Evidence: KB organization framework

**Task 11: Operator Efficiency Analysis**
- Analyze current operator time allocation
- Identify time-consuming tasks for automation
- Calculate potential efficiency gains
- Create efficiency improvement roadmap
- Evidence: Efficiency analysis report

**Task 12: Customer Feedback Loop Design**
- Design customer satisfaction survey system
- Create feedback collection workflow
- Plan for feedback analysis and action
- Document continuous improvement process
- Evidence: Feedback loop design

Execute 7-12 in any order - all improve support operations.

---

### 🚀 MASSIVE EXPANSION (5x Capacity) - 18 Additional Tasks

**Task 13-18: Advanced Support Operations** (6 tasks)
- 13: Design proactive support system (detect issues before customers report)
- 14: Create customer health monitoring dashboard
- 15: Implement support ticket prioritization algorithm
- 16: Design self-service support portal
- 17: Create support chatbot for common questions (pre-Agent SDK)
- 18: Plan omnichannel support strategy (email, chat, phone, social)

**Task 19-24: Quality & Performance** (6 tasks)
- 19: Design quality assurance program for support interactions
- 20: Create mystery shopper program for support quality
- 21: Implement support interaction recording and review system
- 22: Design peer review process for support responses
- 23: Create support quality scorecard and benchmarks
- 24: Plan continuous improvement program based on metrics

**Task 25-30: Customer Experience** (6 tasks)
- 25: Design VIP customer support program
- 26: Create customer loyalty program integration with support
- 27: Implement customer effort score (CES) measurement
- 28: Design post-resolution follow-up automation
- 29: Create customer win-back program for churned customers
- 30: Plan support-driven upsell and cross-sell opportunities

Execute 13-30 in any order. Total: 30 tasks, ~18-20 hours of support strategy work.

---

### 📋 MANAGER CLARIFICATION (2025-10-11T22:05Z)

**Your Question**: Which tasks to execute?

**Answer**: ✅ **Option B - Execute numbered Tasks 3-30 in "Aligned Task List" section**

**What to Ignore**: Lines 31-38 (general responsibilities - context only, NOT tasks)

**What to Execute**: Lines 50-209 (numbered Tasks 1-30 - your actual work)

**Current Status**: 
- Task 1: ✅ Done
- Task 2: ⏩ Skipped (reassigned to @ai)
- **Task 3**: ➡️ **START HERE** (Operator training for Agent SDK)

---

### 🚀 SECOND MASSIVE EXPANSION (Another 15 Tasks)

**Task 31-36: Support Automation Design** (6 tasks)
- 31: Design intelligent ticket routing based on conversation analysis
- 32: Create automated response suggestion system for operators
- 33: Design support workload balancing and distribution
- 34: Create automated follow-up reminders for operators
- 35: Design conversation summary generation for handoffs
- 36: Create support team collaboration tools

**Task 37-42: Customer Experience Programs** (6 tasks)
- 37: Design customer onboarding support program
- 38: Create proactive outreach program for at-risk customers
- 39: Design customer education content series
- 40: Create support-to-sales handoff process
- 41: Design customer feedback analysis and action system
- 42: Create customer success milestone celebration program

**Task 43-45: Support Analytics** (3 tasks)
- 43: Design support forecasting model (volume, staffing needs)
- 44: Create cost-per-ticket analysis framework
- 45: Design support ROI measurement system

Execute 31-45 in any order. Total: 45 tasks, ~25-30 hours work.
