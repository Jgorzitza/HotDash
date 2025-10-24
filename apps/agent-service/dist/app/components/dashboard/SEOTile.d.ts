/**
 * SEO Anomalies Tile Component
 *
 * Displays SEO alerts with severity filtering
 * Default to critical alerts, toggle mediums (auto-show medium if no criticals)
 */
import type { SEOData } from "~/routes/dashboard";
export interface SEOTileProps {
    data: SEOData;
}
export declare function SEOTile({ data }: SEOTileProps): React.JSX.Element;
//# sourceMappingURL=SEOTile.d.ts.map