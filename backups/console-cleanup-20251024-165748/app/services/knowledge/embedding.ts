/**
 * Knowledge Base Embedding Service
 * 
 * Generates vector embeddings using OpenAI's text-embedding-3-small model
 * for semantic search in the knowledge base.
 * 
 * Growth Engine: HITL Learning System
 */

import { OpenAI } from "openai";
import type { EmbeddingRequest, EmbeddingResponse } from "./types";

// OpenAI client for embeddings
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

/**
 * Default embedding model
 * Using text-embedding-3-small for cost efficiency and good performance
 */
const DEFAULT_EMBEDDING_MODEL = "text-embedding-3-small";

/**
 * Generate embedding vector for text
 * 
 * @param request - Embedding request with text and optional model
 * @returns Embedding response with vector and usage stats
 */
export async function generateEmbedding(
  request: EmbeddingRequest
): Promise<EmbeddingResponse> {
  const { text, model = DEFAULT_EMBEDDING_MODEL } = request;

  try {
    console.log(`[KB Embedding] Generating embedding for text (${text.length} chars)`);

    const response = await openai.embeddings.create({
      model,
      input: text,
      encoding_format: "float",
    });

    const embedding = response.data[0].embedding;
    const usage = response.usage;

    console.log(`[KB Embedding] ✅ Generated embedding (${embedding.length} dimensions)`);

    return {
      embedding,
      model,
      usage: {
        promptTokens: usage.prompt_tokens,
        totalTokens: usage.total_tokens,
      },
    };
  } catch (error) {
    console.error(`[KB Embedding] ❌ Error generating embedding:`, error);
    throw new Error(`Failed to generate embedding: ${error.message}`);
  }
}

/**
 * Generate embeddings for multiple texts in batch
 * 
 * @param texts - Array of texts to embed
 * @param model - Optional model override
 * @returns Array of embedding vectors
 */
export async function generateEmbeddingsBatch(
  texts: string[],
  model: string = DEFAULT_EMBEDDING_MODEL
): Promise<number[][]> {
  try {
    console.log(`[KB Embedding] Generating batch embeddings for ${texts.length} texts`);

    const response = await openai.embeddings.create({
      model,
      input: texts,
      encoding_format: "float",
    });

    const embeddings = response.data.map((item) => item.embedding);

    console.log(`[KB Embedding] ✅ Generated ${embeddings.length} embeddings`);

    return embeddings;
  } catch (error) {
    console.error(`[KB Embedding] ❌ Error generating batch embeddings:`, error);
    throw new Error(`Failed to generate batch embeddings: ${error.message}`);
  }
}

/**
 * Calculate cosine similarity between two embedding vectors
 * 
 * @param a - First embedding vector
 * @param b - Second embedding vector
 * @returns Similarity score (0-1, higher is more similar)
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error("Embedding vectors must have the same length");
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dotProduct / (normA * normB);
}

/**
 * Prepare text for embedding
 * 
 * Cleans and normalizes text before embedding generation
 * 
 * @param text - Raw text
 * @returns Cleaned text ready for embedding
 */
export function prepareTextForEmbedding(text: string): string {
  // Remove excessive whitespace
  let cleaned = text.replace(/\s+/g, " ").trim();

  // Remove special characters that don't add semantic meaning
  cleaned = cleaned.replace(/[^\w\s.,!?-]/g, "");

  // Truncate to max token limit (8191 for text-embedding-3-small)
  // Rough estimate: 1 token ≈ 4 characters
  const maxChars = 8191 * 4;
  if (cleaned.length > maxChars) {
    cleaned = cleaned.substring(0, maxChars);
    console.warn(`[KB Embedding] Text truncated to ${maxChars} chars`);
  }

  return cleaned;
}

/**
 * Combine question and answer for embedding
 * 
 * Creates a single text representation of a KB article for embedding
 * 
 * @param question - Article question
 * @param answer - Article answer
 * @param category - Optional category for context
 * @returns Combined text ready for embedding
 */
export function combineQuestionAnswer(
  question: string,
  answer: string,
  category?: string
): string {
  const parts = [];

  if (category) {
    parts.push(`Category: ${category}`);
  }

  parts.push(`Question: ${question}`);
  parts.push(`Answer: ${answer}`);

  return parts.join("\n\n");
}

/**
 * Health check for embedding service
 * 
 * @returns True if service is operational
 */
export async function checkEmbeddingHealth(): Promise<boolean> {
  try {
    const testText = "Health check test";
    await generateEmbedding({ text: testText });
    return true;
  } catch (error) {
    console.error(`[KB Embedding] Health check failed:`, error);
    return false;
  }
}

