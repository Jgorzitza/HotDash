---
epoch: 2025.10.E1
doc: docs/directions/qa.md
owner: manager
last_reviewed: 2025-10-08
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
- Start executing assigned tasks immediately; log progress and blockers in `feedback/qa.md` without waiting for additional manager approval.

## Current Sprint Focus — 2025-10-11
- After deployment force-pushes, run `git fetch --all --prune` and confirm `git status` is clean; log the sanitized head in `feedback/qa.md`.
- Keep staging Playwright/Prisma drills paused until reliability rotates Supabase credentials; finalize the post-rotation checklist so execution can start immediately.
- Coordinate with engineering/data/AI on fixture refresh needs and flag any blockers expected once new secrets land.
- Prepare to capture evidence (Playwright, Lighthouse, Prisma) in the order agreed so DEPLOY-147 can close quickly post-rotation.
