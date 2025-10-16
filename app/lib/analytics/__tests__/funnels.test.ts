/**
 * Funnel Edge Case Tests
 */

import { describe, it, expect } from 'vitest';
import { identifyDropOffPoints, calculateOptimizationOpportunities } from '../funnels.ts';
import type { FunnelData } from '../funnels.ts';

describe('Funnel Analysis Edge Cases', () => {
  const mockFunnel: FunnelData = {
    name: 'Test Funnel',
    steps: [
      { name: 'Step 1', eventName: 'step1', users: 1000, dropOffRate: 0, conversionRate: 100, avgTimeToNext: 0 },
      { name: 'Step 2', eventName: 'step2', users: 500, dropOffRate: 50, conversionRate: 50, avgTimeToNext: 0 },
      { name: 'Step 3', eventName: 'step3', users: 100, dropOffRate: 80, conversionRate: 10, avgTimeToNext: 0 },
    ],
    totalUsers: 1000,
    completionRate: 10,
    avgCompletionTime: 0,
    period: { start: '2025-01-01', end: '2025-01-31' },
  };

  describe('identifyDropOffPoints', () => {
    it('should identify drop-off points correctly', () => {
      const dropOffs = identifyDropOffPoints(mockFunnel);
      expect(dropOffs).toHaveLength(2);
      expect(dropOffs[0].dropOffRate).toBe(80); // Biggest drop-off
      expect(dropOffs[1].dropOffRate).toBe(50);
    });

    it('should handle empty funnel', () => {
      const emptyFunnel: FunnelData = {
        ...mockFunnel,
        steps: [],
      };
      const dropOffs = identifyDropOffPoints(emptyFunnel);
      expect(dropOffs).toHaveLength(0);
    });

    it('should handle single step funnel', () => {
      const singleStepFunnel: FunnelData = {
        ...mockFunnel,
        steps: [mockFunnel.steps[0]],
      };
      const dropOffs = identifyDropOffPoints(singleStepFunnel);
      expect(dropOffs).toHaveLength(0);
    });
  });

  describe('calculateOptimizationOpportunities', () => {
    it('should prioritize high drop-off rates', () => {
      const opportunities = calculateOptimizationOpportunities(mockFunnel);
      expect(opportunities[0].priority).toBe('high'); // 80% drop-off
      expect(opportunities[1].priority).toBe('medium'); // 50% drop-off
    });

    it('should calculate potential gain', () => {
      const opportunities = calculateOptimizationOpportunities(mockFunnel);
      expect(opportunities[0].potentialGain).toBe(400); // 500 - 100
      expect(opportunities[1].potentialGain).toBe(500); // 1000 - 500
    });

    it('should provide recommendations', () => {
      const opportunities = calculateOptimizationOpportunities(mockFunnel);
      opportunities.forEach(opp => {
        expect(opp.recommendation).toBeTruthy();
        expect(opp.recommendation.length).toBeGreaterThan(0);
      });
    });
  });
});

