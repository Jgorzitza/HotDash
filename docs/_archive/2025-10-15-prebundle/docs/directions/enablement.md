---
epoch: 2025.10.E1
doc: docs/directions/enablement.md
owner: manager
last_reviewed: 2025-10-12
doc_hash: TBD
expires: 2025-10-19
---

# Enablement — Direction (Operator Control Center)

## Canon

- North Star: docs/NORTH_STAR.md
- Git & Delivery Protocol: docs/git_protocol.md
- Direction Governance: docs/directions/README.md
- MCP Allowlist: docs/policies/mcp-allowlist.json
- Credential Map: docs/ops/credential_index.md
- Agent Launch Checklist (manager executed): docs/runbooks/agent_launch_checklist.md

> Manager authored. Enablement agent must not modify direction docs; request changes via the manager with supporting evidence.

## Local Execution Policy (Auto-Run)

You may run local, non-interactive commands to build docs and training artifacts without approval. Guardrails:

- Scope: local repo only; no remote infra or git mutations under auto-run.
- Non-interactive: disable pagers; avoid interactive prompts.
- Evidence: log timestamp, command, outputs in feedback/enablement.md; store artifacts under artifacts/enablement/.
- Secrets: load from vault/env; never print values.
- Retry: 2 attempts then escalate with logs.

- Own operator-facing documentation: runbooks, training guides, FAQs, and knowledge base notes live under `docs/runbooks/` and `docs/enablement/`.
- Keep all enablement materials English-only; coordinate with marketing, support, and product to ensure wording matches approved copy decks.
- Maintain the operator training agenda (`docs/runbooks/operator_training_agenda.md`) and ensure every dry run captures questions in the Q&A template.
- Publish quick-start job aids for each tile/modal, emphasizing decision flows, guardrails, and escalation paths; store artifacts in `docs/enablement/job_aids/`.
- Capture operator feedback from trainings or pilots and log summaries plus follow-up actions in `feedback/enablement.md`.
- Partner with support to keep escalation playbooks aligned to the latest code paths and approval heuristics.
- Stack guardrails: reinforce `docs/directions/README.md#canonical-toolkit--secrets` in every packet (Supabase backend, Chatwoot on Supabase, React Router 7 UI, OpenAI + LlamaIndex tooling); purge old references to Fly Postgres or Slack.
- Update training assets referencing docs/dev/adminext-shopify.md, docs/dev/storefront-mcp.md, docs/dev/webpixels-shopify.md.
- Start executing assigned tasks immediately; log progress and blockers in `feedback/enablement.md` without waiting for additional manager approval.

## Current Sprint Focus — 2025-10-12

Drive each deliverable to closure yourself; document artefacts, timestamps, and remaining follow-ups in `feedback/enablement.md`. If another team is required, open the loop and stay on it until the dependency is resolved.

## Aligned Task List — 2025-10-11 (Updated: Accelerated Delivery)

**Reference Docs**:

- docs/AgentSDKopenAI.md - Agent capabilities for training content
- docs/runbooks/operator_training_qa_template.md

**Tasks in Priority Order** (execute sequentially, log blockers in feedback/enablement.md and continue):

1. ✅ **Training Video Modules** - COMPLETE (2025-10-11)
   - 4 Loom modules created (18 min 25 sec total)
   - Ready for distribution
   - Evidence: feedback/enablement.md

## 🚨 P0 LAUNCH TRAINING (Minimal for Pilot)

