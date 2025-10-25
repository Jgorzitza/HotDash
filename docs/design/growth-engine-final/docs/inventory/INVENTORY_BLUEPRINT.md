# Inventory Blueprint — Dashboard & Logic

## Operator tiles

- Total OOS SKUs, High‑risk urgent SKUs, Inventory health score
- Filters: vendor, collection, tag (BUNDLE:TRUE), velocity band
- Actions: Approve reorder / Edit ROP / Create PO draft / Simulate emergency buy

## Vendor master

- Fields: name, contact, terms, **lead time (days)**, ship method, drop‑ship flag, currency=USD
- Reliability score (derived from late/partial receipts %)

## Vendor SKU mapping

- Up to 3 vendor SKUs per product per vendor
- At PO creation, auto‑populate; operator can choose/edit; persisted for next PO

## Bundles as BOM (parameterized color/length)

- A bundle variant **consumes** component variants (fixed quantities)
- **Virtual bundle stock** = min( floor(available(component)/required_qty) ) across components
- On bundle sale: decrement each component accordingly (Shopify prevents oversell; we do nightly reconcile across warehouses)
- Reorder & costs operate on components; bundle **roll‑up cost** = Σ(component ALC × qty). No assembly fee.

## Average Landed Cost (ALC)

- Weighted avg across receipts: vendor unit cost + freight + duty + fees
- Freight/duty can be added at receipt time; recompute ALC; keep per‑receipt snapshot + current ALC

## Reorder points (ROP) & overrides

- ROP = LeadTimeDemand + SafetyStock
  - LeadTimeDemand = daily velocity × vendor lead time (days)
  - SafetyStock = Z × σ(lead‑time demand), start service level 95%
- Inputs: last 30–90 days, prior‑year same period + trend, vendor delivery time, promotional uplift %
- Output: vendor choice, recommended qty, ETA window, cost impact

## Emergency sourcing (opportunity‑cost logic)

- For an OOS component blocking a profitable bundle, recommend **local fast vendor** when:
  - **Expected Lost Profit** over primary lead time > **Incremental Cost** of local substitute
- Sketch:
  - Expected Lost Profit ≈ feasible_sales_during_leadtime × unit_margin_bundle_normal
  - Incremental Cost ≈ (local_cost_component − primary_cost_component) × qty_per_bundle
- Approve if (ELP − IC) > 0 and resulting bundle margin remains healthy (default floor 20% or CEO override)

## Warehouses

- Washington = source of truth for available; Canada = label‑only (keep available at 0)
- For Canada label creation: reserve against WA, reconcile back after fulfillment
- Nightly job enforces “Canada available == 0” and recomputes virtual bundle stock

## Receiving workflow

- Create PO → receive full/partial; capture vendor SKU + quantities; attach fees; recompute ALC; adjust inventory; audit entry

## Acceptance

- Virtual bundle stock recomputed nightly; warehouse reconcile runs nightly
- ROP recommendations include vendor, qty, ETA, margin; emergency sourcing recs match provided examples
- Receiving recomputes ALC correctly with before/after snapshots
