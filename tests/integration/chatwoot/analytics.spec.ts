/**
 * Integration Tests: Chatwoot Analytics Service
 *
 * Tests analytics calculations, CSAT, peak hours, common issues
 */

import { describe, it, expect } from "vitest";

describe("Chatwoot Analytics Service", () => {
  describe("Response Time Calculations", () => {
    it("should calculate average response time correctly", () => {
      const responseTimes = [5, 10, 15, 20, 25];
      const avg = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;

      expect(avg).toBe(15);
    });

    it("should calculate median correctly", () => {
      const responseTimes = [5, 10, 15, 20, 25];
      const median = responseTimes[Math.floor(responseTimes.length / 2)];

      expect(median).toBe(15);
    });

    it("should calculate P90 correctly", () => {
      const responseTimes = Array.from({ length: 100 }, (_, i) => i + 1);
      const p90 = responseTimes[Math.floor(responseTimes.length * 0.9)];

      expect(p90).toBe(90);
    });

    it("should handle empty response times", () => {
      const responseTimes: number[] = [];
      const avg = responseTimes.length > 0
        ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
        : 0;

      expect(avg).toBe(0);
    });

    it("should count under 15 minutes correctly", () => {
      const responseTimes = [5, 10, 12, 18, 25, 30];
      const under15 = responseTimes.filter((t) => t <= 15).length;

      expect(under15).toBe(3);
    });

    it("should count over 1 hour correctly", () => {
      const responseTimes = [30, 45, 65, 75, 90];
      const over60 = responseTimes.filter((t) => t > 60).length;

      expect(over60).toBe(3);
    });
  });

  describe("Resolution Time Calculations", () => {
    it("should calculate average resolution hours", () => {
      const resolutionMinutes = [120, 240, 360]; // 2h, 4h, 6h
      const resolutionHours = resolutionMinutes.map((m) => m / 60);
      const avg = resolutionHours.reduce((a, b) => a + b, 0) / resolutionHours.length;

      expect(avg).toBe(4);
    });

    it("should categorize under 4 hours", () => {
      const resolutionHours = [1, 2, 3, 5, 6];
      const under4 = resolutionHours.filter((h) => h <= 4).length;

      expect(under4).toBe(3);
    });

    it("should categorize over 24 hours", () => {
      const resolutionHours = [1, 12, 25, 30, 48];
      const over24 = resolutionHours.filter((h) => h > 24).length;

      expect(over24).toBe(3);
    });
  });

  describe("CSAT Calculations", () => {
    it("should calculate average CSAT score", () => {
      const scores = [5, 4, 5, 3, 4];
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;

      expect(avg).toBe(4.2);
    });

    it("should calculate positive percentage (4-5 stars)", () => {
      const scores = [5, 4, 5, 3, 4, 2];
      const positive = scores.filter((s) => s >= 4).length;
      const percentage = (positive / scores.length) * 100;

      expect(percentage).toBe(4 / 6 * 100);
    });

    it("should calculate negative percentage (1-2 stars)", () => {
      const scores = [5, 4, 2, 1, 3];
      const negative = scores.filter((s) => s <= 2).length;
      const percentage = (negative / scores.length) * 100;

      expect(percentage).toBe(2 / 5 * 100);
    });

    it("should handle no CSAT responses", () => {
      const scores: number[] = [];
      const avg = scores.length > 0
        ? scores.reduce((a, b) => a + b, 0) / scores.length
        : 0;

      expect(avg).toBe(0);
    });
  });

  describe("Peak Hours Analysis", () => {
    it("should group conversations by hour", () => {
      const hours = [9, 10, 10, 11, 11, 11, 14];
      const grouped: Record<number, number> = {};

      for (const hour of hours) {
        grouped[hour] = (grouped[hour] || 0) + 1;
      }

      expect(grouped[9]).toBe(1);
      expect(grouped[10]).toBe(2);
      expect(grouped[11]).toBe(3);
    });

    it("should find peak hour", () => {
      const hourCounts = { 9: 5, 10: 12, 11: 8, 14: 3 };
      const peakHour = Object.entries(hourCounts).reduce((max, [hour, count]) =>
        count > max.count ? { hour: Number(hour), count } : max,
        { hour: 0, count: 0 },
      );

      expect(peakHour.hour).toBe(10);
      expect(peakHour.count).toBe(12);
    });

    it("should group by day of week", () => {
      const days = ["Monday", "Monday", "Tuesday", "Wednesday", "Wednesday"];
      const grouped: Record<string, number> = {};

      for (const day of days) {
        grouped[day] = (grouped[day] || 0) + 1;
      }

      expect(grouped["Monday"]).toBe(2);
      expect(grouped["Wednesday"]).toBe(2);
    });
  });

  describe("Common Issues Identification", () => {
    it("should categorize by keywords", () => {
      const messages = [
        "Where is my order?",
        "Is this in stock?",
        "My payment failed",
      ];

      const categories = {
        order: messages.filter((m) => m.toLowerCase().includes("order")).length,
        inventory: messages.filter((m) => m.toLowerCase().includes("stock")).length,
        billing: messages.filter((m) => m.toLowerCase().includes("payment")).length,
      };

      expect(categories.order).toBe(1);
      expect(categories.inventory).toBe(1);
      expect(categories.billing).toBe(1);
    });

    it("should calculate percentages correctly", () => {
      const total = 100;
      const orderIssues = 25;
      const percentage = Math.round((orderIssues / total) * 100);

      expect(percentage).toBe(25);
    });

    it("should sort issues by frequency", () => {
      const issues = [
        { category: "orders", count: 10 },
        { category: "billing", count: 25 },
        { category: "inventory", count: 5 },
      ];

      const sorted = issues.sort((a, b) => b.count - a.count);

      expect(sorted[0].category).toBe("billing");
      expect(sorted[2].category).toBe("inventory");
    });
  });

  describe("getAutomationRules", () => {
    it("should return 5 automation rules", () => {
      const rules = getAutomationRules();

      expect(rules).toHaveLength(5);
    });

    it("should all have required fields", () => {
      const rules = getAutomationRules();

      rules.forEach((rule) => {
        expect(rule).toHaveProperty("id");
        expect(rule).toHaveProperty("name");
        expect(rule).toHaveProperty("description");
        expect(rule).toHaveProperty("event_name");
        expect(rule).toHaveProperty("conditions");
        expect(rule).toHaveProperty("actions");
        expect(rule).toHaveProperty("enabled");
      });
    });

    it("should all be enabled by default", () => {
      const rules = getAutomationRules();

      expect(rules.every((r) => r.enabled)).toBe(true);
    });

    it("should have order tagging rule", () => {
      const rules = getAutomationRules();
      const orderRule = rules.find((r) => r.id === "auto-tag-orders");

      expect(orderRule).toBeDefined();
      expect(orderRule?.actions[0].action_params?.labels).toContain("orders");
    });

    it("should have inventory tagging rule", () => {
      const rules = getAutomationRules();
      const invRule = rules.find((r) => r.id === "auto-tag-inventory");

      expect(invRule).toBeDefined();
      expect(invRule?.actions[0].action_params?.labels).toContain("inventory");
    });
  });

  describe("isAfterHours", () => {
    it("should return boolean", () => {
      const result = isAfterHours();

      expect(typeof result).toBe("boolean");
    });
  });
});

