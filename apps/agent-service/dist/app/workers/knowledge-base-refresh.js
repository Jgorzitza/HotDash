/**
 * Knowledge Base Refresh Service
 * AI-KB-REFRESH-001: Implement Knowledge Base Auto-Refresh
 *
 * Integrates with LlamaIndex MCP server to trigger knowledge base refresh.
 * Handles async job processing, error handling, and retry logic.
 *
 * @module app/workers/knowledge-base-refresh
 */
import { logDecision } from '~/services/decisions.server';
/**
 * Knowledge Base Refresh Service
 *
 * Manages knowledge base refresh operations via LlamaIndex MCP server
 */
export class KnowledgeBaseRefreshService {
    mcpUrl;
    status;
    refreshQueue = [];
    isProcessing = false;
    constructor(mcpUrl) {
        this.mcpUrl = mcpUrl || process.env.LLAMAINDEX_MCP_URL || 'https://hotdash-llamaindex-mcp.fly.dev';
        this.status = {
            isRefreshing: false,
            refreshCount: 0,
            errorCount: 0,
            averageDurationMs: 0,
        };
    }
    /**
     * Trigger a knowledge base refresh
     *
     * @param request - Refresh request details
     * @returns Refresh result with status and metrics
     */
    async refresh(request = {}) {
        const requestId = request.requestId || `refresh-${Date.now()}`;
        const startTime = new Date();
        console.log(`[KB Refresh] Starting refresh: ${requestId}`);
        try {
            // Call LlamaIndex MCP server refresh_index tool
            const mcpResponse = await this.callMCPRefreshIndex();
            const endTime = new Date();
            const durationMs = endTime.getTime() - startTime.getTime();
            // Update status
            this.status.lastRefresh = endTime;
            this.status.lastRefreshSuccess = true;
            this.status.refreshCount++;
            this.updateAverageDuration(durationMs);
            const result = {
                success: true,
                requestId,
                startTime,
                endTime,
                durationMs,
                filesProcessed: request.files?.length,
                mcpResponse,
            };
            console.log(`[KB Refresh] ✅ Refresh complete: ${requestId} (${durationMs}ms)`);
            // Log to decision log
            await logDecision({
                scope: 'build',
                actor: 'ai-knowledge',
                action: 'kb_refresh_complete',
                rationale: `Knowledge base refresh completed successfully`,
                payload: {
                    requestId,
                    durationMs,
                    filesProcessed: request.files?.length,
                    manual: request.manual,
                    refreshCount: this.status.refreshCount,
                },
            });
            return result;
        }
        catch (error) {
            const endTime = new Date();
            const durationMs = endTime.getTime() - startTime.getTime();
            // Update status
            this.status.lastRefresh = endTime;
            this.status.lastRefreshSuccess = false;
            this.status.errorCount++;
            const result = {
                success: false,
                requestId,
                startTime,
                endTime,
                durationMs,
                filesProcessed: request.files?.length,
                error: error.message,
            };
            console.error(`[KB Refresh] ❌ Refresh failed: ${requestId}`, error);
            // Log error to decision log (without status field to avoid constraint violation)
            await logDecision({
                scope: 'build',
                actor: 'ai-knowledge',
                action: 'kb_refresh_failed',
                rationale: `Knowledge base refresh failed: ${error.message}`,
                payload: {
                    requestId,
                    durationMs,
                    error: error.message,
                    errorCount: this.status.errorCount,
                },
            });
            return result;
        }
    }
    /**
     * Queue a refresh request for async processing
     *
     * @param request - Refresh request to queue
     */
    async queueRefresh(request = {}) {
        const requestId = request.requestId || `refresh-${Date.now()}`;
        console.log(`[KB Refresh] Queueing refresh: ${requestId}`);
        this.refreshQueue.push({ ...request, requestId });
        // Start processing queue if not already processing
        if (!this.isProcessing) {
            this.processQueue();
        }
    }
    /**
     * Process queued refresh requests
     */
    async processQueue() {
        if (this.isProcessing) {
            return;
        }
        this.isProcessing = true;
        while (this.refreshQueue.length > 0) {
            const request = this.refreshQueue.shift();
            if (request) {
                await this.refresh(request);
                // Wait 1 second between refreshes to avoid overwhelming the MCP server
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
        this.isProcessing = false;
    }
    /**
     * Get current refresh status
     */
    getStatus() {
        return { ...this.status };
    }
    /**
     * Call LlamaIndex MCP server refresh_index tool
     */
    async callMCPRefreshIndex() {
        const url = `${this.mcpUrl}/mcp/tools/call`;
        const payload = {
            name: 'refresh_index',
            arguments: {},
        };
        console.log(`[KB Refresh] Calling MCP: ${url}`);
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
            signal: AbortSignal.timeout(180000), // 180 second timeout (3 minutes)
        });
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`MCP call failed: ${response.status} ${response.statusText} - ${errorText}`);
        }
        const result = await response.json();
        // Check for MCP error response
        if (result.isError) {
            throw new Error(`MCP tool error: ${result.content?.[0]?.text || 'Unknown error'}`);
        }
        return result;
    }
    /**
     * Update average duration metric
     */
    updateAverageDuration(durationMs) {
        const totalDuration = this.status.averageDurationMs * (this.status.refreshCount - 1);
        this.status.averageDurationMs = (totalDuration + durationMs) / this.status.refreshCount;
    }
    /**
     * Test MCP server connectivity
     */
    async testConnection() {
        try {
            const url = `${this.mcpUrl}/health`;
            const response = await fetch(url, {
                signal: AbortSignal.timeout(5000),
            });
            if (!response.ok) {
                return false;
            }
            const health = await response.json();
            return health.status === 'ok' && health.tools?.includes('refresh_index');
        }
        catch (error) {
            console.error('[KB Refresh] Connection test failed:', error);
            return false;
        }
    }
}
/**
 * Singleton instance
 */
let refreshServiceInstance = null;
/**
 * Get or create the refresh service singleton
 */
export function getRefreshService() {
    if (!refreshServiceInstance) {
        refreshServiceInstance = new KnowledgeBaseRefreshService();
    }
    return refreshServiceInstance;
}
/**
 * Create a new refresh service instance (for testing)
 */
export function createRefreshService(mcpUrl) {
    return new KnowledgeBaseRefreshService(mcpUrl);
}
//# sourceMappingURL=knowledge-base-refresh.js.map