/**
 * CX Queue Tile Component
 *
 * Displays pending conversations with SLA status
 * Polls every ~90s, surfaces SLA timers
 */
import type { CXData } from "~/routes/dashboard";
export interface CXTileProps {
    data: CXData;
}
export declare function CXTile({ data }: CXTileProps): React.JSX.Element;
//# sourceMappingURL=CXTile.d.ts.map