---
description: Core principles, vision, architecture constraints, and Definition of Done for HotDash
globs:
  - "**/*"
alwaysApply: true
---

# Core Principles

**Source:** `docs/NORTH_STAR.md`

## Vision
Deliver a **trustworthy, operator-first control center embedded in Shopify Admin** that centralizes live metrics, inventory control, CX, and growth levers. Agents propose actions; **humans approve or correct**; the system learns.

## Guiding Principles

### Speed with Brakes
- Move fast but with rulesets, CI, and HITL (Human-in-the-Loop) enforcement
- Every action must be reversible with documented rollback
- Production safety is non-negotiable

### Show Receipts
- Every suggestion or action must include **evidence**
- Provide queries, samples, diffs with every proposal
- Include projected impact and risk assessment
- Document affected paths/entities

### One Ledger
- GitHub Issues are the single source of truth
- Every Issue must have: Agent, Definition of Done, Acceptance checks, **Allowed paths**
- All work tracked through Issue → PR → Merge flow

### No Secrets in Code
- Use GitHub Environments/Secrets only
- Never commit credentials to version control
- Store in Local Vault or Fly.io secrets as needed
- Push protection and secret scanning must be enabled

### MCP-First Development
- Dev agents (Cursor/Codex/Claude) use **MCP tools**
- 6 active servers: GitHub, Context7, Supabase, Fly.io, Shopify, Google Analytics
- Full documentation in `mcp/` directory (protected infrastructure)
- In-app agents use OpenAI Agents SDK (TypeScript) with HITL

### Agent Direction Template
- All agent direction files follow `docs/directions/agenttemplate.md`
- Each agent has single direction file and feedback log
- Manager owns NORTH_STAR, RULES, Operating Model, directions, PROJECT_PLAN

## Architecture Constraints

### Frontend
- React Router 7 template
- Shopify Polaris components
- Vite build system

### Backend
- Node/TypeScript application
- Supabase (Postgres + RLS)
- Workers/cron for jobs
- SSE/webhooks for real-time

### Agents
- **Dev agents:** Constrained by runbooks/directions + CI
- **In-app agents:** OpenAI Agents SDK with HITL enforcement
- Call server tools only: Shopify Admin GraphQL, Supabase RPC, Chatwoot API, Social adapter

### Observability
- Prometheus/metrics endpoints
- Structured logs
- Approvals/audit tables
- All actions must be traceable

## Success Metrics

### Performance & Reliability
- P95 tile load < 3s
- Nightly rollup error rate < 0.5%
- 30-day uptime ≥ 99.9%

### Governance & Safety
- **0** rogue markdown merges
- **DAILY** startup and shutdown drift sweeps completed
- **0** unresolved secret incidents
- Push protection & Gitleaks green on `main`

### HITL Quality
- ≥ 90% of customer replies drafted by AI
- Average review grades: tone ≥ 4.5, accuracy ≥ 4.7, policy ≥ 4.8
- Median approval time ≤ 15 min

## Definition of Done (Global)

Every task must satisfy ALL of these:

1. **Acceptance criteria satisfied** with tests/evidence; rollback documented
2. **Calls are MCP/SDK-backed** - no speculative endpoints
3. **HITL reviews/grades captured** for customer-facing work
4. **Governance:** Issue linkage, Allowed paths, CI checks green, no disallowed `.md`
5. **Metrics updated** if behavior changed; audit entry present

## Stop the Line Triggers

Do NOT proceed if any of these occur:

- ❌ Secrets detected (local or CI) → rotate, purge history, re-scan
- ❌ PR missing Issue linkage or Allowed paths → send back
- ❌ Approvals without evidence/rollback or failing `/validate` → send back
- ❌ CI checks failing on main branch
- ❌ Push protection disabled

