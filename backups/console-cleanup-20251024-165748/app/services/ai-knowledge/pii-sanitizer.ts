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
  piiTypes: string[]; // e.g., ["email", "phone", "address"]
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
export function sanitizePII(text: string): SanitizationResult {
  let sanitized = text;
  const piiTypes: string[] = [];

  // Remove email addresses
  // Pattern: username@domain.tld (RFC 5322 simplified)
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  if (emailRegex.test(sanitized)) {
    piiTypes.push("email");
    sanitized = sanitized.replace(emailRegex, "[EMAIL_REDACTED]");
  }

  // Remove phone numbers (multiple formats)
  // Supports: (555) 123-4567, 555-123-4567, 555.123.4567, +1-555-123-4567
  const phoneRegex = /(\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
  if (phoneRegex.test(sanitized)) {
    piiTypes.push("phone");
    sanitized = sanitized.replace(phoneRegex, "[PHONE_REDACTED]");
  }

  // Remove street addresses (common patterns)
  // Pattern: 123 Main Street, 456 Oak Ave, etc.
  const addressRegex =
    /\b\d+\s+[A-Z][a-z]+\s+(Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Court|Ct)\b/gi;
  if (addressRegex.test(sanitized)) {
    piiTypes.push("address");
    sanitized = sanitized.replace(addressRegex, "[ADDRESS_REDACTED]");
  }

  // Remove postal codes (US and Canada)
  // US: 12345 or 12345-6789
  // Canada: A1A 1A1 or A1A1A1
  const postalRegex = /\b\d{5}(?:-\d{4})?\b|\b[A-Z]\d[A-Z]\s?\d[A-Z]\d\b/gi;
  if (postalRegex.test(sanitized)) {
    piiTypes.push("postal_code");
    sanitized = sanitized.replace(postalRegex, "[POSTAL_REDACTED]");
  }

  // Remove credit card numbers
  // Pattern: 1234 5678 9012 3456 or 1234-5678-9012-3456
  const ccRegex = /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g;
  if (ccRegex.test(sanitized)) {
    piiTypes.push("credit_card");
    sanitized = sanitized.replace(ccRegex, "[CC_REDACTED]");
  }

  return {
    sanitizedText: sanitized,
    piiDetected: piiTypes.length > 0,
    piiTypes,
  };
}

/**
 * Sanitize a conversation (array of messages)
 *
 * @param messages - Array of Chatwoot messages with content and messageType
 * @returns Array of sanitized messages with PII metadata
 */
export function sanitizeConversation(
  messages: Array<{ content: string; messageType: string }>,
): SanitizedMessage[] {
  return messages.map((msg) => {
    const result = sanitizePII(msg.content);

    return {
      content: result.sanitizedText,
      messageType: msg.messageType,
      piiDetected: result.piiDetected,
      piiTypes: result.piiTypes,
    };
  });
}
