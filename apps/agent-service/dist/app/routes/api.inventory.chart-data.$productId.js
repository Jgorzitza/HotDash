/**
 * API Route: Inventory Chart Data
 *
 * GET /api/inventory/chart-data/:productId
 *
 * Returns 14-day demand velocity data formatted for chart display.
 * Used by Inventory Modal to render historical demand trends.
 *
 * Context7: /websites/reactrouter - loader patterns
 * Context7: /microsoft/typescript - async/Promise types
 *
 * INVENTORY-006: Inventory Modal Backend Integration (Chart Data)
 */
// React Router 7: Use Response.json() from "~/utils/http.server";
import { get14DayDemandVelocity } from "~/services/inventory/demand-forecast";
export async function loader({ params }) {
    const { productId } = params;
    if (!productId) {
        return Response.json({
            success: false,
            error: "Product ID is required",
        }, { status: 400 });
    }
    try {
        // Get 14-day demand velocity data
        const velocityData = await get14DayDemandVelocity(productId);
        // Format for chart library (Chart.js compatible)
        const chartData = {
            labels: velocityData.map((day) => {
                const date = new Date(day.date);
                return date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                });
            }),
            datasets: [
                {
                    label: "Daily Sales",
                    data: velocityData.map((day) => day.quantity),
                    borderColor: "rgb(59, 130, 246)", // blue-500
                    backgroundColor: "rgba(59, 130, 246, 0.1)",
                    tension: 0.3, // Smooth line
                    fill: true,
                },
            ],
        };
        return Response.json({
            success: true,
            data: chartData,
            productId,
            dateRange: {
                start: velocityData[0]?.date || new Date().toISOString(),
                end: velocityData[velocityData.length - 1]?.date ||
                    new Date().toISOString(),
            },
            lastUpdated: new Date().toISOString(),
        });
    }
    catch (error) {
        console.error(`[API] Chart data error for ${productId}:`, error);
        return Response.json({
            success: false,
            error: error.message || "Failed to fetch chart data",
            productId,
        }, { status: 500 });
    }
}
//# sourceMappingURL=api.inventory.chart-data.$productId.js.map