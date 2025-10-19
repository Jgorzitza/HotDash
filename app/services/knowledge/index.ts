/**
 * Knowledge Service - Main Export
 */

export * from "./types";
export * from "./embedding";
export * from "./search";
export * from "./ingestion";

export { generateEmbedding, cosineSimilarity } from "./embedding";
export { searchKnowledge, searchByCategory } from "./search";
export { ingestDocument, ingestKnowledgeStub } from "./ingestion";
export { buildRAGContext } from "./rag";
