/**
 * Approvals Service
 *
 * Business logic for approval workflows
 */

import { PrismaClient } from "@prisma/client";
import type { Approval } from "~/components/approvals/ApprovalsDrawer";

const prisma = new PrismaClient();

/**
 * Get all pending approvals
 */
export async function getPendingApprovals(): Promise<Approval[]> {
  try {
    const approvals = await prisma.taskAssignment.findMany({
      where: {
        status: "assigned",
        assignedTo: "engineer",
      },
      orderBy: {
        priority: "asc",
      },
    });

    return approvals.map((approval) => ({
      id: approval.taskId,
      kind: "misc" as const,
      state: "pending_review" as const,
      summary: approval.title,
      created_by: approval.assignedBy,
      evidence: {
        what_changes: approval.description,
        why_now: `Priority: ${approval.priority}`,
        impact_forecast: `Phase: ${approval.phase || "N/A"}`,
      },
      impact: {
        expected_outcome: `Complete ${approval.title}`,
        metrics_affected: ["task_completion"],
        user_experience: "Improved workflow efficiency",
        business_value: `Priority ${approval.priority} task completion`,
      },
      risk: {
        what_could_go_wrong: "Implementation issues or scope changes",
        recovery_time: "1-2 hours",
      },
      rollback: {
        steps: [
          "Revert code changes",
          "Update task status to assigned",
          "Notify stakeholders of rollback",
        ],
        artifact_location: "Git repository",
      },
      actions: [
        {
          endpoint: `/api/approvals/${approval.taskId}/approve`,
          payload: { taskId: approval.taskId },
        },
      ],
      created_at: approval.assignedAt.toISOString(),
      updated_at: approval.updatedAt.toISOString(),
    }));
  } catch (error) {
    console.error("Error fetching pending approvals:", error);
    return [];
  }
}

/**
 * Get approval by ID
 */
export async function getApprovalById(id: string): Promise<Approval | null> {
  try {
    const task = await prisma.taskAssignment.findUnique({
      where: { taskId: id },
    });

    if (!task) return null;

    return {
      id: task.taskId,
      kind: "misc" as const,
      state:
        task.status === "assigned"
          ? "pending_review"
          : task.status === "completed"
            ? "approved"
            : "draft",
      summary: task.title,
      created_by: task.assignedBy,
      reviewer: task.assignedTo,
      evidence: {
        what_changes: task.description,
        why_now: `Priority: ${task.priority}`,
        impact_forecast: `Phase: ${task.phase || "N/A"}`,
      },
      impact: {
        expected_outcome: `Complete ${task.title}`,
        metrics_affected: ["task_completion"],
        user_experience: "Improved workflow efficiency",
        business_value: `Priority ${task.priority} task completion`,
      },
      risk: {
        what_could_go_wrong: "Implementation issues or scope changes",
        recovery_time: "1-2 hours",
      },
      rollback: {
        steps: [
          "Revert code changes",
          "Update task status to assigned",
          "Notify stakeholders of rollback",
        ],
        artifact_location: "Git repository",
      },
      actions: [
        {
          endpoint: `/api/approvals/${task.taskId}/approve`,
          payload: { taskId: task.taskId },
        },
      ],
      created_at: task.assignedAt.toISOString(),
      updated_at: task.updatedAt.toISOString(),
    };
  } catch (error) {
    console.error("Error fetching approval by ID:", error);
    return null;
  }
}

/**
 * Approve an approval request
 */
export async function approveRequest(
  id: string,
  grades?: {
    tone: number;
    accuracy: number;
    policy: number;
  },
): Promise<{ success: boolean }> {
  try {
    // Update task status to in_progress
    await prisma.taskAssignment.update({
      where: { taskId: id },
      data: {
        status: "in_progress",
        startedAt: new Date(),
      },
    });

    // Log to approvals_history if grades provided
    if (grades) {
      await prisma.$executeRaw`
        INSERT INTO approvals_history (conversation_id, tool_name, action, operator_name, details, project)
        VALUES (${id}, 'approval', 'approved', 'system', ${JSON.stringify(grades)}, 'occ')
      `;
    }

    return { success: true };
  } catch (error) {
    console.error("Error approving request:", error);
    return { success: false };
  }
}

/**
 * Reject an approval request
 */
export async function rejectRequest(
  id: string,
  reason: string,
): Promise<{ success: boolean }> {
  try {
    // Update task status to cancelled
    await prisma.taskAssignment.update({
      where: { taskId: id },
      data: {
        status: "cancelled",
        cancellationReason: reason,
        cancelledAt: new Date(),
      },
    });

    // Log to approvals_history
    await prisma.$executeRaw`
      INSERT INTO approvals_history (conversation_id, tool_name, action, operator_name, details, project)
      VALUES (${id}, 'approval', 'rejected', 'system', ${JSON.stringify({ reason })}, 'occ')
    `;

    return { success: true };
  } catch (error) {
    console.error("Error rejecting request:", error);
    return { success: false };
  }
}

/**
 * Get approvals with optional filters
 */
export async function getApprovals(filters?: {
  state?: string;
  kind?: string;
  limit?: number;
  offset?: number;
}): Promise<{ approvals: Approval[]; total: number; error: string | null }> {
  try {
    const where: any = {};

    if (filters?.state) {
      where.status =
        filters.state === "pending_review" ? "assigned" : filters.state;
    }

    const [approvals, total] = await Promise.all([
      prisma.taskAssignment.findMany({
        where,
        take: filters?.limit || 50,
        skip: filters?.offset || 0,
        orderBy: { assignedAt: "desc" },
      }),
      prisma.taskAssignment.count({ where }),
    ]);

    const mappedApprovals = approvals.map((approval) => ({
      id: approval.taskId,
      kind: "misc" as const,
      state:
        approval.status === "assigned"
          ? "pending_review"
          : approval.status === "completed"
            ? "approved"
            : "draft",
      summary: approval.title,
      created_by: approval.assignedBy,
      reviewer: approval.assignedTo,
      evidence: {
        what_changes: approval.description,
        why_now: `Priority: ${approval.priority}`,
        impact_forecast: `Phase: ${approval.phase || "N/A"}`,
      },
      impact: {
        expected_outcome: `Complete ${approval.title}`,
        metrics_affected: ["task_completion"],
        user_experience: "Improved workflow efficiency",
        business_value: `Priority ${approval.priority} task completion`,
      },
      risk: {
        what_could_go_wrong: "Implementation issues or scope changes",
        recovery_time: "1-2 hours",
      },
      rollback: {
        steps: [
          "Revert code changes",
          "Update task status to assigned",
          "Notify stakeholders of rollback",
        ],
        artifact_location: "Git repository",
      },
      actions: [
        {
          endpoint: `/api/approvals/${approval.taskId}/approve`,
          payload: { taskId: approval.taskId },
        },
      ],
      created_at: approval.assignedAt.toISOString(),
      updated_at: approval.updatedAt.toISOString(),
    }));

    return { approvals: mappedApprovals, total, error: null };
  } catch (error) {
    console.error("Error fetching approvals:", error);
    return {
      approvals: [],
      total: 0,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get approval counts by state
 */
export async function getApprovalCounts(): Promise<Record<string, number>> {
  try {
    const counts = await prisma.taskAssignment.groupBy({
      by: ["status"],
      _count: { status: true },
    });

    const result: Record<string, number> = {};
    counts.forEach((count) => {
      const state =
        count.status === "assigned" ? "pending_review" : count.status;
      result[state] = count._count.status;
    });

    return result;
  } catch (error) {
    console.error("Error fetching approval counts:", error);
    return {};
  }
}
