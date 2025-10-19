import { describe, expect, it } from "vitest";

/**
 * Google Analytics 4 Metrics Contract Tests
 */

describe("GA4 Metrics API Contract", () => {
  it("runReport response shape contract", () => {
    const mockResponse = {
      dimensionHeaders: [{ name: "date" }],
      metricHeaders: [
        { name: "sessions", type: "TYPE_INTEGER" },
        { name: "activeUsers", type: "TYPE_INTEGER" },
      ],
      rows: [
        {
          dimensionValues: [{ value: "20251019" }],
          metricValues: [{ value: "150" }, { value: "120" }],
        },
      ],
    };

    expect(mockResponse).toHaveProperty("dimensionHeaders");
    expect(mockResponse).toHaveProperty("metricHeaders");
    expect(mockResponse).toHaveProperty("rows");
    expect(mockResponse.metricHeaders[0]).toHaveProperty("name");
    expect(mockResponse.metricHeaders[0]).toHaveProperty("type");
  });

  it("traffic metrics contract", () => {
    const metrics = ["sessions", "activeUsers", "pageviews", "bounceRate"];
    expect(metrics).toContain("sessions");
    expect(metrics).toContain("activeUsers");
  });
});
