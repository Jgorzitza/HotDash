/**
 * Knowledge Base Semantic Search Service
 *
 * Provides semantic search using pgvector for finding relevant KB articles
 * based on vector similarity.
 *
 * Growth Engine: HITL Learning System
 */
import type { SearchRequest, SearchResult, KBArticle } from "./types";
/**
 * Perform semantic search on knowledge base
 *
 * Uses pgvector cosine similarity to find relevant articles
 *
 * @param request - Search request with query and filters
 * @returns Array of search results with similarity scores
 */
export declare function semanticSearch(request: SearchRequest): Promise<SearchResult[]>;
/**
 * Find similar articles to a given article
 *
 * Useful for finding related content or detecting duplicates
 *
 * @param articleId - Article ID to find similar articles for
 * @param limit - Max number of results (default: 5)
 * @param minSimilarity - Min similarity threshold (default: 0.7)
 * @returns Array of similar articles
 */
export declare function findSimilarArticles(articleId: string, limit?: number, minSimilarity?: number): Promise<SearchResult[]>;
/**
 * Search by category
 *
 * @param category - Category to search
 * @param limit - Max number of results
 * @returns Array of articles in category
 */
export declare function searchByCategory(category: string, limit?: number): Promise<KBArticle[]>;
/**
 * Search by tags
 *
 * @param tags - Tags to search for
 * @param limit - Max number of results
 * @returns Array of articles with matching tags
 */
export declare function searchByTags(tags: string[], limit?: number): Promise<KBArticle[]>;
/**
 * Full-text search (fallback when semantic search not available)
 *
 * @param query - Search query
 * @param limit - Max number of results
 * @returns Array of matching articles
 */
export declare function fullTextSearch(query: string, limit?: number): Promise<KBArticle[]>;
//# sourceMappingURL=search.d.ts.map