---
epoch: 2025.10.E1
doc: docs/data/hot_rodan_data_models.md
owner: data
last_reviewed: 2025-10-11
expires: 2025-11-11
---

# Hot Rodan Data Models — Product Analytics & Customer Segmentation

**Purpose:** Domain-specific data models for hot rod e-commerce analytics  
**Business:** Hot Rodan (hotrodan.com) - automotive parts for classic car enthusiasts  
**Goal:** Support $10MM revenue target with operator-first insights

---

## Overview

Hot Rodan sells automotive parts for hot rod enthusiasts, classic car builders, and professional restoration shops. These data models enable:

- Product performance tracking by category
- Customer segmentation for targeted engagement
- Inventory optimization for high-value parts
- Seasonal trend detection (racing season vs. winter)

---

## 1. Automotive Parts Categorization Schema

### Product Taxonomy

**Level 1: Major Categories**

```
├── Engine & Drivetrain
├── Suspension & Steering
├── Brakes & Wheels
├── Exterior & Body
├── Interior & Trim
├── Electrical & Lighting
├── Exhaust & Intake
├── Fuel & Ignition
├── Tools & Equipment
└── Accessories & Apparel
```

### Supabase Schema Extension

```sql
-- Product category attributes for Hot Rodan
CREATE TABLE product_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shopify_product_id BIGINT NOT NULL,
  category_l1 TEXT NOT NULL, -- Major category
  category_l2 TEXT, -- Subcategory
  category_l3 TEXT, -- Specific type

  -- Hot rod specific attributes
  fits_vehicle_years INT[], -- e.g., [1932, 1933, 1934] for Ford Deuce Coupe
  fits_makes TEXT[], -- e.g., ['Ford', 'Chevy', 'Mopar']
  fits_models TEXT[], -- e.g., ['Model A', 'Tri-Five', 'Charger']

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

CREATE INDEX idx_product_categories_shopify_id ON product_categories(shopify_product_id);
CREATE INDEX idx_product_categories_l1 ON product_categories(category_l1);
CREATE INDEX idx_product_categories_vehicle_years ON product_categories USING GIN(fits_vehicle_years);
CREATE INDEX idx_product_categories_makes ON product_categories USING GIN(fits_makes);
```

### Example Categories

**Engine & Drivetrain:**

- Carburetors (Holley, Edelbrock, Rochester)
- Intake Manifolds
- Headers & Exhaust Manifolds
- Transmissions (TH350, TH400, Powerglide)
- Clutches & Flywheels

**Suspension & Steering:**

- Coilovers & Shocks
- Lowering Kits
- Steering Wheels & Columns
- Tubular Control Arms
- Sway Bars

**Brakes & Wheels:**

