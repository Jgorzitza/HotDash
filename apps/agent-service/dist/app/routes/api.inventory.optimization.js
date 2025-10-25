/**
 * API Route: Inventory Optimization
 * INVENTORY-012: Optimization recommendations
 */
// React Router 7: Use Response.json() from "~/utils/http.server";
import { generateOptimizationReport } from "~/services/inventory/optimization";
export async function loader({ request }) {
    try {
        const mockProducts = [
            {
                productId: "prod_002",
                productName: "Deluxe Gadget Set",
                currentStock: 120,
                avgDailySales: 0.5,
                lastSaleDate: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000),
                costPerUnit: 45.0,
                abcClass: "C",
            },
            {
                productId: "prod_006",
                productName: "Professional Bundle",
                currentStock: 150,
                avgDailySales: 0.3,
                lastSaleDate: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000),
                costPerUnit: 129.99,
                abcClass: "C",
            },
        ];
        const optimization = await generateOptimizationReport(mockProducts);
        return Response.json({
            success: true,
            data: optimization,
        });
    }
    catch (error) {
        return Response.json({
            success: false,
            error: error.message || "Failed to generate optimization report",
        }, { status: 500 });
    }
}
//# sourceMappingURL=api.inventory.optimization.js.map