/**
 * Growth Dashboard Metrics API Route
 * 
 * GET /api/analytics/growth-metrics
 * Query params:
 * - project: Shop domain (default: "occ")
 * - action: "summary" | "weekly" | "trends" | "dashboard" (default: "dashboard")
 * - days: Number of days for analysis (default: 30)
 * - weeks: Number of weeks for weekly report (default: 4)
 */

import { json, type LoaderFunctionArgs } from "react-router";
import {
  getGrowthMetrics,
  getWeeklyGrowthReport,
  getTrendAnalysis,
  getDashboardMetrics,
} from "~/services/analytics/growth-metrics";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const project = url.searchParams.get("project") || "occ";
  const action = url.searchParams.get("action") || "dashboard";
  const days = Number(url.searchParams.get("days")) || 30;
  const weeks = Number(url.searchParams.get("weeks")) || 4;

  try {
    // Get complete dashboard metrics
    if (action === "dashboard") {
      const dashboard = await getDashboardMetrics(project);
      return json({
        success: true,
        data: dashboard,
        meta: { project },
      });
    }

    // Get summary metrics only
    if (action === "summary") {
      const summary = await getGrowthMetrics(project, days);
      return json({
        success: true,
        data: summary,
        meta: { project, days },
      });
    }

    // Get weekly growth report
    if (action === "weekly") {
      const weekly = await getWeeklyGrowthReport(project, weeks);
      return json({
        success: true,
        data: weekly,
        meta: { project, weeks },
      });
    }

    // Get trend analysis
    if (action === "trends") {
      const trends = await getTrendAnalysis(project, days);
      return json({
        success: true,
        data: trends,
        meta: { project, days },
      });
    }

    // Invalid action
    return json(
      {
        success: false,
        error: `Invalid action: ${action}. Valid actions: dashboard, summary, weekly, trends`,
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("Growth metrics API error:", error);
    return json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