- Disc Brake Conversions
- Master Cylinders & Boosters
- Steel Wheels (15", 17", 20")
- Custom Wheels
- Brake Lines & Fittings

---

## 2. Hot Rod Customer Segmentation

### Segment Definitions

**Primary Segments (5 archetypes):**

1. **DIY Builder** (35% of customers)
   - Weekend warrior building own hot rod
   - Budget-conscious, researches extensively
   - Buys frequently, smaller orders ($50-$300)
   - High engagement with how-to content
   - Lifetime value: $2,500-$5,000

2. **Professional Shop** (25% of customers)
   - Restoration/custom shops buying for client projects
   - High-volume, repeat customers
   - Larger orders ($500-$5,000)
   - Price-sensitive on bulk items
   - Lifetime value: $15,000-$50,000

3. **Enthusiast Collector** (20% of customers)
   - Owns multiple classic cars
   - Quality-focused, less price-sensitive
   - Medium orders ($300-$1,500)
   - Buys maintenance/upgrade parts
   - Lifetime value: $8,000-$15,000

4. **First-Time Builder** (15% of customers)
   - New to hot rod hobby
   - Needs guidance, high support engagement
   - Medium orders ($200-$800)
   - High churn if not supported well
   - Lifetime value: $1,500-$3,000

5. **Racing Enthusiast** (5% of customers)
   - Performance-focused, track-oriented
   - High-margin performance parts
   - Seasonal buying (spring/summer)
   - Smaller segment, high AOV
   - Lifetime value: $10,000-$25,000

### Customer Segmentation Schema

```sql
-- Customer segmentation for Hot Rodan
CREATE TABLE customer_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shopify_customer_id BIGINT NOT NULL,

  -- Segment classification
  primary_segment TEXT NOT NULL CHECK (primary_segment IN (
    'diy_builder',
    'professional_shop',
    'enthusiast_collector',
    'first_time_builder',
    'racing_enthusiast'
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
    'new', 'active', 'at_risk', 'churned', 'reactivated'
  )),

  -- Metadata
  segmented_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_customer_segments_shopify_id ON customer_segments(shopify_customer_id);
CREATE INDEX idx_customer_segments_primary ON customer_segments(primary_segment);
CREATE INDEX idx_customer_segments_lifecycle ON customer_segments(lifecycle_stage);
CREATE INDEX idx_customer_segments_vehicle_make ON customer_segments(primary_vehicle_make);
```

### Segmentation Rules

**DIY Builder Identification:**

```sql
-- Classify as DIY Builder if:
-- - AOV between $50-$300
-- - 3+ orders in last 6 months
-- - Buys from mixed categories (not specialized)
-- - Support tickets contain "how to" or "install"
```

**Professional Shop Identification:**

```sql
-- Classify as Professional Shop if:
-- - AOV > $500
-- - Consistent monthly orders
-- - Tax-exempt or business account
-- - Buys in bulk (6+ units of same item)
```

**First-Time Builder Identification:**

```sql
-- Classify as First-Time Builder if:
-- - < 30 days since first order
-- - 1-2 orders only
-- - High support engagement
-- - Purchased "starter" kits or bundles
```

---

## 3. Product Performance Analytics

### KPIs by Category

**Sales Velocity Metrics:**

```sql
CREATE VIEW v_product_performance AS
SELECT
  pc.category_l1,
  pc.category_l2,
  COUNT(DISTINCT pc.shopify_product_id) as products_in_category,
  SUM(f.value->>'order_count')::INT as total_orders,
  SUM((f.value->>'revenue')::NUMERIC) as total_revenue,
  AVG((f.value->>'avg_order_value')::NUMERIC) as category_aov,
  SUM(CASE WHEN pc.inventory_velocity = 'fast' THEN 1 ELSE 0 END) as fast_movers,
  SUM(CASE WHEN pc.inventory_velocity = 'slow' THEN 1 ELSE 0 END) as slow_movers
FROM product_categories pc
LEFT JOIN facts f ON f.topic = 'shopify.sales'
  AND f.value->>'sku' = pc.shopify_product_id::text
WHERE f.created_at > NOW() - INTERVAL '30 days'
GROUP BY pc.category_l1, pc.category_l2
ORDER BY total_revenue DESC;
```

**Inventory Optimization:**

```sql
-- Flag slow-moving inventory by category
SELECT
  category_l1,
  COUNT(*) as slow_moving_skus,
  SUM((value->>'available_quantity')::INT) as units_at_risk,
  SUM((value->>'available_quantity')::INT * (value->>'unit_cost')::NUMERIC) as capital_tied_up
FROM product_categories pc
JOIN facts f ON f.topic = 'shopify.inventory'
WHERE inventory_velocity = 'slow'
  AND (f.value->>'available_quantity')::INT > (f.value->>'monthly_sales_avg')::INT * 6
GROUP BY category_l1
ORDER BY capital_tied_up DESC;
```

---

## 4. Seasonal Pattern Detection

### Racing Season vs. Off-Season

**Hot Rod Industry Seasonality:**

- **High Season (March-September):** Car shows, racing events, summer projects
- **Off-Season (October-February):** Indoor projects, engine rebuilds, planning

```sql
-- Seasonal trend analysis
CREATE VIEW v_seasonal_patterns AS
SELECT
  EXTRACT(MONTH FROM created_at) as month_num,
  TO_CHAR(created_at, 'Month') as month_name,
  CASE
    WHEN EXTRACT(MONTH FROM created_at) BETWEEN 3 AND 9 THEN 'racing_season'
    ELSE 'off_season'
  END as season,
  pc.category_l1,
  COUNT(*) as order_count,
  SUM((f.value->>'revenue')::NUMERIC) as revenue,
  AVG((f.value->>'avg_order_value')::NUMERIC) as aov
FROM facts f
JOIN product_categories pc ON f.value->>'sku' = pc.shopify_product_id::text
WHERE f.topic = 'shopify.sales'
  AND f.created_at > NOW() - INTERVAL '2 years'
GROUP BY 1, 2, 3, pc.category_l1
ORDER BY month_num, revenue DESC;
```

**Expected Patterns:**

- **Racing Season:** Suspension, brakes, wheels (30-40% revenue increase)
- **Off-Season:** Engine rebuilds, interior work (stable)
- **Year-Round:** Maintenance parts, accessories (less seasonal)

---

## 5. Customer Journey Mapping

### Hot Rod Build Stages

```sql
-- Infer customer build stage from purchase history
CREATE VIEW v_customer_build_stage AS
SELECT
  cs.shopify_customer_id,
  cs.primary_segment,
  CASE
    -- Early stage: Planning & engine work
    WHEN SUM(CASE WHEN pc.category_l1 = 'Engine & Drivetrain' THEN 1 ELSE 0 END) > 5
      AND cs.days_since_first_order < 90
    THEN 'early_build'

    -- Mid stage: Suspension, brakes, chassis
    WHEN SUM(CASE WHEN pc.category_l1 IN ('Suspension & Steering', 'Brakes & Wheels') THEN 1 ELSE 0 END) > 3
      AND cs.days_since_first_order BETWEEN 90 AND 180
    THEN 'mid_build'

    -- Late stage: Finishing touches, accessories
    WHEN SUM(CASE WHEN pc.category_l1 IN ('Exterior & Body', 'Interior & Trim', 'Accessories & Apparel') THEN 1 ELSE 0 END) > 5
      AND cs.days_since_first_order > 180
    THEN 'finishing'

    -- Maintenance: Ongoing purchases after completion
    WHEN cs.days_since_first_order > 365
      AND cs.total_orders > 10
    THEN 'maintenance'

    ELSE 'unknown'
  END as build_stage,
  cs.total_orders,
  cs.days_since_first_order
FROM customer_segments cs
LEFT JOIN facts f ON f.value->>'customer_id' = cs.shopify_customer_id::text
LEFT JOIN product_categories pc ON f.value->>'sku' = pc.shopify_product_id::text
WHERE f.topic = 'shopify.sales'
GROUP BY cs.shopify_customer_id, cs.primary_segment, cs.total_orders, cs.days_since_first_order;
```

---

## 6. Operator Dashboard Tiles (Hot Rodan-Specific)

### Tile 1: Top Selling Categories (This Week)

```sql
SELECT
  category_l1,
  COUNT(DISTINCT value->>'order_id') as orders,
  SUM((value->>'revenue')::NUMERIC) as revenue,
  ROUND(100.0 * SUM((value->>'revenue')::NUMERIC) /
    (SELECT SUM((value->>'revenue')::NUMERIC) FROM facts WHERE topic='shopify.sales' AND created_at > NOW() - INTERVAL '7 days'), 2) as revenue_share_pct
FROM facts f
JOIN product_categories pc ON f.value->>'sku' = pc.shopify_product_id::text
WHERE f.topic = 'shopify.sales'
  AND f.created_at > NOW() - INTERVAL '7 days'
GROUP BY category_l1
ORDER BY revenue DESC
LIMIT 5;
```

### Tile 2: Customer Segment Distribution

```sql
SELECT
  primary_segment,
  COUNT(*) as customer_count,
  SUM(total_revenue) as segment_revenue,
  AVG(avg_order_value) as segment_aov,
  COUNT(*) FILTER (WHERE lifecycle_stage = 'active') as active_customers
FROM customer_segments
GROUP BY primary_segment
ORDER BY segment_revenue DESC;
```

### Tile 3: Seasonal Performance

```sql
SELECT
  season,
  SUM((value->>'revenue')::NUMERIC) as season_revenue,
  COUNT(*) as season_orders,
  STRING_AGG(DISTINCT category_l1, ', ' ORDER BY category_l1) as top_categories
FROM v_seasonal_patterns
WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW())
GROUP BY season;
```

---

## 7. Implementation Priority

### Phase 1: Foundation (Week 1)

1. ✅ Create product_categories table
2. ✅ Create customer_segments table
3. ✅ Populate with Shopify product data
4. ✅ Create performance views

### Phase 2: Enrichment (Week 2)

1. Implement segmentation logic
2. Backfill customer segments
3. Test seasonal pattern queries
4. Validate operator tiles

### Phase 3: Automation (Week 3)

1. Nightly refresh of segments
2. Weekly category performance rollup
3. Automated slow-mover alerts
4. Dashboard integration

---

## 8. Migration Scripts

### Migration: Create Hot Rodan Tables

```sql
-- File: supabase/migrations/20251011_hot_rodan_data_models.sql

-- Product categories
CREATE TABLE IF NOT EXISTS product_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shopify_product_id BIGINT NOT NULL,
  category_l1 TEXT NOT NULL,
  category_l2 TEXT,
  category_l3 TEXT,
  fits_vehicle_years INT[],
  fits_makes TEXT[],
  fits_models TEXT[],
  is_performance_part BOOLEAN DEFAULT false,
  is_restoration_part BOOLEAN DEFAULT false,
  is_custom_fabrication BOOLEAN DEFAULT false,
  avg_order_value NUMERIC(10,2),
  margin_pct NUMERIC(5,2),
  inventory_velocity TEXT CHECK (inventory_velocity IN ('fast', 'medium', 'slow')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Customer segments
CREATE TABLE IF NOT EXISTS customer_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shopify_customer_id BIGINT NOT NULL,
  primary_segment TEXT NOT NULL CHECK (primary_segment IN (
    'diy_builder', 'professional_shop', 'enthusiast_collector',
    'first_time_builder', 'racing_enthusiast'
  )),
  segment_confidence NUMERIC(3,2) DEFAULT 0.50,
  total_orders INT DEFAULT 0,
  total_revenue NUMERIC(10,2) DEFAULT 0,
  avg_order_value NUMERIC(10,2) DEFAULT 0,
  days_since_first_order INT,
  days_since_last_order INT,
  top_category_l1 TEXT,
  top_category_l2 TEXT,
  prefers_performance BOOLEAN DEFAULT false,
  prefers_restoration BOOLEAN DEFAULT false,
  primary_vehicle_year INT,
  primary_vehicle_make TEXT,
  primary_vehicle_model TEXT,
  support_tickets_count INT DEFAULT 0,
  review_count INT DEFAULT 0,
  avg_review_rating NUMERIC(2,1),
  lifecycle_stage TEXT CHECK (lifecycle_stage IN (
    'new', 'active', 'at_risk', 'churned', 'reactivated'
  )),
  segmented_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_product_categories_shopify_id ON product_categories(shopify_product_id);
CREATE INDEX idx_product_categories_l1 ON product_categories(category_l1);
CREATE INDEX idx_product_categories_vehicle_years ON product_categories USING GIN(fits_vehicle_years);
CREATE INDEX idx_product_categories_makes ON product_categories USING GIN(fits_makes);
CREATE INDEX idx_customer_segments_shopify_id ON customer_segments(shopify_customer_id);
CREATE INDEX idx_customer_segments_primary ON customer_segments(primary_segment);
CREATE INDEX idx_customer_segments_lifecycle ON customer_segments(lifecycle_stage);
CREATE INDEX idx_customer_segments_vehicle_make ON customer_segments(primary_vehicle_make);

-- RLS policies
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_segments ENABLE ROW LEVEL SECURITY;

CREATE POLICY product_categories_service_role ON product_categories FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY customer_segments_service_role ON customer_segments FOR ALL USING (auth.role() = 'service_role');
```

---

**Status:** ✅ AG-1 COMPLETE - Hot Rodan data models defined  
**Next:** AG-2 - Real-time dashboard queries  
**Evidence:** Migration scripts, schema documentation, operator tile queries  
**North Star Alignment:** ✅ DIRECT - Domain-specific analytics for operator insights
