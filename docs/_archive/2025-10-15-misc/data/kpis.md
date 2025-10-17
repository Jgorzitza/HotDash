---
epoch: 2025.10.E1
doc: docs/data/kpis.md
owner: data
last_reviewed: 2025-10-05
doc_hash: TBD
expires: 2025-10-19
---

# KPI Definitions — Operator Control Center

## Purpose

This document defines the key performance indicators (KPIs) surfaced in the Operator Control Center dashboard. Each KPI includes calculation logic, data sources, and anomaly thresholds to ensure consistent interpretation across tiles and enable reproducible analysis.

---

## 1. Sales Delta (Shopify)

### Definition

Percentage change in revenue comparing current period to baseline period.

### Calculation

```
sales_delta = ((current_revenue - baseline_revenue) / baseline_revenue) * 100
```

### Data Sources

- **Primary**: `Shopify Admin GraphQL` → `orders` query
- **Fields**: `currentTotalPriceSet.shopMoney.amount`, `createdAt`
- **Fact Type**: `shopify.sales.summary`

### Periods

- **Current**: Last 24 hours (configurable via `SHOPIFY_SALES_WINDOW_DAYS`, default=1)
- **Baseline**: Rolling 7-day average (excluding current period)

### Anomaly Threshold

- **Warning**: `|sales_delta| > 15%`
- **Critical**: `|sales_delta| > 30%`

### Context & Assumptions

