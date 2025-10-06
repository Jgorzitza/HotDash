---
epoch: 2025.10.E1
doc: docs/directions/data.md
owner: manager
last_reviewed: 2025-10-06
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

## Current Sprint Focus — 2025-10-06
- Deliver first weekly insight packet by 2025-10-07 (trends, anomalies, pipeline health) with reproducible notebook links.
- Coordinate with reliability to monitor Supabase decision/fact ingestion (error rate, latency) and raise alerts if thresholds breached.
- Prepare GA MCP go-live checklist so mock-to-live switch can execute within 24h once credentials arrive.
- Backfill dashboard facts for demo shops using Prisma seeds and document assumptions in `docs/data/kpis.md`.
