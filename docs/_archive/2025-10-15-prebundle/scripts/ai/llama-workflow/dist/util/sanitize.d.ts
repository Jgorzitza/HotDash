/**
 * PII Sanitization utilities for cleaning sensitive data before indexing
 */
export interface SanitizationResult {
    sanitizedText: string;
    redactedCount: number;
    redactedTypes: string[];
}
export interface SanitizationOptions {
    redactEmails?: boolean;
    redactPhones?: boolean;
    redactCreditCards?: boolean;
    redactSSNs?: boolean;
    redactApiKeys?: boolean;
    redactTokens?: boolean;
    redactJWTs?: boolean;
    redactIPs?: boolean;
    customPatterns?: Array<{
        name: string;
        pattern: RegExp;
        replacement?: string;
    }>;
    preserveWhitelist?: string[];
}
/**
 * Sanitize text by removing or replacing PII patterns
 */
export declare function sanitizeText(text: string, options?: SanitizationOptions): SanitizationResult;
/**
 * Sanitize telemetry data specifically
 */
export declare function sanitizeTelemetry(payload: any): {
    sanitized: any;
    redacted: SanitizationResult;
};
/**
 * Sanitize curated support replies
 */
export declare function sanitizeCuratedReply(question: string, answer: string): {
    question: string;
    answer: string;
    redacted: SanitizationResult;
};
//# sourceMappingURL=sanitize.d.ts.map