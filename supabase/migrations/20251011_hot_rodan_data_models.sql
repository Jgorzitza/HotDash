-- Hot Rodan Data Models Migration
-- Created: 2025-10-11
-- Purpose: Domain-specific data models for hot rod e-commerce analytics

-- Product categories for automotive parts taxonomy
CREATE TABLE IF NOT EXISTS product_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shopify_product_id BIGINT NOT NULL,
  
  -- Category hierarchy
  category_l1 TEXT NOT NULL, -- Major category (e.g., "Engine & Drivetrain")
  category_l2 TEXT, -- Subcategory (e.g., "Carburetors")
  category_l3 TEXT, -- Specific type (e.g., "Holley 4-Barrel")
  
  -- Hot rod specific attributes
  fits_vehicle_years INT[], -- Compatible years (e.g., [1932, 1933, 1934])
  fits_makes TEXT[], -- Compatible makes (e.g., ['Ford', 'Chevy'])
  fits_models TEXT[], -- Compatible models (e.g., ['Model A', 'Tri-Five'])
  
  -- Product characteristics
  is_performance_part BOOLEAN DEFAULT false,
  is_restoration_part BOOLEAN DEFAULT false,
  is_custom_fabrication BOOLEAN DEFAULT false,
  
  -- Business metrics
  avg_order_value NUMERIC(10,2),
  margin_pct NUMERIC(5,2),
  inventory_velocity TEXT CHECK (inventory_velocity IN ('fast', 'medium', 'slow')),
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Customer segmentation for Hot Rodan
CREATE TABLE IF NOT EXISTS customer_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shopify_customer_id BIGINT NOT NULL,
  
  -- Segment classification
  primary_segment TEXT NOT NULL CHECK (primary_segment IN (
    'diy_builder',           -- Weekend warriors
    'professional_shop',     -- Restoration/custom shops
    'enthusiast_collector',  -- Multi-car owners
    'first_time_builder',    -- New to hobby
    'racing_enthusiast'      -- Track-focused
  )),
  segment_confidence NUMERIC(3,2) DEFAULT 0.50, -- 0.00 to 1.00
  
  -- Behavioral attributes
  total_orders INT DEFAULT 0,
  total_revenue NUMERIC(10,2) DEFAULT 0,
  avg_order_value NUMERIC(10,2) DEFAULT 0,
  days_since_first_order INT,
  days_since_last_order INT,
  
  -- Product preferences
  top_category_l1 TEXT,
  top_category_l2 TEXT,
  prefers_performance BOOLEAN DEFAULT false,
  prefers_restoration BOOLEAN DEFAULT false,
  
  -- Vehicle profile
  primary_vehicle_year INT,
  primary_vehicle_make TEXT,
  primary_vehicle_model TEXT,
  
  -- Engagement metrics
  support_tickets_count INT DEFAULT 0,
  review_count INT DEFAULT 0,
  avg_review_rating NUMERIC(2,1),
  
  -- Lifecycle stage
  lifecycle_stage TEXT CHECK (lifecycle_stage IN (
    'new',         -- < 30 days since first order
    'active',      -- Regular purchaser
    'at_risk',     -- No purchase in 90+ days
    'churned',     -- No purchase in 180+ days
    'reactivated'  -- Returned after churn
  )),
  
  -- Metadata
  segmented_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_product_categories_shopify_id ON product_categories(shopify_product_id);
CREATE INDEX idx_product_categories_l1 ON product_categories(category_l1);
CREATE INDEX idx_product_categories_l2 ON product_categories(category_l2);
CREATE INDEX idx_product_categories_vehicle_years ON product_categories USING GIN(fits_vehicle_years);
CREATE INDEX idx_product_categories_makes ON product_categories USING GIN(fits_makes);
CREATE INDEX idx_product_categories_velocity ON product_categories(inventory_velocity);

CREATE INDEX idx_customer_segments_shopify_id ON customer_segments(shopify_customer_id);
CREATE INDEX idx_customer_segments_primary ON customer_segments(primary_segment);
CREATE INDEX idx_customer_segments_lifecycle ON customer_segments(lifecycle_stage);
CREATE INDEX idx_customer_segments_vehicle_make ON customer_segments(primary_vehicle_make);
CREATE INDEX idx_customer_segments_vehicle_year ON customer_segments(primary_vehicle_year);

-- RLS policies
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_segments ENABLE ROW LEVEL SECURITY;

-- Service role has full access
CREATE POLICY product_categories_service_role 
  ON product_categories FOR ALL 
  USING (auth.role() = 'service_role');

CREATE POLICY customer_segments_service_role 
  ON customer_segments FOR ALL 
  USING (auth.role() = 'service_role');

-- Operators can read product categories
CREATE POLICY product_categories_read_operators 
  ON product_categories FOR SELECT 
  USING (TRUE); -- All authenticated users can read

-- Operators can read anonymized customer segments
CREATE POLICY customer_segments_read_operators 
  ON customer_segments FOR SELECT 
  USING (TRUE); -- All authenticated users can read

-- Views for operator dashboard tiles

