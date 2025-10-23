/**
 * ROI Tracker Tests
 * 
 * ADS-005: Tests for ROI tracking and attribution
 */

import { describe, it, expect } from 'vitest';
import {
  calculateROIAttribution,
  calculateCLVMetrics,
  generateROITrackingSummary,
} from '~/services/ads/roi-tracker';
import type { Conversion, Touchpoint } from '~/services/ads/roi-tracker';

describe('ROI Tracker', () => {
  const mockTouchpoints: Touchpoint[] = [
    {
      campaignId: 'campaign-1',
      campaignName: 'First Touch Campaign',
      timestamp: '2025-10-01T10:00:00Z',
      channel: 'google_ads',
      costCents: 100,
      position: 1,
    },
    {
      campaignId: 'campaign-2',
      campaignName: 'Middle Touch Campaign',
      timestamp: '2025-10-05T10:00:00Z',
      channel: 'facebook_ads',
      costCents: 150,
      position: 2,
    },
    {
      campaignId: 'campaign-3',
      campaignName: 'Last Touch Campaign',
      timestamp: '2025-10-10T10:00:00Z',
      channel: 'google_ads',
      costCents: 200,
      position: 3,
    },
  ];

  const mockConversions: Conversion[] = [
    {
      conversionId: 'conv-1',
      customerId: 'customer-1',
      revenueCents: 10000,
      timestamp: '2025-10-10T12:00:00Z',
      touchpoints: mockTouchpoints,
    },
    {
      conversionId: 'conv-2',
      customerId: 'customer-2',
      revenueCents: 15000,
      timestamp: '2025-10-11T12:00:00Z',
      touchpoints: [mockTouchpoints[2]], // Only last touch
    },
  ];

  describe('calculateROIAttribution', () => {
    it('should calculate last-click attribution correctly', () => {
      const attributions = calculateROIAttribution(mockConversions, 'last_click');

      const lastTouchAttribution = attributions.find(a => a.campaignId === 'campaign-3');
      expect(lastTouchAttribution).toBeDefined();
      expect(lastTouchAttribution!.attributedRevenueCents).toBe(25000); // Full revenue from both conversions
    });

    it('should calculate first-click attribution correctly', () => {
      const attributions = calculateROIAttribution(mockConversions, 'first_click');

      const firstTouchAttribution = attributions.find(a => a.campaignId === 'campaign-1');
      expect(firstTouchAttribution).toBeDefined();
      expect(firstTouchAttribution!.attributedRevenueCents).toBe(10000); // Only first conversion
    });

    it('should calculate linear attribution correctly', () => {
      const attributions = calculateROIAttribution(mockConversions, 'linear');

      // Each touchpoint in first conversion should get 1/3 of revenue
      const campaign1 = attributions.find(a => a.campaignId === 'campaign-1');
      const campaign2 = attributions.find(a => a.campaignId === 'campaign-2');
      const campaign3 = attributions.find(a => a.campaignId === 'campaign-3');

      expect(campaign1).toBeDefined();
      expect(campaign2).toBeDefined();
      expect(campaign3).toBeDefined();

      // Campaign 1 and 2 should have ~3333 cents (1/3 of 10000)
      // Campaign 3 should have ~3333 + 15000 (1/3 of first + all of second)
      expect(campaign1!.attributedRevenueCents).toBeCloseTo(3333, -2);
      expect(campaign2!.attributedRevenueCents).toBeCloseTo(3333, -2);
      expect(campaign3!.attributedRevenueCents).toBeGreaterThan(15000);
    });

    it('should calculate time-decay attribution correctly', () => {
      const attributions = calculateROIAttribution(mockConversions, 'time_decay');

      // More recent touchpoints should get more credit
      const campaign3 = attributions.find(a => a.campaignId === 'campaign-3');
      const campaign1 = attributions.find(a => a.campaignId === 'campaign-1');

      expect(campaign3!.attributedRevenueCents).toBeGreaterThan(
        campaign1!.attributedRevenueCents
      );
    });

    it('should calculate position-based attribution correctly', () => {
      const attributions = calculateROIAttribution(mockConversions, 'position_based');

      // First and last should get 40% each, middle gets 20%
      const campaign1 = attributions.find(a => a.campaignId === 'campaign-1');
      const campaign2 = attributions.find(a => a.campaignId === 'campaign-2');
      const campaign3 = attributions.find(a => a.campaignId === 'campaign-3');

      expect(campaign1).toBeDefined();
      expect(campaign2).toBeDefined();
      expect(campaign3).toBeDefined();

      // Campaign 1: 40% of 10000 = 4000
      // Campaign 2: 20% of 10000 = 2000
      // Campaign 3: 40% of 10000 + 100% of 15000 = 19000
      expect(campaign1!.attributedRevenueCents).toBeCloseTo(4000, -2);
      expect(campaign2!.attributedRevenueCents).toBeCloseTo(2000, -2);
      expect(campaign3!.attributedRevenueCents).toBeCloseTo(19000, -2);
    });

    it('should calculate ROAS for each attribution', () => {
      const attributions = calculateROIAttribution(mockConversions, 'last_click');

      attributions.forEach(attribution => {
        // ROAS should be defined (can be 0 if no revenue attributed)
        expect(attribution.roas).toBeDefined();
        expect(typeof attribution.roas).toBe('number');
      });
    });

    it('should sort attributions by ROAS descending', () => {
      const attributions = calculateROIAttribution(mockConversions, 'last_click');

      for (let i = 1; i < attributions.length; i++) {
        expect(attributions[i - 1].roas).toBeGreaterThanOrEqual(attributions[i].roas);
      }
    });
  });

  describe('calculateCLVMetrics', () => {
    const mockCustomerData = [
      {
        customerId: 'customer-1',
        purchases: [
          { revenueCents: 5000, timestamp: '2025-10-01T10:00:00Z' },
          { revenueCents: 7000, timestamp: '2025-10-15T10:00:00Z' },
        ],
      },
      {
        customerId: 'customer-2',
        purchases: [
          { revenueCents: 10000, timestamp: '2025-10-05T10:00:00Z' },
        ],
      },
      {
        customerId: 'customer-3',
        purchases: [
          { revenueCents: 3000, timestamp: '2025-10-10T10:00:00Z' },
          { revenueCents: 4000, timestamp: '2025-10-20T10:00:00Z' },
          { revenueCents: 5000, timestamp: '2025-10-22T10:00:00Z' },
        ],
      },
    ];

    it('should calculate average CLV correctly', () => {
      const metrics = calculateCLVMetrics('campaign-1', 'Test Campaign', mockCustomerData);

      // Total revenue: 5000 + 7000 + 10000 + 3000 + 4000 + 5000 = 34000
      // Average CLV: 34000 / 3 customers = 11333
      expect(metrics.averageCLV).toBeCloseTo(11333, -2);
    });

    it('should calculate repeat purchase rate correctly', () => {
      const metrics = calculateCLVMetrics('campaign-1', 'Test Campaign', mockCustomerData);

      // 2 out of 3 customers made repeat purchases
      expect(metrics.repeatPurchaseRate).toBeCloseTo(2 / 3, 2);
    });

    it('should calculate average order value correctly', () => {
      const metrics = calculateCLVMetrics('campaign-1', 'Test Campaign', mockCustomerData);

      // Total revenue: 34000, Total purchases: 6
      // AOV: 34000 / 6 = 5667
      expect(metrics.averageOrderValue).toBeCloseTo(5667, -2);
    });

    it('should calculate purchase frequency correctly', () => {
      const metrics = calculateCLVMetrics('campaign-1', 'Test Campaign', mockCustomerData);

      // Total purchases: 6, Customers: 3
      // Frequency: 6 / 3 = 2
      expect(metrics.purchaseFrequency).toBe(2);
    });

    it('should project lifetime value correctly', () => {
      const metrics = calculateCLVMetrics('campaign-1', 'Test Campaign', mockCustomerData);

      // Projected LTV should be higher than average CLV due to repeat rate
      expect(metrics.projectedLTV).toBeGreaterThan(metrics.averageCLV);
    });

    it('should handle empty customer data', () => {
      const metrics = calculateCLVMetrics('campaign-1', 'Test Campaign', []);

      expect(metrics.averageCLV).toBe(0);
      expect(metrics.customerCount).toBe(0);
      expect(metrics.repeatPurchaseRate).toBe(0);
      expect(metrics.averageOrderValue).toBe(0);
      expect(metrics.purchaseFrequency).toBe(0);
      expect(metrics.projectedLTV).toBe(0);
    });
  });

  describe('generateROITrackingSummary', () => {
    const mockCustomerData = new Map([
      [
        'campaign-1',
        [
          {
            customerId: 'customer-1',
            purchases: [
              { revenueCents: 5000, timestamp: '2025-10-01T10:00:00Z' },
              { revenueCents: 7000, timestamp: '2025-10-15T10:00:00Z' },
            ],
          },
        ],
      ],
      [
        'campaign-3',
        [
          {
            customerId: 'customer-2',
            purchases: [
              { revenueCents: 10000, timestamp: '2025-10-05T10:00:00Z' },
            ],
          },
        ],
      ],
    ]);

    it('should generate complete summary', () => {
      const summary = generateROITrackingSummary(
        mockConversions,
        mockCustomerData,
        'last_click'
      );

      expect(summary.totalRevenueCents).toBeGreaterThan(0);
      expect(summary.totalCostCents).toBeGreaterThan(0);
      expect(summary.overallROAS).toBeGreaterThan(0);
      expect(summary.attributionBreakdown).toBeDefined();
      expect(summary.clvMetrics).toBeDefined();
      expect(summary.topPerformingCampaigns).toBeDefined();
      expect(summary.insights).toBeDefined();
    });

    it('should identify top performing campaigns', () => {
      const summary = generateROITrackingSummary(
        mockConversions,
        mockCustomerData,
        'last_click'
      );

      expect(summary.topPerformingCampaigns.length).toBeGreaterThan(0);
      expect(summary.topPerformingCampaigns.length).toBeLessThanOrEqual(5);

      // Should be sorted by ROAS
      for (let i = 1; i < summary.topPerformingCampaigns.length; i++) {
        expect(summary.topPerformingCampaigns[i - 1].roas).toBeGreaterThanOrEqual(
          summary.topPerformingCampaigns[i].roas
        );
      }
    });

    it('should generate insights', () => {
      const summary = generateROITrackingSummary(
        mockConversions,
        mockCustomerData,
        'last_click'
      );

      expect(summary.insights.length).toBeGreaterThan(0);
      summary.insights.forEach(insight => {
        expect(typeof insight).toBe('string');
        expect(insight.length).toBeGreaterThan(0);
      });
    });

    it('should calculate CLV metrics for all campaigns', () => {
      const summary = generateROITrackingSummary(
        mockConversions,
        mockCustomerData,
        'last_click'
      );

      expect(summary.clvMetrics.length).toBe(mockCustomerData.size);
    });
  });
});

