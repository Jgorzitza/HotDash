/**
 * Dashboard Loaders
 * 
 * Export data in format compatible with dashboard tiles.
 */

import { getRevenueMetrics, getTrafficMetrics, getConversionMetrics } from './ga4.ts';
import { getEcommerceFunnel } from './funnels.ts';
import { getSEOMetrics } from './seo.ts';

// ============================================================================
// Tile Data Contracts
// ============================================================================

export interface TileData {
  title: string;
  value: string | number;
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    percentage: number;
    label: string;
  };
  metadata?: Record<string, any>;
}

export interface DashboardData {
  tiles: TileData[];
  timestamp: string;
  period: {
    start: string;
    end: string;
  };
}

// ============================================================================
// Loader Functions
// ============================================================================

/**
 * Load revenue tile data
 */
export async function loadRevenueTile(): Promise<TileData> {
  const metrics = await getRevenueMetrics();
  
  return {
    title: 'Total Revenue',
    value: `$${metrics.totalRevenue.toLocaleString()}`,
    trend: {
      direction: metrics.trend.revenueChange >= 0 ? 'up' : 'down',
      percentage: Math.abs(metrics.trend.revenueChange),
      label: 'vs previous period',
    },
    metadata: {
      transactions: metrics.transactions,
      aov: metrics.averageOrderValue,
      period: metrics.period,
    },
  };
}

/**
 * Load traffic tile data
 */
export async function loadTrafficTile(): Promise<TileData> {
  const metrics = await getTrafficMetrics();
  
  return {
    title: 'Total Sessions',
    value: metrics.totalSessions.toLocaleString(),
    trend: {
      direction: metrics.trend.sessionsChange >= 0 ? 'up' : 'down',
      percentage: Math.abs(metrics.trend.sessionsChange),
      label: 'vs previous period',
    },
    metadata: {
      organicSessions: metrics.organicSessions,
      organicPercentage: metrics.organicPercentage,
      period: metrics.period,
    },
  };
}

/**
 * Load conversion rate tile data
 */
export async function loadConversionTile(): Promise<TileData> {
  const metrics = await getConversionMetrics();
  
  return {
    title: 'Conversion Rate',
    value: `${metrics.conversionRate.toFixed(2)}%`,
    trend: {
      direction: metrics.trend.conversionRateChange >= 0 ? 'up' : 'down',
      percentage: Math.abs(metrics.trend.conversionRateChange),
      label: 'vs previous period',
    },
    metadata: {
      transactions: metrics.transactions,
      revenue: metrics.revenue,
      period: metrics.period,
    },
  };
}

/**
 * Load SEO tile data
 */
export async function loadSEOTile(): Promise<TileData> {
  const metrics = await getSEOMetrics();
  
  return {
    title: 'Organic Traffic',
    value: `${metrics.organicPercentage.toFixed(1)}%`,
    trend: {
      direction: metrics.trend.sessionsChange >= 0 ? 'up' : 'down',
      percentage: Math.abs(metrics.trend.sessionsChange),
      label: 'organic sessions',
    },
    metadata: {
      organicSessions: metrics.organicSessions,
      organicRevenue: metrics.organicRevenue,
      organicConversions: metrics.organicConversions,
    },
  };
}

/**
 * Load funnel tile data
 */
export async function loadFunnelTile(): Promise<TileData> {
  const funnel = await getEcommerceFunnel();
  
  return {
    title: 'Funnel Completion',
    value: `${funnel.completionRate.toFixed(1)}%`,
    trend: {
      direction: 'neutral',
      percentage: 0,
      label: `${funnel.steps[funnel.steps.length - 1].users} completed`,
    },
    metadata: {
      totalUsers: funnel.totalUsers,
      steps: funnel.steps.length,
      name: funnel.name,
    },
  };
}

/**
 * Load all dashboard tiles
 */
export async function loadDashboardTiles(): Promise<DashboardData> {
  const [revenue, traffic, conversion, seo, funnel] = await Promise.all([
    loadRevenueTile(),
    loadTrafficTile(),
    loadConversionTile(),
    loadSEOTile(),
    loadFunnelTile(),
  ]);

  const tiles = [revenue, traffic, conversion, seo, funnel];

  return {
    tiles,
    timestamp: new Date().toISOString(),
    period: {
      start: (revenue.metadata as any).period.start,
      end: (revenue.metadata as any).period.end,
    },
  };
}

