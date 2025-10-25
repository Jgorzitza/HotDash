/**
 * Growth Engine Performance Optimizer Service
 *
 * ANALYTICS-001: Advanced performance optimization for Growth Engine analytics
 * Provides intelligent optimization recommendations and automated performance improvements
 */
import type { PerformanceAnalysisResult, OptimizationRecommendation } from '~/lib/growth-engine/performance-analysis';
export interface OptimizationConfig {
    autoOptimize: boolean;
    optimizationThreshold: number;
    maxOptimizationsPerRun: number;
    optimizationCooldown: number;
    categories: {
        database: boolean;
        api: boolean;
        frontend: boolean;
        caching: boolean;
        analytics: boolean;
    };
}
export interface OptimizationResult {
    success: boolean;
    optimizationsApplied: string[];
    performanceGains: {
        overall: number;
        database: number;
        api: number;
        frontend: number;
        caching: number;
        analytics: number;
    };
    recommendations: OptimizationRecommendation[];
    nextOptimization: string;
    evidence: {
        beforeMetrics: any;
        afterMetrics: any;
        optimizationLog: string[];
    };
}
export interface PerformanceBaseline {
    timestamp: string;
    overallScore: number;
    categoryScores: {
        database: number;
        api: number;
        frontend: number;
        caching: number;
        analytics: number;
    };
    keyMetrics: {
        responseTime: number;
        throughput: number;
        errorRate: number;
        resourceUsage: number;
    };
}
export declare class GrowthEnginePerformanceOptimizer {
    private config;
    private baseline;
    private optimizationHistory;
    private lastOptimization;
    constructor(config: OptimizationConfig);
    /**
     * Set performance baseline
     */
    setBaseline(analysis: PerformanceAnalysisResult): Promise<void>;
    /**
     * Run performance optimization
     */
    optimizePerformance(analysis: PerformanceAnalysisResult): Promise<OptimizationResult>;
    /**
     * Check if optimization should be performed
     */
    private shouldOptimize;
    /**
     * Check if in cooldown period
     */
    private isInCooldown;
    /**
     * Get next optimization time
     */
    private getNextOptimizationTime;
    /**
     * Optimize database performance
     */
    private optimizeDatabase;
    /**
     * Optimize API performance
     */
    private optimizeApi;
    /**
     * Optimize frontend performance
     */
    private optimizeFrontend;
    /**
     * Optimize caching performance
     */
    private optimizeCaching;
    /**
     * Optimize analytics performance
     */
    private optimizeAnalytics;
    /**
     * Calculate average response time across categories
     */
    private calculateAverageResponseTime;
    /**
     * Calculate average throughput across categories
     */
    private calculateAverageThroughput;
    /**
     * Calculate average error rate across categories
     */
    private calculateAverageErrorRate;
    /**
     * Calculate average resource usage across categories
     */
    private calculateAverageResourceUsage;
    /**
     * Get current metrics from analysis
     */
    private getCurrentMetrics;
    /**
     * Calculate overall performance gain
     */
    private calculateOverallGain;
    /**
     * Get optimization history
     */
    getOptimizationHistory(): OptimizationResult[];
    /**
     * Get latest optimization
     */
    getLatestOptimization(): OptimizationResult | null;
    /**
     * Get performance baseline
     */
    getBaseline(): PerformanceBaseline | null;
    /**
     * Update configuration
     */
    updateConfig(newConfig: Partial<OptimizationConfig>): void;
}
/**
 * Default optimization configuration
 */
export declare const defaultOptimizationConfig: OptimizationConfig;
/**
 * Factory function to create performance optimizer
 */
export declare function createPerformanceOptimizer(config?: OptimizationConfig): GrowthEnginePerformanceOptimizer;
//# sourceMappingURL=performance-optimizer.d.ts.map