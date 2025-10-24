/**
 * API Route: Vendor Options
 *
 * GET /api/vendor/options?variantId=xxx
 *
 * Returns vendor dropdown options for UI integration
 * Used by Inventory agent for vendor selection
 */
import type { LoaderFunctionArgs } from "react-router";
export interface VendorOption {
    id: string;
    label: string;
    name: string;
    reliabilityScore: number;
    leadTimeDays: number;
    costPerUnit: number;
}
export interface VendorOptionsResponse {
    success: boolean;
    vendors?: VendorOption[];
    bestVendor?: VendorOption;
    error?: string;
}
export declare function loader({ request }: LoaderFunctionArgs): Promise<import("node_modules/undici-types").Response>;
export declare function action(): Promise<import("node_modules/undici-types").Response>;
//# sourceMappingURL=api.vendor.options.d.ts.map