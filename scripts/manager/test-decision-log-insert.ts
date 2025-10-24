/**
 * Test inserting into DecisionLog table in KB database
 */

import "dotenv/config";
import kbPrisma from "../../app/kb-db.server";

const prisma = kbPrisma;

async function testInsert() {
  try {
    console.log("Testing DecisionLog insert...\n");
    
    const result = await prisma.decisionLog.create({
      data: {
        scope: "test",
        actor: "manager",
        action: "test_insert",
        rationale: "Testing database schema fix",
        evidenceUrl: "test.md",
        taskId: "TEST-001",
        status: "completed",
        progressPct: 100
      }
    });
    
    console.log("✅ SUCCESS! Inserted record:", result.id);
    console.log("   Created at:", result.createdAt);
    
    // Clean up
    await prisma.decisionLog.delete({ where: { id: result.id } });
    console.log("✅ Test record deleted\n");
    
  } catch (error) {
    console.error("❌ ERROR:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testInsert();

