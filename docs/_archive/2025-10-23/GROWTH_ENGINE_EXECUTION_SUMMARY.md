# Growth Engine Integration — Execution Summary

**Date**: 2025-10-21T15:45:00Z  
**Manager**: Completed core docs + cursor rules + PR template  
**Status**: ✅ Core integration complete — Ready for agent directions

---

## ✅ COMPLETED (Manager)

### 1. Core Documents Updated

**NORTH_STAR.md**:
- Added "Growth Engine — Agent Orchestration & Security" section
- Agent Model (Customer-Front, CEO-Front, Sub-Agents, Specialist Agents)
- Handoff Pattern (tool-based, one owner)
- Security Model (PII Broker, ABAC, Store Switch, Dev MCP Ban)
- Evidence & Heartbeat (CI merge blockers)
- Action Queue Contract
- Telemetry (GA4, Search Console, Action Attribution)
- Agent Metrics

**RULES.md**:
- Added "Growth Engine Rules" section
- MCP Evidence JSONL (format, location, PR requirement)
- Heartbeat (tasks >2h, 15min max staleness)
- CI Guards (guard-mcp, idle-guard, dev-mcp-ban)
- Dev MCP Ban (production safety)
- Store Switch Safety (env parameterization)
- Telemetry Configuration (GA4 339826228, Search Console direct API, Action Attribution)

**OPERATING_MODEL.md**:
- Added "Growth Engine — Agent Orchestration" section
- Agent Architecture (Front-End, Sub-Agents, Specialist Agents)
- Handoff Pattern (Customer-Front → Sub-agents, CEO-Front → Action Queue)
- Security Model (PII Broker, ABAC, No-Ask Execution)
- Agent Evidence (MCP JSONL, Heartbeat, CI Guards)

### 2. PR Template Updated

**.github/pull_request_template.md**:
- Added "MCP Evidence" section (required for code changes)
- Added "Heartbeat" section (if task >2h)
- Added "Dev MCP Check" section (production safety)

### 3. Cursor Rule Created

**.cursor/rules/10-growth-engine-pack.mdc**:
- MCP Evidence JSONL (CI merge blocker)
- Heartbeat (required for tasks >2 hours)
- Dev MCP Ban (production safety - CRITICAL)
- Agent Evidence Workflow
- Exceptions (docs-only, tasks <2h)
- CI Guards (guard-mcp, idle-guard, dev-mcp-ban)

### 4. Growth Engine Pack Extracted

