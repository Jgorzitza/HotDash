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

## Security

- Enable GitHub **push protection** & secret scanning.
- **Gitleaks** runs on every PR & push; SARIF to Security tab.
- No secrets in code or docs; store in GitHub Environments/Secrets, Local Vault, and Fly.io secrets (as needed).

## Agents & HITL

- **Dev agents** (Cursor/Codex/Claude): follow runbooks & directions; no Agent SDK.
- **In‑app agents** (OpenAI Agents SDK): HITL enforced for `ai-customer` using built‑in interruptions.

## MCP Tools (MANDATORY - Effective 2025-10-19)

**All dev agents MUST use MCP tools** - non-negotiable:

1. **Shopify Dev MCP**: MANDATORY for ALL Shopify GraphQL code
   - Validate ALL queries with `validate_graphql_codeblocks`
   - Log conversation IDs in feedback
   - NO Shopify code without MCP validation

2. **Context7 MCP**: MANDATORY for ALL library usage
   - Verify patterns for React Router 7, Prisma, Polaris
   - Get official documentation before coding
   - NO library code without MCP verification

3. **Chrome DevTools MCP**: Required for UI testing
   - Designer, Pilot, QA agents MUST use for production testing

**Evidence**: Log MCP conversation IDs in all feedback entries

**Enforcement**: Manager REJECTS PRs without MCP evidence

## React Router 7 ONLY (NOT Remix)

**FORBIDDEN** ❌: All `@remix-run/*` imports  
**REQUIRED** ✅: `react-router` imports, `Response.json()`, MCP verification

**See**: `docs/REACT_ROUTER_7_ENFORCEMENT.md`

**Verification**: `rg "@remix-run" app/` MUST return NO RESULTS
