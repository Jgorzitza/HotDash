/**
 * SECURE PRISMA CLIENT CONFIGURATION
 *
 * This file creates Prisma clients with agent-specific permissions.
 */
import { PrismaClient } from '@prisma/client';
declare const prisma: PrismaClient<{
    datasources: {
        db: {
            url: string;
        };
    };
    log: ("query" | "error" | "info" | "warn")[];
}, "query" | "error" | "info" | "warn", import("@prisma/client/runtime/library").DefaultArgs>;
export default prisma;
//# sourceMappingURL=db.server.d.ts.map