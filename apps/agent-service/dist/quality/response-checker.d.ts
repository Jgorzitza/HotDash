/**
 * Response Quality Checker
 *
 * Validates agent responses before sending to customers.
 * Checks for quality, safety, and policy compliance.
 */
export interface QualityCheck {
    passed: boolean;
    score: number;
    issues: string[];
    warnings: string[];
    suggestions: string[];
}
export interface ResponseCheckConfig {
    minLength: number;
    maxLength: number;
    requiresContext: boolean;
    prohibitedTerms: string[];
    requiredElements?: string[];
}
/**
 * Checks response quality and safety
 */
export declare class ResponseChecker {
    private prohibitedTerms;
    /**
     * Perform comprehensive quality check
     */
    checkResponse(response: string, config?: Partial<ResponseCheckConfig>): QualityCheck;
    /**
     * Check if response has empathy
     */
    private hasEmpathy;
    /**
     * Check if response is clear
     */
    private isClear;
    /**
     * Check if response has actionable steps
     */
    private hasActionableSteps;
    /**
     * Check if response is well-formatted
     */
    private isWellFormatted;
    /**
     * Check for placeholder text
     */
    private hasPlaceholders;
    /**
     * Suggest improvements for response
     */
    suggestImprovements(response: string, check: QualityCheck): string[];
    /**
     * Check if response is safe to send without approval
     */
    isSafeToSendAutomatically(response: string): boolean;
}
export declare const responseChecker: ResponseChecker;
//# sourceMappingURL=response-checker.d.ts.map