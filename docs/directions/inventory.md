# Direction: inventory

> Location: `docs/directions/inventory.md`
> Owner: manager
> Version: 2.0
> Effective: 2025-10-15

---

## 1) Purpose

Design **inventory data model** and prepare for ROP (reorder point) calculations, kits/bundles, and picker payouts.

## 2) Today's Objective (2025-10-15) - UPDATED

**Status:** 9 Tasks Aligned to NORTH_STAR
**Priority:** P1 - Inventory System

### Git Process (Manager-Controlled)
**YOU DO NOT USE GIT COMMANDS** - Manager handles all git operations.
- Write code, signal "WORK COMPLETE - READY FOR PR" in feedback
- See: `docs/runbooks/manager_git_workflow.md`

### Task List (9 tasks):

**1. ✅ Data Model Spec (COMPLETE - PR #32)**

**2. ROP Calculation Service (NEXT - 4h)**
- Implement ROP formula: lead-time demand + safety stock
- Allowed paths: `app/services/inventory/rop.ts`

**3. PO Generation Service (3h)**
- Generate PO CSV/email from ROP calculations
- Allowed paths: `app/services/inventory/po-generator.ts`

**4. Kit/Bundle Tracking (3h)**
- Track component inventory for bundles
- Allowed paths: `app/services/inventory/kits.ts`

**5. Picker Payout Calculation (3h)**
- Calculate payouts based on brackets
- Allowed paths: `app/services/inventory/payouts.ts`

**6. Inventory Heatmap UI (4h)**
- Visual heatmap of stock status
- Allowed paths: `app/components/inventory/Heatmap.tsx`

**7. Low Stock Alerts (2h)**
- Alert when WOS < threshold
- Allowed paths: `app/services/inventory/alerts.ts`

**8. Reorder Suggestions (3h)**
- AI-powered reorder recommendations
- Allowed paths: `app/services/inventory/suggestions.ts`

**9. Shopify Metafields Integration (3h)**
- Sync metafields to Supabase
- Allowed paths: `app/services/inventory/metafields-sync.ts`

### Current Focus: Task 2 (ROP Calculation)

### Blockers: None

### Critical:
- ✅ ROP formula must be accurate
- ✅ Signal "WORK COMPLETE - READY FOR PR" when done
- ✅ NO git commands
- ✅ Coordinate with Data on schema

---

## Changelog
* 2.0 (2025-10-15) — ACTIVE: Inventory data model and metafields research
* 1.0 (2025-10-15) — Placeholder: Awaiting foundation milestone

### Feedback Process (Canonical)
- Use exactly: \ for today
- Append evidence and tool outputs through the day
- On completion, add the WORK COMPLETE block as specified
