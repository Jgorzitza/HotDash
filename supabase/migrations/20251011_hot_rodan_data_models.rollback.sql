-- Rollback: Hot Rodan Data Models Migration
-- Removes all domain-specific data models for hot rod e-commerce analytics

-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS operator_sla_resolution CASCADE;
DROP TABLE IF EXISTS shop_activation_metrics CASCADE;
DROP TABLE IF EXISTS cx_conversations CASCADE;
DROP TABLE IF EXISTS fulfillment_tracking CASCADE;
DROP TABLE IF EXISTS inventory_snapshots CASCADE;
DROP TABLE IF EXISTS sku_performance CASCADE;
DROP TABLE IF EXISTS sales_metrics_daily CASCADE;
DROP TABLE IF EXISTS customer_segments CASCADE;
DROP TABLE IF EXISTS product_categories CASCADE;

-- Note: Indexes and constraints will be dropped automatically with CASCADE

