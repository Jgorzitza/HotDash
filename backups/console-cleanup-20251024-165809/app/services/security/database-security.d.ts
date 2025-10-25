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
export declare function createSecurePrismaClient(agentName: string): PrismaClient;
export declare function secureDatabaseOperation<T>(operation: () => Promise<T>, agentName: string, operationName: string, tableName: string): Promise<T>;
export declare class SecureTaskService {
    private prisma;
    private agentName;
    constructor(agentName: string);
    getMyTasks(): Promise<{
        status: string;
        description: string;
        id: number;
        evidenceUrl: string | null;
        taskId: string;
        payload: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
        assignedBy: string;
        assignedTo: string;
        title: string;
        acceptanceCriteria: import("@prisma/client/runtime/library").JsonValue;
        allowedPaths: import("@prisma/client/runtime/library").JsonValue;
        priority: string;
        phase: string | null;
        estimatedHours: import("@prisma/client/runtime/library").Decimal | null;
        dependencies: import("@prisma/client/runtime/library").JsonValue | null;
        blocks: import("@prisma/client/runtime/library").JsonValue | null;
        assignedAt: Date;
        startedAt: Date | null;
        completedAt: Date | null;
        cancelledAt: Date | null;
        completionNotes: string | null;
        cancellationReason: string | null;
        issueUrl: string | null;
        prUrl: string | null;
    }[]>;
    updateTask(taskId: string, data: any): Promise<{
        status: string;
        description: string;
        id: number;
        evidenceUrl: string | null;
        taskId: string;
        payload: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
        assignedBy: string;
        assignedTo: string;
        title: string;
        acceptanceCriteria: import("@prisma/client/runtime/library").JsonValue;
        allowedPaths: import("@prisma/client/runtime/library").JsonValue;
        priority: string;
        phase: string | null;
        estimatedHours: import("@prisma/client/runtime/library").Decimal | null;
        dependencies: import("@prisma/client/runtime/library").JsonValue | null;
        blocks: import("@prisma/client/runtime/library").JsonValue | null;
        assignedAt: Date;
        startedAt: Date | null;
        completedAt: Date | null;
        cancelledAt: Date | null;
        completionNotes: string | null;
        cancellationReason: string | null;
        issueUrl: string | null;
        prUrl: string | null;
    }>;
    completeTask(taskId: string, completionNotes?: string): Promise<{
        status: string;
        description: string;
        id: number;
        evidenceUrl: string | null;
        taskId: string;
        payload: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
        assignedBy: string;
        assignedTo: string;
        title: string;
        acceptanceCriteria: import("@prisma/client/runtime/library").JsonValue;
        allowedPaths: import("@prisma/client/runtime/library").JsonValue;
        priority: string;
        phase: string | null;
        estimatedHours: import("@prisma/client/runtime/library").Decimal | null;
        dependencies: import("@prisma/client/runtime/library").JsonValue | null;
        blocks: import("@prisma/client/runtime/library").JsonValue | null;
        assignedAt: Date;
        startedAt: Date | null;
        completedAt: Date | null;
        cancelledAt: Date | null;
        completionNotes: string | null;
        cancellationReason: string | null;
        issueUrl: string | null;
        prUrl: string | null;
    }>;
}
export declare class SecureDecisionService {
    private prisma;
    private agentName;
    constructor(agentName: string);
    logDecision(decision: any): Promise<{
        status: string | null;
        actor: string;
        scope: string;
        action: string;
        rationale: string | null;
        id: number;
        evidenceUrl: string | null;
        taskId: string | null;
        progressPct: number | null;
        blockerDetails: string | null;
        blockedBy: string | null;
        durationEstimate: number | null;
        durationActual: number | null;
        nextAction: string | null;
        payload: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date | null;
        updatedAt: Date | null;
    }>;
    getMyDecisions(): Promise<{
        status: string | null;
        actor: string;
        scope: string;
        action: string;
        rationale: string | null;
        id: number;
        evidenceUrl: string | null;
        taskId: string | null;
        progressPct: number | null;
        blockerDetails: string | null;
        blockedBy: string | null;
        durationEstimate: number | null;
        durationActual: number | null;
        nextAction: string | null;
        payload: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date | null;
        updatedAt: Date | null;
    }[]>;
}
export declare class SecurityMonitor {
    private prisma;
    constructor();
    detectSuspiciousActivity(): Promise<any[]>;
    getSecurityAlerts(): Promise<any[]>;
    createSecurityBackup(): Promise<string>;
}
export declare const createSecureTaskService: (agentName: string) => SecureTaskService;
export declare const createSecureDecisionService: (agentName: string) => SecureDecisionService;
export declare const createSecurityMonitor: () => SecurityMonitor;
//# sourceMappingURL=database-security.d.ts.map