import { Prisma } from "@prisma/client";
import prisma from "../prisma.server";

export interface RecordDashboardFactInput {
  shopDomain: string;
  factType: string;
  scope?: string;
  value: Prisma.InputJsonValue;
  metadata?: Prisma.InputJsonValue;
  evidenceUrl?: string | null;
}

export async function recordDashboardFact(input: RecordDashboardFactInput) {
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
