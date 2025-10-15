# Integration Readiness Dashboard — Draft 2025-10-10

| Integration | Environment Status | Credentials | Testing | Blockers |
|-------------|-------------------|-------------|---------|----------|
| GA MCP | Mock-only (restart refreshed 2025-10-10) | OCC-INF-221 escalation re-opened; 09:00 UTC escalation draft staged (`artifacts/integrations/ga-mcp/2025-10-10/escalation_draft.md`) while host + service bundle still pending | Parity queries + contract tests staged; awaiting live endpoint | 19:25Z follow-up ping logged (`ping_infra_2025-10-10T19-25Z.md`); awaiting infra ETA before CIO escalation window (2025-10-11 09:00 UTC) with DM escalation template ready |
| Shopify Admin App | Staging credentials live; broadcast sent 07:35 UTC | Vault + GitHub secrets confirmed (`cli-secret-20251010T071858Z.log`); store invites accepted (`store-invite-audit-20251010T0730Z.md`) | QA/Product/Support action items broadcast; waiting on sub-300 ms smoke to green-light contract tests | DEPLOY-147 open only for smoke latency proof (`...?mock=0` <300 ms). Latest curls at 19:26Z added (`curl_mock0_2025-10-10T19-26-34Z.log` returns 410 despite 173 ms latency). |
| Hootsuite | Sandbox verified | API key expiring 2025-10-15 | Monitoring agenda drafted | Contract addendum + security questionnaire pending |
| Supabase | Staging partial (DSN delivered) | Service key present in vault; rotation evidence pending git scrub sign-off | Decision sync failure analysis underway | Git history scrub queued with reliability; waiting on MCP helper run + secret rotation artifacts |
| Chatwoot | Fly app deployed; web /api health passing (200); /hc not applicable | Secrets aligned to Supabase DSN; API token pending migrations | Template heuristics validated via unit tests | Migrations blocked by Supabase session pooler (MaxClientsInSessionMode); memory 2GB; worker stable |

## Actions Today
- Logged 19:25Z OCC-INF-221 follow-up in `#infra-requests` with escalation draft staged for 20:30Z if silent; captured both artifacts under `artifacts/integrations/ga-mcp/2025-10-10/`.
- Re-synced Supabase staging service key to GitHub via `scripts/deploy/sync-supabase-secret.sh` (see `gh_secret_supabase_service_key_2025-10-10T19-26Z.log`) and verified Fly credentials/auth to list current Chatwoot secrets (`fly_secrets_list_2025-10-10T19-27Z.log`).
- Captured HTTP 200 `curl -I https://hotdash-staging.fly.dev/app?mock=1` evidence (artifacts at 02:50Z, 06:20Z, and 19:26Z) and HTTP 410 for `...?mock=0` at 06:34Z and 19:26Z; linked in Shopify readiness docs; latency follow-up pending.
- Verified `vault/occ/shopify/*.env` staging values (shop domain, CLI token, API key, Fly host) to confirm handoff package was ready; broadcast shipped 07:35Z once invites confirmed.
- Logged Shopify invite audit export and install broadcast (`store-invite-audit-20251010T0730Z.md`, `install_broadcast_2025-10-10T073500Z.md`) so QA/Product/Support can execute readiness tasks.
- Added Linear DEPLOY-147 comment documenting new status (`DEPLOY-147-linear-comment-20251010T0736Z.md`).
- Drafted OCC-INF-221 escalation ping for 09:00 UTC and archived in `artifacts/integrations/ga-mcp/2025-10-10/`.
- Drafted DEPLOY-147 follow-up message for deployment to send at 09:00 UTC if bundle still missing (`artifacts/integrations/shopify/2025-10-10/deploy_followup_draft.md`, refreshed 06:26 UTC; superseded by 07:32 delivery).
- Ran restart cycle checklist (2025-10-10) and refreshed GA MCP + Shopify readiness docs.
- Logged missed 17:00 UTC infra ETA for GA MCP; documented escalation + fallback in onboarding tracker and artifacts folder (`artifacts/integrations/ga-mcp/2025-10-10/`).
- Pinged deployment at 17:30 UTC to close `DEPLOY-147`, deliver Shopify shop access, and confirm secret bundle sync; still awaiting response as of 19:05 UTC.
- Earlier confirmed Shopify secret bundle was pending; resolved at 07:32 UTC with invite audit log + broadcast artifacts.
- Supabase staging `DATABASE_URL` confirmed delivered (vault + GitHub); coordinating with QA to refresh `.env.staging` once Shopify secrets land.
- Drafted follow-up questions for Hootsuite security packet; awaiting legal review before sending.
- Coordinated with reliability on Supabase secret rotation timeline to align with decision sync remediation plan.

