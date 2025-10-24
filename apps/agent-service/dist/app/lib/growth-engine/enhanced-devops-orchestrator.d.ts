/**
 * Enhanced DevOps Orchestrator
 *
 * Advanced orchestrator for DevOps Growth Engine with comprehensive capabilities
 * Integrates automation, performance, security, testing, monitoring, cost optimization, and disaster recovery
 */
import { DevOpsAutomationConfig } from './devops-automation';
import { TestConfiguration } from './automated-testing';
export interface EnhancedDevOpsConfig {
    agent: string;
    date: string;
    task: string;
    estimatedHours: number;
    automation: DevOpsAutomationConfig;
    testing: TestConfiguration;
    monitoring: {
        performance: boolean;
        security: boolean;
        compliance: boolean;
        advanced: boolean;
    };
    costOptimization: {
        enabled: boolean;
        budgetThreshold: number;
        alertThreshold: number;
    };
    disasterRecovery: {
        enabled: boolean;
        testingFrequency: 'weekly' | 'monthly' | 'quarterly';
        backupRetention: number;
    };
}
export interface EnhancedDevOpsStatus {
    timestamp: string;
    automation: {
        status: 'idle' | 'running' | 'completed' | 'failed';
        lastDeployment?: string;
        activeThreats: number;
    };
    performance: {
        status: 'idle' | 'monitoring' | 'optimizing' | 'completed';
        currentLatency: number;
        targetLatency: number;
        optimizationScore: number;
    };
    security: {
        status: 'idle' | 'monitoring' | 'investigating' | 'resolved';
        threatLevel: 'low' | 'medium' | 'high' | 'critical';
        complianceScore: number;
        activeThreats: number;
    };
    testing: {
        status: 'idle' | 'running' | 'completed' | 'failed';
        lastRun?: string;
        coverage: number;
        passRate: number;
    };
    monitoring: {
        status: 'idle' | 'monitoring' | 'alerting';
        activeAlerts: number;
        systemHealth: 'healthy' | 'degraded' | 'critical';
    };
    costOptimization: {
        status: 'idle' | 'monitoring' | 'optimizing';
        dailySpend: number;
        budgetAlert: boolean;
        optimizationScore: number;
    };
    disasterRecovery: {
        status: 'idle' | 'monitoring' | 'testing' | 'recovering';
        lastBackup?: string;
        nextTest?: string;
        recoveryReadiness: number;
    };
}
export interface EnhancedDevOpsRecommendations {
    automation: Array<{
        type: 'deployment' | 'scaling' | 'monitoring';
        priority: 'low' | 'medium' | 'high' | 'critical';
        description: string;
        impact: number;
        effort: 'low' | 'medium' | 'high';
    }>;
    performance: Array<{
        type: 'latency' | 'throughput' | 'resource';
        priority: 'low' | 'medium' | 'high' | 'critical';
        description: string;
        expectedImprovement: number;
        effort: 'low' | 'medium' | 'high';
    }>;
    security: Array<{
        type: 'prevention' | 'detection' | 'response';
        priority: 'low' | 'medium' | 'high' | 'critical';
        description: string;
        riskReduction: number;
        effort: 'low' | 'medium' | 'high';
    }>;
    testing: Array<{
        type: 'coverage' | 'performance' | 'quality';
        priority: 'low' | 'medium' | 'high' | 'critical';
        description: string;
        expectedImprovement: number;
        effort: 'low' | 'medium' | 'high';
    }>;
    monitoring: Array<{
        type: 'alerting' | 'metrics' | 'dashboards';
        priority: 'low' | 'medium' | 'high' | 'critical';
        description: string;
        impact: number;
        effort: 'low' | 'medium' | 'high';
    }>;
    costOptimization: Array<{
        type: 'compute' | 'storage' | 'network' | 'service';
        priority: 'low' | 'medium' | 'high' | 'critical';
        description: string;
        potentialSavings: number;
        effort: 'low' | 'medium' | 'high';
    }>;
    disasterRecovery: Array<{
        type: 'backup' | 'testing' | 'recovery';
        priority: 'low' | 'medium' | 'high' | 'critical';
        description: string;
        riskReduction: number;
        effort: 'low' | 'medium' | 'high';
    }>;
}
export declare class EnhancedDevOpsOrchestrator {
    private framework;
    private config;
    private automation;
    private performance;
    private security;
    private testing;
    private monitoring;
    private costOptimization;
    private disasterRecovery;
    private status;
    constructor(config: EnhancedDevOpsConfig);
    /**
     * Initialize enhanced DevOps orchestrator
     */
    initialize(): Promise<void>;
    /**
     * Execute comprehensive DevOps operations
     */
    executeComprehensiveOperations(): Promise<void>;
    /**
     * Update status from operations results
     */
    private updateStatusFromOperations;
    /**
     * Start performance monitoring
     */
    private startPerformanceMonitoring;
    /**
     * Start security monitoring
     */
    private startSecurityMonitoring;
    /**
     * Start advanced monitoring
     */
    private startAdvancedMonitoring;
    /**
     * Get comprehensive status
     */
    getStatus(): EnhancedDevOpsStatus;
    /**
     * Generate comprehensive recommendations
     */
    generateComprehensiveRecommendations(): Promise<EnhancedDevOpsRecommendations>;
    /**
     * Get automation recommendations
     */
    private getAutomationRecommendations;
    /**
     * Get performance recommendations
     */
    private getPerformanceRecommendations;
    /**
     * Get security recommendations
     */
    private getSecurityRecommendations;
    /**
     * Get testing recommendations
     */
    private getTestingRecommendations;
    /**
     * Get monitoring recommendations
     */
    private getMonitoringRecommendations;
    /**
     * Get cost optimization recommendations
     */
    private getCostOptimizationRecommendations;
    /**
     * Get disaster recovery recommendations
     */
    private getDisasterRecoveryRecommendations;
    /**
     * Initialize status
     */
    private initializeStatus;
    /**
     * Cleanup resources
     */
    cleanup(): Promise<void>;
}
/**
 * Factory function to create Enhanced DevOps Orchestrator
 */
export declare function createEnhancedDevOpsOrchestrator(config: EnhancedDevOpsConfig): EnhancedDevOpsOrchestrator;
//# sourceMappingURL=enhanced-devops-orchestrator.d.ts.map