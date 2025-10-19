/**
 * OpenAI Embedding Service
 *
 * Generates text embeddings using OpenAI's text-embedding-3-small model.
 * Includes rate limiting and error handling.
 *
 * Cost: $0.02 per 1M tokens
 * Dimensions: 1536
 */

import type { EmbeddingOptions } from "./types";

const DEFAULT_MODEL = "text-embedding-3-small";
const DEFAULT_DIMENSIONS = 1536;
const MAX_TOKENS = 8000;

/**
 * Generate embedding for a single text input
 *
 * @param text - Text to embed (truncated to 8000 tokens)
 * @param options - Embedding configuration options
 * @returns Promise<number[]> - 1536-dimensional embedding vector
 *
 * @example
 * const embedding = await generateEmbedding("How do I track my order?");
 */
export async function generateEmbedding(
  text: string,
  options: EmbeddingOptions = {},
): Promise<number[]> {
  const model = options.model || DEFAULT_MODEL;
  const dimensions = options.dimensions || DEFAULT_DIMENSIONS;
  const maxTokens = options.maxTokens || MAX_TOKENS;

  // Truncate text if too long (rough estimate: 1 token ≈ 4 chars)
  const truncatedText =
    text.length > maxTokens * 4 ? text.slice(0, maxTokens * 4) : text;

  // TODO: Implement OpenAI API call when credentials available
  // For now, return stub embedding
  throw new Error("OpenAI credentials not yet configured (waiting for DevOps)");
}

/**
 * Generate embeddings for multiple texts in batch
 *
 * @param texts - Array of texts to embed
 * @param options - Embedding configuration options
 * @returns Promise<number[][]> - Array of embedding vectors
 */
export async function generateEmbeddingsBatch(
  texts: string[],
  options: EmbeddingOptions = {},
): Promise<number[][]> {
  // TODO: Implement batch processing with rate limiting
  // Process in chunks of 100 to respect API limits
  const results: number[][] = [];

  for (const text of texts) {
    const embedding = await generateEmbedding(text, options);
    results.push(embedding);
  }

  return results;
}

/**
 * Calculate cosine similarity between two embeddings
 * Used for search relevance scoring
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error("Embedding dimensions must match");
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
