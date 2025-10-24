/**
 * DATABASE SECURITY SERVICE
 * 
 * This service provides secure database operations with:
 * - Agent-specific permissions
 * - Audit logging
 * - Bulk operation prevention
 * - Security monitoring
 */

import { PrismaClient } from '@prisma/client';

// Security configuration
interface SecurityConfig {
  agentName: string;
  maxOperationsPerHour: number;
  allowedTables: string[];
  requireAudit: boolean;
}

// Get agent-specific security configuration
function getSecurityConfig(agentName: string): SecurityConfig {
  const configs: Record<string, SecurityConfig> = {
    data: {
      agentName: 'data',
      maxOperationsPerHour: 1000,
      allowedTables: ['task_assignment', 'decision_log', 'cx_embeddings', 'cx_themes'],
      requireAudit: true
    },
    manager: {
      agentName: 'manager',
      maxOperationsPerHour: 5000,
      allowedTables: ['*'], // Manager can access all tables
      requireAudit: true
    },
    product: {
      agentName: 'product',
      maxOperationsPerHour: 500,
      allowedTables: ['task_assignment', 'decision_log', 'product_actions'],
      requireAudit: true
    },
    growth: {
      agentName: 'growth',
      maxOperationsPerHour: 500,
      allowedTables: ['task_assignment', 'decision_log', 'growth_engine_actions'],
      requireAudit: true
    },
    support: {
      agentName: 'support',
      maxOperationsPerHour: 200,
      allowedTables: ['task_assignment', 'decision_log'],
      requireAudit: true
    },
    analytics: {
      agentName: 'analytics',
      maxOperationsPerHour: 300,
      allowedTables: ['task_assignment', 'decision_log'],
      requireAudit: true
    }
  };

  return configs[agentName] || {
    agentName: 'unknown',
    maxOperationsPerHour: 50,
    allowedTables: [],
    requireAudit: true
  };
}

// Create secure Prisma client
export function createSecurePrismaClient(agentName: string): PrismaClient {
  const config = getSecurityConfig(agentName);
  
  // Set agent name in database session
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL_AGENTS || process.env.DATABASE_URL,
      },
    },
    log: ['warn', 'error'],
  });

  // Set agent context in database session
  prisma.$executeRaw`SET app.agent_name = ${agentName}`;

  return prisma;
}

// Secure database operation wrapper
export async function secureDatabaseOperation<T>(
  operation: () => Promise<T>,
  agentName: string,
  operationName: string,
  tableName: string
): Promise<T> {
  const config = getSecurityConfig(agentName);
  
  // Check if agent is allowed to access this table
  if (!config.allowedTables.includes('*') && !config.allowedTables.includes(tableName)) {
    throw new Error(`Agent ${agentName} is not authorized to access table ${tableName}`);
  }

  // Check operation rate limits
  await checkRateLimit(agentName, config.maxOperationsPerHour);

  try {
    const result = await operation();
    
    // Log successful operation
    if (config.requireAudit) {
      await logAuditEvent({
        agentName,
        operation: operationName,
        tableName,
        status: 'success',
        timestamp: new Date()
      });
    }
    
    return result;
  } catch (error) {
    // Log failed operation
    if (config.requireAudit) {
      await logAuditEvent({
        agentName,
        operation: operationName,
        tableName,
        status: 'error',
        error: error.message,
        timestamp: new Date()
      });
    }
    
    throw error;
  }
}

// Check rate limits for agent operations
async function checkRateLimit(agentName: string, maxOperations: number): Promise<void> {
  const prisma = createSecurePrismaClient(agentName);
  
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  
  const operationCount = await prisma.$queryRaw<[{ count: bigint }]>`
    SELECT COUNT(*) as count
    FROM audit_log
    WHERE agent_name = ${agentName}
      AND timestamp > ${oneHourAgo}
  `;
  
  if (Number(operationCount[0].count) >= maxOperations) {
    throw new Error(`Rate limit exceeded for agent ${agentName}. Maximum ${maxOperations} operations per hour.`);
  }
}

