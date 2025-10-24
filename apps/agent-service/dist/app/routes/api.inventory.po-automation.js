/**
 * API Route: Purchase Order Automation
 *
 * GET /api/inventory/po-automation
 *
 * Auto-generates purchase orders from reorder alerts.
 * Flags POs >= $1000 for HITL approval.
 *
 * INVENTORY-011: Purchase Order Automation
 */
// React Router 7: Use Response.json() from "~/utils/http.server";
import { generateAllReorderAlerts } from "~/services/inventory/reorder-alerts";
import { autoGeneratePurchaseOrders } from "~/services/inventory/po-automation";
export async function loader({ request }) {
    try {
        // Mock products (same as reorder alerts endpoint)
        const mockProducts = [
            {
                productId: "prod_001",
                productName: "Premium Widget Pro",
                sku: "PWP-001",
                currentStock: 5,
                avgDailySales: 2.5,
                leadTimeDays: 7,
                maxDailySales: 5,
                maxLeadDays: 14,
                category: "general",
                costPerUnit: 24.99,
            },
            {
                productId: "prod_002",
                productName: "Deluxe Gadget Set",
                sku: "DGS-002",
                currentStock: 0,
                avgDailySales: 1.8,
                leadTimeDays: 10,
                maxDailySales: 4,
                maxLeadDays: 15,
                category: "general",
                costPerUnit: 45.0,
            },
        ];
        // Generate reorder alerts
        const alertSummary = await generateAllReorderAlerts(mockProducts);
        // Auto-generate purchase orders
        const poSummary = await autoGeneratePurchaseOrders(alertSummary.alerts);
        return Response.json({
            success: true,
            data: poSummary,
        });
    }
    catch (error) {
        console.error("[API] PO automation error:", error);
        return Response.json({
            success: false,
            error: error.message || "Failed to auto-generate purchase orders",
        }, { status: 500 });
    }
}
//# sourceMappingURL=api.inventory.po-automation.js.map