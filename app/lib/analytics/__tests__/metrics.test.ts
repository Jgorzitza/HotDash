/**
 * Unit Tests for Analytics Metrics
 * 
 * Test metric calculations and data transformations.
 */

import { describe, it, expect } from 'vitest';

describe('Analytics Metrics Calculations', () => {
  describe('Percentage Change', () => {
    it('should calculate positive percentage change', () => {
      const current = 150;
      const previous = 100;
      const change = ((current - previous) / previous) * 100;
      expect(change).toBe(50);
    });

    it('should calculate negative percentage change', () => {
      const current = 75;
      const previous = 100;
      const change = ((current - previous) / previous) * 100;
      expect(change).toBe(-25);
    });

    it('should handle zero previous value', () => {
      const current = 100;
      const previous = 0;
      const change = previous === 0 ? (current > 0 ? 100 : 0) : ((current - previous) / previous) * 100;
      expect(change).toBe(100);
    });
  });

  describe('Conversion Rate', () => {
    it('should calculate conversion rate correctly', () => {
      const conversions = 50;
      const sessions = 1000;
      const rate = (conversions / sessions) * 100;
      expect(rate).toBe(5);
    });

    it('should handle zero sessions', () => {
      const conversions = 50;
      const sessions = 0;
      const rate = sessions > 0 ? (conversions / sessions) * 100 : 0;
      expect(rate).toBe(0);
    });
  });

  describe('Average Order Value', () => {
    it('should calculate AOV correctly', () => {
      const revenue = 10000;
      const transactions = 50;
      const aov = revenue / transactions;
      expect(aov).toBe(200);
    });

    it('should handle zero transactions', () => {
      const revenue = 10000;
      const transactions = 0;
      const aov = transactions > 0 ? revenue / transactions : 0;
      expect(aov).toBe(0);
    });
  });

  describe('Z-Score Calculation', () => {
    it('should calculate z-score correctly', () => {
      const value = 150;
      const mean = 100;
      const stdDev = 20;
      const zScore = (value - mean) / stdDev;
      expect(zScore).toBe(2.5);
    });

    it('should handle zero standard deviation', () => {
      const value = 100;
      const mean = 100;
      const stdDev = 0;
      const zScore = stdDev > 0 ? (value - mean) / stdDev : 0;
      expect(zScore).toBe(0);
    });
  });

  describe('Drop-off Rate', () => {
    it('should calculate drop-off rate correctly', () => {
      const previousStep = 1000;
      const currentStep = 750;
      const dropOff = ((previousStep - currentStep) / previousStep) * 100;
      expect(dropOff).toBe(25);
    });

    it('should handle zero previous step', () => {
      const previousStep = 0;
      const currentStep = 750;
      const dropOff = previousStep > 0 ? ((previousStep - currentStep) / previousStep) * 100 : 0;
      expect(dropOff).toBe(0);
    });
  });
});

