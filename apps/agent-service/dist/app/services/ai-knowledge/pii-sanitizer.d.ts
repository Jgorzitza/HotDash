/**
 * PII Sanitization Service
 *
 * Removes personally identifiable information (PII) from text before embedding
 * in the CX conversation mining system.
 *
 * Security requirement: NO PII should ever be stored in embeddings
 *
 * Sanitization rules:
 * - Email addresses → [EMAIL_REDACTED]
 * - Phone numbers → [PHONE_REDACTED]
 * - Street addresses → [ADDRESS_REDACTED]
 * - Postal codes → [POSTAL_REDACTED]
 * - Credit card numbers → [CC_REDACTED]
 */
export interface SanitizationResult {
    sanitizedText: string;
    piiDetected: boolean;
    piiTypes: string[];
}
export interface SanitizedMessage {
    content: string;
    messageType: string;
    piiDetected: boolean;
    piiTypes: string[];
}
/**
 * Sanitize PII from a single text string
 *
 * @param text - Raw text potentially containing PII
 * @returns Sanitization result with redacted text and PII metadata
 */
export declare function sanitizePII(text: string): SanitizationResult;
/**
 * Sanitize a conversation (array of messages)
 *
 * @param messages - Array of Chatwoot messages with content and messageType
 * @returns Array of sanitized messages with PII metadata
 */
export declare function sanitizeConversation(messages: Array<{
    content: string;
    messageType: string;
}>): SanitizedMessage[];
//# sourceMappingURL=pii-sanitizer.d.ts.map