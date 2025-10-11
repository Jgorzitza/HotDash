---
epoch: 2025.10.E1
doc: docs/directions/deployment.md
owner: manager
last_reviewed: 2025-10-12
doc_hash: TBD
expires: 2025-10-19
---
# Deployment — Direction (Operator Control Center)
## Canon
- North Star: docs/NORTH_STAR.md
- Git & Delivery Protocol: docs/git_protocol.md
- Direction Governance: docs/directions/README.md
- MCP Allowlist: docs/policies/mcp-allowlist.json
- Credential Map: docs/ops/credential_index.md
- Agent Launch Checklist (manager executed): docs/runbooks/agent_launch_checklist.md

> Manager authored. Deployment agent must not modify direction docs; request changes via the manager with evidence.

## Local Execution Policy (Auto-Run)

You may run local, non-interactive commands and scripts without approval. Guardrails:

- Scope and safety: local repo and local Supabase; do not alter remote infra or push git under auto-run. Status/read-only checks are fine.
- Non-interactive: disable pagers; avoid interactive prompts.
- Evidence: log timestamp, command, outputs in feedback/deployment.md; store logs under artifacts/deployment/.
- Secrets: use vault/env; never print secret values.
- Tooling: npx supabase locally; git/gh with --no-pager; prefer rg else grep -nE.
- Retry: 2 attempts then escalate with evidence.

- Own environment provisioning and promotion workflows from dev → staging → production; codify scripts in `scripts/deploy/` with documentation.
- Keep CI/CD pipelines gated on evidence artifacts (Vitest, Playwright, Lighthouse) before any deploy job triggers.
- Coordinate with reliability on secrets management and rotation readiness; confirm the current Supabase credentials remain authoritative, propagate `.env.local` guidance to engineers, and keep environment variable matrices under `docs/deployment/` up to date.
- Reference: docs/dev/appreact.md (Admin guide), docs/dev/authshop.md (authenticate.admin), docs/dev/session-storage.md (session persistence).
- Ensure staging maintains parity with production toggles (feature flags, mock/live settings) and is ready for operator dry runs.
- Document rollback and hotfix procedures in `docs/runbooks/` and keep them exercised.
- Stack guardrails: enforce `docs/directions/README.md#canonical-toolkit--secrets` (Supabase-only Postgres, Chatwoot on Supabase, React Router 7, OpenAI + LlamaIndex). Remove any Fly Postgres references from scripts/runbooks.
- Log deployment readiness updates, blockers, and approvals in `feedback/deployment.md`.
- Start executing assigned tasks immediately; log progress and blockers in `feedback/deployment.md` without waiting for additional manager approval.

## Current Sprint Focus — 2025-10-12
Execute the deployment backlog sequentially; you own each task until the evidence proves it is complete. Record every command and output in `feedback/deployment.md`, retry failures twice, and only escalate with the captured logs.

## Aligned Task List — 2025-10-11
- Canonical toolkit
  - Enforce Supabase-only posture; remove any Fly Postgres references. CI Stack Guard will block alt DBs.
- Shopify Admin dev flow
  - Ensure runbooks reference RR7 + CLI v3 (no token workflows). Update env matrix accordingly.
- Fly memory scaling
  - Scale memory to 2GB for Chatwoot and any applicable apps; persist in fly.toml or via CLI; log evidence in `feedback/deployment.md`.
- Secret mirroring
  - Mirror only required secrets (Supabase DSN, Chatwoot Redis/API, GA MCP). No embed/session tokens.
- Evidence
  - Keep `docs/deployment/env_matrix.md` and runbooks current; attach diffs and command outputs in feedback.

1. **Local Supabase documentation** — Update `docs/deployment/env_matrix.md` and `docs/runbooks/prisma_staging_postgres.md` to reflect the new default (`supabase start`, `.env.local`, Postgres-only migrations). Verify the instructions by running `npm run setup` locally and attaching the output.
2. **Sanitized history** — `git fetch --all --prune`, `git grep postgresql://`; log commands/output.
3. **Runbook parity** — Update `scripts/deploy/staging-deploy.sh`, `docs/deployment/env_matrix.md`, and `docs/deployment/chatwoot_fly_runbook.md` to match current secrets + Supabase posture; capture diffs.
4. **Secret mirroring** — Mirror Supabase DSN, Chatwoot Redis/API, and GA MCP bundles to GitHub (`gh secret set … --env staging/prod`); attach CLI output and verify the values immediately via `gh secret list` (embed/session tokens are not required under the current dev flow).
5. **Fly memory scaling** — Increase memory to 2GB for each Fly app to prevent crashes. For Chatwoot: persist by updating `deploy/chatwoot/fly.toml` `[vm].memory = "2048mb"` and redeploy; or execute via CLI: `/home/justin/.fly/bin/fly scale memory 2048 -a hotdash-chatwoot`. For Machines-based apps: list machines and update each: `/home/justin/.fly/bin/fly m list -a hotdash-chatwoot` then `/home/justin/.fly/bin/fly m update <id> --memory 2048`. For the embedded app, identify the app name via `/home/justin/.fly/bin/fly apps list | grep hotdash` and apply the same scaling. Log commands and outputs in `feedback/deployment.md`.
6. **Chatwoot alignment** — Pull the current Fly secrets yourself, update anything missing, and run the smoke validation. Collaborate with the Chatwoot agent for context, but do not hand the task back until secrets and evidence are archived (`artifacts/integrations/chatwoot-fly-deployment-*`).
7. **Stack compliance audit** — Attend Monday/Thursday review, focusing on CI/CD secret usage and deploy scripts; document remediation steps.
8. **Fallback readiness** — Keep staging redeploy, rollback, and dry-run checklists current so QA can execute immediately once blockers clear.
6. **Stack compliance audit** — Attend Monday/Thursday review, focusing on CI/CD secret usage and deploy scripts; document remediation steps.
7. **Fallback readiness** — Keep staging redeploy, rollback, and dry-run checklists current so QA can execute immediately once blockers clear.
