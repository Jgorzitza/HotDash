---
epoch: 2025.10.E1
doc: docs/directions/manager.md
owner: manager
last_reviewed: 2025-10-12
doc_hash: TBD
expires: 2025-10-19
---
# Manager — Direction (Greenfield)
## Canon
- North Star: docs/NORTH_STAR.md
- Git & Delivery Protocol: docs/git_protocol.md
- Direction Governance: docs/directions/README.md
- MCP Allowlist: docs/policies/mcp-allowlist.json
- Credential Map: docs/ops/credential_index.md
- Agent Launch Checklist: docs/runbooks/agent_launch_checklist.md

> Direction docs are curator-owned artifacts. Agents must not author or modify direction files; changes flow through the manager via PRs referencing evidence.

- Guard canon via CODEOWNERS.
- Enforce branch policy `agent/<agent>/<molecule>`.
- Demand artifacts on PRs (Vitest, Playwright, Lighthouse, metrics, soak if streaming).
- Uphold the stack guardrails in `docs/directions/README.md#canonical-toolkit--secrets` (Supabase-only Postgres, Chatwoot on Supabase, React Router 7, OpenAI + LlamaIndex).
- Publish a daily stand-up in `feedback/manager.md` using `docs/directions/manager_standup_template.md`, capturing assignments, deadlines, and evidence links.
- Run the stack compliance audit with QA every Monday/Thursday; log results and corrective actions.
- Execute `docs/runbooks/agent_launch_checklist.md` before starting or restarting any agent.
- Keep `docs/ops/credential_index.md` current and referenced in all relevant direction docs.

## Current Sprint Focus — 2025-10-12
1. **Stand-up cadence** — Post the daily stand-up note (template above) by 15:00 UTC, ensuring each role has a deliverable, evidence path, and deadline.
2. **Stack compliance** — Coordinate the twice-weekly audit with QA; document findings and assign remediation immediately.
3. **Credential governance** — Validate that `docs/ops/credential_index.md` matches vault/GitHub reality; trigger updates if drift is detected. Confirm `.env.local` guidance is reflected across teams and Fly configuration aligns with docs/dev/fly-shopify.md.
4. **Agent readiness** — Before relaunching agents, run `docs/runbooks/agent_launch_checklist.md`, record completion in `feedback/manager.md`, and notify owners.
5. **Blocker triage** — Drive closure on Supabase SCC/region confirmation, GA MCP bundle, Shopify embed token mirroring, and `pg_cron` evidence; escalate vendors when deadlines slip.
6. **Release prep** — Keep DEPLOY-147 tracking current (latency evidence, Playwright reruns, Chatwoot smoke) and ensure all teams capture proof needed for Shopify Admin sign-off.
