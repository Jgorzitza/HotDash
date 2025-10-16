/**
 * Unit Tests for Recommendations Generator
 *
 * Owner: ads agent
 * Date: 2025-10-16
 */

import { describe, it, expect } from 'vitest';
import { generateRecommendations } from '../../app/services/ads/recommendations';
import type { CampaignMetrics } from '../../app/lib/ads/tracking';

const campaigns: CampaignMetrics[] = [
  {
    campaignId: 'meta_001',
    campaignName: 'Meta High Performer',
    platform: 'meta',
    status: 'active',
    adSpend: 1000,
    revenue: 6000,
    impressions: 100000,
    clicks: 1500,
    conversions: 120,
    dateStart: '2025-10-01',
    dateEnd: '2025-10-15',
  },
  {
    campaignId: 'google_001',
    campaignName: 'Google Low Performer',
    platform: 'google',
    status: 'active',
    adSpend: 1000,
    revenue: 1500,
    impressions: 80000,
    clicks: 800,
    conversions: 20,
    dateStart: '2025-10-01',
    dateEnd: '2025-10-15',
  },
];

describe('generateRecommendations', () => {
  it('returns a batch with recommendations and summary', () => {
    const batch = generateRecommendations(campaigns, { totalBudget: 3000, minBudgetPerCampaign: 100 });

    expect(batch.batchId).toMatch(/^batch_/);
    expect(batch.recommendations.length).toBeGreaterThan(0);
    expect(batch.summary).toContain('Generated');
  });

  it('includes budget reallocation when multiple campaigns provided', () => {
    const batch = generateRecommendations(campaigns, { totalBudget: 3000, minBudgetPerCampaign: 100 });
    const hasReallocation = batch.recommendations.some(r => r.title.includes('Reallocate budget'));
    expect(hasReallocation).toBe(true);
  });
});

