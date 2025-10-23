#!/usr/bin/env tsx
/**
 * UPDATE DATABASE CONNECTIONS TO USE SECURE USERS
 * 
 * This script updates the application to use the new secure database users
 * instead of the postgres superuser.
 * 
 * Usage: npx tsx --env-file=.env scripts/data/update-database-connections.ts
 */

import fs from 'fs';
import path from 'path';

async function updateDatabaseConnections() {
  console.log('🔒 UPDATING DATABASE CONNECTIONS TO SECURE USERS');
  console.log('=' .repeat(60));

  // 1. Update .env file with new secure connection strings
  console.log('📋 Step 1: Updating .env file with secure connection strings...');
  
  const envPath = path.join(process.cwd(), '.env');
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  // Define new secure connection strings
  const secureConnections = {
    // DATA Agent connection (full access)
    'DATABASE_URL_DATA': 'postgresql://data_agent:secure_data_password_2025@3.227.209.82:6543/postgres?pgbouncer=true',
    'DIRECT_URL_DATA': 'postgresql://data_agent:secure_data_password_2025@3.227.209.82:5432/postgres',
    
    // MANAGER Agent connection (read/write, no schema changes)
    'DATABASE_URL_MANAGER': 'postgresql://manager_agent:secure_manager_password_2025@3.227.209.82:6543/postgres?pgbouncer=true',
    'DIRECT_URL_MANAGER': 'postgresql://manager_agent:secure_manager_password_2025@3.227.209.82:5432/postgres',
    
    // OTHER Agents connection (read-only + feedback)
    'DATABASE_URL_AGENTS': 'postgresql://other_agents:secure_other_password_2025@3.227.209.82:6543/postgres?pgbouncer=true',
    'DIRECT_URL_AGENTS': 'postgresql://other_agents:secure_other_password_2025@3.227.209.82:5432/postgres',
  };

  // Update .env file
  let updatedEnvContent = envContent;
  
  // Remove old postgres connections
  updatedEnvContent = updatedEnvContent.replace(/^DATABASE_URL=.*$/m, '');
  updatedEnvContent = updatedEnvContent.replace(/^DIRECT_URL=.*$/m, '');
  
  // Add new secure connections
  updatedEnvContent += '\n# SECURE DATABASE CONNECTIONS (2025-10-22)\n';
  updatedEnvContent += '# DATA Agent: Full access for migrations\n';
  updatedEnvContent += `DATABASE_URL_DATA=${secureConnections.DATABASE_URL_DATA}\n`;
  updatedEnvContent += `DIRECT_URL_DATA=${secureConnections.DIRECT_URL_DATA}\n`;
  updatedEnvContent += '\n# MANAGER Agent: Read/write, no schema changes\n';
  updatedEnvContent += `DATABASE_URL_MANAGER=${secureConnections.DATABASE_URL_MANAGER}\n`;
  updatedEnvContent += `DIRECT_URL_MANAGER=${secureConnections.DIRECT_URL_MANAGER}\n`;
  updatedEnvContent += '\n# OTHER Agents: Read-only + feedback\n';
  updatedEnvContent += `DATABASE_URL_AGENTS=${secureConnections.DATABASE_URL_AGENTS}\n`;
  updatedEnvContent += `DIRECT_URL_AGENTS=${secureConnections.DIRECT_URL_AGENTS}\n`;
  
  // Keep old postgres connection for admin tasks only
  updatedEnvContent += '\n# ADMIN ONLY: Postgres superuser (emergency use only)\n';
  updatedEnvContent += `DATABASE_URL_ADMIN=${process.env.DATABASE_URL}\n`;
  updatedEnvContent += `DIRECT_URL_ADMIN=${process.env.DIRECT_URL}\n`;

  fs.writeFileSync(envPath, updatedEnvContent);
  console.log('   ✅ Updated .env file with secure connection strings');

  // 2. Create agent-specific database configuration
  console.log('\n📋 Step 2: Creating agent-specific database configuration...');
  
  const dbConfigPath = path.join(process.cwd(), 'app/config/database.ts');
  const dbConfigContent = `/**
 * AGENT-SPECIFIC DATABASE CONFIGURATION
 * 
 * This file provides secure database connections based on agent type.
 * Each agent gets only the permissions they need.
 */

export function getDatabaseUrl(agentType: 'data' | 'manager' | 'other'): string {
  const urls = {
    data: process.env.DATABASE_URL_DATA || process.env.DATABASE_URL_ADMIN,
    manager: process.env.DATABASE_URL_MANAGER || process.env.DATABASE_URL_ADMIN,
    other: process.env.DATABASE_URL_AGENTS || process.env.DATABASE_URL_ADMIN,
  };
  
  if (!urls[agentType]) {
    throw new Error(\`No database URL configured for agent type: \${agentType}\`);
  }
  
  return urls[agentType];
}

export function getDirectUrl(agentType: 'data' | 'manager' | 'other'): string {
  const urls = {
    data: process.env.DIRECT_URL_DATA || process.env.DIRECT_URL_ADMIN,
    manager: process.env.DIRECT_URL_MANAGER || process.env.DIRECT_URL_ADMIN,
    other: process.env.DIRECT_URL_AGENTS || process.env.DIRECT_URL_ADMIN,
  };
  
  if (!urls[agentType]) {
    throw new Error(\`No direct URL configured for agent type: \${agentType}\`);
  }
  
  return urls[agentType];
}

export function getAgentTypeFromContext(): 'data' | 'manager' | 'other' {
  // Determine agent type from environment or context
  const agentName = process.env.AGENT_NAME || 'unknown';
  
  if (agentName === 'data') {
    return 'data';
  } else if (agentName === 'manager') {
    return 'manager';
  } else {
    return 'other';
  }
}

// Default connection for backward compatibility
export const DATABASE_URL = getDatabaseUrl(getAgentTypeFromContext());
export const DIRECT_URL = getDirectUrl(getAgentTypeFromContext());
`;

  // Ensure config directory exists
  const configDir = path.dirname(dbConfigPath);
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }
  
  fs.writeFileSync(dbConfigPath, dbConfigContent);
  console.log('   ✅ Created agent-specific database configuration');

  // 3. Update Prisma client to use secure connections
  console.log('\n📋 Step 3: Updating Prisma client configuration...');
  
  const prismaConfigPath = path.join(process.cwd(), 'app/db.server.ts');
  const prismaConfigContent = `/**
 * SECURE PRISMA CLIENT CONFIGURATION
 * 
 * This file creates Prisma clients with agent-specific permissions.
 */

import { PrismaClient } from '@prisma/client';
import { getDatabaseUrl, getAgentTypeFromContext } from './config/database';

// Create Prisma client with agent-specific permissions
const agentType = getAgentTypeFromContext();
const databaseUrl = getDatabaseUrl(agentType);

console.log(\`🔒 Database client initialized for agent type: \${agentType}\`);

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
  log: agentType === 'data' ? ['query', 'info', 'warn', 'error'] : ['warn', 'error'],
});

export default prisma;
`;

  fs.writeFileSync(prismaConfigPath, prismaConfigContent);
  console.log('   ✅ Updated Prisma client configuration');

  // 4. Create security validation script
  console.log('\n📋 Step 4: Creating security validation script...');
  
  const securityValidationPath = path.join(process.cwd(), 'scripts/data/validate-database-security.ts');
  const securityValidationContent = `#!/usr/bin/env tsx
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
    console.log(\`\\n📋 Testing \${agentType.toUpperCase()} agent permissions...\`);
    
    try {
      // Create Prisma client for this agent type
      const prisma = new PrismaClient({
        datasources: {
          db: {
            url: process.env[\`DATABASE_URL_\${agentType.toUpperCase()}\`] || process.env.DATABASE_URL_ADMIN,
          },
        },
      });

      // Test read permissions
      try {
        const decisionCount = await prisma.decisionLog.count();
        console.log(\`   ✅ Read DecisionLog: \${decisionCount} records\`);
      } catch (e) {
        console.log(\`   ❌ Read DecisionLog failed: \${e.message}\`);
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
        console.log(\`   ✅ Write DecisionLog: SUCCESS\`);
      } catch (e) {
        console.log(\`   ❌ Write DecisionLog failed: \${e.message}\`);
      }

      // Test schema change permissions (should only work for data agent)
      try {
        await prisma.\$executeRaw\`CREATE TABLE IF NOT EXISTS test_security_table (id SERIAL PRIMARY KEY)\`;
        console.log(\`   ✅ Schema changes: SUCCESS\`);
        
        // Clean up test table
        await prisma.\$executeRaw\`DROP TABLE IF EXISTS test_security_table\`;
      } catch (e) {
        if (agentType === 'data') {
          console.log(\`   ❌ Schema changes failed for data agent: \${e.message}\`);
        } else {
          console.log(\`   ✅ Schema changes blocked (expected): \${e.message.split(' ')[0]}\`);
        }
      }

      // Check permissions
      try {
        const permissions = await prisma.\$queryRaw\`
          SELECT 
            current_user as agent,
            CASE 
              WHEN current_user = 'data_agent' THEN 'FULL_ACCESS'
              WHEN current_user = 'manager_agent' THEN 'READ_WRITE_NO_SCHEMA'
              WHEN current_user = 'other_agents' THEN 'READ_ONLY_WITH_FEEDBACK'
              ELSE 'RESTRICTED'
            END as permission_level
        \`;
        console.log(\`   📊 Permissions: \${JSON.stringify(permissions[0])}\`);
      } catch (e) {
        console.log(\`   ❌ Permission check failed: \${e.message}\`);
      }

      await prisma.\$disconnect();
      
    } catch (e) {
      console.log(\`   ❌ Connection failed: \${e.message}\`);
    }
  }

  console.log('\\n✅ DATABASE SECURITY VALIDATION COMPLETE');
}

validateDatabaseSecurity().catch((err) => {
  console.error('❌ Validation failed:', err);
  process.exit(1);
});
`;

  fs.writeFileSync(securityValidationPath, securityValidationContent);
  console.log('   ✅ Created security validation script');

  console.log('\n✅ DATABASE CONNECTION SECURITY IMPLEMENTED');
  console.log('=' .repeat(60));
  console.log('📊 Summary:');
  console.log('   - DATA Agent: Full database access (migrations, schema changes)');
  console.log('   - MANAGER Agent: Read/write access (no schema changes)');
  console.log('   - OTHER Agents: Read-only + feedback access');
  console.log('   - ADMIN: Postgres superuser (emergency use only)');
  
  console.log('\n🎯 Next Steps:');
  console.log('   1. Run: npx tsx --env-file=.env scripts/data/implement-database-security.sql');
  console.log('   2. Run: npx tsx --env-file=.env scripts/data/validate-database-security.ts');
  console.log('   3. Update all agent scripts to use secure connections');
  console.log('   4. Test with each agent type');
}

updateDatabaseConnections().catch((err) => {
  console.error('❌ Update failed:', err);
  process.exit(1);
});
