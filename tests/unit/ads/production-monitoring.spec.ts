/**
 * Production Monitoring Tests
 * 
 * ADS-006: Tests for production campaign monitoring
 */

import { describe, it, expect } from 'vitest';
import {
  monitorCampaignPerformance,
  generateMonitoringDashboard,
  shouldAutoExecuteAction,
  formatAlertNotification,
  getCampaignHealthScore,
  DEFAULT_MONITORING_CONFIG,
} from '~/services/ads/production-monitoring';
import type { Campaign, CampaignPerformance } from '~/services/ads/types';
import type { AutomationAction } from '~/services/ads/campaign-automation';

describe('Production Monitoring', () => {
  const mockCampaigns: Campaign[] = [
    {
      id: 'campaign-1',
      name: 'High Performer',
      status: 'ENABLED',
      dailyBudgetCents: 50000,
      targetCpcCents: 100,
    },
    {
      id: 'campaign-2',
      name: 'Low Performer',
      status: 'ENABLED',
      dailyBudgetCents: 30000,
      targetCpcCents: 150,
    },
    {
      id: 'campaign-3',
      name: 'Paused Campaign',
      status: 'PAUSED',
      dailyBudgetCents: 20000,
      targetCpcCents: 120,
    },
  ];

  const mockPerformances: CampaignPerformance[] = [
    {
      campaignId: 'campaign-1',
      campaignName: 'High Performer',
      impressions: 10000,
      clicks: 500,
      costCents: 50000,
      conversions: 50,
      revenueCents: 200000,
      ctr: 0.05,
      avgCpcCents: 100,
      customerId: 'customer-1',
      dateRange: '2025-10-23',
    },
    {
      campaignId: 'campaign-2',
      campaignName: 'Low Performer',
      impressions: 5000,
      clicks: 50,
      costCents: 10000,
      conversions: 5,
      revenueCents: 8000,
      ctr: 0.01,
      avgCpcCents: 200,
      customerId: 'customer-1',
      dateRange: '2025-10-23',
    },
    {
      campaignId: 'campaign-3',
      campaignName: 'Paused Campaign',
      impressions: 0,
      clicks: 0,
      costCents: 0,
      conversions: 0,
      revenueCents: 0,
      ctr: 0,
      avgCpcCents: 0,
      customerId: 'customer-1',
      dateRange: '2025-10-23',
    },
  ];

  describe('monitorCampaignPerformance', () => {
    it('should monitor all campaigns', () => {
      const statuses = monitorCampaignPerformance(
        mockCampaigns,
        mockPerformances,
        DEFAULT_MONITORING_CONFIG
      );

      expect(statuses.length).toBe(mockCampaigns.length);
    });

    it('should identify healthy campaigns', () => {
      const statuses = monitorCampaignPerformance(
        mockCampaigns,
        mockPerformances,
        DEFAULT_MONITORING_CONFIG
      );

      const healthyCampaign = statuses.find(s => s.campaignId === 'campaign-1');
      expect(healthyCampaign).toBeDefined();
      expect(healthyCampaign!.status).toBe('healthy');
      expect(healthyCampaign!.currentROAS).toBeGreaterThan(2.0);
    });

    it('should identify warning campaigns', () => {
      const statuses = monitorCampaignPerformance(
        mockCampaigns,
        mockPerformances,
        DEFAULT_MONITORING_CONFIG
      );

      const warningCampaign = statuses.find(s => s.campaignId === 'campaign-2');
      expect(warningCampaign).toBeDefined();
      expect(warningCampaign!.status).toBe('warning');
      expect(warningCampaign!.currentROAS).toBeLessThan(2.0);
    });

    it('should identify paused campaigns', () => {
      const statuses = monitorCampaignPerformance(
        mockCampaigns,
        mockPerformances,
        DEFAULT_MONITORING_CONFIG
      );

      const pausedCampaign = statuses.find(s => s.campaignId === 'campaign-3');
      expect(pausedCampaign).toBeDefined();
      expect(pausedCampaign!.status).toBe('paused');
    });

    it('should include metrics for each campaign', () => {
      const statuses = monitorCampaignPerformance(
        mockCampaigns,
        mockPerformances,
        DEFAULT_MONITORING_CONFIG
      );

      statuses.forEach(status => {
        expect(status.metrics).toBeDefined();
        expect(status.metrics.spend).toBeGreaterThanOrEqual(0);
        expect(status.metrics.revenue).toBeGreaterThanOrEqual(0);
        expect(status.metrics.conversions).toBeGreaterThanOrEqual(0);
        expect(status.metrics.ctr).toBeGreaterThanOrEqual(0);
        expect(status.metrics.cpc).toBeGreaterThanOrEqual(0);
      });
    });

    it('should include alerts for each campaign', () => {
      const statuses = monitorCampaignPerformance(
        mockCampaigns,
        mockPerformances,
        DEFAULT_MONITORING_CONFIG
      );

      statuses.forEach(status => {
        expect(Array.isArray(status.alerts)).toBe(true);
      });
    });

    it('should include recommendations for each campaign', () => {
      const statuses = monitorCampaignPerformance(
        mockCampaigns,
        mockPerformances,
        DEFAULT_MONITORING_CONFIG
      );

      statuses.forEach(status => {
        expect(Array.isArray(status.recommendations)).toBe(true);
      });
    });
  });

  describe('generateMonitoringDashboard', () => {
    it('should generate complete dashboard', () => {
      const dashboard = generateMonitoringDashboard(
        mockCampaigns,
        mockPerformances,
        DEFAULT_MONITORING_CONFIG
      );

      expect(dashboard.summary).toBeDefined();
      expect(dashboard.campaigns).toBeDefined();
      expect(dashboard.recentAlerts).toBeDefined();
      expect(dashboard.topRecommendations).toBeDefined();
      expect(dashboard.lastUpdated).toBeDefined();
    });

    it('should calculate summary metrics correctly', () => {
      const dashboard = generateMonitoringDashboard(
        mockCampaigns,
        mockPerformances,
        DEFAULT_MONITORING_CONFIG
      );

      expect(dashboard.summary.totalCampaigns).toBe(mockCampaigns.length);
      expect(dashboard.summary.totalSpend).toBeGreaterThan(0);
      expect(dashboard.summary.totalRevenue).toBeGreaterThan(0);
      expect(dashboard.summary.overallROAS).toBeGreaterThan(0);
    });

    it('should count campaign statuses correctly', () => {
      const dashboard = generateMonitoringDashboard(
        mockCampaigns,
        mockPerformances,
        DEFAULT_MONITORING_CONFIG
      );

      const total = dashboard.summary.healthyCampaigns +
                    dashboard.summary.warningCampaigns +
                    dashboard.summary.criticalCampaigns +
                    dashboard.summary.pausedCampaigns;

      expect(total).toBe(dashboard.summary.totalCampaigns);
    });

    it('should include recent high-priority alerts', () => {
      const dashboard = generateMonitoringDashboard(
        mockCampaigns,
        mockPerformances,
        DEFAULT_MONITORING_CONFIG
      );

      dashboard.recentAlerts.forEach(alert => {
        expect(['high', 'critical']).toContain(alert.severity);
      });
    });

    it('should limit recent alerts to 10', () => {
      const dashboard = generateMonitoringDashboard(
        mockCampaigns,
        mockPerformances,
        DEFAULT_MONITORING_CONFIG
      );

      expect(dashboard.recentAlerts.length).toBeLessThanOrEqual(10);
    });

    it('should limit top recommendations to 10', () => {
      const dashboard = generateMonitoringDashboard(
        mockCampaigns,
        mockPerformances,
        DEFAULT_MONITORING_CONFIG
      );

      expect(dashboard.topRecommendations.length).toBeLessThanOrEqual(10);
    });
  });

  describe('shouldAutoExecuteAction', () => {
    it('should not auto-execute when disabled', () => {
      const action: AutomationAction = {
        campaignId: 'campaign-1',
        campaignName: 'Test',
        type: 'pause_campaign',
        reason: 'Test',
        severity: 'low',
        estimatedImpact: 'Test',
      };

      const config = {
        ...DEFAULT_MONITORING_CONFIG,
        enableAutomatedActions: false,
      };

      expect(shouldAutoExecuteAction(action, config)).toBe(false);
    });

    it('should not auto-execute high severity actions', () => {
      const action: AutomationAction = {
        campaignId: 'campaign-1',
        campaignName: 'Test',
        type: 'pause_campaign',
        reason: 'Test',
        severity: 'high',
        estimatedImpact: 'Test',
      };

      const config = {
        ...DEFAULT_MONITORING_CONFIG,
        enableAutomatedActions: true,
      };

      expect(shouldAutoExecuteAction(action, config)).toBe(false);
    });

    it('should not auto-execute budget changes', () => {
      const action: AutomationAction = {
        campaignId: 'campaign-1',
        campaignName: 'Test',
        type: 'increase_budget',
        reason: 'Test',
        severity: 'low',
        estimatedImpact: 'Test',
      };

      const config = {
        ...DEFAULT_MONITORING_CONFIG,
        enableAutomatedActions: true,
      };

      expect(shouldAutoExecuteAction(action, config)).toBe(false);
    });
  });

  describe('formatAlertNotification', () => {
    it('should format high severity alerts with correct emoji', () => {
      const alert = {
        campaignId: 'campaign-1',
        campaignName: 'Test Campaign',
        alertType: 'budget_depleted' as const,
        severity: 'high' as const,
        message: 'Budget depleted',
        currentValue: 95,
        thresholdValue: 80,
        timestamp: new Date().toISOString(),
      };

      const notification = formatAlertNotification(alert);
      expect(notification).toContain('🚨');
      expect(notification).toContain('Test Campaign');
      expect(notification).toContain('Budget depleted');
    });

    it('should format medium severity alerts with correct emoji', () => {
      const alert = {
        campaignId: 'campaign-1',
        campaignName: 'Test Campaign',
        alertType: 'low_ctr' as const,
        severity: 'medium' as const,
        message: 'Low CTR',
        currentValue: 0.5,
        thresholdValue: 1.0,
        timestamp: new Date().toISOString(),
      };

      const notification = formatAlertNotification(alert);
      expect(notification).toContain('⚠️');
    });
  });

  describe('getCampaignHealthScore', () => {
    it('should return 100 for perfect campaign', () => {
      const status = {
        campaignId: 'campaign-1',
        campaignName: 'Perfect Campaign',
        status: 'healthy' as const,
        currentROAS: 5.0,
        targetROAS: 2.0,
        alerts: [],
        recommendations: [],
        lastChecked: new Date().toISOString(),
        metrics: {
          spend: 100,
          revenue: 500,
          conversions: 50,
          ctr: 0.05,
          cpc: 2.0,
        },
      };

      const score = getCampaignHealthScore(status);
      expect(score).toBe(100);
    });

    it('should deduct points for low ROAS', () => {
      const status = {
        campaignId: 'campaign-1',
        campaignName: 'Low ROAS Campaign',
        status: 'warning' as const,
        currentROAS: 1.0,
        targetROAS: 2.0,
        alerts: [],
        recommendations: [],
        lastChecked: new Date().toISOString(),
        metrics: {
          spend: 100,
          revenue: 100,
          conversions: 10,
          ctr: 0.02,
          cpc: 10.0,
        },
      };

      const score = getCampaignHealthScore(status);
      expect(score).toBeLessThan(100);
    });

    it('should deduct points for alerts', () => {
      const status = {
        campaignId: 'campaign-1',
        campaignName: 'Campaign with Alerts',
        status: 'warning' as const,
        currentROAS: 3.0,
        targetROAS: 2.0,
        alerts: [
          {
            campaignId: 'campaign-1',
            campaignName: 'Test',
            alertType: 'budget_depleted' as const,
            severity: 'high' as const,
            message: 'Test',
            currentValue: 90,
            thresholdValue: 80,
            timestamp: new Date().toISOString(),
          },
        ],
        recommendations: [],
        lastChecked: new Date().toISOString(),
        metrics: {
          spend: 100,
          revenue: 300,
          conversions: 30,
          ctr: 0.03,
          cpc: 3.33,
        },
      };

      const score = getCampaignHealthScore(status);
      expect(score).toBeLessThan(100);
    });

    it('should never return negative score', () => {
      const status = {
        campaignId: 'campaign-1',
        campaignName: 'Terrible Campaign',
        status: 'critical' as const,
        currentROAS: 0.1,
        targetROAS: 2.0,
        alerts: Array(10).fill({
          campaignId: 'campaign-1',
          campaignName: 'Test',
          alertType: 'budget_depleted' as const,
          severity: 'high' as const,
          message: 'Test',
          currentValue: 100,
          thresholdValue: 80,
          timestamp: new Date().toISOString(),
        }),
        recommendations: [],
        lastChecked: new Date().toISOString(),
        metrics: {
          spend: 1000,
          revenue: 100,
          conversions: 1,
          ctr: 0.001,
          cpc: 1000,
        },
      };

      const score = getCampaignHealthScore(status);
      expect(score).toBeGreaterThanOrEqual(0);
    });
  });
});

