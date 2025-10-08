---
epoch: 2025.10.E1
doc: feedback/manager.md
owner: manager
last_reviewed: 2025-10-08
doc_hash: TBD
expires: 2025-10-09
---
# Manager Daily Status — 2025-10-08

## Deployment Pipeline Status — 2025-10-08
- **Staging pipeline online:** Added `.github/workflows/deploy-staging.yml` with verify → deploy jobs and Shopify CLI orchestration via `scripts/deploy/staging-deploy.sh`, emitting Playwright, Lighthouse, and synthetic smoke artifacts. Documentation captured in `docs/runbooks/deployment_staging.md` (overview references production hand-off).
- **Production workflow drafted:** `.github/workflows/deploy-production.yml` enforces manual dispatch with release tag, go-live checklist link, and manager/reliability approvers; wraps `scripts/deploy/production-deploy.sh` plus Lighthouse + smoke evidence.
- **Readiness docs published:** Environment matrix now tracks prod secret provisioning and smoke budgets (`docs/deployment/env_matrix.md`), and go-live checklist aligns with the new workflow inputs and performance targets (`docs/deployment/production_go_live_checklist.md`).
- **Status log updated:** `feedback/deployment.md` reflects direction acknowledgement, shipped artifacts, outstanding risks, and next actions.
- **Outstanding needs:** Reliability to populate GitHub `production` environment secrets by 2025-10-09, repo admins to set environment reviewers, deployment to generate service Shopify CLI token once creds land (see follow-ups in env matrix + deployment log).

## AI Escalation Enablement — Outstanding Requirements
- **Supabase credentials:** `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` are still unset on the AI workstation. `getSupabaseConfig()` now loads `.env`, but without real values decision logs remain in the in-memory fallback and never sync to Supabase/Memory MCP. Requesting staging (or prod-ready) credentials so we can validate persistence before the M1 dry run.
- **QA artifact storage:** Prompt regression now auto-writes JSON artifacts to `artifacts/ai/prompt-regression-<timestamp>.json`. QA needs the canonical destination for bundling these with Playwright evidence. Please confirm if we keep them under `artifacts/ai/` in repo, publish to an external bucket, or adjust CI to collect them.
- **Kill switch coordination:** `FEATURE_AI_ESCALATIONS` defaults to `0`. Turn it on per environment (`FEATURE_AI_ESCALATIONS=1`) once Supabase logging is active and QA has the artifact flow in place; otherwise the modal ships template-only.

## Support / CX Escalations Update — 2025-10-08
- **Template heuristics shipped:** Chatwoot escalations service now picks `ship_update`, `refund_offer`, or `ack_delay` based on tags/message keywords and renders customer names before approval flows. Unit tests updated to cover the paths (`app/services/chatwoot/escalations.ts`, `tests/unit/chatwoot.escalations.spec.ts`).
- **Label alignment:** Escalation action now tags conversations with `escalation` (was `escalated`) to match SOP terminology and runbook guidance (`app/routes/actions/chatwoot.escalate.ts`).
- **Runbook refresh:** Added annotated modal screenshots, approval heuristics, greeting checks, and validation notes so operators train against the live flow (`docs/runbooks/cx_escalations.md`).
- **Outstanding items:** Product still owes confirmation on the 2025-10-16 dry run (`docs/runbooks/operator_training_agenda.md`). French template localization declared out-of-scope; localization cadence paused unless requirements change.
- **Risks:** Heuristics rely on simple keyword detection; needs real-conversation validation post-staging seed. Modal still lacks template editing—operators must escalate when suggestions misfit.

# Manager Daily Status — 2025-10-07

