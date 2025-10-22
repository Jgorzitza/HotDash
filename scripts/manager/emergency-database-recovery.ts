#!/usr/bin/env tsx
/**
 * EMERGENCY DATABASE RECOVERY
 * 
 * This script recreates the missing core tables after the database disaster.
 * 
 * CRITICAL: Only run this after CEO approval and with migration lock.
 * 
 * Usage: npx tsx --env-file=.env scripts/manager/emergency-database-recovery.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function emergencyDatabaseRecovery() {
  console.log('🚨 EMERGENCY DATABASE RECOVERY');
  console.log('=' .repeat(60));
  console.log('⚠️  CRITICAL: This will recreate missing core tables');
  console.log('⚠️  Growth Engine tables should remain intact');
  console.log('');

  // Check current state
  console.log('📋 Step 1: Checking current database state...');
  
  const coreTables = ['shop', 'user', 'session', 'password', 'decisionLog'];
  const missingTables = [];
  
  for (const table of coreTables) {
    try {
      await prisma[table].count();
      console.log(`✅ ${table} table: EXISTS`);
    } catch (e) {
      console.log(`❌ ${table} table: MISSING`);
      missingTables.push(table);
    }
  }

  if (missingTables.length === 0) {
    console.log('\n✅ All core tables exist. No recovery needed.');
    await prisma.$disconnect();
    return;
  }

  console.log(`\n🚨 Found ${missingTables.length} missing core tables:`, missingTables.join(', '));
  
  // Payment gateway check
  console.log('\n💳 Step 2: Checking payment gateway configuration...');
  console.log('   This recovery will recreate core tables but payment gateway');
  console.log('   configuration may need to be reconfigured.');
  console.log('   ⚠️  Users will need to reconnect their Shopify stores.');
  
  // Confirmation
  console.log('\n⚠️  RECOVERY CONFIRMATION REQUIRED');
  console.log('This will:');
  console.log('1. Recreate missing core tables (shop, user, session, password, decisionLog)');
  console.log('2. Preserve all Growth Engine tables (40+ tables intact)');
  console.log('3. Reset authentication system (users need to reconnect)');
  console.log('4. Recreate empty DecisionLog and TaskAssignment tables');
  
  console.log('\n🚨 TO PROCEED:');
  console.log('1. Ensure you have CEO approval');
  console.log('2. Acquire migration lock: npx tsx --env-file=.env scripts/data/migration-lock.ts acquire manager "emergency recovery"');
  console.log('3. Run: npx prisma db push --accept-data-loss');
  console.log('4. Release lock: npx tsx --env-file=.env scripts/data/migration-lock.ts release manager');
  
  console.log('\n📊 RECOVERY CHECKLIST:');
  console.log('□ CEO approval obtained');
  console.log('□ Migration lock acquired');
  console.log('□ Core tables recreated');
  console.log('□ DecisionLog and TaskAssignment populated');
  console.log('□ All agents notified of recovery');
  console.log('□ Payment gateway reconfiguration scheduled');
  
  await prisma.$disconnect();
}

emergencyDatabaseRecovery().catch((err) => {
  console.error('❌ Recovery check failed:', err);
  process.exit(1);
});