-- Product performance by category
CREATE OR REPLACE VIEW v_product_performance AS
SELECT 
  pc.category_l1,
  pc.category_l2,
  COUNT(DISTINCT pc.shopify_product_id) as products_in_category,
  COUNT(*) FILTER (WHERE pc.inventory_velocity = 'fast') as fast_movers,
  COUNT(*) FILTER (WHERE pc.inventory_velocity = 'medium') as medium_movers,
  COUNT(*) FILTER (WHERE pc.inventory_velocity = 'slow') as slow_movers,
  AVG(pc.avg_order_value) as avg_category_aov,
  AVG(pc.margin_pct) as avg_category_margin
FROM product_categories pc
GROUP BY pc.category_l1, pc.category_l2
ORDER BY fast_movers DESC;

-- Customer segment distribution
CREATE OR REPLACE VIEW v_customer_segment_summary AS
SELECT 
  primary_segment,
  lifecycle_stage,
  COUNT(*) as customer_count,
  SUM(total_revenue) as segment_revenue,
  AVG(avg_order_value) as segment_aov,
  AVG(total_orders) as avg_orders_per_customer,
  AVG(days_since_last_order) as avg_days_since_purchase
FROM customer_segments
GROUP BY primary_segment, lifecycle_stage
ORDER BY segment_revenue DESC;

-- Seasonal pattern detection
CREATE OR REPLACE VIEW v_seasonal_patterns AS
SELECT 
  EXTRACT(MONTH FROM created_at) as month_num,
  TO_CHAR(created_at, 'Month') as month_name,
  CASE 
    WHEN EXTRACT(MONTH FROM created_at) BETWEEN 3 AND 9 THEN 'racing_season'
    ELSE 'off_season'
  END as season,
  category_l1,
  COUNT(*) as record_count
FROM product_categories pc
CROSS JOIN generate_series(NOW() - INTERVAL '2 years', NOW(), INTERVAL '1 month') as created_at
GROUP BY 1, 2, 3, pc.category_l1
ORDER BY month_num, category_l1;

COMMENT ON TABLE product_categories IS 'Hot Rodan automotive parts categorization with vehicle compatibility';
COMMENT ON TABLE customer_segments IS 'Hot Rodan customer segmentation (DIY, Professional, Enthusiast, First-time, Racing)';
COMMENT ON VIEW v_product_performance IS 'Product performance metrics by category for operator dashboard';
COMMENT ON VIEW v_customer_segment_summary IS 'Customer segment distribution and revenue for operator insights';

-- ==========================================
-- TILE 1: SALES PULSE DATA MODELS
-- ==========================================

-- Daily sales metrics aggregation
CREATE TABLE IF NOT EXISTS sales_metrics_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_date DATE NOT NULL,
  shop_domain TEXT NOT NULL,
  
  -- Revenue metrics
  total_revenue NUMERIC(12,2) DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  order_count INT DEFAULT 0,
  avg_order_value NUMERIC(10,2) DEFAULT 0,
  
  -- SKU metrics
  unique_skus_sold INT DEFAULT 0,
  total_units_sold INT DEFAULT 0,
  
  -- Fulfillment metrics
  orders_fulfilled INT DEFAULT 0,
  orders_pending INT DEFAULT 0,
  orders_unfulfilled INT DEFAULT 0,
  fulfillment_rate NUMERIC(5,2) DEFAULT 0,
  
  -- Performance indicators
  revenue_growth_pct NUMERIC(5,2), -- vs. same day last week
  order_growth_pct NUMERIC(5,2),
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(metric_date, shop_domain)
);

-- SKU performance tracking
CREATE TABLE IF NOT EXISTS sku_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_date DATE NOT NULL,
  
  -- Product identification
  shopify_product_id BIGINT NOT NULL,
  shopify_variant_id BIGINT NOT NULL,
  sku TEXT NOT NULL,
  product_title TEXT NOT NULL,
  
  -- Sales metrics
  units_sold INT DEFAULT 0,
  revenue NUMERIC(10,2) DEFAULT 0,
  avg_price NUMERIC(10,2) DEFAULT 0,
  
  -- Inventory metrics
  inventory_level INT DEFAULT 0,
  inventory_velocity TEXT,
  days_of_cover INT,
  
  -- Rankings
  revenue_rank INT, -- Daily rank by revenue
  velocity_rank INT, -- Daily rank by velocity
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(metric_date, shopify_variant_id)
);

-- Sales pulse view (real-time)
CREATE OR REPLACE VIEW v_sales_pulse_current AS
SELECT 
  sm.metric_date,
  sm.shop_domain,
  sm.total_revenue,
  sm.currency,
  sm.order_count,
  sm.avg_order_value,
  sm.fulfillment_rate,
  sm.revenue_growth_pct,
  sm.order_growth_pct,
  (
    SELECT json_agg(
      json_build_object(
        'sku', sp.sku,
        'title', sp.product_title,
        'quantity', sp.units_sold,
        'revenue', sp.revenue,
        'rank', sp.revenue_rank
      ) ORDER BY sp.revenue DESC
    )
    FROM sku_performance sp
    WHERE sp.metric_date = sm.metric_date
    LIMIT 5
  ) as top_skus,
  sm.orders_pending,
  sm.orders_unfulfilled
