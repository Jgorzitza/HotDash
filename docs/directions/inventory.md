# Inventory Direction


---

## 🚨 DATE CORRECTION (2025-10-19)

**IMPORTANT**: Today is **October 19, 2025**

Some agents mistakenly wrote feedback to `2025-10-20.md` files. Manager has corrected this.

**Going forward**: Write ALL feedback to `feedback/AGENT/2025-10-19.md` for the rest of today.

Create tomorrow's file (`2025-10-20.md`) ONLY when it's actually October 20.

---


- **Owner:** Inventory Agent
- **Effective:** 2025-10-17
- **Version:** 2.0

## Objective

Current Issue: #111

Launch the inventory intelligence system (status buckets, ROP calculations, picker payouts) with full test coverage and rollout plan.

## Tasks

1. Apply and validate inventory migrations; ensure RLS coverage with Data support.
2. Finalize ROP/payout calculations with unit tests and documentation.
3. Provide CSV export + Shopify draft automation scripts with rollback notes.
4. Coordinate with Support to ensure picker payouts integrate into approvals flow.
5. Write feedback to `feedback/inventory/2025-10-17.md` and clean up stray md files.

## Constraints

- **Allowed Tools:** `bash`, `npm`, `npx`, `node`, `psql`, `rg`, `jq`
- **Process:** Follow docs/OPERATING_MODEL.md (Signals→Learn pipeline), use MCP servers for tool calls, and log daily feedback per docs/RULES.md.
- **Touched Directories:** `app/services/inventory/**`, `supabase/migrations/**`, `docs/specs/inventory_pipeline.md`, `feedback/inventory/2025-10-17.md`
- **Budget:** time ≤ 60 minutes, tokens ≤ 140k, files ≤ 50 per PR
- **Guardrails:** HITL approvals for all operational changes; maintain RLS tests.

## Definition of Done

- [ ] Migrations applied with logs
- [ ] ROP/payout tests passing
- [ ] `npm run fmt` and `npm run lint`
- [ ] `npm run test:ci`
- [ ] `npm run scan`
- [ ] Docs/runbooks updated with rollout steps
- [ ] Feedback recorded with evidence
- [ ] Contract test passes

## Contract Test

- **Command:** `npx vitest run tests/unit/services/inventory/payout.spec.ts`
- **Expectations:** Payout calculations match expected brackets.

## Risk & Rollback

- **Risk Level:** Medium — Incorrect payouts disrupt operations; mitigated via tests + HITL.
- **Rollback Plan:** Revert migrations, disable automation flag, notify Ops.
- **Monitoring:** Inventory tile metrics, Supabase `inventory_events`, picker payout audit logs.

## Links & References

- North Star: `docs/NORTH_STAR.md`
- Roadmap: `docs/roadmap.md`
- Feedback: `feedback/inventory/2025-10-17.md`
- Specs / Runbooks: `docs/specs/inventory_pipeline.md`

## Change Log

- 2025-10-17: Version 2.0 – Production-ready rollout plan
- 2025-10-15: Version 1.0 – Inventory schema/tasks

---

## NEW DIRECTION — 2025-10-19T21:00:00Z (Version 4.0)

**Previous Work**: ✅ COMPLETE - PR #100 created (P0 ROP fix + payout system)

**New Objective**: Inventory automation and approval workflow integration

**New Tasks** (16 molecules):

1. **INV-101**: Monitor PR #100 merge status (10 min)
2. **INV-102**: Create inventory dashboard API route (30 min)
3. **INV-103**: Build ROP suggestion automation script (35 min)
4. **INV-104**: Implement low stock alert system (30 min)
5. **INV-105**: Create overstock detection and alerts (30 min)
6. **INV-106**: Build inventory approval drawer component (45 min)
7. **INV-107**: Implement payout approval workflow UI (40 min)
8. **INV-108**: Create vendor performance tracking (35 min)
9. **INV-109**: Build purchase order tracking system (35 min)
10. **INV-110**: Implement stock movement analytics (30 min)
11. **INV-111**: Create inventory forecasting module (40 min)
12. **INV-112**: Build kit/bundle inventory tracking (35 min)
13. **INV-113**: Coordinate with Support on picker workflows (25 min)
14. **INV-114**: Document inventory runbooks for operators (30 min)
15. **INV-115**: Create inventory metrics export (25 min)
16. **INV-116**: Feedback summary and system test (20 min)

**Feedback File**: `feedback/inventory/2025-10-19.md` ← USE THIS

**Note**: Migrations await staging/production apply (coordinated with Data/DevOps)

