---
epoch: 2025.10.E1
doc: docs/directions/product.md
owner: manager
last_reviewed: 2025-10-12
doc_hash: TBD
expires: 2025-10-19
---

# Product — Direction (Operator Control Center)

## Canon

- North Star: docs/NORTH_STAR.md
- Git & Delivery Protocol: docs/git_protocol.md
- Direction Governance: docs/directions/README.md
- MCP Allowlist: docs/policies/mcp-allowlist.json
- Credential Map: docs/ops/credential_index.md
- Agent Launch Checklist (manager executed): docs/runbooks/agent_launch_checklist.md

> Manager authored. Submit evidence-backed change requests to manager; do not create new direction artifacts.

## Local Execution Policy (Auto-Run)

You may run local, non-interactive commands without approval. Guardrails:

- Scope: local repo and analysis scripts; no remote infra or git mutations under auto-run.
- Non-interactive: disable pagers; avoid interactive prompts.
- Evidence: log timestamp, command, outputs in feedback/product.md.
- Secrets: load from vault/env; never print values.
- Retry: 2 attempts then escalate with logs.

- Own outcome roadmap: prioritize tile molecules by operator impact; keep living backlog in Linear with evidence links.
- Define success metrics (activation rate, SLA resolution time, anomaly response) and ensure telemetry stories land in each sprint.
- Run weekly customer calls; capture quotes + decisions in packages/memory (scope `ops`).
- Coordinate release reviews: mock → staging → production with artifact bundle (tests, metrics, comms) before go/no-go.
- Keep docs/strategy updated when scope shifts; flag scope creep or dependency risk in manager feedback daily.
- Stack guardrails: ensure roadmap, comms, and approvals align with `docs/directions/README.md#canonical-toolkit--secrets` (Supabase-only backend, Chatwoot on Supabase, React Router 7, OpenAI + LlamaIndex); reject proposals that diverge.
- Keep Shopify documentation close: docs/dev/appreact.md, docs/dev/admin-graphql.md, docs/dev/adminext-shopify.md, docs/dev/storefront-mcp.md to ensure roadmap decisions align with platform capabilities.
- Approve copy/UX changes only with paired evidence from designer + engineer (screenshot + test).
- Start executing assigned tasks immediately; record progress and blockers in `feedback/product.md` without waiting for additional manager approval.

## Current Sprint Focus — 2025-10-12

Work each item to completion and log progress in `feedback/product.md`, including timestamps, evidence links, and next actions. If a dependency blocks you, schedule the follow-up and chase it until resolved instead of reassigning it.

## Aligned Task List — 2025-10-11 (Updated: Accelerated Delivery)

**Reference Docs**:

- docs/AgentSDKopenAI.md - Agent capabilities and features
- feedback/manager-2025-10-11-agentsdk-decision.md - Strategic decisions and ROI

**Tasks in Priority Order** (execute sequentially, log blockers in feedback/product.md and continue):

1. **Agent SDK Success Metrics Definition** - Define KPIs for rollout
   - Document baseline metrics (manual support time-to-resolution, volume)
   - Define Agent SDK success metrics (first-time resolution rate, approval queue depth, operator satisfaction)
   - Set targets: 50% first-time resolution, <30s approval latency, >80% operator satisfaction
   - Create measurement framework
   - Evidence: Metrics document with baselines and targets

2. **Roadmap Update for Agent SDK** - Update product roadmap
   - Add Agent SDK timeline (3-4 days to pilot)
   - Document LlamaIndex MCP capabilities
   - Plan approval queue iterations
   - Update stakeholder communications with timeline
   - Evidence: Updated roadmap document

3. **Operator Workflow Analysis** - Map efficiency improvements
   - Document current manual support workflow (steps, time)
   - Identify automation opportunities
   - Calculate time savings with Agent SDK
   - Document ROI projections
   - Evidence: Workflow analysis with time savings calculations

4. **Pilot Rollout Plan** - Define pilot scope and success criteria
   - Select 5-10 beta customers for pilot
   - Create pilot communication plan
   - Define pilot success criteria
   - Plan gradual rollout phases
   - Document learnings capture process
   - Evidence: Pilot plan document

5. **Feature Iteration Roadmap** - Plan post-pilot improvements
   - Document Phase 2 feature requests (based on approval queue patterns)
   - Plan agent capability expansions
   - Define when to relax approval gates
   - Create product backlog
   - Evidence: Feature roadmap

