---
epoch: 2025.10.E1
doc: feedback/engineer.md
owner: engineer
last_reviewed: 2025-10-09
doc_hash: TBD
expires: 2025-10-06
---

## 2025-10-12 — Modal Locator Hardening & Readiness Prep
- 2025-10-12T18:45:00Z — Hardened CX Escalations/Sales Pulse triggers and dialogs with `data-testid` hooks (`cx-escalations-open`, `cx-escalation-dialog`, `sales-pulse-open`, `sales-pulse-dialog`) so Playwright selectors stay stable if copy shifts.
- 2025-10-12T18:48:00Z — Updated `tests/playwright/modals.spec.ts` to target the new test IDs; tests now assert modal headings remain intact.
- 2025-10-12T18:52:24Z — Executed `npx playwright test tests/playwright/modals.spec.ts`; suite passed (2/2) with mock data, artifact captured via CLI logs above. Full e2e remains mock-only until staging feature flags + credentials land.
- Blockers: Staging credential bundle/feature flag enablement still pending; Supabase staging DSN continues to reject IPv4 which keeps Prisma smoke evidence blocked.
- 2025-10-12T14:32Z — Data flagged Supabase mirror mismatch: live schema exposes `actor/action/rationale`, but `packages/memory/supabase.ts` still writes `who/what/why`. Need engineering pairing to update insert/select mappings + expand unit tests before next export attempt.
- 2025-10-12T14:55Z — Patched `packages/memory/supabase.ts` to map to `DecisionLog` schema (`actor/action/rationale/externalRef`, table `DecisionLog`), updated unit coverage in `tests/unit/supabase.memory.spec.ts`, and confirmed `npm run test:unit -- tests/unit/supabase.memory.spec.ts` passes. Ready for data retry once reliability publishes NDJSON.

### Recommendations
1. Coordinate with deployment/QA to deliver the staging credential bundle and flip `FEATURE_AGENT_ENGINEER_SALES_PULSE_MODAL`/`FEATURE_AGENT_ENGINEER_CX_ESCALATIONS_MODAL` so we can capture live Playwright evidence.
2. Pair with reliability on the Supabase IPv4 routing fix (or provision a dual-stack endpoint) so `npm run db:migrate:postgres` succeeds against staging.
3. Once staging is reachable, rerun Playwright suite against live data (`?mock=0`) and archive the HTML report in `artifacts/playwright/` per evidence mandate.
4. After DSN unblock, record Prisma migration smoke logs and attach them to `artifacts/migrations/` for QA handoff.
## 2025-10-10 — Sanitized History Verification

## 2025-10-10 — Supabase Credential Sync Confirmation

## 2025-10-10 — Supabase Memory Retry CI

## 2025-10-10 — Supabase Memory Schema Alignment

## 2025-10-10 — Chatwoot Embed Config Audit

## 2025-10-10 — Playwright Shopify Embed Utilities

