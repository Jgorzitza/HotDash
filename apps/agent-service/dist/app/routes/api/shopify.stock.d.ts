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
export declare function loader({ request }: LoaderFunctionArgs): Promise<import("node_modules/undici-types").Response>;
//# sourceMappingURL=shopify.stock.d.ts.map