- Currency normalization: uses `shopMoney` (shop's base currency)
- Excludes: cancelled orders, test orders
- Includes: partial payments, pending fulfillment
- Timezone: UTC (operators should interpret relative to shop's configured timezone)

### Usage

- **Tile**: Sales Pulse (Shopify Orders)
- **Action**: Flag drops for investigation, surface top-performing SKUs for inventory planning

---

## 2. SLA Breach Rate (Chatwoot)

### Definition

Percentage of conversations exceeding response time SLA in the last 24 hours.

### Calculation

```
sla_breach_rate = (breached_conversations / total_open_conversations) * 100

where:
  breached_conversations = count(conversations where age_minutes > sla_threshold_minutes AND status != "resolved")
  age_minutes = (now - last_customer_message_timestamp) / 60_000
```

### Data Sources

- **Primary**: `Chatwoot REST API` → `/api/v1/accounts/{account_id}/conversations`
- **Fields**: `last_activity_at`, `status`, `messages[]`
- **Fact Type**: `chatwoot.sla.breaches`

### SLA Thresholds

- **Default**: 60 minutes (configurable via `CHATWOOT_SLA_MINUTES`)
- **Priority conversations**: 30 minutes (tag-based or assignee override)

### Anomaly Threshold

- **Warning**: `sla_breach_rate > 20%`
- **Critical**: `sla_breach_rate > 40%`

### Context & Assumptions

- Clock starts on **last customer message** timestamp (excludes agent-only updates)
- Paused/snoozed conversations: excluded from denominator
- Business hours: not yet implemented; assumes 24/7 support
- Timezone: conversation timestamps are UTC; displayed in operator's local time

### Usage

- **Tile**: CX Escalations (Chatwoot)
- **Action**: Surface breached conversations for immediate triage, suggest auto-replies

---

## 3. Traffic Anomalies (Google Analytics)

### Definition

Landing pages with week-over-week session drop exceeding threshold.

### Calculation

```
wow_delta = ((current_week_sessions - previous_week_sessions) / previous_week_sessions)

anomaly_flag = (wow_delta <= -0.20)  # 20% or greater drop
```

### Data Sources

- **Primary**: `Google Analytics MCP` → `/sessions/landing-pages` (when live)
- **Fallback**: Mock client (`app/services/ga/mockClient.ts`) until credentials configured
- **Fields**: `landingPage`, `sessions`, `dateRange`
- **Fact Type**: `ga.sessions.anomalies`

### Periods

- **Current week**: Last 7 days
- **Previous week**: Days 8-14 prior to current date

### Anomaly Threshold

- **Warning**: `wow_delta <= -0.20` (20% drop)
- **Critical**: `wow_delta <= -0.40` (40% drop)

### Context & Assumptions

- Session definition: GA4 standard (user-scoped with 30-minute inactivity timeout)
- Excludes: bot traffic (per GA filters), internal IPs if configured
- Sampling: full data expected (no sampling flag tolerance yet)
- Attribution window: sessions counted on landing page entry, not full path

### Usage

- **Tile**: SEO & Content Watch
- **Action**: Trigger content refresh review, link to CMS entry for edits

---

## 4. Inventory Days of Cover (Shopify)

### Definition

Estimated days until SKU stockout based on recent sales velocity.

### Calculation

```
velocity_per_day = total_quantity_sold_last_14_days / 14

days_of_cover = current_inventory_level / velocity_per_day

low_stock_flag = (days_of_cover <= low_stock_threshold_days)
```

### Data Sources

- **Inventory**: `Shopify Admin GraphQL` → `productVariants.inventoryQuantity`
- **Sales velocity**: Derived from `orders.lineItems` (rolling 14 days)
- **Fact Type**: `shopify.inventory.coverage`

### Thresholds

- **Low stock warning**: `days_of_cover <= 7` (configurable via `INVENTORY_LOW_STOCK_DAYS`)
- **Critical**: `days_of_cover <= 3`
- **Velocity floor**: If `velocity_per_day < 0.1`, flag as "slow mover" (no reorder urgency)

### Context & Assumptions

- Multi-location: aggregates inventory across all Shopify locations
- Excludes: SKUs marked as "continue selling when out of stock"
- Seasonality: not yet adjusted; uses simple linear velocity
- Pending orders: not deducted from available inventory

### Usage

- **Tile**: Inventory Heatmap (Shopify Inventory)
- **Action**: Recommend reorder quantity, create draft PO or mark as intentional low stock

---

## 5. Fulfillment Issue Rate (Shopify)

### Definition

Percentage of recent orders with non-fulfilled status exceeding expected processing window.

### Calculation

```
fulfillment_issue_rate = (pending_orders / total_orders) * 100

where:
  pending_orders = count(orders where displayFulfillmentStatus != "FULFILLED" AND age_hours > processing_window_hours)
  age_hours = (now - createdAt) / 3_600_000
```

### Data Sources

- **Primary**: `Shopify Admin GraphQL` → `orders.displayFulfillmentStatus`
- **Fact Type**: `shopify.fulfillment.issues`

### Thresholds

- **Processing window**: 24 hours (configurable via `FULFILLMENT_WINDOW_HOURS`)
- **Warning**: `fulfillment_issue_rate > 10%`
- **Critical**: `fulfillment_issue_rate > 25%`

### Context & Assumptions

- Excludes: draft orders, archived orders
- Digital products: no separate handling yet (physical fulfillment assumptions)
- Holidays/weekends: not adjusted; assumes continuous operations

### Usage

- **Tile**: Sales Pulse (Shopify Orders)
- **Action**: Flag for manual review, trigger high-priority fulfillment queue

---

## Metadata & Governance

### Versioning

- KPI definitions versioned per epoch (current: `2025.10.E1`)
- Changes require review and migration plan if historical data affected

### Evidence Requirements

- All KPI calculations logged to `DashboardFact` with:
  - `factType`: scoped metric identifier
  - `value`: JSON payload with raw inputs + calculated result
  - `metadata`: config parameters, timestamps, assumptions
  - `evidenceUrl`: optional link to supporting docs/artifacts

### Schema Drift Protocol

- Data agent monitors schema changes in upstream APIs (Shopify/Chatwoot/GA)
- Any field removal, type change, or semantic shift flagged in `feedback/data.md` within 24 hours
- Manager review required before adapting queries

### Forecasting (Roadmap)

- Future: Implement exponential smoothing for seasonality-adjusted KPIs
- Memory service to store forecast parameters and prediction intervals
- Surface assumptions (e.g., "assumes 2-week trend stable") alongside facts

---

## References

- Strategy: `docs/strategy/initial_delivery_plan.md`
- Schema: `prisma/schema.prisma` (`DashboardFact`, `DecisionLog`)
- Services: `app/services/shopify/`, `app/services/chatwoot/`, `app/services/ga/`
- Direction: `docs/directions/data.md`
