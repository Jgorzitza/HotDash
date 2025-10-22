#!/usr/bin/env tsx
/**
 * Apply the enhance_decision_log migration
 * 
 * Usage: npx tsx --env-file=.env scripts/manager/apply-enhance-decision-log.ts
 */

import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import prisma from '../../app/db.server';

async function applyMigration() {
  console.log('🔧 Applying enhance_decision_log migration...\n');
  
  const migrationPath = path.join(
    process.cwd(), 
    'supabase/migrations/20251022000001_enhance_decision_log.sql'
  );
  
  if (!fs.existsSync(migrationPath)) {
    console.error('❌ Migration file not found:', migrationPath);
    process.exit(1);
  }
  
  const sql = fs.readFileSync(migrationPath, 'utf-8');
  
  // Split into individual statements (removing comments)
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));
  
  console.log(`Found ${statements.length} SQL statements to execute\n`);
  
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i] + ';';
    
    try {
      // Skip verification queries (SELECT statements)
      if (statement.trim().toUpperCase().startsWith('SELECT')) {
        console.log(`⏭️  Skipping verification query ${i + 1}`);
        continue;
      }
      
      await prisma.$executeRawUnsafe(statement);
      console.log(`✅ Statement ${i + 1}/${statements.length} executed`);
      successCount++;
    } catch (error: any) {
      // Check if error is "already exists" - that's okay
      if (error.message?.includes('already exists') || 
          error.message?.includes('duplicate key')) {
        console.log(`⚠️  Statement ${i + 1}: Already exists (skipping)`);
        successCount++;
      } else {
        console.error(`❌ Statement ${i + 1} failed:`);
        console.error(`   ${error.message}`);
        errorCount++;
      }
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log(`✅ Migration complete:`);
  console.log(`   Success: ${successCount}`);
  console.log(`   Errors: ${errorCount}`);
  console.log(`   Total: ${statements.length}`);
  
  // Verify the new columns exist
  console.log('\n📊 Verifying new columns...');
  const columns: any[] = await prisma.$queryRaw`
    SELECT column_name, data_type, is_nullable 
    FROM information_schema.columns 
    WHERE table_name = 'DecisionLog' 
    AND column_name IN ('taskId', 'status', 'progressPct', 'blockerDetails', 'blockedBy')
    ORDER BY column_name;
  `;
  
  if (columns.length === 5) {
    console.log('✅ All 5 new columns found:');
    columns.forEach(col => {
      console.log(`   - ${col.column_name} (${col.data_type})`);
    });
  } else {
    console.error(`❌ Expected 5 columns, found ${columns.length}`);
  }
  
  await prisma.$disconnect();
}

applyMigration().catch(err => {
  console.error('\n💥 Migration failed:', err);
  process.exit(1);
});

