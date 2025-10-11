---
epoch: 2025.10.E1
doc: docs/directions/marketing.md
owner: manager
last_reviewed: 2025-10-12
doc_hash: TBD
expires: 2025-10-19
---
# Marketing — Direction (Operator Control Center)
## Canon
- North Star: docs/NORTH_STAR.md
- Git & Delivery Protocol: docs/git_protocol.md
- Direction Governance: docs/directions/README.md
- MCP Allowlist: docs/policies/mcp-allowlist.json
- Credential Map: docs/ops/credential_index.md
- Agent Launch Checklist (manager executed): docs/runbooks/agent_launch_checklist.md

> Manager authored. Marketing must not create or alter direction docs; channel updates through manager with evidence.

## Local Execution Policy (Auto-Run)

You may run local, non-interactive commands (build docs, export assets) without approval. Guardrails:

- Scope: local repo assets and docs; no remote infra or git mutations under auto-run.
- Non-interactive: disable pagers; avoid interactive prompts.
- Evidence: log timestamp, command, outputs in feedback/marketing.md; store assets under artifacts/marketing/.
- Secrets: never print values; reference names only.
- Retry: 2 attempts then escalate with logs.

- Partner with product to script launch comms; draft release notes + in-admin tooltips tied to each tile milestone.
- Own social sentiment integration backlog; document API contracts and vendor approvals before build.
- Provide weekly campaign calendar / KPI targets so dashboard tiles can surface relevant metrics.
- Supply copy variations and brand tone guidance; attach evidence (style guide, approvals) to feedback/marketing.md.
- Coordinate with designer to keep operator-facing copy aligned with approved decks; maintain English-only messaging until new locales are approved.
- Stack guardrails: ensure all messaging reflects the canonical toolkit (`docs/directions/README.md#canonical-toolkit--secrets`)—Supabase backend, Chatwoot on Supabase, React Router 7 UI, OpenAI + LlamaIndex AI posture.
- When planning storefront campaigns, coordinate with docs/dev/webpixels-shopify.md for tracking and docs/dev/adminext-shopify.md for Admin surfaces.
- Track adoption metrics post-launch and synthesize operator testimonials for roadmap decisions.
- Start executing assigned tasks immediately; log progress and blockers in `feedback/marketing.md` without waiting for additional manager confirmation.

## Current Sprint Focus — 2025-10-12
Work through these items now and document progress in `feedback/marketing.md`; include timestamps, approvals, and the assets you deliver. If a dependency blocks you, schedule the follow-up and chase it until closed rather than handing it off.

## Aligned Task List — 2025-10-11 (Updated: Accelerated Delivery)

**Reference Docs**:
- docs/AgentSDKopenAI.md - Agent capabilities for messaging
- feedback/manager-2025-10-11-agentsdk-decision.md - ROI and value propositions

**Tasks in Priority Order** (execute sequentially, log blockers in feedback/marketing.md and continue):

1. ✅ **Launch Communications Update** - COMPLETE (2025-10-11)
   - Updated with customer.support@hotrodan.com
   - CLI dev rehearsal documented
   - Evidence: feedback/marketing.md

2. **AI-Assisted Support Announcement** - Draft messaging for Agent SDK launch
   - Create announcement for AI-assisted customer support
   - Document benefits: faster response times, 24/7 availability, consistent quality
   - Address common concerns: "AI will have human oversight", "Operators approve all actions"
   - Create FAQ for customer questions
   - Evidence: Announcement draft and FAQ

3. **Operator Value Proposition** - Internal messaging for approval queue
   - Draft internal announcement of approval queue feature
   - Highlight efficiency gains (automation + oversight)
   - Create "What's New" guide for operators
   - Document training timeline
   - Evidence: Internal messaging documents

4. **Pilot Customer Communication** - Messaging for beta customers
   - Draft opt-in messaging for pilot customers
   - Create pilot program description
   - Document what customers should expect
   - Prepare feedback collection mechanism
   - Coordinate: Tag @support for customer communication review
   - Evidence: Pilot customer messaging

5. **Launch Asset Preparation** - Create all launch materials
   - Design social media announcement posts
   - Create email announcement template
   - Prepare blog post draft about AI features
   - Assemble screenshot/demo assets
   - Evidence: Launch asset package

6. **Competitive Positioning** - Position Agent SDK as differentiator
   - Research competitor AI support offerings
   - Document HotDash unique value (human oversight, Shopify-native, approval queue)
   - Create comparison messaging
   - Prepare case study framework
   - Evidence: Positioning document

**Ongoing Requirements**:
- Coordinate with @product on roadmap messaging
- Tag @support for operator communication review
- Log all messaging drafts in feedback/marketing.md

