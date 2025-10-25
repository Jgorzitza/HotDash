/**
 * Attribution Analytics Tests
 *
 * ANALYTICS-COMPLETION-831: Comprehensive tests for attribution analytics system
 * Tests GA4 integration, attribution calculations, and confidence scoring
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  queryActionAttribution,
  calculateAttributionWindows,
  generateAttributionPanelData,
  type AttributionMetrics,
  type ActionAttribution,
  type AttributionPanelData
} from '~/services/ga/attribution';

// Mock data for testing
const mockAttributionData: Record<string, AttributionMetrics> = {
  'action-001': {
    impressions: 6200,
    clicks: 310,
    conversions: 18,
    revenue: 3600,
    roas: 4.2,
    ctr: 5.0,
    conversionRate: 5.8,
    costPerConversion: 200,
    sessions: 310,
    users: 250
  },
  'action-002': {
    impressions: 12000,
    clicks: 600,
    conversions: 30,
    revenue: 6300,
    roas: 2.1,
    ctr: 5.0,
    conversionRate: 5.0,
    costPerConversion: 210,
    sessions: 600,
    users: 480
  }
};

const mockActions = [
  {
    actionId: 'action-001',
    actionType: 'seo',
    targetSlug: 'homepage-optimization',
    title: 'Homepage SEO Optimization',
    approvedAt: '2025-01-15T10:00:00Z',
    executedAt: '2025-01-15T11:00:00Z',
    expectedImpact: {
      impressions: 5000,
      conversions: 15,
      revenue: 3000,
      roas: 2.5
    }
  },
  {
    actionId: 'action-002',
    actionType: 'ads',
    targetSlug: 'google-ads-campaign',
    title: 'Google Ads Campaign Launch',
    approvedAt: '2025-04-01T09:00:00Z',
    executedAt: '2025-04-01T10:00:00Z',
    expectedImpact: {
      impressions: 15000,
      conversions: 45,
      revenue: 8000,
      roas: 2.8
    }
  }
];

describe('Attribution Analytics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('queryActionAttribution', () => {
    it('should return attribution data for valid action IDs', async () => {
      const actionIds = ['action-001', 'action-002'];
      const attributionData = await queryActionAttribution(actionIds, '2025-01-01', '2025-10-22');

      expect(attributionData).toBeDefined();
      expect(typeof attributionData).toBe('object');
    });

    it('should handle empty action IDs array', async () => {
      const attributionData = await queryActionAttribution([], '2025-01-01', '2025-10-22');

      expect(attributionData).toBeDefined();
      expect(typeof attributionData).toBe('object');
    });

    it('should handle invalid date ranges gracefully', async () => {
      const actionIds = ['action-001'];
      const attributionData = await queryActionAttribution(actionIds, 'invalid-date', 'invalid-date');

      expect(attributionData).toBeDefined();
      expect(typeof attributionData).toBe('object');
    });
  });

  describe('calculateAttributionWindows', () => {
    it('should calculate attribution windows for multiple actions', async () => {
      const actionIds = ['action-001', 'action-002'];
      const endDate = '2025-10-22';
      
      const windows = await calculateAttributionWindows(actionIds, endDate);

      expect(windows).toBeDefined();
      expect(typeof windows).toBe('object');
      
      actionIds.forEach(actionId => {
        expect(windows[actionId]).toBeDefined();
        expect(windows[actionId]).toHaveProperty('7d');
        expect(windows[actionId]).toHaveProperty('14d');
        expect(windows[actionId]).toHaveProperty('28d');
      });
    });

    it('should handle single action ID', async () => {
      const actionIds = ['action-001'];
      const endDate = '2025-10-22';
      
      const windows = await calculateAttributionWindows(actionIds, endDate);

      expect(windows).toBeDefined();
      expect(windows['action-001']).toBeDefined();
      expect(windows['action-001']).toHaveProperty('7d');
      expect(windows['action-001']).toHaveProperty('14d');
      expect(windows['action-001']).toHaveProperty('28d');
    });

    it('should handle empty action IDs array', async () => {
      const actionIds: string[] = [];
      const endDate = '2025-10-22';
      
      const windows = await calculateAttributionWindows(actionIds, endDate);

      expect(windows).toBeDefined();
      expect(typeof windows).toBe('object');
    });
  });

  describe('generateAttributionPanelData', () => {
    it('should generate attribution panel data with correct structure', async () => {
      const panelData = await generateAttributionPanelData(
        mockActions,
        '2025-01-01',
        '2025-10-22'
      );

      expect(panelData).toHaveProperty('period');
      expect(panelData).toHaveProperty('actions');
      expect(panelData).toHaveProperty('summary');
      expect(panelData).toHaveProperty('rankings');

      expect(panelData.period).toHaveProperty('start');
      expect(panelData.period).toHaveProperty('end');
      expect(Array.isArray(panelData.actions)).toBe(true);
      expect(panelData.summary).toHaveProperty('totalActions');
      expect(panelData.summary).toHaveProperty('totalRevenue');
      expect(panelData.summary).toHaveProperty('totalConversions');
      expect(panelData.summary).toHaveProperty('averageROI');
      expect(panelData.summary).toHaveProperty('topPerformer');
      expect(panelData.summary).toHaveProperty('overallConfidence');
    });

    it('should calculate summary metrics correctly', async () => {
      const panelData = await generateAttributionPanelData(
        mockActions,
        '2025-01-01',
        '2025-10-22'
      );

      expect(panelData.summary.totalActions).toBeGreaterThanOrEqual(0);
      expect(panelData.summary.totalRevenue).toBeGreaterThanOrEqual(0);
      expect(panelData.summary.totalConversions).toBeGreaterThanOrEqual(0);
      expect(panelData.summary.averageROI).toBeGreaterThanOrEqual(0);
      expect(panelData.summary.overallConfidence).toBeGreaterThanOrEqual(0);
      expect(panelData.summary.overallConfidence).toBeLessThanOrEqual(100);
    });

    it('should include action data with correct structure', async () => {
      const panelData = await generateAttributionPanelData(
        mockActions,
        '2025-01-01',
        '2025-10-22'
      );

      expect(Array.isArray(panelData.actions)).toBe(true);
      expect(panelData.actions.length).toBeGreaterThan(0);

      panelData.actions.forEach(action => {
        expect(action).toHaveProperty('actionId');
        expect(action).toHaveProperty('actionType');
        expect(action).toHaveProperty('targetSlug');
        expect(action).toHaveProperty('title');
        expect(action).toHaveProperty('approvedAt');
        expect(action).toHaveProperty('executedAt');
        expect(action).toHaveProperty('expectedImpact');
        expect(action).toHaveProperty('actualImpact');
        expect(action).toHaveProperty('confidenceScore');
        expect(action).toHaveProperty('realizedROI');
        expect(action).toHaveProperty('performanceDelta');

        expect(action.actualImpact).toHaveProperty('7d');
        expect(action.actualImpact).toHaveProperty('14d');
        expect(action.actualImpact).toHaveProperty('28d');
        expect(action.confidenceScore).toBeGreaterThanOrEqual(0);
        expect(action.confidenceScore).toBeLessThanOrEqual(100);
      });
    });

    it('should generate rankings with correct structure', async () => {
      const panelData = await generateAttributionPanelData(
        mockActions,
        '2025-01-01',
        '2025-10-22'
      );

      expect(panelData.rankings).toHaveProperty('byROI');
      expect(panelData.rankings).toHaveProperty('byRevenue');
      expect(panelData.rankings).toHaveProperty('byConversions');

      expect(Array.isArray(panelData.rankings.byROI)).toBe(true);
      expect(Array.isArray(panelData.rankings.byRevenue)).toBe(true);
      expect(Array.isArray(panelData.rankings.byConversions)).toBe(true);
    });

    it('should handle empty actions array', async () => {
      const panelData = await generateAttributionPanelData(
        [],
        '2025-01-01',
        '2025-10-22'
      );

      expect(panelData).toBeDefined();
      expect(panelData.actions).toEqual([]);
      expect(panelData.summary.totalActions).toBe(0);
      expect(panelData.summary.totalRevenue).toBe(0);
      expect(panelData.summary.totalConversions).toBe(0);
    });
  });

  describe('Data Validation', () => {
    it('should validate attribution metrics structure', async () => {
      const panelData = await generateAttributionPanelData(
        mockActions,
        '2025-01-01',
        '2025-10-22'
      );

      panelData.actions.forEach(action => {
        // Validate 7d metrics
        expect(action.actualImpact['7d']).toHaveProperty('impressions');
        expect(action.actualImpact['7d']).toHaveProperty('clicks');
        expect(action.actualImpact['7d']).toHaveProperty('conversions');
        expect(action.actualImpact['7d']).toHaveProperty('revenue');
        expect(action.actualImpact['7d']).toHaveProperty('roas');
        expect(action.actualImpact['7d']).toHaveProperty('ctr');
        expect(action.actualImpact['7d']).toHaveProperty('conversionRate');
        expect(action.actualImpact['7d']).toHaveProperty('costPerConversion');
        expect(action.actualImpact['7d']).toHaveProperty('sessions');
        expect(action.actualImpact['7d']).toHaveProperty('users');

        // Validate numeric values
        expect(typeof action.actualImpact['7d'].impressions).toBe('number');
        expect(typeof action.actualImpact['7d'].clicks).toBe('number');
        expect(typeof action.actualImpact['7d'].conversions).toBe('number');
        expect(typeof action.actualImpact['7d'].revenue).toBe('number');
        expect(typeof action.actualImpact['7d'].roas).toBe('number');
        expect(typeof action.actualImpact['7d'].ctr).toBe('number');
        expect(typeof action.actualImpact['7d'].conversionRate).toBe('number');
        expect(typeof action.actualImpact['7d'].costPerConversion).toBe('number');
        expect(typeof action.actualImpact['7d'].sessions).toBe('number');
        expect(typeof action.actualImpact['7d'].users).toBe('number');

        // Validate non-negative values
        expect(action.actualImpact['7d'].impressions).toBeGreaterThanOrEqual(0);
        expect(action.actualImpact['7d'].clicks).toBeGreaterThanOrEqual(0);
        expect(action.actualImpact['7d'].conversions).toBeGreaterThanOrEqual(0);
        expect(action.actualImpact['7d'].revenue).toBeGreaterThanOrEqual(0);
        expect(action.actualImpact['7d'].roas).toBeGreaterThanOrEqual(0);
        expect(action.actualImpact['7d'].ctr).toBeGreaterThanOrEqual(0);
        expect(action.actualImpact['7d'].conversionRate).toBeGreaterThanOrEqual(0);
        expect(action.actualImpact['7d'].costPerConversion).toBeGreaterThanOrEqual(0);
        expect(action.actualImpact['7d'].sessions).toBeGreaterThanOrEqual(0);
        expect(action.actualImpact['7d'].users).toBeGreaterThanOrEqual(0);
      });
    });

    it('should validate confidence scores', async () => {
      const panelData = await generateAttributionPanelData(
        mockActions,
        '2025-01-01',
        '2025-10-22'
      );

      panelData.actions.forEach(action => {
        expect(action.confidenceScore).toBeGreaterThanOrEqual(0);
        expect(action.confidenceScore).toBeLessThanOrEqual(100);
        expect(Number.isFinite(action.confidenceScore)).toBe(true);
      });
    });

    it('should validate ROI calculations', async () => {
      const panelData = await generateAttributionPanelData(
        mockActions,
        '2025-01-01',
        '2025-10-22'
      );

      panelData.actions.forEach(action => {
        expect(action.realizedROI).toBeGreaterThanOrEqual(0);
        expect(Number.isFinite(action.realizedROI)).toBe(true);
      });
    });
  });

  describe('Performance Calculations', () => {
    it('should calculate performance deltas correctly', async () => {
      const panelData = await generateAttributionPanelData(
        mockActions,
        '2025-01-01',
        '2025-10-22'
      );

      panelData.actions.forEach(action => {
        expect(action.performanceDelta).toHaveProperty('impressions');
        expect(action.performanceDelta).toHaveProperty('conversions');
        expect(action.performanceDelta).toHaveProperty('revenue');
        expect(action.performanceDelta).toHaveProperty('roas');

        expect(typeof action.performanceDelta.impressions).toBe('number');
        expect(typeof action.performanceDelta.conversions).toBe('number');
        expect(typeof action.performanceDelta.revenue).toBe('number');
        expect(typeof action.performanceDelta.roas).toBe('number');
      });
    });

    it('should calculate efficiency metrics correctly', async () => {
      const panelData = await generateAttributionPanelData(
        mockActions,
        '2025-01-01',
        '2025-10-22'
      );

      panelData.actions.forEach(action => {
        const metrics = action.actualImpact['28d'];
        
        // Validate CTR calculation
        if (metrics.impressions > 0) {
          expect(metrics.ctr).toBeCloseTo((metrics.clicks / metrics.impressions) * 100, 1);
        }

        // Validate conversion rate calculation
        if (metrics.clicks > 0) {
          expect(metrics.conversionRate).toBeCloseTo((metrics.conversions / metrics.clicks) * 100, 1);
        }

        // Validate cost per conversion calculation
        if (metrics.conversions > 0) {
          expect(metrics.costPerConversion).toBeCloseTo(metrics.revenue / metrics.conversions, 1);
        }
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid date ranges gracefully', async () => {
      const panelData = await generateAttributionPanelData(
        mockActions,
        'invalid-date',
        'invalid-date'
      );

      expect(panelData).toBeDefined();
      expect(panelData.actions).toBeDefined();
      expect(panelData.summary).toBeDefined();
    });

    it('should handle missing action data gracefully', async () => {
      const incompleteActions = [
        {
          actionId: 'action-001',
          actionType: 'seo',
          targetSlug: 'homepage-optimization',
          title: 'Homepage SEO Optimization',
          approvedAt: '2025-01-15T10:00:00Z',
          executedAt: '2025-01-15T11:00:00Z',
          expectedImpact: {
            impressions: 5000,
            conversions: 15,
            revenue: 3000,
            roas: 2.5
          }
        }
      ];

      const panelData = await generateAttributionPanelData(
        incompleteActions,
        '2025-01-01',
        '2025-10-22'
      );

      expect(panelData).toBeDefined();
      expect(panelData.actions).toBeDefined();
      expect(panelData.summary).toBeDefined();
    });
  });

  describe('Performance', () => {
    it('should generate attribution panel data within reasonable time', async () => {
      const startTime = Date.now();
      await generateAttributionPanelData(
        mockActions,
        '2025-01-01',
        '2025-10-22'
      );
      const endTime = Date.now();

      // Should complete within 3 seconds
      expect(endTime - startTime).toBeLessThan(3000);
    });

    it('should handle large datasets efficiently', async () => {
      const largeActionsArray = Array.from({ length: 50 }, (_, index) => ({
        actionId: `action-${index + 1}`,
        actionType: 'seo',
        targetSlug: `target-${index + 1}`,
        title: `Action ${index + 1}`,
        approvedAt: '2025-01-15T10:00:00Z',
        executedAt: '2025-01-15T11:00:00Z',
        expectedImpact: {
          impressions: 1000 + index * 100,
          conversions: 5 + index,
          revenue: 1000 + index * 100,
          roas: 2.0 + index * 0.1
        }
      }));

      const startTime = Date.now();
      const panelData = await generateAttributionPanelData(
        largeActionsArray,
        '2025-01-01',
        '2025-10-22'
      );
      const endTime = Date.now();

      expect(panelData).toBeDefined();
      expect(endTime - startTime).toBeLessThan(5000);
    });
  });
});
