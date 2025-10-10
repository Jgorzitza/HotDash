---
epoch: 2025.10.E1
doc: docs/integrations/shopify_readiness.md
owner: integrations
last_reviewed: 2025-10-10
doc_hash: TBD
expires: 2025-10-17
---
# Shopify Integration Readiness — QA & Integrations

## Current State
- **Connection Secrets:** Staging `DATABASE_URL` delivered (vault/occ/supabase/database_url_staging.env) and mirrored to GitHub `staging` environment; coordinate with QA to refresh `.env.staging` and begin migrations.
- **Admin Store Access:** QA, Product, and Support service accounts confirmed invited + accepted (audit log `artifacts/integrations/shopify/2025-10-10/store-invite-audit-20251010T0730Z.md`); access instructions broadcast 07:35 UTC.
- **Fixtures:** Offline fixtures for orders, inventory, and approvals stored under `tests/fixtures/shopify/`; require refresh once Admin data connects to staging Postgres.
- **Fly Staging Host:** Verified `https://hotdash-staging.fly.dev/app?mock=1` reachable (HTTP 200 captured at 02:50 UTC and refreshed at 06:20 UTC — see `artifacts/integrations/shopify/2025-10-10/curl_hotdash-staging_2025-10-10T02-50-44Z.log` and `...T06-20-00Z.log`); access instructions distributed via 07:35 UTC broadcast.
- **Live Path Check:** `https://hotdash-staging.fly.dev/app?mock=0` still under latency watch (410 → pending sub-300 ms evidence); reliability running follow-up smoke to close DEPLOY-147.
- **CLI Secret Evidence:** Captured 07:18 UTC sha256 for `vault/occ/shopify/cli_auth_token_staging.env` (`artifacts/integrations/shopify/2025-10-10/cli-secret-20251010T071858Z.log`); pending Fly `secrets list` attachment after DEPLOY-147 closure.

## Validation Scope
1. **Prisma Forward/Back Validation**
   - Run `npm run db:migrate:postgres` and rollback scripts against staging Postgres using the supplied `DATABASE_URL`.
   - Capture command transcripts and row count deltas; attach to `feedback/qa.md`.
2. **Shopify Admin GraphQL Parity**
   - Execute smoke queries covering orders, inventory, and approvals using deterministic fixtures.
   - Confirm API responses align with rendered tiles (Sales Pulse, Fulfillment Health, Approvals modal).
3. **Polaris UI Consistency**
   - Verify Shopify surfaces adhere to Polaris tokens/components; log discrepancies for design follow-up.
4. **Offline Fixture Integrity**
   - Ensure tests run offline using fixtures; regenerate snapshots when APIs or schema change.

## Evidence Requirements
- Migration logs (forward/back) stored in `artifacts/migrations/YYYY-MM-DD/`.
- GraphQL query transcripts and responses saved under `artifacts/shopify/graphql/YYYY-MM-DD/`.
- Playwright screenshots for Shopify surfaces recorded in `artifacts/playwright/shopify/`.
- Deployment + smoke evidence staged under `artifacts/integrations/shopify/2025-10-10/`; secret delivery artifacts appended (`cli-secret-20251010T071858Z.log`, `store-invite-audit-20251010T0730Z.md`).
- Staging store invite/access log will be captured in `artifacts/integrations/shopify/2025-10-10/store-access.md` immediately after credentials handoff.

## Blockers / Next Actions
- Deployment & Integrations: Monitor Fly smoke latency and capture sub-300 ms proof for `https://hotdash-staging.fly.dev/app?mock=0`; DEPLOY-147 can close immediately after evidence lands.
- Reliability: Re-run smoke probe + share latency logs; assist with caching tweaks if readings stay above target.
- QA/Product/Support: Execute broadcasted action items and log outcomes in respective feedback docs.

## Action Log
- **2025-10-10 07:23 UTC:** Posted follow-up in `#deploy-ops` requesting timestamped QA/product/support invites and auditing details for DEPLOY-147 closure; awaiting acknowledgement before manager escalation.
- **2025-10-10 07:18 UTC:** Logged CLI secret hash evidence (`cli-secret-20251010T071858Z.log`) and noted pending Fly secrets verification after deployment completes bundle.
- **2025-10-10 07:32 UTC:** Captured Shopify admin audit export confirming QA/Product/Support invites accepted (`store-invite-audit-20251010T0730Z.md`).
- **2025-10-10 07:35 UTC:** Broadcast install instructions to QA/Product/Support (`install_broadcast_2025-10-10T073500Z.md`); readiness docs and Linear updated—DEPLOY-147 now blocked only on smoke latency proof.
- **2025-10-10 07:36 UTC:** Logged Linear note on DEPLOY-147 confirming credentials/invites complete and latency evidence outstanding (`DEPLOY-147-linear-comment-20251010T0736Z.md`).
- **2025-10-10 17:30 UTC:** Followed direction `docs/directions/integrations.md:24-27`; pinged deployment to close `DEPLOY-147`, deliver Shopify shop access details, and confirm readiness dashboard updates. Awaiting acknowledgment; escalate to manager if no response by 2025-10-10 19:00 UTC.
- **2025-10-10 19:05 UTC:** No deployment response yet; documented pending follow-up and preparing escalation note for manager per direction if silence persists.
- **2025-10-10 22:30 UTC:** Supabase staging `DATABASE_URL` confirmed delivered (vault + GitHub). Next step: coordinate with QA to start migrations once Shopify credentials land; DEPLOY-147 closure remains blocking store access.
- **2025-10-10 22:45 UTC:** Direction re-read; coordinating with reliability to execute MCP staging auth helper and capture credential bundle + store invite details before closing DEPLOY-147 and distributing to deployment/QA/product (resolved 07:32 UTC).
- **2025-10-10 22:55 UTC:** Verified staging Shopify vault entries (domain, API key, secret, CLI token) and captured HTTP 200 `curl -I https://hotdash-staging.fly.dev/app?mock=1` evidence for readiness artifacts; awaiting credential bundle before notifying QA/product (broadcast sent 07:35 UTC).
- **2025-10-10 04:22 UTC:** Drafted DEPLOY-147 follow-up (`artifacts/integrations/shopify/2025-10-10/deploy_followup_draft.md`) requesting bundle delivery/ETA before 09:00 UTC to unblock readiness.
- **2025-10-10 06:26 UTC:** Refreshed DEPLOY-147 follow-up with latest Fly host evidence (`curl_hotdash-staging_2025-10-10T06-20-00Z.log`) and noted need to broadcast install instructions once smoke goes green per direction update.
- **2025-10-10 06:34 UTC:** Captured HTTP 410 for `https://hotdash-staging.fly.dev/app?mock=0` (`curl_hotdash-staging_2025-10-10T06-34-12Z_mock0.log`) indicating live path still blocked pending DEPLOY-147 secrets.
- **2025-10-10 06:36 UTC:** Prepared install broadcast template (`artifacts/integrations/shopify/2025-10-10/install_broadcast_template.md`) so QA/product/support can be notified immediately once DEPLOY-147 closes and smoke goes green.
