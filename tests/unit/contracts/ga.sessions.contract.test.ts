import { describe, test, expect } from "vitest";
import { createMockGaClient } from "../../../app/services/ga/mockClient";

/**
 * Contract tests for Google Analytics MCP Sessions API
 * Validates that mock client matches expected schema from docs/data/data_contracts.md
 * MCP integration test will be added once live host is available
 */

describe("GA Sessions API Contract (Mock Mode)", () => {
  test("mock client returns valid response structure", async () => {
    const client = createMockGaClient();
    const data = await client.fetchLandingPageSessions({
      start: "2025-09-28",
      end: "2025-10-05",
    });

    expect(data).toBeInstanceOf(Array);
    expect(data.length).toBeGreaterThan(0);
  });

  test("each session object has required fields", async () => {
    const client = createMockGaClient();
    const data = await client.fetchLandingPageSessions({
      start: "2025-09-28",
      end: "2025-10-05",
    });

    for (const session of data) {
      // Required fields (per data_contracts.md)
      expect(session.landingPage).toBeTypeOf("string");
      expect(session.landingPage).toMatch(/^\//); // should start with /
      expect(session.sessions).toBeTypeOf("number");
      expect(Number.isInteger(session.sessions)).toBe(true);
      expect(session.sessions).toBeGreaterThanOrEqual(0);
      expect(session.wowDelta).toBeTypeOf("number");

      // evidenceUrl is optional
      if (session.evidenceUrl) {
        expect(session.evidenceUrl).toBeTypeOf("string");
        expect(session.evidenceUrl).toMatch(/^https?:\/\//);
      }
    }
  });

  test("wowDelta is decimal between -1 and positive values", async () => {
    const client = createMockGaClient();
    const data = await client.fetchLandingPageSessions({
      start: "2025-09-28",
      end: "2025-10-05",
    });

    for (const session of data) {
      // Delta can be negative (drop) or positive (increase)
      expect(Number.isFinite(session.wowDelta)).toBe(true);

      // Realistic bounds: -100% to +500% (extreme cases)
      expect(session.wowDelta).toBeGreaterThanOrEqual(-1);
      expect(session.wowDelta).toBeLessThanOrEqual(5);
    }
  });

  test("mock data includes anomaly coverage", async () => {
    const client = createMockGaClient();
    const data = await client.fetchLandingPageSessions({
      start: "2025-09-28",
      end: "2025-10-05",
    });

    // Per docs/data/ga_mock_dataset.md, mock should include >20% drop for testing
    const anomalies = data.filter(s => s.wowDelta <= -0.2);

    expect(anomalies.length).toBeGreaterThan(0);
  });

  test("landing page paths are valid URL paths", async () => {
    const client = createMockGaClient();
    const data = await client.fetchLandingPageSessions({
      start: "2025-09-28",
      end: "2025-10-05",
    });

    for (const session of data) {
      // Should be valid URL path (starts with /)
      expect(session.landingPage).toMatch(/^\//);

      // Should not contain query params or fragments (clean paths)
      expect(session.landingPage).not.toMatch(/[?#]/);
    }
  });

  test("mock client is deterministic", async () => {
    const client = createMockGaClient();

    const data1 = await client.fetchLandingPageSessions({
      start: "2025-09-28",
      end: "2025-10-05",
    });

    const data2 = await client.fetchLandingPageSessions({
      start: "2025-09-28",
      end: "2025-10-05",
    });

    // Should return identical data on repeated calls
    expect(data1).toEqual(data2);
  });

  test("date range parameter format validation", async () => {
    const client = createMockGaClient();

    // Valid ISO date format (YYYY-MM-DD)
    const validRange = {
      start: "2025-09-28",
      end: "2025-10-05",
    };

    expect(async () => {
      await client.fetchLandingPageSessions(validRange);
    }).not.toThrow();

    // Dates should match ISO format
    expect(validRange.start).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(validRange.end).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  test("sessions count is realistic", async () => {
    const client = createMockGaClient();
    const data = await client.fetchLandingPageSessions({
      start: "2025-09-28",
      end: "2025-10-05",
    });

    // Sessions should be in realistic range (not extreme outliers)
    for (const session of data) {
      expect(session.sessions).toBeGreaterThan(0);
      expect(session.sessions).toBeLessThan(100000); // reasonable upper bound
    }
  });
});

describe.skip("GA Sessions API Contract (MCP Live)", () => {
  // Skipped until MCP host is available and credentials configured
  // Reference: docs/data/ga_mock_dataset.md transition plan

  test("MCP endpoint returns valid response", async () => {
    // TODO: Implement once GA_MCP_HOST is configured
    // const client = createMcpGaClient(process.env.GA_MCP_HOST!);
    // const data = await client.fetchLandingPageSessions({
    //   start: "2025-09-28",
    //   end: "2025-10-05",
    // });
    //
    // expect(data).toBeDefined();
    // expect(data.length).toBeGreaterThan(0);
  });

  test("MCP response matches mock contract", async () => {
    // TODO: Validate MCP response has same structure as mock
    // Compare field types, required/optional fields, value ranges
  });

  test("MCP error handling for 4xx/5xx", async () => {
    // TODO: Test error responses and retry logic
  });
});
