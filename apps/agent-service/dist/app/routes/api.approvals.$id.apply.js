/**
 * API Route: /api/approvals/[id]/apply
 *
 * Applies an approved request (moves from approved to applied state).
 */
import { getApprovalById } from "~/services/approvals";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
export async function action({ params }) {
    const { id } = params;
    if (!id) {
        return ({ success: false, error: "Missing approval ID" },
            { status: 400 },
        );
    }
    try {
        // Validate approval exists and is in correct state
        const approval = await getApprovalById(id);
        if (!approval) {
            return ({ success: false, error: "Approval not found" },
                { status: 404 },
            );
        }
        if (approval.state !== "approved") {
            return ({
                success: false,
                error: `Cannot apply approval in state: ${approval.state}`,
            },
                { status: 400 },
            );
        }
        // Update task to completed
        await prisma.taskAssignment.update({
            where: { taskId: id },
            data: {
                status: "completed",
                completedAt: new Date(),
                updatedAt: new Date(),
            },
        });
        // Log to approvals_history
        await prisma.$executeRaw `
      INSERT INTO approvals_history (conversation_id, tool_name, action, operator_name, details, project)
      VALUES (${id}, 'approval', 'applied', 'system', ${JSON.stringify({ applied_at: new Date().toISOString() })}, 'occ')
    `;
        return Response.json({
            success: true,
            message: "Approval applied successfully",
        });
    }
    catch (error) {
        console.error("Error applying approval:", error);
        return ({ success: false, error: "Internal server error" },
            { status: 500 },
        );
    }
}
//# sourceMappingURL=api.approvals.$id.apply.js.map