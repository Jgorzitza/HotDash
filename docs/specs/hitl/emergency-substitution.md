Status: Planned only — do NOT seed or ship yet

# Emergency Component Substitution (Bundles)

Purpose

- Prevent bundle stockouts caused by a single missing component by sourcing that component from a faster, higher‑cost vendor when it is economically rational to do so.

Scope (Day‑1)

- Affects virtual bundle BOMs only (no finished bundle stock).
- Single‑component substitution per proposal (multi‑component considered in future).
- Vendors considered: first‑party primary (overseas, low cost, long lead) vs approved local vendor(s) (higher cost, short lead). Vendors must exist in `vendors` and `vendor_products` mapping.

Inputs

- Bundle: price, baseline component costs (AVLC roll‑up), demand forecast window (lead_time_primary days), current availability of each component.
- Component: primary vendor unit cost (c_primary), local vendor unit cost (c_local), lead_time_primary (days), lead_time_local (days), MOQ (optional), shipping surcharge (optional).
- Forecast: expected bundle demand over lead_time_primary (D_bundles).

Decision rule (economics)

1. Units needed to bridge = min(D_bundles, max bundles limited by missing component).
2. Incremental cost per substituted unit = (c_local − c_primary) × qty_component_per_bundle.
3. Contribution margin per bundle (baseline) = bundle_price − baseline_component_rollup_cost − other_variable_costs.
4. New margin per bundle (with substitution) = contribution_margin_baseline − incremental_cost_per_substituted_unit.
5. Accept substitution if both:
   - New margin per bundle ≥ margin_floor (config), and
   - Lost profit from stockout over lead_time_primary ≥ Total incremental cost.

Lost profit ≈ Units needed to bridge × contribution_margin_baseline.
Total incremental cost ≈ Units needed to bridge × incremental_cost_per_substituted_unit.

Policy & constraints

- Don’t substitute if new margin per bundle falls below margin_floor (default 20%; configurable).
- Respect branding and quality: only approved local vendors for the component; record vendor and part mapping.
- Substitution proposals are HITL: CEO approves before PO is created to local vendor (Day‑1).
- Reason codes required on approve (e.g., Prevent stockout, Launch support, Seasonal spike).

Workflow

1. Detect stockout risk: bundle virtual stock == 0 due to one component; compute D_bundles over lead_time_primary.
2. Build proposal: component, vendors (primary vs local), economics table (contribution, incremental cost, bridge units, margin floor check).
3. Approvals: CEO reviews proposal in Approvals → Inventory; Approve/Approve with Edit (quantity edit allowed), Request Changes, Reject.
4. On approve: create PO to local vendor for approved quantity; ship_to = Washington WH; receiving applies on‑hand on arrival; resume normal BOM.
5. Audit: store proposal math, reason, approval action, and PO link.

UI

- Emergency Substitutions list (Inventory): sortable by impact (lost revenue avoided), time to stockout, margin delta.
- Proposal detail: economics, vendor options, thresholds, editable quantity (bounded by D_bundles and vendor availability/MOQ).
- Approvals drawer: reason picker, evidence (math snapshot), actions.

Data model (planned)

- substitution_proposals: id, bundle_variant_id, component_variant_id, vendor_primary_id, vendor_local_id, qty_per_bundle, qty_bridge, economics_json, margin_floor_used, status (draft,pending_review,approved,rejected,canceled,applied), created_at, updated_at.
- substitution_actions: id, proposal_id, action, actor_id, notes, created_at.

Integration points

- Vendors/POs/Receiving: on approve, create PO lines to local vendor; link proposal_id on PO.
- Inventory ledger: receiving adjustments flow to `inventory_ledger` as usual.
- Dashboard: Inventory Health tile can surface count of active proposals and their total avoided lost revenue.

Notifications

- In‑app badge: Emergency proposals available when bundle stockout risks are detected.
- Optional email digest to CEO with top proposals (Day‑1: in‑app only).

Open items

- Multiple component substitution in the same bundle (future).
- Automatic PO with guardrails (future; Day‑1 remains HITL).
