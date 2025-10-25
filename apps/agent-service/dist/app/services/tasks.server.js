import { Prisma } from "@prisma/client";
import prisma from "../db.server";
// ============================================================================
// ASSIGN TASK
// ============================================================================
export async function assignTask(input) {
    const task = await prisma.taskAssignment.create({
        data: {
            assignedBy: input.assignedBy,
            assignedTo: input.assignedTo,
            taskId: input.taskId,
            title: input.title,
            description: input.description,
            acceptanceCriteria: input.acceptanceCriteria,
            allowedPaths: input.allowedPaths,
            priority: input.priority,
            phase: input.phase,
            estimatedHours: input.estimatedHours,
            dependencies: input.dependencies || [],
            blocks: input.blocks || [],
            status: "assigned",
            evidenceUrl: input.evidenceUrl,
            issueUrl: input.issueUrl,
            payload: input.payload ?? Prisma.JsonNull,
        },
    });
    return task;
}
// ============================================================================
// UPDATE TASK STATUS
// ============================================================================
export async function updateTask(taskId, input) {
    const task = await prisma.taskAssignment.update({
        where: { taskId },
        data: {
            ...(input.status && { status: input.status }),
            ...(input.startedAt && { startedAt: input.startedAt }),
            ...(input.completedAt && { completedAt: input.completedAt }),
            ...(input.cancelledAt && { cancelledAt: input.cancelledAt }),
            ...(input.completionNotes && { completionNotes: input.completionNotes }),
            ...(input.cancellationReason && {
                cancellationReason: input.cancellationReason,
            }),
            ...(input.prUrl && { prUrl: input.prUrl }),
            ...(input.payload && { payload: input.payload }),
            updatedAt: new Date(),
        },
    });
    return task;
}
// ============================================================================
// QUERY FUNCTIONS FOR AGENTS
// ============================================================================
export async function getMyTasks(agent) {
    return await prisma.taskAssignment.findMany({
        where: {
            assignedTo: agent,
            status: { in: ["assigned", "in_progress", "blocked"] },
        },
        orderBy: [
            { priority: "asc" }, // P0 first
            { assignedAt: "asc" }, // Oldest first
        ],
    });
}
export async function getMyNextTask(agent) {
    // Get highest priority unblocked task
    const tasks = await prisma.taskAssignment.findMany({
        where: {
            assignedTo: agent,
            status: "assigned",
        },
        orderBy: [{ priority: "asc" }, { assignedAt: "asc" }],
        take: 10,
    });
    // Filter out tasks with unmet dependencies
    for (const task of tasks) {
        const deps = task.dependencies || [];
        if (deps.length === 0) {
            return task; // No dependencies, can start
        }
        // Check if all dependencies are completed
        const depStatus = await prisma.taskAssignment.findMany({
            where: {
                taskId: { in: deps },
            },
            select: { taskId: true, status: true },
        });
        const allComplete = depStatus.every((d) => d.status === "completed");
        if (allComplete) {
            return task; // Dependencies met
        }
    }
    return null; // All tasks have unmet dependencies
}
export async function getTaskDetails(taskId) {
    return await prisma.taskAssignment.findUnique({
        where: { taskId },
    });
}
// ============================================================================
// QUERY FUNCTIONS FOR MANAGER
// ============================================================================
export async function getAllAgentTasks() {
    return await prisma.taskAssignment.findMany({
        where: {
            status: { in: ["assigned", "in_progress", "blocked"] },
        },
        orderBy: [{ assignedTo: "asc" }, { priority: "asc" }],
    });
}
export async function getBlockedTasks() {
    return await prisma.taskAssignment.findMany({
        where: { status: "blocked" },
        orderBy: { assignedAt: "asc" },
    });
}
export async function getCompletedTasks(since) {
    const sinceDate = since || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // Last 7 days
    return await prisma.taskAssignment.findMany({
        where: {
            status: "completed",
            completedAt: { gte: sinceDate },
        },
        orderBy: { completedAt: "desc" },
    });
}
// ============================================================================
// BULK OPERATIONS
// ============================================================================
export async function assignMultipleTasks(tasks) {
    const results = [];
    for (const task of tasks) {
        try {
            const created = await assignTask(task);
            results.push({ success: true, taskId: created.taskId });
        }
        catch (error) {
            results.push({
                success: false,
                taskId: task.taskId,
                error: error instanceof Error ? error.message : String(error),
            });
        }
    }
    return results;
}
export async function completeTask(taskId, completionNotes) {
    return await updateTask(taskId, {
        status: "completed",
        completedAt: new Date(),
        completionNotes,
    });
}
export async function cancelTask(taskId, cancellationReason) {
    return await updateTask(taskId, {
        status: "cancelled",
        cancelledAt: new Date(),
        cancellationReason,
    });
}
//# sourceMappingURL=tasks.server.js.map