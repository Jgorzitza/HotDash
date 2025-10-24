/**
 * API Route: Emergency Sourcing Recommendation Status
 *
 * PUT /api/inventory/emergency/recommendations/:id/status
 *
 * Update emergency sourcing recommendation status
 *
 * Context7: /websites/reactrouter - action patterns
 * Context7: /microsoft/typescript - async/Promise types
 *
 * INVENTORY-101: Emergency Sourcing Logic
 */

import { type ActionFunctionArgs } from "react-router";
import { updateEmergencySourcingStatus } from "~/services/inventory/emergency-sourcing";

export async function action({ request, params }: ActionFunctionArgs) {
  try {
    const { id } = params;
    
    if (!id) {
      return Response.json(
        {
          success: false,
          error: "Recommendation ID is required",
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

    if (!status || !['pending', 'approved', 'rejected', 'implemented'].includes(status)) {
      return Response.json(
        {
          success: false,
          error: "Valid status is required (pending, approved, rejected, implemented)",
        },
        { status: 400 }
      );
    }

    // Update recommendation status
    const success = await updateEmergencySourcingStatus(id, status, approvedBy, notes);

    if (!success) {
      return Response.json(
        {
          success: false,
          error: "Failed to update recommendation status",
        },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      data: {
        recommendationId: id,
        status,
        approvedBy,
        notes,
        updatedAt: new Date().toISOString()
      }
    });
  } catch (error: any) {
    console.error("[API] Emergency sourcing status update error:", error);

    return Response.json(
      {
        success: false,
        error: error.message || "Failed to update recommendation status",
      },
      { status: 500 },
    );
  }
}
