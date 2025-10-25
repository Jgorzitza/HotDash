/**
 * Analytics Data Export API Route
 *
 * GET /api/analytics/export
 * Query params:
 * - type: "social" | "seo" | "ads" | "growth" | "all" (required)
 * - project: Shop domain (default: "occ")
 * - startDate: ISO date string (optional)
 * - endDate: ISO date string (optional)
 * - format: "csv" | "json" (default: "csv")
 *
 * Returns streaming CSV response with proper headers
 * CRITICAL: Uses Response constructor with stream, NOT json() helper
 */

import type { LoaderFunctionArgs } from "react-router";
import {
  createCSVStream,
  generateExportFilename,
  type ExportType,
} from "~/services/analytics/csv-export";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const type = (url.searchParams.get("type") || "all") as ExportType;
  const project = url.searchParams.get("project") || "occ";
  const startDateStr = url.searchParams.get("startDate");
  const endDateStr = url.searchParams.get("endDate");
  const format = url.searchParams.get("format") || "csv";

  // Validate export type
  const validTypes = ["social", "seo", "ads", "growth", "all"];
  if (!validTypes.includes(type)) {
    return new Response(
      JSON.stringify({
        success: false,
        error: `Invalid type. Must be one of: ${validTypes.join(", ")}`,
      }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }

  try {
    // Parse date filters
    const startDate = startDateStr ? new Date(startDateStr) : undefined;
    const endDate = endDateStr ? new Date(endDateStr) : undefined;

    // Generate filename
    const filename = generateExportFilename(type, format);

    // Create streaming response
    const stream = await createCSVStream({
      type,
      shopDomain: project,
      startDate,
      endDate,
      format: format as "csv" | "json",
    });

    // Return Response with stream and proper headers
    // Using Response constructor per React Router 7 pattern (NOT json() helper)
    return new Response(stream, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("CSV export API error:", error);

    // Return error response using Response constructor
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }
}
