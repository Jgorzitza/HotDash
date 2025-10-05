import { describe, test, expect, beforeEach, afterEach, vi } from "vitest";
import {
  detectAnomaly,
  ANOMALY_CONFIGS,
  type AnomalyDetectionConfig,
} from "../../../app/services/anomalies.server";

/**
 * Unit tests for anomaly detection service
 * Validates threshold-based detection logic for all KPI types
 */

describe("Anomaly Detection Service", () => {
  describe("detectAnomaly - Percent Change Detection", () => {
    const config: AnomalyDetectionConfig = {
      factType: "shopify.sales.summary",
      metric: "totalRevenue",
      thresholds: {
        percentChange: { warning: 0.15, critical: 0.3 },
      },
    };

    test("detects critical anomaly on 30%+ change", () => {
      const result = detectAnomaly(700, config, 1000);

      expect(result.isAnomaly).toBe(true);
      expect(result.severity).toBe("critical");
      expect(result.percentChange).toBe(0.3); // 30% drop
      expect(result.delta).toBe(-300);
      expect(result.message).toContain("Critical");
      expect(result.message).toContain("30.0%");
    });

    test("detects warning anomaly on 15-30% change", () => {
      const result = detectAnomaly(850, config, 1000);

      expect(result.isAnomaly).toBe(true);
      expect(result.severity).toBe("warning");
      expect(result.percentChange).toBe(0.15); // 15% drop
      expect(result.delta).toBe(-150);
      expect(result.message).toContain("Warning");
    });

    test("no anomaly on <15% change", () => {
      const result = detectAnomaly(900, config, 1000);

      expect(result.isAnomaly).toBe(false);
      expect(result.severity).toBe("none");
      expect(result.percentChange).toBe(0.1); // 10% drop
    });

    test("detects anomaly on increase (absolute percent change)", () => {
      const result = detectAnomaly(1400, config, 1000);

      expect(result.isAnomaly).toBe(true);
      expect(result.severity).toBe("critical");
      expect(result.percentChange).toBe(0.4); // 40% increase
      expect(result.delta).toBe(400);
    });

    test("handles zero baseline gracefully", () => {
      const result = detectAnomaly(100, config, 0);

      expect(result.isAnomaly).toBe(false);
      expect(result.percentChange).toBe(0);
    });
  });

  describe("detectAnomaly - Absolute Value Detection (Higher is Worse)", () => {
    const config: AnomalyDetectionConfig = {
      factType: "chatwoot.sla.breaches",
      metric: "breachRate",
      thresholds: {
        absoluteValue: { warning: 0.2, critical: 0.4 },
      },
    };

    test("detects critical anomaly when value exceeds critical threshold", () => {
      const result = detectAnomaly(0.45, config);

      expect(result.isAnomaly).toBe(true);
      expect(result.severity).toBe("critical");
      expect(result.message).toContain("exceeds");
      expect(result.message).toContain("0.40");
    });

    test("detects warning anomaly when value exceeds warning threshold", () => {
      const result = detectAnomaly(0.25, config);

      expect(result.isAnomaly).toBe(true);
      expect(result.severity).toBe("warning");
      expect(result.message).toContain("exceeds");
      expect(result.message).toContain("0.20");
    });

    test("no anomaly when value below warning threshold", () => {
      const result = detectAnomaly(0.15, config);

      expect(result.isAnomaly).toBe(false);
      expect(result.severity).toBe("none");
    });
  });

  describe("detectAnomaly - Absolute Value Detection (Lower is Worse)", () => {
    const config: AnomalyDetectionConfig = {
      factType: "shopify.inventory.coverage",
      metric: "daysOfCover",
      thresholds: {
        absoluteValue: { warning: 7, critical: 3 },
      },
    };

    test("detects critical anomaly when value below critical threshold", () => {
      const result = detectAnomaly(2, config);

      expect(result.isAnomaly).toBe(true);
      expect(result.severity).toBe("critical");
      expect(result.message).toContain("below");
      expect(result.message).toContain("3.00");
    });

    test("detects warning anomaly when value below warning threshold", () => {
      const result = detectAnomaly(5, config);

      expect(result.isAnomaly).toBe(true);
      expect(result.severity).toBe("warning");
      expect(result.message).toContain("below");
      expect(result.message).toContain("7.00");
    });

    test("no anomaly when value above warning threshold", () => {
      const result = detectAnomaly(10, config);

      expect(result.isAnomaly).toBe(false);
      expect(result.severity).toBe("none");
    });
  });

  describe("ANOMALY_CONFIGS - Pre-configured Profiles", () => {
    test("salesDelta config uses percent change thresholds", () => {
      const config = ANOMALY_CONFIGS.salesDelta;

      expect(config.factType).toBe("shopify.sales.summary");
      expect(config.metric).toBe("totalRevenue");
      expect(config.thresholds.percentChange).toEqual({
        warning: 0.15,
        critical: 0.3,
      });
      expect(config.windowDays).toBe(7);
    });

    test("slaBreachRate config uses absolute value thresholds", () => {
      const config = ANOMALY_CONFIGS.slaBreachRate;

      expect(config.factType).toBe("chatwoot.sla.breaches");
      expect(config.metric).toBe("breachRate");
      expect(config.thresholds.absoluteValue).toEqual({
        warning: 0.2,
        critical: 0.4,
      });
    });

    test("trafficAnomaly config uses percent change thresholds", () => {
      const config = ANOMALY_CONFIGS.trafficAnomaly;

      expect(config.factType).toBe("ga.sessions.anomalies");
      expect(config.metric).toBe("wowDelta");
      expect(config.thresholds.percentChange).toEqual({
        warning: 0.2,
        critical: 0.4,
      });
    });

    test("inventoryCoverage config uses absolute value (lower is worse)", () => {
      const config = ANOMALY_CONFIGS.inventoryCoverage;

      expect(config.factType).toBe("shopify.inventory.coverage");
      expect(config.metric).toBe("daysOfCover");
      expect(config.thresholds.absoluteValue).toEqual({
        warning: 7,
        critical: 3,
      });
    });

    test("fulfillmentIssueRate config uses absolute value thresholds", () => {
      const config = ANOMALY_CONFIGS.fulfillmentIssueRate;

      expect(config.factType).toBe("shopify.fulfillment.issues");
      expect(config.metric).toBe("issueRate");
      expect(config.thresholds.absoluteValue).toEqual({
        warning: 0.1,
        critical: 0.25,
      });
    });
  });

  describe("Edge Cases", () => {
    const config: AnomalyDetectionConfig = {
      factType: "test.metric",
      metric: "value",
      thresholds: {
        percentChange: { warning: 0.15, critical: 0.3 },
      },
    };

    test("handles negative baseline", () => {
      const result = detectAnomaly(10, config, -10);

      // Percent change from negative baseline
      expect(result.percentChange).toBeDefined();
      expect(Number.isFinite(result.percentChange!)).toBe(true);
    });

    test("handles same value (no change)", () => {
      const result = detectAnomaly(100, config, 100);

      expect(result.isAnomaly).toBe(false);
      expect(result.percentChange).toBe(0);
      expect(result.delta).toBe(0);
    });

    test("handles very small values", () => {
      const result = detectAnomaly(0.001, config, 0.01);

      expect(result.percentChange).toBe(0.9); // 90% drop
      expect(result.isAnomaly).toBe(true);
    });

    test("returns safe message when no threshold configured", () => {
      const configNoThreshold: AnomalyDetectionConfig = {
        factType: "test.metric",
        metric: "value",
        thresholds: {},
      };

      const result = detectAnomaly(100, configNoThreshold);

      expect(result.isAnomaly).toBe(false);
      expect(result.message).toBe("No threshold configured");
    });
  });
});
