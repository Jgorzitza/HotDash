/**
 * Unit Tests for Ads Tracking Metrics
 * 
 * Purpose: Test all metric calculations for accuracy
 * Owner: ads agent
 * Date: 2025-10-15
 */

import { describe, it, expect } from 'vitest';
import {
  calculateRoas,
  calculateCpc,
  calculateCpm,
  calculateCpa,
  calculateCtr,
  calculateConversionRate,
  calculateCampaignPerformance,
  aggregateCampaignPerformance,
  type CampaignMetrics,
} from '../tracking';

describe('calculateRoas', () => {
  it('calculates correct ROAS', () => {
    expect(calculateRoas(1000, 250)).toBe(4.0);
    expect(calculateRoas(500, 100)).toBe(5.0);
    expect(calculateRoas(2000, 500)).toBe(4.0);
  });

  it('returns 0 for zero ad spend', () => {
    expect(calculateRoas(1000, 0)).toBe(0);
  });

  it('returns 0 for negative ad spend', () => {
    expect(calculateRoas(1000, -100)).toBe(0);
  });

  it('handles zero revenue', () => {
    expect(calculateRoas(0, 100)).toBe(0);
  });
});

describe('calculateCpc', () => {
  it('calculates correct CPC', () => {
    expect(calculateCpc(100, 50)).toBe(2.0);
    expect(calculateCpc(250, 100)).toBe(2.5);
  });

  it('returns 0 for zero clicks', () => {
    expect(calculateCpc(100, 0)).toBe(0);
  });

  it('returns 0 for negative clicks', () => {
    expect(calculateCpc(100, -10)).toBe(0);
  });
});

describe('calculateCpm', () => {
  it('calculates correct CPM', () => {
    expect(calculateCpm(100, 10000)).toBe(10.0);
    expect(calculateCpm(50, 5000)).toBe(10.0);
    expect(calculateCpm(200, 10000)).toBe(20.0);
  });

  it('returns 0 for zero impressions', () => {
    expect(calculateCpm(100, 0)).toBe(0);
  });
});

describe('calculateCpa', () => {
  it('calculates correct CPA', () => {
    expect(calculateCpa(500, 25)).toBe(20.0);
    expect(calculateCpa(1000, 50)).toBe(20.0);
  });

  it('returns 0 for zero conversions', () => {
    expect(calculateCpa(500, 0)).toBe(0);
  });
});

describe('calculateCtr', () => {
  it('calculates correct CTR', () => {
    expect(calculateCtr(100, 10000)).toBe(1.0);
    expect(calculateCtr(250, 10000)).toBe(2.5);
    expect(calculateCtr(50, 10000)).toBe(0.5);
  });

  it('returns 0 for zero impressions', () => {
    expect(calculateCtr(100, 0)).toBe(0);
  });
});

describe('calculateConversionRate', () => {
  it('calculates correct conversion rate', () => {
    expect(calculateConversionRate(25, 100)).toBe(25.0);
    expect(calculateConversionRate(10, 100)).toBe(10.0);
    expect(calculateConversionRate(5, 100)).toBe(5.0);
  });

  it('returns 0 for zero clicks', () => {
    expect(calculateConversionRate(25, 0)).toBe(0);
  });
});

describe('calculateCampaignPerformance', () => {
  it('calculates all metrics correctly', () => {
    const campaign: CampaignMetrics = {
      campaignId: 'test_001',
      campaignName: 'Test Campaign',
      platform: 'meta',
      status: 'active',
      adSpend: 500,
      revenue: 2000,
      impressions: 50000,
      clicks: 500,
      conversions: 40,
      dateStart: '2025-10-01',
      dateEnd: '2025-10-15',
    };

    const performance = calculateCampaignPerformance(campaign);

    expect(performance.roas).toBe(4.0);
    expect(performance.cpc).toBe(1.0);
    expect(performance.cpm).toBe(10.0);
    expect(performance.cpa).toBe(12.5);
    expect(performance.ctr).toBe(1.0);
    expect(performance.conversionRate).toBe(8.0);
    expect(performance.calculatedAt).toBeDefined();
  });
});

describe('aggregateCampaignPerformance', () => {
  it('aggregates multiple campaigns correctly', () => {
    const campaigns: CampaignMetrics[] = [
      {
        campaignId: 'meta_001',
        campaignName: 'Meta Campaign',
        platform: 'meta',
        status: 'active',
        adSpend: 500,
        revenue: 2000,
        impressions: 50000,
        clicks: 500,
        conversions: 40,
        dateStart: '2025-10-01',
        dateEnd: '2025-10-15',
      },
      {
        campaignId: 'google_001',
        campaignName: 'Google Campaign',
        platform: 'google',
        status: 'active',
        adSpend: 750,
        revenue: 3750,
        impressions: 100000,
        clicks: 1000,
        conversions: 75,
        dateStart: '2025-10-01',
        dateEnd: '2025-10-15',
      },
    ];

    const aggregated = aggregateCampaignPerformance(campaigns);

    expect(aggregated.totalCampaigns).toBe(2);
    expect(aggregated.totalAdSpend).toBe(1250);
    expect(aggregated.totalRevenue).toBe(5750);
    expect(aggregated.totalImpressions).toBe(150000);
    expect(aggregated.totalClicks).toBe(1500);
    expect(aggregated.totalConversions).toBe(115);
    expect(aggregated.aggregatedRoas).toBe(4.6);
    expect(aggregated.byPlatform.meta).toBeDefined();
    expect(aggregated.byPlatform.google).toBeDefined();
  });

  it('throws error for empty campaign list', () => {
    expect(() => aggregateCampaignPerformance([])).toThrow('Cannot aggregate empty campaign list');
  });

  it('groups by platform correctly', () => {
    const campaigns: CampaignMetrics[] = [
      {
        campaignId: 'meta_001',
        campaignName: 'Meta 1',
        platform: 'meta',
        status: 'active',
        adSpend: 500,
        revenue: 2000,
        impressions: 50000,
        clicks: 500,
        conversions: 40,
        dateStart: '2025-10-01',
        dateEnd: '2025-10-15',
      },
      {
        campaignId: 'meta_002',
        campaignName: 'Meta 2',
        platform: 'meta',
        status: 'active',
        adSpend: 300,
        revenue: 1500,
        impressions: 30000,
        clicks: 450,
        conversions: 30,
        dateStart: '2025-10-01',
        dateEnd: '2025-10-15',
      },
    ];

    const aggregated = aggregateCampaignPerformance(campaigns);

    expect(aggregated.byPlatform.meta.campaigns).toBe(2);
    expect(aggregated.byPlatform.meta.adSpend).toBe(800);
    expect(aggregated.byPlatform.meta.revenue).toBe(3500);
  });
});

