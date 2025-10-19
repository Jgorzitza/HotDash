-- Seed Data: Hot Rodan Automotive Parts & Customer Segments
-- Purpose: Synthetic data for product categories and customer segmentation
-- Generated: 2025-10-19
-- Safety: LOCAL DEVELOPMENT ONLY

-- Insert product categories (hot rod automotive parts)
INSERT INTO product_categories (
  shopify_product_id,
  category_l1,
  category_l2,
  category_l3,
  fits_vehicle_years,
  fits_makes,
  fits_models,
  is_performance_part,
  is_restoration_part,
  is_custom_fabrication,
  avg_order_value,
  margin_pct,
  inventory_velocity
) VALUES
  -- Engine & Drivetrain
  (1001, 'Engine & Drivetrain', 'Carburetors', 'Holley 4-Barrel', ARRAY[1928, 1929, 1930, 1931, 1932], ARRAY['Ford', 'Chevy'], ARRAY['Model A', 'Tri-Five'], true, false, false, 450.00, 35.00, 'fast'),
  (1002, 'Engine & Drivetrain', 'Carburetors', 'Edelbrock', ARRAY[1932, 1933, 1934], ARRAY['Ford'], ARRAY['Deuce Coupe'], true, false, false, 520.00, 38.00, 'fast'),
  (1003, 'Engine & Drivetrain', 'Headers', 'Stainless Steel', ARRAY[1932, 1933, 1934, 1935], ARRAY['Ford', 'Chevy'], NULL, true, false, true, 680.00, 42.00, 'medium'),
  (1004, 'Engine & Drivetrain', 'Ignition', 'MSD Distributor', NULL, ARRAY['Ford', 'Chevy', 'Chrysler'], NULL, true, false, false, 320.00, 40.00, 'fast'),
  
  -- Suspension & Steering
  (2001, 'Suspension & Steering', 'Coilovers', 'Adjustable', ARRAY[1932, 1933, 1934], ARRAY['Ford'], ARRAY['Deuce Coupe', 'Highboy'], true, false, false, 890.00, 35.00, 'medium'),
  (2002, 'Suspension & Steering', 'Steering Box', 'Borgeson', NULL, ARRAY['Ford', 'Chevy'], NULL, true, false, false, 620.00, 32.00, 'slow'),
  (2003, 'Suspension & Steering', 'Shocks', 'Monroe', NULL, ARRAY['Ford', 'Chevy', 'Chrysler'], NULL, true, false, false, 180.00, 45.00, 'fast'),
  
  -- Body & Trim
  (3001, 'Body & Trim', 'Fenders', 'Steel Reproduction', ARRAY[1932], ARRAY['Ford'], ARRAY['Deuce Coupe'], false, true, false, 1200.00, 28.00, 'slow'),
  (3002, 'Body & Trim', 'Grilles', 'Stainless Steel', ARRAY[1932, 1933, 1934], ARRAY['Ford'], NULL, false, true, false, 450.00, 35.00, 'slow'),
  (3003, 'Body & Trim', 'Running Boards', 'Aluminum', ARRAY[1928, 1929, 1930, 1931], ARRAY['Ford'], ARRAY['Model A'], false, true, false, 380.00, 30.00, 'medium'),
  
  -- Wheels & Tires
  (4001, 'Wheels & Tires', 'Steel Wheels', '15x7', NULL, ARRAY['Ford', 'Chevy'], NULL, false, true, false, 220.00, 35.00, 'fast'),
  (4002, 'Wheels & Tires', 'Tires', 'Firestone', NULL, ARRAY['Ford', 'Chevy', 'Chrysler'], NULL, false, false, false, 280.00, 25.00, 'fast'),
  
  -- Custom Fabrication
  (5001, 'Custom Fabrication', 'Chassis', 'Full Frame', NULL, ARRAY['Ford', 'Chevy'], NULL, false, false, true, 5500.00, 20.00, 'slow'),
  (5002, 'Custom Fabrication', 'Roll Cage', 'Chromoly', NULL, ARRAY['Ford', 'Chevy', 'Chrysler'], NULL, true, false, true, 1800.00, 35.00, 'slow'),
  (5003, 'Custom Fabrication', 'Exhaust', 'Stainless Custom', NULL, ARRAY['Ford', 'Chevy'], NULL, true, false, true, 980.00, 40.00, 'medium')
ON CONFLICT (shopify_product_id) DO NOTHING;

