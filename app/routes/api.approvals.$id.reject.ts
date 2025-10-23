/**
 * API Route: /api/approvals/[id]/reject
 *
 * Rejects an approval request with reason.
 */

import { json, type ActionFunctionArgs } from "react-router";
import { rejectRequest, getApprovalById } from "~/services/approvals";

export async function action({ params, request }: ActionFunctionArgs) {
  const { id } = params;

  if (!id) {
    return json(
      { success: false, error: "Missing approval ID" },
      { status: 400 },
    );
  }

  try {
    const formData = await request.formData();
    const reason = formData.get("reason") as string;

    if (!reason || reason.trim().length === 0) {
      return json(
        { success: false, error: "Rejection reason is required" },
        { status: 400 },
      );
    }

    // Validate approval exists and is in correct state
    const approval = await getApprovalById(id);
    if (!approval) {
      return json(
        { success: false, error: "Approval not found" },
        { status: 404 },
      );
    }

    if (approval.state !== "pending_review") {
      return json(
        {
          success: false,
          error: `Cannot reject approval in state: ${approval.state}`,
        },
        { status: 400 },
      );
    }

    // Execute rejection
    const result = await rejectRequest(id, reason.trim());

    if (!result.success) {
      return json(
        { success: false, error: "Failed to reject request" },
        { status: 500 },
      );
    }

    return json({
      success: true,
      message: "Approval rejected successfully",
      reason: reason.trim(),
    });
  } catch (error) {
    console.error("Error rejecting request:", error);
    return json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
