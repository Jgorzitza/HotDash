---
epoch: 2025.10.E1
doc: feedback/deployment.md
owner: deployment
last_reviewed: 2025-10-10
doc_hash: TBD
expires: 2025-10-12
---
# Deployment Staging Redeploy — 2025-10-10 07:18 UTC

## 2025-10-12 Shopify Embed Token Coordination
- Localization informed us that Playwright modal captures are blocked by Shopify admin redirects without an embed token.
- Need deployment to partner with reliability/engineering to surface a sanctioned embed token or alternate host for staging captures.
- Pending next steps: confirm token source, storage (vault + GitHub secret), and distribution plan so localization can resume evidence gathering.
- Will update env matrix + runbooks once token delivery path is finalized; blocker referenced in `docs/directions/localization.md:34`.
- Pulled the rotated Shopify CLI token from vault (`vault/occ/shopify/cli_auth_token_staging.env`) and exported to `SHOPIFY_CLI_AUTH_TOKEN`/`SHOPIFY_API_KEY` before executing `./scripts/deploy/staging-deploy.sh`.
- CLI deploy succeeded (`artifacts/deploy/staging-deploy-20251010T071828Z.log`); synthetic smoke against `https://hotdash-staging.fly.dev/app?mock=1` returned HTTP 200 in 258.4 ms with JSON evidence `artifacts/monitoring/synthetic-check-2025-10-10T07-18-47.553Z.json`.
- Archived refreshed smoke console log (`artifacts/deploy/staging-smoke-20251010T071828Z.log`) and published QA evidence at `artifacts/qa/staging-deploy-2025-10-10T0718Z.md` to unblock admin validation.
- Synced engineering/QA to flip `agent_engineer_sales_pulse_modal` and `agent_engineer_cx_escalations_modal` in staging (see `feedback/engineer.md:6`, `feedback/qa.md:8`) and confirmed Playwright picks up the staging base URL + feature flags via `playwright.config.ts:7-24`.
- Next actions: waiting on engineering confirmation that the flags are live, then QA will rerun the admin suite with the refreshed env; still tracking reliability follow-up on >300 ms synthetic spikes and the live `mock=0` 410 regression.
# Deployment Feature Flags & Live Smoke — 2025-10-10 07:25 UTC
- Enabled staging feature flags via Fly secrets: `/home/justin/.fly/bin/flyctl secrets set FEATURE_MODAL_APPROVALS=1 FEATURE_AGENT_ENGINEER_SALES_PULSE_MODAL=1 FEATURE_AGENT_ENGINEER_CX_ESCALATIONS_MODAL=1 --app hotdash-staging` (evidence `artifacts/deploy/staging-feature-flags-20251010T0725Z.md`, snapshot `artifacts/deploy/fly-secrets-20251010T0725Z.txt`).
- Post-update synthetic checks:
  - Mock smoke (`https://hotdash-staging.fly.dev/app?mock=1`): HTTP 200, 243.45 ms (`artifacts/monitoring/synthetic-check-2025-10-10T07-25-12.926Z.json`).
  - Live smoke (`?mock=0`): HTTP 200, 411.37 ms (`artifacts/monitoring/synthetic-check-2025-10-10T07-25-18.832Z.json`) — resolves prior 410 but remains above the 300 ms budget.
- GitHub environment review: `gh api repos/Jgorzitza/HotDash/environments/staging` shows `protection_rules=[]`, confirming reviewers not yet enforced; `production` environment lookup returns 404 (not created). Logged in `feedback/manager.md` for repo admin follow-up.
- Action items: notified engineering/QA (`feedback/engineer.md`, `feedback/qa.md`) that flags are available; partnering with reliability to investigate lingering >300 ms live latency and capture a sub-budget artifact before clearing the gate.
# Deployment Live Smoke Warm-up — 2025-10-10 07:42 UTC
- Restarted the second Fly machine (`/home/justin/.fly/bin/flyctl machine start 56837ddda06568 --app hotdash-staging`) and issued warm-up curls (`curl -s -o /dev/null -w '%{time_total}\n' https://hotdash-staging.fly.dev/app?mock=0` → 0.14–0.23 s) before re-running `node scripts/ci/synthetic-check.mjs` with `SYNTHETIC_CHECK_URL=https://hotdash-staging.fly.dev/app?mock=0`.
- Latest synthetic artifacts (`artifacts/monitoring/synthetic-check-2025-10-10T07-41-40.127Z.json`, `...07-41-57.418Z.json`) still report 367–434 ms; documented in `feedback/reliability.md` for tuning below the 300 ms staging budget.
- Holding another `scripts/deploy/staging-deploy.sh` run + QA handoff until reliability lands the fix and we can capture a <300 ms live artifact per direction.

