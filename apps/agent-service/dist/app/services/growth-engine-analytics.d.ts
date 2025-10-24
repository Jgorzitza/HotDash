/**
 * Growth Engine Analytics Service
 *
 * Advanced analytics and monitoring for Growth Engine support operations.
 * Provides real-time metrics, performance analysis, and predictive insights.
 */
export interface GrowthEngineMetrics {
    systemPerformance: {
        uptime: number;
        responseTime: number;
        throughput: number;
        errorRate: number;
        cpuUsage: number;
        memoryUsage: number;
    };
    supportOperations: {
        ticketsResolved: number;
        averageResolutionTime: number;
        customerSatisfaction: number;
        escalationRate: number;
        firstCallResolution: number;
    };
    growthEngineComponents: {
        mcpEvidence: {
            filesCreated: number;
            entriesLogged: number;
            validationSuccess: number;
            complianceRate: number;
        };
        heartbeat: {
            entriesLogged: number;
            staleDetections: number;
            monitoringUptime: number;
            alertAccuracy: number;
        };
        devMCPBan: {
            scansPerformed: number;
            violationsDetected: number;
            falsePositives: number;
            preventionRate: number;
        };
        ciGuards: {
            checksPerformed: number;
            failuresDetected: number;
            mergeBlocked: number;
            complianceRate: number;
        };
    };
    aiAutomation: {
        aiAssistedResolutions: number;
        automationSuccess: number;
        predictiveAccuracy: number;
        learningImprovements: number;
    };
    businessImpact: {
        downtimeReduction: number;
        costSavings: number;
        efficiencyGains: number;
        riskMitigation: number;
    };
}
export interface AnalyticsInsight {
    type: 'performance' | 'trend' | 'anomaly' | 'recommendation' | 'prediction';
    severity: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description: string;
    metrics: any;
    recommendations: string[];
    confidence: number;
    timestamp: string;
}
export interface PerformanceReport {
    period: {
        start: string;
        end: string;
        duration: string;
    };
    summary: {
        overallHealth: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
        keyMetrics: string[];
        improvements: string[];
        concerns: string[];
    };
    metrics: GrowthEngineMetrics;
    insights: AnalyticsInsight[];
    recommendations: string[];
}
export declare class GrowthEngineAnalytics {
    private supabase;
    private metrics;
    private insights;
    constructor();
    /**
     * Collect real-time metrics
     */
    collectMetrics(): Promise<GrowthEngineMetrics>;
    /**
     * Generate performance insights
     */
    generateInsights(): Promise<AnalyticsInsight[]>;
    /**
     * Generate comprehensive performance report
     */
    generatePerformanceReport(period: {
        start: string;
        end: string;
    }): Promise<PerformanceReport>;
    /**
     * Get real-time dashboard data
     */
    getDashboardData(): Promise<{
        metrics: GrowthEngineMetrics;
        insights: AnalyticsInsight[];
        alerts: AnalyticsInsight[];
        trends: any[];
    }>;
    /**
     * Collect system performance metrics
     */
    private collectSystemPerformance;
    /**
     * Collect support operations metrics
     */
    private collectSupportOperations;
    /**
     * Collect Growth Engine component metrics
     */
    private collectGrowthEngineComponents;
    /**
     * Collect AI and automation metrics
     */
    private collectAIAutomation;
    /**
     * Collect business impact metrics
     */
    private collectBusinessImpact;
    /**
     * Generate performance insights
     */
    private generatePerformanceInsights;
    /**
     * Generate trend insights
     */
    private generateTrendInsights;
    /**
     * Generate anomaly insights
     */
    private generateAnomalyInsights;
    /**
     * Generate recommendation insights
     */
    private generateRecommendationInsights;
    /**
     * Generate prediction insights
     */
    private generatePredictionInsights;
    /**
     * Calculate overall health
     */
    private calculateOverallHealth;
    /**
     * Generate summary
     */
    private generateSummary;
    /**
     * Generate recommendations
     */
    private generateRecommendations;
    /**
     * Calculate trends
     */
    private calculateTrends;
    /**
     * Calculate duration
     */
    private calculateDuration;
    /**
     * Initialize metrics
     */
    private initializeMetrics;
}
export declare const growthEngineAnalytics: GrowthEngineAnalytics;
//# sourceMappingURL=growth-engine-analytics.d.ts.map