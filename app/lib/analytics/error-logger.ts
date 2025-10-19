/**
 * Analytics Error Logger
 *
 * Logs analytics errors to Supabase for historical tracking and debugging.
 * Requires analytics_errors table migration to be applied.
 *
 * Feature Flag: ANALYTICS_ERROR_LOGGING_ENABLED (default: false)
 */

import { createClient } from "@supabase/supabase-js";
import { getSupabaseConfig } from "~/config/supabase.server";

// ============================================================================
// Types
// ============================================================================

export interface AnalyticsError {
  endpoint: string;
  errorType: string;
  errorMessage: string;
  errorStack?: string;
  requestMethod?: string;
  requestPath?: string;
  requestIp?: string;
  userAgent?: string;
  httpStatus?: number;
  responseTimeMs?: number;
}

// ============================================================================
// Feature Flag
// ============================================================================

function isErrorLoggingEnabled(): boolean {
  return process.env.ANALYTICS_ERROR_LOGGING_ENABLED === "true";
}

// ============================================================================
// Error Logging
// ============================================================================

/**
 * Log an analytics error to Supabase
 * Silently fails if error logging is disabled or Supabase is unavailable
 */
export async function logAnalyticsError(error: AnalyticsError): Promise<void> {
  // Check feature flag
  if (!isErrorLoggingEnabled()) {
    console.log("[Analytics Error Logger] Disabled, skipping log");
    return;
  }

  try {
    const config = getSupabaseConfig();
    if (!config) {
      console.warn("[Analytics Error Logger] Supabase not configured");
      return;
    }

    const client = createClient(config.url, config.serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { error: insertError } = await client
      .from("analytics_errors")
      .insert({
        endpoint: error.endpoint,
        error_type: error.errorType,
        error_message: error.errorMessage,
        error_stack: error.errorStack,
        request_method: error.requestMethod,
        request_path: error.requestPath,
        request_ip: error.requestIp,
        user_agent: error.userAgent,
        http_status: error.httpStatus,
        response_time_ms: error.responseTimeMs,
        occurred_at: new Date().toISOString(),
      });

    if (insertError) {
      console.error(
        "[Analytics Error Logger] Failed to log error:",
        insertError,
      );
    }
  } catch (err) {
    // Silently fail - don't throw errors from error logging
    console.error("[Analytics Error Logger] Exception:", err);
  }
}

/**
 * Helper to log errors from route handlers
 */
export async function logRouteError(
  request: Request,
  error: Error,
  responseTimeMs?: number,
): Promise<void> {
  const url = new URL(request.url);

  await logAnalyticsError({
    endpoint: url.pathname,
    errorType: error.name || "Error",
    errorMessage: error.message,
    errorStack: error.stack,
    requestMethod: request.method,
    requestPath: url.pathname,
    requestIp: request.headers.get("x-forwarded-for") || undefined,
    userAgent: request.headers.get("user-agent") || undefined,
    httpStatus: 500,
    responseTimeMs,
  });
}

// ============================================================================
// Error Retrieval (for debugging/monitoring)
// ============================================================================

/**
 * Get recent analytics errors
 */
export async function getRecentErrors(
  limit: number = 50,
): Promise<AnalyticsError[]> {
  if (!isErrorLoggingEnabled()) {
    return [];
  }

  try {
    const config = getSupabaseConfig();
    if (!config) return [];

    const client = createClient(config.url, config.serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data, error } = await client
      .from("analytics_errors")
      .select("*")
      .order("occurred_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("[Analytics Error Logger] Failed to fetch errors:", error);
      return [];
    }

    return (data || []).map((row: any) => ({
      endpoint: row.endpoint,
      errorType: row.error_type,
      errorMessage: row.error_message,
      errorStack: row.error_stack,
      requestMethod: row.request_method,
      requestPath: row.request_path,
      requestIp: row.request_ip,
      userAgent: row.user_agent,
      httpStatus: row.http_status,
      responseTimeMs: row.response_time_ms,
    }));
  } catch (err) {
    console.error("[Analytics Error Logger] Exception fetching errors:", err);
    return [];
  }
}

/**
 * Get error statistics for monitoring
 */
export async function getErrorStats(): Promise<{
  total: number;
  byEndpoint: Record<string, number>;
  byType: Record<string, number>;
  last24Hours: number;
}> {
  if (!isErrorLoggingEnabled()) {
    return {
      total: 0,
      byEndpoint: {},
      byType: {},
      last24Hours: 0,
    };
  }

  try {
    const config = getSupabaseConfig();
    if (!config) {
      return {
        total: 0,
        byEndpoint: {},
        byType: {},
        last24Hours: 0,
      };
    }

    const client = createClient(config.url, config.serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data, error } = await client
      .from("analytics_errors")
      .select("endpoint, error_type, occurred_at");

    if (error || !data) {
      return {
        total: 0,
        byEndpoint: {},
        byType: {},
        last24Hours: 0,
      };
    }

    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;

    const stats = {
      total: data.length,
      byEndpoint: {} as Record<string, number>,
      byType: {} as Record<string, number>,
      last24Hours: 0,
    };

    for (const row of data) {
      // Count by endpoint
      stats.byEndpoint[row.endpoint] =
        (stats.byEndpoint[row.endpoint] || 0) + 1;

      // Count by type
      stats.byType[row.error_type] = (stats.byType[row.error_type] || 0) + 1;

      // Count last 24 hours
      const occurredAt = new Date(row.occurred_at).getTime();
      if (occurredAt > oneDayAgo) {
        stats.last24Hours++;
      }
    }

    return stats;
  } catch (err) {
    console.error("[Analytics Error Logger] Exception getting stats:", err);
    return {
      total: 0,
      byEndpoint: {},
      byType: {},
      last24Hours: 0,
    };
  }
}
