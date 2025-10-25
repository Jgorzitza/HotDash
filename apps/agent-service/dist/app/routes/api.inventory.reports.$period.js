/**
 * API Route: Inventory Reports
 * INVENTORY-013: Daily/weekly/monthly reports
 */
// React Router 7: Use Response.json() from "~/utils/http.server";
import { generateInventoryReport } from "~/services/inventory/reporting";
export async function loader({ params }) {
    const { period } = params;
    if (!period || !["daily", "weekly", "monthly"].includes(period)) {
        return Response.json({
            success: false,
            error: "Invalid period. Use: daily, weekly, or monthly",
        }, { status: 400 });
    }
    try {
        const report = await generateInventoryReport(period);
        return Response.json({
            success: true,
            data: report,
        });
    }
    catch (error) {
        return Response.json({
            success: false,
            error: error.message || "Failed to generate inventory report",
        }, { status: 500 });
    }
}
//# sourceMappingURL=api.inventory.reports.$period.js.map