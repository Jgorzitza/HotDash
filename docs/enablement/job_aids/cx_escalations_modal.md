---
epoch: 2025.10.E1
doc: docs/enablement/job_aids/cx_escalations_modal.md
owner: enablement
last_reviewed: 2025-10-10
doc_hash: TBD
expires: 2025-10-16
---
# CX Escalations Modal — Operator Job Aid

## Overview
Resolve at-risk conversations directly from the dashboard. The CX Escalations modal surfaces SLA context, message history, AI-suggested replies, and audit-note capture so operators can respond, escalate, or close conversations without leaving HotDash.

> Annotated visual: `docs/design/assets/modal-cx-escalations-annotations.svg` (focus + tooltip overlays). Pair with `docs/enablement/job_aids/annotations/2025-10-16_dry_run_callouts.md` when building facilitator packets.

### Modal Layout Quick Reference
- **Header:** Customer name, Chatwoot conversation ID, and status badge (breach indicator shown when SLA breached).
- **Conversation history:** Scrollable log (role="log") alternating Agent/Customer labels with timestamps.
- **Suggested reply:** Editable textarea seeded with AI copy when `FEATURE_AI_ESCALATIONS=1`; empty when AI abstains.
- **Internal note:** Required audit summary that syncs to Supabase decision logs.
- **Actions:** `Approve & send`, `Escalate`, `Mark resolved`, plus secondary `Cancel`. Primary button disabled until reply textarea contains text.

---

## Pre-Flight Checklist
- Chatwoot integration connected and `FEATURE_MODAL_APPROVALS=1` in the target environment (staging or production).
- Operators authenticated in Chatwoot (single sign-on or API token) to avoid send failures.
- Confirm SLA threshold in `CHATWOOT_SLA_MINUTES` matches the training scenario (default 60 minutes).
- Verify reply templates (`app/services/chatwoot/templates.ts`) align with marketing-approved copy and latest guardrails.
- Confirm Supabase decision log syncing (`scope="ops"`, `decision_type="cx.escalation"`) so modal actions surface in evidence bundles.

---

## Workflow Steps
1. **Open conversation** — From the CX Escalations tile, click a breached conversation to launch the modal. Review the header for customer name, conversation ID, and status.
2. **Scan conversation history** — Use the scrollable log to confirm the customer's latest request, tone, and any prior commitments. Capture timestamps needed for the audit note.
3. **Evaluate or draft reply** — If AI copy exists, edit it directly in the Suggested reply textarea. When AI abstains, draft a manual response or plan to escalate.
4. **Capture audit note** — Populate the Internal note textarea with promise details, owner handoffs, or escalation context. Notes sync to the Supabase decision log payload.
5. **Choose an action**:
   - `Approve & send` when the reply is accurate, policy compliant, and resolves the request.
   - `Escalate` for policy exceptions, high-dollar refunds (> $500), repeat breaches, or tone concerns.
   - `Mark resolved` when the customer confirms closure or a follow-up plan is locked.
   - `Cancel` to exit without logging a decision (no Supabase write).
6. **Confirm decision logging** — After submit, the modal closes automatically. Validate the Supabase decision row (use sample IDs 101–104 during rehearsal) and capture the ID + summary in the Q&A template.
7. **Document next steps** — Record follow-up owners in the run-of-show doc and add Memory entries (`scope="ops"`, `decision_type="cx.escalation"`) within 2h.

---

## Decision Guardrails
- **Breach age > 2 hours** — Prioritize immediate reply; escalate if cross-team support or refunds are required.
- **Refund or adjustment > $500** — Choose `Escalate`; let the manager approve financial exceptions.
- **AI suggestion missing or inaccurate** — Never approve without edits. Escalate when tone, policy, or facts are uncertain.
- **No customer acknowledgement within 24 hours** — Follow up, capture a fresh internal note, and re-log the decision.
- **Repeat breaches (same customer within 7 days)** — Escalate and tag the support lead; capture pattern details in Memory for postmortem.

---

## Escalation Path
- **CX Lead (Morgan Patel):** High-priority breaches, policy exceptions, or template gaps.
- **Operations Manager (Riley Chen):** Issues crossing into fulfillment delays or cross-functional blockers.
- **Reliability On-Call:** Modal errors, Chatwoot API failures, or Supabase decision log discrepancies (`#incidents`). Attach decision ID + error payload when paging.

Record escalations in `feedback/enablement.md` with context, owner, and follow-up deadline.

---

## Training Tips
- Role-play conversation types: shipping delay, refund request, and angry customer scenarios.
- Emphasize tone review before approving AI suggestions; have operators explain why the response is appropriate.
- Prompt operators to capture internal notes before any action—this powers compliance reviews and Supabase evidence.
- Track common edit patterns to inform future prompt tuning (log insights in Memory and `feedback/enablement.md`).

---

## Facilitator Talking Points (Pre-Distribution)
- Open with the current staging status: job aid remains in mock-only circulation until the `?mock=0` smoke case returns 200; rehearse using sample IDs 101–104.
- Narrate the modal workflow end-to-end (history → reply → note → action) and press operators to verbalise why they selected `Approve & send`, `Escalate`, or `Mark resolved`.
- Reinforce internal note must capture promise + owner; have facilitators write the exact Supabase decision ID in the Q&A template while the modal closes.
- Highlight guardrail thresholds (refunds > $500, repeat breaches, tone uncertainty) before the first scenario so participants know when escalation is mandatory.
- Close each scenario by logging a Memory entry (`scope="ops"`, `decision_type="cx.escalation"`) within 2h and flagging any unclear copy for AI prompt tuning follow-up.

---

## Follow-Up Materials
- Detailed SOP: `docs/runbooks/cx_escalations.md`
- Template catalogue: `app/services/chatwoot/templates.ts`
- KPI definitions: `docs/data/kpis.md`

Collect open questions during trainings and append them to `feedback/enablement.md` ahead of the 2025-10-16 dry run.
