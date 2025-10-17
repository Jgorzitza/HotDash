import { PrismaClient } from "@prisma/client";
import { supabaseMemory } from "../../packages/memory/supabase";
import type { Fact } from "../../packages/memory";
import { getSupabaseConfig } from "../../app/config/supabase.server";

const prisma = new PrismaClient();

type ParitySummary = {
  prisma: {
    viewCount: number;
    refreshCount: number;
  };
  supabase: {
    viewCount: number;
    refreshCount: number;
  };
  deltas: {
    view: number;
    refresh: number;
  };
  diffPct: {
    view: number;
    refresh: number;
  };
  timestamp: string;
};

function percentageDifference(
  prismaCount: number,
  supabaseCount: number,
): number {
  if (prismaCount === 0) {
    return supabaseCount === 0 ? 0 : 100;
  }

  const diff = Math.abs(prismaCount - supabaseCount);
  return Number(((diff / prismaCount) * 100).toFixed(2));
}

async function main() {
  const supabaseConfig = getSupabaseConfig();
  if (!supabaseConfig) {
    console.warn("Supabase not configured; skipping analytics parity check.");
    return;
  }

  const [prismaViewCount, prismaRefreshCount] = await Promise.all([
    prisma.dashboardFact.count({
      where: { factType: "dashboard.session.opened" },
    }),
    prisma.dashboardFact.count({
      where: { factType: "dashboard.refresh.triggered" },
    }),
  ]);

  const memory = supabaseMemory(supabaseConfig.url, supabaseConfig.serviceKey);

  let supabaseFacts: Fact[];
  try {
    supabaseFacts = await memory.getFacts("dashboard.analytics");
  } catch (error) {
    if (
      error &&
      typeof error === "object" &&
      "code" in (error as Record<string, unknown>) &&
      (error as Record<string, unknown>).code === "PGRST205"
    ) {
      const blocked = {
        event: "analytics.parity",
        status: "blocked",
        reason: "supabase.facts_table_missing",
        hint: "Run supabase/sql/analytics_facts_table.sql in Supabase to create the facts table.",
        timestamp: new Date().toISOString(),
      };
      console.error(JSON.stringify(blocked, null, 2));
      process.exitCode = 1;
      return;
    }
    throw error;
  }

  const supabaseViewCount = supabaseFacts.filter(
    (fact) => fact.key === "view",
  ).length;
  const supabaseRefreshCount = supabaseFacts.filter(
    (fact) => fact.key === "refresh",
  ).length;

  const summary: ParitySummary = {
    prisma: {
      viewCount: prismaViewCount,
      refreshCount: prismaRefreshCount,
    },
    supabase: {
      viewCount: supabaseViewCount,
      refreshCount: supabaseRefreshCount,
    },
    deltas: {
      view: supabaseViewCount - prismaViewCount,
      refresh: supabaseRefreshCount - prismaRefreshCount,
    },
    diffPct: {
      view: percentageDifference(prismaViewCount, supabaseViewCount),
      refresh: percentageDifference(prismaRefreshCount, supabaseRefreshCount),
    },
    timestamp: new Date().toISOString(),
  };

  console.log(JSON.stringify(summary, null, 2));

  const threshold = 1; // percent
  const parityBreached =
    summary.diffPct.view > threshold || summary.diffPct.refresh > threshold;

  if (parityBreached) {
    console.error(
      JSON.stringify({
        event: "analytics.parity",
        status: "failure",
        threshold,
        summary,
        timestamp: new Date().toISOString(),
      }),
    );
    process.exitCode = 1;
  }
}

main()
  .catch((error) => {
    console.error("Analytics parity check failed", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
