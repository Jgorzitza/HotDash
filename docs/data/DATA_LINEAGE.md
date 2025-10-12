# Hot Rod AN Data Lineage Documentation

**Version**: 1.0  
**Created**: 2025-10-12  
**Owner**: DATA Agent

---

## 📊 Data Flow Map

```
┌─────────────────────────────────────────────────────────────────┐
│                        DATA SOURCES                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                  ┌───────────┼───────────┐
                  │           │           │
                  ▼           ▼           ▼
          ┌─────────┐  ┌──────────┐  ┌─────────┐
          │ Shopify │  │ Chatwoot │  │ Manual  │
          │  API    │  │   API    │  │  Entry  │
          └─────────┘  └──────────┘  └─────────┘
                  │           │           │
                  │           │           │
                  ▼           ▼           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    ETL TRANSFORMATION LAYER                      │
│    (INTEGRATIONS agent - Shopify/Chatwoot → Supabase)          │
└─────────────────────────────────────────────────────────────────┘
                              │
                  ┌───────────┼───────────┬───────────┬──────────┐
                  │           │           │           │          │
                  ▼           ▼           ▼           ▼          ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SUPABASE RAW TABLES                         │
├─────────────────────────────────────────────────────────────────┤
│  product_categories │ inventory_snapshots │ sales_metrics_daily │
│  customer_segments  │ sku_performance     │ fulfillment_tracking│
│  cx_conversations   │ shop_activation     │ operator_sla        │
│  ceo_time_savings   │                                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ (Aggregation Layer)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    ANALYTICAL VIEWS (48 views)                   │
├─────────────────────────────────────────────────────────────────┤
│  Dashboard Views │ Analytics Views │ Quality Views              │
│  Trend Views     │ Operator Views  │ Audit Views                │
│  Export Views    │ Forecast Views  │ Correlation Views          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ (API Layer)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       DASHBOARD APIs                             │
│     (PostgREST + Next.js API Routes + Redis Cache)              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                      ┌───────────────┐
                      │  DASHBOARD UI  │
                      │   (5 Tiles)    │
                      └───────────────┘
```

---

## 🔄 Data Source Details

### 1. Shopify API → Product Categories
**Frequency**: Daily  
**Method**: Shopify GraphQL API (products query)  
**Fields Extracted**:
- Product ID, title, vendor
- Product type (mapped to category_l1/l2/l3)
- Tags (parsed for vehicle compatibility)
- Variants (for SKU mapping)
- Inventory levels
- Price, cost (for margin calculation)

**Transformation**:
- Parse tags for vehicle years, makes, models
- Classify as performance/restoration/custom fabrication
- Calculate margin percentage
- Determine inventory velocity

**Target Table**: `product_categories`

---

### 2. Shopify API → Sales Metrics
**Frequency**: Daily (end of day aggregation)  
**Method**: Shopify GraphQL API (orders query)  
**Fields Extracted**:
- Order ID, total_price, line_items
- Created_at, updated_at, fulfillment_status
- Customer ID

**Transformation**:
- Aggregate by date: SUM(total_price), COUNT(orders)
- Calculate AOV
- Calculate WoW growth percentages
- Join with fulfillment data for fulfillment_rate

**Target Tables**: `sales_metrics_daily`, `sku_performance`

---

### 3. Shopify API → Inventory Snapshots
**Frequency**: Daily  
**Method**: Shopify GraphQL API (inventory levels query)  
**Fields Extracted**:
- Product ID, variant ID, SKU
- Inventory quantity, available, reserved

**Transformation**:
- Join with orders for units_sold_7d/30d
- Calculate avg_daily_sales
- Calculate days_of_cover
- Determine stock_status and velocity_tier

**Target Table**: `inventory_snapshots`

---

### 4. Shopify API → Fulfillment Tracking
**Frequency**: Real-time (via webhooks)  
**Method**: Shopify order/fulfillment webhooks  
**Events**: `orders/create`, `orders/fulfilled`, `orders/updated`

**Transformation**:
- Calculate days_to_fulfill
- Detect SLA breaches (>2 days)
- Join with customer_segments for customer context
- Classify issue types

