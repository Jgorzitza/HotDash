import prisma from "../../db.server";
import { ServiceError } from "../types";
export async function getOpsAggregateMetrics() {
    const activationFact = await prisma.dashboardFact.findFirst({
        where: { factType: "metrics.activation.rolling7d" },
        orderBy: { createdAt: "desc" },
        select: { id: true, createdAt: true, factType: true, value: true },
    });
    const slaFact = await prisma.dashboardFact.findFirst({
        where: { factType: "metrics.sla_resolution.rolling7d" },
        orderBy: { createdAt: "desc" },
        select: { id: true, createdAt: true, factType: true, value: true },
    });
    if (!activationFact && !slaFact) {
        throw new ServiceError("Aggregate metrics unavailable", {
            scope: "metrics.aggregate",
            retryable: true,
        });
    }
    const latestFact = [activationFact, slaFact]
        .filter((fact) => Boolean(fact))
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
    const activation = activationFact?.value;
    const sla = slaFact?.value;
    return {
        data: {
            activation,
            sla,
        },
        fact: latestFact,
        source: "fresh",
    };
}
//# sourceMappingURL=aggregate.js.map