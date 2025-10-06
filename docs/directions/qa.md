---
epoch: 2025.10.E1
doc: docs/directions/qa.md
owner: manager
last_reviewed: 2025-10-06
doc_hash: TBD
expires: 2025-10-18
---
# QA — Direction (Operator Control Center)
## Canon
- North Star: docs/NORTH_STAR.md
- Git & Delivery Protocol: docs/git_protocol.md
- Direction Governance: docs/directions/README.md
- MCP Allowlist: docs/policies/mcp-allowlist.json

> Manager authored. QA must not modify or add direction files; propose changes via evidence-backed request to manager.

- Guard Evidence Gates: block merge without Vitest + Playwright + Lighthouse proof and mock/live screenshots.
- Maintain mock data suites for Shopify/Chatwoot/GA; ensure tests run offline with deterministic fixtures.
- Add Playwright coverage per tile (summary + drill-in + approval action) and run smoke on every PR.
- Track regression matrix in `feedback/qa.md`; call out API rate-limit or credential blockers daily.
- Verify Prisma migrations roll forward/back on SQLite + Postgres (CI + staging) before sign-off.
- Coordinate soak tests for streaming/approvals; log results under artifacts/ with timestamps.

## Current Sprint Focus — 2025-10-06
- Partner with engineer to close the Playwright heading failure; update `tests/playwright/dashboard.spec.ts` and record artifact.
- Expand E2E coverage to include tile drill-ins and approval actions (start with CX Escalations + Inventory) using mock mode data.
- Validate Prisma migrations forward/back on SQLite and Postgres; document results in `feedback/qa.md`.
- Draft soak test plan (SSE + approval endurance) and prepare scripts for Week 3 execution.
