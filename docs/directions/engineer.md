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

## Current Sprint Focus — 2025-10-08
- Triage and resolve the Supabase decision sync failure spike: pair with data/reliability to capture structured errors, add retry/backoff if needed, and ship tests/evidence detailing the fix.
- Collaborate with deployment to bring up the Postgres-backed staging/test database configuration (env files, Prisma overrides, smoke script) so QA can run forward/back migration checks.
- Polish CX Escalations and Sales Pulse modals for the operator dry run by adding final accessibility refinements (ARIA labels, focus-visible styles, status icons) and ensuring decision logs emit the expected audit payloads.
- Wire dashboard refresh telemetry end-to-end (loader, action, analytics service) and document how operators can trigger/observe events for the dry run.
