---
epoch: 2025.10.E1
doc: docs/directions/qa.md
owner: manager
last_reviewed: 2025-10-12
doc_hash: TBD
expires: 2025-10-19
---
# QA — Direction (Operator Control Center)
## Canon
- North Star: docs/NORTH_STAR.md
- Git & Delivery Protocol: docs/git_protocol.md
- Direction Governance: docs/directions/README.md
- MCP Allowlist: docs/policies/mcp-allowlist.json
- Credential Map: docs/ops/credential_index.md
- Agent Launch Checklist (manager executed): docs/runbooks/agent_launch_checklist.md

> Manager authored. QA must not modify or add direction files; propose changes via evidence-backed request to manager.

## Local Execution Policy (Auto-Run)

You may run local, non-interactive test and audit commands without asking for approval each time. Guardrails:

- Scope and safety: local repo and local Supabase only; no remote infra changes; status/read-only checks are fine.
- Non-interactive only: add flags to avoid prompts; disable pagers (git --no-pager; pipe outputs). Avoid less/man/vim.
- Evidence logging: record timestamp, command, and artifact paths in feedback/qa.md; store traces/screens under artifacts/qa/.
- Secrets: never print values; load from env/vault; reference names only.
- Tooling: use npx supabase for local usage; git/gh with --no-pager; prefer rg else grep -nE.
- Retry: up to 2 attempts, then escalate with logs.

- Guard Evidence Gates: block merge without Vitest + Playwright + Lighthouse proof and mock/live screenshots.
- Maintain mock data suites for Shopify/Chatwoot/GA; ensure tests run offline with deterministic fixtures (default Playwright runs use `mock=1`).
- When validating Shopify behaviours, pull expected responses and flows from the Shopify developer MCP (`shopify-dev-mcp`) to avoid speculative coverage gaps.
- Add Playwright coverage per tile (summary + drill-in + approval action) and run smoke on every PR.
- Track regression matrix in `feedback/qa.md`; call out API rate-limit or credential blockers daily.
- Verify Prisma migrations roll forward/back on the Supabase Postgres stack (local via `supabase start`, staging via vault secrets) before sign-off.
- Coordinate soak tests for streaming/approvals; log results under artifacts/ with timestamps.
- Stack guardrails: audit against `docs/directions/README.md#canonical-toolkit--secrets` (Supabase-only Postgres, Chatwoot on Supabase, React Router 7, OpenAI + LlamaIndex) and flag any divergence.
- Reference docs/dev/admin-graphql.md when validating Admin API flows and docs/dev/storefront-mcp.md for storefront agent coverage.
- Start executing assigned tasks immediately; log progress and blockers in `feedback/qa.md` without waiting for additional manager approval. For every finding, document the remediation attempts you executed (command + output). Only escalate to another team when the fix is out of QA scope or fails twice with evidence attached.

## Current Sprint Focus — 2025-10-12
QA operates as the audit arm of the team. Validate the health of the environment and surface risks; individual feature owners are responsible for their own tests. Execute the steps below in parallel and log findings in `feedback/qa.md`.

## Aligned Task List — 2025-10-11
- Canonical toolkit checks
  - Verify no alt DBs or direct redis usage in app builds via CI status; flag violations.
- Shopify Admin testing
  - Use RR7 + CLI v3 flow; no token injection. Keep `mock=1` green; for `mock=0` live smoke, use Admin login credentials.
  - Use Shopify Dev MCP for Admin flows and assertions; do not guess responses.
- Secrets hygiene
  - Confirm no embed/session tokens exist in GitHub or vault for current flow; ensure artifacts/logs are sanitized.
- Evidence
  - Preserve Playwright traces, screenshots, and curl logs; log in `feedback/qa.md` with timestamps.

1. **Local Supabase verification**
   - Run `supabase start` and export `.env.local` before executing test suites (see `docs/runbooks/supabase_local.md`). Log the Prisma `npm run setup` output and confirm migrations succeed locally.
   - Tail logs via `scripts/ops/tail-supabase-logs.sh` during Playwright/analytics runs; attach relevant snippets to the evidence bundle.

2. **Security & secrets audit**
   - Verify RLS is enabled on all PostgREST tables (`notification_settings`, `notification_subscriptions`, etc.) by running the Supabase policies query yourself and attaching the results.
   - Check vault/GitHub secrets for accuracy (Supabase DSN, OpenAI key). Confirm no embed/session tokens are stored or required under the current React Router 7 + Shopify CLI v3 dev flow. Remove any residual `SHOPIFY_EMBED_TOKEN_*` secrets if present; log the cleanup.

3. **GitHub posture**
   - Audit branch protection, required reviewers, and Actions status. Flag missing reviewers or failing workflows.
   - Ensure required secrets (Supabase DSN, Chatwoot, GA MCP) appear in the environment; embed/session tokens should not be present.

4. **Code quality & performance**
   - Review latest PRs/build outputs for lint/test coverage trends and TODO debt.
   - Monitor Lighthouse/perf dashboards; log latencies and regression risks alongside reliability’s synthetic results.

5. **End-to-end readiness**
   - Maintain the “ready-to-fire” checklists for Shopify Admin suites, Prisma drills, and DEPLOY-147 evidence. Execute immediately when reliability clears latency thresholds and Fly memory scaling is complete; log the full command/output bundle.
   - Keep `npm run test:e2e -- --grep "dashboard modals"` smoke green and stage the full `npm run test:e2e` suite for when staging reopens. Use the Admin login credentials (`PLAYWRIGHT_SHOPIFY_EMAIL/PASSWORD`) for live runs—no manual tokens. As soon as engineering confirms the TypeScript build is clean, rerun `npm run typecheck` to verify and record the success before triggering the full Playwright suite. If a suite fails, attempt the fix (or pair with the owning engineer) before logging the issue.

6. **Stack compliance cadence**
   - Partner with the manager on the Monday/Thursday stack audit; highlight any tooling drift or secret misuse and assign remediation.

7. **Reporting**
   - Summarize audit findings, risks, and recommended follow-up owners in `feedback/qa.md` and notify impacted teams.
