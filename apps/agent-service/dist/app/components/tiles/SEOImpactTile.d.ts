/**
 * SEO Impact Tile Component (ENG-024)
 *
 * Displays SEO ranking metrics:
 * - Total tracked keywords
 * - Average position
 * - Top mover preview
 */
interface SEOImpactData {
    totalKeywords: number;
    avgPosition: number;
    topMover: {
        keyword: string;
        oldPosition: number;
        newPosition: number;
        change: number;
    };
}
interface SEOImpactTileProps {
    data: SEOImpactData;
    onOpenModal?: () => void;
}
export declare function SEOImpactTile({ data, onOpenModal }: SEOImpactTileProps): React.JSX.Element;
export {};
//# sourceMappingURL=SEOImpactTile.d.ts.map