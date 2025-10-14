/**
 * Brand Voice Validator
 * 
 * Validates generated content against Hot Rod AN voice guidelines.
 * Ensures all automated content maintains brand consistency.
 * 
 * Reference: .cursor/rules/01-hot-rod-an-voice.mdc (if exists)
 * Based on: Operator-first, conversational, enthusiastic-but-clear tone
 */

import { z } from 'zod';

// ============================================================================
// Brand Voice Rules (Hot Rod AN Voice)
// ============================================================================

export const BrandVoiceRules = {
  // Conversational, not corporate
  conversational: {
    banned_words: [
      'leverage', 'synergize', 'paradigm', 'utilize', 'robust solution',
      'cutting-edge technology', 'best-in-class', 'revolutionary',
      'disruptive', 'innovative solution', 'premium quality excellence',
      'state-of-the-art', 'world-class', 'industry-leading',
    ],
    preferred_alternatives: {
      'utilize': 'use',
      'leverage': 'use',
      'robust': 'reliable',
      'cutting-edge': 'modern',
      'best-in-class': 'really good',
      'paradigm shift': 'big change',
    },
    max_corporate_words_per_100: 2, // Maximum 2% corporate jargon
  },

  // Enthusiastic but clear, not pushy
  enthusiastic_not_pushy: {
    banned_phrases: [
      'must buy now',
      'limited time only',
      'act now or miss out',
      'exclusive one-time offer',
      'don\'t miss this',
      'urgent action required',
    ],
    preferred_style: [
      'check it out',
      'give it a try',
      'see if it helps',
      'worth exploring',
      'might be useful',
    ],
    exclamation_limit: 3, // Max 3 per 500 words
  },

  // Operator-first (focus on their benefits)
  operator_first: {
    required_elements: [
      'specific_use_case',
      'operator_benefit',
      'concrete_example',
    ],
    avoid: [
      'generic feature lists',
      'marketing speak without substance',
      'benefits without proof points',
    ],
    examples_required: true,
    min_examples_per_claim: 1,
  },

  // Clear explanations, not jargon-heavy
  clear_not_jargon: {
    technical_term_rules: {
      max_per_paragraph: 2,
      must_explain_on_first_use: true,
      provide_examples: true,
    },
    readability: {
      target_grade_level: 8,  // 8th grade reading level
      max_sentence_length: 25, // words
      max_paragraph_length: 5, // sentences
    },
  },

  // Evidence-based claims
  evidence_based: {
    metrics_must_be_specific: true,
    vague_claims_banned: [
      'significantly better',
      'much faster',
      'greatly improved',
      'substantially more',
    ],
    required_format: '70% faster' not 'much faster',
    source_citations_required: true,
  },
};

// ============================================================================
// Validation Types
// ============================================================================

const ViolationSchema = z.object({
  rule: z.string(),
  severity: z.enum(['warning', 'error', 'critical']),
  location: z.string(), // Which sentence/paragraph
  found: z.string(), // The problematic text
  suggestion: z.string(), // How to fix
});

type Violation = z.infer<typeof ViolationSchema>;

export const BrandVoiceCheckResult = z.object({
  passes: z.boolean(),
  score: z.number().min(0).max(1),
  violations: z.array(ViolationSchema),
  suggestions: z.array(z.string()),
});

export type BrandVoiceCheck = z.infer<typeof BrandVoiceCheckResult>;

// ============================================================================
// Brand Voice Validator Class
// ============================================================================

export class BrandVoiceValidator {
  /**
   * Validate content against Hot Rod AN voice guidelines
   */
  async validate(content: string): Promise<BrandVoiceCheck> {
    const violations: Violation[] = [];
    
    // 1. Check for corporate jargon
    const corporateViolations = this.checkCorporateJargon(content);
    violations.push(...corporateViolations);
    
    // 2. Check for pushy language
    const pushyViolations = this.checkPushyLanguage(content);
    violations.push(...pushyViolations);
    
    // 3. Check operator-first focus
    const operatorViolations = this.checkOperatorFocus(content);
    violations.push(...operatorViolations);
    
    // 4. Check clarity (readability)
    const clarityViolations = this.checkClarity(content);
    violations.push(...clarityViolations);
    
    // 5. Check evidence-based claims
    const evidenceViolations = this.checkEvidenceBasedClaims(content);
    violations.push(...evidenceViolations);
    
    // Calculate score
    const score = this.calculateScore(violations, content.length);
    
    // Determine pass/fail (score >= 0.7 = pass)
    const passes = score >= 0.7 && violations.filter(v => v.severity === 'critical').length === 0;
    
    // Generate improvement suggestions
    const suggestions = this.generateSuggestions(violations);
    
    return {
      passes,
      score,
      violations,
      suggestions,
    };
  }

