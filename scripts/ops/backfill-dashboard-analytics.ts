import { PrismaClient } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";

const prisma = new PrismaClient();

type DashboardFactRecord = {
  project: string;
  topic: string;
  key: string;
  value: unknown;
  created_at: string;
};

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

async function backfill(): Promise<void> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      "Missing SUPABASE_URL or SUPABASE_SERVICE_KEY environment variables.",
    );
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const prismaFacts = await prisma.dashboardFact.findMany({
    where: {
      factType: {
        in: ["dashboard.session.opened", "dashboard.refresh.triggered"],
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  const payload: DashboardFactRecord[] = prismaFacts.map((fact) => ({
    project: "occ",
    topic: "dashboard.analytics",
    key: fact.factType === "dashboard.session.opened" ? "view" : "refresh",
    value: fact.value,
    created_at: fact.createdAt.toISOString(),
  }));

  const { error: deleteError } = await supabase
    .from("facts")
    .delete()
    .match({ project: "occ", topic: "dashboard.analytics" });

  if (deleteError) {
    throw deleteError;
  }

  const batches = chunk(payload, 500);
  for (const batch of batches) {
    const { error } = await supabase.from("facts").insert(batch);
    if (error) {
      throw error;
    }
  }

  console.log(
    JSON.stringify(
      {
        inserted: payload.length,
        project: "occ",
        topic: "dashboard.analytics",
      },
      null,
      2,
    ),
  );
}

backfill()
  .catch((error) => {
    console.error("Backfill failed", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
