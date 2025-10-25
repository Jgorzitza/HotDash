/**
 * Scheduled Analytics Reports API Route
 *
 * GET /api/analytics/reports
 * Query params:
 * - frequency: "daily" | "weekly" | "monthly" (required)
 * - project: Shop domain (default: "occ")
 * - format: "json" | "email" (default: "json")
 *
 * Returns generated report with email template
 * Uses Response.json() per React Router 7 pattern
 */
import type { LoaderFunctionArgs } from "react-router";
export declare function loader({ request }: LoaderFunctionArgs): Promise<import("node_modules/undici-types").Response>;
//# sourceMappingURL=api.analytics.reports.d.ts.map