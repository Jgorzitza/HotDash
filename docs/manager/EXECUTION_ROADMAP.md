# Execution Roadmap to Production (All Lanes)

Status: active — use as the comprehensive task list per lane. Autonomy Mode applies (15‑minute unblock rule). Flags OFF; HITL ON.

## Global Blockers — Clear First

1) Contract Path Stability (done)
- Legacy test shims added for approvals, ads, inventory. CI pre‑flight `npm run policy:contracts` prevents missing‑path churn.
- Action: Every lane runs `npm run policy:contracts` daily and after refactors.

2) Approvals SSR Provider (done pending merge)
- PR #82 adds Polaris provider at root. Verify post‑merge with scripts/qa/smoke.sh.

3) GA4/GSC Proof Scripts
- Stubs present: `integrations/ga4-cli.js`, `integrations/gsc-cli.js` for `--ping` and basic flags. Prefer real parity scripts in `scripts/ops/` when configured.

---

## Engineer — Roadmap

Phase 0: Stabilize + unblock (today)
- Verify #82 after merge: run `npm run build` and `scripts/qa/smoke.sh` (HTTP 200 on / and /approvals); attach logs.
- Run `npm run policy:contracts`; fix any direction references that fail.
- Ensure legacy shims stay green in CI (`approvals.drawer`, `ads/tracking`, `services/inventory/payout`).

Phase 1: Guided Selling/Kit Composer planning
- Draft rules graph and route skeleton under `docs/specs/hitl/guided-selling*`; produce UX skeleton link with Designer; no merges.

Phase 2: Robustness + a11y
- Add SSR/provider coverage tests for Polaris routes, error boundaries for drawer, keyboard traps.
- Expand Playwright smoke to include Approvals list interactions and pagination.

Phase 3: Flags + performance
- Surface autopublish toggles in settings (default OFF) — design only.
- Add SSR/API timers and histograms; code‑split large routes to keep chunks <200kB gz.

Phase 4: CI + docs
- Lint tighten + autofix; test utils for fixtures/mocks; route contract docs.

Phase 5: Staging drill
- Build, deploy staging, smoke; attach evidence; rollback steps documented.

Deliverables: PRs with Issue linkage, Allowed paths, tests, rollback notes, evidence.

## QA — Roadmap

Phase 0: Verify unblock
- After #82, run `scripts/qa/smoke.sh` → expect 200 on `/` and `/approvals`; attach logs.

Phase 1: a11y subset
- Run `npm run test:a11y` across critical routes; file violations with owners/ETAs.

Phase 2: API pings
- Add assertions for analytics/social/inventory endpoints; capture logs.

Phase 3: Visual and error states
- Visual regression checklist (screens); error boundary coverage and keyboard navigation.

Phase 4: Performance smoke
- Capture server P95s for key routes; define pass thresholds.

Deliverables: reports in artifacts/qa/<date>, feedback with blockers and owners.

## SEO — Roadmap

Phase 0: PSF planning
- Programmatic SEO Factory spec (metaobjects, templates, internal links), flags OFF, rollback notes.

Phase 1: Telemetry
- CWV→$ mapping + validation plan; backtest sample; evidence bundles.

Phase 2: Media pipeline Tier‑0
- Compression + alt‑text policy; safe autopublish doc (still OFF).

Phase 3: A/B harness inputs
- Provide copy/layout candidates and guardrails; coordinate with Product.

Phase 4: Site search
- Synonyms/facets plan aligned to builder mental models.

## Analytics — Roadmap

Phase 0: Parity + telemetry mapping
- Run `npm run ops:check-analytics-parity`; log variance. Update seo‑telemetry spec with CWV→$ model.

Phase 1: Data
- ETL reliability plan (retries/idempotency/alerts), backfill notes for empty tables.

Phase 2: Tiles & SLA
- Tile verification and latency checks; define error banner rules.

Phase 3: Costs + sampling
- BigQuery cost guardrails; sampling thresholds; evidence bundling (queries, charts).

## Product — Roadmap

Phase 0: A/B harness
- Config + verification steps (cookie strategy, GA4 dim, promote/rollback).

Phase 1: Launch checklists
- Maintain dashboard launch checklist with owners/dates; CEO brief outline.

Phase 2: Guided Selling UX
- User flows and acceptance with Designer.

Phase 3: Risk & comms
- Rollback comms playbook; risk matrix and mitigations.

## Integrations — Roadmap

Phase 0: Proof scripts
- Use GA4/GSC stubs for `--ping` while real adapters are proven.

Phase 1: MCP routes
- Storefront MCP sandbox routes; harness + sample payloads.

Phase 2: Parity
- Admin adapter parity checks; Publer health proofs (no secrets in code).

Phase 3: Webhooks + retries
- Webhooks inventory & contracts; retry/backoff and idempotency docs.

## DevOps — Roadmap

Phase 0: CI pre‑flight
- Ensure `policy:contracts` runs in CI; fix flakes; secrets scan green.

Phase 1: Deploy rehearsal
- Staging deploy script & rollback validation; workflow concurrency & cache tuning.

Phase 2: Monitoring
- Prometheus alerts sanity; slow query analysis; push protection audits.

## Ads — Roadmap

- Slice‑B foundations → Slice‑C scaffolding → approvals payloads → Action Dock drilldowns.
- Outlier thresholds; aggregator guardrails; test data fixtures; evidence bundling.

## Content — Roadmap

- Tier‑0 upgrades; SEO briefs pipeline; support KB prep; approvals microcopy; A/B comms drafts.
- Alt‑text heuristics; micro‑edits policy; pipeline triage templates; H1/H2 style guide.

## Inventory — Roadmap

- PO receiving apply plan + AVLC; bundles BOM decrements; overnight settlement; reason codes alignment; telemetry hooks.
- Returns reconciliation; location transfers ledger; safety stock & ROP; supplier variance; evidence bundling.

## Designer — Roadmap

- Action Dock spec; microcopy; a11y checklists; skeleton states; error/empty UX; visual regression scenarios; design tokens audit.

## Support — Roadmap

- Chatwoot webhook retry contracts; health artifacts; CX approvals integration; escalation playbooks; dev fixtures; SLA dashboard tuning; taxonomy/tagging.

## AI‑Knowledge — Roadmap

- Replace mock sources; re‑run eval; indexing resilience; SEO/Guided Selling search patterns; MCP transcript prep; eval rubric; synonyms/aliases.

## AI‑Customer — Roadmap

- Reply templates + tone with reason codes; evidence transcript improvements; grading rubric tuning; escalation microcopy; HITL disclaimers; grade calibration.

## Pilot — Roadmap

- Scaffold isolated package under packages/pilot/** with pure, typed API; add CI stub; docs/pilot README; extend API with one helper; rollback note.

## Manager — Roadmap

- Drive merges: #82, #86, #76, #83–#85; keep branch drift minimal.
- Enforce Autonomy Mode + policy checks; daily drift sweeps; issue hygiene (DoD + Allowed paths present).

