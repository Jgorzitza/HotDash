---
epoch: 2025.10.E1
doc: docs/directions/engineer.md
owner: manager
last_reviewed: 2025-10-12
doc_hash: TBD
expires: 2025-10-19
---
# Engineer — Direction (Operator Control Center)
## Canon
- North Star: docs/NORTH_STAR.md
- Git & Delivery Protocol: docs/git_protocol.md
- Direction Governance: docs/directions/README.md
- MCP Allowlist: docs/policies/mcp-allowlist.json
- Credential Map: docs/ops/credential_index.md
- Agent Launch Checklist (manager executed): docs/runbooks/agent_launch_checklist.md

> Manager authored. Agents must not create or edit direction files; request changes via manager with evidence.

## Local Execution Policy (Auto-Run)

You are authorized to run local, non-interactive commands and scripts without asking for approval each time. Follow these guardrails:

- Scope and safety
  - Operate inside /home/justin/HotDash/hot-dash and local dev services (Supabase 127.0.0.1).
  - Do not change remote infrastructure or git history under this policy. Status/read-only checks are okay.
  - Avoid destructive ops (rm -rf outside project, docker system prune, sudo apt, etc.).

- Non-interactive only
  - Add flags to avoid prompts; do not use interactive shells/editors.
  - Disable pagers (git --no-pager; pipe to files). No less/man/vim.

- Evidence logging
  - Log timestamp, command, output path(s) in feedback/engineer.md; put large outputs under artifacts/engineer/.

- Secrets handling
  - Load from vault/env; never print secret values. Reference variable names only.

- Tooling specifics
  - Supabase via npx supabase for local status/start/stop; no remote ops.
  - Git/GH allowed: status, diff, grep (with --no-pager); not allowed: commit/push/force-push under auto-run.
  - Prefer rg; fallback grep -nE.

- Retry and escalate
  - Retry up to 2 times then escalate with evidence.

- Ship tiles behind feature flags per molecule (`agent/engineer/<tile>`); keep PRs under 400 LOC.
- Extend Shopify/Chatwoot/GA services only via typed interfaces; never call raw fetch from loaders.
- When touching Shopify surfaces, pull contracts and workflows from the Shopify developer MCP (`shopify-dev-mcp`)—no guessing or ad-hoc endpoints.
- Keep the Shopify React Router and session-storage references on hand:
  - docs/dev/appreact.md (interacting with Shopify Admin)
  - docs/dev/authshop.md (authenticate.admin reference)
  - docs/dev/session-storage.md (Prisma session adapter)
  - docs/dev/admin-graphql.md (Admin API queries/mutations)
  - docs/dev/storefront-mcp.md (Storefront agent integration)
- Evidence mandate: Vitest + Playwright + Lighthouse artifacts linked on every PR.
- For schema updates, pair migrations with Prisma client regen and data backfill scripts.
- Maintain caching discipline (respect TTL envs) and log ServiceErrors with scope + code.
- Develop against the local Supabase stack: run `supabase start`, export `.env.local`, run migrations with `npm run setup`, and tail events with `scripts/ops/tail-supabase-logs.sh` (see `docs/runbooks/supabase_local.md`). SQLite is no longer supported.
- Coordinate with QA on mock fixtures; mock mode must stay green before switching to live data.
- Stack guardrails: follow `docs/directions/README.md#canonical-toolkit--secrets` (Supabase-only Postgres, Chatwoot on Supabase, React Router 7, OpenAI + LlamaIndex); do not introduce alternate stacks.
- Prohibited: adding MySQL/MongoDB/SQLite datasources, or direct Redis clients in app code. Redis is only permitted for Chatwoot under deploy/chatwoot/.
- Start executing assigned tasks immediately; capture progress/blockers in `feedback/engineer.md` without waiting for additional manager approval.

## Current Sprint Focus — 2025-10-12
Own each engineering deliverable end-to-end. Capture the command/output for every change in `feedback/engineer.md`, retry failures twice, and only escalate with the captured logs and mitigation attempts.
- Reconfirm sanitized history (`git fetch --all --prune`, `git grep postgresql://`) and log the clean check in `feedback/engineer.md`.
- Land the Supabase memory retry fixes (`packages/memory/supabase.ts`) with unit + e2e evidence; record command outputs.
- Update Shopify helpers (`shopify.app.toml`, env utilities) to align with React Router 7 + App Bridge v3 flows (no manual token capture required); attach diffs. Follow the current App Bridge configuration documented in [`@shopify/app-bridge-react`](https://www.npmjs.com/package/@shopify/app-bridge-react#configuration) when updating the client bootstrap.
- Update Playwright fixtures so local runs stay in `mock=1` without embed tokens; for live (`mock=0`) smoke use the Admin login credentials (`PLAYWRIGHT_SHOPIFY_EMAIL/PASSWORD`) instead of manual tokens.
- Pair with QA on modal Playwright coverage; ensure fixtures align with the canonical toolkit and the current dev flow (React Router 7 + Shopify CLI v3).
- Prep mock fixtures and staging toggles so DEPLOY-147 can close once latency thresholds are met and Fly memory scaling is complete.
- Wire the Supabase edge function (`supabase/functions/occ-log`) into the app logging pipeline and document deployment steps.
- Participate in the Monday/Thursday stack compliance audit, focusing on code references to deprecated stacks or secrets; log remediation steps.
- Clear the outstanding TypeScript build failures (`npm run typecheck`) by repairing the Chatwoot escalation types, Supabase memory client promises, and AI script typings before handing back to QA; log each fix + command output in `feedback/engineer.md` and re-run the full typecheck until it exits 0.

## Aligned Task List — 2025-10-11
- Canonical toolkit enforcement
  - Run locally: `node scripts/ci/stack-guard.mjs` and fix any violations (no MySQL/Mongo/SQLite, no direct `redis://` in app/packages). CI will block otherwise.
- Shopify Admin dev flow
  - Use RR7 + Shopify CLI v3 only. Start Admin via `shopify app dev`. Do not capture or inject session/embed tokens.
  - Reference: `docs/dev/appreact.md`, `docs/dev/authshop.md`, `docs/dev/session-storage.md`.
  - Use Shopify Dev MCP (`shopify-dev-mcp`) for Admin contracts; do not guess endpoints or shapes.
- Tests and fixtures
  - Keep `mock=1` green. For `mock=0` smoke, use Admin login creds (`PLAYWRIGHT_SHOPIFY_EMAIL/PASSWORD`), not tokens.
- Supabase only
  - Ensure all datasources and Prisma configs target Supabase Postgres; remove any alternates.
- Evidence
  - For every change, log timestamp, command, and output path in `feedback/engineer.md`.
- Run the Canonical Toolkit Guard locally (`node scripts/ci/stack-guard.mjs`) and remove any violations (alt DBs, direct redis calls in app code). PRs will fail if violations remain.
