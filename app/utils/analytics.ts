/**
 * Analytics Utilities
 * 
 * ANALYTICS-002: Utility functions for action attribution and ROI measurement
 * Provides helper functions for analytics calculations and data processing
 */

import type { ActionAttributionResult } from '~/services/analytics/action-attribution';
import type { EnhancedActionAttributionResult } from '~/services/analytics/action-attribution-enhanced';

// ============================================================================
// ROI Calculation Utilities
// ============================================================================

/**
 * Calculate Return on Investment (ROI)
 */
export function calculateROI(revenue: number, cost: number): number {
  if (cost === 0) return 0;
  return ((revenue - cost) / cost) * 100;
}

/**
 * Calculate Return on Ad Spend (ROAS)
 */
export function calculateROAS(revenue: number, adSpend: number): number {
  if (adSpend === 0) return 0;
  return revenue / adSpend;
}

/**
 * Calculate Cost Per Acquisition (CPA)
 */
export function calculateCPA(cost: number, acquisitions: number): number {
  if (acquisitions === 0) return 0;
  return cost / acquisitions;
}

/**
 * Calculate Cost Per Click (CPC)
 */
export function calculateCPC(cost: number, clicks: number): number {
  if (clicks === 0) return 0;
  return cost / clicks;
}

/**
 * Calculate Cost Per Mille (CPM)
 */
export function calculateCPM(cost: number, impressions: number): number {
  if (impressions === 0) return 0;
  return (cost / impressions) * 1000;
}

// ============================================================================
// Performance Metrics Utilities
// ============================================================================

/**
 * Calculate performance score based on multiple metrics
 */
export function calculatePerformanceScore(
  conversionRate: number,
  averageOrderValue: number,
  sessions: number,
  revenue: number
): number {
  // Weighted scoring system
  const conversionScore = Math.min(100, conversionRate * 10); // 0-100
  const aovScore = Math.min(100, averageOrderValue / 10); // 0-100
  const volumeScore = Math.min(100, Math.log10(sessions + 1) * 20); // 0-100
  const revenueScore = Math.min(100, Math.log10(revenue + 1) * 15); // 0-100
  
  return (conversionScore * 0.3 + aovScore * 0.2 + volumeScore * 0.2 + revenueScore * 0.3);
}

/**
 * Calculate attribution efficiency
 */
export function calculateAttributionEfficiency(revenue: number, sessions: number): number {
  if (sessions === 0) return 0;
  return revenue / sessions;
}

/**
 * Calculate conversion funnel efficiency
 */
export function calculateFunnelEfficiency(
  sessions: number,
  pageviews: number,
  addToCarts: number,
  purchases: number
): {
  sessionToPageview: number;
  pageviewToCart: number;
  cartToPurchase: number;
  overallEfficiency: number;
} {
  const sessionToPageview = sessions > 0 ? (pageviews / sessions) * 100 : 0;
  const pageviewToCart = pageviews > 0 ? (addToCarts / pageviews) * 100 : 0;
  const cartToPurchase = addToCarts > 0 ? (purchases / addToCarts) * 100 : 0;
  const overallEfficiency = sessions > 0 ? (purchases / sessions) * 100 : 0;
  
  return {
    sessionToPageview,
    pageviewToCart,
    cartToPurchase,
    overallEfficiency
  };
}

// ============================================================================
// Data Processing Utilities
// ============================================================================

/**
 * Format currency values
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Format percentage values
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format large numbers with K/M suffixes
 */
export function formatNumber(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toString();
}

/**
 * Format duration in human-readable format
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${Math.round(seconds)}s`;
  } else if (seconds < 3600) {
    return `${Math.round(seconds / 60)}m`;
  } else {
    return `${Math.round(seconds / 3600)}h`;
  }
}

// ============================================================================
// Data Analysis Utilities
// ============================================================================

/**
 * Calculate trend direction
 */
export function calculateTrend(current: number, previous: number): {
  direction: 'increasing' | 'decreasing' | 'stable';
  percentage: number;
  significance: 'high' | 'medium' | 'low';
} {
  if (previous === 0) {
    return {
      direction: current > 0 ? 'increasing' : 'stable',
      percentage: 0,
      significance: 'low'
    };
  }
  
  const percentage = ((current - previous) / previous) * 100;
  const direction = percentage > 5 ? 'increasing' : percentage < -5 ? 'decreasing' : 'stable';
  const significance = Math.abs(percentage) > 20 ? 'high' : Math.abs(percentage) > 10 ? 'medium' : 'low';
  
  return { direction, percentage, significance };
}

/**
 * Calculate correlation between two metrics
 */
export function calculateCorrelation(data: Array<{ x: number; y: number }>): number {
  if (data.length < 2) return 0;
  
  const n = data.length;
  const sumX = data.reduce((sum, point) => sum + point.x, 0);
  const sumY = data.reduce((sum, point) => sum + point.y, 0);
  const sumXY = data.reduce((sum, point) => sum + point.x * point.y, 0);
  const sumXX = data.reduce((sum, point) => sum + point.x * point.x, 0);
  const sumYY = data.reduce((sum, point) => sum + point.y * point.y, 0);
  
  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));
  
  return denominator === 0 ? 0 : numerator / denominator;
}

/**
 * Calculate moving average
 */
export function calculateMovingAverage(data: number[], windowSize: number): number[] {
  if (data.length < windowSize) return data;
  
  const result: number[] = [];
  for (let i = windowSize - 1; i < data.length; i++) {
    const window = data.slice(i - windowSize + 1, i + 1);
    const average = window.reduce((sum, value) => sum + value, 0) / windowSize;
    result.push(average);
  }
  
  return result;
}

