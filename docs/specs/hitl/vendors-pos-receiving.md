Status: Planned only — do NOT seed or ship yet

# Vendors, Purchase Orders, and Receiving (Deep)

App‑managed POs with vendor mapping, partial receiving, freight/duties allocation to AVLC, and Shopify inventory updates on receipt. Day‑1 assumes USD vendors and ship‑to Washington WH.

## Vendors (master)

- Fields: id, name, contact_json (name, email, phone), lead_time_days, mode (dropship|direct|both), currency (USD Day‑1), terms (net30, prepaid), active, created_at, updated_at.
- Identifiers per variant: hr_an_mpn (canonical), vendor_mpn_primary, vendor_mpn_alt1/2/3, upc_ean (optional/preferred).
- Validation: HRAN↔UPC last‑4 mismatch → warn (non‑blocking).

## Purchase Orders (POs)

Header

- po_number (human‑friendly): pattern `HRAN-PO-{YYYYMM}-{###}`
- vendor_id, status (draft, submitted, sent, confirmed, partially_received, received, closed, canceled)
- ship_to_location_id (Shopify Location GID; default Washington WH), bill_to
- expected_date, created_by, created_at, updated_at
- attachments (quotes, PDFs)

Lines

- po_id, line_no, vendor_mpn, hr_an_mpn, variant_id?, description
- qty_ordered, unit_price (USD), discount?, tax?, notes
- qty_received_total (computed), backordered (computed)

Documents & Workflow

- Draft → Submit (internal) → Send to vendor (email with PDF) → Confirmed (optional) → Receiving sessions (partial allowed) → Received (all lines complete) → Closed
- Cancel allowed before first receive

## Receiving (partial allowed)

Receipt session

- receipt_number, received_at, created_by
- lines: po_line_id, qty_received (>=0), comment
- additional_costs: freight, duties, other (can be added/finalized on any receipt; last receipt may include final totals)
- allocation_method: extended_cost (default) | quantity | weight | volume | manual

Inventory apply (Shopify)

- For each received line, compute on‑hand additions at ship_to_location (Washington WH Day‑1)
- Mutation: Admin GraphQL `inventorySetOnHandQuantities` (or `inventorySetQuantities` name=on_hand) with reason = `received`
- Idempotency per receipt line: `${receipt_id}:${po_line_id}`; skip if already applied

AVLC update

- Default allocation: extended cost share across lines; overrides per receipt
- Landed unit cost per line = unit_price + (alloc_freight/qty_received) + (alloc_duties/qty_received) + (alloc_other/qty_received)
- New AVLC (component level): `(prior_on_hand * prior_avlc + Σ(qty * landed_unit_cost)) / new_on_hand`
- Optionally push InventoryItem.cost to Shopify when material change (feature flag)

PO accruals & currency

- Day‑1: USD only; vendor currency field reserved for future
- Additional costs recorded in USD and allocated at finalize time

Over‑receipts & backorders

- Default: prevent receiving beyond qty_ordered unless override flag per line
- Backordered = qty_ordered − qty_received_total; POs remain partially_received until 0

Shipments & tracking (optional Day‑1)

- Store vendor tracking refs at receipt level (attachments)
- Inventory Transfers not used Day‑1 (we apply on‑hand directly to ship_to_location)

Notifications & SLAs

- Overdue PO: expected_date in past and not received → in‑app badge; email digest optional
- Receiving success/failure logged; failures surface in Inventory tile

UI flows

- Create PO wizard: choose vendor, ship_to (default Washington), add lines (search by product or vendor MPN), expected date, notes; PDF preview; send email to vendor
- PO detail: timeline (submitted/sent/confirmed/receipts), attachments, backorder summary
- Receive goods: per‑line receive quantities; add freight/duties; choose allocation; apply to inventory; print labels (optional)

Data model (planned)

- vendors (as above)
- vendor_products (as above)
- purchase_orders: id, po_number, vendor_id, status, expected_date, ship_to_location_id, bill_to, currency, terms, created_by, created_at, updated_at
- purchase_order_lines: id, po_id, line_no, vendor_mpn, hr_an_mpn, variant_id, description, qty_ordered, unit_price, discount, tax, notes, qty_received_total
- po_receipts: id, po_id, receipt_number, received_at, created_by, freight_cost, duties_cost, other_cost, allocation_method
- po_receipt_lines: id, receipt_id, po_line_id, qty_received, landed_unit_cost, comment
- po_attachments: id, po_id, kind (quote|invoice|packing|other), src, uploaded_at
- inventory_ledger / inventory_ledger_changes (reuse): link receipt adjustments to adjustment group id

Security & audit

- Evidence captured on receipts (PDF attachments, delta quantities, allocation, adjustment group ids)
- Immutable audit events: created, submitted, sent, confirmed, receipt created, receipt applied, closed, canceled

Open items

- Vendor dropship: Day‑1 receiving not applied at Vendor Dropship; track availability via separate process later
- Multi‑currency vendors: plan for FX at receipt time (future); Day‑1 USD only
- Vendor confirmations: optional; could parse reply email later