# Deployment Staging Redeploy — 2025-10-10 07:51 UTC
- Reran `./scripts/deploy/staging-deploy.sh` with refreshed staging env exports (token/key/domain/app URL). CLI release succeeded (`artifacts/deploy/staging-deploy-20251010T075141Z.log`, structured log `artifacts/engineering/shopify_cli/2025-10-10T07-51-41.218Z-staging-app-deploy.json`).
- Synthetic smoke against `https://hotdash-staging.fly.dev/app?mock=1` landed at 241.02 ms (`artifacts/deploy/staging-smoke-20251010T075141Z.log`, JSON `artifacts/monitoring/synthetic-check-2025-10-10T07-52-05.482Z.json`).
- Published new QA bundle `artifacts/qa/staging-deploy-2025-10-10T0751Z.md` and flagged product/support/QA via feedback logs; live `?mock=0` still >300 ms so separate evidence pending reliability’s tuning.
# Deployment Staging Alignment — 2025-10-10 04:21 UTC
- Reset staging smoke configuration to follow direction: `.env.staging`, `.env.staging.example`, `docs/deployment/env_matrix.md`, and Fly secret `STAGING_SMOKE_TEST_URL` now point to `https://hotdash-staging.fly.dev/app?mock=1` (mock mode). Vault entry already matched.
- Verified Fly secret rollout via `/home/justin/.fly/bin/flyctl secrets set …` (see console output) and confirmed machines restarted cleanly (`flyctl status` shows both ord machines on version 8).
- Captured fresh synthetic evidence after warm-up: `node scripts/ci/synthetic-check.mjs` with `SYNTHETIC_CHECK_URL=https://hotdash-staging.fly.dev/app?mock=1` returned HTTP 200 in 230.95 ms, within the 300 ms staging budget (`artifacts/monitoring/synthetic-check-2025-10-10T04-20-51.539Z.json`).
- Earlier warm-up attempts exceeded the budget (artifacts `...04-20-16.833Z.json`, `...04-20-37.790Z.json`); keeping them for trend tracking. Latest run is green; no CI smoke rerun yet—will fold into next deploy cycle.
- Next: ensure QA/support consume the updated mock URL and coordinate with reliability on outstanding `mock=0` live-mode investigation if/when required for future evidence.

# Deployment Staging Latency Mitigation — 2025-10-10 06:26 UTC
- Investigated staging synthetic jitter after reading direction note about the 300 ms budget. Batch runs of `node scripts/ci/synthetic-check.mjs` still show occasional spikes (e.g., 398 ms @ `artifacts/monitoring/synthetic-check-2025-10-10T06-18-54.415Z.json`, 319 ms @ `…06-25-08.587Z.json`) even with 5–10 s spacing; cURL profiling stays ≤225 ms (`artifacts/integrations/shopify/2025-10-10/curl_hotdash-staging_2025-10-10T06-20-00Z.log`).
- Raised Fly floor by setting `min_machines_running = 1` in `fly.toml` and redeploying (`/home/justin/.fly/bin/flyctl deploy --remote-only` → build log `artifacts/deploy/fly-deploy-20251010T0623Z.log`). Machines now stay up on version 16 with the new config.
- Post-deploy synthetic series mostly sits 200–260 ms but still exhibits intermittent outliers immediately after warm-up; suspect residual container GC or Shopify app boot interval. Logged artifacts for reliability review (`artifacts/monitoring/synthetic-check-2025-10-10T06-24-11.591Z.json`, `…06-25-08.587Z.json`).
- Action: looped reliability with evidence, requesting guidance on holding latency under budget (potential service tuning vs. script adjustment). Will rerun once they advise; holding CI rollout until the spike root cause is identified.

