/**
 * API Route: CEO Agent Health Check
 *
 * GET /api/ceo-agent/health?timeRange=24h
 *
 * Monitors CEO Agent performance and health status.
 * Tracks response times, token usage, error rates, tool utilization.
 *
 * Query Parameters:
 * - timeRange: '1h' | '24h' | '7d' | '30d' (optional, default: '24h')
 *
 * @see docs/directions/ai-customer.md AI-CUSTOMER-012
 */

import { type LoaderFunctionArgs } from "react-router";
import { checkHealth, type HealthCheckResult } from "../services/ai-customer/monitoring";

/**
 * API Response structure
 */
interface HealthCheckResponse {
  success: boolean;
  data?: HealthCheckResult;
  error?: string;
  timestamp: string;
}

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const url = new URL(request.url);
    const timeRange = (url.searchParams.get('timeRange') || '24h') as '1h' | '24h' | '7d' | '30d';

    // Validate timeRange
    const validTimeRanges = ['1h', '24h', '7d', '30d'];
    if (!validTimeRanges.includes(timeRange)) {
      const errorResponse: HealthCheckResponse = {
        success: false,
        error: `Invalid timeRange parameter. Must be one of: ${validTimeRanges.join(', ')}`,
        timestamp: new Date().toISOString(),
      };
      return Response.json(errorResponse, { status: 400 });
    }

    // Get Supabase credentials from environment
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration');
    }

    // Check health
    const result = await checkHealth(
      timeRange,
      supabaseUrl,
      supabaseKey
    );

    const response: HealthCheckResponse = {
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    };

    return Response.json(response);
  } catch (error: any) {
    console.error('[API] CEO Agent health check error:', error);

    const errorResponse: HealthCheckResponse = {
      success: false,
      error: error.message || 'Failed to check health',
      timestamp: new Date().toISOString(),
    };

    return Response.json(errorResponse, { status: 500 });
  }
}

