/**
 * Simple BLEU score implementation (1-gram precision)
 * Returns score between 0 and 1
 */
export declare function bleuScore(candidate: string, reference: string): number;
/**
 * Simple ROUGE-L implementation (Longest Common Subsequence)
 * Returns F1 score between 0 and 1
 */
export declare function rougeL(candidate: string, reference: string): number;
/**
 * Check if required citations are present in the response
 */
export declare function checkCitations(response: any, requiredCites: string[]): {
    found: string[];
    missing: string[];
    score: number;
};
//# sourceMappingURL=metrics.d.ts.map