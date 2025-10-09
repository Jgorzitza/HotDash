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

## Current Sprint Focus — 2025-10-08
- Lead the Supabase decision sync incident response: analyze logs, coordinate with engineering/data to implement fixes, and update `feedback/reliability.md` with mitigation steps plus alert thresholds.
- Run the synthetic check workflow (`scripts/ci/synthetic-check.mjs`) daily, capture metrics/alerts, and confirm the `<300ms` mock budget remains green; publish the first 3 runs as evidence.
- Finalize the secret rotation plan for Supabase/Zoho/Shopify/Chatwoot, including calendar, owners, and dry-run schedule, and circulate it to deployment and compliance by 2025-10-10.
- Prepare the Week 3 backup/restore drill by validating the runbook instructions and listing prerequisites (credentials, staging DB) so the exercise can execute without blockers.
