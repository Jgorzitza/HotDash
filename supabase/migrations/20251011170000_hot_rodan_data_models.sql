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
  EXTRACT(MONTH FROM month_date) as month_num,
  TO_CHAR(month_date, 'Month') as month_name,
  CASE 
    WHEN EXTRACT(MONTH FROM month_date) BETWEEN 3 AND 9 THEN 'racing_season'
    ELSE 'off_season'
  END as season,
  category_l1,
  COUNT(*) as record_count
FROM product_categories pc
CROSS JOIN generate_series(NOW() - INTERVAL '2 years', NOW(), INTERVAL '1 month') as month_date
GROUP BY 1, 2, 3, pc.category_l1
ORDER BY month_num, category_l1;

COMMENT ON TABLE product_categories IS 'Hot Rodan automotive parts categorization with vehicle compatibility';
COMMENT ON TABLE customer_segments IS 'Hot Rodan customer segmentation (DIY, Professional, Enthusiast, First-time, Racing)';
COMMENT ON VIEW v_product_performance IS 'Product performance metrics by category for operator dashboard';
COMMENT ON VIEW v_customer_segment_summary IS 'Customer segment distribution and revenue for operator insights';

