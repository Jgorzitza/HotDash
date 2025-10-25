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

// Export types
export type {
  KBArticle,
  KBCategory,
  LearningEdit,
  LearningType,
  RecurringIssue,
  ResolutionStatus,
  RAGContextOptions,
  RAGContext,
  EmbeddingRequest,
  EmbeddingResponse,
  IngestionRequest,
  IngestionResult,
  SearchRequest,
  SearchResult,
  LearningExtractionRequest,
  LearningExtractionResult,
  KBHealthMetrics,
} from "./types";

// Export embedding functions
export {
  generateEmbedding,
  generateEmbeddingsBatch,
  cosineSimilarity,
  prepareTextForEmbedding,
  combineQuestionAnswer,
  checkEmbeddingHealth,
} from "./embedding";

// Export ingestion functions
export {
  ingestDocument,
  ingestDocumentsBatch,
  updateArticle,
  deleteArticle,
  getArticleById,
  listArticles,
} from "./ingestion";

// Export search functions
export {
  semanticSearch,
  findSimilarArticles,
  searchByCategory,
  searchByTags,
  fullTextSearch,
} from "./search";

// Export RAG functions
export {
  buildRAGContext,
  formatRAGContextForPrompt,
  buildCategoryContext,
  buildTagContext,
  getContextStats,
  validateContextQuality,
  mergeContexts,
} from "./rag";

// Export learning functions
export {
  extractLearning,
  detectRecurringIssues,
  archiveStaleArticles,
  calculateConfidenceScore,
} from "./learning";

// Export recommendation functions
export {
  getRecommendedArticles,
  identifyKnowledgeGaps,
  recommendArticlesForUpdate,
  recommendArticlesForArchival,
  getTrendingTopics,
  getRecommendationsDashboard,
  type Recommendation,
} from "./recommendations";

/**
 * Knowledge Base Service Health Check
 * 
 * Verifies all components are operational
 * 
 * @returns Health status object
 */
export async function checkKnowledgeBaseHealth(): Promise<{
  healthy: boolean;
  components: {
    embedding: boolean;
    database: boolean;
    search: boolean;
  };
  timestamp: Date;
}> {
  const { checkEmbeddingHealth } = await import("./embedding");
  const { default: prisma } = await import("~/db.server");

  const health = {
    healthy: true,
    components: {
      embedding: false,
      database: false,
      search: false,
    },
    timestamp: new Date(),
  };

  try {
    // Check embedding service
    health.components.embedding = await checkEmbeddingHealth();

    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    health.components.database = true;

    // Check search (pgvector extension)
    const testResult = await prisma.$queryRaw<any[]>`
      SELECT 1 FROM knowledge_base LIMIT 1
    `;
    health.components.search = true;

    health.healthy =
      health.components.embedding &&
      health.components.database &&
      health.components.search;
  } catch (error) {
    console.error("[KB Health] Health check failed:", error);
    health.healthy = false;
  }

  return health;
}

/**
 * Get knowledge base statistics
 * 
 * @returns KB statistics
 */
export async function getKnowledgeBaseStats(): Promise<{
  totalArticles: number;
  articlesByCategory: Record<string, number>;
  recentArticles: number;
  timestamp: Date;
}> {
  const { default: prisma } = await import("~/db.server");

  try {
    // Total articles
    const totalArticles = await prisma.knowledge_base.count({
      where: {
        is_current: true,
        project: "occ",
      },
    });

    // Articles by category
    const categoryGroups = await prisma.knowledge_base.groupBy({
      by: ["category"],
      where: {
        is_current: true,
        project: "occ",
      },
      _count: true,
    });

    const articlesByCategory: Record<string, number> = {};
    for (const group of categoryGroups) {
      if (group.category) {
        articlesByCategory[group.category] = group._count;
      }
    }

    // Recent articles (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentArticles = await prisma.knowledge_base.count({
      where: {
        is_current: true,
        project: "occ",
        created_at: {
          gte: sevenDaysAgo,
        },
      },
    });

    return {
      totalArticles,
      articlesByCategory,
      recentArticles,
      timestamp: new Date(),
    };
  } catch (error) {
    console.error("[KB Stats] Error fetching stats:", error);
    return {
      totalArticles: 0,
      articlesByCategory: {},
      recentArticles: 0,
      timestamp: new Date(),
    };
  }
}

