/**
 * Core Web Vitals Monitoring
 * 
 * Track and monitor Core Web Vitals metrics:
 * - LCP (Largest Contentful Paint)
 * - FID (First Input Delay) / INP (Interaction to Next Paint)
 * - CLS (Cumulative Layout Shift)
 * 
 * Integrates with PageSpeed Insights API and Chrome UX Report (CrUX)
 * 
 * @module lib/seo/web-vitals
 */

export type VitalsMetric = 'LCP' | 'FID' | 'INP' | 'CLS' | 'FCP' | 'TTFB';
export type VitalsRating = 'good' | 'needs-improvement' | 'poor';
export type DeviceType = 'mobile' | 'desktop' | 'tablet';

export interface VitalsScore {
  metric: VitalsMetric;
  value: number;
  rating: VitalsRating;
  percentile: number; // P75 percentile
  unit: 'ms' | 'score' | 's';
}

export interface PageVitals {
  url: string;
  device: DeviceType;
  scores: VitalsScore[];
  overallRating: VitalsRating;
  lastUpdated: string;
  sampleSize?: number;
}

export interface VitalsHistory {
  url: string;
  device: DeviceType;
  metric: VitalsMetric;
  history: Array<{
    date: string;
    value: number;
    rating: VitalsRating;
  }>;
}

export interface VitalsAlert {
  url: string;
  metric: VitalsMetric;
  currentValue: number;
  threshold: number;
  rating: VitalsRating;
  severity: 'critical' | 'warning';
  device: DeviceType;
  detectedAt: string;
}

/**
 * Core Web Vitals thresholds (Google's official thresholds)
 */
export const VITALS_THRESHOLDS = {
  LCP: {
    good: 2500,      // ≤ 2.5s
    poor: 4000,      // > 4.0s
    unit: 'ms' as const,
  },
  FID: {
    good: 100,       // ≤ 100ms
    poor: 300,       // > 300ms
    unit: 'ms' as const,
  },
  INP: {
    good: 200,       // ≤ 200ms
    poor: 500,       // > 500ms
    unit: 'ms' as const,
  },
  CLS: {
    good: 0.1,       // ≤ 0.1
    poor: 0.25,      // > 0.25
    unit: 'score' as const,
  },
  FCP: {
    good: 1800,      // ≤ 1.8s
    poor: 3000,      // > 3.0s
    unit: 'ms' as const,
  },
  TTFB: {
    good: 800,       // ≤ 800ms
    poor: 1800,      // > 1.8s
    unit: 'ms' as const,
  },
} as const;

/**
 * Calculate rating based on metric value and thresholds
 */
export function calculateRating(metric: VitalsMetric, value: number): VitalsRating {
  const thresholds = VITALS_THRESHOLDS[metric];
  
  if (value <= thresholds.good) {
    return 'good';
  }
  
  if (value > thresholds.poor) {
    return 'poor';
  }
  
  return 'needs-improvement';
}

/**
 * Calculate overall page rating from all metrics
 */
export function calculateOverallRating(scores: VitalsScore[]): VitalsRating {
  const ratings = scores.map(s => s.rating);
  
  // If any metric is poor, overall is poor
  if (ratings.includes('poor')) {
    return 'poor';
  }
  
  // If any metric needs improvement, overall needs improvement
  if (ratings.includes('needs-improvement')) {
    return 'needs-improvement';
  }
  
  return 'good';
}

/**
 * Detect vitals alerts based on thresholds
 */
export function detectVitalsAlerts(
  pageVitals: PageVitals[],
  severityLevel: 'critical' | 'warning' | 'all' = 'all'
): VitalsAlert[] {
  const alerts: VitalsAlert[] = [];
  
  pageVitals.forEach(page => {
    page.scores.forEach(score => {
      if (score.rating === 'poor' || (severityLevel === 'all' && score.rating === 'needs-improvement')) {
        const threshold = VITALS_THRESHOLDS[score.metric].poor;
        const severity = score.rating === 'poor' ? 'critical' : 'warning';
        
        if (severityLevel === 'all' || severityLevel === severity) {
          alerts.push({
            url: page.url,
            metric: score.metric,
            currentValue: score.value,
            threshold,
            rating: score.rating,
            severity,
            device: page.device,
            detectedAt: page.lastUpdated,
          });
        }
      }
    });
  });
  
  return alerts.sort((a, b) => {
    // Sort by severity (critical first), then by how far over threshold
    if (a.severity !== b.severity) {
      return a.severity === 'critical' ? -1 : 1;
    }
    const aOverage = a.currentValue - a.threshold;
    const bOverage = b.currentValue - b.threshold;
    return bOverage - aOverage;
  });
}

