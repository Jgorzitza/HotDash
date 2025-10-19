/**
 * Knowledge Service Types
 *
 * Type definitions for the knowledge ingestion and retrieval system.
 * Supports OpenAI embeddings (text-embedding-3-small, 1536 dimensions)
 * and Supabase pgvector for semantic search.
 */

export interface KnowledgeDocument {
  id: string;
  content: string;
  embedding?: number[];
  metadata: KnowledgeMetadata;
  source: string;
  created_at: string;
}

export interface KnowledgeMetadata {
  title?: string;
  category?: string;
  tags?: string[];
  url?: string;
  last_updated?: string;
  confidence_score?: number;
}

export interface EmbeddingOptions {
  model?: string; // Default: 'text-embedding-3-small'
  dimensions?: number; // Default: 1536
  maxTokens?: number; // Default: 8000
}

export interface SearchOptions {
  limit?: number; // Default: 5
  minSimilarity?: number; // Default: 0.7
  category?: string;
  tags?: string[];
}

export interface SearchResult {
  document: KnowledgeDocument;
  similarity: number;
}

export interface IngestionResult {
  documentsProcessed: number;
  chunksCreated: number;
  embeddingsGenerated: number;
  errors: string[];
}
