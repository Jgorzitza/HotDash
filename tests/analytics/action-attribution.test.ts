/**
 * Action Attribution Test Suite
 * 
 * ANALYTICS-002: Comprehensive tests for action attribution and ROI measurement
 * Tests the enhanced action attribution system functionality
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  calculateROI,
  calculateROAS,
  calculateCPA,
  calculatePerformanceScore,
  calculateAttributionEfficiency,
  calculateFunnelEfficiency,
  formatCurrency,
  formatPercentage,
  formatNumber,
  calculateTrend,
  calculateCorrelation,
  calculateMovingAverage,
  calculateAttributionConfidence,
  identifyAttributionPatterns,
  calculateAttributionLift,
  validateAttributionData,
  cleanAttributionData
} from '~/utils/analytics';
import type { ActionAttributionResult } from '~/services/analytics/action-attribution';
import type { EnhancedActionAttributionResult } from '~/services/analytics/action-attribution-enhanced';

// Mock data for testing
const mockAttributionData: ActionAttributionResult = {
  actionKey: 'test-action-123',
  periodDays: 28,
  sessions: 1000,
  pageviews: 2500,
  addToCarts: 150,
  purchases: 50,
  revenue: 5000,
  conversionRate: 5.0,
  averageOrderValue: 100,
  realizedROI: 5000
};

const mockEnhancedAttributionData: EnhancedActionAttributionResult = {
  ...mockAttributionData,
  costPerAcquisition: 10,
  returnOnAdSpend: 2.5,
  lifetimeValue: 130,
  attributionEfficiency: 5.0,
  performanceScore: 75,
  peakPerformanceHour: 14,
  peakPerformanceDay: 'Tuesday',
  seasonalTrend: 'increasing',
  attributionPath: ['google/organic', 'facebook/paid'],
  touchpointCount: 2,
  attributionConfidence: 85
};

describe('ROI Calculation Utilities', () => {
  it('should calculate ROI correctly', () => {
    expect(calculateROI(1000, 500)).toBe(100); // 100% ROI
    expect(calculateROI(1000, 1000)).toBe(0); // 0% ROI
    expect(calculateROI(500, 1000)).toBe(-50); // -50% ROI
    expect(calculateROI(1000, 0)).toBe(0); // Handle zero cost
  });

  it('should calculate ROAS correctly', () => {
    expect(calculateROAS(1000, 500)).toBe(2); // 2x ROAS
    expect(calculateROAS(1000, 1000)).toBe(1); // 1x ROAS
    expect(calculateROAS(500, 1000)).toBe(0.5); // 0.5x ROAS
    expect(calculateROAS(1000, 0)).toBe(0); // Handle zero ad spend
  });

  it('should calculate CPA correctly', () => {
    expect(calculateCPA(1000, 100)).toBe(10); // $10 CPA
    expect(calculateCPA(1000, 50)).toBe(20); // $20 CPA
    expect(calculateCPA(1000, 0)).toBe(0); // Handle zero acquisitions
  });
});

describe('Performance Metrics Utilities', () => {
  it('should calculate performance score correctly', () => {
    const score = calculatePerformanceScore(5.0, 100, 1000, 5000);
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it('should calculate attribution efficiency correctly', () => {
    expect(calculateAttributionEfficiency(5000, 1000)).toBe(5);
    expect(calculateAttributionEfficiency(0, 1000)).toBe(0);
    expect(calculateAttributionEfficiency(5000, 0)).toBe(0);
  });

  it('should calculate funnel efficiency correctly', () => {
    const efficiency = calculateFunnelEfficiency(1000, 2500, 150, 50);
    expect(efficiency.sessionToPageview).toBe(250);
    expect(efficiency.pageviewToCart).toBe(6);
    expect(efficiency.cartToPurchase).toBeCloseTo(33.33, 1);
    expect(efficiency.overallEfficiency).toBe(5);
  });
});

describe('Data Formatting Utilities', () => {
  it('should format currency correctly', () => {
    expect(formatCurrency(1000)).toBe('$1,000');
    expect(formatCurrency(1000.50)).toBe('$1,001');
    expect(formatCurrency(0)).toBe('$0');
  });

  it('should format percentage correctly', () => {
    expect(formatPercentage(5.0)).toBe('5.0%');
    expect(formatPercentage(5.123, 2)).toBe('5.12%');
    expect(formatPercentage(0)).toBe('0.0%');
  });

  it('should format large numbers correctly', () => {
    expect(formatNumber(1000)).toBe('1.0K');
    expect(formatNumber(1000000)).toBe('1.0M');
    expect(formatNumber(500)).toBe('500');
  });
});

describe('Data Analysis Utilities', () => {
  it('should calculate trend correctly', () => {
    const trend = calculateTrend(120, 100);
    expect(trend.direction).toBe('increasing');
    expect(trend.percentage).toBe(20);
    expect(trend.significance).toBe('high');
  });

  it('should calculate correlation correctly', () => {
    const data = [
      { x: 1, y: 2 },
      { x: 2, y: 4 },
      { x: 3, y: 6 }
    ];
    const correlation = calculateCorrelation(data);
    expect(correlation).toBeCloseTo(1, 2); // Perfect positive correlation
  });

  it('should calculate moving average correctly', () => {
    const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const movingAvg = calculateMovingAverage(data, 3);
    expect(movingAvg).toHaveLength(8);
    expect(movingAvg[0]).toBe(2); // (1+2+3)/3
    expect(movingAvg[7]).toBe(9); // (8+9+10)/3
  });
});

describe('Attribution Analysis Utilities', () => {
  it('should calculate attribution confidence correctly', () => {
    const confidence = calculateAttributionConfidence(3, 5.0, 0.8);
    expect(confidence).toBeGreaterThan(0);
    expect(confidence).toBeLessThanOrEqual(100);
  });

  it('should identify attribution patterns correctly', () => {
    const patterns = identifyAttributionPatterns([mockEnhancedAttributionData]);
    expect(patterns.patterns).toBeInstanceOf(Array);
    expect(patterns.insights).toBeInstanceOf(Array);
    expect(patterns.recommendations).toBeInstanceOf(Array);
  });

  it('should calculate attribution lift correctly', () => {
    const lift = calculateAttributionLift(1000, 800);
    expect(lift.lift).toBe(200);
    expect(lift.liftPercentage).toBe(25);
    expect(lift.significance).toBe('high');
  });
});

describe('Data Validation Utilities', () => {
  it('should validate attribution data correctly', () => {
    const validation = validateAttributionData(mockAttributionData);
    expect(validation.isValid).toBe(true);
    expect(validation.qualityScore).toBeGreaterThan(0);
    expect(validation.issues).toHaveLength(0);
  });

  it('should identify data quality issues', () => {
    const badData: ActionAttributionResult = {
      ...mockAttributionData,
      sessions: 0,
      revenue: 0,
      conversionRate: 150 // Invalid > 100%
    };
    
    const validation = validateAttributionData(badData);
    expect(validation.isValid).toBe(false);
    expect(validation.issues.length).toBeGreaterThan(0);
  });

  it('should clean attribution data correctly', () => {
    const dirtyData: ActionAttributionResult = {
      ...mockAttributionData,
      sessions: -100, // Negative value
      conversionRate: 150, // Invalid > 100%
      averageOrderValue: -50 // Negative value
    };
    
    const cleaned = cleanAttributionData(dirtyData);
    expect(cleaned.sessions).toBe(0);
    expect(cleaned.conversionRate).toBe(100);
    expect(cleaned.averageOrderValue).toBe(0);
  });
});

describe('Edge Cases and Error Handling', () => {
  it('should handle zero values gracefully', () => {
    expect(calculateROI(0, 0)).toBe(0);
    expect(calculateROAS(0, 0)).toBe(0);
    expect(calculateCPA(0, 0)).toBe(0);
  });

  it('should handle negative values gracefully', () => {
    expect(calculateROI(-100, 100)).toBe(-200);
    expect(calculateROAS(-100, 100)).toBe(-1);
  });

  it('should handle empty arrays gracefully', () => {
    expect(calculateCorrelation([])).toBe(0);
    expect(calculateMovingAverage([], 3)).toEqual([]);
  });

  it('should handle single data points gracefully', () => {
    expect(calculateCorrelation([{ x: 1, y: 2 }])).toBe(0);
    expect(calculateMovingAverage([1, 2], 3)).toEqual([1, 2]);
  });
});

describe('Integration Tests', () => {
  it('should process complete attribution workflow', () => {
    // Validate input data
    const validation = validateAttributionData(mockAttributionData);
    expect(validation.isValid).toBe(true);
    
    // Clean data if needed
    const cleanedData = cleanAttributionData(mockAttributionData);
    expect(cleanedData).toEqual(mockAttributionData);
    
    // Calculate performance metrics
    const performanceScore = calculatePerformanceScore(
      cleanedData.conversionRate,
      cleanedData.averageOrderValue,
      cleanedData.sessions,
      cleanedData.revenue
    );
    expect(performanceScore).toBeGreaterThan(0);
    
    // Calculate attribution efficiency
    const efficiency = calculateAttributionEfficiency(
      cleanedData.revenue,
      cleanedData.sessions
    );
    expect(efficiency).toBeGreaterThan(0);
  });

  it('should handle enhanced attribution data', () => {
    const patterns = identifyAttributionPatterns([mockEnhancedAttributionData]);
    expect(patterns.patterns).toBeInstanceOf(Array);
    
    const confidence = calculateAttributionConfidence(
      mockEnhancedAttributionData.touchpointCount,
      mockEnhancedAttributionData.conversionRate,
      0.8
    );
    expect(confidence).toBeGreaterThan(0);
  });
});

describe('Performance Tests', () => {
  it('should handle large datasets efficiently', () => {
    const largeDataset = Array.from({ length: 10000 }, (_, i) => ({ x: i, y: i * 2 }));
    const start = Date.now();
    const correlation = calculateCorrelation(largeDataset);
    const duration = Date.now() - start;
    
    expect(correlation).toBeCloseTo(1, 2);
    expect(duration).toBeLessThan(1000); // Should complete within 1 second
  });

  it('should handle large moving average calculations efficiently', () => {
    const largeData = Array.from({ length: 10000 }, (_, i) => i);
    const start = Date.now();
    const movingAvg = calculateMovingAverage(largeData, 100);
    const duration = Date.now() - start;
    
    expect(movingAvg).toHaveLength(9901);
    expect(duration).toBeLessThan(1000); // Should complete within 1 second
  });
});
