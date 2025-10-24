/**
 * Growth Engine Integration Service
 *
 * Comprehensive integration service that coordinates all Growth Engine components
 * for advanced support agent capabilities.
 */
import { SupportAgentStatus } from './growth-engine-support-agent';
import { PerformanceReport } from './growth-engine-analytics';
import { PerformanceConfig, OptimizationResult } from './growth-engine-performance';
import { GrowthEngineAIConfig } from './ai-customer/growth-engine-ai';
export interface GrowthEngineIntegrationConfig {
    agent: {
        name: string;
        date: string;
        task: string;
        estimatedHours: number;
    };
    capabilities: {
        mcpEvidence: boolean;
        heartbeat: boolean;
        devMCPBan: boolean;
        aiFeatures: boolean;
        inventoryOptimization: boolean;
        advancedAnalytics: boolean;
        performanceOptimization: boolean;
    };
    performance: PerformanceConfig;
    ai: GrowthEngineAIConfig;
}
export interface GrowthEngineIntegrationStatus {
    agent: SupportAgentStatus;
    analytics: {
        metrics: any;
        insights: any[];
        alerts: any[];
    };
    performance: {
        metrics: any;
        optimization: OptimizationResult | null;
        targets: {
            met: boolean;
            recommendations: string[];
        };
    };
    integration: {
        status: 'active' | 'idle' | 'error';
        components: {
            supportAgent: boolean;
            analytics: boolean;
            performance: boolean;
            ai: boolean;
            inventory: boolean;
        };
        health: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
    };
}
export declare class GrowthEngineIntegration {
    private config;
    private supportAgent;
    private analytics;
    private performance;
    private status;
    constructor(config: GrowthEngineIntegrationConfig);
    /**
     * Initialize Growth Engine Integration
     */
    initialize(): Promise<void>;
    /**
     * Process comprehensive support request
     */
    processSupportRequest(request: {
        type: 'troubleshooting' | 'optimization' | 'analysis' | 'emergency' | 'comprehensive';
        priority: 'low' | 'medium' | 'high' | 'critical';
        description: string;
        context?: any;
    }): Promise<{
        success: boolean;
        solution?: string;
        recommendations?: string[];
        metrics?: any;
        evidence?: any;
        analytics?: any;
        performance?: any;
    }>;
    /**
     * Get comprehensive status
     */
    getStatus(): GrowthEngineIntegrationStatus;
    /**
     * Generate comprehensive report
     */
    generateComprehensiveReport(period: {
        start: string;
        end: string;
    }): Promise<{
        integration: GrowthEngineIntegrationStatus;
        analytics: PerformanceReport;
        performance: OptimizationResult;
        recommendations: string[];
    }>;
    /**
     * Optimize all components
     */
    optimizeAll(): Promise<{
        success: boolean;
        optimizations: string[];
        performanceGains: any;
        recommendations: string[];
    }>;
    /**
     * Initialize Support Agent
     */
    private initializeSupportAgent;
    /**
     * Initialize Analytics
     */
    private initializeAnalytics;
    /**
     * Initialize Performance
     */
    private initializePerformance;
    /**
     * Initialize AI
     */
    private initializeAI;
    /**
     * Initialize Inventory
     */
    private initializeInventory;
    /**
     * Handle comprehensive request
     */
    private handleComprehensiveRequest;
    /**
     * Collect analytics
     */
    private collectAnalytics;
    /**
     * Collect performance metrics
     */
    private collectPerformanceMetrics;
    /**
     * Optimize Support Agent
     */
    private optimizeSupportAgent;
    /**
     * Optimize Analytics
     */
    private optimizeAnalytics;
    /**
     * Generate comprehensive solution
     */
    private generateComprehensiveSolution;
    /**
     * Generate comprehensive recommendations
     */
    private generateComprehensiveRecommendations;
    /**
     * Generate recommendations
     */
    private generateRecommendations;
    /**
     * Calculate overall health
     */
    private calculateOverallHealth;
    /**
     * Update status
     */
    private updateStatus;
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
 * Factory function to create Growth Engine Integration
 */
export declare function createGrowthEngineIntegration(config: GrowthEngineIntegrationConfig): GrowthEngineIntegration;
/**
 * Default integration configuration
 */
export declare const defaultIntegrationConfig: GrowthEngineIntegrationConfig;
//# sourceMappingURL=growth-engine-integration.d.ts.map