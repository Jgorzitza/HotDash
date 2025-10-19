# Inventory Direction

- **Owner:** Inventory Agent
- **Effective:** 2025-10-18
- **Version:** 2.1

## Objective

Current Issue: #111

Launch the inventory intelligence system (status buckets, ROP calculations, picker payouts). Today: verify staging connectivity via IPv4 pooler and seed minimal data for dashboard checks.

## Tasks

1. Confirm Supabase IPv4 pooler URL (from vault) and run a connectivity probe; attach logs under `artifacts/inventory/2025-10-18/`.
2. Seed minimal inventory rows needed for dashboard tiles; record SQL and results.
3. Verify dashboard queries return expected counts/prices; document any gaps with owner/ETA.
4. Write feedback to `feedback/inventory/2025-10-18.md` and clean up stray md files.

## Constraints

- **Allowed Tools:** `bash`, `npm`, `npx`, `node`, `psql`, `rg`, `jq`
- **Process:** Follow docs/OPERATING_MODEL.md (Signals→Learn pipeline), use MCP servers for tool calls, and log daily feedback per docs/RULES.md.
- **Touched Directories:** `app/services/inventory/**`, `supabase/migrations/**`, `supabase/seeds/**`, `docs/specs/inventory_pipeline.md`, `artifacts/inventory/2025-10-18/**`, `feedback/inventory/2025-10-18.md`
- **Budget:** time ≤ 60 minutes, tokens ≤ 140k, files ≤ 50 per PR
- **Guardrails:** HITL approvals for all operational changes; maintain RLS tests.

## Tasks

1. Follow docs/manager/EXECUTION_ROADMAP.md (Inventory — Roadmap). Autonomy Mode applies. Log evidence in `feedback/inventory/<YYYY-MM-DD>.md`.

## Definition of Done

- [ ] Migrations applied with logs
- [ ] ROP/payout tests passing
- [ ] `npm run fmt` and `npm run lint`
- [ ] `npm run test:ci`
- [ ] `npm run scan`
- [ ] Docs/runbooks updated with rollout steps
- [ ] Feedback recorded with evidence
- [ ] Contract test passes
- [ ] Foreground Proof: committed `artifacts/inventory/<YYYY-MM-DD>/logs/heartbeat.log`

## Autonomy Mode (Do Not Stop)

- If blocked > 15 minutes, log blocker and move to next queued task. Do not idle.
- Keep diffs within Allowed paths; attach evidence.

## Foreground Proof (Required)

- For any step expected to run >15s, run via `scripts/policy/with-heartbeat.sh inventory -- <command>`.
- Append ISO timestamps on each step to `artifacts/inventory/<YYYY-MM-DD>/logs/heartbeat.log`.
- Include this path under “Foreground Proof” in your PR body and commit the log. PRs without it fail CI.

## Fallback Work Queue (aligned to NORTH_STAR)

1. PO receiving apply plan + AVLC update — docs/specs/hitl/vendors-pos-receiving\*
2. Bundles BOM webhook adjustments (orders/paid → decrement components) — docs/specs/hitl/bundles-bom\*
3. Overnight settlement design (Canada proxy to zero; WH offsets) — docs/specs/hitl/inventory-updates\*
4. Approvals reason codes alignment — docs/specs/hitl/agent-reason-codes.json
5. Telemetry hooks for inventory tiles
6. Returns flow reconciliation notes (restock + AVLC treatment)
7. Location transfers and adjustments ledger design
8. Safety stock & reorder point calculations doc
9. Supplier lead time variance handling
10. Evidence bundling for inventory PRs (screens, logs)

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
- Feedback: `feedback/inventory/2025-10-18.md`
- Specs / Runbooks: `docs/specs/inventory_pipeline.md`

## Change Log

- 2025-10-18: Version 2.1 – IPv4 pooler + minimal seeds for dashboard checks
- 2025-10-17: Version 2.0 – Production-ready rollout plan
- 2025-10-15: Version 1.0 – Inventory schema/tasks
