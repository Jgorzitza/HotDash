---
epoch: 2025.10.E1
doc: docs/deployment/env_matrix.md
owner: deployment
last_reviewed: 2025-10-07
doc_hash: TBD
expires: 2025-10-14
---
# Environment Variable Matrix — Dev / Staging / Production

## Summary
- 2025-10-10: Reliability refreshed the Supabase staging DSN (session pooler with `sslmode=require`) in `vault/occ/supabase/database_url_staging.env` and mirrored it to GitHub `staging` secret `DATABASE_URL`; reuse this canonical value for Prisma drills, Chatwoot, and deploy parity checks.
- Vault bundles now back every staging secret (`vault/occ/shopify/*.env`, `vault/occ/supabase/*.env`, `vault/occ/chatwoot/*.env`). `scripts/deploy/staging-deploy.sh` auto-sources these paths so local runs align with CI without copy/paste.
- Shopify embed token tracked via `vault/occ/shopify/embed_token_staging.env` and mirrored to GitHub secret `SHOPIFY_EMBED_TOKEN_STAGING` (2025-10-10); Playwright tooling injects it through `PLAYWRIGHT_SHOPIFY_EMBED_TOKEN`.
- Production GitHub environment remains pending reliability provisioning; keep placeholders documented while staging executes against the vaulted secrets.
- `.env.example` now aligns with runtime naming (`CHATWOOT_TOKEN`, `CHATWOOT_ACCOUNT_ID`, `CHATWOOT_SLA_MINUTES`); remind developers to refresh local env files.
- Production smoke target finalized as `https://operators.hotdash.app/app?mock=0` with live budget 800 ms (mock budget 300 ms) enforced via `scripts/ci/synthetic-check.mjs`.
- Feature flag overrides default to `1`/`0` toggles. Leave unset in production unless coordinated with product for controlled releases.

## Core App (Shopify)
| Variable | Dev (.env) | Staging | Production | Notes |
|----------|------------|---------|------------|-------|
| `SHOPIFY_API_KEY` | Local Shopify partner test key | Vault `occ/shopify/api_key_staging.env` (`SHOPIFY_API_KEY_STAGING`) mirrored to GitHub secret `SHOPIFY_API_KEY_STAGING` | Secret `SHOPIFY_API_KEY_PROD` (pending reliability provisioning) | Script expects base name; staging/prod map via env injection |
| `SHOPIFY_API_SECRET` | Local secret | Vault `occ/shopify/api_secret_staging.env` (`SHOPIFY_API_SECRET_STAGING`) mirrored to GitHub secret `SHOPIFY_API_SECRET_STAGING` | Secret `SHOPIFY_API_SECRET_PROD` (pending reliability provisioning) | Rotate every 90 d; document in secret rotation log |
| `SHOPIFY_APP_URL` | `http://localhost:3000` | Vault `occ/shopify/app_url_staging.env` + GitHub secret `STAGING_APP_URL` (`https://hotdash-staging.fly.dev/app`) | Environment variable `PRODUCTION_APP_URL` (managed platform env; pending reliability provisioning) | Must match OAuth callback registered in Shopify Partner dashboard |
| `SCOPES` | Optional override in dev | Unset (defaults in `shopify.app.toml`) | Unset | Set only if deviating from `shopify.app.toml` scopes |
| `SHOP_CUSTOM_DOMAIN` | Optional | Optional (use when staging custom domain) | Expected (prod vanity domain) | Provide when using custom domain routing |
| `SHOPIFY_CLI_AUTH_TOKEN` | Local login artifact | Vault `occ/shopify/cli_auth_token_staging.env` (`SHOPIFY_CLI_AUTH_TOKEN_STAGING`) mirrored to GitHub secret `SHOPIFY_CLI_AUTH_TOKEN_STAGING` | Secret `SHOPIFY_CLI_AUTH_TOKEN_PROD` (pending reliability provisioning) | Required for non-interactive CLI deploys |
| `STAGING_SHOP_DOMAIN` | N/A | Vault `occ/shopify/shop_domain_staging.env` + GitHub secret `STAGING_SHOP_DOMAIN` | N/A | Used by deploy script/workflow |
| `STAGING_SMOKE_TEST_URL` | N/A | Vault `occ/shopify/smoke_test_url_staging.env` + GitHub secret `STAGING_SMOKE_TEST_URL` (`…/app?mock=1` current) | N/A | Flip to `/app?mock=0` once live data parity is validated |
| `SHOPIFY_EMBED_TOKEN` | N/A | Vault `occ/shopify/embed_token_staging.env` + GitHub secret `SHOPIFY_EMBED_TOKEN_STAGING` | Vault/secret placeholder pending prod plan | Powers Playwright Shopify Admin embed flows; rotate every 30 days |

