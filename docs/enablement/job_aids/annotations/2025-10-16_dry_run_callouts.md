---
epoch: 2025.10.E1
doc: docs/enablement/job_aids/annotations/2025-10-16_dry_run_callouts.md
owner: enablement
last_reviewed: 2025-10-10
doc_hash: TBD
expires: 2025-10-16
---
# Dry Run Visual Callouts — CX Escalations, Sales Pulse & Inventory Heatmap

Use these text callouts while waiting on final annotated screenshots from design. Pair each reference with the corresponding modal section when narrating during the 2025-10-16 rehearsal.

## CX Escalations Modal Callouts
1. **Header Summary** — Customer name + conversation ID and status. Highlight the SLA breach badge (per tooltip spec in `docs/design/tooltip_annotations_2025-10-09.md`) and remind facilitators to verbalise the breach timestamp.
2. **Conversation History** — Scrollable log with Agent/Customer labels and timestamps. Emphasise that screen readers experience this as a live region (`role="log"`).
3. **Suggested Reply Field** — Editable textarea seeded with AI copy when `FEATURE_AI_ESCALATIONS=1`. Call out the abstain state (copy absent) so operators know to escalate or draft manually.
4. **Internal Note Field** — Capture promise details, owner handoffs, and evidence references. Screenshot should show placeholder "Add context for audit trail" and note that this content syncs to Supabase.
5. **Action Buttons Row** — Guardrail summary: `Approve & send` (primary), `Escalate`, `Mark resolved`, and `Cancel`. Highlight disabled state when reply textbox is empty.

## Sales Pulse Modal Callouts
1. **Header Summary** — Revenue + order count text line. Mention referencing `docs/data/kpis.md` for ±15% / ±30% thresholds during narration.
2. **Top SKU Table** — Highlight revenue + units columns; flag SKUs that also appear in the Inventory Heatmap for restock decisions.
3. **Open Fulfillment Issues** — Call out the Shopify `displayStatus` column and remind operators to capture owner + next action in the Q&A template.
4. **Capture Follow-up Section** — Screenshot the Action dropdown (`Log follow-up`, `Escalate to ops`) and notes textarea. Reinforce that selections sync to Supabase decision logs.
5. **Primary Action Button** — Emphasise that the label mirrors the selected action (e.g., `Log follow-up`) and triggers the Supabase write; capture disabled state while regression tests run.

## Inventory Heatmap Modal Callouts
1. **SKU Summary Block** — Entry focus lands here; describe what the focus ring looks like (`--occ-focus-ring`). Alt text should spell out SKU, stock, threshold, and days of cover.
2. **Days of Cover Chip** — Reference `docs/design/assets/modal-inventory-heatmap-annotations.svg` (`top-end` tooltip) that clarifies the projection string. Narrate the expected tooltip copy while the screenshot callout displays.
3. **Velocity Analysis Card** — Highlight average velocity, peak day, and trend wording. Emphasize that screen readers hear this content sequentially; alt text mirrors the bullet format.
4. **Recommended Reorder Panel** — Stress supplier + quantity recommendation and link to SOP for draft PO. Capture in screenshot with annotation badge “3”.
5. **Action Row** — Confirm operators see `Confirm`, `Mark Intentional`, `Snooze`. Note that the primary `Confirm` button must retain focus until toast acknowledgement; remind presenters to mention the ensuing toast state.

## Next Steps
- Swap these text callouts for designer-provided annotated screenshots once exports arrive (tracked in `feedback/designer.md`).
- When capturing screenshots, follow naming convention `modal-<cx|sales>_callout-<n>.png` and upload to `artifacts/ops/dry_run_2025-10-16/`.
- Add `modal-inventory_callout-<n>.png` variants once staging screenshot overlays are available; alt text should copy bullet 1–5 above verbatim as descriptive captions.
- Interim asset: baseline dashboard overview stored at `artifacts/ops/dry_run_2025-10-16/scenarios/2025-10-10T0421Z_dashboard-overview.png` (mock data). Use as reference for facilitator briefings until modal overlays land.
- Interim alt text/focus order templates live in `docs/design/modal_alt_text.md`. Copy these verbatim into accessibility captions until staging screenshots are captured; update Q&A packet whenever the design doc changes.

---

## Overlay Checklist Draft (Enablement Prep)

### CX Escalations Modal
- `modal-cx_callout-1.png` — Crop header showing customer name + SLA badge. Alt text: “CX Escalations header with breach badge showing SLA exceeded.” Tooltip overlay label `#1` at top left.
- `modal-cx_callout-2.png` — Conversation history scroll region with focus ring visible on latest message. Alt text: “Conversation log listing alternating agent/customer entries with timestamps.” Callout arrow points to scroll affordance.
- `modal-cx_callout-3.png` — Suggested reply textarea populated with AI draft. Alt text: “Editable AI suggestion field labelled Suggested reply with prefilled copy.” Ensure cursor visible.
- `modal-cx_callout-4.png` — Internal note field with placeholder “Add context for audit trail.” Alt text: “Internal note textarea highlighted for compliance capture.” Overlay number `#4` anchored to bottom left of textarea.
- `modal-cx_callout-5.png` — Action buttons row showing disabled primary when reply empty and enabled state when populated. Capture both states if possible; alt text: “Approve & send primary button enabled, Escalate and Mark resolved secondary controls.”

### Sales Pulse Modal
- `modal-sales_callout-1.png` — Header summary with revenue + orders vs baseline chip. Alt text: “Sales Pulse header showing today’s revenue and order count compared to baseline.”
- `modal-sales_callout-2.png` — Top SKU table with first three rows visible. Alt text: “Top SKU table listing product, units, and revenue columns with highlight on leading SKU.” Overlay number `#2` anchored near table header.
- `modal-sales_callout-3.png` — Open fulfillment issues list showing Shopify `displayStatus`. Alt text: “Fulfillment issues list with order IDs and statuses awaiting action.”
- `modal-sales_callout-4.png` — Capture follow-up action dropdown expanded plus notes textarea with example text. Alt text: “Action dropdown open with options Log follow-up and Escalate to ops; notes field below with owner/ETA.”
- `modal-sales_callout-5.png` — Footer primary button after selecting action (label matches selection). Alt text: “Primary button labelled Log follow-up enabled, Cancel secondary button to the right.”

### Inventory Heatmap Modal (Future Proof)
- `modal-inventory_callout-1.png` — SKU summary block with focus ring. Alt text: “Inventory detail card showing SKU, stock, threshold, and focus outline.”
- `modal-inventory_callout-2.png` — Days of cover chip with tooltip visible. Alt text: “Tooltip explaining days of cover projection with numerical breakdown.”
- `modal-inventory_callout-3.png` — Velocity analysis card highlighting trend text. Alt text: “Velocity analysis card listing average daily units, peak day, and trend arrow.”
- `modal-inventory_callout-4.png` — Recommended reorder panel with supplier/quantity. Alt text: “Recommended reorder panel showing supplier, suggested quantity, and ETA.”
- `modal-inventory_callout-5.png` — Action row with Confirm/Mark Intentional/Snooze, focus on Confirm. Alt text: “Modal action buttons with Confirm focused and tooltip reminder for toast confirmation.”

> Update this checklist with final callout numbers from design once staging screenshots are captured; enablement will mirror captions in facilitator packets and accessibility notes.
