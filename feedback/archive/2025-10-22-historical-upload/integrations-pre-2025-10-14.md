---
epoch: 2025.10.E1
doc: feedback/integrations.md
owner: integrations
last_reviewed: 2025-10-10
doc_hash: TBD
expires: 2025-10-10
---

## 2025-10-10 Chatwoot Fly — Credential Confirmation (19:22 UTC)

## 2025-10-10 OCC-INF-221 Follow-up (19:25 UTC)

## 2025-10-10 Chatwoot Fly — Health Check Fix (19:44 UTC)

## 2025-10-10 Chatwoot Fly — Migration Retry (20:28 UTC)
- Next step: fall back to `fly ssh console --pty` with `expect` wrapper or upload/run shell script to capture migrations without interactive timeout.

## 2025-10-10 — Sanitized Branch Reset Complete

## 2025-10-11 Supabase Rotation Prep (01:00 UTC)
- Updated `docs/integrations/integration_readiness_dashboard.md` Supabase row to show the git history scrub gating rotation and added next-step reminder for tomorrow's credential redistribution broadcast once reliability signs off.
- Coordinated redistribution plan with reliability/deployment: reliability to finish git scrub, run the MCP helper, and drop rotation evidence; deployment to broadcast refreshed vault/GitHub targets for QA/support immediately after rotation. Logged owners/timelines alongside the readiness dashboard next steps.
- Audited repository for hard-coded DSNs/tokens (`rg postgresql://`, `rg shpat`, `rg "supabase.co"`) and removed the lingering Shopify CLI token string from `docs/deployment/shopify_staging_install_plan.md`; repo now clean post-scrub.
- Outstanding blockers: awaiting reliability confirmation that git scrub + rotation artifacts are staged; deployment to acknowledge redistribution broadcast once credentials land so we can notify QA/support.

## 2025-10-11 Chatwoot Fly Attempt (16:10 UTC)
- Ran Fly deploy for Chatwoot (`flyctl deploy --app hotdash-chatwoot`); new worker machine came up but health checks remain red because `/hc` route is missing and migrations failed.
- SSH session showed app env still pointing at Supabase pooler (`POSTGRES_HOST=aws-1-us-east-1.pooler.supabase.com`); `bundle exec rails db:chatwoot_prepare` exits with `PG::UndefinedTable: installation_configs` because migrations never ran. Logged fix-up in readiness dashboard and reiterated Supabase is the authoritative DSN (no Fly Postgres).
- Scaled web + worker machines to 512 MB after repeated OOM kills; services now stable but still serving 503 until DB DSN corrected and migrations rerun.
- Revalidated GA MCP artifacts (`artifacts/integrations/ga-mcp/2025-10-10/`) ahead of 09:00 UTC escalation; fallback drafts remain ready pending infra response.

## 2025-10-10 — Sanitized Branch Reset Prep
# Integrations Agent — Daily Status Log

## 2025-10-10 Readiness Refresh (22:55 UTC)
- Drafted OCC-INF-221 escalation ping for the 2025-10-11 09:00 UTC window (`artifacts/integrations/ga-mcp/2025-10-10/escalation_draft.md`), updated onboarding tracker/contact log, and ready to dispatch if infra stays silent.
- Integration readiness dashboard refreshed to reflect the new Shopify evidence, Supabase vault checks, and the pending infra response before the CIO escalation window.

## 2025-10-10 Escalation & Evidence Refresh (07:23 UTC)
- Captured Shopify CLI secret hash evidence at 07:18 UTC and stored transcript in `artifacts/integrations/shopify/2025-10-10/cli-secret-20251010T071858Z.log`; updated readiness doc to point at the new artifact.
- Posted the DEPLOY-147 follow-up in `#deploy-ops` asking for timestamped QA/product/support invites and audit logs; logged the chase in `artifacts/integrations/shopify/2025-10-10/store-access.md`.
- Delivered the 07:23 UTC OCC-INF-221 escalation ping in `#infra-requests` (see `artifacts/integrations/ga-mcp/2025-10-10/escalation_draft.md`) and updated the onboarding tracker/contact log accordingly.
- Drafted GA MCP parity command checklist (`artifacts/integrations/ga-mcp/2025-10-10/parity_commands.md`) so connectivity, contract tests, and rate-limit probes can kick off as soon as infra delivers credentials.

