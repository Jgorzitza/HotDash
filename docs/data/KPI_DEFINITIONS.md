# Hot Rod AN Dashboard KPI Definitions

**Purpose**: Define all KPIs tracked across the 5 dashboard tiles  
**Last Updated**: 2025-10-12  
**Owner**: DATA Agent

---

## Tile 1: Sales Pulse

### Primary KPIs

#### 1. Total Revenue (Daily)
- **Definition**: Sum of all completed order values for the current day
- **Data Source**: `sales_metrics_daily.total_revenue`
- **Target**: Track growth toward $10MM annual goal
- **Calculation**: `SUM(order.total_price) WHERE order.financial_status = 'paid'`
- **Update Frequency**: Daily at EOD
- **Alert Threshold**: < 90% of 7-day average

#### 2. Total Orders (Daily)
- **Definition**: Count of all orders placed on current day
- **Data Source**: `sales_metrics_daily.total_orders`
- **Target**: Maintain steady growth WoW
- **Calculation**: `COUNT(orders) WHERE DATE(created_at) = CURRENT_DATE`
- **Update Frequency**: Daily
- **Alert Threshold**: < 80% of 7-day average

#### 3. Average Order Value (AOV)
- **Definition**: Average revenue per order
- **Data Source**: `sales_metrics_daily.avg_order_value`
- **Target**: $250+ AOV (hot rod parts are premium)
- **Calculation**: `total_revenue / total_orders`
- **Update Frequency**: Daily
- **Alert Threshold**: < $200

#### 4. Revenue Growth (Week-over-Week %)
- **Definition**: Percentage change vs. same day last week
- **Data Source**: `sales_metrics_daily.revenue_vs_last_week_pct`
- **Target**: +10% WoW minimum
- **Calculation**: `((current_day_revenue - same_day_last_week) / same_day_last_week) * 100`
- **Update Frequency**: Daily
- **Alert Threshold**: < 0% (negative growth)

#### 5. Fulfillment Rate (%)
- **Definition**: Percentage of orders fulfilled on time (within SLA)
- **Data Source**: `sales_metrics_daily.fulfillment_rate_pct`
- **Target**: 95%+ fulfillment rate
- **Calculation**: `(orders_fulfilled / total_orders) * 100`
- **Update Frequency**: Daily
- **Alert Threshold**: < 90%

### Secondary KPIs

- **Top 5 SKUs by Revenue (30-day)**: Track best-selling products
- **Trending Products**: SKUs with >20% WoW growth
- **Sales Velocity by Category**: Which automotive categories are performing

---

## Tile 2: Inventory Heatmap

### Primary KPIs

#### 1. Critical Inventory Alerts
- **Definition**: Count of SKUs that are out of stock or <3 days of cover
- **Data Source**: `v_inventory_alerts WHERE alert_severity = 'critical'`
- **Target**: 0 critical alerts
- **Calculation**: `COUNT(*) WHERE (stock_status = 'out_of_stock' OR days_of_cover < 3)`
- **Update Frequency**: Daily
- **Alert Threshold**: > 5 critical items

#### 2. Low Stock Items
- **Definition**: SKUs with 3-7 days of inventory remaining
- **Data Source**: `v_inventory_alerts WHERE alert_severity = 'high'`
- **Target**: < 10 items in low stock state
- **Calculation**: `COUNT(*) WHERE stock_status = 'low_stock' AND days_of_cover BETWEEN 3 AND 7`
- **Update Frequency**: Daily
- **Alert Threshold**: > 20 items

#### 3. Overstock Items
- **Definition**: SKUs with >90 days of cover
- **Data Source**: `v_inventory_alerts WHERE stock_status = 'overstock'`
- **Target**: Minimize overstock to free capital
- **Calculation**: `COUNT(*) WHERE days_of_cover > 90`
- **Update Frequency**: Weekly
- **Alert Threshold**: > 30 items

#### 4. Average Days of Cover
- **Definition**: Average days until stockout across all SKUs
- **Data Source**: `AVG(inventory_snapshots.days_of_cover)`
- **Target**: 30-45 days (optimal inventory turnover)
- **Calculation**: `AVG(days_of_cover) WHERE stock_status = 'in_stock'`
- **Update Frequency**: Daily
- **Alert Threshold**: < 15 days

#### 5. Fast-Moving SKU Count
- **Definition**: Number of SKUs in "fast" velocity tier
- **Data Source**: `COUNT(*) FROM inventory_snapshots WHERE velocity_tier = 'fast'`
- **Target**: 20%+ of catalog should be fast-moving
- **Calculation**: `COUNT(*) WHERE velocity_tier = 'fast'`
- **Update Frequency**: Daily
- **Alert Threshold**: < 10% of catalog

