/**
 * Unit Tests for ROAS Calculations
 * 
 * Purpose: Test advanced ROAS calculation functions
 * Owner: ads agent
 * Date: 2025-10-16
 */

import { describe, it, expect } from 'vitest';
import {
  calculateRoas,
  calculateRoasStrict,
  calculateTimePeriodRoas,
  analyzeRoasTrend,
  getRoasBenchmark,
  calculateIncrementalRoas,
  forecastRoas,
  type RoasDataPoint,
} from '../roas';

describe('calculateRoas', () => {
  it('calculates correct ROAS', () => {
    expect(calculateRoas(1000, 250)).toBe(4.0);
    expect(calculateRoas(500, 100)).toBe(5.0);
  });

  it('returns 0 for zero ad spend', () => {
    expect(calculateRoas(1000, 0)).toBe(0);
  });

  it('returns 0 for negative revenue', () => {
    expect(calculateRoas(-100, 100)).toBe(0);
  });
});

describe('calculateRoasStrict', () => {
  it('calculates correct ROAS', () => {
    expect(calculateRoasStrict(1000, 250)).toBe(4.0);
  });

  it('throws error for zero ad spend', () => {
    expect(() => calculateRoasStrict(1000, 0)).toThrow('Ad spend must be greater than 0');
  });

  it('throws error for negative revenue', () => {
    expect(() => calculateRoasStrict(-100, 100)).toThrow('Revenue cannot be negative');
  });
});

describe('calculateTimePeriodRoas', () => {
  const dataPoints: RoasDataPoint[] = [
    { date: '2025-10-01', revenue: 100, adSpend: 25, roas: 4.0 },
    { date: '2025-10-02', revenue: 120, adSpend: 30, roas: 4.0 },
    { date: '2025-10-03', revenue: 150, adSpend: 30, roas: 5.0 },
  ];

  it('aggregates daily data', () => {
    const result = calculateTimePeriodRoas(dataPoints, 'daily');
    expect(result).toHaveLength(3);
    expect(result[0].date).toBe('2025-10-01');
  });

  it('aggregates weekly data', () => {
    const result = calculateTimePeriodRoas(dataPoints, 'weekly');
    expect(result.length).toBeGreaterThan(0);
  });

  it('aggregates monthly data', () => {
    const result = calculateTimePeriodRoas(dataPoints, 'monthly');
    expect(result).toHaveLength(1);
    expect(result[0].date).toBe('2025-10');
  });
});

describe('analyzeRoasTrend', () => {
  it('detects increasing trend', () => {
    const dataPoints: RoasDataPoint[] = [
      { date: '2025-10-01', revenue: 100, adSpend: 50, roas: 2.0 },
      { date: '2025-10-02', revenue: 150, adSpend: 50, roas: 3.0 },
      { date: '2025-10-03', revenue: 200, adSpend: 50, roas: 4.0 },
    ];

    const trend = analyzeRoasTrend(dataPoints, 'daily');
    expect(trend.trend).toBe('increasing');
    expect(trend.trendPercentage).toBeGreaterThan(0);
  });

  it('detects decreasing trend', () => {
    const dataPoints: RoasDataPoint[] = [
      { date: '2025-10-01', revenue: 200, adSpend: 50, roas: 4.0 },
      { date: '2025-10-02', revenue: 150, adSpend: 50, roas: 3.0 },
      { date: '2025-10-03', revenue: 100, adSpend: 50, roas: 2.0 },
    ];

    const trend = analyzeRoasTrend(dataPoints, 'daily');
    expect(trend.trend).toBe('decreasing');
    expect(trend.trendPercentage).toBeLessThan(0);
  });

  it('calculates min, max, and average', () => {
    const dataPoints: RoasDataPoint[] = [
      { date: '2025-10-01', revenue: 100, adSpend: 50, roas: 2.0 },
      { date: '2025-10-02', revenue: 200, adSpend: 50, roas: 4.0 },
      { date: '2025-10-03', revenue: 150, adSpend: 50, roas: 3.0 },
    ];

    const trend = analyzeRoasTrend(dataPoints, 'daily');
    expect(trend.minRoas).toBe(2.0);
    expect(trend.maxRoas).toBe(4.0);
    expect(trend.averageRoas).toBe(3.0);
  });
});

describe('getRoasBenchmark', () => {
  it('returns correct benchmark for Meta', () => {
    const benchmark = getRoasBenchmark('meta', 4.5);
    expect(benchmark.platform).toBe('meta');
    expect(benchmark.industryAverage).toBe(3.0);
    expect(benchmark.goodPerformance).toBe(4.0);
    expect(benchmark.greatPerformance).toBe(5.0);
    expect(benchmark.yourRoas).toBe(4.5);
    expect(benchmark.percentile).toBeGreaterThan(75);
  });

  it('returns correct benchmark for Google', () => {
    const benchmark = getRoasBenchmark('google', 6.0);
    expect(benchmark.platform).toBe('google');
    expect(benchmark.industryAverage).toBe(4.0);
    expect(benchmark.percentile).toBeGreaterThan(75);
  });

  it('calculates percentile correctly', () => {
    const lowPerformer = getRoasBenchmark('meta', 2.0);
    const highPerformer = getRoasBenchmark('meta', 6.0);
    expect(lowPerformer.percentile).toBeLessThan(50);
    expect(highPerformer.percentile).toBeGreaterThan(90);
  });
});

describe('calculateIncrementalRoas', () => {
  it('calculates incremental ROAS correctly', () => {
    const result = calculateIncrementalRoas(5000, 3000, 500);
    expect(result.totalRevenue).toBe(5000);
    expect(result.baselineRevenue).toBe(3000);
    expect(result.incrementalRevenue).toBe(2000);
    expect(result.adSpend).toBe(500);
    expect(result.iroas).toBe(4.0);
  });

  it('handles zero baseline', () => {
    const result = calculateIncrementalRoas(5000, 0, 500);
    expect(result.incrementalRevenue).toBe(5000);
    expect(result.iroas).toBe(10.0);
  });
});

describe('forecastRoas', () => {
  it('forecasts future ROAS', () => {
    const dataPoints: RoasDataPoint[] = [
      { date: '2025-10-01', revenue: 100, adSpend: 50, roas: 2.0 },
      { date: '2025-10-02', revenue: 150, adSpend: 50, roas: 3.0 },
      { date: '2025-10-03', revenue: 200, adSpend: 50, roas: 4.0 },
    ];

    const forecast = forecastRoas(dataPoints, 3);
    expect(forecast).toHaveLength(3);
    expect(forecast[0].roas).toBeGreaterThan(0);
  });

  it('throws error with insufficient data', () => {
    const dataPoints: RoasDataPoint[] = [
      { date: '2025-10-01', revenue: 100, adSpend: 50, roas: 2.0 },
    ];

    expect(() => forecastRoas(dataPoints, 3)).toThrow('Need at least 2 data points');
  });
});

