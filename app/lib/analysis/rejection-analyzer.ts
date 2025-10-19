/**
 * Rejection Analyzer — Understand why drafts fail
 *
 * Analyzes rejected drafts to identify patterns and improvement areas.
 */

import type { CustomerReplyGrading } from "~/agents/customer/grading-schema";

export interface RejectionPattern {
  pattern: string;
  count: number;
  examples: string[];
  avgScores: {
    tone: number;
    accuracy: number;
    policy: number;
  };
  recommendation: string;
}

export interface RejectionAnalysis {
  totalRejections: number;
  patterns: RejectionPattern[];
  topIssues: Array<{
    category: "tone" | "accuracy" | "policy";
    severity: number; // 1-5, lower = more severe
    count: number;
  }>;
  recommendations: string[];
}

/**
 * Categorize rejection by lowest scoring dimension
 */
function categorizeRejection(
  grading: CustomerReplyGrading,
): "tone" | "accuracy" | "policy" {
  const scores = {
    tone: grading.tone,
    accuracy: grading.accuracy,
    policy: grading.policy,
  };

  return Object.entries(scores).sort(([, a], [, b]) => a - b)[0][0] as
    | "tone"
    | "accuracy"
    | "policy";
}

/**
 * Analyze rejected drafts for patterns
 */
export function analyzeRejections(
  rejectedGradings: CustomerReplyGrading[],
): RejectionAnalysis {
  if (rejectedGradings.length === 0) {
    return {
      totalRejections: 0,
      patterns: [],
      topIssues: [],
      recommendations: ["No rejections to analyze"],
    };
  }

  // Categorize by primary issue
  const byCategory = {
    tone: rejectedGradings.filter((g) => categorizeRejection(g) === "tone"),
    accuracy: rejectedGradings.filter(
      (g) => categorizeRejection(g) === "accuracy",
    ),
    policy: rejectedGradings.filter((g) => categorizeRejection(g) === "policy"),
  };

  const topIssues = Object.entries(byCategory)
    .map(([category, items]) => {
      const avgScore =
        items.reduce((sum, i) => sum + i[category as keyof typeof i.tone], 0) /
        items.length;
      return {
        category: category as "tone" | "accuracy" | "policy",
        severity: Math.round(avgScore),
        count: items.length,
      };
    })
    .filter((i) => i.count > 0)
    .sort((a, b) => a.severity - b.severity); // Lowest scores first

  // Generate recommendations
  const recommendations: string[] = [];

  if (byCategory.tone.length > rejectedGradings.length * 0.4) {
    recommendations.push(
      "Tone issues dominant - review brand voice guidelines and update prompts",
    );
  }

  if (byCategory.accuracy.length > rejectedGradings.length * 0.4) {
    recommendations.push(
      "Accuracy issues dominant - update knowledge base with current policies",
    );
  }

  if (byCategory.policy.length > rejectedGradings.length * 0.4) {
    recommendations.push(
      "Policy compliance issues - strengthen policy constraints in agent config",
    );
  }

  if (recommendations.length === 0) {
    recommendations.push(
      "Issues distributed across categories - general quality improvement needed",
    );
  }

  // Identify common patterns (simplified)
  const patterns: RejectionPattern[] = [];

  for (const [category, items] of Object.entries(byCategory)) {
    if (items.length > 0) {
      const avgTone = items.reduce((sum, i) => sum + i.tone, 0) / items.length;
      const avgAccuracy =
        items.reduce((sum, i) => sum + i.accuracy, 0) / items.length;
      const avgPolicy =
        items.reduce((sum, i) => sum + i.policy, 0) / items.length;

      patterns.push({
        pattern: `Low ${category} scores`,
        count: items.length,
        examples: items.slice(0, 3).map((i) => i.draft_reply.substring(0, 100)),
        avgScores: {
          tone: Number(avgTone.toFixed(1)),
          accuracy: Number(avgAccuracy.toFixed(1)),
          policy: Number(avgPolicy.toFixed(1)),
        },
        recommendation: getRecommendationForCategory(
          category as "tone" | "accuracy" | "policy",
        ),
      });
    }
  }

  return {
    totalRejections: rejectedGradings.length,
    patterns,
    topIssues,
    recommendations,
  };
}

function getRecommendationForCategory(
  category: "tone" | "accuracy" | "policy",
): string {
  switch (category) {
    case "tone":
      return "Review examples of brand voice, add tone checking to draft generation";
    case "accuracy":
      return "Update knowledge base articles, verify RAG retrieval quality";
    case "policy":
      return "Add explicit policy constraints to system prompts";
  }
}

/**
 * Generate rejection report
 */
export function generateRejectionReport(analysis: RejectionAnalysis): string {
  const lines = [
    `# Draft Rejection Analysis`,
    ``,
    `**Total Rejections:** ${analysis.totalRejections}`,
    ``,
    `## Top Issues`,
    ``,
  ];

  for (const issue of analysis.topIssues) {
    lines.push(
      `- **${issue.category}**: ${issue.count} rejections (avg score: ${issue.severity}/5)`,
    );
  }

  lines.push(``, `## Patterns Detected`, ``);

  for (const pattern of analysis.patterns) {
    lines.push(`### ${pattern.pattern} (${pattern.count} occurrences)`);
    lines.push(``);
    lines.push(`**Average Scores:**`);
    lines.push(`- Tone: ${pattern.avgScores.tone}`);
    lines.push(`- Accuracy: ${pattern.avgScores.accuracy}`);
    lines.push(`- Policy: ${pattern.avgScores.policy}`);
    lines.push(``);
    lines.push(`**Recommendation:** ${pattern.recommendation}`);
    lines.push(``);
  }

  lines.push(`## Recommended Actions`, ``);

  for (const rec of analysis.recommendations) {
    lines.push(`- ${rec}`);
  }

  return lines.join("\n");
}
