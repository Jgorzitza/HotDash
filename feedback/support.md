---
epoch: 2025.10.E1
doc: feedback/support.md
owner: support
last_reviewed: 2025-10-10
doc_hash: TBD
expires: 2025-10-11
---
# Support Daily Status — 2025-10-12 (Checklist Adoption)

## Summary
- Adopted localization’s English-only audit checklist (`docs/marketing/english_only_audit_checklist.md`) as part of support’s dry run prep and Chatwoot template updates.
- Logged reminder in CX escalation runbook and operator training agenda to execute the checklist before circulating revised materials.
- Coordinated with marketing so both teams share audit evidence back to `feedback/localization.md` after each run.

## Actions
- Added checklist step to `docs/runbooks/shopify_dry_run_checklist.md` (pre-distribution section) and noted evidence path in the operator training Q&A template.
- Sent acknowledgement in support backlog (`docs/runbooks/operator_training_agenda.md` updates) that English-only verification precedes every collateral revision.
- Informed enablement that support will provide checklist output alongside training packet updates once the embed token unlocks modal screenshots.

## Blockers / Next Steps
- 2025-10-10T07:52:05Z — Deployment shared an updated mock smoke bundle (`artifacts/qa/staging-deploy-2025-10-10T0751Z.md`); holding comms until the live `?mock=0` latency drops below 300 ms.
- Still waiting on deployment/reliability to provide the sanctioned Shopify embed token so localization can capture modal screenshots; support will attach screenshots to the dry run evidence bundle immediately after delivery.
- Continue running curl probes and dry run rehearsals; document checklist results in `feedback/localization.md` to keep audit history centralized.

# Support Daily Status — 2025-10-10

## 2025-10-10 Direction Execution
- Updated training agenda to incorporate the Shopify sync rate-limit coaching script and explicit `#occ-reliability` escalation path (`docs/runbooks/operator_training_agenda.md`).
- Added escalation contact table to the rate-limit recovery playbook so support reps know the reliability channel and support lead handoff (`docs/runbooks/shopify_rate_limit_recovery.md`).
- Synced dry run checklist with a new task to rehearse the staging validation queue using the Fly URL so enablement sees the dependency in one place (`docs/runbooks/shopify_dry_run_checklist.md`).
- Direction reread 2025-10-10 04:25 UTC — newest sprint additions captured (QA artefact integration, modal validation).
- Folded QA readiness evidence into CX Escalations playbook (`docs/runbooks/cx_escalations.md`) and operator training agenda (`docs/runbooks/operator_training_agenda.md`) with references to `artifacts/playwright/shopify/playwright-staging-2025-10-10T04-20-37Z.log` and latest synthetic check JSON.
- Reviewed CX Escalations & Sales Pulse modal implementations (`app/components/modals/CXEscalationModal.tsx`, `app/components/modals/SalesPulseModal.tsx`) against SOPs — flows, labels, and decision logging align; no discrepancies to escalate.
- Added mock-mode transcript snippets + edge case checklist to CX Escalations runbook so operators can rehearse while `?mock=0` stays blocked (`docs/runbooks/cx_escalations.md`).
- Staged evidence table in `docs/runbooks/shopify_dry_run_checklist.md` to track parity/smoke/curl artifacts and comms readiness ahead of staging rollout.

## Shopify Validation Queue Rehearsal — 2025-10-10T02:52Z
- `curl -I https://hotdash-staging.fly.dev/app?mock=1` → HTTP/2 200, `fly-request-id=01K760D3XJW8N1MDWW4HEY3GDN-ord`; staging host reachable without `--resolve` override.
- Walked through `docs/integrations/shopify_readiness.md` checklist and mapped support-owned steps (capturing request IDs, logging evidence, prepping Slack comms) to the new dry run task; ready to execute once credentials drop.
- Holding the `?mock=0` smoke until reliability posts sustained green synthetic checks; queued reminder to capture screenshot + comms snippet for operator update when released.
- Re-ran curl against `https://hotdash-staging.fly.dev/app?mock=0` → HTTP/2 410 (no install) with `fly-request-id=01K765H8WH5KMF74TNJMZDYP4S-ord`; sharing with deployment/reliability so they can confirm expected pre-install response before we message operators.
- Updated operator training Q&A template with staging walkthrough metadata (`docs/runbooks/operator_training_qa_template.md`) so facilitators/attendees have Fly URL + feature flags documented.
- Spot-check 2025-10-10 07:18 UTC: `curl -I https://hotdash-staging.fly.dev/app?mock=0` still returns HTTP/2 410 (`fly-request-id=01K76FRR5Q2SCV97HAVB336M3M-ord`); pinged reliability thread to keep us looped once pipeline redeploy finishes.

