import { describe, it, expect } from "vitest";
import { fetchSearchConsoleQueries } from "../../app/lib/seo/search-console";

describe("Search Console Module", () => {
  it("returns stub data with correct structure", async () => {
    const config = { siteUrl: "https://hotrodan.com" };
    const queries = await fetchSearchConsoleQueries(
      config,
      "2025-10-01",
      "2025-10-19",
    );

    expect(Array.isArray(queries)).toBe(true);
    expect(queries.length).toBeGreaterThan(0);

    const firstQuery = queries[0];
    expect(firstQuery).toHaveProperty("query");
    expect(firstQuery).toHaveProperty("position");
    expect(firstQuery).toHaveProperty("clicks");
    expect(firstQuery).toHaveProperty("impressions");
    expect(firstQuery).toHaveProperty("ctr");
    expect(firstQuery).toHaveProperty("page");

    expect(typeof firstQuery.position).toBe("number");
    expect(typeof firstQuery.clicks).toBe("number");
    expect(typeof firstQuery.ctr).toBe("number");
  });

  it("includes valid URL in page field", async () => {
    const config = { siteUrl: "https://hotrodan.com" };
    const queries = await fetchSearchConsoleQueries(
      config,
      "2025-10-01",
      "2025-10-19",
    );

    queries.forEach((query) => {
      expect(query.page).toMatch(/^https?:\/\//);
    });
  });
});
