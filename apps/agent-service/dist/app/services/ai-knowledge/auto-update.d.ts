/**
 * Automated Knowledge Base Update Service
 *
 * Automatically updates KB articles based on:
 * - New information from conversations
 * - Policy/product changes
 * - Quality feedback
 *
 * Growth Engine: Automated Knowledge Maintenance
 */
export interface UpdateSuggestion {
    articleId: string;
    currentContent: string;
    suggestedContent: string;
    reason: string;
    confidence: number;
    evidence: string[];
}
/**
 * Detect outdated articles
 *
 * @param days - Consider articles older than this many days
 * @returns Array of potentially outdated articles
 */
export declare function detectOutdatedArticles(days?: number): Promise<Array<{
    articleId: string;
    title: string;
    age: number;
    lastUpdated: Date;
    reason: string;
}>>;
/**
 * Generate update suggestion using AI
 *
 * @param articleId - Article to update
 * @param newInformation - New information to incorporate
 * @returns Update suggestion
 */
export declare function generateUpdateSuggestion(articleId: string, newInformation: string[]): Promise<UpdateSuggestion | null>;
/**
 * Apply update to article
 *
 * @param suggestion - Update suggestion
 * @param autoApprove - Whether to auto-approve (default: false)
 * @returns True if updated successfully
 */
export declare function applyUpdate(suggestion: UpdateSuggestion, autoApprove?: boolean): Promise<boolean>;
/**
 * Run automated knowledge base updates
 *
 * @param autoApprove - Whether to auto-approve high-confidence updates
 * @returns Summary of update results
 */
export declare function runAutomatedUpdates(autoApprove?: boolean): Promise<{
    articlesAnalyzed: number;
    suggestionsGenerated: number;
    updatesApplied: number;
    timestamp: Date;
}>;
/**
 * Monitor KB health and trigger updates
 *
 * @returns Health report with recommended actions
 */
export declare function monitorKBHealth(): Promise<{
    totalArticles: number;
    outdatedArticles: number;
    lowConfidenceArticles: number;
    recommendedActions: string[];
    timestamp: Date;
}>;
//# sourceMappingURL=auto-update.d.ts.map