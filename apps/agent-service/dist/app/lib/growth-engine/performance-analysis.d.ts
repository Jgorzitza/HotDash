/**
 * Growth Engine Performance Analysis and Optimization
 *
 * ANALYTICS-001: Advanced performance analysis and optimization for Growth Engine
 * Provides comprehensive performance monitoring, analysis, and optimization recommendations
 */
export interface PerformanceAnalysisResult {
    timestamp: string;
    overallScore: number;
    categories: {
        database: PerformanceCategory;
        api: PerformanceCategory;
        frontend: PerformanceCategory;
        caching: PerformanceCategory;
        analytics: PerformanceCategory;
    };
    recommendations: OptimizationRecommendation[];
    criticalIssues: CriticalIssue[];
    performanceTrends: PerformanceTrend[];
}
export interface PerformanceCategory {
    score: number;
    status: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
    metrics: {
        responseTime: number;
        throughput: number;
        errorRate: number;
        resourceUsage: number;
    };
    bottlenecks: Bottleneck[];
    optimizations: string[];
}
export interface Bottleneck {
    id: string;
    type: 'database' | 'api' | 'frontend' | 'caching' | 'analytics';
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    impact: number;
    solution: string;
    effort: 'low' | 'medium' | 'high';
    priority: number;
}
export interface OptimizationRecommendation {
    id: string;
    title: string;
    description: string;
    category: 'database' | 'api' | 'frontend' | 'caching' | 'analytics';
    priority: 'low' | 'medium' | 'high' | 'critical';
    impact: number;
    effort: 'low' | 'medium' | 'high';
    implementation: {
        steps: string[];
        estimatedTime: string;
        resources: string[];
        dependencies: string[];
    };
    expectedResults: {
        performanceGain: number;
        costReduction: number;
        userExperience: number;
    };
    evidence: {
        benchmarks: string[];
        testResults: string[];
        monitoringData: string[];
    };
}
export interface CriticalIssue {
    id: string;
    title: string;
    description: string;
    severity: 'high' | 'critical';
    impact: string;
    affectedComponents: string[];
    immediateActions: string[];
    longTermSolutions: string[];
    monitoring: string[];
}
export interface PerformanceTrend {
    metric: string;
    timeframe: string;
    current: number;
    previous: number;
    change: number;
    trend: 'improving' | 'stable' | 'declining';
    significance: 'low' | 'medium' | 'high';
}
export declare class GrowthEnginePerformanceAnalyzer {
    private analysisHistory;
    private monitoringInterval?;
    constructor();
    /**
     * Perform comprehensive performance analysis
     */
    analyzePerformance(): Promise<PerformanceAnalysisResult>;
    /**
     * Analyze database performance
     */
    private analyzeDatabasePerformance;
    /**
     * Analyze API performance
     */
    private analyzeApiPerformance;
    /**
     * Analyze frontend performance
     */
    private analyzeFrontendPerformance;
    /**
     * Analyze caching performance
     */
    private analyzeCachingPerformance;
    /**
     * Analyze analytics performance
     */
    private analyzeAnalyticsPerformance;
    /**
     * Calculate overall performance score
     */
    private calculateOverallScore;
    /**
     * Calculate category performance score
     */
    private calculateCategoryScore;
    /**
     * Get performance status based on score
     */
    private getPerformanceStatus;
    /**
     * Generate optimization recommendations
     */
    private generateOptimizationRecommendations;
    /**
     * Identify critical issues
     */
    private identifyCriticalIssues;
    /**
     * Analyze performance trends
     */
    private analyzePerformanceTrends;
    /**
     * Start continuous monitoring
     */
    private startContinuousMonitoring;
    /**
     * Get analysis history
     */
    getAnalysisHistory(): PerformanceAnalysisResult[];
    /**
     * Get latest analysis
     */
    getLatestAnalysis(): PerformanceAnalysisResult | null;
    /**
     * Cleanup resources
     */
    cleanup(): void;
}
/**
 * Factory function to create performance analyzer
 */
export declare function createPerformanceAnalyzer(): GrowthEnginePerformanceAnalyzer;
//# sourceMappingURL=performance-analysis.d.ts.map