  private checkCorporateJargon(content: string): Violation[] {
    const violations: Violation[] = [];
    const lowerContent = content.toLowerCase();
    
    for (const word of BrandVoiceRules.conversational.banned_words) {
      if (lowerContent.includes(word.toLowerCase())) {
        violations.push({
          rule: 'conversational',
          severity: 'warning',
          location: this.findLocation(content, word),
          found: word,
          suggestion: `Replace "${word}" with "${BrandVoiceRules.conversational.preferred_alternatives[word as keyof typeof BrandVoiceRules.conversational.preferred_alternatives] || 'simpler language'}"`,
        });
      }
    }
    
    return violations;
  }

  private checkPushyLanguage(content: string): Violation[] {
    const violations: Violation[] = [];
    const lowerContent = content.toLowerCase();
    
    for (const phrase of BrandVoiceRules.enthusiastic_not_pushy.banned_phrases) {
      if (lowerContent.includes(phrase.toLowerCase())) {
        violations.push({
          rule: 'enthusiastic_not_pushy',
          severity: 'error',
          location: this.findLocation(content, phrase),
          found: phrase,
          suggestion: `Replace with softer CTA like: "${BrandVoiceRules.enthusiastic_not_pushy.preferred_style[0]}"`,
        });
      }
    }
    
    // Check exclamation mark overuse
    const exclamationCount = (content.match(/!/g) || []).length;
    const words = content.split(/\s+/).length;
    const per500 = (exclamationCount / words) * 500;
    
    if (per500 > BrandVoiceRules.enthusiastic_not_pushy.exclamation_limit) {
      violations.push({
        rule: 'enthusiastic_not_pushy',
        severity: 'warning',
        location: 'throughout content',
        found: `${exclamationCount} exclamation marks`,
        suggestion: `Reduce to max ${Math.ceil((words / 500) * 3)} (currently ${exclamationCount})`,
      });
    }
    
    return violations;
  }

  private checkOperatorFocus(content: string): Violation[] {
    const violations: Violation[] = [];
    
    // Check for specific use cases or examples
    const hasExample = /for example|such as|like when|imagine you|let's say/i.test(content);
    const hasOperatorBenefit = /save.*time|faster|easier|helps you|you can/i.test(content);
    
    if (!hasExample && content.length > 300) {
      violations.push({
        rule: 'operator_first',
        severity: 'warning',
        location: 'content structure',
        found: 'No concrete examples provided',
        suggestion: 'Add specific use case or example (e.g., "For example, when a customer asks about order status...")',
      });
    }
    
    if (!hasOperatorBenefit && content.length > 300) {
      violations.push({
        rule: 'operator_first',
        severity: 'error',
        location: 'content focus',
        found: 'No clear operator benefit',
        suggestion: 'Add operator-focused benefit (e.g., "This saves you 2 hours per day" or "Makes your job easier by...")',
      });
    }
    
    return violations;
  }

  private checkClarity(content: string): Violation[] {
    const violations: Violation[] = [];
    
    // Check sentence length
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    for (const sentence of sentences) {
      const words = sentence.split(/\s+/).length;
      if (words > BrandVoiceRules.clear_not_jargon.readability.max_sentence_length) {
        violations.push({
          rule: 'clear_not_jargon',
          severity: 'warning',
          location: sentence.substring(0, 50) + '...',
          found: `${words} words in sentence`,
          suggestion: `Break into shorter sentences (max ${BrandVoiceRules.clear_not_jargon.readability.max_sentence_length} words)`,
        });
      }
    }
    
    return violations;
  }

  private checkEvidenceBasedClaims(content: string): Violation[] {
    const violations: Violation[] = [];
    const lowerContent = content.toLowerCase();
    
    for (const vagueClaim of BrandVoiceRules.evidence_based.vague_claims_banned) {
      if (lowerContent.includes(vagueClaim.toLowerCase())) {
        violations.push({
          rule: 'evidence_based',
          severity: 'error',
          location: this.findLocation(content, vagueClaim),
          found: vagueClaim,
          suggestion: 'Use specific metrics instead (e.g., "70% faster" not "much faster")',
        });
      }
    }
    
    return violations;
  }

