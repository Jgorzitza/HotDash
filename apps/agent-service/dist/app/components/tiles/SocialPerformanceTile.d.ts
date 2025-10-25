/**
 * Social Performance Tile Component
 *
 * ENG-023: Displays social media post performance metrics
 * - Total posts count
 * - Average engagement
 * - Top post preview
 * - Click to open modal with detailed charts
 */
interface SocialPerformanceData {
    totalPosts: number;
    avgEngagement: number;
    topPost: {
        platform: string;
        content: string;
        impressions: number;
        engagement: number;
    };
}
interface SocialPerformanceTileProps {
    data: SocialPerformanceData;
    onOpenModal?: () => void;
}
export declare function SocialPerformanceTile({ data, onOpenModal, }: SocialPerformanceTileProps): React.JSX.Element;
export {};
//# sourceMappingURL=SocialPerformanceTile.d.ts.map