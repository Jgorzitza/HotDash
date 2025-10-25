/**
 * API Route: Vendor Emergency Sourcing
 *
 * POST /api/vendor/emergency-sourcing
 *
 * Analyzes emergency sourcing recommendation for OOS components
 * Returns vendor comparison and recommendation
 */
import type { ActionFunctionArgs } from "react-router";
export interface EmergencySourcingRequest {
    variantId: string;
    bundleProductId: string;
    bundleMargin: number;
    avgBundleSalesPerDay: number;
    qtyNeeded: number;
}
export interface EmergencySourcingResponse {
    success: boolean;
    recommendation?: {
        shouldUseFastVendor: boolean;
        primaryVendor: {
            vendorId: string;
            vendorName: string;
            leadTimeDays: number;
            costPerUnit: number;
            totalCost: number;
            reliabilityScore: number;
        };
        localVendor: {
            vendorId: string;
            vendorName: string;
            leadTimeDays: number;
            costPerUnit: number;
            totalCost: number;
            reliabilityScore: number;
        };
        analysis: {
            daysSaved: number;
            feasibleSalesDuringSavedTime: number;
            expectedLostProfit: number;
            incrementalCost: number;
            netBenefit: number;
            resultingBundleMargin: number;
        };
        reason: string;
    };
    error?: string;
}
export declare function action({ request }: ActionFunctionArgs): Promise<import("node_modules/undici-types").Response>;
export declare function loader(): Promise<import("node_modules/undici-types").Response>;
//# sourceMappingURL=api.vendor.emergency-sourcing.d.ts.map