  private calculateScore(violations: Violation[], contentLength: number): number {
    let score = 1.0;
    
    for (const violation of violations) {
      switch (violation.severity) {
        case 'critical':
          score -= 0.3;
          break;
        case 'error':
          score -= 0.1;
          break;
        case 'warning':
          score -= 0.05;
          break;
      }
    }
    
    return Math.max(0, score);
  }

  private generateSuggestions(violations: Violation[]): string[] {
    const suggestions = new Set<string>();
    
    if (violations.some(v => v.rule === 'conversational')) {
      suggestions.add('Use conversational language: "use" not "utilize", "help" not "leverage"');
    }
    
    if (violations.some(v => v.rule === 'enthusiastic_not_pushy')) {
      suggestions.add('Tone down urgency: "give it a try" not "must buy now"');
    }
    
    if (violations.some(v => v.rule === 'operator_first')) {
      suggestions.add('Add specific operator benefit with example: "This saves you 2 hours by..."');
    }
    
    if (violations.some(v => v.rule === 'clear_not_jargon')) {
      suggestions.add('Simplify: shorter sentences, explain technical terms, add examples');
    }
    
    if (violations.some(v => v.rule === 'evidence_based')) {
      suggestions.add('Use specific metrics: "70% faster" not "much faster"');
    }
    
    return Array.from(suggestions);
  }

  private findLocation(content: string, searchTerm: string): string {
    const index = content.toLowerCase().indexOf(searchTerm.toLowerCase());
    if (index === -1) return 'unknown';
    
    const start = Math.max(0, index - 30);
    const end = Math.min(content.length, index + searchTerm.length + 30);
    
    return `"...${content.substring(start, end)}..."`;
  }
}

// ============================================================================
// Auto-Correction System
// ============================================================================

export class BrandVoiceAutoCorrector {
  /**
   * Attempt to automatically fix common brand voice issues
   */
  async autoCorrect(content: string): Promise<{ corrected: string; changes: string[] }> {
    let corrected = content;
    const changes: string[] = [];
    
    // Replace corporate jargon
    for (const [banned, preferred] of Object.entries(BrandVoiceRules.conversational.preferred_alternatives)) {
      const regex = new RegExp(`\\b${banned}\\b`, 'gi');
      if (regex.test(corrected)) {
        corrected = corrected.replace(regex, preferred);
        changes.push(`Replaced "${banned}" with "${preferred}"`);
      }
    }
    
    // Remove excessive exclamation marks
    const exclamations = (corrected.match(/!+/g) || []).length;
    if (exclamations > 5) {
      corrected = corrected.replace(/!+/g, (match, offset, string) => {
        // Keep first 3, remove rest
        const index = (string.substring(0, offset).match(/!/g) || []).length;
        return index < 3 ? match : '.';
      });
      changes.push(`Reduced exclamation marks from ${exclamations} to 3`);
    }
    
    return { corrected, changes };
  }
}

// ============================================================================
// CEO Approval Learning System
// ============================================================================

export interface CEOApprovalPattern {
  original_tone: string;
  ceo_preferred_tone: string;
  edit_type: 'word_choice' | 'structure' | 'tone' | 'technical' | 'other';
  example_before: string;
  example_after: string;
  frequency: number; // How often this pattern appears
  confidence: number; // How confident we are this is a real pattern
}

export class CEOApprovalLearner {
  private patterns: Map<string, CEOApprovalPattern> = new Map();

  /**
   * Learn from CEO edits to improve future generation
   */
  async learnFromApproval(
    originalContent: string,
    ceoEdits: string[] | null,
    approved: boolean,
    contentType: 'blog' | 'social' | 'email'
  ): Promise<void> {
    if (approved && !ceoEdits) {
      // Approved as-is - reinforce this pattern
      this.reinforceSuccessPattern(originalContent, contentType);
      return;
    }

    if (ceoEdits) {
      // CEO made edits - learn the patterns
      const editPatterns = this.analyzeEdits(originalContent, ceoEdits);
      
      for (const pattern of editPatterns) {
        const key = `${pattern.edit_type}_${pattern.original_tone}`;
        const existing = this.patterns.get(key);
        
        if (existing) {
          // Increase frequency and confidence
          existing.frequency += 1;
          existing.confidence = Math.min(1.0, existing.confidence + 0.1);
        } else {
          // New pattern discovered
          this.patterns.set(key, pattern);
        }
      }
      
      // Store patterns for future use
      await this.persistPatterns();
    }

    if (!approved) {
      // Rejected - strongly avoid this pattern
      this.markPatternAsRejected(originalContent, contentType);
    }
  }

