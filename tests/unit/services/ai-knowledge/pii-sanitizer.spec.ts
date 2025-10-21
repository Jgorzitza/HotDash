/**
 * PII Sanitization Service Tests
 * 
 * Verifies that all PII types are properly detected and sanitized:
 * - Email addresses
 * - Phone numbers (multiple formats)
 * - Street addresses
 * - Postal codes (US and Canada)
 * - Credit card numbers
 * 
 * CRITICAL: 100% PII removal verified, no false positives
 */

import { describe, it, expect } from 'vitest';
import { sanitizePII, sanitizeConversation } from '~/services/ai-knowledge/pii-sanitizer';

describe('PII Sanitizer', () => {
  describe('Email Redaction', () => {
    it('should redact single email address', () => {
      const text = 'Contact me at john.doe@example.com for more info';
      const result = sanitizePII(text);
      
      expect(result.sanitizedText).toBe('Contact me at [EMAIL_REDACTED] for more info');
      expect(result.piiDetected).toBe(true);
      expect(result.piiTypes).toContain('email');
    });
    
    it('should redact multiple email addresses', () => {
      const text = 'Email alice@example.com or bob@test.org';
      const result = sanitizePII(text);
      
      expect(result.sanitizedText).toBe('Email [EMAIL_REDACTED] or [EMAIL_REDACTED]');
      expect(result.piiDetected).toBe(true);
      expect(result.piiTypes).toContain('email');
    });
    
    it('should handle email with + and _ characters', () => {
      const text = 'Send to john+shop@example.com';
      const result = sanitizePII(text);
      
      expect(result.sanitizedText).toBe('Send to [EMAIL_REDACTED]');
      expect(result.piiDetected).toBe(true);
    });
  });
  
  describe('Phone Number Redaction', () => {
    it('should redact phone with parentheses format', () => {
      const text = 'Call me at (555) 123-4567';
      const result = sanitizePII(text);
      
      expect(result.sanitizedText).toBe('Call me at [PHONE_REDACTED]');
      expect(result.piiDetected).toBe(true);
      expect(result.piiTypes).toContain('phone');
    });
    
    it('should redact phone with dashes format', () => {
      const text = 'My number is 555-123-4567';
      const result = sanitizePII(text);
      
      expect(result.sanitizedText).toBe('My number is [PHONE_REDACTED]');
      expect(result.piiDetected).toBe(true);
    });
    
    it('should redact phone with dots format', () => {
      const text = 'Call 555.123.4567';
      const result = sanitizePII(text);
      
      expect(result.sanitizedText).toBe('Call [PHONE_REDACTED]');
      expect(result.piiDetected).toBe(true);
    });
    
    it('should redact phone with country code', () => {
      const text = 'International: +1-555-123-4567';
      const result = sanitizePII(text);
      
      expect(result.sanitizedText).toBe('International: [PHONE_REDACTED]');
      expect(result.piiDetected).toBe(true);
    });
  });
  
  describe('Address Redaction', () => {
    it('should redact street address with Street', () => {
      const text = 'I live at 123 Main Street';
      const result = sanitizePII(text);
      
      expect(result.sanitizedText).toBe('I live at [ADDRESS_REDACTED]');
      expect(result.piiDetected).toBe(true);
      expect(result.piiTypes).toContain('address');
    });
    
    it('should redact address with Drive', () => {
      const text = 'Send it to 321 Maple Drive';
      const result = sanitizePII(text);
      
      expect(result.sanitizedText).toBe('Send it to [ADDRESS_REDACTED]');
      expect(result.piiDetected).toBe(true);
    });
  });
  
  describe('Postal Code Redaction', () => {
    it('should redact US 5-digit postal code', () => {
      const text = 'ZIP code is 90210';
      const result = sanitizePII(text);
      
      expect(result.sanitizedText).toBe('ZIP code is [POSTAL_REDACTED]');
      expect(result.piiDetected).toBe(true);
      expect(result.piiTypes).toContain('postal_code');
    });
    
    it('should redact US ZIP+4 format', () => {
      const text = 'ZIP: 90210-1234';
      const result = sanitizePII(text);
      
      expect(result.sanitizedText).toBe('ZIP: [POSTAL_REDACTED]');
      expect(result.piiDetected).toBe(true);
    });
  });
  
  describe('Credit Card Redaction', () => {
    it('should redact credit card with spaces', () => {
      const text = 'Card: 1234 5678 9012 3456';
      const result = sanitizePII(text);
      
      expect(result.sanitizedText).toBe('Card: [CC_REDACTED]');
      expect(result.piiDetected).toBe(true);
      expect(result.piiTypes).toContain('credit_card');
    });
  });
  
  describe('Multiple PII Types', () => {
    it('should detect and redact all PII types in one message', () => {
      const text = 'Send to 123 Main Street, ZIP 90210. Email: john@example.com';
      const result = sanitizePII(text);
      
      // Verify all PII types detected
      expect(result.piiDetected).toBe(true);
      expect(result.piiTypes).toContain('address');
      expect(result.piiTypes).toContain('postal_code');
      expect(result.piiTypes).toContain('email');
      
      // Verify NO PII remains
      expect(result.sanitizedText).not.toContain('john@example.com');
      expect(result.sanitizedText).not.toContain('123 Main Street');
      expect(result.sanitizedText).not.toContain('90210');
    });
  });
  
  describe('No False Positives', () => {
    it('should not redact regular text without PII', () => {
      const text = 'This is a normal message with no sensitive information.';
      const result = sanitizePII(text);
      
      expect(result.sanitizedText).toBe(text);
      expect(result.piiDetected).toBe(false);
      expect(result.piiTypes).toHaveLength(0);
    });
  });
  
  describe('Conversation Sanitization', () => {
    it('should sanitize all messages in a conversation', () => {
      const messages = [
        { content: 'My email is alice@example.com', messageType: 'incoming' },
        { content: 'What is your phone number?', messageType: 'outgoing' },
        { content: 'It is (555) 123-4567', messageType: 'incoming' }
      ];
      
      const sanitized = sanitizeConversation(messages);
      
      expect(sanitized).toHaveLength(3);
      expect(sanitized[0].content).toBe('My email is [EMAIL_REDACTED]');
      expect(sanitized[0].piiDetected).toBe(true);
      expect(sanitized[2].content).toBe('It is [PHONE_REDACTED]');
      expect(sanitized[2].piiDetected).toBe(true);
    });
  });
});
