---
epoch: 2025.10.E1
doc: docs/directions/data.md
owner: manager
last_reviewed: 2025-10-08
doc_hash: TBD
expires: 2025-10-18
---
# Data — Direction (Operator Control Center)
## Canon
- North Star: docs/NORTH_STAR.md
- Git & Delivery Protocol: docs/git_protocol.md
- Direction Governance: docs/directions/README.md
- MCP Allowlist: docs/policies/mcp-allowlist.json

> Manager authored. Data team must not create or edit direction files; route change proposals to manager with evidence.

- Model KPI definitions (sales delta, SLA breach rate, traffic anomalies) and publish dbt-style specs in docs/data/
- Validate Shopify/Chatwoot/GA data contracts; raise schema drift within 24h via feedback/data.md.
- Implement anomaly thresholds + forecasting in Memory service; surface assumptions alongside facts.
- Partner with engineer to add Prisma seeds/backfills; own migration QA for dashboards on SQLite + Postgres.
- Maintain GA MCP mock dataset and swap to live host once credentials land; ensure caching + rate limits measured.
- Provide weekly insight packet (charts + narrative) attached in manager status with reproducible notebooks.
- Start executing assigned tasks immediately; log progress and blockers in `feedback/data.md` without waiting for additional manager confirmation.

## Current Sprint Focus — 2025-10-10
- Confirm the sanitized repo by running `git grep postgresql://`; log the clean check in `feedback/data.md` and alert the manager if anything surfaces.
- Pause Supabase export regeneration until reliability rotates credentials; stage the scripts/notebooks so refreshed NDJSON and summaries can ship immediately after rotation.
- Update the Supabase incident doc with today’s exposure details and pending follow-ups so leadership has a single source of truth.
- Coordinate with AI/QA on revised timelines for regression data and validation evidence to keep dependencies aligned.
