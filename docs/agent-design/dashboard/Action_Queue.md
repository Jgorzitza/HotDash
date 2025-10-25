# Action Queue & Operator Tiles

## One Action contract
Every background agent emits the same fields so the Operator UI can be simple and safe:

- type (seo_fix, perf_task, inventory_risk, content_draft, etc.)
- target (page/SKU/collection/customer-safe-id)
- draft (what will change, in human‑readable terms)
- evidence (MCP request IDs, dataset links)
- expected_impact ($ or KPI delta)
- confidence (0.0–1.0)
- ease (simple/medium/hard)
- risk_tier (policy/safety/perf/none)
- can_execute (true/false; gated by policy)
- rollback_plan (one‑liner)
- freshness_label (e.g., “GSC 48–72h lag”)

## Ranking
The “Top‑10” dock sorts by: **Expected Revenue × Confidence × Ease** (ties broken by freshness and risk tier).

## Acceptance
- Each tile shows draft, evidence, and a single click for Approve/Edit/Dismiss.
- Evidence links open MCP sources (Storefront or Customer Accounts) or telemetry reports.
- No tile appears without evidence and a defined rollback plan.
