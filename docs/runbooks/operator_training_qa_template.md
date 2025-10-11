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
- Send updated logs and attachments to customer.support@hotrodan.com so the support inbox maintains the audit trail.
- While staging is paused, collect operator questions via #/email and pre-fill draft responses so facilitators can address them immediately once rehearsals resume.

## Session Details
- **Session:** Shopify Dry Run Rehearsal (QA evidence hold — credentials stable)
- **Status:** Credentials validated 2025-10-10 15:45 UTC; hold distribution until QA posts green `?mock=0` evidence **and** Chatwoot Fly smoke passes. Use `customer.support@hotrodan.com` for operator escalations.
- **Date / Time:** 2025-10-16 13:00 ET
- **Facilitators:** Product — Justin; Support — Morgan Patel; Enablement — Justin (acting enablement agent)
- **Attendees:** See `docs/strategy/operator_dry_run_pre_read_draft.md` — invites queued pending QA evidence drop
- **Environment:** OCC staging `https://hotdash-staging.fly.dev/app` (`?mock=1` default), feature flags `FEATURE_MODAL_APPROVALS`, `FEATURE_AI_ESCALATIONS`

## Question Log
| # | Timestamp | Participant | Question / Observation | Context (Tile / Feature) | Immediate Answer | Owner | Follow-up Due |
|---|-----------|-------------|------------------------|---------------------------|------------------|-------|---------------|
| 1 | 2025-10-10T03:00Z | Support | Need deployment to confirm Shopify staging credential bundle drop (DEPLOY-147) for rehearsal install steps | Shopify staging install | Closed — bundle validated; tracking QA evidence gate | Deployment | 2025-10-10 |
| 2 | 2025-10-10T03:00Z | Support | Confirm when reliability expects sustained green synthetic check for `https://hotdash-staging.fly.dev/app?mock=0` | Shopify validation queue | Pending — rerun curl after reliability update; share output via customer.support@hotrodan.com | Reliability | 2025-10-10 |
| 3 | 2025-10-10T03:00Z | Enablement | Clarify facilitator assignments and note-taking owners before invites send | Dry run logistics | In progress — waiting on support to publish final roster | Enablement | 2025-10-12 |
| 4 | 2025-10-10T14:20Z | Support | Confirm revised invite send timeline + comms owners while hold persists | Dry run logistics | In progress — enablement/marketing targeting resend within 2h of QA + Chatwoot green light (tentative 2025-10-14 15:00 UTC) | Enablement ↔ Marketing ↔ Support | 2025-10-14 |
| 5 | 2025-10-10T16:10Z | Enablement ↔ Support ↔ Product | Ensure new support alias shared with facilitators before packet distribution | Dry run logistics | Done — alias sent 2025-10-10 16:10 UTC | Enablement | 2025-10-10 |
| 6 | 2025-10-10T17:15Z | Support | Operator asked how Chatwoot Fly host switch affects OCC access during rehearsal pause | Chatwoot integration | Draft answer: OCC proxy continues using staging URL; share Fly host + smoke status in pre-session briefing once QA clears hold | Support | QA evidence + Fly green light |

> Add rows as needed. Use ISO timestamps (e.g., `2025-10-16T13:27Z`).

## Action Items
| # | Task | Owner | Due Date | Status |
|---|------|-------|----------|--------|
| 1 | Publish finalized facilitator roster + note-taking owners in agenda | Enablement ↔ Support | 2025-10-12 | ☐ Support drafting (due 2025-10-11 EOD) |
| 2 | Capture curl/screenshot evidence for Shopify validation queue once `?mock=0` responds | Support | 2025-10-11 | ☐ Pending QA rerun |
| 3 | Distribute credential bundle summary and guardrails to operators after DEPLOY-147 closes | Deployment ↔ Support | 2025-10-10 | ☑ Completed — credentials stable |
| 4 | Issue revised invite send timeline immediately after QA + Chatwoot green signal | Enablement ↔ Marketing ↔ Support | 2025-10-14 | ☐ Blocked — waiting on QA `?mock=0` + Chatwoot smoke |
| 5 | Prep comms + invite drafts (email + #) for rapid resend once hold lifts | Marketing ↔ Support | Draft by 2025-10-10 20:00 UTC | ☑ Drafted; ready to send on evidence drop |
| 6 | Gather operator questions asynchronously and draft responses while staging hold persists | Support | Daily through QA all-clear | ☐ In progress — updates logged in template |

## Evidence Links
- Screenshots:
- Decision Logs / Supabase IDs:
- # Threads:
- Other Artifacts:

## Summary Notes
- Key takeaways:
  - Credentials confirmed stable; rehearsals remain paused until QA delivers green `?mock=0` evidence. Unified support inbox (`customer.support@hotrodan.com`) now live for operator escalations and prep updates.
- Outstanding risks:
  - QA latency evidence delayed beyond 2025-10-11 compresses distribution window — prepare rapid send once artifacts land.
  - Operator questions may accumulate during pause; ensure async responses stay updated in template to avoid backlog.
- Recommended updates to runbooks/job aids:
  - Ensure packet/job aids highlight credential stability, QA hold status, and updated support contact.

## Change Log
| Date | Author | Change |
|------|--------|--------|
| 2025-10-10 | enablement | Updated QA hold details, support contact, and action items post credential validation |
| 2025-10-10 | support | Added support inbox routing and updated comms status guidance |
| 2025-10-10 | support | Pre-filled dry run session metadata and open questions |
| 2025-10-12 | support | Extended hold status to include Chatwoot Fly smoke and revised invite timelines |
