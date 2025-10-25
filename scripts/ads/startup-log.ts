import prisma from "../../app/db.server";

async function logStartup() {
  console.log("🚀 Logging ads agent startup...\n");

  const result = await prisma.decisionLog.create({
    data: {
      scope: "build",
      actor: "ads",
      action: "startup_complete",
      rationale: "Agent startup complete, found 3 active tasks, starting ADS-001",
      evidenceUrl: "scripts/agent/get-my-tasks.ts",
    },
  });

  console.log("✅ Startup logged! ID:", result.id);
  console.log("   Created at:", result.createdAt);

  return result;
}

logStartup()
  .then((r) => {
    console.log("\n✅ DONE - Result:", r.id);
    process.exit(0);
  })
  .catch((err) => {
    console.error("\n❌ ERROR:", err.message);
    process.exit(1);
  });
