/**
 * AI-Customer Growth Engine AI Main Service
 *
 * Orchestrates all Growth Engine AI functionality including Action Attribution,
 * CX to Product Loop, Memory Systems, and Advanced AI Features.
 * Implements the complete Growth Engine AI implementation for phases 9-12.
 *
 * @module app/services/ai-customer/growth-engine-ai
 * @see docs/design/growth-engine-final/docs/NORTH_STAR_ADDENDA.md
 */
/**
 * Growth Engine AI configuration
 */
export interface GrowthEngineAIConfig {
    actionAttribution: {
        enabled: boolean;
        ga4PropertyId: string;
        trackingEnabled: boolean;
    };
    cxProductLoop: {
        enabled: boolean;
        analysisWindow: number;
        minFrequency: number;
        autoProposal: boolean;
    };
    memorySystems: {
        enabled: boolean;
        autoSummarization: boolean;
        conversationRetention: number;
    };
    advancedFeatures: {
        handoffs: boolean;
        guardrails: boolean;
        approvalFlows: boolean;
    };
}
/**
 * Growth Engine AI status
 */
export interface GrowthEngineAIStatus {
    service: string;
    status: "active" | "inactive" | "error";
    lastActivity: string;
    metrics: {
        actionsTracked: number;
        conversationsAnalyzed: number;
        memoryEntries: number;
        handoffsProcessed: number;
        approvalsHandled: number;
    };
    health: {
        cpu: number;
        memory: number;
        responseTime: number;
        errorRate: number;
    };
}
/**
 * Growth Engine AI implementation results
 */
export interface GrowthEngineAIResults {
    actionAttribution: {
        activeActions: number;
        topPerformingActions: Array<{
            actionKey: string;
            realizedROI: number;
            confidence: number;
        }>;
        ga4Integration: boolean;
    };
    cxProductLoop: {
        themesAnalyzed: number;
        miniTasksProposed: number;
        tasksApproved: number;
        weeklyTarget: number;
        targetMet: boolean;
    };
    memorySystems: {
        conversationsStored: number;
        approvalsTracked: number;
        actionExecutions: number;
        searchPerformance: number;
    };
    advancedFeatures: {
        handoffsConfigured: boolean;
        guardrailsActive: number;
        approvalFlowsActive: number;
        performanceMetrics: Record<string, any>;
    };
}
/**
 * Growth Engine AI Main Service
 */
export declare class GrowthEngineAIService {
    private config;
    private status;
    constructor(config?: Partial<GrowthEngineAIConfig>);
    /**
     * Initialize Growth Engine AI with all components
     */
    initialize(): Promise<void>;
    /**
     * Execute Growth Engine AI workflow
     */
    executeWorkflow(): Promise<GrowthEngineAIResults>;
    /**
     * Get Growth Engine AI status
     */
    getStatus(): GrowthEngineAIStatus;
    /**
     * Get Growth Engine AI configuration
     */
    getConfig(): GrowthEngineAIConfig;
    /**
     * Update configuration
     */
    updateConfig(updates: Partial<GrowthEngineAIConfig>): void;
    /**
     * Initialize Action Attribution
     */
    private initializeActionAttribution;
    /**
     * Initialize CX to Product Loop
     */
    private initializeCXProductLoop;
    /**
     * Initialize Memory Systems
     */
    private initializeMemorySystems;
    /**
     * Initialize Advanced AI Features
     */
    private initializeAdvancedFeatures;
    /**
     * Execute Action Attribution workflow
     */
    private executeActionAttributionWorkflow;
    /**
     * Execute CX to Product Loop workflow
     */
    private executeCXProductLoopWorkflow;
    /**
     * Execute Memory Systems workflow
     */
    private executeMemorySystemsWorkflow;
    /**
     * Execute Advanced AI Features workflow
     */
    private executeAdvancedFeaturesWorkflow;
    /**
     * Configure default guardrails
     */
    private configureDefaultGuardrails;
    /**
     * Configure default approval flows
     */
    private configureDefaultApprovalFlows;
}
/**
 * Default Growth Engine AI service instance
 */
export declare const growthEngineAIService: GrowthEngineAIService;
//# sourceMappingURL=growth-engine-ai.d.ts.map