/**
 * SEO Tile Data Service
 * 
 * Provides data for SEO dashboard tiles
 * 
 * @module services/seo/tile-data
 */

import type { SEOAnomaly } from '../../lib/seo/anomalies';
import type { KeywordRanking, RankingChange } from '../../lib/seo/rankings';
import type { TileState } from '../../components/tiles/TileCard';

export interface SEOTileData {
  anomalies: {
    total: number;
    critical: number;
    warning: number;
    topAnomalies: SEOAnomaly[];
  };
  rankings: {
    totalKeywords: number;
    improvements: number;
    declines: number;
    topChanges: RankingChange[];
  };
  summary: {
    status: 'healthy' | 'attention' | 'critical';
    primaryMessage: string;
    secondaryMessage?: string;
  };
}

export interface SEOAnomaliesTileData {
  alertCount: number;
  topAlert?: string;
  severity: 'critical' | 'warning' | 'info' | 'ok';
  anomalies: SEOAnomaly[];
}

export interface SEORankingsTileData {
  totalKeywords: number;
  improvements: number;
  declines: number;
  avgPosition: number;
  topChanges: Array<{
    keyword: string;
    change: number;
    currentPosition: number;
  }>;
}

/**
 * Transform SEO anomalies into tile data format
 */
export function transformAnomaliesForTile(
  anomalies: SEOAnomaly[]
): SEOAnomaliesTileData {
  const critical = anomalies.filter(a => a.severity === 'critical');
  const warning = anomalies.filter(a => a.severity === 'warning');
  
  const alertCount = critical.length + warning.length;
  
  let severity: 'critical' | 'warning' | 'info' | 'ok' = 'ok';
  if (critical.length > 0) {
    severity = 'critical';
  } else if (warning.length > 0) {
    severity = 'warning';
  } else if (anomalies.length > 0) {
    severity = 'info';
  }
  
  const topAnomaly = [...critical, ...warning][0];
  const topAlert = topAnomaly
    ? `${topAnomaly.affectedUrl || 'Page'} ${topAnomaly.metric.changePercent ? (topAnomaly.metric.changePercent * 100).toFixed(0) + '% WoW' : ''}`
    : undefined;
  
  return {
    alertCount,
    topAlert,
    severity,
    anomalies: [...critical, ...warning].slice(0, 5),
  };
}

/**
 * Transform ranking changes into tile data format
 */
export function transformRankingsForTile(
  rankings: KeywordRanking[],
  changes: RankingChange[]
): SEORankingsTileData {
  const improvements = changes.filter(c => c.changeType === 'improvement');
  const declines = changes.filter(c => c.changeType === 'drop');
  
  const avgPosition = rankings.length > 0
    ? Math.round(rankings.reduce((sum, r) => sum + r.position, 0) / rankings.length)
    : 0;
  
  const topChanges = changes
    .slice(0, 5)
    .map(c => ({
      keyword: c.keyword,
      change: c.change,
      currentPosition: c.currentPosition,
    }));
  
  return {
    totalKeywords: rankings.length,
    improvements: improvements.length,
    declines: declines.length,
    avgPosition,
    topChanges,
  };
}

/**
 * Create combined SEO tile data
 */
export function createSEOTileData(
  anomalies: SEOAnomaly[],
  rankings?: KeywordRanking[],
  changes?: RankingChange[]
): SEOTileData {
  const anomalyData = transformAnomaliesForTile(anomalies);
  
  const rankingData = rankings && changes
    ? transformRankingsForTile(rankings, changes)
    : {
        totalKeywords: 0,
        improvements: 0,
        declines: 0,
        avgPosition: 0,
        topChanges: [],
      };
  
  let status: 'healthy' | 'attention' | 'critical' = 'healthy';
  let primaryMessage = 'All SEO metrics stable';
  let secondaryMessage: string | undefined;
  
  if (anomalyData.severity === 'critical') {
    status = 'critical';
    primaryMessage = `${anomalyData.alertCount} critical SEO ${anomalyData.alertCount === 1 ? 'issue' : 'issues'}`;
    secondaryMessage = anomalyData.topAlert;
  } else if (anomalyData.severity === 'warning') {
    status = 'attention';
    primaryMessage = `${anomalyData.alertCount} SEO ${anomalyData.alertCount === 1 ? 'warning' : 'warnings'}`;
    secondaryMessage = anomalyData.topAlert;
  } else if (rankingData.declines > rankingData.improvements) {
    status = 'attention';
    primaryMessage = `${rankingData.declines} ranking ${rankingData.declines === 1 ? 'decline' : 'declines'}`;
    secondaryMessage = `Avg position: ${rankingData.avgPosition}`;
  }
  
  return {
    anomalies: {
      total: anomalyData.alertCount,
      critical: anomalies.filter(a => a.severity === 'critical').length,
      warning: anomalies.filter(a => a.severity === 'warning').length,
      topAnomalies: anomalyData.anomalies,
    },
    rankings: {
      totalKeywords: rankingData.totalKeywords,
      improvements: rankingData.improvements,
      declines: rankingData.declines,
      topChanges: rankingData.topChanges,
    },
    summary: {
      status,
      primaryMessage,
      secondaryMessage,
    },
  };
}

/**
 * Create TileState wrapper for SEO data
 */
export function createSEOTileState(
  data: SEOTileData,
  source: 'fresh' | 'cache' | 'mock' = 'fresh'
): TileState<SEOTileData> {
  return {
    status: data.summary.status === 'critical' ? 'error' : 'ok',
    data,
    fact: {
      id: Date.now(),
      createdAt: new Date().toISOString(),
    },
    source,
  };
}