---

### 🚀 EXECUTE REMAINING TASKS (Tasks 2-6 Ready)

**Continue execution sequence**:

**Task 2: AI-Assisted Support Announcement** - Draft messaging (1 hour)
- Create announcement for Agent SDK launch
- Document benefits and address concerns
- Create customer FAQ
- Evidence: Announcement and FAQ

**Tasks 3-6**: Execute in order per direction above

**ALSO - Additional Parallel Work**:

**Task A: Case Study Framework** - Prepare success story template
- Create template for customer success stories
- Document metrics to capture
- Prepare interview questions
- Evidence: Case study template

**Task B: Competitive Intelligence** - Deep dive on AI support
- Research top 5 competitor AI support tools
- Document feature comparison
- Identify differentiation opportunities
- Evidence: Competitive analysis report

Execute Tasks 2-6, plus A and B. All ready to go.

---

### 🚀 EXPANDED TASK LIST (2x Capacity for Fast Agent)

**Task C: Video Content Scripts**
- Create video script for Agent SDK demo (2-3 minutes)
- Write walkthrough script for approval queue tutorial
- Create "How it Works" explainer script
- Document visual requirements for video team
- Evidence: 3 video scripts ready for production

**Task D: Social Media Campaign Plan**
- Create 30-day social media content calendar for Agent SDK launch
- Draft posts for LinkedIn, Twitter, Instagram
- Design engagement strategy (polls, Q&A, testimonials)
- Create hashtag strategy
- Evidence: Content calendar with 30+ posts drafted

**Task E: Press Release Draft**
- Write press release for Agent SDK launch
- Highlight innovation (human-in-loop AI, Shopify-native)
- Include quotes from CEO/operators
- Create distribution list
- Evidence: Press release draft

**Task F: Partner/Affiliate Messaging**
- Create partner announcement for Agent SDK
- Document co-marketing opportunities
- Draft affiliate promotion materials
- Create partner FAQ
- Evidence: Partner messaging package

**Task G: Customer Success Story Framework**
- Create interview guide for pilot customers
- Design metrics tracking for success stories
- Draft case study template
- Plan customer testimonial collection
- Evidence: Success story framework

**Task H: Internal Launch Communication**
- Draft all-hands announcement
- Create celebration plan for launch day
- Design internal recognition for team
- Document lessons learned capture process
- Evidence: Internal communication plan

**Task I: SEO/Content Strategy**
- Create blog post series plan (AI support, automation, efficiency)
- Draft 3 blog posts about Agent SDK features
- Optimize for SEO keywords
- Plan content distribution
- Evidence: 3 blog post drafts, SEO strategy

**Task J: Email Campaign Series**
- Design email sequence for Agent SDK announcement (5 emails)
- Create segmentation strategy (customers, prospects, partners)
- Draft subject lines and preview text
- Plan send schedule
- Evidence: Email campaign series

Execute C-J in priority order or parallel - all ready for execution.

---

### 🚀 MASSIVE EXPANSION (5x Capacity) - 20 Additional Tasks

**Task K-Z: Comprehensive Marketing Campaign Development**

**K-N: Content Creation** (4 tasks)
- K: Create 10 LinkedIn thought leadership articles about AI + support automation
- L: Draft 5 customer education webinar scripts
- M: Write 15 help center articles about Agent SDK features
- N: Create operator success story interview templates

**O-R: Digital Marketing** (4 tasks)
- O: Design complete Google Ads campaign (search + display)
- P: Create retargeting campaign strategy
- Q: Develop influencer partnership program for Shopify ecosystem
- R: Build affiliate marketing program with commission structure

**S-V: Community & PR** (4 tasks)
- S: Create community engagement program (forums, Discord, Slack)
- T: Draft analyst briefing materials (Gartner, Forrester)
- U: Design customer advisory board program
- V: Create press kit with media assets

**W-Z: Brand & Positioning** (4 tasks)
- W: Develop brand style guide for all Agent SDK communications
- X: Create competitive battle cards for sales team (vs 10 competitors)
- Y: Design customer testimonial collection and showcase program
- Z: Build ROI calculator tool for prospects

**AA-AE: Launch Mechanics** (5 tasks)
- AA: Create detailed launch day runbook (hour-by-hour)
- AB: Design post-launch communication cadence (D+1, D+7, D+30)
- AC: Build customer adoption tracking dashboard
- AD: Create upsell/cross-sell messaging for existing customers
- AE: Design referral program for Agent SDK users

Execute K-AE in any order. Total: 34 tasks, ~20 hours of marketing work.
