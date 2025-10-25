/**
 * AGENT-SPECIFIC DATABASE CONFIGURATION
 *
 * This file provides secure database connections based on agent type.
 * Each agent gets only the permissions they need.
 */
export declare function getDatabaseUrl(agentType: 'data' | 'manager' | 'other'): string;
export declare function getDirectUrl(agentType: 'data' | 'manager' | 'other'): string;
export declare function getAgentTypeFromContext(): 'data' | 'manager' | 'other';
export declare const DATABASE_URL: string;
export declare const DIRECT_URL: string;
//# sourceMappingURL=database.d.ts.map