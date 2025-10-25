/**
 * API Route: ROP Suggestion Status Management
 *
 * PUT /api/inventory/rop/suggestions/:id/status
 *
 * Update ROP suggestion status (approve, reject, order, cancel)
 *
 * Context7: /websites/reactrouter - action patterns
 * Context7: /microsoft/typescript - async/Promise types
 *
 * INVENTORY-100: ROP Calculation Engine
 */

import { type ActionFunctionArgs } from "react-router";
import { updateROPSuggestionStatus } from "~/services/inventory/rop-engine";

export async function action({ request, params }: ActionFunctionArgs) {
  try {
    const { id } = params;
    
    if (!id) {
      return Response.json(
        {
          success: false,
          error: "Suggestion ID is required",
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { 
      status, 
      approvedBy, 
      notes 
    } = body;

    if (!status || !['pending', 'approved', 'rejected', 'ordered', 'cancelled'].includes(status)) {
      return Response.json(
        {
          success: false,
          error: "Valid status is required (pending, approved, rejected, ordered, cancelled)",
        },
        { status: 400 }
      );
    }

    // Update suggestion status
    const success = await updateROPSuggestionStatus(id, status, approvedBy, notes);

    if (!success) {
      return Response.json(
        {
          success: false,
          error: "Failed to update suggestion status",
        },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      data: {
        suggestionId: id,
        status,
        approvedBy,
        notes,
        updatedAt: new Date().toISOString()
      }
    });
  } catch (error: any) {
    console.error("[API] ROP suggestion status update error:", error);

    return Response.json(
      {
        success: false,
        error: error.message || "Failed to update suggestion status",
      },
      { status: 500 },
    );
  }
}
