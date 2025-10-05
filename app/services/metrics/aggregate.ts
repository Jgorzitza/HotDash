import prisma from "../../db.server";
import { ServiceError, type ServiceResult } from "../types";

export interface ActivationAggregate {
  windowStart: string;
  windowEnd: string;
  totalActiveShops: number;
  activatedShops: number;
  activationRate: number;
}

export interface SlaAggregate {
  windowStart: string;
  windowEnd: string;
  sampleSize: number;
  medianMinutes: number | null;
  p90Minutes: number | null;
}

export interface OpsAggregateMetrics {
  activation?: ActivationAggregate;
  sla?: SlaAggregate;
}

export async function getOpsAggregateMetrics(): Promise<ServiceResult<OpsAggregateMetrics>> {
  const activationFact = await prisma.dashboardFact.findFirst({
    where: { factType: "metrics.activation.rolling7d" },
    orderBy: { createdAt: "desc" },
  });

  const slaFact = await prisma.dashboardFact.findFirst({
    where: { factType: "metrics.sla_resolution.rolling7d" },
    orderBy: { createdAt: "desc" },
  });

  if (!activationFact && !slaFact) {
    throw new ServiceError("Aggregate metrics unavailable", {
      scope: "metrics.aggregate",
      retryable: true,
    });
  }

  const latestFact = [activationFact, slaFact]
    .filter((fact): fact is NonNullable<typeof fact> => Boolean(fact))
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];

  const activation = activationFact?.value as ActivationAggregate | undefined;
  const sla = slaFact?.value as SlaAggregate | undefined;

  return {
    data: {
      activation,
      sla,
    },
    fact: latestFact,
    source: "fresh",
  };
}
