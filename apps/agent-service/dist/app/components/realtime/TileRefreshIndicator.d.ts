/**
 * Tile Refresh Indicator Component
 *
 * Shows when tile was last updated and refresh status:
 * - "Updated X ago" timestamp
 * - Pulse animation on refresh
 * - Manual refresh button
 * - Auto-refresh progress bar (optional)
 *
 * Phase 5 - ENG-025
 */
interface TileRefreshIndicatorProps {
    lastUpdated: string | Date;
    isRefreshing?: boolean;
    onRefresh?: () => void;
    autoRefreshInterval?: number;
}
export declare function TileRefreshIndicator({ lastUpdated, isRefreshing, onRefresh, autoRefreshInterval, }: TileRefreshIndicatorProps): React.JSX.Element;
export {};
//# sourceMappingURL=TileRefreshIndicator.d.ts.map