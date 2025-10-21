/**
 * Scheduled Analytics Reports API Route
 * 
 * GET /api/analytics/reports
 * Query params:
 * - frequency: "daily" | "weekly" | "monthly" (required)
 * - project: Shop domain (default: "occ")
 * - format: "json" | "email" (default: "json")
 * 
 * Returns generated report with email template
 * Uses Response.json() per React Router 7 pattern
 */

import type { LoaderFunctionArgs } from "react-router";
import {
  generateDailyReport,
  generateWeeklyReport,
  generateMonthlyReport,
  type ReportFrequency,
} from "~/services/analytics/scheduled-reports";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const frequency = url.searchParams.get("frequency") as ReportFrequency;
  const project = url.searchParams.get("project") || "occ";
  const format = url.searchParams.get("format") || "json";

  // Validate frequency
  const validFrequencies: ReportFrequency[] = ["daily", "weekly", "monthly"];
  if (!frequency || !validFrequencies.includes(frequency)) {
    return Response.json(
      {
        success: false,
        error: `Invalid frequency. Must be one of: ${validFrequencies.join(", ")}`,
      },
      { status: 400 }
    );
  }

  try {
    let report;

    switch (frequency) {
      case "daily":
        report = await generateDailyReport(project);
        break;
      case "weekly":
        report = await generateWeeklyReport(project);
        break;
      case "monthly":
        report = await generateMonthlyReport(project);
        break;
    }

    // Return email format if requested
    if (format === "email") {
      return Response.json({
        success: true,
        data: {
          to: `operator@${project}`,
          ...report.emailTemplate,
          reportId: report.reportId,
        },
        meta: { frequency, project, format },
      });
    }

    // Return full report JSON
    return Response.json({
      success: true,
      data: report,
      meta: { frequency, project, format },
    });
  } catch (error) {
    console.error("Scheduled reports API error:", error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}