FROM sales_metrics_daily sm
WHERE sm.metric_date = CURRENT_DATE
ORDER BY sm.metric_date DESC;

-- ==========================================
-- TILE 2: INVENTORY HEATMAP DATA MODELS
-- ==========================================

-- Inventory snapshots (daily)
CREATE TABLE IF NOT EXISTS inventory_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_date DATE NOT NULL,
  
  -- Product identification
  shopify_product_id BIGINT NOT NULL,
  shopify_variant_id BIGINT NOT NULL,
  sku TEXT NOT NULL,
  product_title TEXT NOT NULL,
  
  -- Inventory levels
  quantity_available INT DEFAULT 0,
  quantity_committed INT DEFAULT 0,
  quantity_on_hand INT DEFAULT 0,
  
  -- Velocity metrics
  avg_daily_sales NUMERIC(10,2) DEFAULT 0,
  days_of_cover INT,
  inventory_velocity TEXT CHECK (inventory_velocity IN ('fast', 'medium', 'slow', 'stagnant')),
  
  -- Thresholds
  reorder_point INT DEFAULT 0,
  optimal_stock_level INT DEFAULT 0,
  
  -- Alert flags
  is_low_stock BOOLEAN DEFAULT false,
  is_out_of_stock BOOLEAN DEFAULT false,
  is_overstock BOOLEAN DEFAULT false,
  
  -- Category context
  category_l1 TEXT,
  category_l2 TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(snapshot_date, shopify_variant_id)
);

-- Inventory alerts view
CREATE OR REPLACE VIEW v_inventory_alerts AS
SELECT 
  i.shopify_variant_id as variant_id,
  i.sku,
  i.product_title as title,
  i.quantity_available,
  i.reorder_point as threshold,
  i.days_of_cover,
  i.inventory_velocity,
  i.category_l1,
  i.category_l2,
  CASE 
    WHEN i.is_out_of_stock THEN 'OUT_OF_STOCK'
    WHEN i.is_low_stock THEN 'LOW_STOCK'
    WHEN i.is_overstock THEN 'OVERSTOCK'
    ELSE 'NORMAL'
  END as alert_type,
  CASE
    WHEN i.is_out_of_stock THEN 'critical'
    WHEN i.is_low_stock AND i.days_of_cover < 7 THEN 'high'
    WHEN i.is_low_stock THEN 'medium'
    WHEN i.is_overstock THEN 'low'
    ELSE 'info'
  END as severity,
  NOW() as generated_at
FROM inventory_snapshots i
WHERE i.snapshot_date = CURRENT_DATE
  AND (i.is_low_stock OR i.is_out_of_stock OR i.is_overstock)
ORDER BY 
  CASE
    WHEN i.is_out_of_stock THEN 1
    WHEN i.is_low_stock AND i.days_of_cover < 7 THEN 2
    WHEN i.is_low_stock THEN 3
    ELSE 4
  END,
  i.days_of_cover ASC;

-- ==========================================
-- TILE 3: FULFILLMENT HEALTH DATA MODELS
-- ==========================================

-- Fulfillment tracking
CREATE TABLE IF NOT EXISTS fulfillment_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Order identification
  shopify_order_id BIGINT NOT NULL,
  order_name TEXT NOT NULL,
  
  -- Status tracking
  fulfillment_status TEXT NOT NULL CHECK (fulfillment_status IN (
    'fulfilled',
    'partial',
    'unfulfilled',
    'scheduled',
    'on_hold',
    'cancelled'
  )),
  display_status TEXT NOT NULL,
  
  -- Timing
  order_created_at TIMESTAMPTZ NOT NULL,
  fulfillment_started_at TIMESTAMPTZ,
  fulfillment_completed_at TIMESTAMPTZ,
  
  -- SLA tracking
  target_ship_date DATE,
  actual_ship_date DATE,
  days_to_fulfill INT,
  sla_breached BOOLEAN DEFAULT false,
  
  -- Issue tracking
  has_issue BOOLEAN DEFAULT false,
  issue_type TEXT,
  issue_description TEXT,
  issue_resolved_at TIMESTAMPTZ,
  
  -- Customer context
  shopify_customer_id BIGINT,
  customer_segment TEXT,
  
  -- Financial
  order_total NUMERIC(10,2),
  currency TEXT DEFAULT 'USD',
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(shopify_order_id)
);

-- Fulfillment issues view
CREATE OR REPLACE VIEW v_fulfillment_issues AS
SELECT 
  f.shopify_order_id as order_id,
  f.order_name as name,
  f.display_status,
  f.fulfillment_status,
  f.order_created_at as created_at,
  f.days_to_fulfill,
  f.sla_breached,
  f.has_issue,
  f.issue_type,
  f.issue_description,
  f.customer_segment,
  f.order_total,
  CASE
    WHEN f.sla_breached THEN 'critical'
    WHEN f.has_issue THEN 'high'
    WHEN f.fulfillment_status = 'on_hold' THEN 'medium'
    ELSE 'low'
  END as priority
FROM fulfillment_tracking f
WHERE f.fulfillment_status IN ('unfulfilled', 'partial', 'on_hold')
  AND (f.has_issue OR f.sla_breached OR f.days_to_fulfill > 3)
