# Integration Readiness Dashboard — Draft 2025-10-10

| Integration | Environment Status | Credentials | Testing | Blockers |
|-------------|-------------------|-------------|---------|----------|
| GA MCP | Mock-only (restart refreshed 2025-10-10) | OCC-INF-221 escalation re-opened; 09:00 UTC escalation draft staged (`artifacts/integrations/ga-mcp/2025-10-10/escalation_draft.md`) while host + service bundle still pending | Parity queries + contract tests staged; awaiting live endpoint | Infra missed 17:00 UTC ETA; awaiting updated ETA before CIO escalation window (2025-10-11 09:00 UTC), fallback messaging staged |
| Shopify Admin App | Staging credentials live; broadcast sent 07:35 UTC | Vault + GitHub secrets confirmed (`cli-secret-20251010T071858Z.log`); store invites accepted (`store-invite-audit-20251010T0730Z.md`) | QA/Product/Support action items broadcast; waiting on sub-300 ms smoke to green-light contract tests | DEPLOY-147 open only for smoke latency proof (`...?mock=0` rim <300 ms) |
| Hootsuite | Sandbox verified | API key expiring 2025-10-15 | Monitoring agenda drafted | Contract addendum + security questionnaire pending |
| Supabase | Staging partial (DSN delivered) | Service key present in vault; rotation evidence still pending | Decision sync failure analysis underway | Waiting on reliability to run MCP helper + finalize secret rotation artifacts |
| Chatwoot | Sandbox live | Token rotation scheduled 2025-10-15 | Template heuristics validated via unit tests | Staging conversations required for full regression |

## Actions Today
- Captured HTTP 200 `curl -I https://hotdash-staging.fly.dev/app?mock=1` evidence (artifacts at 02:50Z and refreshed 06:20Z) and HTTP 410 for `...?mock=0` at 06:34Z; linked in Shopify readiness docs; latency follow-up pending.
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
- Track QA/Product/Support execution of the install broadcast tasks and log outcomes in respective feedback docs.
