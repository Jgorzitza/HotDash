/**
 * Ads ROAS Modal Component (ENG-025)
 *
 * Detailed advertising performance view with:
 * - ROAS trend chart (line)
 * - Spend distribution (doughnut)
 * - Campaign comparison table
 */
interface Campaign {
    name: string;
    platform: string;
    spend: number;
    revenue: number;
    roas: number;
}
interface AdsROASModalProps {
    data: {
        trend: {
            labels: string[];
            roas: number[];
            spend: number[];
        };
        campaigns: Campaign[];
        distribution: Array<{
            platform: string;
            spend: number;
            percentage: number;
        }>;
    };
    onClose: () => void;
}
export declare function AdsROASModal({ data, onClose }: AdsROASModalProps): React.JSX.Element;
export {};
//# sourceMappingURL=AdsROASModal.d.ts.map