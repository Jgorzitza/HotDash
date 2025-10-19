import { describe, it, expect } from "vitest";
import { detectOrganicVsOrganicConflicts } from "../../app/lib/seo/cannibalization";
import type { SearchConsoleQuery } from "../../app/lib/seo/search-console";

describe("Cannibalization Detection", () => {
  it("detects when multiple pages target same keyword", () => {
    const queries: SearchConsoleQuery[] = [
      {
        query: "hot rods",
        position: 3.2,
        clicks: 100,
        impressions: 1000,
        ctr: 0.1,
        page: "https://example.com/products/hot-rods",
      },
      {
        query: "hot rods",
        position: 5.1,
        clicks: 50,
        impressions: 800,
        ctr: 0.0625,
        page: "https://example.com/collections/hot-rods",
      },
    ];

    const issues = detectOrganicVsOrganicConflicts(queries);

    expect(issues.length).toBe(1);
    expect(issues[0].keyword).toBe("hot rods");
    expect(issues[0].type).toBe("organic-vs-organic");
    expect(issues[0].severity).toBe("warning");
    expect(issues[0].affectedPages.length).toBe(2);
  });

  it("marks 3+ pages as critical severity", () => {
    const queries: SearchConsoleQuery[] = [
      {
        query: "test",
        position: 1,
        clicks: 100,
        impressions: 1000,
        ctr: 0.1,
        page: "https://example.com/page1",
      },
      {
        query: "test",
        position: 2,
        clicks: 90,
        impressions: 900,
        ctr: 0.1,
        page: "https://example.com/page2",
      },
      {
        query: "test",
        position: 3,
        clicks: 80,
        impressions: 800,
        ctr: 0.1,
        page: "https://example.com/page3",
      },
    ];

    const issues = detectOrganicVsOrganicConflicts(queries);

    expect(issues.length).toBe(1);
    expect(issues[0].severity).toBe("critical");
    expect(issues[0].affectedPages.length).toBe(3);
  });

  it("returns empty array when no conflicts", () => {
    const queries: SearchConsoleQuery[] = [
      {
        query: "unique keyword 1",
        position: 3.2,
        clicks: 100,
        impressions: 1000,
        ctr: 0.1,
        page: "https://example.com/page1",
      },
      {
        query: "unique keyword 2",
        position: 5.1,
        clicks: 50,
        impressions: 800,
        ctr: 0.0625,
        page: "https://example.com/page2",
      },
    ];

    const issues = detectOrganicVsOrganicConflicts(queries);

    expect(issues.length).toBe(0);
  });
});
