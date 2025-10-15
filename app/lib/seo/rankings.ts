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
  change?: number; // Positive = improvement, Negative = drop
  searchVolume?: number;
  device: 'mobile' | 'desktop' | 'all';
  country: string; // ISO country code (e.g., 'US', 'GB')
  clicks: number;
  impressions: number;
  ctr: number; // Click-through rate
  date: string; // ISO date string
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
  changeType: 'improvement' | 'drop' | 'stable';
  severity: 'major' | 'minor' | 'none';
  date: string;
}

export interface TrackKeywordsInput {
  keywords: string[];
  device?: 'mobile' | 'desktop' | 'all';
  country?: string;
  startDate?: string; // ISO date
  endDate?: string; // ISO date
}

export interface SearchConsoleResponse {
  rows: Array<{
    keys: string[]; // [query, page, country, device]
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  }>;
}

/**
 * Thresholds for ranking change severity
 */
export const RANKING_CHANGE_THRESHOLDS = {
  major: {
    improvement: -5, // Improved by 5+ positions
    drop: 5,         // Dropped by 5+ positions
  },
  minor: {
    improvement: -2, // Improved by 2-4 positions
    drop: 2,         // Dropped by 2-4 positions
  },
} as const;

/**
 * Calculate ranking change severity
 */
export function calculateChangeSeverity(change: number): 'major' | 'minor' | 'none' {
  const absChange = Math.abs(change);
  
  if (absChange >= Math.abs(RANKING_CHANGE_THRESHOLDS.major.improvement)) {
    return 'major';
  }
  
  if (absChange >= Math.abs(RANKING_CHANGE_THRESHOLDS.minor.improvement)) {
    return 'minor';
  }
  
  return 'none';
}

/**
 * Determine change type (improvement/drop/stable)
 */
export function determineChangeType(change: number): 'improvement' | 'drop' | 'stable' {
  if (change < 0) {
    return 'improvement'; // Negative change = better position (lower number)
  }
  
  if (change > 0) {
    return 'drop'; // Positive change = worse position (higher number)
  }
  
  return 'stable';
}

/**
 * Parse Search Console API response into KeywordRanking objects
 */
export function parseSearchConsoleData(
  response: SearchConsoleResponse,
  date: string
): KeywordRanking[] {
  return response.rows.map(row => {
    const [query, page, country, device] = row.keys;
    
    return {
      keyword: query,
      url: page,
      position: Math.round(row.position),
      device: (device as 'mobile' | 'desktop') || 'all',
      country: country || 'US',
      clicks: row.clicks,
      impressions: row.impressions,
      ctr: row.ctr,
      date,
    };
  });
}

/**
 * Compare current rankings with previous to detect changes
 */
export function detectRankingChanges(
  current: KeywordRanking[],
  previous: KeywordRanking[]
): RankingChange[] {
  const changes: RankingChange[] = [];
  
  // Create a map of previous rankings for quick lookup
  const previousMap = new Map<string, KeywordRanking>();
  previous.forEach(ranking => {
    const key = `${ranking.keyword}|${ranking.url}|${ranking.device}|${ranking.country}`;
    previousMap.set(key, ranking);
  });
  
  // Compare current with previous
  current.forEach(currentRanking => {
    const key = `${currentRanking.keyword}|${currentRanking.url}|${currentRanking.device}|${currentRanking.country}`;
    const previousRanking = previousMap.get(key);
    
    if (previousRanking) {
      const change = currentRanking.position - previousRanking.position;
      
      if (change !== 0) {
        changes.push({
          keyword: currentRanking.keyword,
          url: currentRanking.url,
          currentPosition: currentRanking.position,
          previousPosition: previousRanking.position,
          change,
          changeType: determineChangeType(change),
          severity: calculateChangeSeverity(change),
          date: currentRanking.date,
        });
      }
    }
  });
  
  return changes.sort((a, b) => {
    // Sort by severity (major first), then by absolute change
    if (a.severity !== b.severity) {
      return a.severity === 'major' ? -1 : 1;
    }
    return Math.abs(b.change) - Math.abs(a.change);
  });
}

/**
 * Filter rankings by criteria
 */
export function filterRankings(
  rankings: KeywordRanking[],
  filters: {
    minPosition?: number;
    maxPosition?: number;
    device?: 'mobile' | 'desktop' | 'all';
    country?: string;
    minImpressions?: number;
  }
): KeywordRanking[] {
  return rankings.filter(ranking => {
    if (filters.minPosition && ranking.position < filters.minPosition) {
      return false;
    }
    
    if (filters.maxPosition && ranking.position > filters.maxPosition) {
      return false;
    }
    
    if (filters.device && ranking.device !== filters.device) {
      return false;
    }
    
    if (filters.country && ranking.country !== filters.country) {
      return false;
    }
    
    if (filters.minImpressions && ranking.impressions < filters.minImpressions) {
      return false;
    }
    
    return true;
  });
}

/**
 * Get top keywords by position
 */
export function getTopKeywords(
  rankings: KeywordRanking[],
  limit: number = 10
): KeywordRanking[] {
  return rankings
    .sort((a, b) => a.position - b.position)
    .slice(0, limit);
}

/**
 * Get keywords with most impressions
 */
export function getHighVolumeKeywords(
  rankings: KeywordRanking[],
  limit: number = 10
): KeywordRanking[] {
  return rankings
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, limit);
}

/**
 * Calculate average position for a keyword over time
 */
export function calculateAveragePosition(history: KeywordHistory): number {
  if (history.rankings.length === 0) {
    return 0;
  }
  
  const sum = history.rankings.reduce((acc, r) => acc + r.position, 0);
  return Math.round(sum / history.rankings.length);
}

/**
 * Get ranking trend (improving/declining/stable)
 */
export function getRankingTrend(
  history: KeywordHistory,
  days: number = 7
): 'improving' | 'declining' | 'stable' {
  if (history.rankings.length < 2) {
    return 'stable';
  }
  
  // Get recent rankings (last N days)
  const recent = history.rankings.slice(-days);
  
  if (recent.length < 2) {
    return 'stable';
  }
  
  // Calculate trend using linear regression
  const firstPosition = recent[0].position;
  const lastPosition = recent[recent.length - 1].position;
  const change = lastPosition - firstPosition;
  
  if (change < -2) {
    return 'improving'; // Position decreased (better)
  }
  
  if (change > 2) {
    return 'declining'; // Position increased (worse)
  }
  
  return 'stable';
}

/**
 * Mock Search Console API call
 * TODO: Replace with real Google Search Console API integration
 */
export async function fetchSearchConsoleData(
  input: TrackKeywordsInput
): Promise<SearchConsoleResponse> {
  // Mock implementation - returns empty data
  // In production, this would call the Google Search Console API
  
  console.log('[rankings] Mock Search Console API call:', input);
  
  return {
    rows: [],
  };
}

/**
 * Track keywords and return current rankings
 */
export async function trackKeywords(
  input: TrackKeywordsInput
): Promise<KeywordRanking[]> {
  const response = await fetchSearchConsoleData(input);
  const date = input.endDate || new Date().toISOString().slice(0, 10);
  
  return parseSearchConsoleData(response, date);
}

