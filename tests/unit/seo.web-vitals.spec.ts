import { describe, expect, it } from 'vitest';
import {
  calculateRating,
  calculateOverallRating,
  detectVitalsAlerts,
  formatMetricValue,
  calculateVitalsTrend,
  getPoorVitalsPages,
  calculateAverageMetric,
  VITALS_THRESHOLDS,
  type PageVitals,
  type VitalsScore,
  type VitalsHistory,
} from '../../app/lib/seo/web-vitals';

describe('Core Web Vitals Monitoring', () => {
  describe('calculateRating', () => {
    it('rates LCP correctly', () => {
      expect(calculateRating('LCP', 2000)).toBe('good');
      expect(calculateRating('LCP', 3000)).toBe('needs-improvement');
      expect(calculateRating('LCP', 5000)).toBe('poor');
    });

    it('rates FID correctly', () => {
      expect(calculateRating('FID', 50)).toBe('good');
      expect(calculateRating('FID', 200)).toBe('needs-improvement');
      expect(calculateRating('FID', 400)).toBe('poor');
    });

    it('rates CLS correctly', () => {
      expect(calculateRating('CLS', 0.05)).toBe('good');
      expect(calculateRating('CLS', 0.15)).toBe('needs-improvement');
      expect(calculateRating('CLS', 0.3)).toBe('poor');
    });
  });

  describe('calculateOverallRating', () => {
    it('returns poor if any metric is poor', () => {
      const scores: VitalsScore[] = [
        { metric: 'LCP', value: 2000, rating: 'good', percentile: 75, unit: 'ms' },
        { metric: 'FID', value: 50, rating: 'good', percentile: 75, unit: 'ms' },
        { metric: 'CLS', value: 0.3, rating: 'poor', percentile: 75, unit: 'score' },
      ];

      expect(calculateOverallRating(scores)).toBe('poor');
    });

    it('returns needs-improvement if any metric needs improvement', () => {
      const scores: VitalsScore[] = [
        { metric: 'LCP', value: 2000, rating: 'good', percentile: 75, unit: 'ms' },
        { metric: 'FID', value: 200, rating: 'needs-improvement', percentile: 75, unit: 'ms' },
        { metric: 'CLS', value: 0.05, rating: 'good', percentile: 75, unit: 'score' },
      ];

      expect(calculateOverallRating(scores)).toBe('needs-improvement');
    });

    it('returns good if all metrics are good', () => {
      const scores: VitalsScore[] = [
        { metric: 'LCP', value: 2000, rating: 'good', percentile: 75, unit: 'ms' },
        { metric: 'FID', value: 50, rating: 'good', percentile: 75, unit: 'ms' },
        { metric: 'CLS', value: 0.05, rating: 'good', percentile: 75, unit: 'score' },
      ];

      expect(calculateOverallRating(scores)).toBe('good');
    });
  });

  describe('detectVitalsAlerts', () => {
    const pages: PageVitals[] = [
      {
        url: '/page1',
        device: 'mobile',
        scores: [
          { metric: 'LCP', value: 5000, rating: 'poor', percentile: 75, unit: 'ms' },
          { metric: 'CLS', value: 0.05, rating: 'good', percentile: 75, unit: 'score' },
        ],
        overallRating: 'poor',
        lastUpdated: '2025-10-15T10:00:00Z',
      },
      {
        url: '/page2',
        device: 'mobile',
        scores: [
          { metric: 'LCP', value: 3000, rating: 'needs-improvement', percentile: 75, unit: 'ms' },
          { metric: 'FID', value: 50, rating: 'good', percentile: 75, unit: 'ms' },
        ],
        overallRating: 'needs-improvement',
        lastUpdated: '2025-10-15T10:00:00Z',
      },
    ];

    it('detects critical alerts', () => {
      const alerts = detectVitalsAlerts(pages, 'critical');

      expect(alerts).toHaveLength(1);
      expect(alerts[0].severity).toBe('critical');
      expect(alerts[0].metric).toBe('LCP');
      expect(alerts[0].url).toBe('/page1');
    });

    it('detects all alerts', () => {
      const alerts = detectVitalsAlerts(pages, 'all');

      expect(alerts).toHaveLength(2);
      expect(alerts[0].severity).toBe('critical');
      expect(alerts[1].severity).toBe('warning');
    });

    it('sorts alerts by severity', () => {
      const alerts = detectVitalsAlerts(pages, 'all');

      expect(alerts[0].severity).toBe('critical');
      expect(alerts[1].severity).toBe('warning');
    });
  });

  describe('formatMetricValue', () => {
    it('formats milliseconds', () => {
      expect(formatMetricValue('LCP', 2500)).toBe('2500ms');
      expect(formatMetricValue('FID', 100)).toBe('100ms');
    });

    it('formats scores', () => {
      expect(formatMetricValue('CLS', 0.123)).toBe('0.123');
      expect(formatMetricValue('CLS', 0.1)).toBe('0.100');
    });
  });

  describe('calculateVitalsTrend', () => {
    it('detects improving trend', () => {
      const history: VitalsHistory = {
        url: '/test',
        device: 'mobile',
        metric: 'LCP',
        history: [
          { date: '2025-10-10', value: 3000, rating: 'needs-improvement' },
          { date: '2025-10-11', value: 2800, rating: 'needs-improvement' },
          { date: '2025-10-12', value: 2400, rating: 'good' },
        ],
      };

      expect(calculateVitalsTrend(history)).toBe('improving');
    });

    it('detects declining trend', () => {
      const history: VitalsHistory = {
        url: '/test',
        device: 'mobile',
        metric: 'LCP',
        history: [
          { date: '2025-10-10', value: 2400, rating: 'good' },
          { date: '2025-10-11', value: 2800, rating: 'needs-improvement' },
          { date: '2025-10-12', value: 3200, rating: 'needs-improvement' },
        ],
      };

      expect(calculateVitalsTrend(history)).toBe('declining');
    });

    it('detects stable trend', () => {
      const history: VitalsHistory = {
        url: '/test',
        device: 'mobile',
        metric: 'LCP',
        history: [
          { date: '2025-10-10', value: 2500, rating: 'good' },
          { date: '2025-10-11', value: 2520, rating: 'good' },
          { date: '2025-10-12', value: 2480, rating: 'good' },
        ],
      };

      expect(calculateVitalsTrend(history)).toBe('stable');
    });
  });

  describe('getPoorVitalsPages', () => {
    const pages: PageVitals[] = [
      {
        url: '/page1',
        device: 'mobile',
        scores: [
          { metric: 'LCP', value: 5000, rating: 'poor', percentile: 75, unit: 'ms' },
        ],
        overallRating: 'poor',
        lastUpdated: '2025-10-15T10:00:00Z',
      },
      {
        url: '/page2',
        device: 'mobile',
        scores: [
          { metric: 'LCP', value: 2000, rating: 'good', percentile: 75, unit: 'ms' },
        ],
        overallRating: 'good',
        lastUpdated: '2025-10-15T10:00:00Z',
      },
    ];

    it('filters pages with poor overall rating', () => {
      const poor = getPoorVitalsPages(pages);

      expect(poor).toHaveLength(1);
      expect(poor[0].url).toBe('/page1');
    });

    it('filters pages with poor specific metric', () => {
      const poor = getPoorVitalsPages(pages, 'LCP');

      expect(poor).toHaveLength(1);
      expect(poor[0].url).toBe('/page1');
    });
  });

  describe('calculateAverageMetric', () => {
    const pages: PageVitals[] = [
      {
        url: '/page1',
        device: 'mobile',
        scores: [
          { metric: 'LCP', value: 2000, rating: 'good', percentile: 75, unit: 'ms' },
        ],
        overallRating: 'good',
        lastUpdated: '2025-10-15T10:00:00Z',
      },
      {
        url: '/page2',
        device: 'mobile',
        scores: [
          { metric: 'LCP', value: 3000, rating: 'needs-improvement', percentile: 75, unit: 'ms' },
        ],
        overallRating: 'needs-improvement',
        lastUpdated: '2025-10-15T10:00:00Z',
      },
    ];

    it('calculates average correctly', () => {
      const avg = calculateAverageMetric(pages, 'LCP');

      expect(avg).toBe(2500);
    });

    it('returns 0 for missing metric', () => {
      const avg = calculateAverageMetric(pages, 'FID');

      expect(avg).toBe(0);
    });
  });

  describe('VITALS_THRESHOLDS', () => {
    it('has correct LCP thresholds', () => {
      expect(VITALS_THRESHOLDS.LCP.good).toBe(2500);
      expect(VITALS_THRESHOLDS.LCP.poor).toBe(4000);
    });

    it('has correct FID thresholds', () => {
      expect(VITALS_THRESHOLDS.FID.good).toBe(100);
      expect(VITALS_THRESHOLDS.FID.poor).toBe(300);
    });

    it('has correct CLS thresholds', () => {
      expect(VITALS_THRESHOLDS.CLS.good).toBe(0.1);
      expect(VITALS_THRESHOLDS.CLS.poor).toBe(0.25);
    });
  });
});