ORDER BY 
  CASE
    WHEN f.sla_breached THEN 1
    WHEN f.has_issue THEN 2
    WHEN f.days_to_fulfill > 5 THEN 3
    ELSE 4
  END,
  f.order_created_at ASC;

-- Fulfillment health summary
CREATE OR REPLACE VIEW v_fulfillment_health_summary AS
SELECT 
  COUNT(*) as total_orders,
  COUNT(*) FILTER (WHERE fulfillment_status = 'fulfilled') as fulfilled_count,
  COUNT(*) FILTER (WHERE fulfillment_status = 'unfulfilled') as unfulfilled_count,
  COUNT(*) FILTER (WHERE fulfillment_status = 'partial') as partial_count,
  COUNT(*) FILTER (WHERE has_issue) as issues_count,
  COUNT(*) FILTER (WHERE sla_breached) as sla_breached_count,
  AVG(days_to_fulfill) FILTER (WHERE fulfillment_status = 'fulfilled') as avg_days_to_fulfill,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY days_to_fulfill) 
    FILTER (WHERE fulfillment_status = 'fulfilled') as median_days_to_fulfill,
  PERCENTILE_CONT(0.9) WITHIN GROUP (ORDER BY days_to_fulfill) 
    FILTER (WHERE fulfillment_status = 'fulfilled') as p90_days_to_fulfill,
  (COUNT(*) FILTER (WHERE fulfillment_status = 'fulfilled')::NUMERIC / 
    NULLIF(COUNT(*), 0) * 100) as fulfillment_rate_pct
FROM fulfillment_tracking
WHERE order_created_at >= NOW() - INTERVAL '30 days';

-- ==========================================
-- TILE 4: CX ESCALATIONS DATA MODELS
-- ==========================================

-- Customer support conversation tracking
CREATE TABLE IF NOT EXISTS cx_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Chatwoot identification
  chatwoot_conversation_id BIGINT NOT NULL UNIQUE,
  inbox_id BIGINT NOT NULL,
  
  -- Customer identification
  customer_name TEXT,
  customer_email TEXT,
  shopify_customer_id BIGINT,
  customer_segment TEXT,
  
  -- Conversation status
  status TEXT NOT NULL CHECK (status IN ('open', 'pending', 'resolved', 'closed')),
  
  -- Timing
  created_at TIMESTAMPTZ NOT NULL,
  first_response_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  
  -- SLA tracking
  sla_target_minutes INT DEFAULT 120, -- 2 hours default
  time_to_first_response_minutes INT,
  time_to_resolution_minutes INT,
  sla_breached BOOLEAN DEFAULT false,
  breached_at TIMESTAMPTZ,
  
  -- Escalation tracking
  is_escalation BOOLEAN DEFAULT false,
  escalation_reason TEXT,
  escalated_at TIMESTAMPTZ,
  
  -- Sentiment & priority
  sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative', 'very_negative')),
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  
  -- Tags & categorization
  tags TEXT[],
  category TEXT, -- e.g., 'product_issue', 'shipping', 'return', 'general_inquiry'
  
  -- Resolution
  resolution_type TEXT,
  operator_email TEXT,
  
  -- Metadata
  message_count INT DEFAULT 0,
  last_message_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- CX escalations view
CREATE OR REPLACE VIEW v_cx_escalations AS
SELECT 
  c.chatwoot_conversation_id as id,
  c.inbox_id,
  c.customer_name,
  c.status,
  c.created_at,
  c.breached_at,
  c.last_message_at,
  c.sla_breached,
  c.is_escalation,
  c.escalation_reason,
  c.sentiment,
  c.priority,
  c.tags,
  c.category,
  c.time_to_first_response_minutes,
  c.customer_segment,
  CASE
    WHEN c.sla_breached AND c.status != 'resolved' THEN 'critical'
    WHEN c.priority = 'urgent' THEN 'high'
    WHEN c.sentiment = 'very_negative' THEN 'high'
    ELSE 'medium'
  END as severity
FROM cx_conversations c
WHERE c.status IN ('open', 'pending')
  AND (c.sla_breached OR c.is_escalation OR c.priority IN ('high', 'urgent'))
ORDER BY 
  CASE
    WHEN c.sla_breached THEN 1
    WHEN c.priority = 'urgent' THEN 2
    WHEN c.sentiment = 'very_negative' THEN 3
    ELSE 4
  END,
  c.created_at ASC;

-- CX health summary
CREATE OR REPLACE VIEW v_cx_health_summary AS
SELECT 
  COUNT(*) as total_conversations,
  COUNT(*) FILTER (WHERE status = 'open') as open_count,
  COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
  COUNT(*) FILTER (WHERE status = 'resolved') as resolved_count,
  COUNT(*) FILTER (WHERE sla_breached) as sla_breached_count,
  COUNT(*) FILTER (WHERE is_escalation) as escalation_count,
  AVG(time_to_first_response_minutes) as avg_first_response_minutes,
  AVG(time_to_resolution_minutes) FILTER (WHERE status = 'resolved') as avg_resolution_minutes,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY time_to_first_response_minutes) as median_first_response_minutes,
  PERCENTILE_CONT(0.9) WITHIN GROUP (ORDER BY time_to_first_response_minutes) as p90_first_response_minutes,
  (COUNT(*) FILTER (WHERE status = 'resolved')::NUMERIC / 
    NULLIF(COUNT(*), 0) * 100) as resolution_rate_pct
