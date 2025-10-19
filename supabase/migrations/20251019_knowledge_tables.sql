-- Knowledge Base Schema Migration
-- Created: 2025-10-19
-- Purpose: Support AI knowledge ingestion with pgvector semantic search
-- 
-- Enables:
-- - Document storage with 1536-dimensional embeddings (OpenAI text-embedding-3-small)
-- - Vector similarity search using pgvector extension
-- - Category and tag filtering
-- - Confidence scoring for RAG quality

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Knowledge documents table
CREATE TABLE IF NOT EXISTS knowledge_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Core content
  content TEXT NOT NULL,
  embedding VECTOR(1536), -- OpenAI text-embedding-3-small dimensions
  
  -- Metadata
  metadata JSONB NOT NULL DEFAULT '{}',
  source TEXT NOT NULL,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT content_not_empty CHECK (length(trim(content)) > 0)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_knowledge_documents_embedding 
  ON knowledge_documents USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

CREATE INDEX IF NOT EXISTS idx_knowledge_documents_source 
  ON knowledge_documents (source);

CREATE INDEX IF NOT EXISTS idx_knowledge_documents_created_at 
  ON knowledge_documents (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_knowledge_documents_metadata 
  ON knowledge_documents USING GIN (metadata);

-- Row Level Security (RLS)
ALTER TABLE knowledge_documents ENABLE ROW LEVEL SECURITY;

-- Policy: Service role can do everything
CREATE POLICY knowledge_documents_service_role 
  ON knowledge_documents 
  FOR ALL 
  TO service_role 
  USING (true) 
  WITH CHECK (true);

-- Policy: Authenticated users can read
CREATE POLICY knowledge_documents_authenticated_read 
  ON knowledge_documents 
  FOR SELECT 
  TO authenticated 
  USING (true);

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_knowledge_documents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-update updated_at
CREATE TRIGGER knowledge_documents_updated_at
  BEFORE UPDATE ON knowledge_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_knowledge_documents_updated_at();

-- Helper function: Semantic search
CREATE OR REPLACE FUNCTION search_knowledge(
  query_embedding VECTOR(1536),
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  metadata JSONB,
  source TEXT,
  similarity FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    knowledge_documents.id,
    knowledge_documents.content,
    knowledge_documents.metadata,
    knowledge_documents.source,
    1 - (knowledge_documents.embedding <=> query_embedding) AS similarity
  FROM knowledge_documents
  WHERE 1 - (knowledge_documents.embedding <=> query_embedding) >= match_threshold
  ORDER BY knowledge_documents.embedding <=> query_embedding
  LIMIT match_count;
END;
$$ LANGUAGE plpgsql;

-- Comments for documentation
COMMENT ON TABLE knowledge_documents IS 'Stores knowledge base documents with embeddings for semantic search';
COMMENT ON COLUMN knowledge_documents.embedding IS 'OpenAI text-embedding-3-small (1536 dimensions)';
COMMENT ON COLUMN knowledge_documents.metadata IS 'Flexible JSONB field for title, category, tags, confidence_score, etc.';
COMMENT ON FUNCTION search_knowledge IS 'Semantic search using cosine similarity. Returns top N matches above threshold.';

