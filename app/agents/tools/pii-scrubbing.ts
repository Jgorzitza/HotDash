/**
 * PII Scrubbing Tool
 * 
 * Removes personally identifiable information from logs and outputs.
 * Backlog task #11: PII scrubbing (logs/outputs)
 */

import { z } from 'zod';

/**
 * PII patterns to detect and scrub
 */
const PII_PATTERNS = {
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  phone: /\b(\+?1[-.]?)?\(?\d{3}\)?[-.]?\d{3}[-.]?\d{4}\b/g,
  ssn: /\b\d{3}-\d{2}-\d{4}\b/g,
  creditCard: /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g,
  ipAddress: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
  address: /\b\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Court|Ct|Circle|Cir)\b/gi,
};

/**
 * Scrub PII from text
 * 
 * @param text - Text to scrub
 * @param options - Scrubbing options
 */
export function scrubPII(
  text: string,
  options: {
    scrubEmail?: boolean;
    scrubPhone?: boolean;
    scrubSSN?: boolean;
    scrubCreditCard?: boolean;
    scrubIPAddress?: boolean;
    scrubAddress?: boolean;
    replacement?: string;
  } = {}
): string {
  const {
    scrubEmail = true,
    scrubPhone = true,
    scrubSSN = true,
    scrubCreditCard = true,
    scrubIPAddress = true,
    scrubAddress = true,
    replacement = '[REDACTED]',
  } = options;

  let scrubbedText = text;

  if (scrubEmail) {
    scrubbedText = scrubbedText.replace(PII_PATTERNS.email, '[EMAIL]');
  }

  if (scrubPhone) {
    scrubbedText = scrubbedText.replace(PII_PATTERNS.phone, '[PHONE]');
  }

  if (scrubSSN) {
    scrubbedText = scrubbedText.replace(PII_PATTERNS.ssn, '[SSN]');
  }

  if (scrubCreditCard) {
    scrubbedText = scrubbedText.replace(PII_PATTERNS.creditCard, '[CREDIT_CARD]');
  }

  if (scrubIPAddress) {
    scrubbedText = scrubbedText.replace(PII_PATTERNS.ipAddress, '[IP_ADDRESS]');
  }

  if (scrubAddress) {
    scrubbedText = scrubbedText.replace(PII_PATTERNS.address, '[ADDRESS]');
  }

  return scrubbedText;
}

/**
 * Hash sensitive data for logging
 * 
 * @param data - Data to hash
 */
export function hashForLogging(data: string): string {
  // Simple hash for logging (not cryptographically secure)
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return `hash_${Math.abs(hash).toString(36)}`;
}

/**
 * Scrub PII from structured data
 * 
 * @param data - Object to scrub
 */
export function scrubPIIFromObject(data: Record<string, any>): Record<string, any> {
  const scrubbed: Record<string, any> = {};

  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      scrubbed[key] = scrubPII(value);
    } else if (typeof value === 'object' && value !== null) {
      scrubbed[key] = scrubPIIFromObject(value);
    } else {
      scrubbed[key] = value;
    }
  }

  return scrubbed;
}

/**
 * Create safe log entry
 * 
 * @param event - Event name
 * @param data - Event data
 */
export function createSafeLogEntry(event: string, data: Record<string, any>): string {
  const scrubbedData = scrubPIIFromObject(data);
  
  return JSON.stringify({
    event,
    timestamp: new Date().toISOString(),
    data: scrubbedData,
  });
}