  /**
   * Analyze what CEO changed
   */
  private analyzeEdits(original: string, edited: string[]): CEOApprovalPattern[] {
    const patterns: CEOApprovalPattern[] = [];
    
    // This would use diffing logic to identify:
    // - Word choice changes
    // - Tone adjustments  
    // - Structural changes
    // - Technical accuracy fixes
    
    // Simplified example:
    const editedText = edited.join(' ');
    
    // Word choice patterns
    if (original.includes('utilize') && editedText.includes('use')) {
      patterns.push({
        original_tone: 'corporate',
        ceo_preferred_tone: 'conversational',
        edit_type: 'word_choice',
        example_before: 'utilize',
        example_after: 'use',
        frequency: 1,
        confidence: 0.8,
      });
    }
    
    return patterns;
  }

  private reinforceSuccessPattern(content: string, type: string): void {
    // Analyze successful content and reinforce those patterns
    // Store as positive examples for future generation
  }

  private markPatternAsRejected(content: string, type: string): void {
    // Mark this pattern as unsuccessful
    // Avoid generating similar content in future
  }

  private async persistPatterns(): Promise<void> {
    // Save learned patterns to database for persistence
    // Used to improve future content generation
  }

  /**
   * Get high-confidence patterns to apply in generation
   */
  getLearnedPatterns(minConfidence: number = 0.7): CEOApprovalPattern[] {
    return Array.from(this.patterns.values())
      .filter(p => p.confidence >= minConfidence)
      .sort((a, b) => b.frequency - a.frequency);
  }
}

// ============================================================================
// System Prompt Generator (Uses Learned Patterns)
// ============================================================================

export class ContentSystemPromptGenerator {
  constructor(private learner: CEOApprovalLearner) {}

  /**
   * Generate system prompt incorporating CEO-approved patterns
   */
  generatePrompt(contentType: 'blog' | 'social' | 'email'): string {
    const learnedPatterns = this.learner.getLearnedPatterns(0.7);
    
    const basePrompt = `
You are a content generator for HotDash, following Hot Rod AN brand voice.

CRITICAL RULES:
1. Conversational, not corporate (never use: ${BrandVoiceRules.conversational.banned_words.slice(0, 5).join(', ')})
2. Enthusiastic but clear, not pushy (avoid urgency tactics)
3. Operator-first (focus on their benefits with specific examples)
4. Evidence-based (use specific metrics: "70% faster" not "much faster")

LEARNED PATTERNS FROM CEO APPROVALS:
${this.formatLearnedPatterns(learnedPatterns)}

OPERATOR-FIRST EXAMPLES:
- ✅ "This saves you 2 hours per day by handling order lookups automatically"
- ❌ "Our solution provides significant efficiency gains"

- ✅ "Your team handles 3x more tickets without hiring (50 → 150/day)"
- ❌ "Dramatically increases productivity"

TONE EXAMPLES:
- ✅ "Give it a try and see if it helps your team"
- ❌ "Act now to unlock premium features"

- ✅ "Here's how it works: AI drafts, you approve, customer gets fast answer"
- ❌ "Leverage our cutting-edge AI to synergize your support paradigm"
`;

    return basePrompt;
  }

  private formatLearnedPatterns(patterns: CEOApprovalPattern[]): string {
    if (patterns.length === 0) return '(No patterns learned yet - this will improve over time)';
    
    return patterns
      .slice(0, 5) // Top 5 patterns
      .map(p => `- CEO prefers "${p.example_after}" over "${p.example_before}" (confidence: ${Math.round(p.confidence * 100)}%)`)
      .join('\n');
  }
}

// ============================================================================
// Export
// ============================================================================

export const brandVoiceValidator = new BrandVoiceValidator();
export const ceoApprovalLearner = new CEOApprovalLearner();
export const promptGenerator = new ContentSystemPromptGenerator(ceoApprovalLearner);

