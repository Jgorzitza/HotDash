/**
 * API Route: Vendor Reliability Update
 *
 * POST /api/vendor/reliability
 *
 * Updates vendor reliability score when PO is received
 * Used by Inventory agent to track vendor performance
 */
import type { ActionFunctionArgs } from "react-router";
export interface VendorReliabilityRequest {
    vendorId: string;
    expectedDate: string;
    actualDate: string;
}
export interface VendorReliabilityResponse {
    success: boolean;
    result?: {
        onTime: boolean;
        reliabilityScore: number;
        totalOrders: number;
        onTimeDeliveries: number;
    };
    error?: string;
}
export declare function action({ request }: ActionFunctionArgs): Promise<import("node_modules/undici-types").Response>;
export declare function loader(): Promise<import("node_modules/undici-types").Response>;
//# sourceMappingURL=api.vendor.reliability.d.ts.map