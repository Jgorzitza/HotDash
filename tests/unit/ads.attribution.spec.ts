/**
 * Unit Tests for Attribution Models
 *
 * Owner: ads agent
 * Date: 2025-10-16
 */

import { describe, it, expect } from 'vitest';
import {
  calculateAttribution,
  aggregateAttributionByCampaign,
  compareAttributionModels,
  type CustomerJourney,
  type Touchpoint,
} from '../../app/lib/ads/attribution';

function makeJourney(): CustomerJourney {
  const touchpoints: Touchpoint[] = [
    {
      touchpointId: 'tp1',
      platform: 'meta',
      campaignId: 'c1',
      campaignName: 'Meta Campaign',
      timestamp: '2025-10-10T00:00:00Z',
      adSpend: 100,
      touchpointPosition: 1,
    },
    {
      touchpointId: 'tp2',
      platform: 'google',
      campaignId: 'c2',
      campaignName: 'Google Campaign',
      timestamp: '2025-10-12T00:00:00Z',
      adSpend: 150,
      touchpointPosition: 2,
    },
  ];

  return {
    journeyId: 'j1',
    customerId: 'u1',
    touchpoints,
    conversionValue: 1000,
    conversionTimestamp: '2025-10-16T00:00:00Z',
    journeyDurationDays: 6,
  };
}

describe('Attribution: calculateAttribution', () => {
  it('allocates all revenue to last click for last_click model', () => {
    const journey = makeJourney();
    const attributions = calculateAttribution(journey, 'last_click');

    const totalRevenue = attributions.reduce((s, a) => s + a.attributedRevenue, 0);
    expect(totalRevenue).toBeCloseTo(journey.conversionValue, 5);
    expect(attributions[1].attributedRevenue).toBeGreaterThan(attributions[0].attributedRevenue);
  });

  it('splits evenly for linear model', () => {
    const journey = makeJourney();
    const attributions = calculateAttribution(journey, 'linear');
    expect(attributions[0].attributedRevenue).toBeCloseTo(500, 5);
    expect(attributions[1].attributedRevenue).toBeCloseTo(500, 5);
  });
});

describe('Attribution: aggregateAttributionByCampaign', () => {
  it('aggregates revenue and computes ROAS per campaign', () => {
    const journeys = [makeJourney()];
    const results = aggregateAttributionByCampaign(journeys, 'linear');

    const c1 = results.find(r => r.campaignId === 'c1')!;
    const c2 = results.find(r => r.campaignId === 'c2')!;

    expect(c1.attributedRevenue).toBeGreaterThan(0);
    expect(c2.attributedRevenue).toBeGreaterThan(0);
    expect(c1.roas).toBeGreaterThan(0);
    expect(c2.roas).toBeGreaterThan(0);
  });
});

describe('Attribution: compareAttributionModels', () => {
  it('returns model differences and recommendation', () => {
    const journeys = [makeJourney()];
    const comparison = compareAttributionModels(journeys);

    expect(comparison.campaigns.length).toBeGreaterThan(0);
    expect(comparison.modelDifferences.length).toBeGreaterThan(0);
    expect(comparison.recommendation).toContain('Attribution');
  });
});

