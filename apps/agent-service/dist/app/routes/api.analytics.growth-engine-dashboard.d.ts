/**
 * Growth Engine Analytics Dashboard API Route
 *
 * ANALYTICS-274: API endpoint for comprehensive Growth Engine analytics
 * Provides phase tracking, action performance, and optimization recommendations
 */
import type { LoaderFunctionArgs } from "react-router";
import { type GrowthEngineAnalytics } from "~/services/analytics/growthEngine";
export interface GrowthEngineDashboardResponse {
    success: boolean;
    data?: {
        analytics: GrowthEngineAnalytics;
        exported: any;
        generatedAt: string;
    };
    error?: string;
}
export declare function loader({ request }: LoaderFunctionArgs): Promise<import("node_modules/undici-types").Response>;
//# sourceMappingURL=api.analytics.growth-engine-dashboard.d.ts.map