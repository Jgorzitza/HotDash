/**
 * ROAS Calculation Engine
 * 
 * Purpose: Advanced ROAS (Return on Ad Spend) calculation and analysis
 * Owner: ads agent
 * Date: 2025-10-15
 */

import type { AdPlatform } from './tracking';

export type TimePeriod = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export interface RoasDataPoint {
  date: string;
  revenue: number;
  adSpend: number;
  roas: number;
  platform?: AdPlatform;
}

export interface RoasTrend {
  period: TimePeriod;
  dataPoints: RoasDataPoint[];
  averageRoas: number;
  minRoas: number;
  maxRoas: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  trendPercentage: number;
}

export interface RoasBenchmark {
  platform: AdPlatform;
  industryAverage: number;
  goodPerformance: number;
  greatPerformance: number;
  yourRoas: number;
  percentile: number;
}

export interface IncrementalRoas {
  totalRevenue: number;
  baselineRevenue: number;
  incrementalRevenue: number;
  adSpend: number;
  iroas: number;
}

export function calculateRoas(revenue: number, adSpend: number): number {
  if (adSpend <= 0) return 0;
  if (revenue < 0) return 0;
  return revenue / adSpend;
}

export function calculateRoasStrict(revenue: number, adSpend: number): number {
  if (adSpend <= 0) throw new Error('Ad spend must be greater than 0');
  if (revenue < 0) throw new Error('Revenue cannot be negative');
  return revenue / adSpend;
}

export function calculateTimePeriodRoas(
  dataPoints: RoasDataPoint[],
  period: TimePeriod
): RoasDataPoint[] {
  const grouped = new Map<string, { revenue: number; adSpend: number }>();

  for (const point of dataPoints) {
    const periodKey = getPeriodKey(point.date, period);
    const existing = grouped.get(periodKey) || { revenue: 0, adSpend: 0 };
    grouped.set(periodKey, {
      revenue: existing.revenue + point.revenue,
      adSpend: existing.adSpend + point.adSpend,
    });
  }

  const result: RoasDataPoint[] = [];
  for (const [date, data] of grouped.entries()) {
    result.push({
      date,
      revenue: data.revenue,
      adSpend: data.adSpend,
      roas: calculateRoas(data.revenue, data.adSpend),
    });
  }

  return result.sort((a, b) => a.date.localeCompare(b.date));
}

function getPeriodKey(date: string, period: TimePeriod): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  switch (period) {
    case 'daily':
      return `${year}-${month}-${day}`;
    case 'weekly':
      const weekNum = getWeekNumber(d);
      return `${year}-W${String(weekNum).padStart(2, '0')}`;
    case 'monthly':
      return `${year}-${month}`;
    case 'quarterly':
      const quarter = Math.floor((d.getMonth() + 3) / 3);
      return `${year}-Q${quarter}`;
    case 'yearly':
      return `${year}`;
  }
}

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

export function analyzeRoasTrend(
  dataPoints: RoasDataPoint[],
  period: TimePeriod
): RoasTrend {
  if (dataPoints.length === 0) {
    throw new Error('Cannot analyze trend with empty data');
  }

  const periodData = calculateTimePeriodRoas(dataPoints, period);
  const roasValues = periodData.map(p => p.roas);
  const averageRoas = roasValues.reduce((sum, r) => sum + r, 0) / roasValues.length;
  const minRoas = Math.min(...roasValues);
  const maxRoas = Math.max(...roasValues);

  let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
  let trendPercentage = 0;

  if (periodData.length >= 2) {
    const firstHalf = periodData.slice(0, Math.floor(periodData.length / 2));
    const secondHalf = periodData.slice(Math.floor(periodData.length / 2));
    const firstAvg = firstHalf.reduce((sum, p) => sum + p.roas, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, p) => sum + p.roas, 0) / secondHalf.length;
    trendPercentage = ((secondAvg - firstAvg) / firstAvg) * 100;

    if (trendPercentage > 5) {
      trend = 'increasing';
    } else if (trendPercentage < -5) {
      trend = 'decreasing';
    }
  }

  return {
    period,
    dataPoints: periodData,
    averageRoas,
    minRoas,
    maxRoas,
    trend,
    trendPercentage,
  };
}

export function getRoasBenchmark(platform: AdPlatform, yourRoas: number): RoasBenchmark {
  const benchmarks: Record<AdPlatform, { avg: number; good: number; great: number }> = {
    meta: { avg: 3.0, good: 4.0, great: 5.0 },
    google: { avg: 4.0, good: 5.0, great: 7.0 },
    tiktok: { avg: 2.75, good: 3.5, great: 4.5 },
  };

  const benchmark = benchmarks[platform];
  let percentile = 50;
  
  if (yourRoas >= benchmark.great) {
    percentile = 90 + ((yourRoas - benchmark.great) / benchmark.great) * 10;
    percentile = Math.min(percentile, 99);
  } else if (yourRoas >= benchmark.good) {
    percentile = 75 + ((yourRoas - benchmark.good) / (benchmark.great - benchmark.good)) * 15;
  } else if (yourRoas >= benchmark.avg) {
    percentile = 50 + ((yourRoas - benchmark.avg) / (benchmark.good - benchmark.avg)) * 25;
  } else {
    percentile = (yourRoas / benchmark.avg) * 50;
  }

  return {
    platform,
    industryAverage: benchmark.avg,
    goodPerformance: benchmark.good,
    greatPerformance: benchmark.great,
    yourRoas,
    percentile: Math.round(percentile),
  };
}

export function calculateIncrementalRoas(
  totalRevenue: number,
  baselineRevenue: number,
  adSpend: number
): IncrementalRoas {
  const incrementalRevenue = totalRevenue - baselineRevenue;

  return {
    totalRevenue,
    baselineRevenue,
    incrementalRevenue,
    adSpend,
    iroas: calculateRoas(incrementalRevenue, adSpend),
  };
}

export function forecastRoas(
  dataPoints: RoasDataPoint[],
  periodsAhead: number
): RoasDataPoint[] {
  if (dataPoints.length < 2) {
    throw new Error('Need at least 2 data points for forecasting');
  }

  const n = dataPoints.length;
  const x = Array.from({ length: n }, (_, i) => i);
  const y = dataPoints.map(p => p.roas);

  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  const forecasts: RoasDataPoint[] = [];
  const lastDate = new Date(dataPoints[dataPoints.length - 1].date);
  const avgRevenue = dataPoints.reduce((sum, p) => sum + p.revenue, 0) / n;
  const avgSpend = dataPoints.reduce((sum, p) => sum + p.adSpend, 0) / n;

  for (let i = 1; i <= periodsAhead; i++) {
    const forecastDate = new Date(lastDate);
    forecastDate.setDate(forecastDate.getDate() + i);
    const forecastRoas = slope * (n + i - 1) + intercept;

    forecasts.push({
      date: forecastDate.toISOString().split('T')[0],
      revenue: avgRevenue,
      adSpend: avgSpend,
      roas: Math.max(0, forecastRoas),
    });
  }

  return forecasts;
}

