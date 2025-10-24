import { Prisma } from "@prisma/client";
import prisma from "../db.server";
export async function recordDashboardFact(input) {
    const { shopDomain, factType, scope, value, metadata, evidenceUrl } = input;
    return prisma.dashboardFact.create({
        data: {
            shopDomain,
            factType,
            scope,
            value,
            metadata: metadata ?? Prisma.JsonNull,
            evidenceUrl: evidenceUrl ?? null,
        },
    });
}
//# sourceMappingURL=facts.server.js.map