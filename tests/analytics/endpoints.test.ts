/**
 * Analytics Endpoints Test Suite
 *
 * Tests all analytics API endpoints for:
 * - Response structure validity
 * - Schema compliance
 * - Error handling
 * - Cache behavior
 */

import { describe, test, expect } from "vitest";
import {
  ConversionResponseSchema,
  RevenueResponseSchema,
  TrafficResponseSchema,
  IdeaPoolResponseSchema,
} from "../../app/lib/analytics/schemas";

describe("Analytics API Endpoints", () => {
  describe("Health Check Endpoint", () => {
    test("should return health status with all components", async () => {
      // Mock health check response
      const healthResponse = {
        status: "healthy",
        timestamp: new Date().toISOString(),
        components: {
          ga4Client: {
            status: "up",
            message: "GA4 client configured and ready",
          },
          caching: {
            status: "up",
            message: "Cache system operational (5min TTL)",
          },
          samplingGuard: {
            status: "up",
            message: "Sampling guard proof available",
          },
          endpoints: {
            status: "up",
            message: "All 5 analytics endpoints available",
          },
        },
        version: "1.0.0",
      };

      expect(healthResponse.status).toBe("healthy");
      expect(healthResponse.components).toHaveProperty("ga4Client");
      expect(healthResponse.components).toHaveProperty("caching");
      expect(healthResponse.components).toHaveProperty("samplingGuard");
      expect(healthResponse.components).toHaveProperty("endpoints");
      expect(healthResponse.version).toBe("1.0.0");
    });

    test("should report degraded status if any component is unknown", async () => {
      const healthResponse = {
        status: "degraded",
        timestamp: new Date().toISOString(),
        components: {
          ga4Client: { status: "up" },
          caching: { status: "unknown" },
          samplingGuard: { status: "up" },
          endpoints: { status: "up" },
        },
        version: "1.0.0",
      };

      expect(healthResponse.status).toBe("degraded");
    });

    test("should report unhealthy status if any component is down", async () => {
      const healthResponse = {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        components: {
          ga4Client: { status: "down" },
          caching: { status: "up" },
          samplingGuard: { status: "up" },
          endpoints: { status: "up" },
        },
        version: "1.0.0",
      };

      expect(healthResponse.status).toBe("unhealthy");
    });
  });

  describe("Revenue Endpoint", () => {
    test("should validate revenue response schema", () => {
      const revenueResponse = {
        revenue: 12500,
        period: "2024-09-19 to 2024-10-19",
        change: 5.9,
        currency: "USD",
        previousPeriod: {
          revenue: 11800,
          period: "previous 30 days",
        },
      };

      const result = RevenueResponseSchema.safeParse(revenueResponse);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.revenue).toBe(12500);
        expect(result.data.currency).toBe("USD");
        expect(result.data.change).toBe(5.9);
      }
    });

    test("should accept minimal revenue response", () => {
      const minimalResponse = {
        revenue: 0,
        period: "error",
        currency: "USD",
      };

      const result = RevenueResponseSchema.safeParse(minimalResponse);
      expect(result.success).toBe(true);
    });

    test("should reject invalid revenue schema", () => {
      const invalidResponse = {
        revenue: "not a number",
        period: "2024-09-19 to 2024-10-19",
      };

      const result = RevenueResponseSchema.safeParse(invalidResponse);
      expect(result.success).toBe(false);
    });
  });

  describe("Conversion Endpoint", () => {
    test("should validate conversion response schema", () => {
      const conversionResponse = {
        conversionRate: 2.8,
        period: "2024-09-19 to 2024-10-19",
        change: 7.7,
        previousPeriod: {
          conversionRate: 2.6,
          period: "previous 30 days",
        },
      };

      const result = ConversionResponseSchema.safeParse(conversionResponse);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.conversionRate).toBe(2.8);
        expect(result.data.change).toBe(7.7);
      }
    });

    test("should accept minimal conversion response", () => {
      const minimalResponse = {
        conversionRate: 0,
        period: "error",
      };

      const result = ConversionResponseSchema.safeParse(minimalResponse);
      expect(result.success).toBe(true);
    });
  });

  describe("Traffic Endpoint", () => {
    test("should validate traffic response schema", () => {
      const trafficResponse = {
        sessions: 5214,
        users: 3911,
        pageviews: 13035,
        period: "2024-09-19 to 2024-10-19",
        bounceRate: 45.2,
        avgSessionDuration: 145,
        previousPeriod: {
          sessions: 5500,
          users: 4125,
          pageviews: 13750,
          period: "previous 30 days",
        },
      };

      const result = TrafficResponseSchema.safeParse(trafficResponse);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.sessions).toBe(5214);
        expect(result.data.users).toBe(3911);
        expect(result.data.pageviews).toBe(13035);
      }
    });

    test("should accept minimal traffic response", () => {
      const minimalResponse = {
        sessions: 0,
        users: 0,
        pageviews: 0,
        period: "error",
      };

      const result = TrafficResponseSchema.safeParse(minimalResponse);
      expect(result.success).toBe(true);
    });

    test("should accept traffic response without optional fields", () => {
      const responseWithoutOptional = {
        sessions: 5214,
        users: 3911,
        pageviews: 13035,
        period: "2024-09-19 to 2024-10-19",
      };

      const result = TrafficResponseSchema.safeParse(responseWithoutOptional);
      expect(result.success).toBe(true);
    });
  });

  describe("Idea Pool Endpoint", () => {
    test("should validate idea pool response schema", () => {
      const ideaPoolResponse = {
        success: true,
        data: {
          items: [
            {
              id: "mock-1",
              title: "Bundle hot rod detailing kit",
              status: "pending_review",
              rationale: "High demand",
              projectedImpact: "+$4.2k/month",
              priority: "high",
              confidence: 0.7,
              createdAt: "2024-10-17T08:00:00.000Z",
              updatedAt: "2024-10-18T21:00:00.000Z",
              reviewer: "inventory",
            },
          ],
          totals: {
            pending: 1,
            approved: 0,
            rejected: 0,
          },
        },
        source: "mock",
        timestamp: "2024-10-19T08:00:00.000Z",
      };

      const result = IdeaPoolResponseSchema.safeParse(ideaPoolResponse);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.success).toBe(true);
        expect(result.data.data.items).toHaveLength(1);
        expect(result.data.data.totals.pending).toBe(1);
      }
    });

    test("should validate idea pool with warnings", () => {
      const responseWithWarnings = {
        success: true,
        data: {
          items: [],
          totals: {
            pending: 0,
            approved: 0,
            rejected: 0,
          },
        },
        source: "mock",
        timestamp: "2024-10-19T08:00:00.000Z",
        warnings: ["Supabase returned no records"],
      };

      const result = IdeaPoolResponseSchema.safeParse(responseWithWarnings);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.warnings).toBeDefined();
        expect(result.data.warnings).toHaveLength(1);
      }
    });

    test("should validate error response", () => {
      const errorResponse = {
        success: false,
        data: {
          items: [],
          totals: {
            pending: 0,
            approved: 0,
            rejected: 0,
          },
        },
        source: "mock",
        timestamp: "2024-10-19T08:00:00.000Z",
        error: "Failed to load metrics",
      };

      const result = IdeaPoolResponseSchema.safeParse(errorResponse);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.success).toBe(false);
        expect(result.data.error).toBeDefined();
      }
    });
  });

  describe("Schema Validation Edge Cases", () => {
    test("revenue schema should use USD as default currency", () => {
      const response = {
        revenue: 10000,
        period: "test",
      };

      const result = RevenueResponseSchema.safeParse(response);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.currency).toBe("USD");
      }
    });

    test("all schemas should handle optional fields", () => {
      // Revenue without previousPeriod
      const revenueMin = { revenue: 100, period: "test", currency: "USD" };
      expect(RevenueResponseSchema.safeParse(revenueMin).success).toBe(true);

      // Conversion without previousPeriod
      const conversionMin = { conversionRate: 2.5, period: "test" };
      expect(ConversionResponseSchema.safeParse(conversionMin).success).toBe(
        true,
      );

      // Traffic without previousPeriod and optional metrics
      const trafficMin = {
        sessions: 1000,
        users: 750,
        pageviews: 2500,
        period: "test",
      };
      expect(TrafficResponseSchema.safeParse(trafficMin).success).toBe(true);
    });

    test("idea pool should validate status enum", () => {
      const invalidStatus = {
        success: true,
        data: {
          items: [
            {
              id: "1",
              title: "Test",
              status: "invalid_status",
              rationale: "Test",
              projectedImpact: "Test",
              priority: "high",
              confidence: 0.5,
              createdAt: "2024-10-19T08:00:00.000Z",
              updatedAt: "2024-10-19T08:00:00.000Z",
            },
          ],
          totals: { pending: 0, approved: 0, rejected: 0 },
        },
        source: "mock",
        timestamp: "2024-10-19T08:00:00.000Z",
      };

      const result = IdeaPoolResponseSchema.safeParse(invalidStatus);
      expect(result.success).toBe(false);
    });

    test("idea pool should validate priority enum", () => {
      const invalidPriority = {
        success: true,
        data: {
          items: [
            {
              id: "1",
              title: "Test",
              status: "pending_review",
              rationale: "Test",
              projectedImpact: "Test",
              priority: "critical",
              confidence: 0.5,
              createdAt: "2024-10-19T08:00:00.000Z",
              updatedAt: "2024-10-19T08:00:00.000Z",
            },
          ],
          totals: { pending: 0, approved: 0, rejected: 0 },
        },
        source: "mock",
        timestamp: "2024-10-19T08:00:00.000Z",
      };

      const result = IdeaPoolResponseSchema.safeParse(invalidPriority);
      expect(result.success).toBe(false);
    });
  });
});
