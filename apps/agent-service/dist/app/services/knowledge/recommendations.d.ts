/**
 * Knowledge Base Recommendation Engine
 *
 * Provides intelligent recommendations for KB articles based on:
 * - User behavior patterns
 * - Article quality metrics
 * - Seasonal trends
 * - Gap analysis
 *
 * Growth Engine: HITL Learning System
 */
import type { KBArticle, KBCategory } from "./types";
/**
 * Recommendation result
 */
export interface Recommendation {
    type: "create" | "update" | "archive" | "promote";
    priority: "high" | "medium" | "low";
    article?: KBArticle;
    reason: string;
    suggestedAction: string;
    evidence: string[];
}
/**
 * Get recommended articles for a customer question
 *
 * Uses semantic search + quality filtering to recommend best articles
 *
 * @param question - Customer question
 * @param limit - Max recommendations (default: 3)
 * @returns Array of recommended articles
 */
export declare function getRecommendedArticles(question: string, limit?: number): Promise<KBArticle[]>;
/**
 * Identify knowledge gaps
 *
 * Analyzes customer questions that don't have good KB matches
 *
 * @param days - Number of days to analyze (default: 7)
 * @returns Array of knowledge gap recommendations
 */
export declare function identifyKnowledgeGaps(days?: number): Promise<Recommendation[]>;
/**
 * Recommend articles for update
 *
 * Identifies articles that need updating based on:
 * - Low confidence scores
 * - Outdated content
 * - Low success rates
 *
 * @returns Array of update recommendations
 */
export declare function recommendArticlesForUpdate(): Promise<Recommendation[]>;
/**
 * Recommend articles for archival
 *
 * Identifies articles that should be archived based on:
 * - No usage in 90+ days
 * - Low confidence
 * - Superseded by newer articles
 *
 * @returns Array of archival recommendations
 */
export declare function recommendArticlesForArchival(): Promise<Recommendation[]>;
/**
 * Get trending topics
 *
 * Identifies topics with increasing customer interest
 *
 * @param days - Number of days to analyze (default: 7)
 * @returns Array of trending topics
 */
export declare function getTrendingTopics(days?: number): Promise<Array<{
    topic: string;
    category: KBCategory;
    trend: "rising" | "falling" | "stable";
    changePercent: number;
    currentVolume: number;
}>>;
/**
 * Get comprehensive recommendations dashboard
 *
 * @returns Complete set of recommendations
 */
export declare function getRecommendationsDashboard(): Promise<{
    gaps: Recommendation[];
    updates: Recommendation[];
    archival: Recommendation[];
    timestamp: Date;
}>;
//# sourceMappingURL=recommendations.d.ts.map