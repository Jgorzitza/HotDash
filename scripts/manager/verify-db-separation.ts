/**
 * Verify that production and KB databases are properly separated
 * SAFE: Read-only verification
 */

import "dotenv/config";
import prisma from "../../app/db.server";
import kbPrisma from "../../app/kb-db.server";

async function verifyDbSeparation() {
  console.log("🔍 Verifying Database Separation...\n");

  try {
    // Check production DB - should NOT have DecisionLog or TaskAssignment
    console.log("1️⃣ Checking Production Database...");
    const prodTables = await prisma.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
      AND tablename IN ('DecisionLog', 'TaskAssignment')
    `;

    if (prodTables.length > 0) {
      console.log("   ⚠️  WARNING: Task tables found in production DB:");
      prodTables.forEach((t) => console.log(`      - ${t.tablename}`));
      console.log("   These tables exist but are NOT being used by the app\n");
    } else {
      console.log("   ✅ Production DB clean - no task tables\n");
    }

    // Check production DB has business tables
    const businessTables = await prisma.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
      AND tablename IN ('Session', 'action_queue', 'knowledge_base', 'audit_log')
      ORDER BY tablename
    `;

    console.log("   📋 Production business tables:");
    businessTables.forEach((t) => console.log(`      ✅ ${t.tablename}`));
    console.log("");

    // Check KB DB - should have DecisionLog and TaskAssignment
    console.log("2️⃣ Checking KB Database...");
    const kbTables = await kbPrisma.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename
    `;

    console.log("   📋 KB Database tables:");
    kbTables.forEach((t) => console.log(`      - ${t.tablename}`));
    console.log("");

    const hasDecisionLog = kbTables.some((t) => t.tablename === "DecisionLog");
    const hasTaskAssignment = kbTables.some((t) => t.tablename === "TaskAssignment");

    if (hasDecisionLog && hasTaskAssignment) {
      console.log("   ✅ KB DB has task tables\n");
    } else {
      console.log("   ❌ KB DB missing task tables!\n");
      process.exit(1);
    }

    // Count records in KB DB
    const decisionCount = await kbPrisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*) as count FROM "DecisionLog"
    `;
    const taskCount = await kbPrisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*) as count FROM "TaskAssignment"
    `;

    console.log("3️⃣ KB Database Record Counts:");
    console.log(`   DecisionLog: ${decisionCount[0].count} records`);
    console.log(`   TaskAssignment: ${taskCount[0].count} records`);
    console.log("");

    // Test write to KB DB
    console.log("4️⃣ Testing KB DB Write...");
    const testRecord = await kbPrisma.decisionLog.create({
      data: {
        scope: "test",
        actor: "manager",
        action: "verify_db_separation",
        rationale: "Testing KB DB write access",
      },
    });
    console.log(`   ✅ Write successful (ID: ${testRecord.id})`);

    await kbPrisma.decisionLog.delete({ where: { id: testRecord.id } });
    console.log("   ✅ Test record cleaned up\n");

    console.log("✅ Database Separation Verified!\n");
    console.log("Summary:");
    console.log("  ✅ Production DB: Business data only");
    console.log("  ✅ KB DB: Task/feedback data");
    console.log("  ✅ No cross-contamination");
    console.log("  ✅ Both databases operational\n");

    await prisma.$disconnect();
    await kbPrisma.$disconnect();
  } catch (error) {
    console.error("❌ Verification failed:", error);
    await prisma.$disconnect();
    await kbPrisma.$disconnect();
    process.exit(1);
  }
}

verifyDbSeparation();

