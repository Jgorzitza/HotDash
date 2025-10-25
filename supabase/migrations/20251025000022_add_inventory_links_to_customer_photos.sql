-- Migration: Add Inventory Links to Customer Photos
-- Description: Add Shopify product/variant IDs to customer_photos for inventory integration
-- Date: 2025-10-24
-- Agent: inventory
-- Task: INVENTORY-IMAGE-SEARCH-001 (Molecule M2)

-- =============================================================================
-- Add Shopify Product/Variant ID columns to customer_photos
-- =============================================================================

-- Add shopify_product_id column (BIGINT to match Shopify's numeric IDs)
ALTER TABLE customer_photos 
ADD COLUMN IF NOT EXISTS shopify_product_id BIGINT;

-- Add shopify_variant_id column (BIGINT to match Shopify's numeric IDs)
ALTER TABLE customer_photos 
ADD COLUMN IF NOT EXISTS shopify_variant_id BIGINT;

-- =============================================================================
-- Create Indexes for Performance
-- =============================================================================

-- Index for product lookup (find all images for a product)
CREATE INDEX IF NOT EXISTS idx_customer_photos_shopify_product_id 
ON customer_photos(shopify_product_id) 
WHERE shopify_product_id IS NOT NULL;

-- Index for variant lookup (find all images for a specific variant)
CREATE INDEX IF NOT EXISTS idx_customer_photos_shopify_variant_id 
ON customer_photos(shopify_variant_id) 
WHERE shopify_variant_id IS NOT NULL;

-- Composite index for project + product queries
CREATE INDEX IF NOT EXISTS idx_customer_photos_project_product 
ON customer_photos(project, shopify_product_id) 
WHERE shopify_product_id IS NOT NULL;

-- Composite index for project + variant queries
CREATE INDEX IF NOT EXISTS idx_customer_photos_project_variant 
ON customer_photos(project, shopify_variant_id) 
WHERE shopify_variant_id IS NOT NULL;

-- =============================================================================
-- Update RLS Policies (if needed)
-- =============================================================================

-- RLS policies already exist for customer_photos from base migration
-- No changes needed - existing policies cover new columns

-- =============================================================================
-- Comments for Documentation
-- =============================================================================

COMMENT ON COLUMN customer_photos.shopify_product_id IS 
'Shopify product ID (numeric) for inventory integration. Links image to product for visual search.';

COMMENT ON COLUMN customer_photos.shopify_variant_id IS 
'Shopify variant ID (numeric) for inventory integration. Links image to specific variant for precise matching.';

-- =============================================================================
-- Migration Notes
-- =============================================================================

-- This migration adds inventory integration to the image search system.
-- 
-- Usage:
-- 1. When uploading product images, set shopify_product_id and/or shopify_variant_id
-- 2. When searching by image, join with inventory data using these IDs
-- 3. product_sku field remains for backward compatibility and text-based lookup
--
-- Rollback:
-- ALTER TABLE customer_photos DROP COLUMN IF EXISTS shopify_product_id;
-- ALTER TABLE customer_photos DROP COLUMN IF EXISTS shopify_variant_id;
-- DROP INDEX IF EXISTS idx_customer_photos_shopify_product_id;
-- DROP INDEX IF EXISTS idx_customer_photos_shopify_variant_id;
-- DROP INDEX IF EXISTS idx_customer_photos_project_product;
-- DROP INDEX IF EXISTS idx_customer_photos_project_variant;

