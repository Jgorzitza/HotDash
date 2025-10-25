/**
 * API Route: Analytics Revenue
 *
 * GET /api/analytics/revenue
 *
 * Returns revenue metrics for the last 30 days with trend comparison.
 * Used by dashboard tiles to display revenue, AOV, and transaction data.
 *
 * Enhanced with:
 * - Zod schema validation
 * - Sampling detection and enforcement
 * - Combined GA4 + Shopify data (when available)
 */
import { type LoaderFunctionArgs } from "react-router";
export declare function loader({ request }: LoaderFunctionArgs): Promise<import("node_modules/undici-types").Response>;
//# sourceMappingURL=api.analytics.revenue.d.ts.map