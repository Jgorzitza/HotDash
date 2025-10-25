/**
 * Social Performance Modal Component
 *
 * ENG-023: Detailed view of social media performance
 * - Line chart showing engagement trends (Chart.js)
 * - DataTable with top posts (impressions, CTR, engagement rate)
 * - Date range filter (future enhancement)
 */
interface SocialPost {
    postId: string;
    platform: string;
    content: string;
    metrics: {
        impressions: number;
        clicks: number;
        engagement: number;
        ctr: number;
        engagementRate: number;
    };
}
interface SocialPerformanceModalProps {
    data: {
        trend: {
            labels: string[];
            impressions: number[];
            engagement: number[];
        };
        topPosts: SocialPost[];
    };
    onClose: () => void;
}
export declare function SocialPerformanceModal({ data, onClose, }: SocialPerformanceModalProps): React.JSX.Element;
export {};
//# sourceMappingURL=SocialPerformanceModal.d.ts.map