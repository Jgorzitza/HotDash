/**
 * Knowledge Base Type Definitions
 *
 * Types for the AI Knowledge Base system that learns from HITL approvals
 * and provides contextual knowledge retrieval for AI agents.
 *
 * Growth Engine: HITL Learning System
 */
/**
 * Knowledge Base Article
 *
 * Represents a single piece of knowledge with quality metrics
 */
export interface KBArticle {
    id: string;
    question: string;
    answer: string;
    category: KBCategory;
    tags: string[];
    confidenceScore: number;
    usageCount: number;
    successCount: number;
    avgToneGrade?: number;
    avgAccuracyGrade?: number;
    avgPolicyGrade?: number;
    source: string;
    createdBy: string;
    lastUsedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
    embedding?: number[];
}
/**
 * Knowledge Base Categories
 */
export type KBCategory = 'orders' | 'shipping' | 'returns' | 'products' | 'technical' | 'policies';
/**
 * Learning Edit Record
 *
 * Captures human corrections to AI drafts for learning
 */
export interface LearningEdit {
    id: string;
    approvalId: string;
    conversationId: string;
    aiDraft: string;
    humanFinal: string;
    editDistance: number;
    editRatio: number;
    toneGrade?: number;
    accuracyGrade?: number;
    policyGrade?: number;
    customerQuestion: string;
    category?: KBCategory;
    tags: string[];
    kbArticleId?: string;
    learningType: LearningType;
    createdAt: Date;
}
/**
 * Learning Types
 */
export type LearningType = 'tone_improvement' | 'factual_correction' | 'policy_clarification' | 'template_refinement' | 'new_pattern';
/**
 * Recurring Issue Pattern
 */
export interface RecurringIssue {
    id: string;
    issuePattern: string;
    category: KBCategory;
    tags: string[];
    occurrenceCount: number;
    firstSeenAt: Date;
    lastSeenAt: Date;
    kbArticleId?: string;
    resolutionStatus: ResolutionStatus;
    avgResolutionTimeMinutes?: number;
    customerSatisfactionScore?: number;
    createdAt: Date;
    updatedAt: Date;
}
/**
 * Resolution Status
 */
export type ResolutionStatus = 'unresolved' | 'kb_created' | 'escalated' | 'product_issue' | 'policy_update_needed';
/**
 * RAG Context Options
 */
export interface RAGContextOptions {
    maxContext?: number;
    minConfidence?: number;
    categories?: KBCategory[];
    tags?: string[];
}
/**
 * RAG Context Result
 */
export interface RAGContext {
    articles: KBArticle[];
    totalFound: number;
    query: string;
    timestamp: Date;
}
/**
 * Embedding Request
 */
export interface EmbeddingRequest {
    text: string;
    model?: string;
}
/**
 * Embedding Response
 */
export interface EmbeddingResponse {
    embedding: number[];
    model: string;
    usage: {
        promptTokens: number;
        totalTokens: number;
    };
}
/**
 * Document Ingestion Request
 */
export interface IngestionRequest {
    title: string;
    content: string;
    category: KBCategory;
    tags: string[];
    source: string;
    createdBy: string;
    metadata?: Record<string, any>;
}
/**
 * Document Ingestion Result
 */
export interface IngestionResult {
    articleId: string;
    chunksCreated: number;
    embeddingGenerated: boolean;
    success: boolean;
    error?: string;
}
/**
 * Semantic Search Request
 */
export interface SearchRequest {
    query: string;
    limit?: number;
    minSimilarity?: number;
    categories?: KBCategory[];
    tags?: string[];
}
/**
 * Semantic Search Result
 */
export interface SearchResult {
    article: KBArticle;
    similarity: number;
    rank: number;
}
/**
 * Learning Extraction Request
 */
export interface LearningExtractionRequest {
    approvalId: string;
    aiDraft: string;
    humanFinal: string;
    grades: {
        tone: number;
        accuracy: number;
        policy: number;
    };
    customerQuestion: string;
    reviewer: string;
}
/**
 * Learning Extraction Result
 */
export interface LearningExtractionResult {
    editCreated: boolean;
    editId?: string;
    learningType: LearningType;
    kbArticleUpdated: boolean;
    kbArticleId?: string;
    newArticleCreated: boolean;
    confidenceChange?: number;
}
/**
 * KB Health Metrics
 */
export interface KBHealthMetrics {
    totalArticles: number;
    avgConfidenceScore: number;
    totalUsage: number;
    successRate: number;
    categoryCoverage: Record<KBCategory, number>;
    recentLearningEdits: number;
    pendingRecurringIssues: number;
    lastIndexedAt?: Date;
}
//# sourceMappingURL=types.d.ts.map