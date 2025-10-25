import { Prisma } from "@prisma/kb-client";
export interface TaskCompletionPayload {
    commits?: string[];
    files?: Array<{
        path: string;
        lines: number;
        type?: "created" | "modified" | "deleted";
    }>;
    tests?: {
        unit?: {
            passing: number;
            total: number;
        };
        integration?: {
            passing: number;
            total: number;
        };
        e2e?: {
            passing: number;
            total: number;
        };
        overall?: string;
    };
    mcpEvidence?: {
        calls: number;
        tools: string[];
        conversationIds?: string[];
        evidenceFile?: string;
    };
    linesChanged?: {
        added: number;
        deleted: number;
    };
    technicalNotes?: string;
}
export interface TaskBlockedPayload {
    blockerType?: "dependency" | "credentials" | "decision" | "technical" | "resource";
    attemptedSolutions?: string[];
    impact?: string;
    urgency?: "low" | "medium" | "high" | "critical";
}
export interface ShutdownPayload {
    dailySummary?: string;
    selfGrade?: {
        progress: number;
        evidence: number;
        alignment: number;
        toolDiscipline: number;
        communication: number;
        average?: number;
    };
    retrospective?: {
        didWell: string[];
        toChange: string[];
        toStop?: string;
    };
    tasksCompleted?: string[];
    hoursWorked?: number;
}
export interface LogDecisionInput {
    scope: "build" | "ops";
    actor: string;
    action: string;
    rationale?: string;
    evidenceUrl?: string;
    shopDomain?: string;
    externalRef?: string;
    payload?: Prisma.InputJsonValue | TaskCompletionPayload | TaskBlockedPayload | ShutdownPayload;
    taskId?: string;
    status?: "pending" | "in_progress" | "completed" | "blocked" | "cancelled";
    progressPct?: number;
    blockerDetails?: string;
    blockedBy?: string;
    durationEstimate?: number;
    durationActual?: number;
    nextAction?: string;
    createdAt?: Date;
}
export declare function logDecision(input: LogDecisionInput): Promise<{
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
    payload: Prisma.JsonValue | null;
    createdAt: Date | null;
    updatedAt: Date | null;
}>;
export declare function calculateSelfGradeAverage(grades: {
    progress: number;
    evidence: number;
    alignment: number;
    toolDiscipline: number;
    communication: number;
}): number;
//# sourceMappingURL=decisions.server.d.ts.map