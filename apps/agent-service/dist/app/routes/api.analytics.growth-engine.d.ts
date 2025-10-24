/**
 * Growth Engine Advanced Analytics API
 *
 * Provides comprehensive analytics data for Growth Engine phases 9-12
 * including attribution modeling, performance optimization, and insights.
 */
import type { LoaderFunctionArgs } from "react-router";
import { type GrowthEngineAnalytics } from "~/services/analytics/growthEngineAdvanced";
export interface GrowthEngineResponse {
    success: boolean;
    data?: {
        analytics: GrowthEngineAnalytics;
        timeframe: string;
        period: {
            start: string;
            end: string;
        };
        generatedAt: string;
    };
    error?: string;
}
export declare function loader({ request }: LoaderFunctionArgs): Promise<import("node_modules/undici-types").Response>;
//# sourceMappingURL=api.analytics.growth-engine.d.ts.map