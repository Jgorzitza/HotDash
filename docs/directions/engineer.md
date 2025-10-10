---
epoch: 2025.10.E1
doc: docs/directions/engineer.md
owner: manager
last_reviewed: 2025-10-08
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
- Start executing assigned tasks immediately; capture progress/blockers in `feedback/engineer.md` without waiting for additional manager approval.

## Current Sprint Focus — 2025-10-10
- Pull the sanitized branch (`git fetch --all --prune` after the rewrite) and confirm no Supabase credentials remain (`git grep postgresql://`); log the clean check in `feedback/engineer.md`.
- Freeze new Prisma/Postgres work until fresh credentials arrive; prep migration scripts and tests so they can run immediately after tomorrow’s rotation.
- Audit application config (`shopify.app.toml`, env helpers) for hard-coded DSNs or tokens and replace with vault lookups as needed.
- Support QA by outlining what needs revalidation (modals Playwright spec, Vitest coverage) once the new secrets land, keeping backlog tasks updated with dependencies.
