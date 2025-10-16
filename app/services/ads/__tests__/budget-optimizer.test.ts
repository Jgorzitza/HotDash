/**
 * Unit Tests for Budget Optimizer
 * 
 * Purpose: Test budget allocation optimization functions
 * Owner: ads agent
 * Date: 2025-10-16
 */

import { describe, it, expect } from 'vitest';
import {
  optimizeBudgetAllocation,
  recommendBudgetScaling,
  type BudgetConstraint,
} from '../budget-optimizer';
import type { CampaignMetrics } from '../../../lib/ads/tracking';

describe('optimizeBudgetAllocation', () => {
  const mockCampaigns: CampaignMetrics[] = [
    {
      campaignId: 'high_performer',
      campaignName: 'High ROAS Campaign',
      platform: 'meta',
      status: 'active',
      adSpend: 1000,
      revenue: 5000,
      impressions: 50000,
      clicks: 500,
      conversions: 100,
      dateStart: '2025-10-01',
      dateEnd: '2025-10-15',
    },
    {
      campaignId: 'low_performer',
      campaignName: 'Low ROAS Campaign',
      platform: 'google',
      status: 'active',
      adSpend: 1000,
      revenue: 1500,
      impressions: 30000,
      clicks: 300,
      conversions: 30,
      dateStart: '2025-10-01',
      dateEnd: '2025-10-15',
    },
  ];

  it('allocates more budget to high-performing campaigns', () => {
    const constraint: BudgetConstraint = {
      totalBudget: 2000,
    };

    const result = optimizeBudgetAllocation(mockCampaigns, constraint);
    
    const highPerformer = result.recommendedAllocation.byCampaign.find(
      c => c.campaignId === 'high_performer'
    );
    const lowPerformer = result.recommendedAllocation.byCampaign.find(
      c => c.campaignId === 'low_performer'
    );

    expect(highPerformer!.recommendedBudget).toBeGreaterThan(lowPerformer!.recommendedBudget);
  });

  it('respects total budget constraint', () => {
    const constraint: BudgetConstraint = {
      totalBudget: 3000,
    };

    const result = optimizeBudgetAllocation(mockCampaigns, constraint);
    
    const totalRecommended = result.recommendedAllocation.byCampaign.reduce(
      (sum, c) => sum + c.recommendedBudget,
      0
    );

    expect(totalRecommended).toBeCloseTo(3000, 1);
  });

  it('respects minimum budget per campaign', () => {
    const constraint: BudgetConstraint = {
      totalBudget: 2000,
      minBudgetPerCampaign: 500,
    };

    const result = optimizeBudgetAllocation(mockCampaigns, constraint);
    
    for (const campaign of result.recommendedAllocation.byCampaign) {
      expect(campaign.recommendedBudget).toBeGreaterThanOrEqual(500);
    }
  });

  it('projects ROAS improvement', () => {
    const constraint: BudgetConstraint = {
      totalBudget: 2000,
    };

    const result = optimizeBudgetAllocation(mockCampaigns, constraint);
    
    expect(result.expectedImpact.projectedTotalRoas).toBeGreaterThan(
      result.expectedImpact.currentTotalRoas
    );
    expect(result.expectedImpact.roasImprovement).toBeGreaterThan(0);
  });

  it('throws error for empty campaign list', () => {
    const constraint: BudgetConstraint = {
      totalBudget: 2000,
    };

    expect(() => optimizeBudgetAllocation([], constraint)).toThrow(
      'Cannot optimize budget with no campaigns'
    );
  });
});

describe('recommendBudgetScaling', () => {
  it('recommends increase for high ROAS', () => {
    const result = recommendBudgetScaling(1000, 5.0, 3.0);
    
    expect(result.action).toBe('increase');
    expect(result.recommendedBudget).toBeGreaterThan(1000);
    expect(result.budgetChange).toBeGreaterThan(0);
  });

  it('recommends decrease for low ROAS', () => {
    const result = recommendBudgetScaling(1000, 1.0, 3.0);
    
    expect(result.action).toBe('decrease');
    expect(result.recommendedBudget).toBeLessThan(1000);
    expect(result.budgetChange).toBeLessThan(0);
  });

  it('recommends maintain for moderate ROAS', () => {
    const result = recommendBudgetScaling(1000, 2.5, 3.0);
    
    expect(result.action).toBe('maintain');
    expect(result.recommendedBudget).toBe(1000);
    expect(result.budgetChange).toBe(0);
  });

  it('scales aggressively for excellent ROAS', () => {
    const result = recommendBudgetScaling(1000, 6.0, 3.0);
    
    expect(result.action).toBe('increase');
    expect(result.recommendedBudget).toBe(1500);
    expect(result.budgetChangePercent).toBe(50);
  });

  it('reduces significantly for very low ROAS', () => {
    const result = recommendBudgetScaling(1000, 0.5, 3.0);
    
    expect(result.action).toBe('decrease');
    expect(result.recommendedBudget).toBe(500);
    expect(result.budgetChangePercent).toBe(-50);
  });

  it('provides reasoning for recommendation', () => {
    const result = recommendBudgetScaling(1000, 5.0, 3.0);
    
    expect(result.reasoning).toContain('ROAS');
    expect(result.reasoning).toContain('scale');
  });
});

