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
    score: number;
    confidence: number;
    urgency: 'low' | 'medium' | 'high' | 'urgent';
    emotions: string[];
    triggers: string[];
    shouldEscalate: boolean;
    metadata?: Record<string, any>;
}
/**
 * Analyzes sentiment of customer messages
 */
export declare class SentimentAnalyzer {
    private negativeKeywords;
    private positiveKeywords;
    private urgentKeywords;
    private emotionMap;
    /**
     * Analyze sentiment of message
     */
    analyze(message: string): SentimentAnalysis;
    /**
     * Get alert message for negative sentiment
     */
    getAlertMessage(analysis: SentimentAnalysis, conversationId: number): string | null;
    /**
     * Track sentiment trends over time
     */
    private sentimentHistory;
    trackSentiment(conversationId: number, analysis: SentimentAnalysis): void;
    /**
     * Get sentiment trend statistics
     */
    getTrends(): {
        total: number;
        positive: number;
        neutral: number;
        negative: number;
        avgScore: number;
        escalations: number;
        positiveRate?: undefined;
        negativeRate?: undefined;
        escalationRate?: undefined;
    } | {
        total: number;
        positive: number;
        neutral: number;
        negative: number;
        avgScore: string;
        escalations: number;
        positiveRate: string;
        negativeRate: string;
        escalationRate: string;
    };
}
export declare const sentimentAnalyzer: SentimentAnalyzer;
//# sourceMappingURL=sentiment-analyzer.d.ts.map