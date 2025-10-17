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
