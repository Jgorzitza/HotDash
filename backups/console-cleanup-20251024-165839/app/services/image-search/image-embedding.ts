/**
 * Image Embedding Service
 * 
 * Generates text embeddings from image descriptions for similarity search
 * Uses OpenAI text-embedding-3-small (same as knowledge base)
 * 
 * Task: BLOCKER-003
 */

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// Use same embedding model as knowledge base for consistency
const EMBEDDING_MODEL = "text-embedding-3-small";
const EMBEDDING_DIMENSIONS = 1536;

export interface EmbeddingResult {
  embedding: number[];
  dimensions: number;
  model: string;
  tokensUsed: number;
}

/**
 * Generate embedding from text description
 * 
 * @param text - Text to embed (image description)
 * @returns Embedding vector
 */
export async function generateTextEmbedding(text: string): Promise<EmbeddingResult> {
  try {
    const response = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: text,
      dimensions: EMBEDDING_DIMENSIONS,
    });

    const embedding = response.data[0].embedding;

    return {
      embedding,
      dimensions: embedding.length,
      model: EMBEDDING_MODEL,
      tokensUsed: response.usage.total_tokens,
    };
  } catch (error: any) {
    console.error("[Image Embedding] Error:", error);
    throw new Error(`Failed to generate embedding: ${error.message}`);
  }
}

/**
 * Batch generate embeddings for multiple texts
 * 
 * @param texts - Array of texts to embed
 * @returns Array of embedding results
 */
export async function batchGenerateEmbeddings(texts: string[]): Promise<EmbeddingResult[]> {
  try {
    // OpenAI supports batch embedding (up to 2048 inputs)
    const response = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: texts,
      dimensions: EMBEDDING_DIMENSIONS,
    });

    return response.data.map((item) => ({
      embedding: item.embedding,
      dimensions: item.embedding.length,
      model: EMBEDDING_MODEL,
      tokensUsed: response.usage.total_tokens / texts.length, // Approximate per-text
    }));
  } catch (error: any) {
    console.error("[Image Embedding] Batch error:", error);
    throw new Error(`Failed to generate batch embeddings: ${error.message}`);
  }
}

/**
 * Calculate cosine similarity between two embeddings
 * 
 * @param embedding1 - First embedding vector
 * @param embedding2 - Second embedding vector
 * @returns Similarity score (0-1, higher is more similar)
 */
export function cosineSimilarity(embedding1: number[], embedding2: number[]): number {
  if (embedding1.length !== embedding2.length) {
    throw new Error("Embeddings must have same dimensions");
  }

  let dotProduct = 0;
  let norm1 = 0;
  let norm2 = 0;

  for (let i = 0; i < embedding1.length; i++) {
    dotProduct += embedding1[i] * embedding2[i];
    norm1 += embedding1[i] * embedding1[i];
    norm2 += embedding2[i] * embedding2[i];
  }

  return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
}

/**
 * Format embedding for pgvector storage
 * 
 * @param embedding - Embedding vector
 * @returns Formatted string for pgvector
 */
export function formatEmbeddingForPgVector(embedding: number[]): string {
  return `[${embedding.join(",")}]`;
}

/**
 * Parse embedding from pgvector format
 * 
 * @param pgvectorString - String from pgvector
 * @returns Embedding vector
 */
export function parseEmbeddingFromPgVector(pgvectorString: string): number[] {
  // Remove brackets and split by comma
  const cleaned = pgvectorString.replace(/[\[\]]/g, "");
  return cleaned.split(",").map((n) => parseFloat(n));
}

