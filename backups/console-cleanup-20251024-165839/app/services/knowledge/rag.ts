/**
 * Knowledge Base RAG (Retrieval-Augmented Generation) Service
 * 
 * Builds contextual knowledge for AI agents by retrieving relevant KB articles
 * and formatting them for inclusion in agent prompts.
 * 
 * Growth Engine: HITL Learning System
 */

import { semanticSearch } from "./search";
import type { RAGContextOptions, RAGContext, KBArticle } from "./types";

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
export async function buildRAGContext(
  customerMessage: string,
  options: RAGContextOptions = {}
): Promise<RAGContext> {
  const {
    maxContext = 3,
    minConfidence = 0.5,
    categories,
    tags,
  } = options;

  try {
    console.log(`[KB RAG] Building context for message: "${customerMessage.substring(0, 50)}..."`);

    // Perform semantic search
    const searchResults = await semanticSearch({
      query: customerMessage,
      limit: maxContext,
      minSimilarity: minConfidence,
      categories,
      tags,
    });

    // Extract articles from search results
    const articles = searchResults.map((result) => result.article);

    console.log(`[KB RAG] ✅ Built context with ${articles.length} articles`);

    return {
      articles,
      totalFound: searchResults.length,
      query: customerMessage,
      timestamp: new Date(),
    };
  } catch (error) {
    console.error(`[KB RAG] ❌ Error building context:`, error);
    return {
      articles: [],
      totalFound: 0,
      query: customerMessage,
      timestamp: new Date(),
    };
  }
}

/**
 * Format RAG context for AI prompt
 * 
 * Converts KB articles into a formatted string for inclusion in prompts
 * 
 * @param context - RAG context with articles
 * @returns Formatted context string
 */
export function formatRAGContextForPrompt(context: RAGContext): string {
  if (context.articles.length === 0) {
    return "No relevant knowledge base articles found.";
  }

  const sections = context.articles.map((article, index) => {
    return `
### Knowledge Base Article ${index + 1}

**Category:** ${article.category}
**Tags:** ${article.tags.join(", ")}
**Confidence:** ${(article.confidenceScore * 100).toFixed(0)}%

**Q:** ${article.question}

**A:** ${article.answer}

**Source:** ${article.source}
**Last Used:** ${article.lastUsedAt ? article.lastUsedAt.toISOString() : "Never"}
    `.trim();
  });

  return `
# Relevant Knowledge Base Context

Found ${context.totalFound} relevant article(s) for your query.

${sections.join("\n\n---\n\n")}

---

**Note:** Use this context to inform your response, but adapt the language and tone to match the customer's question. Always verify the information is current and accurate.
  `.trim();
}

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
export async function buildCategoryContext(
  customerMessage: string,
  category: string,
  maxContext: number = 3
): Promise<RAGContext> {
  return buildRAGContext(customerMessage, {
    maxContext,
    categories: [category as any],
  });
}

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
export async function buildTagContext(
  customerMessage: string,
  tags: string[],
  maxContext: number = 3
): Promise<RAGContext> {
  return buildRAGContext(customerMessage, {
    maxContext,
    tags,
  });
}

/**
 * Get context summary statistics
 * 
 * @param context - RAG context
 * @returns Summary statistics
 */
export function getContextStats(context: RAGContext): {
  totalArticles: number;
  avgConfidence: number;
  categories: string[];
  tags: string[];
} {
  const articles = context.articles;

  if (articles.length === 0) {
    return {
      totalArticles: 0,
      avgConfidence: 0,
      categories: [],
      tags: [],
    };
  }

  const avgConfidence =
    articles.reduce((sum, a) => sum + a.confidenceScore, 0) / articles.length;

  const categories = [...new Set(articles.map((a) => a.category))];
  const tags = [...new Set(articles.flatMap((a) => a.tags))];

  return {
    totalArticles: articles.length,
    avgConfidence,
    categories,
    tags,
  };
}

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
export function validateContextQuality(
  context: RAGContext,
  minArticles: number = 1,
  minAvgConfidence: number = 0.5
): boolean {
  const stats = getContextStats(context);

  if (stats.totalArticles < minArticles) {
    console.warn(`[KB RAG] Context has too few articles: ${stats.totalArticles} < ${minArticles}`);
    return false;
  }

  if (stats.avgConfidence < minAvgConfidence) {
    console.warn(
      `[KB RAG] Context confidence too low: ${stats.avgConfidence.toFixed(2)} < ${minAvgConfidence}`
    );
    return false;
  }

  return true;
}

/**
 * Merge multiple RAG contexts
 * 
 * Useful when combining contexts from different sources
 * 
 * @param contexts - Array of RAG contexts
 * @param maxArticles - Max total articles to include
 * @returns Merged RAG context
 */
export function mergeContexts(
  contexts: RAGContext[],
  maxArticles: number = 5
): RAGContext {
  const allArticles: KBArticle[] = [];
  const seenIds = new Set<string>();

  for (const context of contexts) {
    for (const article of context.articles) {
      if (!seenIds.has(article.id)) {
        allArticles.push(article);
        seenIds.add(article.id);
      }
    }
  }

  // Sort by confidence and take top N
  const sortedArticles = allArticles
    .sort((a, b) => b.confidenceScore - a.confidenceScore)
    .slice(0, maxArticles);

  return {
    articles: sortedArticles,
    totalFound: sortedArticles.length,
    query: contexts.map((c) => c.query).join(" | "),
    timestamp: new Date(),
  };
}