FROM cx_conversations
WHERE created_at >= NOW() - INTERVAL '7 days';

-- ==========================================
-- TILE 5: OPS METRICS DATA MODELS
-- ==========================================

-- Shop activation tracking
CREATE TABLE IF NOT EXISTS shop_activation_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Shop identification
  shop_domain TEXT NOT NULL,
  shopify_shop_id BIGINT,
  
  -- Activation status
  is_active BOOLEAN DEFAULT false,
  activation_date DATE,
  
  -- Activity metrics
  last_order_date DATE,
  last_login_date DATE,
  days_since_last_order INT,
  
  -- Window tracking
  metric_date DATE NOT NULL,
  is_activated_in_window BOOLEAN DEFAULT false,
  window_days INT DEFAULT 7,
  
  -- Order activity in window
  orders_in_window INT DEFAULT 0,
  revenue_in_window NUMERIC(10,2) DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(shop_domain, metric_date)
);

-- Operator SLA resolution tracking
CREATE TABLE IF NOT EXISTS operator_sla_resolution (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Conversation reference
  chatwoot_conversation_id BIGINT NOT NULL,
  
  -- Operator identification
  operator_email TEXT NOT NULL,
  operator_name TEXT,
  
  -- Timing
  sla_breach_detected_at TIMESTAMPTZ NOT NULL,
  operator_action_at TIMESTAMPTZ NOT NULL,
  resolved_at TIMESTAMPTZ,
  
  -- Metrics
  minutes_to_action NUMERIC(10,2) NOT NULL, -- From breach to first operator action
  minutes_to_resolution NUMERIC(10,2), -- From breach to resolution
  
  -- Context
  conversation_status TEXT,
  action_type TEXT, -- 'message', 'escalation', 'assignment', 'resolution'
  
  -- Window tracking
  metric_date DATE NOT NULL,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Activation rate view (7-day window)
CREATE OR REPLACE VIEW v_activation_rate_7d AS
WITH window_stats AS (
  SELECT 
    COUNT(DISTINCT shop_domain) as total_active_shops,
    COUNT(DISTINCT shop_domain) FILTER (WHERE is_activated_in_window) as activated_shops,
    MIN(metric_date) as window_start,
    MAX(metric_date) as window_end
  FROM shop_activation_metrics
  WHERE metric_date >= CURRENT_DATE - INTERVAL '7 days'
    AND is_active = true
)
SELECT 
  total_active_shops,
  activated_shops,
  CASE 
    WHEN total_active_shops > 0 
    THEN (activated_shops::NUMERIC / total_active_shops)
    ELSE 0 
  END as activation_rate,
  window_start,
  window_end
FROM window_stats;

-- SLA resolution metrics view (7-day window)
CREATE OR REPLACE VIEW v_sla_resolution_7d AS
SELECT 
  COUNT(*) as sample_size,
  AVG(minutes_to_action) as mean_minutes,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY minutes_to_action) as median_minutes,
  PERCENTILE_CONT(0.9) WITHIN GROUP (ORDER BY minutes_to_action) as p90_minutes,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY minutes_to_action) as p95_minutes,
  MIN(minutes_to_action) as min_minutes,
  MAX(minutes_to_action) as max_minutes,
  MIN(metric_date) as window_start,
  MAX(metric_date) as window_end
FROM operator_sla_resolution
WHERE metric_date >= CURRENT_DATE - INTERVAL '7 days'
  AND resolved_at IS NOT NULL;

-- Ops aggregate metrics view
CREATE OR REPLACE VIEW v_ops_aggregate_metrics AS
SELECT 
  json_build_object(
    'activatedShops', a.activated_shops,
    'totalActiveShops', a.total_active_shops,
    'activationRate', a.activation_rate,
    'windowStart', a.window_start,
    'windowEnd', a.window_end
  ) as activation,
  json_build_object(
    'sampleSize', COALESCE(s.sample_size, 0),
    'meanMinutes', s.mean_minutes,
    'medianMinutes', s.median_minutes,
    'p90Minutes', s.p90_minutes,
    'p95Minutes', s.p95_minutes
  ) as sla
FROM v_activation_rate_7d a
CROSS JOIN v_sla_resolution_7d s;

-- ==========================================
-- HISTORICAL TREND ANALYSIS
-- ==========================================

-- Revenue trends (daily aggregates)
CREATE OR REPLACE VIEW v_revenue_trends_30d AS
SELECT 
  metric_date,
  SUM(total_revenue) as daily_revenue,
  SUM(order_count) as daily_orders,
  AVG(avg_order_value) as avg_order_value,
  AVG(fulfillment_rate) as avg_fulfillment_rate
FROM sales_metrics_daily
WHERE metric_date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY metric_date
ORDER BY metric_date DESC;

