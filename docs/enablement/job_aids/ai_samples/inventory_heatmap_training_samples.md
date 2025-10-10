# Inventory Heatmap — AI Dry Run Samples (2025-10-09 Draft)

## Telemetry Callouts
- Track Supabase facts associated with inventory alerts (`factType="shopify.inventory.health"`, `factType="shopify.inventory.transfer"`) and log IDs in the Q&A worksheet.
- Document Shopify transfer or PO references alongside Supabase entries so QA can replay actions against the staging database.
- If sync is offline, capture tile screenshots and note fallback log locations (`feedback/ai.md`, Memory `scope="ops"`) for reconciliation.

## Facilitation Notes
- Frame each scenario with the operational outcome (reorder, transfer, intentional low stock) and ask operators to justify the action using telemetry cues.
- Encourage facilitators to narrate how Supabase evidence should look after each decision so attendees understand validation steps.
- Confirm scribes capture outstanding dependencies (e.g., supplier ETAs, transfer approvals) and tag owners for post-session follow-up.

## Staging Checklist
- Run `npm run ops:seed-shopify -- --mock` to repopulate low-stock scenarios before each rehearsal; confirm mock data includes the `shopify.inventory.health` facts once the Supabase sync fix lands.
- In staging OCC, open the dashboard with `?mock=1&tile=inventory` so the Inventory Heatmap stays focused during the walkthrough.
- After each action, capture the Supabase decision/fact ID for the evidence bundle; if the sync fix is still pending, note the fallback log location (`feedback/ai.md`) and attach screenshots of the tile state.

## Supabase Evidence Reference (2025-10-09 sample)
Leverage the current dataset at `artifacts/logs/supabase_decision_export_2025-10-10T07-29-39Z.ndjson` to coach evidence capture behaviors until staging secrets unlock live IDs.

| Scenario | decisionId | Status | Attempt | Duration (ms) | Notes |
| --- | --- | --- | --- | --- | --- |
| Heritage Hoodie Restock (Scenario 1) | 101 | SUCCESS | 1 | 241.12 | Aligns with a straightforward reorder approval; emphasize logging variant ID alongside the Supabase entry. |
| Powder Board Transfer (Scenario 2) | 104 | SUCCESS | 2 | 265.43 | Use to highlight retries tied to transfer approvals and the need to capture Shopify transfer IDs. |
| Limited Run Crewneck (Scenario 3) | 102 | SUCCESS | 1 | 198.77 | Demonstrate acknowledging intentional low stock while still recording a fact for audit. |
| Failure Handling Walkthrough | 103 | TIMEOUT | 3 | 1500.55 | Keep handy to explain how to document errors/timeouts and route escalation notes in the enablement worksheet. |

### Scenario 1 — Heritage Hoodie (Black L) Critical Low Stock
- **Shopify cues:** Inventory Heatmap flags Heritage Hoodie — Black L with 6 units left and 2.5 days of cover; Shopify variant `gid://shopify/ProductVariant/741902468` shows 14-day velocity of 3.5 units/day.
- **AI suggestion (inventory_restock):**  
  "Heritage Hoodie Black L is down to 6 units — at the current 3.5/day velocity we’ll stock out in under three days. Recommend triggering a 40-unit replenishment and tagging fulfillment so they can prioritize this SKU once the shipment lands."
- **Operator follow-through:** Create a draft purchase order for 40 units, notify the fulfillment lead in Slack, and annotate the decision log with shipment ETA. During the dry run, narrate how the AI pulled 14-day velocity from Shopify and double-check the variant ID.
- **Evidence logging:** Record the Supabase fact (`scope="ops"`, `factType="shopify.inventory.health"`) once sync resumes; otherwise capture the dashboard tile state and add a note in the enablement worksheet.

### Scenario 2 — Powder Board XL Location Imbalance
- **Shopify cues:** Tile highlights Powder Board XL with 18 units total but main warehouse down to 4 units; Shopify inventory detail shows Outlet location holding 14 units.
- **AI suggestion (inventory_rebalance):**  
  "Powder Board XL is short at the main warehouse (4 units) while Outlet has 14 units idle. Recommend transferring 10 units to the main warehouse to keep same-day fulfillment on track and flagging the Outlet team about the transfer."
- **Operator follow-through:** Submit an internal transfer in Shopify Moving Inventory, then update the Slack #inventory channel once the transfer is queued. Log the decision with transfer quantity, source/destination locations, and reference the Shopify transfer ID.
- **Evidence logging:** Attach the transfer confirmation screenshot and Supabase fact ID when available; if blocked, note the manual transfer ID in the enablement worksheet.

### Scenario 3 — Limited Run Crewneck (Intentional Low Stock)
- **Shopify cues:** Limited Run Crewneck shows 5 units left with 20-day velocity of 0.3/day; tagged intentionally limited in Shopify metafields (`inventory.intentional=1`).
- **AI suggestion (inventory_acknowledge):**  
  "Limited Run Crewneck is intentionally capped, so no reorder needed. Suggest pinning a note in Slack reminding the team this SKU retires after the pop-up event and ensuring the low-stock alert stays acknowledged."
- **Operator follow-through:** Add an internal note to the Inventory Heatmap to confirm intentional low stock, notify marketing to remove the SKU from next week’s promo rotation, and acknowledge the alert so it doesn’t surface in tomorrow’s stand-up.
- **Evidence logging:** Once Supabase sync resumes, add the acknowledgement fact with `meta.intentionalLowStock=true`; otherwise capture a screenshot of the acknowledged state and log the manual action in the enablement worksheet.

> **Next Steps:** When the Supabase sync fix lands, append the actual fact IDs and screenshots to this file, then bundle the updated kit with the CX Escalations and Sales Pulse samples for enablement/support distribution ahead of the 2025-10-16 rehearsal. Reference the annotated modal (`docs/design/assets/modal-inventory-heatmap-annotations.svg`) when drafting alt text so captions mirror the five callouts documented in `docs/enablement/job_aids/annotations/2025-10-16_dry_run_callouts.md`.