6. **Release Communication Plan** - Coordinate with Marketing
   - Review launch messaging (coordinate with @marketing)
   - Approve customer-facing copy
   - Define success announcement criteria
   - Plan internal celebration/learnings session
   - Evidence: Communication plan approved

**Ongoing Requirements**:

- Track metrics as Agent SDK rolls out
- Coordinate with @marketing on messaging
- Log all product decisions in feedback/product.md

---

### 🚀 EXECUTE REMAINING TASKS (All 6 tasks ready)

**Since all research complete, now execute implementation tasks**:

**Task 2: Roadmap Update** - Update with Agent SDK timeline (30 min)

- Add Agent SDK to product roadmap with 3-4 day timeline
- Document feature capabilities
- Update stakeholder communication
- Evidence: Updated roadmap

**Task 3: Operator Workflow Analysis** - Calculate ROI (1 hour)

- Document current manual workflow timing
- Calculate time savings with automation
- Project ROI metrics
- Evidence: Workflow analysis with ROI

**Task 4: Pilot Rollout Plan** - Define pilot parameters (1 hour)

- Select 5-10 beta customers
- Create pilot criteria
- Plan gradual rollout
- Evidence: Pilot plan

**Task 5: Feature Iteration Roadmap** - Plan Phase 2 (30 min)

- Document post-pilot improvements
- Plan agent capability expansions
- Evidence: Feature backlog

**Task 6: Release Communication Plan** - Coordinate with Marketing (30 min)

- Review messaging with @marketing
- Approve copy
- Evidence: Communication plan

Execute Tasks 2-6 in order. Total time: ~3-4 hours.

---

### 🚀 EXPANDED TASK LIST (2x Capacity for Fast Agent)

**Task 7: Agent Performance Dashboard Design**

- Design operator dashboard for agent metrics
- Define KPIs to visualize (approval rate, response time, accuracy)
- Create wireframes for metrics tiles
- Coordinate with @designer for UI specs
- Evidence: Dashboard design document

**Task 8: Customer Journey Mapping**

- Map customer journey with AI-assisted support
- Identify touchpoints for automation
- Document pain points and solutions
- Create journey visualization
- Evidence: Customer journey map

**Task 9: Competitive Feature Analysis**

- Deep dive on competitor AI support features
- Document feature parity matrix
- Identify must-have vs nice-to-have features
- Prioritize roadmap based on competitive positioning
- Evidence: Competitive analysis with priorities

**Task 10: Agent Capability Expansion Planning**

- Plan additional agent types (billing, technical support, pre-sales)
- Document capabilities for each agent type
- Estimate development effort
- Create phased rollout plan
- Evidence: Agent expansion roadmap

**Task 11: Pricing Strategy for AI Features**

- Research market pricing for AI support automation
- Design pricing tiers (if applicable)
- Calculate value-based pricing
- Document pricing justification
- Evidence: Pricing strategy document

**Task 12: Success Metrics Dashboard Specification**

- Define all metrics to track for Agent SDK
- Create dashboard specification for operators
- Design alerts and thresholds
- Plan for metric visualization
- Evidence: Metrics dashboard spec

Execute 7-12 in any order - all valuable strategic work.

---

### 🚀 MASSIVE EXPANSION (5x Capacity) - 18 Additional Tasks

**Task 13-18: Strategic Planning** (6 tasks)

- 13: Create 12-month product vision document
- 14: Design multi-tenant architecture strategy
- 15: Plan white-label offering for agencies
- 16: Create API product strategy (public API for customers)
- 17: Design marketplace/app store for HotDash extensions
- 18: Plan international expansion strategy

**Task 19-24: Customer Success** (6 tasks)

- 19: Design customer health scoring system
- 20: Create customer lifecycle management framework
- 21: Plan proactive customer success interventions
- 22: Design customer education program
- 23: Create customer community building strategy
- 24: Plan customer advocacy program

**Task 25-30: Revenue & Growth** (6 tasks)

- 25: Design upsell and cross-sell strategies
- 26: Create packaging and bundling strategy
- 27: Plan partnership and channel strategy
- 28: Design freemium to paid conversion funnel
- 29: Create enterprise sales enablement materials
- 30: Plan usage-based pricing model

Execute 13-30 in any order. Total: 30 tasks, ~18-20 hours of strategic work.

---

