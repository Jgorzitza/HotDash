/**
 * Data Validation API Route
 * 
 * GET /api/analytics/validation
 * Query params:
 * - project: Shop domain (default: "occ")
 * - days: Period to validate (default: 30)
 * 
 * Returns data quality report with score and issues
 * Uses Response.json() per React Router 7 pattern
 */

import type { LoaderFunctionArgs } from "react-router";
import { validateDataQuality } from "~/services/analytics/data-validation";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const project = url.searchParams.get("project") || "occ";
  const days = Number(url.searchParams.get("days")) || 30;

  try {
    const report = await validateDataQuality(project, days);

    return Response.json({
      success: true,
      data: report,
      meta: { project, days },
    });
  } catch (error) {
    console.error("Data validation API error:", error);
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

