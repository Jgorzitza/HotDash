#!/usr/bin/env tsx
/**
 * RAG Index Builder for Support KB
 *
 * Builds a LlamaIndex vector store from support KB content in data/support/
 * Stores index in packages/memory/indexes/operator_knowledge/
 *
 * Usage:
 *   npx tsx scripts/rag/build-index.ts
 *   npx tsx scripts/rag/build-index.ts --force-mock  # Use local embeddings
 */
interface BuildResult {
    success: boolean;
    documentCount: number;
    indexPath: string;
    duration: number;
    error?: string;
}
interface BuildOptions {
    forceMock?: boolean;
    persistDir?: string;
    sourcesDir?: string;
}
/**
 * Build the RAG index
 */
declare function buildIndex(options?: BuildOptions): Promise<BuildResult>;
/**
 * Test the built index with sample queries
 */
declare function testIndex(indexPath: string): Promise<void>;
export { buildIndex, testIndex, type BuildResult, type BuildOptions };
//# sourceMappingURL=build-index.d.ts.map