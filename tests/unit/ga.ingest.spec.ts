import { beforeEach, describe, expect, it, vi } from "vitest";

import { getLandingPageAnomalies } from "../../app/services/ga/ingest";
import { clearCache } from "../../app/services/cache.server";

vi.mock("../../app/services/facts.server", () => ({
  recordDashboardFact: vi.fn(async (data) => ({
    id: 123,
    shopDomain: data.shopDomain,
    factType: data.factType,
    scope: data.scope ?? null,
    value: data.value,
    metadata: data.metadata ?? null,
    evidenceUrl: data.evidenceUrl ?? null,
    createdAt: new Date(),
    updatedAt: new Date(),
  })),
}));

describe("GA ingest", () => {
  beforeEach(() => {
    process.env.GA_USE_MOCK = "1";
    process.env.GA_PROPERTY_ID = "test-property";
    clearCache();
  });

  it("produces anomalies with mock client", async () => {
    const result = await getLandingPageAnomalies({ shopDomain: "test-shop" });

    expect(result.data).toHaveLength(3);
    const anomalies = result.data.filter((item) => item.isAnomaly);
    expect(anomalies).toHaveLength(1);
    expect(result.source).toBe("fresh");

    const cached = await getLandingPageAnomalies({ shopDomain: "test-shop" });
    expect(cached.source).toBe("cache");
  });
});
