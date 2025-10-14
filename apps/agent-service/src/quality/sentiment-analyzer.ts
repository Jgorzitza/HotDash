/**
 * Customer Sentiment Analysis
 * 
 * Real-time sentiment detection for customer messages.
 * Alerts on negative sentiment, prioritizes angry customers.
 * 
 * Direction Reference: docs/directions/chatwoot.md Task 4
 */

export interface SentimentAnalysis {
  sentiment: 'positive' | 'neutral' | 'negative';
  score: number; // -1.0 to 1.0
  confidence: number; // 0.0 to 1.0
  urgency: 'low' | 'medium' | 'high' | 'urgent';
  emotions: string[]; // e.g., ['frustrated', 'angry', 'disappointed']
  triggers: string[]; // Keywords that influenced sentiment
  shouldEscalate: boolean;
  metadata?: Record<string, any>;
}

/**
 * Analyzes sentiment of customer messages
 */
export class SentimentAnalyzer {
  // Negative sentiment indicators
  private negativeKeywords = [
    'disappointed', 'frustrat', 'angry', 'upset', 'unacceptable',
    'terrible', 'horrible', 'worst', 'awful', 'disgusting',
    'pathetic', 'ridiculous', 'useless', 'incompetent', 'unprofessional',
    'never again', 'demand', 'refund', 'money back', 'lawyer',
    'legal action', 'sue', 'complain', 'complaint', 'bbb',
    'scam', 'fraud', 'rip off', 'ripped off', 'steal', 'theft',
  ];

  // Positive sentiment indicators
  private positiveKeywords = [
    'thank', 'thanks', 'appreciate', 'grateful', 'wonderful',
    'excellent', 'great', 'amazing', 'love', 'perfect',
    'helpful', 'fast', 'quick', 'easy', 'satisfied',
    'happy', 'pleased', 'fantastic', 'outstanding', 'impressed',
  ];

  // Urgency indicators
  private urgentKeywords = [
    'urgent', 'emergency', 'asap', 'immediately', 'now',
    'today', 'right now', 'critical', 'important',
  ];

  // Emotion indicators
  private emotionMap: Record<string, string[]> = {
    frustrated: ['frustrat', 'annoyed', 'irritated'],
    angry: ['angry', 'furious', 'outraged', 'livid'],
    disappointed: ['disappoint', 'let down', 'expected better'],
    worried: ['worried', 'concerned', 'anxious', 'nervous'],
    confused: ['confused', 'don\'t understand', 'unclear', 'what does'],
    happy: ['happy', 'pleased', 'delighted', 'thrilled'],
    satisfied: ['satisfied', 'content', 'good', 'fine'],
  };

  /**
   * Analyze sentiment of message
   */
  analyze(message: string): SentimentAnalysis {
    const lower = message.toLowerCase();
    const words = lower.split(/\s+/);

    // Count sentiment indicators
    let positiveCount = 0;
    let negativeCount = 0;
    const triggers: string[] = [];

    for (const keyword of this.positiveKeywords) {
      if (lower.includes(keyword)) {
        positiveCount++;
        triggers.push(`+${keyword}`);
      }
    }

    for (const keyword of this.negativeKeywords) {
      if (lower.includes(keyword)) {
        negativeCount++;
        triggers.push(`-${keyword}`);
      }
    }

    // Detect emotions
    const emotions: string[] = [];
    for (const [emotion, keywords] of Object.entries(this.emotionMap)) {
      for (const keyword of keywords) {
        if (lower.includes(keyword)) {
          emotions.push(emotion);
          break;
        }
      }
    }

    // Calculate sentiment score (-1.0 to 1.0)
    const totalIndicators = positiveCount + negativeCount;
    let score = 0;
    
    if (totalIndicators > 0) {
      score = (positiveCount - negativeCount) / totalIndicators;
    }

    // Adjust for ALL CAPS (indicates shouting/anger)
    const capsRatio = (message.match(/[A-Z]/g) || []).length / message.length;
    if (capsRatio > 0.5) {
      score -= 0.3; // More negative if shouting
      emotions.push('shouting');
    }

    // Adjust for exclamation marks (indicates urgency/emotion)
    const exclamations = (message.match(/!/g) || []).length;
    if (exclamations > 2) {
      score -= 0.1 * Math.min(exclamations - 2, 3); // Cap adjustment
      emotions.push('heightened_emotion');
    }

    // Determine sentiment category
    let sentiment: 'positive' | 'neutral' | 'negative';
    if (score > 0.2) {
      sentiment = 'positive';
    } else if (score < -0.2) {
      sentiment = 'negative';
    } else {
      sentiment = 'neutral';
    }

    // Detect urgency
    let urgency: 'low' | 'medium' | 'high' | 'urgent' = 'medium';
    
    const hasUrgentKeywords = this.urgentKeywords.some(k => lower.includes(k));
    const hasLegalThreats = ['lawyer', 'legal', 'sue', 'lawsuit'].some(k => lower.includes(k));
    
    if (hasLegalThreats || (sentiment === 'negative' && score < -0.7)) {
      urgency = 'urgent';
    } else if (hasUrgentKeywords || (sentiment === 'negative' && score < -0.4)) {
      urgency = 'high';
    } else if (sentiment === 'positive') {
      urgency = 'low';
    }

    // Should escalate to human?
    const shouldEscalate = 
      urgency === 'urgent' ||
      (sentiment === 'negative' && score < -0.5) ||
      hasLegalThreats;

    // Calculate confidence based on trigger count
    const confidence = Math.min(1.0, totalIndicators / 5); // More indicators = higher confidence

    return {
      sentiment,
      score,
      confidence,
      urgency,
      emotions: [...new Set(emotions)], // Remove duplicates
      triggers,
      shouldEscalate,
      metadata: {
        positiveCount,
        negativeCount,
        capsRatio: capsRatio.toFixed(2),
        exclamationCount: exclamations,
      },
    };
  }

