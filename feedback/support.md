---
epoch: 2025.10.E1
doc: feedback/support.md
owner: support
last_reviewed: 2025-10-08
doc_hash: TBD
expires: 2025-10-09
---
# Support Daily Status — 2025-10-09

## Direction Acknowledgment
- Reviewed `docs/directions/support.md` (2025-10-08 refresh) and aligned on sprint focus: CX Escalations modal validation, English-only playbook/template upkeep, and operator dry run coordination.

## Progress
- Prepping updated CX Escalations runbook screenshots once staging seed is ready; confirmed template heuristics match current English-only scope.
- Drafted operator enablement checklist updates so training reflects the trimmed template set.

## Blockers / Dependencies
- Awaiting product confirmation on 2025-10-16 dry run slot plus staging access to capture validation evidence.
- Need seeded/staging conversations to regression-test Chatwoot heuristics beyond unit coverage.

## Next Steps
- Capture modal screenshots and refresh runbook validation notes after staging verification.
- Coordinate with enablement/product on dry run logistics and calendar invites once access is unblocked.

# Support Daily Status — 2025-10-08

## Summary
- Implemented template-selection heuristics and aligned Chatwoot escalation labeling; updated runbook and unit tests to match (app/services/chatwoot/escalations.ts:87, app/routes/actions/chatwoot.escalate.ts:116, docs/runbooks/cx_escalations.md:87, tests/unit/chatwoot.escalations.spec.ts:54).
- Closed localization request; support operates English-only per manager direction and removed translation tasks from runbooks.
- Coordinated the operator dry run with product, logging ownership and prep checklist for the 2025-10-16 proposal (docs/runbooks/operator_training_agenda.md:214).
- Reliability request received 2025-10-08: supply Chatwoot sandbox API token for secret rotation dry-run by 2025-10-15; coordinating with integrations to fulfill.

## CX Escalations Modal Validation
- **Runbook update:** Documented modal heuristics, rendered name substitution, and refreshed validation notes (docs/runbooks/cx_escalations.md:16).
- **Decision log identifiers:** Confirmed actions emitted as `chatwoot.approve_send`, `chatwoot.escalate`, `chatwoot.mark_resolved`; dashboards must be updated accordingly (app/routes/actions/chatwoot.escalate.ts:85, app/routes/actions/chatwoot.escalate.ts:118).
- **Template heuristics:** Service now maps shipping signals to `ship_update`, refund signals to `refund_offer`, fallback to `ack_delay`, and renders customer names before surfacing suggestions (app/services/chatwoot/escalations.ts:87).
- **Unit coverage:** Added regression tests for shipping/refund keyword detection and ack_delay fallback (tests/unit/chatwoot.escalations.spec.ts:54).
- **Action safeguards:** Approve button still requires `suggestedReply`; guidance remains to escalate or reply in Chatwoot if the field is missing (docs/runbooks/cx_escalations.md:54).

## Localization & Marketing Sync
- Localization workstream paused (English-only scope). Removed translation cadences from runbooks and closed outstanding requests.

## Operator Training Prep
- Q&A capture template verified and staged for dry run (docs/runbooks/operator_training_qa_template.md:1).
- Logged dry run proposal (2025-10-16 @ 13:00 ET) with product ownership and support prep checklist (docs/runbooks/operator_training_agenda.md:214).
- Pending: send calendar invite + agenda once product confirms staging access delivery.

## Risks / Blockers
- ✅ Localization request closed — English-only templates confirmed.
- ⚠️ Template heuristics rely on keyword matching; need production data review to confirm coverage once live.
- ⚠️ Modal still lacks template selector/editing controls, so operators must escalate when suggestion unsuitable.

## Evidence Links
- Runbook updates: docs/runbooks/cx_escalations.md:16
- Annotated screenshots: docs/runbooks/images/cx_escalation_modal_overview.svg, docs/runbooks/images/cx_escalation_modal_toast.svg
- Action handler reference: app/routes/actions/chatwoot.escalate.ts:85
- Chatwoot suggestion heuristics: app/services/chatwoot/escalations.ts:87
- Unit coverage: tests/unit/chatwoot.escalations.spec.ts:54
- Dry run coordination: docs/runbooks/operator_training_agenda.md:214

