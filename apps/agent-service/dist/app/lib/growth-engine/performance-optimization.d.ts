/**
 * Growth Engine Performance Optimization Infrastructure
 *
 * Implements advanced performance optimization for Growth Engine phases 9-12
 * Provides automated performance analysis, optimization recommendations, and implementation
 */
import { GrowthEngineSupportFramework } from '../services/growth-engine-support.server';
export interface PerformanceMetrics {
    timestamp: string;
    p95Latency: number;
    p99Latency: number;
    averageLatency: number;
    throughput: number;
    errorRate: number;
    cpuUsage: number;
    memoryUsage: number;
    databaseConnections: number;
    cacheHitRate: number;
    responseSize: number;
}
export interface OptimizationTarget {
    id: string;
    name: string;
    type: 'database' | 'api' | 'frontend' | 'infrastructure' | 'caching';
    currentValue: number;
    targetValue: number;
    unit: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    impact: number;
}
export interface OptimizationRecommendation {
    id: string;
    target: OptimizationTarget;
    description: string;
    implementation: {
        steps: string[];
        effort: 'low' | 'medium' | 'high';
        risk: 'low' | 'medium' | 'high';
        rollbackPlan: string;
    };
    expectedResults: {
        metric: string;
        improvement: number;
        unit: string;
        confidence: number;
    };
    evidence: {
        benchmarks: string[];
        testResults: string[];
        monitoringData: string[];
    };
    dependencies: string[];
}
export interface PerformanceTestResult {
    testId: string;
    timestamp: string;
    scenario: string;
    results: {
        p95Latency: number;
        p99Latency: number;
        throughput: number;
        errorRate: number;
        resourceUsage: {
            cpu: number;
            memory: number;
            disk: number;
        };
    };
    passed: boolean;
    recommendations: string[];
}
export declare class PerformanceOptimizationEngine {
    private framework;
    private monitoringInterval?;
    private optimizationTargets;
    constructor(framework: GrowthEngineSupportFramework);
    /**
     * Initialize performance optimization engine
     */
    initialize(): Promise<void>;
    /**
     * Start performance monitoring
     */
    startPerformanceMonitoring(): Promise<void>;
    /**
     * Collect performance metrics
     */
    collectPerformanceMetrics(): Promise<PerformanceMetrics>;
    /**
     * Analyze performance metrics and generate recommendations
     */
    analyzePerformanceMetrics(metrics: PerformanceMetrics): Promise<OptimizationRecommendation[]>;
    /**
     * Initialize optimization targets
     */
    private initializeOptimizationTargets;
    /**
     * Run performance tests
     */
    runPerformanceTests(scenarios: string[]): Promise<PerformanceTestResult[]>;
    /**
     * Execute a performance test
     */
    private executePerformanceTest;
    /**
     * Generate performance optimization recommendations
     */
    generateOptimizationRecommendations(): Promise<OptimizationRecommendation[]>;
    /**
     * Get optimization targets
     */
    getOptimizationTargets(): OptimizationTarget[];
    /**
     * Update optimization target
     */
    updateOptimizationTarget(id: string, updates: Partial<OptimizationTarget>): void;
    /**
     * Cleanup resources
     */
    cleanup(): Promise<void>;
}
/**
 * Factory function to create Performance Optimization Engine
 */
export declare function createPerformanceOptimizationEngine(framework: GrowthEngineSupportFramework): PerformanceOptimizationEngine;
//# sourceMappingURL=performance-optimization.d.ts.map