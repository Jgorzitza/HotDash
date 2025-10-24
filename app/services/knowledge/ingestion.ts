/**
 * Knowledge Base Ingestion Service
 * 
 * Handles document ingestion, chunking, and embedding generation
 * for the knowledge base system.
 * 
 * Growth Engine: HITL Learning System
 */

import prisma from "~/db.server";
import { generateEmbedding, combineQuestionAnswer, prepareTextForEmbedding } from "./embedding";
import type { IngestionRequest, IngestionResult, KBArticle } from "./types";

/**
 * Ingest a new document into the knowledge base
 * 
 * @param request - Ingestion request with document details
 * @returns Ingestion result with article ID and status
 */
export async function ingestDocument(
  request: IngestionRequest
): Promise<IngestionResult> {
  const { title, content, category, tags, source, createdBy, metadata = {} } = request;

  try {
    console.log(`[KB Ingestion] Ingesting document: ${title}`);

    // Prepare text for embedding
    const embeddingText = combineQuestionAnswer(title, content, category);
    const cleanedText = prepareTextForEmbedding(embeddingText);

    // Generate embedding
    const { embedding } = await generateEmbedding({ text: cleanedText });

    // Store in database
    const article = await prisma.knowledge_base.create({
      data: {
        shop_domain: "hotrodan.com", // Default shop domain
        document_key: generateDocumentKey(title),
        document_type: "kb_article",
        title,
        content,
        embedding: `[${embedding.join(",")}]`, // Store as PostgreSQL array
        source_url: source,
        tags,
        category,
        version: 1,
        is_current: true,
        created_by: createdBy,
        metadata: metadata as any,
        project: "occ",
      },
    });

    console.log(`[KB Ingestion] ✅ Document ingested: ${article.id}`);

    return {
      articleId: article.id,
      chunksCreated: 1,
      embeddingGenerated: true,
      success: true,
    };
  } catch (error) {
    console.error(`[KB Ingestion] ❌ Error ingesting document:`, error);
    return {
      articleId: "",
      chunksCreated: 0,
      embeddingGenerated: false,
      success: false,
      error: error.message,
    };
  }
}

/**
 * Ingest multiple documents in batch
 * 
 * @param requests - Array of ingestion requests
 * @returns Array of ingestion results
 */
export async function ingestDocumentsBatch(
  requests: IngestionRequest[]
): Promise<IngestionResult[]> {
  console.log(`[KB Ingestion] Batch ingesting ${requests.length} documents`);

  const results: IngestionResult[] = [];

  for (const request of requests) {
    const result = await ingestDocument(request);
    results.push(result);

    // Rate limiting: Wait 100ms between API calls to avoid hitting OpenAI limits
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  const successCount = results.filter((r) => r.success).length;
  console.log(`[KB Ingestion] ✅ Batch complete: ${successCount}/${requests.length} successful`);

  return results;
}

/**
 * Update an existing KB article
 * 
 * @param articleId - Article ID to update
 * @param updates - Partial article updates
 * @returns Updated article
 */
export async function updateArticle(
  articleId: string,
  updates: Partial<{
    title: string;
    content: string;
    category: string;
    tags: string[];
    metadata: Record<string, any>;
  }>
): Promise<KBArticle | null> {
  try {
    console.log(`[KB Ingestion] Updating article: ${articleId}`);

    // If content or title changed, regenerate embedding
    let embeddingUpdate: any = {};
    if (updates.title || updates.content) {
      const article = await prisma.knowledge_base.findUnique({
        where: { id: articleId },
      });

      if (!article) {
        throw new Error(`Article not found: ${articleId}`);
      }

      const newTitle = updates.title || article.title;
      const newContent = updates.content || article.content;
      const newCategory = updates.category || article.category || undefined;

      const embeddingText = combineQuestionAnswer(newTitle, newContent, newCategory);
      const cleanedText = prepareTextForEmbedding(embeddingText);
      const { embedding } = await generateEmbedding({ text: cleanedText });

      embeddingUpdate = {
        embedding: `[${embedding.join(",")}]`,
      };
    }

    const updated = await prisma.knowledge_base.update({
      where: { id: articleId },
      data: {
        ...updates,
        ...embeddingUpdate,
        updated_at: new Date(),
      },
    });

    console.log(`[KB Ingestion] ✅ Article updated: ${articleId}`);

    return mapToKBArticle(updated);
  } catch (error) {
    console.error(`[KB Ingestion] ❌ Error updating article:`, error);
    return null;
  }
}

/**
 * Delete a KB article
 * 
 * @param articleId - Article ID to delete
 * @returns True if deleted successfully
 */
export async function deleteArticle(articleId: string): Promise<boolean> {
  try {
    console.log(`[KB Ingestion] Deleting article: ${articleId}`);

    await prisma.knowledge_base.delete({
      where: { id: articleId },
    });

    console.log(`[KB Ingestion] ✅ Article deleted: ${articleId}`);
    return true;
  } catch (error) {
    console.error(`[KB Ingestion] ❌ Error deleting article:`, error);
    return false;
  }
}

/**
 * Generate a unique document key from title
 * 
 * @param title - Document title
 * @returns Unique document key
 */
function generateDocumentKey(title: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const timestamp = Date.now();
  return `${slug}-${timestamp}`;
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
    confidenceScore: 0.5, // Default confidence
    usageCount: 0,
    successCount: 0,
    source: record.source_url || "manual",
    createdBy: record.created_by,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
    lastUsedAt: record.last_indexed_at,
  };
}

/**
 * Get article by ID
 * 
 * @param articleId - Article ID
 * @returns KB article or null
 */
export async function getArticleById(articleId: string): Promise<KBArticle | null> {
  try {
    const article = await prisma.knowledge_base.findUnique({
      where: { id: articleId },
    });

    if (!article) {
      return null;
    }

    return mapToKBArticle(article);
  } catch (error) {
    console.error(`[KB Ingestion] Error fetching article:`, error);
    return null;
  }
}

/**
 * List all articles with optional filters
 * 
 * @param filters - Optional filters
 * @returns Array of KB articles
 */
export async function listArticles(filters?: {
  category?: string;
  tags?: string[];
  limit?: number;
}): Promise<KBArticle[]> {
  try {
    const where: any = {
      is_current: true,
      project: "occ",
    };

    if (filters?.category) {
      where.category = filters.category;
    }

    if (filters?.tags && filters.tags.length > 0) {
      where.tags = {
        hasSome: filters.tags,
      };
    }

    const articles = await prisma.knowledge_base.findMany({
      where,
      take: filters?.limit || 100,
      orderBy: {
        created_at: "desc",
      },
    });

    return articles.map(mapToKBArticle);
  } catch (error) {
    console.error(`[KB Ingestion] Error listing articles:`, error);
    return [];
  }
}