---

## Tile 3: Fulfillment Health

### Primary KPIs

#### 1. SLA Breach Count
- **Definition**: Orders exceeding 2-day fulfillment SLA
- **Data Source**: `fulfillment_tracking WHERE is_sla_breach = true`
- **Target**: 0 SLA breaches
- **Calculation**: `COUNT(*) WHERE days_to_fulfill > sla_threshold_days`
- **Update Frequency**: Real-time
- **Alert Threshold**: > 3 breaches

#### 2. Average Days to Fulfill
- **Definition**: Average time from order to fulfillment
- **Data Source**: `AVG(fulfillment_tracking.days_to_fulfill)`
- **Target**: < 1.5 days average
- **Calculation**: `AVG(EXTRACT(DAYS FROM fulfilled_at - order_created_at))`
- **Update Frequency**: Daily
- **Alert Threshold**: > 2 days

#### 3. Critical Fulfillment Issues
- **Definition**: Orders with critical/high severity fulfillment problems
- **Data Source**: `v_fulfillment_issues WHERE issue_severity IN ('critical', 'high')`
- **Target**: 0 critical issues
- **Calculation**: `COUNT(*) WHERE has_issue = true AND issue_severity IN ('critical', 'high')`
- **Update Frequency**: Real-time
- **Alert Threshold**: > 2 issues

#### 4. Priority Customer Orders at Risk
- **Definition**: High-value customer orders with fulfillment delays
- **Data Source**: `fulfillment_tracking WHERE is_priority_customer = true AND has_issue = true`
- **Target**: 0 at-risk priority orders
- **Calculation**: `COUNT(*) WHERE is_priority_customer AND (is_sla_breach OR has_issue)`
- **Update Frequency**: Real-time
- **Alert Threshold**: > 1 order

#### 5. Fulfillment Success Rate (30-day)
- **Definition**: Percentage of orders fulfilled without issues
- **Data Source**: `(COUNT(*) - COUNT(has_issue = true)) / COUNT(*)`
- **Target**: 98%+ success rate
- **Calculation**: `((total_orders - orders_with_issues) / total_orders) * 100`
- **Update Frequency**: Daily
- **Alert Threshold**: < 95%

---

## Tile 4: CX Escalations

### Primary KPIs

#### 1. Active Escalations
- **Definition**: Open conversations flagged as escalated or SLA breach
- **Data Source**: `v_cx_escalations WHERE status IN ('open', 'pending')`
- **Target**: 0 active escalations
- **Calculation**: `COUNT(*) WHERE is_escalated = true AND status NOT IN ('resolved', 'closed')`
- **Update Frequency**: Real-time
- **Alert Threshold**: > 3 escalations

#### 2. SLA Breach Rate
- **Definition**: Percentage of conversations exceeding 2-hour response SLA
- **Data Source**: `cx_conversations WHERE is_sla_breach = true`
- **Target**: < 2% SLA breach rate
- **Calculation**: `(COUNT(is_sla_breach = true) / COUNT(*)) * 100`
- **Update Frequency**: Hourly
- **Alert Threshold**: > 5%

#### 3. Average First Response Time
- **Definition**: Average minutes to first agent response
- **Data Source**: `AVG(cx_conversations.first_response_time_minutes)`
- **Target**: < 30 minutes average
- **Calculation**: `AVG(first_response_time_minutes)`
- **Update Frequency**: Daily
- **Alert Threshold**: > 60 minutes

#### 4. Average Resolution Time
- **Definition**: Average hours to close conversation
- **Data Source**: `AVG(cx_conversations.resolution_time_hours)`
- **Target**: < 4 hours average
- **Calculation**: `AVG(resolution_time_hours) WHERE status = 'resolved'`
- **Update Frequency**: Daily
- **Alert Threshold**: > 8 hours

#### 5. Negative Sentiment Count
- **Definition**: Conversations with negative or very negative sentiment
- **Data Source**: `cx_conversations WHERE sentiment IN ('negative', 'very_negative')`
- **Target**: < 10% negative sentiment
- **Calculation**: `COUNT(*) WHERE sentiment IN ('negative', 'very_negative')`
- **Update Frequency**: Real-time
- **Alert Threshold**: > 15% of conversations

---

## Tile 5: Ops Metrics

### Primary KPIs

#### 1. Shop Activation Rate (7-day avg)
- **Definition**: Percentage of shops successfully activated
- **Data Source**: `shop_activation_metrics.activation_rate_7d_avg`
- **Target**: 85%+ activation rate
- **Calculation**: `(shops_activated / total_shops) * 100, 7-day rolling average`
- **Update Frequency**: Daily
- **Alert Threshold**: < 75%

