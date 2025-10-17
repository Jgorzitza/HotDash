---
epoch: 2025.10.E1
doc: docs/deployment/shopify_staging_install_plan.md
owner: product
last_reviewed: 2025-10-10
doc_hash: TBD
expires: 2025-10-17
---

# Shopify Staging Install Plan — Operator Control Center

## Purpose

Codify the exact sequence for shipping the HotDash Shopify app to the staging store and preparing QA to validate admin flows. Use this in tandem with `docs/directions/product.md`, `docs/integrations/shopify_readiness.md`, and `docs/runbooks/shopify_dry_run_checklist.md` before updating Linear/Memory.

## Current State Snapshot (2025-10-10)

- **Fly host:** `https://hotdash-staging.fly.dev/app` (`fly.toml` primary region `ord`) with dedicated IPv4 `149.248.193.17` (see `feedback/deployment.md`).
- **Supabase parity:** [`artifacts/monitoring/supabase-parity_2025-10-10T01-25-10Z.json`](../../artifacts/monitoring/supabase-parity_2025-10-10T01-25-10Z.json) shows `view`/`refresh` deltas at `0` after the pooler DSN apply.
- **Synthetic smoke:** Latest run succeeded ([`artifacts/monitoring/synthetic-check-2025-10-10T04-40-48.296Z.json`](../../artifacts/monitoring/synthetic-check-2025-10-10T04-40-48.296Z.json)) with HTTP 200 against `https://hotdash-staging.fly.dev/app?mock=0`; attach alongside the Supabase parity artifact before lifting the backlog hold.
- **Credentials status:** Reliability confirmed existing Supabase + Shopify staging secrets remain authoritative; deployments proceed with current bundle while evidence gates (sub-300 ms live smoke + QA artifacts) still block release clearance.
- **Credential bundle:** Vault/GitHub `staging` secrets refreshed 2025-10-09 21:49-21:58 UTC (`feedback/reliability.md`); store access handoff (`DEPLOY-147`) still pending delivery to QA/support.

## Prerequisites

| Item                             | Location                                                                                    | Notes                                                                                                                              |
| -------------------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Shopify client ID                | `shopify.app.toml:client_id`                                                                | `4f72376ea61be956c860dd020552124d` — matches staging API key vault entry.                                                          |
| Shopify staging API key & secret | `vault/occ/shopify/api_key_staging.env`, `vault/occ/shopify/api_secret_staging.env`         | Confirm GitHub `staging` environment mirrors (`SHOPIFY_API_KEY_STAGING`, `SHOPIFY_API_SECRET_STAGING`).                            |
| Shopify CLI auth token           | `vault/occ/shopify/cli_auth_token_staging.env`                                              | Confirm latest rotation timestamp in vault; attach CLI output screenshot in `artifacts/integrations/shopify/<date>/cli-token.png`. |
| Staging shop domain              | `vault/occ/shopify/shop_domain_staging.env`                                                 | `hotroddash.myshopify.com`; ensure invite delivered before QA validation.                                                          |
| Staging app URL / smoke target   | `vault/occ/shopify/app_url_staging.env`, GitHub secret `STAGING_SMOKE_TEST_URL`             | `https://hotdash-staging.fly.dev/app` / `...?mock=0`.                                                                              |
| Supabase staging credentials     | `vault/occ/supabase/database_url_staging.env`, `vault/occ/supabase/service_key_staging.env` | Evidence bundle at `artifacts/monitoring/supabase-parity_2025-10-10T01-25-10Z.json`.                                               |
| Synthetic check script           | `scripts/ci/synthetic-check.mjs`                                                            | Budget 800 ms with warmup delay; rerun until green artifact captured for `?mock=0`.                                                |
| Shopify embed token (Playwright) | `vault/occ/shopify/embed_token_staging.env`, GitHub secret `SHOPIFY_EMBED_TOKEN_STAGING`    | Enables Admin iframe loads during QA/localization Playwright suites; rotate every 30 days.                                         |

## Credential Hand-off Checklist (DEPLOY-147)

| Item                                                                                      | Owner                      | Delivery Evidence                                                                                                                     | Pending Actions                                                                                               |
| ----------------------------------------------------------------------------------------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Shopify store invites (Evergreen Outfitters, Atelier Belle Maison, Peak Performance Gear) | Deployment ↔ Integrations | `artifacts/integrations/shopify/2025-10-10/store-access.md` + # permalink in `feedback/deployment.md`                                 | 🔴 Pending DEPLOY-147 closeout; escalate if not delivered by 2025-10-11 19:00 UTC.                            |
| Shopify CLI auth token (`SHOPIFY_CLI_AUTH_TOKEN_STAGING`)                                 | Deployment                 | Vault `occ/shopify/cli_auth_token_staging.env` + timestamp screenshot stored in `artifacts/integrations/shopify/<date>/cli-token.png` | Await confirmation of latest rotation; log timestamp in `feedback/product.md`.                                |
| Chatwoot sandbox token rotation                                                           | Integrations               | Vault entry `occ/chatwoot/token_sandbox_staging.env` + note in `feedback/integrations.md`                                             | Verify token aligns with 2025-10-16 dry run scenarios; request acknowledgement once rotated.                  |
| Supabase decision log read-only service key                                               | Data                       | Vault entry `occ/supabase/service_key_staging.env` + parity artefact `artifacts/monitoring/supabase-parity_2025-10-10T01-25-10Z.json` | Confirm read-only scope documented; attach vault timestamp screenshot before sharing with support.            |
| STAGING_SMOKE_TEST_URL evidence bundle                                                    | Reliability                | `artifacts/monitoring/synthetic-check-2025-10-10T04-40-48.296Z.json` + screenshot `artifacts/ops/dry_run_2025-10-16/mock0-smoke.png`  | Capture new screenshot once `?mock=0` returns 200 and notify support/enablement.                              |
| QA walkthrough screenshots + modal evidence                                               | QA                         | `artifacts/ops/dry_run_2025-10-16/screenshots/` + entry in `feedback/qa.md`                                                           | Prep mock-mode captures now; replace with live-mode set post-credential delivery.                             |
| Operator comms packet acknowledgement                                                     | Support ↔ Enablement      | # permalink for internal broadcast (`#occ-ops`) + email send log                                                                      | Stage templates (docs/marketing/launch_comms_packet.md §2B); send once checklist items above marked complete. |

