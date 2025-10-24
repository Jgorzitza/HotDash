import prisma from "~/db.server";
export async function loader({}) {
    try {
        // Count approvals by status, mapping 'assigned' to 'pending_review'
        const countsRaw = await prisma.taskAssignment.groupBy({
            by: ["status"],
            _count: { status: true },
        });
        const counts = {};
        for (const row of countsRaw) {
            const key = row.status === "assigned" ? "pending_review" : row.status;
            counts[key] = row._count.status;
        }
        // Find oldest pending (assigned to engineer) approval
        const oldest = await prisma.taskAssignment.findFirst({
            where: { status: "assigned", assignedTo: "engineer" },
            orderBy: { assignedAt: "asc" },
            select: { assignedAt: true },
        });
        return Response.json({
            success: true,
            data: {
                counts,
                pendingCount: counts["pending_review"] || 0,
                oldestPendingISO: oldest?.assignedAt?.toISOString() ?? null,
            },
        });
    }
    catch (error) {
        return Response.json({ success: false, error: error.message }, { status: 500 });
    }
}
//# sourceMappingURL=api.approvals.summary.js.map