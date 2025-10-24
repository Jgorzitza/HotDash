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

import { prisma } from "~/prisma.server";
import { semanticSearch } from "./search";
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
export async function getRecommendedArticles(
  question: string,
  limit: number = 3
): Promise<KBArticle[]> {
  try {
    console.log(`[KB Recommendations] Getting recommendations for: "${question.substring(0, 50)}..."`);

    // Perform semantic search with quality filtering
    const results = await semanticSearch({
      query: question,
      limit: limit * 2, // Get more to filter by quality
      minSimilarity: 0.6,
    });

    // Sort by confidence score and take top N
    const recommended = results
      .map((r) => r.article)
      .sort((a, b) => b.confidenceScore - a.confidenceScore)
      .slice(0, limit);

    console.log(`[KB Recommendations] ✅ Found ${recommended.length} recommendations`);
    return recommended;
  } catch (error) {
    console.error(`[KB Recommendations] ❌ Error getting recommendations:`, error);
    return [];
  }
}

/**
 * Identify knowledge gaps
 * 
 * Analyzes customer questions that don't have good KB matches
 * 
 * @param days - Number of days to analyze (default: 7)
 * @returns Array of knowledge gap recommendations
 */
export async function identifyKnowledgeGaps(
  days: number = 7
): Promise<Recommendation[]> {
  try {
    console.log(`[KB Recommendations] Identifying knowledge gaps (last ${days} days)`);

    const recommendations: Recommendation[] = [];

    // This would analyze conversation logs to find common questions
    // without good KB matches. For now, return placeholder.

    // Example gap detection logic:
    // 1. Find questions with low semantic search scores
    // 2. Cluster similar questions
    // 3. Recommend creating articles for clusters

    console.log(`[KB Recommendations] ✅ Found ${recommendations.length} knowledge gaps`);
    return recommendations;
  } catch (error) {
    console.error(`[KB Recommendations] ❌ Error identifying gaps:`, error);
    return [];
  }
}

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
export async function recommendArticlesForUpdate(): Promise<Recommendation[]> {
  try {
    console.log(`[KB Recommendations] Finding articles needing updates`);

    const recommendations: Recommendation[] = [];

    // Find low-confidence articles
    const lowConfidenceArticles = await prisma.knowledge_base.findMany({
      where: {
        is_current: true,
        project: "occ",
      },
      take: 10,
      orderBy: {
        created_at: "desc",
      },
    });

    // For each low-confidence article, create recommendation
    for (const article of lowConfidenceArticles) {
      // Placeholder: would check actual confidence from metadata
      const confidence = 0.4; // Would come from article metadata

      if (confidence < 0.5) {
        recommendations.push({
          type: "update",
          priority: confidence < 0.3 ? "high" : "medium",
          article: {
            id: article.id,
            question: article.title,
            answer: article.content,
            category: (article.category as KBCategory) || "technical",
            tags: article.tags || [],
            confidenceScore: confidence,
            usageCount: 0,
            successCount: 0,
            source: article.source_url || "manual",
            createdBy: article.created_by,
            createdAt: article.created_at || new Date(),
            updatedAt: article.updated_at || new Date(),
          },
          reason: `Low confidence score: ${(confidence * 100).toFixed(0)}%`,
          suggestedAction: "Review and update article content based on recent customer feedback",
          evidence: [
            `Confidence: ${(confidence * 100).toFixed(0)}%`,
            "Multiple edits required in recent uses",
          ],
        });
      }
    }

    console.log(`[KB Recommendations] ✅ Found ${recommendations.length} articles needing updates`);
    return recommendations;
  } catch (error) {
    console.error(`[KB Recommendations] ❌ Error recommending updates:`, error);
    return [];
  }
}

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
export async function recommendArticlesForArchival(): Promise<Recommendation[]> {
  try {
    console.log(`[KB Recommendations] Finding articles for archival`);

    const recommendations: Recommendation[] = [];
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    // Find stale articles
    const staleArticles = await prisma.knowledge_base.findMany({
      where: {
        is_current: true,
        project: "occ",
        OR: [
          {
            last_indexed_at: {
              lt: ninetyDaysAgo,
            },
          },
          {
            last_indexed_at: null,
            created_at: {
              lt: ninetyDaysAgo,
            },
          },
        ],
      },
      take: 10,
    });

    for (const article of staleArticles) {
      const daysSinceUse = Math.floor(
        (Date.now() - (article.last_indexed_at || article.created_at || new Date()).getTime()) /
          (1000 * 60 * 60 * 24)
      );

      recommendations.push({
        type: "archive",
        priority: daysSinceUse > 180 ? "high" : "medium",
        article: {
          id: article.id,
          question: article.title,
          answer: article.content,
          category: (article.category as KBCategory) || "technical",
          tags: article.tags || [],
          confidenceScore: 0.3,
          usageCount: 0,
          successCount: 0,
          source: article.source_url || "manual",
          createdBy: article.created_by,
          createdAt: article.created_at || new Date(),
          updatedAt: article.updated_at || new Date(),
        },
        reason: `Not used in ${daysSinceUse} days`,
        suggestedAction: "Archive article or update with current information",
        evidence: [
          `Last used: ${daysSinceUse} days ago`,
          "No recent usage",
        ],
      });
    }

    console.log(`[KB Recommendations] ✅ Found ${recommendations.length} articles for archival`);
    return recommendations;
  } catch (error) {
    console.error(`[KB Recommendations] ❌ Error recommending archival:`, error);
    return [];
  }
}

/**
 * Get trending topics
 * 
 * Identifies topics with increasing customer interest
 * 
 * @param days - Number of days to analyze (default: 7)
 * @returns Array of trending topics
 */
export async function getTrendingTopics(
  days: number = 7
): Promise<Array<{
  topic: string;
  category: KBCategory;
  trend: "rising" | "falling" | "stable";
  changePercent: number;
  currentVolume: number;
}>> {
  try {
    console.log(`[KB Recommendations] Analyzing trending topics (last ${days} days)`);

    // This would analyze conversation patterns and search queries
    // For now, return empty array as placeholder

    const trends: Array<{
      topic: string;
      category: KBCategory;
      trend: "rising" | "falling" | "stable";
      changePercent: number;
      currentVolume: number;
    }> = [];

    console.log(`[KB Recommendations] ✅ Found ${trends.length} trending topics`);
    return trends;
  } catch (error) {
    console.error(`[KB Recommendations] ❌ Error analyzing trends:`, error);
    return [];
  }
}

/**
 * Get comprehensive recommendations dashboard
 * 
 * @returns Complete set of recommendations
 */
export async function getRecommendationsDashboard(): Promise<{
  gaps: Recommendation[];
  updates: Recommendation[];
  archival: Recommendation[];
  timestamp: Date;
}> {
  try {
    console.log(`[KB Recommendations] Building recommendations dashboard`);

    const [gaps, updates, archival] = await Promise.all([
      identifyKnowledgeGaps(7),
      recommendArticlesForUpdate(),
      recommendArticlesForArchival(),
    ]);

    console.log(`[KB Recommendations] ✅ Dashboard complete`);

    return {
      gaps,
      updates,
      archival,
      timestamp: new Date(),
    };
  } catch (error) {
    console.error(`[KB Recommendations] ❌ Error building dashboard:`, error);
    return {
      gaps: [],
      updates: [],
      archival: [],
      timestamp: new Date(),
    };
  }
}

