---
epoch: 2025.10.E1
doc: docs/runbooks/shopify_dry_run_checklist.md
owner: support
last_reviewed: 2025-10-10
doc_hash: TBD
expires: 2025-10-17
---
# Shopify Dry Run Checklist — Support Lead

## Purpose
Ensure support delivers a disciplined rehearsal of the HotDash Shopify Admin app on 2025-10-16. This checklist captures the prep, live-run, and follow-up steps required to keep operators, enablement, and product aligned while gathering evidence for launch readiness.

**Support Inbox:** customer.support@hotrodan.com — route all operator comms and evidence handoffs through this address.

## Canonical References
- `docs/directions/support.md` — sprint focus and governance
- `docs/enablement/dry_run_training_materials.md` — facilitator packet + dependencies
- `docs/runbooks/operator_training_agenda.md` — session flow + timings
- `docs/strategy/operator_dry_run_pre_read_draft.md` — success metrics + attendee roster
- `docs/marketing/support_training_script_2025-10-16.md` — instructor script
- `docs/integrations/shopify_readiness.md` — integration posture + credential status
- `docs/runbooks/restart_cycle_checklist.md` — integrations restart procedure (cross-functional trigger)
- `docs/runbooks/shopify_rate_limit_recovery.md` — rate-limit response playbook for support

> Log all progress and blockers in `feedback/support.md` (new dated section at top) and mirror dependencies in partner feedback logs as needed.

## Shared Inbox Routing Preflight (Support)
- Objective: Ensure the customer.support@hotrodan.com inbox routes into Chatwoot with correct team assignment and sender identity before live rehearsals.
- References: artifacts/support/coordination/chatwoot_inbox_request.md; evidence folder artifacts/support/screenshots/chatwoot_inbox/
- Tasks:
  1. Verify staging-only inbound test creates a conversation in the correct Chatwoot inbox; capture a redacted screenshot.
  2. Verify outbound reply uses the correct From identity; store redacted headers excerpt.
  3. Confirm routing rules (owners, after-hours) and update notes with SLAs and contacts.
- Evidence: Store artifacts under artifacts/support/screenshots/chatwoot_inbox/ and link in feedback/support.md.

