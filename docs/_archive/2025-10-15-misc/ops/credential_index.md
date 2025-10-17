---
epoch: 2025.10.E1
doc: docs/ops/credential_index.md
owner: manager
last_reviewed: 2025-10-12
expires: 2025-10-19
---

# Credential & Secret Map — Operator Control Center

This map catalogs every secret agents rely on. All secrets live in vault (`vault/occ/…`) and GitHub Actions environments; nothing belongs in git history or plaintext chat.

| Capability                       | Secret Names / Paths                                                                                                              | Notes & Owners                                                                                                                                                               |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Supabase (local dev)             | `.env.local` (`DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`)                                                             | Start via `supabase start`; developers manage per-machine secrets and keep files out of git.                                                                                 |
| Supabase (staging)               | `vault/occ/supabase/database_url_staging.env`, `vault/occ/supabase/service_key_staging.env`                                       | Reliability maintains; deployment mirrors to GitHub `staging` (`DATABASE_URL`, `SUPABASE_SERVICE_KEY`).                                                                      |
| Supabase (production)            | `vault/occ/supabase/database_url_prod.env`, `vault/occ/supabase/service_key_prod.env`                                             | Managed by reliability/deployment; rotation logged via compliance.                                                                                                           |
| Shopify Admin (staging)          | `vault/occ/shopify/embed_token_staging.env`, `vault/occ/shopify/shop_domain_staging.env`, `vault/occ/shopify/app_url_staging.env` | Deployment mirrors to GitHub `staging` secrets (`SHOPIFY_EMBED_TOKEN_STAGING`, etc.).                                                                                        |
| Shopify Admin (production)       | `vault/occ/shopify/embed_token_prod.env`, `vault/occ/shopify/shop_domain_prod.env`, `vault/occ/shopify/app_url_prod.env`          | Deployment responsible for mirroring to GitHub `production`.                                                                                                                 |
| Fly.io CLI                       | `vault/occ/fly/api_token.env`                                                                                                     | Source before running Fly commands; reliability/integrations/chatwoot/deployment must confirm.                                                                               |
| Chatwoot Redis (Fly Upstash)     | `vault/occ/chatwoot/redis_staging.env`                                                                                            | Contains `REDIS_URL`; reliability keeps production equivalent when scheduled.                                                                                                |
| Chatwoot Super Admin             | `vault/occ/chatwoot/super_admin_staging.env`                                                                                      | Support owns password rotation; integrations references for API token creation.                                                                                              |
| OpenAI                           | `vault/occ/openai/api_key_staging.env`, `vault/occ/openai/api_key_prod.env`                                                       | AI + data rely on staging key; production key gated until compliance sign-off.                                                                                               |
| LlamaIndex Service Context       | `packages/memory/indexes/operator_knowledge/service_context.json`                                                                 | Consumable artifact (non-secret) — AI owns regeneration cadence.                                                                                                             |
| GitHub Actions (staging env)     | `DATABASE_URL`, `SUPABASE_SERVICE_KEY`, `SHOPIFY_*`, `STAGING_APP_URL`, `STAGING_SMOKE_TEST_URL`, `SHOPIFY_EMBED_TOKEN_STAGING`   | Deployment mirrors from vault; reliability verifies timestamps daily.                                                                                                        |
| GitHub Actions (production env)  | `SHOPIFY_*_PROD`, `PRODUCTION_APP_URL`, `PRODUCTION_SMOKE_TEST_URL`, etc.                                                         | Deployment mirrors as go-live gating step.                                                                                                                                   |
| Google Analytics Service Account | `vault/occ/google/analytics-service-account.json`                                                                                 | Service account for GA Data API access; engineer uses for direct API calls; dev tools use for MCP queries. Credentials file permissions must be 600 (owner read/write only). |
| Hootsuite (if activated)         | `vault/occ/hootsuite/api_key.env`                                                                                                 | Compliance logs vendor approvals before use.                                                                                                                                 |

## Usage Rules

1. **Source-before-use** — `source <path>` in your shell before invoking tooling (`fly`, `npm`, `scripts/ops/*`). Do not copy values into `.env`.
2. **Evidence logging** — Reference the exact file path and timestamp in your feedback entry every time you use a secret (for mirroring, deployments, smoke tests).
3. **Rotation** — Manager approves rotation schedules; reliability executes in vault first, deployment mirrors to GitHub, compliance logs evidence.
4. **Missing entries** — If a required secret is absent or placeholder, stop and log the gap in your feedback file; escalate only after one retry and manager notification.
5. **No duplication** — Never create per-agent copies of secrets. Use the listed paths to avoid drift.