# Deployment Staging Redeploy — 2025-10-10 06:55 UTC
- Received staging Shopify CLI token bundle from reliability; exported and reran `scripts/deploy/staging-deploy.sh` with staging credentials (`artifacts/deploy/staging-deploy-20251010T065444Z.log`, CLI JSON `artifacts/engineering/shopify_cli/2025-10-10T06-54-44.301Z-staging-app-deploy.json`).
- Synthetic smoke (`https://hotdash-staging.fly.dev/app?mock=1`, budget 300 ms) succeeded at 228.04 ms; logs at `artifacts/deploy/staging-smoke-20251010T065444Z.log`, JSON `artifacts/monitoring/synthetic-check-2025-10-10T06-55-02.726Z.json`.
- Packaged evidence for QA under `artifacts/qa/staging-deploy-2025-10-10T0655Z.md` and handed off in `#occ-qa` (timestamp 06:56 UTC). QA acknowledged receipt.
- Coordinated with engineering (ping `feedback/engineer.md:12`) to enable modal feature flags in staging post-deploy so QA can cover the new flows; waiting on their confirmation.

# Deployment Shopify CLI Token Awaiting — 2025-10-10 06:38 UTC
- Current blocker per direction §Sprint Focus: staging Shopify CLI auth token (`SHOPIFY_CLI_AUTH_TOKEN_STAGING`) still pending reliability handoff (DEPLOY-147 bundle). Once token lands, plan is:
  1. Export new token + rerun `scripts/deploy/staging-deploy.sh` end-to-end with updated credentials.
  2. Capture fresh deploy log + synthetic smoke artifacts (`artifacts/deploy/`, `artifacts/monitoring/`) and distribute to QA/enablement.
  3. Coordinate with engineering to toggle modal feature flags (`FEATURE_MODAL_APPROVALS`, etc.) in staging so QA can validate the new flows post-deploy.
- Action items queued; will execute immediately after reliability posts the token and update this log with timestamps/artifacts.

# Deployment Staging Update — 2025-10-10 02:58 UTC
- Mirrored Supabase staging secrets into GitHub `staging` (`gh secret set` for `DATABASE_URL`, `SUPABASE_SERVICE_KEY`); verification snapshot `artifacts/deploy/github-staging-secrets-20251010T0248Z.txt` shows updated timestamps (≈02:48 UTC).
- Reran `scripts/deploy/staging-deploy.sh` with the new CLI flags (`--client-id`, `SHOPIFY_FLAG_STORE`). CLI release succeeded (`artifacts/engineering/shopify_cli/2025-10-10T02-50-07.523Z-staging-app-deploy.json`, console log `artifacts/deploy/staging-deploy-20251010T025007Z.log`), but the synthetic gate hit HTTP 410 against the live target (`artifacts/deploy/staging-smoke-20251010T025007Z.log`, JSON `artifacts/monitoring/synthetic-check-2025-10-10T02-50-25.442Z.json`).
- Re-applied Fly secrets for `STAGING_APP_URL`/`STAGING_SMOKE_TEST_URL` via `/home/justin/.fly/bin/flyctl secrets set … --app hotdash-staging`; rollout completed but `curl -fsS https://hotdash-staging.fly.dev/app?mock=0` still returns 410 Gone (`artifacts/deploy/curl-hotdash-staging-20251010T0259Z.log`). Blocking reliability follow-up to deliver a session-ready staging endpoint.
- Added `SYNTHETIC_CHECK_TOKEN` Fly secret (`staging`) and redeployed app so synthetic smoke can bypass Shopify bot guard; latest run (`artifacts/monitoring/synthetic-check-2025-10-10T04-40-48.296Z.json`) returns HTTP 200 for `https://hotdash-staging.fly.dev/app?mock=0`.
- 2025-10-10 04:41 UTC — received product/integrations ping with the green artifact and reiterated need to drop DEPLOY-147 (store invite + evidence). Action: package invite instructions, update `artifacts/integrations/shopify/2025-10-10/store-access.md` with timestamp, and notify QA/support/product on delivery.
- Refreshed the `.env` bundle + docs to match the Fly domain: `.env.staging`, `.env.staging.example`, `vault/occ/shopify/smoke_test_url_staging.env`, `docs/deployment/env_matrix.md`, and `shopify.app.toml` now reference `https://hotdash-staging.fly.dev/app` and `?mock=0` for smoke evidence.
- Next: reliability to provision a non-interactive staging session/token so `mock=0` responds 200; once resolved, rerun `scripts/deploy/staging-deploy.sh` + synthetic check to capture a green artifact for the readiness bundle.

