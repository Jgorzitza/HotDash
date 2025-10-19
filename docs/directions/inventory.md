# Inventory Direction

> Direction: Follow reports/manager/lanes/latest.json (inventory — molecules). NO-ASK.


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
