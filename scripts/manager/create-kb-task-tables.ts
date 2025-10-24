/**
 * Create task/feedback tables in KB database
 * SAFE: Only creates tables if they don't exist, preserves existing data
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

async function createTables() {
  console.log("🔧 Creating Task/Feedback Tables in KB Database...\n");

  // Load KB DB credentials
  const vaultPath = path.join(process.cwd(), "vault/dev-kb/supabase.env");
  const envContent = fs.readFileSync(vaultPath, "utf-8");
  const lines = envContent.split("\n");
  
  let kbUrl = "";
  for (const line of lines) {
    if (line.startsWith("SUPABASE_DEV_KB_DATABASE_URL=")) {
      kbUrl = line.substring("SUPABASE_DEV_KB_DATABASE_URL=".length).trim();
    }
  }

  const prisma = new PrismaClient({
    datasources: { db: { url: kbUrl } },
  });

  try {
    // Check if tables already exist
    const tables = await prisma.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
      AND tablename IN ('DecisionLog', 'TaskAssignment')
    `;

    if (tables.length > 0) {
      console.log("⚠️  Tables already exist:");
      tables.forEach((t) => console.log(`   - ${t.tablename}`));
      console.log("\n❌ Aborting to prevent data loss");
      console.log("   If you want to recreate, manually drop tables first\n");
      await prisma.$disconnect();
      process.exit(1);
    }

    console.log("✅ No existing task tables - safe to create\n");

    // Create DecisionLog table
    console.log("📋 Creating DecisionLog table...");
    await prisma.$executeRaw`
      CREATE TABLE "DecisionLog" (
        id SERIAL PRIMARY KEY,
        scope VARCHAR NOT NULL,
        actor VARCHAR NOT NULL,
        action VARCHAR NOT NULL,
        rationale TEXT,
        evidence_url TEXT,
        task_id VARCHAR,
        status VARCHAR,
        progress_pct INTEGER,
        blocker_details TEXT,
        blocked_by VARCHAR,
        duration_estimate INTEGER,
        duration_actual INTEGER,
        next_action TEXT,
        payload JSONB,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    await prisma.$executeRaw`
      CREATE INDEX idx_decision_log_actor ON "DecisionLog"(actor)
    `;
    await prisma.$executeRaw`
      CREATE INDEX idx_decision_log_created_at ON "DecisionLog"(created_at)
    `;
    await prisma.$executeRaw`
      CREATE INDEX idx_decision_log_scope ON "DecisionLog"(scope)
    `;
    await prisma.$executeRaw`
      CREATE INDEX idx_decision_log_status ON "DecisionLog"(status)
    `;
    await prisma.$executeRaw`
      CREATE INDEX idx_decision_log_task_id ON "DecisionLog"(task_id)
    `;

    console.log("✅ DecisionLog table created\n");

    // Create TaskAssignment table
    console.log("📋 Creating TaskAssignment table...");
    await prisma.$executeRaw`
      CREATE TABLE "TaskAssignment" (
        id SERIAL PRIMARY KEY,
        "assignedBy" VARCHAR NOT NULL,
        "assignedTo" VARCHAR NOT NULL,
        "taskId" VARCHAR UNIQUE NOT NULL,
        title VARCHAR NOT NULL,
        description TEXT NOT NULL,
        "acceptanceCriteria" JSONB NOT NULL,
        "allowedPaths" JSONB NOT NULL,
        priority VARCHAR NOT NULL,
        phase VARCHAR,
        "estimatedHours" DECIMAL(5,2),
        dependencies JSONB,
        blocks JSONB,
        status VARCHAR DEFAULT 'assigned',
        "assignedAt" TIMESTAMPTZ DEFAULT NOW(),
        "startedAt" TIMESTAMPTZ,
        "completedAt" TIMESTAMPTZ,
        "cancelledAt" TIMESTAMPTZ,
        "completionNotes" TEXT,
        "cancellationReason" TEXT,
        "evidenceUrl" VARCHAR,
        "issueUrl" VARCHAR,
        "prUrl" VARCHAR,
        payload JSONB,
        "createdAt" TIMESTAMPTZ DEFAULT NOW(),
        "updatedAt" TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    await prisma.$executeRaw`
      CREATE INDEX idx_task_assignment_to_status_priority 
      ON "TaskAssignment"("assignedTo", status, priority)
    `;
    await prisma.$executeRaw`
      CREATE INDEX idx_task_assignment_status_priority 
      ON "TaskAssignment"(status, priority)
    `;
    await prisma.$executeRaw`
      CREATE INDEX idx_task_assignment_by_at 
      ON "TaskAssignment"("assignedBy", "assignedAt")
    `;
    await prisma.$executeRaw`
      CREATE INDEX idx_task_assignment_phase_status 
      ON "TaskAssignment"(phase, status)
    `;

    console.log("✅ TaskAssignment table created\n");

    console.log("✅ All tables created successfully in KB Database!\n");

    await prisma.$disconnect();
  } catch (error) {
    console.error("❌ Error creating tables:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

createTables();

