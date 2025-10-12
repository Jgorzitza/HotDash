# Hot Rod AN Dashboard KPI Definitions

**Version**: 1.0  
**Created**: 2025-10-12  
**Owner**: DATA Agent

---

## Tile 1: Sales Pulse

### KPI 1.1: Daily Revenue
- **Calculation**: SUM(order.total_price) WHERE order.created_at = CURRENT_DATE
- **Target**: $5,000/day (path to $1.8MM/year)
- **Alert Threshold**: <$3,000/day (RED), $3,000-$4,000 (YELLOW)
- **Data Source**: `sales_metrics_daily.total_revenue`

### KPI 1.2: Revenue Growth (WoW)
- **Calculation**: ((this_week_revenue - last_week_revenue) / last_week_revenue) * 100
- **Target**: +10% WoW
- **Alert Threshold**: <0% (RED), 0-5% (YELLOW)
- **Data Source**: `sales_metrics_daily.revenue_vs_last_week_pct`

### KPI 1.3: Average Order Value (AOV)
- **Calculation**: total_revenue / total_orders
- **Target**: $250 (hot rod parts are high-value)
- **Alert Threshold**: <$150 (RED), $150-$200 (YELLOW)
- **Data Source**: `sales_metrics_daily.avg_order_value`

### KPI 1.4: Top 5 SKUs Revenue
- **Calculation**: SUM(revenue_30d) GROUP BY sku ORDER BY revenue_30d DESC LIMIT 5
- **Target**: Top 5 should account for 30-40% of revenue
- **Data Source**: `sku_performance.revenue_30d`

---

## Tile 2: Inventory Heatmap

### KPI 2.1: Low Stock Items
- **Calculation**: COUNT(*) WHERE stock_status = 'low_stock'
- **Target**: <10 SKUs
- **Alert Threshold**: >20 (RED), 10-20 (YELLOW)
- **Data Source**: `v_inventory_alerts WHERE alert_severity IN ('high', 'critical')`

### KPI 2.2: Out of Stock Items
- **Calculation**: COUNT(*) WHERE stock_status = 'out_of_stock'
- **Target**: 0 SKUs
- **Alert Threshold**: >5 (RED), 1-5 (YELLOW)
- **Data Source**: `inventory_snapshots.stock_status = 'out_of_stock'`

### KPI 2.3: Days of Cover (Avg)
- **Calculation**: AVG(days_of_cover) WHERE stock_status = 'in_stock'
- **Target**: 21-30 days
- **Alert Threshold**: <14 days (RED), 14-20 days (YELLOW)
- **Data Source**: `inventory_snapshots.days_of_cover`

### KPI 2.4: Inventory Velocity
- **Calculation**: Distribution of velocity_tier (fast/medium/slow/stagnant)
- **Target**: 40% fast, 40% medium, 15% slow, 5% stagnant
- **Alert Threshold**: >10% stagnant (YELLOW)
- **Data Source**: `inventory_snapshots.velocity_tier`

---

## Tile 3: Fulfillment Health

### KPI 3.1: Orders Pending Fulfillment
- **Calculation**: COUNT(*) WHERE fulfillment_status IN ('unfulfilled', 'partial')
- **Target**: <20 orders
- **Alert Threshold**: >50 (RED), 20-50 (YELLOW)
- **Data Source**: `fulfillment_tracking WHERE fulfillment_status IN ('unfulfilled', 'partial')`

### KPI 3.2: SLA Breach Rate
- **Calculation**: (COUNT(*) WHERE is_sla_breach = true) / total_orders * 100
- **Target**: <5%
- **Alert Threshold**: >10% (RED), 5-10% (YELLOW)
- **Data Source**: `fulfillment_tracking.is_sla_breach`

### KPI 3.3: Average Days to Fulfill
- **Calculation**: AVG(days_to_fulfill) WHERE fulfillment_status = 'fulfilled'
- **Target**: <2 days
- **Alert Threshold**: >3 days (RED), 2-3 days (YELLOW)
- **Data Source**: `fulfillment_tracking.days_to_fulfill`

### KPI 3.4: Fulfillment Issues
- **Calculation**: COUNT(*) WHERE has_issue = true
- **Target**: <5 issues/day
- **Alert Threshold**: >15 (RED), 5-15 (YELLOW)
- **Data Source**: `v_fulfillment_issues`

---

## Tile 4: CX Escalations

### KPI 4.1: Open Escalations
- **Calculation**: COUNT(*) WHERE is_escalated = true AND status IN ('open', 'pending')
- **Target**: <10 escalations
- **Alert Threshold**: >25 (RED), 10-25 (YELLOW)
- **Data Source**: `v_cx_escalations WHERE status IN ('open', 'pending')`

