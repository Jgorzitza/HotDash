# Sales Pulse — AI Dry Run Samples (2025-10-10 Draft)

## Staging Checklist
- Run `npm run ops:seed-shopify -- --mock` before the session so tile metrics align with the training agenda.
- Confirm Supabase facts sync (`scope="ops"`) writes into staging once credentials land; if still blocked, note fallback storage in the Q&A log.
- Open the dashboard with `?mock=1&tile=sales` to keep the Sales Pulse tile pinned during the walkthrough.

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
