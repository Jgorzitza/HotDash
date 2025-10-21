-- Migration: Create Knowledge Base table with Vector Embeddings
-- Phase: 10-13 (Advanced)
-- Created: 2025-10-21
-- Task: DATA-013
-- Dependencies: pgvector extension

-- Enable pgvector extension for vector embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Create table
CREATE TABLE IF NOT EXISTS knowledge_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_domain TEXT NOT NULL,
  
  -- Document identification
  document_key TEXT NOT NULL,  -- Unique identifier
  document_type TEXT NOT NULL,  -- 'faq', 'product_info', 'policy', 'guide'
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  
  -- Vector embedding (using pgvector extension)
  embedding vector(1536),  -- OpenAI ada-002 dimension
  
  -- Metadata
  source_url TEXT,  -- Original source
  tags TEXT[],
  category TEXT,
  
  -- Versioning
  version INT DEFAULT 1,
  is_current BOOLEAN DEFAULT TRUE,
  previous_version_id UUID REFERENCES knowledge_base(id),
  
  -- Tracking
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_indexed_at TIMESTAMPTZ,
  
  metadata JSONB DEFAULT '{}',
  project TEXT NOT NULL DEFAULT 'occ',
  
  UNIQUE(shop_domain, document_key, version)
);

-- Vector similarity index (using pgvector IVFFlat)
CREATE INDEX IF NOT EXISTS idx_knowledge_base_embedding 
ON knowledge_base 
USING ivfflat (embedding vector_cosine_ops) 
WITH (lists = 100);

-- Other indexes
CREATE INDEX IF NOT EXISTS idx_knowledge_base_shop_type 
ON knowledge_base(shop_domain, document_type);

CREATE INDEX IF NOT EXISTS idx_knowledge_base_current 
ON knowledge_base(is_current) 
WHERE is_current = TRUE;

CREATE INDEX IF NOT EXISTS idx_knowledge_base_tags 
ON knowledge_base USING GIN(tags);

CREATE INDEX IF NOT EXISTS idx_knowledge_base_project 
ON knowledge_base(project);

-- Enable RLS
ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their shop knowledge base"
  ON knowledge_base
  TO authenticated
  USING (shop_domain = current_setting('app.current_shop', true));

-- Update statistics
ANALYZE knowledge_base;

