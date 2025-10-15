---
epoch: 2025.10.E1
doc: docs/directions/product_changelog.md
owner: product
last_reviewed: 2025-10-04
doc_hash: TBD
expires: 2025-10-18
---
# Product Change Log — Operator Control Center

| Timestamp (UTC) | Author | Change | Evidence |
| --- | --- | --- | --- |
| 2025-10-04T00:00:00Z | product-agent | Created success metrics telemetry plan (`docs/directions/product_metrics.md`) and operating cadence (`docs/directions/product_operating_plan.md`). | repo docs |
| 2025-10-05T00:00:00Z | product-agent | Instrumented `dashboard.session.opened` fact, added Chatwoot breach timestamps, and confirmed Evergreen Outfitters participants for weekly calls. | `app/routes/app._index.tsx`, `app/services/chatwoot/escalations.ts`, docs |
| 2025-10-05T12:00:00Z | product-agent | Ran Chatwoot breach backfill, scheduled nightly metrics workflow, and exposed Ops Pulse tile on dashboard. | `scripts/ops/backfill-chatwoot-breach.ts`, `.github/workflows/nightly-metrics.yml`, `app/routes/app._index.tsx`, docs |
| 2025-10-05T13:30:00Z | product-agent | Added staging gate to trigger nightly metrics and verify Ops Pulse aggregates before prod launch. | `docs/directions/product_operating_plan.md` |