## Data & Persistence
| Variable | Dev (.env) | Staging | Production | Notes |
|----------|------------|---------|------------|-------|
| `DATABASE_URL` | `file:./prisma/dev.db` | Vault `occ/supabase/database_url_staging.env` (Supabase pooler DSN + `sslmode=require`) mirrored to GitHub secret `DATABASE_URL` | Managed DB connection (vault + platform env) | Required for Prisma migrations; stage/prod use managed Postgres — see `docs/runbooks/prisma_staging_postgres.md` |
| `SUPABASE_URL` | Dev Supabase project (optional) | GitHub secret `SUPABASE_URL` (vault capture pending) | Secret `SUPABASE_URL_PROD` (pending reliability provisioning) | Shared between runtime + CI; ensure Row Level Security enforced |
| `SUPABASE_SERVICE_KEY` | Dev service key | Vault `occ/supabase/service_key_staging.env` mirrored to GitHub secret `SUPABASE_SERVICE_KEY` | Secret `SUPABASE_SERVICE_KEY_PROD` (pending reliability provisioning) | Treat as highly sensitive (service role) |
| `FEATURE_SUPABASE_MEMORY` | Defaults to `1` | Leave unset (defaults to enabled) | Leave unset | Overrides fallback to in-memory store if set to `0` |

## CX / Chatwoot
| Variable | Dev (.env) | Staging | Production | Notes |
|----------|------------|---------|------------|-------|
| `CHATWOOT_BASE_URL` | Local docker / staging host | GitHub secret `CHATWOOT_BASE_URL_STAGING` (`https://hotdash-chatwoot.fly.dev`) — vault capture pending | Vault + secret `CHATWOOT_BASE_URL_PROD` | Updated to Fly host; no rotation planned until post-cutover review |
| `CHATWOOT_TOKEN` | Personal token for dev | Vault `occ/chatwoot/api_token_staging.env` (`CHATWOOT_API_TOKEN_STAGING`) mirrored to GitHub secret `CHATWOOT_TOKEN_STAGING` | Secret `CHATWOOT_TOKEN_PROD` | Replace `CHATWOOT_ACCESS_TOKEN` legacy name |
| `CHATWOOT_ACCOUNT_ID` | Numeric (dev sandbox) | Vault `occ/chatwoot/api_token_staging.env` (`CHATWOOT_ACCOUNT_ID_STAGING`) mirrored to GitHub secret `CHATWOOT_ACCOUNT_ID_STAGING` | Secret `CHATWOOT_ACCOUNT_ID_PROD` | Must be integer |
| `CHATWOOT_SLA_MINUTES` | Optional override (defaults 30) | Optional | Optional | Align with CX direction |
| `CHATWOOT_CACHE_TTL_MS` | Optional (defaults 60000) | Optional | Optional | Lower to tighten freshness |
| `CHATWOOT_MAX_PAGES` | Optional (defaults 2) | Optional | Optional | Controls pagination depth |

## Analytics & AI
| Variable | Dev (.env) | Staging | Production | Notes |
|----------|------------|---------|------------|-------|
| `GA_PROPERTY_ID` | Mock property ID | Secret `GA_PROPERTY_ID_STAGING` (optional until GA enabled) | Secret `GA_PROPERTY_ID_PROD` | Required once GA live |
| `GA_USE_MOCK` | `1` (default) | `0` when staging GA ready | `0` | Toggles mock GA client |
| `GA_MCP_HOST` | `http://127.0.0.1:8780` | Secret `GA_MCP_HOST_STAGING` | Secret `GA_MCP_HOST_PROD` | Mirror MCP deployment host |
| `GA_CACHE_TTL_MS` | Optional | Optional | Optional | Adjust based on SLO |
| `ANTHROPIC_API_KEY` | Personal dev key | Secret `ANTHROPIC_API_KEY_STAGING` | Secret `ANTHROPIC_API_KEY_PROD` | Powers AI generation service |
| `LIGHTHOUSE_TARGET` | Local preview URL | `STAGING_SMOKE_TEST_URL` secret (workflow injects; `run-lighthouse` falls back to it) | Production URL (set in prod workflow) | CI only |
| `SYNTHETIC_CHECK_URL` | Local `http://localhost:3000/app?mock=1` | Derived from `STAGING_SMOKE_TEST_URL` | Production smoke URL | Provided at runtime |

