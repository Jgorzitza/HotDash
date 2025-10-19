# RULES — Docs, Tasks, Secrets, and Agents

## Allowed Markdown (CI-enforced)

```
README.md
APPLY.md
docs/NORTH_STAR.md
docs/RULES.md
docs/OPERATING_MODEL.md
docs/ARCHIVE_INDEX.md
docs/README.md
docs/roadmap.md
docs/runbooks/{manager_*,agent_*,ai_agent_review_checklist.md,drift_checklist.md}
docs/directions/<agent|role>.md
docs/directions/agenttemplate.md
docs/manager/{PROJECT_PLAN.md,IMPLEMENTATION_PLAYBOOK.md}
docs/planning/<agent>-<task>-<YYYYMMDD>.md  # TTL 2 days
docs/specs/**
docs/integrations/**
feedback/<agent>/<YYYY-MM-DD>.md
docs/_archive/**
mcp/**  # MCP tools documentation (critical infrastructure - DO NOT REMOVE)
```

## Process

- **Single ledger**: GitHub Issues (Task form) with `Agent`, `Definition of Done`, `Acceptance checks`, and **Allowed paths**.
- PR must state `Fixes #<issue>`, satisfy DoD, and pass checks. Danger enforces.
- Agents write **only** to their daily feedback file and code paths.
- Manager owns NORTH_STAR, RULES, Operating Model, directions, and PROJECT_PLAN.
- **MCP Evidence:** Code-changing PRs must include an “MCP Evidence” section in the body and attach transcripts under `artifacts/<agent>/<date>/mcp/*.jsonl` with sha256. Exception: **GA4/GSC** use internal adapters (no MCP); attach adapter command + stderr logs instead.

- **Foreground Proof:** Long-running work must produce on-disk, foreground heartbeats. Wrap commands (>15s) with `scripts/policy/with-heartbeat.sh <agent> -- <command>`. PRs must include a “Foreground Proof” section with a path like `artifacts/<agent>/<YYYY-MM-DD>/logs/heartbeat.log`, and that file must be committed with multiple ISO timestamped entries.

## Security

- Enable GitHub **push protection** & secret scanning.
- **Gitleaks** runs on every PR & push; SARIF to Security tab.
- No secrets in code or docs; store in GitHub Environments/Secrets, Local Vault, and Fly.io secrets (as needed).

## Agents & HITL

- **Dev agents** (Cursor/Codex/Claude): follow runbooks & directions; no Agent SDK.
- **In‑app agents** (OpenAI Agents SDK): HITL enforced for `ai-customer` using built‑in interruptions.

## Autopublish

- Autopublish tiers are provisioned but **disabled by default**. Enablement is per‑feature toggle in app settings (content, product, customer, etc.) and requires Manager approval and a rollback plan. Tier‑0 tasks (e.g., image compression, alt‑text) remain off until explicitly enabled.
