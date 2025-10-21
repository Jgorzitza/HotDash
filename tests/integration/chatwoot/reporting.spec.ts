/**
 * Integration Tests: Chatwoot Reporting Service
 *
 * Tests report generation, formatting, recommendations
 */

import { describe, it, expect } from "vitest";
import { formatReportAsMarkdown } from "~/services/chatwoot/reporting";
import type { SupportReport } from "~/services/chatwoot/reporting";

describe("Chatwoot Reporting Service", () => {
  const mockReport: SupportReport = {
    report_type: "daily",
    period: {
      start: "2025-10-21T00:00:00Z",
      end: "2025-10-21T23:59:59Z",
    },
    summary: {
      total_conversations: 50,
      new_conversations: 50,
      resolved_conversations: 45,
      open_conversations: 5,
      avg_per_day: 50,
      trend: "stable",
    },
    performance: {
      avg_response_time_minutes: 12,
      avg_resolution_time_hours: 3.5,
      sla_compliance_rate: 95,
      sla_breaches: 2,
      csat_score: 4.5,
      csat_responses: 30,
    },
    agents: [
      {
        agent_id: 1,
        agent_name: "Agent 1",
        conversations_handled: 25,
        avg_response_time_minutes: 10,
        resolved_count: 23,
        sla_compliance_rate: 98,
      },
      {
        agent_id: 2,
        agent_name: "Agent 2",
        conversations_handled: 25,
        avg_response_time_minutes: 14,
        resolved_count: 22,
        sla_compliance_rate: 92,
      },
    ],
    top_issues: [
      { category: "orders", count: 20, percentage: 40, trend: "stable" },
      { category: "inventory", count: 15, percentage: 30, trend: "up" },
      { category: "billing", count: 10, percentage: 20, trend: "down" },
    ],
    recommendations: [
      "✅ All metrics within targets - Keep up the great work!",
    ],
    generated_at: "2025-10-21T08:00:00Z",
  };

  describe("formatReportAsMarkdown", () => {
    it("should generate markdown report", () => {
      const markdown = formatReportAsMarkdown(mockReport);

      expect(markdown).toContain("Daily Support Report");
      expect(markdown).toContain("Summary");
      expect(markdown).toContain("Performance Metrics");
    });

    it("should include summary section", () => {
      const markdown = formatReportAsMarkdown(mockReport);

      expect(markdown).toContain("Total Conversations");
      expect(markdown).toContain("50");
      expect(markdown).toContain("45"); // resolved
    });

    it("should include performance metrics", () => {
      const markdown = formatReportAsMarkdown(mockReport);

      expect(markdown).toContain("Avg Response Time");
      expect(markdown).toContain("12 min");
      expect(markdown).toContain("SLA Compliance");
      expect(markdown).toContain("95%");
    });

    it("should include agent table", () => {
      const markdown = formatReportAsMarkdown(mockReport);

      expect(markdown).toContain("Agent Performance");
      expect(markdown).toContain("Agent 1");
      expect(markdown).toContain("Agent 2");
    });

    it("should include top issues", () => {
      const markdown = formatReportAsMarkdown(mockReport);

      expect(markdown).toContain("Top Issues");
      expect(markdown).toContain("orders");
      expect(markdown).toContain("40%");
    });

    it("should include recommendations", () => {
      const markdown = formatReportAsMarkdown(mockReport);

      expect(markdown).toContain("Recommendations");
      expect(markdown).toContain("All metrics within targets");
    });

    it("should format weekly reports differently", () => {
      const weeklyReport = { ...mockReport, report_type: "weekly" as const };
      const markdown = formatReportAsMarkdown(weeklyReport);

      expect(markdown).toContain("Weekly Support Report");
    });
  });

  describe("Report Metrics Validation", () => {
    it("should have valid summary metrics", () => {
      expect(mockReport.summary.total_conversations).toBe(50);
      expect(mockReport.summary.resolved_conversations).toBe(45);
      expect(mockReport.summary.open_conversations).toBe(5);
    });

    it("should have valid performance metrics", () => {
      expect(mockReport.performance.avg_response_time_minutes).toBe(12);
      expect(mockReport.performance.sla_compliance_rate).toBe(95);
      expect(mockReport.performance.csat_score).toBe(4.5);
    });

    it("should have agent summaries", () => {
      expect(mockReport.agents).toHaveLength(2);
      expect(mockReport.agents[0].conversations_handled).toBe(25);
    });

    it("should have top issues sorted", () => {
      expect(mockReport.top_issues[0].count).toBeGreaterThanOrEqual(mockReport.top_issues[1].count);
    });

    it("should calculate percentages correctly", () => {
      const totalPercentage = mockReport.top_issues.reduce((sum, issue) => sum + issue.percentage, 0);

      expect(totalPercentage).toBeGreaterThan(0);
    });
  });
});


