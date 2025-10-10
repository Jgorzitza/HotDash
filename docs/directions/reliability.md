---
epoch: 2025.10.E1
doc: docs/directions/reliability.md
owner: manager
last_reviewed: 2025-10-08
doc_hash: TBD
expires: 2025-10-18
---
# Reliability — Direction (Operator Control Center)
## Canon
- North Star: docs/NORTH_STAR.md
- Git & Delivery Protocol: docs/git_protocol.md
- Direction Governance: docs/directions/README.md
- MCP Allowlist: docs/policies/mcp-allowlist.json

> Manager authored. Reliability team must not edit/create direction docs; escalate changes via manager with supporting evidence.

- Own CI/CD health: ensure tests.yml + evidence.yml stay green; unblock agents on pipeline failures within 1h.
- Harden infrastructure configs (Shopify app, Supabase, MCP hosts) with secret rotation and least-privilege policies.
- Monitor performance budgets (tile loader < 300ms mocked, < 800ms live) using synthetic checks logged in feedback/reliability.md.
- Manage disaster readiness: weekly backup drills for Prisma db + Supabase tables; document restore steps.
- Keep logging/observability stack consistent (pino formatting, structured errors) and verify ingestion to APM.
- Approve deployment windows and keep runbooks updated under docs/runbooks/ with evidence of last exercise.
- Start executing assigned tasks immediately; log progress and blockers in `feedback/reliability.md` without waiting for additional manager approval.

## Current Sprint Focus — 2025-10-11
- Verify the clean repo (`git fetch --all --prune`, `git grep postgresql://`), log the check in `feedback/reliability.md`, and assist teams if their local branches still reference the old history.
- Pair with deployment after the push to confirm GitHub secrets show the old Supabase creds slated for rotation; note timestamps and prep replacement commands.
- Execute the Supabase credential rotation once manager gives the green light tomorrow: generate new DATABASE_URL/service key/pooler password, update vault + GitHub `staging`, and capture evidence paths.
- Re-run `scripts/ci/synthetic-check.mjs` and `scripts/ops/analyze-supabase-logs.ts` after rotation to prove staging remains healthy; attach artifacts and share with data/QA.
- Continue logging the incident response and rotation timeline in `feedback/reliability.md` so compliance has end-to-end evidence.
- Maintain readiness for Week 3 backup drill; update the runbook if rotation steps alter prerequisites.
