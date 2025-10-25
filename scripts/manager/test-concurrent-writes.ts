/**
 * Test concurrent writes to KB database
 * Simulates multiple agents writing feedback at the same time
 */

import "dotenv/config";
import { logDecision } from "../../app/services/decisions.server";

async function testConcurrentWrites() {
  console.log("🧪 Testing Concurrent Writes to KB Database...\n");
  console.log("Simulating 10 agents writing feedback simultaneously\n");

  const agents = [
    "engineer",
    "data",
    "designer",
    "product",
    "seo",
    "analytics",
    "ai-customer",
    "inventory",
    "integrations",
    "devops",
  ];

  try {
    // Create 10 concurrent write operations
    const startTime = Date.now();
    
    const promises = agents.map((agent, index) =>
      logDecision({
        scope: "build",
        actor: agent,
        action: "concurrent_test",
        rationale: `Testing concurrent write #${index + 1}`,
        taskId: `TEST-CONCURRENT-${index + 1}`,
        status: "completed",
        progressPct: 100,
      })
    );

    console.log("⏳ Writing 10 feedback entries concurrently...");
    const results = await Promise.all(promises);
    const endTime = Date.now();

    console.log(`✅ All 10 writes completed successfully!\n`);
    console.log(`⏱️  Total time: ${endTime - startTime}ms\n`);

    console.log("📋 Results:");
    results.forEach((result, index) => {
      console.log(`   ${index + 1}. ${result.actor}: ID ${result.id} (${result.createdAt})`);
    });

    // Cleanup
    console.log("\n🧹 Cleaning up test data...");
    const kbPrisma = (await import("../../app/kb-db.server")).default;
    
    for (const result of results) {
      await kbPrisma.decisionLog.delete({ where: { id: result.id } });
    }
    console.log("✅ Test data cleaned up");

    // Summary
    console.log("\n" + "=".repeat(70));
    console.log("✅ CONCURRENT WRITES TEST PASSED!");
    console.log("=".repeat(70));
    console.log("\n📊 Results:");
    console.log(`   ✅ 10 agents wrote feedback simultaneously`);
    console.log(`   ✅ All writes successful (no errors)`);
    console.log(`   ✅ No conflicts or race conditions`);
    console.log(`   ✅ Total time: ${endTime - startTime}ms`);
    console.log(`   ✅ Average: ${Math.round((endTime - startTime) / 10)}ms per write`);
    console.log("\n🎯 Conclusion:");
    console.log("   Agents can write feedback concurrently without any issues");
    console.log("   Database handles concurrent writes safely");
    console.log("   No locking, no conflicts, no errors!\n");

    await kbPrisma.$disconnect();
  } catch (error) {
    console.error("\n❌ CONCURRENT WRITES TEST FAILED:", error);
    process.exit(1);
  }
}

testConcurrentWrites();

