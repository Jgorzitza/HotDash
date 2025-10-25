/**
 * Growth Engine DevOps Orchestrator
 *
 * Main orchestrator for DevOps Growth Engine features
 * Coordinates all DevOps automation, performance optimization, security monitoring, and testing
 */
import { DevOpsAutomationConfig } from './devops-automation';
import { TestConfiguration } from './automated-testing';
export interface DevOpsOrchestratorConfig {
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
    };
}
export interface DevOpsStatus {
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
}
export interface DevOpsRecommendations {
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
}
export declare class DevOpsOrchestrator {
    private framework;
    private config;
    private automation;
    private performance;
    private security;
    private testing;
    private status;
    constructor(config: DevOpsOrchestratorConfig);
    /**
     * Initialize DevOps orchestrator
     */
    initialize(): Promise<void>;
    /**
     * Execute DevOps automation
     */
    executeAutomation(version: string): Promise<void>;
    /**
     * Execute performance optimization
     */
    executePerformanceOptimization(): Promise<void>;
    /**
     * Execute security monitoring
     */
    executeSecurityMonitoring(): Promise<void>;
    /**
     * Execute automated testing
     */
    executeTesting(testTypes: Array<'unit' | 'integration' | 'e2e' | 'performance' | 'security' | 'accessibility'>): Promise<void>;
    /**
     * Start performance monitoring
     */
    private startPerformanceMonitoring;
    /**
     * Start security monitoring
     */
    private startSecurityMonitoring;
    /**
     * Get current status
     */
    getStatus(): DevOpsStatus;
    /**
     * Generate comprehensive recommendations
     */
    generateRecommendations(): Promise<DevOpsRecommendations>;
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
     * Initialize status
     */
    private initializeStatus;
    /**
     * Cleanup resources
     */
    cleanup(): Promise<void>;
}
/**
 * Factory function to create DevOps Orchestrator
 */
export declare function createDevOpsOrchestrator(config: DevOpsOrchestratorConfig): DevOpsOrchestrator;
//# sourceMappingURL=devops-orchestrator.d.ts.map