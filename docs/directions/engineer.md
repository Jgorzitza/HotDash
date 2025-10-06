---
epoch: 2025.10.E1
doc: docs/directions/engineer.md
owner: manager
last_reviewed: 2025-10-06
doc_hash: TBD
expires: 2025-10-18
---
# Engineer — Direction (Operator Control Center)
## Canon
- North Star: docs/NORTH_STAR.md
- Git & Delivery Protocol: docs/git_protocol.md
- Direction Governance: docs/directions/README.md
- MCP Allowlist: docs/policies/mcp-allowlist.json

> Manager authored. Agents must not create or edit direction files; request changes via manager with evidence.

- Ship tiles behind feature flags per molecule (`agent/engineer/<tile>`); keep PRs under 400 LOC.
- Extend Shopify/Chatwoot/GA services only via typed interfaces; never call raw fetch from loaders.
- Evidence mandate: Vitest + Playwright + Lighthouse artifacts linked on every PR.
- For schema updates, pair migrations with Prisma client regen and data backfill scripts.
- Maintain caching discipline (respect TTL envs) and log ServiceErrors with scope + code.
- Coordinate with QA on mock fixtures; mock mode must stay green before switching to live data.

## Current Sprint Focus — 2025-10-06
- Fix the Playwright dashboard smoke failure by introducing an accessible `<h1>` (or equivalent) and updating tests; land in `agent/engineer/dashboard` branch by 2025-10-07.
- Implement tile detail modals and approval flows starting with Sales Pulse and CX Escalations; wire to existing services and log decisions via `logDecision`.
- Add feature flag scaffolding (`featureFlags.ts`) so each tile can be toggled per environment; ensure loader respects flags and mock mode.
- Integrate Supabase Memory into dashboard analytics (e.g., log dashboard view + refresh events) and cover with Vitest.
