/**
 * API Route: Bing Webmaster Tools Metrics
 *
 * GET /api/bing/metrics?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&siteId=xxx
 *
 * Retrieves search performance metrics from Bing Webmaster Tools
 */
import type { LoaderFunctionArgs } from "react-router";
export interface BingMetricsResponse {
    success: boolean;
    metrics?: Array<{
        date: string;
        clicks: number;
        impressions: number;
        ctr: number;
        position: number;
        queries: Array<{
            query: string;
            clicks: number;
            impressions: number;
            ctr: number;
            position: number;
        }>;
    }>;
    error?: string;
}
export declare function loader({ request }: LoaderFunctionArgs): Promise<import("node_modules/undici-types").Response>;
export declare function action(): Promise<import("node_modules/undici-types").Response>;
//# sourceMappingURL=api.bing.metrics.d.ts.map