// ============================================================================
// Attribution Analysis Utilities
// ============================================================================

/**
 * Calculate attribution confidence score
 */
export function calculateAttributionConfidence(
  touchpointCount: number,
  conversionRate: number,
  dataQuality: number
): number {
  const touchpointScore = Math.min(100, touchpointCount * 20);
  const conversionScore = Math.min(100, conversionRate * 10);
  const qualityScore = Math.min(100, dataQuality * 100);
  
  return (touchpointScore * 0.4 + conversionScore * 0.4 + qualityScore * 0.2);
}

/**
 * Identify attribution patterns
 */
export function identifyAttributionPatterns(
  attributionData: EnhancedActionAttributionResult[]
): {
  patterns: string[];
  insights: string[];
  recommendations: string[];
} {
  const patterns: string[] = [];
  const insights: string[] = [];
  const recommendations: string[] = [];
  
  // Analyze peak performance hours
  const peakHours = attributionData.map(d => d.peakPerformanceHour);
  const mostCommonPeakHour = peakHours.reduce((a, b, i, arr) => 
    arr.filter(v => v === a).length >= arr.filter(v => v === b).length ? a : b, 0);
  
  if (mostCommonPeakHour >= 9 && mostCommonPeakHour <= 17) {
    patterns.push('Business hours performance');
    insights.push('Actions perform best during business hours (9 AM - 5 PM)');
    recommendations.push('Schedule high-impact actions during business hours');
  }
  
  // Analyze seasonal trends
  const increasingTrends = attributionData.filter(d => d.seasonalTrend === 'increasing').length;
  const totalActions = attributionData.length;
  
  if (increasingTrends / totalActions > 0.7) {
    patterns.push('Positive trend momentum');
    insights.push(`${increasingTrends}/${totalActions} actions showing increasing performance`);
    recommendations.push('Maintain current strategy and consider scaling successful actions');
  }
  
  // Analyze attribution efficiency
  const highEfficiencyActions = attributionData.filter(d => d.attributionEfficiency > 10).length;
  
  if (highEfficiencyActions > 0) {
    patterns.push('High attribution efficiency');
    insights.push(`${highEfficiencyActions} actions with high attribution efficiency (>$10/session)`);
    recommendations.push('Scale high-efficiency actions and analyze their success factors');
  }
  
  return { patterns, insights, recommendations };
}

/**
 * Calculate attribution lift
 */
export function calculateAttributionLift(
  withAttribution: number,
  withoutAttribution: number
): {
  lift: number;
  liftPercentage: number;
  significance: 'high' | 'medium' | 'low';
} {
  const lift = withAttribution - withoutAttribution;
  const liftPercentage = withoutAttribution > 0 ? (lift / withoutAttribution) * 100 : 0;
  const significance = liftPercentage > 50 ? 'high' : liftPercentage > 20 ? 'medium' : 'low';
  
  return { lift, liftPercentage, significance };
}

// ============================================================================
// Data Validation Utilities
// ============================================================================

/**
 * Validate attribution data quality
 */
export function validateAttributionData(data: ActionAttributionResult): {
  isValid: boolean;
  qualityScore: number;
  issues: string[];
} {
  const issues: string[] = [];
  let qualityScore = 100;
  
  // Check for missing data
  if (data.sessions === 0) {
    issues.push('No sessions data');
    qualityScore -= 30;
  }
  
  if (data.revenue === 0) {
    issues.push('No revenue data');
    qualityScore -= 25;
  }
  
  if (data.purchases === 0) {
    issues.push('No conversion data');
    qualityScore -= 20;
  }
  
  // Check for data consistency
  if (data.sessions > 0 && data.conversionRate > 100) {
    issues.push('Conversion rate exceeds 100%');
    qualityScore -= 15;
  }
  
  if (data.purchases > data.sessions) {
    issues.push('More purchases than sessions');
    qualityScore -= 20;
  }
  
  // Check for realistic values
  if (data.averageOrderValue < 0) {
    issues.push('Negative average order value');
    qualityScore -= 25;
  }
  
  if (data.conversionRate < 0) {
    issues.push('Negative conversion rate');
    qualityScore -= 20;
  }
  
  return {
    isValid: issues.length === 0,
    qualityScore: Math.max(0, qualityScore),
    issues
  };
}

/**
 * Clean and normalize attribution data
 */
export function cleanAttributionData(data: ActionAttributionResult): ActionAttributionResult {
  return {
    ...data,
    sessions: Math.max(0, data.sessions),
    pageviews: Math.max(0, data.pageviews),
    addToCarts: Math.max(0, data.addToCarts),
    purchases: Math.max(0, data.purchases),
    revenue: Math.max(0, data.revenue),
    conversionRate: Math.max(0, Math.min(100, data.conversionRate)),
    averageOrderValue: Math.max(0, data.averageOrderValue),
    realizedROI: Math.max(0, data.realizedROI)
  };
}

// ============================================================================
// Export all utilities
// ============================================================================

export {
  // ROI calculations
  calculateROI,
  calculateROAS,
  calculateCPA,
  calculateCPC,
  calculateCPM,
  
  // Performance metrics
  calculatePerformanceScore,
  calculateAttributionEfficiency,
  calculateFunnelEfficiency,
  
  // Data formatting
  formatCurrency,
  formatPercentage,
  formatNumber,
  formatDuration,
  
  // Data analysis
  calculateTrend,
  calculateCorrelation,
  calculateMovingAverage,
  
  // Attribution analysis
  calculateAttributionConfidence,
  identifyAttributionPatterns,
  calculateAttributionLift,
  
  // Data validation
  validateAttributionData,
  cleanAttributionData
};