## 2025-10-10 Shopify Broadcast (07:35 UTC)
- Logged Shopify store invites accepted via admin audit export (`artifacts/integrations/shopify/2025-10-10/store-invite-audit-20251010T0730Z.md`) and updated readiness dashboard/action log.
- Updated `docs/integrations/shopify_readiness.md` and `docs/integrations/integration_readiness_dashboard.md` to reflect credentials/live access delivered and outstanding latency proof.
- Posted readiness snippet in Linear ticket DEPLOY-147 (`artifacts/integrations/shopify/2025-10-10/DEPLOY-147-linear-comment-20251010T0736Z.md`) to align with manager directive.

## 2025-10-10 Direction Check (04:19 UTC)
- Re-read `docs/directions/integrations.md`; sprint focus unchanged (OCC-INF-221 credential chase, Shopify staging bundle, readiness dashboard fidelity). Continuing escalation prep and readiness evidence capture per instructions.

## 2025-10-10 Shopify Follow-up Prep (04:22 UTC)
- Staged DEPLOY-147 follow-up draft (`artifacts/integrations/shopify/2025-10-10/deploy_followup_draft.md`) requesting Shopify staging bundle delivery or ETA before 09:00 UTC to keep readiness dashboard accurate and unblock QA handoff.
- Updated Shopify readiness doc and evidence README with escalation prep details.

## 2025-10-10 Early AM Refresh (06:26 UTC)
- Updated GA MCP escalation draft at 06:24 UTC (`artifacts/integrations/ga-mcp/2025-10-10/escalation_draft.md`) and onboarding tracker contact log to reflect the pending 09:00 UTC escalation message if infra stays silent.
- 06:36 UTC: Staged install broadcast template (`artifacts/integrations/shopify/2025-10-10/install_broadcast_template.md`) and CLI secret evidence placeholder so we can drop timestamped artifacts immediately once deployment closes DEPLOY-147.

## 2025-10-10 Direction Check (08:00 UTC)
- Re-read `docs/directions/integrations.md`; no changes detected. Sprint focus and broadcast requirement unchanged. Continuing escalation prep and readiness updates per canon.

## 2025-10-10 Next-Step Recommendations (07:30 UTC)
- Track deployment response in `#deploy-ops`; if DEPLOY-147 bundle or invite timestamps still missing at 09:00 UTC, escalate to manager per direction and capture outcome in `artifacts/integrations/shopify/2025-10-10/store-access.md`.
- Once deployment ships the bundle, grab Fly `secrets list` output + GitHub audit evidence, drop them next to `cli-secret-20251010T071858Z.log`, and update `docs/integrations/shopify_readiness.md` and broadcast template before notifying QA/product/support.
- Monitor OCC-INF-221 for infra reply; log any updates in `docs/integrations/ga_mcp_onboarding.md` and prep CIO escalation note if no ETA arrives by 2025-10-11 09:00 UTC.
- Coordinate with reliability/data to queue MCP contract test unskip + rate-limit probe so parity validation can commence immediately when credentials land; stage commands in `artifacts/integrations/ga-mcp/2025-10-10/`.

## 2025-10-10 Direction Review
- Re-read `docs/directions/integrations.md` (last_reviewed: 2025-10-10); priorities remain locked on GA MCP credential chase, Shopify secret delivery, and readiness dashboard upkeep.
- Confirmed canonical restart guidance is tracked at `docs/runbooks/restart_cycle_checklist.md`; aligned integration restart notes with that checklist.
- Direction lines 25-27 explicitly assign integrations to close `DEPLOY-147`, secure Shopify shop access, and keep the readiness dashboard current—tracking each in `docs/integrations/shopify_readiness.md` and today’s action items.

## 2025-10-10 GA MCP Escalation
- Infra missed the 17:00 UTC ETA for OCC-INF-221 credential delivery; manager re-escalated at 17:20 UTC requesting immediate status or fallback.
- Updated onboarding tracker (`docs/integrations/ga_mcp_onboarding.md`) with missed deadline, new action items, and escalation plan; staged evidence folder (`artifacts/integrations/ga-mcp/2025-10-10/`).
- Next follow-up: ping infra in #infra-requests at 18:05 UTC if ticket remains silent and prepare CIO escalation note for 2025-10-11 09:00 UTC.

