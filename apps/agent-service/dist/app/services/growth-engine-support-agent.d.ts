/**
 * Growth Engine Support Agent
 *
 * Advanced support agent with Growth Engine capabilities for phases 9-12.
 * Integrates MCP Evidence, Heartbeat, Dev MCP Ban, and advanced AI features.
 */
export interface SupportAgentConfig {
    agent: string;
    date: string;
    task: string;
    estimatedHours: number;
    capabilities: {
        mcpEvidence: boolean;
        heartbeat: boolean;
        devMCPBan: boolean;
        aiFeatures: boolean;
        inventoryOptimization: boolean;
        advancedAnalytics: boolean;
    };
    performance: {
        maxConcurrentTasks: number;
        responseTimeThreshold: number;
        memoryLimit: number;
        cpuLimit: number;
    };
}
export interface SupportAgentStatus {
    agent: string;
    status: 'active' | 'idle' | 'busy' | 'error';
    currentTask: string | null;
    capabilities: {
        mcpEvidence: boolean;
        heartbeat: boolean;
        devMCPBan: boolean;
        aiFeatures: boolean;
        inventoryOptimization: boolean;
        advancedAnalytics: boolean;
    };
    performance: {
        cpuUsage: number;
        memoryUsage: number;
        responseTime: number;
        throughput: number;
    };
    metrics: {
        tasksCompleted: number;
        issuesResolved: number;
        uptime: number;
        errorRate: number;
    };
}
export declare class GrowthEngineSupportAgent {
    private config;
    private framework;
    private aiConfig;
    private status;
    private startTime;
    constructor(config: SupportAgentConfig);
    /**
     * Initialize the Growth Engine Support Agent
     */
    initialize(): Promise<void>;
    /**
     * Process support request with advanced capabilities
     */
    processSupportRequest(request: {
        type: 'troubleshooting' | 'optimization' | 'analysis' | 'emergency';
        priority: 'low' | 'medium' | 'high' | 'critical';
        description: string;
        context?: any;
    }): Promise<{
        success: boolean;
        solution?: string;
        recommendations?: string[];
        metrics?: any;
        evidence?: any;
    }>;
    /**
     * Handle troubleshooting requests with advanced AI capabilities
     */
    private handleTroubleshooting;
    /**
     * Handle optimization requests with advanced AI capabilities
     */
    private handleOptimization;
    /**
     * Handle analysis requests with advanced AI capabilities
     */
    private handleAnalysis;
    /**
     * Handle emergency requests with advanced AI capabilities
     */
    private handleEmergency;
    /**
     * Get current agent status
     */
    getStatus(): SupportAgentStatus;
    /**
     * Log MCP usage
     */
    private logMCPUsage;
    /**
     * Update heartbeat
     */
    private updateHeartbeat;
    /**
     * Initialize AI features
     */
    private initializeAIFeatures;
    /**
     * Initialize inventory optimization
     */
    private initializeInventoryOptimization;
    /**
     * Initialize advanced analytics
     */
    private initializeAdvancedAnalytics;
    /**
     * Initialize agent status
     */
    private initializeStatus;
    /**
     * Initialize AI configuration
     */
    private initializeAIConfig;
    /**
     * Update metrics
     */
    private updateMetrics;
    /**
     * Get CPU usage (simulated)
     */
    private getCPUUsage;
    /**
     * Get memory usage (simulated)
     */
    private getMemoryUsage;
    /**
     * Get response time (simulated)
     */
    private getResponseTime;
    /**
     * Get throughput (simulated)
     */
    private getThroughput;
    /**
     * Perform advanced analysis for troubleshooting
     */
    private performAdvancedAnalysis;
    /**
     * Run diagnostic tests
     */
    private runDiagnosticTests;
    /**
     * Generate intelligent solutions based on analysis
     */
    private generateIntelligentSolutions;
    /**
     * Get real-time performance metrics
     */
    getRealTimeMetrics(): Promise<{
        cpu: number;
        memory: number;
        responseTime: number;
        throughput: number;
        errorRate: number;
        uptime: number;
    }>;
    /**
     * Get advanced analytics and insights
     */
    getAdvancedAnalytics(): Promise<{
        performanceTrends: any[];
        optimizationOpportunities: string[];
        riskFactors: string[];
        recommendations: string[];
    }>;
    /**
     * Analyze performance metrics for optimization
     */
    private analyzePerformanceMetrics;
    /**
     * Generate optimization plan
     */
    private generateOptimizationPlan;
    /**
     * Perform cost-benefit analysis
     */
    private performCostBenefitAnalysis;
    /**
     * Perform trend analysis
     */
    private performTrendAnalysis;
    /**
     * Perform predictive analysis
     */
    private performPredictiveAnalysis;
    /**
     * Perform risk assessment
     */
    private performRiskAssessment;
    /**
     * Generate intelligent insights
     */
    private generateIntelligentInsights;
    /**
     * Perform emergency assessment
     */
    private performEmergencyAssessment;
    /**
     * Identify critical issues
     */
    private identifyCriticalIssues;
    /**
     * Generate emergency plan
     */
    private generateEmergencyPlan;
    /**
     * Execute recovery actions
     */
    private executeRecoveryActions;
    /**
     * Cleanup resources
     */
    cleanup(): Promise<void>;
}
/**
 * Factory function to create Growth Engine Support Agent
 */
export declare function createGrowthEngineSupportAgent(config: SupportAgentConfig): GrowthEngineSupportAgent;
/**
 * Utility function to create default configuration
 */
export declare function createDefaultSupportAgentConfig(agent: string, date: string, task: string, estimatedHours: number): SupportAgentConfig;
//# sourceMappingURL=growth-engine-support-agent.d.ts.map