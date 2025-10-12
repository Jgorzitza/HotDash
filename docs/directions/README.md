---
epoch: 2025.10.E1
doc: docs/directions/README.md
owner: manager
last_reviewed: 2025-10-12
doc_hash: TBD
expires: 2025-10-19
---
# Direction Governance

Direction files are canonical instructions for each agent. To prevent drift:

1. **Single-owner workflow** — each blocker is assigned to one agent end-to-end. They own the task until evidence proves it is complete, logging the commands, timestamps, and outputs for every attempt. Escalate only after two documented failures and manager approval.
2. **Self-testing mandate** — every agent validates their own work (unit tests, smoke evidence, screenshots) before requesting QA review.
3. **QA as auditor** — QA performs independent audits (security, GitHub posture, code quality, performance) and reports findings; they do not execute feature testing on behalf of other teams.
4. **Canon first** — every direction references:
   - `docs/NORTH_STAR.md`
   - `docs/git_protocol.md`
   - this governance doc (`docs/directions/README.md`)
   - `docs/policies/mcp-allowlist.json`
   - Feedback & Direction Controls: `docs/policies/feedback_controls.md`
5. **Change process** — no direction/runbook edits without:
   - A linked blocker ticket or feedback entry proving the need.
   - Manager approval on the PR.
   - Updated hash recorded in `canon.lock` after merge.
6. **Read-only intent** — agents consume their direction, follow linked canon, and log questions in their feedback file (for example `feedback/qa.md`).
7. **Secrets** — Supabase credentials and other sensitive values live in CI secrets or local vault; never commit real values to version control. Reference `docs/ops/credential_index.md` for canonical paths.
8. **Audit trail** — manager logs direction updates in `feedback/manager.md` for transparency and posts a daily stand-up using `docs/directions/manager_standup_template.md`.

Violations (unauthorized files or edits) are blockers and must be reported immediately.

## Canonical Toolkit & Secrets
- **MCP Tools** — Before starting work, ensure Context7 MCP is running (`./scripts/ops/start-context7.sh`). All agents have access to 5 MCP servers: Shopify (API docs), Context7 (codebase search), GitHub (repo management), Supabase (database), and Fly (deployment). See `docs/directions/mcp-tools-reference.md` for complete usage guide. Always search the codebase with Context7 before asking questions or implementing new features.
- **Database** — Supabase is the single source of truth. For local work run `supabase start`, export `.env.local`, and point `DATABASE_URL` at `postgresql://postgres:postgres@127.0.0.1:54322/postgres`. Staging/prod credentials live in `vault/occ/supabase/` and GitHub environments. No Fly-hosted Postgres clusters are permitted.
- **Chatwoot** — Reuses Supabase for persistence. Fly hosts only the app/Sidekiq processes + Upstash Redis. Health endpoints must be verified; update `deploy/chatwoot/fly.toml` when routes change.
- **Frontend** — React + React Router 7; no Remix usage.
- **AI** — OpenAI key at `vault/occ/openai/api_key_staging.env`; LlamaIndex ingestion via `scripts/ai/build-llama-index.ts` and `scripts/ai/ingest-hotrodan.ts`.
- **Secrets handling** — All Fly/OpenAI/Shopify credentials live under `vault/occ/`. Export from vault before running CLI commands and log the command + result in your feedback file.
- **Evidence logging** — Use `packages/memory/logs/`, `supabase/functions/occ-log` (deployed via Supabase CLI), and artifacts under `artifacts/` to capture proof of execution (commands, outputs, screenshots).

## Evidence Gate
- Every feedback update must include:
  1. Timestamp
  2. Command (or link to script) executed
  3. Output/log path or screenshot reference
- Escalations require two failed attempts with evidence logged.
- Missing evidence entries will be rejected and reassigned.

## Direction Execution Workflow
1. Manager runs `docs/runbooks/agent_launch_checklist.md` before activating or restarting any agent.
2. **Agents verify MCP tools availability** — Run `./scripts/ops/start-context7.sh` and verify with `docker ps | grep context7-mcp`. Confirm all 5 MCP servers are accessible per `docs/directions/mcp-tools-reference.md`.
3. Agents read their direction file, the canon docs listed above, and `docs/ops/credential_index.md`.
4. All work is logged in the role's feedback file with evidence.
5. Manager posts the daily stand-up (template: `docs/directions/manager_standup_template.md`) summarizing assignments, deadlines, and evidence links.
6. Twice weekly (Monday/Thursday), manager and QA perform a stack compliance audit (direction adherence, tooling drift, secret usage) and log findings in `feedback/manager.md` and `feedback/qa.md`.

## Stop List
- No ad-hoc direction/runbook edits by agents.
- No agent launches without the credential checklist.
- No status updates without evidence.

Staying within this framework ensures consistent tooling, traceable evidence, and unambiguous ownership.