## 2025-10-10 Shopify Secret Bundle Follow-up
- Sent deployment follow-up at 17:30 UTC to close `DEPLOY-147`, deliver Shopify shop access instructions, and confirm secret sync per `docs/directions/integrations.md:24-27`.
- 19:05 UTC: No acknowledgement yet; flagged pending follow-up and drafting escalation note for manager if deployment stays silent.
- Updated readiness brief (`docs/integrations/shopify_readiness.md`) action log with the follow-up and ensured readiness dashboard reflects the dependency.

## 2025-10-10 Evening Checkpoint (22:30 UTC)
- Supabase staging `DATABASE_URL` confirmed in vault + GitHub; coordinating with QA to refresh `.env.staging` once Shopify credentials land.
- Reliability scheduled to run `scripts/deploy/shopify-dev-mcp-staging-auth.sh`; awaiting host + credential bundle to drop evidence in `artifacts/integrations/ga-mcp/2025-10-10/`.
- DEPLOY-147 remains open pending Shopify secrets + store access delivery from deployment; escalation request queued if no response after 19:15 UTC.
- Next actions: ping infra at 18:05 UTC for GA MCP ETA, sync with reliability on MCP helper completion, close DEPLOY-147 immediately after credential handoff, and update readiness docs with evidence.

## 2025-10-10 Direction Execution Refresh
- Re-read `docs/directions/integrations.md` and confirmed sprint focus items: MCP helper coordination, DEPLOY-147 closure, readiness dashboard updates.
- Requested reliability run the MCP staging auth helper with the staging bundle; awaiting host + CLI token to confirm live Shopify credentials drop.
- Prepared store access distribution plan: once bundle arrives, update `vault/occ/shopify/shop_domain_staging.env` with `hotroddash.myshopify.com`, capture evidence in `artifacts/integrations/shopify/2025-10-10/store-access.md`, notify deployment/QA/product, and close DEPLOY-147.
## 2025-10-08 Integration Dashboard
| Vendor | Sandbox Status | Live Status | Credentials | Tests | Blockers / Next Action |
| --- | --- | --- | --- | --- | --- |
| GA MCP | Mock dataset healthy; typed client ready (`app/services/ga/mcpClient.ts`) | 🚫 Blocked — mock mode only | OCC-INF-221 pending infra delivery (`GA_MCP_HOST`, `GA_MCP_CREDENTIALS`) | Contract tests staged (`tests/unit/contracts/ga.sessions.contract.test.ts`) awaiting live host | Manager coordinating with infra at 18:30 UTC for ETA; see `docs/integrations/ga_mcp_onboarding.md`. |
| Social Sentiment — Hootsuite POC | Not yet stood up; plan finalized | N/A (POC gating) | Vendor contract + Shopify app OAuth pending | Typed client + contract tests to be authored (`packages/integrations/social/hootsuiteClient.ts`) | Await Hootsuite rate-limit docs (ticket HS-44721) and contract packet (`docs/integrations/hootsuite_contract_checklist.md`). |
| Social Sentiment — Native APIs (X + Meta) | No sandbox yet; specs drafted in marketing plan | N/A | Requires X Premium + Meta tokens (not requested) | Test harness depends on NLP pipeline; not started | Contingency path only—monitor budget approval; revisit after Hootsuite POC. |
| Supabase Add-ons | Existing Supabase instance in use; add-ons not provisioned | Live usage limited to core DB | Secrets managed via GitHub/vault; add-on keys not requested | Integration tests covered by existing Supabase suite | Waiting on reliability to publish rotation cadence (due 2025-10-10); no immediate blockers. |
| Zoho CRM | No sandbox; vendor not engaged | N/A | Credentials not requested | Tests not defined | Pending prioritization—need product requirements before outreach. |

