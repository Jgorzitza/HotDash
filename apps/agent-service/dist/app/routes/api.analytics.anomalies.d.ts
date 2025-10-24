/**
 * Anomaly Detection API Route
 *
 * GET /api/analytics/anomalies
 * Query params:
 * - project: Shop domain (default: "occ")
 * - metric: Specific metric to check | "all" (default: "all")
 * - days: Historical period for baseline (default: 30)
 *
 * Returns detected anomalies with Z-score analysis
 * Uses Response.json() per React Router 7 pattern
 */
import type { LoaderFunctionArgs } from "react-router";
export declare function loader({ request }: LoaderFunctionArgs): Promise<import("node_modules/undici-types").Response>;
//# sourceMappingURL=api.analytics.anomalies.d.ts.map