/**
 * Knowledge Service Types
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
  confidence_score?: number;
}

export interface EmbeddingOptions {
  model?: string;
  dimensions?: number;
  maxTokens?: number;
}

export interface SearchOptions {
  limit?: number;
  minSimilarity?: number;
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