### 🚀 THIRD MASSIVE EXPANSION (Another 25 Tasks)

**Task 31-38: Market Expansion** (8 tasks)

- 31: Design vertical-specific offerings (retail, B2B, services)
- 32: Create industry solution packages
- 33: Plan geographic expansion strategy (EMEA, APAC)
- 34: Design reseller and VAR program
- 35: Create platform partnership strategy (Shopify Plus, BigCommerce)
- 36: Plan industry analyst relations program
- 37: Design thought leadership content strategy
- 38: Create market research and customer insights program

**Task 39-46: Product Innovation** (8 tasks)

- 39: Design AI-powered predictive analytics features
- 40: Create automated workflow builder for operators
- 41: Plan integration with emerging Shopify features
- 42: Design proactive issue detection system
- 43: Create customer journey orchestration platform
- 44: Plan omnichannel customer experience suite
- 45: Design conversation intelligence platform
- 46: Create revenue optimization recommendations engine

**Task 47-55: Business Development** (9 tasks)

- 47: Design enterprise sales process and materials
- 48: Create channel partner program
- 49: Plan strategic alliance partnerships
- 50: Design co-marketing programs with vendors
- 51: Create customer advisory board structure
- 52: Plan industry conference and event strategy
- 53: Design analyst relations program (Gartner MQ positioning)
- 54: Create product-led growth strategy
- 55: Design viral and referral growth mechanisms

Execute 31-55 in any order. Total: 55 tasks, ~30-35 hours work.

---

### 🚀 FIFTH MASSIVE EXPANSION (Another 30 Tasks)

**Task 56-65: Platform Strategy** (10 tasks)

- 56: Design API-first product architecture
- 57: Create developer platform and ecosystem strategy
- 58: Plan embedded analytics offering for customers
- 59: Design white-label platform capabilities
- 60: Create multi-product bundle strategy
- 61: Plan AI-as-a-service offering
- 62: Design vertical SaaS expansion
- 63: Create platform network effects strategy
- 64: Plan marketplace and app ecosystem
- 65: Design platform governance model

**Task 66-75: Customer Intelligence** (10 tasks)

- 66: Create customer data platform (CDP) strategy
- 67: Design customer 360 view implementation
- 68: Plan customer segmentation and targeting
- 69: Create customer lifetime value modeling
- 70: Design churn prediction and prevention
- 71: Plan customer engagement scoring
- 72: Create next-best-action recommendation engine
- 73: Design customer feedback loop automation
- 74: Plan voice-of-customer program
- 75: Create customer insights distribution system

**Task 76-85: Operational Excellence** (10 tasks)

- 76: Design product ops framework
- 77: Create product analytics instrumentation strategy
- 78: Plan experimentation platform (A/B testing at scale)
- 79: Design product quality metrics framework
- 80: Create technical debt management system
- 81: Plan platform reliability engineering
- 82: Design incident management for product
- 83: Create product documentation automation
- 84: Plan product training and certification
- 85: Design product feedback synthesis system

Execute 56-85 in any order. Total: 85 tasks, ~45-50 hours work.

---

### 🚀 SEVENTH MASSIVE EXPANSION (Another 30 Tasks)

**Task 86-93: Product Analytics & Insights** (8 tasks)

- 86: Design product analytics instrumentation strategy
- 87: Create user behavior analysis framework
- 88: Implement cohort analysis and segmentation
- 89: Design funnel optimization methodology
- 90: Create retention analysis and prediction
- 91: Implement feature usage analytics
- 92: Design A/B testing platform
- 93: Create product insights distribution system

**Task 94-101: Product Operations** (8 tasks)

- 94: Design product operations framework
- 95: Create product launch checklist automation
- 96: Implement product health monitoring
- 97: Design incident response for product issues
- 98: Create product documentation system
- 99: Implement product change management
- 100: Design product dependency tracking
- 101: Create product technical debt management

**Task 102-109: Customer Research** (8 tasks)

- 102: Design continuous discovery program
- 103: Create user research repository
- 104: Implement customer interview framework
- 105: Design survey and feedback automation
- 106: Create usability testing program
- 107: Implement customer journey analytics
- 108: Design customer empathy initiatives
- 109: Create research synthesis and distribution

**Task 110-115: Strategic Planning** (6 tasks)

- 110: Design quarterly planning process
- 111: Create OKR framework and tracking
- 112: Implement strategic initiative management
- 113: Design investment prioritization framework
- 114: Create competitive intelligence system
- 115: Implement scenario planning and modeling

