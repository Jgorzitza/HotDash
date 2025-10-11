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

2. **Agent SDK Operator Training Module** - Create training for approval queue
   - Create Loom video or written guide for approval queue workflow
   - Document how to review agent proposals
   - Explain approve vs reject decision making
   - Demonstrate complete approval flow
   - Coordinate: Tag @support for content review
   - Evidence: Training module created, documented in feedback/enablement.md

3. **Quick Start Guide for Operators** - Create concise reference materials
   - Create 1-page quick start for approval queue
   - Document common scenarios and decisions
   - Provide troubleshooting tips
   - Create decision flowchart
   - Evidence: Quick start guide in docs/enablement/job_aids/

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
