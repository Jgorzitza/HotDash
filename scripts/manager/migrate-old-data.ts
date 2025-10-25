/**
 * Migrate old data from production DB to KB DB (one-time operation)
 * SAFE: Only reads from production, writes to KB DB
 */

import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import kbPrisma from "../../app/kb-db.server";

async function migrateOldData() {
  console.log("🔄 Migrating old data from Production DB to KB DB...\n");
  console.log("⚠️  This is a ONE-TIME operation\n");

  // Connect to production DB via Supabase
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Missing Supabase credentials");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Step 1: Migrate DecisionLog
    console.log("1️⃣ Migrating DecisionLog records...");
    
    let page = 0;
    const pageSize = 100;
    let totalMigrated = 0;
    let hasMore = true;

    while (hasMore) {
      const { data: decisions, error } = await supabase
        .from("DecisionLog")
        .select("*")
        .order("id", { ascending: true })
        .range(page * pageSize, (page + 1) * pageSize - 1);

      if (error) {
        console.error("   ❌ Error fetching decisions:", error.message);
        break;
      }

      if (!decisions || decisions.length === 0) {
        hasMore = false;
        break;
      }

      // Insert into KB DB
      for (const decision of decisions) {
        try {
          await kbPrisma.decisionLog.create({
            data: {
              scope: decision.scope,
              actor: decision.actor,
              action: decision.action,
              rationale: decision.rationale,
              evidenceUrl: decision.evidence_url,
              taskId: decision.task_id,
              status: decision.status,
              progressPct: decision.progress_pct,
              blockerDetails: decision.blocker_details,
              blockedBy: decision.blocked_by,
              durationEstimate: decision.duration_estimate,
              durationActual: decision.duration_actual,
              nextAction: decision.next_action,
              payload: decision.payload,
              createdAt: decision.created_at ? new Date(decision.created_at) : undefined,
            },
          });
          totalMigrated++;
        } catch (insertError: any) {
          // Skip duplicates or errors
          if (!insertError.message.includes("Unique constraint")) {
            console.error(`   ⚠️  Error inserting decision ${decision.id}:`, insertError.message);
          }
        }
      }

      console.log(`   ✅ Migrated page ${page + 1} (${totalMigrated} total)`);
      page++;

      if (decisions.length < pageSize) {
        hasMore = false;
      }
    }

    console.log(`   ✅ DecisionLog migration complete: ${totalMigrated} records\n`);

    // Step 2: Migrate TaskAssignment
    console.log("2️⃣ Migrating TaskAssignment records...");
    
    page = 0;
    let totalTasksMigrated = 0;
    hasMore = true;

    while (hasMore) {
      const { data: tasks, error } = await supabase
        .from("TaskAssignment")
        .select("*")
        .order("id", { ascending: true })
        .range(page * pageSize, (page + 1) * pageSize - 1);

      if (error) {
        console.error("   ❌ Error fetching tasks:", error.message);
        break;
      }

      if (!tasks || tasks.length === 0) {
        hasMore = false;
        break;
      }

      // Insert into KB DB
      for (const task of tasks) {
        try {
          await kbPrisma.taskAssignment.create({
            data: {
              assignedBy: task.assignedBy,
              assignedTo: task.assignedTo,
              taskId: task.taskId,
              title: task.title,
              description: task.description,
              acceptanceCriteria: task.acceptanceCriteria,
              allowedPaths: task.allowedPaths,
              priority: task.priority,
              phase: task.phase,
              estimatedHours: task.estimatedHours,
              dependencies: task.dependencies,
              blocks: task.blocks,
              status: task.status,
              assignedAt: task.assignedAt ? new Date(task.assignedAt) : undefined,
              startedAt: task.startedAt ? new Date(task.startedAt) : undefined,
              completedAt: task.completedAt ? new Date(task.completedAt) : undefined,
              cancelledAt: task.cancelledAt ? new Date(task.cancelledAt) : undefined,
              completionNotes: task.completionNotes,
              cancellationReason: task.cancellationReason,
              evidenceUrl: task.evidenceUrl,
              issueUrl: task.issueUrl,
              prUrl: task.prUrl,
              payload: task.payload,
              createdAt: task.createdAt ? new Date(task.createdAt) : undefined,
              updatedAt: task.updatedAt ? new Date(task.updatedAt) : undefined,
            },
          });
          totalTasksMigrated++;
        } catch (insertError: any) {
          // Skip duplicates or errors
          if (!insertError.message.includes("Unique constraint")) {
            console.error(`   ⚠️  Error inserting task ${task.taskId}:`, insertError.message);
          }
        }
      }

      console.log(`   ✅ Migrated page ${page + 1} (${totalTasksMigrated} total)`);
      page++;

      if (tasks.length < pageSize) {
        hasMore = false;
      }
    }

    console.log(`   ✅ TaskAssignment migration complete: ${totalTasksMigrated} records\n`);

    // Step 3: Verify migration
    console.log("3️⃣ Verifying migration...");
    
    const kbDecisionCount = await kbPrisma.decisionLog.count();
    const kbTaskCount = await kbPrisma.taskAssignment.count();

    console.log(`   KB DB DecisionLog: ${kbDecisionCount} records`);
    console.log(`   KB DB TaskAssignment: ${kbTaskCount} records`);

    console.log("\n" + "=".repeat(60));
    console.log("✅ Migration Complete!");
    console.log(`   Migrated ${totalMigrated} decisions`);
    console.log(`   Migrated ${totalTasksMigrated} tasks`);
    console.log(`   Total in KB DB: ${kbDecisionCount} decisions, ${kbTaskCount} tasks`);
    console.log("=".repeat(60) + "\n");

    console.log("📋 Next steps:");
    console.log("   1. Verify data: npx tsx scripts/manager/verify-db-separation.ts");
    console.log("   2. Test queries: npx tsx scripts/manager/query-completed-today.ts");
    console.log("   3. Production DB tables can now be dropped (optional)\n");

  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    await kbPrisma.$disconnect();
  }
}

migrateOldData().catch(console.error);

