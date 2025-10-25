import { Prisma } from "@prisma/client";
export interface RecordDashboardFactInput {
    shopDomain: string;
    factType: string;
    scope?: string;
    value: Prisma.InputJsonValue;
    metadata?: Prisma.InputJsonValue;
    evidenceUrl?: string | null;
}
export declare function recordDashboardFact(input: RecordDashboardFactInput): Promise<any>;
//# sourceMappingURL=facts.server.d.ts.map