## Dry Run Logistics Sync
- Reviewed operator training Q&A template to ensure space for rate-limit rehearsal notes; prepped to seed initial prompts after enablement shares facilitator roster.
- Coordinating with product to confirm support facilitator assignment so we can finalize session metadata in `docs/runbooks/operator_training_qa_template.md` and the pre-read.
- Pre-filled `docs/runbooks/operator_training_qa_template.md` with session metadata, T-48 open questions (DEPLOY-147 credentials, synthetic check ETA, facilitator owners), and action items so partners can update status inline.
- Drafted operator invite list stub in `docs/strategy/operator_dry_run_pre_read_draft.md` and collected enablement’s provisional attendee notes; waiting on roster confirmation before sending calendar hold.
- Opened Slack follow-up (2025-10-10 07:10 UTC) with enablement to lock facilitator availability for 2025-10-16 @ 13:00 ET; asked for confirmation on scribe + backup note-taker assignments.
- Held provisional 30-minute slot on shared support calendar for 2025-10-10 15:30 UTC to walk roster + invite sequencing with enablement; will convert to formal invite once they confirm availability.
- Coordinated with enablement on the new staging evidence table (`docs/enablement/dry_run_training_materials.md`) so support can drop the `?mock=0` curl log and synthetic JSON immediately after QA signs off.

## Blockers / Next Steps
- DEPLOY-147 still pending Shopify staging credential bundle (shop domain + install steps); cannot run live Admin validation until deployment delivers package.
- Need reliability confirmation that synthetic checks stay green for `https://hotdash-staging.fly.dev/app?mock=0`; will rerun curl + capture evidence once posted.
- Plan to draft operator comms snippet for rate-limit incident logging after enablement reviews the updated playbooks (target 2025-10-11).
- Credential hand-off checklist now lives in `docs/deployment/shopify_staging_install_plan.md`; will mark items complete as deployment/integrations confirm deliveries.

## Recommendations — 2025-10-10
1. Keep polling `https://hotdash-staging.fly.dev/app?mock=0` after deployment’s redeploy to capture live-mode screenshots the moment we see HTTP 200 and archive the evidence in `artifacts/ops/dry_run_2025-10-16/`.
2. Block time with enablement today to ratify facilitator roster + note-taking coverage, then update `docs/runbooks/operator_training_qa_template.md` and schedule the 2025-10-16 invites.
3. Pre-stage operator comms packet (Slack copy + email draft) so we can broadcast staging readiness immediately after DEPLOY-147 lands.
4. Inventory outstanding Shopify credential dependencies in `feedback/product.md` and confirm ownership so there’s a single thread to close once deployment hands off the bundle.

# Support Daily Status — 2025-10-09

## Direction Refresh — 2025-10-10 09:13 UTC
- Manager directive: integrate the Shopify sync rate-limit coaching guidance into support playbooks today and log updates + escalations in this file.
- Prepare to execute the Shopify validation queue once admin credentials arrive by reviewing `docs/integrations/shopify_readiness.md`; record credential receipt (vault path/timestamp) immediately when deployment shares it.
- Coordinate with enablement/product on dry run logistics so operator comms and Q&A entries reflect the refreshed training kits.

## Shopify Install Push — 2025-10-10 10:22 UTC
- When integrations confirms staging store access, document login details + guardrails here and refresh operator playbooks with the Shopify install instructions and rate-limit recovery steps.
- Partner with enablement to send dry-run invites referencing the live store; capture attendee confirmations and outstanding questions in the shared Q&A template.
- Note any support tooling gaps (Chatwoot, telemetry dashboards) uncovered during validation so product can track them in the backlog.

