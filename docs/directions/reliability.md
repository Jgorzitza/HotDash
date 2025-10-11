---
epoch: 2025.10.E1
doc: docs/directions/reliability.md
owner: manager
last_reviewed: 2025-10-12
doc_hash: TBD
expires: 2025-10-19
---
# Reliability — Direction (Operator Control Center)
## Canon
- North Star: docs/NORTH_STAR.md
- Git & Delivery Protocol: docs/git_protocol.md
- Direction Governance: docs/directions/README.md
- MCP Allowlist: docs/policies/mcp-allowlist.json
- Credential Map: docs/ops/credential_index.md
- Agent Launch Checklist (manager executed): docs/runbooks/agent_launch_checklist.md

> Manager authored. Reliability team must not edit/create direction docs; escalate changes via manager with supporting evidence.

- Own CI/CD health: ensure tests.yml + evidence.yml stay green; unblock agents on pipeline failures within 1h.
- Harden infrastructure configs (Shopify app, Supabase, MCP hosts) with secret rotation and least-privilege policies.
- Monitor performance budgets (tile loader < 300ms mocked, < 800ms live) using synthetic checks logged in feedback/reliability.md.
- Manage disaster readiness: weekly backup drills for Prisma db + Supabase tables; document restore steps.
- Keep logging/observability stack consistent (pino formatting, structured errors) and verify ingestion to APM. Maintain the Supabase edge function (`supabase/functions/occ-log`) and local log tailing script.
- Coordinate with deployment on Fly-specific requirements (docs/dev/fly-shopify.md): ensure `fly.toml` and Fly secrets contain Shopify env vars, and production scaling (`min_machines_running`, `auto_stop_machines`) meets Shopify performance expectations.
- Approve deployment windows and keep runbooks updated under docs/runbooks/ with evidence of last exercise.
- Stack guardrails: enforce `docs/directions/README.md#canonical-toolkit--secrets` (Supabase-only Postgres, Chatwoot on Supabase, React Router 7, OpenAI + LlamaIndex). Reference Shopify docs: docs/dev/appreact.md, docs/dev/authshop.md, docs/dev/session-storage.md for current guidance. PRs that introduce alternate databases or direct Redis usage in app code will be blocked by the Canonical Toolkit Guard.
- Consult Shopify API references when debugging integrations (docs/dev/admin-graphql.md, docs/dev/storefront-mcp.md) so infra changes track the latest platform requirements.
- Start executing assigned tasks immediately; log progress and blockers in `feedback/reliability.md` without waiting for additional manager approval.

## Current Sprint Focus — 2025-10-12
Work every open infrastructure blocker to completion—own the item until evidence is delivered. Execute the tasks below in order and log progress in `feedback/reliability.md`. Every blocker update must include the command you ran, the timestamp, and the resulting log/output; only escalate after two documented attempts.

1. **Local Supabase readiness**
   - Ensure every developer and CI runner uses the Supabase Postgres datasource. Document the steps (`supabase start`, `.env.local`) in `feedback/reliability.md` and confirm `DATABASE_URL` points at `postgresql://postgres:postgres@127.0.0.1:54322/postgres` (see `docs/runbooks/supabase_local.md`).
   - Run `npm run setup` after exporting `.env.local` to verify migrations succeed. Attach the Prisma output to your feedback entry.
   - Tail the local instance with `scripts/ops/tail-supabase-logs.sh` and confirm the edge function `occ-log` writes into `public.observability_logs` using `supabase/sql/observability_logs.sql`.

2. **Shopify dev flow validation (React Router 7 + Shopify CLI v3)**
   - Do NOT capture or mirror session/embed tokens. Use the current dev flow with Shopify CLI v3 and App Bridge + React Router 7.
   - Validate helper usage and configuration: `docs/dev/appreact.md`, `docs/dev/authshop.md` (authenticate.admin), and `docs/dev/session-storage.md`.
   - Run the embedded app via `shopify app dev` and confirm Admin loads without manual token injection; log evidence (timestamps + screenshots or CLI output) in `feedback/reliability.md`.

3. **`?mock=0` latency fix**
   - Continue running `scripts/ci/synthetic-check.mjs` until we capture <300 ms results. Partner with Deployment on Fly warm-up/tuning; track each attempt, change, and outcome in the feedback log.

4. **Chatwoot Fly smoke & credentials**
   - Source Fly access locally (`source vault/occ/fly/api_token.env` to export `FLY_API_TOKEN`) and verify with `/home/justin/.fly/bin/fly auth status`. If the token is missing or still set to the placeholder, log the gap and request the real value from the manager while continuing other Chatwoot prep.
   - Gather the required Chatwoot API credentials yourself (request support/integrations once, then follow up every 4 hours until delivered; document every request with timestamps).
   - Increase Fly machine memory to 2GB to prevent crashes. Preferred: persist by updating `deploy/chatwoot/fly.toml` `[vm].memory = "2048mb"` and redeploy; or execute via CLI: `/home/justin/.fly/bin/fly scale memory 2048 -a hotdash-chatwoot`. For Machines-based apps: `/home/justin/.fly/bin/fly m list -a hotdash-chatwoot` then `/home/justin/.fly/bin/fly m update <id> --memory 2048`. Log command + output.
   - Store the token under `vault/occ/chatwoot/`, set Fly secrets, run `scripts/ops/chatwoot-fly-smoke.sh`, and archive the results. Do not hand back to integrations until the smoke evidence is complete and linked.

5. **Supabase follow-through**
   - Now that `decision_sync_events` is restored, keep the SQL script, pg_cron evidence, and DSN screenshots linked for data/compliance.
   - Monitor the view daily and log results so any regression is caught early.
   - Confirm RLS is active on `public.notification_settings`, `public.notification_subscriptions`, and any future PostgREST tables by running the Supabase SQL checks yourself; attach query output when you log the status.

6. **GA MCP readiness**
   - Partner with integrations/compliance on OCC-INF-221. Once credentials land, help mirror secrets and run the MCP helper, then capture evidence for the readiness dashboard.

7. **Backup drill prep**
   - Keep the Week 3 backup/restore runbook current with any credential changes uncovered above.

8. **Stack compliance audit**
   - Co-lead the Monday/Thursday audit with QA/manager, focusing on infrastructure tooling, secrets, and runbooks; document findings and remediation plans.
