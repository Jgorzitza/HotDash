/**
 * Knowledge Base Embedding Service
 *
 * Generates vector embeddings using OpenAI's text-embedding-3-small model
 * for semantic search in the knowledge base.
 *
 * Growth Engine: HITL Learning System
 */
import type { EmbeddingRequest, EmbeddingResponse } from "./types";
/**
 * Generate embedding vector for text
 *
 * @param request - Embedding request with text and optional model
 * @returns Embedding response with vector and usage stats
 */
export declare function generateEmbedding(request: EmbeddingRequest): Promise<EmbeddingResponse>;
/**
 * Generate embeddings for multiple texts in batch
 *
 * @param texts - Array of texts to embed
 * @param model - Optional model override
 * @returns Array of embedding vectors
 */
export declare function generateEmbeddingsBatch(texts: string[], model?: string): Promise<number[][]>;
/**
 * Calculate cosine similarity between two embedding vectors
 *
 * @param a - First embedding vector
 * @param b - Second embedding vector
 * @returns Similarity score (0-1, higher is more similar)
 */
export declare function cosineSimilarity(a: number[], b: number[]): number;
/**
 * Prepare text for embedding
 *
 * Cleans and normalizes text before embedding generation
 *
 * @param text - Raw text
 * @returns Cleaned text ready for embedding
 */
export declare function prepareTextForEmbedding(text: string): string;
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
export declare function combineQuestionAnswer(question: string, answer: string, category?: string): string;
/**
 * Health check for embedding service
 *
 * @returns True if service is operational
 */
export declare function checkEmbeddingHealth(): Promise<boolean>;
//# sourceMappingURL=embedding.d.ts.map