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
