/**
 * Trend Forecasting API Route
 *
 * GET /api/analytics/forecast
 * Query params:
 * - metric: "impressions" | "clicks" | "conversions" | "revenue" | "roas" | "all" (required)
 * - project: Shop domain (default: "occ")
 * - days: Forecast period - 7, 14, or 30 days (default: 7)
 * - historical: Historical data period in days (default: 90)
 *
 * Returns trend forecast with predictions and confidence intervals
 * Uses Response.json() per React Router 7 pattern
 */
import type { LoaderFunctionArgs } from "react-router";
export declare function loader({ request }: LoaderFunctionArgs): Promise<import("node_modules/undici-types").Response>;
//# sourceMappingURL=api.analytics.forecast.d.ts.map