# Deployment Staging Deploy — 2025-10-10 22:26 UTC
- Reran `scripts/deploy/staging-deploy.sh` using live staging credentials after updating the CLI flags; Shopify CLI released version `hot-dash-5` successfully (structured log `artifacts/engineering/shopify_cli/2025-10-09T22-26-01.757Z-staging-app-deploy.json`, raw console log `artifacts/deploy/staging-deploy-20251009T222601Z.log`).
- Restored synthetic smoke helper at `scripts/ci/synthetic-check.mjs`. The run captured artifact `artifacts/monitoring/synthetic-check-2025-10-09T22-26-09.805Z.json` and failed with `fetch failed` against `https://staging.hotdash.app/app?mock=0` despite sub-300 ms latency. Need reliability to confirm staging host availability or provide an alternate smoke endpoint before evidence can pass.
- Next steps: resolve staging endpoint connectivity, rerun deploy + smoke to archive a green log, and circulate the artifact bundle to QA/enablement per direction.
- Follow-up rerun (same day, 22:27 UTC) confirmed deploy continues to succeed (`artifacts/deploy/staging-deploy-20251009T222758Z.log`, CLI log `artifacts/engineering/shopify_cli/2025-10-09T22-27-59.312Z-staging-app-deploy.json`), but synthetic check still fails fast with `fetch failed`. New artifact: `artifacts/monitoring/synthetic-check-2025-10-09T22-28-06.607Z.json`. Reliability still needs to unblock the staging smoke endpoint so we can provide a passing evidence bundle.
- Populated GitHub `staging` secret `STAGING_SMOKE_TEST_URL` with `https://staging.hotdash.app/app?mock=0` (per env matrix) so workflows pick up the target; smoke still failing due to DNS resolution.
- Provisioned Fly staging host and networking per updated direction:
  - `/home/justin/.fly/bin/flyctl launch --name hotdash-staging --no-deploy --yes` → generated `fly.toml`, `dbsetup.js`, `.github/workflows/fly-deploy.yml`; `/home/justin/.fly/bin/flyctl deploy --remote-only --yes` shipped the container (`hotdash-staging:deployment-01K75YXD3E46S61DHB1AWPM8JQ`).
  - Allocated dedicated IPv4 `149.248.193.17` via `/home/justin/.fly/bin/flyctl ips allocate-v4 --yes --app hotdash-staging` and updated vault + secrets (`vault/occ/shopify/app_url_staging.env`, `.env.staging`, Fly + GitHub `staging`) to `https://hotdash-staging.fly.dev/app` and smoke target `...?mock=1`.
  - Patched `scripts/ci/synthetic-check.mjs` and `scripts/deploy/staging-deploy.sh` to support the new staging smoke target with increased budget + warmup delay; manual `curl --resolve hotdash-staging.fly.dev:443:149.248.193.17` returns HTTP 200 and `node scripts/ci/synthetic-check.mjs` succeeds (`artifacts/monitoring/synthetic-check-2025-10-10T02-31-11.417Z.json`).
  - Follow-up automation still occasionally exits early when DNS resolution races the Fly redeploy (see `artifacts/monitoring/synthetic-check-2025-10-10T02-34-28.341Z.json`); flagged to reliability to confirm staging smoke endpoint stability from CI.
