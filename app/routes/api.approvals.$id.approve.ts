/**
 * API Route: /api/approvals/[id]/approve
 *
 * Approves an approval request and executes associated actions.
 */

import { json, type ActionFunctionArgs } from "react-router";
import { approveRequest, getApprovalById } from "~/services/approvals";

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
    const grades = {
      tone: Number(formData.get("tone")) || undefined,
      accuracy: Number(formData.get("accuracy")) || undefined,
      policy: Number(formData.get("policy")) || undefined,
    };

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
          error: `Cannot approve approval in state: ${approval.state}`,
        },
        { status: 400 },
      );
    }

    // Execute approval
    const result = await approveRequest(
      id,
      grades.tone && grades.accuracy && grades.policy ? grades : undefined,
    );

    if (!result.success) {
      return json(
        { success: false, error: "Failed to approve request" },
        { status: 500 },
      );
    }

    // Log tool call execution
    if (approval.actions && approval.actions.length > 0) {
      for (const action of approval.actions) {
        try {
          // Execute the action endpoint
          const response = await fetch(action.endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(action.payload),
          });

          if (!response.ok) {
            console.warn(
              `Action execution failed for ${action.endpoint}:`,
              response.statusText,
            );
          }
        } catch (error) {
          console.error(`Error executing action ${action.endpoint}:`, error);
        }
      }
    }

    return json({
      success: true,
      message: "Approval successful",
      grades:
        grades.tone && grades.accuracy && grades.policy ? grades : undefined,
    });
  } catch (error) {
    console.error("Error approving request:", error);
    return json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