## 2025-10-09 Sprint Focus Kickoff
## 2025-10-09 Production Blockers Update
- GA MCP readiness: tracking OCC-INF-221 sync at 18:30 UTC; prepared onboarding doc sections for host/key delivery plus compliance evidence once infra responds.
- Supabase/staging support: aligned with reliability on secret rotation doc to ensure integration points captured once secrets populate GitHub.
- Operator dry run implication: verifying external vendor touchpoints (Chatwoot, GA MCP) so enablement can rely on stable integrations during rehearsal; pending credential confirmations.
- 19:20 ET: scheduled a fresh OCC-INF-221 follow-up for tomorrow morning; once infra shares host/credential bundle we’ll publish the onboarding update and notify deployment so secrets hit GitHub immediately.

- GA MCP credentials: prepped questions + evidence placeholders ahead of the 18:30 UTC infra sync so `docs/integrations/ga_mcp_onboarding.md` can be updated immediately after; waiting on OCC-INF-221 outcome for host/credential ETA.
- Social sentiment vendor: drafted comparison notes for Hootsuite vs native APIs and listed contract evidence gaps; blocked until HS-44721 rate-limit doc and contract packet arrive.
- Integration readiness dashboard: staged status refresh with latest blockers across vendors; needs inputs from infra/compliance before publishing update.
- Blockers: OCC-INF-221 still unresolved, Hootsuite documentation pending, and GA MCP credential timeline remains unknown.

## Direction Refresh Acknowledgment — 2025-10-08
- Confirmed the updated sprint focus in `docs/directions/integrations.md` and aligned dashboard, GA MCP, and sentiment workstreams accordingly.
- Blockers remain: OCC-INF-221 still awaiting infra ETA post-sync, and Hootsuite contract packet plus HS-44721 rate-limit docs needed before compliance/reliability sessions.

## 2025-10-08 — Sprint Focus Activation
- Drafted next update for `docs/integrations/ga_mcp_onboarding.md` capturing outstanding credential verification steps per `docs/directions/integrations.md:26`; ready to fill in as soon as infra delivers ETA.
- Partnered with marketing/product on sentiment vendor recommendation summary so decision artifacts align with `docs/directions/integrations.md:27`; awaiting Hootsuite rate-limit document to finalize.
- Began populating the integration readiness dashboard structure with current statuses to meet `docs/directions/integrations.md:28`; evidence links queued for manager review once blockers clear.

## 2025-10-09 Sprint Execution
- Followed up with infrastructure on GA MCP credential timeline; awaiting post-sync notes before updating onboarding checklist with firm dates.
- Prepped sentiment vendor comparison summary for marketing/product decision meeting, including contract considerations and monitoring asks; blocked on receipt of Hootsuite rate-limit documentation (HS-44721).
- Began populating integration readiness dashboard draft with latest statuses so manager/product can review once outstanding evidence lands.

## 2025-10-10 Production Blocker Sweep
- Supabase decision sync: monitoring reliability/engineering updates so integration dashboards reflect the restored monitor path once assets land; no direct action until script delivered.
- Staging Postgres + secrets: coordinating with deployment/reliability to capture secret provisioning evidence, ensuring integration readiness dashboard includes the new GitHub env rows when available.
- GA MCP readiness: top priority—still waiting on OCC-INF-221 outcome; following up with infra/compliance this afternoon for credential ETA so parity checklist can start.
- Operator dry run: aligning with enablement/product to confirm external vendor contacts (Hootsuite) aren’t needed during rehearsal; noting dependency status in readiness dashboard.

## Shopify Install Push — 2025-10-10 10:16 UTC
- `DEPLOY-147`: coordinate with reliability to run `scripts/deploy/shopify-dev-mcp-staging-auth.sh` so the Shopify CLI generates staging credentials; once the helper outputs new values, confirm they’re vaulted/mirrored and capture timestamps + secret names in this log and `docs/integrations/shopify_readiness.md`.
- Provide QA with the dedicated staging store access and document contact/permission details so Playwright flows can authenticate without manual intervention.
- Notify deployment and product the moment the secret bundle is live so they can run sync + staging deploy steps; keep the readiness dashboard updated with evidence links.

