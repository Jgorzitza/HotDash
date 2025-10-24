/**
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
    throw new Error(`No database URL configured for agent type: ${agentType}`);
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
    throw new Error(`No direct URL configured for agent type: ${agentType}`);
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