## 2025-10-10 Rate-Limit Coaching Integration
- Authored `docs/runbooks/shopify_rate_limit_recovery.md` and cross-linked it in the Shopify dry run checklist so facilitators reference the scripts during T-24 prep.
- Reviewed `docs/integrations/shopify_readiness.md` to confirm validation steps; awaiting staging bundle from product/deployment before flipping checklist items to in-progress.
- Seeded evidence folders under `artifacts/ops/dry_run_2025-10-16/` to capture rate-limit incidents or rehearsal artifacts as soon as they occur.

## 2025-10-10 Shopify Validation Queue Prep
- Pulled action list from `docs/integrations/shopify_readiness.md`—ready to run staging deploy script, capture smoke evidence, and coordinate contract tests with data once credentials drop.
- Drafted operator comms reminder (pending credentials) to highlight validation status and where rate-limit recovery steps live; will publish via Q&A template + training script once bundle arrives.
- Staged checklist placeholders in `docs/runbooks/shopify_dry_run_checklist.md` for facilitator briefing and evidence capture.
- Updated operator training agenda with staging install/login steps and a pre-session environment readiness check (Shopify Admin path, OCC mock flag, Supabase decision log verification).

## 2025-10-10 Dry Run Coordination
- Created live capture template at `docs/runbooks/operator_training_qa_template.md`; pre-filled session metadata placeholders for 2025-10-16 rehearsal.
- Requested enablement/product to populate attendee roster, note-taking, and recording owners referencing the new template and checklist (pending responses).
- Prepping to seed initial questions (staging access, rate-limit proof points) by 2025-10-12 once trainer inputs return.
- Will dispatch invites and facilitator packet as soon as enablement flags readiness (design overlays + staging bundle) per direction; checklist row 6 pending staging credential delivery.

## Direction Acknowledgment
- 2025-10-10 10:20 ET — Confirmed `docs/runbooks/restart_cycle_checklist.md` is tracked in repo and aligned with integrations restart tasks; ready to reference during Shopify prep.
## 2025-10-09 Production Blockers Update
- Operator dry run prep: drafted training checklist updates; pending staging access confirmation and enablement schedule before sending operator invites.
- Supabase logging dependency: documenting current manual fallback so support can brief operators that decision logs remain in-memory until reliability delivers secrets.
- Staging screenshots: awaiting deployment seed to refresh runbook imagery for CX Escalations modal validation.

- Reviewed `docs/directions/support.md` (2025-10-08 refresh) and aligned on sprint focus: CX Escalations modal validation, English-only playbook/template upkeep, and operator dry run coordination.

## 2025-10-09 Sprint Execution
- Compiled validation checklist for CX Escalations modal updates and queued screenshot capture pending staging data refresh.
- Coordinated with enablement/product on operator dry run logistics; awaiting confirmation on invite send and staging access package.
- Started revising support playbooks for English-only messaging updates; holding publication until designer delivers annotated visuals.
- 19:25 ET: queued follow-up for Friday AM if product/enablement haven’t confirmed staging access + 2025-10-16 slot; ready to blast invites/Q&A prep as soon as package lands.

## 2025-10-10 Production Blocker Sweep
- Supabase decision sync fix: will capture operator-facing guidance once reliability publishes the monitor status so support can speak to expected recovery.
- Staging Postgres + secrets: still waiting on staging seed/access package; support ready to validate templates as soon as credentials land.
- GA MCP readiness: noting in FAQ that analytics tile remains mock until integrations provides go-live date; will update when credentials handed off.
- Operator dry run: draft invites and agenda ready—sending immediately after product confirms staging access window.

## 2025-10-08 — Sprint Focus Activation
- Set up screenshot/evidence checklist for CX Escalations modal validation, ready to populate once staging refresh lands per `docs/directions/support.md:26`.
- Audited support playbooks/templates to ensure English-only scope remains accurate, logging follow-ups here per `docs/directions/support.md:27`.
- Began coordinating dry run logistics and Q&A capture with enablement/product to satisfy `docs/directions/support.md:28`; staging access remains outstanding.

## Cross-role Coverage — 2025-10-09
- Current focus redirected to integrations tasks; unable to progress support sprint items beyond existing notes until dedicated support agent resumes ownership.

