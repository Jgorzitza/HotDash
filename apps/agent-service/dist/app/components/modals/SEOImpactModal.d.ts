/**
 * SEO Impact Modal Component (ENG-024)
 *
 * Detailed SEO ranking view with:
 * - Position trend chart (line)
 * - Top movers bar chart
 * - Content correlation table
 */
interface SEOImpactModalProps {
    data: {
        trend: {
            labels: string[];
            positions: number[];
        };
        topMovers: Array<{
            keyword: string;
            position: number;
            change: number;
            url: string;
        }>;
    };
    onClose: () => void;
}
export declare function SEOImpactModal({ data, onClose }: SEOImpactModalProps): React.JSX.Element;
export {};
//# sourceMappingURL=SEOImpactModal.d.ts.map