/**
 * Get metric unit
 */
export function getMetricUnit(metric: VitalsMetric): 'ms' | 'score' | 's' {
  return VITALS_THRESHOLDS[metric].unit;
}

/**
 * Format metric value for display
 */
export function formatMetricValue(metric: VitalsMetric, value: number): string {
  const unit = getMetricUnit(metric);
  
  if (unit === 'score') {
    return value.toFixed(3);
  }
  
  if (unit === 's') {
    return `${(value / 1000).toFixed(2)}s`;
  }
  
  return `${Math.round(value)}ms`;
}

/**
 * Calculate vitals trend (improving/declining/stable)
 */
export function calculateVitalsTrend(
  history: VitalsHistory,
  days: number = 7
): 'improving' | 'declining' | 'stable' {
  if (history.history.length < 2) {
    return 'stable';
  }
  
  const recent = history.history.slice(-days);
  
  if (recent.length < 2) {
    return 'stable';
  }
  
  const firstValue = recent[0].value;
  const lastValue = recent[recent.length - 1].value;
  const change = lastValue - firstValue;
  const changePercent = Math.abs(change / firstValue);
  
  // Need at least 10% change to be considered a trend
  if (changePercent < 0.1) {
    return 'stable';
  }
  
  // For vitals, lower is better
  if (change < 0) {
    return 'improving';
  }
  
  return 'declining';
}

/**
 * Get pages with poor vitals
 */
export function getPoorVitalsPages(
  pages: PageVitals[],
  metric?: VitalsMetric
): PageVitals[] {
  return pages.filter(page => {
    if (metric) {
      const score = page.scores.find(s => s.metric === metric);
      return score && score.rating === 'poor';
    }
    return page.overallRating === 'poor';
  });
}

/**
 * Get pages that need improvement
 */
export function getNeedsImprovementPages(
  pages: PageVitals[],
  metric?: VitalsMetric
): PageVitals[] {
  return pages.filter(page => {
    if (metric) {
      const score = page.scores.find(s => s.metric === metric);
      return score && score.rating === 'needs-improvement';
    }
    return page.overallRating === 'needs-improvement';
  });
}

/**
 * Calculate average metric value across pages
 */
export function calculateAverageMetric(
  pages: PageVitals[],
  metric: VitalsMetric
): number {
  const values = pages
    .map(page => page.scores.find(s => s.metric === metric))
    .filter((score): score is VitalsScore => score !== undefined)
    .map(score => score.value);
  
  if (values.length === 0) {
    return 0;
  }
  
  return values.reduce((sum, val) => sum + val, 0) / values.length;
}

/**
 * Mock PageSpeed Insights API call
 * TODO: Replace with real PageSpeed Insights API integration
 */
export async function fetchPageSpeedData(
  url: string,
  device: DeviceType = 'mobile'
): Promise<PageVitals> {
  // Mock implementation - returns sample data
  console.log('[web-vitals] Mock PageSpeed API call:', { url, device });
  
  // Return mock data with good scores
  return {
    url,
    device,
    scores: [
      {
        metric: 'LCP',
        value: 2200,
        rating: 'good',
        percentile: 75,
        unit: 'ms',
      },
      {
        metric: 'FID',
        value: 80,
        rating: 'good',
        percentile: 75,
        unit: 'ms',
      },
      {
        metric: 'CLS',
        value: 0.08,
        rating: 'good',
        percentile: 75,
        unit: 'score',
      },
    ],
    overallRating: 'good',
    lastUpdated: new Date().toISOString(),
    sampleSize: 1000,
  };
}

/**
 * Fetch vitals for multiple pages
 */
export async function fetchMultiplePageVitals(
  urls: string[],
  device: DeviceType = 'mobile'
): Promise<PageVitals[]> {
  const results = await Promise.all(
    urls.map(url => fetchPageSpeedData(url, device))
  );
  
  return results;
}

