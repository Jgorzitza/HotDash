/**
 * Security Red Team Tests
 * 
 * Tests for security vulnerabilities and attack vectors.
 * Backlog task #25: Security review + red-team tests
 */

import { describe, it, expect } from 'vitest';
import { scrubPII } from '../../app/agents/tools/pii-scrubbing';
import { checkPolicyViolations } from '../../app/agents/tools/policy-filters';
import { createError } from '../../app/agents/tools/errors';
import { verifyHITLEnforcement } from '../../app/agents/sdk/index';

describe('Security: PII Protection', () => {
  it('should scrub email addresses from logs', () => {
    const text = 'Contact me at john.doe@example.com for more info';
    const scrubbed = scrubPII(text);
    
    expect(scrubbed).not.toContain('john.doe@example.com');
    expect(scrubbed).toContain('[EMAIL]');
  });

  it('should scrub phone numbers from logs', () => {
    const text = 'Call me at 555-123-4567 or (555) 987-6543';
    const scrubbed = scrubPII(text);
    
    expect(scrubbed).not.toContain('555-123-4567');
    expect(scrubbed).not.toContain('(555) 987-6543');
    expect(scrubbed).toContain('[PHONE]');
  });

  it('should scrub SSN from logs', () => {
    const text = 'My SSN is 123-45-6789';
    const scrubbed = scrubPII(text);
    
    expect(scrubbed).not.toContain('123-45-6789');
    expect(scrubbed).toContain('[SSN]');
  });

  it('should scrub credit card numbers from logs', () => {
    const text = 'My card is 4532-1234-5678-9010';
    const scrubbed = scrubPII(text);
    
    expect(scrubbed).not.toContain('4532-1234-5678-9010');
    expect(scrubbed).toContain('[CREDIT_CARD]');
  });

  it('should scrub IP addresses from logs', () => {
    const text = 'Request from 192.168.1.1';
    const scrubbed = scrubPII(text);
    
    expect(scrubbed).not.toContain('192.168.1.1');
    expect(scrubbed).toContain('[IP_ADDRESS]');
  });
});

describe('Security: Policy Enforcement', () => {
  it('should detect unauthorized discount offers', () => {
    const response = 'I can offer you 50% off your next order!';
    const violations = checkPolicyViolations(response);
    
    expect(violations.length).toBeGreaterThan(0);
    expect(violations.some(v => v.type === 'unauthorized_discount')).toBe(true);
  });

  it('should detect prohibited language', () => {
    const response = 'I guarantee this will work perfectly!';
    const violations = checkPolicyViolations(response);
    
    expect(violations.length).toBeGreaterThan(0);
    expect(violations.some(v => v.type === 'prohibited_language')).toBe(true);
  });

  it('should detect data sharing violations', () => {
    const response = 'Please send me your credit card number';
    const violations = checkPolicyViolations(response);
    
    expect(violations.length).toBeGreaterThan(0);
    expect(violations.some(v => v.type === 'data_sharing')).toBe(true);
  });

  it('should allow compliant responses', () => {
    const response = 'I\'ll be happy to help you with your order. Let me check the status for you.';
    const violations = checkPolicyViolations(response);
    
    expect(violations.length).toBe(0);
  });
});

describe('Security: HITL Enforcement', () => {
  it('should enforce HITL for ai-customer agent', () => {
    expect(() => verifyHITLEnforcement('ai-customer')).not.toThrow();
  });

  it('should throw error if HITL config is missing', () => {
    expect(() => verifyHITLEnforcement('nonexistent-agent')).toThrow();
  });
});

describe('Security: Injection Attacks', () => {
  it('should handle SQL injection attempts in input', () => {
    const maliciousInput = "'; DROP TABLE users; --";
    const scrubbed = scrubPII(maliciousInput);
    
    // Should not execute SQL, just treat as text
    expect(scrubbed).toBe(maliciousInput);
  });

  it('should handle XSS attempts in input', () => {
    const maliciousInput = '<script>alert("XSS")</script>';
    const scrubbed = scrubPII(maliciousInput);
    
    // Should not execute script, just treat as text
    expect(scrubbed).toBe(maliciousInput);
  });

  it('should handle command injection attempts', () => {
    const maliciousInput = '; rm -rf /';
    const scrubbed = scrubPII(maliciousInput);
    
    // Should not execute command, just treat as text
    expect(scrubbed).toBe(maliciousInput);
  });
});

describe('Security: Error Handling', () => {
  it('should not expose sensitive information in error messages', () => {
    const error = createError('DATABASE_ERROR', {
      query: 'SELECT * FROM users WHERE password = "secret123"',
    });
    
    // User message should not contain sensitive details
    expect(error.userMessage).not.toContain('password');
    expect(error.userMessage).not.toContain('secret123');
    expect(error.userMessage).not.toContain('SELECT');
  });

  it('should provide safe error messages to users', () => {
    const error = createError('INTERNAL_SERVER_ERROR');
    
    expect(error.userMessage).toBe('Something went wrong on our end. Please try again later.');
    expect(error.userMessage).not.toContain('stack');
    expect(error.userMessage).not.toContain('database');
  });
});

describe('Security: Rate Limiting', () => {
  it('should detect rate limit violations', () => {
    const error = createError('RATE_LIMIT_EXCEEDED');
    
    expect(error.category).toBe('rate_limit');
    expect(error.retryable).toBe(true);
    expect(error.userMessage).toContain('Too many requests');
  });
});

describe('Security: Authentication & Authorization', () => {
  it('should handle unauthorized access attempts', () => {
    const error = createError('UNAUTHORIZED');
    
    expect(error.category).toBe('authentication');
    expect(error.severity).toBe('medium');
    expect(error.userMessage).toContain('log in');
  });

  it('should handle forbidden access attempts', () => {
    const error = createError('FORBIDDEN');
    
    expect(error.category).toBe('authorization');
    expect(error.userMessage).toContain('permission');
  });
});

describe('Security: Input Validation', () => {
  it('should handle invalid input gracefully', () => {
    const error = createError('INVALID_INPUT');
    
    expect(error.category).toBe('validation');
    expect(error.retryable).toBe(false);
  });

  it('should handle missing required fields', () => {
    const error = createError('MISSING_REQUIRED_FIELD');
    
    expect(error.category).toBe('validation');
    expect(error.userMessage).toContain('required fields');
  });
});

