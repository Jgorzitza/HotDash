/**
 * Growth Engine Performance Analysis Service
 *
 * ANALYTICS-PERFORMANCE-001: Comprehensive performance analysis and optimization
 * for Growth Engine operations. Provides real-time monitoring, bottleneck detection,
 * and actionable optimization recommendations.
 */
export interface RealTimeMetrics {
    timestamp: string;
    system: {
        cpuUsage: number;
        memoryUsage: number;
        diskIO: number;
        networkLatency: number;
    };
    application: {
        responseTime: number;
        throughput: number;
        errorRate: number;
        activeConnections: number;
    };
    database: {
        queryTime: number;
        connectionPoolUsage: number;
        slowQueries: number;
        cacheHitRate: number;
    };
    agents: {
        activeAgents: number;
        handoffLatency: number;
        mcpRequestTime: number;
        approvalQueueDepth: number;
    };
}
export interface PerformanceInsight {
    id: string;
    category: 'optimization' | 'warning' | 'critical' | 'info';
    title: string;
    description: string;
    impact: 'low' | 'medium' | 'high' | 'critical';
    confidence: number;
    evidence: string[];
    recommendations: string[];
    estimatedImprovement: number;
}
export interface OptimizationPlan {
    id: string;
    title: string;
    description: string;
    priority: number;
    estimatedEffort: 'low' | 'medium' | 'high';
    estimatedImpact: number;
    dependencies: string[];
    steps: {
        order: number;
        description: string;
        estimatedTime: string;
        resources: string[];
    }[];
    rollbackPlan: string;
    successMetrics: {
        metric: string;
        currentValue: number;
        targetValue: number;
        unit: string;
    }[];
}
export declare class GrowthEnginePerformanceAnalysisService {
    private metricsHistory;
    private insights;
    private optimizationPlans;
    private monitoringInterval?;
    /**
     * Start real-time performance monitoring
     */
    startMonitoring(intervalMs?: number): Promise<void>;
    /**
     * Stop performance monitoring
     */
    stopMonitoring(): void;
    /**
     * Collect real-time performance metrics
     */
    private collectRealTimeMetrics;
    /**
     * Analyze metrics for performance insights
     */
    private analyzeMetricsForInsights;
    /**
     * Generate comprehensive performance report
     */
    generatePerformanceReport(): Promise<{
        summary: {
            overallHealth: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
            score: number;
            timestamp: string;
        };
        metrics: RealTimeMetrics;
        insights: PerformanceInsight[];
        optimizationPlans: OptimizationPlan[];
        trends: {
            metric: string;
            trend: 'improving' | 'stable' | 'declining';
            change: number;
        }[];
    }>;
    /**
     * Calculate overall performance score
     */
    private calculateOverallScore;
    /**
     * Get health status from score
     */
    private getHealthStatus;
    /**
     * Calculate performance trends
     */
    private calculateTrends;
    /**
     * Generate optimization plans based on insights
     */
    generateOptimizationPlans(): Promise<OptimizationPlan[]>;
    /**
     * Create optimization plan from insight
     */
    private createOptimizationPlan;
    /**
     * Get current insights
     */
    getInsights(): PerformanceInsight[];
    /**
     * Get metrics history
     */
    getMetricsHistory(): RealTimeMetrics[];
}
/**
 * Default configuration for performance analysis
 */
export declare const defaultPerformanceAnalysisConfig: {
    monitoringInterval: number;
    metricsRetention: number;
    insightsRetention: number;
    alertThresholds: {
        cpuUsage: number;
        memoryUsage: number;
        responseTime: number;
        errorRate: number;
        cacheHitRate: number;
        mcpRequestTime: number;
    };
};
//# sourceMappingURL=growth-engine-performance-analysis.d.ts.map