Execute 86-115 in any order. Total: 115 tasks, ~60-65 hours work.

---

### 📋 EVIDENCE REQUIREMENT REMINDER (2025-10-11T22:35Z)

**QA validates all completed tasks - provide proof**:

- ✅ Document paths: `docs/strategy/market-expansion.md (sections: A, B, C)`
- ✅ Artifacts: `artifacts/product/roadmap-2025-q4.pdf`
- ✅ Spreadsheet/analysis: `artifacts/product/pricing-model.xlsx (3 scenarios)`
- ✅ Review status: `Reviewed with 3 stakeholders on 2025-10-11`

**NOT Acceptable**: "Strategy complete", "Analysis done", "Document ready"

### 2025-10-11 Execution Snapshot

- 2025-10-11T08:12Z — Logged sanitized history push hash `af1d9f1` plus “no rotation” posture in Linear (`DEPLOY-147`) and Memory (scope `ops`); DEPLOY-147 impact now highlights QA smoke evidence, Playwright rerun, embed-token confirmation, and nightly AI logging sync as gating items.
- 2025-10-11T11:05Z — Reliability reconfirmed existing Supabase credentials in service; call recorded in Linear comments, Memory recap, SCC/DPA escalation threads, and the nightly AI logging/index plan.
- SCC/DPA escalations: compliance/legal tracking paused schedule, requested embed-token readiness timestamps, and expect nightly AI logging/index cadence summaries embedded in the shared evidence plan alongside QA updates.
- Backlog freeze reaffirmed: all DEPLOY/OCC tickets stay in `Blocked` until QA’s sub-300 ms `?mock=0` proof, Playwright rerun, embed-token readiness signal, and matching AI logging artifacts land; stakeholders remain on hold per #occ-stakeholders update.
- Operator dry-run pre-read polished: tightened success metrics, evidence capture checklist, and attendee logistics in `docs/strategy/operator_dry_run_pre_read_draft.md`; ready to publish alongside Memory/Linear updates the moment staging access and embed token clear.
- Backup work active: aligning nightly AI logging/index summaries, prepping Memory template, and coordinating enablement/support comms so the pre-read ships immediately when QA evidence unlocks DEPLOY-147.
- 2025-10-11T14:05Z — Logged SCC/DPA escalation touchpoint with compliance/legal; shared latest embed-token status + QA blocker summary and captured next follow-up in Memory.
- 2025-10-11T14:12Z — Synced with AI/data on nightly logging + index cadence; verified latest regression bundle and index metadata ready for DEPLOY-147 evidence once QA unblocks.
- 2025-10-11T14:25Z — Finalized dry-run pre-read edits (checklist, metrics, stakeholder notes) and staged publication steps so we can push to Memory/#occ-product immediately after staging access opens.

---

## 🚨 LAUNCH CRITICAL REFOCUS (2025-10-11T22:50Z)

**CEO Decision**: Emergency refocus on launch gates

**Your Status**: PAUSED - Resume post-launch planning after launch gates complete

**Why PAUSED**: Your 115 tasks are strategic/post-launch work. Launch gates require technical implementation (Engineer, QA, Designer).

**When to Resume**: After all 7 launch gates complete (~48-72 hours)

**What You've Accomplished**: Comprehensive product strategy, roadmaps, GTM plans - all excellent work that positions us for post-launch success.

**Stand By For**: Pilot customer feedback, metrics analysis, post-launch iteration planning

---

**Your 115 tasks remain in direction file - will resume after launch.**

---

## ✅ RESUME WORK (2025-10-11T23:20Z)

**Engineer Progress**: 5/7 launch gates complete! 🎉

**Your Status**: Resume your paused tasks - no idle agents

**Rationale**: Engineer making excellent progress. While they finish last 2 gates, you can continue valuable post-launch work.

**Your Tasks**: Resume where you left off in your expanded task list

**Evidence**: Continue providing file paths, test results, documentation per QA standards

**Coordinate**: Support launch if needed, otherwise continue your strategic work

**Timeline**: Work until launch gates 100% complete, then shift to launch support/iteration

---

## 📋 HOT RODAN LAUNCH-SPECIFIC TASKS (Tasks 115A-115P)

### 🚀 IMMEDIATE HOT RODAN LAUNCH TASKS (Do First: 115A-115E)

