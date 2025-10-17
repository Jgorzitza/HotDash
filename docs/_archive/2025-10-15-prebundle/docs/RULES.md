# RULES — Docs, Tasks, Secrets, and Agents

## Allowed Markdown (CI-enforced)

```
README.md
APPLY.md
docs/NORTH_STAR.md
docs/RULES.md
docs/ARCHIVE_INDEX.md
docs/growthengine/{GOALS.md,PIPELINE.md,METRICS.md}
docs/runbooks/{manager_*,agent_*,ai_agent_review_checklist.md,drift_checklist.md}
docs/directions/<agent|role>.md
docs/manager/{PROJECT_PLAN.md,IMPLEMENTATION_PLAYBOOK.md}
docs/planning/<agent>-<task>-<YYYYMMDD>.md  # TTL 7 days
docs/specs/**
docs/integrations/**
feedback/<agent>/<YYYY-MM-DD>.md
docs/_archive/**
```

## Process

- **Single ledger**: GitHub Issues (Task form) with `Agent`, `Definition of Done`, `Acceptance checks`, and **Allowed paths**.
- PR must state `Fixes #<issue>`, satisfy DoD, and pass checks. Danger enforces.
- Agents write **only** to their daily feedback file and code paths.
- Manager owns NORTH_STAR, RULES, directions, and PROJECT_PLAN.

## Security

- Enable GitHub **push protection** & secret scanning.
- **Gitleaks** runs on every PR & push; SARIF to Security tab.
- No secrets in code or docs; store in GitHub Environments/Secrets only.

## Agents & HITL

- **Dev agents** (Cursor/Codex/Claude): follow runbooks & directions; no Agent SDK.
- **In‑app agents** (OpenAI Agents SDK): HITL enforced for `ai-customer` using built‑in interruptions.
