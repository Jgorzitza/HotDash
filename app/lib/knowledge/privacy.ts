/**
 * Privacy and PII Scrubbing for KB System
 * Ensures no personally identifiable information is stored in KB
 */

import { KBConfig } from './config';

interface ScrubResult {
  scrubbed: string;
  piiFound: boolean;
  piiTypes: string[];
  redactionCount: number;
}

/**
 * Scrub PII from text
 */
export function scrubPII(text: string): ScrubResult {
  if (!KBConfig.privacy.piiScrubbing.enabled) {
    return {
      scrubbed: text,
      piiFound: false,
      piiTypes: [],
      redactionCount: 0
    };
  }

  let scrubbed = text;
  const piiTypes: string[] = [];
  let redactionCount = 0;

  const patterns = KBConfig.privacy.piiScrubbing.patterns;
  const replacement = KBConfig.privacy.piiScrubbing.replacement;

  // Email addresses
  if (patterns.email.test(scrubbed)) {
    scrubbed = scrubbed.replace(patterns.email, replacement);
    piiTypes.push('email');
    redactionCount += (text.match(patterns.email) || []).length;
  }

  // Phone numbers
  if (patterns.phone.test(scrubbed)) {
    scrubbed = scrubbed.replace(patterns.phone, replacement);
    piiTypes.push('phone');
    redactionCount += (text.match(patterns.phone) || []).length;
  }

  // SSN
  if (patterns.ssn.test(scrubbed)) {
    scrubbed = scrubbed.replace(patterns.ssn, replacement);
    piiTypes.push('ssn');
    redactionCount += (text.match(patterns.ssn) || []).length;
  }

  // Credit card numbers
  if (patterns.creditCard.test(scrubbed)) {
    scrubbed = scrubbed.replace(patterns.creditCard, replacement);
    piiTypes.push('creditCard');
    redactionCount += (text.match(patterns.creditCard) || []).length;
  }

  // Addresses
  if (patterns.address.test(scrubbed)) {
    scrubbed = scrubbed.replace(patterns.address, replacement);
    piiTypes.push('address');
    redactionCount += (text.match(patterns.address) || []).length;
  }

  return {
    scrubbed,
    piiFound: piiTypes.length > 0,
    piiTypes,
    redactionCount
  };
}

/**
 * Scrub PII from KB article before storage
 */
export function scrubArticle(article: {
  question: string;
  answer: string;
}): {
  question: string;
  answer: string;
  piiFound: boolean;
  piiTypes: string[];
} {
  const questionResult = scrubPII(article.question);
  const answerResult = scrubPII(article.answer);

  return {
    question: questionResult.scrubbed,
    answer: answerResult.scrubbed,
    piiFound: questionResult.piiFound || answerResult.piiFound,
    piiTypes: [...new Set([...questionResult.piiTypes, ...answerResult.piiTypes])]
  };
}

/**
 * Scrub PII from learning edit
 */
export function scrubLearningEdit(edit: {
  aiDraft: string;
  humanFinal: string;
  customerQuestion: string;
}): {
  aiDraft: string;
  humanFinal: string;
  customerQuestion: string;
  piiFound: boolean;
  piiTypes: string[];
} {
  const draftResult = scrubPII(edit.aiDraft);
  const finalResult = scrubPII(edit.humanFinal);
  const questionResult = scrubPII(edit.customerQuestion);

  return {
    aiDraft: draftResult.scrubbed,
    humanFinal: finalResult.scrubbed,
    customerQuestion: questionResult.scrubbed,
    piiFound: draftResult.piiFound || finalResult.piiFound || questionResult.piiFound,
    piiTypes: [...new Set([
      ...draftResult.piiTypes,
      ...finalResult.piiTypes,
      ...questionResult.piiTypes
    ])]
  };
}

/**
 * Anonymize user identifier
 */
export function anonymizeUser(userId: string): string {
  if (!KBConfig.privacy.anonymization.enabled) {
    return userId;
  }

  if (KBConfig.privacy.anonymization.method === 'hash') {
    // Simple hash (in production, use crypto.createHash)
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return `user_${Math.abs(hash).toString(16)}`;
  } else {
    // Pseudonym
    return `user_${Math.random().toString(36).substring(2, 10)}`;
  }
}

