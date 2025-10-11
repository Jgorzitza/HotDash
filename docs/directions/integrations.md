---
epoch: 2025.10.E1
doc: docs/directions/integrations.md
owner: manager
last_reviewed: 2025-10-10
doc_hash: TBD
expires: 2025-10-17
---
# Integrations — Direction (Operator Control Center)
## Canon
- North Star: docs/NORTH_STAR.md
- Git & Delivery Protocol: docs/git_protocol.md
- Direction Governance: docs/directions/README.md
- MCP Allowlist: docs/policies/mcp-allowlist.json
- Credential Map: docs/ops/credential_index.md
- Agent Launch Checklist (manager executed): docs/runbooks/agent_launch_checklist.md

> Manager authored. Integrations agent must channel change requests to the manager with evidence; do not edit direction docs directly.

## Local Execution Policy (Auto-Run)

You may run local, non-interactive commands and scripts without approval. Guardrails:

- Scope: local repo and local tooling; do not change remote infra/secrets under auto-run. Status/read-only checks are okay.
- Non-interactive: disable pagers; avoid interactive prompts.
- Evidence: log timestamp, command, outputs in feedback/integrations.md; store logs under artifacts/integrations/.
- Secrets: load from vault/env; never print values.
- Tooling: npx supabase locally; git/gh with --no-pager; prefer rg else grep -nE.
- Retry: 2 attempts then escalate with logs.

- Own external vendor onboarding (GA MCP, Chatwoot, Supabase, social sentiment providers) and track status in `docs/integrations/`.
- For Shopify-related work, consult the Shopify developer MCP (`shopify-dev-mcp`) for contracts and flows—capture MCP references in readiness docs instead of guessing endpoints.
- Coordinate credential requests, sandbox validation, and rate-limit testing with engineering, data, and reliability before production handoff.
- Maintain typed client contract summaries and ensure they stay in sync with upstream changes.
- Provide go-live checklists and contact logs for each integration so deployment can execute quickly when windows open.
- Stack guardrails: enforce `docs/directions/README.md#canonical-toolkit--secrets` (Supabase-only Postgres, Chatwoot on Supabase, React Router 7, OpenAI + LlamaIndex). Reference Shopify docs: docs/dev/appreact.md, docs/dev/authshop.md, docs/dev/session-storage.md for current guidance. Do not introduce alternate databases; PRs will be blocked by the Canonical Toolkit Guard if violations are detected.
- Maintain API contracts using docs/dev/admin-graphql.md (Admin), docs/dev/storefront-mcp.md (Storefront MCP), and docs/dev/webpixels-shopify.md (pixels).

- Do not spin up alternate databases or MCPs without manager approval.
- Log integration status updates, blockers, and decisions in `feedback/integrations.md`.
- Start executing assigned tasks immediately; log progress and blockers in `feedback/integrations.md` without waiting for additional manager approval.

## Current Sprint Focus — 2025-10-10
Own external integrations beyond Chatwoot and keep managers informed via `feedback/integrations.md`. You are responsible for taking each task from start to finish: capture the command/output for every step, log blockers with evidence, and only escalate after two documented attempts with timestamps.

## Aligned Task List — 2025-10-11
- Shopify contracts
  - Use Shopify Dev MCP to validate Admin flows; no guessing endpoints or fields.
- Secrets
  - Mirror only required secrets; no embed/session tokens in current flow. Sanitize artifacts.
- Chatwoot scope
  - Keep readiness docs in `docs/integrations/` but log operational execution in `feedback/chatwoot.md`.
- Evidence
  - Timestamp, commands, outputs in `feedback/integrations.md`.

1. **GA MCP (OCC-INF-221)** — drive credential delivery with infra; document every response in `docs/integrations/ga_mcp_onboarding.md` and the readiness dashboard. Attempt contact via primary + escalation channels before logging a blocker, and attach the outreach artifacts (email, ticket, transcript) to `feedback/integrations.md`.
2. **Chatwoot automation credentials** — Source and document the production-ready Chatwoot API token + webhook secret (store in vault per credential index). Coordinate with Support to ensure the shared inbox + automation scopes match the plan; update `docs/integrations/chatwoot_readiness.md` with evidence.
3. **MCP toolbox registration** — Partner with AI to register the new LlamaIndex tools (`refresh_index`, `query_support`, `insight_report`) in `docs/mcp/tools/`. Confirm the allowlist entry, capture tests via MCP client, and log outputs.
4. **Secret mirroring & Shopify readiness** — Mirror required secrets (Shopify client/secret, GA tokens, Chatwoot API key) to GitHub/Fly as soon as deployment provides the go-ahead. Record command output paths and update `docs/integrations/integration_readiness_dashboard.md`.
5. **Stack compliance audit** — Join the Monday/Thursday review focusing on third-party credentials and tooling alignment; log gaps and follow-up actions in `feedback/integrations.md`.
