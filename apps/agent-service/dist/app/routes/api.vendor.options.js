/**
 * API Route: Vendor Options
 *
 * GET /api/vendor/options?variantId=xxx
 *
 * Returns vendor dropdown options for UI integration
 * Used by Inventory agent for vendor selection
 */
import { getVendorOptions, getBestVendorForProduct } from "~/services/inventory/vendor-service";
export async function loader({ request }) {
    try {
        const url = new URL(request.url);
        const variantId = url.searchParams.get("variantId");
        const criteria = url.searchParams.get("criteria");
        // Get vendor options
        const vendors = await getVendorOptions(variantId || undefined);
        let bestVendor;
        // If variantId is provided, also get the best vendor
        if (variantId && criteria) {
            const bestVendorMapping = await getBestVendorForProduct(variantId, criteria);
            if (bestVendorMapping) {
                const reliabilityScore = Number(bestVendorMapping.vendor.reliabilityScore || 0);
                const costPerUnit = Number(bestVendorMapping.costPerUnit);
                bestVendor = {
                    id: bestVendorMapping.vendor.id,
                    label: `${bestVendorMapping.vendor.name} (${reliabilityScore.toFixed(0)}% reliable, ${bestVendorMapping.vendor.leadTimeDays}d lead, $${costPerUnit.toFixed(2)}/unit)`,
                    name: bestVendorMapping.vendor.name,
                    reliabilityScore,
                    leadTimeDays: bestVendorMapping.vendor.leadTimeDays,
                    costPerUnit,
                };
            }
        }
        const response = {
            success: true,
            vendors,
            bestVendor,
        };
        return Response.json(response);
    }
    catch (error) {
        console.error("[Vendor Options] Error:", error);
        return Response.json({
            success: false,
            error: error instanceof Error ? error.message : "Internal server error",
        }, { status: 500 });
    }
}
export async function action() {
    return Response.json({ error: "Method not allowed. Use GET to retrieve vendor options." }, { status: 405 });
}
//# sourceMappingURL=api.vendor.options.js.map