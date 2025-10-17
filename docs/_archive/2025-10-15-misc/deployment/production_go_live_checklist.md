---
epoch: 2025.10.E1
doc: docs/deployment/production_go_live_checklist.md
owner: deployment
last_reviewed: 2025-10-07
doc_hash: TBD
expires: 2025-10-14
---

# Production Go-Live Checklist — HotDash Shopify App

Use this checklist before approving the first production deployment (and every controlled release thereafter). Attach completed checklist snapshots and evidence links in `feedback/deployment.md`.

## 1. Preconditions

- [ ] Product sign-off recorded in `feedback/product.md` including release scope and target date/time.
- [ ] Reliability confirms production secrets present in vault + GitHub environment (`SHOPIFY_*_PROD`, `SUPABASE_*_PROD`, `CHATWOOT_*_PROD`, `ANTHROPIC_API_KEY_PROD`, GA credentials).
- [ ] Support & marketing briefed on release window and rollback contacts.
- [ ] Operator dry run completed on staging within last 48h (attach run log).

## 2. Evidence Bundle (attach links)

- [ ] Latest CI run on `main` green (tests + lint + typecheck) with artifact links.
- [ ] Staging deploy workflow (`deploy-staging.yml`) successful within last 24h.
- [ ] Lighthouse report on staging meets budgets (Performance ≥ 90, TTI ≤ 5s) — provide artifact path.
- [ ] Synthetic smoke log (`staging-smoke-*.log`) under budget (<300ms mock / <800ms live).
- [ ] Manual QA checklist executed (tile modals, Chatwoot flows, anomaly responses) — reference `docs/runbooks/operator_dry_run_plan.md`.

## 3. Backup & Disaster Readiness

- [ ] Prisma production backup executed within last 24h (`docs/runbooks/backup_restore.md`).
- [ ] Supabase `decision_log` + `facts` export captured and stored (link evidence).
- [ ] Restore drill rehearsal date < 30 days (else run before go-live).
- [ ] Confirm secret rotation schedule up to date (`docs/runbooks/secret_rotation.md`).

## 4. Configuration & Change Management

- [ ] Production feature flag plan reviewed with product (document overrides).
- [ ] Verify environment variable matrix up to date (`docs/deployment/env_matrix.md`) with production column completed.
- [ ] Shopify production app URLs & redirect URIs validated against `PRODUCTION_APP_URL`.
- [ ] Monitoring endpoints (synthetic check target, GA MCP host) reachable from CI.
- [ ] GitHub `production` environment reviewers (manager + reliability) configured in repository settings.

## 5. Release Execution Steps

1. Tag release `vYYYY.MM.DDx` on `main` after evidence review.
2. Trigger production deployment workflow (`.github/workflows/deploy-production.yml`) with release tag, checklist link, reason, manager approver, and reliability approver.
3. Announce start of release in #occ-ops with ETA and link to workflow run.
4. Monitor deployment job (runs `scripts/deploy/production-deploy.sh` + synthetic smoke); if failure occurs, halt release and escalate to manager.

## 6. Verification After Deploy

- [ ] Production app loads without console errors (Chrome + Safari smoke).
- [ ] Operator login + tile rendering validated with live data.
- [ ] Chatwoot escalations ingesting (check `/app` metrics + Chatwoot dashboard).
- [ ] Supabase decision log receiving entries (check top 5 records).
- [ ] GA / analytics endpoints responding (HTTP 200 within budget).
- [ ] Synthetic check (production target `https://operators.hotdash.app/app?mock=0`, budget 800ms) run manually and recorded.

## 7. Rollback Triggers & Procedure

Trigger rollback if any of the following occur:

- Synthetic check exceeds live budget twice consecutively.
- Critical path tiles fail to render (Sales Pulse, CX Escalations) or throw 5xx errors.
- Shopify Admin reports elevated webhook failures (>5/min) post-release.
- Production incident severity ≥ SEV-2 declared by reliability or manager.

**Rollback Steps:**

1. Revert to previous tag (`git checkout <last-good-tag>`) and redeploy with production workflow.
2. If deploy workflow blocked, disable new feature flags (`FEATURE_*`) and restart app server.
3. Notify stakeholders in #occ-ops with rollback reason, timestamp, and next steps.
4. Capture incident timeline in `feedback/deployment.md` and open postmortem ticket with reliability.

## 8. Post-Release Actions

- [ ] Confirm monitoring dashboards stable after 60 minutes.
- [ ] Update `feedback/deployment.md` with release summary, evidence links, metrics, and approvals.
- [ ] Inform product/support/marketing of completion and open questions.
- [ ] Archive checklist snapshot with run log in `artifacts/deploy/production/<date>.md` (folder to create).

## 9. Production Smoke Target

- URL: `https://operators.hotdash.app/app?mock=0` (managed via GitHub secret `PRODUCTION_SMOKE_TEST_URL`)
- Budget: 800 ms (live) enforced by `scripts/ci/synthetic-check.mjs`
- Evidence: `artifacts/deploy/production-smoke-<timestamp>.log`
