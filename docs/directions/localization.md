---
epoch: 2025.10.E1
doc: docs/directions/localization.md
owner: manager
last_reviewed: 2025-10-12
doc_hash: TBD
expires: 2025-10-19
---
# Localization — Direction (Operator Control Center)
## Canon
- North Star: docs/NORTH_STAR.md
- Git & Delivery Protocol: docs/git_protocol.md
- Direction Governance: docs/directions/README.md
- MCP Allowlist: docs/policies/mcp-allowlist.json
- Copy Deck (English-only): docs/design/copy_deck.md
- Launch Comms Packet: docs/marketing/launch_comms_packet.md
- Support–Marketing Copy Alignment: docs/runbooks/support_marketing_localization_sync.md
- Credential Map: docs/ops/credential_index.md
- Agent Launch Checklist (manager executed): docs/runbooks/agent_launch_checklist.md

> Manager authored. Localization must not create or alter direction docs without manager approval; surface change proposals with evidence in `feedback/localization.md`.

## Local Execution Policy (Auto-Run)

You may run local, non-interactive audit and export commands without approval. Guardrails:

- Scope: local repo; do not change remote infra or git under auto-run.
- Non-interactive: disable pagers; avoid interactive prompts.
- Evidence: log timestamp, command, outputs in feedback/localization.md; save audits under artifacts/localization/.
- Secrets: never print values; reference names only.
- Retry: 2 attempts then escalate with evidence.

- Enforce English-only guardrails across all shipping surfaces; immediately flag any non-English strings outside approved translation packets.
- Maintain the localization audit workflow covering app UI (`app/routes/app._index.tsx`, `app/components/tiles/*`), enablement runbooks, and Chatwoot templates; log audit outcomes and gaps in `feedback/localization.md`.
- Partner with marketing, enablement, and support to provide copy guidance; ensure all touchpoints reference the latest English copy deck and tone guardrails.
- Steward translation reference packets (FR variants) strictly for QA; update status tables and note when translation scope is paused or resumed.
- Track partner/vendor localization requests; document owner, due dates, and status in `feedback/localization.md` with links to source briefs.
- Stack guardrails: reference `docs/directions/README.md#canonical-toolkit--secrets` so UX copy aligns with the Supabase-backed stack (no Fly Postgres mentions, Chatwoot on Supabase, React Router 7 terminology).
- Monitor telemetry for AI-generated copy suggestions; collaborate with AI and QA to confirm outputs remain English-only and meet tone requirements.
- Start executing assigned tasks immediately; log progress, blockers, and approvals in `feedback/localization.md`.

## Current Sprint Focus — 2025-10-12
Own each action until the evidence is published—log the artifacts, timestamps, and follow-up owners in `feedback/localization.md`. If another team is involved, schedule and track the task until it is complete.

## Aligned Task List — 2025-10-11 (Updated: Accelerated Delivery)

**Tasks in Priority Order** (execute sequentially, log blockers in feedback/localization.md and continue):

1. ✅ **English-Only Compliance Audit** - COMPLETE (2025-10-11)
   - 12 FR matches found, all sanctioned (QA files, technical metadata)
   - No violations in app/ UI or user-facing docs
   - Evidence: artifacts/localization/20251011T071342Z/

2. **Agent SDK Copy Audit** - Ensure all Agent SDK text is English-only
   - Review docs/AgentSDKopenAI.md for user-facing text
   - Check approval queue UI copy (coordinate with @designer)
   - Verify agent response templates are English-only
   - Audit error messages and notifications
   - Evidence: Audit results, any violations found

3. **Agent Response Copy Guidelines** - Define tone and style for AI responses
   - Create copy guidelines for agent responses
   - Define brand voice for customer interactions
   - Document tone requirements (professional, helpful, empathetic)
   - Provide examples of on-brand responses
   - Coordinate: Tag @support for review
   - Evidence: Copy guidelines document

4. **Approval Queue UI Copy** - Review and approve all interface text
   - Review approval card component copy
   - Review button text (approve/reject/cancel)
   - Review state messages (pending, approved, rejected, error)
   - Verify all copy is clear and actionable
   - Coordinate: Tag @designer for copy review
   - Evidence: Copy review checklist

5. **Error Message Consistency** - Audit and standardize error messaging
   - Review all error messages in codebase
   - Check for consistent tone and voice
   - Verify actionable guidance provided
   - Create error message style guide
   - Evidence: Error message audit, style guide

6. **Documentation Language Check** - Ensure clarity for operators
   - Scan docs/ for clarity and plain English
   - Check Agent SDK documentation for jargon
   - Create glossary for technical terms
   - Verify runbooks use clear language
   - Evidence: Documentation audit results

**Ongoing Requirements**:
- English-only enforcement for all new content
- Coordinate with @designer and @support on copy
- Log all audits in feedback/localization.md

---

### 📋 MANAGER DECISION: Use grep (ripgrep not required)

**Your Question**: Whether to install ripgrep  
**Manager Decision**: Use grep - sufficient for localization audits, no new tools needed

---

### 🚀 EXECUTE TASKS 2-6 NOW

**All tasks are ready and independent**:

**Task 2: Agent SDK Copy Audit** (30 min)
- Review docs/AgentSDKopenAI.md
- Check approval queue UI copy
- Audit agent response templates
- Evidence: Audit results

