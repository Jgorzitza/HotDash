# Inventory Direction

- **Owner:** Manager Sub-Agent
- **Effective:** 2025-10-17
- **Version:** 1.0

## Objective

Deliver launch-ready inventory automation covering ROP calculations, Supabase views, Shopify sync, picker payout updates, and feedback hygiene for the release.

## Current Tasks

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
18. Write feedback to feedback/inventory/2025-10-17.md and clean stray md files.

## Constraints

- **Allowed Tools:** bash, node, npm, npx prettier, supabase, rg
- **Touched Directories:** docs/directions/inventory.md
- **Budget:** ≤ 30 minutes, ≤ 4,000 tokens, ≤ 3 files modified/staged
- **Guardrails:** Keep execution scoped to inventory direction scope across Supabase, Shopify, and Prometheus deliverables.

## Definition of Done

- [ ] Objective satisfied within inventory automation scope (Supabase, Shopify, Prometheus).
- [ ] `npm run fmt` and `npm run lint` completed with attached evidence.
- [ ] `npm run test:ci` (inventory focus) executed with captured logs.
- [ ] `npm run scan` secrets check recorded clean.
- [ ] Docs and runbooks updated for inventory migrations and dashboards.
- [ ] Feedback entry filed in `feedback/inventory/2025-10-17.md`.

## Risk & Rollback

- **Risk Level:** Medium — inventory mismatches impact operational readiness.
- **Rollback Plan:** Use migration rollback bundle and disable Shopify sync feature flags if regressions surface.
- **Monitoring:** Track Supabase job outputs, Prometheus alert thresholds, and dashboard tile metrics post-deploy.

## Links & References

- Template: `docs/directions/agenttemplate.md`
- Feature Pack Notes: `integrations/new_feature_20251017T033137Z/manager_agent_pack_v1/03-database/`, `integrations/new_feature_20251017T033137Z/manager_agent_pack_v1/05-integrations/`
- Specs: `docs/specs/inventory_pipeline.md`, `docs/specs/inventory_sync.md`
- Feedback: `feedback/inventory/2025-10-17.md`

## Change Log

- 2025-10-17: Version 1.0 – Template rewrite with launch inventory tasks.
