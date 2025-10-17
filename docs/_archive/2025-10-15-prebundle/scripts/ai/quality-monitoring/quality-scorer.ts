/**
 * Agent Response Quality Monitoring System
 *
 * Automated quality scoring using BLEU/ROUGE metrics and custom heuristics
 * Real-time quality dashboard for monitoring agent performance
 */

import { z } from "zod";

// Quality Score Schema
export const QualityScoreSchema = z.object({
  score_id: z.string().uuid(),
  timestamp: z.string().datetime(),

  // Response being scored
  response: z.object({
    agent_name: z.string(),
    conversation_id: z.number(),
    response_text: z.string(),
    customer_question: z.string(),
  }),

  // Automated Metrics
  automated_scores: z.object({
    // Linguistic Quality
    bleu_score: z.number().min(0).max(1),
    rouge_l_score: z.number().min(0).max(1),

    // Response Characteristics
    length_score: z.number().min(0).max(1), // Optimal length (150-250 words)
    readability_score: z.number().min(0).max(1), // Flesch reading ease
    tone_score: z.number().min(0).max(1), // Professional/empathetic

    // Policy Compliance
    policy_alignment_score: z.number().min(0).max(1), // Matches policy docs
    citation_quality_score: z.number().min(0).max(1), // Proper source attribution

    // Completeness
    completeness_score: z.number().min(0).max(1), // Answers all aspects
    action_clarity_score: z.number().min(0).max(1), // Clear next steps
  }),

  // Human Review (Optional)
  human_review: z
    .object({
      reviewed: z.boolean(),
      reviewer_id: z.string().optional(),
      review_date: z.string().datetime().optional(),

      factuality: z.number().min(1).max(5).optional(),
      helpfulness: z.number().min(1).max(5).optional(),
      tone: z.number().min(1).max(5).optional(),
      policy_compliance: z.number().min(1).max(5).optional(),

      comments: z.string().optional(),
    })
    .optional(),

  // Overall Score
  overall_score: z.number().min(0).max(1),
  quality_tier: z.enum(["excellent", "good", "fair", "poor"]),

  // Flags
  flags: z.object({
    needs_human_review: z.boolean(),
    policy_violation: z.boolean(),
    low_quality: z.boolean(),
    exemplar: z.boolean(), // High-quality example for training
  }),
});

export type QualityScore = z.infer<typeof QualityScoreSchema>;

/**
 * Quality Scorer Class
 */
export class QualityScorer {
  /**
   * Score a response automatically
   */
  async scoreResponse(params: {
    agentName: string;
    conversationId: number;
    customerQuestion: string;
    agentResponse: string;
    referenceAnswer?: string; // From KB or human
  }): Promise<QualityScore> {
    const automated_scores = {
      bleu_score: this.calculateBLEU(
        params.agentResponse,
        params.referenceAnswer,
      ),
      rouge_l_score: this.calculateROUGEL(
        params.agentResponse,
        params.referenceAnswer,
      ),
      length_score: this.scoreLengthOptimality(params.agentResponse),
      readability_score: this.scoreReadability(params.agentResponse),
      tone_score: this.scoreTone(params.agentResponse),
      policy_alignment_score: this.scorePolicyAlignment(params.agentResponse),
      citation_quality_score: this.scoreCitations(params.agentResponse),
      completeness_score: this.scoreCompleteness(
        params.customerQuestion,
        params.agentResponse,
      ),
      action_clarity_score: this.scoreActionClarity(params.agentResponse),
    };

    // Calculate overall score (weighted average)
    const overall_score = this.calculateOverallScore(automated_scores);

    // Determine quality tier
    const quality_tier = this.determineQualityTier(overall_score);

    // Set flags
    const flags = {
      needs_human_review: overall_score < 0.7 || quality_tier === "poor",
      policy_violation: automated_scores.policy_alignment_score < 0.6,
      low_quality: overall_score < 0.6,
      exemplar: overall_score >= 0.9 && quality_tier === "excellent",
    };

    return {
      score_id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      response: {
        agent_name: params.agentName,
        conversation_id: params.conversationId,
        response_text: params.agentResponse,
        customer_question: params.customerQuestion,
      },
      automated_scores,
      overall_score,
      quality_tier,
      flags,
    };
  }

  /**
   * Calculate BLEU score (reference answer similarity)
   */
  private calculateBLEU(response: string, reference?: string): number {
    if (!reference) return 0.5; // Neutral if no reference

    // Simplified BLEU implementation
    // Production: Use actual BLEU library
    const responseWords = this.tokenize(response);
    const referenceWords = this.tokenize(reference);

    const matches = responseWords.filter((w) =>
      referenceWords.includes(w),
    ).length;
    const precision = matches / responseWords.length;

    return Math.min(1, precision);
  }

