#!/usr/bin/env tsx
/**
 * Get agent direction from database
 */

import prisma from "../../app/db.server";

async function main() {
  const agent = process.argv[2];
  
  if (!agent) {
    console.error("Usage: npx tsx scripts/agent/get-my-direction.ts <agent>");
    process.exit(1);
  }

  const direction = await prisma.agentDirection.findFirst({
    where: { agent },
    orderBy: { effectiveDate: "desc" },
  });

  console.log(`\n=== ${agent.toUpperCase()} DIRECTION ===\n`);
  
  if (direction) {
    console.log(`Version: ${direction.version}`);
    console.log(`Effective: ${direction.effectiveDate.toISOString()}`);
    console.log(`Status: ${direction.status}`);
    console.log(`\nObjective:\n${direction.objective}`);
    console.log(`\nConstraints:\n${direction.constraints}`);
    console.log(`\nToday's Focus:\n${direction.todayFocus}`);
    
    if (direction.activeIssues) {
      console.log(`\nActive Issues: ${direction.activeIssues}`);
    }
    
    if (direction.blockers) {
      console.log(`\nBlockers: ${direction.blockers}`);
    }
  } else {
    console.log("❌ No direction found in database");
    console.log("\nThis means Manager has not yet set direction for this agent.");
  }

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});

