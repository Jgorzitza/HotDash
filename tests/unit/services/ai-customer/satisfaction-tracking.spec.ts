/**
 * Unit Tests: AI Customer Service Satisfaction Tracking
 * 
 * Tests customer satisfaction metrics, feedback collection,
 * and alert system.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SatisfactionTrackingService } from '~/services/ai-customer/satisfaction-tracking.service';

// Mock Supabase
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        gte: vi.fn(() => ({
          lte: vi.fn(() => ({
            order: vi.fn().mockResolvedValue({
              data: [
                {
                  id: 'feedback_1',
                  inquiryId: 'inquiry_1',
                  rating: 5,
                  comment: 'Excellent service',
                  createdAt: new Date().toISOString()
                },
                {
                  id: 'feedback_2',
                  inquiryId: 'inquiry_2',
                  rating: 4,
                  comment: 'Good response',
                  createdAt: new Date().toISOString()
                }
              ],
              error: null
            })
          }))
        })),
        eq: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({
            data: {
              id: 'feedback_123',
              inquiryId: 'inquiry_123',
              rating: 5,
              comment: 'Great service',
              createdAt: new Date().toISOString()
            },
            error: null
          })
        }))
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({
            data: {
              id: 'feedback_123',
              inquiryId: 'inquiry_123',
              rating: 5,
              comment: 'Test feedback',
              createdAt: new Date().toISOString()
            },
            error: null
          })
        }))
      }))
    }))
  }))
}));

// Mock logDecision
vi.mock('~/services/decisions.server', () => ({
  logDecision: vi.fn().mockResolvedValue(undefined)
}));

describe('AI Customer Service Satisfaction Tracking', () => {
  let satisfactionService: SatisfactionTrackingService;

  beforeEach(() => {
    satisfactionService = new SatisfactionTrackingService();
  });

  describe('Feedback Collection', () => {
    it('should record customer feedback', async () => {
      const feedback = {
        inquiryId: 'inquiry_123',
        rating: 5,
        comment: 'Excellent service',
        responseQuality: 5,
        responseTime: 4,
        resolutionEffectiveness: 5
      };

      const result = await satisfactionService.recordFeedback(feedback);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.rating).toBe(5);
    });

    it('should validate rating range', async () => {
      const feedback = {
        inquiryId: 'inquiry_123',
        rating: 6, // Invalid rating
        comment: 'Test'
      };

      await expect(satisfactionService.recordFeedback(feedback)).rejects.toThrow();
    });

    it('should handle optional comment', async () => {
      const feedback = {
        inquiryId: 'inquiry_123',
        rating: 4
      };

      const result = await satisfactionService.recordFeedback(feedback);

      expect(result).toBeDefined();
      expect(result.rating).toBe(4);
    });

    it('should track detailed metrics', async () => {
      const feedback = {
        inquiryId: 'inquiry_123',
        rating: 5,
        responseQuality: 5,
        responseTime: 4,
        resolutionEffectiveness: 5
      };

      const result = await satisfactionService.recordFeedback(feedback);

      expect(result.responseQuality).toBe(5);
      expect(result.responseTime).toBe(4);
      expect(result.resolutionEffectiveness).toBe(5);
    });
  });

  describe('Satisfaction Metrics', () => {
    it('should calculate overall satisfaction', async () => {
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const endDate = new Date().toISOString();

      const metrics = await satisfactionService.getSatisfactionMetrics(startDate, endDate);

      expect(metrics).toBeDefined();
      expect(metrics.overallSatisfaction).toBeGreaterThanOrEqual(0);
      expect(metrics.overallSatisfaction).toBeLessThanOrEqual(5);
    });

    it('should calculate average rating', async () => {
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const endDate = new Date().toISOString();

      const metrics = await satisfactionService.getSatisfactionMetrics(startDate, endDate);

      expect(metrics.averageRating).toBeGreaterThanOrEqual(0);
      expect(metrics.averageRating).toBeLessThanOrEqual(5);
    });

    it('should track response quality', async () => {
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const endDate = new Date().toISOString();

      const metrics = await satisfactionService.getSatisfactionMetrics(startDate, endDate);

      expect(metrics.responseQuality).toBeGreaterThanOrEqual(0);
      expect(metrics.responseQuality).toBeLessThanOrEqual(5);
    });

    it('should track response time satisfaction', async () => {
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const endDate = new Date().toISOString();

      const metrics = await satisfactionService.getSatisfactionMetrics(startDate, endDate);

      expect(metrics.responseTime).toBeGreaterThanOrEqual(0);
      expect(metrics.responseTime).toBeLessThanOrEqual(5);
    });

    it('should track resolution effectiveness', async () => {
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const endDate = new Date().toISOString();

      const metrics = await satisfactionService.getSatisfactionMetrics(startDate, endDate);

      expect(metrics.resolutionEffectiveness).toBeGreaterThanOrEqual(0);
      expect(metrics.resolutionEffectiveness).toBeLessThanOrEqual(5);
    });

    it('should categorize customer satisfaction', async () => {
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const endDate = new Date().toISOString();

      const metrics = await satisfactionService.getSatisfactionMetrics(startDate, endDate);

      expect(metrics.satisfiedCustomers).toBeGreaterThanOrEqual(0);
      expect(metrics.neutralCustomers).toBeGreaterThanOrEqual(0);
      expect(metrics.unsatisfiedCustomers).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Trend Analysis', () => {
    it('should detect improving trends', async () => {
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const endDate = new Date().toISOString();

      const metrics = await satisfactionService.getSatisfactionMetrics(startDate, endDate);

      expect(metrics.trendDirection).toMatch(/improving|stable|declining/);
    });

    it('should compare with previous period', async () => {
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const endDate = new Date().toISOString();

      const metrics = await satisfactionService.getSatisfactionMetrics(startDate, endDate);

      expect(metrics.periodComparison).toBeDefined();
      expect(metrics.periodComparison.current).toBeDefined();
      expect(metrics.periodComparison.previous).toBeDefined();
      expect(metrics.periodComparison.change).toBeDefined();
    });

    it('should calculate trend percentage', async () => {
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const endDate = new Date().toISOString();

      const metrics = await satisfactionService.getSatisfactionMetrics(startDate, endDate);

      const changePercent = (metrics.periodComparison.change / metrics.periodComparison.previous) * 100;

      expect(typeof changePercent).toBe('number');
    });
  });

  describe('Alert System', () => {
    it('should create alert for low satisfaction', async () => {
      const alert = {
        type: 'low_satisfaction' as const,
        severity: 'high' as const,
        message: 'Satisfaction dropped below threshold',
        metrics: { averageRating: 2.5 }
      };

      const result = await satisfactionService.createAlert(alert);

      expect(result).toBeDefined();
      expect(result.type).toBe('low_satisfaction');
      expect(result.severity).toBe('high');
    });

    it('should create alert for negative trend', async () => {
      const alert = {
        type: 'negative_trend' as const,
        severity: 'medium' as const,
        message: 'Satisfaction trending downward',
        metrics: { trendDirection: 'declining' }
      };

      const result = await satisfactionService.createAlert(alert);

      expect(result.type).toBe('negative_trend');
    });

    it('should create alert for critical feedback', async () => {
      const alert = {
        type: 'critical_feedback' as const,
        severity: 'critical' as const,
        message: 'Customer reported critical issue',
        metrics: { rating: 1 }
      };

      const result = await satisfactionService.createAlert(alert);

      expect(result.severity).toBe('critical');
    });

    it('should retrieve active alerts', async () => {
      const alerts = await satisfactionService.getActiveAlerts();

      expect(Array.isArray(alerts)).toBe(true);
    });

    it('should acknowledge alerts', async () => {
      const alertId = 'alert_123';
      const acknowledgedBy = 'user_123';

      const result = await satisfactionService.acknowledgeAlert(alertId, acknowledgedBy);

      expect(result.acknowledged).toBe(true);
      expect(result.acknowledgedBy).toBe('user_123');
      expect(result.acknowledgedAt).toBeDefined();
    });
  });

  describe('Feedback Analysis', () => {
    it('should analyze feedback sentiment', async () => {
      const feedback = {
        inquiryId: 'inquiry_123',
        rating: 5,
        comment: 'Excellent service, very helpful!'
      };

      const analysis = await satisfactionService.analyzeFeedback(feedback);

      expect(analysis.sentiment).toMatch(/positive|neutral|negative/);
    });

    it('should extract key themes', async () => {
      const feedback = {
        inquiryId: 'inquiry_123',
        rating: 4,
        comment: 'Fast response but could be more detailed'
      };

      const analysis = await satisfactionService.analyzeFeedback(feedback);

      expect(analysis.themes).toBeDefined();
      expect(Array.isArray(analysis.themes)).toBe(true);
    });

    it('should identify improvement areas', async () => {
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const endDate = new Date().toISOString();

      const improvements = await satisfactionService.getImprovementAreas(startDate, endDate);

      expect(Array.isArray(improvements)).toBe(true);
    });
  });

  describe('Reporting', () => {
    it('should generate satisfaction report', async () => {
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const endDate = new Date().toISOString();

      const report = await satisfactionService.generateReport(startDate, endDate);

      expect(report).toBeDefined();
      expect(report.metrics).toBeDefined();
      expect(report.trends).toBeDefined();
      expect(report.alerts).toBeDefined();
    });

    it('should include time series data', async () => {
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const endDate = new Date().toISOString();

      const report = await satisfactionService.generateReport(startDate, endDate);

      expect(report.timeSeries).toBeDefined();
      expect(Array.isArray(report.timeSeries)).toBe(true);
    });

    it('should include top feedback', async () => {
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const endDate = new Date().toISOString();

      const report = await satisfactionService.generateReport(startDate, endDate);

      expect(report.topPositiveFeedback).toBeDefined();
      expect(report.topNegativeFeedback).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid date range', async () => {
      const startDate = new Date().toISOString();
      const endDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

      await expect(
        satisfactionService.getSatisfactionMetrics(startDate, endDate)
      ).rejects.toThrow();
    });

    it('should handle missing feedback data', async () => {
      const feedback = {
        inquiryId: '',
        rating: 5
      };

      await expect(satisfactionService.recordFeedback(feedback)).rejects.toThrow();
    });

    it('should handle database errors', async () => {
      const feedback = {
        inquiryId: 'inquiry_123',
        rating: 5
      };

      // Mock database error
      vi.mocked(satisfactionService).saveFeedback = vi.fn().mockRejectedValue(
        new Error('Database error')
      );

      await expect(satisfactionService.recordFeedback(feedback)).rejects.toThrow();
    });
  });
});

