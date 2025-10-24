/**
 * Knowledge Base RAG (Retrieval-Augmented Generation) Service
 *
 * Builds contextual knowledge for AI agents by retrieving relevant KB articles
 * and formatting them for inclusion in agent prompts.
 *
 * Growth Engine: HITL Learning System
 */
import type { RAGContextOptions, RAGContext } from "./types";
/**
 * Build RAG context for AI agent prompts
 *
 * Retrieves relevant KB articles based on customer message and formats
 * them for inclusion in the AI agent's prompt.
 *
 * @param customerMessage - Customer's message/question
 * @param options - RAG context options
 * @returns RAG context with relevant articles
 */
export declare function buildRAGContext(customerMessage: string, options?: RAGContextOptions): Promise<RAGContext>;
/**
 * Format RAG context for AI prompt
 *
 * Converts KB articles into a formatted string for inclusion in prompts
 *
 * @param context - RAG context with articles
 * @returns Formatted context string
 */
export declare function formatRAGContextForPrompt(context: RAGContext): string;
/**
 * Build context with category filtering
 *
 * Useful when the category is known (e.g., from conversation routing)
 *
 * @param customerMessage - Customer's message
 * @param category - Category to filter by
 * @param maxContext - Max articles to include
 * @returns RAG context
 */
export declare function buildCategoryContext(customerMessage: string, category: string, maxContext?: number): Promise<RAGContext>;
/**
 * Build context with tag filtering
 *
 * Useful for specialized topics or product-specific questions
 *
 * @param customerMessage - Customer's message
 * @param tags - Tags to filter by
 * @param maxContext - Max articles to include
 * @returns RAG context
 */
export declare function buildTagContext(customerMessage: string, tags: string[], maxContext?: number): Promise<RAGContext>;
/**
 * Get context summary statistics
 *
 * @param context - RAG context
 * @returns Summary statistics
 */
export declare function getContextStats(context: RAGContext): {
    totalArticles: number;
    avgConfidence: number;
    categories: string[];
    tags: string[];
};
/**
 * Validate RAG context quality
 *
 * Checks if the context meets minimum quality thresholds
 *
 * @param context - RAG context
 * @param minArticles - Minimum number of articles required
 * @param minAvgConfidence - Minimum average confidence required
 * @returns True if context meets quality thresholds
 */
export declare function validateContextQuality(context: RAGContext, minArticles?: number, minAvgConfidence?: number): boolean;
/**
 * Merge multiple RAG contexts
 *
 * Useful when combining contexts from different sources
 *
 * @param contexts - Array of RAG contexts
 * @param maxArticles - Max total articles to include
 * @returns Merged RAG context
 */
export declare function mergeContexts(contexts: RAGContext[], maxArticles?: number): RAGContext;
//# sourceMappingURL=rag.d.ts.map