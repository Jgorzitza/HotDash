/**
 * Check for old data in production DB (one-time operation)
 * Uses Supabase client to bypass Prisma
 */

import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

async function checkOldData() {
  console.log("🔍 Checking for old data in production DB...\n");

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Missing Supabase credentials");
    console.error("   Need: SUPABASE_URL and SUPABASE_SERVICE_KEY");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Check DecisionLog
  console.log("1️⃣ Checking DecisionLog table in production...");
  const { data: decisions, error: decisionsError, count: decisionsCount } =
    await supabase
      .from("DecisionLog")
      .select("*", { count: "exact", head: false })
      .order("created_at", { ascending: false })
      .limit(10);

  if (decisionsError) {
    console.log("   ❌ Error:", decisionsError.message);
    console.log("   (Table may not exist or may be empty)");
  } else {
    console.log(`   ✅ Total records: ${decisionsCount}`);
    if (decisions && decisions.length > 0) {
      console.log("   📋 Latest 5 records:");
      decisions.slice(0, 5).forEach((d: any) => {
        console.log(
          `      - ID ${d.id}: ${d.actor} - ${d.action} (${new Date(d.created_at).toISOString()})`
        );
      });
    } else {
      console.log("   ℹ️  Table is empty");
    }
  }

  // Check TaskAssignment
  console.log("\n2️⃣ Checking TaskAssignment table in production...");
  const { data: tasks, error: tasksError, count: tasksCount } = await supabase
    .from("TaskAssignment")
    .select("*", { count: "exact", head: false })
    .order("assignedAt", { ascending: false })
    .limit(10);

  if (tasksError) {
    console.log("   ❌ Error:", tasksError.message);
    console.log("   (Table may not exist or may be empty)");
  } else {
    console.log(`   ✅ Total records: ${tasksCount}`);
    if (tasks && tasks.length > 0) {
      console.log("   📋 Latest 5 records:");
      tasks.slice(0, 5).forEach((t: any) => {
        console.log(`      - ${t.taskId}: ${t.assignedTo} - ${t.title}`);
      });
    } else {
      console.log("   ℹ️  Table is empty");
    }
  }

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("📊 Summary:");
  console.log(`   DecisionLog: ${decisionsCount || 0} records`);
  console.log(`   TaskAssignment: ${tasksCount || 0} records`);

  if ((decisionsCount || 0) > 0 || (tasksCount || 0) > 0) {
    console.log("\n⚠️  OLD DATA FOUND - Need to migrate!");
    console.log("   Run: npx tsx scripts/manager/migrate-old-data.ts");
  } else {
    console.log("\n✅ No old data - safe to start fresh with KB DB");
  }
  console.log("=".repeat(60) + "\n");
}

checkOldData().catch(console.error);