## QA Evidence Hold — 2025-10-10
- ⛔ **Status:** Staging rehearsals remain paused until QA posts the green `?mock=0` curl + synthetic evidence set.
- 🔄 **Coordination:** Continue prepping materials but do not run live walk-throughs; brief enablement + marketing via customer.support@hotrodan.com that invites/comms stay in draft.
- 🛠 **Prep Work:** Maintain mock-mode rehearsals only, keep evidence folders staged, and line up notification copy so we can relaunch within 2h of QA’s green signal.
- 🗂 **Operator Q&A:** Collect questions/answers asynchronously (#, email) and log them in `docs/runbooks/operator_training_qa_template.md` so facilitators have fresh context once the hold lifts.
- 📝 **Logging:** Capture all updates/blockers in `feedback/support.md`; mirror dependencies in partner feedback logs so stakeholders know the hold rationale.
- 📡 **Chatwoot Fly cut-over:** Track reliability’s Fly migration updates (`docs/deployment/chatwoot_fly_runbook.md`), stage cut-over comms drafts, and keep `scripts/ops/chatwoot-fly-smoke.sh` refreshed with the announced host/token so the smoke can run the moment reliability signals go-live.

## Timeline Tasks

### T-72 Hours (2025-10-13)
| # | Task | Owner | Evidence / Artifact | Status |
|---|------|-------|---------------------|--------|
| 1 | Re-confirm sprint focus + dry run objectives with product/enablement (`docs/directions/support.md`) | Support | Note in `feedback/support.md` | Pending — schedule sync by 2025-10-13 |
| 2 | Verify restart cycle outcomes with integrations (`docs/runbooks/restart_cycle_checklist.md`) to ensure Shopify readiness tracker is current | Support ↔ Integrations | Updated row in `docs/integrations/integration_readiness_dashboard.md` | Pending — awaiting integrations owner |
| 3 | Collect open questions from support trainers/operators and seed `docs/runbooks/operator_training_qa_template.md` | Support | Q&A template updated with draft prompts | Pending — gather trainer inputs 2025-10-12 |
| 4 | Confirm attendee list + facilitator assignments with product (`docs/strategy/operator_dry_run_pre_read_draft.md`) | Product ↔ Support | Acknowledgment in `feedback/product.md` + `feedback/support.md` | Pending — product confirmation required |

### T-48 Hours (2025-10-14)
| # | Task | Owner | Evidence / Artifact | Status |
|---|------|-------|---------------------|--------|
| 1 | Validate staging access package: Shopify Admin demo shops, Chatwoot sandbox token, Supabase decision log key, Shopify CLI auth token | Product / Deployment | Credentials logged in `feedback/support.md` + vault entry screenshots | Pending — blocked on staging bundle |
| 2 | Confirm feature flags + mock params for rehearsal (`FEATURE_MODAL_APPROVALS`, `FEATURE_AI_ESCALATIONS`, `?mock=1`) | Engineering ↔ Support | Screenshot or flag checklist stored in `artifacts/ops/dry_run_2025-10-16/` | Pending — to verify once staging access delivered |
| 3 | Review job aids + AI samples for accuracy (`docs/enablement/job_aids/*`, `docs/enablement/job_aids/ai_samples/*`) | Support ↔ Enablement | Sign-off note in `feedback/enablement.md` | Pending — awaiting design overlays |
| 4 | Sync with integrations on Shopify deploy readiness (`docs/integrations/shopify_readiness.md`) and capture any credential gaps | Support ↔ Integrations | Updated checklist status + note in `feedback/support.md` | Pending — monitoring `DEPLOY-147` |
| 5 | Rehearse Shopify validation queue via `https://hotdash-staging.fly.dev/app` using mock + live smoke paths; log curl/screenshot evidence and comms updates | Support | Entry in `feedback/support.md` referencing `docs/integrations/shopify_readiness.md` | In progress — waiting on sustained green synthetic check |
| 6 | Run English-only spot checks on updated marketing/support collateral (`docs/marketing/support_training_script_2025-10-16.md`, `docs/enablement/dry_run_training_materials.md`, related comms) | Support ↔ Marketing/Enablement | Evidence logged in `feedback/localization.md` | Pending — rerun after collateral updates land |
| 7 | Prep Chatwoot Fly cut-over checklist (confirm host, token, smoke script, and comms draft) | Support ↔ Reliability | Update logged in `feedback/support.md` referencing `scripts/ops/chatwoot-fly-smoke.sh` | Pending — waiting for reliability go-live window |

### T-24 Hours (2025-10-15)
| # | Task | Owner | Evidence / Artifact | Status |
|---|------|-------|---------------------|--------|
| 1 | Send calendar invite + facilitator packet links (`docs/enablement/dry_run_training_materials.md`, Q&A template, agenda) | Support | Calendar invite + # post archived | Pending — share after access package lands |
| 2 | Publish finalized pre-read in `#occ-product` and tag attendees (`docs/strategy/operator_dry_run_pre_read_draft.md`) | Product ↔ Support | # permalink captured in `feedback/support.md` | Pending — waiting for attendee confirmation |
| 3 | Stage evidence folder (`artifacts/ops/dry_run_2025-10-16/`) with subfolders for scenarios + metrics | Support | Folder structure created (see repository) | Prep started — scaffolding created 2025-10-10 |
| 4 | Confirm recording + note-taking assignments (scribe, backup) | Support ↔ Enablement | Owner list appended to agenda + logged in feedback | Pending — assign once facilitators set |
| 5 | Brief facilitators on rate-limit recovery scripts (`docs/runbooks/shopify_rate_limit_recovery.md`) | Support ↔ Enablement | Acknowledgment in `feedback/enablement.md` + Q&A template | Pending — include in T-24 facilitator sync |
| 6 | Confirm participants can install/open OCC in staging (Shopify Admin → Apps → HotDash) | Support ↔ Product | Checklist note in `docs/runbooks/operator_training_agenda.md` + `feedback/support.md` | Pending — contingent on staging bundle |

### T-12 Hours (2025-10-16 01:00 ET)
| # | Task | Owner | Evidence / Artifact | Status |
|---|------|-------|---------------------|--------|
| 1 | Run `npm run ops:nightly-metrics` (data) and confirm Ops Pulse tile reflects latest seed | Data ↔ Support | Metrics output archived in `artifacts/ops/dry_run_2025-10-16/metrics/` | ☐ |
| 2 | Spot-check CX Escalations modal with feature flags toggled (AI on/off) | Support | Screenshots saved to evidence folder | ☐ |
| 3 | Verify Chatwoot sandbox conversations match scenario scripts | Support ↔ Enablement | Conversation IDs noted in `feedback/support.md` | ☐ |

### Day-of Run (2025-10-16)
#### Pre-Session (T-1h)
- Launch staging OCC and verify login + tile load.
- Confirm Zoom/recording setup + backup recorder.
- Post quick reminder in `#occ-ops` with access tips and parking lot expectations.

#### Live Session Duties
- Facilitate per agenda (`docs/runbooks/operator_training_agenda.md`), watching timing.
- Capture questions + blockers in `docs/runbooks/operator_training_qa_template.md` (tag owner + due date).
- Log decision IDs, telemetry observations, and attendee quotes during each scenario.
- Monitor feature flags + data freshness; flag anomalies immediately in chat.
- Reference the rate-limit playbook if Shopify throttling occurs mid-session; capture evidence per checklist above.

#### Immediate Post-Session (within 2h)
1. Upload recordings, chat logs, screenshots, and decision log excerpts to `artifacts/ops/dry_run_2025-10-16/`.
2. Publish Memory summary (`scope="ops"`, `topic="dry_run_2025-10-16"`) with success metrics + follow-ups.
3. Update `feedback/support.md` (new dated section) summarizing outcomes, blockers, next steps.
4. Notify product, enablement, and manager in # with Memory + artifact links.

### Day +1 Follow-Through (2025-10-17)
- Ensure action owners have tickets or tasks logged (Linear, internal channel threads, Feedback docs).
- Update job aids/runbooks with confirmed changes from session feedback; request reviews as needed.
- Coordinate with integrations on any Shopify credential or deploy adjustments identified.
- Prep for production go-live checklist (`docs/deployment/production_go_live_checklist.md`) incorporating dry run learnings.

### Evidence Staging Table
| Evidence Item | Path (repo or artifact) | Prepared By | Status | Notes |
| --- | --- | --- | --- | --- |
| Supabase parity snapshot | `artifacts/monitoring/supabase-parity_2025-10-10T01-25-10Z.json` | Product | ✅ Ready | Attach to Linear/Memory when backlog lifts |
| Synthetic smoke (`?mock=0`) response header | `artifacts/ops/dry_run_2025-10-16/mock0-smoke.png` (placeholder) | Reliability | ⏳ Awaiting green response | Replace placeholder once redeploy succeeds |
| Curl transcript (`?mock=0`) | `artifacts/integrations/shopify/<date>/curl_mock0_<timestamp>.log` | Support | ⏳ Pending | Template staged; run immediately after DEPLOY-147 bundle |
| Mock-mode modal screenshots | `artifacts/ops/dry_run_2025-10-16/screenshots/mock/` | QA | ✅ Ready | Swap with live-mode gallery post-QA sign-off |
| Credential receipt log | `artifacts/integrations/shopify/2025-10-10/store-access.md` | Deployment | ⏳ Pending | Populate with invite recipients + timestamps |
| Operator comms broadcast | `docs/marketing/launch_comms_packet.md` §2B | Support ↔ Marketing | ✅ Template staged | Send once evidence table shows all ✅ |

## Evidence & Logging Requirements
- Store all media + logs under `artifacts/ops/dry_run_2025-10-16/` (screenshots, recordings, metrics, decision IDs).
- Maintain chronological entries in `feedback/support.md`; mirror cross-team dependencies in `feedback/enablement.md`, `feedback/product.md`, `feedback/integrations.md`, and `feedback/reliability.md` as applicable.
- Reference this checklist in post-run communications to demonstrate completion and highlight outstanding items.

## Risk & Escalation Triggers
- **Credentials:** Any missing Shopify/Chatwoot/Supabase credential ≤24h before session → escalate to deployment + manager.
- **Data parity:** Nightly metrics or seeded conversations unavailable by T-12h → notify data/reliability; prepare mocked walkthrough fallback.
- **Feature drift:** UI deviations from runbooks/job aids → capture screenshots, alert product, and document in Q&A + feedback logs.

## Change Log
| Date | Author | Change |
|------|--------|--------|
| 2025-10-10 | support | Added support inbox contact and QA evidence refresh trigger section |
| 2025-10-12 | support | Documented Chatwoot Fly cut-over prep and T-48 task alignment with reliability |
| 2025-10-10 | support | Drafted initial checklist to resume dry run prep work per manager direction |
| 2025-10-10 | support | Added rate-limit playbook references and facilitator briefing task |
| 2025-10-10 | support | Added evidence staging table to align artifacts ahead of staging access rollout |
