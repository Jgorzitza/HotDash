#!/usr/bin/env tsx
/**
 * Migration Lock System - Prevents concurrent database schema changes
 * 
 * CRITICAL SAFETY RULES:
 * 1. Only DATA agent can run migrations
 * 2. Only ONE migration at a time (lock file)
 * 3. Require manager approval for production
 * 4. Automated backup before migration
 * 
 * Usage:
 *   npx tsx --env-file=.env scripts/data/migration-lock.ts check
 *   npx tsx --env-file=.env scripts/data/migration-lock.ts acquire
 *   npx tsx --env-file=.env scripts/data/migration-lock.ts release
 */

import fs from 'fs';
import path from 'path';
import { logDecision } from '../../app/services/decisions.server';

const LOCK_FILE = path.join(process.cwd(), '.migration.lock');
const LOCK_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

interface LockData {
  agent: string;
  timestamp: string;
  operation: string;
  pid: number;
}

async function checkLock(): Promise<LockData | null> {
  if (!fs.existsSync(LOCK_FILE)) {
    return null;
  }

  const lockData: LockData = JSON.parse(fs.readFileSync(LOCK_FILE, 'utf-8'));
  const lockAge = Date.now() - new Date(lockData.timestamp).getTime();

  // Check if lock is stale (older than timeout)
  if (lockAge > LOCK_TIMEOUT_MS) {
    console.log(`⚠️  Stale lock detected (${Math.round(lockAge / 60000)} minutes old)`);
    console.log(`   Agent: ${lockData.agent}, Operation: ${lockData.operation}`);
    console.log(`   Removing stale lock...`);
    fs.unlinkSync(LOCK_FILE);
    return null;
  }

  return lockData;
}

async function acquireLock(agent: string, operation: string): Promise<boolean> {
  // Check if lock already exists
  const existingLock = await checkLock();
  if (existingLock) {
    console.log(`❌ Migration lock already held by ${existingLock.agent}`);
    console.log(`   Operation: ${existingLock.operation}`);
    console.log(`   Started: ${existingLock.timestamp}`);
    console.log(`   PID: ${existingLock.pid}`);
    console.log(`\n   Wait for current migration to complete or run:`);
    console.log(`   npx tsx --env-file=.env scripts/data/migration-lock.ts release`);
    return false;
  }

  // Enforce: Only DATA agent can acquire migration lock
  if (agent !== 'data') {
    console.log(`❌ SECURITY VIOLATION: Only DATA agent can run migrations`);
    console.log(`   Attempted by: ${agent}`);
    console.log(`   Operation: ${operation}`);
    
    await logDecision({
      scope: 'ops',
      actor: agent,
      action: 'migration_lock_violation',
      rationale: `Agent ${agent} attempted to run migration: ${operation}. BLOCKED - only DATA agent can run migrations.`,
      evidenceUrl: 'scripts/data/migration-lock.ts',
      payload: {
        agent,
        operation,
        violation: 'unauthorized_migration_attempt'
      }
    });
    
    return false;
  }

  // Create lock file
  const lockData: LockData = {
    agent,
    timestamp: new Date().toISOString(),
    operation,
    pid: process.pid
  };

  fs.writeFileSync(LOCK_FILE, JSON.stringify(lockData, null, 2));
  console.log(`✅ Migration lock acquired by ${agent}`);
  console.log(`   Operation: ${operation}`);
  console.log(`   PID: ${process.pid}`);

  // Log lock acquisition
  await logDecision({
    scope: 'ops',
    actor: agent,
    action: 'migration_lock_acquired',
    rationale: `Migration lock acquired for: ${operation}`,
    evidenceUrl: 'scripts/data/migration-lock.ts',
    payload: lockData
  });

  return true;
}

async function releaseLock(agent?: string): Promise<void> {
  const existingLock = await checkLock();
  
  if (!existingLock) {
    console.log(`✅ No migration lock to release`);
    return;
  }

  // If agent specified, verify it matches lock holder
  if (agent && existingLock.agent !== agent) {
    console.log(`❌ Cannot release lock held by ${existingLock.agent}`);
    console.log(`   Attempted by: ${agent}`);
    return;
  }

  fs.unlinkSync(LOCK_FILE);
  console.log(`✅ Migration lock released`);
  console.log(`   Was held by: ${existingLock.agent}`);
  console.log(`   Operation: ${existingLock.operation}`);

  // Log lock release
  await logDecision({
    scope: 'ops',
    actor: existingLock.agent,
    action: 'migration_lock_released',
    rationale: `Migration lock released after: ${existingLock.operation}`,
    evidenceUrl: 'scripts/data/migration-lock.ts',
    payload: existingLock
  });
}

// CLI
const command = process.argv[2];
const agent = process.argv[3] || 'unknown';
const operation = process.argv[4] || 'unknown operation';

(async () => {
  switch (command) {
    case 'check':
      const lock = await checkLock();
      if (lock) {
        console.log(`🔒 Migration lock held by ${lock.agent}`);
        console.log(`   Operation: ${lock.operation}`);
        console.log(`   Started: ${lock.timestamp}`);
        process.exit(1);
      } else {
        console.log(`✅ No migration lock`);
        process.exit(0);
      }
      break;

    case 'acquire':
      const acquired = await acquireLock(agent, operation);
      process.exit(acquired ? 0 : 1);
      break;

    case 'release':
      await releaseLock(agent);
      process.exit(0);
      break;

    default:
      console.log(`Usage: migration-lock.ts <check|acquire|release> [agent] [operation]`);
      console.log(`\nExamples:`);
      console.log(`  npx tsx --env-file=.env scripts/data/migration-lock.ts check`);
      console.log(`  npx tsx --env-file=.env scripts/data/migration-lock.ts acquire data "add user preferences table"`);
      console.log(`  npx tsx --env-file=.env scripts/data/migration-lock.ts release data`);
      process.exit(1);
  }
})();

