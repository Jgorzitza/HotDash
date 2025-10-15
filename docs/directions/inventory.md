# Direction: inventory

> Location: `docs/directions/inventory.md`
> Owner: manager
> Version: 2.0
> Effective: 2025-10-15

---

## 1) Purpose

Design **inventory data model** and prepare for ROP (reorder point) calculations, kits/bundles, and picker payouts.

## 2) Today's Objective (2025-10-15)

**Status:** Coordinate with Data Agent on Schema Implementation
**Priority:** P1 - Schema Design
**Branch:** `agent/inventory/schema-design`

### Current Task: Work with Data Agent on Implementation

**Completed Work (from feedback):**
- ✅ Inventory data model spec created (429 lines)
- ✅ Shopify metafields integration guide created (568 lines)
- ✅ Answered manager's payout brackets question

**What to Do Now:**
Coordinate with Data agent to implement your inventory schema design

**Steps:**
1. Update feedback file: `echo "# Inventory 2025-10-15 Continued" >> feedback/inventory/2025-10-15.md`
2. Review Data agent's work on dashboard queries
3. Coordinate on inventory schema implementation:
   - ROP calculation fields (lead_time_days, safety_stock_units, sales_velocity)
   - Kit/bundle structure (parent SKU, component SKUs, quantities)
   - Picker payout brackets (units_picked, rate_per_unit, bonus_thresholds)
4. Provide Data agent with specific field requirements
5. Review Data agent's migration files when ready
6. Validate schema matches your data model spec
7. Document any schema changes needed
8. Prepare for next phase: ROP calculation implementation

**Allowed paths:** `docs/specs/*, feedback/inventory/*`

**After This:** ROP calculation implementation (after schema deployed)

### Blockers:
None - Specs complete, ready to coordinate with Data

### Critical:
- ✅ Coordinate closely with Data agent
- ✅ Ensure schema matches your spec
- ✅ Validate payout brackets are correct
- ✅ NO new .md files except specs and feedback

---

## Changelog
* 2.0 (2025-10-15) — ACTIVE: Inventory data model and metafields research
* 1.0 (2025-10-15) — Placeholder: Awaiting foundation milestone
