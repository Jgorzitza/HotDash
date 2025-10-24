/**
 * Growth Metrics Tile Component (ENG-026)
 *
 * Displays overall growth metrics across all channels:
 * - Weekly growth percentage
 * - Total reach
 * - Best performing channel
 */
interface GrowthMetricsData {
    weeklyGrowth: number;
    totalReach: number;
    bestChannel: {
        name: string;
        growth: number;
    };
}
interface GrowthMetricsTileProps {
    data: GrowthMetricsData;
    onOpenModal?: () => void;
}
export declare function GrowthMetricsTile({ data, onOpenModal, }: GrowthMetricsTileProps): React.JSX.Element;
export {};
//# sourceMappingURL=GrowthMetricsTile.d.ts.map