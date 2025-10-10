---
epoch: 2025.10.E1
doc: docs/runbooks/operator_training_qa_template.md
owner: support
last_reviewed: 2025-10-10
doc_hash: TBD
expires: 2025-10-17
---
# Operator Training Q&A Capture Template

## Usage
- Open this document during dry runs and live trainings to log operator questions, confusing states, and follow-up actions.
- Each entry should include supporting evidence (timestamp, screenshot link, decision log ID) and an owner + due date.
- After the session, copy relevant items into `feedback/support.md`, `feedback/enablement.md`, and Memory (`scope="ops"`) so stakeholders can track resolution.

## Session Details
- **Session:** Shopify Dry Run Rehearsal
- **Date / Time:** 2025-10-16 13:00 ET
- **Facilitators:** Product — Justin; Support — TBD (awaiting enablement confirmation); Enablement — TBD
- **Attendees:** See `docs/strategy/operator_dry_run_pre_read_draft.md`
- **Environment:** OCC staging `https://hotdash-staging.fly.dev/app` (`?mock=1` default), feature flags `FEATURE_MODAL_APPROVALS`, `FEATURE_AI_ESCALATIONS`

## Question Log
| # | Timestamp | Participant | Question / Observation | Context (Tile / Feature) | Immediate Answer | Owner | Follow-up Due |
|---|-----------|-------------|------------------------|---------------------------|------------------|-------|---------------|
| 1 | 2025-10-10T03:00Z | Support | Need deployment to confirm Shopify staging credential bundle drop (DEPLOY-147) for rehearsal install steps | Shopify staging install | Pending — waiting on deployment update | Deployment | 2025-10-10 |
| 2 | 2025-10-10T03:00Z | Support | Confirm when reliability expects sustained green synthetic check for `https://hotdash-staging.fly.dev/app?mock=0` | Shopify validation queue | Pending — rerun curl after reliability update | Reliability | 2025-10-10 |
| 3 | 2025-10-10T03:00Z | Enablement | Clarify facilitator assignments and note-taking owners before invites send | Dry run logistics | Pending — enablement compiling roster | Enablement | 2025-10-12 |

> Add rows as needed. Use ISO timestamps (e.g., `2025-10-16T13:27Z`).

## Action Items
| # | Task | Owner | Due Date | Status |
|---|------|-------|----------|--------|
| 1 | Publish finalized facilitator roster + note-taking owners in agenda | Enablement ↔ Support | 2025-10-12 | ☐ |
| 2 | Capture curl/screenshot evidence for Shopify validation queue once `?mock=0` responds | Support | 2025-10-11 | ☐ |
| 3 | Distribute credential bundle summary and guardrails to operators after DEPLOY-147 closes | Deployment ↔ Support | 2025-10-10 | ☐ |

## Evidence Links
- Screenshots:
- Decision Logs / Supabase IDs:
- Slack Threads:
- Other Artifacts:

## Summary Notes
- Key takeaways:
- Outstanding risks:
- Recommended updates to runbooks/job aids:

## Change Log
| Date | Author | Change |
|------|--------|--------|
| 2025-10-10 | support | Pre-filled dry run session metadata and open questions |