-- Category performance trends
CREATE OR REPLACE VIEW v_category_trends_30d AS
SELECT 
  sp.metric_date,
  pc.category_l1,
  pc.category_l2,
  COUNT(DISTINCT sp.sku) as products_sold,
  SUM(sp.units_sold) as total_units,
  SUM(sp.revenue) as total_revenue,
  AVG(sp.avg_price) as avg_price
FROM sku_performance sp
JOIN product_categories pc ON pc.shopify_product_id = sp.shopify_product_id
WHERE sp.metric_date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY sp.metric_date, pc.category_l1, pc.category_l2
ORDER BY sp.metric_date DESC, total_revenue DESC;

-- Inventory velocity trends
CREATE OR REPLACE VIEW v_inventory_velocity_trends AS
SELECT 
  snapshot_date,
  inventory_velocity,
  category_l1,
  COUNT(*) as product_count,
  SUM(quantity_available) as total_inventory,
  AVG(days_of_cover) as avg_days_of_cover,
  COUNT(*) FILTER (WHERE is_low_stock) as low_stock_count
FROM inventory_snapshots
WHERE snapshot_date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY snapshot_date, inventory_velocity, category_l1
ORDER BY snapshot_date DESC;

-- Customer segment evolution
CREATE OR REPLACE VIEW v_customer_segment_trends AS
WITH segment_snapshots AS (
  SELECT 
    DATE_TRUNC('week', updated_at) as week_start,
    primary_segment,
    lifecycle_stage,
    COUNT(*) as customer_count,
    SUM(total_revenue) as segment_revenue,
    AVG(avg_order_value) as avg_aov
  FROM customer_segments
  WHERE updated_at >= NOW() - INTERVAL '90 days'
  GROUP BY week_start, primary_segment, lifecycle_stage
)
SELECT * FROM segment_snapshots
ORDER BY week_start DESC, segment_revenue DESC;

-- ==========================================
-- DATA QUALITY MONITORING
-- ==========================================

-- Data quality checks view
CREATE OR REPLACE VIEW v_data_quality_checks AS
SELECT 
  'sales_metrics_daily' as table_name,
  'missing_revenue' as check_type,
  COUNT(*) as issue_count,
  NOW() as checked_at
FROM sales_metrics_daily
WHERE total_revenue = 0 AND order_count > 0
  AND metric_date >= CURRENT_DATE - INTERVAL '7 days'
UNION ALL
SELECT 
  'sku_performance' as table_name,
  'negative_inventory' as check_type,
  COUNT(*) as issue_count,
  NOW() as checked_at
FROM sku_performance sp
WHERE sp.inventory_level < 0
  AND sp.metric_date >= CURRENT_DATE - INTERVAL '7 days'
UNION ALL
SELECT 
  'customer_segments' as table_name,
  'missing_segment' as check_type,
  COUNT(*) as issue_count,
  NOW() as checked_at
FROM customer_segments
WHERE primary_segment IS NULL
UNION ALL
SELECT 
  'fulfillment_tracking' as table_name,
  'future_dates' as check_type,
  COUNT(*) as issue_count,
  NOW() as checked_at
FROM fulfillment_tracking
WHERE order_created_at > NOW()
UNION ALL
SELECT 
  'cx_conversations' as table_name,
  'negative_resolution_time' as check_type,
  COUNT(*) as issue_count,
  NOW() as checked_at
FROM cx_conversations
WHERE time_to_resolution_minutes < 0
ORDER BY issue_count DESC;

-- Data freshness monitoring
CREATE OR REPLACE VIEW v_data_freshness AS
SELECT 
  'sales_metrics_daily' as table_name,
  MAX(metric_date) as last_data_date,
  CURRENT_DATE - MAX(metric_date) as days_stale,
  COUNT(*) FILTER (WHERE metric_date = CURRENT_DATE) as today_records
FROM sales_metrics_daily
UNION ALL
SELECT 
  'inventory_snapshots' as table_name,
  MAX(snapshot_date) as last_data_date,
  CURRENT_DATE - MAX(snapshot_date) as days_stale,
  COUNT(*) FILTER (WHERE snapshot_date = CURRENT_DATE) as today_records
FROM inventory_snapshots
UNION ALL
SELECT 
  'cx_conversations' as table_name,
  MAX(DATE(created_at)) as last_data_date,
  CURRENT_DATE - MAX(DATE(created_at)) as days_stale,
  COUNT(*) FILTER (WHERE DATE(created_at) = CURRENT_DATE) as today_records
FROM cx_conversations
ORDER BY days_stale DESC;

-- ==========================================
-- GROWTH METRICS DASHBOARD ($1MM → $10MM)
-- ==========================================

