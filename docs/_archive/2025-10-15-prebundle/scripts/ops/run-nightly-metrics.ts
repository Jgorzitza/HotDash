import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface DashboardFactRow {
  shopDomain: string;
  factType: string;
  createdAt: Date;
  value: any;
  metadata: any;
}

async function loadRecentFacts(factType: string, since: Date) {
  return prisma.dashboardFact.findMany({
    where: {
      factType,
      createdAt: {
        gte: since,
      },
    },
    orderBy: { createdAt: "asc" },
  }) as unknown as Promise<DashboardFactRow[]>;
}

async function loadDecisions(scope: "ops", since: Date) {
  return prisma.decisionLog.findMany({
    where: {
      scope,
      createdAt: {
        gte: since,
      },
    },
    orderBy: { createdAt: "asc" },
  });
}

function startOfDay(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function sevenDaysAgo(): Date {
  const now = new Date();
  return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
}

async function computeActivation() {
  const since = sevenDaysAgo();
  const sessions = await loadRecentFacts("dashboard.session.opened", since);
  const decisions = await loadDecisions("ops", since);

  const shopsWithSessions = new Map<string, Date>();
  for (const session of sessions) {
    if (!shopsWithSessions.has(session.shopDomain)) {
      shopsWithSessions.set(session.shopDomain, session.createdAt);
    }
  }

  const activatedShops = new Set<string>();
  for (const decision of decisions) {
    if (decision.shopDomain && shopsWithSessions.has(decision.shopDomain)) {
      activatedShops.add(decision.shopDomain);
    }
  }

  return {
    windowStart: since.toISOString(),
    windowEnd: new Date().toISOString(),
    totalActiveShops: shopsWithSessions.size,
    activatedShops: activatedShops.size,
    activationRate:
      shopsWithSessions.size === 0
        ? 0
        : Number((activatedShops.size / shopsWithSessions.size).toFixed(4)),
  };
}

async function computeSlaResolution() {
  const since = sevenDaysAgo();
  const escalations = await loadRecentFacts("chatwoot.escalations", since);
  const decisions = await loadDecisions("ops", since);

  const resolutionDurations: number[] = [];

  for (const fact of escalations) {
    const breachList = Array.isArray(fact.metadata?.breaches)
      ? (fact.metadata?.breaches as Array<{ conversationId: number; breachedAt?: string | null }>)
      : [];

    for (const breach of breachList) {
      if (!breach?.breachedAt) continue;
      const breachedAt = new Date(breach.breachedAt).getTime();
      if (Number.isNaN(breachedAt)) continue;

      const matchingDecision = decisions.find((decision) => {
        if (!decision.externalRef) return false;
        if (!decision.externalRef.startsWith("chatwoot:")) return false;
        const id = Number.parseInt(decision.externalRef.split(":")[1] ?? "", 10);
        return Number.isFinite(id) && id === breach.conversationId;
      });

      if (!matchingDecision) continue;
      const resolutionAt = matchingDecision.createdAt.getTime();
      const durationMinutes = (resolutionAt - breachedAt) / (60 * 1000);
      if (durationMinutes >= 0) {
        resolutionDurations.push(durationMinutes);
      }
    }
  }

  if (resolutionDurations.length === 0) {
    return {
      windowStart: since.toISOString(),
      windowEnd: new Date().toISOString(),
      sampleSize: 0,
      medianMinutes: null,
      p90Minutes: null,
    };
  }

  const sorted = [...resolutionDurations].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];
  const p90 = sorted[Math.floor(sorted.length * 0.9)];

  return {
    windowStart: since.toISOString(),
    windowEnd: new Date().toISOString(),
    sampleSize: sorted.length,
    medianMinutes: Number(median.toFixed(2)),
    p90Minutes: Number(p90.toFixed(2)),
  };
}

async function upsertMetricFact(factType: string, scope: string, value: any, metadata: any) {
  await prisma.dashboardFact.create({
    data: {
      shopDomain: "__aggregate__",
      factType,
      scope,
      value,
      metadata,
    },
  });
}

async function run() {
  const activation = await computeActivation();
  const sla = await computeSlaResolution();

  await upsertMetricFact(
    "metrics.activation.rolling7d",
    "ops",
    activation,
    {
      generatedAt: new Date().toISOString(),
      notes: "Rolling 7-day activation computed from dashboard sessions and ops decisions",
    },
  );

  await upsertMetricFact(
    "metrics.sla_resolution.rolling7d",
    "ops",
    sla,
    {
      generatedAt: new Date().toISOString(),
      sampleSize: sla.sampleSize,
      notes: "Rolling 7-day Chatwoot SLA resolution durations",
    },
  );

  console.log("Nightly metrics job completed.");
}

run()
  .catch((error) => {
    console.error("Nightly metrics job failed", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
