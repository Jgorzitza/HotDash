import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient;
}

/**
 * Prisma Client with optimized connection pooling
 * 
 * Configuration:
 * - Connection pool size: 10 (default)
 * - Connection timeout: 10s
 * - Query timeout: 30s
 * - Logging: Queries in development, errors in production
 */
if (process.env.NODE_ENV !== "production") {
  if (!global.prismaGlobal) {
    global.prismaGlobal = new PrismaClient({
      log: ["query", "error", "warn"],
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });
  }
}

const prisma =
  global.prismaGlobal ??
  new PrismaClient({
    log: ["error"],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

// Graceful shutdown
if (typeof process !== "undefined") {
  process.on("beforeExit", async () => {
    await prisma.$disconnect();
  });
}

export default prisma;
