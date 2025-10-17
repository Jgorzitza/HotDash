import { describe, expect, it } from "vitest";
import {
  detectTrafficAnomalies,
  detectRankingAnomalies,
  detectVitalsAnomalies,
  detectCrawlAnomalies,
  aggregateSEOAnomalies,
  ANOMALY_THRESHOLDS,
  type TrafficAnomalyInput,
  type RankingAnomalyInput,
  type VitalsAnomalyInput,
  type CrawlErrorInput,
} from "../../app/lib/seo/anomalies";

describe("SEO Anomaly Detection", () => {
  describe("detectTrafficAnomalies", () => {
    it("detects critical traffic drops (>= 40%)", () => {
      const inputs: TrafficAnomalyInput[] = [
        {
          landingPage: "/products/hot-rods",
          currentSessions: 600,
          previousSessions: 1000,
          wowDelta: -0.4,
        },
      ];

      const anomalies = detectTrafficAnomalies(inputs);

      expect(anomalies).toHaveLength(1);
      expect(anomalies[0].severity).toBe("critical");
      expect(anomalies[0].type).toBe("traffic");
      expect(anomalies[0].metric.changePercent).toBe(-0.4);
    });

    it("detects warning traffic drops (20-40%)", () => {
      const inputs: TrafficAnomalyInput[] = [
        {
          landingPage: "/collections/custom",
          currentSessions: 750,
          previousSessions: 1000,
          wowDelta: -0.25,
        },
      ];

      const anomalies = detectTrafficAnomalies(inputs);

      expect(anomalies).toHaveLength(1);
      expect(anomalies[0].severity).toBe("warning");
    });

    it("ignores minor traffic changes (< 20%)", () => {
      const inputs: TrafficAnomalyInput[] = [
        {
          landingPage: "/pages/about",
          currentSessions: 850,
          previousSessions: 1000,
          wowDelta: -0.15,
        },
      ];

      const anomalies = detectTrafficAnomalies(inputs);

      expect(anomalies).toHaveLength(0);
    });

    it("sorts anomalies by severity (worst first)", () => {
      const inputs: TrafficAnomalyInput[] = [
        {
          landingPage: "/page-a",
          currentSessions: 750,
          previousSessions: 1000,
          wowDelta: -0.25,
        },
        {
          landingPage: "/page-b",
          currentSessions: 500,
          previousSessions: 1000,
          wowDelta: -0.5,
        },
        {
          landingPage: "/page-c",
          currentSessions: 700,
          previousSessions: 1000,
          wowDelta: -0.3,
        },
      ];

      const anomalies = detectTrafficAnomalies(inputs);

      expect(anomalies).toHaveLength(3);
      expect(anomalies[0].affectedUrl).toBe("/page-b"); // -50% worst
      expect(anomalies[1].affectedUrl).toBe("/page-c"); // -30%
      expect(anomalies[2].affectedUrl).toBe("/page-a"); // -25%
    });
  });

  describe("detectRankingAnomalies", () => {
    it("detects critical ranking drops (>= 10 positions)", () => {
      const inputs: RankingAnomalyInput[] = [
        {
          keyword: "custom hot rods",
          currentPosition: 15,
          previousPosition: 3,
          url: "/collections/custom",
        },
      ];

      const anomalies = detectRankingAnomalies(inputs);

      expect(anomalies).toHaveLength(1);
      expect(anomalies[0].severity).toBe("critical");
      expect(anomalies[0].type).toBe("ranking");
      expect(anomalies[0].metric.change).toBe(12);
    });

    it("detects warning ranking drops (5-10 positions)", () => {
      const inputs: RankingAnomalyInput[] = [
        {
          keyword: "vintage cars",
          currentPosition: 12,
          previousPosition: 5,
          url: "/collections/vintage",
        },
      ];

      const anomalies = detectRankingAnomalies(inputs);

      expect(anomalies).toHaveLength(1);
      expect(anomalies[0].severity).toBe("warning");
    });

    it("ignores minor ranking changes (< 5 positions)", () => {
      const inputs: RankingAnomalyInput[] = [
        {
          keyword: "car parts",
          currentPosition: 7,
          previousPosition: 5,
          url: "/products/parts",
        },
      ];

      const anomalies = detectRankingAnomalies(inputs);

      expect(anomalies).toHaveLength(0);
    });
  });

  describe("detectVitalsAnomalies", () => {
    it("detects critical LCP failures (> 4000ms)", () => {
      const inputs: VitalsAnomalyInput[] = [
        {
          url: "/products/hot-rods",
          metric: "LCP",
          value: 4500,
          threshold: 4000,
          device: "mobile",
        },
      ];

      const anomalies = detectVitalsAnomalies(inputs);

      expect(anomalies).toHaveLength(1);
      expect(anomalies[0].severity).toBe("critical");
      expect(anomalies[0].type).toBe("vitals");
      expect(anomalies[0].title).toContain("Largest Contentful Paint");
    });

    it("detects warning LCP issues (2500-4000ms)", () => {
      const inputs: VitalsAnomalyInput[] = [
        {
          url: "/collections/custom",
          metric: "LCP",
          value: 3000,
          threshold: 2500,
          device: "desktop",
        },
      ];

      const anomalies = detectVitalsAnomalies(inputs);

      expect(anomalies).toHaveLength(1);
      expect(anomalies[0].severity).toBe("warning");
    });

    it("detects CLS failures with proper formatting", () => {
      const inputs: VitalsAnomalyInput[] = [
        {
          url: "/pages/home",
          metric: "CLS",
          value: 0.35,
          threshold: 0.25,
          device: "mobile",
        },
      ];

      const anomalies = detectVitalsAnomalies(inputs);

      expect(anomalies).toHaveLength(1);
      expect(anomalies[0].description).toContain("0.350"); // 3 decimal places
      expect(anomalies[0].description).not.toContain("ms"); // CLS has no unit
    });

    it("ignores good vitals scores", () => {
      const inputs: VitalsAnomalyInput[] = [
        {
          url: "/products/fast-page",
          metric: "LCP",
          value: 2000,
          threshold: 2500,
          device: "mobile",
        },
      ];

      const anomalies = detectVitalsAnomalies(inputs);

      expect(anomalies).toHaveLength(0);
    });
  });

  describe("detectCrawlAnomalies", () => {
    it("detects critical crawl errors (>= 10 errors)", () => {
      const inputs: CrawlErrorInput[] = [
        {
          url: "/products/discontinued",
          errorType: "404",
          errorCount: 15,
          lastDetected: "2025-10-15T10:00:00Z",
        },
      ];

      const anomalies = detectCrawlAnomalies(inputs);

      expect(anomalies).toHaveLength(1);
      expect(anomalies[0].severity).toBe("critical");
      expect(anomalies[0].type).toBe("crawl");
    });

    it("detects warning crawl errors (3-10 errors)", () => {
      const inputs: CrawlErrorInput[] = [
        {
          url: "/collections/old",
          errorType: "500",
          errorCount: 5,
          lastDetected: "2025-10-15T10:00:00Z",
        },
      ];

      const anomalies = detectCrawlAnomalies(inputs);

      expect(anomalies).toHaveLength(1);
      expect(anomalies[0].severity).toBe("warning");
    });

    it("ignores minor crawl errors (< 3 errors)", () => {
      const inputs: CrawlErrorInput[] = [
        {
          url: "/pages/test",
          errorType: "404",
          errorCount: 2,
          lastDetected: "2025-10-15T10:00:00Z",
        },
      ];

      const anomalies = detectCrawlAnomalies(inputs);

      expect(anomalies).toHaveLength(0);
    });
  });

  describe("aggregateSEOAnomalies", () => {
    it("aggregates and categorizes anomalies by severity", () => {
      const anomalies = [
        {
          id: "test-1",
          type: "traffic" as const,
          severity: "critical" as const,
          title: "Critical issue",
          description: "Test",
          metric: { current: 100 },
          detectedAt: "2025-10-15T10:00:00Z",
        },
        {
          id: "test-2",
          type: "ranking" as const,
          severity: "warning" as const,
          title: "Warning issue",
          description: "Test",
          metric: { current: 50 },
          detectedAt: "2025-10-15T10:00:00Z",
        },
        {
          id: "test-3",
          type: "vitals" as const,
          severity: "critical" as const,
          title: "Another critical",
          description: "Test",
          metric: { current: 200 },
          detectedAt: "2025-10-15T10:00:00Z",
        },
      ];

      const result = aggregateSEOAnomalies(anomalies);

      expect(result.all).toHaveLength(3);
      expect(result.critical).toHaveLength(2);
      expect(result.warning).toHaveLength(1);
      expect(result.info).toHaveLength(0);
      expect(result.summary.total).toBe(3);
      expect(result.summary.criticalCount).toBe(2);
      expect(result.summary.warningCount).toBe(1);
      expect(result.summary.infoCount).toBe(0);
    });
  });

  describe("ANOMALY_THRESHOLDS", () => {
    it("has correct traffic thresholds", () => {
      expect(ANOMALY_THRESHOLDS.traffic.critical).toBe(-0.4);
      expect(ANOMALY_THRESHOLDS.traffic.warning).toBe(-0.2);
    });

    it("has correct ranking thresholds", () => {
      expect(ANOMALY_THRESHOLDS.ranking.critical).toBe(10);
      expect(ANOMALY_THRESHOLDS.ranking.warning).toBe(5);
    });

    it("has correct vitals thresholds", () => {
      expect(ANOMALY_THRESHOLDS.vitals.lcp.good).toBe(2500);
      expect(ANOMALY_THRESHOLDS.vitals.lcp.needsImprovement).toBe(4000);
      expect(ANOMALY_THRESHOLDS.vitals.fid.good).toBe(100);
      expect(ANOMALY_THRESHOLDS.vitals.fid.needsImprovement).toBe(300);
      expect(ANOMALY_THRESHOLDS.vitals.cls.good).toBe(0.1);
      expect(ANOMALY_THRESHOLDS.vitals.cls.needsImprovement).toBe(0.25);
    });

    it("has correct crawl thresholds", () => {
      expect(ANOMALY_THRESHOLDS.crawl.critical).toBe(10);
      expect(ANOMALY_THRESHOLDS.crawl.warning).toBe(3);
    });
  });
});
