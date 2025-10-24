/**
 * SECURE PRISMA CLIENT CONFIGURATION
 * 
 * This file creates Prisma clients with agent-specific permissions.
 */

import { PrismaClient } from '@prisma/client';
import { getDatabaseUrl, getAgentTypeFromContext } from './config/database';

// Create Prisma client with agent-specific permissions
const agentType = getAgentTypeFromContext();
const databaseUrl = getDatabaseUrl(agentType);

console.log(`🔒 Database client initialized for agent type: ${agentType}`);

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
  log: agentType === 'data' ? ['query', 'info', 'warn', 'error'] : ['warn', 'error'],
});

export default prisma;
