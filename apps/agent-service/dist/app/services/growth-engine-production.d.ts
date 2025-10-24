/**
 * Growth Engine Production Service
 *
 * Final production-ready implementation of Growth Engine support system.
 * Integrates all components for production deployment with comprehensive
 * monitoring, error handling, and performance optimization.
 */
import { PerformanceConfig } from './growth-engine-performance';
export interface ProductionConfig {
    environment: 'development' | 'staging' | 'production';
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
        productionMonitoring: boolean;
    };
    monitoring: {
        enabled: boolean;
        interval: number;
        alerting: boolean;
        logging: boolean;
        metrics: boolean;
    };
    performance: PerformanceConfig;
    security: {
        encryption: boolean;
        authentication: boolean;
        authorization: boolean;
        auditLogging: boolean;
    };
    deployment: {
        autoScaling: boolean;
        healthChecks: boolean;
        rollback: boolean;
        backup: boolean;
    };
}
export interface ProductionStatus {
    service: {
        status: 'active' | 'idle' | 'error' | 'maintenance';
        uptime: number;
        version: string;
        environment: string;
    };
    components: {
        integration: boolean;
        supportAgent: boolean;
        analytics: boolean;
        performance: boolean;
        monitoring: boolean;
    };
    health: {
        overall: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
        components: {
            integration: 'healthy' | 'degraded' | 'unhealthy';
            supportAgent: 'healthy' | 'degraded' | 'unhealthy';
            analytics: 'healthy' | 'degraded' | 'unhealthy';
            performance: 'healthy' | 'degraded' | 'unhealthy';
            monitoring: 'healthy' | 'degraded' | 'unhealthy';
        };
    };
    metrics: {
        requests: number;
        errors: number;
        responseTime: number;
        throughput: number;
        availability: number;
    };
    alerts: Array<{
        id: string;
        severity: 'low' | 'medium' | 'high' | 'critical';
        message: string;
        timestamp: string;
        resolved: boolean;
    }>;
}
export declare class GrowthEngineProduction {
    private config;
    private integration;
    private supportAgent;
    private analytics;
    private performance;
    private supabase;
    private monitoringInterval?;
    private status;
    private startTime;
    private version;
    constructor(config: ProductionConfig);
    /**
     * Initialize Growth Engine Production Service
     */
    initialize(): Promise<void>;
    /**
     * Process production support request
     */
    processRequest(request: {
        type: 'troubleshooting' | 'optimization' | 'analysis' | 'emergency' | 'comprehensive';
        priority: 'low' | 'medium' | 'high' | 'critical';
        description: string;
        context?: any;
        userId?: string;
        sessionId?: string;
    }): Promise<{
        success: boolean;
        solution?: string;
        recommendations?: string[];
        metrics?: any;
        evidence?: any;
        analytics?: any;
        performance?: any;
        production?: any;
    }>;
    /**
     * Get production status
     */
    getStatus(): ProductionStatus;
    /**
     * Get production metrics
     */
    getMetrics(): Promise<{
        system: any;
        performance: any;
        analytics: any;
        business: any;
    }>;
    /**
     * Generate production report
     */
    generateProductionReport(period: {
        start: string;
        end: string;
    }): Promise<{
        summary: any;
        metrics: any;
        health: any;
        recommendations: string[];
        alerts: any[];
    }>;
    /**
     * Perform health check
     */
    performHealthCheck(): Promise<{
        healthy: boolean;
        components: any;
        issues: string[];
        recommendations: string[];
    }>;
    /**
     * Initialize integration
     */
    private initializeIntegration;
    /**
     * Initialize support agent
     */
    private initializeSupportAgent;
    /**
     * Initialize analytics
     */
    private initializeAnalytics;
    /**
     * Initialize performance
     */
    private initializePerformance;
    /**
     * Initialize monitoring
     */
    private initializeMonitoring;
    /**
     * Initialize security
     */
    private initializeSecurity;
    /**
     * Initialize health checks
     */
    private initializeHealthChecks;
    /**
     * Enhance production result
     */
    private enhanceProductionResult;
    /**
     * Log request for audit
     */
    private logRequest;
    /**
     * Log response for audit
     */
    private logResponse;
    /**
     * Update metrics
     */
    private updateMetrics;
    /**
     * Add alert
     */
    private addAlert;
    /**
     * Perform monitoring
     */
    private performMonitoring;
    /**
     * Collect system metrics
     */
    private collectSystemMetrics;
    /**
     * Collect performance metrics
     */
    private collectPerformanceMetrics;
    /**
     * Collect analytics metrics
     */
    private collectAnalyticsMetrics;
    /**
     * Collect business metrics
     */
    private collectBusinessMetrics;
    /**
     * Assess health
     */
    private assessHealth;
    /**
     * Generate recommendations
     */
    private generateRecommendations;
    /**
     * Check integration health
     */
    private checkIntegrationHealth;
    /**
     * Check support agent health
     */
    private checkSupportAgentHealth;
    /**
     * Check analytics health
     */
    private checkAnalyticsHealth;
    /**
     * Check performance health
     */
    private checkPerformanceHealth;
    /**
     * Check monitoring health
     */
    private checkMonitoringHealth;
    /**
     * Generate request ID
     */
    private generateRequestId;
    /**
     * Generate alert ID
     */
    private generateAlertId;
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
 * Factory function to create Growth Engine Production service
 */
export declare function createGrowthEngineProduction(config: ProductionConfig): GrowthEngineProduction;
/**
 * Default production configuration
 */
export declare const defaultProductionConfig: ProductionConfig;
//# sourceMappingURL=growth-engine-production.d.ts.map