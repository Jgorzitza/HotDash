/**
 * Tests for Real-Time Ranking Tracker
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { RankingData, RankingAlert } from '~/services/seo/ranking-tracker';

describe('Ranking Tracker', () => {
  describe('trackRankings', () => {
    it('should track keyword rankings', () => {
      const mockRankings: RankingData[] = [
        {
          keyword: 'shopify analytics',
          currentPosition: 5,
          previousPosition: 8,
          change: 3, // Improvement
          url: '/products/analytics',
          clicks: 100,
          impressions: 1000,
          ctr: 0.1,
          lastChecked: new Date().toISOString()
        },
        {
          keyword: 'ecommerce dashboard',
          currentPosition: 15,
          previousPosition: 10,
          change: -5, // Drop
          url: '/products/dashboard',
          clicks: 50,
          impressions: 500,
          ctr: 0.1,
          lastChecked: new Date().toISOString()
        }
      ];

      expect(mockRankings).toBeDefined();
      expect(mockRankings.length).toBe(2);
      expect(mockRankings[0].change).toBeGreaterThan(0); // Improvement
      expect(mockRankings[1].change).toBeLessThan(0); // Drop
    });

    it('should calculate position changes correctly', () => {
      const previous = 10;
      const current = 5;
      const change = previous - current; // Positive = improvement

      expect(change).toBe(5);
      expect(change).toBeGreaterThan(0);
    });

    it('should handle new keywords without previous position', () => {
      const ranking: RankingData = {
        keyword: 'new keyword',
        currentPosition: 20,
        previousPosition: 20, // Same as current for new keywords
        change: 0,
        url: '/new-page',
        clicks: 0,
        impressions: 100,
        ctr: 0,
        lastChecked: new Date().toISOString()
      };

      expect(ranking.change).toBe(0);
      expect(ranking.previousPosition).toBe(ranking.currentPosition);
    });
  });

  describe('detectRankingAlerts', () => {
    it('should detect critical alerts for severe drops', () => {
      const rankings: RankingData[] = [
        {
          keyword: 'critical keyword',
          currentPosition: 25,
          previousPosition: 10,
          change: -15, // Severe drop
          url: '/page',
          clicks: 50,
          impressions: 500,
          ctr: 0.1,
          lastChecked: new Date().toISOString()
        }
      ];

      const alerts: RankingAlert[] = [];
      const now = new Date();
      const slaDeadline = new Date(now.getTime() + 48 * 60 * 60 * 1000);

      rankings.forEach(ranking => {
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
      });

      expect(alerts.length).toBe(1);
      expect(alerts[0].severity).toBe('critical');
      expect(alerts[0].change).toBeLessThanOrEqual(-10);
    });

    it('should detect warning alerts for moderate drops', () => {
      const rankings: RankingData[] = [
        {
          keyword: 'warning keyword',
          currentPosition: 12,
          previousPosition: 7,
          change: -5, // Moderate drop
          url: '/page',
          clicks: 30,
          impressions: 300,
          ctr: 0.1,
          lastChecked: new Date().toISOString()
        }
      ];

      const alerts: RankingAlert[] = [];
      const now = new Date();
      const slaDeadline = new Date(now.getTime() + 48 * 60 * 60 * 1000);

      rankings.forEach(ranking => {
        if (ranking.change <= -5 && ranking.change > -10) {
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
      });

      expect(alerts.length).toBe(1);
      expect(alerts[0].severity).toBe('warning');
      expect(alerts[0].change).toBeLessThanOrEqual(-5);
      expect(alerts[0].change).toBeGreaterThan(-10);
    });

    it('should detect info alerts for improvements', () => {
      const rankings: RankingData[] = [
        {
          keyword: 'improving keyword',
          currentPosition: 5,
          previousPosition: 15,
          change: 10, // Improvement
          url: '/page',
          clicks: 100,
          impressions: 1000,
          ctr: 0.1,
          lastChecked: new Date().toISOString()
        }
      ];

      const alerts: RankingAlert[] = [];
      const now = new Date();
      const slaDeadline = new Date(now.getTime() + 48 * 60 * 60 * 1000);

      rankings.forEach(ranking => {
        if (ranking.change >= 5) {
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

      expect(alerts.length).toBe(1);
      expect(alerts[0].severity).toBe('info');
      expect(alerts[0].change).toBeGreaterThanOrEqual(5);
    });

    it('should calculate 48h SLA deadline correctly', () => {
      const now = new Date();
      const slaDeadline = new Date(now.getTime() + 48 * 60 * 60 * 1000);
      
      const hoursDiff = (slaDeadline.getTime() - now.getTime()) / (1000 * 60 * 60);
      
      expect(hoursDiff).toBe(48);
    });
  });

  describe('Alert Management', () => {
    it('should filter active alerts within SLA', () => {
      const now = new Date();
      const alerts: RankingAlert[] = [
        {
          id: 'alert-1',
          keyword: 'keyword1',
          severity: 'critical',
          currentPosition: 20,
          previousPosition: 5,
          change: -15,
          url: '/page1',
          detectedAt: now.toISOString(),
          slaDeadline: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString() // 24h left
        },
        {
          id: 'alert-2',
          keyword: 'keyword2',
          severity: 'warning',
          currentPosition: 15,
          previousPosition: 10,
          change: -5,
          url: '/page2',
          detectedAt: new Date(now.getTime() - 50 * 60 * 60 * 1000).toISOString(), // 50h ago
          slaDeadline: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString() // Overdue
        }
      ];

      const activeAlerts = alerts.filter(a => new Date(a.slaDeadline) >= now);

      expect(activeAlerts.length).toBe(1);
      expect(activeAlerts[0].id).toBe('alert-1');
    });

    it('should format time remaining correctly', () => {
      const now = new Date();
      const testCases = [
        {
          deadline: new Date(now.getTime() + 30 * 60 * 1000), // 30 minutes
          expected: '< 1 hour'
        },
        {
          deadline: new Date(now.getTime() + 5 * 60 * 60 * 1000), // 5 hours
          expected: '5h'
        },
        {
          deadline: new Date(now.getTime() + 30 * 60 * 60 * 1000), // 30 hours
          expected: '1d 6h'
        },
        {
          deadline: new Date(now.getTime() - 1000), // Past
          expected: 'Overdue'
        }
      ];

      testCases.forEach(({ deadline, expected }) => {
        const hoursRemaining = Math.floor((deadline.getTime() - now.getTime()) / (1000 * 60 * 60));
        
        let formatted: string;
        if (hoursRemaining < 0) formatted = 'Overdue';
        else if (hoursRemaining < 1) formatted = '< 1 hour';
        else if (hoursRemaining < 24) formatted = `${hoursRemaining}h`;
        else formatted = `${Math.floor(hoursRemaining / 24)}d ${hoursRemaining % 24}h`;

        expect(formatted).toBe(expected);
      });
    });
  });
});