## Progress
- Prepping updated CX Escalations runbook screenshots once staging seed is ready; confirmed template heuristics match current English-only scope.
- Drafted operator enablement checklist updates so training reflects the trimmed template set.
- Pinged product and enablement on Slack (10:45 ET) requesting confirmation on the 2025-10-16 dry run slot and staging access timeline.
- Enablement responded (14:36 ET) with updated job aids + coordination plan and is capturing pre-session questions for inclusion in the operator Q&A template once support shares priorities.
- 2025-10-10 18:45 ET — Received Shopify sync rate-limit coaching guide (`docs/enablement/job_aids/shopify_sync_rate_limit_coaching.md`); reviewing tone and escalation steps, will deliver feedback to enablement before invitations send.
- 2025-10-09 09:00 ET — Enablement sent follow-up reminder for dry run confirmations; awaiting action items from product/support before invites go out.
- Expanded Chatwoot heuristic coverage (additional delivery/refund phrases) and added regression tests (`npm run test:unit -- tests/unit/chatwoot.escalations.spec.ts`).

## Blockers / Dependencies
- Awaiting product confirmation on 2025-10-16 dry run slot plus staging access to capture validation evidence.
- Need seeded/staging conversations to regression-test Chatwoot heuristics beyond unit coverage.

## 2025-10-08 — Product Coordination
- Product request: please confirm staging access package delivery (operator shop creds + Chatwoot sandbox token handoff) and green-light the 2025-10-16 @ 13:00 ET dry run invite send no later than 2025-10-09 EOD so we can capture the Memory pre-read summary.
- Once confirmed, share the final attendee list + agenda tweaks back so product can snapshot in Memory (scope `ops`) alongside the backlog links.
- Pending reply from enablement/product on the above Slack ping.

## 2025-10-09 Production Blocker Push
- Supabase fix: monitoring escalation updates so support runbooks can document expected behaviour once retries/logging land; ready to refresh CX Escalations guidance with resolution steps.
- Staging Postgres + secrets: coordinating with deployment/reliability on staging access timing; will capture modal screenshots and validation notes as soon as seeds + credentials arrive.
- Operator dry run: followed up on 2025-10-16 logistics and staging package; prepping invite draft so calendar can go out immediately after product/enablement confirms.

## Next Steps
- Capture modal screenshots and refresh runbook validation notes after staging verification.
- Coordinate with enablement/product on dry run logistics and calendar invites once access is unblocked.
- Execute new runbook checklist items once Supabase credentials and staging seed land.
- Update `docs/runbooks/shopify_dry_run_checklist.md` statuses with evidence links as soon as staging access, design overlays, and nightly metrics outputs arrive; drop corresponding notes in `artifacts/ops/dry_run_2025-10-16/` and partner feedback logs.

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

## Comms Packet Prep — 2025-10-10 08:05 UTC
- Coordinated with marketing/enablement to stage the staging access rollout announcement and acknowledgement tracker (see `docs/enablement/dry_run_training_materials.md`).
- Noted current staging smoke status (`https://hotdash-staging.fly.dev/app?mock=0` → HTTP 410 @ 2025-10-10T07:23Z) so support can immediately append a 200-level curl log once QA clears the environment.
- Prepared facilitator roster sync (15:30 UTC hold) to finalize support presenters and scribe coverage; will update Q&A template ownership after the meeting.
- Pending: capture Supabase NDJSON export path and update support escalation notes as soon as reliability shares the refreshed bundle.

## Governance Acknowledgment — 2025-10-07
- Reviewed docs/directions/README.md and docs/directions/support.md (updated 2025-10-06)
- Acknowledge manager-only direction ownership and Supabase secret policy
- Sprint focus (2025-10-06) completed: All 4 tasks delivered with evidence links


## Coordination Request — 2025-10-07
- Review the proposed training schedule in `docs/marketing/support_training_session_proposal_2025-10-07.md`.
- Confirm preferred session (Oct 15 13:00 ET or Oct 16 10:00 ET) and own invite distribution by 2025-10-09.
- Share any additional materials needed so marketing can prep slides ahead of the walkthrough.
