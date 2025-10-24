/**
 * API Route: /api/approvals/[id]/request-changes
 *
 * Requests changes to an approval request.
 */

import { type ActionFunctionArgs} from "react-router";
import { getApprovalById} from "~/services/approvals";
import { PrismaClient} from "@prisma/client";

const prisma = new PrismaClient();

export async function action({ params, request }: ActionFunctionArgs) {
  const { id } = params;

  if (!id) {
    return (
      { success: false, error: "Missing approval ID" },
      { status: 400 },
    );
  }

  try {
    const formData = await request.formData();
    const note = formData.get("note") as string;

    if (!note || note.trim().length === 0) {
      return (
        { success: false, error: "Change request note is required" },
        { status: 400 },
      );
    }

    // Validate approval exists and is in correct state
    const approval = await getApprovalById(id);
    if (!approval) {
      return (
        { success: false, error: "Approval not found" },
        { status: 404 },
      );
    }

    if (approval.state !== "pending_review") {
      return (
        {
          success: false,
          error: `Cannot request changes for approval in state: ${approval.state}`,
        },
        { status: 400 },
      );
    }

    // Update task with change request
    await prisma.taskAssignment.update({
      where: { taskId: id },
      data: {
        status: "assigned", // Reset to assigned for changes
        updatedAt: new Date(),
      },
    });

    // Log to approvals_history
    await prisma.$executeRaw`
      INSERT INTO approvals_history (conversation_id, tool_name, action, operator_name, details, project)
      VALUES (${id}, 'approval', 'request_changes', 'system', ${JSON.stringify({ note: note.trim() })}, 'occ')
    `;

    return Response.json({
      success: true,
      message: "Change request submitted successfully",
      note: note.trim(),
    });
  } catch (error) {
    console.error("Error requesting changes:", error);
    return (
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
