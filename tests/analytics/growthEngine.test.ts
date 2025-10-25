/**
 * Growth Engine Analytics Tests
 *
 * ANALYTICS-COMPLETION-831: Comprehensive tests for Growth Engine analytics system
 * Tests phase tracking, action performance, and optimization recommendations
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  generateGrowthEngineAnalytics,
  exportGrowthEngineAnalytics,
  type GrowthEngineAnalytics,
  type GrowthPhase,
  type GrowthAction
} from '~/services/analytics/growthEngine';

// Mock data for testing
const mockPhases: GrowthPhase[] = [
  {
    phase: 1,
    name: 'Foundation',
    description: 'Establish core infrastructure and initial user base',
    objectives: [
      'Set up analytics tracking',
      'Implement basic SEO',
      'Create content foundation',
      'Establish social presence'
    ],
    keyMetrics: ['users', 'sessions', 'conversions', 'revenue'],
    successCriteria: [
      { metric: 'users', target: 1000, current: 850, status: 'on-track' },
      { metric: 'revenue', target: 5000, current: 4200, status: 'on-track' }
    ],
    startDate: '2025-01-01',
    endDate: '2025-03-31',
    status: 'completed'
  },
  {
    phase: 2,
    name: 'Growth Acceleration',
    description: 'Scale user acquisition and optimize conversion',
    objectives: [
      'Increase traffic by 300%',
      'Optimize conversion funnel',
      'Launch paid advertising',
      'Expand content strategy'
    ],
    keyMetrics: ['traffic', 'conversion_rate', 'cac', 'ltv'],
    successCriteria: [
      { metric: 'traffic', target: 10000, current: 7500, status: 'at-risk' },
      { metric: 'conversion_rate', target: 5, current: 4.2, status: 'behind' }
    ],
    startDate: '2025-04-01',
    endDate: '2025-06-30',
    status: 'active'
  }
];

const mockActions: GrowthAction[] = [
  {
    actionId: 'action-001',
    phase: 1,
    actionType: 'seo',
    targetSlug: 'homepage-optimization',
    title: 'Homepage SEO Optimization',
    description: 'Optimize homepage for target keywords and user experience',
    priority: 'high',
    status: 'completed',
    approvedAt: '2025-01-15T10:00:00Z',
    executedAt: '2025-01-15T11:00:00Z',
    completedAt: '2025-01-20T15:00:00Z',
    budget: 2000,
    expectedROI: 3.5,
    actualROI: 4.2,
    impact: {
      expected: {
        impressions: 5000,
        clicks: 250,
        conversions: 15,
        revenue: 3000,
        users: 200
      },
      actual: {
        impressions: 6200,
        clicks: 310,
        conversions: 18,
        revenue: 3600,
        users: 250
      }
    },
    attribution: {
      '7d': {
        impressions: 1500,
        clicks: 75,
        conversions: 4,
        revenue: 800,
        roas: 2.1,
        ctr: 5.0,
        conversionRate: 5.3,
        costPerConversion: 200,
        sessions: 75,
        users: 60
      },
      '14d': {
        impressions: 3000,
        clicks: 150,
        conversions: 8,
        revenue: 1600,
        roas: 2.7,
        ctr: 5.0,
        conversionRate: 5.3,
        costPerConversion: 200,
        sessions: 150,
        users: 120
      },
      '28d': {
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
      }
    },
    confidence: 85,
    dependencies: [],
    blockers: []
  },
  {
    actionId: 'action-002',
    phase: 2,
    actionType: 'ads',
    targetSlug: 'google-ads-campaign',
    title: 'Google Ads Campaign Launch',
    description: 'Launch targeted Google Ads campaign for high-intent keywords',
    priority: 'critical',
    status: 'executed',
    approvedAt: '2025-04-01T09:00:00Z',
    executedAt: '2025-04-01T10:00:00Z',
    budget: 5000,
    expectedROI: 2.8,
    actualROI: 2.1,
    impact: {
      expected: {
        impressions: 15000,
        clicks: 750,
        conversions: 45,
        revenue: 8000,
        users: 600
      },
      actual: {
        impressions: 12000,
        clicks: 600,
        conversions: 30,
        revenue: 6300,
        users: 480
      }
    },
    attribution: {
      '7d': {
        impressions: 3000,
        clicks: 150,
        conversions: 8,
        revenue: 1400,
        roas: 1.8,
        ctr: 5.0,
        conversionRate: 5.3,
        costPerConversion: 175,
        sessions: 150,
        users: 120
      },
      '14d': {
        impressions: 6000,
        clicks: 300,
        conversions: 16,
        revenue: 2800,
        roas: 1.9,
        ctr: 5.0,
        conversionRate: 5.3,
        costPerConversion: 175,
        sessions: 300,
        users: 240
      },
      '28d': {
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
    },
    confidence: 65,
    dependencies: ['action-001'],
    blockers: []
  }
];

describe('Growth Engine Analytics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateGrowthEngineAnalytics', () => {
    it('should generate comprehensive analytics with correct structure', async () => {
      const analytics = await generateGrowthEngineAnalytics('2025-01-01', '2025-10-22');

      expect(analytics).toHaveProperty('overview');
      expect(analytics).toHaveProperty('phases');
      expect(analytics).toHaveProperty('actions');
      expect(analytics).toHaveProperty('performance');
      expect(analytics).toHaveProperty('insights');
      expect(analytics).toHaveProperty('recommendations');
    });

    it('should calculate overview metrics correctly', async () => {
      const analytics = await generateGrowthEngineAnalytics('2025-01-01', '2025-10-22');

      expect(analytics.overview).toHaveProperty('totalPhases');
      expect(analytics.overview).toHaveProperty('activePhases');
      expect(analytics.overview).toHaveProperty('completedPhases');
      expect(analytics.overview).toHaveProperty('totalActions');
      expect(analytics.overview).toHaveProperty('activeActions');
      expect(analytics.overview).toHaveProperty('completedActions');
      expect(analytics.overview).toHaveProperty('totalRevenue');
      expect(analytics.overview).toHaveProperty('totalConversions');
      expect(analytics.overview).toHaveProperty('averageROI');
      expect(analytics.overview).toHaveProperty('overallProgress');

      expect(typeof analytics.overview.totalPhases).toBe('number');
      expect(typeof analytics.overview.totalActions).toBe('number');
      expect(typeof analytics.overview.totalRevenue).toBe('number');
      expect(typeof analytics.overview.averageROI).toBe('number');
      expect(typeof analytics.overview.overallProgress).toBe('number');
    });

    it('should include phase data with correct structure', async () => {
      const analytics = await generateGrowthEngineAnalytics('2025-01-01', '2025-10-22');

      expect(Array.isArray(analytics.phases)).toBe(true);
      expect(analytics.phases.length).toBeGreaterThan(0);

      analytics.phases.forEach(phase => {
        expect(phase).toHaveProperty('phase');
        expect(phase).toHaveProperty('name');
        expect(phase).toHaveProperty('description');
        expect(phase).toHaveProperty('objectives');
        expect(phase).toHaveProperty('keyMetrics');
        expect(phase).toHaveProperty('successCriteria');
        expect(phase).toHaveProperty('startDate');
        expect(phase).toHaveProperty('endDate');
        expect(phase).toHaveProperty('status');

        expect(Array.isArray(phase.objectives)).toBe(true);
        expect(Array.isArray(phase.keyMetrics)).toBe(true);
        expect(Array.isArray(phase.successCriteria)).toBe(true);
      });
    });

    it('should include action data with correct structure', async () => {
      const analytics = await generateGrowthEngineAnalytics('2025-01-01', '2025-10-22');

      expect(Array.isArray(analytics.actions)).toBe(true);
      expect(analytics.actions.length).toBeGreaterThan(0);

      analytics.actions.forEach(action => {
        expect(action).toHaveProperty('actionId');
        expect(action).toHaveProperty('phase');
        expect(action).toHaveProperty('actionType');
        expect(action).toHaveProperty('targetSlug');
        expect(action).toHaveProperty('title');
        expect(action).toHaveProperty('description');
        expect(action).toHaveProperty('priority');
        expect(action).toHaveProperty('status');
        expect(action).toHaveProperty('impact');
        expect(action).toHaveProperty('attribution');
        expect(action).toHaveProperty('confidence');
        expect(action).toHaveProperty('dependencies');
        expect(action).toHaveProperty('blockers');

        expect(typeof action.phase).toBe('number');
        expect(typeof action.confidence).toBe('number');
        expect(Array.isArray(action.dependencies)).toBe(true);
        expect(Array.isArray(action.blockers)).toBe(true);
      });
    });

    it('should calculate performance metrics correctly', async () => {
      const analytics = await generateGrowthEngineAnalytics('2025-01-01', '2025-10-22');

      expect(analytics.performance).toHaveProperty('topPerformingActions');
      expect(analytics.performance).toHaveProperty('underperformingActions');
      expect(analytics.performance).toHaveProperty('criticalActions');
      expect(analytics.performance).toHaveProperty('blockedActions');

      expect(Array.isArray(analytics.performance.topPerformingActions)).toBe(true);
      expect(Array.isArray(analytics.performance.underperformingActions)).toBe(true);
      expect(Array.isArray(analytics.performance.criticalActions)).toBe(true);
      expect(Array.isArray(analytics.performance.blockedActions)).toBe(true);
    });

    it('should generate insights with correct structure', async () => {
      const analytics = await generateGrowthEngineAnalytics('2025-01-01', '2025-10-22');

      expect(analytics.insights).toHaveProperty('phaseProgress');
      expect(analytics.insights).toHaveProperty('actionEffectiveness');
      expect(analytics.insights).toHaveProperty('optimizationOpportunities');
      expect(analytics.insights).toHaveProperty('riskFactors');

      expect(Array.isArray(analytics.insights.phaseProgress)).toBe(true);
      expect(Array.isArray(analytics.insights.actionEffectiveness)).toBe(true);
      expect(Array.isArray(analytics.insights.optimizationOpportunities)).toBe(true);
      expect(Array.isArray(analytics.insights.riskFactors)).toBe(true);
    });

    it('should generate recommendations with correct structure', async () => {
      const analytics = await generateGrowthEngineAnalytics('2025-01-01', '2025-10-22');

      expect(analytics.recommendations).toHaveProperty('immediate');
      expect(analytics.recommendations).toHaveProperty('shortTerm');
      expect(analytics.recommendations).toHaveProperty('longTerm');
      expect(analytics.recommendations).toHaveProperty('budgetOptimization');

      expect(Array.isArray(analytics.recommendations.immediate)).toBe(true);
      expect(Array.isArray(analytics.recommendations.shortTerm)).toBe(true);
      expect(Array.isArray(analytics.recommendations.longTerm)).toBe(true);
      expect(Array.isArray(analytics.recommendations.budgetOptimization)).toBe(true);
    });
  });

  describe('exportGrowthEngineAnalytics', () => {
    it('should export analytics data with correct structure', () => {
      const mockAnalytics: GrowthEngineAnalytics = {
        overview: {
          totalPhases: 2,
          activePhases: 1,
          completedPhases: 1,
          totalActions: 2,
          activeActions: 1,
          completedActions: 1,
          totalRevenue: 9900,
          totalConversions: 48,
          averageROI: 3.15,
          overallProgress: 50
        },
        phases: mockPhases,
        actions: mockActions,
        performance: {
          topPerformingActions: [mockActions[0]],
          underperformingActions: [mockActions[1]],
          criticalActions: [],
          blockedActions: []
        },
        insights: {
          phaseProgress: [
            {
              phase: 1,
              progress: 100,
              status: 'on-track',
              keyAchievements: ['SEO optimization completed'],
              challenges: []
            },
            {
              phase: 2,
              progress: 50,
              status: 'at-risk',
              keyAchievements: [],
              challenges: ['Ads campaign underperforming']
            }
          ],
          actionEffectiveness: [
            {
              actionType: 'seo',
              averageROI: 4.2,
              successRate: 100,
              recommendations: ['Scale this channel']
            },
            {
              actionType: 'ads',
              averageROI: 2.1,
              successRate: 50,
              recommendations: ['Optimize or pause this channel']
            }
          ],
          optimizationOpportunities: [
            'Scale high-performing SEO actions',
            'Optimize underperforming ad campaigns'
          ],
          riskFactors: [
            'Google Ads campaign underperforming'
          ]
        },
        recommendations: {
          immediate: [
            'Address blocked actions immediately',
            'Optimize underperforming campaigns'
          ],
          shortTerm: [
            'Complete critical actions in current phase',
            'Improve conversion rate optimization'
          ],
          longTerm: [
            'Develop advanced attribution models',
            'Implement predictive analytics'
          ],
          budgetOptimization: [
            {
              actionId: 'action-001',
              currentBudget: 2000,
              recommendedBudget: 3000,
              expectedImpact: 1.5
            }
          ]
        }
      };

      const exported = exportGrowthEngineAnalytics(mockAnalytics);

      expect(exported).toHaveProperty('overview');
      expect(exported).toHaveProperty('phases');
      expect(exported).toHaveProperty('actions');
      expect(exported).toHaveProperty('performance');
      expect(exported).toHaveProperty('insights');
      expect(exported).toHaveProperty('recommendations');

      expect(exported.overview).toEqual(mockAnalytics.overview);
      expect(Array.isArray(exported.phases)).toBe(true);
      expect(Array.isArray(exported.actions)).toBe(true);
    });
  });

  describe('Data Validation', () => {
    it('should validate phase data structure', async () => {
      const analytics = await generateGrowthEngineAnalytics('2025-01-01', '2025-10-22');

      analytics.phases.forEach(phase => {
        expect(phase.phase).toBeGreaterThan(0);
        expect(phase.name).toBeTruthy();
        expect(phase.description).toBeTruthy();
        expect(['planning', 'active', 'completed', 'paused']).toContain(phase.status);
        expect(new Date(phase.startDate)).toBeInstanceOf(Date);
        expect(new Date(phase.endDate)).toBeInstanceOf(Date);
      });
    });

    it('should validate action data structure', async () => {
      const analytics = await generateGrowthEngineAnalytics('2025-01-01', '2025-10-22');

      analytics.actions.forEach(action => {
        expect(action.actionId).toBeTruthy();
        expect(action.phase).toBeGreaterThan(0);
        expect(['seo', 'ads', 'content', 'social', 'email', 'product', 'partnership', 'retention']).toContain(action.actionType);
        expect(['low', 'medium', 'high', 'critical']).toContain(action.priority);
        expect(['planned', 'approved', 'executed', 'completed', 'failed', 'paused']).toContain(action.status);
        expect(action.confidence).toBeGreaterThanOrEqual(0);
        expect(action.confidence).toBeLessThanOrEqual(100);
      });
    });

    it('should validate performance metrics', async () => {
      const analytics = await generateGrowthEngineAnalytics('2025-01-01', '2025-10-22');

      expect(analytics.overview.totalPhases).toBeGreaterThanOrEqual(0);
      expect(analytics.overview.totalActions).toBeGreaterThanOrEqual(0);
      expect(analytics.overview.totalRevenue).toBeGreaterThanOrEqual(0);
      expect(analytics.overview.totalConversions).toBeGreaterThanOrEqual(0);
      expect(analytics.overview.averageROI).toBeGreaterThanOrEqual(0);
      expect(analytics.overview.overallProgress).toBeGreaterThanOrEqual(0);
      expect(analytics.overview.overallProgress).toBeLessThanOrEqual(100);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid date ranges gracefully', async () => {
      const analytics = await generateGrowthEngineAnalytics('invalid-date', 'invalid-date');

      expect(analytics).toBeDefined();
      expect(analytics.overview).toBeDefined();
      expect(analytics.phases).toBeDefined();
      expect(analytics.actions).toBeDefined();
    });

    it('should handle empty data gracefully', async () => {
      // Mock empty data scenario
      vi.mock('~/services/analytics/growthEngine', async () => {
        const actual = await vi.importActual('~/services/analytics/growthEngine');
        return {
          ...actual,
          getGrowthPhases: () => Promise.resolve([]),
          getGrowthActions: () => Promise.resolve([])
        };
      });

      const analytics = await generateGrowthEngineAnalytics('2025-01-01', '2025-10-22');

      expect(analytics.overview.totalPhases).toBe(0);
      expect(analytics.overview.totalActions).toBe(0);
      expect(analytics.phases).toEqual([]);
      expect(analytics.actions).toEqual([]);
    });
  });

  describe('Performance', () => {
    it('should generate analytics within reasonable time', async () => {
      const startTime = Date.now();
      await generateGrowthEngineAnalytics('2025-01-01', '2025-10-22');
      const endTime = Date.now();

      // Should complete within 5 seconds
      expect(endTime - startTime).toBeLessThan(5000);
    });

    it('should handle large datasets efficiently', async () => {
      // Test with extended date range
      const analytics = await generateGrowthEngineAnalytics('2024-01-01', '2025-10-22');

      expect(analytics).toBeDefined();
      expect(analytics.overview).toBeDefined();
      expect(analytics.phases).toBeDefined();
      expect(analytics.actions).toBeDefined();
    });
  });
});
