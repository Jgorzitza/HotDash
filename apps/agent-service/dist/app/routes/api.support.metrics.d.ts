/**
 * API Route: CX Metrics Dashboard
 *
 * GET /api/support/metrics
 *
 * Returns comprehensive customer support metrics:
 * - FRT (First Response Time)
 * - Resolution Time
 * - SLA Compliance
 * - Agent Performance
 * - Channel Breakdown
 *
 * SUPPORT-004
 */
import { type LoaderFunctionArgs } from "react-router";
export interface CXMetricsResponse {
    success: boolean;
    data?: Record<string, unknown>;
    error?: string;
    timestamp: string;
}
export declare function loader(_args: LoaderFunctionArgs): Promise<import("node_modules/undici-types").Response>;
//# sourceMappingURL=api.support.metrics.d.ts.map