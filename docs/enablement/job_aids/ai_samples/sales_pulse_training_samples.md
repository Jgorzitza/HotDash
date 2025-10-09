# Sales Pulse — AI Dry Run Samples (2025-10-09 Draft)

## Scenario 1 — Order Surge Alert
- **Tile state:** Orders +35% vs prior day, fulfillment backlog +12.
- **AI summary draft:**
  "We're seeing a 35% order spike versus yesterday, with 12 unfulfilled orders concentrated on the Heritage Hoodie. Recommend pulling in an extra packer for the next two hours and prioritizing same-day shipments to stay within SLA."
- **Operator follow-up:** confirm fulfillment lead acknowledges; log staffing adjustment in Memory (scope `ops`).

## Scenario 2 — Revenue Dip Warning
- **Tile state:** Revenue −18% vs 7-day baseline, no major anomalies flagged.
- **AI summary draft:**
  "Revenue is trending 18% below the weekly baseline. No promo fatigue or anomaly flags detected — suggest reviewing paid acquisition spend and highlighting Friday bundle offer to recover."
- **Operator follow-up:** tag marketing for campaign check; add note if promo adjustments scheduled.

## Scenario 3 — Channel Mix Shift
- **Tile state:** DTC revenue flat, marketplace channel +22%, ad spend unchanged.
- **AI summary draft:**
  "Marketplace orders are up 22% while DTC is flat. Consider spotlighting marketplace-exclusive bundles on the homepage to capture spillover demand and keep upsell targets on track."
- **Operator follow-up:** sync with product on homepage tiles; capture decision log entry if merchandising changes deployed.

> **Next steps:**
> - Validate metrics against staging data once Supabase sync is stable.
> - Layer screenshots and annotations before distributing to operators.
