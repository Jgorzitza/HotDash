/**
 * Knowledge Base Semantic Search Service
 * 
 * Provides semantic search using pgvector for finding relevant KB articles
 * based on vector similarity.
 * 
 * Growth Engine: HITL Learning System
 */

import prisma from "~/db.server";
import { generateEmbedding, prepareTextForEmbedding } from "./embedding";
import type { SearchRequest, SearchResult, KBArticle } from "./types";

/**
 * Perform semantic search on knowledge base
 * 
 * Uses pgvector cosine similarity to find relevant articles
 * 
 * @param request - Search request with query and filters
 * @returns Array of search results with similarity scores
 */
export async function semanticSearch(
  request: SearchRequest
): Promise<SearchResult[]> {
  const {
    query,
    limit = 5,
    minSimilarity = 0.7,
    categories,
    tags,
  } = request;

  try {
    console.log(`[KB Search] Searching for: "${query.substring(0, 50)}..."`);

    // Generate embedding for query
    const cleanedQuery = prepareTextForEmbedding(query);
    const { embedding } = await generateEmbedding({ text: cleanedQuery });

    // Build WHERE clause for filters
    const whereConditions: string[] = [
      "is_current = true",
      "project = 'occ'",
      "embedding IS NOT NULL",
    ];

    if (categories && categories.length > 0) {
      const categoryList = categories.map((c) => `'${c}'`).join(",");
      whereConditions.push(`category IN (${categoryList})`);
    }

    if (tags && tags.length > 0) {
      const tagConditions = tags.map((tag) => `'${tag}' = ANY(tags)`).join(" OR ");
      whereConditions.push(`(${tagConditions})`);
    }

    const whereClause = whereConditions.join(" AND ");

    // Perform vector similarity search using raw SQL
    // pgvector uses <=> operator for cosine distance (1 - cosine similarity)
    const embeddingVector = `[${embedding.join(",")}]`;

    const results = await prisma.$queryRawUnsafe<any[]>(`
      SELECT 
        id,
        shop_domain,
        document_key,
        document_type,
        title,
        content,
        source_url,
        tags,
        category,
        created_by,
        created_at,
        updated_at,
        last_indexed_at,
        metadata,
        1 - (embedding <=> '${embeddingVector}'::vector) as similarity
      FROM knowledge_base
      WHERE ${whereClause}
        AND 1 - (embedding <=> '${embeddingVector}'::vector) >= ${minSimilarity}
      ORDER BY embedding <=> '${embeddingVector}'::vector
      LIMIT ${limit}
    `);

    console.log(`[KB Search] ✅ Found ${results.length} results`);

    // Map results to SearchResult type
    return results.map((record, index) => ({
      article: mapToKBArticle(record),
      similarity: record.similarity,
      rank: index + 1,
    }));
  } catch (error) {
    console.error(`[KB Search] ❌ Error performing search:`, error);
    return [];
  }
}

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
export async function findSimilarArticles(
  articleId: string,
  limit: number = 5,
  minSimilarity: number = 0.7
): Promise<SearchResult[]> {
  try {
    console.log(`[KB Search] Finding similar articles to: ${articleId}`);

    // Get the source article
    const sourceArticle = await prisma.knowledge_base.findUnique({
      where: { id: articleId },
    });

    if (!sourceArticle || !sourceArticle.embedding) {
      console.warn(`[KB Search] Article not found or has no embedding: ${articleId}`);
      return [];
    }

    // Perform similarity search excluding the source article
    const results = await prisma.$queryRawUnsafe<any[]>(`
      SELECT 
        id,
        shop_domain,
        document_key,
        document_type,
        title,
        content,
        source_url,
        tags,
        category,
        created_by,
        created_at,
        updated_at,
        last_indexed_at,
        metadata,
        1 - (embedding <=> '${sourceArticle.embedding}'::vector) as similarity
      FROM knowledge_base
      WHERE is_current = true
        AND project = 'occ'
        AND id != '${articleId}'
        AND embedding IS NOT NULL
        AND 1 - (embedding <=> '${sourceArticle.embedding}'::vector) >= ${minSimilarity}
      ORDER BY embedding <=> '${sourceArticle.embedding}'::vector
      LIMIT ${limit}
    `);

    console.log(`[KB Search] ✅ Found ${results.length} similar articles`);

    return results.map((record, index) => ({
      article: mapToKBArticle(record),
      similarity: record.similarity,
      rank: index + 1,
    }));
  } catch (error) {
    console.error(`[KB Search] ❌ Error finding similar articles:`, error);
    return [];
  }
}

/**
 * Search by category
 * 
 * @param category - Category to search
 * @param limit - Max number of results
 * @returns Array of articles in category
 */
export async function searchByCategory(
  category: string,
  limit: number = 10
): Promise<KBArticle[]> {
  try {
    const articles = await prisma.knowledge_base.findMany({
      where: {
        category,
        is_current: true,
        project: "occ",
      },
      take: limit,
      orderBy: {
        created_at: "desc",
      },
    });

    return articles.map(mapToKBArticle);
  } catch (error) {
    console.error(`[KB Search] Error searching by category:`, error);
    return [];
  }
}

/**
 * Search by tags
 * 
 * @param tags - Tags to search for
 * @param limit - Max number of results
 * @returns Array of articles with matching tags
 */
export async function searchByTags(
  tags: string[],
  limit: number = 10
): Promise<KBArticle[]> {
  try {
    const articles = await prisma.knowledge_base.findMany({
      where: {
        tags: {
          hasSome: tags,
        },
        is_current: true,
        project: "occ",
      },
      take: limit,
      orderBy: {
        created_at: "desc",
      },
    });

    return articles.map(mapToKBArticle);
  } catch (error) {
    console.error(`[KB Search] Error searching by tags:`, error);
    return [];
  }
}

/**
 * Full-text search (fallback when semantic search not available)
 * 
 * @param query - Search query
 * @param limit - Max number of results
 * @returns Array of matching articles
 */
export async function fullTextSearch(
  query: string,
  limit: number = 10
): Promise<KBArticle[]> {
  try {
    const searchTerm = `%${query}%`;

    const articles = await prisma.knowledge_base.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { content: { contains: query, mode: "insensitive" } },
        ],
        is_current: true,
        project: "occ",
      },
      take: limit,
      orderBy: {
        created_at: "desc",
      },
    });

    return articles.map(mapToKBArticle);
  } catch (error) {
    console.error(`[KB Search] Error performing full-text search:`, error);
    return [];
  }
}

/**
 * Map database record to KBArticle type
 * 
 * @param record - Database record
 * @returns KBArticle object
 */
function mapToKBArticle(record: any): KBArticle {
  return {
    id: record.id,
    question: record.title,
    answer: record.content,
    category: record.category || "technical",
    tags: record.tags || [],
    confidenceScore: 0.5, // Default confidence (will be updated by learning system)
    usageCount: 0,
    successCount: 0,
    source: record.source_url || "manual",
    createdBy: record.created_by,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
    lastUsedAt: record.last_indexed_at,
  };
}

