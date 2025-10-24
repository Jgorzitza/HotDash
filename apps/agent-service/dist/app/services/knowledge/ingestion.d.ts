/**
 * Knowledge Base Ingestion Service
 *
 * Handles document ingestion, chunking, and embedding generation
 * for the knowledge base system.
 *
 * Growth Engine: HITL Learning System
 */
import type { IngestionRequest, IngestionResult, KBArticle } from "./types";
/**
 * Ingest a new document into the knowledge base
 *
 * @param request - Ingestion request with document details
 * @returns Ingestion result with article ID and status
 */
export declare function ingestDocument(request: IngestionRequest): Promise<IngestionResult>;
/**
 * Ingest multiple documents in batch
 *
 * @param requests - Array of ingestion requests
 * @returns Array of ingestion results
 */
export declare function ingestDocumentsBatch(requests: IngestionRequest[]): Promise<IngestionResult[]>;
/**
 * Update an existing KB article
 *
 * @param articleId - Article ID to update
 * @param updates - Partial article updates
 * @returns Updated article
 */
export declare function updateArticle(articleId: string, updates: Partial<{
    title: string;
    content: string;
    category: string;
    tags: string[];
    metadata: Record<string, any>;
}>): Promise<KBArticle | null>;
/**
 * Delete a KB article
 *
 * @param articleId - Article ID to delete
 * @returns True if deleted successfully
 */
export declare function deleteArticle(articleId: string): Promise<boolean>;
/**
 * Get article by ID
 *
 * @param articleId - Article ID
 * @returns KB article or null
 */
export declare function getArticleById(articleId: string): Promise<KBArticle | null>;
/**
 * List all articles with optional filters
 *
 * @param filters - Optional filters
 * @returns Array of KB articles
 */
export declare function listArticles(filters?: {
    category?: string;
    tags?: string[];
    limit?: number;
}): Promise<KBArticle[]>;
//# sourceMappingURL=ingestion.d.ts.map