**Target Table**: `fulfillment_tracking`

---

### 5. Chatwoot API → CX Conversations
**Frequency**: Real-time (via webhooks)  
**Method**: Chatwoot conversation webhooks  
**Events**: `conversation_created`, `message_created`, `conversation_updated`

**Transformation**:
- Calculate first_response_time_minutes
- Calculate resolution_time_hours
- Detect SLA breaches (>120 min first response)
- Extract sentiment from message analysis
- Join with Shopify orders for context

**Target Table**: `cx_conversations`

---

### 6. Manual Entry → CEO Time Savings
**Frequency**: Daily (manual input)  
**Method**: Dashboard UI form entry  

**Fields**:
- Date
- Time saved by category (5 categories)
- Automation action count
- Manual actions avoided

**Target Table**: `ceo_time_savings`

---

### 7. Calculated → Operator Metrics
**Frequency**: Daily (calculated from cx_conversations)  
**Method**: SQL aggregation  

**Calculation**:
- Group cx_conversations by operator and date
- Calculate SLA breaches detected/resolved
- Calculate response time percentiles

**Target Table**: `operator_sla_resolution`

---

## 🎯 View Lineage

### Dashboard Tile Views

**v_sales_pulse_current**:
```
sales_metrics_daily → v_sales_pulse_current
sku_performance → (joined for top SKUs)
```

**v_inventory_alerts**:
```
inventory_snapshots → v_inventory_alerts
(filters: WHERE stock_status IN ('low_stock', 'out_of_stock', 'overstock'))
```

**v_cx_escalations**:
```
cx_conversations → v_cx_escalations
(filters: WHERE is_escalated = true OR is_sla_breach = true)
```

**v_fulfillment_issues**:
```
fulfillment_tracking → v_fulfillment_issues
(filters: WHERE has_issue = true OR is_sla_breach = true)
```

**v_ops_aggregate_metrics**:
```
shop_activation_metrics → v_activation_rate_7d → v_ops_aggregate_metrics
operator_sla_resolution → v_sla_resolution_7d → v_ops_aggregate_metrics
```

---

## 📈 Analytics View Lineage

**Growth Metrics**:
```
sales_metrics_daily → v_growth_milestones (monthly aggregation)
sales_metrics_daily → v_growth_rates (weekly growth calculation)
sales_metrics_daily → v_kpi_summary (MTD, YTD aggregation)
```

**Operator Analytics**:
```
operator_sla_resolution → v_operator_performance_7d
operator_sla_resolution → v_operator_rankings (efficiency scoring)
operator_sla_resolution → v_operator_workload (daily classification)
```

**Customer Analytics**:
```
customer_segments → v_customer_lifetime_value (CLV by segment)
customer_segments → v_churn_prediction (churn scoring)
customer_segments → v_customer_cohorts (cohort analysis)
```

---

## 🔍 Data Dictionary

**All field definitions documented in**: `docs/data/HOT_ROD_AN_DATA_DICTIONARY.md`

---

## ⏱️ Data Refresh Schedule

**Real-Time** (via webhooks):
- fulfillment_tracking (Shopify order webhooks)
- cx_conversations (Chatwoot conversation webhooks)

**Hourly**:
- sku_performance (trending SKU analysis)

**Daily** (at 2 AM UTC):
- sales_metrics_daily (previous day aggregation)
- inventory_snapshots (EOD inventory snapshot)
- shop_activation_metrics (daily calculation)
- operator_sla_resolution (daily calculation)

**Weekly**:
- customer_segments (re-segmentation)
- product_categories (category refresh)

**Monthly**:
- Growth metrics (milestone tracking)

---

## 🔒 Data Retention

**180-day retention**:
- DecisionLog (audit trail)
- facts (operator analytics)
- DashboardFact (dashboard analytics)

**90-day retention**:
- decision_sync_event_logs

**Unlimited retention** (core business data):
- sales_metrics_daily
- customer_segments
- product_categories
- All other operational tables

---

**End of Data Lineage Documentation**
