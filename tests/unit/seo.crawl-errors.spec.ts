import { describe, expect, it } from 'vitest';
import {
  calculateErrorSeverity,
  getSuggestedFix,
  parseSearchConsoleErrors,
  filterErrorsBySeverity,
  sortErrorsByPriority,
  generateErrorSummary,
  detectErrorTrend,
  getNewErrors,
  getFixedErrors,
  ERROR_THRESHOLDS,
  type CrawlError,
  type SearchConsoleErrorResponse,
} from '../../app/lib/seo/crawl-errors';

describe('Crawl Error Detection', () => {
  describe('calculateErrorSeverity', () => {
    it('marks server errors as critical', () => {
      expect(calculateErrorSeverity('500', 1)).toBe('critical');
      expect(calculateErrorSeverity('503', 1)).toBe('critical');
      expect(calculateErrorSeverity('dns_error', 1)).toBe('critical');
    });

    it('marks high count errors as critical', () => {
      expect(calculateErrorSeverity('404', 15)).toBe('critical');
    });

    it('marks medium count errors as warning', () => {
      expect(calculateErrorSeverity('404', 5)).toBe('warning');
    });

    it('marks low count errors as info', () => {
      expect(calculateErrorSeverity('404', 2)).toBe('info');
    });
  });

  describe('getSuggestedFix', () => {
    it('provides fix for 404 errors', () => {
      const fix = getSuggestedFix('404');
      expect(fix).toContain('redirect');
    });

    it('provides fix for server errors', () => {
      const fix = getSuggestedFix('500');
      expect(fix).toContain('server');
    });

    it('provides fix for robots blocks', () => {
      const fix = getSuggestedFix('robots_blocked');
      expect(fix).toContain('robots.txt');
    });
  });

  describe('parseSearchConsoleErrors', () => {
    it('parses errors correctly', () => {
      const response: SearchConsoleErrorResponse = {
        errors: [
          {
            url: '/page1',
            type: '404',
            count: 15,
            firstSeen: '2025-10-10',
            lastSeen: '2025-10-15',
            referringUrls: ['/home', '/products'],
          },
          {
            url: '/page2',
            type: '500',
            count: 5,
            firstSeen: '2025-10-14',
            lastSeen: '2025-10-15',
          },
        ],
      };

      const errors = parseSearchConsoleErrors(response);

      expect(errors).toHaveLength(2);
      expect(errors[0].url).toBe('/page1');
      expect(errors[0].errorType).toBe('404');
      expect(errors[0].severity).toBe('critical');
      expect(errors[0].affectedPages).toEqual(['/home', '/products']);
      expect(errors[1].severity).toBe('critical'); // Server error
    });
  });

  describe('filterErrorsBySeverity', () => {
    const errors: CrawlError[] = [
      {
        url: '/page1',
        errorType: '500',
        errorCount: 5,
        firstDetected: '2025-10-10',
        lastDetected: '2025-10-15',
        severity: 'critical',
        suggestedFix: 'Fix server error',
      },
      {
        url: '/page2',
        errorType: '404',
        errorCount: 5,
        firstDetected: '2025-10-10',
        lastDetected: '2025-10-15',
        severity: 'warning',
        suggestedFix: 'Create redirect',
      },
    ];

    it('filters critical errors', () => {
      const critical = filterErrorsBySeverity(errors, 'critical');
      expect(critical).toHaveLength(1);
      expect(critical[0].errorType).toBe('500');
    });

    it('filters warning errors', () => {
      const warnings = filterErrorsBySeverity(errors, 'warning');
      expect(warnings).toHaveLength(1);
      expect(warnings[0].errorType).toBe('404');
    });
  });

  describe('sortErrorsByPriority', () => {
    it('sorts by severity first', () => {
      const errors: CrawlError[] = [
        {
          url: '/page1',
          errorType: '404',
          errorCount: 5,
          firstDetected: '2025-10-10',
          lastDetected: '2025-10-15',
          severity: 'warning',
          suggestedFix: 'Fix',
        },
        {
          url: '/page2',
          errorType: '500',
          errorCount: 1,
          firstDetected: '2025-10-10',
          lastDetected: '2025-10-15',
          severity: 'critical',
          suggestedFix: 'Fix',
        },
      ];

      const sorted = sortErrorsByPriority(errors);

      expect(sorted[0].severity).toBe('critical');
      expect(sorted[1].severity).toBe('warning');
    });

    it('sorts by error type priority within same severity', () => {
      const errors: CrawlError[] = [
        {
          url: '/page1',
          errorType: '404',
          errorCount: 15,
          firstDetected: '2025-10-10',
          lastDetected: '2025-10-15',
          severity: 'critical',
          suggestedFix: 'Fix',
        },
        {
          url: '/page2',
          errorType: '500',
          errorCount: 15,
          firstDetected: '2025-10-10',
          lastDetected: '2025-10-15',
          severity: 'critical',
          suggestedFix: 'Fix',
        },
      ];

      const sorted = sortErrorsByPriority(errors);

      expect(sorted[0].errorType).toBe('500'); // Higher priority
      expect(sorted[1].errorType).toBe('404');
    });
  });

  describe('generateErrorSummary', () => {
    const errors: CrawlError[] = [
      {
        url: '/page1',
        errorType: '500',
        errorCount: 5,
        firstDetected: '2025-10-10',
        lastDetected: '2025-10-15',
        severity: 'critical',
        suggestedFix: 'Fix',
      },
      {
        url: '/page2',
        errorType: '404',
        errorCount: 5,
        firstDetected: '2025-10-10',
        lastDetected: '2025-10-15',
        severity: 'warning',
        suggestedFix: 'Fix',
      },
      {
        url: '/page3',
        errorType: '404',
        errorCount: 2,
        firstDetected: '2025-10-10',
        lastDetected: '2025-10-15',
        severity: 'info',
        suggestedFix: 'Fix',
      },
    ];

    it('generates correct summary', () => {
      const summary = generateErrorSummary(errors);

      expect(summary.totalErrors).toBe(3);
      expect(summary.criticalErrors).toBe(1);
      expect(summary.warningErrors).toBe(1);
      expect(summary.infoErrors).toBe(1);
      expect(summary.errorsByType['404']).toBe(2);
      expect(summary.errorsByType['500']).toBe(1);
    });
  });

  describe('detectErrorTrend', () => {
    it('detects increasing trend', () => {
      const current: CrawlError[] = Array(15).fill({
        url: '/page',
        errorType: '404',
        errorCount: 1,
        firstDetected: '2025-10-15',
        lastDetected: '2025-10-15',
        severity: 'info',
        suggestedFix: 'Fix',
      });

      const previous: CrawlError[] = Array(10).fill({
        url: '/page',
        errorType: '404',
        errorCount: 1,
        firstDetected: '2025-10-14',
        lastDetected: '2025-10-14',
        severity: 'info',
        suggestedFix: 'Fix',
      });

      expect(detectErrorTrend(current, previous)).toBe('increasing');
    });

    it('detects decreasing trend', () => {
      const current: CrawlError[] = Array(5).fill({
        url: '/page',
        errorType: '404',
        errorCount: 1,
        firstDetected: '2025-10-15',
        lastDetected: '2025-10-15',
        severity: 'info',
        suggestedFix: 'Fix',
      });

      const previous: CrawlError[] = Array(10).fill({
        url: '/page',
        errorType: '404',
        errorCount: 1,
        firstDetected: '2025-10-14',
        lastDetected: '2025-10-14',
        severity: 'info',
        suggestedFix: 'Fix',
      });

      expect(detectErrorTrend(current, previous)).toBe('decreasing');
    });
  });

  describe('getNewErrors', () => {
    it('identifies new errors', () => {
      const current: CrawlError[] = [
        {
          url: '/page1',
          errorType: '404',
          errorCount: 1,
          firstDetected: '2025-10-15',
          lastDetected: '2025-10-15',
          severity: 'info',
          suggestedFix: 'Fix',
        },
        {
          url: '/page2',
          errorType: '404',
          errorCount: 1,
          firstDetected: '2025-10-15',
          lastDetected: '2025-10-15',
          severity: 'info',
          suggestedFix: 'Fix',
        },
      ];

      const previous: CrawlError[] = [
        {
          url: '/page1',
          errorType: '404',
          errorCount: 1,
          firstDetected: '2025-10-14',
          lastDetected: '2025-10-14',
          severity: 'info',
          suggestedFix: 'Fix',
        },
      ];

      const newErrors = getNewErrors(current, previous);

      expect(newErrors).toHaveLength(1);
      expect(newErrors[0].url).toBe('/page2');
    });
  });

  describe('getFixedErrors', () => {
    it('identifies fixed errors', () => {
      const current: CrawlError[] = [
        {
          url: '/page1',
          errorType: '404',
          errorCount: 1,
          firstDetected: '2025-10-15',
          lastDetected: '2025-10-15',
          severity: 'info',
          suggestedFix: 'Fix',
        },
      ];

      const previous: CrawlError[] = [
        {
          url: '/page1',
          errorType: '404',
          errorCount: 1,
          firstDetected: '2025-10-14',
          lastDetected: '2025-10-14',
          severity: 'info',
          suggestedFix: 'Fix',
        },
        {
          url: '/page2',
          errorType: '404',
          errorCount: 1,
          firstDetected: '2025-10-14',
          lastDetected: '2025-10-14',
          severity: 'info',
          suggestedFix: 'Fix',
        },
      ];

      const fixed = getFixedErrors(current, previous);

      expect(fixed).toHaveLength(1);
      expect(fixed[0].url).toBe('/page2');
    });
  });

  describe('ERROR_THRESHOLDS', () => {
    it('has correct threshold values', () => {
      expect(ERROR_THRESHOLDS.critical).toBe(10);
      expect(ERROR_THRESHOLDS.warning).toBe(3);
    });
  });
});

