---
epoch: 2025.10.E1
doc: docs/runbooks/support_marketing_localization_sync.md
owner: support
last_reviewed: 2025-10-08
doc_hash: TBD
expires: 2025-10-21
---
# Support–Marketing Copy Alignment Playbook

## Purpose
Keep support coaching, enablement runbooks, and operator trainings aligned with the approved English copy deck. Ensure every customer-facing touchpoint (dashboard UI, Chatwoot replies, runbooks, job aids) uses the same terminology, tone, and guardrails.

---

## Canonical References
- `docs/design/copy_deck.md` — Source of truth for Operator Control Center UI strings (English only)
- `docs/design/visual_hierarchy_review.md` — Modal and tile layout references for enablement callouts
- `docs/marketing/brand_tone_deck.md` — Tone and voice guidelines for operator communications
- `app/services/chatwoot/templates.ts` — Production-ready Chatwoot macros used by support

> Always reconcile runbook updates against the copy deck before shipping changes.

---

## English-Only Alignment Principles
- **Single language:** All enablement materials, runbooks, and macros are delivered in English. Remove legacy French/localization references when encountered.
- **Exact terminology:** Use the precise wording from the copy deck (e.g., "Approve & Send Reply", "Decision logged to audit trail"). Avoid ad-hoc synonyms.
- **Tone consistency:** Mirror the action-oriented, empathetic tone captured in the brand tone deck and Chatwoot templates.
- **Change traceability:** Capture deviations or copy requests in `feedback/enablement.md` with links to the impacted material.

---

## Audit Checklist (Runbooks & Trainings)
Run this checklist whenever operator enablement content is updated:
1. `docs/runbooks/*` — Remove bilingual strings, glossary tables, or translation queues. Replace with English terminology pulled from the copy deck.
2. `docs/runbooks/operator_training_agenda.md` — Confirm references to dependencies mention English-only job aids and copy sources.
3. `docs/runbooks/cx_escalations.md` and other tile guides — Verify button labels, toast text, and modal headings match the copy deck exactly.
4. `docs/marketing/*` references — If pointing to retired localization requests, swap with current English artifacts or remove.
5. Job aids and quick-start guides — Ensure image callouts and captions use approved English text.

Document any edits or questions in `feedback/enablement.md` so marketing/support can trace the audit.

---

## Chatwoot Template Alignment (English)
1. Review each template in `app/services/chatwoot/templates.ts` against the copy deck language.
2. Confirm tone matches the brand tone deck (professional, empathetic, action-oriented).
3. Highlight mismatches in `feedback/enablement.md` with the template key and proposed revision.
4. Once marketing approves, coordinate with engineering to ship updated macros and notify support trainers.

**Callouts:**
- `ack_delay`, `ship_update`, and `refund_offer` already align with the current tone. Use them as exemplars for new templates.
- If operators suggest alternative phrasing, capture rationale and route through marketing before updating source material.

---

## Support ⇄ Marketing Coordination
**Cadence:**
- **Weekly (Wed):** 15-minute huddle to review copy deck diffs and upcoming launches.
- **Ad-hoc:** Spin up when product ships new modals, tiles, or toasts that require enablement collateral.

**Agenda Template:**
1. Review copy deck changes since last sync.
2. Surface enablement doc updates and confirm terminology.
3. Share operator feedback gathered from trainings or pilots.
4. Align on messaging for upcoming Sales Pulse/CX Escalations walkthroughs.
5. Decide owners and due dates for copy revisions.

**Evidence:** Log outcomes in Memory (`scope: ops`, `decision_type: support.copy_alignment`) and attach edited docs/job aids.

---

## Copy Change Workflow
1. Draft proposed English copy update (context + desired change).
2. File note in `feedback/enablement.md` with link to the source doc and copy snippet.
3. Tag marketing owner for approval; include screenshots if UI text is involved.
4. Once approved, update the relevant runbook/job aid and notify support trainers.
5. Record the change in the artifact revision history (table at bottom of doc or commit message).

---

## Training Terminology Quick Reference (English)
| UI Element | Approved Label | Usage in Training |
|------------|----------------|-------------------|
| CX Escalations tile CTA | View & Reply | Start operator walkthroughs here |
| Modal approval button | Approve & Send Reply | Reinforce decision logging behavior |
| Toast success | Reply sent to {customer} | Highlight confirmation of outbound message |
| Audit trail entry | Decision logged to audit trail | Emphasize compliance recording |
| Error toast | Action failed — please try again | Coach on retry + escalation path |

Use these phrases exactly in live trainings, job aids, and knowledge base entries.

---

## Revision History
| Date | Author | Change |
|------|--------|--------|
| 2025-10-08 | enablement | Converted runbook to English-only copy alignment playbook and removed localization workflows |
| 2025-10-07 | support | Initial localization glossary and marketing sync protocol per manager sprint focus |
