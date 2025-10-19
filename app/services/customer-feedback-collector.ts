/**
 * Customer Feedback Collector — Learn from post-send reactions
 *
 * Collects customer feedback after replies are sent:
 * - Follow-up satisfaction ratings
 * - Additional questions (indicates incomplete answer)
 * - Resolution time
 * - Customer sentiment changes
 */

export interface CustomerFeedback {
  conversationId: string;
  replyId: string;

  // Explicit feedback
  satisfactionRating?: number; // 1-5 if customer rates reply
  followUpQuestions: number; // Count of customer messages after reply

  // Implicit signals
  conversationResolved: boolean;
  resolutionTimeMinutes?: number; // Time from reply to resolution
  sentimentBefore: "positive" | "neutral" | "negative";
  sentimentAfter: "positive" | "neutral" | "negative";

  // Context
  wasDrafted: boolean; // Was this an AI-drafted reply?
  draftQuality?: { tone: number; accuracy: number; policy: number };

  collectedAt: string;
}

export interface FeedbackInsights {
  totalFeedback: number;
  avgSatisfaction: number;
  resolutionRate: number; // % of conversations resolved
  avgResolutionTime: number; // minutes
  sentimentImproved: number; // count where sentiment got better
  sentimentWorsened: number; // count where sentiment got worse
  qualityCorrelation: {
    highQualityResolutionRate: number; // resolution rate for quality ≥4.5
    lowQualityResolutionRate: number; // resolution rate for quality <4.0
  };
}

/**
 * Collect feedback for a reply
 */
export function collectFeedback(
  conversationId: string,
  replyId: string,
  conversationData: {
    followUpCount: number;
    resolved: boolean;
    resolutionTime?: number;
    sentimentBefore: "positive" | "neutral" | "negative";
    sentimentAfter: "positive" | "neutral" | "negative";
  },
  draftData?: {
    wasDrafted: boolean;
    quality?: { tone: number; accuracy: number; policy: number };
  },
): CustomerFeedback {
  return {
    conversationId,
    replyId,
    followUpQuestions: conversationData.followUpCount,
    conversationResolved: conversationData.resolved,
    resolutionTimeMinutes: conversationData.resolutionTime,
    sentimentBefore: conversationData.sentimentBefore,
    sentimentAfter: conversationData.sentimentAfter,
    wasDrafted: draftData?.wasDrafted || false,
    draftQuality: draftData?.quality,
    collectedAt: new Date().toISOString(),
  };
}

/**
 * Analyze customer feedback for insights
 */
export function analyzeFeedback(
  feedbackRecords: CustomerFeedback[],
): FeedbackInsights {
  if (feedbackRecords.length === 0) {
    return {
      totalFeedback: 0,
      avgSatisfaction: 0,
      resolutionRate: 0,
      avgResolutionTime: 0,
      sentimentImproved: 0,
      sentimentWorsened: 0,
      qualityCorrelation: {
        highQualityResolutionRate: 0,
        lowQualityResolutionRate: 0,
      },
    };
  }

  // Satisfaction
  const withRating = feedbackRecords.filter(
    (f) => f.satisfactionRating !== undefined,
  );
  const avgSatisfaction =
    withRating.length > 0
      ? withRating.reduce((sum, f) => sum + (f.satisfactionRating || 0), 0) /
        withRating.length
      : 0;

  // Resolution rate
  const resolved = feedbackRecords.filter((f) => f.conversationResolved);
  const resolutionRate = resolved.length / feedbackRecords.length;

  // Resolution time
  const withResolutionTime = feedbackRecords.filter(
    (f) => f.resolutionTimeMinutes !== undefined,
  );
  const avgResolutionTime =
    withResolutionTime.length > 0
      ? withResolutionTime.reduce(
          (sum, f) => sum + (f.resolutionTimeMinutes || 0),
          0,
        ) / withResolutionTime.length
      : 0;

  // Sentiment changes
  const sentimentValues = { positive: 1, neutral: 0, negative: -1 };
  const sentimentImproved = feedbackRecords.filter(
    (f) =>
      sentimentValues[f.sentimentAfter] > sentimentValues[f.sentimentBefore],
  ).length;
  const sentimentWorsened = feedbackRecords.filter(
    (f) =>
      sentimentValues[f.sentimentAfter] < sentimentValues[f.sentimentBefore],
  ).length;

  // Quality correlation
  const highQualityReplies = feedbackRecords.filter((f) => {
    if (!f.draftQuality) return false;
    const avgQuality =
      (f.draftQuality.tone + f.draftQuality.accuracy + f.draftQuality.policy) /
      3;
    return avgQuality >= 4.5;
  });

  const lowQualityReplies = feedbackRecords.filter((f) => {
    if (!f.draftQuality) return false;
    const avgQuality =
      (f.draftQuality.tone + f.draftQuality.accuracy + f.draftQuality.policy) /
      3;
    return avgQuality < 4.0;
  });

  const highQualityResolved = highQualityReplies.filter(
    (f) => f.conversationResolved,
  ).length;
  const lowQualityResolved = lowQualityReplies.filter(
    (f) => f.conversationResolved,
  ).length;

  return {
    totalFeedback: feedbackRecords.length,
    avgSatisfaction: Number(avgSatisfaction.toFixed(2)),
    resolutionRate: Number((resolutionRate * 100).toFixed(1)),
    avgResolutionTime: Number(avgResolutionTime.toFixed(1)),
    sentimentImproved,
    sentimentWorsened,
    qualityCorrelation: {
      highQualityResolutionRate:
        highQualityReplies.length > 0
          ? Number(
              ((highQualityResolved / highQualityReplies.length) * 100).toFixed(
                1,
              ),
            )
          : 0,
      lowQualityResolutionRate:
        lowQualityReplies.length > 0
          ? Number(
              ((lowQualityResolved / lowQualityReplies.length) * 100).toFixed(
                1,
              ),
            )
          : 0,
    },
  };
}

/**
 * Identify improvement opportunities from feedback
 */
export function identifyImprovements(insights: FeedbackInsights): string[] {
  const improvements: string[] = [];

  if (insights.resolutionRate < 0.8) {
    improvements.push(
      `Low resolution rate (${insights.resolutionRate}%) - review for incomplete answers`,
    );
  }

  if (insights.sentimentWorsened > insights.sentimentImproved) {
    improvements.push(
      "Sentiment declining after replies - review tone and accuracy",
    );
  }

  if (insights.qualityCorrelation.highQualityResolutionRate < 85) {
    improvements.push(
      "Even high-quality drafts not resolving conversations - check for completeness",
    );
  }

  const qualityGap =
    insights.qualityCorrelation.highQualityResolutionRate -
    insights.qualityCorrelation.lowQualityResolutionRate;

  if (qualityGap < 20) {
    improvements.push(
      "Quality scores not correlating with resolution - review grading criteria",
    );
  }

  if (improvements.length === 0) {
    improvements.push("Feedback signals look healthy - continue monitoring");
  }

  return improvements;
}
