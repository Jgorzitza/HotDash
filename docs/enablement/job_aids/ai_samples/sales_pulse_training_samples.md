# Sales Pulse — AI Dry Run Samples (2025-10-10 Draft)

## Telemetry Callouts
- Pull revenue/order metrics directly from the Ops Pulse/Sales Pulse Supabase facts (`factType="shopify.sales_pulse"`); log IDs and timestamps after each scenario.
- Record KPI deltas (revenue %, order count, channel mix) in the Q&A template so data/QA can compare to nightly ETL outputs.
- When Supabase sync is unavailable, flag the fallback Memory entry (`scope="ops"`, `topic="sales.health_check"`) for follow-up in `feedback/ai.md`.

## Facilitation Notes
- Open each scenario by restating the decision trigger (delta thresholds, backlog count) and prompt operators to articulate next steps before logging decisions.
- Confirm the scribe notes which stakeholders were alerted (ops, marketing, fulfillment) and the evidence captured (screenshots, Supabase IDs).
- Reinforce that every recommendation must be paired with a logged decision; ask operators to verbalize the exact Memory tag they will use.

## Staging Checklist
- Run `npm run ops:seed-shopify -- --mock` before the session so tile metrics align with the training agenda.
- Confirm Supabase facts sync (`scope="ops"`) writes into staging once credentials land; if still blocked, note fallback storage in the Q&A log.
- Open the dashboard with `?mock=1&tile=sales` to keep the Sales Pulse tile pinned during the walkthrough.

## Supabase Evidence Reference (2025-10-09 sample)
Reference the refreshed bundle (`artifacts/logs/supabase_decision_export_2025-10-10T07-29-39Z.ndjson`) while rehearsing decisions; durations and attempts help facilitators narrate telemetry expectations.

| Scenario | decisionId | Status | Attempt | Duration (ms) | Notes |
| --- | --- | --- | --- | --- | --- |
| Order Surge Alert (Scenario 1) | 101 | SUCCESS | 1 | 241.12 | Use as the baseline success record; call out how a single-attempt approval should appear in Supabase. |
| Revenue Dip Warning (Scenario 2) | 102 | SUCCESS | 1 | 198.77 | Tie this ID to the marketing follow-up decision and remind operators to log the Shopify discount reference. |
| Channel Mix Shift (Scenario 3) | 104 | SUCCESS | 2 | 265.43 | Show how retries surface (attempt=2) and reinforce documenting the homepage update in the Q&A capture. |
| Promo Monitoring (Scenario 4) | 103 | TIMEOUT | 3 | 1500.55 | Discuss timeout handling for readiness checks and where to log manual follow-ups when Supabase records an `ETIMEDOUT`. |

### Scenario 1 — Order Surge Alert
- **Tile snapshot:** Orders +35% vs prior day; 12 unfulfilled orders concentrated on Heritage Hoodie variant `HH-BLK-L`.
- **AI summary draft:**
  "We're seeing a 35% order spike versus yesterday, with 12 unfulfilled orders concentrated on the Heritage Hoodie. Recommend pulling in an extra packer for the next two hours and prioritizing same-day shipments to stay within SLA."
- **Operator follow-up:** Ping the fulfillment lead in Slack with the surge summary and log the staffing adjustment in the decision log (`scope="ops"`). During the mock run, verbalize the staffing change and capture it in the enablement worksheet.

### Scenario 2 — Revenue Dip Warning
- **Tile snapshot:** Revenue −18% vs 7-day baseline; paid marketing spend flat; no anomaly flags.
- **AI summary draft:**
  "Revenue is trending 18% below the weekly baseline. No promo fatigue or anomaly flags detected — suggest reviewing paid acquisition spend and highlighting Friday bundle offer to recover."
- **Operator follow-up:** Create a decision log entry tagging marketing with a link to the Shopify discount dashboard. If Supabase is offline, record the plan in the Memory fallback and annotate `feedback/ai.md`.

### Scenario 3 — Channel Mix Shift
- **Tile snapshot:** Marketplace +22% WoW while DTC flat; ad spend unchanged.
- **AI summary draft:**
  "Marketplace orders are up 22% while DTC is flat. Consider spotlighting marketplace-exclusive bundles on the homepage to capture spillover demand and keep upsell targets on track."
- **Operator follow-up:** Coordinate with product to update the Shopify homepage hero slot; log the decision ID for the dry-run evidence bundle. Flag marketing if campaign creative needs refresh.

### Scenario 4 — Promo Monitoring (Stretch)
- **Tile snapshot:** BFCM bundle launch five days out; readiness confirmation required.
- **AI summary draft:**
  "BFCM bundle launch is five days out. Double-check inventory buffers on the bundle SKUs and line up fulfillment overtime if the surge mirrors last year’s peak."
- **Operator follow-up:** Review the Shopify launch checklist and log a confirmation fact (`topic="promo"`, `key="bfcm-ready"`). Use if time allows; otherwise assign as asynchronous follow-up.

> **Next Steps:** Add tile screenshots and Supabase decision IDs once secrets are provisioned, then circulate to enablement/support 24h before the 2025-10-16 dry run.