-- Monthly revenue milestones
CREATE OR REPLACE VIEW v_growth_milestones AS
WITH monthly_revenue AS (
  SELECT 
    DATE_TRUNC('month', metric_date) as month_start,
    SUM(total_revenue) as monthly_revenue,
    SUM(order_count) as monthly_orders,
    COUNT(DISTINCT shop_domain) as active_shops
  FROM sales_metrics_daily
  WHERE metric_date >= DATE_TRUNC('year', CURRENT_DATE)
  GROUP BY month_start
),
running_totals AS (
  SELECT 
    month_start,
    monthly_revenue,
    monthly_orders,
    active_shops,
    SUM(monthly_revenue) OVER (ORDER BY month_start) as ytd_revenue,
    AVG(monthly_revenue) OVER (ORDER BY month_start ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) as trailing_3mo_avg
  FROM monthly_revenue
)
SELECT 
  month_start,
  monthly_revenue,
  monthly_orders,
  active_shops,
  ytd_revenue,
  trailing_3mo_avg,
  CASE 
    WHEN ytd_revenue >= 10000000 THEN '$10MM+'
    WHEN ytd_revenue >= 5000000 THEN '$5MM-$10MM'
    WHEN ytd_revenue >= 1000000 THEN '$1MM-$5MM'
    ELSE 'Pre-$1MM'
  END as milestone_tier,
  (ytd_revenue / 10000000.0 * 100) as progress_to_10mm_pct
FROM running_totals
ORDER BY month_start DESC;

-- Growth rate analysis
CREATE OR REPLACE VIEW v_growth_rates AS
WITH weekly_metrics AS (
  SELECT 
    DATE_TRUNC('week', metric_date) as week_start,
    SUM(total_revenue) as weekly_revenue,
    SUM(order_count) as weekly_orders,
    AVG(avg_order_value) as avg_aov
  FROM sales_metrics_daily
  WHERE metric_date >= CURRENT_DATE - INTERVAL '90 days'
  GROUP BY week_start
),
growth_calc AS (
  SELECT 
    week_start,
    weekly_revenue,
    weekly_orders,
    avg_aov,
    LAG(weekly_revenue, 1) OVER (ORDER BY week_start) as prev_week_revenue,
    LAG(weekly_orders, 1) OVER (ORDER BY week_start) as prev_week_orders
  FROM weekly_metrics
)
SELECT 
  week_start,
  weekly_revenue,
  weekly_orders,
  avg_aov,
  CASE 
    WHEN prev_week_revenue > 0 
    THEN ((weekly_revenue - prev_week_revenue) / prev_week_revenue * 100)
    ELSE NULL 
  END as revenue_growth_pct,
  CASE 
    WHEN prev_week_orders > 0 
    THEN ((weekly_orders - prev_week_orders)::NUMERIC / prev_week_orders * 100)
    ELSE NULL 
  END as order_growth_pct
FROM growth_calc
ORDER BY week_start DESC;

-- Key performance indicators summary
CREATE OR REPLACE VIEW v_kpi_summary AS
SELECT 
  -- Revenue KPIs
  (SELECT SUM(total_revenue) FROM sales_metrics_daily WHERE metric_date >= DATE_TRUNC('month', CURRENT_DATE)) as mtd_revenue,
  (SELECT SUM(total_revenue) FROM sales_metrics_daily WHERE metric_date >= DATE_TRUNC('year', CURRENT_DATE)) as ytd_revenue,
  (SELECT AVG(total_revenue) FROM sales_metrics_daily WHERE metric_date >= CURRENT_DATE - INTERVAL '30 days') as avg_daily_revenue_30d,
  
  -- Order KPIs
  (SELECT SUM(order_count) FROM sales_metrics_daily WHERE metric_date >= DATE_TRUNC('month', CURRENT_DATE)) as mtd_orders,
  (SELECT AVG(avg_order_value) FROM sales_metrics_daily WHERE metric_date >= CURRENT_DATE - INTERVAL '30 days') as avg_order_value_30d,
  
  -- Fulfillment KPIs
  (SELECT AVG(fulfillment_rate) FROM sales_metrics_daily WHERE metric_date >= CURRENT_DATE - INTERVAL '7 days') as avg_fulfillment_rate_7d,
  (SELECT COUNT(*) FROM v_fulfillment_issues) as current_fulfillment_issues,
  
  -- Inventory KPIs
  (SELECT COUNT(*) FROM v_inventory_alerts WHERE severity IN ('critical', 'high')) as critical_inventory_alerts,
  (SELECT AVG(days_of_cover) FROM inventory_snapshots WHERE snapshot_date = CURRENT_DATE) as avg_days_of_cover,
  
  -- CX KPIs
  (SELECT COUNT(*) FROM v_cx_escalations) as current_escalations,
  (SELECT avg_first_response_minutes FROM v_cx_health_summary) as avg_first_response_minutes,
  
  -- Growth KPIs
  (SELECT progress_to_10mm_pct FROM v_growth_milestones ORDER BY month_start DESC LIMIT 1) as progress_to_10mm_pct;

-- ==========================================
-- INDEXES FOR PERFORMANCE
-- ==========================================

-- Sales metrics indexes
CREATE INDEX IF NOT EXISTS idx_sales_metrics_daily_date ON sales_metrics_daily(metric_date DESC);
CREATE INDEX IF NOT EXISTS idx_sales_metrics_daily_shop ON sales_metrics_daily(shop_domain);
CREATE INDEX IF NOT EXISTS idx_sku_performance_date ON sku_performance(metric_date DESC);
CREATE INDEX IF NOT EXISTS idx_sku_performance_variant ON sku_performance(shopify_variant_id);

