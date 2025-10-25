-- =============================================================================
-- Image Search Database Schema
-- =============================================================================
-- Purpose: Enable visual search for customer support using CLIP embeddings
-- Owner: data
-- Date: 2025-10-25
-- Task: DATA-IMAGE-SEARCH-001
-- MCP Evidence: artifacts/data/2025-10-24/mcp/image-search-schema.jsonl
--
-- Tables:
--   1. customer_photos - Stores customer-uploaded images with metadata
--   2. image_embeddings - Stores CLIP vector embeddings for similarity search
--
-- Features:
--   - Vector similarity search using pgvector (IVFFlat index)
--   - RLS policies for project isolation
--   - Service role policies for worker access
--   - Automatic timestamp tracking
--   - Metadata storage for image context
--
-- Dependencies:
--   - pgvector extension (for vector(1536) type)
--   - UUID extension (for gen_random_uuid())
--
-- References:
--   - Similar pattern: supabase/migrations/20251024000003_create_knowledge_base.sql
--   - Vector index: USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100)
--   - RLS pattern: supabase/migrations/20251020220000_social_posts.sql
-- =============================================================================

-- =============================================================================
-- Table 1: customer_photos
-- =============================================================================
-- Purpose: Store customer-uploaded images with metadata for visual search
-- Use Case: Customer sends photo of product issue, we find similar cases
-- =============================================================================

CREATE TABLE IF NOT EXISTS customer_photos (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Project isolation
  project TEXT NOT NULL DEFAULT 'occ',
  shop_domain TEXT NOT NULL,
  
  -- Image identification
  conversation_id TEXT NOT NULL,  -- Chatwoot conversation ID
  message_id TEXT NOT NULL,       -- Chatwoot message ID
  customer_email TEXT,             -- Customer email (optional, for lookup)
  
  -- Image storage
  image_url TEXT NOT NULL,         -- URL to stored image (Supabase Storage or external)
  image_hash TEXT,                 -- SHA-256 hash for deduplication
  file_size_bytes INT,             -- File size in bytes
  mime_type TEXT,                  -- e.g., 'image/jpeg', 'image/png'
  width INT,                       -- Image width in pixels
  height INT,                      -- Image height in pixels
  
  -- Image context
  description TEXT,                -- Customer's description of the image
  detected_labels TEXT[],          -- AI-detected labels (e.g., ['product', 'damage', 'packaging'])
  detected_objects JSONB,          -- AI-detected objects with bounding boxes
  
  -- Classification
  issue_category TEXT,             -- e.g., 'damage', 'wrong_item', 'quality_issue'
  product_sku TEXT,                -- Associated product SKU (if identified)
  order_id TEXT,                   -- Associated order ID (if available)
  
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending',  -- 'pending', 'processed', 'archived'
  processed_at TIMESTAMPTZ,        -- When embedding was generated
  
  -- Timestamps
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Metadata
  metadata JSONB DEFAULT '{}'      -- Additional flexible metadata
);

-- =============================================================================
-- Table 2: image_embeddings
-- =============================================================================
-- Purpose: Store CLIP vector embeddings for similarity search
-- Use Case: Find visually similar images using cosine similarity
-- Vector Dimension: 1536 (OpenAI CLIP or similar model)
-- =============================================================================

CREATE TABLE IF NOT EXISTS image_embeddings (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Foreign key to customer_photos
  photo_id UUID NOT NULL REFERENCES customer_photos(id) ON DELETE CASCADE,
  
  -- Project isolation (denormalized for RLS performance)
  project TEXT NOT NULL DEFAULT 'occ',
  shop_domain TEXT NOT NULL,
  
  -- Vector embedding
  embedding vector(1536) NOT NULL,  -- CLIP embedding (1536 dimensions)
  
  -- Embedding metadata
  model_name TEXT NOT NULL,         -- e.g., 'openai/clip-vit-large-patch14'
  model_version TEXT,               -- Model version for tracking
  embedding_quality_score FLOAT,   -- Confidence score (0.0-1.0)
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Metadata
  metadata JSONB DEFAULT '{}'       -- Additional flexible metadata
);

-- =============================================================================
-- Indexes for Performance
-- =============================================================================

-- customer_photos indexes
CREATE INDEX IF NOT EXISTS idx_customer_photos_shop_domain 
  ON customer_photos(shop_domain);

CREATE INDEX IF NOT EXISTS idx_customer_photos_conversation 
  ON customer_photos(conversation_id);

CREATE INDEX IF NOT EXISTS idx_customer_photos_status 
  ON customer_photos(status) 
  WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_customer_photos_uploaded 
  ON customer_photos(uploaded_at DESC);

CREATE INDEX IF NOT EXISTS idx_customer_photos_project 
  ON customer_photos(project);