### KPI 4.2: SLA Breach Rate (CX)
- **Calculation**: (COUNT(*) WHERE is_sla_breach = true) / total_conversations * 100
- **Target**: <10%
- **Alert Threshold**: >20% (RED), 10-20% (YELLOW)
- **Data Source**: `cx_conversations.is_sla_breach`

### KPI 4.3: First Response Time (Median)
- **Calculation**: MEDIAN(first_response_time_minutes)
- **Target**: <30 minutes
- **Alert Threshold**: >60 min (RED), 30-60 min (YELLOW)
- **Data Source**: `cx_conversations.first_response_time_minutes`

### KPI 4.4: Negative Sentiment %
- **Calculation**: COUNT(*) WHERE sentiment IN ('negative', 'very_negative') / total * 100
- **Target**: <15%
- **Alert Threshold**: >30% (RED), 15-30% (YELLOW)
- **Data Source**: `cx_conversations.sentiment`

---

## Tile 5: Ops Metrics

### KPI 5.1: Shop Activation Rate (7d)
- **Calculation**: AVG(activation_rate_pct) last 7 days
- **Target**: >80%
- **Alert Threshold**: <60% (RED), 60-70% (YELLOW)
- **Data Source**: `v_activation_rate_7d`

### KPI 5.2: Operator SLA Resolution (Median)
- **Calculation**: MEDIAN(median_response_time) across all operators
- **Target**: <45 minutes
- **Alert Threshold**: >90 min (RED), 45-90 min (YELLOW)
- **Data Source**: `v_sla_resolution_7d`

### KPI 5.3: Operator Resolution Rate
- **Calculation**: (SUM(sla_breaches_resolved) / SUM(sla_breaches_detected)) * 100
- **Target**: >85%
- **Alert Threshold**: <70% (RED), 70-80% (YELLOW)
- **Data Source**: `operator_sla_resolution`

---

## Growth Metrics KPIs

### KPI G.1: Monthly Recurring Revenue (MRR)
- **Calculation**: AVG(total_revenue) for current month
- **Target**: Progressive growth toward $10MM/year
- **Milestone Targets**:
  - $83K/month → $1MM/year
  - $417K/month → $5MM/year
  - $833K/month → $10MM/year

### KPI G.2: Year-to-Date Revenue
- **Calculation**: SUM(total_revenue) WHERE YEAR(date) = CURRENT_YEAR
- **Target**: On track to $10MM (pro-rated)
- **Data Source**: `v_kpi_summary.ytd_revenue`

### KPI G.3: Revenue Growth Rate (MoM)
- **Calculation**: ((current_month - prior_month) / prior_month) * 100
- **Target**: +15% MoM (required for $10MM in 3 years)
- **Alert Threshold**: <5% (YELLOW), <0% (RED)

---

## Data Quality KPIs

### KPI Q.1: Data Freshness
- **Calculation**: MAX(snapshot_date) for each table
- **Target**: Updated within last 24 hours
- **Alert Threshold**: >48 hours (RED)
- **Data Source**: `v_data_freshness_monitoring`

### KPI Q.2: Data Completeness
- **Calculation**: AVG(completeness_pct) across all tables
- **Target**: >95%
- **Alert Threshold**: <90% (YELLOW), <85% (RED)
- **Data Source**: `v_data_completeness_metrics`

### KPI Q.3: Critical Data Issues
- **Calculation**: COUNT(*) WHERE severity = 'CRITICAL'
- **Target**: 0 critical issues
- **Alert Threshold**: >0 (RED)
- **Data Source**: `v_data_quality_comprehensive`

---

## Operator Performance KPIs

### KPI O.1: Top Performers
- **Calculation**: COUNT(*) WHERE performance_tier = 'TOP_PERFORMER'
- **Target**: At least 3 top performers
- **Data Source**: `v_operator_rankings`

### KPI O.2: Average Efficiency Score
- **Calculation**: AVG(efficiency_score) across all operators
- **Target**: >70
- **Alert Threshold**: <50 (YELLOW)
- **Data Source**: `v_operator_rankings.efficiency_score`

---

## CEO Time Savings KPIs

### KPI T.1: Weekly Time Saved
- **Calculation**: SUM(all_time_saved_fields) / 60 for last 7 days
- **Target**: >10 hours/week
- **Data Source**: `v_ceo_time_savings_30d`

### KPI T.2: YTD Time Saved
- **Calculation**: SUM(all_time_saved_fields) / 60 for YTD
- **Target**: >500 hours/year
- **Dollar Value**: hours * $200/hour
- **Data Source**: `v_ceo_time_savings_ytd`

---

**End of KPI Definitions**
