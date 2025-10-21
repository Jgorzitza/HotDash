/**
 * Tests for WoW Variance Service
 * 
 * @see app/services/analytics/wow-variance.ts
 * @see docs/directions/analytics.md ANALYTICS-005
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { getWoWVariance } from "../../../../app/services/analytics/wow-variance";

// Mock Supabase client - simplified version for testing
let mockQueryResults: any[] = [];
let queryCallCount = 0;

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          eq: () => ({
            gte: () => ({
              lte: vi.fn(() => {
                const result = mockQueryResults[queryCallCount];
                queryCallCount++;
                return Promise.resolve(result);
              })
            })
          })
        })
      })
    })
  })),
}));

describe("WoW Variance Service", () => {
  const mockProject = "test-shop.myshopify.com";
  const mockSupabaseUrl = "https://test.supabase.co";
  const mockSupabaseKey = "test-key";

  beforeEach(() => {
    vi.clearAllMocks();
    mockQueryResults = [];
    queryCallCount = 0;
  });

  describe("getWoWVariance", () => {
    describe("Revenue metric", () => {
      it("should calculate positive variance when revenue increased", async () => {
        // Mock current week: $1000, previous week: $800
        mockQueryResults = [
          { data: [{ value: 1000 }], error: null }, // Current week
          { data: [{ value: 800 }], error: null }   // Previous week
        ];

        const result = await getWoWVariance(mockProject, 'revenue', mockSupabaseUrl, mockSupabaseKey);
        
        expect(result.current).toBe(1000);
        expect(result.previous).toBe(800);
        expect(result.variance).toBe(25); // (1000-800)/800 * 100 = 25%
        expect(result.trend).toBe('up');
      });

      it("should calculate negative variance when revenue decreased", async () => {
        // Mock current week: $600, previous week: $800
        mockQueryResults = [
          { data: [{ value: 600 }], error: null }, // Current week
          { data: [{ value: 800 }], error: null }  // Previous week
        ];

        const result = await getWoWVariance(mockProject, 'revenue', mockSupabaseUrl, mockSupabaseKey);
        
        expect(result.current).toBe(600);
        expect(result.previous).toBe(800);
        expect(result.variance).toBe(-25); // (600-800)/800 * 100 = -25%
        expect(result.trend).toBe('down');
      });

      it("should identify flat trend for small changes", async () => {
        // Mock current week: $820, previous week: $800 (2.5% change)
        mockQueryResults = [
          { data: [{ value: 820 }], error: null }, // Current week
          { data: [{ value: 800 }], error: null }  // Previous week
        ];

        const result = await getWoWVariance(mockProject, 'revenue', mockSupabaseUrl, mockSupabaseKey);
        
        expect(result.current).toBe(820);
        expect(result.previous).toBe(800);
        expect(result.variance).toBe(2.5);
        expect(result.trend).toBe('flat'); // Less than 5% threshold
      });

      it("should handle zero previous value gracefully", async () => {
        // Mock current week: $500, previous week: $0
        mockQueryResults = [
          { data: [{ value: 500 }], error: null }, // Current week
          { data: [], error: null }  // Previous week (no data)
        ];

        const result = await getWoWVariance(mockProject, 'revenue', mockSupabaseUrl, mockSupabaseKey);
        
        expect(result.current).toBe(500);
        expect(result.previous).toBe(0);
        expect(result.variance).toBe(100); // 100% increase from zero
        expect(result.trend).toBe('up');
      });

      it("should handle both values being zero", async () => {
        mockQueryResults = [
          { data: [], error: null }, // Current week
          { data: [], error: null }  // Previous week
        ];

        const result = await getWoWVariance(mockProject, 'revenue', mockSupabaseUrl, mockSupabaseKey);
        
        expect(result.current).toBe(0);
        expect(result.previous).toBe(0);
        expect(result.variance).toBe(0);
        expect(result.trend).toBe('flat');
      });
    });

    describe("Orders metric", () => {
      it("should sum orders correctly", async () => {
        // Mock current week: 50 orders, previous week: 40 orders
        mockQueryResults = [
          { data: [{ value: 30 }, { value: 20 }], error: null }, // Current: 50
          { data: [{ value: 25 }, { value: 15 }], error: null }  // Previous: 40
        ];

        const result = await getWoWVariance(mockProject, 'orders', mockSupabaseUrl, mockSupabaseKey);
        
        expect(result.current).toBe(50);
        expect(result.previous).toBe(40);
        expect(result.variance).toBe(25); // (50-40)/40 * 100 = 25%
        expect(result.trend).toBe('up');
      });
    });

    describe("Conversion metric", () => {
      it("should average conversion rates correctly", async () => {
        // Mock current week: avg 3%, previous week: avg 2.5%
        mockQueryResults = [
          { data: [{ value: 3 }, { value: 3 }], error: null }, // Current: avg 3
          { data: [{ value: 2.5 }, { value: 2.5 }], error: null }  // Previous: avg 2.5
        ];

        const result = await getWoWVariance(mockProject, 'conversion', mockSupabaseUrl, mockSupabaseKey);
        
        expect(result.current).toBe(3);
        expect(result.previous).toBe(2.5);
        expect(result.variance).toBe(20); // (3-2.5)/2.5 * 100 = 20%
        expect(result.trend).toBe('up');
      });
    });

    describe("Error handling", () => {
      it("should return fallback values on database error", async () => {
        mockQueryResults = [
          { data: null, error: new Error('Database error') },
          { data: null, error: new Error('Database error') }
        ];

        const result = await getWoWVariance(mockProject, 'revenue', mockSupabaseUrl, mockSupabaseKey);
        
        expect(result.current).toBe(0);
        expect(result.previous).toBe(0);
        expect(result.variance).toBe(0);
        expect(result.trend).toBe('flat');
      });
    });

    describe("Value extraction", () => {
      it("should handle numeric values", async () => {
        mockQueryResults = [
          { data: [{ value: 1000 }], error: null },
          { data: [{ value: 800 }], error: null }
        ];

        const result = await getWoWVariance(mockProject, 'revenue', mockSupabaseUrl, mockSupabaseKey);
        expect(result.current).toBe(1000);
      });

      it("should handle {amount: number} format", async () => {
        mockQueryResults = [
          { data: [{ value: { amount: 1000 } }], error: null },
          { data: [{ value: { amount: 800 } }], error: null }
        ];

        const result = await getWoWVariance(mockProject, 'revenue', mockSupabaseUrl, mockSupabaseKey);
        expect(result.current).toBe(1000);
      });

      it("should handle {value: number} format", async () => {
        mockQueryResults = [
          { data: [{ value: { value: 1000 } }], error: null },
          { data: [{ value: { value: 800 } }], error: null }
        ];

        const result = await getWoWVariance(mockProject, 'revenue', mockSupabaseUrl, mockSupabaseKey);
        expect(result.current).toBe(1000);
      });
    });
  });
});
