/**
 * Unit Tests: Budget Pacing
 */
import { describe, it, expect } from 'vitest';
import { calculateBudgetPacing, getCampaignsRequiringAttention, type BudgetConfig } from '../../app/lib/ads/budget-pacing';

function makeConfig(overrides: Partial<BudgetConfig> = {}): BudgetConfig {
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), 1);
  const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const toDate = (d: Date) => d.toISOString().split('T')[0];
  return {
    campaignId: 'c1',
    campaignName: 'Test Campaign',
    platform: 'meta',
    totalBudget: 3000,
    period: 'monthly',
    startDate: toDate(start),
    endDate: toDate(end),
    ...overrides,
  };
}

describe('calculateBudgetPacing', () => {
  it('computes underspending when percentSpent << percentElapsed', () => {
    const config = makeConfig();
    const pacing = calculateBudgetPacing(config, /* currentSpend */ 100);
    expect(pacing.pacingStatus === 'underspending' || pacing.pacingPercent < -5).toBeTruthy();
    expect(pacing.targetSpend).toBeGreaterThan(pacing.currentSpend);
  });

  it('marks depleted when remaining budget <= 0', () => {
    const config = makeConfig({ totalBudget: 1000 });
    const pacing = calculateBudgetPacing(config, /* currentSpend */ 1200);
    expect(pacing.pacingStatus).toBe('depleted');
    expect(pacing.remainingBudget).toBeLessThanOrEqual(0);
  });
});

describe('getCampaignsRequiringAttention', () => {
  it('returns overspending or depleted campaigns sorted by magnitude', () => {
    const base = makeConfig({ campaignId: 'c-base' });
    const under = calculateBudgetPacing({ ...base, campaignId: 'c-under' }, 10);
    const over = calculateBudgetPacing({ ...base, campaignId: 'c-over' }, 5000);
    const depleted = calculateBudgetPacing({ ...base, campaignId: 'c-depleted', totalBudget: 1000 }, 2000);

    const needs = getCampaignsRequiringAttention([under, over, depleted]);
    expect(needs.find(n => n.config.campaignId === 'c-over')).toBeTruthy();
    expect(needs.find(n => n.config.campaignId === 'c-depleted')).toBeTruthy();
    // Should not include underspending in attention list
    expect(needs.find(n => n.config.campaignId === 'c-under')).toBeFalsy();
  });
});