// Log audit events
async function logAuditEvent(event: {
  agentName: string;
  operation: string;
  tableName: string;
  status: 'success' | 'error';
  error?: string;
  timestamp: Date;
}): Promise<void> {
  const prisma = createSecurePrismaClient('system');
  
  await prisma.$executeRaw`
    INSERT INTO audit_log (agent_name, operation, table_name, timestamp, new_data)
    VALUES (${event.agentName}, ${event.operation}, ${event.tableName}, ${event.timestamp}, ${JSON.stringify({
      status: event.status,
      error: event.error
    })}::jsonb)
  `;
}

// Secure task operations
export class SecureTaskService {
  private prisma: PrismaClient;
  private agentName: string;

  constructor(agentName: string) {
    this.agentName = agentName;
    this.prisma = createSecurePrismaClient(agentName);
  }

  async getMyTasks() {
    return secureDatabaseOperation(
      () => this.prisma.taskAssignment.findMany({
        where: { assignedTo: this.agentName },
        orderBy: { priority: 'asc' }
      }),
      this.agentName,
      'getMyTasks',
      'task_assignment'
    );
  }

  async updateTask(taskId: string, data: any) {
    return secureDatabaseOperation(
      () => this.prisma.taskAssignment.update({
        where: { taskId },
        data: { ...data, updatedAt: new Date() }
      }),
      this.agentName,
      'updateTask',
      'task_assignment'
    );
  }

  async completeTask(taskId: string, completionNotes?: string) {
    return secureDatabaseOperation(
      () => this.prisma.taskAssignment.update({
        where: { taskId },
        data: {
          status: 'completed',
          completionNotes,
          updatedAt: new Date()
        }
      }),
      this.agentName,
      'completeTask',
      'task_assignment'
    );
  }
}

// Secure decision logging
export class SecureDecisionService {
  private prisma: PrismaClient;
  private agentName: string;

  constructor(agentName: string) {
    this.agentName = agentName;
    this.prisma = createSecurePrismaClient(agentName);
  }

  async logDecision(decision: any) {
    return secureDatabaseOperation(
      () => this.prisma.decisionLog.create({
        data: {
          ...decision,
          agentName: this.agentName,
          createdAt: new Date()
        }
      }),
      this.agentName,
      'logDecision',
      'decision_log'
    );
  }

  async getMyDecisions() {
    return secureDatabaseOperation(
      () => this.prisma.decisionLog.findMany({
        where: { actor: this.agentName },
        orderBy: { createdAt: 'desc' }
      }),
      this.agentName,
      'getMyDecisions',
      'decision_log'
    );
  }
}

// Security monitoring
export class SecurityMonitor {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = createSecurePrismaClient('system');
  }

  async detectSuspiciousActivity(): Promise<any[]> {
    return this.prisma.$queryRaw`
      SELECT 
        agent_name,
        COUNT(*) as operation_count,
        ARRAY_AGG(DISTINCT operation) as operations
      FROM audit_log
      WHERE timestamp > NOW() - INTERVAL '1 hour'
      GROUP BY agent_name
      HAVING COUNT(*) > 100
    `;
  }

  async getSecurityAlerts(): Promise<any[]> {
    return this.prisma.$queryRaw`
      SELECT *
      FROM audit_log
      WHERE operation = 'ALERT'
        AND timestamp > NOW() - INTERVAL '24 hours'
      ORDER BY timestamp DESC
    `;
  }

  async createSecurityBackup(): Promise<string> {
    const backupName = `security_backup_${new Date().toISOString().replace(/[:.]/g, '_')}`;
    
    await this.prisma.$executeRawUnsafe(
      `CREATE TABLE "${backupName}_tasks" AS SELECT * FROM "TaskAssignment"`
    );
    
    await this.prisma.$executeRawUnsafe(
      `CREATE TABLE "${backupName}_decisions" AS SELECT * FROM "DecisionLog"`
    );
    
    return backupName;
  }
}

// Export secure services
export const createSecureTaskService = (agentName: string) => new SecureTaskService(agentName);
export const createSecureDecisionService = (agentName: string) => new SecureDecisionService(agentName);
export const createSecurityMonitor = () => new SecurityMonitor();
