/**
 * Keyword Ranking Tracker
 *
 * Track keyword positions daily and detect ranking changes.
 * Integrates with Google Search Console API for real ranking data.
 *
 * Features:
 * - Daily keyword position tracking
 * - Historical ranking data storage
 * - Ranking change detection (improvements/drops)
 * - Search volume tracking
 * - Device-specific rankings (mobile/desktop)
 * - Country-specific rankings
 *
 * @module lib/seo/rankings
 */
export interface KeywordRanking {
    keyword: string;
    url: string;
    position: number;
    previousPosition?: number;
    change?: number;
    searchVolume?: number;
    device: "mobile" | "desktop" | "all";
    country: string;
    clicks: number;
    impressions: number;
    ctr: number;
    date: string;
}
export interface KeywordHistory {
    keyword: string;
    url: string;
    rankings: Array<{
        date: string;
        position: number;
        clicks: number;
        impressions: number;
        ctr: number;
    }>;
}
export interface RankingChange {
    keyword: string;
    url: string;
    currentPosition: number;
    previousPosition: number;
    change: number;
    changeType: "improvement" | "drop" | "stable";
    severity: "major" | "minor" | "none";
    date: string;
}
export interface TrackKeywordsInput {
    keywords: string[];
    device?: "mobile" | "desktop" | "all";
    country?: string;
    startDate?: string;
    endDate?: string;
}
export interface SearchConsoleResponse {
    rows: Array<{
        keys: string[];
        clicks: number;
        impressions: number;
        ctr: number;
        position: number;
    }>;
}
/**
 * Thresholds for ranking change severity
 */
export declare const RANKING_CHANGE_THRESHOLDS: {
    readonly major: {
        readonly improvement: -5;
        readonly drop: 5;
    };
    readonly minor: {
        readonly improvement: -2;
        readonly drop: 2;
    };
};
/**
 * Calculate ranking change severity
 */
export declare function calculateChangeSeverity(change: number): "major" | "minor" | "none";
/**
 * Determine change type (improvement/drop/stable)
 */
export declare function determineChangeType(change: number): "improvement" | "drop" | "stable";
/**
 * Parse Search Console API response into KeywordRanking objects
 */
export declare function parseSearchConsoleData(response: SearchConsoleResponse, date: string): KeywordRanking[];
/**
 * Compare current rankings with previous to detect changes
 */
export declare function detectRankingChanges(current: KeywordRanking[], previous: KeywordRanking[]): RankingChange[];
/**
 * Filter rankings by criteria
 */
export declare function filterRankings(rankings: KeywordRanking[], filters: {
    minPosition?: number;
    maxPosition?: number;
    device?: "mobile" | "desktop" | "all";
    country?: string;
    minImpressions?: number;
}): KeywordRanking[];
/**
 * Get top keywords by position
 */
export declare function getTopKeywords(rankings: KeywordRanking[], limit?: number): KeywordRanking[];
/**
 * Get keywords with most impressions
 */
export declare function getHighVolumeKeywords(rankings: KeywordRanking[], limit?: number): KeywordRanking[];
/**
 * Calculate average position for a keyword over time
 */
export declare function calculateAveragePosition(history: KeywordHistory): number;
/**
 * Get ranking trend (improving/declining/stable)
 */
export declare function getRankingTrend(history: KeywordHistory, days?: number): "improving" | "declining" | "stable";
/**
 * Mock Search Console API call
 * TODO: Replace with real Google Search Console API integration
 */
export declare function fetchSearchConsoleData(input: TrackKeywordsInput): Promise<SearchConsoleResponse>;
/**
 * Track keywords and return current rankings
 */
export declare function trackKeywords(input: TrackKeywordsInput): Promise<KeywordRanking[]>;
//# sourceMappingURL=rankings.d.ts.map