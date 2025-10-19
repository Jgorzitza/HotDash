/**
 * RAG (Retrieval-Augmented Generation) Context Builder
 *
 * Builds context for AI-Customer agent from knowledge base.
 * AIK-012: RAG Context Integration
 */

import { searchKnowledge } from "./search";
import type { SearchOptions } from "./types";

/**
 * Build RAG context from knowledge base
 *
 * @param query - User question or topic
 * @param maxContext - Maximum number of knowledge documents to include (default: 3)
 * @returns Promise<string> - Formatted context for AI prompt
 *
 * @example
 * const context = await buildRAGContext("How do I track my order?", 3);
 * const prompt = `Context:\n${context}\n\nQuestion: ${userQuestion}`;
 */
export async function buildRAGContext(
  query: string,
  maxContext: number = 3,
): Promise<string> {
  // Search knowledge base
  const results = await searchKnowledge(query, {
    limit: maxContext,
    minSimilarity: 0.7,
  });

  // Format results as context
  const contextBlocks = results.map((result, index) => {
    const { document, similarity } = result;
    return `
[Knowledge ${index + 1} - Relevance: ${(similarity * 100).toFixed(1)}%]
${document.metadata.title || "Untitled"}
${document.content}
    `.trim();
  });

  return contextBlocks.join("\n\n---\n\n");
}

/**
 * Build category-specific RAG context
 */
export async function buildCategoryContext(
  query: string,
  category: string,
  maxContext: number = 3,
): Promise<string> {
  const results = await searchKnowledge(query, {
    limit: maxContext,
    category,
  });

  return results.map((r) => r.document.content).join("\n\n");
}

/**
 * Build RAG context with confidence filtering
 */
export async function buildHighConfidenceContext(
  query: string,
  minConfidence: number = 0.8,
  maxContext: number = 3,
): Promise<string> {
  const results = await searchKnowledge(query, {
    limit: maxContext * 2, // Get more results to filter
  });

  // Filter by confidence score in metadata
  const highConfidence = results
    .filter((r) => (r.document.metadata.confidence_score || 0) >= minConfidence)
    .slice(0, maxContext);

  return highConfidence.map((r) => r.document.content).join("\n\n");
}
