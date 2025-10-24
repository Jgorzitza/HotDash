/**
 * Growth Engine DevOps Automation Infrastructure
 *
 * Implements advanced DevOps capabilities for Growth Engine phases 9-12
 * Provides automated deployment, monitoring, and optimization features
 */
import { GrowthEngineSupportFramework } from '../services/growth-engine-support.server';
export interface DevOpsAutomationConfig {
    environment: 'staging' | 'production';
    deploymentStrategy: 'blue-green' | 'rolling' | 'canary';
    monitoringEnabled: boolean;
    autoScalingEnabled: boolean;
    backupEnabled: boolean;
}
export interface DeploymentMetrics {
    deploymentId: string;
    status: 'pending' | 'running' | 'completed' | 'failed' | 'rolled_back';
    startTime: string;
    endTime?: string;
    duration?: number;
    successRate: number;
    errorCount: number;
    rollbackCount: number;
    performanceImpact: {
        latencyIncrease: number;
        throughputChange: number;
        errorRateChange: number;
    };
}
export interface MonitoringMetrics {
    timestamp: string;
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
    networkLatency: number;
    errorRate: number;
    throughput: number;
    responseTime: number;
    activeConnections: number;
}
export interface OptimizationRecommendations {
    type: 'performance' | 'cost' | 'reliability' | 'security';
    priority: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    expectedImpact: {
        metric: string;
        improvement: number;
        unit: string;
    };
    implementation: {
        effort: 'low' | 'medium' | 'high';
        risk: 'low' | 'medium' | 'high';
        rollbackPlan: string;
    };
    evidence: {
        metrics: string[];
        benchmarks: string[];
        testResults: string[];
    };
}
export declare class DevOpsGrowthEngine {
    private framework;
    private config;
    private monitoringInterval?;
    constructor(framework: GrowthEngineSupportFramework, config: DevOpsAutomationConfig);
    /**
     * Initialize DevOps Growth Engine
     */
    initialize(): Promise<void>;
    /**
     * Execute automated deployment
     */
    executeDeployment(version: string, strategy?: DevOpsAutomationConfig['deploymentStrategy']): Promise<DeploymentMetrics>;
    /**
     * Start monitoring system
     */
    startMonitoring(): Promise<void>;
    /**
     * Collect system metrics
     */
    collectMetrics(): Promise<MonitoringMetrics>;
    /**
     * Analyze metrics and generate recommendations
     */
    analyzeMetrics(metrics: MonitoringMetrics): Promise<OptimizationRecommendations[]>;
    /**
     * Generate optimization recommendations
     */
    generateOptimizationRecommendations(): Promise<OptimizationRecommendations[]>;
    /**
     * Execute deployment strategy
     */
    private executeDeploymentStrategy;
    private executeBlueGreenDeployment;
    private executeRollingDeployment;
    private executeCanaryDeployment;
    /**
     * Initialize auto-scaling
     */
    private initializeAutoScaling;
    /**
     * Setup backup system
     */
    private setupBackup;
    /**
     * Cleanup resources
     */
    cleanup(): Promise<void>;
}
/**
 * Factory function to create DevOps Growth Engine
 */
export declare function createDevOpsGrowthEngine(framework: GrowthEngineSupportFramework, config: DevOpsAutomationConfig): DevOpsGrowthEngine;
//# sourceMappingURL=devops-automation.d.ts.map