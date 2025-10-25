/**
 * API Route: Emergency Sourcing Action Card
 *
 * POST /api/vendor/action-card
 *
 * Generates Action Queue card for emergency sourcing recommendation
 * Used by Inventory agent to create actionable recommendations
 */
import { generateEmergencySourcingAction } from "~/services/inventory/emergency-sourcing";
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
        const actionCard = await generateEmergencySourcingAction(body.variantId, body.bundleProductId);
        if (!actionCard) {
            return Response.json({ success: true, error: "No emergency sourcing action recommended" });
        }
        const response = {
            success: true,
            actionCard,
        };
        return Response.json(response);
    }
    catch (error) {
        console.error("[Vendor Action Card] Error:", error);
        return Response.json({
            success: false,
            error: error instanceof Error ? error.message : "Internal server error",
        }, { status: 500 });
    }
}
export async function loader() {
    return Response.json({ error: "Method not allowed. Use POST to generate action card." }, { status: 405 });
}
//# sourceMappingURL=api.vendor.action-card.js.map