## Direction Update — 2025-10-07
- Refresh sprint focus in `docs/directions/ai.md`, `docs/directions/data.md`, `docs/directions/designer.md`, `docs/directions/engineer.md`, `docs/directions/marketing.md`, `docs/directions/product.md`, `docs/directions/qa.md`, `docs/directions/reliability.md`, and `docs/directions/support.md` to align with the M1/M2 check-in.
- Updated AI and QA sprint focus (2025-10-08) to reflect regression evidence sharing and compliance/deployment dependencies ahead of the M1/M2 review.
- Added supporting agents (Compliance, Deployment, Integrations) with direction docs under `docs/directions/compliance.md`, `docs/directions/deployment.md`, and `docs/directions/integrations.md`; localization workstream retired as the program is English-only.
- All agents must review the updated direction doc for their role, acknowledge in their feedback log today, and raise blockers ahead of the 2025-10-08 sync.
- Reminder: Manager direction updates now land in `feedback/manager.md`. When you need the latest assignments or sprint focus, check this file first.

## Summary
- Playwright gate is green again (21/21 unit tests, 7/7 Playwright) after the engineer landed the accessible heading and modal flows; reliability confirms CI stability.
- CX Escalations and Sales Pulse modals plus Supabase Memory analytics logging are live, unlocking QA coverage and operator dry-run prep.
- Data delivered the first weekly insight packet and Supabase monitoring brief; reliability staged synthetic checks and artifact retention.
- Data insight highlights for operator readiness: Sales activation dipped 30% vs. baseline (critical anomaly) per `docs/insights/weekly_2025-10-07.md:31`, Chatwoot SLA breach rate holding at 50% warning per `docs/insights/weekly_2025-10-07.md:75`, and GA traffic anomaly alerts flag `/blogs/news/october-launch` at -27% WoW per `docs/insights/weekly_2025-10-07.md:100` — prep follow-up playbooks before live swap.
- Demo shop seeds now cover Evergreen Outfitters, Belle Maison Décor, and Peak Performance Gear via `npm run seed` (multi-domain support in `prisma/seeds/dashboard-facts.seed.ts:1`), and GA MCP parity harness (`scripts/analytics/ga-mcp-schema-check.ts:1`) plus baseline artifact `artifacts/ga/mock_schema.json:1` are ready for credential hand-off to integrations/compliance.
- Coordination brief issued to integrations & compliance (`feedback/data_to_integrations_coordination.md:1`) capturing the T0 go-live window (seed run, parity check, Supabase alert verification) so credential delivery can move directly into checklist execution.
- AI prompt regression and logging services are ready; awaiting go/no-go on live generation pending M1/M2 alignment.

## Blockers / Risks
- Supabase decision sync monitor now wired to real logs; first run showed **25% error rate (critical)** — reliability + data need root cause and mitigation.
- GA MCP credentials still pending, keeping analytics in mock mode.
- Designer remains blocked on Figma workspace access, delaying the shared component library.

