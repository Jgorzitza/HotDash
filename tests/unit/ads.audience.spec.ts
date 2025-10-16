/**
 * Unit Tests: Audience Insights
 */
import { describe, it, expect } from 'vitest';
import { analyzeAudiencePerformance, compareAudiences, recommendLookalikeAudience, detectAudienceOverlap, type AudienceMetrics } from '../../app/lib/ads/audience-insights';

const base: AudienceMetrics = {
  audienceId: 'a1',
  audienceName: 'Purchasers',
  type: 'custom',
  platform: 'meta',
  size: 120000,
  impressions: 500000,
  clicks: 6000,
  conversions: 450,
  adSpend: 12000,
  revenue: 72000,
};

describe('analyzeAudiencePerformance', () => {
  it('computes rates and performance score', () => {
    const perf = analyzeAudiencePerformance(base);
    expect(perf.ctr).toBeGreaterThan(0);
    expect(perf.roas).toBeGreaterThan(0);
    expect(perf.performanceScore).toBeGreaterThan(0);
  });
});

describe('compareAudiences', () => {
  it('identifies top and worst performers', () => {
    const a = analyzeAudiencePerformance(base);
    const b = analyzeAudiencePerformance({ ...base, audienceId: 'a2', audienceName: 'Low ROAS', revenue: 12000 });
    const cmp = compareAudiences([a, b]);
    expect(cmp.topPerformer.audienceName).toBe('Purchasers');
    expect(cmp.worstPerformer.audienceName).toBe('Low ROAS');
    expect(cmp.averageRoas).toBeGreaterThan(0);
  });
});

describe('recommendLookalikeAudience', () => {
  it('returns LLA recommendation scaled by similarity', () => {
    const perf = analyzeAudiencePerformance(base);
    const rec = recommendLookalikeAudience(perf, 3);
    expect(rec.estimatedSize).toBeGreaterThan(perf.size);
    expect(rec.estimatedPerformance.expectedRoas).toBeLessThanOrEqual(perf.roas);
  });
});

describe('detectAudienceOverlap', () => {
  it('computes overlap percent and recommendation', () => {
    const ov = detectAudienceOverlap(100000, 60000, 30000, 'A', 'B');
    expect(ov.overlapPercent).toBeGreaterThan(0);
    expect(ov.recommendation.length).toBeGreaterThan(0);
  });
});

