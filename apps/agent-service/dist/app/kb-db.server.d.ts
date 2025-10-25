/**
 * KB DATABASE CLIENT
 *
 * This client connects to the Knowledge Base database for:
 * - Agent task assignments (TaskAssignment)
 * - Agent decision logging (DecisionLog)
 * - Development/coordination data
 *
 * This keeps development data separate from production business data.
 */
import { PrismaClient } from '@prisma/kb-client';
declare const kbPrisma: PrismaClient<{
    datasources: {
        db: {
            url: string;
        };
    };
    log: ("error" | "warn")[];
}, "error" | "warn", import("@prisma/kb-client/runtime/library").DefaultArgs>;
export default kbPrisma;
//# sourceMappingURL=kb-db.server.d.ts.map