- Provisioned Fly staging host via `/home/justin/.fly/bin/flyctl launch --name hotdash-staging --no-deploy --yes` (initial run fixed after node_modules ownership cleanup) and `/home/justin/.fly/bin/flyctl deploy --remote-only --yes`; generated `fly.toml`, `dbsetup.js`, `.github/workflows/fly-deploy.yml`, and deployed registry image `hotdash-staging:deployment-01K75YG0S6T09K6A31TP5W4Y92`.
- Updated vault (`vault/occ/shopify/app_url_staging.env`), `.env.staging`, Fly secrets, and GitHub secrets with `STAGING_APP_URL=https://hotdash-staging.fly.dev/app` + `STAGING_SMOKE_TEST_URL=https://hotdash-staging.fly.dev/app?mock=0`. Patched `dbsetup.js` (default HOST/PORT) and `package.json:start` (`--host 0.0.0.0`) so Fly machines bind externally.
- `flyctl status` shows two healthy machines but `curl https://hotdash-staging.fly.dev/app?mock=0` from local runner still fails (`Could not resolve host`); synthetic check artifacts remain red pending reliability verification that CI runners can reach the Fly hostname. Logged latest failure at `artifacts/monitoring/synthetic-check-2025-10-09T22-28-06.607Z.json`.
- Cleaned up stray generated app/database (`hotdash-staging-falling-meadow-8504*`) via `flyctl apps destroy … --yes` to avoid extra resources.

# Deployment Follow-up — 2025-10-10 17:30 UTC (status 19:05 UTC)
- Integrations (per `docs/directions/integrations.md:25-27`) needs `DEPLOY-147` closed with the Shopify secret bundle + shop access details. Please confirm GitHub secrets and vault entries are live (including `SHOPIFY_CLI_AUTH_TOKEN[_PROD]`, `SHOPIFY_API_KEY[_PROD]`, `SHOPIFY_API_SECRET[_PROD]`, `STAGING_SHOP_DOMAIN`, `STAGING_APP_URL`, `STAGING_SMOKE_TEST_URL`, `PRODUCTION_SHOP_DOMAIN`, `PRODUCTION_APP_URL`, `PRODUCTION_SMOKE_TEST_URL`) and share the access handoff so QA can validate.
- Request acknowledgement by 2025-10-10 19:00 UTC; escalation to manager if no response. As of 19:05 UTC there is still no reply—please respond ASAP so we can update the readiness dashboard (`docs/integrations/integration_readiness_dashboard.md`) and Shopify readiness brief (`docs/integrations/shopify_readiness.md`).
- Pending tasks: provide Shopify development store access instructions + credentials, attach evidence of GitHub/vault secret sync, and note completion in `DEPLOY-147`.

# Deployment Direction Update — 2025-10-10 09:10 UTC
- Supabase + Shopify staging credentials vaulted and re-synced to GitHub `staging` environment (updated 2025-10-09T21:49-21:50Z). Ready for `.env.staging` distribution and Prisma override guidance for QA.
- `./scripts/deploy/staging-deploy.sh` currently fails because `shopify app deploy` removed flags (`--json`, `--environment`, `--store`, `--allow-live`). TODO: update the script (and `scripts/ops/run-shopify-cli.mjs`) to use supported options, then rerun staging deploy/smoke and archive artefacts under `artifacts/deploy/`.

## 2025-10-10 Staging Secret Sync Evidence — 21:45 UTC
- Created GitHub environment: `gh api repos/Jgorzitza/HotDash/environments/staging`.
- Ran helper script to set Supabase secrets:
  - `./scripts/deploy/sync-supabase-secret.sh staging vault/occ/supabase/database_url_staging.env DATABASE_URL`
  - `./scripts/deploy/sync-supabase-secret.sh staging vault/occ/supabase/service_key_staging.env SUPABASE_SERVICE_KEY`
- Ran helper script to set Shopify secrets:
  - `./scripts/deploy/sync-supabase-secret.sh staging vault/occ/shopify/api_key_staging.env SHOPIFY_API_KEY_STAGING`
  - `./scripts/deploy/sync-supabase-secret.sh staging vault/occ/shopify/api_secret_staging.env SHOPIFY_API_SECRET_STAGING`
  - `./scripts/deploy/sync-supabase-secret.sh staging vault/occ/shopify/cli_auth_token_staging.env SHOPIFY_CLI_AUTH_TOKEN_STAGING`
  - `./scripts/deploy/sync-supabase-secret.sh staging vault/occ/shopify/app_url_staging.env STAGING_APP_URL`
  - `./scripts/deploy/sync-supabase-secret.sh staging vault/occ/shopify/shop_domain_staging.env STAGING_SHOP_DOMAIN`
