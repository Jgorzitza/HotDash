---
epoch: 2025.10.E1
doc: docs/enablement/job_aids/sales_pulse_modal.md
owner: enablement
last_reviewed: 2025-10-10
doc_hash: TBD
expires: 2025-10-16
---
# Sales Pulse Modal — Operator Job Aid

## Overview
Surface daily sales health in one place. Use the Sales Pulse modal to compare today's performance against the 7-day baseline, review top-performing SKUs, triage fulfillment blockers, and capture follow-up actions that sync to Supabase decision logs.

> Annotated references: `docs/design/assets/modal-sales-pulse-annotations.svg` (modal overlays) and `docs/design/assets/sales-pulse-sparkline-hover.svg` (sparkline detail). Pair with `docs/enablement/job_aids/annotations/2025-10-16_dry_run_callouts.md` during facilitator prep.

### Modal Layout Quick Reference
- **Header:** Title + day-of revenue summary and order count.
- **Top SKUs:** Table highlighting up to five revenue drivers (units + revenue).
- **Open fulfillment issues:** List of outstanding orders with Shopify `displayStatus`.
- **Capture follow-up:** Action dropdown (`Log follow-up`, `Escalate to ops`) and notes textarea that sync to decision logs.
- **Footer actions:** Primary button mirrors the selected action label; secondary `Cancel` exits without logging.

---

## Pre-Flight Checklist
- Shopify integration connected and data refresh < 15 minutes old (check tile meta text).
- Operator signed into Shopify Admin with appropriate permissions.
- Inventory Heatmap tile reviewed for overlapping SKU risks.
- `FEATURE_MODAL_APPROVALS=1` in the target environment; confirm via staging checklist before the session.
- Supabase decision log sync healthy (`scope="ops"`, `decision_type="sales.health_check"`) so modal submissions generate evidence IDs.

---

## Workflow Steps
1. **Open the modal** — Click `View details` on the Sales Pulse tile from the Operator Control Center dashboard.
2. **Review the header summary** — Capture today's revenue and order count. Compare against the 7-day baseline from `docs/data/kpis.md` (warning at ±15%, critical at ±30%).
3. **Scan Top SKUs** — Identify revenue drivers, cross-check inventory health, and flag any SKU appearing in low-stock alerts for follow-up.
4. **Audit fulfillment blockers** — Review the "Open fulfillment issues" list. For each order, confirm Shopify status, identify blockers, and assign an owner in the Q&A template.
5. **Capture follow-up** — Use the Action dropdown to choose `Log follow-up` (for routine adjustments) or `Escalate to ops` (for staffing, systemic, or SLA risks). Add context in the Notes textarea (recommended: owner, channel, expected resolution time).
6. **Submit and verify** — Click the primary action button to log the decision. On success the modal closes; confirm the Supabase decision log row (use sample IDs 101–104 during rehearsal) and record the ID, action, and notes in the Q&A template.
7. **Document Memory entry** — Within 2h, capture a Memory log (`scope="ops"`, `decision_type="sales.health_check"`) referencing the Supabase ID and any follow-up commitments.

---

## Decision Guardrails
- **Revenue delta > 15% drop** — `Escalate to ops` and engage product if the drop exceeds 30% or persists for more than two checkpoints.
- **Sustained order spike (>25% over baseline)** — `Log follow-up` and notify fulfillment lead to adjust staffing; escalate if carriers cannot absorb the volume.
- **Pending fulfillment older than 24h** — Escalate to fulfillment lead immediately; log the order ID, owner, and remediation ETA in the notes field.
- **Top SKU at risk (<3 days of cover)** — Coordinate with inventory to trigger reorder workflow or mark intentional scarcity; include the transfer/PO plan in the notes field.

---

## Escalation Path
- **Ops Lead (Riley Chen):** Revenue anomalies, fulfillment bottlenecks, staffing adjustments.
- **Support Lead (Morgan Patel):** Orders blocked due to CX escalations or policy issues.
- **Product (Jordan Alvarez):** Metric anomalies tied to instrumentation or data quality.
- Attach the Supabase decision ID, action selection, and notes when escalating so follow-up owners can reference the audit trail.

Record each escalation in `feedback/enablement.md` with timestamp, channel, and outcome for sprint reporting.

---

## Training Tips
- Anchor conversations around "What changed vs. last week?" to drive proactive investigation.
- Pair the modal review with live Shopify order lookups for realism.
- Encourage operators to narrate the Action dropdown choice and note content; capture phrasing for future prompt tuning and scripts.

---

## Facilitator Talking Points (Pre-Distribution)
- Set context that distribution pauses until `https://hotdash-staging.fly.dev/app?mock=0` serves 200; rehearse with mock data and Supabase samples 101–104 in the interim.
- Walk through revenue deltas first, then Top SKUs, then fulfillment blockers so operators practice prioritising actions by impact.
- Call out how to document ownership: Action dropdown selection + notes should capture owner, channel, and ETA before submitting.
- Spotlight the guardrail thresholds (±15% warning, ±30% critical) and prompt operators to state the escalation path aloud when thresholds hit.
- Wrap by reminding facilitators to mirror the decision in Memory (`scope="ops"`, `decision_type="sales.health_check"`) and log any data quality questions for product follow-up.

---

## Follow-Up Materials
- Training agenda reference: `docs/runbooks/operator_training_agenda.md`
- KPI source of truth: `docs/data/kpis.md`
- Fulfillment blocker SOPs: `docs/runbooks/cx_escalations.md` (coordinate when blockers stem from CX issues)

Add open questions to `feedback/enablement.md` so marketing and product can supply supporting visuals before the 2025-10-16 dry run.
