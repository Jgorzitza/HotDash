/**
 * Daily Knowledge Base Refresh Cron Job
 * AI-KB-REFRESH-001: Implement Knowledge Base Auto-Refresh
 *
 * POST /api/cron/knowledge-base-refresh
 *
 * Scheduled job that runs daily to refresh the knowledge base.
 * Can be triggered by:
 * - GitHub Actions cron schedule
 * - External cron service (e.g., cron-job.org)
 * - Supabase pg_cron
 * - Manual API call with auth token
 *
 * @module app/routes/api.cron.knowledge-base-refresh
 */
import type { ActionFunctionArgs } from '@remix-run/node';
/**
 * POST /api/cron/knowledge-base-refresh
 *
 * Trigger daily knowledge base refresh
 *
 * Headers:
 * - Authorization: Bearer <CRON_SECRET>
 *
 * Response:
 * {
 *   "success": boolean,
 *   "requestId": string,
 *   "durationMs": number,
 *   "message": string,
 *   "timestamp": string
 * }
 */
export declare function action({ request }: ActionFunctionArgs): Promise<import("@remix-run/node").TypedResponse<{
    success: boolean;
    error: string;
}> | import("@remix-run/node").TypedResponse<{
    success: boolean;
    requestId: string;
    durationMs: number;
    message: string;
    timestamp: string;
}>>;
//# sourceMappingURL=api.cron.knowledge-base-refresh.d.ts.map