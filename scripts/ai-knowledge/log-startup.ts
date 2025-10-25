import prisma from "../../app/db.server";

async function logStartup() {
  console.log("🔧 Logging AI-Knowledge startup completion...\n");

  const result = await prisma.decisionLog.create({
    data: {
      scope: "build",
      actor: "ai-knowledge",
      action: "startup_complete",
      rationale: "Agent startup complete, found 5 active tasks, starting AI-KNOWLEDGE-001",
      evidenceUrl: "scripts/agent/get-my-tasks.ts",
    },
  });

  console.log("✅ Startup completion logged! ID:", result.id);
  console.log("   Created at:", result.createdAt);

  return result;
}

logStartup()
  .then((r) => {
    console.log("\n✅ DONE - Startup logged:", r.id);
    process.exit(0);
  })
  .catch((err) => {
    console.error("\n❌ ERROR:", err.message);
    process.exit(1);
  });
