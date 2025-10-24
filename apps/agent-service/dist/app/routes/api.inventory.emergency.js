/**
 * API Route: Emergency Sourcing Logic
 *
 * POST /api/inventory/emergency/calculate
 * GET /api/inventory/emergency/history/:bundleId
 * PUT /api/inventory/emergency/recommendations/:id/status
 *
 * Emergency sourcing recommendations with opportunity-cost logic:
 * - Calculates Expected Lost Profit = feasible_sales × bundle_margin
 * - Calculates Incremental Cost = (local_cost - primary_cost) × qty
 * - Recommends local vendor when ELP > IC and margin > 20%
 * - Shows comparison: primary vs local (cost, lead time, profit impact)
 * - Creates approval card for CEO review
 *
 * Context7: /websites/reactrouter - action patterns
 * Context7: /microsoft/typescript - async/Promise types
 *
 * INVENTORY-101: Emergency Sourcing Logic
 */
import { calculateEmergencySourcing, batchCalculateEmergencySourcing, getEmergencySourcingHistory } from "~/services/inventory/emergency-sourcing";
// GET /api/inventory/emergency/history/:bundleId - Get emergency sourcing history
export async function loader({ request, params }) {
    try {
        const { bundleId } = params;
        const url = new URL(request.url);
        const limit = parseInt(url.searchParams.get('limit') || '10');
        if (!bundleId) {
            return Response.json({
                success: false,
                error: "Bundle ID is required",
            }, { status: 400 });
        }
        const history = await getEmergencySourcingHistory(bundleId, limit);
        return Response.json({
            success: true,
            data: {
                bundleId,
                history,
                metadata: {
                    limit,
                    totalRecords: history.length,
                    queryDate: new Date().toISOString()
                }
            }
        });
    }
    catch (error) {
        console.error("[API] Emergency sourcing history error:", error);
        return Response.json({
            success: false,
            error: error.message || "Failed to fetch emergency sourcing history",
        }, { status: 500 });
    }
}
// POST /api/inventory/emergency/calculate - Calculate emergency sourcing
export async function action({ request }) {
    try {
        const body = await request.json();
        const { bundles, // Array of EmergencySourcingParams
        batch = false } = body;
        if (!bundles || !Array.isArray(bundles) || bundles.length === 0) {
            return Response.json({
                success: false,
                error: "Bundles array is required",
            }, { status: 400 });
        }
        // Validate bundle parameters
        for (const bundle of bundles) {
            const required = ['bundleId', 'blockingComponentId', 'primaryVendorId', 'primaryLeadTimeDays', 'primaryCost', 'bundleMargin', 'dailyVelocity'];
            const missing = required.filter(field => !bundle[field]);
            if (missing.length > 0) {
                return Response.json({
                    success: false,
                    error: `Missing required fields: ${missing.join(', ')}`,
                }, { status: 400 });
            }
        }
        let results;
        if (batch) {
            // Batch calculation for multiple bundles
            results = await batchCalculateEmergencySourcing(bundles);
        }
        else {
            // Individual calculations
            results = await Promise.all(bundles.map(bundle => calculateEmergencySourcing(bundle)));
        }
        return Response.json({
            success: true,
            data: {
                results,
                metadata: {
                    bundleCount: bundles.length,
                    batchMode: batch,
                    calculationDate: new Date().toISOString(),
                    recommendationsCount: results.filter(r => r.recommendation.shouldProceed).length
                }
            }
        });
    }
    catch (error) {
        console.error("[API] Emergency sourcing calculation error:", error);
        return Response.json({
            success: false,
            error: error.message || "Failed to calculate emergency sourcing",
        }, { status: 500 });
    }
}
//# sourceMappingURL=api.inventory.emergency.js.map