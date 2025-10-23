/**
 * AI Optimizer Tests
 * 
 * ADS-005: Tests for AI-powered ad optimization features
 */

import { describe, it, expect } from 'vitest';
import {
  generateBidAdjustmentRecommendations,
  generateAudienceTargetingRecommendations,
  generateBudgetAllocationRecommendations,
  generateAIOptimizationRecommendations,
  DEFAULT_AI_OPTIMIZER_CONFIG,
} from '~/lib/ads/ai-optimizer';
import type { CampaignSummary, CampaignPerformance } from '~/services/ads/types';

describe('AI Optimizer', () => {
  const mockCampaigns: CampaignSummary[] = [
    {
      id: 'campaign-1',
      name: 'High Performer',
      status: 'ENABLED',
      impressions: 10000,
      clicks: 500,
      ctr: 0.05,
      costCents: 50000,
      conversions: 50,
      roas: 4.0,
    },
    {
      id: 'campaign-2',
      name: 'Low Performer',
      status: 'ENABLED',
      impressions: 5000,
      clicks: 50,
      ctr: 0.01,
      costCents: 10000,
      conversions: 5,
      roas: 0.8,
    },
    {
      id: 'campaign-3',
      name: 'Medium Performer',
      status: 'ENABLED',
      impressions: 8000,
      clicks: 200,
      ctr: 0.025,
      costCents: 30000,
      conversions: 20,
      roas: 2.5,
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
      dateRange: '2025-10-01 to 2025-10-23',
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
      dateRange: '2025-10-01 to 2025-10-23',
    },
    {
      campaignId: 'campaign-3',
      campaignName: 'Medium Performer',
      impressions: 8000,
      clicks: 200,
      costCents: 30000,
      conversions: 20,
      revenueCents: 75000,
      ctr: 0.025,
      avgCpcCents: 150,
      customerId: 'customer-1',
      dateRange: '2025-10-01 to 2025-10-23',
    },
  ];

  describe('generateBidAdjustmentRecommendations', () => {
    it('should recommend bid increase for high ROAS campaigns', () => {
      const recommendations = generateBidAdjustmentRecommendations(
        mockCampaigns,
        mockPerformances,
        DEFAULT_AI_OPTIMIZER_CONFIG
      );

      const highPerformerRec = recommendations.find(r => r.campaignId === 'campaign-1');
      expect(highPerformerRec).toBeDefined();
      expect(highPerformerRec!.adjustment).toBeGreaterThan(0);
      expect(highPerformerRec!.confidence).toBeGreaterThan(0.7);
    });

    it('should recommend bid decrease for low ROAS campaigns', () => {
      const recommendations = generateBidAdjustmentRecommendations(
        mockCampaigns,
        mockPerformances,
        DEFAULT_AI_OPTIMIZER_CONFIG
      );

      const lowPerformerRec = recommendations.find(r => r.campaignId === 'campaign-2');
      expect(lowPerformerRec).toBeDefined();
      expect(lowPerformerRec!.adjustment).toBeLessThan(0);
      expect(lowPerformerRec!.confidence).toBeGreaterThan(0.7);
    });

    it('should not exceed max adjustment percentage', () => {
      const recommendations = generateBidAdjustmentRecommendations(
        mockCampaigns,
        mockPerformances,
        DEFAULT_AI_OPTIMIZER_CONFIG
      );

      recommendations.forEach(rec => {
        expect(Math.abs(rec.adjustment)).toBeLessThanOrEqual(
          DEFAULT_AI_OPTIMIZER_CONFIG.bidAdjustment.maxAdjustmentPercent
        );
      });
    });

    it('should only recommend when confidence meets threshold', () => {
      const recommendations = generateBidAdjustmentRecommendations(
        mockCampaigns,
        mockPerformances,
        DEFAULT_AI_OPTIMIZER_CONFIG
      );

      recommendations.forEach(rec => {
        expect(rec.confidence).toBeGreaterThanOrEqual(
          DEFAULT_AI_OPTIMIZER_CONFIG.bidAdjustment.minConfidence
        );
      });
    });

    it('should sort recommendations by confidence', () => {
      const recommendations = generateBidAdjustmentRecommendations(
        mockCampaigns,
        mockPerformances,
        DEFAULT_AI_OPTIMIZER_CONFIG
      );

      for (let i = 1; i < recommendations.length; i++) {
        expect(recommendations[i - 1].confidence).toBeGreaterThanOrEqual(
          recommendations[i].confidence
        );
      }
    });
  });

  describe('generateAudienceTargetingRecommendations', () => {
    it('should generate recommendations for high-performing campaigns', () => {
      const recommendations = generateAudienceTargetingRecommendations(
        mockCampaigns,
        mockPerformances,
        DEFAULT_AI_OPTIMIZER_CONFIG
      );

      expect(recommendations.length).toBeGreaterThan(0);
      const highPerformerRec = recommendations.find(r => r.campaignId === 'campaign-1');
      expect(highPerformerRec).toBeDefined();
    });

    it('should include audience segment details', () => {
      const recommendations = generateAudienceTargetingRecommendations(
        mockCampaigns,
        mockPerformances,
        DEFAULT_AI_OPTIMIZER_CONFIG
      );

      recommendations.forEach(rec => {
        expect(rec.audienceSegment).toBeDefined();
        expect(rec.audienceSegment.interests).toBeDefined();
        expect(rec.audienceSegment.behaviors).toBeDefined();
      });
    });

    it('should provide expected performance metrics', () => {
      const recommendations = generateAudienceTargetingRecommendations(
        mockCampaigns,
        mockPerformances,
        DEFAULT_AI_OPTIMIZER_CONFIG
      );

      recommendations.forEach(rec => {
        expect(rec.expectedPerformance.estimatedCTR).toBeGreaterThan(0);
        expect(rec.expectedPerformance.estimatedConversionRate).toBeGreaterThan(0);
        expect(rec.expectedPerformance.estimatedROAS).toBeGreaterThan(0);
      });
    });

    it('should respect max audiences limit', () => {
      const recommendations = generateAudienceTargetingRecommendations(
        mockCampaigns,
        mockPerformances,
        DEFAULT_AI_OPTIMIZER_CONFIG
      );

      expect(recommendations.length).toBeLessThanOrEqual(
        DEFAULT_AI_OPTIMIZER_CONFIG.audienceTargeting.maxAudiences
      );
    });
  });

  describe('generateBudgetAllocationRecommendations', () => {
    const totalBudget = 100000; // $1000

    it('should allocate budget based on performance scores', () => {
      const recommendation = generateBudgetAllocationRecommendations(
        mockCampaigns,
        totalBudget,
        DEFAULT_AI_OPTIMIZER_CONFIG
      );

      expect(recommendation.allocations.length).toBe(mockCampaigns.length);
      
      // High performer should get more budget
      const highPerformerAlloc = recommendation.allocations.find(a => a.campaignId === 'campaign-1');
      const lowPerformerAlloc = recommendation.allocations.find(a => a.campaignId === 'campaign-2');
      
      expect(highPerformerAlloc!.recommendedBudget).toBeGreaterThan(
        lowPerformerAlloc!.recommendedBudget
      );
    });

    it('should respect minimum budget per campaign', () => {
      const recommendation = generateBudgetAllocationRecommendations(
        mockCampaigns,
        totalBudget,
        DEFAULT_AI_OPTIMIZER_CONFIG
      );

      recommendation.allocations.forEach(alloc => {
        expect(alloc.recommendedBudget).toBeGreaterThanOrEqual(
          DEFAULT_AI_OPTIMIZER_CONFIG.budgetAllocation.minBudgetPerCampaign
        );
      });
    });

    it('should provide projected total ROAS', () => {
      const recommendation = generateBudgetAllocationRecommendations(
        mockCampaigns,
        totalBudget,
        DEFAULT_AI_OPTIMIZER_CONFIG
      );

      expect(recommendation.projectedTotalROAS).toBeGreaterThan(0);
    });

    it('should include reasoning for each allocation', () => {
      const recommendation = generateBudgetAllocationRecommendations(
        mockCampaigns,
        totalBudget,
        DEFAULT_AI_OPTIMIZER_CONFIG
      );

      recommendation.allocations.forEach(alloc => {
        expect(alloc.reasoning).toBeDefined();
        expect(alloc.reasoning.length).toBeGreaterThan(0);
      });
    });
  });

  describe('generateAIOptimizationRecommendations', () => {
    const totalBudget = 100000;

    it('should generate comprehensive recommendations', () => {
      const result = generateAIOptimizationRecommendations(
        mockCampaigns,
        mockPerformances,
        totalBudget,
        DEFAULT_AI_OPTIMIZER_CONFIG
      );

      expect(result.bidAdjustments).toBeDefined();
      expect(result.audienceTargeting).toBeDefined();
      expect(result.budgetAllocation).toBeDefined();
      expect(result.summary).toBeDefined();
    });

    it('should calculate summary metrics correctly', () => {
      const result = generateAIOptimizationRecommendations(
        mockCampaigns,
        mockPerformances,
        totalBudget,
        DEFAULT_AI_OPTIMIZER_CONFIG
      );

      expect(result.summary.totalRecommendations).toBeGreaterThan(0);
      expect(result.summary.confidence).toBeGreaterThan(0);
      expect(result.summary.confidence).toBeLessThanOrEqual(1);
    });

    it('should identify high priority recommendations', () => {
      const result = generateAIOptimizationRecommendations(
        mockCampaigns,
        mockPerformances,
        totalBudget,
        DEFAULT_AI_OPTIMIZER_CONFIG
      );

      expect(result.summary.highPriorityCount).toBeGreaterThanOrEqual(0);
    });
  });
});

