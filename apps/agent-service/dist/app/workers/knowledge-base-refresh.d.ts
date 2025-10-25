/**
 * Knowledge Base Refresh Service
 * AI-KB-REFRESH-001: Implement Knowledge Base Auto-Refresh
 *
 * Integrates with LlamaIndex MCP server to trigger knowledge base refresh.
 * Handles async job processing, error handling, and retry logic.
 *
 * @module app/workers/knowledge-base-refresh
 */
export interface RefreshRequest {
    /** Files that triggered the refresh */
    files?: string[];
    /** Whether this is a manual refresh */
    manual?: boolean;
    /** Request ID for tracking */
    requestId?: string;
}
export interface RefreshResult {
    success: boolean;
    requestId: string;
    startTime: Date;
    endTime: Date;
    durationMs: number;
    filesProcessed?: number;
    error?: string;
    mcpResponse?: any;
}
export interface RefreshStatus {
    isRefreshing: boolean;
    lastRefresh?: Date;
    lastRefreshSuccess?: boolean;
    refreshCount: number;
    errorCount: number;
    averageDurationMs: number;
}
/**
 * Knowledge Base Refresh Service
 *
 * Manages knowledge base refresh operations via LlamaIndex MCP server
 */
export declare class KnowledgeBaseRefreshService {
    private mcpUrl;
    private status;
    private refreshQueue;
    private isProcessing;
    constructor(mcpUrl?: string);
    /**
     * Trigger a knowledge base refresh
     *
     * @param request - Refresh request details
     * @returns Refresh result with status and metrics
     */
    refresh(request?: RefreshRequest): Promise<RefreshResult>;
    /**
     * Queue a refresh request for async processing
     *
     * @param request - Refresh request to queue
     */
    queueRefresh(request?: RefreshRequest): Promise<void>;
    /**
     * Process queued refresh requests
     */
    private processQueue;
    /**
     * Get current refresh status
     */
    getStatus(): RefreshStatus;
    /**
     * Call LlamaIndex MCP server refresh_index tool
     */
    private callMCPRefreshIndex;
    /**
     * Update average duration metric
     */
    private updateAverageDuration;
    /**
     * Test MCP server connectivity
     */
    testConnection(): Promise<boolean>;
}
/**
 * Get or create the refresh service singleton
 */
export declare function getRefreshService(): KnowledgeBaseRefreshService;
/**
 * Create a new refresh service instance (for testing)
 */
export declare function createRefreshService(mcpUrl?: string): KnowledgeBaseRefreshService;
//# sourceMappingURL=knowledge-base-refresh.d.ts.map