-- Inventory indexes
CREATE INDEX IF NOT EXISTS idx_inventory_snapshots_date ON inventory_snapshots(snapshot_date DESC);
CREATE INDEX IF NOT EXISTS idx_inventory_snapshots_variant ON inventory_snapshots(shopify_variant_id);
CREATE INDEX IF NOT EXISTS idx_inventory_snapshots_alerts ON inventory_snapshots(snapshot_date) 
  WHERE is_low_stock OR is_out_of_stock OR is_overstock;

-- Fulfillment indexes
CREATE INDEX IF NOT EXISTS idx_fulfillment_tracking_order ON fulfillment_tracking(shopify_order_id);
CREATE INDEX IF NOT EXISTS idx_fulfillment_tracking_status ON fulfillment_tracking(fulfillment_status);
CREATE INDEX IF NOT EXISTS idx_fulfillment_tracking_issues ON fulfillment_tracking(order_created_at DESC) 
  WHERE has_issue OR sla_breached;

-- CX indexes
CREATE INDEX IF NOT EXISTS idx_cx_conversations_chatwoot_id ON cx_conversations(chatwoot_conversation_id);
CREATE INDEX IF NOT EXISTS idx_cx_conversations_status ON cx_conversations(status);
CREATE INDEX IF NOT EXISTS idx_cx_conversations_escalations ON cx_conversations(created_at DESC) 
  WHERE sla_breached OR is_escalation;

-- Ops metrics indexes
CREATE INDEX IF NOT EXISTS idx_shop_activation_date ON shop_activation_metrics(metric_date DESC);
CREATE INDEX IF NOT EXISTS idx_shop_activation_shop ON shop_activation_metrics(shop_domain);
CREATE INDEX IF NOT EXISTS idx_operator_sla_date ON operator_sla_resolution(metric_date DESC);
CREATE INDEX IF NOT EXISTS idx_operator_sla_operator ON operator_sla_resolution(operator_email);

-- ==========================================
-- RLS POLICIES FOR NEW TABLES
-- ==========================================

-- Enable RLS on all new tables
ALTER TABLE sales_metrics_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE sku_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE fulfillment_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE cx_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_activation_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE operator_sla_resolution ENABLE ROW LEVEL SECURITY;

-- Service role policies (full access)
CREATE POLICY sales_metrics_service_role ON sales_metrics_daily FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY sku_performance_service_role ON sku_performance FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY inventory_snapshots_service_role ON inventory_snapshots FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY fulfillment_tracking_service_role ON fulfillment_tracking FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY cx_conversations_service_role ON cx_conversations FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY shop_activation_service_role ON shop_activation_metrics FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY operator_sla_service_role ON operator_sla_resolution FOR ALL USING (auth.role() = 'service_role');

-- Operator read policies
CREATE POLICY sales_metrics_read_operators ON sales_metrics_daily FOR SELECT USING (TRUE);
CREATE POLICY sku_performance_read_operators ON sku_performance FOR SELECT USING (TRUE);
CREATE POLICY inventory_snapshots_read_operators ON inventory_snapshots FOR SELECT USING (TRUE);
CREATE POLICY fulfillment_tracking_read_operators ON fulfillment_tracking FOR SELECT USING (TRUE);
CREATE POLICY cx_conversations_read_operators ON cx_conversations FOR SELECT USING (TRUE);
CREATE POLICY shop_activation_read_operators ON shop_activation_metrics FOR SELECT USING (TRUE);
CREATE POLICY operator_sla_read_operators ON operator_sla_resolution FOR SELECT USING (TRUE);

-- ==========================================
-- TABLE COMMENTS
-- ==========================================

COMMENT ON TABLE sales_metrics_daily IS 'Daily sales metrics aggregation for Sales Pulse tile';
COMMENT ON TABLE sku_performance IS 'SKU-level performance tracking with inventory and sales data';
COMMENT ON TABLE inventory_snapshots IS 'Daily inventory snapshots with velocity and alert thresholds';
COMMENT ON TABLE fulfillment_tracking IS 'Order fulfillment status and SLA tracking';
COMMENT ON TABLE cx_conversations IS 'Customer support conversation tracking with SLA and escalation data';
COMMENT ON TABLE shop_activation_metrics IS 'Shop activation tracking for ops metrics';
COMMENT ON TABLE operator_sla_resolution IS 'Operator response time tracking for SLA breaches';

COMMENT ON VIEW v_sales_pulse_current IS 'Real-time sales pulse data for dashboard tile';
COMMENT ON VIEW v_inventory_alerts IS 'Current inventory alerts with severity levels';
COMMENT ON VIEW v_fulfillment_issues IS 'Current fulfillment issues requiring attention';
COMMENT ON VIEW v_cx_escalations IS 'Current CX escalations with severity';
COMMENT ON VIEW v_ops_aggregate_metrics IS 'Aggregated ops metrics for dashboard tile';
COMMENT ON VIEW v_data_quality_checks IS 'Data quality monitoring checks';
COMMENT ON VIEW v_growth_milestones IS 'Revenue milestones tracking ($1MM → $10MM)';
COMMENT ON VIEW v_kpi_summary IS 'Key performance indicators summary for executive dashboard';