**Task 3: Agent Response Copy Guidelines** (1 hour)
- Create copy guidelines for agents
- Define brand voice for AI
- Provide examples
- Coordinate with @support
- Evidence: Guidelines document

**Task 4: Approval Queue UI Copy** (30 min)
- Review button text, messages
- Ensure clarity
- Coordinate with @designer
- Evidence: Copy review

**Task 5: Error Message Consistency** (1 hour)
- Audit all error messages
- Create style guide
- Evidence: Error style guide

**Task 6: Documentation Language Check** (1 hour)
- Scan docs for clarity
- Create glossary
- Evidence: Documentation audit

Execute 2-6 in order. Total: ~4 hours of productive work.

---

### 🚀 EXPANDED TASK LIST (2x Capacity for Fast Agent)

**Task 7: Agent SDK Localization Framework**
- Create localization framework for future multi-language support
- Document string extraction process
- Design translation workflow
- Create i18n readiness checklist
- Evidence: Localization framework document

**Task 8: Terminology Standardization**
- Create standard terminology glossary for HotDash
- Document approved vs prohibited terms
- Create style guide for technical writing
- Ensure consistency across all docs
- Evidence: Terminology glossary, style guide

**Task 9: UI Copy Inventory**
- Complete inventory of ALL UI text strings
- Categorize by component/feature
- Document context for each string
- Prepare for future translation needs
- Evidence: Complete UI copy inventory spreadsheet

**Task 10: Agent Response Localization Planning**
- Design how agent responses would be localized
- Document template structure for multi-language
- Create pilot plan for FR support (future)
- Identify translation priorities
- Evidence: Localization strategy for agents

**Task 11: Error Message Internationalization**
- Design i18n structure for error messages
- Create error code system (language-agnostic)
- Document translation requirements
- Plan for error message localization
- Evidence: Error i18n framework

**Task 12: Documentation Translation Process**
- Create process for translating operator docs
- Design translation quality assurance workflow
- Document tools and resources needed
- Create timeline estimate for FR translation
- Evidence: Translation process document

**Task 13: Brand Voice Guidelines**
- Document brand voice for all communication types
- Create tone variations (support, marketing, technical)
- Provide examples for each voice
- Ensure AI agent alignment with brand
- Evidence: Comprehensive brand voice guide

**Task 14: Copy Testing Framework**
- Design A/B testing framework for UI copy
- Create copy effectiveness metrics
- Document testing process
- Plan for copy optimization
- Evidence: Copy testing framework

Execute 7-14 in any order - all valuable for future scalability.

---

### 🚀 FIFTH MASSIVE EXPANSION (Another 30 Tasks)

**Task 15-24: Translation Operations** (10 tasks)
- 15: Design continuous localization workflow
- 16: Create translation memory management system
- 17: Implement machine translation post-editing workflow
- 18: Design terminology management system
- 19: Create translation quality assurance framework
- 20: Implement context provision for translators
- 21: Design translation vendor management
- 22: Create translation cost optimization strategy
- 23: Implement translation analytics and metrics
- 24: Design multilingual SEO strategy

**Task 25-34: Global Experience** (10 tasks)
- 25: Design cultural adaptation framework
- 26: Create locale-specific UX patterns
- 27: Implement date/time/number formatting system
- 28: Design currency and payment localization
- 29: Create right-to-left (RTL) language support
- 30: Implement locale-specific imagery and icons
- 31: Design culturally appropriate color schemes
- 32: Create regional compliance variations
- 33: Implement geo-specific feature availability
- 34: Design multilingual customer support workflow

**Task 35-44: Localization Engineering** (10 tasks)
- 35: Create pseudo-localization for testing
- 36: Design string interpolation and pluralization
- 37: Implement locale fallback strategies
- 38: Create localization CI/CD pipeline
- 39: Design translation file format standards
- 40: Implement automated string extraction
- 41: Create localization testing automation
- 42: Design locale data management
- 43: Implement dynamic content localization
- 44: Create localization performance optimization

Execute 15-44 in any order. Total: 44 tasks, ~25-30 hours work.

---

## 🚨 LAUNCH CRITICAL REFOCUS (2025-10-11T22:50Z)

**CEO Decision**: Emergency refocus on launch gates

**Your Status**: PAUSED - Stand by until launch gates complete

**Why PAUSED**: Launch gates require Engineer, QA, Designer, Deployment work. Your tasks are valuable but not launch-blocking.

**When to Resume**: After all 7 launch gates complete (~48-72 hours)

**What to Do Now**: Stand by, review your completed work quality, ensure evidence is documented

**Your tasks remain in direction file - will resume after launch.**

---

## ✅ RESUME WORK (2025-10-11T23:20Z)

**Engineer Progress**: 5/7 launch gates complete! 🎉

**Your Status**: Resume your paused tasks - no idle agents

**Rationale**: Engineer making excellent progress. While they finish last 2 gates, you can continue valuable post-launch work.

**Your Tasks**: Resume where you left off in your expanded task list

**Evidence**: Continue providing file paths, test results, documentation per QA standards

**Coordinate**: Support launch if needed, otherwise continue your strategic work

**Timeline**: Work until launch gates 100% complete, then shift to launch support/iteration
