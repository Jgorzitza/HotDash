/**
 * Knowledge Base Learning Pipeline
 *
 * Implements the HITL learning system that captures human edits to AI drafts
 * and uses them to improve the knowledge base over time.
 *
 * Growth Engine: HITL Learning System
 */
import type { LearningExtractionRequest, LearningExtractionResult } from "./types";
/**
 * Extract learning from HITL approval
 *
 * Captures human edits and updates KB confidence scores or creates new articles
 *
 * @param request - Learning extraction request
 * @returns Learning extraction result
 */
export declare function extractLearning(request: LearningExtractionRequest): Promise<LearningExtractionResult>;
/**
 * Detect recurring issues from conversation patterns
 *
 * @param days - Number of days to analyze (default: 7)
 * @param minOccurrences - Minimum occurrences to consider recurring (default: 3)
 * @returns Array of recurring issue patterns
 */
export declare function detectRecurringIssues(days?: number, minOccurrences?: number): Promise<Array<{
    pattern: string;
    category: string;
    occurrences: number;
    firstSeen: Date;
    lastSeen: Date;
}>>;
/**
 * Archive low-confidence, unused articles
 *
 * Archives articles that haven't been used in 90 days and have confidence < 0.50
 *
 * @returns Number of articles archived
 */
export declare function archiveStaleArticles(): Promise<number>;
/**
 * Calculate confidence score for an article based on usage and grades
 *
 * @param usageCount - Number of times used
 * @param successCount - Number of successful uses
 * @param avgGrades - Average grades (tone, accuracy, policy)
 * @returns Confidence score (0-1)
 */
export declare function calculateConfidenceScore(usageCount: number, successCount: number, avgGrades?: {
    tone?: number;
    accuracy?: number;
    policy?: number;
}): number;
//# sourceMappingURL=learning.d.ts.map