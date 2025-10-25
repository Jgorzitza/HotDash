/**
 * Response Quality Checker
 *
 * Validates agent responses before sending to customers.
 * Checks for quality, safety, and policy compliance.
 */
/**
 * Checks response quality and safety
 */
export class ResponseChecker {
    prohibitedTerms = [
        'hack',
        'crack',
        'pirate',
        'steal',
        'cheat',
        'fuck',
        'shit',
        'damn',
        // Add more as needed
    ];
    /**
     * Perform comprehensive quality check
     */
    checkResponse(response, config) {
        const fullConfig = {
            minLength: 10,
            maxLength: 2000,
            requiresContext: true,
            prohibitedTerms: this.prohibitedTerms,
            ...config,
        };
        const issues = [];
        const warnings = [];
        const suggestions = [];
        let score = 100;
        // Check length
        if (response.length < fullConfig.minLength) {
            issues.push(`Response too short (${response.length} < ${fullConfig.minLength} chars)`);
            score -= 30;
        }
        if (response.length > fullConfig.maxLength) {
            warnings.push(`Response too long (${response.length} > ${fullConfig.maxLength} chars)`);
            score -= 10;
        }
        // Check for prohibited terms
        const lowerResponse = response.toLowerCase();
        for (const term of fullConfig.prohibitedTerms) {
            if (lowerResponse.includes(term.toLowerCase())) {
                issues.push(`Contains prohibited term: "${term}"`);
                score -= 50;
            }
        }
        // Check for empathy and professionalism
        if (!this.hasEmpathy(response)) {
            warnings.push('Response lacks empathy or acknowledgment');
            score -= 15;
        }
        // Check for clarity
        if (!this.isClear(response)) {
            warnings.push('Response may be unclear or confusing');
            score -= 10;
        }
        // Check for actionable next steps
        if (!this.hasActionableSteps(response)) {
            suggestions.push('Consider adding clear next steps for the customer');
            score -= 5;
        }
        // Check for proper formatting
        if (!this.isWellFormatted(response)) {
            suggestions.push('Consider improving formatting with bullet points or paragraphs');
            score -= 5;
        }
        // Check for placeholder text
        if (this.hasPlaceholders(response)) {
            issues.push('Response contains placeholder text (e.g., [NAME], XXX)');
            score -= 40;
        }
        // Final score adjustment
        score = Math.max(0, Math.min(100, score));
        return {
            passed: issues.length === 0 && score >= 60,
            score,
            issues,
            warnings,
            suggestions,
        };
    }
    /**
     * Check if response has empathy
     */
    hasEmpathy(response) {
        const empathyIndicators = [
            'understand',
            'sorry',
            'apologize',
            'appreciate',
            'thank',
            'help',
            'happy to',
            'glad to',
            'i see',
            'that must',
        ];
        const lower = response.toLowerCase();
        return empathyIndicators.some(indicator => lower.includes(indicator));
    }
    /**
     * Check if response is clear
     */
    isClear(response) {
        // Check for overly complex sentences
        const sentences = response.split(/[.!?]+/);
        const avgWordsPerSentence = sentences.reduce((sum, s) => {
            return sum + s.trim().split(/\s+/).length;
        }, 0) / sentences.length;
        // Average sentence should be under 30 words
        return avgWordsPerSentence < 30;
    }
    /**
     * Check if response has actionable steps
     */
    hasActionableSteps(response) {
        const actionIndicators = [
            'please',
            'you can',
            'next step',
            'click',
            'visit',
            'follow',
            'reply',
            'contact',
            'check',
            'review',
        ];
        const lower = response.toLowerCase();
        return actionIndicators.some(indicator => lower.includes(indicator));
    }
    /**
     * Check if response is well-formatted
     */
    isWellFormatted(response) {
        // Check for paragraphs or lists
        const hasMultipleParagraphs = (response.match(/\n\n/g) || []).length > 0;
        const hasLists = (response.match(/^[-*•]/gm) || []).length > 0;
        const hasNumberedLists = (response.match(/^\d+\./gm) || []).length > 0;
        return hasMultipleParagraphs || hasLists || hasNumberedLists || response.length < 200;
    }
    /**
     * Check for placeholder text
     */
    hasPlaceholders(response) {
        const placeholderPatterns = [
            /\[.*?\]/g, // [NAME], [ORDER_ID]
            /\{.*?\}/g, // {name}, {orderId}
            /XXX+/gi, // XXX, XXXX
            /TODO/gi, // TODO
            /FIXME/gi, // FIXME
        ];
        return placeholderPatterns.some(pattern => pattern.test(response));
    }
    /**
     * Suggest improvements for response
     */
    suggestImprovements(response, check) {
        const improvements = [];
        if (response.length < 50) {
            improvements.push('Add more context and details to your response');
        }
        if (!this.hasEmpathy(response)) {
            improvements.push('Start with an empathetic acknowledgment (e.g., "I understand your concern...")');
        }
        if (!this.hasActionableSteps(response)) {
            improvements.push('End with clear next steps for the customer');
        }
        if (check.score < 70) {
            improvements.push('Consider rewriting for better clarity and helpfulness');
        }
        return improvements;
    }
    /**
     * Check if response is safe to send without approval
     */
    isSafeToSendAutomatically(response) {
        const check = this.checkResponse(response);
        // Must pass all checks and have high score
        if (!check.passed || check.score < 80) {
            return false;
        }
        // No warnings about sensitive content
        if (check.issues.length > 0) {
            return false;
        }
        return true;
    }
}
// Export singleton instance
export const responseChecker = new ResponseChecker();
//# sourceMappingURL=response-checker.js.map