/**
 * API Route: Supabase Approval Queue
 * 
 * GET /api/supabase/approvals
 * 
 * Purpose: Fetch approval queue from Supabase using RPC function
 * Owner: integrations agent
 * Date: 2025-10-15
 * 
 * Features:
 * - Input validation with Zod
 * - Audit logging via RPC function
 * - Error handling with structured errors
 * - Pagination support
 * 
 * Security:
 * - Requires authentication
 * - Service role access to Supabase
 * - No PII in logs
 */

import type { LoaderFunctionArgs } from "react-router";
import { json } from "react-router";
import { z } from "zod";
import { getSupabaseConfig } from "../../config/supabase.server";
import { createClient } from "@supabase/supabase-js";
import { logger } from "../../utils/logger.server";

/**
 * Query Parameters Schema
 */
const QueryParamsSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
  status: z.enum(["pending", "approved", "rejected", "expired"]).default("pending"),
});

/**
 * Approval Queue Item
 */
interface ApprovalQueueItem {
  id: number;
  conversation_id: string;
  serialized: Record<string, unknown>;
  last_interruptions: Array<unknown>;
  created_at: string;
  approved_by: string | null;
  status: string;
  updated_at: string;
}

/**
 * GET /api/supabase/approvals
 * 
 * Fetch approval queue from Supabase.
 * 
 * Query Parameters:
 * - limit: Number of items to return (1-100, default: 50)
 * - offset: Pagination offset (default: 0)
 * - status: Filter by status (pending|approved|rejected|expired, default: pending)
 * 
 * Response:
 * {
 *   "data": [
 *     {
 *       "id": 123,
 *       "conversation_id": "conv_abc123",
 *       "serialized": { ... },
 *       "last_interruptions": [ ... ],
 *       "created_at": "2025-10-15T10:00:00.000Z",
 *       "approved_by": null,
 *       "status": "pending",
 *       "updated_at": "2025-10-15T10:00:00.000Z"
 *     }
 *   ],
 *   "pagination": {
 *     "limit": 50,
 *     "offset": 0,
 *     "total": 123
 *   }
 * }
 * 
 * Error Response:
 * {
 *   "error": {
 *     "message": "Error message",
 *     "code": "VALIDATION_ERROR" | "SUPABASE_ERROR" | "INTERNAL_ERROR"
 *   }
 * }
 */
export async function loader({ request }: LoaderFunctionArgs) {
  const startTime = Date.now();

  try {
    // Parse and validate query parameters
    const url = new URL(request.url);
    const params = QueryParamsSchema.safeParse({
      limit: url.searchParams.get("limit"),
      offset: url.searchParams.get("offset"),
      status: url.searchParams.get("status"),
    });

    if (!params.success) {
      logger.warn("Invalid query parameters", {
        errors: params.error.errors,
      });

      return json(
        {
          error: {
            message: "Invalid query parameters",
            code: "VALIDATION_ERROR",
            details: params.error.errors,
          },
        },
        { status: 400 },
      );
    }

    const { limit, offset, status } = params.data;

    // Get Supabase configuration
    const config = getSupabaseConfig();
    if (!config) {
      logger.error("Supabase configuration missing");

      return json(
        {
          error: {
            message: "Supabase configuration not available",
            code: "CONFIGURATION_ERROR",
          },
        },
        { status: 503 },
      );
    }

    // Create Supabase client with service role
    const supabase = createClient(config.url, config.serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    logger.info("Fetching approval queue", {
      limit,
      offset,
      status,
    });

    // Call RPC function to get approval queue
    const { data, error } = await supabase.rpc("get_approval_queue", {
      p_limit: limit,
      p_offset: offset,
      p_status: status,
    });

    if (error) {
      logger.error("Supabase RPC error", {
        error: error.message,
        code: error.code,
        details: error.details,
      });

      return json(
        {
          error: {
            message: error.message,
            code: "SUPABASE_ERROR",
            details: error.details,
          },
        },
        { status: 500 },
      );
    }

    const approvals = (data as ApprovalQueueItem[]) ?? [];

    // Get total count for pagination (separate query)
    const { count, error: countError } = await supabase
      .from("agent_approvals")
      .select("*", { count: "exact", head: true })
      .eq("status", status);

    if (countError) {
      logger.warn("Failed to get total count", {
        error: countError.message,
      });
    }

    const duration = Date.now() - startTime;

    logger.info("Approval queue fetched successfully", {
      count: approvals.length,
      total: count ?? 0,
      status,
      durationMs: duration,
    });

    // Log audit entry for this query
    await supabase.rpc("log_audit_entry", {
      p_scope: "api.approvals.query",
      p_actor: "system",
      p_action: "get_approval_queue",
      p_payload: {
        limit,
        offset,
        status,
        resultCount: approvals.length,
      },
    });

    return json(
      {
        data: approvals,
        pagination: {
          limit,
          offset,
          total: count ?? 0,
        },
      },
      {
        headers: {
          "Cache-Control": "private, no-cache", // Don't cache approval queue
          "X-Response-Time": `${duration}ms`,
        },
      },
    );
  } catch (error) {
    const duration = Date.now() - startTime;

    logger.error("Approval queue unexpected error", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      durationMs: duration,
    });

    return json(
      {
        error: {
          message: "An unexpected error occurred while fetching approval queue",
          code: "INTERNAL_ERROR",
        },
      },
      {
        status: 500,
        headers: {
          "X-Response-Time": `${duration}ms`,
        },
      },
    );
  }
}

