Status: Planned only — do NOT seed or ship yet

# Inventory Updates (HITL, Runtime Product)

This is a Day‑1 plan for Inventory Updates with CEO‑only approvals. It’s a runtime product feature (not dev governance). Per direction, this plan is saved now to avoid duplicate work while we align other features (social publishing, data mutations, analytics). No migrations, seeds, or code should be applied yet.

## Scope (Day‑1)

- Source of truth: Shopify inventory (variants by location). Our app proposes and approves adjustments; on approval, we apply to Shopify.
- Intake sources (proposals): agent/AI manual adjustments, cycle counts, PO receipts, returns/RMAs, damage/shrinkage, inter‑location transfers.
- Multi‑SKU: a single request can include multiple SKU lines (same or different locations).
- CEO‑only approval with inline edit of quantities/notes before apply.
- Audit: before/after quantities, deltas, reason codes, attachments, actor, timestamps.

## Business Hours & SLA

- Timezone: America/Edmonton
- Hours:
  - Mon–Fri: 09:00–21:00
  - Sat–Sun: 10:00–17:00
- SLA rules:
  - SLA does not accrue outside business hours; start at next open.
  - Agents can draft proposals off‑hours; they queue for CEO review.
  - High‑risk proposals: in‑app alerts only (no email/SMS Day‑1). External alerts are configurable later, default OFF.

## Inventory Update Flow

1. Draft: Agent/AI drafts request with lines: {sku/variant, location, current_qty (fetched), proposed_qty or delta, reason code, notes, attachments}.
2. Validate (preflight):
   - Non‑negative resulting qty; max delta/percent thresholds; bundle/kitting constraints.
   - Flags: conflicts with open orders/reservations, low‑stock threshold crossings, large deltas.
3. Submit: “Submit for CEO review” → `pending_review`; shows in Approvals > Inventory Updates.
4. Review: CEO can Approve, Approve with Edit (inline per line), Request Changes, Reject.
5. Apply (on approve): Apply adjustments to Shopify inventory at the specified locations; capture API results and resulting on‑hand/available.
6. Audit: Persist before/after, deltas, reason codes, attachments, approver, API receipts; set `ai-customer.human_review = true` on the request.
7. Learn: Store diffs and reason codes; generate coach notes for agents; require acknowledgment.

## Vendor Setup & Identifiers (Day‑1)

- Vendor master: name, contact info, lead time (days to fulfill), shipping mode (dropship/direct/both), currency.
- Identifiers per product/variant (shared standard across features):
  - Canonical MPN (HRAN): our internal HOT ROD AN MPN — authoritative, never overwritten by vendor values.
  - Vendor MPNs: required for vendor mapping; up to 3 alternates per vendor per product (as requested: vendor alternates are treated as MPNs).
  - UPC/EAN (optional but preferred when available) — used for de‑duplication and SEO/content alignment.
- PO creation: selecting a vendor auto‑populates vendor MPNs/alternates and UPC for each line; allow add/edit and persist back to the vendor‑product map for future POs.

### Identifier Validation (HRAN ↔ UPC)

- Rule: HRAN MPN should equal the last 4 digits of the product’s UPC.
- Enforcement: no hard pattern enforcement; when UPC is present and the last 4 digits don’t match HRAN, flag a “Mismatch” warning for review.
- Missing UPC: allow save; gently prompt to add UPC so HRAN can be verified. Do not block PO or receiving flows.
- Vendor alternates: stored as vendor MPNs (not HRAN); rule applies only to our canonical HRAN MPN.

## Validation Rules (initial)

- Resulting quantity cannot be negative.
- Absolute delta and percentage delta thresholds per channel or SKU class (e.g., abs > 50 units or > 40%).
- Location required; map to Shopify location id; transfers must specify from/to locations and preserve global stock.
- Reserved/open orders warning: show reserved units; warn if proposed would dip below reserved.
- Kitting/bundles: if SKU is a kit, warn that components will be impacted (see Clarifications).