## Actions & Assignments
- **Engineer**: Ship P0 accessibility fixes (ARIA roles, focus indicators, status icons) from `feedback/design_qa_report.md`; partner with data/reliability to expose Supabase analytics metrics and confirm alert logging; rerun Vitest/Playwright/Lighthouse after the fixes and attach artifacts.
- **Designer**: Schedule a 2h pairing session with engineering on modal accessibility, prep interim status icon assets, and escalate the Figma access blocker; ensure all design artifacts reflect the English-only scope.
- **QA**: Execute the refreshed direction (Playwright coverage + migration validation + Supabase logging verification + AI regression evidence bundle) and keep artifacts logged in `feedback/qa.md`.
- **Data**: Continue Markdown + SQL weekly insight format (approved); collaborate with reliability on Supabase monitoring instrumentation; hold Prisma seed run until demo shop list arrives by 2025-10-08 and loop integrations/compliance on GA MCP status.
- **Reliability**: Respond to the Supabase monitoring request, wire `scripts/ci/synthetic-check.mjs` into a scheduled workflow, and publish the Supabase/Zoho/Shopify/Chatwoot secret rotation plan by 2025-10-10; log the first synthetic check metrics and share rotation cadence with deployment/compliance. Investigate the new Supabase critical alert with data/engineering and report mitigation plan by 2025-10-09. Coordinate with Shopify + Chatwoot owners for staging credentials so rotation dry-runs can start by 2025-10-15 (requests sent 2025-10-08, awaiting confirmation).
- **AI**: Draft the integration plan with engineering for routing AI recommendations through modal approvals; defer external LLM calls until post M1/M2 sign-off; keep `npm run ai:regression` running daily and log outputs in Memory.
- **Marketing**: Secure product approval on the launch comms packet, release notes template, and brand tone deck; coordinate tooltip placement with design; align support training schedule for the new materials and confirm messaging stays English-only.
- **Product**: Review marketing deliverables, escalate Figma access for design, supply the demo shop list to data, loop compliance/deployment into the dry-run release plan, and shape the operator dry-run plan once QA clears modals; remove localization tasks from the backlog.
- **Support**: Begin drafting the CX escalation runbook skeleton using the new modal decision paths; prepare the template review cadence ahead of go-live and update materials to reflect the English-only strategy.
- **Enablement** (Marie Dubois): Update runbooks to the English-only scope, produce CX Escalations/Sales Pulse job aids, and coordinate the 2025-10-16 operator dry run logistics; log updates in `feedback/enablement.md`.
- **Compliance** (Casey Lin): Build the end-to-end data inventory, draft the incident response runbook with reliability/support, and review GA MCP/Supabase/Anthropic agreements for privacy gaps; log findings in `feedback/compliance.md`.
- **Deployment** (Devon Ortiz): Execute the revised sprint focus in `docs/directions/deployment.md` (staging workflow + Postgres environment provision + env matrix + go-live checklist) and log evidence in `feedback/deployment.md`.
- **Integrations** (Priya Singh): Secure GA MCP credentials, finalize the social sentiment vendor recommendation with marketing/reliability, and publish the integration readiness dashboard ahead of the 2025-10-08 review; record updates in `feedback/integrations.md`.

## Evidence Links
- feedback/engineer.md — 2025-10-07 modal, analytics, and test status.
- feedback/reliability.md — 2025-10-07 CI stability, synthetic check readiness.
- feedback/data.md — 2025-10-06 weekly insight packet, monitoring coordination.
- feedback/design_qa_report.md — 2025-10-06 accessibility gaps and priorities.
- feedback/ai.md — 2025-10-06 logging + regression harness status.
- feedback/marketing.md, feedback/support.md, feedback/product.md — outstanding deliverables awaiting direction.

# Manager Daily Status — 2025-10-05