  /**
   * Calculate ROUGE-L score (longest common subsequence)
   */
  private calculateROUGEL(response: string, reference?: string): number {
    if (!reference) return 0.5;

    // Simplified ROUGE-L
    // Production: Use actual ROUGE library
    const lcs = this.longestCommonSubsequence(
      this.tokenize(response),
      this.tokenize(reference),
    );

    const recall = lcs / this.tokenize(reference).length;
    const precision = lcs / this.tokenize(response).length;

    const fScore = (2 * precision * recall) / (precision + recall || 1);
    return Math.min(1, fScore);
  }

  /**
   * Score optimal response length (150-250 words)
   */
  private scoreLengthOptimality(response: string): number {
    const wordCount = response.split(/\s+/).length;

    if (wordCount >= 150 && wordCount <= 250) return 1.0; // Perfect
    if (wordCount >= 100 && wordCount < 150) return 0.8; // Slightly short
    if (wordCount > 250 && wordCount <= 300) return 0.8; // Slightly long
    if (wordCount >= 50 && wordCount < 100) return 0.6; // Too short
    if (wordCount > 300 && wordCount <= 400) return 0.6; // Too long
    if (wordCount < 50) return 0.3; // Way too short
    return 0.3; // Way too long
  }

  /**
   * Score readability (Flesch Reading Ease approximation)
   */
  private scoreReadability(response: string): number {
    const sentences = response.split(/[.!?]+/).filter((s) => s.trim()).length;
    const words = response.split(/\s+/).length;
    const syllables = this.estimateSyllables(response);

    // Flesch Reading Ease formula (approximate)
    const avgWordsPerSentence = words / sentences;
    const avgSyllablesPerWord = syllables / words;

    const flesch =
      206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord;

    // Convert to 0-1 score (60-80 is ideal for customer support)
    if (flesch >= 60 && flesch <= 80) return 1.0;
    if (flesch >= 50 && flesch < 60) return 0.8;
    if (flesch >= 40 && flesch < 50) return 0.6;
    return 0.4;
  }

  /**
   * Score professional/empathetic tone
   */
  private scoreTone(response: string): number {
    let score = 0.5; // Baseline

    const lowerResponse = response.toLowerCase();

    // Positive indicators
    const positiveMarkers = [
      "i understand",
      "i apologize",
      "thank you",
      "happy to help",
      "i can help",
      "great question",
      "absolutely",
      "of course",
      "i appreciate",
      "let me",
      "i'll",
    ];

    positiveMarkers.forEach((marker) => {
      if (lowerResponse.includes(marker)) score += 0.05;
    });

    // Negative indicators
    const negativeMarkers = [
      "unfortunately you",
      "you should have",
      "as i said",
      "policy states",
      "you must",
      "you failed to",
    ];

    negativeMarkers.forEach((marker) => {
      if (lowerResponse.includes(marker)) score -= 0.1;
    });

    return Math.max(0, Math.min(1, score));
  }

  /**
   * Score policy alignment
   */
  private scorePolicyAlignment(response: string): number {
    let score = 0.5;

    const lowerResponse = response.toLowerCase();

    // Check for policy-compliant language
    const compliantTerms = [
      "30 days",
      "prepaid label",
      "free return shipping",
      "within 5-7 business days",
      "original tags",
      "unworn",
    ];

    compliantTerms.forEach((term) => {
      if (lowerResponse.includes(term)) score += 0.05;
    });

    // Check for prohibited promises
    const prohibitedPromises = [
      "guarantee",
      "100% refund",
      "definitely",
      "always",
      "never have problems",
      "best price anywhere",
    ];

    prohibitedPromises.forEach((promise) => {
      if (lowerResponse.includes(promise)) score -= 0.15;
    });

    return Math.max(0, Math.min(1, score));
  }

  /**
   * Score citation quality
   */
  private scoreCitations(response: string): number {
    // Check for source attribution
    const hasSources =
      response.includes("according to") ||
      response.includes("our policy") ||
      response.includes("per our") ||
      response.includes("as stated in");

    if (hasSources) return 0.8;

    // Check for specific references
    const hasSpecificRef =
      response.includes("section") ||
      response.includes("page") ||
      response.includes("documentation");

    if (hasSpecificRef) return 1.0;

    return 0.5; // Neutral if no explicit citations
  }

  /**
   * Score how completely question is answered
   */
  private scoreCompleteness(question: string, response: string): number {
    const questionWords = this.extractKeywords(question);
    const responseWords = this.tokenize(response.toLowerCase());

    const addressedKeywords = questionWords.filter((kw) =>
      responseWords.some((rw) => rw.includes(kw) || kw.includes(rw)),
    );

    const completeness = addressedKeywords.length / questionWords.length;

    return Math.min(1, completeness);
  }