## 2025-10-10 — QA Revalidation Plan (Current Secrets)
- Confirm `.env.staging` matches vault overlays already synced today (`DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, Shopify API key/secret, `SHOPIFY_APP_URL`); no stale DSNs detected post-sanitization.
- Prisma drill: with existing credentials, run `npm run db:generate:postgres` + `npm run db:migrate:postgres` and capture CLI output in `artifacts/migrations/<timestamp>/`. Hold off on new migrations until QA signs off on this evidence.
- Vitest coverage: execute `npm run test:unit -- --runInBand` to refresh coverage using current secrets; drop resulting `coverage/vitest/coverage-final.json` + summary in QA backlog item OCC-QA-117.
- Playwright modals spec: set `PLAYWRIGHT_BASE_URL=https://hotdash-staging.fly.dev`, `DASHBOARD_USE_MOCK=0`, and verify `FEATURE_AGENT_ENGINEER_{sales_pulse,cx_escalations}_MODAL=1` remain active. Run `npx playwright test tests/playwright/modals.spec.ts --project chromium` and store the HTML report under `coverage/playwright/`.
- Backlog sync: updated QA tracking ticket with dependency checklist (Prisma drill, Vitest report, Playwright artifacts) so they can resume as soon as evidence artifacts land.

## 2025-10-10 — Prisma Postgres Drill

## 2025-10-10 — Supabase Staging Migration Attempt
- 2025-10-12T14:40:00Z — Designer needs CX Escalations & Sales Pulse modals exposed in staging ASAP for annotated capture per sprint focus. Please confirm once `FEATURE_AGENT_ENGINEER_CX_ESCALATIONS_MODAL` and `FEATURE_AGENT_ENGINEER_SALES_PULSE_MODAL` are enabled (or alternate staging toggle is available) so we can run `docs/design/staging_screenshot_checklist.md` end-to-end. Current behavior: `https://hotdash-staging.fly.dev/app?mock=1&modal=sales` and `...&modal=cx` still render the dashboard with no dialog.
- 2025-10-12T15:05:00Z — Added locator/ARIA expectations to the staging checklist for QA scripting: Sales Pulse trigger `role=button name="View details"`, dialog labelled `sales-pulse-modal-title`; CX Escalations trigger `Review` button with modal labelled `CX Escalation — <customer>` and reply textarea `aria-label="Reply text"`; Inventory Heatmap placeholder selectors `View heatmap` / `inventory-heatmap-modal-title` with actions `Confirm action | Mark as intentional | Snooze alert`. Please confirm final accessible names/test IDs (or share alternates) so Playwright hooks stay aligned once flags toggle on.

## 2025-10-10 — Supabase Memory Unit Tests

## 2025-10-10 — Shopify Config Sync

## 2025-10-10 — Supabase Memory Telemetry

## 2025-10-10 — CX & Sales Modal Implementation

## Direction Sync — 2025-10-09 (Cross-role Coverage)
- 2025-10-09T15:07:08-06:00 — `git stash push --include-untracked --message "restart-cycle-2025-10-11"` (no local changes; no stash created, worktree already clean).
- Re-read `docs/directions/engineer.md` and `docs/runbooks/restart_cycle_checklist.md` post-restart to confirm guardrails and backlog focus before resuming Shopify sync tasks.
- 2025-10-09T15:18:00-06:00 — Implemented Shopify Admin GraphQL retry wrapper (`app/services/shopify/client.ts`) with exponential backoff + jitter; added unit coverage in `tests/unit/shopify.client.spec.ts` and captured `npm run test:unit` evidence.
- 2025-10-09T15:30:33-06:00 — Reviewed refreshed `docs/directions/engineer.md` (sprint focus + guardrails) and `docs/runbooks/restart_cycle_checklist.md` (restart evidence requirements) to ensure alignment before continuing backlog execution.
- 2025-10-09T15:35:56-06:00 — Added Shopify CLI wrapper (`scripts/ops/run-shopify-cli.mjs`) that emits structured logs in `artifacts/engineering/shopify_cli/` and integrated it into staging/production deploy scripts for observability.
- 2025-10-09T15:50:54-06:00 — Linked repo to Partner app via `shopify app config link`, updated `shopify.app.toml`/`shopify.web.toml` with staging URL + scopes, reran SQLite migrations (`npx prisma migrate deploy --schema prisma/schema.prisma`), and noted Postgres deploy blocked pending `DATABASE_URL`; `npm run setup` currently fails (`EACCES` unlinking `node_modules/.prisma/client/index.js`) due to root-owned artifacts.
- 2025-10-09T16:20:53-06:00 — Pulled staging DSN from `vault/occ/supabase/database_url_staging.env`; `npm run db:migrate:postgres` still fails with `FATAL: Tenant or user not found` against Supabase pooler. Logged parity attempt (`npm run ops:check-analytics-parity`) which remains blocked on missing `facts` table—JSON output recorded in terminal. Awaiting reliability/deployment to supply working Postgres credentials or bootstrap `supabase/sql/analytics_facts_table.sql` before retrying migrations/QA validation.
- Reviewed sprint focus (Supabase sync fix, Postgres staging enablement, modal polish, telemetry wiring) per `docs/directions/engineer.md`.
- Blocked: currently handling integrations workload; engineering execution paused until dedicated owner and pending dependencies (Supabase schema, Lighthouse target) are resolved.

## 2025-10-08 — Direction Acknowledgment
- Reread docs/directions/engineer.md sprint focus (Supabase sync stability, Postgres staging enablement, modal polish, dashboard telemetry) and ready to execute.
- Dependency: Supabase data/reliability need to apply `supabase/sql/analytics_facts_table.sql` so the parity script can compare rows without `PGRST205` failures.
- Status: Feature flag module restored locally; unit tests now pass when `npm run test:unit` targets affected specs.
- Status: Lighthouse runner now consumes `STAGING_SMOKE_TEST_URL` fallback; waiting on staging secret wiring before evidence capture.

## 2025-10-10 — Production Blockers Status
- **Supabase sync fix:** Parity script now exits with a `supabase.facts_table_missing` hint when the `facts` table is absent. Latest run (`npm run ops:check-analytics-parity`) captured the blocked event in `artifacts/logs/supabase_parity_run_2025-10-10.json`; waiting on reliability to execute `supabase/sql/analytics_facts_table.sql` and supply credentials so we can retest against live data.
- **Staging Postgres + secrets:** Runbook (`docs/runbooks/prisma_staging_postgres.md`) and CLI helpers are ready; blocked until deployment shares the staging `DATABASE_URL`/shopify secrets so QA can run forward/back drills.
- **GA MCP readiness:** Checklist in `docs/integrations/ga_mcp_onboarding.md` is staged; OCC-INF-221 still holds the host/credential handoff—tracking with integrations and compliance for ETA before enabling telemetry tests.
- **Operator dry run:** Accessibility polish plan + telemetry wiring notes prepped; awaiting product confirmation of the 2025-10-16 slot and staging access to validate modals before the rehearsal.

## Shopify Install Push — 2025-10-10 10:18 UTC
- Once deployment confirms secrets sync, run `shopify app config link` to bind the repo to the Partner app and update `shopify.app.toml`/`shopify.web.toml` with the real staging URLs + required scopes (`read_orders`, `read_inventory`, etc.).
- After Supabase `DATABASE_URL` lands, execute `npm run db:migrate:postgres` (plus rollback check) against staging and log results; rerun `npm run ops:check-analytics-parity` once reliability applies the `facts` table migration.
- Pair with QA on Shopify Admin Playwright coverage hitting live data and capture telemetry artefacts (decision logs, rate-limit events) for the evidence bundle.

## 2025-10-08 — Progress Update
- Supabase parity script now surfaces missing `facts` table with actionable hint and references new `supabase/sql/analytics_facts_table.sql` bootstrap SQL.
- Added Supabase facts bootstrap SQL and documented it in `docs/runbooks/prisma_staging_postgres.md` so staging Postgres mirrors can be prepared before parity checks.
- Restored feature flag configuration (`app/config/featureFlags.ts`) with dual-prefix support plus unit coverage, unblocking `npm run test:unit`.
- Updated Lighthouse runner to fall back to `STAGING_SMOKE_TEST_URL` and seeded `.env.example` so evidence commands run locally once the smoke URL is known.

## 2025-10-08 — Sprint Focus Activation
- Partnered with reliability/data to catalogue Supabase failure signatures (timeouts vs 4xx) as prep for instrumentation patch per `docs/directions/engineer.md:26`.
- Assembled Postgres staging enablement checklist (env overrides, Prisma commands, smoke script) ready to execute once deployment delivers credentials per `docs/directions/engineer.md:27`.
- Compiled accessibility polish to-dos for CX Escalations + Sales Pulse modals (ARIA labels, focus traps, status icons) and queued design questions to satisfy `docs/directions/engineer.md:28`.
- Drafted telemetry wiring plan for dashboard refresh events (loader/action/analytics service) aligning with `docs/directions/engineer.md:29`; pending analytics artifact references to finalize.

## 2025-10-09 Sprint Execution
- Reviewed Supabase retry/backoff implementation with reliability to scope additional integration coverage; waiting on production parity script to validate fix against real data.
- Began drafting Postgres staging smoke checklist (migrate forward/back, seed, smoke tests) to support QA once credentials arrive; currently blocked by database access from deployment.
- Sketched accessibility polish tasks for CX Escalations/Sales Pulse modals (ARIA labels, focus traps) and queued work behind outstanding design annotation updates.

## 2025-10-10 Production Blocker Sweep
- Supabase decision sync fix: ready to pull and wire the monitor script as soon as reliability supplies the patch; also planning to expand integration test harness to cover retry/backoff once real logs confirm error codes.
- Staging Postgres + secrets: maintaining the migration smoke checklist and Prisma Postgres scripts so forward/back validation can begin the moment deployment shares connection strings.
- GA MCP readiness: prepared to review typed client instrumentation once integrations drops live credentials; no code changes pending without host/service key.
- Operator dry run: lining up modal accessibility refinements (ARIA labels, keyboard traps, success toasts) so we can land polish before the 2025-10-16 rehearsal once designer annotations arrive.
- Captured active triage checklist in `artifacts/logs/supabase_retry_plan_2025-10-09.md` so instrumentation/logging tasks can move as soon as Supabase credentials land.

## 2025-10-09 Production Blocker Push
- Supabase fix: prepped logging patch (structured error + retry metrics) and ready to run `npm run test:unit -- tests/unit/supabase.memory.spec.ts` once reliability shares the staging `SUPABASE_SERVICE_KEY` and log export for replay.
- Staging Postgres + secrets: paired with deployment to finalize Prisma override steps; queued forward/back migration script (`npm run db:migrate:postgres` / `npm run db:rollback:postgres`) pending credential drop.
- GA MCP readiness: reviewed parity harness to confirm engineering coverage once credentials arrive; standing by to assist data/integrations with schema adjustments if Supabase logging needs code changes.
- Operator dry run: coordinating with designer/enablement to slot accessibility fixes and telemetry wiring ahead of the 2025-10-16 session once annotations/assets land.
- 19:15 ET: posted reminders in reliability + deployment threads requesting Supabase log bundle and staging Postgres credentials; will cut PR with logging patch as soon as evidence arrives.

## 2025-10-08 Sprint Execution
- Added detailed logging branch for Supabase decision sync failures (captures `status`, `duration_ms`, `retry_count`) pending secret delivery so we can replay incidents per sprint focus.
- Partnered with deployment on mapping Prisma Postgres overrides; staged command sequence (`npm run db:migrate:postgres`, `npm run db:rollback:postgres`) for QA once credentials are shared.
- Started aligning telemetry events for dashboard refresh (loader/action) with analytics service to unblock instrumentation as soon as Supabase blockers are cleared.

## 2025-10-09 Sprint Focus Kickoff
## 2025-10-09 Production Blockers Update
- Supabase decision sync: prepared instrumentation patch (structured error log + parity counter) and queued PR draft; execution still pending real Supabase logs/service key from reliability to validate fixes.
- Staging Postgres enablement: paired with deployment on connection override checklist; awaiting credentials to run forward/back migration proof for QA.
- Operator dry run polish: integrated new status icons/focus ring utilities (`app/components/tiles/TileCard.tsx`, `app/styles/tokens.css`); remaining blocker is Supabase persistence for full telemetry test.

- Supabase decision sync triage: reviewed existing retry implementation and outlined additional instrumentation (structured error logging + parity counters); blocked on reliability delivering raw logs and staging credentials to reproduce the 25% failure.
- Postgres staging enablement: synced with deployment to confirm pending env overrides and smoke script; awaiting DB credentials before running forward/back migration validation.
- Modal polish: listed outstanding accessibility items (status icons, focus-visible tweaks) and queued work once designer assets/Figma tokens arrive.
- Dashboard refresh telemetry: mapped loader/action touchpoints for event logging; need Supabase decision log persistence before wiring metrics end-to-end.

# Engineer Daily Status — 2025-10-05

## Summary
- **Database**: Created and applied Prisma migration `20251005160022_add_dashboard_facts_and_decisions`
- **Testing**: Implemented auth bypass for test/mock mode; configured Playwright; all unit tests passing (6/6)
- **UI Components**: Refactored dashboard with design token integration following Polaris alignment
  - Created `app/styles/tokens.css` with full design system tokens
  - Built modular tile component library (`app/components/tiles/`)
  - Extracted 5 tile components: Sales Pulse, Fulfillment Health, Inventory Heatmap, CX Escalations, SEO Content
  - Refactored `app._index.tsx` to use new components with testId attributes for E2E testing
- **Build**: Verified successful build with CSS tokens (app-BnOxWyYj.css: 5.92 kB)

## Completed Tasks
1. ✅ Prisma migration created and applied for DashboardFact and DecisionLog tables
2. ✅ Test bypass implemented for Shopify authentication (app.tsx:8-15, supports NODE_ENV=test and ?mock=1)
3. ✅ Playwright configuration updated for test environment (playwright.config.ts:21-32)
4. ✅ Design tokens CSS created with Polaris alignment (app/styles/tokens.css)
5. ✅ Tile component library created (app/components/tiles/)
   - TileCard (base wrapper with status, metadata display)
   - SalesPulseTile, FulfillmentHealthTile, InventoryHeatmapTile, CXEscalationsTile, SEOContentTile
6. ✅ Dashboard route refactored to use modular components (app/routes/app._index.tsx)
7. ✅ All unit tests passing (6/6 test files)
8. ✅ Build verified with CSS token integration

## Evidence Links

### Database Migrations
- Migration: `prisma/migrations/20251005160022_add_dashboard_facts_and_decisions/migration.sql`
- Schema: `prisma/schema.prisma:34-62`

### UI Components & Design Tokens
- Design tokens: `app/styles/tokens.css` (6.68 kB compiled)
- Tile components: `app/components/tiles/`
  - `TileCard.tsx` (base wrapper)
  - `SalesPulseTile.tsx`
  - `FulfillmentHealthTile.tsx`
  - `InventoryHeatmapTile.tsx`
  - `CXEscalationsTile.tsx`
  - `SEOContentTile.tsx`
  - `index.ts` (barrel export)
- Dashboard: `app/routes/app._index.tsx` (refactored with token integration)

### Testing Infrastructure
- Unit tests: **6/6 passing** (tests/unit/)
- Build output: `build/client/assets/app-BnOxWyYj.css` (5.92 kB)
- Playwright config: `playwright.config.ts`
- Auth bypass: `app/routes/app.tsx:8-15`

## Blockers / Risks
- Playwright E2E tests may need additional configuration for full green status (server startup timing)
- Feature flag system not yet implemented per engineer directions (`agent/engineer/<tile>`)
- No dedicated test database configuration (currently using dev.sqlite for all environments)

## Next Actions (Per Manager's Direction)
Based on manager feedback (2025-10-05), next priority is:
- Implement wireframe components using design tokens from docs/design/tokens/
- Follow Polaris design system alignment per docs/design/wireframes/dashboard_wireframes.md
- Ensure accessibility criteria met (WCAG 2.2 AA) per docs/design/accessibility_criteria.md
- Implement localization using copy deck (docs/design/copy_deck.md)

## Compliance with Engineer Directions
- ✅ Maintain caching discipline: Services use cache.ts with TTL respect
- ✅ Prisma migrations paired with client regen: Migration applied with `prisma generate`
- ✅ Unit tests with Vitest: 6/6 passing
- ⚠️ Feature flags: Not yet implemented (future work)
- ⚠️ Evidence mandate (Vitest + Playwright + Lighthouse): Vitest ✓, Playwright config ✓, Lighthouse pending
- ✅ ServiceErrors logged with scope + code: Implemented in services/types.ts
- ✅ Mock mode discipline: All services support mock mode via DASHBOARD_USE_MOCK env var

## Technical Debt / Follow-up Items
1. Verify Lighthouse target URL is defined and capture current performance evidence
2. Consider adding integration tests for Prisma operations once Postgres staging backfills stabilize
3. Evaluate CI coverage for Playwright smoke to ensure staging pipeline stays green post-refresh wiring

## 2025-10-08 — Postgres Staging Configuration
- Added Postgres-specific Prisma schema (`prisma/schema.postgres.prisma`) and npm helpers (`db:*:postgres`) so QA can run forward/back migration drills against managed Postgres.
- Published `.env.staging.example` template carrying Postgres + evidence env hooks for deployment/reliability coordination.
- Authored runbook `docs/runbooks/prisma_staging_postgres.md` documenting setup, migrate/reset steps, and evidence capture for QA/deployment.
- Updated `docs/deployment/env_matrix.md` to reference the new runbook beside the `DATABASE_URL` guidance.

## Governance Acknowledgment — 2025-10-06
- Reviewed docs/directions/README.md and docs/directions/engineer.md; acknowledge manager-only ownership and Supabase secret policy.
