/**
 * Growth Engine Advanced Analytics Component
 *
 * Displays comprehensive analytics for Growth Engine phases 9-12
 * including attribution modeling, performance insights, and recommendations.
 */
import type { GrowthEngineAnalytics } from "~/services/analytics/growthEngineAdvanced";
interface GrowthEngineAnalyticsProps {
    analytics: GrowthEngineAnalytics;
    timeframe: string;
    period: {
        start: string;
        end: string;
    };
    generatedAt: string;
}
export declare function GrowthEngineAnalyticsComponent({ analytics, timeframe, period, generatedAt, }: GrowthEngineAnalyticsProps): React.JSX.Element;
export {};
//# sourceMappingURL=GrowthEngineAnalytics.d.ts.map