**docs/design/growth-engine-final/**:
- 16 files extracted (README, NORTH_STAR_ADDENDA, runbooks, agent design, inventory blueprint, policy docs)
- Full pack preserved for reference

---

## CEO CONFIRMATIONS

### ✅ Conflict 7: Vendor Master
**Confirmed Understanding**:
- Centralized vendor database (name, contact, terms, lead_time_days, ship_method, drop_ship, currency)
- **Reliability Score**: 0-100% = `(on_time_deliveries / total_deliveries) × 100`
  - Updated when PO receipt logged (actual delivery vs expected)
- **Vendor SKU Mapping**: Multi-SKU support (same product, different vendors with different SKUs/costs)
- **Usage**: Operator sees "Premium Suppliers (92% reliable, 7d lead, $24.99/unit)" at PO creation

### ✅ Conflict 12: Average Landed Cost (ALC)
**Confirmed Understanding** (with CEO clarifications):
- **ALC Calculation** (includes existing inventory):
  ```
  New_ALC = ((Previous_ALC × On_Hand_Qty) + New_Receipt_Total) / (On_Hand_Qty + New_Receipt_Qty)
  
  New_Receipt_Total = Vendor_Invoice + Freight_Allocated + Duty_Allocated
  - Freight: Distributed BY WEIGHT (heavier items = more freight cost)
  - Duty: Distributed per piece by weight
  ```
- **Receiving Workflow**:
  1. PO arrives → Operator enters: qty received, item cost (PREFILLED from PO, editable), total freight, total duty
  2. System calculates: freight per piece (by weight), duty per piece (by weight), new weighted ALC
  3. **System pushes** new ALC to Shopify `inventoryItem.unitCost` via GraphQL mutation
  4. Audit trail (before/after snapshots)

---

## PHASE ASSIGNMENTS

### ✅ Immediate (Manager - 1h) — COMPLETE
- Update PR template ✅
- Update docs (NORTH_STAR, RULES, OPERATING_MODEL) ✅
- Create Cursor rule ✅

### Phase 9: Customer-Front Agent + PII Card (4h)
**Agents**: Engineer (component) + Designer (validate)

**Work**:
- Build `app/components/PIICard.tsx` (operator-only customer details)
- Build `app/utils/pii-redaction.ts` (redaction logic)
- Update `CXEscalationModal.tsx` to use PII Card
- PII Card Fields: Order ID (last-4), tracking (carrier + last event), shipping (city/region/country + postal prefix), line items, masked email/phone

**Priority**: P0

---

### Phase 10: Vendor Master + ALC + Inventory Foundation (12h)

**Data Agent** (5h):
- Create `vendors` table (name, contact, terms, lead_time_days, ship_method, drop_ship, currency, reliability_score)
- Create `vendor_product_mappings` table (vendor_id, product_id, vendor_sku, cost_per_unit, is_preferred)
- Create `purchase_order_receipts` table (receipt records with fees)
- Create `product_cost_history` table (ALC snapshots)
- Add RLS policies to `decision_log` (prevent deletes/updates - append-only audit)

**Inventory Agent** (4h):
- Build vendor management service (`app/services/inventory/vendor-management.ts`)
- Build ALC calculation service (`app/services/inventory/alc.ts`)
  - Weighted average: includes previous cost + on-hand qty
  - Freight by weight distribution
  - Duty by weight distribution
- Enhance existing inventory service (469 lines)

**Integrations Agent** (2h):
- Build Shopify inventoryItemUpdate mutation (sync ALC to Shopify)
- Update after each ALC recalculation

**Engineer Agent** (3h):
- Build vendor selector UI (dropdown with reliability, lead time, cost)
- Build receiving workflow UI (qty, item cost prefilled, freight, duty inputs)
- Display: freight per piece (by weight), duty per piece, new ALC, before/after comparison

**DevOps Agent** (3h):
- Enhance `.github/workflows/deploy-staging.yml` with CI Guards:
  - `guard-mcp`: Verify MCP evidence JSONL files exist and valid
  - `idle-guard`: Verify heartbeat not stale (if task >2h)
  - `dev-mcp-ban`: FAIL if Dev MCP imports in `app/`
- Create `scripts/ci/verify-mcp-evidence.js`
- Create `scripts/ci/verify-heartbeat.js`

**Priority**: P1

---

### Phase 11: Advanced Inventory + Attribution (21-26h)

**Integrations Agent** (8h):
- **Bundles-BOM Metafields** (5h):
  - Create metafield definitions in Shopify (`hotdash.bom.components`, `hotdash.bom.is_component`)
  - Build service to read/write metafields
  - Keep tag system for picker payouts (`PACK:X`)
  - Metafields for inventory tracking (variant mapping, qty per bundle)
- **Warehouse Reconciliation** (3h):
  - Build `app/services/inventory/warehouse-reconcile.ts`
  - Build `scripts/inventory/nightly-warehouse-reconcile.ts`
  - Logic: Reset Canada WH negative → adjust Main WH (offset amount)
  - Schedule: 02:00 America/Los_Angeles (Fly.io cron or GitHub Actions)

**Inventory Agent** (5h):
- **Emergency Sourcing** (4-5h):
  - Build `app/services/inventory/emergency-sourcing.ts`
  - Logic: `ELP = feasible_sales_during_leadtime × unit_margin_bundle`
  - Logic: `IC = (local_vendor_cost − primary_vendor_cost) × qty_needed`
  - Recommend if: `(ELP − IC) > 0` AND `bundle_margin ≥ 20%`
  - Output: Action card with evidence (lost profit calc, vendor comparison)

**Analytics Agent** (5h):
- **Action Attribution** (4-5h):
  - Build `app/services/analytics/action-attribution.ts`
  - Query GA4: Filter by `hd_action_key`, measure revenue/conversion change
  - Windows: 7d, 14d, 28d after action approval
  - Update Action record with realized_impact
  - Re-rank Action Queue based on realized ROI
- **Search Console Persistence** (3h):
  - Build `app/services/seo/search-console-storage.ts`
  - Store metrics to: `seo_search_console_metrics`, `seo_search_queries`, `seo_landing_pages`
  - Historical query functions for trend analysis

**Data Agent** (3h):
- **Search Console Tables**:
  - Create `seo_search_console_metrics` (daily site-wide metrics)
  - Create `seo_search_queries` (top 25 queries per day)
  - Create `seo_landing_pages` (top 25 pages per day)

**DevOps Agent** (2h):
- **GA4 Config**:
  - Create custom dimension `hd_action_key` (event scope) in GA4 Property 339826228
  - Verify tracking setup

**Engineer Agent** (2h):
- **Client Tracking**:
  - Add `hd_action_key` to gtag events (page_view, add_to_cart, begin_checkout, purchase)
  - Only emit when action_key present (user clicked from approved action)

**Priority**: P0 (Action Attribution), P1 (others)

---

### Phase 12: CX Intelligence (6h)

**AI-Knowledge Agent** (4h):
- Build `app/services/ai-knowledge/cx-conversation-mining.ts`
- Create `cx_embeddings` table (pgvector, sanitized conversations - NO PII)
- Process:
  1. Nightly: Extract Chatwoot conversations
  2. Sanitize (remove PII: names, emails, phones, addresses)
  3. Embed into pgvector
  4. Query for recurring themes by product/collection

**Analytics Agent** (1h):
- Theme detection algorithm
- Aggregate themes by product/collection (last 7d)

**Product Agent** (1h):
- Generate Action cards: "Add size chart to Product X (5 customers asked in last 7 days)"
- Output: 3+ mini-tasks/week with draft copy + evidence

**Priority**: P3

---

## TOTAL NEW WORK

**Immediate**: 1h (Manager) ✅ COMPLETE  
**Phase 9**: 4h  
**Phase 10**: 12h  
**Phase 11**: 21-26h  
**Phase 12**: 6h  

**Total**: 43-48 hours (additive to existing Phases 1-8)

---

## NEXT STEPS

1. ✅ Update all 17 agent direction files with:
   - Growth Engine alignment (agent architecture, handoff patterns, security)
   - Phase assignments (tasks, acceptance criteria, effort, priority)
   - CEO-confirmed details (Vendor Master, ALC, etc.)
   
2. ✅ Commit and push agent directions

3. ✅ Update feedback/manager/2025-10-21.md with completion report

**Manager Status**: Ready to build agent directions now.