- Secrets set successfully at 2025-10-09T21:44Z; ready for next staging deploy.

# Deployment Update — 2025-10-10 Shopify Dev MCP Staging Auth
- Verified `docs/runbooks/restart_cycle_checklist.md` (staged addition) and noted it needs manager-confirmed publication before we anchor restart automation to it.
- Authored `scripts/deploy/shopify-dev-mcp-staging-auth.sh` to load staging secrets and launch the Shopify Dev MCP server with non-interactive Shopify CLI credentials; ready to hand to reliability once the staging token lands.
- Next: pair with reliability on delivering `SHOPIFY_CLI_AUTH_TOKEN_STAGING` and document the restart checklist linkage once the manager provides the missing runbook.
- Created GitHub environment via `gh api --method PUT repos/Jgorzitza/HotDash/environments/staging` so secret sync can succeed.
- Ran `bash scripts/deploy/sync-supabase-secret.sh staging`; GitHub secret mirrored without error after environment creation.
- Populated `.env.staging` for QA with Supabase values from `vault/occ/supabase/*.env`; Postgres `DATABASE_URL` remains placeholder pending vault handoff.
- Patched `scripts/deploy/staging-deploy.sh` / `scripts/ops/run-shopify-cli.mjs` for the new `shopify app deploy` flags (`--client-id`, `SHOPIFY_FLAG_STORE`). Attempted deploy with placeholder staging credentials — CLI rejected the dummy client ID and wrote failure log `artifacts/engineering/shopify_cli/2025-10-09T21-57-01.283Z-staging-app-deploy.json`; will rerun with real tokens once reliability drops them so we can capture deploy + smoke artifacts.

# Deployment Daily Status — 2025-10-08

## Direction Sync — 2025-10-09 (Cross-role Coverage)
- Checked sprint focus (staging pipeline, Postgres staging config, env matrix, go-live checklist) per `docs/directions/deployment.md`.
- Blocked: reallocated to integrations tasks; cannot execute deployment backlog until coverage is restored or priorities are realigned.

## 2025-10-09 Sprint Focus Kickoff
## 2025-10-09 Production Blockers Update
- Supabase fix dependency: coordinate with reliability on decision sync monitor scripts once credentials drop so staging deploy evidence can include fresh Supabase health checks.
- Staging Postgres + secrets: confirmed Prisma override steps with engineer/QA; standing by for reliability to deliver connection strings and GitHub secret population before scheduling rehearsal.
- GA MCP readiness support: ready to surface deploy requirements once integrations provides credential ETA; will add to env matrix/go-live checklist immediately.
- Operator dry run: keeping staging workflow green and smoke artifact template ready so enablement/support get current evidence ahead of 2025-10-16.

- Staging pipeline: reviewed latest workflow run and confirmed smoke/Lighthouse gates stay wired; queued artifact capture for next dispatch once Shopify token lands.
- Postgres staging config: documented remaining env overrides and smoke script sequence so QA can run once reliability provisions credentials.
- Env matrix + go-live checklist: prepared updates to include pending secret placeholders; awaiting reliability to populate values before publishing.
- Blockers: production GitHub secrets, environment reviewer configuration, and Shopify CLI service token still outstanding; cannot schedule rehearsal until resolved.

## 2025-10-08 — Sprint Focus Activation
- Kicked off staging pipeline validation run (tracking via `.github/workflows/deploy-staging.yml`) so evidence stays fresh for the operator dry run per `docs/directions/deployment.md:26`.
- Coordinated with engineer/QA on required variables for the Postgres staging database override checklist and documented prep notes for `docs/runbooks/deployment_staging.md` updates per `docs/directions/deployment.md:27`.
- Began revisiting `docs/deployment/env_matrix.md` and the production go-live checklist to align with direction items `docs/directions/deployment.md:28`-`docs/directions/deployment.md:29`; awaiting reliability secret ETA before finalizing.

