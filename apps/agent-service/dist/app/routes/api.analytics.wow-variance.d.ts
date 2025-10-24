/**
 * API Route: WoW Variance
 *
 * GET /api/analytics/wow-variance?project=shop.myshopify.com&metric=revenue
 *
 * Returns Week-over-Week variance for sales metrics.
 * Used by Sales Modal to show trend comparisons.
 *
 * Query Parameters:
 * - project: Shop domain (required)
 * - metric: 'revenue' | 'orders' | 'conversion' (required)
 *
 * @see docs/directions/analytics.md ANALYTICS-005
 */
import { type LoaderFunctionArgs } from "react-router";
export declare function loader({ request }: LoaderFunctionArgs): Promise<import("node_modules/undici-types").Response>;
//# sourceMappingURL=api.analytics.wow-variance.d.ts.map