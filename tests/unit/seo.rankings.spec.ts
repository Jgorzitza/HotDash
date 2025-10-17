import { describe, expect, it } from "vitest";
import {
  calculateChangeSeverity,
  determineChangeType,
  parseSearchConsoleData,
  detectRankingChanges,
  filterRankings,
  getTopKeywords,
  getHighVolumeKeywords,
  calculateAveragePosition,
  getRankingTrend,
  RANKING_CHANGE_THRESHOLDS,
  type KeywordRanking,
  type SearchConsoleResponse,
  type KeywordHistory,
} from "../../app/lib/seo/rankings";

describe("SEO Rankings Tracker", () => {
  describe("calculateChangeSeverity", () => {
    it("detects major improvements", () => {
      expect(calculateChangeSeverity(-5)).toBe("major");
      expect(calculateChangeSeverity(-10)).toBe("major");
    });

    it("detects major drops", () => {
      expect(calculateChangeSeverity(5)).toBe("major");
      expect(calculateChangeSeverity(10)).toBe("major");
    });

    it("detects minor improvements", () => {
      expect(calculateChangeSeverity(-2)).toBe("minor");
      expect(calculateChangeSeverity(-4)).toBe("minor");
    });

    it("detects minor drops", () => {
      expect(calculateChangeSeverity(2)).toBe("minor");
      expect(calculateChangeSeverity(4)).toBe("minor");
    });

    it("detects no significant change", () => {
      expect(calculateChangeSeverity(0)).toBe("none");
      expect(calculateChangeSeverity(1)).toBe("none");
      expect(calculateChangeSeverity(-1)).toBe("none");
    });
  });

  describe("determineChangeType", () => {
    it("identifies improvements", () => {
      expect(determineChangeType(-5)).toBe("improvement");
      expect(determineChangeType(-1)).toBe("improvement");
    });

    it("identifies drops", () => {
      expect(determineChangeType(5)).toBe("drop");
      expect(determineChangeType(1)).toBe("drop");
    });

    it("identifies stable rankings", () => {
      expect(determineChangeType(0)).toBe("stable");
    });
  });

  describe("parseSearchConsoleData", () => {
    it("parses Search Console response correctly", () => {
      const response: SearchConsoleResponse = {
        rows: [
          {
            keys: ["custom hot rods", "/collections/custom", "US", "mobile"],
            clicks: 50,
            impressions: 1000,
            ctr: 0.05,
            position: 3.2,
          },
          {
            keys: ["vintage cars", "/collections/vintage", "US", "desktop"],
            clicks: 30,
            impressions: 500,
            ctr: 0.06,
            position: 5.8,
          },
        ],
      };

      const rankings = parseSearchConsoleData(response, "2025-10-15");

      expect(rankings).toHaveLength(2);
      expect(rankings[0]).toEqual({
        keyword: "custom hot rods",
        url: "/collections/custom",
        position: 3,
        device: "mobile",
        country: "US",
        clicks: 50,
        impressions: 1000,
        ctr: 0.05,
        date: "2025-10-15",
      });
      expect(rankings[1].position).toBe(6); // Rounded from 5.8
    });
  });

  describe("detectRankingChanges", () => {
    it("detects ranking improvements", () => {
      const current: KeywordRanking[] = [
        {
          keyword: "hot rods",
          url: "/products",
          position: 3,
          device: "mobile",
          country: "US",
          clicks: 50,
          impressions: 1000,
          ctr: 0.05,
          date: "2025-10-15",
        },
      ];

      const previous: KeywordRanking[] = [
        {
          keyword: "hot rods",
          url: "/products",
          position: 8,
          device: "mobile",
          country: "US",
          clicks: 30,
          impressions: 800,
          ctr: 0.0375,
          date: "2025-10-14",
        },
      ];

      const changes = detectRankingChanges(current, previous);

      expect(changes).toHaveLength(1);
      expect(changes[0].change).toBe(-5);
      expect(changes[0].changeType).toBe("improvement");
      expect(changes[0].severity).toBe("major");
    });

    it("detects ranking drops", () => {
      const current: KeywordRanking[] = [
        {
          keyword: "vintage cars",
          url: "/collections/vintage",
          position: 15,
          device: "desktop",
          country: "US",
          clicks: 10,
          impressions: 500,
          ctr: 0.02,
          date: "2025-10-15",
        },
      ];

      const previous: KeywordRanking[] = [
        {
          keyword: "vintage cars",
          url: "/collections/vintage",
          position: 5,
          device: "desktop",
          country: "US",
          clicks: 40,
          impressions: 600,
          ctr: 0.0667,
          date: "2025-10-14",
        },
      ];

      const changes = detectRankingChanges(current, previous);

      expect(changes).toHaveLength(1);
      expect(changes[0].change).toBe(10);
      expect(changes[0].changeType).toBe("drop");
      expect(changes[0].severity).toBe("major");
    });

    it("ignores stable rankings", () => {
      const current: KeywordRanking[] = [
        {
          keyword: "car parts",
          url: "/products/parts",
          position: 7,
          device: "mobile",
          country: "US",
          clicks: 20,
          impressions: 400,
          ctr: 0.05,
          date: "2025-10-15",
        },
      ];

      const previous: KeywordRanking[] = [
        {
          keyword: "car parts",
          url: "/products/parts",
          position: 7,
          device: "mobile",
          country: "US",
          clicks: 20,
          impressions: 400,
          ctr: 0.05,
          date: "2025-10-14",
        },
      ];

      const changes = detectRankingChanges(current, previous);

      expect(changes).toHaveLength(0);
    });
  });

  describe("filterRankings", () => {
    const rankings: KeywordRanking[] = [
      {
        keyword: "keyword1",
        url: "/page1",
        position: 3,
        device: "mobile",
        country: "US",
        clicks: 50,
        impressions: 1000,
        ctr: 0.05,
        date: "2025-10-15",
      },
      {
        keyword: "keyword2",
        url: "/page2",
        position: 15,
        device: "desktop",
        country: "GB",
        clicks: 10,
        impressions: 200,
        ctr: 0.05,
        date: "2025-10-15",
      },
    ];

    it("filters by position range", () => {
      const filtered = filterRankings(rankings, { maxPosition: 10 });
      expect(filtered).toHaveLength(1);
      expect(filtered[0].position).toBe(3);
    });

    it("filters by device", () => {
      const filtered = filterRankings(rankings, { device: "mobile" });
      expect(filtered).toHaveLength(1);
      expect(filtered[0].device).toBe("mobile");
    });

    it("filters by country", () => {
      const filtered = filterRankings(rankings, { country: "GB" });
      expect(filtered).toHaveLength(1);
      expect(filtered[0].country).toBe("GB");
    });

    it("filters by minimum impressions", () => {
      const filtered = filterRankings(rankings, { minImpressions: 500 });
      expect(filtered).toHaveLength(1);
      expect(filtered[0].impressions).toBe(1000);
    });
  });

  describe("getTopKeywords", () => {
    it("returns keywords sorted by position", () => {
      const rankings: KeywordRanking[] = [
        {
          keyword: "k1",
          url: "/p1",
          position: 5,
          device: "mobile",
          country: "US",
          clicks: 10,
          impressions: 100,
          ctr: 0.1,
          date: "2025-10-15",
        },
        {
          keyword: "k2",
          url: "/p2",
          position: 2,
          device: "mobile",
          country: "US",
          clicks: 20,
          impressions: 200,
          ctr: 0.1,
          date: "2025-10-15",
        },
        {
          keyword: "k3",
          url: "/p3",
          position: 8,
          device: "mobile",
          country: "US",
          clicks: 5,
          impressions: 50,
          ctr: 0.1,
          date: "2025-10-15",
        },
      ];

      const top = getTopKeywords(rankings, 2);

      expect(top).toHaveLength(2);
      expect(top[0].position).toBe(2);
      expect(top[1].position).toBe(5);
    });
  });

  describe("getHighVolumeKeywords", () => {
    it("returns keywords sorted by impressions", () => {
      const rankings: KeywordRanking[] = [
        {
          keyword: "k1",
          url: "/p1",
          position: 5,
          device: "mobile",
          country: "US",
          clicks: 10,
          impressions: 500,
          ctr: 0.02,
          date: "2025-10-15",
        },
        {
          keyword: "k2",
          url: "/p2",
          position: 2,
          device: "mobile",
          country: "US",
          clicks: 20,
          impressions: 2000,
          ctr: 0.01,
          date: "2025-10-15",
        },
        {
          keyword: "k3",
          url: "/p3",
          position: 8,
          device: "mobile",
          country: "US",
          clicks: 5,
          impressions: 100,
          ctr: 0.05,
          date: "2025-10-15",
        },
      ];

      const highVolume = getHighVolumeKeywords(rankings, 2);

      expect(highVolume).toHaveLength(2);
      expect(highVolume[0].impressions).toBe(2000);
      expect(highVolume[1].impressions).toBe(500);
    });
  });

  describe("calculateAveragePosition", () => {
    it("calculates average position correctly", () => {
      const history: KeywordHistory = {
        keyword: "test keyword",
        url: "/test",
        rankings: [
          {
            date: "2025-10-10",
            position: 5,
            clicks: 10,
            impressions: 100,
            ctr: 0.1,
          },
          {
            date: "2025-10-11",
            position: 3,
            clicks: 15,
            impressions: 120,
            ctr: 0.125,
          },
          {
            date: "2025-10-12",
            position: 4,
            clicks: 12,
            impressions: 110,
            ctr: 0.109,
          },
        ],
      };

      const avg = calculateAveragePosition(history);

      expect(avg).toBe(4); // (5 + 3 + 4) / 3 = 4
    });

    it("returns 0 for empty history", () => {
      const history: KeywordHistory = {
        keyword: "test",
        url: "/test",
        rankings: [],
      };

      expect(calculateAveragePosition(history)).toBe(0);
    });
  });

  describe("getRankingTrend", () => {
    it("detects improving trend", () => {
      const history: KeywordHistory = {
        keyword: "test",
        url: "/test",
        rankings: [
          {
            date: "2025-10-10",
            position: 10,
            clicks: 5,
            impressions: 100,
            ctr: 0.05,
          },
          {
            date: "2025-10-11",
            position: 8,
            clicks: 7,
            impressions: 110,
            ctr: 0.064,
          },
          {
            date: "2025-10-12",
            position: 5,
            clicks: 10,
            impressions: 120,
            ctr: 0.083,
          },
        ],
      };

      expect(getRankingTrend(history)).toBe("improving");
    });

    it("detects declining trend", () => {
      const history: KeywordHistory = {
        keyword: "test",
        url: "/test",
        rankings: [
          {
            date: "2025-10-10",
            position: 5,
            clicks: 10,
            impressions: 120,
            ctr: 0.083,
          },
          {
            date: "2025-10-11",
            position: 8,
            clicks: 7,
            impressions: 110,
            ctr: 0.064,
          },
          {
            date: "2025-10-12",
            position: 10,
            clicks: 5,
            impressions: 100,
            ctr: 0.05,
          },
        ],
      };

      expect(getRankingTrend(history)).toBe("declining");
    });

    it("detects stable trend", () => {
      const history: KeywordHistory = {
        keyword: "test",
        url: "/test",
        rankings: [
          {
            date: "2025-10-10",
            position: 7,
            clicks: 8,
            impressions: 110,
            ctr: 0.073,
          },
          {
            date: "2025-10-11",
            position: 7,
            clicks: 8,
            impressions: 110,
            ctr: 0.073,
          },
          {
            date: "2025-10-12",
            position: 8,
            clicks: 7,
            impressions: 105,
            ctr: 0.067,
          },
        ],
      };

      expect(getRankingTrend(history)).toBe("stable");
    });
  });

  describe("RANKING_CHANGE_THRESHOLDS", () => {
    it("has correct threshold values", () => {
      expect(RANKING_CHANGE_THRESHOLDS.major.improvement).toBe(-5);
      expect(RANKING_CHANGE_THRESHOLDS.major.drop).toBe(5);
      expect(RANKING_CHANGE_THRESHOLDS.minor.improvement).toBe(-2);
      expect(RANKING_CHANGE_THRESHOLDS.minor.drop).toBe(2);
    });
  });
});