  /**
   * Get alert message for negative sentiment
   */
  getAlertMessage(analysis: SentimentAnalysis, conversationId: number): string | null {
    if (!analysis.shouldEscalate) {
      return null;
    }

    const parts: string[] = [
      `🚨 Escalation Alert - Conversation ${conversationId}`,
      `Sentiment: ${analysis.sentiment} (${analysis.score.toFixed(2)})`,
      `Urgency: ${analysis.urgency.toUpperCase()}`,
    ];

    if (analysis.emotions.length > 0) {
      parts.push(`Emotions: ${analysis.emotions.join(', ')}`);
    }

    if (analysis.triggers.length > 0) {
      parts.push(`Triggers: ${analysis.triggers.slice(0, 5).join(', ')}`);
    }

    return parts.join('\n');
  }

  /**
   * Track sentiment trends over time
   */
  private sentimentHistory: { conversationId: number; sentiment: SentimentAnalysis; timestamp: Date }[] = [];

  trackSentiment(conversationId: number, analysis: SentimentAnalysis): void {
    this.sentimentHistory.push({
      conversationId,
      sentiment: analysis,
      timestamp: new Date(),
    });

    // Keep only last 24 hours
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    this.sentimentHistory = this.sentimentHistory.filter(
      entry => entry.timestamp.getTime() > oneDayAgo
    );

    console.log('[Sentiment] Analyzed:', {
      conversationId,
      sentiment: analysis.sentiment,
      score: analysis.score.toFixed(2),
      urgency: analysis.urgency,
      shouldEscalate: analysis.shouldEscalate,
    });
  }

  /**
   * Get sentiment trend statistics
   */
  getTrends() {
    const last24h = this.sentimentHistory;
    
    if (last24h.length === 0) {
      return {
        total: 0,
        positive: 0,
        neutral: 0,
        negative: 0,
        avgScore: 0,
        escalations: 0,
      };
    }

    const positive = last24h.filter(e => e.sentiment.sentiment === 'positive').length;
    const neutral = last24h.filter(e => e.sentiment.sentiment === 'neutral').length;
    const negative = last24h.filter(e => e.sentiment.sentiment === 'negative').length;
    const escalations = last24h.filter(e => e.sentiment.shouldEscalate).length;
    const avgScore = last24h.reduce((sum, e) => sum + e.sentiment.score, 0) / last24h.length;

    return {
      total: last24h.length,
      positive,
      neutral,
      negative,
      avgScore: avgScore.toFixed(2),
      escalations,
      positiveRate: ((positive / last24h.length) * 100).toFixed(1) + '%',
      negativeRate: ((negative / last24h.length) * 100).toFixed(1) + '%',
      escalationRate: ((escalations / last24h.length) * 100).toFixed(1) + '%',
    };
  }
}

// Export singleton
export const sentimentAnalyzer = new SentimentAnalyzer();

