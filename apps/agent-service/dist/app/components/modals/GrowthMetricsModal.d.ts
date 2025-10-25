/**
 * Growth Metrics Modal Component (ENG-026)
 *
 * Overall growth analytics view with:
 * - Multi-channel trend chart (line)
 * - Channel comparison bar chart
 * - Weekly growth report
 */
interface ChannelData {
    channel: string;
    thisWeek: number;
    lastWeek: number;
    growth: number;
}
interface GrowthMetricsModalProps {
    data: {
        trend: {
            labels: string[];
            social: number[];
            seo: number[];
            ads: number[];
            email: number[];
        };
        channelComparison: ChannelData[];
        weeklyReport: {
            summary: string;
            recommendations: string[];
        };
    };
    onClose: () => void;
}
export declare function GrowthMetricsModal({ data, onClose }: GrowthMetricsModalProps): React.JSX.Element;
export {};
//# sourceMappingURL=GrowthMetricsModal.d.ts.map