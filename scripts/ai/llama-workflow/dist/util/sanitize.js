/**
 * PII Sanitization utilities for cleaning sensitive data before indexing
 */
// Common PII patterns
const EMAIL_PATTERN = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
const PHONE_PATTERN = /(\+?\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}/g;
const CREDIT_CARD_PATTERN = /\b(?:\d{4}[-\s]?){3}\d{4}\b/g;
const SSN_PATTERN = /\b\d{3}-\d{2}-\d{4}\b/g;
const API_KEY_PATTERN = /\b[Aa][Pp][Ii][-_]?[Kk][Ee][Yy][-_:=\s]*[A-Za-z0-9+/=]{16,}\b/g;
const TOKEN_PATTERN = /\b[Tt][Oo][Kk][Ee][Nn][-_:=\s]*[A-Za-z0-9+/=]{20,}\b/g;
const JWT_PATTERN = /\beyJ[A-Za-z0-9+/=]+\.[A-Za-z0-9+/=]+\.[A-Za-z0-9+/=_-]+\b/g;
// IP address patterns (be careful with internal IPs)
const IPV4_PATTERN = /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/g;
const IPV6_PATTERN = /\b(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}\b/g;
const DEFAULT_OPTIONS = {
    redactEmails: true,
    redactPhones: true,
    redactCreditCards: true,
    redactSSNs: true,
    redactApiKeys: true,
    redactTokens: true,
    redactJWTs: true,
    redactIPs: false, // Often needed for system context
    customPatterns: [],
    preserveWhitelist: [
        // Common non-sensitive patterns that might match
        'example.com',
        'test@example.com',
        'localhost',
        '127.0.0.1',
        '0.0.0.0'
    ]
};
/**
 * Check if a matched string should be preserved (not redacted)
 */
function shouldPreserve(match, whitelist) {
    return whitelist.some(item => match.toLowerCase().includes(item.toLowerCase()));
}
/**
 * Sanitize text by removing or replacing PII patterns
 */
export function sanitizeText(text, options = {}) {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    let sanitized = text;
    let redactedCount = 0;
    const redactedTypes = new Set();
    const patterns = [];
    if (opts.redactEmails) {
        patterns.push({ name: 'email', pattern: EMAIL_PATTERN, replacement: '[EMAIL_REDACTED]' });
    }
    if (opts.redactPhones) {
        patterns.push({ name: 'phone', pattern: PHONE_PATTERN, replacement: '[PHONE_REDACTED]' });
    }
    if (opts.redactCreditCards) {
        patterns.push({ name: 'credit_card', pattern: CREDIT_CARD_PATTERN, replacement: '[CARD_REDACTED]' });
    }
    if (opts.redactSSNs) {
        patterns.push({ name: 'ssn', pattern: SSN_PATTERN, replacement: '[SSN_REDACTED]' });
    }
    if (opts.redactApiKeys) {
        patterns.push({ name: 'api_key', pattern: API_KEY_PATTERN, replacement: '[API_KEY_REDACTED]' });
    }
    if (opts.redactTokens) {
        patterns.push({ name: 'token', pattern: TOKEN_PATTERN, replacement: '[TOKEN_REDACTED]' });
    }
    if (opts.redactJWTs) {
        patterns.push({ name: 'jwt', pattern: JWT_PATTERN, replacement: '[JWT_REDACTED]' });
    }
    if (opts.redactIPs) {
        patterns.push({ name: 'ipv4', pattern: IPV4_PATTERN, replacement: '[IP_REDACTED]' });
        patterns.push({ name: 'ipv6', pattern: IPV6_PATTERN, replacement: '[IP_REDACTED]' });
    }
    // Add custom patterns
    for (const custom of opts.customPatterns) {
        patterns.push({
            name: custom.name,
            pattern: custom.pattern,
            replacement: custom.replacement || '[REDACTED]'
        });
    }
    // Apply each pattern
    for (const { name, pattern, replacement } of patterns) {
        sanitized = sanitized.replace(pattern, (match) => {
            if (shouldPreserve(match, opts.preserveWhitelist)) {
                return match; // Keep original
            }
            redactedCount++;
            redactedTypes.add(name);
            return replacement;
        });
    }
    return {
        sanitizedText: sanitized,
        redactedCount,
        redactedTypes: Array.from(redactedTypes)
    };
}
/**
 * Sanitize telemetry data specifically
 */
export function sanitizeTelemetry(payload) {
    const text = typeof payload === 'string' ? payload : JSON.stringify(payload);
    const result = sanitizeText(text, {
        redactEmails: true,
        redactPhones: true,
        redactApiKeys: true,
        redactTokens: true,
        redactJWTs: true,
        redactIPs: true,
        customPatterns: [
            { name: 'user_id', pattern: /user[-_]?id[-_:=\s]*\d+/gi, replacement: 'user_id=[REDACTED]' },
            { name: 'session_id', pattern: /session[-_]?id[-_:=\s]*[A-Za-z0-9]{16,}/gi, replacement: 'session_id=[REDACTED]' }
        ]
    });
    try {
        return {
            sanitized: JSON.parse(result.sanitizedText),
            redacted: result
        };
    }
    catch {
        return {
            sanitized: result.sanitizedText,
            redacted: result
        };
    }
}
/**
 * Sanitize curated support replies
 */
export function sanitizeCuratedReply(question, answer) {
    const combined = `Q: ${question}\nA: ${answer}`;
    const result = sanitizeText(combined, {
        redactEmails: true,
        redactPhones: true,
        redactApiKeys: true,
        redactTokens: true,
        customPatterns: [
            { name: 'customer_name', pattern: /\b[A-Z][a-z]+ [A-Z][a-z]+\b/g, replacement: '[CUSTOMER_NAME]' }
        ],
        preserveWhitelist: [
            'hotdash', 'hot-dash', 'hotrodan.com',
            'example', 'test', 'demo', 'sample'
        ]
    });
    const lines = result.sanitizedText.split('\n');
    return {
        question: lines[0]?.replace('Q: ', '') || question,
        answer: lines.slice(1).join('\n').replace('A: ', '') || answer,
        redacted: result
    };
}
