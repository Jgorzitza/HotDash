/**
 * API Route: Emergency Sourcing Action Card
 *
 * POST /api/vendor/action-card
 *
 * Generates Action Queue card for emergency sourcing recommendation
 * Used by Inventory agent to create actionable recommendations
 */
import type { ActionFunctionArgs } from "react-router";
export interface ActionCardRequest {
    variantId: string;
    bundleProductId: string;
}
export interface ActionCardResponse {
    success: boolean;
    actionCard?: {
        type: string;
        title: string;
        description: string;
        expectedRevenue: number;
        confidence: number;
        ease: number;
        evidence: Record<string, unknown>;
    };
    error?: string;
}
export declare function action({ request }: ActionFunctionArgs): Promise<import("node_modules/undici-types").Response>;
export declare function loader(): Promise<import("node_modules/undici-types").Response>;
//# sourceMappingURL=api.vendor.action-card.d.ts.map