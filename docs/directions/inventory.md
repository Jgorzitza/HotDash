# Inventory Direction

- **Owner:** Manager Agent
- **Effective:** 2025-10-20
- **Version:** 5.0

## Objective

**Issue**: #111  
Post-merge verification - branch merging NOW

## Current Status

All work complete on branch ✅, Manager merging now

## Tasks

### AFTER MANAGER MERGES (10 min)

**INV-VERIFY-001**: Post-Merge Verification
1. Verify migrations applied:
   ```bash
   ls -la supabase/migrations/20251020190500_inventory_tables.sql
   ls -la supabase/migrations/20251020190600_inventory_rls.sql
   ```
2. Run contract test:
   ```bash
   npx vitest run tests/unit/services/inventory/payout.spec.ts
   ```
   Expected: 16/16 passing
3. Verify RLS tests include inventory:
   ```bash
   grep -A 5 "INVENTORY TABLES" supabase/rls_tests.sql
   ```
4. Report: All verifications PASS/FAIL

### THEN - Standby

**INV-002**: Ready for Integration Support
- Support Engineer with inventory modal integration
- Provide ROP calculation help if needed
- Answer schema questions

## Work Complete on Branch

✅ 8 inventory tables (products, variants, snapshots, vendors, product_vendors, purchase_orders, purchase_order_items, inventory_events)  
✅ 32+ RLS policies (full multi-tenant isolation)  
✅ ROP/payout calculations  
✅ CSV export + PO scripts  
✅ Unit tests passing

## Constraints

**Tools**: npm, psql  
**Budget**: ≤ 20 min  
**Paths**: tests/**, feedback/inventory/**

## Links

- Previous work: feedback/inventory/2025-10-20.md (waiting for merge)
- Branch: inventory/oct19-rop-fix-payouts-csv
- Migrations: supabase/migrations/2025102019*

## Definition of Done

- [ ] Migrations verified on main
- [ ] Contract tests passing
- [ ] RLS verified
