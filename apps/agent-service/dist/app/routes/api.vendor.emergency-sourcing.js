/**
 * API Route: Vendor Emergency Sourcing
 *
 * POST /api/vendor/emergency-sourcing
 *
 * Analyzes emergency sourcing recommendation for OOS components
 * Returns vendor comparison and recommendation
 */
import { analyzeEmergencySourcing } from "~/services/inventory/emergency-sourcing";
export async function action({ request }) {
    if (request.method !== "POST") {
        return Response.json({ success: false, error: "Method not allowed" }, { status: 405 });
    }
    try {
        const body = await request.json();
        // Validate required fields
        if (!body.variantId || !body.bundleProductId) {
            return Response.json({ success: false, error: "variantId and bundleProductId are required" }, { status: 400 });
        }
        if (typeof body.bundleMargin !== "number" || body.bundleMargin <= 0) {
            return Response.json({ success: false, error: "bundleMargin must be a positive number" }, { status: 400 });
        }
        if (typeof body.avgBundleSalesPerDay !== "number" || body.avgBundleSalesPerDay < 0) {
            return Response.json({ success: false, error: "avgBundleSalesPerDay must be a non-negative number" }, { status: 400 });
        }
        if (typeof body.qtyNeeded !== "number" || body.qtyNeeded <= 0) {
            return Response.json({ success: false, error: "qtyNeeded must be a positive number" }, { status: 400 });
        }
        const input = {
            variantId: body.variantId,
            bundleProductId: body.bundleProductId,
            bundleMargin: body.bundleMargin,
            avgBundleSalesPerDay: body.avgBundleSalesPerDay,
            qtyNeeded: body.qtyNeeded,
        };
        const recommendation = await analyzeEmergencySourcing(input);
        const response = {
            success: true,
            recommendation,
        };
        return Response.json(response);
    }
    catch (error) {
        console.error("[Vendor Emergency Sourcing] Error:", error);
        return Response.json({
            success: false,
            error: error instanceof Error ? error.message : "Internal server error",
        }, { status: 500 });
    }
}
export async function loader() {
    return Response.json({ error: "Method not allowed. Use POST to analyze emergency sourcing." }, { status: 405 });
}
//# sourceMappingURL=api.vendor.emergency-sourcing.js.map