## Summary
- Established Operator Control Center north-star plan and scoped v1 tile lineup across CX, sales, inventory, and SEO.
- Authored technical designs for Shopify services, Chatwoot tile, GA ingest (mock-first) plus Prisma migration plan.
- Landed CI scaffolding (Vitest, Playwright, Lighthouse) and schema additions for dashboard facts + decisions.
- Implemented Shopify/Chatwoot/GA service layers with caching + Prisma persistence, approval action, and unit tests.
- Published role direction docs (engineer, designer, QA, product, data, AI, reliability, marketing, support) to synchronize evidence policy across agents.
- Added direction governance (docs/directions/README.md) and Supabase credential gate in CI (scripts/ci/check-supabase.mjs) to keep Memory persistent.
- **Designer completed full UX deliverables** — wireframes, tokens, accessibility criteria, copy deck, and visual hierarchy review.
- **Engineer refactored dashboard components** — extracted tile components, implemented design tokens (tokens.css), added dashboard session tracking.
- Updated sprint focus for all agents (docs/directions/*) to target Playwright fix, tile modals, insight packet, and launch comms before 2025-10-08 check-in.

## Blockers / Risks
- GA MCP host still pending; currently operating in mock mode.
- ~~No design assets yet; need UX partner or timebox for wireframes.~~ ✓ RESOLVED: Complete design package delivered.
- Figma library link pending (designer to create and share).

## Evidence Links

### Strategy & Planning
- Strategy plan: docs/strategy/initial_delivery_plan.md

### Technical Design
- Design docs: docs/design/shopify_services.md, docs/design/chatwoot_tile.md, docs/design/ga_ingest.md
- Prisma plan: docs/design/prisma_migration_plan.md

### UX/Design Deliverables (2025-10-05)
- **Wireframes:** docs/design/wireframes/dashboard_wireframes.md
- **Design tokens:** docs/design/tokens/design_tokens.md
- **Responsive breakpoints:** docs/design/tokens/responsive_breakpoints.md
- **Accessibility criteria (WCAG 2.2 AA):** docs/design/accessibility_criteria.md
- **Copy deck (EN/FR):** docs/design/copy_deck.md
- **Visual hierarchy review:** docs/design/visual_hierarchy_review.md
- **Figma library:** [PENDING - Designer to share link]

### Engineering & Testing
- CI workflow: .github/workflows/tests.yml
- Services & tests: app/services/shopify/orders.ts, app/services/chatwoot/escalations.ts, app/services/ga/ingest.ts, tests/unit, scripts/ci/check-supabase.mjs
- Dashboard components: app/components/tiles (refactored with design token integration)
- Design tokens CSS: app/styles/tokens.css
- Dashboard session tracking: app/services/dashboardSession.server.ts

### Team Directions
- Agent directions: docs/directions/README.md, docs/directions/manager.md, docs/directions/engineer.md, docs/directions/designer.md, docs/directions/qa.md, docs/directions/product.md, docs/directions/data.md, docs/directions/ai.md, docs/directions/reliability.md, docs/directions/marketing.md, docs/directions/support.md

## Governance Acknowledgment — 2025-10-06
- Reviewed docs/directions/README.md and docs/directions/manager.md; acknowledge manager-only authorship policy and Supabase secret handling.

## Designer Deliverable Audit (2025-10-05)

| Deliverable | Status | Evidence Link |
|-------------|--------|---------------|
| Polaris-aligned wireframes (dashboard + tile detail) | ✓ Complete | docs/design/wireframes/dashboard_wireframes.md |
| Approval & toast flow annotations | ✓ Complete | docs/design/wireframes/dashboard_wireframes.md (sections: Approval Flow, Toast Notifications) |
| Responsive breakpoints (1280px desktop, 768px tablet) | ✓ Complete | docs/design/tokens/responsive_breakpoints.md |
| Design tokens (Figma variables format) | ✓ Complete | docs/design/tokens/design_tokens.md |
| Accessibility criteria (WCAG 2.2 AA + focus order) | ✓ Complete | docs/design/accessibility_criteria.md |
| Copy deck (EN/FR localized strings) | ✓ Complete | docs/design/copy_deck.md |
| Visual hierarchy review (mock/live/error/empty states) | ✓ Complete | docs/design/visual_hierarchy_review.md |
| Figma library share link | ⏳ Pending | Designer to export and attach |

## Engineering Progress Update (2025-10-05)

### Components Refactored
- Dashboard route refactored with modular tile components (app/routes/app._index.tsx)
- Created tile component library: app/components/tiles
  - TileCard (wrapper component)
  - SalesPulseTile
  - FulfillmentHealthTile
  - InventoryHeatmapTile
  - CXEscalationsTile
  - SEOContentTile
- Implemented design tokens in tokens.css using designer specifications
- Updated dashboard to use CSS custom properties (--occ-* prefix)
- Added dashboard session tracking service (recordDashboardSessionOpen)

### Design Token Integration Status
- ✓ Spacing tokens applied (--occ-space-*)
- ✓ Border tokens applied (--occ-border-*, --occ-radius-*)
- ✓ Background tokens applied (--occ-bg-*)
- ✓ Text color tokens applied (--occ-text-*)
- Grid layout uses .occ-tile-grid CSS class
- Test IDs added for e2e testing (testId prop on TileCard)

### Ready for Next Phase
- Component structure ready for modal implementations
- Design token system in place for consistent styling
- Session tracking foundation for analytics

## Designer Sprint Update (2025-10-06)

### Completed Deliverables
1. **Design QA Report** (feedback/design_qa_report.md)
   - Validated engineer's tile implementation: PASS (100% token compliance)
   - Identified P0 accessibility issues (ARIA attributes, focus indicators needed)
   - Provided actionable recommendations

2. **High-Fidelity Modal Layouts** (docs/design/wireframes/modal_layouts.md)
   - CX Escalation, Inventory Alert, SEO Anomaly modals
   - All states: default, loading, success, error, empty
   - Complete CSS implementation + ARIA markup
   - Focus trap TypeScript code
   - Responsive behavior specifications

3. **Copy Deck - Modals (English-only)** (docs/design/copy_deck_modals.md)
   - 100+ modal/toast strings (EN)
   - Character count analysis + layout warnings
   - Responsive button text strategy

### Sprint Status: 75% Complete (3/4 goals)
- ✓ Paired with engineer on tile demo
- ✓ Delivered modal layouts
- ✓ Provided copy updates with layout flags
- ⏳ Figma library (blocked on workspace access)

### Key Findings
- **Token integration:** Excellent (no hardcoded values)
- **P0 accessibility gaps:** ARIA attributes, focus indicators, status icons
- **Button label overflow:** Identified several long-form phrases that need shortening for mobile
- **Modal implementation:** Estimated 3-5 day effort (recommend phased approach)

### Designer Recommendations
1. Prioritize P0 modals (CX Escalation + toasts) for M2
2. Budget for external a11y audit after M2 or provide NVDA training

## Next Actions
- Engineer: Implement P0 accessibility fixes (ARIA, focus indicators, status icons)
- Engineer: Begin CX Escalation modal + toast system (prioritize over all 3 modals)
- Designer: Support modal implementation (pairing session recommended)
- Designer: Create Figma library (when workspace access granted)
- QA: Define test cases based on accessibility criteria + modal states
- QA: Validate design token implementation against tokens.css
- Product: Review copy deck for tone and confirm English-only messaging

## Engineering Status — 2025-10-08

### Completed
- TileCard now exposes focusable `<article>` regions with `aria-labelledby`/`aria-describedby`, polite timestamp announcements, and status icons (app/components/tiles/TileCard.tsx#L62).
- Added dashboard-level manual refresh control calling `/app/actions/dashboard.refresh`, with aria-live status messaging and loader revalidation (app/routes/app._index.tsx#L44, app/routes/actions/dashboard.refresh.ts#L24).
- Persisted refresh triggers to Prisma facts and mirrored to Supabase with structured latency/error logs covering view/refresh/get operations (app/routes/actions/dashboard.refresh.ts#L24, app/services/analytics.server.ts#L22).
- Authored analytics parity script comparing Prisma vs Supabase counts and exposed npm script (`npm run ops:check-analytics-parity`) for Ops hand-off (scripts/ops/check-dashboard-analytics-parity.ts#L1, package.json#L18).
- Delivered Postgres staging/test database scaffolding: new Prisma schema + npm helpers (`prisma/schema.postgres.prisma`, `db:*:postgres` scripts), `.env.staging.example`, and runbook (`docs/runbooks/prisma_staging_postgres.md`) with environment matrix cross-link.

### Evidence
- Vitest: `npm run test:unit` → blocked by missing `app/config/featureFlags.ts` import in existing chatwoot specs (pre-existing repo gap).
- Targeted Vitest: `npx vitest run tests/unit/supabase.config.spec.ts` ✅
- Playwright: `npm run test:e2e` (7/7 green)
- Parity probe: `npm run ops:check-analytics-parity` → highlights Supabase unconfigured locally (requires credentials)
- Lighthouse: still gated by missing `LIGHTHOUSE_TARGET`; script exits early pending target definition

### Blockers / Requests
- Need `SUPABASE_URL` + `SUPABASE_SERVICE_KEY` for parity check to validate counts (<1% delta) before sign-off.
- Require confirmed Lighthouse target URL to regenerate accessibility/perf artifact for the evidence bundle.

## Marketing Update — 2025-10-07
- Finalized launch comms copy per product approvals (banner/email/blog, EN & FR) and documented decisions in `docs/marketing/product_approval_packet_2025-10-07.md`.
- Updated tooltip handoff + localization request; awaiting design annotations (due Oct 8 @ 12:00 ET) and FR review (due Oct 9 @ 18:00 ET).
- Published October campaign calendar with KPI targets; holding distribution scheduling until product locks launch date tomorrow.

## Marketing Update — 2025-10-07 (EOD)
- Launch comms now match product-approved copy (banner/email/blog/tooltip) with FR variants captured for localization confirmation.
- Tooltip placement pending designer annotations (due Oct 8 @ 12:00 ET); localization reviewing "Centre OCC" abbreviation by Oct 9.
- Campaign calendar drafted with KPI targets and will be locked once product confirms launch date tomorrow.

## Compliance Update — 2025-10-08 (Detailed)
- **Deliverables completed**
  - Data inventory & retention matrix (`docs/compliance/data_inventory.md`) documenting flows across Shopify, Chatwoot, Supabase, GA MCP, Anthropic, caches, and forthcoming Hootsuite tile with retention targets/classifications.
  - Incident response runbook for breach scenarios (`docs/runbooks/incident_response_breach.md`) covering detection → notification → recovery with GDPR/CCPA compliance and evidence handling.
  - Retention automation plan + tooling (`docs/compliance/retention_automation_plan.md`, new purge script `scripts/ops/purge-dashboard-data.ts`, npm task `npm run ops:purge-dashboard-data`). Baseline run output archived at `docs/compliance/evidence/retention_runs/2025-10-08_purge_log.json`; Supabase cron SQL draft ready (`docs/compliance/evidence/supabase/retention/cron_setup.sql`).
  - DPIA for Chatwoot transcripts & Anthropic prompts (`docs/compliance/dpia_chatwoot_anthropic.md`) with mitigation requirements (prompt sanitizer, opt-out toggle, vendor DPAs).
  - Privacy notice alignment: update deck (`docs/compliance/privacy_notice_updates.md`), launch FAQ disclosures (`docs/marketing/launch_faq.md`), rollout plan (`docs/marketing/privacy_toggle_rollout.md`), and publication-ready notice copy (`docs/compliance/evidence/privacy_notice/operator_notice_v2025-10-08.md`).
- **Vendor contracts & evidence tracking**
  - Request templates + status tracker published (`docs/compliance/evidence/vendor_dpa_requests.md`, `docs/compliance/evidence/vendor_dpa_status.md`).
  - Initial outreach logged for GA MCP, Supabase, Anthropic (2025-10-07) with follow-ups recorded 2025-10-08 (`docs/compliance/evidence/vendor_followups_2025-10-08.md`). Awaiting ticket numbers—need escalation if no replies by 2025-10-10.
- **Blockers needing manager support**
  1. Vendor DPAs absent → production launch blocked until documents archived in evidence folders.
  2. Analytics opt-out toggle + AI prompt sanitizer unbuilt; both are prerequisites from DPIA before enabling GA MCP or Anthropic in production.
  3. Supabase retention cron deployment pending reliability resourcing; without it we rely on manual purge script runs.
- **Action requests**
  - Push vendors/partners for DPA packages and residency assurances.
  - Prioritize engineering work on opt-out toggle (Settings → Privacy) and prompt sanitizer this sprint.
  - Coordinate reliability to implement Supabase pg_cron jobs using provided SQL and capture first-run evidence.
- **Upcoming deadlines**
  - 2025-10-12: Publish privacy notice + opt-out messaging, update support documentation.
  - 2025-10-14: Retention automations operational and vendor DPAs on file (see R1/R2 in `feedback/compliance.md`).
  - 2025-10-16: Re-run DPIA after mitigations for Anthropic go-live decision.
