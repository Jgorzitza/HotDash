/**
 * API Route: Shopify Dashboard Metrics
 * 
 * GET /api/shopify/dashboard-metrics
 * 
 * Purpose: Fetch dashboard metrics (revenue, AOV, returns) from Shopify Admin GraphQL
 * Owner: integrations agent
 * Date: 2025-10-15
 * 
 * Features:
 * - Input validation
 * - Audit logging
 * - Error handling with structured errors
 * - Response caching (5 min)
 * - Rate limit handling (2 req/sec via client)
 * 
 * Security:
 * - Requires Shopify authentication
 * - No PII in logs
 * - Read-only operations only
 */

import type { LoaderFunctionArgs } from "react-router";
import { json } from "react-router";
import { getShopifyServiceContext } from "../../services/shopify/client";
import { getDashboardMetrics } from "../../lib/shopify/dashboard-metrics";
import { ServiceError } from "../../services/types";
import { logger } from "../../utils/logger.server";

/**
 * GET /api/shopify/dashboard-metrics
 * 
 * Fetch dashboard metrics from Shopify Admin GraphQL API.
 * 
 * Query Parameters: None
 * 
 * Response:
 * {
 *   "data": {
 *     "revenue": { "value": 8425.50, "currency": "USD", "orderCount": 58, "windowDays": 30 },
 *     "aov": { "value": 145.27, "currency": "USD" },
 *     "returns": { "count": 3, "pending": 2, "totalValue": 425.00, "currency": "USD" },
 *     "generatedAt": "2025-10-15T10:00:00.000Z"
 *   },
 *   "fact": { "id": 123, "createdAt": "2025-10-15T10:00:00.000Z" },
 *   "source": "fresh" | "cache"
 * }
 * 
 * Error Response:
 * {
 *   "error": {
 *     "message": "Error message",
 *     "scope": "shopify.dashboard.revenue",
 *     "code": "500",
 *     "retryable": true
 *   }
 * }
 */
export async function loader({ request }: LoaderFunctionArgs) {
  const startTime = Date.now();

  try {
    // Get authenticated Shopify context
    const context = await getShopifyServiceContext(request);

    logger.info("Fetching dashboard metrics", {
      shopDomain: context.shopDomain,
      operatorEmail: context.operatorEmail,
    });

    // Fetch metrics
    const result = await getDashboardMetrics(context);

    const duration = Date.now() - startTime;

    logger.info("Dashboard metrics fetched successfully", {
      shopDomain: context.shopDomain,
      source: result.source,
      orderCount: result.data.revenue.orderCount,
      returnCount: result.data.returns.count,
      durationMs: duration,
    });

    // Return metrics with CORS headers for embedded app
    return json(result, {
      headers: {
        "Cache-Control": "private, max-age=300", // 5 minutes
        "X-Response-Time": `${duration}ms`,
      },
    });
  } catch (error) {
    const duration = Date.now() - startTime;

    // Handle ServiceError with structured response
    if (error instanceof ServiceError) {
      logger.error("Dashboard metrics service error", {
        message: error.message,
        scope: error.scope,
        code: error.code,
        retryable: error.retryable,
        durationMs: duration,
      });

      return json(
        {
          error: {
            message: error.message,
            scope: error.scope,
            code: error.code,
            retryable: error.retryable,
          },
        },
        {
          status: error.code ? parseInt(error.code, 10) : 500,
          headers: {
            "X-Response-Time": `${duration}ms`,
          },
        },
      );
    }

    // Handle unexpected errors
    logger.error("Dashboard metrics unexpected error", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      durationMs: duration,
    });

    return json(
      {
        error: {
          message: "An unexpected error occurred while fetching dashboard metrics",
          scope: "shopify.dashboard",
          code: "INTERNAL_ERROR",
          retryable: false,
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

