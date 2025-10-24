/**
 * Knowledge Base Refresh API Endpoint
 * AI-KB-REFRESH-001: Implement Knowledge Base Auto-Refresh
 *
 * POST /api/knowledge-base/refresh
 *
 * Triggers manual knowledge base refresh via LlamaIndex MCP server.
 * Can be called manually or by scheduled jobs.
 *
 * @module app/routes/api.knowledge-base.refresh
 */
import { json } from '@remix-run/node';
import { getRefreshService } from '~/workers/knowledge-base-refresh';
import { logDecision } from '~/services/decisions.server';
/**
 * POST /api/knowledge-base/refresh
 *
 * Trigger a manual knowledge base refresh
 *
 * Request body (optional):
 * {
 *   "async": boolean,  // Queue for async processing (default: false)
 *   "files": string[]  // Files that triggered refresh (optional)
 * }
 *
 * Response:
 * {
 *   "success": boolean,
 *   "requestId": string,
 *   "durationMs": number,
 *   "message": string
 * }
 */
export async function action({ request }) {
    try {
        // Verify this is a POST request
        if (request.method !== 'POST') {
            return json({ success: false, error: 'Method not allowed' }, { status: 405 });
        }
        // Optional: Verify authorization
        // For now, we'll allow any authenticated request
        // In production, you might want to check for admin role or API key
        // Parse request body
        let body = {};
        try {
            const text = await request.text();
            if (text) {
                body = JSON.parse(text);
            }
        }
        catch {
            // Empty body is OK
        }
        const { async = false, files = [] } = body;
        // Get refresh service
        const refreshService = getRefreshService();
        // Log manual refresh request
        await logDecision({
            scope: 'build',
            actor: 'ai-knowledge',
            action: 'kb_manual_refresh_requested',
            rationale: 'Manual knowledge base refresh requested via API',
            payload: {
                async,
                filesCount: files.length,
                userAgent: request.headers.get('user-agent'),
            },
        });
        if (async) {
            // Queue for async processing
            const requestId = `manual-${Date.now()}`;
            await refreshService.queueRefresh({
                files,
                manual: true,
                requestId,
            });
            return json({
                success: true,
                requestId,
                message: 'Refresh queued for async processing',
                async: true,
            });
        }
        else {
            // Synchronous refresh
            const result = await refreshService.refresh({
                files,
                manual: true,
            });
            if (result.success) {
                return json({
                    success: true,
                    requestId: result.requestId,
                    durationMs: result.durationMs,
                    filesProcessed: result.filesProcessed,
                    message: 'Knowledge base refreshed successfully',
                });
            }
            else {
                return json({
                    success: false,
                    requestId: result.requestId,
                    error: result.error,
                    message: 'Knowledge base refresh failed',
                }, { status: 500 });
            }
        }
    }
    catch (error) {
        console.error('[KB Refresh API] Error:', error);
        // Log error
        await logDecision({
            scope: 'build',
            actor: 'ai-knowledge',
            action: 'kb_manual_refresh_error',
            rationale: `Manual refresh API error: ${error.message}`,
            payload: {
                error: error.message,
            },
        });
        return json({
            success: false,
            error: error.message,
            message: 'Internal server error',
        }, { status: 500 });
    }
}
/**
 * GET /api/knowledge-base/refresh
 *
 * Get refresh status
 *
 * Response:
 * {
 *   "isRefreshing": boolean,
 *   "lastRefresh": string,
 *   "lastRefreshSuccess": boolean,
 *   "refreshCount": number,
 *   "errorCount": number,
 *   "averageDurationMs": number
 * }
 */
export async function loader() {
    try {
        const refreshService = getRefreshService();
        const status = refreshService.getStatus();
        return json({
            ...status,
            lastRefresh: status.lastRefresh?.toISOString(),
        });
    }
    catch (error) {
        console.error('[KB Refresh API] Error getting status:', error);
        return json({
            error: error.message,
            message: 'Failed to get refresh status',
        }, { status: 500 });
    }
}
//# sourceMappingURL=api.knowledge-base.refresh.js.map