#!/usr/bin/env tsx
/**
 * Get agent feedback from database
 */

import { prisma } from "../../app/config/database.server";

async function main() {
  const agent = process.argv[2];
  const limit = parseInt(process.argv[3] || "5");
  
  if (!agent) {
    console.error("Usage: npx tsx scripts/agent/get-my-feedback.ts <agent> [limit]");
    process.exit(1);
  }

  const feedback = await prisma.agentFeedback.findMany({
    where: { agent },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  console.log(`\n=== ${agent.toUpperCase()} FEEDBACK (Last ${limit}) ===\n`);
  
  if (feedback.length > 0) {
    feedback.forEach((f, i) => {
      console.log(`[${i + 1}] ${f.createdAt.toISOString()}`);
      console.log(`Progress: ${f.progress || "Not specified"}`);
      console.log(`Blockers: ${f.blockers || "None"}`);
      console.log(`Questions: ${f.questions || "None"}`);
      console.log(`Findings: ${f.findings || "None"}`);
      console.log("---");
    });
  } else {
    console.log("❌ No feedback found in database");
    console.log("\nThis is expected if agent hasn't logged any feedback yet.");
  }

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});

