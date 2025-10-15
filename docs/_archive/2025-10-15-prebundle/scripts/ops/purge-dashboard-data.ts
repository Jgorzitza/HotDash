import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEFAULT_FACT_RETENTION_DAYS = 30;
const DEFAULT_ESCALATION_RETENTION_DAYS = 14;
const DEFAULT_SESSION_RETENTION_DAYS = 90;

const SHOPIFY_FACT_TYPES = [
  "shopify.sales.summary",
  "shopify.fulfillment.issues",
  "shopify.inventory.health",
];

const GA_FACT_TYPES = ["ga.sessions.anomalies"];
const CHATWOOT_FACT_TYPES = ["chatwoot.escalations"];

type NumberEnv =
  | "RETENTION_FACTS_DAYS"
  | "RETENTION_ESCALATIONS_DAYS"
  | "RETENTION_SESSIONS_DAYS";

function getNumberFromEnv(name: NumberEnv, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function subtractDays(days: number): Date {
  const now = Date.now();
  const msPerDay = 24 * 60 * 60 * 1000;
  return new Date(now - days * msPerDay);
}

async function purgeDashboardFacts(
  factTypes: string[],
  cutoff: Date,
): Promise<number> {
  if (factTypes.length === 0) return 0;
  const result = await prisma.dashboardFact.deleteMany({
    where: {
      factType: { in: factTypes },
      createdAt: { lt: cutoff },
    },
  });
  return result.count;
}

async function purgeSessions(cutoffDays: number): Promise<number> {
  const now = new Date();
  const cutoffDate = subtractDays(cutoffDays);

  const result = await prisma.session.deleteMany({
    where: {
      OR: [
        { expires: { lt: now } },
        { expires: { lt: cutoffDate } },
      ],
    },
  });

  return result.count;
}

async function main() {
  const retentionFactsDays = getNumberFromEnv(
    "RETENTION_FACTS_DAYS",
    DEFAULT_FACT_RETENTION_DAYS,
  );
  const retentionEscalationsDays = getNumberFromEnv(
    "RETENTION_ESCALATIONS_DAYS",
    DEFAULT_ESCALATION_RETENTION_DAYS,
  );
  const retentionSessionsDays = getNumberFromEnv(
    "RETENTION_SESSIONS_DAYS",
    DEFAULT_SESSION_RETENTION_DAYS,
  );

  const shopifyCutoff = subtractDays(retentionFactsDays);
  const gaCutoff = subtractDays(retentionFactsDays);
  const chatwootCutoff = subtractDays(retentionEscalationsDays);

  const startedAt = Date.now();

  const [shopifyDeleted, gaDeleted, chatwootDeleted, sessionDeleted] =
    await Promise.all([
      purgeDashboardFacts(SHOPIFY_FACT_TYPES, shopifyCutoff),
      purgeDashboardFacts(GA_FACT_TYPES, gaCutoff),
      purgeDashboardFacts(CHATWOOT_FACT_TYPES, chatwootCutoff),
      purgeSessions(retentionSessionsDays),
    ]);

  const durationMs = Number((Date.now() - startedAt).toFixed(2));

  const summary = {
    event: "retention.purge",
    timestamp: new Date().toISOString(),
    durationMs,
    config: {
      retentionFactsDays,
      retentionEscalationsDays,
      retentionSessionsDays,
    },
    results: {
      shopifyDeleted,
      gaDeleted,
      chatwootDeleted,
      sessionDeleted,
    },
  };

  console.log(JSON.stringify(summary, null, 2));
}

main()
  .catch((error) => {
    console.error("Retention purge failed", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