## Notifications & Channels (future-ready)
| Variable | Dev (.env) | Staging | Production | Notes |
|----------|------------|---------|------------|-------|
| `TWILIO_ACCOUNT_SID` | Optional | Vault placeholder | Vault placeholder | Not yet wired; reserve for SMS escalations |
| `TWILIO_AUTH_TOKEN` | Optional | Vault placeholder | Vault placeholder | Guard in vault even if unused |
| `TWILIO_NUMBER` | Optional | Vault placeholder | Vault placeholder | |
| `META_*` (`META_APP_ID`, `META_APP_SECRET`, `META_PAGE_ID`) | Optional | Placeholder | Placeholder | Coordination with marketing agent pending |
| `IG_BUSINESS_ACCOUNT_ID` | Optional | Placeholder | Placeholder | |
| `TIKTOK_CLIENT_KEY` / `TIKTOK_CLIENT_SECRET` | Optional | Placeholder | Placeholder | |
| `ZOHO_*` (`ZOHO_ACCESS_TOKEN`, etc.) | Optional | Placeholder | Placeholder | Used for email ingestion per integration direction |

## Production Secret Provisioning Status
| Secret | Owner | Status | Target Date | Notes |
|--------|-------|--------|-------------|-------|
| `SHOPIFY_API_KEY_PROD` | Reliability | Requested | 2025-10-09 | Populate GitHub env `production` + vault entry `occ/shopify/api_key_prod` |
| `SHOPIFY_API_SECRET_PROD` | Reliability | Requested | 2025-10-09 | Rotate every 90d; confirm partner dashboard update |
| `SHOPIFY_CLI_AUTH_TOKEN_PROD` | Deployment | Pending login | 2025-10-09 | Generate via `shopify app login --store <prod>` on service account |
| `SUPABASE_URL_PROD` | Reliability | Requested | 2025-10-09 | Provide read/write connection string scoped to Memory schemas |
| `SUPABASE_SERVICE_KEY_PROD` | Reliability | Requested | 2025-10-09 | Store in vault `occ/supabase/service_key_prod`; map to GitHub secret |
| `CHATWOOT_BASE_URL_PROD` | Reliability | Requested | 2025-10-09 | Confirm SSL + IP allowlist |
| `CHATWOOT_TOKEN_PROD` | Reliability | Requested | 2025-10-09 | Create service token with escalations scope only |
| `CHATWOOT_ACCOUNT_ID_PROD` | Reliability | Provided | 2025-10-07 | Documented in vault `occ/chatwoot/account_id_prod` |
| `ANTHROPIC_API_KEY_PROD` | Reliability | Requested | 2025-10-09 | Ensure usage alerts configured |
| `GA_MCP_HOST_PROD` | Reliability | Requested | 2025-10-09 | Provide Cloudflare Worker host |
| `GA_PROPERTY_ID_PROD` | Marketing | Requested | 2025-10-08 | Requires GA admin confirmation |
| `PRODUCTION_SMOKE_TEST_URL` | Deployment | Provisioned | 2025-10-07 | `https://operators.hotdash.app/app?mock=0` |
| `PRODUCTION_APP_URL` | Reliability | In progress | 2025-10-08 | Align with Shopify redirect URIs |

## Reliability Coordination Log
- 2025-10-07: Logged request to reliability (see `feedback/deployment.md`) to create GitHub environment `production` with secrets: `SHOPIFY_API_KEY_PROD`, `SHOPIFY_API_SECRET_PROD`, `SHOPIFY_CLI_AUTH_TOKEN_PROD`, `SUPABASE_URL_PROD`, `SUPABASE_SERVICE_KEY_PROD`, `CHATWOOT_BASE_URL_PROD`, `CHATWOOT_TOKEN_PROD`, `CHATWOOT_ACCOUNT_ID_PROD`, `ANTHROPIC_API_KEY_PROD`, `GA_MCP_HOST_PROD`, `GA_PROPERTY_ID_PROD`.
- 2025-10-07: Reliability confirmed provisioning ETA 2025-10-09 with vault linkage to be documented in `feedback/reliability.md`.
- 2025-10-10: Supabase staging rotation cancelled; maintaining existing DSNs/service keys and documenting evidence artifacts instead.
- 2025-10-10: Chatwoot Fly rollout in progress — staging base URL secret updated to Fly host, awaiting production host handoff before marking rotation complete.

## Follow-Ups
1. Reliability: update `feedback/reliability.md` once production secrets land (ETA 2025-10-09) and link vault paths listed above.
2. Deployment: verify `PRODUCTION_SMOKE_TEST_URL` secret populated in GitHub environment and update this matrix if URL changes.
3. Product: socialize production smoke target + budgets with operator leads ahead of first release dry run.
4. Deployment: run `scripts/deploy/check-production-env.sh` after reliability provisioning to confirm GitHub environment coverage and attach results to `feedback/deployment.md`.

## Smoke Verification Targets
| Environment | URL | Budget | Notes |
|-------------|-----|--------|-------|
| Staging | `STAGING_SMOKE_TEST_URL` secret (e.g., https://staging.hotdash.app/app?mock=1) | 300ms (mock) | Synthetic check runs in staging workflow |
| Production | `https://operators.hotdash.app/app?mock=0` | 800ms (live) | Synthetic check + Lighthouse in production workflow |
