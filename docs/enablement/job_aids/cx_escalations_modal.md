---
epoch: 2025.10.E1
doc: docs/enablement/job_aids/cx_escalations_modal.md
owner: enablement
last_reviewed: 2025-10-08
doc_hash: TBD
expires: 2025-10-15
---
# CX Escalations Modal — Operator Job Aid

## Overview
Resolve at-risk conversations directly from the dashboard. The CX Escalations modal surfaces SLA context, recent messages, and AI-suggested replies so operators can respond, escalate, or close conversations without leaving HotDash.

> Screenshot callouts pending designer assets. Coordinate with design (docs/directions/designer.md) before distributing outside the enablement team.

---

## Pre-Flight Checklist
- Chatwoot integration connected and `FEATURE_MODAL_APPROVALS` enabled in staging/prod.
- Operators authenticated in Chatwoot (single sign-on or API token) to avoid send failures.
- Confirm SLA threshold in `CHATWOOT_SLA_MINUTES` matches training scenario (default 60 minutes).
- Verify reply templates (`app/services/chatwoot/templates.ts`) are up to date with marketing-approved copy.

---

## Workflow Steps
1. **Open conversation** — From the CX Escalations tile, click an item to launch the modal. Review the header for customer name, status, and SLA breach timestamp.
2. **Scan context** — Read the last 3–5 messages in the Conversation Preview. Confirm the customer's latest request and tone.
3. **Evaluate the suggested reply** — Compare the AI suggestion with the scenario. Check for correct customer name, promise, and next steps. Edit inline if adjustments are needed.
4. **Choose an action**:
   - `Approve & Send Reply` when the suggestion is accurate and resolves the request.
   - `Edit Reply` to tailor tone or content before sending.
   - `Escalate to Manager` for policy exceptions, high-dollar refunds, or dissatisfied tone after breach.
   - `Mark Resolved` only after the customer confirms resolution or a follow-up plan is in place.
5. **Confirm decision logging** — Wait for the success toast (`Reply sent to {customer}` or `Decision logged to audit trail`). If an error toast appears, retry once and escalate to reliability if it persists.
6. **Document next steps** — Capture any follow-up tasks in the operator Q&A template and log decisions in Memory (`scope: ops`, `decision_type: cx.escalation`).

---

## Decision Guardrails
- **Breach age > 2 hours** — Prioritize immediate reply; escalate if promise requires cross-team support.
- **Customer requests supervisor or refund > $500** — Use `Escalate to Manager`; include summary in Chatwoot internal note.
- **AI suggestion missing or mismatched** — Do not approve; either edit manually or escalate to ensure accuracy.
- **No customer acknowledgement within 24 hours after approval** — Re-open the modal, follow up, and update the audit trail note.
- **Repeated breaches from same customer in 7 days** — Flag to support lead for root-cause review.

---

## Escalation Path
- **CX Lead (Morgan Patel):** High-priority breaches, policy exceptions, or template gaps.
- **Operations Manager (Riley Chen):** Issues crossing into fulfillment delays or cross-functional blockers.
- **Reliability On-Call:** Modal errors, Chatwoot API failures, or audit log discrepancies (`#incidents` channel).

Record escalations in `feedback/enablement.md` with context, owner, and follow-up deadline.

---

## Training Tips
- Role-play conversation types: shipping delay, refund request, and angry customer scenarios.
- Emphasize tone review before approving AI suggestions; have operators explain why the response is appropriate.
- Encourage operators to use the internal note field to capture promises—reinforce compliance expectations.
- Track common edit patterns to inform future template updates (log insights in Memory and `feedback/enablement.md`).

---

## Follow-Up Materials
- Detailed SOP: `docs/runbooks/cx_escalations.md`
- Template catalogue: `app/services/chatwoot/templates.ts`
- KPI definitions: `docs/data/kpis.md`

Collect open questions during trainings and append them to `feedback/enablement.md` ahead of the 2025-10-16 dry run.