2. **Quick Start Guide for Approval Queue** (Launch Gate #6)
   - Create 1-page guide: How to approve/reject agent actions
   - Document decision criteria
   - Basic escalation path
   - Evidence: Quick start guide PDF
   - Timeline: 2-4 hours
   - Status: ⏳ Ready once Engineer's UI live

**Immediate Prep Work** (Do while Engineer builds):

2A. **Training Session Outline**

- Create 30-minute pilot training agenda
- Write demo script (pending actual UI)
- Prepare talking points
- Create Q&A section structure
- Evidence: Session outline
- Timeline: 2-3 hours

2B. **Video Script for Approval Queue**

- Write script for Loom walkthrough
- Plan screen recording flow
- Prepare voiceover notes
- Evidence: Video script ready
- Timeline: 1-2 hours

2C. **Operator Onboarding Checklist**

- Create pre-pilot operator checklist
- Document access requirements
- Create account setup steps
- Evidence: Onboarding checklist
- Timeline: 1-2 hours

2D. **Training Effectiveness Measurement**

- Design quiz/assessment for operators
- Create knowledge check questions
- Plan hands-on practice scenarios
- Evidence: Assessment design
- Timeline: 2-3 hours

3. **30-Min Pilot Training Session** (After Engineer Task 6 complete)
   - Deliver training with actual UI
   - Record session
   - Collect operator feedback
   - Evidence: Session delivered
   - Timeline: Depends on UI availability

**DO FIRST**: Tasks 2A-2D (prep work while waiting for UI)

**THEN**: Tasks 2-3 when UI is ready

**PAUSE UNTIL AFTER LAUNCH**: Tasks 4-42 (all expanded enablement work)

---

## ✅ STATUS (2025-10-12T00:50Z)

**Your Report**: All launch training ready

**Manager Assignment**: Execute Tasks 2A-2D (session outline, video script, checklist, assessment)

**Timeline**: 6-10 hours of launch-aligned prep

Execute Tasks 2A-2D. Report evidence in feedback/enablement.md.

---

## 📋 ADDITIONAL LAUNCH-ALIGNED TASKS (In-Depth)

**Task 2E**: Hands-On Practice Scenarios

- Create practice approval scenarios for operators
- Use real Hot Rodan customer examples (anonymized)
- Design practice sessions
- Evidence: Practice scenario library
- Timeline: 2-3 hours

**Task 2F**: Troubleshooting Guide for Operators

- "What if dashboard is slow?"
- "What if AI suggestion seems wrong?"
- "What if approval doesn't send?"
- Evidence: Troubleshooting guide
- Timeline: 2-3 hours

**Task 2G**: Quick Reference Cards

- Laminated quick reference for each tile
- Decision trees for common scenarios
- Hotkey reference
- Evidence: Reference cards PDF
- Timeline: 2-3 hours

**Task 2H**: Video Demonstrations

- Record 5-min demo of each tile
- Show approval workflow
- Highlight key features
- Evidence: Video links
- Timeline: 3-4 hours

**Task 2I**: Operator Certification Program

- Design certification path for operators
- Create knowledge checks
- Badge/achievement system
- Evidence: Certification program design
- Timeline: 2-3 hours

Execute 2A-2I (all launch-training aligned). Total: ~20-25 hours work.

---

## 📋 NEXT WAVE - DEEP TRAINING PROGRAM (Tasks 2J-2T)

**Task 2J**: Advanced Operator Training Modules

- Tile mastery training (deep dive each tile)
- Advanced approval workflows
- Power user features
- Evidence: Advanced training modules
- Timeline: 3-4 hours

**Task 2K**: Hot Rod Product Knowledge Training

- Automotive parts education
- Common builds and applications
- Technical specifications training
- Evidence: Product knowledge course
- Timeline: 3-4 hours

**Task 2L**: Customer Service Excellence for Hot Rod Enthusiasts

- Understanding hot rod culture
- Enthusiast communication style
- Building community relationships
- Evidence: Customer service training
- Timeline: 2-3 hours

**Task 2M**: Dashboard Analytics Training

- How to read tile data
- Interpreting trends and alerts
- Making data-driven decisions
- Evidence: Analytics training module
- Timeline: 2-3 hours

**Task 2N**: AI Collaboration Training

- Working with AI suggestions
- When to trust vs. verify
- Providing feedback to improve AI
- Evidence: AI collaboration guide
- Timeline: 2-3 hours

**Task 2O**: Troubleshooting and Problem-Solving

- Common dashboard issues and fixes
- Escalation procedures
- Self-service resources
- Evidence: Troubleshooting training
- Timeline: 2-3 hours

**Task 2P**: Certification Assessment Design

- Create competency tests for operators
- Practical scenarios and case studies
- Certification badge program
- Evidence: Certification program
- Timeline: 2-3 hours

**Task 2Q**: Microlearning Content Library

- 5-minute training videos for specific features
- Just-in-time learning resources
- Mobile-friendly format
- Evidence: Microlearning library
- Timeline: 3-4 hours

**Task 2R**: New Operator Onboarding Path

- Week 1 training schedule
- Hands-on practice requirements
- Buddy system design
- Evidence: Onboarding program
- Timeline: 2-3 hours

**Task 2S**: Continuous Learning Program

- Ongoing training schedule
- Skill development paths
- Knowledge refresh cycles
- Evidence: Continuous learning plan
- Timeline: 2-3 hours

**Task 2T**: Training Effectiveness Measurement

- Pre/post assessments
- Performance improvement tracking
- ROI on training investment
- Evidence: Training metrics framework
- Timeline: 2-3 hours

Execute 2J-2T. Total: ~48-58 hours enablement work.

---

**PAUSED TASKS** (Resume after launch):

4. **Approval Queue FAQ** - Document common questions
   - Create FAQ for operators about Agent SDK
   - Address concerns about AI accuracy
   - Document escalation procedures
   - Provide examples of good approvals
   - Evidence: FAQ document

5. **Internal Dry-Run Session** - Prepare for team training
   - Schedule internal training session
   - Create dry-run agenda and checklist
   - Prepare demo scenarios
   - Capture questions for FAQ updates
   - Coordinate: Tag @support and @product for attendance
   - Evidence: Session agenda, attendance list

6. **Training Material Updates** - Keep all materials current
   - Update existing training modules with Agent SDK features
   - Refresh job aids with new workflows
   - Update operator checklists
   - Verify all materials reference canonical toolkit
   - Evidence: Updated materials inventory

**Ongoing Requirements**:

- Coordinate with @support on training content
- Tag @marketing for messaging alignment
- Log all training materials in feedback/enablement.md

---

### 🚀 EXPANDED TASK LIST (2x Capacity for Fast Agent)

**Task 7: Advanced Training Modules**

- Create advanced operator training for complex scenarios
- Design troubleshooting training module
- Create escalation handling training
- Develop role-play scenarios for practice
- Evidence: Advanced training module suite

**Task 8: Training Effectiveness Measurement**

- Design training assessment quizzes
- Create competency evaluation framework
- Document certification process for operators
- Plan for ongoing training requirements
- Evidence: Training assessment system

**Task 9: Video Training Library**

- Create additional Loom modules for specific features
- Design video training series (Basics → Advanced)
- Create screen recording templates
- Document video production standards
- Evidence: Expanded video library

**Task 10: Operator Onboarding Program**

- Design complete onboarding program for new operators
- Create 30-day onboarding checklist
- Document mentorship program
- Plan for onboarding effectiveness tracking
- Evidence: Onboarding program documentation

**Task 11: Job Aid Library**

- Create quick reference cards for all features
- Design printable job aids
- Create digital reference materials
- Organize by operator role and skill level
- Evidence: Complete job aid library

**Task 12: Training Content Management**

- Design system for managing training content versions
- Create content update workflow
- Document content review and approval process
- Plan for content freshness maintenance
- Evidence: Content management system design

Execute 7-12 in any order - all enhance operator readiness.

---

### 🚀 FIFTH MASSIVE EXPANSION (Another 30 Tasks)

**Task 13-20: Learning & Development** (8 tasks)

- 13: Create microlearning content library (5-min modules)
- 14: Design spaced repetition learning system
- 15: Implement learning analytics and insights
- 16: Create personalized learning paths
- 17: Design peer-to-peer learning program
- 18: Create learning community platform
- 19: Implement learning gamification
- 20: Design learning impact measurement

**Task 21-28: Knowledge Management** (8 tasks)

- 21: Create knowledge base architecture
- 22: Design knowledge capture automation
- 23: Implement knowledge graph for connections
- 24: Create knowledge search and discovery
- 25: Design knowledge quality assurance
- 26: Implement knowledge versioning
- 27: Create knowledge analytics
- 28: Design knowledge retention strategies

**Task 29-42: Training Delivery** (14 tasks)

- 29: Design virtual instructor-led training (VILT) program
- 30: Create blended learning curriculum
- 31: Implement learning management system (LMS) integration
- 32: Design certification and badging program
- 33: Create train-the-trainer program
- 34: Implement simulation and practice environments
- 35: Design role-based training tracks
- 36: Create continuous learning programs
- 37: Implement performance support tools
- 38: Design just-in-time training delivery
- 39: Create mobile learning strategy
- 40: Implement social learning features
- 41: Design coaching and mentoring programs
- 42: Create learning culture development plan

Execute 13-42 in any order. Total: 42 tasks, ~25-30 hours work.