# Support Daily Status — 2025-10-07

## Summary
- **Sprint Focus Completed (2025-10-06):** All 4 manager-assigned tasks delivered
- Created comprehensive CX escalations runbook mapping dashboard actions to SOPs with escalation ladder
- Developed operator training agenda (90-min session) with hands-on scenarios and Q&A capture template
- Reviewed AI reply generation prompt v1.0.0 and established approval criteria for pilot deployment
- Coordinated with marketing on localization glossary to align support coaching with copy deck tone (EN/FR)
- CX Escalations modal now live per engineer update (2025-10-07) — ready for first operator dry run

## Previous Session (2025-10-05)
- Reviewed Operator Control Center project structure and north star (docs/strategy/initial_delivery_plan.md)
- Assessed current Chatwoot template library: 3 templates active (app/services/chatwoot/templates.ts)
- Identified gaps: no operator escalation playbooks, no runbooks directory, no Q&A documentation yet
- Dashboard not yet in production; cannot capture operator feedback or monitor integration health

## Deliverables (Sprint 2025-10-06)

### 1. CX Escalations Runbook ✅
**Location:** docs/runbooks/cx_escalations.md
**Contents:**
- 4 dashboard actions mapped to SOPs: View conversation, Send templated reply, Tag for escalation, Mark resolved
- Escalation ladder defined: L1 (CX Agent) → L2 (CX Lead) → L3 (Ops Manager)
- Template library with use cases and SOPs per template
- Integration monitoring thresholds and alert channels
- Q&A section for common operator confusion

### 2. Operator Training Agenda ✅
**Location:** docs/runbooks/operator_training_agenda.md
**Format:** 90-minute live session with 8 modules
**Highlights:**
- Dashboard navigation (15 min) — tile anatomy, status indicators
- CX Escalations deep dive (25 min) — template selection, approval flow, practice scenarios
- Decision logging & audit trail (10 min) — accountability, privacy, compliance
- Hands-on practice (15 min) — 4 realistic scenarios covering templates, escalations, errors
- Q&A capture template: docs/runbooks/operator_training_qa_template.md

### 3. AI Reply Approval Criteria ✅
**Location:** docs/runbooks/ai_reply_approval_criteria.md
**Assessment:** APPROVED AI prompt v1.0.0 for limited pilot with conditions
**Key Criteria:**
- Pre-deployment checklist: Baseline regression testing, BLEU/ROUGE metrics ≥ thresholds, support lead review
- Pilot phase: 1-2 operators, 2 weeks, max 50 AI replies/week, daily quality reviews
- Guardrails: Hallucination detection, confidence thresholds (≥0.6), human-in-the-loop approval required
- Escalation protocol: Emergency disable if ≥3 hallucinations in 24h
- Success metrics: Zero hallucinations, operator satisfaction ≥4/5, quality "good/excellent" in ≥90% cases

### 4. Marketing Localization Sync ✅
**Location:** docs/runbooks/support_marketing_localization_sync.md
**Glossary Coverage:**
- 40+ critical EN/FR term pairs from copy deck (dashboard, tiles, actions, toasts, modals)
- Tone alignment: Professional but approachable, action-oriented, empathetic
- Chatwoot template assessment: All 3 templates align with brand tone deck
- Translation workflow: Request process for new templates/training materials
- Coordination protocol: Weekly sync with marketing on copy deck updates

## Chatwoot Template Status
- **Current templates:** 3 active in app/services/chatwoot/templates.ts:7-23
  - ack_delay: "Acknowledge delay" — ✅ Tone aligned with brand deck
  - ship_update: "Shipping updated" — ✅ Tone aligned
  - refund_offer: "Refund offer" — ✅ Tone aligned
- **AI/engineer review:** AI prompt v1.0.0 approved for pilot (see ai_reply_approval_criteria.md)
- **Localization status:** ✅ English-only scope confirmed; no translations required.
- **Template update log:** Review outcomes documented in docs/runbooks/ai_reply_approval_criteria.md

