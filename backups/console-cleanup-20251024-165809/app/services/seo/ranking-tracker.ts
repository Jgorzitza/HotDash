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

import { getTopQueries, getLandingPages } from "~/lib/seo/search-console";
import { getCached, setCached } from "../cache.server";
import { appMetrics } from "~/utils/metrics.server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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
  slaDeadline: string; // 48h from detection
}

/**
 * Track keyword rankings and detect changes
 */
export async function trackRankings(): Promise<RankingData[]> {
  const startTime = Date.now();
  const cacheKey = 'ranking-tracker:current';
  
  const cached = getCached<RankingData[]>(cacheKey);
  if (cached) {
    appMetrics.cacheHit(cacheKey);
    return cached;
  }
  appMetrics.cacheMiss(cacheKey);

  try {
    // Get current rankings from Search Console
    const [queries, pages] = await Promise.all([
      getTopQueries(50),
      getLandingPages(50)
    ]);

    // Get previous rankings from database
    const previousRankings = await getPreviousRankings();

    // Build ranking data with change detection
    const rankings: RankingData[] = queries.map(query => {
      const previous = previousRankings.find(r => r.keyword === query.query);
      const previousPosition = previous?.position || query.position;
      const change = previousPosition - query.position; // Positive = improvement

      return {
        keyword: query.query,
        currentPosition: query.position,
        previousPosition,
        change,
        url: query.page || '',
        clicks: query.clicks,
        impressions: query.impressions,
        ctr: query.ctr,
        lastChecked: new Date().toISOString()
      };
    });

    // Store current rankings for future comparison
    await storeCurrentRankings(rankings);

    // Cache for 5 minutes
    setCached(cacheKey, rankings, 300000);

    const duration = Date.now() - startTime;
    appMetrics.gaApiCall('trackRankings', true, duration);

    return rankings;
  } catch (error: any) {
    const duration = Date.now() - startTime;
    appMetrics.gaApiCall('trackRankings', false, duration);
    throw error;
  }
}

/**
 * Get previous rankings from database
 */
async function getPreviousRankings(): Promise<Array<{keyword: string; position: number}>> {
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const records = await prisma.seoRanking.findMany({
      where: {
        checkedAt: {
          gte: yesterday
        }
      },
      orderBy: {
        checkedAt: 'desc'
      },
      distinct: ['keyword'],
      take: 50
    });

    return records.map(r => ({
      keyword: r.keyword,
      position: r.position
    }));
  } catch (error) {
    console.error('[Ranking Tracker] Failed to get previous rankings:', error);
    return [];
  }
}

/**
 * Store current rankings to database
 */
async function storeCurrentRankings(rankings: RankingData[]): Promise<void> {
  try {
    const records = rankings.map(r => ({
      keyword: r.keyword,
      position: r.currentPosition,
      url: r.url,
      clicks: r.clicks,
      impressions: r.impressions,
      ctr: r.ctr,
      checkedAt: new Date()
    }));

    await prisma.seoRanking.createMany({
      data: records,
      skipDuplicates: true
    });

    console.log(`[Ranking Tracker] Stored ${records.length} rankings`);
  } catch (error) {
    console.error('[Ranking Tracker] Failed to store rankings:', error);
  }
}

/**
 * Detect ranking alerts based on position changes
 */
export async function detectRankingAlerts(rankings: RankingData[]): Promise<RankingAlert[]> {
  const alerts: RankingAlert[] = [];
  const now = new Date();
  const slaDeadline = new Date(now.getTime() + 48 * 60 * 60 * 1000); // 48h from now

  rankings.forEach(ranking => {
    // Critical: Drop of 10+ positions
    if (ranking.change <= -10) {
      alerts.push({
        id: `ranking-critical-${ranking.keyword.replace(/\s+/g, '-')}`,
        keyword: ranking.keyword,
        severity: 'critical',
        currentPosition: ranking.currentPosition,
        previousPosition: ranking.previousPosition,
        change: ranking.change,
        url: ranking.url,
        detectedAt: now.toISOString(),
        slaDeadline: slaDeadline.toISOString()
      });
    }
    // Warning: Drop of 5-9 positions
    else if (ranking.change <= -5) {
      alerts.push({
        id: `ranking-warning-${ranking.keyword.replace(/\s+/g, '-')}`,
        keyword: ranking.keyword,
        severity: 'warning',
        currentPosition: ranking.currentPosition,
        previousPosition: ranking.previousPosition,
        change: ranking.change,
        url: ranking.url,
        detectedAt: now.toISOString(),
        slaDeadline: slaDeadline.toISOString()
      });
    }
    // Info: Improvement of 5+ positions
    else if (ranking.change >= 5) {
      alerts.push({
        id: `ranking-info-${ranking.keyword.replace(/\s+/g, '-')}`,
        keyword: ranking.keyword,
        severity: 'info',
        currentPosition: ranking.currentPosition,
        previousPosition: ranking.previousPosition,
        change: ranking.change,
        url: ranking.url,
        detectedAt: now.toISOString(),
        slaDeadline: slaDeadline.toISOString()
      });
    }
  });

  // Store alerts in database
  if (alerts.length > 0) {
    await storeRankingAlerts(alerts);
  }

  return alerts;
}

/**
 * Store ranking alerts to database
 */
async function storeRankingAlerts(alerts: RankingAlert[]): Promise<void> {
  try {
    const records = alerts.map(alert => ({
      alertId: alert.id,
      keyword: alert.keyword,
      severity: alert.severity,
      currentPosition: alert.currentPosition,
      previousPosition: alert.previousPosition,
      positionChange: alert.change,
      url: alert.url,
      detectedAt: new Date(alert.detectedAt),
      slaDeadline: new Date(alert.slaDeadline),
      status: 'open' as const
    }));

    await prisma.seoAlert.createMany({
      data: records,
      skipDuplicates: true
    });

    console.log(`[Ranking Tracker] Stored ${records.length} alerts`);
  } catch (error) {
    console.error('[Ranking Tracker] Failed to store alerts:', error);
  }
}

/**
 * Get active alerts (within SLA deadline)
 */
export async function getActiveAlerts(): Promise<RankingAlert[]> {
  try {
    const now = new Date();

    const records = await prisma.seoAlert.findMany({
      where: {
        status: 'open',
        slaDeadline: {
          gte: now
        }
      },
      orderBy: [
        { severity: 'asc' }, // critical first
        { detectedAt: 'asc' } // oldest first
      ]
    });

    return records.map(r => ({
      id: r.alertId,
      keyword: r.keyword,
      severity: r.severity as 'critical' | 'warning' | 'info',
      currentPosition: r.currentPosition,
      previousPosition: r.previousPosition,
      change: r.positionChange,
      url: r.url,
      detectedAt: r.detectedAt.toISOString(),
      slaDeadline: r.slaDeadline.toISOString()
    }));
  } catch (error) {
    console.error('[Ranking Tracker] Failed to get active alerts:', error);
    return [];
  }
}

/**
 * Resolve an alert
 */
export async function resolveAlert(alertId: string, resolution: string): Promise<void> {
  try {
    await prisma.seoAlert.updateMany({
      where: { alertId },
      data: {
        status: 'resolved',
        resolvedAt: new Date(),
        resolution
      }
    });

    console.log(`[Ranking Tracker] Resolved alert: ${alertId}`);
  } catch (error) {
    console.error('[Ranking Tracker] Failed to resolve alert:', error);
  }
}

