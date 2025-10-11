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

## Sprint Alignment
- Tracks current sprint focus to lock the operator dry run plan (`docs/directions/product.md:25`-`docs/directions/product.md:28`).
- Supports telemetry acceptance by validating activation, SLA resolution, and anomaly response workflows during the hands-on segments.
- Provides evidence bundle (screens, decision logs, notes) needed for release readiness sign-off.

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

## Outstanding Dependencies
- **Reliability/Data:** Provide Supabase monitoring assets + decision sync log export (see `feedback/reliability.md:25`, `feedback/data.md:18`).
- **Enablement/Support:** Confirm staging package delivery + attendee roster (see `feedback/enablement.md:19`, `feedback/support.md:23`).
- **Design:** Updated FR copy for `modal.seo.assign_heading` (see `docs/design/copy_deck_modals.md:307`).

## Evidence Capture Plan
- Log dry run summary to Memory (scope `ops`) with:
  - Action IDs + timestamps
  - Participant quotes + pain points
  - Metrics snapshot (Ops Pulse, SLA trends)
- Attach to `feedback/product.md` and updated backlog entry (OCC-212) once dependencies resolve.
- Bundle screenshots and decision log excerpts in shared folder (`artifacts/ops/dry_run_2025-10-16/` — to be created post-session).

## Next Actions
1. Await confirmations from reliability/data/support/enablement (due 2025-10-09 EOD).
2. Finalize attendee list + success metrics; update this draft and push entry to Memory (`scope="ops"`).
3. Publish link to finalized pre-read in #occ-product 24h before session and include in daily manager sync notes.

## 2025-10-09 Update
- Pinged enablement/support/product internal channel thread (10:45 ET) to confirm slot + staging access timeline; waiting on response before locking attendee roster.
- Added backlog references (OCC-212, OCC-221, OCC-230) to ensure dry run dependencies tracked in Linear.
- Drafted success metric survey questions for post-session follow-up; will attach once facilitator list is confirmed.
