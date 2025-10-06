---
epoch: 2025.10.E1
doc: docs/directions/reliability.md
owner: manager
last_reviewed: 2025-10-06
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

## Current Sprint Focus — 2025-10-06
- Validate new Supabase and Zoho secrets in CI; document verification in `feedback/reliability.md` and plan rotation cadence.
- Set up synthetic check hitting `/app?mock=1` to monitor dashboard response time (<300ms mock) and log metrics.
- Draft backup/restore runbook for Prisma + Supabase and schedule first drill for Week 3.
- Collaborate with QA to ensure Lighthouse and Playwright artifacts are archived after each pipeline run.
