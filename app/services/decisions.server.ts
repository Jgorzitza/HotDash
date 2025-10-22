import { Prisma } from "@prisma/client";
import prisma from "../db.server";
import { getSupabaseConfig } from "../config/supabase.server";
import { supabaseMemory } from "../../packages/memory/supabase";
import type { DecisionLog as MemoryDecision } from "../../packages/memory";

export interface LogDecisionInput {
  scope: "build" | "ops";
  actor: string;
  action: string;
  rationale?: string;
  evidenceUrl?: string;
  shopDomain?: string;
  externalRef?: string;
  payload?: Prisma.InputJsonValue;
  
  // Enhanced fields for feedback tracking (added 2025-10-22)
  taskId?: string;              // Task ID from direction file (e.g., 'ENG-029')
  status?: 'pending' | 'in_progress' | 'completed' | 'blocked' | 'cancelled';
  progressPct?: number;         // Progress percentage 0-100
  blockerDetails?: string;      // Description of blocker if status is 'blocked'
  blockedBy?: string;           // Task ID or resource blocking this task
  durationEstimate?: number;    // Estimated duration in hours
  durationActual?: number;      // Actual duration in hours
  nextAction?: string;          // Agent's stated next action
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
