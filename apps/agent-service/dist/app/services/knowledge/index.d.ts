/**
 * Knowledge Base Service - Main Export
 *
 * AI-powered knowledge base system with content indexing, search functionality,
 * and recommendation engine for the Growth Engine.
 *
 * Growth Engine: HITL Learning System
 *
 * Features:
 * - Semantic search using pgvector
 * - Document ingestion and embedding generation
 * - RAG context building for AI agents
 * - Learning from HITL approvals
 *
 * Usage:
 * ```typescript
 * import { buildRAGContext, ingestDocument, semanticSearch } from "~/services/knowledge";
 *
 * // Build context for AI agent
 * const context = await buildRAGContext(customerMessage, { maxContext: 3 });
 *
 * // Ingest new document
 * await ingestDocument({
 *   title: "How to track orders",
 *   content: "You can track your order by...",
 *   category: "orders",
 *   tags: ["tracking", "shipping"],
 *   source: "support-docs",
 *   createdBy: "ai-knowledge",
 * });
 *
 * // Search knowledge base
 * const results = await semanticSearch({
 *   query: "How do I return an item?",
 *   limit: 5,
 *   minSimilarity: 0.7,
 * });
 * ```
 */
export type { KBArticle, KBCategory, LearningEdit, LearningType, RecurringIssue, ResolutionStatus, RAGContextOptions, RAGContext, EmbeddingRequest, EmbeddingResponse, IngestionRequest, IngestionResult, SearchRequest, SearchResult, LearningExtractionRequest, LearningExtractionResult, KBHealthMetrics, } from "./types";
export { generateEmbedding, generateEmbeddingsBatch, cosineSimilarity, prepareTextForEmbedding, combineQuestionAnswer, checkEmbeddingHealth, } from "./embedding";
export { ingestDocument, ingestDocumentsBatch, updateArticle, deleteArticle, getArticleById, listArticles, } from "./ingestion";
export { semanticSearch, findSimilarArticles, searchByCategory, searchByTags, fullTextSearch, } from "./search";
export { buildRAGContext, formatRAGContextForPrompt, buildCategoryContext, buildTagContext, getContextStats, validateContextQuality, mergeContexts, } from "./rag";
export { extractLearning, detectRecurringIssues, archiveStaleArticles, calculateConfidenceScore, } from "./learning";
export { getRecommendedArticles, identifyKnowledgeGaps, recommendArticlesForUpdate, recommendArticlesForArchival, getTrendingTopics, getRecommendationsDashboard, type Recommendation, } from "./recommendations";
/**
 * Knowledge Base Service Health Check
 *
 * Verifies all components are operational
 *
 * @returns Health status object
 */
export declare function checkKnowledgeBaseHealth(): Promise<{
    healthy: boolean;
    components: {
        embedding: boolean;
        database: boolean;
        search: boolean;
    };
    timestamp: Date;
}>;
/**
 * Get knowledge base statistics
 *
 * @returns KB statistics
 */
export declare function getKnowledgeBaseStats(): Promise<{
    totalArticles: number;
    articlesByCategory: Record<string, number>;
    recentArticles: number;
    timestamp: Date;
}>;
//# sourceMappingURL=index.d.ts.map