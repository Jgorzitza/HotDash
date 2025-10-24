/**
 * API Route: Analytics Traffic
 *
 * GET /api/analytics/traffic
 *
 * Returns traffic metrics for the last 30 days with trend comparison.
 * Used by dashboard tiles to display sessions, organic traffic, and SEO data.
 *
 * Enhanced with:
 * - Zod schema validation
 * - Sampling detection and enforcement
 * - Combined GA4 data
 */
import { type LoaderFunctionArgs } from "react-router";
export declare function loader({ request }: LoaderFunctionArgs): Promise<import("node_modules/undici-types").Response>;
//# sourceMappingURL=api.analytics.traffic.d.ts.map