## Operator Escalation Playbooks
- **Status:** ✅ Created — docs/runbooks/cx_escalations.md
- **Coverage:** 4 dashboard actions (view, reply, escalate, resolve) mapped to SOPs with escalation ladder
- **Next action:** Pair with engineer to validate modal implementation matches runbook workflows

## Q&A / Confusing States
- **Status:** Training agenda + Q&A capture template ready
- **Template:** docs/runbooks/operator_training_qa_template.md
- **Next action:** Schedule first operator dry run (post-M2 modal deployment), conduct training, capture Q&A

## Incidents & Resolution Time
_No incidents logged — dashboard not yet in production_

## Integration Health Monitoring
- **Shopify:** Service layer implemented (app/services/shopify/), not yet monitoring error thresholds
- **Chatwoot:** Service layer implemented (app/services/chatwoot/), not yet monitoring SLA breaches
- **GA:** Running in mock mode (DASHBOARD_USE_MOCK=true), MCP host credentials pending
- **Next action:** Post-release, monitor integration errors and alert reliability if thresholds breach per support direction

## Evidence Links

### Runbooks Created
- CX Escalations Runbook: docs/runbooks/cx_escalations.md
- Operator Training Agenda: docs/runbooks/operator_training_agenda.md
- Q&A Capture Template: docs/runbooks/operator_training_qa_template.md
- AI Reply Approval Criteria: docs/runbooks/ai_reply_approval_criteria.md
- (Deprecated) Marketing localization sync doc retained for historical reference.

### Reference Documentation
- Chatwoot templates: app/services/chatwoot/templates.ts:7-23
- AI reply prompt: app/prompts/chatwoot/reply-generation.v1.md
- Copy deck (EN): docs/design/copy_deck.md
- Brand tone deck: docs/marketing/brand_tone_deck.md
- Support direction: docs/directions/support.md
- CX Escalations modal (engineer): app/components/modals/CXEscalationModal.tsx

## Blockers / Risks
- ~~Dashboard not yet deployed~~ ✅ RESOLVED: CX Escalations modal live (2025-10-07)
- ~~No runbooks directory~~ ✅ RESOLVED: 5 runbooks created
- ✅ **Localization complete:** Translation work removed from scope.
- ❌ **AI reply pilot not yet started:** Awaiting AI agent baseline regression testing + metrics
- ⚠️ **First operator dry run not scheduled:** Need product/manager coordination post-M2

## Next Actions (Per Support Direction & Sprint Completion)
1. ✅ COMPLETED: Draft CX escalation runbook skeleton (docs/runbooks/cx_escalations.md)
2. ✅ COMPLETED: Prepare operator training agenda and Q&A capture template
3. ✅ COMPLETED: Review AI-generated reply roadmap and agree on approval criteria
4. ✅ COMPLETED: Coordinate with marketing on localization glossary
5. ⏭️ NEXT: Pair with engineer to validate CX modal implementation vs. runbook workflows
6. ⏭️ NEXT: Coordinate with manager/product to schedule first operator dry run (post-M2)
7. ⏭️ NEXT: Begin daily AI/engineer template review once AI pilot approved and launched

## Follow-up Tasks
- [ ] Validate CX Escalations modal matches runbook SOPs (pair with engineer)
- [ ] Schedule first operator training/dry run (coordinate with product lead Riley Chen)
- [ ] Update runbooks with modal screenshots once dry run complete
- [ ] Initiate AI reply pilot once AI agent provides baseline metrics (feedback/ai.md)

## Governance Acknowledgment — 2025-10-07
- Reviewed docs/directions/README.md and docs/directions/support.md (updated 2025-10-06)
- Acknowledge manager-only direction ownership and Supabase secret policy
- Sprint focus (2025-10-06) completed: All 4 tasks delivered with evidence links


## Coordination Request — 2025-10-07
- Review the proposed training schedule in `docs/marketing/support_training_session_proposal_2025-10-07.md`.
- Confirm preferred session (Oct 15 13:00 ET or Oct 16 10:00 ET) and own invite distribution by 2025-10-09.
- Share any additional materials needed so marketing can prep slides ahead of the walkthrough.
