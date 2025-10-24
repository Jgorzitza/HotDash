/**
 * Image Embedding Service
 *
 * Generates text embeddings from image descriptions for similarity search
 * Uses OpenAI text-embedding-3-small (same as knowledge base)
 *
 * Task: BLOCKER-003
 */
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
export declare function generateTextEmbedding(text: string): Promise<EmbeddingResult>;
/**
 * Batch generate embeddings for multiple texts
 *
 * @param texts - Array of texts to embed
 * @returns Array of embedding results
 */
export declare function batchGenerateEmbeddings(texts: string[]): Promise<EmbeddingResult[]>;
/**
 * Calculate cosine similarity between two embeddings
 *
 * @param embedding1 - First embedding vector
 * @param embedding2 - Second embedding vector
 * @returns Similarity score (0-1, higher is more similar)
 */
export declare function cosineSimilarity(embedding1: number[], embedding2: number[]): number;
/**
 * Format embedding for pgvector storage
 *
 * @param embedding - Embedding vector
 * @returns Formatted string for pgvector
 */
export declare function formatEmbeddingForPgVector(embedding: number[]): string;
/**
 * Parse embedding from pgvector format
 *
 * @param pgvectorString - String from pgvector
 * @returns Embedding vector
 */
export declare function parseEmbeddingFromPgVector(pgvectorString: string): number[];
//# sourceMappingURL=image-embedding.d.ts.map