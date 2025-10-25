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

import type { ActionFunctionArgs } from 'react-router';
import { getRefreshService } from '~/workers/knowledge-base-refresh';
import { logDecision } from '~/services/decisions.server';

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
export async function action({ request }: ActionFunctionArgs) {
  try {
    // Verify this is a POST request
    if (request.method !== 'POST') {
      return Response.json(
        { success: false, error: 'Method not allowed' },
        { status: 405 }
      );
    }

    // Verify authorization
    const authHeader = request.headers.get('authorization');
    const expectedAuth = process.env.CRON_SECRET || 'default-cron-secret';
    
    if (authHeader !== `Bearer ${expectedAuth}`) {
      console.warn('[KB Cron] Unauthorized cron request');
      
      await logDecision({
        scope: 'build',
        actor: 'ai-knowledge',
        action: 'kb_cron_unauthorized',
        rationale: 'Unauthorized knowledge base cron request',
        payload: {
          ip: request.headers.get('x-forwarded-for'),
          userAgent: request.headers.get('user-agent'),
        },
      });

      return Response.json(
        {
          success: false,
          error: 'Unauthorized cron request',
        },
        { status: 401 }
      );
    }


    // Log cron job start
    await logDecision({
      scope: 'build',
      actor: 'ai-knowledge',
      action: 'kb_cron_started',
      rationale: 'Daily knowledge base refresh cron job started',
      payload: {
        timestamp: new Date().toISOString(),
      },
    });

    // Get refresh service and trigger refresh
    const refreshService = getRefreshService();
    
    // Test MCP server connectivity first
    const isConnected = await refreshService.testConnection();
    if (!isConnected) {
      console.error('[KB Cron] MCP server not reachable');
      
      await logDecision({
        scope: 'build',
        actor: 'ai-knowledge',
        action: 'kb_cron_mcp_unreachable',
        rationale: 'LlamaIndex MCP server not reachable during cron job',
        payload: {
          timestamp: new Date().toISOString(),
        },
      });

      return Response.json(
        {
          success: false,
          error: 'MCP server not reachable',
          message: 'Knowledge base refresh failed - MCP server unavailable',
        },
        { status: 503 }
      );
    }

    // Trigger refresh
    const result = await refreshService.refresh({
      manual: false,
      requestId: `cron-${Date.now()}`,
    });

    if (result.success) {

      await logDecision({
        scope: 'build',
        actor: 'ai-knowledge',
        action: 'kb_cron_complete',
        rationale: 'Daily knowledge base refresh cron job completed successfully',
        payload: {
          requestId: result.requestId,
          durationMs: result.durationMs,
          timestamp: new Date().toISOString(),
        },
      });

      return Response.json({
        success: true,
        requestId: result.requestId,
        durationMs: result.durationMs,
        message: 'Daily knowledge base refresh completed successfully',
        timestamp: new Date().toISOString(),
      });
    } else {
      console.error(`[KB Cron] ❌ Daily refresh failed: ${result.error}`);

      await logDecision({
        scope: 'build',
        actor: 'ai-knowledge',
        action: 'kb_cron_failed',
        rationale: `Daily knowledge base refresh cron job failed: ${result.error}`,
        payload: {
          requestId: result.requestId,
          error: result.error,
          timestamp: new Date().toISOString(),
        },
      });

      return Response.json(
        {
          success: false,
          requestId: result.requestId,
          error: result.error,
          message: 'Daily knowledge base refresh failed',
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('[KB Cron] Error:', error);

    await logDecision({
      scope: 'build',
      actor: 'ai-knowledge',
      action: 'kb_cron_error',
      rationale: `Knowledge base cron job error: ${(error as Error).message}`,
      payload: {
        error: (error as Error).message,
        timestamp: new Date().toISOString(),
      },
    });

    return Response.json(
      {
        success: false,
        error: (error as Error).message,
        message: 'Internal server error during cron job',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

