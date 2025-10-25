-- Migration: Create Inventory Image Search RPC Function
-- Description: Create RPC function for searching inventory by image similarity
-- Date: 2025-10-24
-- Agent: inventory
-- Task: INVENTORY-IMAGE-SEARCH-001 (Molecule M3)

-- =============================================================================
-- RPC Function: search_inventory_images
-- =============================================================================

CREATE OR REPLACE FUNCTION search_inventory_images(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 10,
  filter_project text DEFAULT 'occ'
)
RETURNS TABLE (
  photo_id uuid,
  image_url text,
  thumbnail_url text,
  shopify_product_id bigint,
  shopify_variant_id bigint,
  product_sku text,
  product_name text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cp.id AS photo_id,
    cp.image_url,
    cp.thumbnail_url,
    cp.shopify_product_id,
    cp.shopify_variant_id,
    cp.product_sku,
    cp.description AS product_name,
    1 - (ie.embedding <=> query_embedding) AS similarity
  FROM image_embeddings ie
  JOIN customer_photos cp ON cp.id = ie.photo_id
  WHERE 
    ie.project = filter_project
    AND cp.shopify_product_id IS NOT NULL  -- Only return images linked to products
    AND 1 - (ie.embedding <=> query_embedding) >= match_threshold
  ORDER BY ie.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- =============================================================================
-- Grant Permissions
-- =============================================================================

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION search_inventory_images(vector(1536), float, int, text) 
TO authenticated;

-- Grant execute permission to service role (for API calls)
GRANT EXECUTE ON FUNCTION search_inventory_images(vector(1536), float, int, text) 
TO service_role;

-- =============================================================================
-- Comments for Documentation
-- =============================================================================

COMMENT ON FUNCTION search_inventory_images IS 
'Search for inventory products by image similarity using pgvector. 
Returns images that are linked to products (shopify_product_id IS NOT NULL) 
ordered by similarity score.';

-- =============================================================================
-- Migration Notes
-- =============================================================================

-- This RPC function enables efficient inventory image search by:
-- 1. Using pgvector cosine similarity (<=> operator)
-- 2. Filtering for images linked to products
-- 3. Applying similarity threshold
-- 4. Returning enriched results with product IDs
--
-- Usage from API:
-- const { data } = await supabase.rpc('search_inventory_images', {
--   query_embedding: '[0.1, 0.2, ...]',
--   match_threshold: 0.7,
--   match_count: 10,
--   filter_project: 'occ'
-- });
--
-- Rollback:
-- DROP FUNCTION IF EXISTS search_inventory_images(vector(1536), float, int, text);

