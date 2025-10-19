import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createDirectGaClient } from "../../app/services/ga/directClient";
import type { DateRange } from "../../app/services/ga/client";

// Mock the Google Analytics client
vi.mock("@google-analytics/data", () => {
  return {
    BetaAnalyticsDataClient: vi.fn(() => ({
      runReport: vi.fn(),
    })),
  };
});

describe("DirectGAClient", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.clearAllMocks();
  });

  describe("createDirectGaClient", () => {
    it("should throw error if propertyId is not provided", () => {
      process.env.GOOGLE_APPLICATION_CREDENTIALS = "/path/to/creds.json";

      expect(() => createDirectGaClient("")).toThrow(
        "GA_PROPERTY_ID environment variable required",
      );
    });

    it("should throw error if GOOGLE_APPLICATION_CREDENTIALS is not set", () => {
      delete process.env.GOOGLE_APPLICATION_CREDENTIALS;

      expect(() => createDirectGaClient("12345")).toThrow(
        "GOOGLE_APPLICATION_CREDENTIALS environment variable required",
      );
    });

    it("should create client successfully with valid configuration", () => {
      process.env.GOOGLE_APPLICATION_CREDENTIALS = "/path/to/creds.json";

      const client = createDirectGaClient("12345");

      expect(client).toBeDefined();
      expect(client.fetchLandingPageSessions).toBeDefined();
    });
  });

  describe("fetchLandingPageSessions", () => {
    const mockPropertyId = "123456789";
    const mockDateRange: DateRange = {
      start: "2025-10-01",
      end: "2025-10-07",
    };

    beforeEach(() => {
      process.env.GOOGLE_APPLICATION_CREDENTIALS = "/path/to/creds.json";
    });

    it("should fetch and transform GA sessions data correctly", async () => {
      const { BetaAnalyticsDataClient } = await import(
        "@google-analytics/data"
      );
      const mockRunReport = vi.fn().mockResolvedValue([
        {
          rows: [
            {
              dimensionValues: [{ value: "/collections/new-arrivals" }],
              metricValues: [{ value: "420" }],
            },
            {
              dimensionValues: [{ value: "/products/featured-widget" }],
              metricValues: [{ value: "310" }],
            },
            {
              dimensionValues: [{ value: "/blogs/news/october-launch" }],
              metricValues: [{ value: "120" }],
            },
          ],
        },
      ]);

      // @ts-expect-error - mocking
      BetaAnalyticsDataClient.mockImplementation(() => ({
        runReport: mockRunReport,
      }));

      const client = createDirectGaClient(mockPropertyId);
      const sessions = await client.fetchLandingPageSessions(mockDateRange);

      expect(sessions).toHaveLength(3);
      expect(sessions[0]).toEqual({
        landingPage: "/collections/new-arrivals",
        sessions: 420,
        wowDelta: 0,
        evidenceUrl: undefined,
      });
      expect(sessions[1]).toEqual({
        landingPage: "/products/featured-widget",
        sessions: 310,
        wowDelta: 0,
        evidenceUrl: undefined,
      });
      expect(sessions[2]).toEqual({
        landingPage: "/blogs/news/october-launch",
        sessions: 120,
        wowDelta: 0,
        evidenceUrl: undefined,
      });

      expect(mockRunReport).toHaveBeenCalledWith({
        property: `properties/${mockPropertyId}`,
        dateRanges: [
          {
            startDate: mockDateRange.start,
            endDate: mockDateRange.end,
          },
        ],
        dimensions: [{ name: "pagePath" }],
        metrics: [{ name: "sessions" }],
        orderBys: [
          {
            metric: { metricName: "sessions" },
            desc: true,
          },
        ],
        limit: 100,
      });
    });

    it("should handle empty response from GA API", async () => {
      const { BetaAnalyticsDataClient } = await import(
        "@google-analytics/data"
      );
      const mockRunReport = vi.fn().mockResolvedValue([{ rows: [] }]);

      // @ts-expect-error - mocking
      BetaAnalyticsDataClient.mockImplementation(() => ({
        runReport: mockRunReport,
      }));

      const client = createDirectGaClient(mockPropertyId);
      const sessions = await client.fetchLandingPageSessions(mockDateRange);

      expect(sessions).toEqual([]);
    });

    it("should handle missing dimensionValues gracefully", async () => {
      const { BetaAnalyticsDataClient } = await import(
        "@google-analytics/data"
      );
      const mockRunReport = vi.fn().mockResolvedValue([
        {
          rows: [
            {
              dimensionValues: [],
              metricValues: [{ value: "100" }],
            },
          ],
        },
      ]);

      // @ts-expect-error - mocking
      BetaAnalyticsDataClient.mockImplementation(() => ({
        runReport: mockRunReport,
      }));

      const client = createDirectGaClient(mockPropertyId);
      const sessions = await client.fetchLandingPageSessions(mockDateRange);

      expect(sessions).toHaveLength(1);
      expect(sessions[0]).toEqual({
        landingPage: "",
        sessions: 100, // The metric value is still parsed correctly
        wowDelta: 0,
        evidenceUrl: undefined,
      });
    });

    it("should handle missing metricValues gracefully", async () => {
      const { BetaAnalyticsDataClient } = await import(
        "@google-analytics/data"
      );
      const mockRunReport = vi.fn().mockResolvedValue([
        {
          rows: [
            {
              dimensionValues: [{ value: "/test-page" }],
              metricValues: [],
            },
          ],
        },
      ]);

      // @ts-expect-error - mocking
      BetaAnalyticsDataClient.mockImplementation(() => ({
        runReport: mockRunReport,
      }));

      const client = createDirectGaClient(mockPropertyId);
      const sessions = await client.fetchLandingPageSessions(mockDateRange);

      expect(sessions).toHaveLength(1);
      expect(sessions[0]).toEqual({
        landingPage: "/test-page",
        sessions: 0,
        wowDelta: 0,
        evidenceUrl: undefined,
      });
    });

    it("should throw error with context when API call fails", async () => {
      const { BetaAnalyticsDataClient } = await import(
        "@google-analytics/data"
      );
      const mockError = new Error("API quota exceeded");
      const mockRunReport = vi.fn().mockRejectedValue(mockError);

      // @ts-expect-error - mocking
      BetaAnalyticsDataClient.mockImplementation(() => ({
        runReport: mockRunReport,
      }));

      const client = createDirectGaClient(mockPropertyId);

      await expect(
        client.fetchLandingPageSessions(mockDateRange),
      ).rejects.toThrow(
        `Google Analytics API request failed: API quota exceeded. ` +
          `Property ID: ${mockPropertyId}, Date range: ${mockDateRange.start} to ${mockDateRange.end}`,
      );
    });

    it("should handle non-numeric session values", async () => {
      const { BetaAnalyticsDataClient } = await import(
        "@google-analytics/data"
      );
      const mockRunReport = vi.fn().mockResolvedValue([
        {
          rows: [
            {
              dimensionValues: [{ value: "/page1" }],
              metricValues: [{ value: "invalid" }],
            },
          ],
        },
      ]);

      // @ts-expect-error - mocking
      BetaAnalyticsDataClient.mockImplementation(() => ({
        runReport: mockRunReport,
      }));

      const client = createDirectGaClient(mockPropertyId);
      const sessions = await client.fetchLandingPageSessions(mockDateRange);

      expect(sessions).toHaveLength(1);
      expect(sessions[0].sessions).toBeNaN(); // parseInt on invalid string returns NaN
    });

    it("should pass correct date range format to API", async () => {
      const { BetaAnalyticsDataClient } = await import(
        "@google-analytics/data"
      );
      const mockRunReport = vi.fn().mockResolvedValue([{ rows: [] }]);

      // @ts-expect-error - mocking
      BetaAnalyticsDataClient.mockImplementation(() => ({
        runReport: mockRunReport,
      }));

      const client = createDirectGaClient(mockPropertyId);
      const customRange: DateRange = {
        start: "2025-09-01",
        end: "2025-09-30",
      };

      await client.fetchLandingPageSessions(customRange);

      expect(mockRunReport).toHaveBeenCalledWith(
        expect.objectContaining({
          dateRanges: [
            {
              startDate: "2025-09-01",
              endDate: "2025-09-30",
            },
          ],
        }),
      );
    });
  });
});
