/**
 * API Route: Inventory Reports
 * INVENTORY-013: Daily/weekly/monthly reports
 */

import { type LoaderFunctionArgs } from "react-router";
// React Router 7: Use Response.json() from "~/utils/http.server";
import { generateInventoryReport } from "~/services/inventory/reporting";

export async function loader({ params }: LoaderFunctionArgs) {
  const { period } = params;

  if (!period || !["daily", "weekly", "monthly"].includes(period)) {
    return Response.json(
      {
        success: false,
        error: "Invalid period. Use: daily, weekly, or monthly",
      },
      { status: 400 }
    );
  }

  try {
    const report = await generateInventoryReport(
      period as "daily" | "weekly" | "monthly"
    );

    return Response.json({
      success: true,
      data: report,
    });
  } catch (error: any) {
    return Response.json(
      {
        success: false,
        error: error.message || "Failed to generate inventory report",
      },
      { status: 500 }
    );
  }
}


