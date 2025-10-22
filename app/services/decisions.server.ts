import { Prisma } from "@prisma/client";
import prisma from "../db.server";
import { getSupabaseConfig } from "../config/supabase.server";
import { supabaseMemory } from "../../packages/memory/supabase";
import type { DecisionLog as MemoryDecision } from "../../packages/memory";

// Standard payload structures for consistency
export interface TaskCompletionPayload {
  commits?: string[]; // Git commit hashes
  files?: Array<{
    // Files changed
    path: string;
    lines: number;
    type?: "created" | "modified" | "deleted";
  }>;
  tests?: {
    // Test results
    unit?: { passing: number; total: number };
    integration?: { passing: number; total: number };
    e2e?: { passing: number; total: number };
    overall?: string; // e.g., "22/22 passing"
  };
  mcpEvidence?: {
    // MCP tool usage
    calls: number;
    tools: string[]; // e.g., ['context7', 'shopify-dev']
    conversationIds?: string[];
    evidenceFile?: string; // Path to JSONL
  };
  linesChanged?: {
    // Code metrics
    added: number;
    deleted: number;
  };
  technicalNotes?: string; // Any other context
}

export interface TaskBlockedPayload {
  blockerType?:
    | "dependency"
    | "credentials"
    | "decision"
    | "technical"
    | "resource";
  attemptedSolutions?: string[]; // What you tried
  impact?: string; // How this affects other work
  urgency?: "low" | "medium" | "high" | "critical";
}

export interface ShutdownPayload {
  dailySummary?: string;
  selfGrade?: {
    progress: number; // 1-5
    evidence: number; // 1-5
    alignment: number; // 1-5
    toolDiscipline: number; // 1-5
    communication: number; // 1-5
    average?: number; // Auto-calculated
  };
  retrospective?: {
    didWell: string[]; // 2-3 things
    toChange: string[]; // 1-2 things
    toStop?: string; // 1 thing to stop entirely
  };
  tasksCompleted?: string[]; // Task IDs completed today
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
  payload?:
    | Prisma.InputJsonValue
    | TaskCompletionPayload
    | TaskBlockedPayload
    | ShutdownPayload;

  // Enhanced fields for feedback tracking (added 2025-10-22)
  taskId?: string; // Task ID from direction file (e.g., 'ENG-029')
  status?: "pending" | "in_progress" | "completed" | "blocked" | "cancelled";
  progressPct?: number; // Progress percentage 0-100
  blockerDetails?: string; // Description of blocker if status is 'blocked'
  blockedBy?: string; // Task ID or resource blocking this task
  durationEstimate?: number; // Estimated duration in hours
  durationActual?: number; // Actual duration in hours
  nextAction?: string; // Agent's stated next action

  // For historical data imports (optional)
  createdAt?: Date; // Override default timestamp for historical uploads
}

export async function logDecision(input: LogDecisionInput) {
  const decision = await prisma.decisionLog.create({
    data: {
      scope: input.scope,
      actor: input.actor,
      action: input.action,
      rationale: input.rationale,
      evidenceUrl: input.evidenceUrl,
      shopDomain: input.shopDomain,
      externalRef: input.externalRef,
      payload: input.payload ?? Prisma.JsonNull,

      // Enhanced feedback tracking fields
      taskId: input.taskId,
      status: input.status,
      progressPct: input.progressPct,
      blockerDetails: input.blockerDetails,
      blockedBy: input.blockedBy,
      durationEstimate: input.durationEstimate,
      durationActual: input.durationActual,
      nextAction: input.nextAction,

      // Override timestamp for historical imports
      ...(input.createdAt && { createdAt: input.createdAt }),
    },
  });

  const supabaseConfig = getSupabaseConfig();

  if (supabaseConfig) {
    try {
      const memory = supabaseMemory(
        supabaseConfig.url,
        supabaseConfig.serviceKey,
      );
      const memoryDecision: MemoryDecision = {
        id: String(decision.id),
        scope: input.scope,
        who: input.actor,
        what: input.action,
        why: input.rationale ?? "",
        sha: undefined,
        evidenceUrl: input.evidenceUrl,
        createdAt: decision.createdAt.toISOString(),
      };
      await memory.putDecision(memoryDecision);
    } catch (error) {
      console.error("Failed to push decision to Supabase memory", error);
    }
  }

  return decision;
}

// Helper function to calculate average self-grade
export function calculateSelfGradeAverage(grades: {
  progress: number;
  evidence: number;
  alignment: number;
  toolDiscipline: number;
  communication: number;
}): number {
  const sum =
    grades.progress +
    grades.evidence +
    grades.alignment +
    grades.toolDiscipline +
    grades.communication;
  return Math.round((sum / 5) * 10) / 10; // Round to 1 decimal
}
