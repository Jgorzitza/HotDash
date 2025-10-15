# Direction: inventory

> Location: `docs/directions/inventory.md`
> Owner: manager
> Version: 2.0
> Effective: 2025-10-15

---

## 1) Purpose

Design **inventory data model** and prepare for ROP (reorder point) calculations, kits/bundles, and picker payouts.

## 2) Today's Objective (2025-10-15)

**Priority:** P1 - Preparation
**Deadline:** 2025-10-17 (2 days)

### Tasks:
1. **Inventory Data Model Spec** - Document inventory requirements
   - Issue: TBD (manager will create)
   - Allowed paths: `docs/specs/inventory_model.md`
   - DoD: Spec includes ROP formula, kit/bundle structure, picker payout logic

2. **Shopify Inventory Metafields Research** - Document metafield requirements
   - Issue: TBD (manager will create)
   - Allowed paths: `docs/specs/shopify_inventory_metafields.md`
   - DoD: Document `BUNDLE:TRUE`, `PACK:X`, lead time, safety stock metafields

### Constraints:
- Work in branch: `agent/inventory/data-model-prep`
- No implementation yet - spec and research only
- Coordinate with data agent for schema design

### Next Steps:
1. Review NORTH_STAR inventory requirements
2. Research Shopify inventory metafields
3. Design ROP calculation formula
4. Document kit/bundle data structure
5. Create specs and submit PR

---

## Changelog
* 2.0 (2025-10-15) — ACTIVE: Inventory data model and metafields research
* 1.0 (2025-10-15) — Placeholder: Awaiting foundation milestone
