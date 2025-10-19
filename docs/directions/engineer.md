# Engineer Direction

- **Owner:** Engineer Agent
- **Effective:** 2025-10-18
- **Version:** 2.1

## Objective

Current Issue: #78

1. Unblock build by fixing top lint/type/test issues in `app/**` (minimal diffs to get staging green today).
2. After green, begin Guided Selling/Kit Composer planning per manager plan (`programmatic lanes`), focusing on rules graph and route skeleton (no merges yet).

## Tasks

1. Review failing build tail; fix import/type errors in components/routes (deliverable: PR with only required changes).
2. Add/adjust minimal unit tests for approvals drawer render states to stabilize imports.
3. Run scoped lint: `npx eslint app/** tests/unit/**` and fix blockers.
4. Coordinate with QA to ensure smoke passes after fixes. Address #81 (MissingAppProviderError on `/approvals`) in SSR tree.
5. Write feedback to `feedback/engineer/2025-10-18.md` and clean up stray md files.
6. Once green: draft Guided Selling/Kit Composer outline (rules graph + route skeleton) under `docs/specs/hitl/guided-selling*`.

## Autonomy Mode (Do Not Stop)

- If blocked > 15 minutes (env/CI/review), post a brief blocker note in the Issue and switch to the next item in the fallback work queue below. Do not idle.
- Always stay within Allowed paths and keep diffs minimal. Attach logs/evidence.

## Fallback Work Queue (aligned to NORTH_STAR)

1. Guided Selling/Kit Composer planning (issue #78) — docs/specs/hitl/guided-selling\*
2. Approvals robustness — add SSR/provider coverage tests for Polaris routes
3. Feature flags wiring (autopublish toggles surfaced, default OFF)
4. Error boundaries and a11y checks for core tiles/routes
5. Tech debt sweep for agent service and route loaders
6. Standardize Polaris wrappers/hooks; dedupe UI helpers
7. Structured logging coverage in server loaders/actions
8. Performance instrumentation for SSR/API routes (timers + histograms)
9. Code-splitting for large routes; ensure chunks stay < 200kB gz
10. Expand Playwright smoke to include `/approvals` states and navigation
11. Lint rule tightening and autofixes for common pitfalls
12. Test utilities for fixtures/mocks to stabilize unit tests
13. Add graceful error fallbacks for unknown env (dev/staging)
14. Document route contracts and loader inputs/outputs

## Upcoming (broad lanes — break into molecules)

- Guided Selling + Kit Composer (fit‑finder, adapters, one‑click add)
  - Allowed paths (planning): `docs/specs/hitl/guided-selling*`, `feedback/engineer/**`
  - Deliverables: rules graph outline, route/UX skeleton proposal (no code merge yet)
- Inventory Overnight Settlement (Canada proxy → zero; main WH offset)
  - Allowed paths (planning/spec alignment): `docs/specs/hitl/inventory-updates*`, `feedback/engineer/**`
  - Deliverables: job design doc (idempotency, retries), ledger schema draft
- Bundles BOM webhook adjustments (orders/paid → decrement components)
  - Allowed paths (planning/spec alignment): `docs/specs/hitl/bundles-bom*`, `feedback/engineer/**`
  - Deliverables: resolution rules, webhook retry/backoff plan
- Approvals: wire autopublish toggles (disabled by default) to settings
  - Allowed paths (planning): `docs/specs/hitl/approvals-framework*`, `feedback/engineer/**`
  - Deliverables: feature toggle design, rollback path

## Constraints

- **Allowed Tools:** `bash`, `npm`, `npx`, `node`, `rg`, `jq`, `codex exec`
- **Process:** Follow docs/OPERATING_MODEL.md (Signals→Learn pipeline). Shopify via MCP; GA4/GSC via internal adapters (no MCP). Log daily feedback per docs/RULES.md.
- **Touched Directories:** `app/components/**`, `app/routes/**`, `tests/unit/**`, `tests/playwright/**`, `feedback/engineer/2025-10-18.md`
- **Budget:** time ≤ 60 minutes, tokens ≤ 140k, files ≤ 50 per PR
- **Guardrails:** No uncontrolled feature merges; follow Allowed paths; maintain CI.

## Definition of Done

- [ ] Components tested and accessible
- [ ] `npm run fmt` and `npm run lint`
- [ ] `npm run test:ci` green
- [ ] `npm run scan`
- [ ] Docs updated (QA/engineer notes)
- [ ] Feedback entry updated
- [ ] Contract test passes

## Contract Test

- **Command:** `npx vitest run tests/unit/approvals.drawer.spec.ts`
- **Expectations:** Drawer renders draft/pending/approved; imports resolve

## Risk & Rollback

- **Risk Level:** Medium — UI defects hinder HITL approvals.
- **Rollback Plan:** Use feature flags to disable new routes, revert component merges, redeploy stable bundle.
- **Monitoring:** Playwright dashboard suites, client error logs.

## Links & References

- North Star: `docs/NORTH_STAR.md`
- Roadmap: `docs/roadmap.md`
- Feedback: `feedback/engineer/2025-10-18.md`
- Specs / Runbooks: `docs/tests/idea-pool-harness.md`

## Change Log

- 2025-10-18: Version 2.1 – Build unblock focus for launch
- 2025-10-17: Version 2.0 – Production harness alignment + accessibility focus
- 2025-10-16: Version 1.0 – Router harness refactor + idea pool wiring
