/**
 * Analytics Data Export API Route
 *
 * GET /api/analytics/export
 * Query params:
 * - type: "social" | "seo" | "ads" | "growth" | "all" (required)
 * - project: Shop domain (default: "occ")
 * - startDate: ISO date string (optional)
 * - endDate: ISO date string (optional)
 * - format: "csv" | "json" (default: "csv")
 *
 * Returns streaming CSV response with proper headers
 * CRITICAL: Uses Response constructor with stream, NOT json() helper
 */
import type { LoaderFunctionArgs } from "react-router";
export declare function loader({ request }: LoaderFunctionArgs): Promise<import("node_modules/undici-types").Response>;
//# sourceMappingURL=api.analytics.export.d.ts.map