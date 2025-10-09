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

## Current Sprint Focus — 2025-10-08
- Investigate the Supabase decision sync error spike (25% failure rate): pair with engineering/reliability to isolate root cause, ship instrumentation updates, and document findings plus mitigation plan in `feedback/data.md`.
- Publish the 2025-10-09 weekly insight addendum highlighting activation, SLA, anomaly trends, and Supabase logging health; provide reproducible SQL/notebook links in `docs/insights/`.
- Finalize GA MCP readiness by validating mock vs. live schema parity, updating `docs/data/ga_mcp_go_live_checklist.md`, and preparing the credential handoff package for integrations/compliance so the swap can execute within 24 hours of receipt.
