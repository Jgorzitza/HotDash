/**
 * Knowledge Ingestion Stub
 *
 * Stub implementation for knowledge document ingestion.
 * Ingests documents, generates embeddings, and stores in Supabase.
 *
 * Contract test target for direction AIK-006.
 */

import type { KnowledgeDocument, IngestionResult } from "./types";
import { generateEmbedding } from "./embedding";

/**
 * Ingest a single knowledge document
 *
 * @param content - Document content
 * @param metadata - Document metadata
 * @returns Promise<KnowledgeDocument> - Ingested document with ID
 *
 * @example
 * const doc = await ingestDocument("Product ships in 2-3 business days", {
 *   category: "shipping",
 *   tags: ["delivery", "timeline"]
 * });
 */
export async function ingestDocument(
  content: string,
  metadata: KnowledgeDocument["metadata"],
): Promise<KnowledgeDocument> {
  // Validate input
  if (!content || content.trim().length === 0) {
    throw new Error("Content cannot be empty");
  }

  // Generate embedding
  const embedding = await generateEmbedding(content);

  // TODO: Store in Supabase when credentials available
  // INSERT INTO knowledge_documents (content, embedding, metadata, source)
  // VALUES ($content, $embedding, $metadata, $source)

  // Return stub document
  return {
    id: `stub-${Date.now()}`,
    content,
    embedding,
    metadata,
    source: "manual_ingestion",
    created_at: new Date().toISOString(),
  };
}

/**
 * Ingest multiple documents in batch
 */
export async function ingestDocumentsBatch(
  documents: Array<{
    content: string;
    metadata: KnowledgeDocument["metadata"];
  }>,
): Promise<IngestionResult> {
  const result: IngestionResult = {
    documentsProcessed: 0,
    chunksCreated: 0,
    embeddingsGenerated: 0,
    errors: [],
  };

  for (const doc of documents) {
    try {
      await ingestDocument(doc.content, doc.metadata);
      result.documentsProcessed++;
      result.embeddingsGenerated++;
    } catch (error) {
      result.errors.push(
        `Failed to ingest document: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  return result;
}

/**
 * Stub function for contract test
 * Returns zeroed metrics with outstanding assumptions
 */
export async function ingestKnowledgeStub(): Promise<IngestionResult> {
  return {
    documentsProcessed: 0,
    chunksCreated: 0,
    embeddingsGenerated: 0,
    errors: [
      "Waiting for OpenAI credentials (DevOps)",
      "Waiting for Supabase credentials (DevOps D-002)",
    ],
  };
}