#### 2. Operator SLA Resolution Rate
- **Definition**: Percentage of SLA breaches successfully resolved
- **Data Source**: `v_sla_performance_7d.resolution_rate_pct`
- **Target**: 100% resolution rate
- **Calculation**: `(sla_breaches_resolved / sla_breaches_detected) * 100`
- **Update Frequency**: Daily
- **Alert Threshold**: < 90%

#### 3. Median Operator Response Time
- **Definition**: Median time for operators to act on SLA breaches
- **Data Source**: `operator_sla_resolution.median_response_time`
- **Target**: < 15 minutes median
- **Calculation**: `PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY response_time_minutes)`
- **Update Frequency**: Daily
- **Alert Threshold**: > 30 minutes

#### 4. P90 Response Time
- **Definition**: 90th percentile operator response time
- **Data Source**: `operator_sla_resolution.p90_response_time`
- **Target**: < 45 minutes P90
- **Calculation**: `PERCENTILE_CONT(0.9) WITHIN GROUP (ORDER BY response_time_minutes)`
- **Update Frequency**: Daily
- **Alert Threshold**: > 60 minutes

#### 5. Active Operator Count (7-day)
- **Definition**: Number of operators actively resolving issues
- **Data Source**: `COUNT(DISTINCT operator_id) FROM v_sla_performance_7d`
- **Target**: Maintain 2+ active operators
- **Calculation**: `COUNT(DISTINCT operator_id) WHERE days_active > 0`
- **Update Frequency**: Daily
- **Alert Threshold**: < 2 operators

---

## Growth & Business Health KPIs

### Revenue Milestones ($1MM → $10MM)

#### 1. YTD Revenue
- **Definition**: Total revenue year-to-date
- **Data Source**: `v_growth_milestones.ytd_revenue`
- **Target**: Track progress to $10MM
- **Calculation**: `SUM(monthly_revenue) WHERE month >= JAN 1 current year`
- **Update Frequency**: Monthly
- **Milestone Tiers**:
  - Pre-$1MM: Foundation
  - $1MM-$5MM: Growth
  - $5MM-$10MM: Scale
  - $10MM+: Target achieved

#### 2. Progress to $10MM (%)
- **Definition**: Percentage of $10MM goal achieved
- **Data Source**: `v_growth_milestones.progress_to_10mm_pct`
- **Target**: 100% by EOY
- **Calculation**: `(ytd_revenue / 10,000,000) * 100`
- **Update Frequency**: Monthly
- **Milestones**: 25% (Q1), 50% (Q2), 75% (Q3), 100% (Q4)

#### 3. Trailing 3-Month Average
- **Definition**: 3-month rolling average monthly revenue
- **Data Source**: `v_growth_milestones.trailing_3mo_avg`
- **Target**: Steady upward trend
- **Calculation**: `AVG(monthly_revenue) OVER (ORDER BY month ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)`
- **Update Frequency**: Monthly
- **Alert Threshold**: Declining trend for 2+ months

### CEO Time Savings (Rec #1 from 10X Plan)

#### 1. Daily Time Saved (Hours)
- **Definition**: CEO hours saved through automation
- **Data Source**: `v_ceo_time_savings_30d.total_hours_saved`
- **Target**: 2+ hours/day saved
- **Calculation**: `SUM(all time categories) / 60 minutes`
- **Update Frequency**: Daily
- **Value**: Assumes $200/hour CEO time

#### 2. YTD Time Saved (Days)
- **Definition**: Total CEO days saved year-to-date
- **Data Source**: `v_ceo_time_savings_ytd.total_days_saved_ytd`
- **Target**: 30+ days saved per year
- **Calculation**: `SUM(daily_hours_saved) / 24 hours`
- **Update Frequency**: Daily
- **Value**: Track ROI of automation investment

#### 3. Estimated Value Saved ($)
- **Definition**: Dollar value of CEO time saved
- **Data Source**: `v_ceo_time_savings_ytd.total_value_saved_ytd`
- **Target**: $100K+ value saved annually
- **Calculation**: `(total_hours_saved * $200/hour)`
- **Update Frequency**: Daily
- **Business Impact**: Quantifies automation ROI

---

## Data Quality KPIs

### 1. Data Freshness Score
- **Definition**: Percentage of tables updated within expected timeframe
- **Data Source**: `v_data_freshness`
- **Target**: 100% "fresh" or "acceptable" status
- **Alert Threshold**: Any table showing "stale" or "critical"

### 2. Data Quality Issues
- **Definition**: Count of automated data quality check failures
- **Data Source**: `COUNT(*) FROM v_data_quality_checks`
- **Target**: 0 quality issues
- **Alert Threshold**: Any check with >0 issue_count