## Data Model (planned, do not migrate yet)

- `inventory_change_requests` (header): id, status (draft,pending_review,approved,applied,rejected,changes_requested,failed), created_by, approver_id, notes, attachments[], created_at, updated_at.
- `inventory_change_lines`: id, request_id, sku, variant_id, location_id, qty_before, qty_after, delta, reason_codes[], warnings[], created_at.
- `inventory_locations`: id, shopify_location_id, name, active, created_at.
- `inventory_metrics`: id, request_id, is_over_sla, sla_seconds, approval_cycles, high_risk (bool), created_at.
- Reuse `audit_events` for lifecycle events (submitted_for_review, ceo_edited, approved, applied, rejected, failed).

### Vendor + Catalog Mapping (planned)

- `vendors`: id, name, contact_json, lead_time_days, mode (dropship|direct|both), currency, active, created_at.
- `vendor_products`: id, vendor_id, product_variant_id,
  - hr_an_mpn (canonical),
  - vendor_mpn_primary, vendor_mpn_alt1?, vendor_mpn_alt2?, vendor_mpn_alt3?,
  - upc_ean?, currency, last_cost, updated_at.
- Behavior:
  - On PO line add: look up by (vendor_id, product_variant_id) and prefill identifiers; inline edits persist back to `vendor_products`.
  - On Receive: record actual cost (incl. freight/duties allocation) to update AVLC; update Shopify InventoryItem.cost via Admin API when required.

## Costs & AVLC (Freight/Duties Allocation)

- Default allocation: Extended cost (line share = line_extended_cost ÷ PO_total_extended_cost).
- Distribute: freight and duties across lines using the share above. Round to 2 decimals; assign any residual to the largest line.
- Overridable per receipt: methods supported (quantity, weight, volume, manual per line).
- Landed cost per line (unit): unit_vendor_price + (allocated_freight ÷ qty_received) + (allocated_duties ÷ qty_received).
- AVLC update (component level):
  - prior_value = prior_on_hand_qty × prior_avlc
  - receipt_value = Σ(line_qty × line_landed_unit_cost)
  - new_on_hand = prior_on_hand_qty + total_qty_received
  - new_avlc = (prior_value + receipt_value) ÷ new_on_hand
- Shopify unit cost: optionally push to InventoryItem.cost when material change is detected (planning only; guard with feature flag).

## UI (planned)

- Approvals → Inventory Updates: table of requests (status, risk, lines count), detail view with per‑line inline edit, warnings, reason code picker, attachments, actions (Approve, Approve with Edit, Request Changes, Reject).
- Dashboard (CEO): tiles for Low Stock, Pending Inventory Approvals, High‑Risk Proposals; filters by location/date.
- Inventory list: search by SKU/variant, show current per‑location quantities, pending adjustments, and low‑stock thresholds.
- Settings: Business hours reuse; thresholds per SKU class (planned), locations mapping; Vendors admin (identifiers: HRAN MPN, vendor MPNs, UPC per variant) with HRAN↔UPC mismatch warnings.

## Integrations (planned)

- Shopify Admin Inventory: apply on approval; fetch current per‑location quantities during draft/validate; MCP‑first for API references when implementing.
- Locations: pull active Shopify locations into an app Location Map; enable/disable in‑app for scope. Use a single Fulfillment Service–backed location named "Vendor Dropship" for vendor‑fulfilled SKUs and track per‑variant inventory there.
- Webhooks: real‑time handler for orders/paid to decrement bundle component inventory via `inventoryAdjustQuantities` (name `available`, reason `correction`); nightly reconcile handles proxy negatives.
- Notifications: in‑app alerts only Day‑1; email/SMS toggles exist in settings but default OFF.

## Warehouse Strategy: Main/Proxy Overnight Settlement (No Approval)

