/**
 * Ads ROAS Tile Component (ENG-025)
 *
 * Displays advertising campaign ROAS metrics:
 * - Total ad spend
 * - Total revenue from ads
 * - ROAS (Return on Ad Spend)
 */
interface AdsROASData {
    totalSpend: number;
    totalRevenue: number;
    roas: number;
    topCampaign: {
        name: string;
        platform: string;
        roas: number;
        spend: number;
    };
}
interface AdsROASTileProps {
    data: AdsROASData;
    onOpenModal?: () => void;
}
export declare function AdsROASTile({ data, onOpenModal }: AdsROASTileProps): React.JSX.Element;
export {};
//# sourceMappingURL=AdsROASTile.d.ts.map