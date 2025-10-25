/**
 * Ad Performance API Route
 *
 * Returns campaign performance data, week-over-week comparisons,
 * best/worst performing campaigns, and budget alerts.
 *
 * @module app/routes/api.ads.performance
 */
import { type LoaderFunctionArgs } from "react-router";
/**
 * GET /api/ads/performance
 *
 * Query parameters:
 * - dateRange: "LAST_7_DAYS" | "LAST_30_DAYS" | "THIS_MONTH" (default: "LAST_7_DAYS")
 * - includeComparison: "true" | "false" (default: "false")
 *
 * @param request - Fetch request object
 * @returns JSON response with performance data and alerts
 */
export declare function loader({ request }: LoaderFunctionArgs): Promise<import("node_modules/undici-types").Response>;
//# sourceMappingURL=api.ads.performance.d.ts.map