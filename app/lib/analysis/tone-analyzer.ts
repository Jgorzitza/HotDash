/**
 * Tone Analyzer — Pre-grade tone before human review
 *
 * Analyzes draft reply tone to catch issues early.
 * Checks for: friendliness, professionalism, brand voice alignment.
 */

export interface ToneAnalysis {
  score: number; // 1-5 predicted score
  confidence: number; // 0-1 confidence in prediction
  issues: ToneIssue[];
  suggestions: string[];
  passesThreshold: boolean; // >= 4.0
}

export interface ToneIssue {
  type:
    | "too_formal"
    | "too_casual"
    | "negative"
    | "unclear"
    | "jargon"
    | "lengthy";
  severity: "low" | "medium" | "high";
  description: string;
  location?: string; // Sentence or phrase
}

/**
 * Brand voice rules for Hot Rod AN
 */
const BRAND_VOICE_RULES = {
  targetTone: "friendly_professional",
  avoidPhrases: [
    "unfortunately",
    "sorry for the inconvenience",
    "as per our policy",
    "please be advised",
    "kindly",
  ],
  preferPhrases: [
    "thanks for reaching out",
    "happy to help",
    "here's what",
    "let me help",
    "I'll take care of that",
  ],
  maxLength: 300, // characters
  readabilityLevel: "conversational", // 8th grade reading level
};

/**
 * Analyze draft reply tone
 */
export function analyzeTone(draftReply: string): ToneAnalysis {
  const issues: ToneIssue[] = [];
  const suggestions: string[] = [];

  // Check length
  if (draftReply.length > BRAND_VOICE_RULES.maxLength) {
    issues.push({
      type: "lengthy",
      severity: "medium",
      description: `Reply is ${draftReply.length} characters (target: ≤${BRAND_VOICE_RULES.maxLength})`,
    });
    suggestions.push("Shorten reply to be more concise");
  }

  // Check for overly formal language
  const formalPhrases = BRAND_VOICE_RULES.avoidPhrases.filter((phrase) =>
    draftReply.toLowerCase().includes(phrase.toLowerCase()),
  );

  if (formalPhrases.length > 0) {
    issues.push({
      type: "too_formal",
      severity: "medium",
      description: `Contains formal phrases: ${formalPhrases.join(", ")}`,
      location: formalPhrases[0],
    });
    suggestions.push("Use more conversational language");
  }

  // Check for preferred friendly phrases
  const friendlyPhrases = BRAND_VOICE_RULES.preferPhrases.filter((phrase) =>
    draftReply.toLowerCase().includes(phrase.toLowerCase()),
  );

  if (friendlyPhrases.length === 0 && draftReply.length > 50) {
    suggestions.push("Consider adding a friendly greeting or closing");
  }

  // Check for negative tone indicators
  const negativeWords = [
    "can't",
    "won't",
    "unable",
    "impossible",
    "unfortunately",
  ];
  const hasNegative = negativeWords.some((word) =>
    draftReply.toLowerCase().includes(word),
  );

  if (hasNegative) {
    issues.push({
      type: "negative",
      severity: "high",
      description: "Contains negative language",
    });
    suggestions.push(
      "Reframe negatives positively (e.g., 'what we can do' instead of 'what we can't')",
    );
  }

  // Check for jargon
  const jargonTerms = [
    "utilize",
    "leverage",
    "facilitate",
    "optimize",
    "synergy",
  ];
  const hasJargon = jargonTerms.some((term) =>
    draftReply.toLowerCase().includes(term),
  );

  if (hasJargon) {
    issues.push({
      type: "jargon",
      severity: "low",
      description: "Contains business jargon",
    });
    suggestions.push("Use simpler, everyday language");
  }

  // Calculate score (simple heuristic)
  let score = 5.0;

  // Deduct for issues
  for (const issue of issues) {
    if (issue.severity === "high") score -= 1.0;
    else if (issue.severity === "medium") score -= 0.5;
    else score -= 0.25;
  }

  // Bonus for friendly phrases
  score += Math.min(1.0, friendlyPhrases.length * 0.3);

  // Clamp to 1-5 range
  score = Math.max(1, Math.min(5, score));

  // Confidence based on analysis depth
  const confidence = Math.min(0.8, 0.5 + issues.length * 0.1);

  return {
    score: Number(score.toFixed(1)),
    confidence: Number(confidence.toFixed(2)),
    issues,
    suggestions,
    passesThreshold: score >= 4.0,
  };
}

/**
 * Get tone feedback message for reviewers
 */
export function getToneFeedback(analysis: ToneAnalysis): string {
  if (analysis.passesThreshold && analysis.issues.length === 0) {
    return "✓ Tone looks good! Friendly and professional.";
  }

  const lines = ["Tone Analysis:"];

  if (analysis.score < 4.0) {
    lines.push(`⚠ Score: ${analysis.score}/5.0 (Below 4.0 threshold)`);
  } else {
    lines.push(`Score: ${analysis.score}/5.0`);
  }

  if (analysis.issues.length > 0) {
    lines.push("\nIssues:");
    for (const issue of analysis.issues) {
      lines.push(`• ${issue.description}`);
    }
  }

  if (analysis.suggestions.length > 0) {
    lines.push("\nSuggestions:");
    for (const suggestion of analysis.suggestions) {
      lines.push(`• ${suggestion}`);
    }
  }

  return lines.join("\n");
}

/**
 * Suggest tone improvements
 */
export function suggestToneImprovements(
  draftReply: string,
  analysis: ToneAnalysis,
): string[] {
  const improvements: string[] = [];

  // Start with existing suggestions
  improvements.push(...analysis.suggestions);

  // Add specific improvements based on content
  if (!draftReply.toLowerCase().includes("thank")) {
    improvements.push("Add 'Thanks for reaching out!' or similar greeting");
  }

  if (!draftReply.includes("!") && draftReply.length > 20) {
    improvements.push("Consider adding an exclamation point for friendliness");
  }

  if (draftReply.split(".").length > 5) {
    improvements.push("Consider breaking into shorter, punchier sentences");
  }

  return improvements;
}

/**
 * Format tone analysis for Private Note
 */
export function formatToneAnalysisForNote(analysis: ToneAnalysis): string {
  const status = analysis.passesThreshold ? "✓ PASS" : "⚠ NEEDS REVIEW";
  const lines = [
    `**Tone Analysis: ${status}**`,
    `Score: ${analysis.score}/5.0 (${(analysis.confidence * 100).toFixed(0)}% confidence)`,
  ];

  if (analysis.issues.length > 0) {
    lines.push("\n**Issues:**");
    for (const issue of analysis.issues) {
      lines.push(`- ${issue.description}`);
    }
  }

  if (analysis.suggestions.length > 0) {
    lines.push("\n**Suggestions:**");
    for (const suggestion of analysis.suggestions) {
      lines.push(`- ${suggestion}`);
    }
  }

  return lines.join("\n");
}
