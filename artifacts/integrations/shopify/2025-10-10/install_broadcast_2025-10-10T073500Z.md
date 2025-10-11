# Shopify Staging Install Broadcast — Sent 2025-10-10T07:35Z

Recipients: qa-team@hotdash.internal, product@hotdash.internal, support@hotdash.internal
Channel: Slack #launch-readiness (mirrored to email distro)

---
Subject: Shopify staging credentials live — install + smoke checklist

Hi all,

Deployment confirmed the Shopify staging bundle is live. Credentials and access paths are ready for install:

- Shopify API key/secret: 1Password › OCC › Shopify Staging (links pinned in vault/occ/shopify/api_key_staging.env, api_secret_staging.env)
- Shopify CLI auth token: `vault/occ/shopify/cli_auth_token_staging.env` (mirrored to GitHub environment `staging`, updated_at=2025-10-09T22:29:26Z)
- Staging app URL: https://hotdash-staging.fly.dev/app
- Smoke endpoint: https://hotdash-staging.fly.dev/app?mock=0 (currently under latency watch — see DEPLOY-147)
- Shop domain: hotroddash.myshopify.com (invites issued to QA/Product/Support service accounts)

Actions requested today:

QA
1. Pull the refreshed `.env.staging` bundle (Shopify + Supabase).
2. Run Prisma forward/back drill (`npm run db:migrate:postgres`).
3. Execute Shopify contract tests and attach results to `feedback/qa.md`.

Product
1. Validate Sales Pulse / CX Escalations tiles render with live staging data.
2. Log observations + screenshots in `docs/integrations/shopify_readiness.md`.

Support
1. Rehearse the Shopify validation queue via staging host.
2. Confirm SOP links now point at Fly staging + CLI instructions; log confirmation in `feedback/support.md`.

Integrations will keep DEPLOY-147 open only until we capture sub-300 ms smoke latency evidence. Please post any blockers in #launch-readiness.

Thanks,
Integrations
