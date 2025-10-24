/**
 * AI Customer Service Training Data and Templates Service
 *
 * Manages AI training data, response templates, and knowledge base
 * for the AI customer service system.
 *
 * @module app/services/ai-customer/training-data.service
 */
export interface TrainingData {
    id: string;
    category: string;
    question: string;
    answer: string;
    tags: string[];
    confidence: number;
    usageCount: number;
    successRate: number;
    lastUpdated: string;
    isActive: boolean;
}
export interface KnowledgeBaseEntry {
    id: string;
    title: string;
    content: string;
    category: string;
    tags: string[];
    relatedProducts: string[];
    searchKeywords: string[];
    lastUpdated: string;
    isActive: boolean;
}
export interface TrainingMetrics {
    totalTrainingData: number;
    activeEntries: number;
    averageConfidence: number;
    averageSuccessRate: number;
    categoryDistribution: Record<string, number>;
    topPerformingEntries: TrainingData[];
    improvementRecommendations: string[];
}
export declare class TrainingDataService {
    private supabase;
    private trainingData;
    private knowledgeBase;
    constructor();
    /**
     * Initialize training data service
     */
    initialize(): Promise<void>;
    /**
     * Get training data for AI model training
     */
    getTrainingData(category?: string): Promise<TrainingData[]>;
    /**
     * Search knowledge base for relevant information
     */
    searchKnowledgeBase(query: string, category?: string): Promise<KnowledgeBaseEntry[]>;
    /**
     * Add new training data
     */
    addTrainingData(category: string, question: string, answer: string, tags?: string[]): Promise<TrainingData>;
    /**
     * Update training data performance
     */
    updateTrainingDataPerformance(trainingDataId: string, success: boolean, confidence?: number): Promise<void>;
    /**
     * Add knowledge base entry
     */
    addKnowledgeBaseEntry(title: string, content: string, category: string, tags?: string[], relatedProducts?: string[], searchKeywords?: string[]): Promise<KnowledgeBaseEntry>;
    /**
     * Get training metrics
     */
    getTrainingMetrics(): Promise<TrainingMetrics>;
    /**
     * Generate improvement recommendations
     */
    private generateImprovementRecommendations;
    /**
     * Load training data from database
     */
    private loadTrainingData;
    /**
     * Load knowledge base from database
     */
    private loadKnowledgeBase;
    /**
     * Get default training data when database is unavailable
     */
    private getDefaultTrainingData;
    /**
     * Get default knowledge base when database is unavailable
     */
    private getDefaultKnowledgeBase;
}
/**
 * Default training data service instance
 */
export declare const trainingDataService: TrainingDataService;
//# sourceMappingURL=training-data.service.d.ts.map