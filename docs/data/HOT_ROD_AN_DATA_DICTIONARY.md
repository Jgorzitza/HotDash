# Hot Rod AN Data Dictionary

**Version**: 1.0  
**Last Updated**: 2025-10-12  
**Owner**: DATA Agent  
**Database**: Supabase PostgreSQL

---

## 📋 Table of Contents

1. [Tables](#tables)
2. [Views](#views)
3. [Functions](#functions)
4. [Indexes](#indexes)
5. [RLS Policies](#rls-policies)

---

## 🗄️ TABLES

### 1. product_categories

**Purpose**: Automotive parts taxonomy with vehicle compatibility tracking

**Columns**:
- `id` (uuid, PK): Unique identifier
- `shopify_product_id` (bigint, unique): Shopify product reference
- `category_l1` (text): Top-level category (e.g., "Engine Parts")
- `category_l2` (text): Mid-level category (e.g., "Carburetors")
- `category_l3` (text): Detail category (e.g., "Holley 4-Barrel")
- `fits_vehicle_years` (int[]): Array of compatible years
- `fits_makes` (text[]): Array of compatible makes
- `fits_models` (text[]): Array of compatible models
- `is_performance_part` (boolean): Performance upgrade flag
- `is_restoration_part` (boolean): Restoration part flag
- `is_custom_fabrication` (boolean): Custom fab flag
- `avg_order_value` (numeric): Average order value
- `margin_pct` (numeric): Profit margin percentage
- `inventory_velocity` (text): fast/medium/slow
- `created_at` (timestamptz): Record creation
- `updated_at` (timestamptz): Last update

**Indexes**:
- `idx_product_categories_shopify_id` on shopify_product_id
- `idx_product_categories_category_l1` on category_l1
- `idx_product_categories_vehicle_years` (GIN) on fits_vehicle_years

**RLS Policies**:
- `product_categories_service_role`: Full access for service_role
- `product_categories_operators_read`: Read-only for operators

---

### 2. customer_segments

**Purpose**: Hot Rod customer segmentation (5 personas)

**Columns**:
- `id` (uuid, PK): Unique identifier
- `shopify_customer_id` (bigint, unique): Shopify customer reference
- `primary_segment` (text): DIY Builder / Professional Shop / Enthusiast Collector / First-time Builder / Racing Enthusiast
- `segment_confidence` (numeric): Confidence score (0-1)
- `total_orders` (int): Lifetime order count
- `total_revenue` (numeric): Lifetime revenue
- `avg_order_value` (numeric): Average order value
- `days_since_first_order` (int): Customer age in days
- `days_since_last_order` (int): Recency metric
- `top_category_l1/l2` (text): Preferred categories
- `prefers_performance/restoration` (boolean): Part preference flags
- `primary_vehicle_year/make/model` (int/text): Primary vehicle
- `support_tickets_count` (int): CX interaction count
- `review_count` (int): Review engagement
- `avg_review_rating` (numeric): Average rating
- `lifecycle_stage` (text): new/active/at_risk/churned/reactivated
- `segmented_at` (timestamptz): Segment assignment date
- `updated_at` (timestamptz): Last update

**Indexes**:
- `idx_customer_segments_shopify_id` on shopify_customer_id
- `idx_customer_segments_segment` on primary_segment
- `idx_customer_segments_lifecycle` on lifecycle_stage

**RLS Policies**:
- `customer_segments_service_role`: Full access
- `customer_segments_operators_read`: Read-only

---

### 3. sales_metrics_daily

**Purpose**: Daily sales aggregation for dashboard

**Columns**:
- `id` (uuid, PK): Unique identifier
- `date` (date, unique): Metric date
- `total_revenue` (numeric): Daily revenue
- `total_orders` (int): Daily order count
- `avg_order_value` (numeric): AOV
- `revenue_vs_last_week_pct` (numeric): WoW growth
- `orders_vs_last_week_pct` (numeric): WoW order growth
- `orders_fulfilled` (int): Fulfilled order count
- `fulfillment_rate_pct` (numeric): Fulfillment percentage
- `created_at` (timestamptz): Record creation
- `updated_at` (timestamptz): Last update

**Indexes**:
- `idx_sales_metrics_date` (DESC) on date

**RLS Policies**:
- `sales_metrics_service_role`: Full access
- `sales_metrics_operators_read`: Read-only

---

### 4. sku_performance

**Purpose**: SKU-level tracking with inventory and sales metrics

**Columns**:
- `id` (uuid, PK): Unique identifier
- `shopify_product_id` (bigint): Product reference
- `shopify_variant_id` (bigint): Variant reference
- `sku` (text): Stock keeping unit
- `revenue_30d` (numeric): 30-day revenue
- `units_sold_30d` (int): 30-day units sold
- `orders_30d` (int): 30-day order count
- `current_inventory` (int): Current stock level
- `days_of_inventory` (int): Days of cover
- `is_trending` (boolean): Trending flag
- `trend_direction` (text): up/down/stable
- `last_sale_at` (timestamptz): Most recent sale
- `created_at` (timestamptz): Record creation
- `updated_at` (timestamptz): Last update

**Indexes**:
- `idx_sku_performance_sku` on sku
- `idx_sku_performance_trending` (partial) WHERE is_trending = true

**RLS Policies**:
- `sku_performance_service_role`: Full access
- `sku_performance_operators_read`: Read-only

---

### 5. inventory_snapshots

**Purpose**: Daily inventory levels with velocity metrics

**Columns**:
- `id` (uuid, PK): Unique identifier
- `shopify_product_id` (bigint): Product reference
- `shopify_variant_id` (bigint): Variant reference
- `sku` (text): Stock keeping unit
- `snapshot_date` (date): Snapshot date
- `quantity_available` (int): Available stock
- `quantity_reserved` (int): Reserved stock
- `quantity_incoming` (int): Incoming stock
- `units_sold_7d/30d` (int): Sales velocity
- `avg_daily_sales` (numeric): Daily sales rate
- `days_of_cover` (int): Stock runway
- `reorder_point` (int): Reorder threshold
- `stock_status` (text): in_stock/low_stock/out_of_stock/overstock
- `velocity_tier` (text): fast/medium/slow/stagnant
- `created_at` (timestamptz): Record creation

**Indexes**:
- `idx_inventory_snapshots_date` (DESC) on snapshot_date
- `idx_inventory_snapshots_sku` on sku
- `idx_inventory_alerts` (partial) WHERE stock_status IN ('low_stock', 'out_of_stock')

**RLS Policies**:
- `inventory_snapshots_service_role`: Full access
- `inventory_snapshots_operators_read`: Read-only

---

### 6. fulfillment_tracking

**Purpose**: Order fulfillment status and SLA tracking

**Columns**:
- `id` (uuid, PK): Unique identifier
- `shopify_order_id` (bigint, unique): Order reference
- `order_number` (text): Display order number
- `fulfillment_status` (text): unfulfilled/partial/fulfilled/cancelled
- `days_to_fulfill` (int): Fulfillment duration
- `is_sla_breach` (boolean): SLA breach flag
- `sla_threshold_days` (int): SLA target (default: 2)
- `customer_segment` (text): Customer persona
- `is_priority_customer` (boolean): Priority flag
- `has_issue` (boolean): Issue flag
- `issue_type` (text): delayed_shipping/missing_items/damaged_goods/wrong_address/inventory_shortage
- `issue_severity` (text): low/medium/high/critical
- `order_created_at` (timestamptz): Order date
- `fulfilled_at` (timestamptz): Fulfillment date
- `sla_deadline` (timestamptz): SLA deadline
- `created_at` (timestamptz): Record creation
- `updated_at` (timestamptz): Last update

**Indexes**:
- `idx_fulfillment_order_id` on shopify_order_id
- `idx_fulfillment_status` on fulfillment_status
- `idx_fulfillment_issues` (partial) WHERE has_issue = true

**RLS Policies**:
- `fulfillment_tracking_service_role`: Full access
- `fulfillment_tracking_operators_read`: Read-only

---

### 7. cx_conversations

**Purpose**: Customer support conversation tracking with SLA and escalation data

**Columns**:
- `id` (uuid, PK): Unique identifier
- `chatwoot_conversation_id` (bigint, unique): Chatwoot reference
- `shopify_order_id` (bigint): Related order
- `customer_segment` (text): Customer persona
- `first_response_time_minutes` (int): First response time
- `resolution_time_hours` (numeric): Resolution duration
- `sla_target_minutes` (int): SLA target (default: 120)
- `is_sla_breach` (boolean): SLA breach flag
- `priority` (text): low/medium/high/urgent
- `sentiment` (text): positive/neutral/negative/very_negative
- `is_escalated` (boolean): Escalation flag
- `escalation_reason` (text): Escalation reason
- `escalated_at` (timestamptz): Escalation time
- `status` (text): open/pending/resolved/closed
- `conversation_created_at` (timestamptz): Conversation start
- `first_response_at` (timestamptz): First response time
- `resolved_at` (timestamptz): Resolution time
- `created_at` (timestamptz): Record creation
- `updated_at` (timestamptz): Last update

**Indexes**:
- `idx_cx_conversations_chatwoot_id` on chatwoot_conversation_id
- `idx_cx_conversations_status` on status
- `idx_cx_escalations` (partial) WHERE is_escalated = true

**RLS Policies**:
- `cx_conversations_service_role`: Full access
- `cx_conversations_operators_read`: Read-only

---

### 8. shop_activation_metrics

**Purpose**: Shop activation tracking

**Columns**:
- `id` (uuid, PK): Unique identifier
- `date` (date, unique): Metric date
- `total_shops` (int): Total shop count
- `shops_activated` (int): Activated shop count
- `activation_rate_pct` (numeric): Activation rate
- `activation_rate_7d_avg` (numeric): 7-day average
- `created_at` (timestamptz): Record creation
- `updated_at` (timestamptz): Last update

**Indexes**:
- `idx_shop_activation_date` (DESC) on date

**RLS Policies**:
- `shop_activation_service_role`: Full access
- `shop_activation_operators_read`: Read-only

---

### 9. operator_sla_resolution

**Purpose**: Operator response time tracking for SLA breaches

**Columns**:
- `id` (uuid, PK): Unique identifier
- `operator_id` (bigint): Operator reference
- `date` (date): Metric date
- `sla_breaches_detected` (int): Breaches detected
- `sla_breaches_resolved` (int): Breaches resolved
- `median_response_time` (numeric): Median response (minutes)
- `p90_response_time` (numeric): P90 response (minutes)
- `p95_response_time` (numeric): P95 response (minutes)
- `created_at` (timestamptz): Record creation
- `updated_at` (timestamptz): Last update

**Indexes**:
- `idx_operator_sla_date` (DESC) on date
- `idx_operator_sla_operator` on operator_id

**RLS Policies**:
- `operator_sla_service_role`: Full access
- `operator_sla_operators_read`: Read-only

---

### 10. ceo_time_savings

**Purpose**: Track CEO time saved (ROI tracking)

**Columns**:
- `id` (uuid, PK): Unique identifier
- `date` (date, unique): Metric date
- `time_saved_order_processing` (int): Minutes saved
- `time_saved_inventory_checks` (int): Minutes saved
- `time_saved_customer_support` (int): Minutes saved
- `time_saved_manual_reporting` (int): Minutes saved
- `time_saved_data_entry` (int): Minutes saved
- `automation_actions_count` (int): Automation count
- `manual_actions_avoided` (int): Manual actions avoided
- `created_at` (timestamptz): Record creation
- `updated_at` (timestamptz): Last update

**Indexes**:
- `idx_ceo_time_savings_date` (DESC) on date

**RLS Policies**:
- `ceo_time_savings_service_role`: Full access
- `ceo_time_savings_operators_read`: Read-only

---

## 📊 VIEWS

### Dashboard Views (Real-time)

1. **v_sales_pulse_current**: Real-time sales dashboard data
2. **v_inventory_alerts**: Low stock, out-of-stock, and overstock alerts
3. **v_fulfillment_issues**: Current fulfillment problems
4. **v_fulfillment_health_summary**: Aggregated fulfillment metrics
5. **v_cx_escalations**: Current escalations with severity
6. **v_cx_health_summary**: CX health metrics (7-day)
7. **v_activation_rate_7d**: 7-day activation rate
8. **v_ops_aggregate_metrics**: Combined ops metrics

### Analytics Views

9. **v_product_performance**: Product category analytics
10. **v_customer_segment_summary**: Customer segment insights
11. **v_vehicle_compatibility_analysis**: Vehicle fit analysis
12. **v_sla_performance_7d**: Operator SLA performance

### Historical Trend Views

13. **v_revenue_trends_30d**: Daily revenue trends
14. **v_category_trends_30d**: Category performance over time
15. **v_inventory_velocity_trends**: Inventory movement patterns
16. **v_customer_segment_trends**: Customer segment evolution

### Data Quality Views

17. **v_data_quality_comprehensive**: 10 automated quality checks
18. **v_data_freshness_monitoring**: Data staleness monitoring
19. **v_data_completeness_metrics**: Completeness metrics
20. **v_data_quality_alerts**: Active quality alerts
21. **v_data_quality_dashboard**: Quality health summary
22. **v_data_anomalies**: Statistical anomaly detection

### Growth Metrics Views

23. **v_growth_milestones**: Monthly revenue milestones
24. **v_growth_rates**: Weekly growth rate analysis
25. **v_kpi_summary**: Executive KPI dashboard

### CEO Time Savings Views

26. **v_ceo_time_savings_30d**: 30-day time savings summary
27. **v_ceo_time_savings_ytd**: YTD cumulative savings

### Operator Analytics Views

28. **v_operator_performance_7d**: 7-day operator metrics
29. **v_operator_rankings**: Performance rankings
30. **v_operator_workload**: Daily workload distribution
31. **v_operator_efficiency_trends**: 30-day efficiency trends
32. **v_operator_sla_compliance**: 30-day SLA compliance
33. **v_operator_activity_summary**: Management summary

### Audit Views

34. **v_recent_decisions**: Recent decisions (30 days)
35. **v_decisions_by_actor**: Operator decision statistics
36. **v_decisions_by_scope**: Decision distribution
37. **v_audit_export**: Export-ready audit data
38. **v_audit_stats_7d**: 7-day audit statistics

### Export Views

39. **v_export_daily_performance**: 90-day sales export
40. **v_export_customer_segments**: Full customer data
41. **v_export_product_performance**: SKU + category data

---

## ⚙️ FUNCTIONS

### 1. get_shop_audit_trail(shop_domain TEXT)

**Purpose**: Get complete audit trail for a specific shop  
**Returns**: TABLE with audit log entries  
**Security**: SECURITY DEFINER

### 2. archive_old_audit_logs()

**Purpose**: Archive audit logs older than 180 days  
**Returns**: INTEGER (count of deleted records)  
**Security**: SECURITY DEFINER  
**Schedule**: Daily at 2 AM UTC (via pg_cron)

### 3. export_audit_logs(start_date DATE, end_date DATE)

**Purpose**: Export audit logs for date range  
**Returns**: TABLE with audit data  
**Security**: SECURITY DEFINER

### 4. run_data_quality_checks()

**Purpose**: Quick data quality status check  
**Returns**: TABLE (status, counts, summary)  
**Security**: SECURITY DEFINER

---

## 🔍 INDEXES

**Total**: 30+ indexes created for <200ms query performance

**Types**:
- Date-based indexes (DESC for recent data)
- Foreign key indexes (join optimization)
- Partial indexes (alert/issue filtering)
- GIN indexes (array field searches)
- Composite indexes (unique constraints)

---

## 🔒 RLS POLICIES

**Total**: 20 policies (10 tables × 2 policies each)

**Policy Types**:
1. **service_role policies**: Full access (INSERT, UPDATE, DELETE, SELECT)
2. **operator_read policies**: Read-only access (SELECT only)

**Security Model**: Least-privilege principle enforced

---

## 📈 QUERY PERFORMANCE

**Target**: <200ms for dashboard queries  
**Strategy**:
- Strategic indexing on date columns
- Partial indexes for filtered queries
- Materialized view consideration for heavy aggregations
- Query optimization with EXPLAIN ANALYZE

---

## 🔄 DATA REFRESH

**Real-time tables** (requires ETL):
- sales_metrics_daily (daily refresh)
- inventory_snapshots (daily refresh)
- sku_performance (daily/hourly refresh)
- fulfillment_tracking (real-time via webhook)
- cx_conversations (real-time via webhook)

**Manual tables** (requires input):
- ceo_time_savings (manual daily entry)
- shop_activation_metrics (calculated daily)
- operator_sla_resolution (calculated daily)

---

## 📝 NOTES

- All tables use UUID primary keys
- All timestamps are `timestamptz` (UTC)
- All numeric fields use `numeric` type for precision
- All RLS policies follow least-privilege model
- All views use SECURITY DEFINER for read access
- All indexes optimized for dashboard query patterns

---

**End of Data Dictionary**
