/**
 * AI Customer Service Satisfaction Tracking System
 *
 * Implements customer satisfaction tracking, feedback collection,
 * and satisfaction analytics for the AI customer service system.
 *
 * @module app/services/ai-customer/satisfaction-tracking.service
 */
export interface CustomerFeedback {
    id: string;
    inquiryId: string;
    responseId: string;
    customerId: string;
    rating: number;
    category: 'response_quality' | 'response_time' | 'resolution_effectiveness' | 'overall_satisfaction';
    comment?: string;
    tags?: string[];
    followUpRequired: boolean;
    sentiment: 'positive' | 'neutral' | 'negative';
    createdAt: string;
}
export interface SatisfactionMetrics {
    overallSatisfaction: number;
    averageRating: number;
    responseQuality: number;
    responseTime: number;
    resolutionEffectiveness: number;
    totalResponses: number;
    satisfiedCustomers: number;
    neutralCustomers: number;
    unsatisfiedCustomers: number;
    trendDirection: 'improving' | 'stable' | 'declining';
    periodComparison: {
        current: number;
        previous: number;
        change: number;
    };
}
export interface SatisfactionAlert {
    id: string;
    type: 'low_satisfaction' | 'negative_trend' | 'critical_feedback';
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    metrics: Record<string, any>;
    createdAt: string;
    acknowledged: boolean;
    acknowledgedBy?: string;
    acknowledgedAt?: string;
}
export interface SatisfactionReport {
    period: string;
    metrics: SatisfactionMetrics;
    topIssues: Array<{
        issue: string;
        frequency: number;
        impact: number;
    }>;
    improvementRecommendations: string[];
    alerts: SatisfactionAlert[];
}
export declare class SatisfactionTrackingService {
    private supabase;
    private satisfactionThresholds;
    constructor();
    /**
     * Record customer feedback for a response
     */
    recordFeedback(inquiryId: string, responseId: string, customerId: string, feedback: {
        rating: number;
        category: CustomerFeedback['category'];
        comment?: string;
        tags?: string[];
    }): Promise<CustomerFeedback>;
    /**
     * Send satisfaction survey to customer
     */
    sendSatisfactionSurvey(inquiryId: string, responseId: string): Promise<void>;
    /**
     * Get satisfaction metrics for a period
     */
    getSatisfactionMetrics(startDate: string, endDate: string): Promise<SatisfactionMetrics>;
    /**
     * Generate satisfaction report
     */
    generateSatisfactionReport(startDate: string, endDate: string): Promise<SatisfactionReport>;
    /**
     * Analyze sentiment from customer comment
     */
    private analyzeSentiment;
    /**
     * Determine if follow-up is required based on feedback
     */
    private requiresFollowUp;
    /**
     * Check for satisfaction alerts
     */
    private checkSatisfactionAlerts;
    /**
     * Create satisfaction alert
     */
    private createAlert;
    /**
     * Calculate category-specific metric
     */
    private calculateCategoryMetric;
    /**
     * Get previous period metrics for comparison
     */
    private getPreviousPeriodMetrics;
    /**
     * Calculate trend direction
     */
    private calculateTrendDirection;
    /**
     * Identify top issues from feedback
     */
    private identifyTopIssues;
    /**
     * Extract issues from customer comment
     */
    private extractIssuesFromComment;
    /**
     * Generate improvement recommendations
     */
    private generateRecommendations;
    /**
     * Get satisfaction alerts
     */
    private getSatisfactionAlerts;
    /**
     * Generate survey link
     */
    private generateSurveyLink;
    /**
     * Send email survey
     */
    private sendEmailSurvey;
    /**
     * Send chat survey
     */
    private sendChatSurvey;
    /**
     * Send SMS survey
     */
    private sendSMSSurvey;
    /**
     * Get empty metrics for periods with no data
     */
    private getEmptyMetrics;
}
/**
 * Default satisfaction tracking service instance
 */
export declare const satisfactionTrackingService: SatisfactionTrackingService;
//# sourceMappingURL=satisfaction-tracking.service.d.ts.map