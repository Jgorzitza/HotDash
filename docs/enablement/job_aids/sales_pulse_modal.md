---
epoch: 2025.10.E1
doc: docs/enablement/job_aids/sales_pulse_modal.md
owner: enablement
last_reviewed: 2025-10-08
doc_hash: TBD
expires: 2025-10-15
---
# Sales Pulse Modal — Operator Job Aid

## Overview
Surface daily sales health in one place. Use the Sales Pulse modal to compare today's performance against the 7-day baseline, review top-performing SKUs, and triage fulfillment blockers before they impact customers.

> Screenshot callouts pending final design assets. Coordinate with designer per docs/directions/designer.md before distributing printed copies.

---

## Pre-Flight Checklist
- Shopify integration connected and data refresh < 15 minutes old (check tile meta text).
- Operator signed into Shopify Admin with appropriate permissions.
- Inventory Heatmap tile reviewed for overlapping SKU risks.
- Decision log access confirmed for follow-up (audit trail retained for 90 days).
- Credentials check complete: staging Shopify + Supabase keys validated 2025-10-10 15:45 UTC; report any errors to `customer.support@hotrodan.com` and # `#occ-reliability`.
- Note upcoming Chatwoot Fly migration: partner with support to surface updated CX escalation workflows in this modal if the cut-over happens before the dry run.

---

## Workflow Steps
1. **Open the modal** — Click `View details` on the Sales Pulse tile from the Operator Control Center dashboard.
2. **Review the revenue snapshot** — Note today's revenue versus the rolling 7-day average. Use the KPI thresholds from `docs/data/kpis.md` (warning at ±15%, critical at ±30%).
3. **Scan order volume** — Confirm the order count matches expectations for the time of day. Flag unexpected dips or spikes in `#occ-ops` internal channel.
4. **Inspect Top SKUs** — Identify SKUs driving revenue. Cross-check availability in the Inventory Heatmap; queue replenishment discussions if a top SKU appears in low-stock alerts.
5. **Triage fulfillment blockers** — Scroll to the "Open fulfillment" list. For each pending order, verify status in Shopify and log owner + next action in the training Q&A template.
6. **Capture decisions** — Use the action select to choose `Log follow-up` or `Escalate to ops`, add notes for the audit trail, and submit. Log the decision in Memory (`scope: ops`, `decision_type: sales.health_check`) and forward supporting context to `customer.support@hotrodan.com` when variance exceeds 15% or fulfillment blockers persist.

---

## Decision Guardrails
- **Revenue delta > 15% drop** — Create an action item for operations; escalate to product if drop exceeds 30% or persists >2 checkpoints. Email `customer.support@hotrodan.com` with the summary so support has audit coverage.
- **Sustained order spike (>25% over baseline)** — Notify fulfillment lead to adjust staffing, confirm carriers can absorb the volume.
- **Pending fulfillment older than 24h** — Page fulfillment lead for immediate follow-up; if order value >$500, notify operations manager.
- **Top SKU out of stock or <3 days of cover** — Partner with inventory owner to trigger reorder workflow or mark as intentional scarcity.

### AI Guardrails & Evidence — 2025-10-10
- Modal insights load from the same operator knowledge index refreshed at 2025-10-10T19:26:46Z (`packages/memory/indexes/operator_knowledge/index_metadata.json`); postpone coaching if the timestamp drifts or `usingMockProviders` flips to `true`.
- Hotrodan corpus snapshot logged at `packages/memory/logs/build/hotrodan_content/hotrodan-2025-10-10-19-26-14.ndjson`; confirm future training pulls append (not overwrite) before citing AI context in operator Q&A.
- Nightly recommendation logging test (`packages/memory/logs/build/recommendations/build-nightly-logging-2025-10-10-20251010T192605.json`) proves audit trail coverage—spot check that a decision record posts before sharing AI-driven sales actions.
- Repository scan `git grep postgresql://` completed 2025-10-10T19:25Z with only canonical placeholders, ensuring no Supabase DSNs leak into enablement collateral; re-run if you ingest new evidence before the next audit.

---

## Escalation Path
- **Ops Lead (Riley Chen):** Revenue anomalies, fulfillment bottlenecks, staffing adjustments.
- **Support Lead (Morgan Patel):** Orders blocked due to CX escalations or policy issues.
- **Product (Jordan Alvarez):** Metric anomalies tied to instrumentation or data quality.
- **Support Desk:** Email `customer.support@hotrodan.com` if operators lose staging access or credential checks fail.

Record each escalation in `feedback/enablement.md` with timestamp, channel, and outcome for sprint reporting.

---

## Training Tips
- Anchor conversations around "What changed vs. last week?" to drive proactive investigation.
- Pair the modal review with live Shopify order lookups for realism.
- Encourage operators to narrate their decision path; capture phrasing for future scripts.

---

## Follow-Up Materials
- Training agenda reference: `docs/runbooks/operator_training_agenda.md`
- KPI source of truth: `docs/data/kpis.md`
- Fulfillment blocker SOPs: `docs/runbooks/cx_escalations.md` (coordinate when blockers stem from CX issues)

Add open questions to `feedback/enablement.md` so marketing and product can supply supporting visuals before the 2025-10-16 dry run.