### 3. Missing Data Points
- **Definition**: Critical fields with NULL values where data expected
- **Target**: < 1% missing data
- **Alert Threshold**: > 5% missing in any critical field

---

## Performance KPIs

### Query Performance Targets

| View/Query | Target Latency | Alert Threshold |
|------------|----------------|-----------------|
| `v_sales_pulse_current` | < 200ms | > 500ms |
| `v_inventory_alerts` | < 200ms | > 500ms |
| `v_fulfillment_issues` | < 200ms | > 500ms |
| `v_cx_escalations` | < 200ms | > 500ms |
| `v_activation_rate_7d` | < 200ms | > 500ms |
| `v_kpi_summary` | < 300ms | > 800ms |
| `v_growth_milestones` | < 300ms | > 800ms |

### Database Health

- **Active Connections**: < 80% of connection pool
- **Query Success Rate**: > 99.5%
- **Cache Hit Ratio**: > 95%
- **Index Usage**: All indexes showing usage within 7 days of data population

---

## Customer Segment KPIs

### Segment Distribution Targets

| Segment | Expected % | High-Value Indicator |
|---------|-----------|---------------------|
| DIY Builder | 35-45% | AOV $150-250 |
| Professional Shop | 15-25% | AOV $500-1000+ |
| Enthusiast Collector | 20-30% | AOV $300-600 |
| First-time Builder | 10-15% | AOV $100-200 |
| Racing Enthusiast | 10-15% | AOV $250-500 |

### Lifecycle Stage Health

- **New Customers** (< 30 days): 15-20% of base
- **Active** (regular purchasers): 50-60% of base
- **At Risk** (90+ days no purchase): < 20%
- **Churned** (180+ days): < 10%
- **Reactivated**: Track as growth opportunity

---

## Operational Excellence KPIs

### Automation Impact

1. **Manual Actions Avoided/Day**: Target 100+ actions
2. **Automation Success Rate**: > 95%
3. **Operator Workload Reduction**: Track hours saved per operator

### System Reliability

1. **Data Pipeline Uptime**: 99.9%
2. **ETL Job Success Rate**: > 99%
3. **API Call Success Rate**: > 99.5% (Shopify, Chatwoot, GA)

---

## KPI Dashboard Hierarchy

```
Level 1 (Executive): North Star Metrics
├─ YTD Revenue & Progress to $10MM
├─ CEO Time Saved (Days)
└─ Active Critical Alerts (across all tiles)

Level 2 (Operational): Daily KPIs
├─ Tile 1: Revenue, Orders, AOV, Growth %
├─ Tile 2: Critical Inventory Alerts
├─ Tile 3: SLA Breaches, Fulfillment Issues
├─ Tile 4: CX Escalations, Response Time
└─ Tile 5: Activation Rate, Operator Performance

Level 3 (Analytical): Trend Analysis
├─ 30-day revenue trends
├─ Category performance trends
├─ Customer segment evolution
└─ Inventory velocity patterns
```

---

## Alert Priority Matrix

| Severity | Response Time | Escalation Path |
|----------|---------------|-----------------|
| **Critical** | Immediate (< 5 min) | Alert CEO + All operators |
| **High** | < 30 minutes | Alert operator on duty |
| **Medium** | < 2 hours | Queue for next operator review |
| **Low** | < 24 hours | Daily digest |

### Critical Alert Triggers

- Revenue drop > 30% WoW
- > 5 critical inventory items
- > 3 SLA breaches active
- > 5 urgent CX escalations
- Activation rate < 50%
- Any data quality check failure

---

## KPI Refresh Schedules

| Data Set | Refresh Frequency | Refresh Time (UTC) |
|----------|------------------|-------------------|
| Sales metrics | Daily | 00:30 (after EOD) |
| Inventory snapshots | Daily | 01:00 |
| Fulfillment tracking | Real-time | Continuous |
| CX conversations | Real-time | Continuous |
| Shop activation | Daily | 02:00 |
| Growth metrics | Monthly | 1st of month, 03:00 |
| CEO time savings | Daily | 23:55 |

---

## Query Optimization Notes

All dashboard queries are optimized for:
- **Indexed columns**: All WHERE/ORDER BY columns indexed
- **Materialized views**: Consider for complex aggregations
- **Partitioning**: Time-series data ready for partitioning if needed
- **Caching**: Frontend should cache dashboard data for 5 minutes

---

**Note**: All KPIs assume data is populated via ETL pipelines from Shopify, Chatwoot, and Google Analytics. KPIs are placeholder-ready and will become actionable once data ingestion is complete.

