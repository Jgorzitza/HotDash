/**
 * CX Action Applier Service
 *
 * Integrates Product agent's CX theme action generator with Content's implementation service.
 * Applies approved CX theme actions from Action Queue to Shopify products.
 */
import { type CXContentType } from "./cx-content-implementation";
import type { CXThemeAction } from "~/services/product/cx-theme-actions";
/**
 * Maps Product agent's implementation type to Content agent's content type
 */
export declare function mapImplementationTypeToContentType(implementationType: string): CXContentType | null;
/**
 * Result of applying a CX theme action
 */
export interface CXActionApplicationResult {
    success: boolean;
    actionId?: string;
    productId?: string;
    contentType?: CXContentType;
    error?: string;
    appliedAt?: string;
}
/**
 * Applies an approved CX theme action to a Shopify product
 *
 * @param action - CX theme action from Product agent
 * @param productId - Shopify product GID
 * @param request - Request context for Shopify authentication
 * @returns Application result with success status
 */
export declare function applyCXThemeAction(action: CXThemeAction, productId: string, request: Request): Promise<CXActionApplicationResult>;
/**
 * Applies multiple approved CX theme actions in batch
 *
 * @param actions - Array of CX theme actions
 * @param productIds - Map of product handle to Shopify GID
 * @param request - Request context
 * @returns Results for each action
 */
export declare function applyMultipleCXThemeActions(actions: CXThemeAction[], productIds: Record<string, string>, // handle -> GID mapping
request: Request): Promise<CXActionApplicationResult[]>;
/**
 * Retrieves CX theme actions from Action Queue (DashboardFact)
 * that are approved and ready for implementation
 *
 * @param shopDomain - Shop domain
 * @returns Array of approved CX theme actions
 */
export declare function getApprovedCXThemeActions(shopDomain: string): Promise<CXThemeAction[]>;
//# sourceMappingURL=cx-action-applier.d.ts.map