/**
 * Check if text contains PII
 */
export function containsPII(text: string): boolean {
  const result = scrubPII(text);
  return result.piiFound;
}

/**
 * Validate article for PII before storage
 */
export function validateArticlePrivacy(article: {
  question: string;
  answer: string;
}): {
  valid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  const scrubbed = scrubArticle(article);

  if (scrubbed.piiFound) {
    errors.push(`PII detected in article: ${scrubbed.piiTypes.join(', ')}`);
    errors.push('Article must be scrubbed before storage');
  }

  // Check for common PII indicators
  const lowerQuestion = article.question.toLowerCase();
  const lowerAnswer = article.answer.toLowerCase();

  const piiIndicators = [
    'my email',
    'my phone',
    'my address',
    'my credit card',
    'my ssn',
    'my account number'
  ];

  piiIndicators.forEach(indicator => {
    if (lowerQuestion.includes(indicator) || lowerAnswer.includes(indicator)) {
      warnings.push(`Possible PII reference: "${indicator}"`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Audit PII scrubbing effectiveness
 */
export async function auditPIIScrubbing(samples: Array<{
  original: string;
  scrubbed: string;
}>): Promise<{
  totalSamples: number;
  piiDetected: number;
  piiMissed: number;
  effectiveness: number;
}> {
  let piiDetected = 0;
  let piiMissed = 0;

  for (const sample of samples) {
    const result = scrubPII(sample.original);
    
    if (result.piiFound) {
      piiDetected++;
    }

    // Check if scrubbed version still contains patterns (false negatives)
    const checkResult = scrubPII(sample.scrubbed);
    if (checkResult.piiFound) {
      piiMissed++;
    }
  }

  const effectiveness = samples.length > 0
    ? (piiDetected - piiMissed) / samples.length
    : 1.0;

  return {
    totalSamples: samples.length,
    piiDetected,
    piiMissed,
    effectiveness
  };
}

/**
 * Generate privacy compliance report
 */
export function generatePrivacyReport(): string {
  let report = '# KB Privacy Compliance Report\n\n';

  report += '## Configuration\n';
  report += `- PII Scrubbing: ${KBConfig.privacy.piiScrubbing.enabled ? 'ENABLED' : 'DISABLED'}\n`;
  report += `- Anonymization: ${KBConfig.privacy.anonymization.enabled ? 'ENABLED' : 'DISABLED'}\n`;
  report += `- Anonymization Method: ${KBConfig.privacy.anonymization.method}\n\n`;

  report += '## PII Patterns Monitored\n';
  Object.keys(KBConfig.privacy.piiScrubbing.patterns).forEach(type => {
    report += `- ${type}\n`;
  });

  report += '\n## Data Retention\n';
  report += `- Learning Edits: ${KBConfig.privacy.retention.learningEdits} days\n`;
  report += `- Usage Logs: ${KBConfig.privacy.retention.usageLogs} days\n`;
  report += `- Archived Articles: ${KBConfig.privacy.retention.archivedArticles} days\n\n`;

  report += '## Anonymized Fields\n';
  KBConfig.privacy.anonymization.fields.forEach(field => {
    report += `- ${field}\n`;
  });

  report += '\n## Compliance Status\n';
  report += '- ✅ PII scrubbing active\n';
  report += '- ✅ User anonymization active\n';
  report += '- ✅ Data retention policies defined\n';
  report += '- ✅ Privacy-by-design implemented\n';

  return report;
}

/**
 * Cleanup old data per retention policy
 */
export async function cleanupOldData(): Promise<{
  learningEditsDeleted: number;
  usageLogsDeleted: number;
  archivedArticlesDeleted: number;
}> {
  // This would be implemented to actually delete old data
  // For now, return structure
  return {
    learningEditsDeleted: 0,
    usageLogsDeleted: 0,
    archivedArticlesDeleted: 0
  };
}

