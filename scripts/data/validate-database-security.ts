#!/usr/bin/env tsx
/**
 * VALIDATE DATABASE SECURITY
 * 
 * This script validates that database security is properly implemented
 * and agents have the correct permissions.
 * 
 * Usage: npx tsx --env-file=.env scripts/data/validate-database-security.ts
 */

import { PrismaClient } from '@prisma/client';

async function validateDatabaseSecurity() {
  console.log('🔒 VALIDATING DATABASE SECURITY');
  console.log('=' .repeat(60));

  const agentTypes = ['data', 'manager', 'other'];
  
  for (const agentType of agentTypes) {
    console.log(`\n📋 Testing ${agentType.toUpperCase()} agent permissions...`);
    
    try {
      // Create Prisma client for this agent type
      const prisma = new PrismaClient({
        datasources: {
          db: {
            url: process.env[`DATABASE_URL_${agentType.toUpperCase()}`] || process.env.DATABASE_URL_ADMIN,
          },
        },
      });

      // Test read permissions
      try {
        const decisionCount = await prisma.decisionLog.count();
        console.log(`   ✅ Read DecisionLog: ${decisionCount} records`);
      } catch (e) {
        console.log(`   ❌ Read DecisionLog failed: ${e.message}`);
      }

      // Test write permissions
      try {
        await prisma.decisionLog.create({
          data: {
            scope: 'ops',
            actor: agentType,
            action: 'security_validation',
            rationale: 'Testing write permissions',
            evidenceUrl: 'scripts/data/validate-database-security.ts',
          },
        });
        console.log(`   ✅ Write DecisionLog: SUCCESS`);
      } catch (e) {
        console.log(`   ❌ Write DecisionLog failed: ${e.message}`);
      }

      // Test schema change permissions (should only work for data agent)
      try {
        await prisma.$executeRaw`CREATE TABLE IF NOT EXISTS test_security_table (id SERIAL PRIMARY KEY)`;
        console.log(`   ✅ Schema changes: SUCCESS`);
        
        // Clean up test table
        await prisma.$executeRaw`DROP TABLE IF EXISTS test_security_table`;
      } catch (e) {
        if (agentType === 'data') {
          console.log(`   ❌ Schema changes failed for data agent: ${e.message}`);
        } else {
          console.log(`   ✅ Schema changes blocked (expected): ${e.message.split(' ')[0]}`);
        }
      }

      // Check permissions
      try {
        const permissions = await prisma.$queryRaw`
          SELECT 
            current_user as agent,
            CASE 
              WHEN current_user = 'data_agent' THEN 'FULL_ACCESS'
              WHEN current_user = 'manager_agent' THEN 'READ_WRITE_NO_SCHEMA'
              WHEN current_user = 'other_agents' THEN 'READ_ONLY_WITH_FEEDBACK'
              ELSE 'RESTRICTED'
            END as permission_level
        `;
        console.log(`   📊 Permissions: ${JSON.stringify(permissions[0])}`);
      } catch (e) {
        console.log(`   ❌ Permission check failed: ${e.message}`);
      }

      await prisma.$disconnect();
      
    } catch (e) {
      console.log(`   ❌ Connection failed: ${e.message}`);
    }
  }

  console.log('\n✅ DATABASE SECURITY VALIDATION COMPLETE');
}

validateDatabaseSecurity().catch((err) => {
  console.error('❌ Validation failed:', err);
  process.exit(1);
});
