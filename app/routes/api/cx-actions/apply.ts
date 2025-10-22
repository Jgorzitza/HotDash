/**
 * POST /api/cx-actions/apply
 * 
 * Applies approved CX theme actions to Shopify products
 * Called when operator approves a CX theme action in the Action Queue
 */

import type { ActionFunctionArgs } from "react-router";
import { applyCXThemeAction, getApprovedCXThemeActions } from "~/services/content/cx-action-applier";
import type { CXThemeAction } from "~/services/product/cx-theme-actions";

interface ApplyActionRequest {
  actionId?: string; // Optional: specific action ID to apply
  productId: string; // Shopify product GID
  action: CXThemeAction; // Full action object from Action Queue
}

export async function action({ request }: ActionFunctionArgs) {
  try {
    // Parse request body
    const body: ApplyActionRequest = await request.json();
    
    // Validate required fields
    if (!body.productId) {
      return Response.json(
        { success: false, error: "productId is required" },
        { status: 400 }
      );
    }
    
    if (!body.action) {
      return Response.json(
        { success: false, error: "action is required" },
        { status: 400 }
      );
    }
    
    // Validate action has required fields
    if (!body.action.metadata?.implementationType) {
      return Response.json(
        { success: false, error: "action.metadata.implementationType is required" },
        { status: 400 }
      );
    }
    
    if (!body.action.draftCopy) {
      return Response.json(
        { success: false, error: "action.draftCopy is required (no content to apply)" },
        { status: 400 }
      );
    }
    
    // Apply the CX theme action
    const result = await applyCXThemeAction(
      body.action,
      body.productId,
      request
    );
    
    if (!result.success) {
      console.error("[CX Actions API] Failed to apply action:", result.error);
      
      return Response.json(
        {
          success: false,
          error: result.error,
        },
        { status: 500 }
      );
    }
    
    console.log(
      `[CX Actions API] ✅ Applied ${result.contentType} to product ${result.productId}`
    );
    
    // TODO: Update Action Queue status to "applied" (requires Action Queue integration)
    // TODO: Record application in DecisionLog for audit trail
    
    return Response.json({
      success: true,
      productId: result.productId,
      contentType: result.contentType,
      appliedAt: result.appliedAt,
      message: `Successfully applied ${result.contentType} to product`,
    });
    
  } catch (error: any) {
    console.error("[CX Actions API] Error:", error);
    
    return Response.json(
      {
        success: false,
        error: error.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}

