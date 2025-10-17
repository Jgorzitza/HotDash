# task_direction_inventory — Direction

- **Owner:** Manager Sub-Agent
- **Effective:** 2025-10-17
- **Version:** 1.0

## Objective
Rewrite `docs/directions/inventory.md` with the agent template so Inventory delivers ROP automation, Supabase views, Shopify sync, picker payout updates, and feedback hygiene for launch.

## Current Tasks
1. Apply the template from `docs/directions/agenttemplate.md`.
2. Populate the task list with the following items (retain numbering, final item is feedback hygiene):
   1. Diff feature pack inventory schema against current migrations; draft migration plan in feedback.
   2. Author combined migration bundle for inventory tables/views/RPCs with rollback script (`supabase/migrations/20251017_inventory_bundle.sql`).
   3. Implement ROP + safety stock calculations in Supabase views/functions; attach SQL diff.
   4. Update picker payout tables and Supabase policies per feature pack notes; document rationale.
   5. Generate inventory dashboard materialized views feeding `app/components/dashboard/ReturnsTile.tsx` and new heatmap tile.
   6. Refresh bundle + kit metadata sync to Shopify (server + worker) ensuring `PACK:` codes handled; add unit tests.
   7. Extend inventory service to expose payout brackets and publish to dashboard tile; capture API contract.
   8. Wire inventory alert thresholds into Prometheus metrics; log sample output.
   9. Build CSV PO export script and validate with sample data; attach artifact.
   10. Add inventory fixtures to `tests/fixtures/` for Vitest/Playwright coverage.
   11. Coordinate with Integrations on Supabase RPC deployment; log handshake notes.
   12. Validate returns tile metrics vs Supabase aggregates; attach comparison log.
   13. Update `docs/specs/inventory_pipeline.md` with new data flow diagrams.
   14. Produce rollback plan for inventory migrations in `docs/runbooks/migration_rollback.md`.
   15. Run `npm run test:ci` focused on inventory services and record logs.
   16. Ensure monitoring alerts (Prometheus, Fly) capture low stock + urgent reorder thresholds; document configuration.
   17. Sync with QA to confirm Playwright coverage for inventory workflows; note completion.
   18. Write feedback to `feedback/inventory/2025-10-17.md` and clean stray md files.
3. Update Objective/Constraints/DoD/Risk/Links to reflect inventory scope (Supabase, Shopify, Prometheus).
4. Add changelog entry for 2025-10-17.
5. Run `npx prettier --write docs/directions/inventory.md`.
6. Stage only `docs/directions/inventory.md`.
7. Log blockers in `feedback/manager/2025-10-17.md` if encountered.

## Constraints
- **Allowed Tools:** `bash`, `node`, `npm`, `npx prettier`, `supabase`, `rg`.
- **Touched Directories:** `docs/directions/inventory.md`.
- **Budget:** ≤ 30 minutes, ≤ 4,000 tokens, ≤ 3 files modified/staged.
- **Guardrails:** Keep edits scoped to inventory direction file.

## Definition of Done
- [ ] Template applied with provided tasks.
- [ ] Prettier executed.
- [ ] Only `docs/directions/inventory.md` staged.
- [ ] Blockers logged if any.

## Risk & Rollback
- **Risk Level:** Medium — inventory mismatches impact operational readiness.
- **Rollback Plan:** `git checkout -- docs/directions/inventory.md` before staging.
- **Monitoring:** Ensure tasks align with inventory tiles, Shopify sync, and Supabase migrations.

## Links & References
- Template: `docs/directions/agenttemplate.md`
- Feature pack inventory notes: `integrations/new_feature_20251017T033137Z/manager_agent_pack_v1/03-database/`, `05-integrations/`
- Inventory specs: `docs/specs/inventory_pipeline.md`, `docs/specs/inventory_sync.md`
- Feedback: `feedback/inventory/`

## Change Log
- 2025-10-17: Version 1.0 — Template rewrite with launch inventory tasks.
