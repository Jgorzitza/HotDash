/**
 * API Route: Shopify Stock Risk
 *
 * GET /api/shopify/stock
 *
 * Purpose: Calculate stock risk (items with WOS < 14 days)
 * Owner: integrations agent
 * Date: 2025-10-15
 *
 * Features:
 * - Read-only GraphQL query
 * - Audit logging to DashboardFact
 * - 5-minute caching
 * - Error handling with structured errors
 *
 * Security:
 * - Requires Shopify authentication
 * - No PII in logs
 * - Read-only operations only
 */

import type { LoaderFunctionArgs } from "react-router";
// React Router 7: Use Response.json() from "~/utils/http.server";
import { getShopifyServiceContext } from "../../services/shopify/client";
import { ServiceError } from "../../services/types";
import { logger } from "../../utils/logger.server";
import { recordDashboardFact } from "../../services/facts.server";
import { toInputJson } from "../../services/json";

// Cache configuration
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const LOW_STOCK_THRESHOLD = 10; // Items with quantity < 10
const CRITICAL_WOS_DAYS = 14; // Weeks of supply threshold

// In-memory cache
const cache = new Map<string, { data: any; expiresAt: number }>();

const STOCK_RISK_QUERY = `#graphql
  query StockRiskMetrics($first: Int!, $query: String!) {
    productVariants(first: $first, query: $query) {
      edges {
        node {
          id
          title
          sku
          inventoryQuantity
          product {
            id
            title
          }
          inventoryItem {
            id
            inventoryLevels(first: 5) {
              edges {
                node {
                  id
                  location {
                    id
                    name
                  }
                  quantities(names: ["available"]) {
                    name
                    quantity
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

interface StockRiskData {
  atRiskCount: number;
  criticalCount: number; // WOS < 14 days
  lowStockThreshold: number;
  totalVariantsChecked: number;
  generatedAt: string;
}

/**
 * GET /api/shopify/stock
 *
 * Calculate stock risk (items with WOS < 14 days).
 *
 * Response:
 * {
 *   "atRiskCount": 12,
 *   "criticalCount": 5,
 *   "lowStockThreshold": 10,
 *   "totalVariantsChecked": 150,
 *   "generatedAt": "2025-10-15T14:00:00.000Z"
 * }
 */
export async function loader({ request }: LoaderFunctionArgs) {
  const startTime = Date.now();

  try {
    // Get authenticated Shopify context
    const context = await getShopifyServiceContext(request);
    const { admin, shopDomain } = context;

    // Check cache
    const cacheKey = `stock:${shopDomain}`;
    const cached = cache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      logger.info("Stock risk data served from cache", {
        shopDomain,
        durationMs: Date.now() - startTime,
      });
      return Response.json(cached.data, {
        headers: {
          "Cache-Control": "private, max-age=300",
          "X-Cache": "HIT",
        },
      });
    }

    logger.info("Fetching stock risk data from Shopify", {
      shopDomain,
      lowStockThreshold: LOW_STOCK_THRESHOLD,
    });

    // Fetch low stock variants
    const response = await admin.graphql(STOCK_RISK_QUERY, {
      variables: {
        first: 50, // Max variants to check
        query: `inventory_quantity:<${LOW_STOCK_THRESHOLD}`,
      },
    });

    if (!response.ok) {
      throw new ServiceError(
        `Shopify stock risk query failed with ${response.status}`,
        {
          scope: "shopify.stock",
          code: `${response.status}`,
          retryable: response.status >= 500,
        },
      );
    }

    const payload = await response.json();

    if (payload.errors?.length) {
      throw new ServiceError(
        payload.errors.map((err: any) => err.message).join("; "),
        {
          scope: "shopify.stock",
          code: "GRAPHQL_ERROR",
        },
      );
    }

    // Calculate stock risk
    const variants = payload.data?.productVariants.edges ?? [];
    let atRiskCount = 0;
    let criticalCount = 0;

    // Estimate average daily sales (placeholder - would need historical data)
    const averageDailySales = 1; // Conservative estimate

    for (const { node } of variants) {
      const quantity = node.inventoryQuantity ?? 0;
      atRiskCount++;

      // Calculate weeks of supply (WOS)
      const daysOfCover =
        averageDailySales > 0 ? quantity / averageDailySales : 0;

      if (daysOfCover < CRITICAL_WOS_DAYS) {
        criticalCount++;
      }
    }

    const stockRiskData: StockRiskData = {
      atRiskCount,
      criticalCount,
      lowStockThreshold: LOW_STOCK_THRESHOLD,
      totalVariantsChecked: variants.length,
      generatedAt: new Date().toISOString(),
    };

    // Log to audit trail
    await recordDashboardFact({
      shopDomain,
      factType: "shopify.stock",
      scope: "dashboard",
      value: toInputJson(stockRiskData),
      metadata: toInputJson({
        lowStockThreshold: LOW_STOCK_THRESHOLD,
        criticalWOSDays: CRITICAL_WOS_DAYS,
        generatedAt: stockRiskData.generatedAt,
      }),
    });

    // Cache the result
    cache.set(cacheKey, {
      data: stockRiskData,
      expiresAt: Date.now() + CACHE_TTL_MS,
    });

    const duration = Date.now() - startTime;

    logger.info("Stock risk data fetched successfully", {
      shopDomain,
      atRiskCount: stockRiskData.atRiskCount,
      criticalCount: stockRiskData.criticalCount,
      durationMs: duration,
    });

    return Response.json(stockRiskData, {
      headers: {
        "Cache-Control": "private, max-age=300",
        "X-Response-Time": `${duration}ms`,
        "X-Cache": "MISS",
      },
    });
  } catch (error) {
    const duration = Date.now() - startTime;

    if (error instanceof ServiceError) {
      logger.error("Stock risk service error", {
        message: error.message,
        scope: error.scope,
        code: error.code,
        durationMs: duration,
      });

      return Response.json(
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

    logger.error("Stock risk unexpected error", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      durationMs: duration,
    });

    return Response.json(
      {
        error: {
          message:
            "An unexpected error occurred while fetching stock risk data",
          scope: "shopify.stock",
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
