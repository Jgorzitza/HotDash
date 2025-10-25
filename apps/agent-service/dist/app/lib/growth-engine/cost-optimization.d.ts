/**
 * Cost Optimization Infrastructure
 *
 * Implements advanced cost optimization for DevOps Growth Engine
 * Provides resource optimization, cost analysis, and budget management
 */
import { GrowthEngineSupportFramework } from '../services/growth-engine-support.server';
export interface CostMetrics {
    timestamp: string;
    infrastructure: {
        compute: {
            cpu: number;
            memory: number;
            cost: number;
        };
        storage: {
            database: number;
            files: number;
            backups: number;
            cost: number;
        };
        network: {
            bandwidth: number;
            requests: number;
            cost: number;
        };
    };
    services: {
        monitoring: number;
        security: number;
        backup: number;
        support: number;
    };
    total: {
        daily: number;
        monthly: number;
        yearly: number;
    };
}
export interface OptimizationRecommendation {
    id: string;
    type: 'compute' | 'storage' | 'network' | 'service' | 'architecture';
    priority: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    description: string;
    currentCost: number;
    potentialSavings: number;
    implementation: {
        effort: 'low' | 'medium' | 'high';
        risk: 'low' | 'medium' | 'high';
        timeline: string;
        steps: string[];
    };
    impact: {
        performance: 'positive' | 'neutral' | 'negative';
        reliability: 'positive' | 'neutral' | 'negative';
        scalability: 'positive' | 'neutral' | 'negative';
    };
    evidence: {
        metrics: string[];
        benchmarks: string[];
        caseStudies: string[];
    };
}
export interface BudgetAlert {
    id: string;
    type: 'threshold' | 'trend' | 'anomaly';
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    currentSpend: number;
    threshold: number;
    projectedOverage: number;
    recommendations: string[];
    timestamp: string;
}
export interface ResourceUtilization {
    resource: string;
    current: number;
    capacity: number;
    utilization: number;
    cost: number;
    efficiency: 'optimal' | 'underutilized' | 'overutilized';
    recommendations: string[];
}
export declare class CostOptimizationEngine {
    private framework;
    private monitoringInterval?;
    private costHistory;
    private budgetAlerts;
    constructor(framework: GrowthEngineSupportFramework);
    /**
     * Initialize cost optimization engine
     */
    initialize(): Promise<void>;
    /**
     * Start cost monitoring
     */
    startCostMonitoring(): Promise<void>;
    /**
     * Collect cost metrics
     */
    collectCostMetrics(): Promise<CostMetrics>;
    /**
     * Check budget alerts
     */
    checkBudgetAlerts(metrics: CostMetrics): Promise<void>;
    /**
     * Generate cost optimization recommendations
     */
    generateOptimizationRecommendations(): Promise<OptimizationRecommendation[]>;
    /**
     * Analyze resource utilization
     */
    analyzeResourceUtilization(): Promise<ResourceUtilization[]>;
    /**
     * Get cost metrics history
     */
    getCostHistory(days?: number): CostMetrics[];
    /**
     * Get budget alerts
     */
    getBudgetAlerts(): BudgetAlert[];
    /**
     * Get cost summary
     */
    getCostSummary(): {
        daily: number;
        monthly: number;
        yearly: number;
        trends: {
            daily: number;
            weekly: number;
            monthly: number;
        };
    };
    /**
     * Cleanup resources
     */
    cleanup(): Promise<void>;
}
/**
 * Factory function to create Cost Optimization Engine
 */
export declare function createCostOptimizationEngine(framework: GrowthEngineSupportFramework): CostOptimizationEngine;
//# sourceMappingURL=cost-optimization.d.ts.map