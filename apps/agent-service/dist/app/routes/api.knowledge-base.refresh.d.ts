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
import type { ActionFunctionArgs } from '@remix-run/node';
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
export declare function action({ request }: ActionFunctionArgs): Promise<import("@remix-run/node").TypedResponse<{
    success: boolean;
    error: string;
}> | import("@remix-run/node").TypedResponse<{
    success: boolean;
    requestId: string;
    message: string;
    async: boolean;
}> | import("@remix-run/node").TypedResponse<{
    success: boolean;
    requestId: string;
    durationMs: number;
    filesProcessed: number;
    message: string;
}>>;
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
export declare function loader(): Promise<import("@remix-run/node").TypedResponse<{
    lastRefresh: string;
    isRefreshing: boolean;
    lastRefreshSuccess?: boolean;
    refreshCount: number;
    errorCount: number;
    averageDurationMs: number;
}> | import("@remix-run/node").TypedResponse<{
    error: string;
    message: string;
}>>;
//# sourceMappingURL=api.knowledge-base.refresh.d.ts.map