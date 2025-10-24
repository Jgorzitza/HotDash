/**
 * Growth Engine Analytics Tile
 *
 * Displays advanced analytics for Growth Engine phases 9-12
 * including attribution modeling, performance insights, and recommendations.
 */
import type { GrowthEngineAnalytics } from "~/services/analytics/growthEngineAdvanced";
interface GrowthEngineAnalyticsTileProps {
    analytics: GrowthEngineAnalytics;
    timeframe: string;
    period: {
        start: string;
        end: string;
    };
    generatedAt: string;
}
export declare function GrowthEngineAnalyticsTile({ analytics, timeframe, period, generatedAt, }: GrowthEngineAnalyticsTileProps): React.JSX.Element;
export {};
//# sourceMappingURL=GrowthEngineAnalyticsTile.d.ts.map