-- Insert customer segments
INSERT INTO customer_segments (
  shopify_customer_id,
  primary_segment,
  segment_confidence,
  total_orders,
  total_revenue,
  avg_order_value,
  days_since_first_order,
  days_since_last_order,
  top_category_l1,
  top_category_l2,
  prefers_performance,
  prefers_restoration,
  primary_vehicle_year,
  primary_vehicle_make,
  primary_vehicle_model,
  support_tickets_count,
  review_count,
  avg_review_rating,
  lifecycle_stage
) VALUES
  -- DIY Builders
  (10001, 'diy_builder', 0.85, 8, 3200.00, 400.00, 180, 30, 'Engine & Drivetrain', 'Carburetors', true, false, 1932, 'Ford', 'Deuce Coupe', 2, 3, 4.7, 'active'),
  (10002, 'diy_builder', 0.78, 5, 1850.00, 370.00, 120, 60, 'Suspension & Steering', 'Coilovers', true, false, 1934, 'Ford', 'Highboy', 1, 2, 5.0, 'active'),
  (10003, 'diy_builder', 0.92, 12, 4800.00, 400.00, 365, 15, 'Engine & Drivetrain', 'Headers', true, false, 1932, 'Ford', 'Roadster', 0, 5, 4.8, 'active'),
  
  -- Professional Shops
  (20001, 'professional_shop', 0.95, 45, 28000.00, 622.00, 540, 7, 'Custom Fabrication', 'Chassis', true, true, NULL, 'Ford', NULL, 8, 0, NULL, 'active'),
  (20002, 'professional_shop', 0.88, 32, 18500.00, 578.00, 420, 14, 'Engine & Drivetrain', 'Carburetors', true, true, NULL, 'Chevy', NULL, 5, 0, NULL, 'active'),
  (20003, 'professional_shop', 0.91, 28, 21000.00, 750.00, 280, 21, 'Custom Fabrication', 'Full Frame', true, false, NULL, 'Ford', NULL, 3, 1, 5.0, 'active'),
  
  -- Enthusiast Collectors
  (30001, 'enthusiast_collector', 0.82, 15, 6800.00, 453.00, 220, 45, 'Body & Trim', 'Fenders', false, true, 1932, 'Ford', 'Deuce Coupe', 4, 8, 4.9, 'active'),
  (30002, 'enthusiast_collector', 0.76, 10, 4200.00, 420.00, 180, 90, 'Body & Trim', 'Grilles', false, true, 1929, 'Ford', 'Model A', 2, 5, 4.5, 'at_risk'),
  (30003, 'enthusiast_collector', 0.89, 22, 9500.00, 432.00, 450, 25, 'Wheels & Tires', 'Steel Wheels', false, true, 1933, 'Ford', NULL, 1, 12, 4.8, 'active'),
  
  -- First-Time Builders
  (40001, 'first_time_builder', 0.65, 2, 650.00, 325.00, 28, 14, 'Engine & Drivetrain', 'Ignition', true, false, 1932, 'Ford', 'Coupe', 1, 0, NULL, 'new'),
  (40002, 'first_time_builder', 0.58, 1, 280.00, 280.00, 15, 15, 'Wheels & Tires', 'Tires', false, false, NULL, 'Chevy', NULL, 0, 0, NULL, 'new'),
  (40003, 'first_time_builder', 0.70, 3, 980.00, 327.00, 45, 10, 'Suspension & Steering', 'Shocks', true, false, 1934, 'Ford', NULL, 2, 1, 4.0, 'new'),
  
  -- Racing Enthusiasts
  (50001, 'racing_enthusiast', 0.93, 38, 16500.00, 434.00, 320, 10, 'Engine & Drivetrain', 'Carburetors', true, false, 1932, 'Ford', 'Roadster', 6, 8, 4.6, 'active'),
  (50002, 'racing_enthusiast', 0.87, 25, 12000.00, 480.00, 210, 18, 'Custom Fabrication', 'Roll Cage', true, false, NULL, 'Chevy', NULL, 3, 4, 4.8, 'active'),
  (50003, 'racing_enthusiast', 0.79, 18, 8200.00, 456.00, 150, 35, 'Engine & Drivetrain', 'Headers', true, false, 1933, 'Ford', NULL, 2, 6, 4.7, 'active'),
  
  -- Churned Customers
  (60001, 'diy_builder', 0.72, 4, 1200.00, 300.00, 240, 195, 'Body & Trim', 'Running Boards', false, true, 1929, 'Ford', 'Model A', 0, 2, 4.5, 'churned'),
  (60002, 'enthusiast_collector', 0.68, 6, 2200.00, 367.00, 380, 220, 'Wheels & Tires', 'Steel Wheels', false, true, 1932, 'Ford', NULL, 1, 3, 4.0, 'churned')
ON CONFLICT (shopify_customer_id) DO NOTHING;

-- Log seed application
DO $$
BEGIN
  RAISE NOTICE 'Seed 02_hot_rodan_data.sql applied successfully';
  RAISE NOTICE 'Product categories inserted: 15 rows';
  RAISE NOTICE 'Customer segments inserted: 17 rows';
END$$;

