-- Dev Knowledge Base initial schema
-- Safe to apply on the dedicated Supabase dev knowledge project only

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS knowledge_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_domain TEXT NOT NULL,
  document_key TEXT NOT NULL,
  document_type TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  embedding vector(1536),
  source_url TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  category TEXT,
  version INT NOT NULL DEFAULT 1,
  is_current BOOLEAN NOT NULL DEFAULT TRUE,
  previous_version_id UUID REFERENCES knowledge_base(id),
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_indexed_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  project TEXT NOT NULL DEFAULT 'dev_kb',
  UNIQUE (shop_domain, document_key, version)
);

CREATE INDEX IF NOT EXISTS idx_knowledge_base_embedding_dev
  ON knowledge_base USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

CREATE INDEX IF NOT EXISTS idx_knowledge_base_shop_type
  ON knowledge_base (shop_domain, document_type);

CREATE INDEX IF NOT EXISTS idx_knowledge_base_current
  ON knowledge_base (is_current);

CREATE INDEX IF NOT EXISTS idx_knowledge_base_tags
  ON knowledge_base USING GIN (tags);

CREATE INDEX IF NOT EXISTS idx_knowledge_base_project
  ON knowledge_base (project);

ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;

CREATE POLICY "dev_kb_access" ON knowledge_base
  USING (project = 'dev_kb');

ANALYZE knowledge_base;

