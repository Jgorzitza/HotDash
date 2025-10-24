/**
 * Social Performance Analytics Tile
 *
 * ANALYTICS-006: Display social media performance metrics
 *
 * Features:
 * - Total reach and engagement metrics
 * - Platform breakdown
 * - Top performing post
 * - Performance trends
 */
import type { SocialPerformanceSummary } from "~/services/analytics/socialPerformance";
interface SocialPerformanceTileProps {
    data: SocialPerformanceSummary;
    loading?: boolean;
}
export declare function SocialPerformanceTile({ data, loading, }: SocialPerformanceTileProps): React.JSX.Element;
/**
 * Social Performance Tile Loader
 *
 * ANALYTICS-006: Load social performance data for the tile
 */
export declare function socialPerformanceLoader(): Promise<{
    data: SocialPerformanceSummary;
}>;
export {};
//# sourceMappingURL=SocialPerformanceTile.d.ts.map