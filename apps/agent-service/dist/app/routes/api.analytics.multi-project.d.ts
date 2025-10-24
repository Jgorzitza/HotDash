/**
 * Multi-Project Analytics API Route
 *
 * GET /api/analytics/multi-project
 * Query params:
 * - action: "summary" | "compare" | "rankings" | "top" (default: "summary")
 * - days: Number of days to analyze (default: 30)
 * - project1: First project for comparison (required for compare action)
 * - project2: Second project for comparison (required for compare action)
 * - metric: Metric for top performers (impressions|clicks|conversions|revenue|roas)
 * - limit: Number of results for top performers (default: 10)
 *
 * Returns aggregated analytics across all projects
 * Uses Response.json() per React Router 7 pattern
 */
import type { LoaderFunctionArgs } from "react-router";
export declare function loader({ request }: LoaderFunctionArgs): Promise<import("node_modules/undici-types").Response>;
//# sourceMappingURL=api.analytics.multi-project.d.ts.map