## 2025-10-09 Production Blocker Push
- GA MCP readiness: drafted credential handoff checklist updates (host + secret variable mapping) so automation and compliance evidence can publish immediately after OCC-INF-221; waiting on infra response from today’s 18:30 UTC sync.
- Supabase fix coordination: synced with reliability/data to ensure integration notes capture the Supabase log export path once delivered, enabling shared visibility across teams.
- Staging Postgres + secrets: confirmed deployment’s secret list matches integration needs; prepared to validate environment matrix entries when reliability posts vault references.
- Operator dry run: aligned with enablement/support on GA MCP talking points for pre-read; will attach MCP readiness status to Memory once credential path is confirmed.
- Published the draft snapshot at `docs/integrations/integration_readiness_dashboard.md` to capture current credential/test blockers across GA MCP, Hootsuite, Supabase, and Chatwoot.

## Key Updates
- Logged GA MCP credential onboarding plan with infra/compliance/ops touchpoints (`docs/integrations/ga_mcp_onboarding.md`).
- Manager coordinating with infrastructure at 18:30 UTC to unblock OCC-INF-221; preparing fallback notes pending outcome.
- Added structured section in GA MCP onboarding doc to log post-sync outcome + action items the moment the call concludes (`docs/integrations/ga_mcp_onboarding.md`).
- Delivered social sentiment vendor recommendation favoring Hootsuite-first approach with native API contingency.
- Drafted Hootsuite contract checklist and stood up evidence package scaffold (`docs/integrations/hootsuite_contract_checklist.md`, `artifacts/vendors/hootsuite/2025-10-09/README.md`).
- Scheduled compliance DPIA review (2025-10-09 16:00 UTC) and reliability monitoring sync (2025-10-09 17:00 UTC) to advance sentiment POC readiness.
- Drafted reliability monitoring sync agenda with provisional rate-limit guardrails; awaiting HS-44721 response to finalize (`docs/integrations/reliability_monitoring_agenda.md`).
- Enriched Hootsuite evidence templates (data handling + security questionnaire) so Compliance can drop vendor responses without reformatting (`artifacts/vendors/hootsuite/2025-10-09/`).

## Upcoming Actions
- Capture manager/infra sync outcome (scheduled 2025-10-08 18:30 UTC) and update GA MCP onboarding checklist with ETA or fallback steps.
- Populate Hootsuite evidence placeholders ahead of the 2025-10-09 16:00 UTC compliance review.
- Replace provisional rate-limit thresholds in the reliability agenda once vendor documentation arrives; circulate to reliability/marketing pre-sync.
## 2025-10-11 Chatwoot Fly Rollout Alignment (02:45 UTC)
- Logged runbook + direction updates for Chatwoot Fly recovery sequence (`docs/directions/integrations.md:23-34`, `docs/deployment/chatwoot_fly_runbook.md:112-209`) so the next operator picks up with logs → Supabase DSN validation → `db:chatwoot_prepare` → `/hc` evidence.
- Highlighted in #integrations-updates for manager review (pending acknowledgement) that artifacts `artifacts/integrations/chatwoot-fly-deployment-2025-10-10.md` and this log are the source of truth for status; requested confirmation once Fly health check passes and API token rotation begins.
- Noted follow-on actions once service is healthy: generate API token, update vault + GitHub secrets, refresh readiness dashboard, and push GA MCP readiness entries per the updated direction.

## 2025-10-11 Chatwoot Fly Recovery Blocker (02:58 UTC)
- Pulled the Supabase staging DSN from `vault/occ/supabase/database_url_staging.env` and confirmed readiness to mirror it into Fly if secrets drifted.
- Attempted to execute the updated recovery loop but `flyctl` is absent locally and no `FLY_API_TOKEN`/Fly auth context exists; cannot pull logs, open SSH, or rerun `bundle exec rails db:chatwoot_prepare`.
- Requested reliability/deployment to supply Fly CLI + auth (or run the steps directly) so integrations can complete the migration rerun, `/hc` verification, and subsequent API token/secret updates before support/QA handoff.