- Main vs Proxy: Washington WH is the main source of truth; Canada WH is a proxy of main. Vendor Dropship is excluded from proxy logic (it is its own truth).
- Shopify behavior: Changing fulfillment location can drive the proxy (Canada) negative; this is permitted and expected for label creation.
- Simple rule (overnight job):
  - For each SKU where Canada quantity < 0 at settlement time:
    - Let n = abs(Canada quantity).
    - Adjustment 1 (Canada): increase by +n so Canada returns to 0.
    - Adjustment 2 (Washington): decrease by −n so main reflects the sale.
  - Reason: `reconcile_proxy_negative_to_zero`.
  - Idempotency: key = `${date}:${sku}` to avoid duplicate corrections.
  - Schedule: 03:00 America/Edmonton (configurable).
- Webhooks still reserve at order paid for bundles (see Bundles section). No real‑time offsets are performed at fulfillment; settlement corrects proxy negatives once per day.
- Audit: Record each settlement pair with quantities and location IDs.
- Approvals: This auto‑settlement bypasses the Inventory Updates approval flow by design.

## Bundles (BOM)

- Definition: Bundle variants resolve to a Bill of Materials (components + quantities) with parameters (e.g., hose_color, hose_length) to cover many variants from one template.
- Virtual stock only: bundle availability is computed, not stored, as `min(floor(component_available / qty_in_bundle))`.
- On sale (webhook): For each bundle line, resolve components and decrement component inventory by (bundle_qty × component_qty) using `inventoryAdjustQuantities` with `name = available` and `reason = correction` at the main (Washington) location. Proxy (Canada) negatives are normalized overnight.
- Safety net: nightly reconcile recomputes expected component stock from the ledger, logs diffs, and suggests corrections.

### Webhooks and Idempotency (verified via Shopify Admin API)

- Topic: `ORDERS_PAID` (GraphQL enum: `ORDERS_PAID`, REST path: `orders/paid`).
- Subscription fields (use `includeFields` to minimize payload):
  - `id`
  - `line_items.id`
  - `line_items.quantity`
  - `line_items.variant_id`
  - `line_items.sku`
- Idempotency key (bundle reservation): `${order_id}:${line_item_id}:${component_sku}`
- Adjustment:
  - Mutation: `inventoryAdjustQuantities`
  - `name = available`, `reason = correction`
  - `referenceDocumentUri = gid://shopify/Order/${order_id}`
- Notes:
  - We do not require `FULFILLMENTS_CREATE` for inventory math (settlement handles proxy). We may still subscribe for analytics later.
  - If needed, filter ORDERS topics further using Shopify search syntax on `financial_status:paid` (for `ORDERS_UPDATED`), but `ORDERS_PAID` is preferred.

### ORDERS_PAID Handler — Processing Steps

1. Parse event (includeFields): `order.id`, each `line_items[].{id, variant_id, sku, quantity}`.
2. Classify lines:
   - If variant is a bundle (in our BOM map): proceed to component resolution.
   - Else: no component action (Shopify handles non-bundle inventory).
3. Resolve BOM for each bundle line:
   - Inflate parameters (e.g., hose_color, hose_length) from variant options/tags/meta.
   - Produce component list with concrete `inventoryItemId`, `component_qty = line.quantity × bom_qty`.
4. Build adjust payload (single mutation call per order when possible):
   - Mutation: `inventoryAdjustQuantities` with `name = available`, `reason = correction`, `referenceDocumentUri = gid://shopify/Order/${order_id}`.
   - `changes`: array of `{ inventoryItemId, locationId: WashingtonId, delta: -component_qty }` for all components across all bundle lines.
   - Chunk to <= 100 changes per call to respect API cost; fan-out across multiple calls if needed.
5. Idempotency:
   - Key per component-line: `${order_id}:${line_item_id}:${component_sku}`; skip any already applied.
6. Persist ledger and audit:
   - Record each change with order link, inventory item, location, delta, and mutation id.
7. Errors:
   - Retry on transient errors with backoff; abort on validation/userErrors and log for manual follow-up.

### Overnight Settlement Job — Processing Steps

