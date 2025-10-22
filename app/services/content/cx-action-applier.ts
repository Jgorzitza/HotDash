/**
 * CX Action Applier Service
 * 
 * Integrates Product agent's CX theme action generator with Content's implementation service.
 * Applies approved CX theme actions from Action Queue to Shopify products.
 */

import { applyCXContent, type CXContentType } from "./cx-content-implementation";
import type { CXThemeAction } from "~/services/product/cx-theme-actions";

/**
 * Maps Product agent's implementation type to Content agent's content type
 */
export function mapImplementationTypeToContentType(
  implementationType: string
): CXContentType | null {
  const mapping: Record<string, CXContentType> = {
    "add_size_chart": "size_chart",
    "add_dimensions": "dimensions",
    "add_installation_guide": "installation_guide",
    "add_warranty_section": "warranty",
  };
  
  return mapping[implementationType] || null;
}

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
export async function applyCXThemeAction(
  action: CXThemeAction,
  productId: string,
  request: Request
): Promise<CXActionApplicationResult> {
  try {
    // Map Product's implementation type to Content's content type
    const contentType = mapImplementationTypeToContentType(
      action.metadata.implementationType
    );
    
    if (!contentType) {
      console.warn(
        `[CX Action Applier] Unknown implementation type: ${action.metadata.implementationType}`
      );
      return {
        success: false,
        error: `Unsupported implementation type: ${action.metadata.implementationType}`,
      };
    }
    
    // Only apply content-type actions (skip SEO and product_update types)
    if (action.type !== "content") {
      console.log(
        `[CX Action Applier] Skipping non-content action type: ${action.type}`
      );
      return {
        success: false,
        error: `Action type "${action.type}" is not handled by Content agent. Use SEO or Integrations agent instead.`,
      };
    }
    
    // Extract content from action's draftCopy
    const content = action.draftCopy || "";
    
    if (!content.trim()) {
      return {
        success: false,
        error: "Action has no draft copy to apply",
      };
    }
    
    // Apply content using Content's implementation service
    const result = await applyCXContent(
      {
        productId,
        contentType,
        content,
        productHandle: action.metadata.productHandle,
      },
      request
    );
    
    if (!result.success) {
      return {
        success: false,
        productId,
        contentType,
        error: result.error,
      };
    }
    
    console.log(
      `[CX Action Applier] ✅ Applied ${contentType} to product ${productId} (from theme: "${action.metadata.theme}")`
    );
    
    return {
      success: true,
      productId,
      contentType,
      appliedAt: new Date().toISOString(),
    };
    
  } catch (error: any) {
    console.error("[CX Action Applier] Error:", error);
    
    return {
      success: false,
      error: error.message || "Unknown error occurred",
    };
  }
}

/**
 * Applies multiple approved CX theme actions in batch
 * 
 * @param actions - Array of CX theme actions
 * @param productIds - Map of product handle to Shopify GID
 * @param request - Request context
 * @returns Results for each action
 */
export async function applyMultipleCXThemeActions(
  actions: CXThemeAction[],
  productIds: Record<string, string>, // handle -> GID mapping
  request: Request
): Promise<CXActionApplicationResult[]> {
  const results: CXActionApplicationResult[] = [];
  
  for (const action of actions) {
    const productId = productIds[action.metadata.productHandle];
    
    if (!productId) {
      results.push({
        success: false,
        error: `Product not found for handle: ${action.metadata.productHandle}`,
      });
      continue;
    }
    
    const result = await applyCXThemeAction(action, productId, request);
    results.push(result);
  }
  
  return results;
}

/**
 * Retrieves CX theme actions from Action Queue (DashboardFact)
 * that are approved and ready for implementation
 * 
 * @param shopDomain - Shop domain
 * @returns Array of approved CX theme actions
 */
export async function getApprovedCXThemeActions(
  shopDomain: string
): Promise<CXThemeAction[]> {
  // Import here to avoid circular dependencies
  const { getDashboardFacts } = await import("~/services/facts.server");
  
  try {
    const facts = await getDashboardFacts(
      shopDomain,
      "product.cx_theme_action",
      7 // Last 7 days
    );
    
    // Filter for approved actions
    const approvedActions = facts.filter((fact) => {
      const metadata = fact.metadata as any;
      return metadata?.status === "approved";
    });
    
    // Extract CXThemeAction from DashboardFact values
    const actions: CXThemeAction[] = approvedActions.map((fact) => {
      return fact.value as unknown as CXThemeAction;
    });
    
    console.log(
      `[CX Action Applier] Found ${actions.length} approved CX theme actions`
    );
    
    return actions;
    
  } catch (error: any) {
    console.error("[CX Action Applier] Error retrieving approved actions:", error);
    return [];
  }
}