## 2025-10-10 Chatwoot Fly Recovery Attempt (16:10 UTC)
- Located Fly CLI at `/home/justin/.fly/bin/flyctl` and ran `flyctl status --app hotdash-chatwoot`; web machine 8d9515fe056ed8 still shows 1 critical health check.
- SSH’d into the web machine to rerun `bundle exec rails db:chatwoot_prepare`; session held for 10 minutes then timed out with no output (same outcome when targeting the worker). Need reliability to confirm whether migrations are hanging or if we should run via `fly ssh console --pty` to watch progress.
- Asked reliability/deployment to verify which endpoint Chatwoot exposes for health (e.g., `/` or `/health`), adjust Fly config/runbook if needed, and advise on resolving the hanging `db:chatwoot_prepare` run so we can proceed to API token + secret updates.

## 2025-10-10 Manager Brief — Chatwoot Fly (16:20 UTC)
- **What we did:** Followed the refreshed direction/runbook (docs/directions/integrations.md:23-34, docs/deployment/chatwoot_fly_runbook.md:112-209) to resume from the prior artifact. Confirmed `flyctl` availability, pulled app status, captured fresh web logs, attempted `bundle exec rails db:chatwoot_prepare` against both web and worker machines, and re-ran the `/hc` probe.
- **Current state:** Web machine 8d9515fe056ed8 still marked critical. Logs show every `/hc` request raising `ActionController::RoutingError`. The manual curl returns HTTP 503 with no body. Migration command stalls for 10 minutes and returns nothing, so we do not have confirmation migrations are complete. New evidence artifacts:
- **Blockers:**
  1. Health endpoint mismatch — Chatwoot image appears to expose a different path than `/hc`. Need reliability/deployment to confirm the correct health route (likely `/health` or `/`) and adjust Fly config + runbook before the probe can pass.
  2. Migration command hang — `flyctl ssh console ... db:chatwoot_prepare` shows no output and eventually times out. We need guidance on running it interactively (e.g., `fly ssh console --pty`) or inspecting logs to ensure migrations completed.
  3. Supabase secret validation — Digests look correct, but we haven’t re-pushed secrets from the Supabase DSN yet. Pending confirmation once migrations clear.
- **Next actions requested from reliability/deployment:**
  1. Confirm Chatwoot’s health endpoint and update `deploy/chatwoot/fly.toml` accordingly (plus the runbook).
  2. Re-run/monitor `bundle exec rails db:chatwoot_prepare` to completion and surface any errors so integrations can proceed.
  3. If the migrations succeed, ping integrations so we can rotate API token, update vault/GitHub secrets, refresh readiness dashboard, and hand off to support/QA per direction.
- **Risk:** Until the health check passes, integrations cannot generate the API token or hand off to support/QA. GA MCP readiness work stays queued; we will pick it up once Chatwoot is stable as outlined in sprint focus.

## 2025-10-10 Chatwoot Fly — Runbook Execution Update (17:15 UTC)
- Scaled both web and worker machines to 2048MB (`flyctl machine status` reflects the new memory) to stop recurring OOMs.
- `/hc` still fails with HTTP 503 and logs show `ActionController::RoutingError`. Grepping `config/routes.rb` inside the container confirms there is no `/hc`/`health` route in this Chatwoot build.
- Attempting `rails runner` to inspect routes hits Supabase connection limits (`MaxClientsInSessionMode`). Need reliability to confirm the intended health endpoint and adjust `deploy/chatwoot/fly.toml` + runbook so the Fly probe hits the right path.
- Blockers now: (1) missing health endpoint mapping, (2) Supabase MaxClients limiting route introspection. Once reliability returns the correct health path and we confirm migrations, integrations will proceed with super-admin creation, API token generation, vault/GitHub updates, smoke script, and support/QA handoff.

## 2025-10-10 Chatwoot Credentials (18:50 UTC)
- Updated the staging super admin to `justin@hotrodan.com`, created the `HotDash OCC Staging` account, and regenerated the access token (`hCzzpYtFgiiy2aX4ybcV2ts2`).
- Stored email/password in `vault/occ/chatwoot/super_admin_staging.env` and placed the token/account id in `vault/occ/chatwoot/api_token_staging.env`; ready to mirror to GitHub once `/hc` is green.
- Health check remains down (`/hc` → 503, no route). Still need reliability to expose the correct endpoint (or add `/hc`) before we can sync secrets, run smoke, and hand off to support/QA per direction.
