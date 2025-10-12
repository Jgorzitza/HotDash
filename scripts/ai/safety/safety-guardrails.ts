/**
 * AI Safety and Guardrails for Agent SDK
 * 
 * Content safety filters, PII detection, policy compliance checks
 */

import { z } from 'zod';

export const SafetyCheckResultSchema = z.object({
  safe: z.boolean(),
  violations: z.array(z.object({
    type: z.enum(['pii', 'policy', 'tone', 'prohibited_content', 'promise']),
    severity: z.enum(['critical', 'high', 'medium', 'low']),
    description: z.string(),
    location: z.string(),  // Where in text
  })),
  redactions: z.array(z.object({
    type: z.string(),
    original: z.string(),
    redacted: z.string(),
  })),
});

export class SafetyGuardrails {
  
  /**
   * Check response safety before sending to customer
   */
  async checkSafety(response: string, context: any): Promise<z.infer<typeof SafetyCheckResultSchema>> {
    const violations: any[] = [];
    const redactions: any[] = [];
    
    // 1. PII Detection
    const piiFindings = this.detectPII(response);
    violations.push(...piiFindings);
    
    // 2. Policy Compliance
    const policyFindings = this.checkPolicyCompliance(response);
    violations.push(...policyFindings);
    
    // 3. Prohibited Content
    const prohibitedFindings = this.checkProhibitedContent(response);
    violations.push(...prohibitedFindings);
    
    // 4. Unrealistic Promises
    const promiseFindings = this.checkUnrealisticPromises(response);
    violations.push(...promiseFindings);
    
    const safe = violations.filter(v => v.severity === 'critical').length === 0;
    
    return {
      safe,
      violations,
      redactions,
    };
  }
  
  /**
   * Detect PII in responses
   */
  private detectPII(text: string): any[] {
    const findings: any[] = [];
    
    // Email addresses
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const emails = text.match(emailRegex);
    if (emails) {
      findings.push({
        type: 'pii',
        severity: 'high',
        description: 'Email address detected in response',
        location: emails[0],
      });
    }
    
    // Phone numbers
    const phoneRegex = /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g;
    const phones = text.match(phoneRegex);
    if (phones) {
      findings.push({
        type: 'pii',
        severity: 'high',
        description: 'Phone number detected',
        location: phones[0],
      });
    }
    
    // Credit card patterns
    const ccRegex = /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g;
    const cards = text.match(ccRegex);
    if (cards) {
      findings.push({
        type: 'pii',
        severity: 'critical',
        description: 'Potential credit card number detected',
        location: cards[0],
      });
    }
    
    return findings;
  }
  
  /**
   * Check policy compliance
   */
  private checkPolicyCompliance(text: string): any[] {
    const findings: any[] = [];
    const lower = text.toLowerCase();
    
    // Incorrect return window
    if (lower.includes('60 day') || lower.includes('90 day')) {
      findings.push({
        type: 'policy',
        severity: 'high',
        description: 'Incorrect return window stated (should be 30 days)',
        location: 'return policy statement',
      });
    }
    
    // Unauthorized refunds
    if (lower.includes('full refund') && !lower.includes('within 30 days')) {
      findings.push({
        type: 'policy',
        severity: 'medium',
        description: 'Full refund mentioned without policy conditions',
        location: 'refund statement',
      });
    }
    
    return findings;
  }
  
  /**
   * Check for prohibited content
   */
  private checkProhibitedContent(text: string): any[] {
    const findings: any[] = [];
    const lower = text.toLowerCase();
    
    // Personal contact info sharing
    if (lower.includes('my email') || lower.includes('my phone')) {
      findings.push({
        type: 'prohibited_content',
        severity: 'critical',
        description: 'Agent sharing personal contact information',
        location: 'contact info',
      });
    }
    
    // Negative competitor mentions
    if (lower.includes('competitor') && (lower.includes('worse') || lower.includes('bad'))) {
      findings.push({
        type: 'prohibited_content',
        severity: 'medium',
        description: 'Negative competitor comparison',
        location: 'competitor mention',
      });
    }
    
    return findings;
  }
  
  /**
   * Check for unrealistic promises
   */
  private checkUnrealisticPromises(text: string): any[] {
    const findings: any[] = [];
    const lower = text.toLowerCase();
    
    const prohibitedPromises = [
      { phrase: 'guarantee', severity: 'high', desc: 'Absolute guarantee made' },
      { phrase: '100%', severity: 'medium', desc: '100% promise (too absolute)' },
      { phrase: 'definitely', severity: 'medium', desc: 'Definitive promise' },
      { phrase: 'always', severity: 'low', desc: 'Absolute language' },
    ];
    
    prohibitedPromises.forEach(({ phrase, severity, desc }) => {
      if (lower.includes(phrase)) {
        findings.push({
          type: 'promise',
          severity,
          description: desc,
          location: phrase,
        });
      }
    });
    
    return findings;
  }
}

export const safetyGuardrails = new SafetyGuardrails();

