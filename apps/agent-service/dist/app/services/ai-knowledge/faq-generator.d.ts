/**
 * FAQ Generation Service
 *
 * Automatically generates FAQ articles from customer conversations
 * using AI to identify common questions and synthesize answers.
 *
 * Growth Engine: Automated Knowledge Extraction
 */
export interface FAQCandidate {
    question: string;
    answer: string;
    category: string;
    confidence: number;
    occurrences: number;
    sources: string[];
}
/**
 * Extract FAQ candidates from conversations
 *
 * @param days - Number of days to analyze (default: 30)
 * @param minOccurrences - Minimum occurrences to consider (default: 3)
 * @returns Array of FAQ candidates
 */
export declare function extractFAQCandidates(days?: number, minOccurrences?: number): Promise<FAQCandidate[]>;
/**
 * Generate FAQ answer using AI
 *
 * @param question - The question to answer
 * @param context - Context from similar conversations
 * @returns Generated answer
 */
export declare function generateFAQAnswer(question: string, context: string[]): Promise<string>;
/**
 * Create FAQ article from candidate
 *
 * @param candidate - FAQ candidate
 * @returns Article ID if created successfully
 */
export declare function createFAQArticle(candidate: FAQCandidate): Promise<string | null>;
/**
 * Run automated FAQ generation
 *
 * @param days - Number of days to analyze
 * @param minOccurrences - Minimum occurrences
 * @returns Summary of generation results
 */
export declare function runAutomatedFAQGeneration(days?: number, minOccurrences?: number): Promise<{
    candidatesFound: number;
    articlesCreated: number;
    timestamp: Date;
}>;
/**
 * Identify knowledge gaps from unanswered questions
 *
 * @param days - Number of days to analyze
 * @returns Array of knowledge gaps
 */
export declare function identifyKnowledgeGaps(days?: number): Promise<Array<{
    question: string;
    category: string;
    occurrences: number;
    priority: "high" | "medium" | "low";
    suggestedAction: string;
}>>;
/**
 * Improve search relevance by analyzing search patterns
 *
 * @param days - Number of days to analyze
 * @returns Relevance improvement suggestions
 */
export declare function improveSearchRelevance(days?: number): Promise<Array<{
    searchQuery: string;
    currentResults: string[];
    suggestedImprovements: string[];
    priority: "high" | "medium" | "low";
}>>;
//# sourceMappingURL=faq-generator.d.ts.map