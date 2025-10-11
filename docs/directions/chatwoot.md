---
epoch: 2025.10.E1
doc: docs/directions/chatwoot.md
owner: manager
last_reviewed: 2025-10-10
doc_hash: TBD
expires: 2025-10-17
---
# Chatwoot Integrations — Direction (Operator Control Center)
## Canon
- North Star: docs/NORTH_STAR.md
- Git & Delivery Protocol: docs/git_protocol.md
- Direction Governance: docs/directions/README.md
- MCP Allowlist: docs/policies/mcp-allowlist.json
- Credential Map: docs/ops/credential_index.md
- Agent Launch Checklist (manager executed): docs/runbooks/agent_launch_checklist.md

> Manager authored. This agent owns the Chatwoot Fly deployment end-to-end; do not pass work off until evidence proves completion.

- Execute all Chatwoot Fly tasks captured in `docs/deployment/chatwoot_fly_runbook.md` and the status artifact `artifacts/integrations/chatwoot-fly-deployment-2025-10-10.md`.
- Before touching Fly, source credentials locally (`source vault/occ/fly/api_token.env`) and confirm `FLY_API_TOKEN` is set via `/home/justin/.fly/bin/fly auth status` (and not the placeholder). Capture the confirmation in your feedback log.
- Coordinate directly with reliability/deployment for infrastructure needs but retain task ownership—log every update (including the command/output) in `feedback/integrations.md`.
- Ensure secrets, health checks, and evidence bundles are complete before handing off to support/QA.
- Stack guardrails: Chatwoot persists to Supabase only (see `docs/directions/README.md#canonical-toolkit--secrets`); do not provision Fly Postgres or alternate databases.
- Align Chatwoot automation with Shopify data sources: docs/dev/admin-graphql.md for admin facts, docs/dev/storefront-mcp.md for customer context.

## Current Sprint Focus — 2025-10-10
Work through the runbook sequentially and close each item with evidence:

1. **Supabase DSN alignment** — Load credentials from `vault/occ/supabase/database_url_staging.env`, percent-encode the password, and ensure Fly secrets (`POSTGRES_*`) point to Supabase (not Fly Postgres). Document the `fly secrets set` output and update the runbook revision.
2. **Migrations & health check** — SSH into the Fly app, run `bundle exec rails db:chatwoot_prepare` until it succeeds, create the super admin + Redis keys, and verify `/hc` responds 200. Archive commands and logs under `artifacts/integrations/chatwoot-fly-deployment-2025-10-10/`.
3. **Inbound email configuration** — Configure the Chatwoot shared inbox for customer.support@hotrodan.com (IMAP/SMTP or API). Capture screenshots, update `docs/deployment/chatwoot_fly_runbook.md`, and confirm inbound/outbound tests.
4. **Automation webhook** — Implement and test the webhook that posts curated replies into Supabase (coordinate endpoint with Data). Deliver a full payload run and store evidence in the artifacts folder.
5. **API token handoff** — Generate a scoped Chatwoot API token for automation, store it under `vault/occ/chatwoot/`, mirror secrets with Integrations, and update `docs/integrations/integration_readiness_dashboard.md`.
6. **Smoke test** — Run `scripts/ops/chatwoot-fly-smoke.sh` end-to-end using the new credentials, attach results, and notify Support/QA that the environment is ready. Escalate only after two documented failures with logs attached.
7. **Reporting** — Summarize progress, blockers, evidence paths, and next steps in `feedback/integrations.md` so the manager has a clear view.
