/**
 * Customer Sentiment Detector — Route high-urgency conversations
 *
 * Detects customer sentiment to prioritize urgent/negative conversations.
 * Used for queue prioritization and escalation.
 */

export type Sentiment =
  | "very_positive"
  | "positive"
  | "neutral"
  | "negative"
  | "very_negative";

export interface SentimentAnalysis {
  sentiment: Sentiment;
  score: number; // -1 to 1 (negative to positive)
  confidence: number; // 0-1
  urgency: "low" | "medium" | "high" | "critical";
  indicators: string[]; // Words/phrases that influenced detection
}

/**
 * Sentiment keywords
 */
const SENTIMENT_KEYWORDS = {
  veryPositive: [
    "excellent",
    "amazing",
    "perfect",
    "love",
    "fantastic",
    "outstanding",
  ],
  positive: ["good", "great", "thanks", "helpful", "appreciate", "happy"],
  negative: [
    "disappointed",
    "unhappy",
    "problem",
    "issue",
    "concerned",
    "worried",
  ],
  veryNegative: [
    "terrible",
    "awful",
    "worst",
    "angry",
    "furious",
    "unacceptable",
    "scam",
  ],
  urgent: ["urgent", "asap", "immediately", "emergency", "critical", "now"],
};

/**
 * Detect sentiment from message content
 */
export function detectSentiment(messageContent: string): SentimentAnalysis {
  const lowerContent = messageContent.toLowerCase();
  const indicators: string[] = [];
  let score = 0;

  // Check for very negative keywords
  for (const keyword of SENTIMENT_KEYWORDS.veryNegative) {
    if (lowerContent.includes(keyword)) {
      score -= 2;
      indicators.push(keyword);
    }
  }

  // Check for negative keywords
  for (const keyword of SENTIMENT_KEYWORDS.negative) {
    if (lowerContent.includes(keyword)) {
      score -= 1;
      indicators.push(keyword);
    }
  }

  // Check for positive keywords
  for (const keyword of SENTIMENT_KEYWORDS.positive) {
    if (lowerContent.includes(keyword)) {
      score += 1;
      indicators.push(keyword);
    }
  }

  // Check for very positive keywords
  for (const keyword of SENTIMENT_KEYWORDS.veryPositive) {
    if (lowerContent.includes(keyword)) {
      score += 2;
      indicators.push(keyword);
    }
  }

  // Check for urgency markers
  const hasUrgency = SENTIMENT_KEYWORDS.urgent.some((k) =>
    lowerContent.includes(k),
  );

  // Normalize score to -1 to 1 range
  const normalizedScore = Math.max(-1, Math.min(1, score / 5));

  // Determine sentiment category
  let sentiment: Sentiment = "neutral";
  if (normalizedScore <= -0.6) sentiment = "very_negative";
  else if (normalizedScore <= -0.2) sentiment = "negative";
  else if (normalizedScore >= 0.6) sentiment = "very_positive";
  else if (normalizedScore >= 0.2) sentiment = "positive";

  // Determine urgency
  let urgency: SentimentAnalysis["urgency"] = "low";
  if (
    hasUrgency &&
    (sentiment === "very_negative" || sentiment === "negative")
  ) {
    urgency = "critical";
  } else if (sentiment === "very_negative") {
    urgency = "high";
  } else if (sentiment === "negative" || hasUrgency) {
    urgency = "medium";
  }

  // Confidence based on number of indicators
  const confidence = Math.min(0.9, 0.3 + indicators.length * 0.1);

  return {
    sentiment,
    score: Number(normalizedScore.toFixed(2)),
    confidence: Number(confidence.toFixed(2)),
    urgency,
    indicators,
  };
}

/**
 * Analyze sentiment across full conversation
 */
export function analyzeConversationSentiment(
  messages: string[],
): SentimentAnalysis {
  const customerMessages = messages.filter((m) =>
    m.toLowerCase().startsWith("[customer]"),
  );

  if (customerMessages.length === 0) {
    return {
      sentiment: "neutral",
      score: 0,
      confidence: 0,
      urgency: "low",
      indicators: [],
    };
  }

  // Analyze all customer messages
  const analyses = customerMessages.map((msg) => {
    const content = msg.replace(/^\[customer\]\s*/i, "");
    return detectSentiment(content);
  });

  // Weight recent messages more heavily
  const weights = analyses.map((_, idx) => Math.pow(1.5, idx)); // Exponential weighting
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);

  const weightedScore = analyses.reduce((sum, analysis, idx) => {
    return sum + analysis.score * (weights[idx] / totalWeight);
  }, 0);

  const avgConfidence =
    analyses.reduce((sum, a) => sum + a.confidence, 0) / analyses.length;

  // Determine overall sentiment
  let sentiment: Sentiment = "neutral";
  if (weightedScore <= -0.6) sentiment = "very_negative";
  else if (weightedScore <= -0.2) sentiment = "negative";
  else if (weightedScore >= 0.6) sentiment = "very_positive";
  else if (weightedScore >= 0.2) sentiment = "positive";

  // Collect all indicators
  const allIndicators = analyses.flatMap((a) => a.indicators);

  // Determine urgency (most urgent from any message)
  const maxUrgency = analyses.reduce(
    (max, a) => {
      const urgencyValues = { low: 0, medium: 1, high: 2, critical: 3 };
      return urgencyValues[a.urgency] > urgencyValues[max] ? a.urgency : max;
    },
    "low" as SentimentAnalysis["urgency"],
  );

  return {
    sentiment,
    score: Number(weightedScore.toFixed(2)),
    confidence: Number(avgConfidence.toFixed(2)),
    urgency: maxUrgency,
    indicators: [...new Set(allIndicators)], // Deduplicate
  };
}

/**
 * Check if conversation needs escalation based on sentiment
 */
export function needsEscalation(sentiment: SentimentAnalysis): boolean {
  return (
    sentiment.urgency === "critical" ||
    (sentiment.urgency === "high" && sentiment.sentiment === "very_negative")
  );
}

/**
 * Format sentiment for display
 */
export function formatSentimentDisplay(sentiment: SentimentAnalysis): {
  emoji: string;
  label: string;
  color: string;
} {
  switch (sentiment.sentiment) {
    case "very_positive":
      return { emoji: "😊", label: "Very Positive", color: "#22C55E" };
    case "positive":
      return { emoji: "🙂", label: "Positive", color: "#86EFAC" };
    case "neutral":
      return { emoji: "😐", label: "Neutral", color: "#94A3B8" };
    case "negative":
      return { emoji: "😟", label: "Negative", color: "#FB923C" };
    case "very_negative":
      return { emoji: "😠", label: "Very Negative", color: "#EF4444" };
  }
}