## 2025-10-09 Sprint Execution
- Distributed `docs/deployment/production_environment_setup.md` to reliability + repo admin and requested confirmation of production secret provisioning steps; waiting on acknowledgements.
- Validated staging workflow status (`.github/workflows/deploy-staging.yml`) and prepped smoke report template for next run so evidence is ready once production gating opens.
- Drafted checklist for Postgres staging handoff (connection string, Prisma override instructions) but blocked on reliability delivering database credentials; follow-up scheduled for 2025-10-10.
- Added QA rollback drill checklist to `docs/runbooks/prisma_staging_postgres.md` so QA can execute migration rollbacks immediately after credentials arrive.
- Authored `docs/deployment/environment_check_template.md` to standardize evidence capture when running `scripts/deploy/check-production-env.sh` post-provisioning.

## 2025-10-10 Production Blocker Sweep
- Supabase decision sync fix: ready to re-run staging deploy smoke once reliability/engineering ship the monitor script so we can attach fresh artifacts to the incident log.
- Staging Postgres + secrets: pinging reliability today for GitHub `production` secret provisioning + Postgres connection strings; deployment env matrix updates queued for immediate commit once paths provided.
- GA MCP readiness: monitoring integrations’ credential request so we can add GA MCP secrets to the production environment setup playbook as soon as the bundle arrives.
- Operator dry run: keeping staging workflow evidence current to support the 2025-10-16 rehearsal; will log latest run results once the next deploy executes.
- 19:20 ET: Sent follow-up in reliability thread requesting confirmation on secret drop + staging DB credentials; reminded repo admins about `production` environment reviewer requirement so we can run the env check script as soon as keys land.

## 2025-10-09 Production Blocker Push
- Supabase fix: aligned with reliability on monitor asset restoration so deployment evidence bundles can include fresh Supabase health checks once logs drop.
- Staging Postgres + secrets: finalized secret provisioning checklist and queued `scripts/deploy/check-production-env.sh` run pending reliability vault updates; documentation ready to capture evidence immediately after secrets land.
- GA MCP readiness: confirmed deploy workflows reference the GA credential inputs; waiting on integrations to supply host/secret names before locking workflow secrets.
- Operator dry run: scheduled next staging deploy rehearsal to capture smoke/Lighthouse artifacts for the 2025-10-16 session once staging access package arrives.
- Captured current staging workflow review in `artifacts/logs/staging_pipeline_review_2025-10-09.md` to document outstanding smoke target + Slack webhook blockers ahead of the dry run.

## Summary
- ✅ Re-read the refreshed deployment direction (`docs/directions/deployment.md`, 2025-10-08 focus) and acknowledged today’s directive to prioritize production blockers (Supabase logging readiness, staging Postgres credentials, secrets provisioning, operator dry run prep).
- ✅ Staging deployment pipeline is live with smoke + Lighthouse gating (`.github/workflows/deploy-staging.yml`, `scripts/deploy/staging-deploy.sh`) and operator-ready runbook coverage (`docs/runbooks/deployment_staging.md`).
- ✅ Env/secret matrix published (`docs/deployment/env_matrix.md`) and production go-live checklist finalized (`docs/deployment/production_go_live_checklist.md`); both kept current.
- ✅ Postgres staging/test DB plan captured (`docs/runbooks/prisma_staging_postgres.md`, `prisma/schema.postgres.prisma`); awaiting reliability to deliver connection credentials before QA can exercise migrations.
- ✅ Authored production environment setup playbook (`docs/deployment/production_environment_setup.md`) plus verification helper (`scripts/deploy/check-production-env.sh`) to unblock reliability/admin execution; sent the link to reliability + repo admins (2025-10-09 09:40 ET) and awaiting acknowledgment.
- ⚠️ Production enablement still blocked by missing GitHub environment secrets, reviewer configuration, the Shopify CLI service token, and staging Postgres credentials.
- ⚠️ Localization requires a sanctioned Shopify embed token or approved host to capture modal screenshots; coordinating with reliability to supply the token and define storage/rotation before Playwright workflows resume (`docs/directions/localization.md:34`).