**Task 115A**: Hot Rodan Quick Start Guide for CEO

- 1-page "How to Use Your Dashboard" guide
- Screenshots of each tile with explanations
- Common workflows (review approvals, check daily metrics)
- Evidence: Quick start guide (docs/pilot/hot-rodan-quick-start.md)
- Timeline: 1-2 hours

**Task 115B**: Hot Rodan Pilot Briefing Document

- Goals for pilot launch
- Success criteria (what metrics to watch)
- Feedback collection process
- Timeline and milestones
- Evidence: Pilot briefing (docs/pilot/hot-rodan-pilot-brief.md)
- Timeline: 1-2 hours

**Task 115C**: Hot Rodan Weekly Check-In Template

- Structured questions for weekly pilot reviews
- Key metrics to discuss
- Issue tracking format
- Evidence: Check-in template (docs/pilot/weekly-checkin-template.md)
- Timeline: 1 hour

**Task 115D**: Hot Rodan Launch Runbook

- Pre-launch checklist
- Launch day procedures
- Post-launch monitoring
- Escalation paths
- Evidence: Launch runbook (docs/pilot/launch-runbook.md)
- Timeline: 2-3 hours

**Task 115E**: Hot Rodan Success Metrics Dashboard Spec

- Define 5-10 key metrics to track
- Dashboard layout and visualizations
- Data sources for each metric
- Evidence: Metrics dashboard spec (docs/pilot/success-metrics.md)
- Timeline: 2-3 hours

Execute 115A-115E first (Hot Rodan-specific), then 115F-115P below. Total: ~8-11 hours initial + 50-60 hours deep work.

---

## 📋 NEXT WAVE - DEEP PILOT EXECUTION (Tasks 115F-115P)

**Task 115F**: Pilot Operator Onboarding Plan

- Create detailed onboarding workflow for first Hot Rodan operators
- Day 1, Week 1, Month 1 milestones
- Success criteria per phase
- Evidence: Onboarding playbook
- Timeline: 2-3 hours

**Task 115G**: Dashboard Usage Analytics Framework

- Define metrics to track (tile usage, approval rate, time saved)
- Create measurement plan
- Set up tracking implementation requirements
- Evidence: Analytics framework document
- Timeline: 2-3 hours

**Task 115H**: Iteration Planning Framework

- Create rapid iteration process (weekly releases)
- Feedback → prioritization → implementation cycle
- Feature flag strategy
- Evidence: Iteration playbook
- Timeline: 2-3 hours

**Task 115I**: Hot Rodan Revenue Impact Model

- Model how dashboard drives $1MM → $10MM growth
- Calculate time savings → revenue impact
- Document assumptions and projections
- Evidence: Revenue impact spreadsheet
- Timeline: 3-4 hours

**Task 115J**: Competitive Positioning Strategy

- Position Hot Rodan Dashboard vs. generic SaaS tools
- Automotive-specific value props
- Unique differentiators for hot rod market
- Evidence: Positioning document
- Timeline: 2-3 hours

**Task 115K**: Feature Priority Matrix

- Prioritize future features by impact x effort
- Create roadmap for post-launch iterations
- Align with Hot Rodan growth goals
- Evidence: Feature matrix and roadmap
- Timeline: 2-3 hours

**Task 115L**: Pricing Strategy for Future

- Research pricing for similar tools
- Consider Hot Rodan's economics
- Design pricing tiers if needed
- Evidence: Pricing analysis
- Timeline: 2-3 hours

**Task 115M**: Pilot Success Playbook

- Define what "successful pilot" means
- Create decision criteria for full rollout
- Plan scale-up strategy
- Evidence: Success playbook
- Timeline: 2-3 hours

**Task 115N**: Risk Mitigation Plan

- Identify risks to pilot success
- Create mitigation strategies
- Define fallback plans
- Evidence: Risk register
- Timeline: 2-3 hours

**Task 115O**: Operator Productivity Metrics

- Define how to measure operator efficiency gains
- Create measurement methodology
- Set baseline and targets
- Evidence: Productivity measurement plan
- Timeline: 2-3 hours

**Task 115P**: Voice of Customer Program

- Create ongoing operator feedback collection
- Weekly check-ins structure
- Feedback synthesis process
- Evidence: VoC program design
- Timeline: 2-3 hours

Execute 115F-115P after 115A-115E. Total: ~80-95 hours Hot Rodan product work.