1. At 03:00 America/Edmonton, query Canada WH for negative `available` counts.
   - For each inventory item at Canada with `available < 0`, compute `n = abs(available)`.
2. Build a paired adjust payload:
   - Canada correction: `{ inventoryItemId, locationId: CanadaId, delta: +n }`.
   - Washington correction: `{ inventoryItemId, locationId: WashingtonId, delta: -n }`.
3. Mutation: single or chunked `inventoryAdjustQuantities` call(s) with `name = available`, `reason = correction`, `referenceDocumentUri = gid://warehouse-app/Settlement/${date}`.
4. Idempotency per item per day: `${date}:${inventoryItemId}`; skip if already settled.
5. Persist ledger rows and audit events for both changes.
6. Safety: cap batch size (e.g., 500 pairs per call) and total runtime; resume next run if needed.

### Data Schema (planned)

- `inventory_ledger`: id, occurred_at, source (orders_paid|settlement|receiving|manual), reference_uri, reason, name_state (available|on_hand), shopify_adjustment_group_id?, user_errors_json?, created_at.
- `inventory_ledger_changes`: id, ledger_id, inventory_item_id, location_id, delta, quantity_after_change?, component_of_bundle_variant_id?, order_id?, line_item_id?.
- `idempotency_keys`: key (pk), context (orders_paid|settlement), created_at.
- `bundle_bom`: bundle_variant_id, param_schema_json.
- `bundle_components`: bundle_variant_id, component_variant_id, qty_per_bundle, param_bindings_json.
- `locations_map`: app_location_key, shopify_location_id, is_main, is_proxy.

### Permissions and Scopes (Shopify)

- write_inventory, read_inventory, read_locations.
- Optional (later): write_locations (if creating locations), write_fulfillments (not required for Day‑1), read_inventory_transfers (if adopting formal transfers later).

### Bundle Variant Tracking (recommended)

- Mark bundle variant `InventoryItem.tracked = false` to prevent confusing stock displays for virtual bundles (planning only; verify with MCP when implementing).

## Learning Loop

- Persist diffs between proposed and CEO‑final quantities and notes.
- Require reason codes (per line or request); generate coach notes for agents; acknowledgment required.
- Weekly reporting: over‑edits by SKU/location, root causes by reason codes.

## Proposed Reason Codes (hold for CEO final)

- Receive PO, Return/RMA, Cycle Count, Damage/Shrinkage, Supplier Error, System Correction, Inter‑location Transfer, Kitting/Assembly, Other.

## Acceptance Criteria (when implemented)

- CEO can approve/edit multi‑line inventory request; apply to Shopify; results persisted; audit and evidence captured; reason codes recorded.
- Validation prevents negatives; warns on thresholds, reservations, and kits; location mapping respected.
- Dashboard shows pending approvals and high‑risk items; filters by location/date work.
- Learning artifacts visible in agent view; acknowledgment enforced.

## Implementation Constraints

- MCP‑first policy for Shopify Admin API; no training‑data guesses.
- PII‑safe artifacts; redact sensitive vendor data in attachments.
- Business hours shared module with Customer Replies; unified notifications bus.
- Do NOT seed migrations or code until cross‑feature alignment completes.

## Open Items for Cross‑Feature Planning

- Shared thresholds taxonomy and reason code set across approvals (customer replies, inventory, social publishing, data mutations).
- Location strategy: single vs multi‑location; transfer flows; store mapping.
- Bundles/kits: component impacts and automatic propagation strategy.

## Clarifications Requested

1. Locations: Do we manage a single Shopify location or multiple? Which location(s) should Day‑1 support, and is Shopify the canonical source of truth?
2. High‑risk thresholds: What absolute and/or percentage delta should trigger email vs SMS to the CEO (e.g., abs ≥ 50 units or ≥ 40%)?
3. Kits/Bundles: If a kit SKU is adjusted, should we automatically propagate proportional adjustments to component SKUs, or require separate requests?
