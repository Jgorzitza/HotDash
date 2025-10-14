import { logger } from "../../utils/logger.server";

export type SentimentScore = "positive" | "neutral" | "negative";

export interface SentimentAnalysis {
  conversationId: number;
  messageId: number;
  sentiment: SentimentScore;
  confidence: number;
  keywords: string[];
  escalationRecommended: boolean;
}

export interface SentimentTrend {
  conversationId: number;
  timeRange: { start: Date; end: Date };
  sentimentHistory: Array<{
    timestamp: Date;
    sentiment: SentimentScore;
  }>;
  trending: "improving" | "stable" | "declining";
  alertRequired: boolean;
}

const POSITIVE_KEYWORDS = [
  "thank",
  "thanks",
  "appreciate",
  "great",
  "excellent",
  "perfect",
  "awesome",
  "love",
  "helpful",
  "satisfied",
  "happy",
];

const NEGATIVE_KEYWORDS = [
  "terrible",
  "worst",
  "horrible",
  "awful",
  "angry",
  "furious",
  "disappointed",
  "frustrated",
  "unacceptable",
  "ridiculous",
  "useless",
  "waste",
  "never again",
  "lawsuit",
  "lawyer",
  "attorney",
  "sue",
];

const URGENCY_KEYWORDS = [
  "urgent",
  "emergency",
  "asap",
  "immediately",
  "now",
  "today",
];

/**
 * Sentiment Analysis Pipeline
 * 
 * Analyzes customer messages for sentiment and triggers alerts
 */
export class SentimentAnalyzer {
  /**
   * Analyze sentiment of a single message
   */
  analyzeMessage(
    conversationId: number,
    messageId: number,
    messageContent: string
  ): SentimentAnalysis {
    const normalized = messageContent.toLowerCase();
    
    // Count positive and negative keywords
    const positiveMatches = POSITIVE_KEYWORDS.filter((keyword) =>
      normalized.includes(keyword)
    );
    const negativeMatches = NEGATIVE_KEYWORDS.filter((keyword) =>
      normalized.includes(keyword)
    );

    // Determine sentiment
    let sentiment: SentimentScore;
    let confidence: number;

    if (negativeMatches.length > positiveMatches.length) {
      sentiment = "negative";
      confidence = Math.min(0.9, negativeMatches.length * 0.3);
    } else if (positiveMatches.length > negativeMatches.length) {
      sentiment = "positive";
      confidence = Math.min(0.9, positiveMatches.length * 0.3);
    } else {
      sentiment = "neutral";
      confidence = 0.5;
    }

    // Check for urgency keywords
    const hasUrgency = URGENCY_KEYWORDS.some((keyword) =>
      normalized.includes(keyword)
    );

    // Recommend escalation if negative or urgent
    const escalationRecommended =
      sentiment === "negative" ||
      (hasUrgency && negativeMatches.length > 0);

    const analysis: SentimentAnalysis = {
      conversationId,
      messageId,
      sentiment,
      confidence,
      keywords: [...positiveMatches, ...negativeMatches],
      escalationRecommended,
    };

    logger.debug("Sentiment analyzed", {
      conversationId,
      messageId,
      ...analysis,
    });

    return analysis;
  }

  /**
   * Analyze sentiment trend for a conversation
   */
  async analyzeTrend(
    conversationId: number,
    messages: Array<{ id: number; content: string; createdAt: Date }>
  ): Promise<SentimentTrend> {
    logger.debug("Analyzing sentiment trend", {
      conversationId,
      messageCount: messages.length,
    });

    // Analyze each message
    const sentimentHistory = messages.map((msg) => {
      const analysis = this.analyzeMessage(conversationId, msg.id, msg.content);
      return {
        timestamp: msg.createdAt,
        sentiment: analysis.sentiment,
      };
    });

    // Determine trend
    const recentSentiments = sentimentHistory.slice(-3);
    const negativeCount = recentSentiments.filter(
      (s) => s.sentiment === "negative"
    ).length;

    let trending: "improving" | "stable" | "declining";
    if (negativeCount === 0) {
      trending = "improving";
    } else if (negativeCount >= 2) {
      trending = "declining";
    } else {
      trending = "stable";
    }

    // Alert if declining or consistently negative
    const alertRequired = trending === "declining" || negativeCount >= 2;

    const trend: SentimentTrend = {
      conversationId,
      timeRange: {
        start: messages[0]?.createdAt || new Date(),
        end: messages[messages.length - 1]?.createdAt || new Date(),
      },
      sentimentHistory,
      trending,
      alertRequired,
    };

    if (alertRequired) {
      logger.warn("Sentiment trend alert", {
        conversationId,
        trending,
        negativeCount,
      });
    }

    return trend;
  }

  /**
   * Generate proactive outreach recommendation
   */
  async recommendProactiveOutreach(
    conversationId: number,
    sentimentTrend: SentimentTrend
  ): Promise<{
    recommend: boolean;
    reason: string;
    suggestedAction: string;
  }> {
    // Recommend outreach if sentiment is declining
    if (sentimentTrend.trending === "declining") {
      return {
        recommend: true,
        reason: "Customer sentiment declining - proactive intervention needed",
        suggestedAction: "Senior operator reaches out with empathy and solution focus",
      };
    }

    // Recommend outreach if consistently negative
    const recentNegative = sentimentTrend.sentimentHistory
      .slice(-3)
      .filter((s) => s.sentiment === "negative").length;

    if (recentNegative >= 2) {
      return {
        recommend: true,
        reason: "Consistently negative sentiment - customer frustration evident",
        suggestedAction: "Manager or senior operator engages with personalized attention",
      };
    }

    return {
      recommend: false,
      reason: "Sentiment stable or improving",
      suggestedAction: "Continue normal support workflow",
    };
  }
}

// Singleton instance
let sentimentAnalyzerInstance: SentimentAnalyzer | null = null;

/**
 * Get sentiment analyzer instance
 */
export function getSentimentAnalyzer(): SentimentAnalyzer {
  if (!sentimentAnalyzerInstance) {
    sentimentAnalyzerInstance = new SentimentAnalyzer();
  }
  return sentimentAnalyzerInstance;
}

/**
 * Analyze message sentiment
 */
export function analyzeMessageSentiment(
  conversationId: number,
  messageId: number,
  messageContent: string
): SentimentAnalysis {
  const analyzer = getSentimentAnalyzer();
  return analyzer.analyzeMessage(conversationId, messageId, messageContent);
}

/**
 * Analyze conversation sentiment trend
 */
export async function analyzeConversationTrend(
  conversationId: number,
  messages: Array<{ id: number; content: string; createdAt: Date }>
): Promise<SentimentTrend> {
  const analyzer = getSentimentAnalyzer();
  return analyzer.analyzeTrend(conversationId, messages);
}