  /**
   * Score clarity of next steps/actions
   */
  private scoreActionClarity(response: string): number {
    let score = 0.5;

    const lowerResponse = response.toLowerCase();

    // Check for clear next steps
    const actionIndicators = [
      "step 1",
      "step 2",
      "first",
      "next",
      "then",
      "you can",
      "please",
      "would you like",
      "let me know",
    ];

    actionIndicators.forEach((indicator) => {
      if (lowerResponse.includes(indicator)) score += 0.05;
    });

    // Check for numbered lists or bullets (markdown)
    if (response.match(/^\d+\./m) || response.includes("- ")) {
      score += 0.2;
    }

    return Math.min(1, score);
  }

  /**
   * Calculate weighted overall score
   */
  private calculateOverallScore(
    scores: QualityScore["automated_scores"],
  ): number {
    const weights = {
      bleu_score: 0.15,
      rouge_l_score: 0.15,
      length_score: 0.1,
      readability_score: 0.1,
      tone_score: 0.15,
      policy_alignment_score: 0.15,
      citation_quality_score: 0.05,
      completeness_score: 0.1,
      action_clarity_score: 0.05,
    };

    let overall = 0;
    for (const [metric, weight] of Object.entries(weights)) {
      overall += scores[metric as keyof typeof scores] * weight;
    }

    return overall;
  }

  /**
   * Determine quality tier
   */
  private determineQualityTier(
    score: number,
  ): "excellent" | "good" | "fair" | "poor" {
    if (score >= 0.85) return "excellent";
    if (score >= 0.7) return "good";
    if (score >= 0.55) return "fair";
    return "poor";
  }

  // Helper methods
  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .filter((w) => w.length > 2); // Remove short words
  }

  private extractKeywords(text: string): string[] {
    const stopWords = new Set([
      "the",
      "is",
      "at",
      "which",
      "on",
      "a",
      "an",
      "and",
      "or",
      "but",
    ]);
    return this.tokenize(text).filter((w) => !stopWords.has(w));
  }

  private estimateSyllables(text: string): number {
    // Simplified syllable counter
    const words = text.split(/\s+/);
    return words.reduce((total, word) => {
      const syllableCount = word
        .toLowerCase()
        .replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "")
        .replace(/^y/, "")
        .match(/[aeiouy]{1,2}/g);
      return total + (syllableCount?.length || 1);
    }, 0);
  }

  private longestCommonSubsequence(arr1: string[], arr2: string[]): number {
    const m = arr1.length;
    const n = arr2.length;
    const dp: number[][] = Array(m + 1)
      .fill(0)
      .map(() => Array(n + 1).fill(0));

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (arr1[i - 1] === arr2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        }
      }
    }

    return dp[m][n];
  }
}

/**
 * Real-time Quality Dashboard
 */
export interface QualityDashboard {
  period: {
    start: string;
    end: string;
  };

  metrics: {
    total_responses: number;
    avg_overall_score: number;

    by_tier: {
      excellent: number;
      good: number;
      fair: number;
      poor: number;
    };

    by_agent: Record<
      string,
      {
        count: number;
        avg_score: number;
        approval_rate: number;
      }
    >;

    flags: {
      needs_review: number;
      policy_violations: number;
      low_quality: number;
      exemplars: number;
    };
  };

  alerts: Array<{
    severity: "critical" | "warning" | "info";
    message: string;
    timestamp: string;
  }>;
}

/**
 * Quality Thresholds
 */
export const QUALITY_THRESHOLDS = {
  // Minimum acceptable scores
  minimum: {
    overall: 0.6,
    bleu: 0.3,
    rouge_l: 0.4,
    tone: 0.7,
    policy_alignment: 0.75,
  },

  // Target scores
  target: {
    overall: 0.75,
    bleu: 0.5,
    rouge_l: 0.55,
    tone: 0.85,
    policy_alignment: 0.85,
  },

  // Excellence threshold
  excellent: {
    overall: 0.85,
    bleu: 0.7,
    rouge_l: 0.7,
    tone: 0.9,
    policy_alignment: 0.95,
  },
};

/**
 * Alert Rules
 */
export const ALERT_RULES = [
  {
    name: "low_quality_rate",
    condition: (dashboard: QualityDashboard) =>
      dashboard.metrics.by_tier.poor / dashboard.metrics.total_responses > 0.1,
    severity: "critical" as const,
    message: "Poor quality response rate exceeds 10%",
  },
  {
    name: "policy_violations",
    condition: (dashboard: QualityDashboard) =>
      dashboard.metrics.flags.policy_violations > 5,
    severity: "critical" as const,
    message: "Multiple policy violations detected",
  },
  {
    name: "needs_review_backlog",
    condition: (dashboard: QualityDashboard) =>
      dashboard.metrics.flags.needs_review > 20,
    severity: "warning" as const,
    message: "Large backlog of responses needing human review",
  },
];

// Export singleton
export const qualityScorer = new QualityScorer();
