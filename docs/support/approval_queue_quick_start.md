---
epoch: 2025.10.E1
doc: docs/support/approval_queue_quick_start.md
owner: support
status: draft
last_updated: 2025-10-14T00:00:00Z
---

# Approval Queue — Quick Start (Draft)

## Purpose
Enable operators to quickly approve or reject agent-suggested actions in the Operator Control Center (OCC) with clear decision criteria and an escalation path.

## Audience
Operators and team leads using OCC during pilot launch.

## Prerequisites
- Logged into Shopify Admin → Apps → HotDash
- OCC dashboard loaded with tiles and the Approval queue visible
- Access to CX Escalations tile for context (if related)

## 1. What the Approval Queue Shows
- Pending agent-suggested actions awaiting operator decision
- Context summary (source tile, key metrics, rationale)
- Recommended next step(s) with confidence notes

## 2. Approve vs. Reject — Decision Criteria
- Approve when:
  - Context is complete and aligns with current goals or SOPs
  - Risk is low to moderate and reversible (e.g., templated reply, label update)
  - The suggestion saves time and matches prior similar decisions
- Reject when:
  - Context is incomplete or appears inaccurate
  - Action is irreversible/high-risk without further review (e.g., destructive change)
  - You see conflicting evidence in the source tile or external systems

## 3. How to Approve/Reject
1. Open Approval Queue in OCC
2. Select an item to view details (context + recommended action)
3. Choose one:
   - Approve → action executes and is logged to the decision trail
   - Reject → provide brief reason; item is logged and removed from queue

## 4. Escalation Path (When in Doubt)
1. Mark as "Escalate to Ops" in the item controls
2. Add a one-line reason and any relevant references (order #, SKU, URL)
3. This routes to the internal escalation ladder per CX SOPs (see `docs/runbooks/cx_escalations.md`)

## 5. Evidence and Audit Trail
- Every decision writes an entry to the decision log (ID, actor, timestamp)
- For CX-related actions, link back to the CX Escalations tile item
- Capture screenshots when behavior seems off and attach to the ticket

## 6. Common Scenarios
- SLA-breached conversation suggests a templated reply → Approve if template fits; else Reject with reason
- Inventory alert suggests reorder threshold adjustment → Approve if restock plan validated; else Escalate
- SEO & Content Watch anomaly suggests highlighting a landing page → Approve if signal matches analytics; else Reject

## 7. FAQ
- What if the recommendation is neutral? → Prefer "Reject" with reason; keep the queue focused
- Can I undo an approval? → Use the linked action trail in the tile or file a ticket to revert
- Where is this logged? → Decision log; surface in Ops Pulse and related tiles

## 8. Next Steps
- Practice with mock data in staging (when available)
- Share confusing cases in the operator feedback channel
- Propose SOP updates when you see repeated edge cases

---
Status: Draft content (pending screenshots/UI final). Ready for pilot review.


