---
epoch: 2025.10.E1
doc: docs/strategy/operator_dry_run_pre_read_draft.md
owner: product
last_reviewed: 2025-10-08
doc_hash: TBD
expires: 2025-10-15
---
# Operator Dry Run Pre-Read (Draft)

## Session Snapshot
- **Date / Time:** Thursday, 2025-10-16 @ 13:00 ET
- **Duration:** 90 minutes (see `docs/runbooks/operator_training_agenda.md`)
- **Facilitators:** Product — Justin; Support — TBD (awaiting confirmation); Enablement — TBD
- **Participants (Proposed):**
  - Riley Chen — Ops Lead (Evergreen Outfitters)
  - Morgan Patel — CX Lead (Evergreen Outfitters)
  - Jordan Alvarez — Data (telemetry observer)
  - Brooke Sanchez — Support Enablement (scribe)
- **Environment:** OCC staging with mock data flag (`?mock=1`), feature flag `FEATURE_MODAL_APPROVALS=1`

## Sprint Alignment & Stack Guardrails
- Tracks current sprint focus to lock the operator dry run plan (`docs/directions/product.md:25`-`docs/directions/product.md:28`).
- Supports telemetry acceptance by validating activation, SLA resolution, and anomaly response workflows during the hands-on segments.
- Provides evidence bundle (screens, decision logs, notes) needed for release readiness sign-off.
- **Stack Guardrails Compliance:** Supabase-only backend, Chatwoot on Supabase, React Router 7, OpenAI + LlamaIndex per canonical toolkit (`docs/directions/README.md#canonical-toolkit--secrets`).
- **Compliance Constraints:** All data processing must align with current DPA status per `docs/compliance/evidence/vendor_dpa_status.md`; no external data transmission until SCC/DPA approvals complete.

## Success Metrics (Draft)
1. **Workflow Completion:** At least 3 of 4 practice scenarios completed without facilitator intervention; log decision IDs for each action in Supabase (scope `ops`).
2. **SLA Understanding:** Participants correctly articulate SLA escalation ladder from memory (survey question at close).
3. **Telemetry Validation:** Ops Pulse tile reflects seeded metrics after nightly job run (`npm run ops:nightly-metrics`) with no stale data alerts.
4. **Feedback Capture:** Minimum 5 actionable insights documented in Q&A template (`docs/runbooks/operator_training_qa_template.md`).

## Agenda References
- Primary walkthrough + practice structure in `docs/runbooks/operator_training_agenda.md`.
- CX Escalations modal SOP in `docs/runbooks/cx_escalations.md`.
- Support enablement checklist updates pending confirmation in `feedback/support.md` (see 2025-10-09 status).

## Pre-Session Requirements
- **Access Package:**
  - OCC staging credentials for demo shops (`SHOP_DOMAINS=evergreen-outfitters.myshopify.com, atelier-belle-maison.fr, peak-performance-gear.myshopify.com`).
  - Chatwoot sandbox token seeded with the same conversations used in runbook scenarios.
  - Supabase service key with read access to `decision_log` (scope `ops`) for live verification.
- **Environment Checks:**
  - Confirm `FEATURE_MODAL_APPROVALS=1` in staging (see Playwright config update).
  - Ensure latest translations deployed (pending FR string revision at `docs/design/copy_deck_modals.md:307`).
  - Run `npm run ops:nightly-metrics` 24h prior; archive output for evidence.
- **Materials:**
  - Printed/accessible agenda + Q&A template
  - Screenshot capture tool ready for evidence bundle
  - Linear project links for telemetry/OCC-212 stories

## Test Data Policy & Rollback Plan
- **Test Data:** Synthetic data only (`?mock=1` flag enforced); no production customer data permitted in dry run environment
- **Data Classification:** All test scenarios use anonymized merchant data per `docs/compliance/data_inventory.md` classification matrix
- **Rollback Criteria:** If SLA violations, compliance issues, or stack guardrail violations detected during session, immediate pause and review
- **Exit Strategy:** Session abort procedures documented in `docs/runbooks/incident_response_breach.md` if PII exposure or unauthorized data access occurs

## Outstanding Dependencies (Updated 2025-10-11T01:20Z)
- **DEPLOY-147 QA Evidence:** Sub-300ms `?mock=0` proof and Playwright rerun (blocks staging access confirmation)
- **SCC/DPA Approvals:** Supabase ticket #SUP-49213 and OpenAI DPA finalization (blocks external API usage)
- **Embed Token Resolution:** Shopify Admin token validation and compliance clearance (blocks full environment setup)
- **Nightly Logging Cadence:** AI logging pipeline alignment with QA/Data teams (blocks evidence bundle validation)

## Evidence Capture Plan
- Log dry run summary to Memory (scope `ops`) with:
  - Action IDs + timestamps
  - Participant quotes + pain points
  - Metrics snapshot (Ops Pulse, SLA trends)
- Attach to `feedback/product.md` and updated backlog entry (OCC-212) once dependencies resolve.
- Bundle screenshots and decision log excerpts in shared folder (`artifacts/ops/dry_run_2025-10-16/` — to be created post-session).

## Publication Gates (Updated 2025-10-11T01:20Z)
**DO NOT PUBLISH until ALL THREE gates satisfied:**
1. **Staging Access Confirmed:** DEPLOY-147 evidence bundle complete with QA signoff
2. **Embed Token Cleared:** Compliance approval for Shopify Admin token usage patterns
3. **Latency Evidence Meeting Thresholds:** Sub-300ms performance proof validated

## Staged Publication Actions (Ready for Immediate Execution)
1. **Memory Entry:** Pre-composed ops-scope entry ready for publication (`ops-dry-run-publication-20251016`)
2. **Linear Updates:** DOCS-DRY-RUN issue status change to "Review" with attendee confirmations
3. **Stakeholder Notification:** #occ-product and #occ-stakeholders channels with final pre-read link
4. **Manager Sync:** Include in daily standup as "ready for publication pending gates"

## 2025-10-09 Update
- Pinged enablement/support/product internal channel thread (10:45 ET) to confirm slot + staging access timeline; waiting on response before locking attendee roster.
- Added backlog references (OCC-212, OCC-221, OCC-230) to ensure dry run dependencies tracked in Linear.
- Drafted success metric survey questions for post-session follow-up; will attach once facilitator list is confirmed.
