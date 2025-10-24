/**
 * Real-Time Ranking Tracker Service
 *
 * Tracks keyword rankings in real-time and detects significant changes.
 * Integrates with Search Console API for accurate position data.
 *
 * Features:
 * - Real-time ranking monitoring
 * - Position change detection
 * - Historical trend analysis
 * - Alert generation for significant drops
 * - Integration with Search Console
 */
export interface RankingData {
    keyword: string;
    currentPosition: number;
    previousPosition: number;
    change: number;
    url: string;
    clicks: number;
    impressions: number;
    ctr: number;
    lastChecked: string;
}
export interface RankingAlert {
    id: string;
    keyword: string;
    severity: 'critical' | 'warning' | 'info';
    currentPosition: number;
    previousPosition: number;
    change: number;
    url: string;
    detectedAt: string;
    slaDeadline: string;
}
/**
 * Track keyword rankings and detect changes
 */
export declare function trackRankings(): Promise<RankingData[]>;
/**
 * Detect ranking alerts based on position changes
 */
export declare function detectRankingAlerts(rankings: RankingData[]): Promise<RankingAlert[]>;
/**
 * Get active alerts (within SLA deadline)
 */
export declare function getActiveAlerts(): Promise<RankingAlert[]>;
/**
 * Resolve an alert
 */
export declare function resolveAlert(alertId: string, resolution: string): Promise<void>;
//# sourceMappingURL=ranking-tracker.d.ts.map