## Execution Timeline

1. **Credential Confirmation (Product ↔ Deployment/Integrations/Reliability)**
   - Verify vault + GitHub secret timestamps (record in `feedback/product.md`).
   - Confirm `DEPLOY-147` delivers store invite + password reset instructions for `hotroddash.myshopify.com`.
   - Attach Supabase parity artifact + secret timestamp screenshots to Linear/Memory update.

2. **Shopify CLI Deploy (Deployment w/ Product Oversight)**
   - Command: `npx --yes @shopify/cli@latest app deploy --force --client-id 4f72376ea61be956c860dd020552124d --path /home/justin/HotDash/hot-dash`.
   - Evidence: structured log (`artifacts/engineering/shopify_cli/<timestamp>-staging-app-deploy.json`) and console log (`artifacts/deploy/<timestamp>.log`).
   - If CLI token rotates, rerun `scripts/deploy/shopify-dev-mcp-staging-auth.sh --check` and resync secrets before redeploying.

3. **Staging Install & QA Prep (Product ↔ QA/Support)**
   - Once deploy completes, document install steps for QA: Shopify Admin → Apps → HotDash → Install (ensure partner app scopes align with `shopify.web.toml`).
   - Log who accepted the store invite and timestamp in [`artifacts/integrations/shopify/2025-10-10/store-access.md`](../../artifacts/integrations/shopify/2025-10-10/store-access.md).
   - Capture screenshots of Admin access, CLI tunnel confirmation, and scope review; store under `artifacts/integrations/shopify/2025-10-10/`.

4. **Synthetic Smoke Validation (Reliability ↔ Deployment)**
   - Run `node scripts/ci/synthetic-check.mjs --url https://hotdash-staging.fly.dev/app?mock=0` until `"ok": true` is recorded.
   - Archive success artifact alongside Supabase parity bundle and attach both links when lifting backlog hold.

5. **QA Evidence Collection (QA ↔ Product)**
   - Trigger Prisma forward/back run against staging Postgres; save logs to `artifacts/migrations/<date>/`.
   - Execute Shopify GraphQL parity smoke and Playwright admin flow; store transcripts/screenshots under `artifacts/shopify/graphql/<date>/` and `artifacts/playwright/shopify/<date>/`.
   - Update [`feedback/qa.md`](../../feedback/qa.md) with completion notes referencing artifacts so product can lift the backlog freeze.

## Logging & Comms Requirements

- Update Linear backlog item (OCC-Backlog Refresh) with:
  - Supabase parity artifact link.
  - Synthetic `mock=0` success artifact.
  - Shopify install evidence (store invite log, CLI deploy log).
- Mirror the above in Memory (`scope="ops"`, topic `staging_install_plan`) once artifacts exist.
- Record progress + blockers daily in [`feedback/product.md`](../../feedback/product.md) per direction; include timestamps for secret validation, CLI deploy, and synthetic smoke outcomes.
- Keep the backlog frozen until QA notes both artifacts in [`feedback/qa.md`](../../feedback/qa.md) and product publishes the combined evidence bundle.
- Notify QA/support via # with vault paths + GitHub secret timestamps when access bundle is live; capture permalink in feedback log.

## Blockers & Dependencies

- **Synthetic smoke (`mock=0`)** — hold backlog refresh until `artifacts/monitoring` contains a green run for the Fly host.
- **Store invite delivery** — `DEPLOY-147` must close; escalate to manager if evidence not received by 2025-10-11 19:00 UTC.
- **Supabase telemetry** — keep `artifacts/monitoring/supabase-parity_2025-10-10T01-25-10Z.json` attached; schedule next parity check after QA runs migrations to prove no drift.
- **Dry run readiness** — coordinate with support per `docs/runbooks/shopify_dry_run_checklist.md` once install succeeds.

## Change Log

| Date       | Author  | Change                                                                                                                      |
| ---------- | ------- | --------------------------------------------------------------------------------------------------------------------------- |
| 2025-10-10 | support | Added credential hand-off checklist to track DEPLOY-147 onboarding package.                                                 |
| 2025-10-10 | product | Initial staging install plan drafted per manager direction to document client ID, CLI token, and store access requirements. |
| 2025-10-10 | product | Updated synthetic smoke status with green artifact and staging token note.                                                  |