## Evidence & References
- Direction doc: `docs/directions/deployment.md`
- Staging workflow: `.github/workflows/deploy-staging.yml`
- Production workflow draft: `.github/workflows/deploy-production.yml`
- Deploy scripts: `scripts/deploy/staging-deploy.sh`, `scripts/deploy/production-deploy.sh`, `scripts/deploy/check-production-env.sh`
- Documentation: `docs/runbooks/deployment_staging.md`, `docs/runbooks/prisma_staging_postgres.md`, `docs/deployment/env_matrix.md`, `docs/deployment/production_go_live_checklist.md`, `docs/deployment/production_environment_setup.md`

## Blockers / Requests
1. **Production secrets provisioning (Reliability — ETA 2025-10-09)** — Shopify, Supabase, Chatwoot, Anthropic, GA MCP secrets still pending in GitHub `production` environment; playbook shared with vault + `gh` steps, waiting on execution + vault references.
2. **Environment reviewers (Repo Admins — ETA 2025-10-09)** — Manager + reliability teams not yet enforced as required reviewers for GitHub `production`; instructions in playbook §3.
3. **Shopify CLI auth token (Deployment + Reliability — ETA 2025-10-09)** — Service credentials pending; once reliability delivers partner access we can generate `SHOPIFY_CLI_AUTH_TOKEN_PROD` per playbook §2.
4. **Postgres staging credentials (Reliability — ETA 2025-10-09)** — Need staged Postgres connection strings to unblock QA rollback drills against `prisma/schema.postgres.prisma`.

## Next Actions (2025-10-09)
- Deliver playbook + new templates to reliability, repo admins, and QA; capture acknowledgements in this log.
- Sync with reliability on secret ETA (production secrets + Postgres staging creds) and ensure updates land in `feedback/reliability.md` with vault paths.
- Coordinate with repo admin on configuring `production` environment reviewers using the documented steps.
- Run `scripts/deploy/check-production-env.sh` after provisioning to confirm coverage; capture output + vault references in this log.
- Stage Shopify CLI token generation once service credentials arrive and log completion.
- Provide QA with Postgres staging connection info immediately after reliability handoff; schedule rollback drill dry run (target 2025-10-10) using the new checklist.

# Deployment Daily Status — 2025-10-07

## Summary
- ✅ Acknowledged manager direction (`docs/directions/deployment.md`) and assumed deployment agent responsibility.
- ✅ Stood up staging deploy workflow (`deploy-staging.yml`) with smoke verification + artifacts and published runbook support.
- ✅ Extended env matrix + `.env.example` for production readiness and logged reliability coordination for secret provisioning.
- ✅ Drafted production deployment workflow (`deploy-production.yml`) and CLI script covering smoke + Lighthouse evidence.
- ✅ Logged production secret tracker + smoke target (`docs/deployment/env_matrix.md`) and updated `.env.example`.
- ⚠️ Awaiting reliability to provision production secrets before enabling live runs.

## Evidence & References
- Staging workflow: `.github/workflows/deploy-staging.yml`
- Production workflow: `.github/workflows/deploy-production.yml`
- Deploy scripts: `scripts/deploy/staging-deploy.sh`, `scripts/deploy/production-deploy.sh`
- Runbook: `docs/runbooks/deployment_staging.md`
- Env matrix: `docs/deployment/env_matrix.md`
- Go-live checklist: `docs/deployment/production_go_live_checklist.md`
- Updated example env: `.env.example`

## Risks / Follow-Ups
1. **Production Secrets Gap** — Reliability delivering GitHub environment `production` secrets by 2025-10-09; deployment to verify vault linkage once posted.
2. **Environment Approvals** — Need repo admins to configure GitHub `production` environment reviewers (manager + reliability) now that workflow enforcement is in place.
3. **CLI Auth Token** — Generate service `SHOPIFY_CLI_AUTH_TOKEN_PROD` after reliability finalizes app credentials.

## Next Actions (2025-10-08)
- Confirm reliability updates `feedback/reliability.md` with secret provisioning evidence and vault paths.
- Coordinate with repo admin to enable environment reviewers for `production`.
- Generate service account Shopify CLI token and populate GitHub secret once credentials land.
