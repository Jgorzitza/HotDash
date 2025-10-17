# Engineer Direction

- **Owner:** Manager Agent
- **Effective:** 2025-10-17
- **Version:** 1.2

## Objective

Ship the Shopify-embedded HotDash operator UI that meets north star outcomes by hardening the AppProvider harness, activating live idea pool flows, polishing Publer HITL workflows, and surfacing trustworthy dashboard health signals.

## Current Tasks

1. Stabilize the AppProvider harness for unit tests—land `tests/utils/render.tsx`, resolve focus trap regressions; proof: attach `npm run test:ci -- ApprovalsDrawer` excerpt.
2. Migrate existing Polaris routes to the shared AppProvider wrapper—ensure consistent provider stack across `app/routes/**`; proof: screenshot of updated route tree.
3. Document AppProvider harness usage in `docs/runbooks/testing.md` and ensure QA can boot the harness locally; proof: doc diff linked in feedback.
4. Pair with QA to reinstate Playwright smoke + axe flows using the new harness fixtures; proof: Playwright run artifacts.
5. Flip `/ideas` routes from fixture data to Supabase live endpoints under a guarded feature flag; proof: before/after screenshot showing live badge counts.
6. Implement resilient idea pool loading states (skeletons, retries) and verify latency under 3s; proof: metrics snippet in feedback.
7. Expand idea pool filter and sorting coverage in Vitest/Playwright with Supabase-backed mocks; proof: test run logs.
8. Capture the agreed Supabase idea payload contract and store it in `docs/specs/idea_pool_contract.md`; proof: doc diff reference.
9. Adopt the Publer adapter contract (job id + status polling) in the social workflow UI; proof: `npm run test:ci -- publer` excerpt.
10. Surface Publer session-token error states with accessible Polaris banners and retry guidance; proof: screenshot with axe results.
11. Thread tone-learning instructions through the Publer review tabs and confirm translations/tone copy; proof: copy deck snippet.
12. Validate dashboard tiles (revenue, AOV, returns, approvals, ideas) against latency thresholds with instrumentation hooks; proof: log capture included in feedback.
13. Implement the service health panel summarizing DevOps workflow + Supabase migration status; proof: screenshot embedded in feedback.
14. Add SSE→polling fallback with telemetry guards for dashboard tiles; proof: unit test diff.
15. Unify toast queue, retry hook, and skeleton patterns across approvals, idea pool, and dashboard modules; proof: Vitest suite output.
16. Refresh responsive grid + dark mode tokens for dashboard and approvals surfaces, validating across breakpoints; proof: responsive screenshots.
17. Update `docs/specs/frontend_overview.md` with new diagrams, payload samples, and render timings for idea pool/Publer/dash tiles; proof: doc diff snippet.
18. Write feedback to feedback/engineer/2025-10-17.md and clean up stray md files.

## Constraints

- **Allowed Tools:** `bash`, `node`, `npm`, `npx prettier`, `codex exec`, `sed`, `rg`
- **Touched Directories:** `app/`, `tests/`, `docs/`, `integrations/new_feature_20251017T033137Z/manager_agent_pack_v1/`
- **Budget:** ≤45 minutes wall-clock per task slice, ≤5,000 tokens per ticket, ≤3 files modified per PR
- **Guardrails:** Keep changes within launch feature pack scope, uphold WCAG 2.1 AA + Polaris patterns, use MCP tooling before touching production-like data

## Definition of Done

- [ ] Objective satisfied within scope (AppProvider, idea pool, Publer, dashboard health surfaces)
- [ ] `npm run fmt` and `npm run lint` completed with logs shared
- [ ] `npm run test:ci` (or targeted equivalents) captured for new/changed surfaces
- [ ] `npm run scan` secrets check recorded
- [ ] Updated docs/runbooks when behavior or flows change, referencing feature pack assets
- [ ] Feedback entry filed at `feedback/engineer/2025-10-17.md` with evidence links

## Risk & Rollback

- **Risk Level:** Medium — misaligned direction blocks launch readiness downstream.
- **Rollback Plan:** `git checkout -- docs/directions/engineer.md` prior to staging or revert PR on GitHub if already pushed.
- **Monitoring:** Track dashboard latency probes, Supabase idea events, and Publer workflow telemetry via feature pack dashboards.

## Links & References

- North Star: `docs/NORTH_STAR.md`
- Agent Template: `docs/directions/agenttemplate.md`
- Feature Pack Routes: `integrations/new_feature_20251017T033137Z/manager_agent_pack_v1/06-ui/react_router7_routes.tsx`
- Supabase Schema: `integrations/new_feature_20251017T033137Z/manager_agent_pack_v1/03-database/supabase_schema.sql`
- AppProvider Harness Context: `tests/unit/components/`
- Feedback Log: `feedback/engineer/2025-10-17.md`

## Change Log

- 2025-10-17: Version 1.2 — Refreshed direction with launch-aligned tasks and updated DoD/constraints.
- 2025-10-16: Version 1.1 — Publer integration, approvals data wiring, test/health workflow expansion.
- 2025-10-15: Version 1.0 — Initial direction for dashboard shell + approvals drawer foundation.
