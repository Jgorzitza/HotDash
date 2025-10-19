/**
 * RAG Context Builder - PRODUCTION
 */

import { searchKnowledge } from "./search";

export async function buildRAGContext(
  query: string,
  maxContext: number = 3,
): Promise<string> {
  const results = await searchKnowledge(query, {
    limit: maxContext,
    minSimilarity: 0.7,
  });

  const contextBlocks = results.map((result, index) => {
    const { document, similarity } = result;
    return `[Knowledge ${index + 1} - Relevance: ${(similarity * 100).toFixed(1)}%]\n${document.content}`;
  });

  return contextBlocks.join("\n\n---\n\n");
}
