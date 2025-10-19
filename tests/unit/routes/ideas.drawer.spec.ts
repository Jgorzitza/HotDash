import { describe, beforeEach, afterEach, it, expect } from "vitest";
import type { IdeaPoolResponse } from "~/lib/analytics/schemas";
import { loader } from "~/routes/api.analytics.idea-pool";
import {
  getIdeaPoolAnalytics,
  getMockIdeaPoolItems,
} from "~/lib/analytics/idea-pool";

vi.mock("~/lib/analytics/idea-pool", () => ({
  getIdeaPoolAnalytics: vi.fn(),
  getMockIdeaPoolItems: vi.fn(),
}));

const mockedAnalytics = vi.mocked(getIdeaPoolAnalytics);
const mockedMockItems = vi.mocked(getMockIdeaPoolItems);

const requestArgs = { request: new Request("http://localhost/ideas") } as any;

describe("ideas drawer loader", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns live analytics when retrieval succeeds", async () => {
    const fakeResponse: IdeaPoolResponse = {
      success: true,
      data: {
        items: [
          {
            id: "idea-1",
            title: "Bundle builder rules",
            status: "pending_review",
            rationale: "Increase attach rate via guided kits",
            projectedImpact: "Lift attach rate 5%",
            priority: "high",
            confidence: 0.7,
            createdAt: "2025-10-18T00:00:00.000Z",
            updatedAt: "2025-10-18T00:00:00.000Z",
            reviewer: undefined,
          },
        ],
        totals: {
          pending: 1,
          approved: 0,
          rejected: 0,
        },
      },
      error: undefined,
      timestamp: "2025-10-19T00:00:00.000Z",
      source: "supabase",
      warnings: [],
    };

    mockedAnalytics.mockResolvedValueOnce(fakeResponse);

    const response = await loader(requestArgs);
    expect(response.status).toBe(200);

    const payload = await response.json();
    expect(payload).toEqual(fakeResponse);
    expect(mockedAnalytics).toHaveBeenCalledTimes(1);
    expect(mockedMockItems).not.toHaveBeenCalled();
  });

  it("returns fallback metrics when analytics retrieval fails", async () => {
    mockedAnalytics.mockRejectedValueOnce(new Error("supabase offline"));
    mockedMockItems.mockReturnValueOnce([
      {
        id: "idea-1",
        title: "Add bulk fittings kit",
        status: "pending_review",
        rationale: "High volume request from CX tickets",
        projectedImpact: "Improve fulfillment speed",
        priority: "medium",
        confidence: 0.6,
        createdAt: "2025-10-18T00:00:00.000Z",
        updatedAt: "2025-10-18T01:00:00.000Z",
        reviewer: "Alex",
      },
      {
        id: "idea-2",
        title: "Publish hose guide",
        status: "approved",
        rationale: "SEO + CX cross-training",
        projectedImpact: "Lift conversion by 3%",
        priority: "high",
        confidence: 0.8,
        createdAt: "2025-10-17T00:00:00.000Z",
        updatedAt: "2025-10-18T00:30:00.000Z",
        reviewer: "Jamie",
      },
      {
        id: "idea-3",
        title: "Sunset legacy hoses",
        status: "rejected",
        rationale: "Supplier MOQ improved; maintain stock",
        projectedImpact: "Avoid customer churn",
        priority: "low",
        confidence: 0.4,
        createdAt: "2025-10-16T00:00:00.000Z",
        updatedAt: "2025-10-18T02:30:00.000Z",
        reviewer: "Taylor",
      },
    ]);

    const response = await loader(requestArgs);
    expect(response.status).toBe(500);

    const payload: IdeaPoolResponse = await response.json();
    expect(payload.success).toBe(false);
    expect(payload.source).toBe("mock");
    expect(payload.error).toMatch(/supabase offline/);
    expect(payload.data?.totals).toEqual({
      pending: 1,
      approved: 1,
      rejected: 1,
    });
    expect(payload.data?.items).toHaveLength(3);
    expect(new Date(payload.timestamp).toString()).not.toBe("Invalid Date");
    expect(mockedMockItems).toHaveBeenCalledTimes(1);
  });
});
