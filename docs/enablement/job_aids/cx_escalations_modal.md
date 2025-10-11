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
- Credentials check complete: Supabase + Chatwoot keys validated 2025-10-10 15:45 UTC; log any regression immediately via `customer.support@hotrodan.com` and # `#occ-reliability`.
- Chatwoot Fly migration pending — review the validation steps in `docs/runbooks/cx_escalations.md` so you can brief operators on the new host once reliability confirms cut-over.

## Chatwoot on Supabase — Architecture Talking Points
- **Runtime:** Chatwoot web + Sidekiq workers now live on Fly.io. Redis (Upstash) backs job queues, but all durable data routes to Supabase so audit and retention policies stay centralized.
- **Persistence:** Conversation history, templates, and decision logs share Supabase tables. Remind operators that every modal action writes to Supabase first, then emits to Chatwoot; evidence trails therefore live under the Supabase NDJSON exports referenced in training packets.
- **Access & Credentials:** The Shopify embed token unlocks the Chatwoot Fly host inside the dashboard. Any credential drift (Shopify, Chatwoot API, Supabase service key) surfaces as modal errors—log via `customer.support@hotrodan.com` with artifact paths.
- **Guardrails:** Retention and restart cycles follow Supabase compliance runbooks (`docs/runbooks/incident_response_supabase.md`). Reinforce during training that operators must escalate if they spot gaps so compliance can refresh evidence.

---

## Workflow Steps
1. **Open conversation** — From the CX Escalations tile, click an item to launch the modal. Review the header for customer name, status, and SLA breach timestamp.
2. **Scan context** — Read the last 3–5 messages in the Conversation Preview. Confirm the customer's latest request and tone.
3. **Evaluate the suggested reply** — Compare the AI suggestion with the scenario. Check for correct customer name, promise, and next steps. Edit inline if adjustments are needed.
4. **Choose an action**:
   - `Approve & send` when the suggestion is accurate and resolves the request.
   - `Escalate` for policy exceptions, high-dollar refunds, or dissatisfied tone after breach.
   - `Mark resolved` only after the customer confirms resolution or a follow-up plan is in place.
   - `Cancel` to keep the conversation open while you gather more context.
5. **Confirm decision logging** — Wait for the success toast (`Reply sent to {customer}` or `Decision logged to audit trail`). If an error toast appears, retry once and escalate to reliability if it persists.
6. **Document next steps** — Capture any follow-up tasks in the operator Q&A template and log decisions in Memory (`scope: ops`, `decision_type: cx.escalation`). Email `customer.support@hotrodan.com` within 5 minutes if the decision requires cross-team follow-up.

---

## Decision Guardrails
- **Breach age > 2 hours** — Prioritize immediate reply; escalate if promise requires cross-team support.
- **Customer requests supervisor or refund > $500** — Use `Escalate to Manager`; include summary in Chatwoot internal note.
- **AI suggestion missing or mismatched** — Do not approve; either edit manually or escalate to ensure accuracy.
- **No customer acknowledgement within 24 hours after approval** — Re-open the modal, follow up, and update the audit trail note.
- **Repeated breaches from same customer in 7 days** — Flag to support lead for root-cause review.

### AI Guardrails & Evidence — 2025-10-10
- Daily suggestion set must originate from the refreshed operator index (`packages/memory/indexes/operator_knowledge/index_metadata.json`, generated 2025-10-10T19:26:46Z with OpenAI embeddings); reject replies if the metadata timestamp predates your session.
- Staging corpus pulled from hotrodan.com at 2025-10-10T19:26Z (`packages/memory/logs/build/hotrodan_content/hotrodan-2025-10-10-19-26-14.ndjson`); escalate to reliability if fetch errors exceed the logged 404s for `/faq`, `/about`, `/support`.
- Recommendation logging verified via `npm run ai:log-recommendation` with detail at `packages/memory/logs/build/recommendations/build-nightly-logging-2025-10-10-20251010T192605.json`; confirm a fresh decision entry before approving AI output in production.
- Compliance pairing with QA underway (2025-10-10 audit window); channel any anomalies to `#occ-qa` so findings land in `feedback/ai.md` alongside the nightly evidence bundle.

---

## Escalation Path
- **CX Lead (Morgan Patel):** High-priority breaches, policy exceptions, or template gaps.
- **Operations Manager (Riley Chen):** Issues crossing into fulfillment delays or cross-functional blockers.
- **Reliability On-Call:** Modal errors, Chatwoot API failures, or audit log discrepancies (`#incidents` channel).
- **Support Desk:** Email `customer.support@hotrodan.com` for operator-access issues or credential drift; include logs/screenshots.

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