## Next Steps
- Capture infra response or escalate to CIO queue if GA MCP credentials still blocked by 2025-10-11 09:00 UTC.
- Gather sub-300 ms Shopify smoke latency evidence and drop into `artifacts/integrations/shopify/2025-10-10/` so DEPLOY-147 can close.
- Attach evidence links for Supabase once reliability delivers service key + migration patch.
- Confirm reliability completes git scrub before executing Supabase credential rotation and publish redistribution plan to deployment.
- Track QA/Product/Support execution of the install broadcast tasks and log outcomes in respective feedback docs.
- Ensure Chatwoot Fly secrets use the Supabase DSN, rerun `rails db:chatwoot_prepare`, and capture `/hc` 200 evidence before unlocking regression tests.

## Actions Update — 2025-10-11 03:27 UTC

### 🔄 Manager Direction Alignment Completed
- **Updated direction received**: Aligned task list with local execution policy
- **Key changes**: Shopify MCP validation required, secrets cleanup (no embed/session tokens), Chatwoot scope clarified
- **Evidence path**: `feedback/integrations.md` updated with direction acknowledgment

### 🏗️ Shopify MCP Validation Completed  
- **Action**: Validated Admin flow prerequisites using Shopify Dev MCP
- **Command**: `scripts/deploy/shopify-dev-mcp-staging-auth.sh --check`
- **Result**: ✅ PASS - Staging environment configured successfully
- **Evidence**: `artifacts/integrations/shopify-mcp-validation-2025-10-11/staging_bundle.env`
- **Shop context**: hotroddash.myshopify.com confirmed active

### 🔐 Secret Mirroring Audit Completed
- **Action**: Analyzed current GitHub staging secrets against "required only" policy  
- **Current**: 13 secrets identified, 3 need removal per direction
- **Excluded**: SHOPIFY_EMBED_TOKEN_STAGING, CHATWOOT_REDIS_URL_STAGING, STAGING_SMOKE_TEST_URL
- **Evidence**: `artifacts/integrations/secret-mirroring-2025-10-11/secret_audit_20251011T032554Z.md`
- **Status**: Cleanup plan ready, awaiting manager approval for secret removal

### 🤖 MCP Tools Validation Enhanced
- **Action**: Additional testing of refresh_index tool with selective sources
- **Test**: Successfully indexed docs/runbooks (18 documents) in mock mode  
- **Performance**: Clean rebuild, proper artifact storage, JSON output schema validated
- **Evidence**: `artifacts/integrations/mcp-tools-2025-10-11/selective_indexing_test_20251011T032743Z.log`
- **Tools status**: 1/3 operational, 2/3 pending AI agent implementation

### 📊 Current Integration Status Summary

| Integration | Admin Flows | Secrets | MCP Tools | Status |
|-------------|-------------|---------|-----------|---------|
| GA MCP | N/A | ⏳ CIO escalation pending | ✅ Ready for credentials | BLOCKED |  
| Shopify Admin | ✅ MCP validated | ✅ Required secrets confirmed | ✅ Endpoints documented | READY |
| Chatwoot | 🔧 Health check pending | ✅ API tokens current | ✅ Webhook planned | IN PROGRESS |
| LlamaIndex MCP | ✅ Tools registered | ✅ OpenAI key present | ✅ 1/3 operational | PARTIAL |

### ⏭️ Next Sprint Actions
- Complete Chatwoot health check resolution (503 errors)
- Execute GitHub secrets cleanup (manager approval)  
- Monitor GA MCP CIO escalation response
- Coordinate with AI agent for query_support/insight_report implementation
