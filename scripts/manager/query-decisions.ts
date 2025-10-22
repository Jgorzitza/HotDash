import "dotenv/config";
import prisma from "../../app/db.server";

async function queryDecisions() {
  console.log("📊 Querying decision_log for Manager entries...\n");

  const decisions = await prisma.decisionLog.findMany({
    where: { actor: "manager" },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  console.log(`Found ${decisions.length} manager decisions:\n`);
  console.log("=".repeat(80));

  decisions.forEach((d, i) => {
    console.log(
      `\n${i + 1}. ID: ${d.id} | Scope: ${d.scope} | Action: ${d.action}`,
    );
    console.log(`   Rationale: ${d.rationale || "N/A"}`);
    console.log(`   Evidence: ${d.evidenceUrl || "N/A"}`);
    console.log(`   Created: ${d.createdAt.toISOString()}`);
    if (d.payload && typeof d.payload === "object") {
      console.log(`   Payload: ${JSON.stringify(d.payload)}`);
    }
  });

  console.log("\n" + "=".repeat(80));
  console.log(`\n✅ Total Manager Decisions: ${decisions.length}`);

  await prisma.$disconnect();
}

queryDecisions().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