CREATE INDEX IF NOT EXISTS idx_customer_photos_hash 
  ON customer_photos(image_hash) 
  WHERE image_hash IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_customer_photos_issue_category 
  ON customer_photos(issue_category) 
  WHERE issue_category IS NOT NULL;

-- image_embeddings indexes

-- Vector similarity index (IVFFlat for approximate nearest neighbor search)
-- lists = 100 is recommended for datasets with 10K-1M vectors
-- For smaller datasets, use lists = sqrt(total_rows)
CREATE INDEX IF NOT EXISTS idx_image_embeddings_vector 
  ON image_embeddings 
  USING ivfflat (embedding vector_cosine_ops) 
  WITH (lists = 100);

CREATE INDEX IF NOT EXISTS idx_image_embeddings_photo_id 
  ON image_embeddings(photo_id);

CREATE INDEX IF NOT EXISTS idx_image_embeddings_project 
  ON image_embeddings(project);

CREATE INDEX IF NOT EXISTS idx_image_embeddings_shop_domain 
  ON image_embeddings(shop_domain);

-- =============================================================================
-- Row Level Security (RLS) Policies
-- =============================================================================

-- Enable RLS on both tables
ALTER TABLE customer_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE image_embeddings ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- customer_photos RLS Policies
-- =============================================================================

-- Policy 1: Service role has full access (for workers and system operations)
CREATE POLICY customer_photos_service_role_all
  ON customer_photos
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Policy 2: Authenticated users can read photos for their project
CREATE POLICY customer_photos_read_by_project
  ON customer_photos
  FOR SELECT
  TO authenticated
  USING (
    project = COALESCE(
      current_setting('app.current_project', true),
      auth.jwt() ->> 'project'
    )
  );

-- Policy 3: Authenticated users can insert photos for their project
CREATE POLICY customer_photos_insert_by_project
  ON customer_photos
  FOR INSERT
  TO authenticated
  WITH CHECK (
    project = COALESCE(
      current_setting('app.current_project', true),
      auth.jwt() ->> 'project'
    )
  );

-- Policy 4: Authenticated users can update photos for their project
CREATE POLICY customer_photos_update_by_project
  ON customer_photos
  FOR UPDATE
  TO authenticated
  USING (
    project = COALESCE(
      current_setting('app.current_project', true),
      auth.jwt() ->> 'project'
    )
  )
  WITH CHECK (
    project = COALESCE(
      current_setting('app.current_project', true),
      auth.jwt() ->> 'project'
    )
  );

-- =============================================================================
-- image_embeddings RLS Policies
-- =============================================================================

-- Policy 1: Service role has full access (for embedding generation workers)
CREATE POLICY image_embeddings_service_role_all
  ON image_embeddings
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Policy 2: Authenticated users can read embeddings for their project
CREATE POLICY image_embeddings_read_by_project
  ON image_embeddings
  FOR SELECT
  TO authenticated
  USING (
    project = COALESCE(
      current_setting('app.current_project', true),
      auth.jwt() ->> 'project'
    )
  );

-- Policy 3: Only service role can insert embeddings (workers only)
-- This prevents authenticated users from creating embeddings directly
CREATE POLICY image_embeddings_insert_service_only
  ON image_embeddings
  FOR INSERT
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =============================================================================
-- Comments for Documentation
-- =============================================================================

COMMENT ON TABLE customer_photos IS 'Customer-uploaded images for visual search and support';
COMMENT ON TABLE image_embeddings IS 'CLIP vector embeddings for image similarity search';

COMMENT ON COLUMN customer_photos.image_hash IS 'SHA-256 hash for deduplication';
COMMENT ON COLUMN customer_photos.detected_labels IS 'AI-detected labels from image analysis';
COMMENT ON COLUMN customer_photos.issue_category IS 'Classified issue type: damage, wrong_item, quality_issue';

COMMENT ON COLUMN image_embeddings.embedding IS 'CLIP vector embedding (1536 dimensions) for similarity search';
COMMENT ON COLUMN image_embeddings.model_name IS 'Model used for embedding generation (e.g., openai/clip-vit-large-patch14)';

-- =============================================================================
-- Grants for Roles
-- =============================================================================

-- Grant SELECT to authenticated users (via RLS policies)
GRANT SELECT ON customer_photos TO authenticated;
GRANT SELECT ON image_embeddings TO authenticated;

-- Grant INSERT to authenticated users for customer_photos (via RLS policies)
GRANT INSERT ON customer_photos TO authenticated;

-- Grant UPDATE to authenticated users for customer_photos (via RLS policies)
GRANT UPDATE ON customer_photos TO authenticated;

-- Grant ALL to service_role (for workers and system operations)
GRANT ALL ON customer_photos TO service_role;
GRANT ALL ON image_embeddings TO service_role;

-- =============================================================================
-- Analyze Tables for Query Optimization
-- =============================================================================

ANALYZE customer_photos;
ANALYZE image_embeddings;

