/**
 * Test KB database connection
 * SAFE: Read-only test, no writes
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

async function testKbConnection() {
  console.log("🔍 Testing KB Database Connection...\n");

  // Load KB DB credentials from vault
  const vaultPath = path.join(process.cwd(), "vault/dev-kb/supabase.env");
  
  if (!fs.existsSync(vaultPath)) {
    console.error("❌ KB DB credentials not found at:", vaultPath);
    process.exit(1);
  }

  const envContent = fs.readFileSync(vaultPath, "utf-8");
  const lines = envContent.split("\n");
  
  let kbUrl = "";
  let kbDirectUrl = "";
  
  for (const line of lines) {
    if (line.startsWith("SUPABASE_DEV_KB_DATABASE_URL=")) {
      kbUrl = line.substring("SUPABASE_DEV_KB_DATABASE_URL=".length).trim();
    }
    if (line.startsWith("SUPABASE_DEV_KB_DIRECT_URL=")) {
      kbDirectUrl = line.substring("SUPABASE_DEV_KB_DIRECT_URL=".length).trim();
    }
  }

  if (!kbUrl) {
    console.error("❌ DATABASE_URL not found in vault file");
    process.exit(1);
  }

  console.log("✅ KB DB credentials loaded from vault");
  console.log(`   URL: ${kbUrl.substring(0, 50)}...`);

  // Test connection
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: kbUrl,
      },
    },
  });

  try {
    // Test query - just check connection
    await prisma.$queryRaw`SELECT 1 as test`;
    console.log("✅ KB DB connection successful\n");

    // List existing tables
    const tables = await prisma.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename
    `;

    console.log("📋 Existing tables in KB DB:");
    tables.forEach((t) => console.log(`   - ${t.tablename}`));
    console.log(`   Total: ${tables.length} tables\n`);

    // Check if DecisionLog or TaskAssignment already exist
    const hasDecisionLog = tables.some((t) => t.tablename === "DecisionLog");
    const hasTaskAssignment = tables.some((t) => t.tablename === "TaskAssignment");

    if (hasDecisionLog || hasTaskAssignment) {
      console.log("⚠️  WARNING: Task tables already exist in KB DB:");
      if (hasDecisionLog) console.log("   - DecisionLog");
      if (hasTaskAssignment) console.log("   - TaskAssignment");
      console.log("   Migration may need to merge data\n");
    } else {
      console.log("✅ No task tables in KB DB - safe to create\n");
    }

    await prisma.$disconnect();
    console.log("✅ Test complete - KB DB is ready\n");
  } catch (error) {
    console.error("❌ KB DB connection failed:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

testKbConnection();

