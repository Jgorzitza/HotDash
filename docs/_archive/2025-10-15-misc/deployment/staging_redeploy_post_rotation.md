---
epoch: 2025.10.E1
doc: docs/deployment/staging_redeploy_post_rotation.md
owner: deployment
last_reviewed: 2025-10-10
doc_hash: TBD
expires: 2025-10-17
---

# Staging Redeploy — Current State (No Rotation)

> Reliability cancelled the planned Supabase credential rotation on 2025-10-10. This checklist now covers the standard staging redeploy flow using the existing Supabase bundle, with embed token + Shopify secrets mirrored to GitHub.

## Preconditions

- Sanitized branch `agent/ai/staging-push` force-pushed to GitHub with hash logged in `feedback/deployment.md` (latest push: `0079c3192f0b9e8f02243beb9edb8d22deecf210`).
- Supabase staging credentials verified in vault/GitHub (`SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `DATABASE_URL`). DSN stored at `vault/occ/supabase/database_url_staging.env` now uses the Supabase session pooler with `sslmode=require` and an encoded password (`%2F`, `%21`).
- Shopify embed token staged in vault and mirrored to GitHub secret `SHOPIFY_EMBED_TOKEN_STAGING` (access via CI or export with `gh secret` as needed).
- Staging deploy freeze lifted (no override variable required post-cancellation).

## Command Pack (execute in order)

1. Confirm vault bundle is available — `scripts/deploy/staging-deploy.sh` now auto-sources `vault/occ/shopify/*.env` and `vault/occ/supabase/*.env` when values are absent from the shell. For manual overrides, export via `set -a; source vault/...; set +a`.
2. Optional: Refresh Fly secrets if values changed (`/home/justin/.fly/bin/fly secrets set SUPABASE_URL=...` etc.).
3. Run deploy script:
   ```bash
   SHOPIFY_CLI_AUTH_TOKEN="$SHOPIFY_CLI_AUTH_TOKEN" \
   SHOPIFY_API_KEY="$SHOPIFY_API_KEY" \
   SHOPIFY_API_SECRET="$SHOPIFY_API_SECRET" \
   STAGING_SHOP_DOMAIN="$STAGING_SHOP_DOMAIN" \
   STAGING_APP_URL="$STAGING_APP_URL" \
   STAGING_SMOKE_TEST_URL="$STAGING_SMOKE_TEST_URL" \
   scripts/deploy/staging-deploy.sh
   ```
4. Trigger Prisma smoke if required:
   ```bash
   DATABASE_URL="$DATABASE_URL" npm run db:migrate:postgres
   ```
5. Capture synthetic check (<300 ms mock + live) via `node scripts/ci/synthetic-check.mjs` with updated Supabase backing. Pair with `scripts/ops/chatwoot-fly-smoke.sh --env staging` to log CX readiness (`artifacts/support/chatwoot-fly-deploy/hotdash-chatwoot.fly.dev/`).

## Rollback Checklist (Hotfix)

1. Identify last known-good commit hash (e.g., `git rev-parse origin/agent/ai/staging-push^`).
2. Deploy rollback build:
   ```bash
   git checkout <known-good>
   npm install --legacy-peer-deps
   SHOPIFY_CLI_AUTH_TOKEN="$SHOPIFY_CLI_AUTH_TOKEN" \
   SHOPIFY_API_KEY="$SHOPIFY_API_KEY" \
   SHOPIFY_API_SECRET="$SHOPIFY_API_SECRET" \
   STAGING_SHOP_DOMAIN="$STAGING_SHOP_DOMAIN" \
   STAGING_APP_URL="$STAGING_APP_URL" \
   STAGING_SMOKE_TEST_URL="$STAGING_SMOKE_TEST_URL" \
   scripts/deploy/staging-deploy.sh
   ```
3. Run synthetic + Prisma smoke to confirm rollback.
4. Log rollback in `feedback/deployment.md` (include commit hash, evidence artifacts, and reason).

## Evidence Checklist

- `artifacts/deploy/staging-deploy-<timestamp>.json` (Shopify CLI deploy output).
- `artifacts/deploy/staging-smoke-<timestamp>.log` (synthetic CLI log) and `artifacts/monitoring/synthetic-check-<timestamp>.json` showing <300 ms mock + live post-rotation.
- `artifacts/migrations/<timestamp>/prisma-migrate.log` documenting successful Prisma smoke against rotated database.
- `artifacts/deploy/fly-secrets-<timestamp>.txt` capturing refreshed Supabase secrets in Fly.
- Chatwoot smoke bundle: `artifacts/support/chatwoot-fly-deploy/hotdash-chatwoot.fly.dev/` (contains `accounts_<timestamp>.status`, OCC proxy captures, and summary markdown).
- Feedback updates:
  - `feedback/deployment.md` — redeploy summary + Supabase rotation confirmation.
  - `feedback/reliability.md` — vault paths + rotation completion link.
  - `feedback/qa.md` — mock/live smoke validation timestamps.
- Confirm `docs/deployment/env_matrix.md` updated to remove HOLD banner and reference new rotation date once evidence captured.
